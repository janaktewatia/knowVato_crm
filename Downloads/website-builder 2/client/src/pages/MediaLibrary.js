import { useEffect, useState, useRef } from "react";
import api from "../api/client";
import useList from "../hooks/useList";
import PageHeader from "../components/PageHeader";
import Toolbar from "../components/Toolbar";
import Pagination from "../components/Pagination";
import EmptyState from "../components/EmptyState";
import Loader from "../components/Loader";

const TYPES = ["image", "video", "pdf", "document", "audio", "other"];
const typeIcon = { image: "bi-image", video: "bi-camera-video", pdf: "bi-file-earmark-pdf", document: "bi-file-earmark-word", audio: "bi-file-earmark-music", other: "bi-file-earmark" };
const fmtSize = (b) => b < 1024 ? `${b} B` : b < 1048576 ? `${(b/1024).toFixed(1)} KB` : `${(b/1048576).toFixed(1)} MB`;
const fileBase = (process.env.REACT_APP_API || "");

export default function MediaLibrary() {
  const [folders, setFolders] = useState([]);
  const [activeFolder, setActiveFolder] = useState("");
  const [view, setView] = useState("grid");
  const [selected, setSelected] = useState([]);
  const [stats, setStats] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [drag, setDrag] = useState(false);
  const [detail, setDetail] = useState(null);
  const fileInput = useRef();

  const list = useList("/media", { initialFilters: { type: "", folder: "", sort: "-createdAt" }, limit: 24 });

  const loadFolders = () => api.get("/media/folders/all").then((r) => setFolders(r.data));
  const loadStats = () => api.get("/media/stats").then((r) => setStats(r.data));
  useEffect(() => { loadFolders(); loadStats(); }, []);

  const pickFolder = (path) => { setActiveFolder(path); list.setFilter("folder", path); };

  const doUpload = async (files) => {
    if (!files || files.length === 0) return;
    const fd = new FormData();
    [...files].forEach((f) => fd.append("files", f));
    fd.append("folder", activeFolder || "/");
    setUploading(true);
    try {
      await api.post("/media/upload", fd, { headers: { "Content-Type": "multipart/form-data" } });
      list.refetch(); loadStats();
    } finally { setUploading(false); }
  };

  const onDrop = (e) => { e.preventDefault(); setDrag(false); doUpload(e.dataTransfer.files); };

  const remove = async (id) => { if (window.confirm("Delete this file?")) { await api.delete(`/media/${id}`); list.refetch(); loadStats(); } };
  const toggleSel = (id) => setSelected((s) => s.includes(id) ? s.filter((x) => x !== id) : [...s, id]);
  const bulkDelete = async () => {
    if (!window.confirm(`Delete ${selected.length} file(s)?`)) return;
    await api.post("/media/bulk-delete", { ids: selected });
    setSelected([]); list.refetch(); loadStats();
  };

  const addFolder = async () => {
    const name = prompt("Folder name:");
    if (name?.trim()) { await api.post("/media/folders", { name }); loadFolders(); }
  };
  const delFolder = async (id, e) => {
    e.stopPropagation();
    if (window.confirm("Delete folder? Files move to root.")) { await api.delete(`/media/folders/${id}`); loadFolders(); if (activeFolder) pickFolder(""); }
  };

  const saveDetail = async () => {
    await api.put(`/media/${detail._id}`, { name: detail.name, tags: detail.tags });
    setDetail(null); list.refetch();
  };

  const copyUrl = (url) => navigator.clipboard?.writeText(window.location.origin + url);

  return (
    <>
      <PageHeader icon="bi-images" title="Media Library" subtitle={stats ? `${stats.total} files` : "Manage all your media"}>
        <button className="btn btn-outline-secondary" onClick={addFolder}><i className="bi bi-folder-plus me-1" />New Folder</button>
        <button className="btn btn-primary" onClick={() => fileInput.current.click()} disabled={uploading}>
          {uploading ? <span className="spinner-border spinner-border-sm me-1" /> : <i className="bi bi-upload me-1" />}Upload
        </button>
        <input ref={fileInput} type="file" multiple hidden onChange={(e) => doUpload(e.target.files)} />
      </PageHeader>

      <div className="row g-3">
        {/* Folders sidebar */}
        <div className="col-md-3 col-lg-2">
          <div className="card stat-card shadow-sm">
            <div className="list-group list-group-flush">
              <button className={`list-group-item list-group-item-action ${activeFolder === "" ? "active" : ""}`} onClick={() => pickFolder("")}>
                <i className="bi bi-collection me-2" />All Files
              </button>
              <button className={`list-group-item list-group-item-action ${activeFolder === "/" ? "active" : ""}`} onClick={() => pickFolder("/")}>
                <i className="bi bi-house me-2" />Root
              </button>
              {folders.map((f) => (
                <button key={f._id} className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center ${activeFolder === f.path ? "active" : ""}`} onClick={() => pickFolder(f.path)}>
                  <span><i className="bi bi-folder me-2" />{f.name}</span>
                  <i className="bi bi-x text-danger" onClick={(e) => delFolder(f._id, e)} />
                </button>
              ))}
            </div>
          </div>

          {stats && (
            <div className="card stat-card shadow-sm mt-3">
              <div className="card-header bg-white small fw-semibold"><i className="bi bi-pie-chart me-1" />By Type</div>
              <ul className="list-group list-group-flush small">
                {stats.byType.map((t) => (
                  <li className="list-group-item d-flex justify-content-between py-1" key={t._id}>
                    <span className="text-capitalize"><i className={`bi ${typeIcon[t._id] || "bi-file-earmark"} me-1`} />{t._id}</span>
                    <span className="text-muted">{t.count}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Main area */}
        <div className="col-md-9 col-lg-10">
          <Toolbar
            search={list.search} onSearch={list.onSearch}
            filters={[{ label: "Type", value: list.filters.type, onChange: (v) => list.setFilter("type", v), options: TYPES.map((t) => ({ value: t, label: t })) }]}
            right={
              <div className="btn-group btn-group-sm">
                <button className={`btn btn-outline-secondary ${view === "grid" ? "active" : ""}`} onClick={() => setView("grid")}><i className="bi bi-grid-3x3-gap" /></button>
                <button className={`btn btn-outline-secondary ${view === "list" ? "active" : ""}`} onClick={() => setView("list")}><i className="bi bi-list-ul" /></button>
              </div>
            }
          />

          {selected.length > 0 && (
            <div className="alert alert-primary d-flex justify-content-between align-items-center py-2">
              <span><i className="bi bi-check2-square me-2" />{selected.length} selected</span>
              <div className="btn-group btn-group-sm">
                <button className="btn btn-outline-danger" onClick={bulkDelete}><i className="bi bi-trash me-1" />Delete</button>
                <button className="btn btn-outline-secondary" onClick={() => setSelected([])}>Clear</button>
              </div>
            </div>
          )}

          {/* Drop zone */}
          <div
            className={`border rounded p-3 mb-3 text-center ${drag ? "border-primary bg-light" : "border-dashed"}`}
            style={{ borderStyle: "dashed" }}
            onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
            onDragLeave={() => setDrag(false)}
            onDrop={onDrop}
          >
            <i className="bi bi-cloud-arrow-up me-2" />Drag & drop files here, or use the Upload button
          </div>

          {list.loading ? <Loader /> : list.items.length === 0 ? (
            <EmptyState icon="bi-images" title="No media found" text="Upload files to get started." />
          ) : view === "grid" ? (
            <>
              <div className="row g-3">
                {list.items.map((m) => (
                  <div className="col-6 col-md-4 col-lg-3 col-xl-2" key={m._id}>
                    <div className={`card stat-card shadow-sm h-100 ${selected.includes(m._id) ? "border border-primary" : ""}`}>
                      <div className="position-relative">
                        <input type="checkbox" className="form-check-input position-absolute m-2" style={{ zIndex: 2 }} checked={selected.includes(m._id)} onChange={() => toggleSel(m._id)} />
                        <div className="ratio ratio-1x1 bg-light rounded-top d-flex align-items-center justify-content-center overflow-hidden" role="button" onClick={() => setDetail({ ...m })}>
                          {m.type === "image"
                            ? <img src={m.url} alt={m.name} style={{ objectFit: "cover", width: "100%", height: "100%" }} />
                            : <i className={`bi ${typeIcon[m.type]} text-muted`} style={{ fontSize: "2.5rem" }} />}
                        </div>
                      </div>
                      <div className="card-body p-2">
                        <div className="small text-truncate" title={m.originalName}>{m.originalName || m.name}</div>
                        <div className="text-muted" style={{ fontSize: ".7rem" }}>{fmtSize(m.size)}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Pagination page={list.page} pages={list.pages} total={list.total} onPage={list.setPage} />
            </>
          ) : (
            <div className="card stat-card shadow-sm">
              <div className="table-responsive">
                <table className="table table-hover align-middle m-0">
                  <thead className="table-light"><tr><th style={{ width: 40 }}></th><th>Name</th><th>Type</th><th>Size</th><th>Folder</th><th className="text-end">Actions</th></tr></thead>
                  <tbody>
                    {list.items.map((m) => (
                      <tr key={m._id}>
                        <td><input type="checkbox" className="form-check-input" checked={selected.includes(m._id)} onChange={() => toggleSel(m._id)} /></td>
                        <td><i className={`bi ${typeIcon[m.type]} me-2 text-muted`} />{m.originalName || m.name}</td>
                        <td><span className="badge bg-light text-dark text-capitalize">{m.type}</span></td>
                        <td className="small">{fmtSize(m.size)}</td>
                        <td className="small text-muted">{m.folder}</td>
                        <td className="text-end">
                          <div className="btn-group btn-group-sm">
                            <button className="btn btn-outline-secondary" onClick={() => copyUrl(m.url)} title="Copy URL"><i className="bi bi-link-45deg" /></button>
                            <button className="btn btn-outline-primary" onClick={() => setDetail({ ...m })} title="Edit"><i className="bi bi-pencil" /></button>
                            <button className="btn btn-outline-danger" onClick={() => remove(m._id)} title="Delete"><i className="bi bi-trash" /></button>
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
        </div>
      </div>

      {/* Detail / edit drawer (modal) */}
      {detail && (
        <div className="modal d-block" style={{ background: "rgba(0,0,0,.5)" }} onClick={() => setDetail(null)}>
          <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title"><i className="bi bi-pencil me-2" />Edit Media</h5>
                <button className="btn-close" onClick={() => setDetail(null)} />
              </div>
              <div className="modal-body">
                <div className="text-center mb-3 bg-light rounded p-3">
                  {detail.type === "image"
                    ? <img src={detail.url} alt={detail.name} className="img-fluid rounded" style={{ maxHeight: 220 }} />
                    : <i className={`bi ${typeIcon[detail.type]}`} style={{ fontSize: "3rem" }} />}
                </div>
                <div className="mb-3">
                  <label className="form-label small">Name</label>
                  <input className="form-control" value={detail.name} onChange={(e) => setDetail({ ...detail, name: e.target.value })} />
                </div>
                <div className="mb-3">
                  <label className="form-label small">Tags (comma separated)</label>
                  <input className="form-control" value={(detail.tags || []).join(", ")}
                    onChange={(e) => setDetail({ ...detail, tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean) })} />
                </div>
                <div className="small text-muted">
                  <div>Size: {fmtSize(detail.size)} · Type: {detail.type}</div>
                  <div className="d-flex align-items-center gap-2 mt-1">
                    URL: <code className="text-truncate">{detail.url}</code>
                    <button className="btn btn-sm btn-outline-secondary" onClick={() => copyUrl(detail.url)}><i className="bi bi-clipboard" /></button>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-light" onClick={() => setDetail(null)}>Cancel</button>
                <button className="btn btn-primary" onClick={saveDetail}>Save</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
