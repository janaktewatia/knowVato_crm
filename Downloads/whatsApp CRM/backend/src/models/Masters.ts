import { Schema, model, Document, Types } from "mongoose";

/* ---- Lead status (colour-coded, follow-up rule) ---- */
export interface ILeadStatus extends Document {
  tenant: Types.ObjectId;
  service?: Types.ObjectId | null; // null = shared/global default; set = this service's own status
  name: string;
  color: string;
  followUpRequired: boolean;
  order: number;
  isWon: boolean;
  isLost: boolean;
}

const leadStatusSchema = new Schema<ILeadStatus>(
  {
    tenant: { type: Schema.Types.ObjectId, ref: "Tenant", required: true, index: true },
    service: { type: Schema.Types.ObjectId, ref: "Service", default: null, index: true },
    name: { type: String, required: true },
    color: { type: String, default: "#2563eb" },
    followUpRequired: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
    isWon: { type: Boolean, default: false },
    isLost: { type: Boolean, default: false },
  },
  { timestamps: true }
);
export const LeadStatus = model<ILeadStatus>("LeadStatus", leadStatusSchema);

/* ---- Sub-status (belongs to a status) ---- */
export interface ISubStatus extends Document {
  tenant: Types.ObjectId;
  status: Types.ObjectId;
  name: string;
}
const subStatusSchema = new Schema<ISubStatus>(
  {
    tenant: { type: Schema.Types.ObjectId, ref: "Tenant", required: true, index: true },
    status: { type: Schema.Types.ObjectId, ref: "LeadStatus", required: true },
    name: { type: String, required: true },
  },
  { timestamps: true }
);
export const SubStatus = model<ISubStatus>("SubStatus", subStatusSchema);

/* ---- Lead source ---- */
export interface ILeadSource extends Document {
  tenant: Types.ObjectId;
  name: string;
  color: string;
}
const leadSourceSchema = new Schema<ILeadSource>(
  {
    tenant: { type: Schema.Types.ObjectId, ref: "Tenant", required: true, index: true },
    name: { type: String, required: true },
    color: { type: String, default: "#6366f1" },
  },
  { timestamps: true }
);
export const LeadSource = model<ILeadSource>("LeadSource", leadSourceSchema);
