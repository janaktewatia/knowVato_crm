import { Request, Response } from "express";
import { FollowUp } from "../models/FollowUp";
import { Lead } from "../models/Lead";
import { asyncHandler, ok, ApiError, audit } from "../utils/http";

function startOfToday() { const d = new Date(); d.setHours(0, 0, 0, 0); return d; }
function endOfToday() { const d = new Date(); d.setHours(23, 59, 59, 999); return d; }

/** GET /followups/buckets → { overdue, today, upcoming, done } counts + items */
export const buckets = asyncHandler(async (req: Request, res: Response) => {
  const tenant = req.tenantId;
  const ownerFilter: any = req.query.owner && req.query.owner !== "All" ? { owner: req.query.owner } : {};
  const base = { tenant, ...ownerFilter };

  const [overdue, today, upcoming, done] = await Promise.all([
    FollowUp.find({ ...base, done: false, due: { $lt: startOfToday() } }).sort({ due: 1 }),
    FollowUp.find({ ...base, done: false, due: { $gte: startOfToday(), $lte: endOfToday() } }).sort({ due: 1 }),
    FollowUp.find({ ...base, done: false, due: { $gt: endOfToday() } }).sort({ due: 1 }),
    FollowUp.find({ ...base, done: true }).sort({ updatedAt: -1 }).limit(100),
  ]);

  ok(res, {
    counts: { overdue: overdue.length, today: today.length, upcoming: upcoming.length, done: done.length },
    overdue, today, upcoming, done,
  });
});

export const complete = asyncHandler(async (req: Request, res: Response) => {
  const fu = await FollowUp.findOneAndUpdate(
    { _id: req.params.id, tenant: req.tenantId },
    { $set: { done: true, outcome: req.body.outcome || "Completed" } },
    { new: true }
  );
  if (!fu) throw new ApiError(404, "Follow-up not found");
  await Lead.updateOne({ _id: fu.lead }, { $set: { lastActivity: new Date() } });
  await audit({ tenant: req.tenantId, user: req.auth?.name, action: "FOLLOWUP", module: "Follow-ups", entity: fu.leadName || String(fu._id), next: fu.outcome });
  ok(res, fu);
});

export const reschedule = asyncHandler(async (req: Request, res: Response) => {
  const { due } = req.body;
  if (!due) throw new ApiError(400, "due (ISO date) required");
  const fu = await FollowUp.findOneAndUpdate(
    { _id: req.params.id, tenant: req.tenantId },
    { $set: { due: new Date(due) } },
    { new: true }
  );
  if (!fu) throw new ApiError(404, "Follow-up not found");
  await Lead.updateOne({ _id: fu.lead }, { $set: { nextFollowUp: new Date(due) } });
  ok(res, fu);
});

