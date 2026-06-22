import { useState } from "react";
import { messagesApi } from "../api";
import { useApi } from "../hooks/useApi";
import { useToast } from "../context/ToastContext";
import { PageHeader, ErrorBox, Avatar, FilterBar, Field, DataTable } from "../components/ui";

const STATUS_STYLE = {
  read: { background: "var(--info-bg)", color: "var(--info)" },
  delivered: { background: "var(--ok-bg)", color: "var(--ok)" },
  sent: { background: "var(--pill-bg)", color: "var(--pill-ink)" },
  failed: { background: "var(--err-bg)", color: "var(--err)" },
  received: { background: "var(--accent-soft)", color: "var(--accent-ink)" },
  queued: { background: "var(--pill-bg)", color: "var(--pill-ink)" },
};

export default function MessageHistory() {
  const toast = useToast();
  const [filters, setFilters] = useState({ q: "", direction: "", status: "" });
  const list = useApi(() => messagesApi.list({ ...filters, perPage: 100 }), [filters]);

  async function convert(id) {
    try { await messagesApi.convert(id); toast("Converted to lead"); } catch (e) { toast(e.message, "error"); }
  }

  const columns = [
    { key: "name", label: "Recipient", render: (m) => (
      <div className="d-flex align-items-center gap-2"><Avatar name={m.contactName || m.phone} size={28} /><div><div className="row-name">{m.contactName || "—"}</div><div className="row-sub">{m.phone}</div></div></div>
    ) },
    { key: "template", label: "Template", render: (m) => <span className="small font-monospace">{m.template || "—"}</span> },
    { key: "dir", label: "Dir", render: (m) => <i className={`bi bi-arrow-${m.direction === "inbound" ? "down-left" : "up-right"}`} style={{ color: m.direction === "inbound" ? "var(--info)" : "var(--accent)" }}></i> },
    { key: "status", label: "Status", render: (m) => <span className="pill" style={STATUS_STYLE[m.status]}>{m.status}</span> },
    { key: "sent", label: "Sent", render: (m) => <span className="small">{m.sentAt ? new Date(m.sentAt).toLocaleString() : new Date(m.createdAt).toLocaleString()}</span> },
    { key: "act", label: "", align: "right", render: (m) => m.direction === "inbound" && <button className="btn btn-sm btn-outline-secondary" onClick={() => convert(m._id)}><i className="bi bi-flag me-1"></i>To lead</button> },
  ];

  return (
    <div>
      <PageHeader title="Message History" subtitle="Delivery log" />
      <FilterBar>
        <Field label="Search" style={{ minWidth: 240 }}>
          <div className="input-group input-group-sm"><span className="input-group-text"><i className="bi bi-search"></i></span>
            <input className="form-control" placeholder="Name, phone, template…" value={filters.q} onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))} /></div>
        </Field>
        <Field label="Direction" style={{ minWidth: 150 }}>
          <select className="form-select form-select-sm" value={filters.direction} onChange={(e) => setFilters((f) => ({ ...f, direction: e.target.value }))}><option value="">All</option><option value="outbound">Outbound</option><option value="inbound">Inbound</option></select>
        </Field>
        <Field label="Status" style={{ minWidth: 150 }}>
          <select className="form-select form-select-sm" value={filters.status} onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}><option value="">All</option>{["read", "delivered", "sent", "failed", "received"].map((s) => <option key={s} value={s}>{s}</option>)}</select>
        </Field>
        <button className="btn btn-outline-secondary btn-sm" onClick={() => setFilters({ q: "", direction: "", status: "" })}><i className="bi bi-arrow-counterclockwise me-1"></i>Reset</button>
      </FilterBar>
      <ErrorBox error={list.error} />
      <DataTable columns={columns} rows={list.data} loading={list.loading} empty={{ icon: "clock-history", text: "No messages." }} />
    </div>
  );
}
