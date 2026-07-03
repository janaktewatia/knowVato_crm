import { Schema, model, Document, Types } from "mongoose";
import { VendorKey } from "../services/providers/types";

/**
 * A configured WhatsApp commercial account from a specific vendor.
 * A tenant can hold MANY of these (different vendors / numbers), but only one
 * is `active` at a time. Switching the active account is a setting change, not
 * a code change.
 *
 * Note: secrets are stored here for the build's simplicity. In production move
 * apiKey/accessToken/appSecret to a secrets manager and store only references.
 */
export interface IWhatsAppAccount extends Document {
  tenant: Types.ObjectId;
  label: string;                 // human name, e.g. "Pinnacle – Admissions number"
  vendor: VendorKey;             // simulation | meta | pinnacle | gupshup | twilio
  active: boolean;               // exactly one true per tenant (enforced in service)
  senderNumber?: string;
  // credentials (vendor uses whichever apply)
  apiBaseUrl?: string;
  apiKey?: string;
  accessToken?: string;
  phoneNumberId?: string;
  wabaId?: string;
  verifyToken?: string;
  appSecret?: string;
  extra?: Record<string, any>;
  // status
  lastCheckedAt?: Date;
  health?: "unknown" | "ok" | "error";
  healthNote?: string;
}

const waAccountSchema = new Schema<IWhatsAppAccount>(
  {
    tenant: { type: Schema.Types.ObjectId, ref: "Tenant", required: true, index: true },
    label: { type: String, required: true },
    vendor: { type: String, required: true, default: "simulation" },
    active: { type: Boolean, default: false },
    senderNumber: String,
    apiBaseUrl: String,
    apiKey: String,
    accessToken: String,
    phoneNumberId: String,
    wabaId: String,
    verifyToken: String,
    appSecret: String,
    extra: { type: Schema.Types.Mixed, default: {} },
    lastCheckedAt: Date,
    health: { type: String, enum: ["unknown", "ok", "error"], default: "unknown" },
    healthNote: String,
  },
  { timestamps: true }
);

waAccountSchema.index({ tenant: 1, active: 1 });

// Never leak secrets in API responses; expose a masked hint instead.
waAccountSchema.set("toJSON", {
  transform: (_doc, ret: any) => {
    const mask = (v?: string) => (v ? "••••" + String(v).slice(-4) : null);
    ret.apiKey = mask(ret.apiKey);
    ret.accessToken = mask(ret.accessToken);
    ret.appSecret = mask(ret.appSecret);
    return ret;
  },
});

export const WhatsAppAccount = model<IWhatsAppAccount>("WhatsAppAccount", waAccountSchema);
