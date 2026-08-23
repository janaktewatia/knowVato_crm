import { Schema, model, Document, Types } from "mongoose";

export interface IFlowStudioState extends Document {
  tenant: Types.ObjectId;
  clients: any[];
  bots: any[];
  forms: any[];
  meta: {
    lastPublishedBotId?: string;
    lastPublishAt?: Date;
  };
}

const flowStudioStateSchema = new Schema<IFlowStudioState>(
  {
    tenant: { type: Schema.Types.ObjectId, ref: "Tenant", required: true, index: true, unique: true },
    clients: { type: Schema.Types.Mixed, default: [] },
    bots: { type: Schema.Types.Mixed, default: [] },
    forms: { type: Schema.Types.Mixed, default: [] },
    meta: {
      lastPublishedBotId: String,
      lastPublishAt: Date,
    },
  },
  { timestamps: true }
);

export const FlowStudioState = model<IFlowStudioState>("FlowStudioState", flowStudioStateSchema);
