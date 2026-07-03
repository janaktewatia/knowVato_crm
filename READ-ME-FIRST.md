# Knowvato — Complete Project

Everything in one folder, ready to open in VS Code and run. This contains the
WhatsApp CRM (backend + frontend), the microservices platform, a one-command
launcher, and the UI design rules.

```
knowvato-complete/
├── knowvato.code-workspace   ← double-click to open ALL projects in one VS Code window
├── PROJECT_THEME_RULES.md    ← the "Indigo Slate ERP" design system (follow for all UI)
├── launcher/                 ← run commands from here (one command starts everything)
├── backend/                  ← Communication / WhatsApp CRM API
├── frontend/                 ← CRM screens (now themed Indigo Slate ERP)
└── platform/                 ← Identity, Gateway, Shell, Events, SDK
```

## Open in VS Code
Double-click **`knowvato.code-workspace`** — or in VS Code, `File → Open Workspace
from File…` and pick it. Every project shows in the sidebar in one window.

## Run it (first time)
Open a terminal in the **launcher** folder, then:

```
npm run setup     # installs every project, writes .env files, makes keys (~few min)
npm run mongo     # starts MongoDB in Docker (or run your own MongoDB)
npm run seed      # fills demo users + data (incl. multi-service leads, email templates)
npm start         # launches everything at once
```

Then open **http://localhost:5000** and sign in:
`priya@knowvato.in` / `password123` (Super Admin — sees everything).

## Run just the CRM (simplest, to see the new UI)
If you only want to see the themed CRM:

```
# terminal 1 — API
cd backend && npm install && npm run seed && npm run dev        # needs MongoDB

# terminal 2 — UI
cd frontend && npm install && npm run dev                       # http://localhost:5173
```

Login on the CRM: `priya@greenwood.edu` / `password123`.

## The UI theme
The CRM frontend now uses the **Indigo Slate ERP** design system from
`PROJECT_THEME_RULES.md`: rich indigo primary, near-white background, an
always-dark navy-indigo sidebar, semantic status colours, 14px card radius,
system font. The theme lives in `frontend/src/styles.css` as CSS variables, so
the whole app re-skins from one place.

## Honest notes
- Run `npm install` in each project the first time (the launcher's `npm run setup`
  does this for all of them at once). The zips ship without `node_modules`.
- You need MongoDB running, or the API/Identity services won't start.
- On Windows, inline `PORT=4001` fails — the launcher handles this via `.env`
  files, so prefer `npm run setup` + `npm start` over manual port commands.
- Everything here compiles and boots, but the full multi-service stack hasn't
  been run together against a live database in the build environment — your first
  `npm start` is the real integration test. If a piece complains, it's almost
  always: Mongo not running, a project not installed, or not seeded.

See `launcher/README.md` for a calmer step-by-step and a troubleshooting list.
