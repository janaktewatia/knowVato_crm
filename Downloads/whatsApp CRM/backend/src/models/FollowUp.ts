import { Schema, model, Document, Types } from "mongoose";

export interface IFollowUp extends Document {
  tenant: Types.ObjectId;
  service?: Types.ObjectId | null;
  lead: Types.ObjectId;
  leadName: string;
  phone: string;
  due: Date;
  type: "Call" | "WhatsApp" | "Email" | "Visit";
  note?: string;
  owner: string;
  status?: Types.ObjectId; // the lead status at time of scheduling
  done: boolean;
  outcome?: string;
}

const followUpSchema = new Schema<IFollowUp>(
  {
    tenant: { type: Schema.Types.ObjectId, ref: "Tenant", required: true, index: true },
    service: { type: Schema.Types.ObjectId, ref: "Service", default: null, index: true },
    lead: { type: Schema.Types.ObjectId, ref: "Lead", required: true, index: true },
    leadName: String,
    phone: String,
    due: { type: Date, required: true, index: true },
    type: { type: String, enum: ["Call", "WhatsApp", "Email", "Visit"], default: "Call" },
    note: String,
    owner: String,
    status: { type: Schema.Types.ObjectId, ref: "LeadStatus" },
    done: { type: Boolean, default: false },
    outcome: String,
  },
  { timestamps: true }
);

export const FollowUp = model<IFollowUp>("FollowUp", followUpSchema);
