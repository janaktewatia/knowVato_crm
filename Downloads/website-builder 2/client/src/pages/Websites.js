import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";
import useList from "../hooks/useList";
import PageHeader from "../components/PageHeader";
import Toolbar from "../components/Toolbar";
import Pagination from "../components/Pagination";
import EmptyState from "../components/EmptyState";
import Loader from "../components/Loader";
import { COMPLETE_WEBSITE_TEMPLATES, TEMPLATE_CATEGORIES } from "../templates/complete-website-templates";

const STATUS = ["draft", "published", "maintenance", "archived"];
const CATEGORIES = ["general","school","college","university","corporate","business","hospital","ngo","restaurant","event","ecommerce","portfolio","startup"];
const statusBadge = { draft: "secondary", published: "success", maintenance: "warning", archived: "dark" };

const blank = { name: "", category: "general", description: "", contactEmail: "", contactNumber: "", address: "" };

export default function Websites() {
  const nav = useNavigate();
  const list = useList("/websites", { initialFilters: { status: "", category: "", sort: "-createdAt" }, limit: 9 });
  const [form, setForm] = useState(blank);
  const [editing, setEditing] = useState(null);
  const [selected, setSelected] = useState([]);
  const [showTemplates, setShowTemplates] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [templateFilter, setTemplateFilter] = useState("all");

  const openNew = () => { setShowTemplates(true); setSelectedTemplate(null); };
  const openEdit = (w) => { setEditing(w._id); setForm({ ...blank, ...w }); };

  const createFromTemplate = async (template) => {
    const newWebsite = {
      name: template.name,
      category: "general",
      description: template.description,
      contactEmail: "",
      contactNumber: "",
      address: ""
    };
    await api.post("/websites", newWebsite);
    setShowTemplates(false);
    list.refetch();
  };

  const submit = async (e) => {
    e.preventDefault();
    if (editing) await api.put(`/websites/${editing}`, form);
    else await api.post("/websites", form);
    list.refetch();
  };

  const publish = async (id, status) => { await api.post(`/websites/${id}/publish`, { status }); list.refetch(); };
  const clone = async (id) => { await api.post(`/websites/${id}/clone`); list.refetch(); };
  const remove = async (id) => {
    if (window.confirm("Delete this website and all its pages?")) { await api.delete(`/websites/${id}`); list.refetch(); }
  };

  const toggleSel = (id) => setSelected((s) => s.includes(id) ? s.filter((x) => x !== id) : [...s, id]);
  const allSel = list.items.length > 0 && selected.length === list.items.length;
  const toggleAll = () => setSelected(allSel ? [] : list.items.map((w) => w._id));

  const bulk = async (action) => {
    if (action === "delete" && !window.confirm(`Delete ${selected.length} website(s)?`)) return;
    await api.post("/websites/bulk", { ids: selected, action });
    setSelected([]); list.refetch();
  };

  return (
    <>
      <PageHeader icon="bi-globe2" title="Websites" subtitle="Create and manage all your websites">
        <button className="btn btn-primary" onClick={openNew}>
          <i className="bi bi-plus-lg me-1" />New Website
        </button>
      </PageHeader>

      <Toolbar
        search={list.search}
        onSearch={list.onSearch}
        filters={[
          { label: "Status", value: list.filters.status, onChange: (v) => list.setFilter("status", v),
            options: STATUS.map((s) => ({ value: s, label: s })) },
          { label: "Category", value: list.filters.category, onChange: (v) => list.setFilter("category", v),
            options: CATEGORIES.map((c) => ({ value: c, label: c })) },
        ]}
        right={
          <select className="form-select form-select-sm" value={list.filters.sort}
            onChange={(e) => list.setFilter("sort", e.target.value)}>
            <option value="-createdAt">Newest</option>
            <option value="createdAt">Oldest</option>
            <option value="name">Name A-Z</option>
            <option value="-name">Name Z-A</option>
          </select>
        }
      />

      {selected.length > 0 && (
        <div className="alert alert-primary d-flex justify-content-between align-items-center py-2">
          <span><i className="bi bi-check2-square me-2" />{selected.length} selected</span>
          <div className="btn-group btn-group-sm">
            <button className="btn btn-outline-success" onClick={() => bulk("published")}><i className="bi bi-cloud-arrow-up me-1" />Publish</button>
            <button className="btn btn-outline-dark" onClick={() => bulk("archived")}><i className="bi bi-archive me-1" />Archive</button>
            <button className="btn btn-outline-danger" onClick={() => bulk("delete")}><i className="bi bi-trash me-1" />Delete</button>
            <button className="btn btn-outline-secondary" onClick={() => setSelected([])}>Clear</button>
          </div>
        </div>
      )}

      {list.loading ? <Loader /> : list.items.length === 0 ? (
        <EmptyState icon="bi-globe2" title="No websites found"
          text="Try adjusting filters, or create your first website."
          action={<button className="btn btn-primary btn-sm" onClick={openNew}><i className="bi bi-plus-lg me-1" />New Website</button>} />
      ) : (
        <>
          <div className="mb-2">
            <label className="small text-muted">
              <input type="checkbox" className="form-check-input me-2" checked={allSel} onChange={toggleAll} />
              Select all on page
            </label>
          </div>
          <div className="row g-3">
            {list.items.map((w) => (
              <div className="col-md-6 col-xl-4" key={w._id}>
                <div className={`card stat-card shadow-sm h-100 ${selected.includes(w._id) ? "border border-primary" : ""}`}>
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start">
                      <input type="checkbox" className="form-check-input" checked={selected.includes(w._id)} onChange={() => toggleSel(w._id)} />
                      <span className={`badge bg-${statusBadge[w.status]} text-capitalize`}>{w.status}</span>
                    </div>
                    <h5 className="card-title mt-2 mb-1">{w.name}</h5>
                    <p className="text-muted small mb-1"><i className="bi bi-link-45deg" />/{w.slug} · <span className="text-capitalize">{w.category}</span></p>
                    <p className="small text-truncate mb-2">{w.description || "—"}</p>
                    {w.status === "published" && (
                      <div className="d-flex align-items-center gap-1 mb-2 p-2 rounded" style={{ background: "#eafaf0", border: "1px solid #bfe8cd" }}>
                        <i className="bi bi-broadcast text-success" />
                        <a href={`/site/${w.slug}`} target="_blank" rel="noreferrer" className="small text-success text-truncate flex-grow-1 text-decoration-none">/site/{w.slug}</a>
                        <button className="btn btn-sm btn-light py-0" title="Copy link" onClick={() => navigator.clipboard?.writeText(`${window.location.origin}/site/${w.slug}`)}><i className="bi bi-clipboard" /></button>
                      </div>
                    )}
                    <div className="btn-group btn-group-sm w-100">
                      <button className="btn btn-outline-primary" onClick={() => nav(`/websites/${w._id}/pages`)} title="Pages"><i className="bi bi-files" /></button>
                      <a className={`btn btn-outline-success ${w.status === "published" ? "" : "disabled"}`} href={`/site/${w.slug}`} target="_blank" rel="noreferrer" title="View live site"><i className="bi bi-box-arrow-up-right" /></a>
                      <button className="btn btn-outline-secondary" data-bs-toggle="modal" data-bs-target="#siteModal" onClick={() => openEdit(w)} title="Edit"><i className="bi bi-pencil" /></button>
                      <button className="btn btn-outline-success" onClick={() => publish(w._id, "published")} title="Publish"><i className="bi bi-cloud-arrow-up" /></button>
                      <button className="btn btn-outline-info" onClick={() => clone(w._id)} title="Clone"><i className="bi bi-copy" /></button>
                      <button className="btn btn-outline-danger" onClick={() => remove(w._id)} title="Delete"><i className="bi bi-trash" /></button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Pagination page={list.page} pages={list.pages} total={list.total} onPage={list.setPage} />
        </>
      )}

      {/* Create/Edit modal */}
      <div className="modal fade" id="siteModal" tabIndex="-1">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <form onSubmit={submit}>
              <div className="modal-header">
                <h5 className="modal-title"><i className={`bi ${editing ? "bi-pencil" : "bi-plus-circle"} me-2`} />{editing ? "Edit" : "New"} Website</h5>
                <button type="button" className="btn-close" data-bs-dismiss="modal" />
              </div>
              <div className="modal-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label small">Name *</label>
                    <input className="form-control" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small">Category</label>
                    <select className="form-select text-capitalize" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                      {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="col-12">
                    <label className="form-label small">Description</label>
                    <textarea className="form-control" rows="2" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small">Contact Email</label>
                    <input type="email" className="form-control" value={form.contactEmail} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small">Contact Number</label>
                    <input className="form-control" value={form.contactNumber} onChange={(e) => setForm({ ...form, contactNumber: e.target.value })} />
                  </div>
                  <div className="col-12">
                    <label className="form-label small">Address</label>
                    <input className="form-control" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
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

      {/* Complete Website Template Selection Modal */}
      {showTemplates && (
        <div className="modal d-block" style={{ background: "rgba(0,0,0,.7)" }} onClick={() => setShowTemplates(false)}>
          <div className="modal-dialog modal-xl modal-dialog-scrollable" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title"><i className="bi bi-layout-wtf me-2" />Choose a Complete Website Template</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowTemplates(false)} />
              </div>
              <div className="modal-body">
                <div className="row g-4">
                  {/* Template Selection */}
                  <div className="col-md-7">
                    {/* Category Filter */}
                    <div className="mb-3 d-flex gap-2 flex-wrap">
                      <button
                        className={`btn btn-sm ${templateFilter === "all" ? "btn-primary" : "btn-outline-secondary"}`}
                        onClick={() => setTemplateFilter("all")}
                      >
                        All Templates
                      </button>
                      {TEMPLATE_CATEGORIES.map((cat) => (
                        <button
                          key={cat}
                          className={`btn btn-sm ${templateFilter === cat ? "btn-primary" : "btn-outline-secondary"}`}
                          onClick={() => setTemplateFilter(cat)}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>

                    {/* Templates Grid */}
                    <div className="row g-2" style={{ maxHeight: "500px", overflowY: "auto" }}>
                      {COMPLETE_WEBSITE_TEMPLATES.filter(
                        (t) => templateFilter === "all" || t.category === templateFilter
                      ).map((template) => (
                        <div className="col-6" key={template.id}>
                          <div
                            className={`card stat-card h-100 cursor-pointer transition-all ${
                              selectedTemplate?.id === template.id
                                ? "border-primary border-2 shadow-lg"
                                : "border-1"
                            }`}
                            onClick={() => setSelectedTemplate(template)}
                            style={{ cursor: "pointer" }}
                          >
                            <img
                              src={template.thumbnail}
                              alt={template.name}
                              className="card-img-top"
                              style={{ height: "120px", objectFit: "cover" }}
                            />
                            <div className="card-body p-2">
                              <h6 className="card-title mb-1 text-truncate">{template.name}</h6>
                              <div className="d-flex align-items-center justify-content-between">
                                <span className="badge bg-light text-dark text-truncate">{template.category}</span>
                                <span className="badge bg-info text-white">{template.pages.length} pages</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Template Preview */}
                  <div className="col-md-5">
                    {selectedTemplate ? (
                      <div className="border rounded p-3 bg-light h-100 d-flex flex-column">
                        <img
                          src={selectedTemplate.preview}
                          alt={selectedTemplate.name}
                          className="img-fluid rounded mb-3"
                          style={{ maxHeight: "250px", objectFit: "cover" }}
                        />
                        <h5 className="mb-2">{selectedTemplate.name}</h5>
                        <p className="text-muted small mb-3">{selectedTemplate.description}</p>

                        <div className="mb-3">
                          <h6 className="mb-2"><i className="bi bi-file-earmark me-2" />Pages Included:</h6>
                          <ul className="list-unstyled">
                            {selectedTemplate.pages.map((page, i) => (
                              <li key={i} className="small text-muted mb-1">
                                <i className="bi bi-file me-1" />{page.name} ({page.type})
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="mb-3">
                          <h6 className="mb-2"><i className="bi bi-star me-2" />Features:</h6>
                          <div className="d-flex flex-wrap gap-1">
                            {selectedTemplate.features.map((feat, i) => (
                              <span key={i} className="badge bg-primary text-white">{feat}</span>
                            ))}
                          </div>
                        </div>

                        <button
                          className="btn btn-success mt-auto w-100"
                          onClick={() => createFromTemplate(selectedTemplate)}
                        >
                          <i className="bi bi-check-lg me-1" />Create Website from This Template
                        </button>
                      </div>
                    ) : (
                      <div className="border rounded p-3 bg-light h-100 d-flex align-items-center justify-content-center">
                        <div className="text-center">
                          <i className="bi bi-layout-wtf fs-1 text-muted d-block mb-2" />
                          <p className="text-muted">Select a template to see preview</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-light" onClick={() => setShowTemplates(false)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
