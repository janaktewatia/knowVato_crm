import { Request, Response } from "express";
import { asyncHandler, ok, ApiError } from "../utils/http";
import * as aiSvc from "../services/aiService";

export const getAiConfig = asyncHandler(async (req: Request, res: Response) => {
  const config = await aiSvc.getAiConfig(String(req.tenantId));
  ok(res, config);
});

export const saveAiConfig = asyncHandler(async (req: Request, res: Response) => {
  const config = await aiSvc.saveAiConfig(String(req.tenantId), req.body);
  ok(res, config);
});

export const testAiConnection = asyncHandler(async (req: Request, res: Response) => {
  const result = await aiSvc.testAiConnection(String(req.tenantId), req.body);
  ok(res, result);
});

export const executeAiCommand = asyncHandler(async (req: Request, res: Response) => {
  const { prompt, history } = req.body || {};
  if (!prompt || !String(prompt).trim()) {
    throw new ApiError(400, "Prompt is required");
  }

  const result = await aiSvc.executeAiCommand(
    String(req.tenantId),
    req.auth?.name || "User",
    String(prompt).trim(),
    Array.isArray(history) ? history : []
  );

  ok(res, result);
});
