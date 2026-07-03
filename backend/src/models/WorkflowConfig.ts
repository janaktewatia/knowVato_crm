import { Schema, model, Document, Types } from "mongoose";

export interface IWorkflowConfig extends Document {
  tenant: Types.ObjectId;
  key: string; // e.g., "registrationForm", "followUpTemplate"
  data: Record<string, any>; // The actual configuration data
}

const workflowConfigSchema = new Schema<IWorkflowConfig>(
  {
    tenant: { type: Schema.Types.ObjectId, ref: "Tenant", required: true, index: true },
    key: { type: String, required: true, index: true },
    data: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

// Compound index to ensure one config per tenant and key
workflowConfigSchema.index({ tenant: 1, key: 1 }, { unique: true });

export const WorkflowConfig = model<IWorkflowConfig>("WorkflowConfig", workflowConfigSchema);
