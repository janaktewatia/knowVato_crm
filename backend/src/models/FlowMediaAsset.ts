import { Schema, model, Document, Types } from "mongoose";

export type FlowMediaType = "image" | "video" | "document" | "audio";

export interface IFlowMediaAsset extends Document {
  tenant: Types.ObjectId;
  name: string;
  type: FlowMediaType;
  url: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  createdAt: Date;
  updatedAt: Date;
}

const flowMediaAssetSchema = new Schema<IFlowMediaAsset>(
  {
    tenant: { type: Schema.Types.ObjectId, ref: "Tenant", required: true, index: true },
    name: { type: String, required: true, trim: true },
    type: { type: String, enum: ["image", "video", "document", "audio"], required: true, default: "image" },
    url: { type: String, required: true },
    fileName: { type: String, required: true },
    mimeType: { type: String, required: true },
    sizeBytes: { type: Number, required: true },
  },
  { timestamps: true }
);

flowMediaAssetSchema.index({ tenant: 1, name: 1 });
flowMediaAssetSchema.index({ tenant: 1, url: 1 }, { unique: true });

export const FlowMediaAsset = model<IFlowMediaAsset>("FlowMediaAsset", flowMediaAssetSchema);
