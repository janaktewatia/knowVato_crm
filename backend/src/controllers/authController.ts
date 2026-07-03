import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { User, UserType } from "../models/User";
import { signToken } from "../utils/jwt";
import { ApiError, asyncHandler, ok, audit } from "../utils/http";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = loginSchema.parse(req.body);
  const user = await User.findOne({ email: email.toLowerCase() }).populate("userType");
  if (!user) throw new ApiError(401, "Invalid credentials");
  if (user.status !== "Active") throw new ApiError(403, "Account is not active");

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) throw new ApiError(401, "Invalid credentials");

  user.lastLogin = new Date();
  await user.save();

  const token = signToken({
    uid: String(user._id),
    tenant: String(user.tenant),
    name: user.name,
    email: user.email,
  });

  await audit({ tenant: user.tenant, user: user.name, action: "LOGIN", module: "Auth", entity: user.email });

  ok(res, {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      userType: user.userType,
      tenant: user.tenant,
    },
  });
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.auth!.uid).populate("userType");
  if (!user) throw new ApiError(404, "User not found");
  ok(res, { user, perms: (user.userType as any)?.perms || [] });
});
