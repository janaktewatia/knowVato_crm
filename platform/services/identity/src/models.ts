import { Schema, model, Document, Types } from "mongoose";

/** A role groups permissions. Permissions are "module:action" strings. */
export interface IRole extends Document {
  tenant: string;
  name: string;
  description?: string;
  perms: string[]; // e.g. ["events:view","communication:send","crm.leads:edit"]
  builtIn?: boolean;
}
const roleSchema = new Schema<IRole>(
  {
    tenant: { type: String, required: true, index: true },
    name: { type: String, required: true },
    description: String,
    perms: { type: [String], default: [] },
    builtIn: { type: Boolean, default: false },
  },
  { timestamps: true }
);
export const Role = model<IRole>("Role", roleSchema);

export interface IUser extends Document {
  tenant: string;
  name: string;
  email: string;
  passwordHash: string;
  roles: Types.ObjectId[];
  status: "Active" | "Inactive";
  lastLogin?: Date;
}
const userSchema = new Schema<IUser>(
  {
    tenant: { type: String, required: true, index: true },
    name: { type: String, required: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    roles: [{ type: Schema.Types.ObjectId, ref: "Role" }],
    status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
    lastLogin: Date,
  },
  { timestamps: true }
);
userSchema.index({ tenant: 1, email: 1 }, { unique: true });
userSchema.set("toJSON", { transform: (_d, r: any) => { delete r.passwordHash; return r; } });
export const User = model<IUser>("User", userSchema);

/** Refresh tokens (for rotation / revocation). */
export interface IRefresh extends Document {
  user: Types.ObjectId;
  token: string;
  expiresAt: Date;
  revoked: boolean;
}
const refreshSchema = new Schema<IRefresh>({
  user: { type: Schema.Types.ObjectId, ref: "User", index: true },
  token: { type: String, index: true },
  expiresAt: Date,
  revoked: { type: Boolean, default: false },
});
export const Refresh = model<IRefresh>("Refresh", refreshSchema);
