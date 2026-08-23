import { Request, Response } from "express";
import { asyncHandler, ok, ApiError, audit } from "../utils/http";
import { FlowStudioState } from "../models/FlowStudioState";

function sanitizePayload(body: any) {
  const clients = Array.isArray(body?.clients) ? body.clients : [];
  const bots = Array.isArray(body?.bots) ? body.bots : [];
  const forms = Array.isArray(body?.forms) ? body.forms : [];
  const meta = typeof body?.meta === "object" && body?.meta ? body.meta : {};
  return { clients, bots, forms, meta };
}

export const getFlowStudioState = asyncHandler(async (req: Request, res: Response) => {
  const tenantId = req.tenantId;
  if (!tenantId) throw new ApiError(401, "Tenant not resolved");

  const doc = await FlowStudioState.findOne({ tenant: tenantId }).lean();
  if (!doc) {
    return ok(res, { clients: [], bots: [], forms: [], meta: {} });
  }

  ok(res, {
    clients: Array.isArray(doc.clients) ? doc.clients : [],
    bots: Array.isArray(doc.bots) ? doc.bots : [],
    forms: Array.isArray(doc.forms) ? doc.forms : [],
    meta: doc.meta || {},
  });
});

export const saveFlowStudioState = asyncHandler(async (req: Request, res: Response) => {
  const tenantId = req.tenantId;
  if (!tenantId) throw new ApiError(401, "Tenant not resolved");

  const payload = sanitizePayload(req.body || {});
  const doc = await FlowStudioState.findOneAndUpdate(
    { tenant: tenantId },
    {
      $set: {
        tenant: tenantId,
        clients: payload.clients,
        bots: payload.bots,
        forms: payload.forms,
        meta: payload.meta,
      },
    },
    { upsert: true, new: true }
  );

  await audit({
    tenant: tenantId,
    user: req.auth?.name,
    action: "UPDATE",
    module: "Workflows",
    entity: "FlowChat Studio State",
    next: `bots=${payload.bots.length}, forms=${payload.forms.length}`,
  });

  ok(res, {
    clients: doc.clients || [],
    bots: doc.bots || [],
    forms: doc.forms || [],
    meta: doc.meta || {},
  });
});