/** POST /leads/:id/followups → create follow-up for a lead (handles single or dual current/next flow) */
export const createFollowUpForLead = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const tenant = req.tenantId;
  const lead = await Lead.findOne({ _id: id, tenant });
  if (!lead) throw new ApiError(404, "Lead not found");

  const body = req.body;

  // Check if body has nested current and next follow-up objects (from FollowUpSlider)
  if (body.current && body.next) {
    const results: any[] = [];

    // 1. Create the completed current follow-up
    const curr = body.current;
    if (curr.date && curr.remark) {
      const [hours, minutes] = (curr.time || "10:00").split(":");
      const dueDateTime = new Date(curr.date);
      dueDateTime.setHours(parseInt(hours) || 10, parseInt(minutes) || 0, 0, 0);

      const newCurr = new FollowUp({
        tenant,
        lead: lead._id,
        leadName: lead.name,
        phone: lead.phone,
        type: curr.type || "Call",
        due: dueDateTime,
        dueDate: dueDateTime,
        dueTime: curr.time || "10:00",
        note: curr.remark,
        remark: curr.remark,
        owner: req.auth?.name || "System",
        assignedTo: req.auth?.name || "System",
        done: true,
        outcome: curr.remark || "Completed",
        completedAt: new Date(),
        completionNote: curr.remark
      });
      await newCurr.save();
      results.push(newCurr);
    }

    // 2. Create the next scheduled follow-up
    const nextVal = body.next;
    if (nextVal.date && nextVal.remark) {
      const [hours, minutes] = (nextVal.time || "10:00").split(":");
      const dueDateTime = new Date(nextVal.date);
      dueDateTime.setHours(parseInt(hours) || 10, parseInt(minutes) || 0, 0, 0);

      const newNext = new FollowUp({
        tenant,
        lead: lead._id,
        leadName: lead.name,
        phone: lead.phone,
        type: nextVal.type || "Call",
        due: dueDateTime,
        dueDate: dueDateTime,
        dueTime: nextVal.time || "10:00",
        note: nextVal.remark,
        remark: nextVal.remark,
        owner: nextVal.assignedTo || req.auth?.name || "System",
        assignedTo: nextVal.assignedTo || req.auth?.name || "System",
        done: false,
        status: lead.status
      });
      await newNext.save();
      results.push(newNext);

      // Update lead tracking fields
      lead.lastFollowUpType = curr.type || "Call";
      lead.nextFollowUp = dueDateTime;
      lead.nextFollowUpDate = dueDateTime;
      lead.nextFollowUpType = nextVal.type || "Call";
      lead.followUpCount = (lead.followUpCount || 0) + (curr.date ? 2 : 1);
      lead.lastActivity = new Date();
      await lead.save();
    } else {
      // Just update lead tracking for completed current one
      lead.lastFollowUpType = curr.type || "Call";
      lead.followUpCount = (lead.followUpCount || 0) + 1;
      lead.lastActivity = new Date();
      await lead.save();
    }

    await audit({
      tenant,
      user: req.auth?.name,
      action: "FOLLOWUP_LOGGED",
      module: "Follow-ups",
      entity: lead.name,
      next: "Logged current and scheduled next follow-up"
    });

    return ok(res, { success: true, count: results.length });
  }

  // Fallback: flat body single follow-up creation
  const { type, dueDate, dueTime, remark, assignedTo, done } = body;
  const dateToUse = dueDate || body.due;
  if (!dateToUse) throw new ApiError(400, "dueDate is required");

  const [hours, minutes] = (dueTime || "10:00").split(":");
  const dueDateTime = new Date(dateToUse);
  dueDateTime.setHours(parseInt(hours) || 10, parseInt(minutes) || 0, 0, 0);

  const followUp = new FollowUp({
    tenant,
    lead: lead._id,
    leadName: lead.name,
    phone: lead.phone,
    type: type || "Call",
    due: dueDateTime,
    dueDate: dueDateTime,
    dueTime: dueTime || "10:00",
    note: remark || body.note,
    remark: remark || body.note,
    owner: assignedTo || req.auth?.name || "System",
    assignedTo: assignedTo || req.auth?.name || "System",
    done: done === true || done === "true",
    status: lead.status
  });

  await followUp.save();

  // Update lead tracking fields
  lead.followUpCount = (lead.followUpCount || 0) + 1;
  lead.lastActivity = new Date();
  if (followUp.done) {
    lead.lastFollowUpType = type;
  } else {
    lead.nextFollowUp = dueDateTime;
    lead.nextFollowUpDate = dueDateTime;
    lead.nextFollowUpType = type;
  }
  await lead.save();

  await audit({
    tenant,
    user: req.auth?.name,
    action: "FOLLOWUP_CREATED",
    module: "Follow-ups",
    entity: lead.name,
    next: `Scheduled follow-up for ${dueDateTime.toLocaleDateString()}`
  });

  ok(res, { id: followUp._id, created: true });
});

/** GET /followups/workload → Get workload metrics for a counsellor */
export const getWorkload = asyncHandler(async (req: Request, res: Response) => {
  const tenant = req.tenantId;
  const counsellor = req.query.counsellor as string;
  if (!counsellor) throw new ApiError(400, "counsellor query param required");

  const [total, pending, completed] = await Promise.all([
    FollowUp.countDocuments({ tenant, $or: [{ assignedTo: counsellor }, { owner: counsellor }] }),
    FollowUp.countDocuments({ tenant, done: false, $or: [{ assignedTo: counsellor }, { owner: counsellor }] }),
    FollowUp.countDocuments({ tenant, done: true, $or: [{ assignedTo: counsellor }, { owner: counsellor }] }),
  ]);

  const nextFollowUp = await FollowUp.findOne({
    tenant,
    done: false,
    $or: [{ assignedTo: counsellor }, { owner: counsellor }]
  }).sort({ due: 1 });

  ok(res, {
    total,
    pending,
    completed,
    capacity: 20,
    nextDate: nextFollowUp ? nextFollowUp.due.toISOString().split("T")[0] : null
  });
});

