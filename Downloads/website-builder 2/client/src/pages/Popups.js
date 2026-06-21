import { useState } from "react";
import api from "../api/client";
import useList from "../hooks/useList";
import PageHeader from "../components/PageHeader";
import Toolbar from "../components/Toolbar";
import Pagination from "../components/Pagination";
import EmptyState from "../components/EmptyState";
import Loader from "../components/Loader";

const TYPES = ["announcement", "offer", "admission", "subscription"];
const typeIcon = { announcement: "bi-megaphone", offer: "bi-tag", admission: "bi-mortarboard", subscription: "bi-envelope-heart" };
const blank = { title: "", type: "announcement", image: "", content: "", buttonText: "", buttonLink: "", displayOn: "homepage", frequency: "once", status: "active", startDate: "", endDate: "" };
const toInput = (d) => d ? new Date(d).toISOString().slice(0, 10) : "";

export default function Popups() {
  const list = useList("/popups", { initialFilters: { status: "", type: "", displayOn: "", sort: "-createdAt" }, limit: 12 });
  const [form, setForm] = useState(blank);
  const [editing, setEditing] = useState(null);
  const [selected, setSelected] = useState([]);

  const openNew = () => { setEditing(null); setForm(blank); };
  const openEdit = (p) => { setEditing(p._id); setForm({ ...blank, ...p, startDate: toInput(p.startDate), endDate: toInput(p.endDate) }); };
  const submit = async (e) => {
    e.preventDefault();
    const payload = { ...form, startDate: form.startDate || null, endDate: form.endDate || null };
    if (editing) await api.put(`/popups/${editing}`, payload); else await api.post("/popups", payload);
    list.refetch();
  };
  const remove = async (id) => { if (window.confirm("Delete this popup?")) { await api.delete(`/popups/${id}`); list.refetch(); } };
  const toggleSel = (id) => setSelected((s) => s.includes(id) ? s.filter((x) => x !== id) : [...s, id]);
  const bulk = async (action) => {
    if (action === "delete" && !window.confirm(`Delete ${selected.length}?`)) return;
    await api.post("/popups/bulk", { ids: selected, action }); setSelected([]); list.refetch();
  };

  return (
    <>
      <PageHeader icon="bi-window-stack" title="Popups" subtitle="Announcements, offers & subscription popups">
        <button className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#popupModal" onClick={openNew}><i className="bi bi-plus-lg me-1" />New Popup</button>
      </PageHeader>
      <Toolbar search={list.search} onSearch={list.onSearch}
        filters={[
          { label: "Type", value: list.filters.type, onChange: (v) => list.setFilter("type", v), options: TYPES.map((t) => ({ value: t, label: t })) },
          { label: "Status", value: list.filters.status, onChange: (v) => list.setFilter("status", v), options: [{ value: "active", label: "Active" }, { value: "inactive", label: "Inactive" }] },
          { label: "Display", value: list.filters.displayOn, onChange: (v) => list.setFilter("displayOn", v), options: [{ value: "homepage", label: "Homepage" }, { value: "all", label: "All pages" }, { value: "specific", label: "Specific" }] },
        ]} />

      {selected.length > 0 && (
        <div className="alert alert-primary d-flex justify-content-between align-items-center py-2">
          <span><i className="bi bi-check2-square me-2" />{selected.length} selected</span>
          <div className="btn-group btn-group-sm">
            <button className="btn btn-outline-success" onClick={() => bulk("active")}>Activate</button>
            <button className="btn btn-outline-secondary" onClick={() => bulk("inactive")}>Deactivate</button>
            <button className="btn btn-outline-danger" onClick={() => bulk("delete")}>Delete</button>
          </div>
        </div>
      )}

      {list.loading ? <Loader /> : list.items.length === 0 ? (
        <EmptyState icon="bi-window-stack" title="No popups yet" text="Create your first popup." />
      ) : (
        <div className="card stat-card shadow-sm">
          <div className="table-responsive">
            <table className="table table-hover align-middle m-0">
              <thead className="table-light"><tr>
                <th style={{ width: 40 }}></th><th>Title</th><th>Type</th><th>Display</th><th>Frequency</th><th>Status</th><th className="text-end">Actions</th>
              </tr></thead>
              <tbody>
                {list.items.map((p) => (
                  <tr key={p._id}>
                    <td><input type="checkbox" className="form-check-input" checked={selected.includes(p._id)} onChange={() => toggleSel(p._id)} /></td>
                    <td><i className={`bi ${typeIcon[p.type]} me-2 text-muted`} /><strong>{p.title}</strong></td>
                    <td><span className="badge bg-light text-dark text-capitalize">{p.type}</span></td>
                    <td className="small text-capitalize">{p.displayOn}</td>
                    <td className="small text-capitalize">{p.frequency.replace("_", " ")}</td>
                    <td><span className={`badge ${p.status === "active" ? "bg-success" : "bg-secondary"}`}>{p.status}</span></td>
                    <td className="text-end"><div className="btn-group btn-group-sm">
                      <button className="btn btn-outline-primary" data-bs-toggle="modal" data-bs-target="#popupModal" onClick={() => openEdit(p)}><i className="bi bi-pencil" /></button>
                      <button className="btn btn-outline-danger" onClick={() => remove(p._id)}><i className="bi bi-trash" /></button>
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="card-body py-2"><Pagination page={list.page} pages={list.pages} total={list.total} onPage={list.setPage} /></div>
        </div>
      )}

      <div className="modal fade" id="popupModal" tabIndex="-1">
        <div className="modal-dialog modal-lg"><div className="modal-content">
          <form onSubmit={submit}>
            <div className="modal-header"><h5 className="modal-title"><i className={`bi ${editing ? "bi-pencil" : "bi-plus-circle"} me-2`} />{editing ? "Edit" : "New"} Popup</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" /></div>
            <div className="modal-body row g-3">
              <div className="col-md-8"><label className="form-label small">Title *</label><input className="form-control" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
              <div className="col-md-4"><label className="form-label small">Type</label><select className="form-select text-capitalize" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>{TYPES.map((t) => <option key={t} value={t}>{t}</option>)}</select></div>
              <div className="col-12"><label className="form-label small">Content</label><textarea className="form-control" rows="3" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} /></div>
              <div className="col-12"><label className="form-label small">Image URL</label><input className="form-control" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} /></div>
              <div className="col-md-6"><label className="form-label small">Button Text</label><input className="form-control" value={form.buttonText} onChange={(e) => setForm({ ...form, buttonText: e.target.value })} /></div>
              <div className="col-md-6"><label className="form-label small">Button Link</label><input className="form-control" value={form.buttonLink} onChange={(e) => setForm({ ...form, buttonLink: e.target.value })} /></div>
              <div className="col-md-4"><label className="form-label small">Display On</label><select className="form-select" value={form.displayOn} onChange={(e) => setForm({ ...form, displayOn: e.target.value })}><option value="homepage">Homepage</option><option value="all">All pages</option><option value="specific">Specific pages</option></select></div>
              <div className="col-md-4"><label className="form-label small">Frequency</label><select className="form-select" value={form.frequency} onChange={(e) => setForm({ ...form, frequency: e.target.value })}><option value="once">Once</option><option value="daily">Daily</option><option value="weekly">Weekly</option><option value="every_visit">Every visit</option></select></div>
              <div className="col-md-4"><label className="form-label small">Status</label><select className="form-select" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}><option value="active">Active</option><option value="inactive">Inactive</option></select></div>
              <div className="col-md-6"><label className="form-label small">Start Date</label><input type="date" className="form-control" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} /></div>
              <div className="col-md-6"><label className="form-label small">End Date</label><input type="date" className="form-control" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} /></div>
            </div>
            <div className="modal-footer"><button type="button" className="btn btn-light" data-bs-dismiss="modal">Cancel</button><button className="btn btn-primary" data-bs-dismiss="modal">{editing ? "Save" : "Create"}</button></div>
          </form>
        </div></div>
      </div>
    </>
  );
}
