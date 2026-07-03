import { Schema, model, Document, Types } from "mongoose";

export interface ILeadNote {
  text: string;
  by: string;
  at: Date;
}

/** A lead's engagement in ONE service, with its own status + follow-up. */
export interface IServiceTrack {
  service: Types.ObjectId;
  status?: Types.ObjectId | null;
  subStatus?: Types.ObjectId | null;
  owner?: string;
  value?: number;
  nextFollowUp?: Date | null;
  isClosed?: boolean;     // won or lost in this service
  updatedAt?: Date;
}

export interface ILead extends Document {
  tenant: Types.ObjectId;
  name: string;
  phone: string;
  email?: string;
  contact?: Types.ObjectId;
  status: Types.ObjectId;
  subStatus?: Types.ObjectId | null;
  source?: Types.ObjectId;
  owner: string;
  course?: string;
  state?: string;
  city?: string;
  grade?: string;
  value: number;
  score: number;
  nextFollowUp?: Date | null;
  lastActivity: Date;
  tags: string[];
  notes: ILeadNote[];
  serviceTracks: IServiceTrack[];
  // follow-up tracking
  lastFollowUpType?: string;
  nextFollowUpDate?: Date | null;
  nextFollowUpType?: string;
  followUpCount: number;
}

const noteSchema = new Schema<ILeadNote>(
  {
    text: { type: String, required: true },
    by: { type: String, default: "System" },
    at: { type: Date, default: Date.now },
  },
  { _id: false }
);

const serviceTrackSchema = new Schema<IServiceTrack>(
  {
    service: { type: Schema.Types.ObjectId, ref: "Service", required: true },
    status: { type: Schema.Types.ObjectId, ref: "LeadStatus", default: null },
    subStatus: { type: Schema.Types.ObjectId, ref: "SubStatus", default: null },
    owner: { type: String, default: "Unassigned" },
    value: { type: Number, default: 0 },
    nextFollowUp: { type: Date, default: null },
    isClosed: { type: Boolean, default: false },
    updatedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const leadSchema = new Schema<ILead>(
  {
    tenant: { type: Schema.Types.ObjectId, ref: "Tenant", required: true, index: true },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: String,
    contact: { type: Schema.Types.ObjectId, ref: "Contact" },
    status: { type: Schema.Types.ObjectId, ref: "LeadStatus", required: true },
    subStatus: { type: Schema.Types.ObjectId, ref: "SubStatus", default: null },
    source: { type: Schema.Types.ObjectId, ref: "LeadSource" },
    owner: { type: String, default: "Unassigned" },
    course: String,
    state: { type: String, default: "" },
    city: { type: String, default: "" },
    grade: { type: String, default: "" },
    value: { type: Number, default: 0 },
    score: { type: Number, default: 50 },
    nextFollowUp: { type: Date, default: null },
    lastActivity: { type: Date, default: Date.now },
    tags: { type: [String], default: [] },
    notes: { type: [noteSchema], default: [] },
    serviceTracks: { type: [serviceTrackSchema], default: [] },
    // follow-up tracking
    lastFollowUpType: String,
    nextFollowUpDate: { type: Date, default: null },
    nextFollowUpType: String,
    followUpCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

leadSchema.index({ tenant: 1, phone: 1 });
leadSchema.index({ tenant: 1, status: 1 });
leadSchema.index({ tenant: 1, owner: 1 });

export const Lead = model<ILead>("Lead", leadSchema);
