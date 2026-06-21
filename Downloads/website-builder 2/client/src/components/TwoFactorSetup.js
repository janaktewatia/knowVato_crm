import { useEffect, useState } from "react";
import api from "../api/client";

// Self-contained 2FA management widget for the Security settings tab.
export default function TwoFactorSetup() {
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [qr, setQr] = useState("");
  const [secret, setSecret] = useState("");
  const [code, setCode] = useState("");
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);

  const loadStatus = () => api.get("/2fa/status").then((r) => { setEnabled(r.data.enabled); setLoading(false); });
  useEffect(() => { loadStatus(); }, []);

  const startSetup = async () => {
    setBusy(true); setMsg(null);
    try {
      const r = await api.post("/2fa/setup");
      setQr(r.data.qr); setSecret(r.data.secret);
    } finally { setBusy(false); }
  };

  const confirmEnable = async () => {
    setBusy(true); setMsg(null);
    try {
      await api.post("/2fa/enable", { token: code });
      setEnabled(true); setQr(""); setSecret(""); setCode("");
      setMsg({ ok: true, text: "2FA enabled. You'll need your authenticator app at next login." });
    } catch (e) {
      setMsg({ ok: false, text: e.response?.data?.message || "Invalid code." });
    } finally { setBusy(false); }
  };

  const disable = async () => {
    const token = window.prompt("Enter a current 2FA code to disable:");
    if (token === null) return;
    setBusy(true); setMsg(null);
    try {
      await api.post("/2fa/disable", { token });
      setEnabled(false);
      setMsg({ ok: true, text: "2FA disabled." });
    } catch (e) {
      setMsg({ ok: false, text: e.response?.data?.message || "Failed to disable." });
    } finally { setBusy(false); }
  };

  if (loading) return <div className="text-muted small"><span className="spinner-border spinner-border-sm me-2" />Checking 2FA status...</div>;

  return (
    <div className="border rounded p-3">
      <div className="d-flex justify-content-between align-items-center">
        <div>
          <strong><i className="bi bi-shield-check me-1" />Two-Factor Authentication</strong>
          <span className={`badge ms-2 ${enabled ? "bg-success" : "bg-secondary"}`}>{enabled ? "Enabled" : "Disabled"}</span>
        </div>
        {enabled
          ? <button className="btn btn-sm btn-outline-danger" onClick={disable} disabled={busy}>Disable</button>
          : !qr && <button className="btn btn-sm btn-outline-primary" onClick={startSetup} disabled={busy}>{busy ? <span className="spinner-border spinner-border-sm" /> : "Set Up"}</button>}
      </div>

      {msg && <div className={`alert mt-2 mb-0 py-2 small ${msg.ok ? "alert-success" : "alert-danger"}`}>{msg.text}</div>}

      {qr && !enabled && (
        <div className="mt-3">
          <p className="small mb-2">1. Scan this QR with Google Authenticator / Authy:</p>
          <img src={qr} alt="2FA QR" width="160" height="160" className="border rounded mb-2" />
          <p className="small text-muted mb-2">Or enter this key manually: <code>{secret}</code></p>
          <p className="small mb-1">2. Enter the 6-digit code to confirm:</p>
          <div className="input-group" style={{ maxWidth: 260 }}>
            <input className="form-control" placeholder="123456" maxLength="6" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} />
            <button className="btn btn-primary" onClick={confirmEnable} disabled={busy || code.length !== 6}>Verify & Enable</button>
          </div>
        </div>
      )}
    </div>
  );
}
