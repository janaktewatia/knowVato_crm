import { Schema, model, Document, Types } from "mongoose";

export interface IAISettings {
  tenant: Types.ObjectId;
  enabled: boolean;
  provider: "gemini" | "claude" | "openai";
  apiKey?: string;
  model?: string;
  systemInstruction?: string;
  extra?: Record<string, any>;
  lastTestedAt?: Date;
  testStatus?: "connected" | "failed" | "untested";
  createdAt?: Date;
  updatedAt?: Date;
}

const aiSettingsSchema = new Schema<IAISettings>(
  {
    tenant: { type: Schema.Types.ObjectId, ref: "Tenant", required: true, index: true, unique: true },
    enabled: { type: Boolean, default: false },
    provider: { type: String, enum: ["gemini", "claude", "openai"], default: "gemini" },
    apiKey: { type: String, default: "" },
    model: { type: String, default: "gemini-1.5-flash" },
    systemInstruction: {
      type: String,
      default:
        "You are KnowVato AI Assistant. You only perform operational and functional CRM tasks such as creating chatbots, events, campaigns, follow-ups, contacts, and querying database metrics. You never modify system architecture or code.",
    },
    extra: { type: Schema.Types.Mixed, default: {} },
    lastTestedAt: Date,
    testStatus: { type: String, enum: ["connected", "failed", "untested"], default: "untested" },
  },
  { timestamps: true }
);

export const AISettings = model<IAISettings>("AISettings", aiSettingsSchema);
