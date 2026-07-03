# Knowvato Platform

Turns separately-deployed modules (WhatsApp CRM, Event Management, Website
Builder, …) into one integrated product at `abc.knowvato.in` — with shared
users, permissions and WhatsApp templates, single sign-on, and modules that call
each other over the network.

**Read `docs/ARCHITECTURE.md` first** — it explains every decision and how the
pieces fit. This README is the quick map + run guide.

## What's in here

| Folder | What it is | State |
|---|---|---|
| `docs/ARCHITECTURE.md` | The full integration design | ✅ complete |
| `packages/platform-sdk` | Shared contracts: JWT verify, permission guards, typed Identity/Communication clients, event types. **Every module imports this.** | ✅ builds |
| `services/identity` | Central Identity service — users, roles, permissions, SSO. Issues RS256 JWTs, publishes JWKS. | ✅ builds + seed |
| `gateway` | API Gateway at `api.knowvato.in` — verifies JWTs via JWKS, routes to services, CORS + rate limit. | ✅ builds |
| `services/events-example` | Minimal Event service showing the integration pattern (trusts JWT, enforces perms, sends WhatsApp via shared Communication). | ✅ builds |
| `shell` | Host app at `abc.knowvato.in` — SSO login, permission-aware nav, module host (Module Federation pattern). | ✅ builds |
| Communication service | = the existing **whatsapp-crm-backend** (separate zip), now with a shared `/messages/send` endpoint so any module can send using shared templates. | ✅ builds |

## How the integration actually works

1. **One login.** The shell logs in against Identity (`/identity/auth/login`) and
   gets a JWT carrying the user's `tenant`, `roles` and `perms`.
2. **Everyone trusts that token.** Identity publishes its public key at
   `/.well-known/jwks.json`. The gateway and every service verify tokens
   **offline** — no per-request call to Identity.
3. **One front door.** The browser only ever talks to the gateway
   (`api.knowvato.in`). The gateway checks the JWT, then forwards to the right
   service, passing the verified identity as trusted headers.
4. **Shared templates/users.** WhatsApp templates live in the Communication
   service. Event Management (or any module) sends by calling
   `POST /communication/messages/send` with a template name — the same template
   the CRM created. Users/permissions live in Identity and are respected
   everywhere.
5. **Permission-aware everywhere.** The shell shows only the modules a user may
   see; each service independently enforces `module:action` permissions from the
   token. One model, two enforcement points.

## Run it locally (the integrated flow)

You need MongoDB running. Then, in separate terminals:

```bash
# 1. Identity (issues tokens)
cd services/identity && npm install && npm run genkeys && npm run seed && npm run dev   # :4100

# 2. Communication = the existing WhatsApp CRM backend (separate zip)
cd whatsapp-crm-backend && npm install && npm run seed && npm run dev                    # :4001  (set PORT=4001)

# 3. Events example
cd services/events-example && npm install && npm run dev                                 # :4002

# 4. Gateway (routes + verifies)
cd gateway && npm install && npm run dev                                                 # :4000

# 5. Shell (the unified UI at abc.knowvato.in)
cd shell && npm install && npm run dev                                                   # :5000
```

Open the shell, sign in as `priya@knowvato.in / password123` (Super Admin) and
you'll see every module; sign in as `ananya@knowvato.in` (Counsellor) and the
nav shrinks to what she's allowed — the same permission model the services
enforce. Open Event Management and click **Invite via WhatsApp**: Events calls
Communication, which sends using a shared template. That's the whole platform in
one action.

> Ports above assume Communication on 4001; set `PORT=4001` when starting the
> CRM backend, and the gateway's `COMMUNICATION_URL` already points there.

## Honest scope

This delivery is the **integration backbone**: the SDK, Identity, the gateway,
the shell, and the pattern (proven by the Events example + the CRM-as-Communication
service). The CRM is a full app; the other modules (Events, Website Builder) are
intentionally minimal references so the wiring is clear. Turning each into a
complete product, and wiring true Module Federation remotes, is the next phase —
but the contracts here mean those teams build *into* a working platform rather
than gluing apps together after the fact.

I could not run the full multi-service stack against live MongoDB in the build
environment, so services are verified by TypeScript compilation, app-boot, and
isolated logic tests (the JWT/JWKS SSO mechanism is tested end-to-end). Run the
steps above locally to see the integrated flow.
