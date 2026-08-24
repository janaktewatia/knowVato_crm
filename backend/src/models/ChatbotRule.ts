import { Schema, model, Document, Types } from "mongoose";

export interface IChatbotRule extends Document {
  tenant: Types.ObjectId;
  name: string;
  triggerType: "keyword" | "button_click" | "list_selection" | "lead_created" | "default";
  keywords: string[];
  matchType: "exact" | "contains" | "regex" | "starts_with";
  actionType:
    | "send_text"
    | "send_buttons"
    | "send_list"
    | "send_media"
    | "send_template"
    | "update_status"
    | "assign_counsellor"
    | "create_followup";
  actionPayload: {
    text?: string;
    templateName?: string;
    languageCode?: string;
    templateParams?: string[];
    buttons?: { id: string; title: string }[];
    listButtonText?: string;
    listSections?: { title: string; rows: { id: string; title: string; description?: string }[] }[];
    mediaType?: "image" | "video" | "document" | "audio";
    mediaUrl?: string;
    caption?: string;
    filename?: string;
    statusId?: string;
    subStatusId?: string;
    counsellorName?: string;
    followupNote?: string;
    followupDays?: number;
  };
  active: boolean;
  order: number;
}

const chatbotRuleSchema = new Schema<IChatbotRule>(
  {
    tenant: { type: Schema.Types.ObjectId, ref: "Tenant", required: true, index: true },
    name: { type: String, required: true },
    triggerType: {
      type: String,
      enum: ["keyword", "button_click", "list_selection", "lead_created", "default"],
      default: "keyword",
    },
    keywords: { type: [String], default: [] },
    matchType: {
      type: String,
      enum: ["exact", "contains", "regex", "starts_with"],
      default: "contains",
    },
    actionType: {
      type: String,
      enum: [
        "send_text",
        "send_buttons",
        "send_list",
        "send_media",
        "send_template",
        "update_status",
        "assign_counsellor",
        "create_followup",
      ],
      default: "send_text",
    },
    actionPayload: { type: Schema.Types.Mixed, default: {} },
    active: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

chatbotRuleSchema.index({ tenant: 1, active: 1, order: 1 });

export const ChatbotRule = model<IChatbotRule>("ChatbotRule", chatbotRuleSchema);
