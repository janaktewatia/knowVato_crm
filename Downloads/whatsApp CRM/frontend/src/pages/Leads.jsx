import { useState } from "react";
import { leadsApi, mastersApi, servicesApi, templatesApi, messagesApi } from "../api";
import { useApi } from "../hooks/useApi";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { PageHeader, Spinner, ErrorBox, StatusPill, Avatar, FilterBar, Field, DataTable, Modal, IconBtn } from "../components/ui";
import LeadDetailsPanel from "../components/LeadDetailsPanel";
import ActionColumn from "../components/ActionColumn";
import MessagingSlider from "../components/MessagingSlider";
import EditSlider from "../components/EditSlider";
import FollowUpSlider from "../components/FollowUpSlider";

export default function Leads() {
  const { can } = useAuth();
  const [filters, setFilters] = useState({ q: "", status: "" });
  const [detailId, setDetailId] = useState(null);
  const [messagingLead, setMessagingLead] = useState(null);
  const [editingLead, setEditingLead] = useState(null);
  const [followUpLead, setFollowUpLead] = useState(null);
  const [adding, setAdding] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState({ name: true, services: true, source: true, owner: true, score: true, actions: true });

  const statuses = useApi(() => mastersApi.statuses(), []);
  const servicesA = useApi(() => servicesApi.list(), []);
  const leads = useApi(() => leadsApi.list({ q: filters.q, status: filters.status, perPage: 100 }), [filters]);
  const statusMap = Object.fromEntries((statuses.data || []).map((s) => [s._id, s]));
  const serviceMap = Object.fromEntries((servicesA.data || []).map((s) => [s._id, s]));

  const allColumns = [
    {
      key: "name",
      label: "Lead",
      render: (l) => (
        <div className="d-flex align-items-center gap-2">
          <Avatar name={l.name} size={30} />
          <div><div className="row-name">{l.name}</div><div className="row-sub">{l.phone}</div></div>
        </div>
      )
    },
    {
      key: "services",
      label: "Services",
      render: (l) => {
        const tracks = l.serviceTracks || [];
        if (!tracks.length) return <span className="text-muted small">—</span>;
        return (
          <div className="d-flex flex-wrap gap-1">
            {tracks.map((t, i) => {
              const svc = serviceMap[t.service?._id || t.service] || t.service || {};
              return (
                <span key={i} className="badge" style={{ background: svc.color || "#79838f", fontSize: 11 }}>
                  <i className={`bi bi-${svc.icon || "grid"}`} style={{ marginRight: 4 }}></i>
                  {svc.name || "Service"}
                </span>
              );
            })}
          </div>
        );
      }
    },
    {
      key: "source",
      label: "Source",
      render: (l) => <span className="text-muted small">{l.source?.name || "—"}</span>
    },
    {
      key: "owner",
      label: "Owner",
      render: (l) => <span className="small">{(l.owner || "").split(" ")[0]}</span>
    },
    {
      key: "score",
      label: "Score",
      align: "right",
      render: (l) => <span className="fw-semibold">{l.score}</span>
    },
    {
      key: "actions",
      label: "Actions",
      align: "center",
      render: (l) => (
        <ActionColumn
          lead={l}
          onMessage={() => setMessagingLead(l)}
          onEdit={() => setEditingLead(l)}
          onService={() => setDetailId(l._id)}
          onFollowUp={() => setFollowUpLead(l)}
        />
      )
    }
  ];

  const columns = allColumns.filter(col => visibleColumns[col.key]);

  const toggleColumn = (key) => {
    setVisibleColumns(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div>
      <PageHeader title="Leads" subtitle="Your admission pipeline"
        actions={can("leads", "create") && <button className="btn btn-wa btn-sm" onClick={() => setAdding(true)}><i className="bi bi-plus-lg me-1"></i>Add Lead</button>} />

      <FilterBar>
        <Field label="Search" style={{ minWidth: 260 }}>
          <div className="input-group input-group-sm">
            <span className="input-group-text"><i className="bi bi-search"></i></span>
            <input className="form-control" placeholder="Name, phone, course…" value={filters.q} onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))} />
          </div>
        </Field>
        <Field label="Status" style={{ minWidth: 180 }}>
          <select className="form-select form-select-sm" value={filters.status} onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}>
            <option value="">All</option>
            {(statuses.data || []).map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
          </select>
        </Field>
        <button className="btn btn-outline-secondary btn-sm" onClick={() => setFilters({ q: "", status: "" })}><i className="bi bi-arrow-counterclockwise me-1"></i>Reset</button>

        <div className="dropdown ms-2">
          <button className="btn btn-outline-secondary btn-sm dropdown-toggle" data-bs-toggle="dropdown">
            <i className="bi bi-columns-gap me-1"></i>Columns
          </button>
          <ul className="dropdown-menu dropdown-menu-end" style={{ minWidth: 200 }}>
            {allColumns.map(col => (
              <li key={col.key}>
                <label className="dropdown-item" style={{ cursor: "pointer" }}>
                  <input type="checkbox" checked={visibleColumns[col.key]} onChange={() => toggleColumn(col.key)} style={{ marginRight: 8 }} />
                  {col.label}
                </label>
              </li>
            ))}
          </ul>
        </div>
      </FilterBar>

      <ErrorBox error={leads.error} />
      <DataTable columns={columns} rows={leads.data} loading={leads.loading} onRowClick={(l) => setDetailId(l._id)} empty={{ icon: "flag", text: "No leads match." }} />

      {detailId && <LeadDetailsPanel id={detailId} onClose={() => setDetailId(null)} onChanged={leads.reload} statuses={statuses.data || []} services={servicesA.data || []} />}
      {messagingLead && <MessagingSlider lead={messagingLead} onClose={() => setMessagingLead(null)} />}
      {editingLead && <EditSlider lead={editingLead} onClose={() => setEditingLead(null)} onSaved={leads.reload} />}
      {followUpLead && <FollowUpSlider lead={followUpLead} onClose={() => setFollowUpLead(null)} statuses={statuses.data || []} services={servicesA.data || []} />}
      {adding && <AddLeadModal onClose={() => setAdding(false)} onSaved={() => { setAdding(false); leads.reload(); }} />}
    </div>
  );
}

