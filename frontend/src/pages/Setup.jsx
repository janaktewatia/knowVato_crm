import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { mastersApi, servicesApi, sessionsApi, gradesApi, teamsApi, workflowsApi, workflowConfigApi, usersApi, templatesApi } from "../api";
import { useApi } from "../hooks/useApi";
import { useToast } from "../context/ToastContext";
import { PageHeader, Spinner, ErrorBox, EmptyState, Tabs, Modal, IconBtn } from "../components/ui";
import RegistrationFormBuilder from "../components/RegistrationFormBuilder";
import LandingPageBuilder from "../components/LandingPageBuilder";
import LandingPageWizard from "../components/LandingPageWizard";

const DEFAULT_LANDING_PAGE_CONFIG = {
  brandName: "Your Institution",
  heroTitle: "Welcome to a better admissions experience",
  heroSubtitle: "Show your programs, benefits, and next steps in one polished page for families and prospects.",
  heroCtaLabel: "Book a Visit",
  heroCtaLink: "#contact",
  accentColor: "#0085a8",
  highlightTitle: "Why families choose us",
  features: [
    "Instant WhatsApp follow-up",
    "Simple enquiry capture",
    "Track every conversation in one place"
  ]
};

const CATEGORIES = [
  {
    id: "lead-config",
    icon: "clipboard-data",
    title: "Lead Configuration",
    color: "#0085a8",
    items: [
      { id: "offerings", label: "Offerings" },
      { id: "status", label: "Lead Statuses" },
      { id: "sources", label: "Sources" }
    ]
  },
  {
    id: "forms",
    icon: "file-earmark-text",
    title: "Forms",
    color: "#2e7d57",
    items: [
      { id: "enquiry-form", label: "Enquiry Form" },
      { id: "registration-form", label: "Registration Form" },
      { id: "landing-page", label: "Landing Page" }
    ]
  },
  {
    id: "academic",
    icon: "mortarboard",
    title: "Academic Setup",
    color: "#9a6700",
    items: [
      { id: "sessions", label: "Academic Sessions" },
      { id: "grades", label: "Grades" }
    ]
  },
  {
    id: "workflow",
    icon: "diagram-3",
    title: "Workflows",
    color: "#5b4b8a",
    items: [
      { id: "workflows", label: "Workflows" },
      { id: "comm-templates", label: "Communication Templates" },
      { id: "teams", label: "Teams" }
    ]
  },
  {
    id: "integrations",
    icon: "puzzle",
    title: "Integrations",
    color: "#6b7280",
    items: [
      { id: "facebook", label: "Facebook" },
      { id: "google-form", label: "Google Form" },
      { id: "api-integration", label: "API Integration" }
    ]
  }
];
const COLORS = ["#0085a8", "#00586f", "#2e7d57", "#9a6700", "#b3261e", "#1f5f8b", "#5b4b8a", "#7a5c2e", "#41505f", "#6b7280"];

