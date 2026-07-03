import { useState, useRef } from "react";
import api from "../api/client";
import PageHeader from "../components/PageHeader";

export default function Backup() {
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [preview, setPreview] = useState(null);
  const [mode, setMode] = useState("merge");
  const fileRef = useRef();

  const downloadBackup = async () => {
    setBusy(true); setResult(null);
    try {
      const res = await api.get("/backup", { params: { download: "true" }, responseType: "blob" });
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url; a.download = `backup_${Date.now()}.json`; a.click();
      URL.revokeObjectURL(url);
      setResult({ ok: true, message: "Backup downloaded." });
    } catch {
      setResult({ ok: false, message: "Backup failed." });
    } finally { setBusy(false); }
  };

  const onFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        if (!parsed.data) throw new Error("Missing data");
        setPreview(parsed);
        setResult(null);
      } catch {
        setResult({ ok: false, message: "Invalid backup file." });
        setPreview(null);
      }
    };
    reader.readAsText(file);
  };

  const restore = async () => {
    if (!preview) return;
    if (mode === "replace" && !window.confirm("Replace mode will DELETE your current content first. Continue?")) return;
    setBusy(true); setResult(null);
    try {
      const res = await api.post("/backup/restore", { backup: preview, mode });
      setResult({ ok: true, message: `Restored (${mode}).`, detail: res.data.restored });
      setPreview(null); if (fileRef.current) fileRef.current.value = "";
    } catch (e) {
      setResult({ ok: false, message: e.response?.data?.message || "Restore failed." });
    } finally { setBusy(false); }
  };

  return (
    <>
      <PageHeader icon="bi-hdd-stack" title="Backup & Restore" subtitle="Export and import your entire content" />

      {result && <div className={`alert py-2 ${result.ok ? "alert-success" : "alert-danger"}`}><i className={`bi ${result.ok ? "bi-check-circle" : "bi-x-circle"} me-1`} />{result.message}</div>}

      <div className="row g-3">
        <div className="col-md-6">
          <div className="card stat-card h-100">
            <div className="card-header"><i className="bi bi-download me-1" />Create Backup</div>
            <div className="card-body">
              <p className="small text-muted">Downloads a JSON file containing all your websites, pages, news, events, forms, menus, banners, popups and themes.</p>
              <button className="btn btn-primary" onClick={downloadBackup} disabled={busy}>
                {busy ? <span className="spinner-border spinner-border-sm me-1" /> : <i className="bi bi-download me-1" />}Download Backup
              </button>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card stat-card h-100">
            <div className="card-header"><i className="bi bi-upload me-1" />Restore Backup</div>
            <div className="card-body">
              <input ref={fileRef} type="file" accept="application/json" className="form-control mb-3" onChange={onFile} />
              {preview && (
                <div className="border rounded p-2 mb-3 bg-light small">
                  <div className="fw-semibold mb-1">Backup preview ({preview.createdAt?.slice(0, 10)}):</div>
                  {Object.entries(preview.counts || {}).map(([k, v]) => (
                    <span key={k} className="badge bg-secondary-subtle text-dark me-1 mb-1">{k}: {v}</span>
                  ))}
                </div>
              )}
              <div className="mb-3">
                <label className="form-label small">Restore mode</label>
                <select className="form-select" value={mode} onChange={(e) => setMode(e.target.value)}>
                  <option value="merge">Merge (add to existing)</option>
                  <option value="replace">Replace (wipe then restore)</option>
                </select>
              </div>
              <button className="btn btn-success" onClick={restore} disabled={busy || !preview}>
                {busy ? <span className="spinner-border spinner-border-sm me-1" /> : <i className="bi bi-arrow-counterclockwise me-1" />}Restore
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
