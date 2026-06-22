import { Request, Response, NextFunction } from "express";
import { AuditLog } from "../models/System";

export class ApiError extends Error {
  status: number;
  details?: any;
  constructor(status: number, message: string, details?: any) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

// Wrap async route handlers so thrown errors hit the error middleware.
export const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) =>
  (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(fn(req, res, next)).catch(next);

// Convenience: write an audit entry (fire-and-forget).
export async function audit(opts: {
  tenant: any;
  user?: string;
  action: string;
  module: string;
  entity: string;
  prev?: string;
  next?: string;
  ip?: string;
}) {
  try {
    await AuditLog.create({
      tenant: opts.tenant,
      user: opts.user || "System",
      action: opts.action,
      module: opts.module,
      entity: opts.entity,
      prev: opts.prev || "—",
      next: opts.next || "—",
      ip: opts.ip || "",
    });
  } catch {
    /* never let auditing break the request */
  }
}

export const ok = (res: Response, data: any, status = 200) =>
  res.status(status).json({ ok: true, data });

export const paginated = (res: Response, items: any[], total: number, page: number, perPage: number) =>
  res.json({ ok: true, data: items, page, perPage, total, pages: Math.ceil(total / perPage) });
