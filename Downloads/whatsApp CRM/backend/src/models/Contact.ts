import { Schema, model, Document, Types } from "mongoose";

export interface IContact extends Document {
  tenant: Types.ObjectId;
  name: string;
  phone: string; // E.164-ish, WhatsApp id
  email?: string;
  category?: string;
  tags: string[];
  optIn: boolean;
  lifecycleStage: "Lead" | "Prospect" | "Customer";
  value: number;
  assigned?: string;
  lastContacted?: Date;
  attributes: Record<string, any>;
}

const contactSchema = new Schema<IContact>(
  {
    tenant: { type: Schema.Types.ObjectId, ref: "Tenant", required: true, index: true },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: String,
    category: String,
    tags: { type: [String], default: [] },
    optIn: { type: Boolean, default: true },
    lifecycleStage: { type: String, enum: ["Lead", "Prospect", "Customer"], default: "Lead" },
    value: { type: Number, default: 0 },
    assigned: String,
    lastContacted: Date,
    attributes: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

contactSchema.index({ tenant: 1, phone: 1 }, { unique: true });
contactSchema.index({ tenant: 1, name: "text" });

export const Contact = model<IContact>("Contact", contactSchema);
