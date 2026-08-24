import { Schema, model, Document, Types } from "mongoose";

export interface IBotSession extends Document {
  tenant: Types.ObjectId;
  phone: string;
  botId: string;
  currentNodeId: string;
  awaitingType: "buttons" | "list" | "text" | "form" | null;
  formState?: {
    formId: string;
    fieldIndex: number;
    collectedData: Record<string, any>;
    nodeId: string;
  };
  variables: Record<string, any>;
  updatedAt: Date;
  createdAt: Date;
}

const botSessionSchema = new Schema<IBotSession>(
  {
    tenant: { type: Schema.Types.ObjectId, ref: "Tenant", required: true, index: true },
    phone: { type: String, required: true, index: true },
    botId: { type: String, required: true },
    currentNodeId: { type: String, required: true },
    awaitingType: { type: String, default: null },
    formState: { type: Schema.Types.Mixed, default: null },
    variables: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

// Compound index for fast lookup
botSessionSchema.index({ tenant: 1, phone: 1 }, { unique: true });
// Auto-expire session after 24 hours of inactivity
botSessionSchema.index({ updatedAt: 1 }, { expireAfterSeconds: 86400 });

export const BotSession = model<IBotSession>("BotSession", botSessionSchema);