export default function Setup() {
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();
  const getActiveSection = () => {
    const params = new URLSearchParams(location.search);
    return params.get("active") || "offerings";
  };
  const getMode = () => {
    const params = new URLSearchParams(location.search);
    return params.get("mode") || "list";
  };
  const [selected, setSelected] = useState(getActiveSection);
  const [mode, setMode] = useState(getMode);
  const [openCategories, setOpenCategories] = useState(() => Object.fromEntries(CATEGORIES.map((cat) => [cat.id, true])));

  useEffect(() => {
    const active = getActiveSection();
    if (active && active !== selected) {
      setSelected(active);
    }
    const currentMode = getMode();
    if (currentMode !== mode) {
      setMode(currentMode);
    }
  }, [location.search]);

  const toggleCategory = (categoryId) => {
    setOpenCategories((prev) => ({ ...prev, [categoryId]: !prev[categoryId] }));
  };

  const selectSection = (item) => {
    setSelected(item.id);
    setMode("list");
    navigate(`/crm/setup?active=${item.id}&mode=list`);
  };

  const hideSidebar = (selected === "registration-form" || selected === "landing-page") && mode === "editor";

  return (
    <div style={{ padding: "0" }}>
      <div style={hideSidebar ? { display: "block", marginBottom: "8px", padding: "0 2px" } : { display: "grid", gridTemplateColumns: "240px minmax(0, 1fr)", gap: "12px", marginBottom: "8px", padding: "0 2px" }}>
        {!hideSidebar && (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", position: "sticky", top: 16, alignSelf: "start" }}>
            {CATEGORIES.map((cat) => (
              <div key={cat.id} style={{ border: "1px solid var(--border)", borderRadius: "16px", background: "var(--surface)", overflow: "hidden" }}>
                <button
                  type="button"
                  onClick={() => toggleCategory(cat.id)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "10px",
                    padding: "12px 14px",
                    border: "none",
                    background: "transparent",
                    color: "var(--text)",
                    cursor: "pointer",
                    textAlign: "left"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <i className={`bi bi-${cat.icon}`} style={{ color: cat.color, fontSize: 17 }}></i>
                    <div>
                      <div style={{ fontSize: "13px", fontWeight: 600 }}>{cat.title}</div>
                      <div style={{ fontSize: "11px", color: "var(--text-2)" }}>{cat.items.length} options</div>
                    </div>
                  </div>
                  <i className={`bi bi-chevron-${openCategories[cat.id] ? "down" : "right"}`} style={{ fontSize: 14, color: "var(--text-2)" }}></i>
                </button>

                {openCategories[cat.id] && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px", padding: "8px 10px 12px" }}>
                    {cat.items.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => selectSection(item)}
                        style={{
                          width: "100%",
                          padding: "8px 10px",
                          border: "none",
                          background: selected === item.id ? `${cat.color}22` : "transparent",
                          color: selected === item.id ? cat.color : "var(--text-2)",
                          fontWeight: selected === item.id ? 600 : 500,
                          textAlign: "left",
                          borderRadius: "8px",
                          cursor: "pointer"
                        }}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div style={{ padding: "0 0 0 0" }}>
          {selected === "offerings" && <ServicesMaster />}
          {selected === "status" && <CombinedStatusMaster />}
          {selected === "sources" && <SourceMaster />}
          {selected === "registration-form" && <RegistrationFormConfig />}
          {selected === "enquiry-form" && <EnquiryFormConfig />}
          {selected === "landing-page" && <LandingPageTab />}
          {selected === "sessions" && <AcademicSessions />}
          {selected === "grades" && <Grades />}
          {selected === "teams" && <Teams />}
          {selected === "workflows" && <WorkflowsTab />}
          {selected === "comm-templates" && <CommunicationTemplatesConfig />}
          {selected === "facebook" && <IntegrationPlaceholder title="Facebook" />}
          {selected === "google-form" && <IntegrationPlaceholder title="Google Form" />}
          {selected === "api-integration" && <IntegrationPlaceholder title="API Integration" />}
        </div>
      </div>
    </div>
  );
}

function ServicesMaster() {
  const toast = useToast();
  const list = useApi(() => servicesApi.list(), []);
  const [edit, setEdit] = useState(null);
  const ICONS = ["grid", "whatsapp", "calendar-event", "mortarboard", "globe", "envelope", "people", "cash-coin", "bus-front", "book"];
  async function save(f) {
    try {
      if (f._id) await servicesApi.update(f._id, f);
      else await servicesApi.create({ ...f, key: f.key || f.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"), order: (list.data?.length || 0) + 1 });
      toast("Saved"); setEdit(null); list.reload();
    } catch (e) { toast(e.message, "error"); }
  }
  async function remove(id) { if (confirm("Delete this offering?")) { try { await servicesApi.remove(id); toast("Deleted"); list.reload(); } catch (e) { toast(e.message, "error"); } } }
  return (
    <div className="card" style={{ borderRadius: "16px" }}>
      <div className="card-header d-flex justify-content-between align-items-center">
        <div><span className="fw-semibold">Offerings</span><div className="text-muted small">Pipelines a lead can be in. Each can have its own statuses.</div></div>
        <button className="btn btn-sm btn-wa" onClick={() => setEdit({ name: "", color: COLORS[0], icon: "grid", isRecurring: false })}>Add offering</button>
      </div>
      <ErrorBox error={list.error} />
      <div className="table-responsive"><table className="table mb-0 align-middle">
        <thead><tr><th>Offering</th><th>Frequency</th><th></th></tr></thead>
        <tbody>
          {list.loading ? <tr><td colSpan={3}><Spinner /></td></tr> : (list.data || []).map((s) => (
            <tr key={s._id}>
              <td><i className={`bi bi-${s.icon} me-2`} style={{ color: s.color }}></i><span className="fw-medium">{s.name}</span></td>
              <td><span className="badge" style={{ background: s.isRecurring ? "#2e7d57" : "#7a5c2e" }}>{s.isRecurring ? "Recurring" : "One-time"}</span></td>
              <td className="text-end"><IconBtn icon="pencil" onClick={() => setEdit(s)} />{!s.builtIn && <IconBtn icon="trash" danger onClick={() => remove(s._id)} />}</td>
            </tr>
          ))}
        </tbody>
      </table></div>
      {edit && (
        <Modal title={edit._id ? "Edit offering" : "Add offering"} onClose={() => setEdit(null)}
          footer={<><button className="btn btn-outline-secondary" onClick={() => setEdit(null)}>Cancel</button><button className="btn btn-wa" disabled={!edit.name} onClick={() => save(edit)}>Save</button></>}>
          <label className="form-label">Name</label>
          <input className="form-control mb-3" value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} placeholder="e.g. Hostel, Transport, Scholarship" />
          <label className="form-label">Colour</label>
          <div className="d-flex flex-wrap gap-2 mb-3">{COLORS.map((c) => <button key={c} onClick={() => setEdit({ ...edit, color: c })} style={{ width: 28, height: 28, borderRadius: 6, background: c, border: edit.color === c ? "3px solid #1f2630" : "1px solid #ccc" }} />)}</div>
          <label className="form-label">Icon</label>
          <div className="d-flex flex-wrap gap-2 mb-3">{ICONS.map((ic) => <button key={ic} onClick={() => setEdit({ ...edit, icon: ic })} className="btn btn-sm" style={{ border: edit.icon === ic ? "2px solid var(--accent)" : "1px solid var(--border-2)" }}><i className={`bi bi-${ic}`}></i></button>)}</div>
          <label className="form-label">Frequency</label>
          <div className="d-flex gap-3">
            <div className="form-check">
              <input className="form-check-input" type="radio" id="oneTime" name="frequency" checked={!edit.isRecurring} onChange={() => setEdit({ ...edit, isRecurring: false })} />
              <label className="form-check-label" htmlFor="oneTime">One-time</label>
            </div>
            <div className="form-check">
              <input className="form-check-input" type="radio" id="recurring" name="frequency" checked={edit.isRecurring} onChange={() => setEdit({ ...edit, isRecurring: true })} />
              <label className="form-check-label" htmlFor="recurring">Recurring</label>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function CombinedStatusMaster() {
  const toast = useToast();
  const list = useApi(() => mastersApi.statuses(), []);
  const [edit, setEdit] = useState(null);
  const services = useApi(() => servicesApi.list(), []);
  const svcMap = Object.fromEntries((services.data || []).map((s) => [s._id, s]));
  const [expandedId, setExpandedId] = useState(null);

  async function save(f) {
    try {
      if (f._id) await mastersApi.updateStatus(f._id, f);
      else await mastersApi.createStatus({ ...f, order: (list.data?.length || 0) + 1 });
      toast("Saved"); setEdit(null); list.reload();
    } catch (e) { toast(e.message, "error"); }
  }

  async function removeStatus(id) { if (confirm("Delete status?")) { try { await mastersApi.removeStatus(id); toast("Deleted"); list.reload(); } catch (e) { toast(e.message, "error"); } } }

  return (
    <div className="card" style={{ borderRadius: "16px" }}>
      <div className="card-header d-flex justify-content-between">
        <div><span className="fw-semibold">Lead Statuses</span><div className="text-muted small">Create statuses with sub-statuses and map to offerings.</div></div>
        <button className="btn btn-sm btn-wa" onClick={() => setEdit({ name: "", color: COLORS[0], subStatuses: [""], offerings: [], followUpRequired: false, isWon: false, isLost: false })}>Add Status</button>
      </div>
      <ErrorBox error={list.error} />
      <div className="table-responsive">
        <table className="table mb-0 align-middle">
          <thead><tr><th>Status</th><th>Sub-Statuses</th><th>Offerings</th><th>Follow-up</th><th>Type</th><th></th></tr></thead>
          <tbody>
            {list.loading ? <tr><td colSpan={6}><Spinner /></td></tr> : !list.data || list.data.length === 0 ? (
              <tr><td colSpan={6} className="text-center text-muted py-4">No statuses created yet. Click "Add Status" to create one.</td></tr>
            ) : (list.data || []).map((s) => (
              <tr key={s._id}>
                <td><span className="pill" style={{ background: s.color + "22", color: s.color }}>{s.name}</span></td>
                <td>
                  {s.subStatuses && s.subStatuses.length > 0 ? (
                    <button className="btn btn-sm btn-link p-0" onClick={() => setExpandedId(expandedId === s._id ? null : s._id)}>
                      {expandedId === s._id ? (
                        <div style={{ fontSize: 12 }}>
                          {s.subStatuses.map((sub, idx) => <div key={idx} className="text-muted small">{sub}</div>)}
                        </div>
                      ) : (
                        <span style={{ fontSize: 13, color: "var(--text-2)" }}>{s.subStatuses.length} sub-status</span>
                      )}
                    </button>
                  ) : (
                    <span className="text-muted small">—</span>
                  )}
                </td>
                <td style={{ fontSize: 13 }}>{s.offerings && s.offerings.length > 0 ? `${s.offerings.length} offerings` : "—"}</td>
                <td style={{ fontSize: 13 }}>{s.followUpRequired === "Yes" ? "Yes" : "No"}</td>
                <td style={{ fontSize: 13 }}>{s.isWon ? "Won" : s.isLost ? "Lost" : "Open"}</td>
                <td className="text-end"><IconBtn icon="pencil" onClick={() => setEdit(s)} /><IconBtn icon="trash" danger onClick={() => removeStatus(s._id)} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {edit && <StatusModal status={edit} services={services.data || []} onClose={() => setEdit(null)} onSave={save} />}
    </div>
  );
}

function StatusModal({ status, services, onClose, onSave }) {
  const [f, setF] = useState({
    _id: status._id,
    name: status.name || "",
    color: status.color || COLORS[0],
    subStatuses: status.subStatuses || [""],
    offerings: status.offerings || [],
    followUpRequired: status.followUpRequired === "Yes",
    isWon: status.isWon || false,
    isLost: status.isLost || false
  });
  const [offeringsOpen, setOfferingsOpen] = useState(false);

  const handleAddSubStatus = () => {
    setF({ ...f, subStatuses: [...f.subStatuses, ""] });
  };

  const handleSubStatusChange = (idx, val) => {
    const updated = [...f.subStatuses];
    updated[idx] = val;
    setF({ ...f, subStatuses: updated });
  };

  const handleRemoveSubStatus = (idx) => {
    if (f.subStatuses.length > 1) {
      setF({ ...f, subStatuses: f.subStatuses.filter((_, i) => i !== idx) });
    }
  };

  const handleOfferingToggle = (offeringId) => {
    setF({
      ...f,
      offerings: f.offerings.includes(offeringId)
        ? f.offerings.filter(o => o !== offeringId)
        : [...f.offerings, offeringId]
    });
  };

  const handleSave = () => {
    const payload = {
      ...f,
      subStatuses: f.subStatuses.filter(s => s.trim()),
      followUpRequired: f.followUpRequired ? "Yes" : "No"
    };
    onSave(payload);
  };

  return (
    <Modal title={status._id ? "Edit status" : "Add status"} onClose={onClose}
      footer={<><button className="btn btn-outline-secondary" onClick={onClose}>Cancel</button><button className="btn btn-wa" disabled={!f.name} onClick={handleSave}>Save</button></>}>

      <label className="form-label small fw-semibold">Status Name</label>
      <input className="form-control mb-3" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />

      <label className="form-label small fw-semibold mb-2">Color</label>
      <div className="d-flex flex-wrap gap-2 mb-4">{COLORS.map((c) => <button key={c} onClick={() => setF({ ...f, color: c })} style={{ width: 28, height: 28, borderRadius: 6, background: c, border: f.color === c ? "3px solid #1f2630" : "1px solid #ccc" }} title={c} />)}</div>

      <label className="form-label small fw-semibold mb-3">Sub-Statuses</label>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "16px" }}>
        {f.subStatuses.map((sub, idx) => (
          <div key={idx} style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <input className="form-control form-control-sm" value={sub} onChange={(e) => handleSubStatusChange(idx, e.target.value)} />
            {f.subStatuses.length > 1 && (
              <button className="btn btn-sm btn-outline-danger" onClick={() => handleRemoveSubStatus(idx)} style={{ padding: "4px 8px" }}>
                <i className="bi bi-trash"></i>
              </button>
            )}
            {idx === f.subStatuses.length - 1 && (
              <button className="btn btn-sm btn-outline-secondary" onClick={handleAddSubStatus} style={{ padding: "4px 12px", whiteSpace: "nowrap" }} title="Add sub-status">
                <i className="bi bi-plus-lg"></i>
              </button>
            )}
          </div>
        ))}
      </div>

      <label className="form-label small fw-semibold mb-2">Offerings</label>
      <div style={{ position: "relative", marginBottom: "16px" }}>
        <button style={{ width: "100%", padding: "8px 12px", border: "1px solid var(--border-2)", borderRadius: "16px", background: "white", textAlign: "left", cursor: "pointer" }} onClick={() => setOfferingsOpen(!offeringsOpen)}>
          <div style={{ fontSize: 14, color: f.offerings.length > 0 ? "var(--text)" : "var(--muted)" }}>
            {f.offerings.length === 0 ? "Select offerings..." : `${f.offerings.length} selected`}
          </div>
        </button>
        {offeringsOpen && (
          <>
            <div style={{ position: "fixed", inset: 0, zIndex: 999 }} onClick={() => setOfferingsOpen(false)}></div>
            <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: "white", border: "1px solid var(--border)", borderRadius: "16px", marginTop: "4px", maxHeight: "220px", overflowY: "auto", zIndex: 1000, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
              {services.map((o) => (
                <div key={o._id} style={{ display: "flex", alignItems: "center", padding: "8px 12px", borderBottom: "1px solid var(--divider)", cursor: "pointer" }} onClick={() => handleOfferingToggle(o._id)}>
                  <input type="checkbox" checked={f.offerings.includes(o._id)} onChange={() => {}} style={{ marginRight: "8px", cursor: "pointer" }} />
                  <span style={{ fontSize: 13 }}>{o.name}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <label className="form-label small fw-semibold mb-2">Follow-up Required</label>
      <div style={{ display: "flex", gap: "16px", marginBottom: "16px" }}>
        <div className="form-check"><input className="form-check-input" type="radio" name="followup" checked={f.followUpRequired} onChange={() => setF({ ...f, followUpRequired: true })} id="followup-yes" /><label className="form-check-label small" htmlFor="followup-yes">Yes</label></div>
        <div className="form-check"><input className="form-check-input" type="radio" name="followup" checked={!f.followUpRequired} onChange={() => setF({ ...f, followUpRequired: false })} id="followup-no" /><label className="form-check-label small" htmlFor="followup-no">No</label></div>
      </div>

      <label className="form-label small fw-semibold mb-2">Count As</label>
      <div style={{ display: "flex", gap: "16px" }}>
        <div className="form-check"><input className="form-check-input" type="radio" name="status-type" checked={f.isWon} onChange={() => setF({ ...f, isWon: true, isLost: false })} id="won" /><label className="form-check-label small" htmlFor="won">Won</label></div>
        <div className="form-check"><input className="form-check-input" type="radio" name="status-type" checked={f.isLost} onChange={() => setF({ ...f, isLost: true, isWon: false })} id="lost" /><label className="form-check-label small" htmlFor="lost">Lost</label></div>
        <div className="form-check"><input className="form-check-input" type="radio" name="status-type" checked={!f.isWon && !f.isLost} onChange={() => setF({ ...f, isWon: false, isLost: false })} id="open" /><label className="form-check-label small" htmlFor="open">Open</label></div>
      </div>
    </Modal>
  );
}

function SourceMaster() {
  const toast = useToast();
  const list = useApi(() => mastersApi.sources(), []);
  const [form, setForm] = useState({ name: "" });
  async function add() { if (!form.name) return; try { await mastersApi.createSource(form); toast("Added"); setForm({ name: "" }); list.reload(); } catch (e) { toast(e.message, "error"); } }
  return (
    <div className="card" style={{ borderRadius: "16px" }}>
      <div className="card-header bg-white fw-semibold">Lead sources</div>
      <div className="card-body">
        <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
          <input className="form-control form-control-sm" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={{ flex: 1 }} />
          <button className="btn btn-sm btn-wa" onClick={add} style={{ padding: "6px 12px", whiteSpace: "nowrap" }} title="Add source"><i className="bi bi-plus-lg"></i></button>
        </div>
        <table className="table table-sm"><tbody>
          {(list.data || []).map((s) => <tr key={s._id}><td>{s.name}</td><td className="text-end"><button className="btn btn-sm btn-link text-danger" onClick={async () => { await mastersApi.removeSource(s._id); list.reload(); }}><i className="bi bi-trash"></i></button></td></tr>)}
        </tbody></table>
      </div>
    </div>
  );
}

const PERM_MODS = ["dashboard", "leads", "followups", "chat", "blast", "contacts", "conversion", "setup", "reports"];
function UserTypes() {
  const toast = useToast();
  const list = useApi(() => usersApi.userTypes(), []);
  const [edit, setEdit] = useState(null);
  async function save(f) {
    try { if (f._id) await usersApi.updateUserType(f._id, f); else await usersApi.createUserType(f); toast("Saved"); setEdit(null); list.reload(); }
    catch (e) { toast(e.message, "error"); }
  }
  return (
    <div className="card" style={{ borderRadius: "16px" }}>
      <div className="card-header bg-white d-flex justify-content-between"><span className="fw-semibold">User types & permissions</span><button className="btn btn-sm btn-wa" onClick={() => setEdit({ name: "", desc: "", perms: PERM_MODS.map((m) => ({ module: m, view: false, create: false, edit: false, del: false })) })}>Add</button></div>
      <ErrorBox error={list.error} />
      <table className="table mb-0 align-middle"><thead><tr><th>Type</th><th>Description</th><th>Modules</th><th></th></tr></thead>
        <tbody>
          {list.loading ? <tr><td colSpan={4}><Spinner /></td></tr> : (list.data || []).map((t) => (
            <tr key={t._id}><td className="fw-medium">{t.name}</td><td className="small text-secondary">{t.desc}</td><td><span className="badge text-bg-light">{t.perms.filter((p) => p.view).length}/{t.perms.length} modules</span></td><td className="text-end"><button className="btn btn-sm btn-link" onClick={() => setEdit(t)}><i className="bi bi-pencil"></i></button></td></tr>
          ))}
        </tbody>
      </table>
      {edit && <PermModal userType={edit} onClose={() => setEdit(null)} onSave={save} />}
    </div>
  );
}

function PermModal({ userType, onClose, onSave }) {
  const [name, setName] = useState(userType.name);
  const [desc, setDesc] = useState(userType.desc || "");
  const [perms, setPerms] = useState(() => PERM_MODS.map((m) => { const f = userType.perms.find((p) => p.module === m); return f ? { ...f } : { module: m, view: false, create: false, edit: false, del: false }; }));
  function toggle(i, k) {
    setPerms((ps) => ps.map((p, idx) => idx === i ? { ...p, [k]: !p[k], ...(k === "view" && p[k] ? { create: false, edit: false, del: false } : {}), ...(k !== "view" && !p[k] ? { view: true } : {}) } : p));
  }
  return (
    <><div className="modal-backdrop fade show"></div>
      <div className="modal d-block"><div className="modal-dialog modal-lg"><div className="modal-content">
        <div className="modal-header"><h5 className="modal-title">{userType._id ? "Edit" : "New"} user type</h5><button className="btn-close" onClick={onClose}></button></div>
        <div className="modal-body">
          <div className="row g-3 mb-3"><div className="col-6"><label className="form-label small">Name</label><input className="form-control" value={name} onChange={(e) => setName(e.target.value)} /></div><div className="col-6"><label className="form-label small">Description</label><input className="form-control" value={desc} onChange={(e) => setDesc(e.target.value)} /></div></div>
          <table className="table table-sm table-bordered align-middle">
            <thead><tr><th>Module</th><th className="text-center">View</th><th className="text-center">Create</th><th className="text-center">Edit</th><th className="text-center">Delete</th></tr></thead>
            <tbody>
              {perms.map((p, i) => (
                <tr key={p.module}><td className="text-capitalize small fw-medium">{p.module}</td>
                  {["view", "create", "edit", "del"].map((k) => <td className="text-center" key={k}><input type="checkbox" checked={p[k]} onChange={() => toggle(i, k)} /></td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="modal-footer"><button className="btn btn-outline-secondary" onClick={onClose}>Cancel</button><button className="btn btn-wa" disabled={!name} onClick={() => onSave({ _id: userType._id, name, desc, perms })}>Save</button></div>
      </div></div></div></>
  );
}

function Users() {
  const toast = useToast();
  const list = useApi(() => usersApi.users(), []);
  const types = useApi(() => usersApi.userTypes(), []);
  const designations = useApi(() => designationsApi.list(), []);
  const [edit, setEdit] = useState(null);
  const typeMap = Object.fromEntries((types.data || []).map((t) => [t._id, t]));
  async function save(f) {
    try { if (f._id) await usersApi.updateUser(f._id, f); else await usersApi.createUser({ ...f, passwordHash: "TempPass!23" }); toast("Saved (default password: TempPass!23)"); setEdit(null); list.reload(); }
    catch (e) { toast(e.message, "error"); }
  }
  return (
    <div className="card" style={{ borderRadius: "16px" }}>
      <div className="card-header bg-white d-flex justify-content-between"><span className="fw-semibold">Users</span><button className="btn btn-sm btn-wa" onClick={() => setEdit({ name: "", email: "", userType: types.data?.[0]?._id, designation: "", status: "Active" })}>Add user</button></div>
      <ErrorBox error={list.error} />
      <table className="table mb-0 align-middle"><thead><tr><th>User</th><th>Email</th><th>Type</th><th>Status</th><th></th></tr></thead>
        <tbody>
          {list.loading ? <tr><td colSpan={5}><Spinner /></td></tr> : (list.data || []).map((u) => (
            <tr key={u._id}><td className="fw-medium">{u.name}</td><td className="small font-monospace">{u.email}</td><td><span className="badge text-bg-info">{typeMap[u.userType]?.name || u.userType?.name || "—"}</span></td><td>{u.status === "Active" ? <span className="badge text-bg-success">Active</span> : <span className="badge text-bg-secondary">{u.status}</span>}</td><td className="text-end"><button className="btn btn-sm btn-link" onClick={() => setEdit({ ...u, userType: u.userType?._id || u.userType })}><i className="bi bi-pencil"></i></button></td></tr>
          ))}
        </tbody>
      </table>
      {edit && <UserModal user={edit} types={types.data || []} designations={designations.data || []} onClose={() => setEdit(null)} onSave={save} />}
    </div>
  );
}

function UserModal({ user, types, designations = [], onClose, onSave }) {
  const [f, setF] = useState({ _id: user._id, name: user.name || "", email: user.email || "", userType: user.userType || types[0]?._id, designation: user.designation || "", status: user.status || "Active" });
  return (
    <><div className="modal-backdrop fade show"></div>
      <div className="modal d-block"><div className="modal-dialog"><div className="modal-content">
        <div className="modal-header"><h5 className="modal-title">{user._id ? "Edit" : "Add"} user</h5><button className="btn-close" onClick={onClose}></button></div>
        <div className="modal-body"><div className="row g-3">
          <div className="col-12"><label className="form-label small">Name</label><input className="form-control" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></div>
          <div className="col-12"><label className="form-label small">Email</label><input className="form-control" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></div>
          <div className="col-6"><label className="form-label small">User type</label><select className="form-select" value={f.userType} onChange={(e) => setF({ ...f, userType: e.target.value })}>{types.map((t) => <option key={t._id} value={t._id}>{t.name}</option>)}</select></div>
          <div className="col-6"><label className="form-label small">Designation</label><select className="form-select" value={f.designation} onChange={(e) => setF({ ...f, designation: e.target.value })}><option value="">— Select —</option>{designations.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}</select></div>
          <div className="col-6"><label className="form-label small">Status</label><select className="form-select" value={f.status} onChange={(e) => setF({ ...f, status: e.target.value })}><option>Active</option><option>Inactive</option><option>Pending</option></select></div>
        </div></div>
        <div className="modal-footer"><button className="btn btn-outline-secondary" onClick={onClose}>Cancel</button><button className="btn btn-wa" disabled={!f.name || !f.email} onClick={() => onSave(f)}>Save</button></div>
      </div></div></div></>
  );
}

function WhatsAppAccounts() {
  const toast = useToast();
  const list = useApi(() => waAccountsApi.list(), []);
  const [edit, setEdit] = useState(null);
  async function activate(id) { try { await waAccountsApi.activate(id); toast("Activated"); list.reload(); } catch (e) { toast(e.message, "error"); } }
  async function remove(id) { if (confirm("Delete this account?")) { try { await waAccountsApi.remove(id); toast("Deleted"); list.reload(); } catch (e) { toast(e.message, "error"); } } }
  async function save(f) {
    try { if (f._id) await waAccountsApi.update(f._id, f); else await waAccountsApi.create(f); toast("Saved"); setEdit(null); list.reload(); }
    catch (e) { toast(e.message, "error"); }
  }
  return (
    <div className="card">
      <div className="card-header bg-white d-flex justify-content-between align-items-center">
        <div><span className="fw-semibold">WhatsApp Accounts</span><div className="text-secondary small">Configure multiple vendors — exactly one is active at a time.</div></div>
        <button className="btn btn-sm btn-wa" onClick={() => setEdit({ vendor: "meta", label: "", active: false })}>Add account</button>
      </div>
      <ErrorBox error={list.error} />
      <div className="table-responsive"><table className="table mb-0 align-middle">
        <thead><tr><th>Account</th><th>Vendor</th><th>Sender</th><th>Active</th><th></th></tr></thead>
        <tbody>
          {list.loading ? <tr><td colSpan={5}><Spinner /></td></tr> : (list.data || []).length === 0 ? <tr><td colSpan={5}><EmptyState icon="whatsapp" text="No WhatsApp accounts." /></td></tr> : list.data.map((a) => (
            <tr key={a._id} className={a.active ? "table-success" : ""}>
              <td className="fw-medium">{a.label}</td>
              <td><span className="badge text-bg-dark text-uppercase">{a.vendor}</span></td>
              <td className="small font-monospace">{a.senderNumber || "—"}</td>
              <td>{a.active ? <span className="badge text-bg-success"><i className="bi bi-check-circle me-1"></i>Active</span> : <button className="btn btn-sm btn-outline-success" onClick={() => activate(a._id)}>Make active</button>}</td>
              <td className="text-end"><button className="btn btn-sm btn-link" onClick={() => setEdit(a)}><i className="bi bi-pencil"></i></button><button className="btn btn-sm btn-link text-danger" onClick={() => remove(a._id)}><i className="bi bi-trash"></i></button></td>
            </tr>
          ))}
        </tbody>
      </table></div>
      {edit && <WaModal account={edit} onClose={() => setEdit(null)} onSave={save} />}
    </div>
  );
}

function WaModal({ account, onClose, onSave }) {
  const [f, setF] = useState({
    _id: account._id, label: account.label || "", vendor: account.vendor || "meta", senderNumber: account.senderNumber || "",
    apiBaseUrl: account.apiBaseUrl || "", apiKey: "", accessToken: "", phoneNumberId: account.phoneNumberId || "",
    verifyToken: account.verifyToken || "", appSecret: "",
  });
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const isPinnacle = f.vendor === "pinnacle";
  const isMeta = f.vendor === "meta";
  // strip empty secret fields so we don't overwrite stored values with blanks on edit
  function clean() { const o = { ...f }; ["apiKey", "accessToken", "appSecret"].forEach((k) => { if (!o[k]) delete o[k]; }); return o; }
  return (
    <><div className="modal-backdrop fade show"></div>
      <div className="modal d-block"><div className="modal-dialog"><div className="modal-content">
        <div className="modal-header"><h5 className="modal-title">{account._id ? "Edit" : "Add"} WhatsApp account</h5><button className="btn-close" onClick={onClose}></button></div>
        <div className="modal-body"><div className="row g-3">
          <div className="col-7"><label className="form-label small">Label</label><input className="form-control" value={f.label} onChange={(e) => set("label", e.target.value)} placeholder="Pinnacle – Admissions" /></div>
          <div className="col-5"><label className="form-label small">Vendor</label><select className="form-select" value={f.vendor} onChange={(e) => set("vendor", e.target.value)}><option value="meta">Meta (direct)</option><option value="pinnacle">Pinnacle</option><option value="simulation">Simulation</option></select></div>
          <div className="col-12"><label className="form-label small">Sender number</label><input className="form-control" value={f.senderNumber} onChange={(e) => set("senderNumber", e.target.value)} /></div>
          {isMeta && <>
            <div className="col-12"><label className="form-label small">Phone Number ID</label><input className="form-control" value={f.phoneNumberId} onChange={(e) => set("phoneNumberId", e.target.value)} /></div>
            <div className="col-12"><label className="form-label small">Access Token</label><input className="form-control" type="password" placeholder={account._id ? "•••• (unchanged)" : ""} value={f.accessToken} onChange={(e) => set("accessToken", e.target.value)} /></div>
            <div className="col-6"><label className="form-label small">App Secret</label><input className="form-control" type="password" value={f.appSecret} onChange={(e) => set("appSecret", e.target.value)} /></div>
            <div className="col-6"><label className="form-label small">Verify Token</label><input className="form-control" value={f.verifyToken} onChange={(e) => set("verifyToken", e.target.value)} /></div>
          </>}
          {isPinnacle && <>
            <div className="col-12"><label className="form-label small">API Base URL</label><input className="form-control" value={f.apiBaseUrl} onChange={(e) => set("apiBaseUrl", e.target.value)} placeholder="from Pinnacle docs" /></div>
            <div className="col-12"><label className="form-label small">API Key</label><input className="form-control" type="password" placeholder={account._id ? "•••• (unchanged)" : ""} value={f.apiKey} onChange={(e) => set("apiKey", e.target.value)} /></div>
            <div className="col-12 small text-secondary">Webhook URL to register with Pinnacle: <code>/webhooks/whatsapp/&lt;tenantId&gt;</code></div>
          </>}
        </div></div>
        <div className="modal-footer"><button className="btn btn-outline-secondary" onClick={onClose}>Cancel</button><button className="btn btn-wa" disabled={!f.label} onClick={() => onSave(clean())}>Save</button></div>
      </div></div></div></>
  );
}

function Integrations() {
  const toast = useToast();
  const list = useApi(() => integrationsApi.list(), []);
  async function toggle(it) {
    try { await integrationsApi.update(it._id, { connected: !it.connected, account: !it.connected ? "Connected just now" : null }); toast(it.connected ? "Disconnected" : "Connected"); list.reload(); }
    catch (e) { toast(e.message, "error"); }
  }
  return (
    <div className="row g-3">
      {list.loading ? <Spinner /> : (list.data || []).map((it) => (
        <div className="col-md-6" key={it._id}>
          <div className="card h-100"><div className="card-body d-flex gap-3">
            <span className="d-grid" style={{ width: 40, height: 40, placeItems: "center", background: "var(--wa-green-soft)", color: "var(--wa-green-dark)", borderRadius: 8 }}><i className={`bi bi-${it.icon || "plug"}`}></i></span>
            <div className="flex-grow-1">
              <div className="d-flex justify-content-between"><span className="fw-semibold">{it.name}</span>{it.connected ? <span className="badge text-bg-success">Connected</span> : <span className="badge text-bg-light">Off</span>}</div>
              <div className="text-secondary small mb-2">{it.desc}</div>
              {it.account && <div className="small font-monospace text-secondary mb-2">{it.account}</div>}
              <button className={"btn btn-sm " + (it.connected ? "btn-outline-secondary" : "btn-wa")} onClick={() => toggle(it)}>{it.connected ? "Disconnect" : "Connect"}</button>
            </div>
          </div></div>
        </div>
      ))}
    </div>
  );
}

function AcademicSessions() {
  const toast = useToast();
  const list = useApi(() => sessionsApi.list(), []);
  const [form, setForm] = useState({ name: "", startDate: "01-04-2026", endDate: "31-03-2027" });

  const parseDDMMYYYY = (dateStr) => {
    const parts = dateStr.split('-');
    if (parts.length !== 3) return null;
    const day = parseInt(parts[0]);
    const month = parseInt(parts[1]);
    const year = parseInt(parts[2]);
    if (day < 1 || day > 31 || month < 1 || month > 12 || year < 1900) return null;
    return new Date(year, month - 1, day);
  };

  const formatDateToDDMMYYYY = (dateStr) => {
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  async function add() {
    if (!form.name || !form.startDate || !form.endDate) return;
    const startDate = parseDDMMYYYY(form.startDate);
    const endDate = parseDDMMYYYY(form.endDate);
    if (!startDate || !endDate) {
      toast("Invalid date format. Use dd-mm-yyyy", "error");
      return;
    }
    if (startDate >= endDate) {
      toast("From Date must be before To Date", "error");
      return;
    }
    try {
      const startYear = startDate.getFullYear();
      const endYear = endDate.getFullYear();
      const startDateStr = `${startYear}-${String(startDate.getMonth() + 1).padStart(2, '0')}-${String(startDate.getDate()).padStart(2, '0')}`;
      const endDateStr = `${endYear}-${String(endDate.getMonth() + 1).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`;
      await sessionsApi.create({ name: form.name, startDate: startDateStr, endDate: endDateStr, startYear, endYear });
      toast("Added");
      setForm({ name: "", startDate: "01-04-2026", endDate: "31-03-2027" });
      list.reload();
    } catch (e) { toast(e.message, "error"); }
  }

  async function remove(id) { if (confirm("Delete?")) { try { await sessionsApi.remove(id); toast("Deleted"); list.reload(); } catch (e) { toast(e.message, "error"); } } }

  return (
    <div className="card" style={{ borderRadius: "16px" }}>
      <div className="card-header bg-white fw-semibold">Academic Sessions/Years</div>
      <div className="card-body">
        <div style={{ display: "flex", gap: "8px", marginBottom: "16px", alignItems: "flex-end" }}>
          <div style={{ flex: 1 }}>
            <label className="form-label small fw-semibold mb-2">Session Name</label>
            <input className="form-control form-control-sm" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div style={{ flex: 1 }}>
            <label className="form-label small fw-semibold mb-2">From Date</label>
            <input className="form-control form-control-sm" placeholder="dd-mm-yyyy" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
          </div>
          <div style={{ flex: 1 }}>
            <label className="form-label small fw-semibold mb-2">To Date</label>
            <input className="form-control form-control-sm" placeholder="dd-mm-yyyy" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
          </div>
          <button className="btn btn-sm btn-wa" onClick={add} style={{ padding: "6px 12px", whiteSpace: "nowrap" }} title="Add session"><i className="bi bi-plus-lg"></i></button>
        </div>
        <table className="table table-sm"><thead><tr><th>Session</th><th>From Date</th><th>To Date</th><th></th></tr></thead><tbody>{(list.data || []).map((s) => <tr key={s._id}><td>{s.name}</td><td style={{ fontSize: 13 }}>{formatDateToDDMMYYYY(s.startDate || s.startYear + "-04-01")}</td><td style={{ fontSize: 13 }}>{formatDateToDDMMYYYY(s.endDate || s.endYear + "-03-31")}</td><td className="text-end"><button className="btn btn-sm btn-link text-danger" onClick={() => remove(s._id)}><i className="bi bi-trash"></i></button></td></tr>)}</tbody></table>
      </div>
    </div>
  );
}

function Grades() {
  const toast = useToast();
  const list = useApi(() => gradesApi.list(), []);
  const [form, setForm] = useState({ name: "" });
  async function add() { if (!form.name) return; try { await gradesApi.create(form); toast("Added"); setForm({ name: "" }); list.reload(); } catch (e) { toast(e.message, "error"); } }
  async function remove(id) { if (confirm("Delete?")) { try { await gradesApi.remove(id); toast("Deleted"); list.reload(); } catch (e) { toast(e.message, "error"); } } }
  return (
    <div className="card" style={{ marginBottom: 0, borderRadius: "16px" }}>
      <div className="card-header bg-white fw-semibold" style={{ padding: "10px 16px" }}>Grades</div>
      <div className="card-body" style={{ padding: "12px 16px" }}>
        <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
          <input className="form-control form-control-sm" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={{ flex: 1 }} />
          <button className="btn btn-sm btn-wa" onClick={add} style={{ padding: "6px 12px", whiteSpace: "nowrap" }} title="Add grade"><i className="bi bi-plus-lg"></i></button>
        </div>
        <table className="table table-sm" style={{ marginBottom: 0 }}><tbody>{(list.data || []).map((g) => <tr key={g._id}><td style={{ padding: "8px 0" }}>{g.name}</td><td className="text-end" style={{ padding: "8px 0" }}><button className="btn btn-sm btn-link text-danger" onClick={() => remove(g._id)}><i className="bi bi-trash"></i></button></td></tr>)}</tbody></table>
      </div>
    </div>
  );
}

function Teams() {
  const toast = useToast();
  const list = useApi(() => teamsApi.list(), []);
  const users = useApi(() => usersApi.users(), []);
  const sources = useApi(() => mastersApi.sources(), []);
  const [edit, setEdit] = useState(null);
  const [viewMembers, setViewMembers] = useState(null);
  async function save(f) { try { if (f._id) await teamsApi.update(f._id, f); else await teamsApi.create(f); toast("Saved"); setEdit(null); list.reload(); } catch (e) { toast(e.message, "error"); } }
  async function remove(id) { if (confirm("Delete?")) { try { await teamsApi.remove(id); toast("Deleted"); list.reload(); } catch (e) { toast(e.message, "error"); } } }
  return (
    <div className="card" style={{ borderRadius: "16px" }}>
      <div className="card-header d-flex justify-content-between"><span className="fw-semibold">Teams</span><button className="btn btn-sm btn-wa" onClick={() => setEdit({ name: "", manager: "", members: [], sources: [] })}>Add team</button></div>
      <table className="table mb-0 align-middle"><thead><tr><th>Team</th><th>Manager</th><th>Members</th><th></th></tr></thead>
        <tbody>{(list.data || []).map((t) => <tr key={t._id}><td className="fw-medium">{t.name}</td><td className="small">{t.manager?.name || "—"}</td><td className="small"><button style={{ background: "none", border: "none", color: "var(--accent)", cursor: "pointer", padding: 0, textDecoration: "underline" }} onClick={() => setViewMembers(t)}>{t.members?.length || 0} members</button></td><td className="text-end"><button className="btn btn-sm btn-link" onClick={() => setEdit(t)}><i className="bi bi-pencil"></i></button><button className="btn btn-sm btn-link text-danger" onClick={() => remove(t._id)}><i className="bi bi-trash"></i></button></td></tr>)}</tbody>
      </table>
      {edit && <TeamModal team={edit} users={users.data || []} sources={sources.data || []} onClose={() => setEdit(null)} onSave={save} />}
      {viewMembers && <MembersModal team={viewMembers} onClose={() => setViewMembers(null)} />}
    </div>
  );
}

function MembersModal({ team, onClose }) {
  return (
    <>
      <div className="modal-backdrop fade show" onClick={onClose}></div>
      <div className="modal d-block"><div className="modal-dialog"><div className="modal-content">
        <div className="modal-header"><h5 className="modal-title">{team.name} - Team Members</h5><button className="btn-close" onClick={onClose}></button></div>
        <div className="modal-body">
          {(!team.members || team.members.length === 0) ? (
            <div className="text-muted text-center py-4">No members assigned</div>
          ) : (
            <ul className="list-unstyled">
              {team.members.map((m, idx) => (
                <li key={idx} style={{ padding: "10px 0", borderBottom: "1px solid var(--divider)", display: "flex", alignItems: "center", gap: "10px" }}>
                  <i className="bi bi-person-circle" style={{ fontSize: "20px", color: "var(--accent)" }}></i>
                  <span style={{ fontSize: "14px" }}>{m.user?.name || "Unknown"}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="modal-footer"><button className="btn btn-secondary" onClick={onClose}>Close</button></div>
      </div></div></div>
    </>
  );
}

function MultiSelectDropdown({ options, selected, onChange, label, isRequired }) {
  const [open, setOpen] = useState(false);
  const selectedItems = options.filter(o => selected.includes(o._id));

  return (
    <div style={{ position: "relative" }}>
      <button
        type="button"
        style={{
          width: "100%",
          padding: "8px 12px",
          border: "1px solid var(--border-2)",
          borderRadius: "16px",
          background: "white",
          textAlign: "left",
          cursor: "pointer",
          borderColor: isRequired && !selected.length ? "#fca5a5" : undefined
        }}
        onClick={() => setOpen(!open)}
      >
        <div style={{ fontSize: 14, color: selected.length > 0 ? "var(--text)" : "var(--muted)" }}>
          {selected.length === 0 ? "Select members..." : `${selected.length} selected`}
        </div>
      </button>

      {open && (
        <>
          <div style={{ position: "fixed", inset: 0, zIndex: 999 }} onClick={() => setOpen(false)}></div>
          <div
            style={{
              position: "absolute",
              top: "100%",
              left: 0,
              right: 0,
              background: "white",
              border: "1px solid var(--border)",
              borderRadius: "16px",
              marginTop: "4px",
              maxHeight: "220px",
              overflowY: "auto",
              zIndex: 1000,
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
            }}
          >
            {options.map((o) => (
              <div key={o._id} style={{ display: "flex", alignItems: "center", padding: "8px 12px", borderBottom: "1px solid var(--divider)", cursor: "pointer" }} onClick={() => onChange(selected.includes(o._id) ? selected.filter(s => s !== o._id) : [...selected, o._id])}>
                <input type="checkbox" checked={selected.includes(o._id)} onChange={() => {}} style={{ marginRight: "8px", cursor: "pointer" }} />
                <span style={{ fontSize: 13 }}>{o.name}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function TeamModal({ team, users, sources, onClose, onSave }) {
  const [f, setF] = useState({ _id: team._id, name: team.name || "", manager: team.manager?._id || "", members: (team.members || []).map(m => m._id || m), sources: (team.sources || []).map(s => s._id || s) });
  const [membersOpen, setMembersOpen] = useState(false);
  const [sourcesOpen, setSourcesOpen] = useState(false);

  const canSave = f.name && f.manager && f.members && f.members.length > 0;

  const handleSave = () => {
    const data = {
      ...f,
      members: f.members || [],
      sources: f.sources || []
    };
    onSave(data);
  };

  return (
    <><div className="modal-backdrop fade show"></div><div className="modal d-block"><div className="modal-dialog modal-lg"><div className="modal-content">
      <div className="modal-header"><h5 className="modal-title">{team._id ? "Edit" : "Add"} team</h5><button className="btn-close" onClick={onClose}></button></div>
      <div className="modal-body"><div className="row g-3">
        <div className="col-12"><label className="form-label small">Team name <span style={{ color: "#dc2626" }}>*</span></label><input className="form-control" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="Enter team name" /></div>
        <div className="col-12"><label className="form-label small">Manager <span style={{ color: "#dc2626" }}>*</span></label><select className="form-select" value={f.manager} onChange={(e) => setF({ ...f, manager: e.target.value })}><option value="">— Select Manager —</option>{users.map((u) => <option key={u._id} value={u._id}>{u.name}</option>)}</select></div>
        <div className="col-6"><label className="form-label small">Team Members <span style={{ color: "#dc2626" }}>*</span></label><MultiSelectDropdown options={users} selected={f.members} onChange={(members) => setF({ ...f, members })} isRequired={!f.members.length} />{!f.members.length && <div style={{ color: "#dc2626", fontSize: "12px", marginTop: "4px" }}>At least one team member is required</div>}</div>
        <div className="col-6"><label className="form-label small">Mapped sources</label><MultiSelectDropdown options={sources} selected={f.sources} onChange={(sources) => setF({ ...f, sources })} isRequired={false} /></div>
      </div></div>
      <div className="modal-footer"><button className="btn btn-outline-secondary" onClick={onClose}>Cancel</button><button className="btn btn-wa" disabled={!canSave} onClick={handleSave}>Save</button></div>
    </div></div></div></>
  );
}

function WorkflowsTab() {
  const [subTab, setSubTab] = useState("assignment");
  const SUB_TABS = [{ value: "assignment", label: "Lead Assignment" }, { value: "alerts", label: "Alerts" }, { value: "conversion", label: "Lead Conversion" }];
  return (
    <div>
      <div className="mb-3"><Tabs tabs={SUB_TABS} value={subTab} onChange={setSubTab} /></div>
      {subTab === "assignment" && <LeadAssignment />}
      {subTab === "alerts" && <AlertsWorkflow />}
      {subTab === "conversion" && <div className="card"><div className="card-body text-center text-muted py-5">Lead Conversion Workflow coming soon...</div></div>}
    </div>
  );
}

function LeadAssignment() {
  const toast = useToast();
  const workflow = useApi(() => workflowsApi.list().then((res) => (res.find((w) => w.type === "LeadAssignment") || {})), []);
  const teams = useApi(() => teamsApi.list(), []);
  const sources = useApi(() => mastersApi.sources(), []);
  const config = useApi(() => workflowConfigApi.get(), []);
  const [f, setF] = useState({ strategy: "round_robin", teamId: "", sourceMap: [], stateMap: [], cityMap: [], gradeMap: [] });
  async function save() { try { if (workflow.data?._id) await workflowsApi.update(workflow.data._id, { ...f, type: "LeadAssignment", name: "LeadAssignment", active: true }); else await workflowsApi.create({ ...f, type: "LeadAssignment", name: "LeadAssignment", active: true }); toast("Saved"); workflow.reload(); } catch (e) { toast(e.message, "error"); } }
  return (
    <div className="card">
      <div className="card-header"><span className="fw-semibold">Lead Assignment Configuration</span><div className="text-muted small">Configure how new leads are automatically assigned to team members</div></div>
      <div className="card-body">
        <label className="form-label small fw-semibold mb-3">Strategy</label>
        <div className="row g-2 mb-4">
          {(config.data?.ASSIGNMENT_STRATEGIES || []).map((s) => <div className="col-md-6" key={s.key}><div className="form-check"><input className="form-check-input" type="radio" checked={f.strategy === s.key} onChange={() => setF({ ...f, strategy: s.key })} id={"strat" + s.key} /><label className="form-check-label" htmlFor={"strat" + s.key}>{s.label}</label></div></div>)}
        </div>
        {f.strategy === "round_robin" && <div className="mb-3"><label className="form-label small">Team</label><select className="form-select" value={f.teamId} onChange={(e) => setF({ ...f, teamId: e.target.value })}><option value="">— Select —</option>{(teams.data || []).map((t) => <option key={t._id} value={t._id}>{t.name}</option>)}</select></div>}
        <div className="d-flex gap-2"><button className="btn btn-wa" onClick={save}>Save</button></div>
      </div>
    </div>
  );
}
function AlertsWorkflow() {
  return (
    <div className="card">
      <div className="card-header"><span className="fw-semibold">Alert Workflows</span><div className="text-muted small">Define automated alerts and actions based on lead events</div></div>
      <div className="card-body text-center text-muted py-5">Alerts configuration coming soon...</div>
    </div>
  );
}

function RegistrationFormConfig() {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const config = useApi(() => workflowConfigApi.get("registrationForms"), []);
  const statuses = useApi(() => mastersApi.statuses(), []);
  const templates = useApi(() => templatesApi.list({ perPage: 100 }), []);
  const [forms, setForms] = useState([]);
  const [filter, setFilter] = useState("");
  const [activeForm, setActiveForm] = useState(null);

  const getFormsData = (raw) => {
    const data = raw?.data || raw;
    return Array.isArray(data) ? data : data?.forms || [];
  };

  useEffect(() => {
    setForms(getFormsData(config.data));
  }, [config.data]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("mode") !== "editor") {
      setActiveForm(null);
    }
  }, [location.search]);

  const saveConfig = async (nextForms) => {
    try {
      await workflowConfigApi.save("registrationForms", { forms: nextForms });
      toast("Registration form configuration saved");
      config.reload();
      setForms(nextForms);
    } catch (e) {
      toast(e.message, "error");
    }
  };



  const openNewForm = () => {
    const f = {
      _id: undefined,
      formTitle: "",
      formType: null,
      formCategory: "registration",
      formColumns: 2,
      steps: [],
      isActive: true
    };
    setActiveForm(f);
    navigate("/crm/setup?active=registration-form&mode=editor", { state: { form: f } });
  };

  const openEditForm = (form) => {
    const f = {
      ...form,
      formTitle: form.formTitle || form.name || "",
      formType: form.formType || "single",
      formCategory: form.formCategory || "registration",
      formColumns: form.formColumns || 2,
      steps: form.steps || [],
      isActive: form.isActive !== false
    };
    setActiveForm(f);
    navigate("/crm/setup?active=registration-form&mode=editor", { state: { form: f } });
  };

  const openPreviewForm = (form) => {
    const f = {
      ...form,
      formTitle: form.formTitle || form.name || "",
      formType: form.formType || "single",
      formCategory: form.formCategory || "registration",
      formColumns: form.formColumns || 2,
      steps: form.steps || [],
      isActive: form.isActive !== false
    };
    setActiveForm(f);
    navigate("/crm/setup?active=registration-form&mode=editor&startScreen=preview_only", { state: { form: f } });
  };

  const closeEditor = () => {
    navigate("/crm/setup?active=registration-form&mode=list");
  };

  const saveForm = async (formData) => {
    if (!formData.formTitle || !formData.formTitle.trim()) {
      toast("Form title is required", "error");
      return;
    }

    const formToSave = {
      ...formData,
      _id: formData._id || `${Date.now()}`,
      name: formData.formTitle.trim(),
      createdAt: formData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: formData.isActive !== false
    };

    const nextForms = formData._id
      ? forms.map((f) => (f._id === formData._id ? formToSave : f))
      : [...forms, formToSave];

    await saveConfig(nextForms);
    closeEditor();
  };

  const deleteForm = async (formId) => {
    if (!confirm("Delete this registration form?")) return;
    const nextForms = forms.filter((f) => f._id !== formId);
    await saveConfig(nextForms);
  };


  const formatDateDMY = (value) => {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";
    const pad = (num) => String(num).padStart(2, "0");
    return `${pad(date.getDate())}-${pad(date.getMonth() + 1)}-${date.getFullYear()}`;
  };

  const filteredForms = forms.filter((f) =>
    (f.formTitle || f.name || "").toLowerCase().includes(filter.toLowerCase())
  );

  const currentForm = activeForm || location.state?.form;
  const isEditorMode = currentForm && new URLSearchParams(location.search).get("mode") === "editor";

  if (isEditorMode) {
    const startScreen = new URLSearchParams(location.search).get("startScreen");
    if (startScreen === "preview_only") {
      return (
        <RegistrationFormBuilder
          key={`${currentForm?._id}_${startScreen}`}
          initialForm={currentForm}
          onSave={saveForm}
          onCancel={closeEditor}
          statuses={statuses.data || []}
          templates={templates.data || []}
          startScreen={startScreen}
        />
      );
    }

    return (
      <div className="card" style={{ borderRadius: "16px" }}>
        <div className="card-header d-flex justify-content-between align-items-center">
          <div>
            <span className="fw-semibold">{currentForm._id ? "Edit Registration Form" : "Create Registration Form"}</span>
            <div className="text-muted small">Design your form layout and steps.</div>
          </div>
          <button className="btn btn-sm btn-outline-secondary" onClick={closeEditor}>
            Back to List
          </button>
        </div>
        <div className="card-body p-0">
          <RegistrationFormBuilder
            key={`${currentForm?._id}_${startScreen || "setup"}`}
            initialForm={currentForm}
            onSave={saveForm}
            onCancel={closeEditor}
            statuses={statuses.data || []}
            templates={templates.data || []}
            startScreen={startScreen || "setup"}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="card" style={{ borderRadius: "16px" }}>
      <div className="card-header d-flex justify-content-between align-items-center">
        <div>
          <span className="fw-semibold">Registration Forms</span>
          <div className="text-muted small">Manage enrollment registration workflows, stepper steps and fields.</div>
        </div>
        <button className="btn btn-sm btn-wa" onClick={openNewForm}>
          <i className="bi bi-plus-lg me-1"></i>Create Registration Form
        </button>
      </div>

      <ErrorBox error={config.error} />

      {config.loading ? (
        <div className="card-body"><Spinner /></div>
      ) : (
        <div className="card-body">
          <div className="row gy-3 mb-4">
            <div className="col-sm-6">
              <input
                className="form-control"
                placeholder="Filter by form name"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              />
            </div>
            <div className="col-sm-6 text-sm-end text-muted align-self-center">
              {filteredForms.length} form{filteredForms.length === 1 ? "" : "s"} found
            </div>
          </div>

          {filteredForms.length === 0 ? (
            <div className="text-center text-muted py-5">
              <div className="mb-3"><i className="bi bi-folder2-open" style={{ fontSize: "32px", opacity: 0.5 }}></i></div>
              <div>No registration forms yet.</div>
              <button className="btn btn-sm btn-outline-wa mt-2" onClick={openNewForm}>Create your first registration form</button>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table mb-0 align-middle">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Columns</th>
                    <th>Steps</th>
                    <th>Status</th>
                    <th>Updated</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredForms.map((form) => (
                    <tr key={form._id}>
                      <td>
                        <span className="fw-semibold text-dark d-block">{form.formTitle || form.name}</span>
                        <span className="text-muted text-capitalize" style={{ fontSize: "11px" }}>
                          Category: {form.formCategory || "registration"}
                        </span>
                      </td>
                      <td>
                        <span className="badge bg-light text-secondary border">
                          {form.formType === "stepper" ? "Multi-Step" : "Single Page"}
                        </span>
                      </td>
                      <td>{form.formColumns || 2} Cols</td>
                      <td>{(form.steps || []).length} Step{(form.steps || []).length === 1 ? "" : "s"}</td>
                      <td>
                        <span className="badge" style={{ background: form.isActive ? "#e6f4ea" : "#f3f2f1", color: form.isActive ? "#10714a" : "#6b6b6b" }}>
                          {form.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td>{form.updatedAt ? formatDateDMY(form.updatedAt) : "—"}</td>
                      <td className="text-end">
                        <div className="d-flex justify-content-end" style={{ gap: "4px" }}>
                          <IconBtn icon="eye" title="Preview form" onClick={() => openPreviewForm(form)} />
                          <IconBtn icon="pencil" title="Edit form" onClick={() => openEditForm(form)} />
                          <IconBtn icon="trash" title="Delete form" danger onClick={() => deleteForm(form._id)} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const ENQUIRY_FORM_DEFAULT_FIELDS = [
  { fieldName: "studentName", label: "Student Name", fieldType: "text", isRequired: true, selected: true },
  { fieldName: "mobileNumber", label: "Mobile Number", fieldType: "phone", isRequired: true, selected: true },
  { fieldName: "emailId", label: "Email Id", fieldType: "email", isRequired: false, selected: true },
  { fieldName: "courseInterested", label: "Course Interested", fieldType: "text", isRequired: false, selected: true },
  { fieldName: "enquirySource", label: "Enquiry Source", fieldType: "text", isRequired: false, selected: true }
];

const ENQUIRY_FIELD_TYPES = [
  { value: "text", label: "Text" },
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone" },
  { value: "number", label: "Number" },
  { value: "textarea", label: "Textarea" },
  { value: "select", label: "Dropdown" },
  { value: "date", label: "Date" },
  { value: "checkbox", label: "Checkbox" }
];



const LANDING_PAGE_TEMPLATES = [
  {
    id: "blank",
    name: "Blank Screen (Start from Scratch)",
    description: "Start with an empty page canvas and drag/add elements to design your own page.",
    accentColor: "#64748b",
    config: {
      brandName: "My Brand",
      heroTitle: "Build Something Beautiful",
      heroSubtitle: "Design your custom layout by dragging and editing blocks.",
      heroCtaLabel: "Learn More",
      heroCtaLink: "#contact",
      accentColor: "#64748b",
      highlightTitle: "Key Highlights",
      features: [],
      components: []
    }
  },
  {
    id: "clarwyn",
    name: "Clarwyn Academy (Modern & Elegant)",
    description: "Sleek blue theme suited for K-12 private academies and international schools.",
    accentColor: "#0085a8",
    config: {
      brandName: "Clarwyn Academy",
      heroTitle: "Empowering Future Leaders",
      heroSubtitle: "Experience a values-driven, future-ready curriculum designed for academic excellence and holistic development.",
      heroCtaLabel: "Schedule a Tour",
      heroCtaLink: "#contact",
      accentColor: "#0085a8",
      highlightTitle: "Why Clarwyn Stands Out",
      features: [
        "Innovative STEM & Robotics labs",
        "State-of-the-art sports complex",
        "Personalized mentorship and university counseling"
      ]
    }
  },
  {
    id: "bright-horizon",
    name: "Bright Horizon Preschool (Warm & Playful)",
    description: "Bright orange theme designed for early-years, preschools, and kindergartens.",
    accentColor: "#e65c00",
    config: {
      brandName: "Bright Horizon Kindergarten",
      heroTitle: "Where Joyful Learning Begins",
      heroSubtitle: "A nurturing space for little minds to explore, play, and grow with creative child-centric learning methods.",
      heroCtaLabel: "Book a Free Trial Class",
      heroCtaLink: "#contact",
      accentColor: "#e65c00",
      highlightTitle: "A Safe & Caring Space",
      features: [
        "Play-based international curriculum",
        "Eco-friendly sensory classrooms",
        "Healthy, nutritious child-friendly meals"
      ]
    }
  },
  {
    id: "apex-tech",
    name: "Apex Tech Institute (Professional & Tech)",
    description: "Indigo theme tailored for universities, professional courses, and technical bootcamps.",
    accentColor: "#3f51b5",
    config: {
      brandName: "Apex Tech Institute",
      heroTitle: "Accelerate Your Tech Career",
      heroSubtitle: "Industry-aligned bootcamps, hands-on coding labs, and dedicated placement support to get you hired.",
      heroCtaLabel: "Apply for Scholarship",
      heroCtaLink: "#contact",
      accentColor: "#3f51b5",
      highlightTitle: "Apex Academy Advantages",
      features: [
        "1-on-1 industry engineering mentors",
        "Guaranteed interview opportunities",
        "24/7 access to high-performance labs"
      ]
    }
  }
];

function LandingPageTab() {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const [activePage, setActivePage] = useState(null);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [previewPage, setPreviewPage] = useState(null);

  const enquiryFormsConfig = useApi(() => workflowConfigApi.get("enquiryForms"), []);
  const formsList = enquiryFormsConfig?.data?.data?.forms || enquiryFormsConfig?.data?.forms || [];

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("mode") !== "editor") {
      setActivePage(null);
    }
  }, [location.search]);

  const openNewLandingPage = () => {
    navigate("/crm/setup?active=landing-page&mode=wizard");
  };

  const handleSelectTemplate = (template) => {
    setShowTemplateModal(false);
    const newPage = {
      _id: undefined,
      name: `New ${template.name}`,
      ...template.config,
      isActive: true
    };
    setActivePage(newPage);
    navigate("/crm/setup?active=landing-page&mode=editor", { state: { page: newPage } });
  };

  const openEditLandingPage = (page) => {
    const p = {
      ...DEFAULT_LANDING_PAGE_CONFIG,
      ...page,
      features: page.features || [...DEFAULT_LANDING_PAGE_CONFIG.features]
    };
    setActivePage(p);
    navigate("/crm/setup?active=landing-page&mode=editor", { state: { page: p } });
  };

  const openPreviewLandingPage = (page) => {
    setPreviewPage(page);
  };

  const closeLandingPageEditor = () => {
    navigate("/crm/setup?active=landing-page&mode=list");
  };

  const saveLandingPage = async (pageData) => {
    try {
      const configRes = await workflowConfigApi.get("landingPages");
      const doc = configRes?.data || configRes;
      const dataPayload = doc?.data || doc;
      const currentPages = Array.isArray(dataPayload) ? dataPayload : dataPayload?.pages || [];

      const pageToSave = {
        ...pageData,
        _id: pageData._id || `lp-${Date.now()}`,
        createdAt: pageData.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const isExisting = pageData._id && currentPages.some((p) => p._id === pageData._id);
      const nextPages = isExisting
        ? currentPages.map((p) => (p._id === pageData._id ? pageToSave : p))
        : [...currentPages, pageToSave];

      await workflowConfigApi.save("landingPages", { pages: nextPages });
      toast("Landing page saved successfully");
      closeLandingPageEditor();
    } catch (e) {
      toast(e.message, "error");
    }
  };

  const currentPage = activePage || location.state?.page;
  const currentMode = new URLSearchParams(location.search).get("mode") || "list";
  const isLandingPageEditor = currentPage && currentMode === "editor";
  const isLandingPageWizard = currentMode === "wizard";

  return (
    <>
      {isLandingPageEditor ? (
        <LandingPageBuilder
          key={`${currentPage?._id || "new"}`}
          initialPage={currentPage}
          formsList={formsList}
          onSave={saveLandingPage}
          onCancel={closeLandingPageEditor}
        />
      ) : isLandingPageWizard ? (
        <LandingPageWizard
          onSelect={(selectedConfig) => {
            const newPage = {
              _id: undefined,
              name: selectedConfig.name,
              pageType: selectedConfig.pageType,
              ...selectedConfig.config,
              isActive: true
            };
            setActivePage(newPage);
            navigate("/crm/setup?active=landing-page&mode=editor", { state: { page: newPage } });
          }}
          onCancel={closeLandingPageEditor}
        />
      ) : (
        <LandingPageList
          onCreate={openNewLandingPage}
          onEdit={openEditLandingPage}
          onPreview={openPreviewLandingPage}
        />
      )}

      {previewPage && (
        <Modal
          size="xl"
          title={previewPage.name || "Landing Page Preview"}
          onClose={() => setPreviewPage(null)}
          bodyStyle={{ padding: 0, background: "transparent" }}
          footer={<button className="btn btn-outline-secondary" type="button" onClick={() => setPreviewPage(null)}>Close</button>}
        >
          <iframe
            src={`${window.location.origin}/public/landing-page/${previewPage._id}`}
            title={`Preview ${previewPage.name}`}
            style={{ width: "100%", minHeight: "680px", border: "none", borderRadius: 0 }}
          />
        </Modal>
      )}

      {showTemplateModal && (
        <Modal
          title="Select a Landing Page Template"
          onClose={() => setShowTemplateModal(false)}
        >
          <div className="d-flex flex-column gap-3">
            {LANDING_PAGE_TEMPLATES.map((template) => (
              <div
                key={template.id}
                className="card p-3 border-2 hover-shadow"
                style={{
                  cursor: "pointer",
                  borderRadius: "12px",
                  transition: "all 0.2s ease-in-out",
                  borderLeft: `5px solid ${template.accentColor}`,
                  border: "1px solid #e2e8f0"
                }}
                onClick={() => handleSelectTemplate(template)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = template.accentColor;
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.06)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#e2e8f0";
                  e.currentTarget.style.transform = "none";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="fw-bold mb-1" style={{ color: "var(--dark)" }}>{template.name}</h6>
                    <p className="text-muted small mb-0">{template.description}</p>
                  </div>
                  <span
                    className="badge px-3 py-2 text-white"
                    style={{ background: template.accentColor, borderRadius: "6px" }}
                  >
                    Select
                  </span>
                </div>
                <div className="mt-3 p-2 bg-light rounded" style={{ borderLeft: `3px solid ${template.accentColor}` }}>
                  <div className="small fw-semibold text-secondary">Hero Title Preview:</div>
                  <div className="text-dark fw-bold">"{template.config.heroTitle}"</div>
                </div>
              </div>
            ))}
          </div>
        </Modal>
      )}
    </>
  );
}

function LandingPageList({ onCreate, onEdit, onPreview }) {
  const toast = useToast();
  const config = useApi(() => workflowConfigApi.get("landingPages"), []);
  const [pages, setPages] = useState([]);
  const [filter, setFilter] = useState("");

  const getPagesData = (raw) => {
    const data = raw?.data || raw;
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.pages)) return data.pages;
    return [];
  };

  useEffect(() => {
    setPages(getPagesData(config.data));
  }, [config.data]);

  const deletePage = async (pageId) => {
    if (!window.confirm("Are you sure you want to delete this landing page?")) return;
    const nextPages = pages.filter((p) => p._id !== pageId);
    try {
      await workflowConfigApi.save("landingPages", { pages: nextPages });
      toast("Landing page deleted");
      config.reload();
      setPages(nextPages);
    } catch (e) {
      toast(e.message, "error");
    }
  };

  const filteredPages = pages.filter((p) =>
    p && (p.name || p.brandName || "").toLowerCase().includes(filter.toLowerCase())
  );

  const formatDateDMY = (value) => {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";
    const pad = (num) => String(num).padStart(2, "0");
    return `${pad(date.getDate())}-${pad(date.getMonth() + 1)}-${date.getFullYear()}`;
  };

  return (
    <div className="card" style={{ borderRadius: "16px" }}>
      <div className="card-header d-flex justify-content-between align-items-center">
        <div>
          <span className="fw-semibold">Landing Pages</span>
          <div className="text-muted small">Manage marketing campaign landing pages, headers, highlights, and enquiry triggers.</div>
        </div>
        <button className="btn btn-sm btn-wa" onClick={onCreate}>
          <i className="bi bi-plus-lg me-1"></i>Create Landing Page
        </button>
      </div>

      <ErrorBox error={config.error} />

      {config.loading ? (
        <div className="card-body"><Spinner /></div>
      ) : (
        <div className="card-body">
          <div className="row gy-3 mb-4">
            <div className="col-sm-6">
              <input
                className="form-control"
                placeholder="Filter by landing page name..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              />
            </div>
            <div className="col-sm-6 text-sm-end text-muted align-self-center">
              {filteredPages.length} landing page{filteredPages.length === 1 ? "" : "s"} found
            </div>
          </div>

          {filteredPages.length === 0 ? (
            <div className="text-center text-muted py-5">
              <div className="mb-3"><i className="bi bi-browser-chrome" style={{ fontSize: "32px", opacity: 0.5 }}></i></div>
              <div>No landing pages yet.</div>
              <button className="btn btn-sm btn-outline-wa mt-2" onClick={onCreate}>Create your first landing page</button>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table mb-0 align-middle">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Brand Name</th>
                    <th>Hero CTA</th>
                    <th>Highlights</th>
                    <th>Status</th>
                    <th>Updated</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPages.map((page) => (
                    <tr key={page._id}>
                      <td><span className="fw-semibold text-dark">{page.name || "Untitled Landing Page"}</span></td>
                      <td>{page.brandName || "—"}</td>
                      <td>
                        <span className="badge bg-light text-secondary border">
                          {page.heroCtaLabel || "Book a Visit"}
                        </span>
                      </td>
                      <td>{(page.features || []).length} items</td>
                      <td>
                        <span className="badge" style={{ background: page.isActive !== false ? "#e6f4ea" : "#f3f2f1", color: page.isActive !== false ? "#10714a" : "#6b6b6b" }}>
                          {page.isActive !== false ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td>{page.updatedAt ? formatDateDMY(page.updatedAt) : "—"}</td>
                      <td className="text-end">
                        <div className="d-flex justify-content-end" style={{ gap: "4px" }}>
                          <IconBtn icon="eye" title="Preview page" onClick={() => onPreview(page)} />
                          <IconBtn icon="pencil" title="Edit page" onClick={() => onEdit(page)} />
                          <IconBtn icon="trash" title="Delete page" danger onClick={() => deletePage(page._id)} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );}

function EnquiryFormConfig() {
  const navigate = useNavigate();
  const toast = useToast();
  const config = useApi(() => workflowConfigApi.get("enquiryForms"), []);
  const [forms, setForms] = useState([]);
  const [filter, setFilter] = useState("");
  const [activeForm, setActiveForm] = useState(null);
  const [previewForm, setPreviewForm] = useState(null);

  const getEnquiryConfigData = (raw) => {
    const data = raw?.data || raw;
    return Array.isArray(data) ? data : data?.forms || data?.fields || [];
  };

  useEffect(() => {
    setForms(getEnquiryConfigData(config.data));
  }, [config.data]);

  const saveConfig = async (nextForms) => {
    try {
      const updatedForms = nextForms.map((form) => ({
        ...form,
        updatedAt: form.updatedAt || new Date().toISOString(),
        createdAt: form.createdAt || form.updatedAt || new Date().toISOString()
      }));
      await workflowConfigApi.save("enquiryForms", { forms: updatedForms });
      toast("Enquiry form configuration saved");
      config.reload();
      setForms(updatedForms);
    } catch (e) {
      toast(e.message, "error");
    }
  };

  const openNewForm = () => {
    navigate("/crm/setup/enquiry-forms/new");
  };

  const openEditForm = (form) => {
    navigate(`/crm/setup/enquiry-forms/${form._id}`);
  };

  const openPreview = (form) => setPreviewForm(form);
  const closePreview = () => setPreviewForm(null);

  const saveForm = async () => {
    if (!activeForm.name.trim()) {
      toast("Form name is required", "error");
      return;
    }

    const normalizedFields = (activeForm.fields || []).map((field) => ({
      fieldName: String(field.fieldName || field.label || "").trim().replace(/[^a-zA-Z0-9_]/g, "_").replace(/^_+|_+$/g, ""),
      label: String(field.label || "").trim(),
      fieldType: field.fieldType || "text",
      isRequired: Boolean(field.isRequired),
      selected: Boolean(field.selected),
      hidden: Boolean(field.hidden),
      defaultValue: field.defaultValue || "",
      options: Array.isArray(field.options) ? field.options : []
    }));

    const formToSave = {
      ...activeForm,
      name: activeForm.name.trim(),
      heading: String(activeForm.heading || activeForm.name || "").trim(),
      tagline: String(activeForm.tagline || "").trim(),
      isActive: activeForm.isActive !== false,
      fields: normalizedFields,
      updatedAt: new Date().toISOString(),
      createdAt: activeForm.createdAt || new Date().toISOString(),
      _id: activeForm._id || `${Date.now()}`
    };

    const nextForms = activeForm._id
      ? forms.map((form) => (form._id === activeForm._id ? formToSave : form))
      : [...forms, formToSave];

    await saveConfig(nextForms);
    setActiveForm(null);
  };

  const deleteForm = async (formId) => {
    if (!confirm("Delete this enquiry form?")) return;
    const nextForms = forms.filter((form) => form._id !== formId);
    await saveConfig(nextForms);
  };

  const formatDateDMY = (value) => {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";
    const pad = (num) => String(num).padStart(2, "0");
    return `${pad(date.getDate())}-${pad(date.getMonth() + 1)}-${date.getFullYear()}`;
  };

  const getShortSharePath = (formId) => `/public/enquiry-form/${formId}`;
  const getShareUrl = (formId) => `${window.location.origin}${getShortSharePath(formId)}`;
  const copyShareLink = async (formId) => {
    try {
      await navigator.clipboard.writeText(getShareUrl(formId));
      toast("Link copied");
    } catch (e) {
      toast(e.message || "Unable to copy link", "error");
    }
  };

  const filteredForms = forms.filter((form) => form.name.toLowerCase().includes(filter.toLowerCase()));

  return (
    <div className="card" style={{ borderRadius: "16px" }}>
      <div className="card-header d-flex justify-content-between align-items-center">
        <div>
          <span className="fw-semibold">Enquiry Forms</span>
          <div className="text-muted small">Create named enquiry forms for campaigns and manage saved templates.</div>
        </div>
        {!activeForm && (
          <button className="btn btn-sm btn-wa" onClick={openNewForm}>
            <i className="bi bi-plus-lg me-1"></i>Create Enquiry Form
          </button>
        )}
      </div>

      <ErrorBox error={config.error} />

      {config.loading ? (
        <div className="card-body"><Spinner /></div>
      ) : activeForm ? (
        <div className="card-body">
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
            <div>
              <button className="btn btn-sm btn-outline-secondary me-2" onClick={() => setActiveForm(null)}>Back to forms</button>
              <span className="fw-semibold">{activeForm._id ? "Edit enquiry form" : "Create enquiry form"}</span>
            </div>
            <div className="form-check form-switch">
              <input
                className="form-check-input"
                type="checkbox"
                id="formActive"
                checked={activeForm.isActive}
                onChange={(e) => setActiveForm({ ...activeForm, isActive: e.target.checked })}
              />
              <label className="form-check-label" htmlFor="formActive">Active</label>
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label">Form Name</label>
            <input
              className="form-control"
              value={activeForm.name}
              onChange={(e) => setActiveForm({ ...activeForm, name: e.target.value })}
              placeholder="e.g. Admission Enquiry"
            />
          </div>

          <div className="mb-4">
            <label className="form-label">Form Heading</label>
            <input
              className="form-control"
              value={activeForm.heading || ""}
              onChange={(e) => setActiveForm({ ...activeForm, heading: e.target.value })}
              placeholder="e.g. Admission Enquiry"
            />
          </div>

          <div className="mb-4">
            <label className="form-label">Tagline</label>
            <input
              className="form-control"
              value={activeForm.tagline || ""}
              onChange={(e) => setActiveForm({ ...activeForm, tagline: e.target.value })}
              placeholder="e.g. Share your details and we'll follow up with you."
            />
          </div>

          {activeForm._id && (
            <div className="alert alert-light border mb-4">
              <div className="d-flex justify-content-between align-items-start gap-2">
                <div>
                  <div className="small text-muted mb-1">Short link</div>
                  <div className="text-break fw-medium">{getShortSharePath(activeForm._id)}</div>
                </div>
                <button className="btn btn-sm btn-outline-secondary p-1" type="button" onClick={() => copyShareLink(activeForm._id)} title="Copy short link">
                  <i className="bi bi-clipboard"></i>
                </button>
              </div>
            </div>
          )}

          <div className="mb-3 d-flex justify-content-between align-items-center">
            <div>
              <h5 className="mb-1">Form Fields</h5>
              <div className="text-muted small">Select which fields to include and mark them mandatory as needed.</div>
            </div>
            <div className="d-flex" style={{ gap: "4px" }}>
              {activeForm._id && (
                <button className="btn btn-sm btn-outline-secondary p-1" type="button" title="Preview form" onClick={() => openPreview(activeForm)}>
                  <i className="bi bi-eye"></i>
                </button>
              )}
              <button
                className="btn btn-sm btn-wa"
                onClick={() => setActiveForm({
                  ...activeForm,
                  fields: [...activeForm.fields, { fieldName: "", label: "New Field", fieldType: "text", isRequired: false, selected: true, options: [] }]
                })}
              >
                <i className="bi bi-plus-lg me-1"></i>Add Field
              </button>
            </div>
          </div>

          {(activeForm.fields || []).length === 0 ? (
            <EmptyState title="No fields configured" subtitle="Add a field to start building this enquiry form." />
          ) : (
            <div className="table-responsive mb-4">
              <table className="table table-bordered align-middle mb-0">
                <thead>
                  <tr>
                    <th style={{ width: 50 }}></th>
                    <th>Label</th>
                    <th>Type</th>
                    <th style={{ width: 120 }}>Mandatory</th>
                    <th style={{ width: 80 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {activeForm.fields.map((field, idx) => (
                    <tr key={idx}>
                      <td className="text-center">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          checked={Boolean(field.selected)}
                          onChange={(e) => {
                            const next = [...activeForm.fields];
                            next[idx] = { ...field, selected: e.target.checked };
                            setActiveForm({ ...activeForm, fields: next });
                          }}
                        />
                      </td>
                      <td>
                        <input
                          className="form-control"
                          value={field.label}
                          onChange={(e) => {
                            const next = [...activeForm.fields];
                            next[idx] = { ...field, label: e.target.value };
                            setActiveForm({ ...activeForm, fields: next });
                          }}
                          placeholder="Field label"
                        />
                        <small className="text-muted">Internal name: {field.fieldName || field.label.toLowerCase().replace(/[^a-z0-9]+/g, "_")}</small>
                      </td>
                      <td>
                        <select
                          className="form-select"
                          value={field.fieldType}
                          onChange={(e) => {
                            const next = [...activeForm.fields];
                            next[idx] = { ...field, fieldType: e.target.value };
                            setActiveForm({ ...activeForm, fields: next });
                          }}
                        >
                          {ENQUIRY_FIELD_TYPES.map((type) => (
                            <option key={type.value} value={type.value}>{type.label}</option>
                          ))}
                        </select>
                      </td>
                      <td className="text-center">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          checked={Boolean(field.isRequired)}
                          onChange={(e) => {
                            const next = [...activeForm.fields];
                            next[idx] = { ...field, isRequired: e.target.checked };
                            setActiveForm({ ...activeForm, fields: next });
                          }}
                        />
                      </td>
                      <td className="text-end">
                        <button
                          className="btn btn-sm btn-link-danger"
                          onClick={() => {
                            const next = activeForm.fields.filter((_, i) => i !== idx);
                            setActiveForm({ ...activeForm, fields: next });
                          }}
                          title="Remove field"
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="d-flex gap-2">
            <button className="btn btn-wa" onClick={saveForm}>Save form</button>
            <button className="btn btn-outline-secondary" onClick={() => setActiveForm(null)}>Cancel</button>
          </div>
        </div>
      ) : (
        <div className="card-body">
          <div className="row gy-3 mb-4">
            <div className="col-sm-6">
              <input
                className="form-control"
                placeholder="Filter by form name"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              />
            </div>
            <div className="col-sm-6 text-sm-end text-muted align-self-center">
              {filteredForms.length} form{filteredForms.length === 1 ? "" : "s"} found
            </div>
          </div>

          {filteredForms.length === 0 ? (
            <div className="text-center text-muted py-5">
              <div className="mb-3"><i className="bi bi-folder2-open" style={{ fontSize: "32px", opacity: 0.5 }}></i></div>
              <div>No enquiry forms yet.</div>
              <button className="btn btn-sm btn-outline-wa mt-2" onClick={openNewForm}>Create your first enquiry form</button>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table mb-0 align-middle">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Status</th>
                    <th>Fields</th>
                    <th>Updated</th>
                    <th>Link</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredForms.map((form) => (
                    <tr key={form._id}>
                      <td>{form.name}</td>
                      <td>
                        <span className="badge" style={{ background: form.isActive ? "#e6f4ea" : "#f3f2f1", color: form.isActive ? "#10714a" : "#6b6b6b" }}>
                          {form.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td>{(form.fields || []).filter((field) => field.selected).length}</td>
                      <td>{form.updatedAt ? formatDateDMY(form.updatedAt) : "—"}</td>
                      <td className="text-break">
                        <div className="d-flex align-items-center" style={{ gap: "4px" }}>
                          <a href={getShareUrl(form._id)} target="_blank" rel="noreferrer" className="text-decoration-none">{getShortSharePath(form._id)}</a>
                          <button className="btn btn-sm btn-outline-secondary p-1" type="button" title="Copy short link" onClick={() => copyShareLink(form._id)}>
                            <i className="bi bi-clipboard"></i>
                          </button>
                        </div>
                      </td>
                      <td className="text-end">
                        <div className="d-flex justify-content-end" style={{ gap: "4px" }}>
                          <IconBtn icon="eye" title="Preview form" onClick={() => openPreview(form)} />
                          <IconBtn icon="pencil" title="Edit form" onClick={() => openEditForm(form)} />
                          <IconBtn icon="trash" title="Delete form" danger onClick={() => deleteForm(form._id)} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
      {previewForm && (
        <Modal
          size="xl"
          title={previewForm.name || "Enquiry Form"}
          onClose={closePreview}
          bodyStyle={{ padding: 0, background: "transparent" }}
          footer={<button className="btn btn-outline-secondary" type="button" onClick={closePreview}>Close</button>}
        >
          <iframe
            src={getShareUrl(previewForm._id)}
            title={`Preview ${previewForm.name}`}
            style={{ width: "100%", minHeight: "680px", border: "none", borderRadius: 0 }}
          />
        </Modal>
      )}
    </div>
  );
}

function IntegrationPlaceholder({ title }) {
  return (
    <div className="card">
      <div className="card-header bg-white fw-semibold">{title}</div>
      <div className="card-body text-center text-muted py-5">{title} configuration coming soon...</div>
    </div>
  );
}

function CommunicationTemplatesConfig() {
  const toast = useToast();
  const list = useApi(() => templatesApi.list({ perPage: 100 }), []);
  const [activeTab, setActiveTab] = useState("email");
  const [filter, setFilter] = useState("");
  const [editTemplate, setEditTemplate] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const rows = (list.data || []).filter(
    (t) => (t.channel || "whatsapp") === activeTab
  );

  const filteredRows = rows.filter(
    (t) =>
      (t.name || "").toLowerCase().includes(filter.toLowerCase()) ||
      (t.body || "").toLowerCase().includes(filter.toLowerCase())
  );

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this template?")) return;
    try {
      await templatesApi.remove(id);
      toast("Template deleted successfully");
      list.reload();
    } catch (e) {
      toast(e.message, "error");
    }
  };

  const handleEdit = (template) => {
    setEditTemplate({
      ...template,
      subject: template.subject || "",
      language: template.language || "en",
      category: template.category || "Utility",
      body: template.body || "",
      status: template.status || "Draft"
    });
    setShowForm(true);
  };

  const handleCreate = () => {
    setEditTemplate({
      _id: undefined,
      name: "",
      channel: activeTab,
      subject: "",
      language: "en",
      category: "Utility",
      body: "",
      status: "Draft"
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!editTemplate.name || !editTemplate.name.trim()) {
      toast("Template name is required", "error");
      return;
    }
    if (!editTemplate.body || !editTemplate.body.trim()) {
      toast("Template body is required", "error");
      return;
    }

    try {
      if (editTemplate._id) {
        await templatesApi.update(editTemplate._id, editTemplate);
        toast("Template updated successfully");
      } else {
        await templatesApi.create(editTemplate);
        toast("Template created successfully");
      }
      setShowForm(false);
      setEditTemplate(null);
      list.reload();
    } catch (e) {
      toast(e.message, "error");
    }
  };

  const formatDateDMY = (value) => {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";
    const pad = (num) => String(num).padStart(2, "0");
    return `${pad(date.getDate())}-${pad(date.getMonth() + 1)}-${date.getFullYear()}`;
  };

  const tTabLabel = activeTab === "email" ? "Email" : activeTab === "whatsapp" ? "WhatsApp" : "SMS";

  return (
    <div className="card" style={{ borderRadius: "16px" }}>
      <div className="card-header d-flex justify-content-between align-items-center">
        <div>
          <span className="fw-semibold">Communication Templates</span>
          <div className="text-muted small">Manage templates for automated Email, WhatsApp, and SMS messages.</div>
        </div>
        <button className="btn btn-sm btn-wa" onClick={handleCreate}>
          <i className="bi bi-plus-lg me-1"></i>Create {tTabLabel} Template
        </button>
      </div>

      <div className="card-body">
        <div className="mb-4">
          <Tabs
            tabs={[
              { value: "email", label: "Email Templates" },
              { value: "whatsapp", label: "WhatsApp Templates" },
              { value: "sms", label: "SMS Templates" }
            ]}
            value={activeTab}
            onChange={(val) => {
              setActiveTab(val);
              setFilter("");
            }}
          />
        </div>

        <div className="row gy-3 mb-4">
          <div className="col-sm-6">
            <input
              className="form-control"
              placeholder={`Search ${tTabLabel} templates...`}
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
          <div className="col-sm-6 text-sm-end text-muted align-self-center">
            {filteredRows.length} template{filteredRows.length === 1 ? "" : "s"} found
          </div>
        </div>

        <ErrorBox error={list.error} />

        {list.loading ? (
          <Spinner />
        ) : filteredRows.length === 0 ? (
          <div className="text-center text-muted py-5">
            <div className="mb-3"><i className="bi bi-chat-text" style={{ fontSize: "32px", opacity: 0.5 }}></i></div>
            <div>No templates configured.</div>
            <button className="btn btn-sm btn-outline-wa mt-2" onClick={handleCreate}>Create your first template</button>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table mb-0 align-middle">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Category</th>
                  {activeTab === "email" && <th>Subject</th>}
                  <th>Content</th>
                  <th>Status</th>
                  <th>Updated</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((t) => (
                  <tr key={t._id}>
                    <td>
                      <code style={{ fontSize: "11px", background: "var(--surface-light)", padding: "2px 4px", borderRadius: "4px" }}>
                        {t.name}
                      </code>
                    </td>
                    <td>
                      <span className="badge bg-light text-secondary border">{t.category || "Utility"}</span>
                    </td>
                    {activeTab === "email" && <td><span className="fw-medium text-dark">{t.subject || "—"}</span></td>}
                    <td>
                      <span
                        className="small text-muted text-truncate d-inline-block"
                        style={{ maxWidth: 280 }}
                        title={t.body}
                      >
                        {(t.body || "").replace(/<[^>]+>/g, " ")}
                      </span>
                    </td>
                    <td>
                      <span
                        className="badge"
                        style={{
                          background:
                            t.status === "Approved"
                              ? "#e6f4ea"
                              : t.status === "Pending"
                              ? "#fef7e0"
                              : t.status === "Rejected"
                              ? "#fce8e6"
                              : "#f3f2f1",
                          color:
                            t.status === "Approved"
                              ? "#10714a"
                              : t.status === "Pending"
                              ? "#b06000"
                              : t.status === "Rejected"
                              ? "#c5221f"
                              : "#6b6b6b"
                        }}
                      >
                        {t.status || "Draft"}
                      </span>
                    </td>
                    <td>{t.updatedAt ? formatDateDMY(t.updatedAt) : "—"}</td>
                    <td className="text-end">
                      <div className="d-flex justify-content-end" style={{ gap: "4px" }}>
                        <IconBtn icon="pencil" title="Edit" onClick={() => handleEdit(t)} />
                        <IconBtn icon="trash" title="Delete" danger onClick={() => handleDelete(t._id)} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showForm && editTemplate && (
        <Modal
          title={editTemplate._id ? `Edit ${tTabLabel} Template` : `Create ${tTabLabel} Template`}
          onClose={() => {
            setShowForm(false);
            setEditTemplate(null);
          }}
          footer={
            <>
              <button
                className="btn btn-outline-secondary me-2"
                onClick={() => {
                  setShowForm(false);
                  setEditTemplate(null);
                }}
              >
                Cancel
              </button>
              <button className="btn btn-wa" onClick={handleSave}>
                Save
              </button>
            </>
          }
        >
          <div className="row g-3">
            <div className="col-12">
              <label className="form-label fw-semibold">Template Name</label>
              <input
                className="form-control"
                value={editTemplate.name}
                onChange={(e) => setEditTemplate({ ...editTemplate, name: e.target.value.replace(/\s+/g, "_") })}
                placeholder="e.g. registration_ack_v1"
                disabled={Boolean(editTemplate._id)}
              />
              <small className="text-muted">Use snake_case, e.g. payment_reminder</small>
            </div>
            {activeTab === "email" && (
              <div className="col-12">
                <label className="form-label fw-semibold">Email Subject</label>
                <input
                  className="form-control"
                  value={editTemplate.subject}
                  onChange={(e) => setEditTemplate({ ...editTemplate, subject: e.target.value })}
                  placeholder="e.g. Welcome to EduNext Admission Portal"
                />
              </div>
            )}
            <div className="col-md-6">
              <label className="form-label fw-semibold">Language</label>
              <input
                className="form-control"
                value={editTemplate.language}
                onChange={(e) => setEditTemplate({ ...editTemplate, language: e.target.value })}
                placeholder="en"
              />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold">Category</label>
              <select
                className="form-select"
                value={editTemplate.category}
                onChange={(e) => setEditTemplate({ ...editTemplate, category: e.target.value })}
              >
                <option value="Utility">Utility</option>
                <option value="Marketing">Marketing</option>
                <option value="Authentication">Authentication</option>
              </select>
            </div>
            {activeTab === "whatsapp" && (
              <div className="col-12">
                <label className="form-label fw-semibold">Meta Status</label>
                <select
                  className="form-select"
                  value={editTemplate.status}
                  onChange={(e) => setEditTemplate({ ...editTemplate, status: e.target.value })}
                >
                  <option value="Approved">Approved</option>
                  <option value="Pending">Pending</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Draft">Draft</option>
                </select>
              </div>
            )}
            <div className="col-12">
              <label className="form-label fw-semibold">
                {activeTab === "email" ? "Body (HTML allowed)" : "Body Content"}
              </label>
              <textarea
                className="form-control"
                rows={6}
                value={editTemplate.body}
                onChange={(e) => setEditTemplate({ ...editTemplate, body: e.target.value })}
                placeholder={
                  activeTab === "email"
                    ? "<h1>Dear {{1}},</h1><p>We received your application...</p>"
                    : "Hi {{1}}, we have received your application for grade {{2}}."
                }
              />
              <small className="text-muted">
                Use {"{{1}}"}, {"{{2}}"} as placeholder variables.
              </small>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
