import jwt from "jsonwebtoken";
import { JwtClaims, Permission } from "./types";

/**
 * Token verification for any service.
 *
 * Two modes:
 *  - JWKS (production): fetch the Identity service's public key by `kid` and
 *    verify RS256 signatures offline. No per-request call to Identity.
 *  - Shared secret (dev): verify HS256 with a symmetric secret.
 *
 * The middleware is framework-light (Express-style req/res/next) but only relies
 * on req.headers + attaching req.auth, so it adapts easily.
 */

export interface VerifierOptions {
  // production
  jwksUri?: string;          // e.g. https://api.knowvato.in/identity/.well-known/jwks.json
  issuer?: string;
  // dev fallback
  devSecret?: string;
}

type Req = { headers: Record<string, any>; auth?: JwtClaims };
type Res = { status: (n: number) => { json: (b: any) => void } };
type Next = (err?: any) => void;

export function createAuth(opts: VerifierOptions) {
  // lazy JWKS client so the package doesn't require the dep unless used
  let jwksClient: any = null;
  async function getKey(kid: string): Promise<string> {
    if (!jwksClient) {
      const mod = await import("jwks-rsa");
      jwksClient = (mod as any).default({ jwksUri: opts.jwksUri!, cache: true, rateLimit: true });
    }
    const key = await jwksClient.getSigningKey(kid);
    return key.getPublicKey();
  }

  async function verify(token: string): Promise<JwtClaims> {
    if (opts.jwksUri) {
      const decoded: any = jwt.decode(token, { complete: true });
      const kid = decoded?.header?.kid;
      const pub = await getKey(kid);
      return jwt.verify(token, pub, { algorithms: ["RS256"], issuer: opts.issuer }) as JwtClaims;
    }
    // dev
    return jwt.verify(token, opts.devSecret || "dev-secret", { algorithms: ["HS256"] }) as JwtClaims;
  }

  // Express-style middleware
  const authenticate = async (req: Req, res: Res, next: Next) => {
    try {
      const header = req.headers["authorization"] || "";
      const token = header.startsWith("Bearer ") ? header.slice(7) : null;
      if (!token) return res.status(401).json({ ok: false, error: "Missing token" });
      req.auth = await verify(token);
      next();
    } catch (e: any) {
      res.status(401).json({ ok: false, error: "Invalid token: " + e.message });
    }
  };

  return { verify, authenticate };
}

/** Permission guard usable after authenticate(). */
export function requirePerm(...needed: Permission[]) {
  return (req: Req, res: Res, next: Next) => {
    const have = req.auth?.perms || [];
    const ok = needed.every((p) => have.includes(p) || have.includes("*"));
    if (!ok) return res.status(403).json({ ok: false, error: `Forbidden: need ${needed.join(", ")}` });
    next();
  };
}

export function hasPerm(claims: JwtClaims | undefined, perm: Permission): boolean {
  const have = claims?.perms || [];
  return have.includes(perm) || have.includes("*");
}
