import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/client";
import useList from "../hooks/useList";
import PageHeader from "../components/PageHeader";
import Toolbar from "../components/Toolbar";
import Pagination from "../components/Pagination";
import EmptyState from "../components/EmptyState";
import Loader from "../components/Loader";

const STATUS = ["draft", "published", "archived"];
const TYPES = ["home", "about", "contact", "services", "gallery", "news", "events", "custom"];
const statusBadge = { draft: "secondary", published: "success", archived: "dark" };
const blank = { name: "", type: "custom", title: "", metaDescription: "" };

export default function Pages() {
  const { websiteId } = useParams();
  const nav = useNavigate();
  const list = useList(`/websites/${websiteId}/pages`, { initialFilters: { status: "", type: "", sort: "-createdAt" }, limit: 10 });
  const [form, setForm] = useState(blank);
  const [editing, setEditing] = useState(null);
  const [selected, setSelected] = useState([]);

  const openNew = () => { setEditing(null); setForm(blank); };
  const openEdit = (p) => { setEditing(p._id); setForm({ ...blank, ...p }); };

  const submit = async (e) => {
    e.preventDefault();
    if (editing) await api.put(`/websites/${websiteId}/pages/${editing}`, form);
    else await api.post(`/websites/${websiteId}/pages`, form);
    list.refetch();
  };

  const duplicate = async (id) => { await api.post(`/websites/${websiteId}/pages/${id}/duplicate`); list.refetch(); };
  const remove = async (id) => { if (window.confirm("Delete this page?")) { await api.delete(`/websites/${websiteId}/pages/${id}`); list.refetch(); } };

  const toggleSel = (id) => setSelected((s) => s.includes(id) ? s.filter((x) => x !== id) : [...s, id]);
  const allSel = list.items.length > 0 && selected.length === list.items.length;
  const toggleAll = () => setSelected(allSel ? [] : list.items.map((p) => p._id));
  const bulk = async (action) => {
    if (action === "delete" && !window.confirm(`Delete ${selected.length} page(s)?`)) return;
    await api.post(`/websites/${websiteId}/pages/bulk`, { ids: selected, action });
    setSelected([]); list.refetch();
  };

  return (
    <>
      <button className="btn btn-link px-0 mb-2" onClick={() => nav("/websites")}><i className="bi bi-arrow-left me-1" />Back to websites</button>
      <PageHeader icon="bi-files" title="Pages" subtitle="Manage pages for this website">
        <button className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#pageModal" onClick={openNew}>
          <i className="bi bi-plus-lg me-1" />New Page
        </button>
      </PageHeader>

      <Toolbar
        search={list.search} onSearch={list.onSearch}
        filters={[
          { label: "Status", value: list.filters.status, onChange: (v) => list.setFilter("status", v), options: STATUS.map((s) => ({ value: s, label: s })) },
          { label: "Type", value: list.filters.type, onChange: (v) => list.setFilter("type", v), options: TYPES.map((t) => ({ value: t, label: t })) },
        ]}
      />

      {selected.length > 0 && (
        <div className="alert alert-primary d-flex justify-content-between align-items-center py-2">
          <span><i className="bi bi-check2-square me-2" />{selected.length} selected</span>
          <div className="btn-group btn-group-sm">
            <button className="btn btn-outline-success" onClick={() => bulk("published")}><i className="bi bi-cloud-arrow-up me-1" />Publish</button>
            <button className="btn btn-outline-danger" onClick={() => bulk("delete")}><i className="bi bi-trash me-1" />Delete</button>
            <button className="btn btn-outline-secondary" onClick={() => setSelected([])}>Clear</button>
          </div>
        </div>
      )}

      {list.loading ? <Loader /> : list.items.length === 0 ? (
        <EmptyState icon="bi-file-earmark-plus" title="No pages found" text="Create a page to start building." />
      ) : (
        <div className="card stat-card shadow-sm">
          <div className="table-responsive">
            <table className="table table-hover align-middle m-0">
              <thead className="table-light">
                <tr>
                  <th style={{ width: 40 }}><input type="checkbox" className="form-check-input" checked={allSel} onChange={toggleAll} /></th>
                  <th>Name</th><th>Type</th><th>Status</th><th>Updated</th><th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {list.items.map((p) => (
                  <tr key={p._id}>
                    <td><input type="checkbox" className="form-check-input" checked={selected.includes(p._id)} onChange={() => toggleSel(p._id)} /></td>
                    <td>
                      <i className="bi bi-file-earmark-text me-2 text-muted" />
                      <strong>{p.name}</strong>
                      <div className="small text-muted">/{p.slug}</div>
                    </td>
                    <td><span className="badge bg-light text-dark text-capitalize">{p.type}</span></td>
                    <td><span className={`badge bg-${statusBadge[p.status]} text-capitalize`}>{p.status}</span></td>
                    <td className="small text-muted">{new Date(p.updatedAt).toLocaleDateString()}</td>
                    <td className="text-end">
                      <div className="btn-group btn-group-sm">
                        <button className="btn btn-outline-primary" onClick={() => nav(`/websites/${websiteId}/pages/${p._id}/build`)} title="Build"><i className="bi bi-pencil-square" /></button>
                        <button className="btn btn-outline-secondary" data-bs-toggle="modal" data-bs-target="#pageModal" onClick={() => openEdit(p)} title="Settings"><i className="bi bi-gear" /></button>
                        <button className="btn btn-outline-info" onClick={() => duplicate(p._id)} title="Duplicate"><i className="bi bi-copy" /></button>
                        <button className="btn btn-outline-danger" onClick={() => remove(p._id)} title="Delete"><i className="bi bi-trash" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="card-body py-2">
            <Pagination page={list.page} pages={list.pages} total={list.total} onPage={list.setPage} />
          </div>
        </div>
      )}

      {/* Create/Edit page modal */}
      <div className="modal fade" id="pageModal" tabIndex="-1">
        <div className="modal-dialog">
          <div className="modal-content">
            <form onSubmit={submit}>
              <div className="modal-header">
                <h5 className="modal-title"><i className={`bi ${editing ? "bi-gear" : "bi-plus-circle"} me-2`} />{editing ? "Page Settings" : "New Page"}</h5>
                <button type="button" className="btn-close" data-bs-dismiss="modal" />
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label small">Page Name *</label>
                  <input className="form-control" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="mb-3">
                  <label className="form-label small">Type</label>
                  <select className="form-select text-capitalize" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                    {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label small">Meta Title (SEO)</label>
                  <input className="form-control" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                </div>
                <div className="mb-2">
                  <label className="form-label small">Meta Description (SEO)</label>
                  <textarea className="form-control" rows="2" value={form.metaDescription} onChange={(e) => setForm({ ...form, metaDescription: e.target.value })} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-light" data-bs-dismiss="modal">Cancel</button>
                <button className="btn btn-primary" data-bs-dismiss="modal">{editing ? "Save" : "Create"}</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
