import { useEffect, useState } from "react";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import PageHeader from "../components/PageHeader";
import EmptyState from "../components/EmptyState";
import Loader from "../components/Loader";

const ACTIONS = ["view", "create", "edit", "delete"];

export default function EmployeeTypes() {
  const { perms } = useAuth();
  const modules = perms.modules || [];
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [edit, setEdit] = useState(null); // type being edited/created

  const emptyPerms = () => Object.fromEntries(modules.map((m) => [m.key, { view: false, create: false, edit: false, delete: false }]));

  const load = () => { setLoading(true); api.get("/employee-types").then((r) => { setTypes(r.data.items); setLoading(false); }); };
  useEffect(() => { load(); }, []);

  const openNew = () => setEdit({ name: "", description: "", permissions: emptyPerms() });
  const openEdit = (t) => setEdit({ ...t, permissions: { ...emptyPerms(), ...(t.permissions || {}) } });

  const save = async () => {
    if (!edit.name.trim()) return alert("Name is required");
    if (edit._id) await api.put(`/employee-types/${edit._id}`, edit);
    else await api.post("/employee-types", edit);
    setEdit(null); load();
  };
  const remove = async (t) => {
    if (!window.confirm(`Delete "${t.name}"?`)) return;
    try { await api.delete(`/employee-types/${t._id}`); load(); }
    catch (e) { alert(e.response?.data?.message || "Cannot delete"); }
  };

  const toggle = (mk, action) => setEdit((e) => ({
    ...e,
    permissions: { ...e.permissions, [mk]: { ...e.permissions[mk], [action]: !e.permissions[mk][action] } },
  }));
  const toggleRow = (mk, val) => setEdit((e) => ({
    ...e, permissions: { ...e.permissions, [mk]: { view: val, create: val, edit: val, delete: val } },
  }));
  const toggleCol = (action, val) => setEdit((e) => {
    const p = { ...e.permissions };
    modules.forEach((m) => { p[m.key] = { ...p[m.key], [action]: val }; });
    return { ...e, permissions: p };
  });

  // ---- Editor ----
  if (edit) {
    return (
      <>
        <button className="btn btn-link px-0 mb-2" onClick={() => setEdit(null)}><i className="bi bi-arrow-left me-1" />Back</button>
        <PageHeader icon="bi-person-badge" title={edit._id ? "Edit Employee Type" : "New Employee Type"}>
          <button className="btn btn-primary" onClick={save}><i className="bi bi-save me-1" />Save</button>
        </PageHeader>
        <div className="card stat-card mb-3">
          <div className="card-body row g-3">
            <div className="col-md-5"><label className="form-label small">Type Name *</label>
              <input className="form-control" value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} placeholder="e.g. Content Manager" /></div>
            <div className="col-md-7"><label className="form-label small">Description</label>
              <input className="form-control" value={edit.description} onChange={(e) => setEdit({ ...edit, description: e.target.value })} /></div>
          </div>
        </div>
        <div className="card stat-card">
          <div className="card-header"><i className="bi bi-shield-check me-1" />Module Access Rights</div>
          <div className="table-responsive">
            <table className="table table-hover align-middle m-0">
              <thead className="table-light">
                <tr>
                  <th>Module</th>
                  {ACTIONS.map((a) => (
                    <th key={a} className="text-center text-capitalize" style={{ width: 90 }}>
                      {a}<br /><button className="btn btn-link btn-sm p-0" style={{ fontSize: ".7rem" }} onClick={() => toggleCol(a, true)}>all</button>
                      {" / "}<button className="btn btn-link btn-sm p-0 text-secondary" style={{ fontSize: ".7rem" }} onClick={() => toggleCol(a, false)}>none</button>
                    </th>
                  ))}
                  <th className="text-center" style={{ width: 70 }}>Row</th>
                </tr>
              </thead>
              <tbody>
                {modules.map((m) => {
                  const row = edit.permissions[m.key] || { view: false, create: false, edit: false, delete: false };
                  const allOn = ACTIONS.every((a) => row[a]);
                  return (
                    <tr key={m.key}>
                      <td><i className={`bi ${m.icon} me-2 text-muted`} />{m.label}</td>
                      {ACTIONS.map((a) => (
                        <td key={a} className="text-center">
                          <input type="checkbox" className="form-check-input" checked={!!row[a]} onChange={() => toggle(m.key, a)} />
                        </td>
                      ))}
                      <td className="text-center">
                        <button className="btn btn-sm btn-outline-secondary py-0" onClick={() => toggleRow(m.key, !allOn)}>{allOn ? "clear" : "all"}</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </>
    );
  }

  // ---- List ----
  return (
    <>
      <PageHeader icon="bi-person-badge" title="Employee Types" subtitle="Define roles and their module access">
        <button className="btn btn-primary" onClick={openNew}><i className="bi bi-plus-lg me-1" />New Type</button>
      </PageHeader>
      {loading ? <Loader /> : types.length === 0 ? (
        <EmptyState icon="bi-person-badge" title="No employee types" text="Create your first type." />
      ) : (
        <div className="row g-3">
          {types.map((t) => {
            const granted = Object.values(t.permissions || {}).filter((p) => p && (p.view || p.create || p.edit || p.delete)).length;
            return (
              <div className="col-md-6 col-xl-4" key={t._id}>
                <div className="card stat-card h-100">
                  <div className="card-body">
                    <div className="d-flex justify-content-between">
                      <h5 className="card-title mb-1">{t.name}</h5>
                      {t.isSystem && <span className="badge bg-info-subtle text-info">System</span>}
                    </div>
                    <p className="small text-muted mb-2">{t.description || "—"}</p>
                    <p className="small mb-3"><i className="bi bi-grid me-1" />{granted} module(s) with access</p>
                    <div className="btn-group btn-group-sm w-100">
                      <button className="btn btn-outline-primary" onClick={() => openEdit(t)} disabled={t.isSystem}><i className="bi bi-pencil me-1" />Edit</button>
                      <button className="btn btn-outline-danger" onClick={() => remove(t)} disabled={t.isSystem}><i className="bi bi-trash" /></button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
