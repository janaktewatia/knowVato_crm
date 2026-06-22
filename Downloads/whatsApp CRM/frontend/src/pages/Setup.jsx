import { useState } from "react";
import { mastersApi, usersApi, integrationsApi, waAccountsApi, servicesApi } from "../api";
import { useApi } from "../hooks/useApi";
import { useToast } from "../context/ToastContext";
import { PageHeader, Spinner, ErrorBox, EmptyState, Tabs, Modal, IconBtn } from "../components/ui";

const TABS = [
  { value: "services", label: "Services" },
  { value: "status", label: "Lead Statuses" }, { value: "sub", label: "Sub-statuses" }, { value: "sources", label: "Sources" },
  { value: "types", label: "User Types" }, { value: "users", label: "Users" },
  { value: "whatsapp", label: "WhatsApp Accounts" }, { value: "integrations", label: "Integrations" },
];
const COLORS = ["#0085a8", "#00586f", "#2e7d57", "#9a6700", "#b3261e", "#1f5f8b", "#5b4b8a", "#7a5c2e", "#41505f", "#6b7280"];

export default function Setup() {
  const [tab, setTab] = useState("services");
  return (
    <div>
      <PageHeader title="Setup" subtitle="Masters, users, permissions and integrations" />
      <div className="mb-3"><Tabs tabs={TABS} value={tab} onChange={setTab} /></div>
      {tab === "services" && <ServicesMaster />}
      {tab === "status" && <StatusMaster />}
      {tab === "sub" && <SubStatusMaster />}
      {tab === "sources" && <SourceMaster />}
      {tab === "types" && <UserTypes />}
      {tab === "users" && <Users />}
      {tab === "whatsapp" && <WhatsAppAccounts />}
      {tab === "integrations" && <Integrations />}
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
  async function remove(id) { if (confirm("Delete this service?")) { try { await servicesApi.remove(id); toast("Deleted"); list.reload(); } catch (e) { toast(e.message, "error"); } } }
  return (
    <div className="card">
      <div className="card-header d-flex justify-content-between align-items-center">
        <div><span className="fw-semibold">Services</span><div className="text-muted small">Pipelines a lead can be in. Each can have its own statuses.</div></div>
        <button className="btn btn-sm btn-wa" onClick={() => setEdit({ name: "", color: COLORS[0], icon: "grid", isRecurring: false })}>Add service</button>
      </div>
      <ErrorBox error={list.error} />
      <div className="table-responsive"><table className="table mb-0 align-middle">
        <thead><tr><th>Service</th><th>Frequency</th><th></th></tr></thead>
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
        <Modal title={edit._id ? "Edit service" : "Add service"} onClose={() => setEdit(null)}
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

function StatusMaster() {
  const toast = useToast();
  const list = useApi(() => mastersApi.statuses(), []);
  const [edit, setEdit] = useState(null);
  const services = useApi(() => servicesApi.list(), []);
  const svcMap = Object.fromEntries((services.data || []).map((s) => [s._id, s]));
  async function save(f) {
    try {
      const payload = { ...f, service: f.service || null };
      if (f._id) await mastersApi.updateStatus(f._id, payload);
      else await mastersApi.createStatus({ ...payload, order: (list.data?.length || 0) + 1 });
      toast("Saved"); setEdit(null); list.reload();
    } catch (e) { toast(e.message, "error"); }
  }
  async function remove(id) { if (confirm("Delete status?")) { try { await mastersApi.removeStatus(id); toast("Deleted"); list.reload(); } catch (e) { toast(e.message, "error"); } } }
  return (
    <div className="card">
      <div className="card-header d-flex justify-content-between"><div><span className="fw-semibold">Lead statuses</span><div className="text-muted small">"Shared" statuses apply to every service; or scope a status to one service.</div></div><button className="btn btn-sm btn-wa" onClick={() => setEdit({ name: "", color: COLORS[0], followUpRequired: true, service: "" })}>Add</button></div>
      <ErrorBox error={list.error} />
      <div className="table-responsive"><table className="table mb-0 align-middle">
        <thead><tr><th>Status</th><th>Service</th><th>Follow-up</th><th>Type</th><th></th></tr></thead>
        <tbody>
          {list.loading ? <tr><td colSpan={5}><Spinner /></td></tr> : (list.data || []).map((s) => (
            <tr key={s._id}>
              <td><span className="pill" style={{ background: s.color + "22", color: s.color }}>{s.name}</span></td>
              <td>{s.service ? <span className="pill"><i className={`bi bi-${svcMap[s.service]?.icon || "grid"} me-1`}></i>{svcMap[s.service]?.name || "—"}</span> : <span className="text-muted small">Shared</span>}</td>
              <td>{s.followUpRequired ? <span className="pill" style={{ background: "var(--warn-bg)", color: "var(--warn)" }}>Required</span> : <span className="pill">Optional</span>}</td>
              <td>{s.isWon ? <span className="pill" style={{ background: "var(--ok-bg)", color: "var(--ok)" }}>Won</span> : s.isLost ? <span className="pill" style={{ background: "var(--err-bg)", color: "var(--err)" }}>Lost</span> : <span className="pill">Open</span>}</td>
              <td className="text-end"><IconBtn icon="pencil" onClick={() => setEdit(s)} />{!s.isWon && !s.isLost && <IconBtn icon="trash" danger onClick={() => remove(s._id)} />}</td>
            </tr>
          ))}
        </tbody>
      </table></div>
      {edit && <StatusModal status={edit} services={services.data || []} onClose={() => setEdit(null)} onSave={save} />}
    </div>
  );
}

function StatusModal({ status, services, onClose, onSave }) {
  const [f, setF] = useState({ _id: status._id, name: status.name || "", color: status.color || COLORS[0], followUpRequired: status.followUpRequired !== false, service: status.service || "", isWon: status.isWon || false, isLost: status.isLost || false });
  return (
    <Modal title={status._id ? "Edit status" : "Add status"} onClose={onClose}
      footer={<><button className="btn btn-outline-secondary" onClick={onClose}>Cancel</button><button className="btn btn-wa" disabled={!f.name} onClick={() => onSave(f)}>Save</button></>}>
      <label className="form-label">Name</label><input className="form-control mb-3" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
      <label className="form-label">Applies to</label>
      <select className="form-select mb-3" value={f.service} onChange={(e) => setF({ ...f, service: e.target.value })}>
        <option value="">Shared (all services)</option>
        {(services || []).map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
      </select>
      <label className="form-label">Colour</label>
      <div className="d-flex flex-wrap gap-2 mb-3">{COLORS.map((c) => <button key={c} onClick={() => setF({ ...f, color: c })} style={{ width: 28, height: 28, borderRadius: 6, background: c, border: f.color === c ? "3px solid #1f2630" : "1px solid #ccc" }} />)}</div>
      <div className="form-check mb-1"><input className="form-check-input" type="checkbox" checked={f.followUpRequired} onChange={(e) => setF({ ...f, followUpRequired: e.target.checked })} id="fur" /><label className="form-check-label small" htmlFor="fur">Follow-up required on this status</label></div>
      <div className="form-check mb-1"><input className="form-check-input" type="checkbox" checked={f.isWon} onChange={(e) => setF({ ...f, isWon: e.target.checked, isLost: false })} id="won" /><label className="form-check-label small" htmlFor="won">Counts as Won (closes the service)</label></div>
      <div className="form-check"><input className="form-check-input" type="checkbox" checked={f.isLost} onChange={(e) => setF({ ...f, isLost: e.target.checked, isWon: false })} id="lost" /><label className="form-check-label small" htmlFor="lost">Counts as Lost (closes the service)</label></div>
    </Modal>
  );
}

function SubStatusMaster() {
  const toast = useToast();
  const subs = useApi(() => mastersApi.subStatuses(), []);
  const statuses = useApi(() => mastersApi.statuses(), []);
  const [form, setForm] = useState({ status: "", name: "" });
  async function add() {
    if (!form.status || !form.name) return;
    try { await mastersApi.createSubStatus(form); toast("Added"); setForm({ status: "", name: "" }); subs.reload(); }
    catch (e) { toast(e.message, "error"); }
  }
  return (
    <div className="card">
      <div className="card-header bg-white fw-semibold">Sub-statuses</div>
      <div className="card-body">
        <div className="row g-2 mb-3">
          <div className="col-md-4"><select className="form-select form-select-sm" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}><option value="">Parent status…</option>{(statuses.data || []).map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}</select></div>
          <div className="col-md-5"><input className="form-control form-control-sm" placeholder="Sub-status name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div className="col-md-3"><button className="btn btn-sm btn-wa w-100" onClick={add}>Add sub-status</button></div>
        </div>
        <table className="table table-sm"><thead><tr><th>Parent</th><th>Sub-status</th><th></th></tr></thead>
          <tbody>
            {(subs.data || []).map((ss) => (
              <tr key={ss._id}><td className="small">{ss.status?.name || "—"}</td><td>{ss.name}</td><td className="text-end"><button className="btn btn-sm btn-link text-danger" onClick={async () => { await mastersApi.removeSubStatus(ss._id); subs.reload(); }}><i className="bi bi-trash"></i></button></td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SourceMaster() {
  const toast = useToast();
  const list = useApi(() => mastersApi.sources(), []);
  const [form, setForm] = useState({ name: "", color: COLORS[0] });
  async function add() { if (!form.name) return; try { await mastersApi.createSource(form); toast("Added"); setForm({ name: "", color: COLORS[0] }); list.reload(); } catch (e) { toast(e.message, "error"); } }
  return (
    <div className="card">
      <div className="card-header bg-white fw-semibold">Lead sources</div>
      <div className="card-body">
        <div className="row g-2 mb-3 align-items-center">
          <div className="col-md-5"><input className="form-control form-control-sm" placeholder="Source name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div className="col-md-4 d-flex gap-1">{COLORS.slice(0, 7).map((c) => <button key={c} onClick={() => setForm({ ...form, color: c })} style={{ width: 22, height: 22, borderRadius: 5, background: c, border: form.color === c ? "2px solid #333" : "1px solid #ccc" }} />)}</div>
          <div className="col-md-3"><button className="btn btn-sm btn-wa w-100" onClick={add}>Add source</button></div>
        </div>
        <table className="table table-sm"><tbody>
          {(list.data || []).map((s) => <tr key={s._id}><td><span className="d-inline-block rounded me-2" style={{ width: 10, height: 10, background: s.color }} />{s.name}</td><td className="text-end"><button className="btn btn-sm btn-link text-danger" onClick={async () => { await mastersApi.removeSource(s._id); list.reload(); }}><i className="bi bi-trash"></i></button></td></tr>)}
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
    <div className="card">
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
  const [edit, setEdit] = useState(null);
  const typeMap = Object.fromEntries((types.data || []).map((t) => [t._id, t]));
  async function save(f) {
    try { if (f._id) await usersApi.updateUser(f._id, f); else await usersApi.createUser({ ...f, passwordHash: "TempPass!23" }); toast("Saved (default password: TempPass!23)"); setEdit(null); list.reload(); }
    catch (e) { toast(e.message, "error"); }
  }
  return (
    <div className="card">
      <div className="card-header bg-white d-flex justify-content-between"><span className="fw-semibold">Users</span><button className="btn btn-sm btn-wa" onClick={() => setEdit({ name: "", email: "", userType: types.data?.[0]?._id, status: "Active" })}>Add user</button></div>
      <ErrorBox error={list.error} />
      <table className="table mb-0 align-middle"><thead><tr><th>User</th><th>Email</th><th>Type</th><th>Status</th><th></th></tr></thead>
        <tbody>
          {list.loading ? <tr><td colSpan={5}><Spinner /></td></tr> : (list.data || []).map((u) => (
            <tr key={u._id}><td className="fw-medium">{u.name}</td><td className="small font-monospace">{u.email}</td><td><span className="badge text-bg-info">{typeMap[u.userType]?.name || u.userType?.name || "—"}</span></td><td>{u.status === "Active" ? <span className="badge text-bg-success">Active</span> : <span className="badge text-bg-secondary">{u.status}</span>}</td><td className="text-end"><button className="btn btn-sm btn-link" onClick={() => setEdit({ ...u, userType: u.userType?._id || u.userType })}><i className="bi bi-pencil"></i></button></td></tr>
          ))}
        </tbody>
      </table>
      {edit && <UserModal user={edit} types={types.data || []} onClose={() => setEdit(null)} onSave={save} />}
    </div>
  );
}

function UserModal({ user, types, onClose, onSave }) {
  const [f, setF] = useState({ _id: user._id, name: user.name || "", email: user.email || "", userType: user.userType || types[0]?._id, status: user.status || "Active" });
  return (
    <><div className="modal-backdrop fade show"></div>
      <div className="modal d-block"><div className="modal-dialog"><div className="modal-content">
        <div className="modal-header"><h5 className="modal-title">{user._id ? "Edit" : "Add"} user</h5><button className="btn-close" onClick={onClose}></button></div>
        <div className="modal-body"><div className="row g-3">
          <div className="col-12"><label className="form-label small">Name</label><input className="form-control" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></div>
          <div className="col-12"><label className="form-label small">Email</label><input className="form-control" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></div>
          <div className="col-6"><label className="form-label small">User type</label><select className="form-select" value={f.userType} onChange={(e) => setF({ ...f, userType: e.target.value })}>{types.map((t) => <option key={t._id} value={t._id}>{t.name}</option>)}</select></div>
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
