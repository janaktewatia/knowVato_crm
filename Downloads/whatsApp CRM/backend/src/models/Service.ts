import { Schema, model, Document, Types } from "mongoose";

/**
 * A "service" is a pipeline a lead can be engaged in — e.g. WhatsApp CRM,
 * Event Management, Admissions. Comes with built-in defaults; users can add
 * custom ones. A lead can have a track in many services at once.
 */
export interface IService extends Document {
  tenant: Types.ObjectId;
  name: string;
  key: string;        // stable slug, e.g. "whatsapp", "events"
  color: string;
  icon?: string;
  order: number;
  builtIn: boolean;
  active: boolean;
  isRecurring?: boolean;
}

const serviceSchema = new Schema<IService>(
  {
    tenant: { type: Schema.Types.ObjectId, ref: "Tenant", required: true, index: true },
    name: { type: String, required: true },
    key: { type: String, required: true },
    color: { type: String, default: "#0085a8" },
    icon: { type: String, default: "grid" },
    order: { type: Number, default: 0 },
    builtIn: { type: Boolean, default: false },
    active: { type: Boolean, default: true },
    isRecurring: { type: Boolean, default: false },
  },
  { timestamps: true }
);
serviceSchema.index({ tenant: 1, key: 1 }, { unique: true });

export const Service = model<IService>("Service", serviceSchema);
