import { Schema, model, Document, Types } from "mongoose";

/* ---- Integration ---- */
export interface IIntegration extends Document {
  tenant: Types.ObjectId;
  key: string; // e.g. int_wa, int_fb
  name: string;
  category: string;
  icon?: string;
  desc?: string;
  connected: boolean;
  account?: string | null;
  config?: Record<string, any>;
}
const integrationSchema = new Schema<IIntegration>(
  {
    tenant: { type: Schema.Types.ObjectId, ref: "Tenant", required: true, index: true },
    key: { type: String, required: true },
    name: { type: String, required: true },
    category: String,
    icon: String,
    desc: String,
    connected: { type: Boolean, default: false },
    account: { type: String, default: null },
    config: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);
export const Integration = model<IIntegration>("Integration", integrationSchema);

/* ---- Audit log ---- */
export interface IAuditLog extends Document {
  tenant: Types.ObjectId;
  user: string;
  action: string;
  module: string;
  entity: string;
  prev?: string;
  next?: string;
  ip?: string;
}
const auditSchema = new Schema<IAuditLog>(
  {
    tenant: { type: Schema.Types.ObjectId, ref: "Tenant", required: true, index: true },
    user: String,
    action: String,
    module: String,
    entity: String,
    prev: { type: String, default: "—" },
    next: { type: String, default: "—" },
    ip: String,
  },
  { timestamps: true }
);
auditSchema.index({ tenant: 1, createdAt: -1 });
export const AuditLog = model<IAuditLog>("AuditLog", auditSchema);
