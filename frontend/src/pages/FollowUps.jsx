import { useState } from "react";
import { followUpsApi } from "../api";
import { useApi } from "../hooks/useApi";
import { useToast } from "../context/ToastContext";
import { PageHeader, Spinner, ErrorBox, EmptyState } from "../components/ui";

const ICON = { Call: "telephone", WhatsApp: "whatsapp", Email: "envelope", Visit: "geo-alt" };

export default function FollowUps() {
  const toast = useToast();
  const [bucket, setBucket] = useState("today");
  const fu = useApi(() => followUpsApi.buckets(), []);

  async function complete(id) {
    try { await followUpsApi.complete(id, "Completed"); toast("Follow-up completed"); fu.reload(); }
    catch (e) { toast(e.message, "error"); }
  }
  async function reschedule(id, days) {
    const d = new Date(); d.setDate(d.getDate() + days); d.setHours(10, 0, 0, 0);
    try { await followUpsApi.reschedule(id, d.toISOString()); toast("Rescheduled"); fu.reload(); }
    catch (e) { toast(e.message, "error"); }
  }

  if (fu.loading) return <Spinner />;
  const counts = fu.data?.counts || {};
  const items = fu.data?.[bucket] || [];

  const cards = [
    { key: "overdue", label: "Overdue", icon: "exclamation-triangle", tone: "danger" },
    { key: "today", label: "Due today", icon: "bell", tone: "warning" },
    { key: "upcoming", label: "Upcoming", icon: "clock-history", tone: "info" },
    { key: "done", label: "Completed", icon: "check-circle", tone: "success" },
  ];

  return (
    <div>
      <PageHeader title="Follow-ups" subtitle="Overdue, due today and upcoming — from the database" />
      <ErrorBox error={fu.error} />

      <div className="row row-cols-2 row-cols-md-4 g-3 mb-3">
        {cards.map((c) => (
          <div className="col" key={c.key}>
            <div className={`card kpi-card h-100 cursor-pointer ${bucket === c.key ? "border-" + c.tone : ""}`} onClick={() => setBucket(c.key)} style={bucket === c.key ? { boxShadow: "0 0 0 2px var(--bs-" + c.tone + ")" } : {}}>
              <div className="card-body">
                <div className="d-flex justify-content-between"><div className="kpi-label">{c.label}</div><i className={`bi bi-${c.icon} text-${c.tone}`}></i></div>
                <div className={`kpi-value text-${c.tone}`}>{counts[c.key] ?? 0}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-header bg-white fw-semibold text-capitalize">{bucket === "today" ? "Due today" : bucket}</div>
        <div className="table-responsive">
          <table className="table table-hover mb-0 align-middle">
            <thead><tr><th>Lead</th><th>Type</th><th>Note</th><th>Owner</th><th>Due</th><th className="text-end">Action</th></tr></thead>
            <tbody>
              {items.length === 0 ? <tr><td colSpan={6}><EmptyState icon="check2-circle" text="Nothing here." /></td></tr> : items.map((f) => (
                <tr key={f._id}>
                  <td><div className="fw-medium">{f.leadName}</div><div className="text-secondary" style={{ fontSize: 11 }}>{f.phone}</div></td>
                  <td className="small"><i className={`bi bi-${ICON[f.type] || "bell"} me-1`}></i>{f.type}</td>
                  <td className="small">{f.note}</td>
                  <td className="small">{(f.owner || "").split(" ")[0]}</td>
                  <td className="small">{new Date(f.due).toLocaleString()}</td>
                  <td className="text-end">
                    {f.done ? <span className="badge text-bg-success">{f.outcome || "Done"}</span> : (
                      <div className="btn-group btn-group-sm">
                        <button className="btn btn-wa" onClick={() => complete(f._id)}><i className="bi bi-check-lg"></i></button>
                        <button className="btn btn-outline-secondary dropdown-toggle" data-bs-toggle="dropdown"></button>
                        <ul className="dropdown-menu dropdown-menu-end">
                          <li><button className="dropdown-item" onClick={() => reschedule(f._id, 1)}>Tomorrow</button></li>
                          <li><button className="dropdown-item" onClick={() => reschedule(f._id, 3)}>In 3 days</button></li>
                          <li><button className="dropdown-item" onClick={() => reschedule(f._id, 7)}>Next week</button></li>
                        </ul>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
