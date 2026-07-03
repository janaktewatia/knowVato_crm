# Knowvato Platform — Integration Architecture

How separate modules (Event Management, WhatsApp CRM, Website Builder, …),
each live on its own subdomain, combine into one product at `abc.knowvato.in`,
share users/permissions/templates, and talk to each other — while still being
deployed independently.

---

## 1. The shape

```
                         abc.knowvato.in
                      ┌────────────────────┐
                      │   SHELL (host)     │  one nav, one login, one theme
                      │  Module Federation │
                      └─────────┬──────────┘
        loads remote UI at runtime from each module's subdomain
   ┌───────────────┬───────────┼────────────┬──────────────────┐
   ▼               ▼           ▼            ▼                  ▼
event.knowvato  whatsapp.    websitebuilder  (more…)      each is a
   (remote UI)   (remote UI)   (remote UI)                normal app too
   │               │             │
   └─── all backend calls go through ───┐
                                         ▼
                          api.knowvato.in  (GATEWAY)
            routes + verifies JWT + forwards to the right service
   ┌──────────────┬───────────────┬──────────────┬───────────────┐
   ▼              ▼               ▼              ▼               ▼
 IDENTITY     COMMUNICATION     EVENTS       WEBSITES        (more…)
 (users,      (WhatsApp accts,  service      service
  roles,       templates,
  permissions, sending,
  SSO/JWKS)    other channels)
```

Two kinds of building block:

- **Central (shared) services** — own things every module needs:
  - **Identity**: users, roles, permissions, SSO. The single source of truth for
    "who is this and what may they do."
  - **Communication**: WhatsApp accounts + **templates**, plus email/SMS later.
    A template created here is visible to *every* module. (This is the existing
    WhatsApp CRM backend, promoted to a shared service.)
- **Module services** — own their domain: Events owns events, Website Builder
  owns sites, CRM owns leads. They **call** the central services; they never copy
  users or templates into their own DB.

---

## 2. Why these choices (industry-standard for this scenario)

| Decision | Choice | Why |
|---|---|---|
| Unify the UI | **Micro-frontends (Module Federation)** | Each module deploys on its own subdomain yet renders inside one shell at runtime. Independent teams, one product. |
| Shared data | **Shared kernel (Identity + Communication) + bounded contexts** | Users and templates must be defined once; everything else stays decoupled. Avoids both duplicated-users chaos and one-giant-DB coupling. |
| Auth / SSO | **Central Identity issues JWTs; everyone verifies via JWKS** | One login across all subdomains; any service validates a token offline using the public key. Swappable for Auth0/Keycloak later. |
| Service-to-service | **HTTP APIs now; events (a broker) for fan-out later** | Synchronous calls are simple and enough to start; add a message broker when you need "template updated → notify all modules." |
| Front door | **API Gateway** | One origin for the browser, central JWT check, routing, rate limiting, CORS. Modules don't each re-implement this. |

---

## 3. How a request flows (concrete)

**A counsellor in Event Management sends a WhatsApp invite using a template:**

1. User is already logged in (shell did SSO; browser holds a JWT).
2. Event UI (loaded in the shell) calls
   `POST api.knowvato.in/communication/messages` with the token.
3. Gateway verifies the JWT (via Identity's JWKS) and forwards to the
   **Communication** service.
4. Communication checks the caller's permission (`communication:send`), looks up
   the **template** (the same record the CRM created), and sends through the
   active WhatsApp vendor.
5. Delivery webhooks land back on Communication; any module can read status.

The template was authored once in Communication; Event, CRM, and Website Builder
all see and use it. Same pattern for users and permissions via Identity.

---

## 4. Single sign-on across subdomains

- Identity hosts `/auth/login` and publishes its public key at
  `/.well-known/jwks.json`.
- On login the browser receives a JWT (and a refresh token). It's stored so all
  subdomains under `*.knowvato.in` can use it (shared cookie on the parent domain
  **or** the shell passing the token to remotes at load).
- Every service verifies tokens **offline** with the cached JWKS — no network
  call per request. Tokens carry `sub` (user id), `tenant`, and `perms`/`roles`.
- Logout / rotation is handled centrally; short-lived access tokens + refresh.

---

## 5. Permissions, one model everywhere

Identity defines **roles** with a permission matrix keyed by
`module:action` (e.g. `events:create`, `communication:send`,
`crm.leads:edit`). The JWT carries the resolved permissions. Both the **shell**
(to show/hide modules and nav) and each **service** (to allow/deny an action)
read the same list. The CRM's existing `can(module, action)` model generalises
directly to this.

---

## 6. The shared SDK

`@knowvato/platform-sdk` (in `packages/platform-sdk`) is the contract every
module imports so they all talk the same way:

- `verifyToken()` / `requirePerm()` middleware for services.
- A typed **Communication client** (`templates.list()`, `messages.send()`) and
  **Identity client** (`users.get()`, `me()`).
- Shared event names + payload types for when you add a broker.

This is what makes integration "smooth": modules don't hand-roll auth or
guess each other's APIs — they import the SDK.

---

## 7. What exists in this delivery vs. what's a contract

**Built & runnable:** the architecture, the shared SDK, the Identity service
(auth + users + roles + JWKS), the API Gateway (JWT verify + routing), and the
plan to promote the existing WhatsApp CRM backend into the Communication service.

**Documented contracts + stubs (not full apps):** Event Management, Website
Builder UIs, and the Module-Federation shell wiring. These are specified so your
teams (or a later iteration) implement them against the same contracts.

**Honest scope:** a full five-module federated platform is a multi-month, team
effort. This delivery gives you the *backbone and the contracts* so the separate
projects can actually talk — not five finished products.

---

## 8. Deploy view

| Piece | Subdomain | Notes |
|---|---|---|
| Shell (host) | `abc.knowvato.in` | Loads remotes; the unified entry point |
| API Gateway | `api.knowvato.in` | Single browser origin for all backends |
| Identity | internal (via gateway) | + public `jwks.json` |
| Communication | internal (via gateway) | the promoted WhatsApp CRM backend |
| Event module | `event.knowvato.in` | remote UI + its service |
| WhatsApp CRM | `whatsapp.knowvato.in` | remote UI + uses Communication |
| Website Builder | `websitebuilder.knowvato.in` | remote UI + its service |

Each remote is also a standalone app on its own subdomain — the shell just
composes them.
