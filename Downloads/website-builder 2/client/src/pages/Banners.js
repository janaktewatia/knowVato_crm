import { useState } from "react";
import api from "../api/client";
import useList from "../hooks/useList";
import PageHeader from "../components/PageHeader";
import Toolbar from "../components/Toolbar";
import Pagination from "../components/Pagination";
import EmptyState from "../components/EmptyState";
import Loader from "../components/Loader";

const blank = { title: "", subtitle: "", description: "", image: "", buttonText: "", buttonLink: "", sequence: 0, isHomepage: false, status: "active", startDate: "", endDate: "" };
const toInput = (d) => d ? new Date(d).toISOString().slice(0, 10) : "";

export default function Banners() {
  const list = useList("/banners", { initialFilters: { status: "", sort: "sequence" }, limit: 12 });
  const [form, setForm] = useState(blank);
  const [editing, setEditing] = useState(null);
  const [selected, setSelected] = useState([]);

  const openNew = () => { setEditing(null); setForm(blank); };
  const openEdit = (b) => { setEditing(b._id); setForm({ ...blank, ...b, startDate: toInput(b.startDate), endDate: toInput(b.endDate) }); };
  const submit = async (e) => {
    e.preventDefault();
    const payload = { ...form, startDate: form.startDate || null, endDate: form.endDate || null };
    if (editing) await api.put(`/banners/${editing}`, payload); else await api.post("/banners", payload);
    list.refetch();
  };
  const remove = async (id) => { if (window.confirm("Delete this banner?")) { await api.delete(`/banners/${id}`); list.refetch(); } };
  const move = async (b, dir) => { await api.put(`/banners/${b._id}`, { sequence: (b.sequence || 0) + dir }); list.refetch(); };
  const toggleSel = (id) => setSelected((s) => s.includes(id) ? s.filter((x) => x !== id) : [...s, id]);
  const bulk = async (action) => {
    if (action === "delete" && !window.confirm(`Delete ${selected.length}?`)) return;
    await api.post("/banners/bulk", { ids: selected, action }); setSelected([]); list.refetch();
  };

  return (
    <>
      <PageHeader icon="bi-image" title="Banners" subtitle="Homepage sliders & promotional banners">
        <button className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#bannerModal" onClick={openNew}><i className="bi bi-plus-lg me-1" />New Banner</button>
      </PageHeader>
      <Toolbar search={list.search} onSearch={list.onSearch}
        filters={[{ label: "Status", value: list.filters.status, onChange: (v) => list.setFilter("status", v), options: [{ value: "active", label: "Active" }, { value: "inactive", label: "Inactive" }] }]} />

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
        <EmptyState icon="bi-image" title="No banners yet" text="Add your first banner." />
      ) : (
        <>
          <div className="row g-3">
            {list.items.map((b) => (
              <div className="col-md-6 col-xl-4" key={b._id}>
                <div className={`card stat-card shadow-sm h-100 ${selected.includes(b._id) ? "border border-primary" : ""}`}>
                  <div className="position-relative" style={{ height: 150, background: "#e9ecef" }}>
                    {b.image
                      ? <img src={b.image} alt="" className="w-100 h-100" style={{ objectFit: "cover" }} />
                      : <div className="d-flex align-items-center justify-content-center h-100 text-muted"><i className="bi bi-image" style={{ fontSize: "2rem" }} /></div>}
                    <input type="checkbox" className="form-check-input position-absolute m-2" style={{ top: 0, left: 0 }} checked={selected.includes(b._id)} onChange={() => toggleSel(b._id)} />
                    <span className="position-absolute badge bg-dark m-2" style={{ top: 0, right: 0 }}>#{b.sequence}</span>
                  </div>
                  <div className="card-body">
                    <div className="d-flex justify-content-between">
                      <h6 className="mb-1">{b.title}</h6>
                      <span className={`badge ${b.status === "active" ? "bg-success" : "bg-secondary"}`}>{b.status}</span>
                    </div>
                    <p className="small text-muted mb-2 text-truncate">{b.subtitle}</p>
                    {b.isHomepage && <span className="badge bg-info-subtle text-info mb-2"><i className="bi bi-house me-1" />Homepage</span>}
                    <div className="btn-group btn-group-sm w-100">
                      <button className="btn btn-outline-secondary" onClick={() => move(b, -1)} title="Up"><i className="bi bi-arrow-up" /></button>
                      <button className="btn btn-outline-secondary" onClick={() => move(b, 1)} title="Down"><i className="bi bi-arrow-down" /></button>
                      <button className="btn btn-outline-primary" data-bs-toggle="modal" data-bs-target="#bannerModal" onClick={() => openEdit(b)}><i className="bi bi-pencil" /></button>
                      <button className="btn btn-outline-danger" onClick={() => remove(b._id)}><i className="bi bi-trash" /></button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Pagination page={list.page} pages={list.pages} total={list.total} onPage={list.setPage} />
        </>
      )}

      <div className="modal fade" id="bannerModal" tabIndex="-1">
        <div className="modal-dialog modal-lg"><div className="modal-content">
          <form onSubmit={submit}>
            <div className="modal-header"><h5 className="modal-title"><i className={`bi ${editing ? "bi-pencil" : "bi-plus-circle"} me-2`} />{editing ? "Edit" : "New"} Banner</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" /></div>
            <div className="modal-body row g-3">
              <div className="col-md-8"><label className="form-label small">Title *</label><input className="form-control" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
              <div className="col-md-4"><label className="form-label small">Sequence</label><input type="number" className="form-control" value={form.sequence} onChange={(e) => setForm({ ...form, sequence: +e.target.value })} /></div>
              <div className="col-12"><label className="form-label small">Subtitle</label><input className="form-control" value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} /></div>
              <div className="col-12"><label className="form-label small">Description</label><textarea className="form-control" rows="2" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
              <div className="col-12"><label className="form-label small">Image URL</label><input className="form-control" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} /></div>
              <div className="col-md-6"><label className="form-label small">Button Text</label><input className="form-control" value={form.buttonText} onChange={(e) => setForm({ ...form, buttonText: e.target.value })} /></div>
              <div className="col-md-6"><label className="form-label small">Button Link</label><input className="form-control" value={form.buttonLink} onChange={(e) => setForm({ ...form, buttonLink: e.target.value })} /></div>
              <div className="col-md-4"><label className="form-label small">Start Date</label><input type="date" className="form-control" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} /></div>
              <div className="col-md-4"><label className="form-label small">End Date</label><input type="date" className="form-control" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} /></div>
              <div className="col-md-4"><label className="form-label small">Status</label><select className="form-select" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}><option value="active">Active</option><option value="inactive">Inactive</option></select></div>
              <div className="col-12"><div className="form-check"><input className="form-check-input" type="checkbox" checked={form.isHomepage} onChange={(e) => setForm({ ...form, isHomepage: e.target.checked })} id="hpCheck" /><label className="form-check-label small" htmlFor="hpCheck">Show on homepage</label></div></div>
            </div>
            <div className="modal-footer"><button type="button" className="btn btn-light" data-bs-dismiss="modal">Cancel</button><button className="btn btn-primary" data-bs-dismiss="modal">{editing ? "Save" : "Create"}</button></div>
          </form>
        </div></div>
      </div>
    </>
  );
}
