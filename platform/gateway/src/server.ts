import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import jwt from "jsonwebtoken";
import { JwksClient } from "jwks-rsa";
import { createProxyMiddleware } from "http-proxy-middleware";
import { config, Route } from "./config";

const app = express();
app.use(helmet());
app.use(cors({ origin: config.clientOrigins[0] === "*" ? true : config.clientOrigins, credentials: true }));
app.use(rateLimit({ windowMs: 60_000, max: 1200, standardHeaders: true, legacyHeaders: false }));

/* ---- JWKS-based token verification (offline, cached) ---- */
const jwks = new JwksClient({ jwksUri: config.jwksUri, cache: true, rateLimit: true });
function getKey(header: any, cb: any) {
  jwks.getSigningKey(header.kid, (err, key) => {
    if (err) return cb(err);
    cb(null, key!.getPublicKey());
  });
}
function verify(token: string): Promise<any> {
  return new Promise((resolve, reject) => {
    jwt.verify(token, getKey, { algorithms: ["RS256"], issuer: config.issuer }, (err, decoded) =>
      err ? reject(err) : resolve(decoded)
    );
  });
}

function isPublic(route: Route, urlPath: string): boolean {
  // urlPath still includes the prefix here
  const sub = urlPath.slice(route.prefix.length) || "/";
  return (route.publicPaths || []).some((p) => sub === p || sub.startsWith(p));
}

app.get("/health", (_req, res) => res.json({ ok: true, service: "gateway", routes: config.routes.map((r) => r.prefix) }));

/* ---- wire each route: auth gate (unless public) then proxy ---- */
for (const route of config.routes) {
  const authGate = async (req: any, res: any, next: any) => {
    if (isPublic(route, req.originalUrl.split("?")[0])) return next();
    const h = req.headers.authorization || "";
    const token = h.startsWith("Bearer ") ? h.slice(7) : null;
    if (!token) return res.status(401).json({ ok: false, error: "Missing token" });
    try {
      const claims = await verify(token);
      // forward identity to the upstream service as trusted headers
      req.headers["x-user-id"] = claims.sub;
      req.headers["x-tenant"] = claims.tenant;
      req.headers["x-perms"] = (claims.perms || []).join(",");
      next();
    } catch (e: any) {
      res.status(401).json({ ok: false, error: "Invalid token: " + e.message });
    }
  };

  const proxy = createProxyMiddleware({
    target: route.target,
    changeOrigin: true,
    pathRewrite: route.stripPrefix ? { [`^${route.prefix}`]: "" } : undefined,
    on: {
      proxyReq: (proxyReq: any, req: any) => {
        // pass the original bearer through too (services may re-verify via SDK)
        if (req.headers.authorization) proxyReq.setHeader("authorization", req.headers.authorization);
      },
      error: (_err: any, _req: any, res: any) => {
        if (res && !res.headersSent) res.writeHead?.(502, { "Content-Type": "application/json" });
        res?.end?.(JSON.stringify({ ok: false, error: `Upstream ${route.prefix} unavailable` }));
      },
    },
  } as any);

  app.use(route.prefix, authGate, proxy);
  console.log(`[gateway] ${route.prefix}  ->  ${route.target}${route.stripPrefix ? " (strip)" : ""}`);
}

app.listen(config.port, () => {
  console.log(`[gateway] http://localhost:${config.port}  (verifying JWTs via ${config.jwksUri})`);
});
