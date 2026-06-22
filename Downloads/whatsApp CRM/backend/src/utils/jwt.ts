import jwt from "jsonwebtoken";
import { config } from "../config";

export interface JwtPayload {
  uid: string;
  tenant: string;
  name: string;
  email: string;
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, config.jwtSecret, { expiresIn: config.jwtExpires } as jwt.SignOptions);
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, config.jwtSecret) as JwtPayload;
}
