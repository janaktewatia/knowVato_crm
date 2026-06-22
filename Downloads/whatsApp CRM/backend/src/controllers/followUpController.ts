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
