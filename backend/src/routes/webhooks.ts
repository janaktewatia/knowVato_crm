import { Router } from "express";
import * as msgC from "../controllers/messagingController";

const r = Router();

/**
 * Vendor webhooks (public — verified per-tenant by the active provider).
 * Each configured WhatsApp account points its callback at its own tenant URL:
 *   GET/POST  /webhooks/whatsapp/:tenantId
 * Works for Meta, Pinnacle, or any vendor — parsing is delegated to the
 * tenant's active provider.
 */
r.get("/whatsapp/:tenantId", msgC.webhookVerify);
r.post("/whatsapp/:tenantId", msgC.webhookReceive);

export default r;
