import { Request, Response } from "express";
import { Lead } from "../models/Lead";
import { LeadStatus } from "../models/Masters";
import { asyncHandler, ok, ApiError, audit } from "../utils/http";
import { convertToLead, changeLeadStatus } from "../services/leadService";

export const convert = asyncHandler(async (req: Request, res: Response) => {
  const { name, phone, email, source, owner, course, contactId } = req.body;
  if (!name || !phone) throw new ApiError(400, "name and phone are required");
  const result = await convertToLead({
    tenant: req.tenantId,
    name, phone, email,
    sourceKeyOrId: source,
    owner, course, contactId,
    user: req.auth?.name,
  });
  ok(res, result, result.created ? 201 : 200);
});

export const setStatus = asyncHandler(async (req: Request, res: Response) => {
  const { statusId, subStatusId } = req.body;
  if (!statusId) throw new ApiError(400, "statusId required");
  const lead = await changeLeadStatus({
    tenant: req.tenantId,
    leadId: req.params.id,
    statusId,
    subStatusId,
    user: req.auth?.name,
  });
  ok(res, lead);
});

export const addNote = asyncHandler(async (req: Request, res: Response) => {
  const { text } = req.body;
  if (!text) throw new ApiError(400, "text required");
  const lead = await Lead.findOneAndUpdate(
    { _id: req.params.id, tenant: req.tenantId },
    { $push: { notes: { text, by: req.auth?.name || "System", at: new Date() } }, $set: { lastActivity: new Date() } },
    { new: true }
  );
  if (!lead) throw new ApiError(404, "Lead not found");
  await audit({ tenant: req.tenantId, user: req.auth?.name, action: "NOTE", module: "Leads", entity: lead.name });
  ok(res, lead);
});

export const getServiceStatuses = asyncHandler(async (req: Request, res: Response) => {
  const { serviceId } = req.params;
  const tenant = req.tenantId;

  const query: any = { tenant };
  if (serviceId) {
    query.$or = [
      { offerings: serviceId },
      { offerings: { $size: 0 } },
      { offerings: { $exists: false } }
    ];
  }

  const statuses = await LeadStatus.find(query).sort({ order: 1 });
  ok(res, statuses);
});

