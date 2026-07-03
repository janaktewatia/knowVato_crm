import jwt from "jsonwebtoken";
import crypto from "crypto";
import { config } from "./config";
import { User, Role } from "./models";

/** Resolve a user's effective permissions by unioning their roles' perms. */
export async function resolvePerms(userId: string): Promise<{ roles: string[]; perms: string[] }> {
  const user = await User.findById(userId).populate("roles");
  if (!user) return { roles: [], perms: [] };
  const roleDocs = (user.roles as any[]) || [];
  const roles = roleDocs.map((r) => r.name);
  const perms = [...new Set(roleDocs.flatMap((r) => r.perms || []))];
  return { roles, perms };
}

export async function signAccessToken(user: any): Promise<string> {
  const { roles, perms } = await resolvePerms(String(user._id));
  return jwt.sign(
    { sub: String(user._id), tenant: user.tenant, name: user.name, email: user.email, roles, perms },
    config.privateKey,
    { algorithm: "RS256", expiresIn: config.accessTtl, issuer: config.issuer, keyid: config.keyId } as jwt.SignOptions
  );
}

export function signRefreshToken(user: any): string {
  return crypto.randomBytes(40).toString("hex");
}

/** Build the JWKS (public key in JWK form) so other services verify offline. */
export function buildJwks() {
  const keyObject = crypto.createPublicKey(config.publicKey);
  const jwk: any = keyObject.export({ format: "jwk" });
  return {
    keys: [
      { ...jwk, kid: config.keyId, use: "sig", alg: "RS256" },
    ],
  };
}
