import { useState } from "react";
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
    id: "organization",
    icon: "people",
    title: "Organization",
    color: "#1f5f8b",
    items: [
      { id: "teams", label: "Teams" }
    ]
  },
  {
    id: "workflow",
    icon: "diagram-3",
    title: "Workflows",
    color: "#5b4b8a",
    items: [
      { id: "workflows", label: "Workflows" }
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
  const [selected, setSelected] = useState("offerings");

  return (
    <div style={{ padding: "0" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "12px", marginBottom: "8px", padding: "0 2px" }}>
        {CATEGORIES.map((cat) => (
          <div
            key={cat.id}
            style={{
              border: "1px solid var(--border)",
              borderRadius: "16px",
              padding: "12px",
              background: "var(--surface)",
              transition: "all 0.2s ease",
              display: "flex",
              flexDirection: "column",
              gap: "8px"
            }}
          >
            <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text)" }}>{cat.title}</div>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {cat.items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelected(item.id)}
                  style={{
                    padding: "6px 8px",
                    border: "none",
                    background: selected === item.id ? `${cat.color}33` : "transparent",
                    cursor: "pointer",
                    textAlign: "left",
                    fontSize: "12px",
                    color: selected === item.id ? cat.color : "var(--text-2)",
                    fontWeight: selected === item.id ? 600 : 400,
                    borderRadius: "4px"
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div style={{ padding: "0 2px" }}>
        {selected === "offerings" && <ServicesMaster />}
        {selected === "status" && <CombinedStatusMaster />}
        {selected === "sources" && <SourceMaster />}
        {selected === "sessions" && <AcademicSessions />}
        {selected === "grades" && <Grades />}
        {selected === "teams" && <Teams />}
        {selected === "workflows" && <WorkflowsTab />}
        {selected === "facebook" && <IntegrationPlaceholder title="Facebook" />}
        {selected === "google-form" && <IntegrationPlaceholder title="Google Form" />}
        {selected === "api-integration" && <IntegrationPlaceholder title="API Integration" />}
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

function IntegrationPlaceholder({ title }) {
  return (
    <div className="card">
      <div className="card-header bg-white fw-semibold">{title}</div>
      <div className="card-body text-center text-muted py-5">{title} configuration coming soon...</div>
    </div>
  );
}
