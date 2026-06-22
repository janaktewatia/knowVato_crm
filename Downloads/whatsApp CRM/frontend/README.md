# WhatsApp CRM — Frontend (React + Bootstrap)

The web client for the WhatsApp Business Suite + Admissions CRM. Built with
**React + Vite + Bootstrap 5**, it talks to the Node/Express/MongoDB backend over
HTTP — every action (create a lead, change status, send a message, switch
WhatsApp vendor) is saved to the database, not the browser.

## Run it (with the backend)

You need the backend running first. In **two terminals**:

**Terminal 1 — backend**
```bash
cd backend
cp .env.example .env
docker compose up -d mongo redis     # or your own MongoDB
npm install
npm run seed                         # demo data + demo users
npm run dev                          # API on http://localhost:4000
```

**Terminal 2 — frontend**
```bash
cd frontend
cp .env.example .env                 # leave VITE_API_BASE blank to use the dev proxy
npm install
npm run dev                          # app on http://localhost:5173
```

Open http://localhost:5173 and log in:

| Email | Password | Role |
|---|---|---|
| priya@greenwood.edu | password123 | Administrator (sees everything) |
| ananya@greenwood.edu | password123 | Counsellor (limited menu — permissions enforced) |

Log in as the counsellor to see role-based permissions in action: the sidebar
only shows modules they can view, and edit/delete buttons disappear where they
lack rights — all driven by the backend's permission matrix.

## How it connects

- `src/api/client.js` — fetch wrapper; attaches the JWT, parses the `{ok,data}`
  envelope, clears the token on 401.
- `src/api/index.js` — one function per backend endpoint.
- `src/context/AuthContext.jsx` — login/logout, current user, `can(module,action)`.
- In dev, `vite.config.js` proxies `/api` → `http://localhost:4000`, so there are
  no CORS hurdles. For production, set `VITE_API_BASE` to your API origin and the
  backend's `CLIENT_ORIGIN` to your web origin.

## What's wired (all persist to MongoDB)
- **Auth** — JWT login, permission-gated nav and actions
- **Dashboard** — live KPIs and funnel from the API
- **Leads** — list/filter/search, add, status change (fires follow-up rule),
  notes, detail drawer
- **Follow-ups** — Overdue/Today/Upcoming/Done, complete, reschedule
- **Conversion** — funnel + win-rate by source/counsellor
- **Contacts** — CRUD
- **Conversations** — 1:1 chat (user-initiated), 24h-window enforced, reply,
  send template, convert to lead
- **Campaigns** — create, launch (routes through the active WhatsApp vendor), pause
- **Message History** — delivery log, filters, convert inbound to lead
- **Templates** — list, create
- **Setup** — lead statuses (colour + follow-up rule), sub-statuses, sources,
  user types & permission matrix, users, **WhatsApp accounts (multi-vendor, one
  active)**, integrations
- **Audit** — every change recorded

## Build for production
```bash
npm run build      # outputs static files to dist/
npm run preview    # serve the build locally to check
```
Serve `dist/` from any static host (Netlify, S3+CloudFront, Nginx) and point it
at your deployed API via `VITE_API_BASE`.

## Notes / limitations
- This is the connected app foundation; some demo-only flourishes from the
  earlier static prototype (kanban drag, chatbot builder canvas) aren't part of
  this build — the focus here is real persistence end-to-end.
- No automated tests yet; verify by running both apps and watching MongoDB.
