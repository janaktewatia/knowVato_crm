import { useState } from "react";
import api from "../api/client";
import useList from "../hooks/useList";
import PageHeader from "../components/PageHeader";
import Toolbar from "../components/Toolbar";
import Pagination from "../components/Pagination";
import EmptyState from "../components/EmptyState";
import Loader from "../components/Loader";

const STATUS = ["draft", "published", "archived"];
const CATEGORIES = ["general", "announcement", "press", "blog", "update", "achievement"];
const statusBadge = { draft: "secondary", published: "success", archived: "dark" };
const blank = { title: "", category: "general", excerpt: "", content: "", featuredImage: "", tags: [], featured: false, status: "draft", publishAt: "" };

export default function News() {
  const list = useList("/news", { initialFilters: { status: "", category: "", featured: "", sort: "-createdAt" }, limit: 12 });
  const [form, setForm] = useState(blank);
  const [editing, setEditing] = useState(null);
  const [selected, setSelected] = useState([]);

  const openNew = () => { setEditing(null); setForm(blank); };
  const openEdit = (n) => {
    setEditing(n._id);
    setForm({ ...blank, ...n, publishAt: n.publishAt ? n.publishAt.slice(0, 16) : "" });
  };

  const submit = async (e) => {
    e.preventDefault();
    const payload = { ...form, publishAt: form.publishAt || null };
    if (editing) await api.put(`/news/${editing}`, payload);
    else await api.post("/news", payload);
    list.refetch();
  };

  const remove = async (id) => { if (window.confirm("Delete this news item?")) { await api.delete(`/news/${id}`); list.refetch(); } };
  const toggleFeatured = async (n) => { await api.put(`/news/${n._id}`, { featured: !n.featured }); list.refetch(); };

  const toggleSel = (id) => setSelected((s) => s.includes(id) ? s.filter((x) => x !== id) : [...s, id]);
  const allSel = list.items.length > 0 && selected.length === list.items.length;
  const toggleAll = () => setSelected(allSel ? [] : list.items.map((n) => n._id));
  const bulk = async (action) => {
    if (action === "delete" && !window.confirm(`Delete ${selected.length} item(s)?`)) return;
    await api.post("/news/bulk", { ids: selected, action });
    setSelected([]); list.refetch();
  };

  return (
    <>
      <PageHeader icon="bi-newspaper" title="News" subtitle="Publish news, announcements & articles">
        <button className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#newsModal" onClick={openNew}>
          <i className="bi bi-plus-lg me-1" />New Article
        </button>
      </PageHeader>

      <Toolbar
        search={list.search} onSearch={list.onSearch}
        filters={[
          { label: "Status", value: list.filters.status, onChange: (v) => list.setFilter("status", v), options: STATUS.map((s) => ({ value: s, label: s })) },
          { label: "Category", value: list.filters.category, onChange: (v) => list.setFilter("category", v), options: CATEGORIES.map((c) => ({ value: c, label: c })) },
          { label: "Featured", value: list.filters.featured, onChange: (v) => list.setFilter("featured", v), options: [{ value: "true", label: "Featured only" }] },
        ]}
        right={
          <select className="form-select form-select-sm" value={list.filters.sort} onChange={(e) => list.setFilter("sort", e.target.value)}>
            <option value="-createdAt">Newest</option><option value="createdAt">Oldest</option><option value="title">Title A-Z</option>
          </select>
        }
      />

      {selected.length > 0 && (
        <div className="alert alert-primary d-flex justify-content-between align-items-center py-2">
          <span><i className="bi bi-check2-square me-2" />{selected.length} selected</span>
          <div className="btn-group btn-group-sm">
            <button className="btn btn-outline-success" onClick={() => bulk("published")}>Publish</button>
            <button className="btn btn-outline-warning" onClick={() => bulk("feature")}><i className="bi bi-star me-1" />Feature</button>
            <button className="btn btn-outline-secondary" onClick={() => bulk("unfeature")}>Unfeature</button>
            <button className="btn btn-outline-danger" onClick={() => bulk("delete")}>Delete</button>
            <button className="btn btn-outline-secondary" onClick={() => setSelected([])}>Clear</button>
          </div>
        </div>
      )}

      {list.loading ? <Loader /> : list.items.length === 0 ? (
        <EmptyState icon="bi-newspaper" title="No news yet" text="Write your first article." />
      ) : (
        <div className="card stat-card shadow-sm">
          <div className="table-responsive">
            <table className="table table-hover align-middle m-0">
              <thead className="table-light">
                <tr>
                  <th style={{ width: 40 }}><input type="checkbox" className="form-check-input" checked={allSel} onChange={toggleAll} /></th>
                  <th>Title</th><th>Category</th><th>Status</th><th>Featured</th><th>Date</th><th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {list.items.map((n) => (
                  <tr key={n._id}>
                    <td><input type="checkbox" className="form-check-input" checked={selected.includes(n._id)} onChange={() => toggleSel(n._id)} /></td>
                    <td>
                      <div className="d-flex align-items-center">
                        {n.featuredImage && <img src={n.featuredImage} alt="" width="40" height="40" className="rounded me-2" style={{ objectFit: "cover" }} />}
                        <div><strong>{n.title}</strong><div className="small text-muted text-truncate" style={{ maxWidth: 280 }}>{n.excerpt}</div></div>
                      </div>
                    </td>
                    <td><span className="badge bg-light text-dark text-capitalize">{n.category}</span></td>
                    <td><span className={`badge bg-${statusBadge[n.status]} text-capitalize`}>{n.status}</span></td>
                    <td><button className="btn btn-sm btn-link p-0" onClick={() => toggleFeatured(n)}><i className={`bi ${n.featured ? "bi-star-fill text-warning" : "bi-star text-muted"}`} /></button></td>
                    <td className="small text-muted">{new Date(n.createdAt).toLocaleDateString()}</td>
                    <td className="text-end">
                      <div className="btn-group btn-group-sm">
                        <button className="btn btn-outline-primary" data-bs-toggle="modal" data-bs-target="#newsModal" onClick={() => openEdit(n)}><i className="bi bi-pencil" /></button>
                        <button className="btn btn-outline-danger" onClick={() => remove(n._id)}><i className="bi bi-trash" /></button>
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

      {/* Create/Edit modal */}
      <div className="modal fade" id="newsModal" tabIndex="-1">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <form onSubmit={submit}>
              <div className="modal-header">
                <h5 className="modal-title"><i className={`bi ${editing ? "bi-pencil" : "bi-plus-circle"} me-2`} />{editing ? "Edit" : "New"} Article</h5>
                <button type="button" className="btn-close" data-bs-dismiss="modal" />
              </div>
              <div className="modal-body">
                <div className="row g-3">
                  <div className="col-md-8"><label className="form-label small">Title *</label>
                    <input className="form-control" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
                  <div className="col-md-4"><label className="form-label small">Category</label>
                    <select className="form-select text-capitalize" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                      {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select></div>
                  <div className="col-12"><label className="form-label small">Excerpt (short summary)</label>
                    <textarea className="form-control" rows="2" value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} /></div>
                  <div className="col-12"><label className="form-label small">Content</label>
                    <textarea className="form-control" rows="5" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} /></div>
                  <div className="col-md-8"><label className="form-label small">Featured Image URL</label>
                    <input className="form-control" placeholder="/uploads/... or https://..." value={form.featuredImage} onChange={(e) => setForm({ ...form, featuredImage: e.target.value })} /></div>
                  <div className="col-md-4"><label className="form-label small">Status</label>
                    <select className="form-select text-capitalize" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                      {STATUS.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select></div>
                  <div className="col-md-6"><label className="form-label small">Tags (comma separated)</label>
                    <input className="form-control" value={(form.tags || []).join(", ")} onChange={(e) => setForm({ ...form, tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean) })} /></div>
                  <div className="col-md-6"><label className="form-label small">Schedule publish (optional)</label>
                    <input type="datetime-local" className="form-control" value={form.publishAt} onChange={(e) => setForm({ ...form, publishAt: e.target.value })} /></div>
                  <div className="col-12">
                    <div className="form-check">
                      <input className="form-check-input" type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} id="featuredCheck" />
                      <label className="form-check-label small" htmlFor="featuredCheck"><i className="bi bi-star me-1" />Mark as featured</label>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-light" data-bs-dismiss="modal">Cancel</button>
                <button className="btn btn-primary" data-bs-dismiss="modal">{editing ? "Save Changes" : "Create"}</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
