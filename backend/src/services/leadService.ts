import { Lead } from "../models/Lead";
import { FollowUp } from "../models/FollowUp";
import { LeadStatus, SubStatus, LeadSource } from "../models/Masters";
import { Conversation } from "../models/Messaging";
import { audit } from "../utils/http";
import { applyLeadAssignment } from "./workflowEngine";
import { fireAlerts } from "./alertsEngine";

function addDays(days: number, hour = 10): Date {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, 0, 0, 0);
  return d;
}

/** Convert a contact / reply / chat into a lead (dedup by phone). */
export async function convertToLead(opts: {
  tenant: any;
  name: string;
  phone: string;
  email?: string;
  sourceKeyOrId?: string;
  owner?: string;
  course?: string;
  contactId?: any;
  user?: string;
}) {
  const { tenant } = opts;
  const existing = await Lead.findOne({ tenant, phone: opts.phone });
  if (existing) return { lead: existing, created: false };

  // first status (lowest order)
  const firstStatus = await LeadStatus.findOne({ tenant }).sort({ order: 1 });
  if (!firstStatus) throw new Error("No lead statuses configured");
  const firstSub = await SubStatus.findOne({ tenant, status: firstStatus._id });

  // resolve source
  let source: any = null;
  if (opts.sourceKeyOrId) {
    source =
      (await LeadSource.findById(opts.sourceKeyOrId).catch(() => null)) ||
      (await LeadSource.findOne({ tenant, name: new RegExp(opts.sourceKeyOrId, "i") }));
  }
  if (!source) source = await LeadSource.findOne({ tenant });

  const due = addDays(1);
  const lead = await Lead.create({
    tenant,
    name: opts.name,
    phone: opts.phone,
    email: opts.email,
    contact: opts.contactId || undefined,
    status: firstStatus._id,
    subStatus: firstSub?._id || null,
    source: source?._id,
    owner: opts.owner || "Unassigned",
    course: opts.course,
    nextFollowUp: due,
    lastActivity: new Date(),
  });

  await FollowUp.create({
    tenant,
    lead: lead._id,
    leadName: lead.name,
    phone: lead.phone,
    due,
    type: "Call",
    note: "First contact follow-up",
    owner: lead.owner,
    status: firstStatus._id,
  });

  // link conversation if present
  await Conversation.updateOne({ tenant, phone: opts.phone }, { $set: { lead: lead._id } });

  // apply lead assignment workflow
  await applyLeadAssignment(lead, tenant);

  // fire alerts
  await fireAlerts("lead.created", lead, tenant, opts.user);

  await audit({ tenant, user: opts.user, action: "CONVERT", module: "Leads", entity: lead.name, next: "New lead" });
  return { lead, created: true };
}

/** Change a lead's status, applying the follow-up-required master rule. */
export async function changeLeadStatus(opts: {
  tenant: any;
  leadId: string;
  statusId: string;
  subStatusId?: string | null;
  user?: string;
}) {
  const { tenant, leadId, statusId } = opts;
  const lead = await Lead.findOne({ _id: leadId, tenant });
  if (!lead) throw new Error("Lead not found");

  const prevStatus = await LeadStatus.findById(lead.status);
  const nextStatus = await LeadStatus.findOne({ _id: statusId, tenant });
  if (!nextStatus) throw new Error("Status not found");

  lead.status = nextStatus._id as any;
  lead.subStatus = (opts.subStatusId as any) || null;
  lead.lastActivity = new Date();

  if (nextStatus.isWon || nextStatus.isLost) {
    // close out: clear follow-ups
    lead.nextFollowUp = null;
    await FollowUp.updateMany({ tenant, lead: lead._id, done: false }, { $set: { done: true, outcome: nextStatus.isWon ? "Won" : "Closed" } });
  } else if (nextStatus.followUpRequired === "Yes" && !lead.nextFollowUp) {
    const due = addDays(2, 11);
    lead.nextFollowUp = due;
    await FollowUp.create({
      tenant,
      lead: lead._id,
      leadName: lead.name,
      phone: lead.phone,
      due,
      type: "Call",
      note: "Follow-up for " + nextStatus.name,
      owner: lead.owner,
      status: nextStatus._id,
    });
  }

  await lead.save();

  // fire status change alerts
  await fireAlerts("lead.status_changed", lead, tenant, opts.user);

  await audit({
    tenant,
    user: opts.user,
    action: "STATUS",
    module: "Leads",
    entity: lead.name,
    prev: prevStatus?.name,
    next: nextStatus.name,
  });
  return lead;
}
