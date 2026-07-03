# Start Here — the calm version

You don't need to hold anything in your head. Do these steps in order, once.
After the first time, starting everything is **one command**.

---

## The folder layout this expects

Put all the projects as **siblings** in one parent folder. Unzip each one here:

```
knowvato/
├── launcher/      ← this folder (you run commands from here)
├── backend/       ← from whatsapp-crm-backend.zip  (the Communication / CRM API)
├── frontend/      ← from whatsapp-crm-frontend.zip  (the CRM screens)
└── platform/      ← from knowvato-platform.zip
```

If your folders are named differently, either rename them to match, or edit the
paths at the top of `launcher/setup.js`. That's the only place paths live.

---

## First time only (3 steps)

Open a terminal **in the `launcher` folder**, then:

```
npm run setup
```
This installs every project, writes all the `.env` files with the right ports,
and generates the security keys. Grab a coffee — it takes a few minutes.

```
npm run mongo
```
Starts MongoDB in Docker. (If you don't use Docker, just have MongoDB running
some other way — the default connection is `mongodb://127.0.0.1:27017`.)

```
npm run seed
```
Fills the databases with demo users and data so you can log in.

---

## Every time after that (1 command)

```
npm start
```

That's it. This launches all six pieces at once, each with a coloured label in
the same terminal so you can read their logs. Wait until you see them settle,
then open:

**→ http://localhost:5000**

Log in: **priya@knowvato.in** / **password123**

To stop everything: press **Ctrl + C** once in that terminal.

---

## Opening it all in VS Code (one window)

Double-click **`knowvato.code-workspace`** (in the parent folder), or in VS Code:
`File → Open Workspace from File…` and pick it. You'll see every project in the
left sidebar in one window. Open a terminal (`Ctrl + ` `` ` ``), make sure it's in
the `launcher` folder, and use the commands above.

---

## What's running, and where (you don't need to memorise this)

| Piece | URL | What it does |
|---|---|---|
| Shell | http://localhost:5000 | The unified app — **this is the one you open** |
| Gateway | http://localhost:4000 | Front door; routes to services |
| Identity | http://localhost:4100 | Login + users + permissions |
| Communication / CRM | http://localhost:4001 | WhatsApp, templates, leads |
| Events (example) | http://localhost:4002 | Demo module |
| CRM Frontend (standalone) | http://localhost:5173 | The CRM on its own (optional) |

---

## If something goes wrong (the 4 usual suspects)

Almost every problem is one of these — check in this order:

1. **"Cannot connect to MongoDB"** → MongoDB isn't running. Run `npm run mongo`.
2. **"Cannot find module" / crashes on start** → that project didn't install.
   Re-run `npm run setup`, or `cd` into that one project and run `npm install`.
3. **Login fails / no data** → you haven't seeded. Run `npm run seed`.
4. **Gateway says "JWKS unavailable"** → Identity wasn't up yet. It recovers on
   its own once Identity is running; or just `Ctrl+C` and `npm start` again.

If it's none of these, copy the red error text from the terminal and ask — the
error almost always names the exact project and reason.

---

## One honest note
These projects were verified to compile and boot, but the full multi-service
stack hasn't been run together against a live database yet — your first
`npm start` is the real test. If a piece complains, it's almost certainly one of
the four things above, not a deep problem. Take it one line at a time; you've got
this.
