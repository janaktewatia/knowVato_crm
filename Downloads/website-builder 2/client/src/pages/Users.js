import { useEffect, useState } from "react";
import api from "../api/client";
import useList from "../hooks/useList";
import PageHeader from "../components/PageHeader";
import Toolbar from "../components/Toolbar";
import Pagination from "../components/Pagination";
import EmptyState from "../components/EmptyState";
import Loader from "../components/Loader";

const blank = { name: "", email: "", password: "", employeeType: "", isActive: true };

export default function Users() {
  const list = useList("/users", { initialFilters: { sort: "-createdAt" }, limit: 12 });
  const [types, setTypes] = useState([]);
  const [form, setForm] = useState(blank);
  const [editing, setEditing] = useState(null);

  useEffect(() => { api.get("/employee-types").then((r) => setTypes(r.data.items)); }, []);

  const openNew = () => { setEditing(null); setForm(blank); };
  const openEdit = (u) => { setEditing(u._id); setForm({ name: u.name, email: u.email, password: "", employeeType: u.employeeType?._id || "", isActive: u.isActive }); };

  const submit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        const payload = { name: form.name, employeeType: form.employeeType, isActive: form.isActive };
        if (form.password) payload.password = form.password;
        await api.put(`/users/${editing}`, payload);
      } else {
        await api.post("/users", form);
      }
      list.refetch();
    } catch (err) { alert(err.response?.data?.message || "Failed"); }
  };

  const remove = async (u) => {
    if (!window.confirm(`Delete ${u.name}?`)) return;
    try { await api.delete(`/users/${u._id}`); list.refetch(); }
    catch (e) { alert(e.response?.data?.message || "Cannot delete"); }
  };

  return (
    <>
      <PageHeader icon="bi-people" title="Users" subtitle="Create users and assign employee types">
        <button className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#userModal" onClick={openNew}><i className="bi bi-plus-lg me-1" />New User</button>
      </PageHeader>
      <Toolbar search={list.search} onSearch={list.onSearch} filters={[]} />

      {list.loading ? <Loader /> : list.items.length === 0 ? (
        <EmptyState icon="bi-people" title="No users" text="Create your first user." />
      ) : (
        <div className="card stat-card">
          <div className="table-responsive">
            <table className="table table-hover align-middle m-0">
              <thead className="table-light"><tr><th>Name</th><th>Email</th><th>Employee Type</th><th>Status</th><th className="text-end">Actions</th></tr></thead>
              <tbody>
                {list.items.map((u) => (
                  <tr key={u._id}>
                    <td><i className="bi bi-person-circle me-2 text-muted" />{u.name}{u.isSuperAdmin && <span className="badge bg-dark ms-2">Super Admin</span>}</td>
                    <td className="small">{u.email}</td>
                    <td>{u.isSuperAdmin ? <span className="text-muted small">All access</span> : <span className="badge bg-light text-dark">{u.employeeType?.name || "—"}</span>}</td>
                    <td><span className={`badge ${u.isActive ? "bg-success" : "bg-secondary"}`}>{u.isActive ? "Active" : "Inactive"}</span></td>
                    <td className="text-end">
                      <div className="btn-group btn-group-sm">
                        <button className="btn btn-outline-primary" data-bs-toggle="modal" data-bs-target="#userModal" onClick={() => openEdit(u)} disabled={u.isSuperAdmin}><i className="bi bi-pencil" /></button>
                        <button className="btn btn-outline-danger" onClick={() => remove(u)} disabled={u.isSuperAdmin}><i className="bi bi-trash" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="card-body py-2"><Pagination page={list.page} pages={list.pages} total={list.total} onPage={list.setPage} /></div>
        </div>
      )}

      <div className="modal fade" id="userModal" tabIndex="-1">
        <div className="modal-dialog"><div className="modal-content">
          <form onSubmit={submit}>
            <div className="modal-header"><h5 className="modal-title"><i className={`bi ${editing ? "bi-pencil" : "bi-person-plus"} me-2`} />{editing ? "Edit" : "New"} User</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" /></div>
            <div className="modal-body row g-3">
              <div className="col-12"><label className="form-label small">Name *</label><input className="form-control" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div className="col-12"><label className="form-label small">Email *</label><input type="email" className="form-control" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} disabled={!!editing} /></div>
              <div className="col-12"><label className="form-label small">{editing ? "New Password (leave blank to keep)" : "Password *"}</label><input type="password" className="form-control" required={!editing} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} autoComplete="new-password" /></div>
              <div className="col-12"><label className="form-label small">Employee Type</label>
                <select className="form-select" value={form.employeeType} onChange={(e) => setForm({ ...form, employeeType: e.target.value })}>
                  <option value="">— Select type —</option>
                  {types.map((t) => <option key={t._id} value={t._id}>{t.name}</option>)}
                </select></div>
              <div className="col-12"><div className="form-check"><input className="form-check-input" type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} id="uActive" /><label className="form-check-label small" htmlFor="uActive">Active</label></div></div>
            </div>
            <div className="modal-footer"><button type="button" className="btn btn-light" data-bs-dismiss="modal">Cancel</button><button className="btn btn-primary" data-bs-dismiss="modal">{editing ? "Save" : "Create"}</button></div>
          </form>
        </div></div>
      </div>
    </>
  );
}
