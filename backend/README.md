# WhatsApp Business Suite + Admissions CRM — Backend API

A runnable Node + TypeScript + Express + MongoDB backend for the WhatsApp CRM
demo: authentication, role-based permissions, the full CRM data model (leads,
follow-ups, masters, contacts), WhatsApp messaging (campaigns, 1:1
conversations, delivery logs), a WhatsApp Cloud API integration layer, and
conversion analytics.

> **Status — read this first.** This is a solid, working **foundation**, not a
> finished SaaS product. The API runs, the data model is real, auth and
> permissions work, and the messaging pipeline works end-to-end in
> **simulation mode**. Sending/receiving *real* WhatsApp messages requires your
> own Meta WhatsApp Cloud API credentials and a verified WhatsApp Business
> Account (see "Going live"). Production hardening (tests, real-time sockets,
> billing, full integrations, scaling) is the remaining work described in the
> blueprint document.

---

## Quick start

### Option A — Docker (easiest)
```bash
cp .env.example .env
docker compose up -d mongo redis      # start datastores
npm install
npm run seed                          # load demo data
npm run dev                           # API on http://localhost:4000
```

### Option B — local Mongo
Have MongoDB running locally (or use MongoDB Atlas and set `MONGO_URI`), then:
```bash
cp .env.example .env
npm install
npm run seed
npm run dev
```

Then open `requests.http` (VS Code REST Client) or hit the API with curl/Postman.

