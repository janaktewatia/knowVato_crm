import { useEffect, useState } from "react";
import api from "../api/client";

// Modal panel showing version history for a page. Props: entityId, onRestore, onClose.
export default function VersionHistory({ entity = "Page", entityId, onRestore, onClose }) {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [compare, setCompare] = useState([]); // up to 2 selected ids
  const [diff, setDiff] = useState(null);

  const load = () => {
    setLoading(true);
    api.get(`/versions/${entity}/${entityId}`).then((r) => { setVersions(r.data.items); setLoading(false); });
  };
  useEffect(() => { load(); }, [entityId]);

  const restore = async (id) => {
    if (!window.confirm("Restore this version? Current content will be overwritten.")) return;
    await api.post(`/versions/restore/${id}`);
    onRestore?.();
    onClose?.();
  };

  const toggleCompare = (id) => {
    setCompare((c) => c.includes(id) ? c.filter((x) => x !== id) : [...c, id].slice(-2));
    setDiff(null);
  };

  const runCompare = async () => {
    if (compare.length !== 2) return;
    const r = await api.get("/versions/compare", { params: { a: compare[0], b: compare[1] } });
    // simple field-level diff on snapshot keys
    const a = r.data.a.snapshot, b = r.data.b.snapshot;
    const keys = [...new Set([...Object.keys(a), ...Object.keys(b)])].filter((k) => !["_id", "__v", "createdAt", "updatedAt"].includes(k));
    const changes = keys.map((k) => {
      const av = JSON.stringify(a[k]), bv = JSON.stringify(b[k]);
      return { key: k, changed: av !== bv, a: av, b: bv };
    });
    setDiff({ va: r.data.a.versionNumber, vb: r.data.b.versionNumber, changes });
  };

  return (
    <div className="modal d-block" style={{ background: "rgba(0,0,0,.5)" }} onClick={onClose}>
      <div className="modal-dialog modal-lg modal-dialog-scrollable" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title"><i className="bi bi-clock-history me-2" />Version History</h5>
            <button className="btn-close" onClick={onClose} />
          </div>
          <div className="modal-body">
            {loading ? <div className="text-center p-4"><span className="spinner-border" /></div> :
              versions.length === 0 ? <p className="text-muted text-center py-4">No versions yet. Versions are saved each time you save the page.</p> : (
              <>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="small text-muted">Select 2 versions to compare</span>
                  <button className="btn btn-sm btn-outline-primary" onClick={runCompare} disabled={compare.length !== 2}>
                    <i className="bi bi-arrow-left-right me-1" />Compare
                  </button>
                </div>
                <div className="list-group mb-3">
                  {versions.map((v) => (
                    <div className="list-group-item d-flex justify-content-between align-items-center" key={v._id}>
                      <div>
                        <input type="checkbox" className="form-check-input me-2" checked={compare.includes(v._id)} onChange={() => toggleCompare(v._id)} />
                        <strong>v{v.versionNumber}</strong>
                        <span className={`badge ms-2 ${v.label === "published" ? "bg-success" : "bg-secondary"}`}>{v.label}</span>
                        <span className="small text-muted ms-2">{new Date(v.createdAt).toLocaleString()} · {v.createdBy?.name || "—"}</span>
                      </div>
                      <button className="btn btn-sm btn-outline-secondary" onClick={() => restore(v._id)}><i className="bi bi-arrow-counterclockwise me-1" />Restore</button>
                    </div>
                  ))}
                </div>
                {diff && (
                  <div className="card">
                    <div className="card-header small fw-semibold">Comparing v{diff.va} ↔ v{diff.vb}</div>
                    <div className="table-responsive">
                      <table className="table table-sm m-0">
                        <thead className="table-light"><tr><th>Field</th><th>v{diff.va}</th><th>v{diff.vb}</th></tr></thead>
                        <tbody>
                          {diff.changes.map((c) => (
                            <tr key={c.key} className={c.changed ? "table-warning" : ""}>
                              <td className="small fw-semibold">{c.key}</td>
                              <td className="small text-truncate" style={{ maxWidth: 200 }}>{c.a}</td>
                              <td className="small text-truncate" style={{ maxWidth: 200 }}>{c.b}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
