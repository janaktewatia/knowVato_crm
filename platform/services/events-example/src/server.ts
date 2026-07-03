import express from "express";
import cors from "cors";

/**
 * Event Management — MINIMAL reference service (a stub that proves the pattern).
 *
 * It shows how ANY module integrates:
 *   1. trusts the platform JWT (forwarded by the gateway as x-user-id / x-perms)
 *   2. enforces permissions from those claims
 *   3. calls the shared Communication service to send WhatsApp using a template
 *      that was created once, centrally — not duplicated here.
 *
 * This is intentionally small: events live in memory. Replace with a real DB +
 * full CRUD for production. The point is the integration wiring.
 */

const app = express();
app.use(cors());
app.use(express.json());

const PORT = parseInt(process.env.PORT || "4002", 10);
const COMMUNICATION_URL = process.env.COMMUNICATION_URL || "http://localhost:4001/api";

// in-memory events (demo only)
const events: any[] = [
  { id: "ev1", tenant: "knowvato", title: "Open House — Class XI", date: "2026-07-12", invited: 0 },
];

// trust gateway-forwarded identity headers
function ctx(req: any) {
  return {
    userId: req.headers["x-user-id"],
    tenant: req.headers["x-tenant"] || "knowvato",
    perms: String(req.headers["x-perms"] || "").split(",").filter(Boolean),
  };
}
const can = (perms: string[], p: string) => perms.includes(p) || perms.includes("*");

app.get("/health", (_req, res) => res.json({ ok: true, service: "events" }));

app.get("/events", (req, res) => {
  const c = ctx(req);
  if (!can(c.perms, "events:view")) return res.status(403).json({ ok: false, error: "Forbidden" });
  res.json({ ok: true, data: events.filter((e) => e.tenant === c.tenant) });
});

app.post("/events", (req, res) => {
  const c = ctx(req);
  if (!can(c.perms, "events:create")) return res.status(403).json({ ok: false, error: "Forbidden" });
  const ev = { id: "ev" + (events.length + 1), tenant: c.tenant, invited: 0, ...req.body };
  events.push(ev);
  res.status(201).json({ ok: true, data: ev });
});

/**
 * The integration highlight: invite attendees to an event by sending a WhatsApp
 * message through the SHARED Communication service, using a SHARED template.
 * Events doesn't own templates or WhatsApp — it borrows them via the platform.
 */
app.post("/events/:id/invite", async (req, res) => {
  const c = ctx(req);
  if (!can(c.perms, "events:edit")) return res.status(403).json({ ok: false, error: "Forbidden" });
  if (!can(c.perms, "communication:send")) return res.status(403).json({ ok: false, error: "Need communication:send" });

  const ev = events.find((e) => e.id === req.params.id);
  if (!ev) return res.status(404).json({ ok: false, error: "Event not found" });

  const { phones = [], template = "campus_visit_invite" } = req.body || {};
  const token = (req.headers.authorization || "").replace("Bearer ", "");

  const results: any[] = [];
  for (const to of phones) {
    try {
      const r = await fetch(`${COMMUNICATION_URL}/messages/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ channel: "whatsapp", to, template, params: [ev.title, ev.date] }),
      });
      const j: any = await r.json();
      results.push({ to, ok: r.ok, id: j?.data?.waMessageId });
    } catch (e: any) {
      results.push({ to, ok: false, error: e.message });
    }
  }
  ev.invited += results.filter((x) => x.ok).length;
  res.json({ ok: true, data: { event: ev.id, sent: results } });
});

app.listen(PORT, () => console.log(`[events] http://localhost:${PORT} (calls Communication at ${COMMUNICATION_URL})`));
