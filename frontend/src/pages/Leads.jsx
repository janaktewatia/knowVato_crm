import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { leadsApi, mastersApi, servicesApi, templatesApi, messagesApi } from "../api";
import { useApi } from "../hooks/useApi";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { formatDate, formatDateTime } from "../utils/dateFormat";
import { PageHeader, Spinner, ErrorBox, StatusPill, Avatar, FilterBar, Field, DataTable, Modal, IconBtn } from "../components/ui";
import LeadDetailsPanel from "../components/LeadDetailsPanel";
import ActionColumn from "../components/ActionColumn";
import MessagingSlider from "../components/MessagingSlider";
import EditSlider from "../components/EditSlider";
import FollowUpSlider from "../components/FollowUpSlider";
import JourneySlider from "../components/JourneySlider";

export default function Leads() {
  const { can } = useAuth();
  const [filters, setFilters] = useState({ q: "", status: "", source: "", owner: "" });
  const [page, setPage] = useState(1);
  const [detailId, setDetailId] = useState(null);
  const [messagingLead, setMessagingLead] = useState(null);
  const [editingLead, setEditingLead] = useState(null);
  const [followUpLead, setFollowUpLead] = useState(null);
  const [journeyLead, setJourneyLead] = useState(null);
  const [adding, setAdding] = useState(false);
  const navigate = useNavigate();
  const [visibleColumns, setVisibleColumns] = useState({ name: true, email: true, offerings: true, status: true, nextFollowUp: true, currentRemark: false, nextRemark: false, source: true, owner: true, created: true, actions: true });

  const colsRef = useRef(null);

  useEffect(() => {
    function handleDocClick(e) {
      if (!colsRef.current) return;
      const el = colsRef.current;
      if (!el.contains(e.target)) {
        setVisibleColumns((prev) => (prev._open ? { ...prev, _open: false } : prev));
      }
    }
    document.addEventListener("mousedown", handleDocClick);
    document.addEventListener("touchstart", handleDocClick);
    return () => {
      document.removeEventListener("mousedown", handleDocClick);
      document.removeEventListener("touchstart", handleDocClick);
    };
  }, []);

  const statuses = useApi(() => mastersApi.statuses(), []);
  const servicesA = useApi(() => servicesApi.list(), []);
  const sources = useApi(() => mastersApi.sources(), []);
  const leads = useApi(() => leadsApi.list({ q: filters.q, status: filters.status, source: filters.source, owner: filters.owner, page, perPage: 50 }), [filters, page]);
  const statusMap = Object.fromEntries((statuses.data || []).map((s) => [s._id, s]));
  const serviceMap = Object.fromEntries((servicesA.data || []).map((s) => [s._id, s]));

  // Get unique owners from leads
  const uniqueOwners = Array.from(new Set((leads.data || []).map(l => l.owner).filter(o => o && o !== "Unassigned"))).sort();

  const allColumns = [
    {
      key: "name",
      label: "Lead",
      render: (l) => (
        <div className="d-flex align-items-center gap-2" style={{ cursor: "pointer" }} onClick={() => setDetailId(l._id)}>
          <Avatar name={l.name} size={30} />
          <div><div className="row-name">{l.name}</div><div className="row-sub">{l.phone}</div></div>
        </div>
      )
    },
    {
      key: "email",
      label: "Email",
      render: (l) => <span className="text-muted small">{l.email || "—"}</span>
    },
    {
      key: "offerings",
      label: "Offerings",
      render: (l) => {
        const tracks = l.serviceTracks || [];
        if (!tracks.length) return <span className="text-muted small">—</span>;
        return (
          <div className="d-flex flex-column gap-1">
            {tracks.map((t, i) => {
              const svc = serviceMap[t.service?._id || t.service] || t.service || {};
              return (
                <span key={i} className="small text-muted">
                  {svc.name || "Offering"}
                </span>
              );
            })}
          </div>
        );
      }
    },
    {
      key: "status",
      label: "Status",
      render: (l) => {
        const status = statusMap[l.status?._id || l.status];
        return <span className="small">{status?.name || "—"}</span>;
      }
    },
    {
      key: "nextFollowUp",
      label: "Next Follow-up",
      render: (l) => <span className="small">{formatDate(l.nextFollowUp)}</span>
    },
    {
      key: "currentRemark",
      label: "Current Remark",
      render: (l) => <span className="small text-muted">{l.currentRemark || "—"}</span>
    },
    {
      key: "nextRemark",
      label: "Next Remark",
      render: (l) => <span className="small text-muted">{l.nextRemark || "—"}</span>
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
      key: "created",
      label: "Created",
      render: (l) => {
        const formatted = formatDateTime(l.createdAt);
        if (formatted === "—") return <span className="text-muted small">—</span>;
        const [date, time] = formatted.split(" ");
        return (
          <div className="small">
            <div style={{ fontSize: 12 }}>{date}</div>
            <div className="text-muted" style={{ fontSize: 11 }}>{time}</div>
          </div>
        );
      }
    },
    {
      key: "actions",
      label: "Actions",
      align: "right",
      render: (l) => (
        <ActionColumn
          lead={l}
          onMessage={() => setMessagingLead(l)}
          onEdit={() => setEditingLead(l)}
          onService={() => setDetailId(l._id)}
          onFollowUp={() => setFollowUpLead(l)}
          onRegistration={() => navigate(`/leads/registration/${l._id}`)}
          onJourney={() => setJourneyLead(l)}
        />
      )
    }
  ];

  const columns = allColumns.filter(col => visibleColumns[col.key]);

  const toggleColumn = (key) => {
    setVisibleColumns(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleFilterChange = (updater) => {
    setFilters(prev => {
      const newFilters = typeof updater === 'function' ? updater(prev) : updater;
      return newFilters;
    });
    setPage(1); // Reset to first page when filters change
  };

  return (
    <div>
      <PageHeader title="Leads" subtitle="Your admission pipeline"
        actions={can("leads", "create") && <button className="btn btn-wa btn-sm" onClick={() => setAdding(true)}><i className="bi bi-plus-lg me-1"></i>Add Lead</button>} />

      <FilterBar>
        <Field label="Search" style={{ minWidth: 260 }}>
          <div className="input-group input-group-sm position-relative">
            <input className="form-control" placeholder="Name, phone, course…" value={filters.q} onChange={(e) => handleFilterChange((f) => ({ ...f, q: e.target.value }))} style={{ paddingRight: 32 }} />
            <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", color: "#6c757d", cursor: "pointer", pointerEvents: "none" }}>
              <i className="bi bi-search"></i>
            </span>
          </div>
        </Field>
        <Field label="Source" style={{ minWidth: 160 }}>
          <select className="form-select form-select-sm" value={filters.source} onChange={(e) => setFilters((f) => ({ ...f, source: e.target.value }))}>
            <option value="">All sources</option>
            {(sources.data || []).map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
          </select>
        </Field>
        <Field label="Owner" style={{ minWidth: 160 }}>
          <select className="form-select form-select-sm" value={filters.owner} onChange={(e) => setFilters((f) => ({ ...f, owner: e.target.value }))}>
            <option value="">All owners</option>
            {uniqueOwners.map((owner) => <option key={owner} value={owner}>{owner}</option>)}
          </select>
        </Field>
        <Field label="Status" style={{ minWidth: 160 }}>
          <select className="form-select form-select-sm" value={filters.status} onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}>
            <option value="">All statuses</option>
            {(statuses.data || []).map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
          </select>
        </Field>

        <div className="ms-auto" style={{ position: "relative" }} ref={colsRef}>
          <button className="btn btn-outline-secondary btn-sm" onClick={() => setVisibleColumns(prev => ({ ...prev, _open: !prev._open }))}>
            <i className="bi bi-columns-gap me-1"></i>Columns
          </button>
          {visibleColumns._open && (
            <div style={{ position: "absolute", right: 0, top: "100%", background: "white", border: "1px solid var(--border)", borderRadius: 6, marginTop: 4, minWidth: 220, zIndex: 1000, boxShadow: "var(--shadow-md)" }}>
              {allColumns.map(col => (
                <label key={col.key} style={{ display: "block", padding: "8px 12px", cursor: "pointer", borderBottom: "1px solid var(--border)" }}>
                  <input type="checkbox" checked={visibleColumns[col.key]} onChange={() => toggleColumn(col.key)} style={{ marginRight: 8 }} />
                  <span style={{ fontSize: 13 }}>{col.label}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      </FilterBar>

      <ErrorBox error={leads.error} />

      <div style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "4px" }}>
        <span className="text-muted small">{Math.max(0, (page - 1) * 50)}-{Math.min(page * 50, (leads.data || []).length + (page - 1) * 50)}/{(leads.data || []).length > 0 ? (page - 1) * 50 + (leads.data || []).length + (leads.data.length === 50 ? "+" : "") : "0"}</span>
        <div style={{ display: "flex", gap: "8px" }}>
          <button style={{ background: "none", border: "none", color: "#6c757d", cursor: "pointer", padding: "4px 8px", fontSize: 18 }} onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1 || leads.loading}>
            <i className="bi bi-chevron-left"></i>
          </button>
          <button style={{ background: "none", border: "none", color: "#6c757d", cursor: "pointer", padding: "4px 8px", fontSize: 18 }} onClick={() => setPage(p => p + 1)} disabled={!leads.data || leads.data.length < 50 || leads.loading}>
            <i className="bi bi-chevron-right"></i>
          </button>
        </div>
      </div>

      <DataTable columns={columns} rows={leads.data} loading={leads.loading} empty={{ icon: "flag", text: "No leads match." }} />

      {detailId && <LeadDetailsPanel id={detailId} onClose={() => setDetailId(null)} onChanged={leads.reload} statuses={statuses.data || []} services={servicesA.data || []} />}
      {messagingLead && <MessagingSlider lead={messagingLead} onClose={() => setMessagingLead(null)} />}
      {editingLead && <EditSlider lead={editingLead} onClose={() => setEditingLead(null)} onSaved={leads.reload} />}
      {followUpLead && <FollowUpSlider lead={followUpLead} onClose={() => setFollowUpLead(null)} statuses={statuses.data || []} services={servicesA.data || []} />}
      {journeyLead && <JourneySlider lead={journeyLead} onClose={() => setJourneyLead(null)} statuses={statuses.data || []} services={servicesA.data || []} />}
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
