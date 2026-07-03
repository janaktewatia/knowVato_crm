import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { mastersApi, servicesApi, sessionsApi, gradesApi, teamsApi, workflowsApi, workflowConfigApi, usersApi } from "../api";
import { useApi } from "../hooks/useApi";
import { useToast } from "../context/ToastContext";
import { PageHeader, Spinner, ErrorBox, EmptyState, Tabs, Modal, IconBtn } from "../components/ui";

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
      { id: "registration-form", label: "Registration Form" },
      { id: "enquiry-form", label: "Enquiry Form" },
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
    navigate(`/setup?active=${item.id}&mode=list`);
  };

  return (
    <div style={{ padding: "0" }}>
      <div style={{ display: "grid", gridTemplateColumns: "280px minmax(0, 1fr)", gap: "12px", marginBottom: "8px", padding: "0 2px" }}>
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

        <div style={{ padding: "0 0 0 0" }}>
          {selected === "offerings" && <ServicesMaster />}
          {selected === "status" && <CombinedStatusMaster />}
          {selected === "sources" && <SourceMaster />}
          {selected === "registration-form" && <RegistrationFormConfig />}
          {selected === "enquiry-form" && <EnquiryFormConfig />}
          {selected === "landing-page" && (
            mode === "editor" ? (
              <LandingPageConfig onClose={() => navigate("/setup?active=landing-page&mode=list")} />
            ) : (
              <LandingPageList onCreate={() => navigate("/setup?active=landing-page&mode=editor")} />
            )
          )}
          {selected === "sessions" && <AcademicSessions />}
          {selected === "grades" && <Grades />}
          {selected === "teams" && <Teams />}
          {selected === "workflows" && <WorkflowsTab />}
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
  const toast = useToast();
  const config = useApi(() => workflowConfigApi.get("registrationForm"), []);
  const [mode, setMode] = useState("single");
  const [fields, setFields] = useState([]);
  const [documentTypes, setDocumentTypes] = useState([]);
  const [steps, setSteps] = useState([]);
  const [editField, setEditField] = useState(null);
  const [editDoc, setEditDoc] = useState(null);
  const [editStep, setEditStep] = useState(null);
  const [showFieldForm, setShowFieldForm] = useState(false);
  const [showDocForm, setShowDocForm] = useState(false);
  const [showStepForm, setShowStepForm] = useState(false);

  useEffect(() => {
    const loadedFields = config.data?.fields || [];
    const loadedDocs = (config.data?.documentTypes || []).map((doc, idx) => ({
      _id: doc._id || doc.id || `${doc.name}-${idx}`,
      name: doc.name || "",
      description: doc.description || "",
      required: doc.required || false
    }));
    const loadedSteps = config.data?.steps || [{ title: "Registration", type: "form", fieldNames: loadedFields.map((f) => f.fieldName) }];

    setMode(config.data?.mode || "single");
    setFields(loadedFields);
    setDocumentTypes(loadedDocs);
    setSteps(loadedSteps);
  }, [config.data]);

  const FIELD_TYPES = [
    { value: "text", label: "Text" },
    { value: "email", label: "Email" },
    { value: "phone", label: "Phone" },
    { value: "number", label: "Number" },
    { value: "textarea", label: "Textarea" },
    { value: "select", label: "Dropdown" },
    { value: "date", label: "Date" },
    { value: "checkbox", label: "Checkbox" }
  ];

  const STEP_TYPES = [
    { value: "form", label: "Form Fields" },
    { value: "documents", label: "Documents" },
    { value: "interaction", label: "Interaction" },
    { value: "payment", label: "Payment" },
    { value: "status", label: "Status" }
  ];

  async function saveConfig() {
    try {
      await workflowConfigApi.save("registrationForm", {
        mode,
        fields,
        documentTypes,
        steps
      });
      toast("Registration form configuration saved");
      config.reload();
    } catch (e) {
      toast(e.message, "error");
    }
  }

  const addField = () => {
    setEditField({
      fieldName: "",
      label: "",
      fieldType: "text",
      isRequired: false,
      options: [],
      helpText: ""
    });
    setShowFieldForm(true);
  };

  const saveField = () => {
    if (!editField.fieldName || !editField.label) {
      toast("Field name and label are required", "error");
      return;
    }

    if (editField.fieldType === "select" && editField.options.length === 0) {
      toast("Dropdown fields must have at least one option", "error");
      return;
    }

    const normalizedField = { ...editField };
    delete normalizedField._idx;

    if (editField._idx !== undefined) {
      const updatedFields = [...fields];
      updatedFields[editField._idx] = normalizedField;
      setFields(updatedFields);
      setSteps((prevSteps) => prevSteps.map((step) => {
        if (step.type !== "form") return step;
        return { ...step, fieldNames: (step.fieldNames || []).filter((fieldName) => updatedFields.some((f) => f.fieldName === fieldName)) };
      }));
    } else {
      setFields((prev) => [...prev, normalizedField]);
    }

    setEditField(null);
    setShowFieldForm(false);
  };

  const removeField = (idx) => {
    if (!confirm("Remove this field?")) return;
    const removed = fields[idx];
    const updatedFields = fields.filter((_, i) => i !== idx);
    setFields(updatedFields);
    setSteps((prevSteps) => prevSteps.map((step) => {
      if (step.type !== "form") return step;
      return { ...step, fieldNames: (step.fieldNames || []).filter((fieldName) => fieldName !== removed.fieldName) };
    }));
  };

  const addDocumentType = () => {
    setEditDoc({ _id: String(Date.now()) + Math.random().toString(36).slice(2), name: "", description: "", required: false });
    setShowDocForm(true);
  };

  const saveDocumentType = () => {
    if (!editDoc.name) {
      toast("Document name is required", "error");
      return;
    }

    const normalizedDoc = { ...editDoc };
    delete normalizedDoc._idx;

    if (editDoc._idx !== undefined) {
      const updatedDocs = [...documentTypes];
      updatedDocs[editDoc._idx] = normalizedDoc;
      setDocumentTypes(updatedDocs);
    } else {
      setDocumentTypes((prev) => [...prev, normalizedDoc]);
    }

    setEditDoc(null);
    setShowDocForm(false);
  };

  const removeDocumentType = (idx) => {
    if (!confirm("Remove this document type?")) return;
    setDocumentTypes(documentTypes.filter((_, i) => i !== idx));
  };

  const addStep = () => {
    setEditStep({
      title: "New step",
      type: "form",
      fieldNames: fields.map((f) => f.fieldName),
      required: false
    });
    setShowStepForm(true);
  };

  const saveStep = () => {
    if (!editStep.title) {
      toast("Step title is required", "error");
      return;
    }

    if (editStep.type === "form" && (!editStep.fieldNames || editStep.fieldNames.length === 0)) {
      toast("Form steps must include at least one field", "error");
      return;
    }

    const normalizedStep = { ...editStep };
    delete normalizedStep._idx;

    if (editStep._idx !== undefined) {
      const updatedSteps = [...steps];
      updatedSteps[editStep._idx] = normalizedStep;
      setSteps(updatedSteps);
    } else {
      setSteps((prev) => [...prev, normalizedStep]);
    }

    setEditStep(null);
    setShowStepForm(false);
  };

  const removeStep = (idx) => {
    if (!confirm("Remove this step?")) return;
    setSteps(steps.filter((_, i) => i !== idx));
  };

  const fieldOptions = fields.map((f) => ({ value: f.fieldName, label: f.label || f.fieldName }));

  return (
    <div className="card" style={{ borderRadius: "16px" }}>
      <div className="card-header d-flex justify-content-between align-items-center">
        <div>
          <span className="fw-semibold">Registration Form</span>
          <div className="text-muted small">Customize registration flow, fields, documents, and step sequence.</div>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button className="btn btn-sm btn-outline-secondary" onClick={addStep}>
            <i className="bi bi-list-check me-1"></i>Add Step
          </button>
          <button className="btn btn-sm btn-outline-secondary" onClick={addDocumentType}>
            <i className="bi bi-file-earmark-text me-1"></i>Add Document Type
          </button>
          <button className="btn btn-sm btn-wa" onClick={addField}>
            <i className="bi bi-plus-lg me-1"></i>Add Field
          </button>
          <button className="btn btn-sm btn-primary" onClick={saveConfig}>
            <i className="bi bi-check-lg me-1"></i>Save Configuration
          </button>
        </div>
      </div>

      <ErrorBox error={config.error} />

      {config.loading ? (
        <div className="card-body"><Spinner /></div>
      ) : (
        <div className="card-body">
          <div className="mb-4">
            <label className="form-label fw-semibold">Registration Mode</label>
            <div className="d-flex gap-3">
              <div className="form-check">
                <input className="form-check-input" type="radio" id="modeSingle" name="registrationMode" checked={mode === "single"} onChange={() => setMode("single")} />
                <label className="form-check-label" htmlFor="modeSingle">Single form</label>
              </div>
              <div className="form-check">
                <input className="form-check-input" type="radio" id="modeMulti" name="registrationMode" checked={mode === "multistep"} onChange={() => setMode("multistep")} />
                <label className="form-check-label" htmlFor="modeMulti">Multi-step</label>
              </div>
            </div>
            <div className="text-muted small mt-2">Choose whether registration happens in a single page or as a step-by-step process.</div>
          </div>

          <div className="mb-5">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div><span className="fw-semibold">Fields</span><div className="text-muted small">Define the fields to display in the registration form.</div></div>
            </div>
            {fields.length === 0 ? (
              <div className="text-muted small">No fields configured yet. Add a field to begin.</div>
            ) : (
              <div className="table-responsive mb-3">
                <table className="table mb-0 align-middle" style={{ fontSize: "13px" }}>
                  <thead>
                    <tr>
                      <th>Field Name</th>
                      <th>Label</th>
                      <th>Type</th>
                      <th>Required</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {fields.map((field, idx) => {
                      const fieldTypeLabel = FIELD_TYPES.find((t) => t.value === field.fieldType)?.label || field.fieldType;
                      return (
                        <tr key={idx}>
                          <td><code style={{ fontSize: "11px", background: "var(--surface-light)", padding: "2px 4px", borderRadius: "2px" }}>{field.fieldName}</code></td>
                          <td>{field.label}</td>
                          <td><span className="badge" style={{ background: "#e3f2fd", color: "#1976d2" }}>{fieldTypeLabel}</span></td>
                          <td>{field.isRequired ? <span className="badge" style={{ background: "#ffebee", color: "#d32f2f" }}>Required</span> : <span className="text-muted small">Optional</span>}</td>
                          <td className="text-end">
                            <button className="btn btn-sm btn-link-secondary" onClick={() => { setEditField({ ...field, _idx: idx }); setShowFieldForm(true); }} title="Edit">
                              <i className="bi bi-pencil"></i>
                            </button>
                            <button className="btn btn-sm btn-link-danger" onClick={() => removeField(idx)} title="Delete">
                              <i className="bi bi-trash"></i>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="mb-5">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div><span className="fw-semibold">Document Types</span><div className="text-muted small">Add documents that should be captured or selected during registration.</div></div>
            </div>
            {documentTypes.length === 0 ? (
              <div className="text-muted small">No document types configured yet.</div>
            ) : (
              <div className="table-responsive mb-3">
                <table className="table mb-0 align-middle" style={{ fontSize: "13px" }}>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Description</th>
                      <th>Required</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {documentTypes.map((doc, idx) => (
                      <tr key={doc._id || idx}>
                        <td>{doc.name}</td>
                        <td><span className="text-muted small">{doc.description || "—"}</span></td>
                        <td>{doc.required ? <span className="badge" style={{ background: "#ffebee", color: "#d32f2f" }}>Yes</span> : <span className="text-muted small">No</span>}</td>
                        <td className="text-end">
                          <button className="btn btn-sm btn-link-secondary" onClick={() => { setEditDoc({ ...doc, _idx: idx }); setShowDocForm(true); }} title="Edit">
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button className="btn btn-sm btn-link-danger" onClick={() => removeDocumentType(idx)} title="Delete">
                            <i className="bi bi-trash"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div><span className="fw-semibold">Registration Steps</span><div className="text-muted small">Build a step sequence for multi-step registration.</div></div>
            </div>
            {steps.length === 0 ? (
              <div className="text-muted small">No steps configured. Add a step to define the registration flow.</div>
            ) : (
              <div className="table-responsive mb-3">
                <table className="table mb-0 align-middle" style={{ fontSize: "13px" }}>
                  <thead>
                    <tr>
                      <th>Order</th>
                      <th>Title</th>
                      <th>Type</th>
                      <th>Details</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {steps.map((step, idx) => (
                      <tr key={idx}>
                        <td>{idx + 1}</td>
                        <td>{step.title}</td>
                        <td>{STEP_TYPES.find((t) => t.value === step.type)?.label || step.type}</td>
                        <td>
                          {step.type === "form" ? `${(step.fieldNames || []).length} field(s)` : step.type === "documents" ? `${documentTypes.filter((doc) => doc.required).length ? "Require selected documents" : "Select documents"}` : ""}
                        </td>
                        <td className="text-end">
                          <button className="btn btn-sm btn-link-secondary" onClick={() => { setEditStep({ ...step, _idx: idx }); setShowStepForm(true); }} title="Edit">
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button className="btn btn-sm btn-link-danger" onClick={() => removeStep(idx)} title="Delete">
                            <i className="bi bi-trash"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {showFieldForm && editField && (
        <Modal
          title={editField._idx !== undefined ? "Edit Field" : "Add Field"}
          onClose={() => { setShowFieldForm(false); setEditField(null); }}
          footer={
            <>
              <button className="btn btn-outline-secondary" onClick={() => { setShowFieldForm(false); setEditField(null); }}>Cancel</button>
              <button className="btn btn-wa" onClick={saveField}>Save Field</button>
            </>
          }
        >
          <div className="mb-3">
            <label className="form-label">Field Name (internal identifier)</label>
            <input
              className="form-control"
              value={editField.fieldName}
              onChange={(e) => setEditField({ ...editField, fieldName: e.target.value })}
              placeholder="e.g., guardianName"
            />
            <small className="text-muted">Use camelCase, no spaces</small>
          </div>

          <div className="mb-3">
            <label className="form-label">Label (shown in form)</label>
            <input
              className="form-control"
              value={editField.label}
              onChange={(e) => setEditField({ ...editField, label: e.target.value })}
              placeholder="e.g., Guardian Name"
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Field Type</label>
            <select
              className="form-select"
              value={editField.fieldType}
              onChange={(e) => setEditField({ ...editField, fieldType: e.target.value })}
            >
              {FIELD_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          {editField.fieldType === "select" && (
            <div className="mb-3">
              <label className="form-label">Options (one per line)</label>
              <textarea
                className="form-control"
                rows="4"
                value={(editField.options || []).join("\n")}
                onChange={(e) => setEditField({ ...editField, options: e.target.value.split("\n").filter((o) => o.trim()) })}
                placeholder="Option 1&#10;Option 2&#10;Option 3"
              />
            </div>
          )}

          <div className="mb-3">
            <label className="form-label">Help Text (optional)</label>
            <input
              className="form-control"
              value={editField.helpText}
              onChange={(e) => setEditField({ ...editField, helpText: e.target.value })}
              placeholder="Additional guidance for the user"
            />
          </div>

          <div className="form-check">
            <input
              type="checkbox"
              className="form-check-input"
              id="requiredCheck"
              checked={editField.isRequired}
              onChange={(e) => setEditField({ ...editField, isRequired: e.target.checked })}
            />
            <label className="form-check-label" htmlFor="requiredCheck">
              This field is required
            </label>
          </div>
        </Modal>
      )}

      {showDocForm && editDoc && (
        <Modal
          title={editDoc._idx !== undefined ? "Edit Document Type" : "Add Document Type"}
          onClose={() => { setShowDocForm(false); setEditDoc(null); }}
          footer={
            <>
              <button className="btn btn-outline-secondary" onClick={() => { setShowDocForm(false); setEditDoc(null); }}>Cancel</button>
              <button className="btn btn-wa" onClick={saveDocumentType}>Save Document</button>
            </>
          }
        >
          <div className="mb-3">
            <label className="form-label">Document Name</label>
            <input
              className="form-control"
              value={editDoc.name}
              onChange={(e) => setEditDoc({ ...editDoc, name: e.target.value })}
              placeholder="e.g., ID Proof"
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Description</label>
            <input
              className="form-control"
              value={editDoc.description}
              onChange={(e) => setEditDoc({ ...editDoc, description: e.target.value })}
              placeholder="Optional notes for users"
            />
          </div>
          <div className="form-check">
            <input
              type="checkbox"
              className="form-check-input"
              id="docRequired"
              checked={editDoc.required}
              onChange={(e) => setEditDoc({ ...editDoc, required: e.target.checked })}
            />
            <label className="form-check-label" htmlFor="docRequired">
              This document is required
            </label>
          </div>
        </Modal>
      )}

      {showStepForm && editStep && (
        <Modal
          title={editStep._idx !== undefined ? "Edit Step" : "Add Step"}
          onClose={() => { setShowStepForm(false); setEditStep(null); }}
          footer={
            <>
              <button className="btn btn-outline-secondary" onClick={() => { setShowStepForm(false); setEditStep(null); }}>Cancel</button>
              <button className="btn btn-wa" onClick={saveStep}>Save Step</button>
            </>
          }
        >
          <div className="mb-3">
            <label className="form-label">Step Title</label>
            <input
              className="form-control"
              value={editStep.title}
              onChange={(e) => setEditStep({ ...editStep, title: e.target.value })}
              placeholder="e.g., Contact Info"
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Step Type</label>
            <select
              className="form-select"
              value={editStep.type}
              onChange={(e) => setEditStep({ ...editStep, type: e.target.value })}
            >
              {STEP_TYPES.map((type) => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>
          {editStep.type === "form" && (
            <div className="mb-3">
              <label className="form-label">Fields in this step</label>
              <select
                className="form-select"
                multiple
                value={editStep.fieldNames || []}
                onChange={(e) => setEditStep({ ...editStep, fieldNames: Array.from(e.target.selectedOptions).map((opt) => opt.value) })}
                style={{ minHeight: 140 }}
              >
                {fieldOptions.map((field) => (
                  <option key={field.value} value={field.value}>{field.label}</option>
                ))}
              </select>
            </div>
          )}
          {editStep.type === "documents" && (
            <div className="form-check mb-3">
              <input
                type="checkbox"
                className="form-check-input"
                id="stepDocsRequired"
                checked={editStep.required}
                onChange={(e) => setEditStep({ ...editStep, required: e.target.checked })}
              />
              <label className="form-check-label" htmlFor="stepDocsRequired">
                Require at least one document selection
              </label>
            </div>
          )}
        </Modal>
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

function LandingPageConfig() {
  const toast = useToast();
  const config = useApi(() => workflowConfigApi.get("landingPage"), []);
  const [pageConfig, setPageConfig] = useState(DEFAULT_LANDING_PAGE_CONFIG);

  useEffect(() => {
    const raw = config.data?.data || config.data;
    if (!raw || Array.isArray(raw)) return;
    setPageConfig({
      ...DEFAULT_LANDING_PAGE_CONFIG,
      ...raw,
      features: Array.isArray(raw.features) && raw.features.length ? raw.features : DEFAULT_LANDING_PAGE_CONFIG.features
    });
  }, [config.data]);

  const updateField = (field, value) => {
    setPageConfig((current) => ({ ...current, [field]: value }));
  };

  const updateFeature = (index, value) => {
    const nextFeatures = [...pageConfig.features];
    nextFeatures[index] = value;
    setPageConfig((current) => ({ ...current, features: nextFeatures }));
  };

  const addFeature = () => {
    setPageConfig((current) => ({ ...current, features: [...current.features, "New highlight"] }));
  };

  const removeFeature = (index) => {
    if (pageConfig.features.length <= 1) return;
    const nextFeatures = pageConfig.features.filter((_, i) => i !== index);
    setPageConfig((current) => ({ ...current, features: nextFeatures }));
  };

  const saveConfig = async () => {
    try {
      const payload = {
        ...pageConfig,
        features: (pageConfig.features || []).filter(Boolean)
      };
      await workflowConfigApi.save("landingPage", payload);
      toast("Landing page saved");
      config.reload();
    } catch (e) {
      toast(e.message, "error");
    }
  };

  return (
    <div className="card" style={{ borderRadius: "16px" }}>
      <div className="card-header d-flex justify-content-between align-items-start gap-3">
        <div>
          <span className="fw-semibold">Landing Page</span>
          <div className="text-muted small">Design a simple landing page for admissions, campaigns, or public enquiries.</div>
        </div>
        <div className="d-flex gap-2">
          {typeof onClose === "function" && (
            <button className="btn btn-sm btn-outline-secondary" onClick={onClose}>Back to list</button>
          )}
          <button className="btn btn-sm btn-outline-secondary" onClick={() => setPageConfig(DEFAULT_LANDING_PAGE_CONFIG)}>Reset</button>
          <button className="btn btn-sm btn-wa" onClick={saveConfig}>Save</button>
        </div>
      </div>

      <ErrorBox error={config.error} />

      <div className="card-body">
        <div className="row g-4">
          <div className="col-lg-7">
            <div className="mb-3">
              <label className="form-label">Institution / Brand Name</label>
              <input
                className="form-control"
                value={pageConfig.brandName || ""}
                onChange={(e) => updateField("brandName", e.target.value)}
                placeholder="Your Institution"
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Hero Title</label>
              <input
                className="form-control"
                value={pageConfig.heroTitle || ""}
                onChange={(e) => updateField("heroTitle", e.target.value)}
                placeholder="Welcome to a better admissions experience"
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Hero Subtitle</label>
              <textarea
                className="form-control"
                rows={3}
                value={pageConfig.heroSubtitle || ""}
                onChange={(e) => updateField("heroSubtitle", e.target.value)}
                placeholder="Describe the value of your institution or campaign"
              />
            </div>

            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <label className="form-label">CTA Label</label>
                <input
                  className="form-control"
                  value={pageConfig.heroCtaLabel || ""}
                  onChange={(e) => updateField("heroCtaLabel", e.target.value)}
                  placeholder="Book a Visit"
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">CTA Link</label>
                <input
                  className="form-control"
                  value={pageConfig.heroCtaLink || ""}
                  onChange={(e) => updateField("heroCtaLink", e.target.value)}
                  placeholder="#contact"
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label">Accent Colour</label>
              <input
                type="color"
                className="form-control form-control-color"
                value={pageConfig.accentColor || "#0085a8"}
                onChange={(e) => updateField("accentColor", e.target.value)}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Section Heading</label>
              <input
                className="form-control"
                value={pageConfig.highlightTitle || ""}
                onChange={(e) => updateField("highlightTitle", e.target.value)}
                placeholder="Why families choose us"
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Highlights</label>
              {(pageConfig.features || []).map((feature, index) => (
                <div className="d-flex gap-2 mb-2" key={`${feature}-${index}`}>
                  <input
                    className="form-control"
                    value={feature}
                    onChange={(e) => updateFeature(index, e.target.value)}
                    placeholder={`Highlight ${index + 1}`}
                  />
                  <button className="btn btn-outline-secondary" type="button" onClick={() => removeFeature(index)}>
                    <i className="bi bi-trash"></i>
                  </button>
                </div>
              ))}
              <button className="btn btn-sm btn-outline-wa" type="button" onClick={addFeature}>
                <i className="bi bi-plus-lg me-1"></i>Add highlight
              </button>
            </div>
          </div>

          <div className="col-lg-5">
            <div className="border rounded-4 p-3 shadow-sm" style={{ background: "linear-gradient(135deg, #f8fbff 0%, #eef6ff 100%)" }}>
              <div className="fw-semibold text-uppercase small" style={{ color: pageConfig.accentColor }}>
                {pageConfig.brandName || "Your Institution"}
              </div>
              <h3 className="mt-2 mb-2" style={{ color: "#14213d" }}>{pageConfig.heroTitle || "Your hero title"}</h3>
              <p className="text-muted mb-3">{pageConfig.heroSubtitle || "Add a short message for your audience here."}</p>
              <button
                className="btn btn-sm"
                style={{ background: pageConfig.accentColor, borderColor: pageConfig.accentColor, color: "#fff" }}
              >
                {pageConfig.heroCtaLabel || "Call to action"}
              </button>
              <div className="mt-4">
                <h6 className="fw-semibold">{pageConfig.highlightTitle || "Highlights"}</h6>
                <ul className="ps-3 mb-0 text-muted">
                  {(pageConfig.features || []).map((feature, index) => (
                    <li key={`${feature}-${index}`}>{feature}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="small text-muted mt-2">This preview updates as you type and saves to the setup configuration.</div>
          </div>
        </div>
      </div>
    </div>
  );
}

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
    navigate("/setup/enquiry-forms/new");
  };

  const openEditForm = (form) => {
    navigate(`/setup/enquiry-forms/${form._id}`);
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
