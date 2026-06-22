import { Schema, model, Document } from "mongoose";

export interface ITenant extends Document {
  name: string;
  plan: "trial" | "growth" | "enterprise";
  wabaId?: string;
  phoneNumberId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const tenantSchema = new Schema<ITenant>(
  {
    name: { type: String, required: true },
    plan: { type: String, enum: ["trial", "growth", "enterprise"], default: "trial" },
    wabaId: String,
    phoneNumberId: String,
  },
  { timestamps: true }
);

export const Tenant = model<ITenant>("Tenant", tenantSchema);