function AddLeadModal({ onClose, onSaved }) {
  const toast = useToast();
  const sources = useApi(() => mastersApi.sources(), []);
  const [form, setForm] = useState({ name: "", phone: "+91 ", email: "", source: "", course: "" });
  const [busy, setBusy] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  async function save() {
    setBusy(true);
    try { await leadsApi.convert({ name: form.name, phone: form.phone, email: form.email, source: form.source || undefined, course: form.course || undefined }); toast("Lead created with a follow-up"); onSaved(); }
    catch (e) { toast(e.message, "error"); } finally { setBusy(false); }
  }

  return (
    <Modal title="Add Lead" onClose={onClose}
      footer={<><button className="btn btn-outline-secondary" onClick={onClose}>Cancel</button><button className="btn btn-wa" disabled={busy || !form.name || form.phone.length < 5} onClick={save}>{busy && <span className="spinner-border spinner-border-sm me-2" />}Create</button></>}>
      <div className="row g-3">
        <div className="col-6"><label className="form-label">Name</label><input className="form-control" value={form.name} onChange={(e) => set("name", e.target.value)} /></div>
        <div className="col-6"><label className="form-label">Phone</label><input className="form-control" value={form.phone} onChange={(e) => set("phone", e.target.value)} /></div>
        <div className="col-12"><label className="form-label">Email</label><input className="form-control" value={form.email} onChange={(e) => set("email", e.target.value)} /></div>
        <div className="col-6"><label className="form-label">Source</label>
          <select className="form-select" value={form.source} onChange={(e) => set("source", e.target.value)}>
            <option value="">—</option>{(sources.data || []).map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
          </select>
        </div>
        <div className="col-6"><label className="form-label">Course</label><input className="form-control" value={form.course} onChange={(e) => set("course", e.target.value)} /></div>
      </div>
    </Modal>
  );
}
