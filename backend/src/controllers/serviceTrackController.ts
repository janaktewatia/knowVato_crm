import { Request, Response } from "express";
import { asyncHandler, ok, ApiError } from "../utils/http";
import { addServiceTrack, setServiceStatus, removeServiceTrack } from "../services/serviceTrackService";

export const addTrack = asyncHandler(async (req: Request, res: Response) => {
  const { serviceId, owner } = req.body || {};
  if (!serviceId) throw new ApiError(400, "serviceId required");
  const result = await addServiceTrack({ tenant: req.tenantId, leadId: req.params.id, serviceId, owner, user: req.auth?.name });
  ok(res, result, result.created ? 201 : 200);
});

export const setTrackStatus = asyncHandler(async (req: Request, res: Response) => {
  const { serviceId, statusId, subStatusId } = req.body || {};
  if (!serviceId || !statusId) throw new ApiError(400, "serviceId and statusId required");
  const lead = await setServiceStatus({ tenant: req.tenantId, leadId: req.params.id, serviceId, statusId, subStatusId, user: req.auth?.name });
  ok(res, lead);
});

export const removeTrack = asyncHandler(async (req: Request, res: Response) => {
  const lead = await removeServiceTrack({ tenant: req.tenantId, leadId: req.params.id, serviceId: req.params.serviceId, user: req.auth?.name });
  ok(res, lead);
});
