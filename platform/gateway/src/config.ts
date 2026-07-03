import dotenv from "dotenv";
dotenv.config();

/**
 * The routing table: which path prefix forwards to which service.
 * In production these targets are internal service URLs (Docker/K8s DNS).
 * `public: true` means no auth required (e.g. login, JWKS).
 */
export interface Route {
  prefix: string;       // gateway path, e.g. "/identity"
  target: string;       // upstream service base URL
  stripPrefix?: boolean; // remove the prefix before forwarding
  publicPaths?: string[]; // sub-paths under prefix that skip auth
}

export const config = {
  port: parseInt(process.env.PORT || "4000", 10),
  jwksUri: process.env.JWKS_URI || "http://localhost:4100/.well-known/jwks.json",
  issuer: process.env.JWT_ISSUER || "https://api.knowvato.in/identity",
  clientOrigins: (process.env.CLIENT_ORIGINS || "*").split(","),

  routes: [
    {
      prefix: "/identity",
      target: process.env.IDENTITY_URL || "http://localhost:4100",
      stripPrefix: true,
      publicPaths: ["/auth/login", "/auth/refresh", "/.well-known/jwks.json", "/health"],
    },
    {
      prefix: "/communication",
      target: process.env.COMMUNICATION_URL || "http://localhost:4001",
      stripPrefix: true,
      // the WhatsApp vendor webhooks must be public (vendors don't carry our JWT)
      publicPaths: ["/webhooks"],
    },
    {
      prefix: "/events",
      target: process.env.EVENTS_URL || "http://localhost:4002",
      stripPrefix: true,
    },
    {
      prefix: "/websitebuilder",
      target: process.env.WEBSITEBUILDER_URL || "http://localhost:4003",
      stripPrefix: true,
    },
  ] as Route[],
};