### Demo logins (after seeding)
| Email | Password | Role |
|---|---|---|
| priya@greenwood.edu | password123 | Administrator (full access) |
| rahul@greenwood.edu | password123 | Admissions Manager |
| ananya@greenwood.edu | password123 | Counsellor (limited permissions) |
| megha@greenwood.edu | password123 | Read-only (inactive — can't log in) |

```bash
# get a token
curl -s localhost:4000/api/auth/login -H 'content-type: application/json' \
  -d '{"email":"priya@greenwood.edu","password":"password123"}'
```

---

## Connecting WhatsApp — multiple vendors, one active

You don't hardcode a single WhatsApp provider. A tenant can **configure several
vendor accounts** (Meta direct, Pinnacle, Gupshup, Twilio, …) and mark **exactly
one as active**. All sending/receiving routes through whichever is active.
Switching vendors is a setting (`activate`), not a code change — useful when a
company holds WhatsApp commercial accounts from different vendors.

**How it's built**
- `src/services/providers/types.ts` — the `WhatsAppProvider` contract every
  vendor implements (`sendTemplate`, `sendText`, `verifyWebhook`, `parseInbound`).
- `src/services/providers/` — `simulationProvider`, `metaProvider`,
  `pinnacleProvider` (stub, ready for their API doc). Add more by dropping in a
  new file and one line in `registry.ts`.
- `models/WhatsAppAccount.ts` — stored vendor configs with an `active` flag
  (secrets are masked in API responses).
- `services/providers/registry.ts` — resolves the active provider per tenant
  (30s cache) and enforces "only one active".
- `services/whatsapp.ts` — thin tenant-aware facade the app calls; it delegates
  to the active provider, falling back to simulation if the active vendor isn't
  fully configured.

**Managing accounts (Setup permission required)**
| method | route | purpose |
|---|---|---|
| GET | `/api/whatsapp-accounts` | list configured vendor accounts |
| POST | `/api/whatsapp-accounts` | add a vendor account (first one auto-activates) |
| PATCH | `/api/whatsapp-accounts/:id` | edit credentials/label |
| DELETE | `/api/whatsapp-accounts/:id` | remove |
| POST | `/api/whatsapp-accounts/:id/activate` | make this the active one (deactivates others) |

**Webhooks are per-tenant:** each account points its callback at
`/webhooks/whatsapp/:tenantId`. The receiver uses that tenant's active provider
to verify the signature and parse the payload, so the same endpoint serves Meta,
Pinnacle, or any vendor.

### Adding Pinnacle (or any BSP)
`pinnacleProvider.ts` is a working skeleton with every vendor-specific spot
marked `▶ FROM PINNACLE DOC`. When you share Pinnacle's API documentation, only
that one file needs filling in (send endpoint + body shape, auth header, webhook
payload shape, signature scheme). Then create a Pinnacle account via the API
with its `apiBaseUrl`, `apiKey`, and `senderNumber`, and activate it. Nothing
else in the system changes.

What you collect from any BSP vendor: **API key/token**, **base API URL**,
**sender number / WABA id**, the **webhook URL** to register
(`/webhooks/whatsapp/<tenantId>`), and any **webhook signature secret**.

---

## What's included

**Auth & security**
- JWT login, `GET /auth/me`, bcrypt password hashing
- Role-based permissions enforced **server-side** per module + action
  (view/create/edit/delete) — the demo's permission matrix is authoritative here
- Multi-tenant: every record carries a `tenant` and every query is tenant-scoped
- Helmet, CORS, rate limiting

**CRM**
- Leads: list/filter/search, kanban-ready, convert, **status change that applies
  the "follow-up required" master rule**, notes, ownership
- Follow-ups: Overdue / Today / Upcoming / Done buckets, complete, reschedule
- Contacts: CRUD, tags, opt-in, lifecycle, value
- Masters (Setup): lead statuses (colour + follow-up rule + won/lost),
  sub-statuses, sources
- Users & roles: user types with full permission matrices, users
- Integrations: connect/disconnect records (WhatsApp, Facebook, Google Forms,
  Email, SMS, API…)

**WhatsApp messaging**
- Templates
- Campaigns with a **queue-based sender** (BullMQ + Redis) and an inline
  fallback; rate-limited worker to respect Meta's messaging tier
- Delivery log (`messages`) with status lifecycle (sent → delivered → read /
  failed); in simulation mode it auto-advances so funnels populate
- 1:1 conversations on the **WABA model**: user-initiated only, with the
  **24-hour service window enforced** (free-form text blocked once it closes;
  templates still allowed)
- Cloud API service (`src/services/whatsapp.ts`): real `sendTemplate` /
  `sendText` / webhook signature verification, with a simulation fallback
- Webhook receiver (`/webhooks/whatsapp`): verification handshake + status
  receipts + inbound messages
- Convert an inbound reply into a lead

**Analytics**
- `GET /api/conversion/stats`: funnel by status, win-rate by source and by owner

---

## Project structure
```
src/
  config/        env + db connection
  models/        Mongoose schemas (Tenant, User, Lead, FollowUp, Masters, Messaging, System)
  middleware/    auth, permission guard, error handler
  services/      whatsapp (Cloud API), leadService, campaignService
  controllers/   auth, lead, followUp, messaging + generic CRUD factory
  routes/        api routes (+ permissions) and public webhooks
  jobs/          BullMQ campaign worker
  seed/          demo data seeder
  app.ts         express assembly
  server.ts      entry point
```

---

## Going live with real WhatsApp

1. Create a Meta Business account and complete **business verification**.
2. Create a WhatsApp Business Account (WABA) + phone number; get the display
   name approved.
3. Create a Meta app with `whatsapp_business_messaging` +
   `whatsapp_business_management`.
4. Fill `.env`:
   ```
   WHATSAPP_MODE=live
   WHATSAPP_PHONE_NUMBER_ID=...
   WHATSAPP_ACCESS_TOKEN=...
   WHATSAPP_APP_SECRET=...
   WHATSAPP_VERIFY_TOKEN=...        # any string; must match Meta config
   ```
5. Point the Meta webhook to `https://YOUR_DOMAIN/webhooks/whatsapp` and
   subscribe to `messages`. The GET handshake uses your verify token; POSTs are
   signature-verified with the app secret.
6. Create + submit templates for approval (the `templates` collection mirrors
   Meta; full create/submit/sync against the Graph API is a follow-on task).

Until step 4 is done, everything runs in **simulation mode** — safe to demo, no
real messages sent.

---

## Honest limitations / next steps
- **No automated tests yet** — add Jest + supertest.
- **Webhook → tenant mapping** is simplified (resolve by `phone_number_id` in
  real multi-tenant use).
- **Template create/submit/sync** with Meta is stubbed (records exist; Graph
  sync not wired).
- **No real-time** (add WebSockets/SSE for the live inbox).
- **No billing/metering, file/media upload, or the long tail of integrations.**
- Campaign audience resolution is a simple opt-in/category query; wire it to the
  segment rules for production.

These are exactly the items in the production blueprint's roadmap.

---

## Scripts
| command | does |
|---|---|
| `npm run dev` | start API with hot reload |
| `npm run seed` | wipe + load demo data |
| `npm run worker` | start the campaign queue worker (needs Redis + `USE_QUEUE=true`) |
| `npm run build` | compile TypeScript to `dist/` |
| `npm start` | run compiled server |
