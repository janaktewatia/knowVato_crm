import { Schema, model, Document, Types } from "mongoose";

/* ---- Module permission shape ---- */
export interface IPermission {
  module: string;
  view: boolean;
  create: boolean;
  edit: boolean;
  del: boolean;
}

export const MODULES = [
  "dashboard", "leads", "followups", "chat", "blast",
  "contacts", "conversion", "setup", "reports", "workflows",
];

/* ---- UserType (a.k.a. role) ---- */
export interface IUserType extends Document {
  tenant: Types.ObjectId;
  name: string;
  desc?: string;
  perms: IPermission[];
}

const permSchema = new Schema<IPermission>(
  {
    module: { type: String, required: true },
    view: { type: Boolean, default: false },
    create: { type: Boolean, default: false },
    edit: { type: Boolean, default: false },
    del: { type: Boolean, default: false },
  },
  { _id: false }
);

const userTypeSchema = new Schema<IUserType>(
  {
    tenant: { type: Schema.Types.ObjectId, ref: "Tenant", required: true, index: true },
    name: { type: String, required: true },
    desc: String,
    perms: { type: [permSchema], default: [] },
  },
  { timestamps: true }
);

export const UserType = model<IUserType>("UserType", userTypeSchema);

/* ---- User ---- */
export interface IUser extends Document {
  tenant: Types.ObjectId;
  name: string;
  email: string;
  passwordHash: string;
  userType: Types.ObjectId;
  designation?: Types.ObjectId | null;
  status: "Active" | "Inactive" | "Pending";
  lastLogin?: Date;
}

const userSchema = new Schema<IUser>(
  {
    tenant: { type: Schema.Types.ObjectId, ref: "Tenant", required: true, index: true },
    name: { type: String, required: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    userType: { type: Schema.Types.ObjectId, ref: "UserType", required: true },
    designation: { type: Schema.Types.ObjectId, ref: "Designation", default: null },
    status: { type: String, enum: ["Active", "Inactive", "Pending"], default: "Active" },
    lastLogin: Date,
  },
  { timestamps: true }
);

userSchema.index({ tenant: 1, email: 1 }, { unique: true });

// never leak the hash
userSchema.set("toJSON", {
  transform: (_doc, ret: any) => {
    delete ret.passwordHash;
    return ret;
  },
});

export const User = model<IUser>("User", userSchema);
