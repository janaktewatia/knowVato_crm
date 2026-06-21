import { useEffect, useState } from "react";
import api from "../api/client";
import PageHeader from "../components/PageHeader";
import Loader from "../components/Loader";
import TwoFactorSetup from "../components/TwoFactorSetup";
import { useAuth } from "../context/AuthContext";
import { useSearchParams } from "react-router-dom";

const TABS = [
  { key: "smtp", label: "Email (SMTP)", icon: "bi-envelope-gear" },
  { key: "security", label: "Security", icon: "bi-shield-lock" },
  { key: "whatsapp", label: "WhatsApp", icon: "bi-whatsapp" },
  { key: "sms", label: "SMS", icon: "bi-chat-dots" },
];

const blank = {
  smtp: { enabled: false, host: "", port: 587, secure: false, user: "", pass: "", fromName: "", fromEmail: "" },
  security: { twoFactorEnabled: false, twoFactorRequiredTypes: [], sessionTimeoutMins: 0, maxLoginAttempts: 5, ipRestrictionEnabled: false, allowedIps: [], forceHttps: false },
  whatsapp: { enabled: false, provider: "twilio", accountSid: "", authToken: "", fromNumber: "" },
  sms: { enabled: false, provider: "twilio", apiKey: "", apiSecret: "", senderId: "" },
};

export default function Settings() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const mustSetup2fa = searchParams.get("setup2fa") === "1";
  const [empTypes, setEmpTypes] = useState([]);
  const [s, setS] = useState(blank);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [tab, setTab] = useState(searchParams.get("setup2fa") === "1" ? "security" : "smtp");
  const [testTo, setTestTo] = useState("");
  const [testResult, setTestResult] = useState(null);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    if (user?.isSuperAdmin) api.get("/employee-types").then((r) => setEmpTypes(r.data.items)).catch(() => {});
  }, [user]);

  useEffect(() => {
    api.get("/settings").then((r) => {
      setS({
        smtp: { ...blank.smtp, ...(r.data.smtp || {}) },
        security: { ...blank.security, ...(r.data.security || {}) },
        whatsapp: { ...blank.whatsapp, ...(r.data.whatsapp || {}) },
        sms: { ...blank.sms, ...(r.data.sms || {}) },
      });
      setLoading(false);
    });
  }, []);

  const setBlock = (block, patch) => setS((prev) => ({ ...prev, [block]: { ...prev[block], ...patch } }));

  const save = async () => {
    const r = await api.put("/settings", s);
    setS({
      smtp: { ...blank.smtp, ...(r.data.smtp || {}) },
      security: { ...blank.security, ...(r.data.security || {}) },
      whatsapp: { ...blank.whatsapp, ...(r.data.whatsapp || {}) },
      sms: { ...blank.sms, ...(r.data.sms || {}) },
    });
    setSaved(true); setTimeout(() => setSaved(false), 1500);
  };

  const sendTest = async () => {
    setTesting(true); setTestResult(null);
    try {
      const r = await api.post("/settings/test-email", { to: testTo });
      setTestResult({ ok: r.data.ok, message: r.data.message });
    } catch (e) {
      setTestResult({ ok: false, message: e.response?.data?.message || "Failed" });
    } finally { setTesting(false); }
  };

  if (loading) return <Loader />;

  return (
    <>
      <PageHeader icon="bi-gear" title="Settings" subtitle="Email, security & messaging integrations">
        <button className="btn btn-primary" onClick={save}><i className="bi bi-save me-1" />Save</button>
      </PageHeader>
      {saved && <div className="alert alert-success py-2"><i className="bi bi-check-circle me-1" />Settings saved</div>}
      {mustSetup2fa && (
        <div className="alert alert-warning py-2"><i className="bi bi-shield-exclamation me-1" />Your role requires two-factor authentication. Please set it up below to secure your account.</div>
      )}

      <ul className="nav nav-tabs mb-3">
        {TABS.map((t) => (
          <li className="nav-item" key={t.key}>
            <button className={`nav-link ${tab === t.key ? "active" : ""}`} onClick={() => setTab(t.key)}>
              <i className={`bi ${t.icon} me-1`} />{t.label}
            </button>
          </li>
        ))}
      </ul>

      {/* SMTP */}
      {tab === "smtp" && (
        <div className="row g-3">
          <div className="col-lg-7">
            <div className="card stat-card">
              <div className="card-header d-flex justify-content-between align-items-center">
                <span><i className="bi bi-envelope-gear me-1" />SMTP</span>
                <div className="form-check form-switch m-0"><input className="form-check-input" type="checkbox" checked={s.smtp.enabled} onChange={(e) => setBlock("smtp", { enabled: e.target.checked })} id="se" /><label className="form-check-label small" htmlFor="se">Enabled</label></div>
              </div>
              <div className="card-body row g-3">
                <div className="col-md-8"><label className="form-label small">Host</label><input className="form-control" value={s.smtp.host} onChange={(e) => setBlock("smtp", { host: e.target.value })} disabled={!s.smtp.enabled} /></div>
                <div className="col-md-4"><label className="form-label small">Port</label><input type="number" className="form-control" value={s.smtp.port} onChange={(e) => setBlock("smtp", { port: +e.target.value })} disabled={!s.smtp.enabled} /></div>
                <div className="col-md-6"><label className="form-label small">Username</label><input className="form-control" autoComplete="off" value={s.smtp.user} onChange={(e) => setBlock("smtp", { user: e.target.value })} disabled={!s.smtp.enabled} /></div>
                <div className="col-md-6"><label className="form-label small">Password</label><input type="password" className="form-control" autoComplete="new-password" value={s.smtp.pass} onChange={(e) => setBlock("smtp", { pass: e.target.value })} disabled={!s.smtp.enabled} /></div>
                <div className="col-md-6"><label className="form-label small">From Name</label><input className="form-control" value={s.smtp.fromName} onChange={(e) => setBlock("smtp", { fromName: e.target.value })} disabled={!s.smtp.enabled} /></div>
                <div className="col-md-6"><label className="form-label small">From Email</label><input type="email" className="form-control" value={s.smtp.fromEmail} onChange={(e) => setBlock("smtp", { fromEmail: e.target.value })} disabled={!s.smtp.enabled} /></div>
                <div className="col-12"><div className="form-check"><input className="form-check-input" type="checkbox" checked={s.smtp.secure} onChange={(e) => setBlock("smtp", { secure: e.target.checked })} disabled={!s.smtp.enabled} id="sec" /><label className="form-check-label small" htmlFor="sec">Use SSL/TLS (port 465)</label></div></div>
              </div>
            </div>
          </div>
          <div className="col-lg-5">
            <div className="card stat-card">
              <div className="card-header"><i className="bi bi-send-check me-1" />Send Test Email</div>
              <div className="card-body">
                <p className="small text-muted">Save first, then test.</p>
                <input type="email" className="form-control mb-2" placeholder="you@example.com" value={testTo} onChange={(e) => setTestTo(e.target.value)} />
                <button className="btn btn-outline-primary w-100" onClick={sendTest} disabled={!s.smtp.enabled || !testTo || testing}>
                  {testing ? <span className="spinner-border spinner-border-sm me-1" /> : <i className="bi bi-send me-1" />}Send Test
                </button>
                {testResult && <div className={`alert mt-3 py-2 small ${testResult.ok ? "alert-success" : "alert-danger"}`}><i className={`bi ${testResult.ok ? "bi-check-circle" : "bi-x-circle"} me-1`} />{testResult.message}</div>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Security */}
      {tab === "security" && (
        <div className="card stat-card" style={{ maxWidth: 720 }}>
          <div className="card-header"><i className="bi bi-shield-lock me-1" />Security</div>
          <div className="card-body row g-3">
            <div className="col-12"><TwoFactorSetup /></div>
            {user?.role === "super_admin" && (
              <div className="col-12">
                <div className="border rounded p-3">
                  <strong><i className="bi bi-people me-1" />Require 2FA for employee types</strong>
                  <p className="small text-muted mb-2">Users of the selected types must set up and use 2FA at login.</p>
                  <div className="d-flex flex-wrap gap-3">
                    {empTypes.length === 0 && <span className="small text-muted">No employee types yet.</span>}
                    {empTypes.map((t) => (
                      <div className="form-check" key={t._id}>
                        <input className="form-check-input" type="checkbox" id={`r2fa-${t._id}`}
                          checked={s.security.twoFactorRequiredTypes.includes(t._id)}
                          onChange={(e) => {
                            const cur = s.security.twoFactorRequiredTypes;
                            setBlock("security", { twoFactorRequiredTypes: e.target.checked ? [...cur, t._id] : cur.filter((x) => x !== t._id) });
                          }} />
                        <label className="form-check-label small" htmlFor={`r2fa-${t._id}`}>{t.name}</label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div className="col-md-6"><label className="form-label small">Session timeout (minutes, 0 = none)</label><input type="number" className="form-control" value={s.security.sessionTimeoutMins} onChange={(e) => setBlock("security", { sessionTimeoutMins: +e.target.value })} /></div>
            <div className="col-md-6"><label className="form-label small">Max login attempts</label><input type="number" className="form-control" value={s.security.maxLoginAttempts} onChange={(e) => setBlock("security", { maxLoginAttempts: +e.target.value })} /></div>
            <div className="col-12"><div className="form-check form-switch"><input className="form-check-input" type="checkbox" checked={s.security.ipRestrictionEnabled} onChange={(e) => setBlock("security", { ipRestrictionEnabled: e.target.checked })} id="ipr" /><label className="form-check-label small" htmlFor="ipr">Enable IP restriction (allowlist below)</label></div></div>
            <div className="col-12"><label className="form-label small">Allowed IPs (one per line)</label><textarea className="form-control font-monospace small" rows="3" value={s.security.allowedIps.join("\n")} onChange={(e) => setBlock("security", { allowedIps: e.target.value.split("\n").map((x) => x.trim()).filter(Boolean) })} disabled={!s.security.ipRestrictionEnabled} /></div>
            <div className="col-12"><div className="form-check form-switch"><input className="form-check-input" type="checkbox" checked={s.security.forceHttps} onChange={(e) => setBlock("security", { forceHttps: e.target.checked })} id="https" /><label className="form-check-label small" htmlFor="https">Force HTTPS redirect</label></div></div>
            <div className="col-12"><div className="alert alert-info py-2 small mb-0"><i className="bi bi-info-circle me-1" />Login attempt limiting is enforced live. IP restriction & HTTPS enforcement are best applied at your proxy/load-balancer in production.</div></div>
          </div>
        </div>
      )}

      {/* WhatsApp */}
      {tab === "whatsapp" && (
        <div className="card stat-card" style={{ maxWidth: 720 }}>
          <div className="card-header d-flex justify-content-between align-items-center">
            <span><i className="bi bi-whatsapp me-1" />WhatsApp</span>
            <div className="form-check form-switch m-0"><input className="form-check-input" type="checkbox" checked={s.whatsapp.enabled} onChange={(e) => setBlock("whatsapp", { enabled: e.target.checked })} id="we" /><label className="form-check-label small" htmlFor="we">Enabled</label></div>
          </div>
          <div className="card-body row g-3">
            <div className="col-md-6"><label className="form-label small">Provider</label><select className="form-select" value={s.whatsapp.provider} onChange={(e) => setBlock("whatsapp", { provider: e.target.value })} disabled={!s.whatsapp.enabled}><option value="twilio">Twilio</option><option value="meta">Meta Cloud API</option></select></div>
            <div className="col-md-6"><label className="form-label small">From Number</label><input className="form-control" placeholder="+1..." value={s.whatsapp.fromNumber} onChange={(e) => setBlock("whatsapp", { fromNumber: e.target.value })} disabled={!s.whatsapp.enabled} /></div>
            <div className="col-md-6"><label className="form-label small">Account SID</label><input className="form-control" value={s.whatsapp.accountSid} onChange={(e) => setBlock("whatsapp", { accountSid: e.target.value })} disabled={!s.whatsapp.enabled} /></div>
            <div className="col-md-6"><label className="form-label small">Auth Token</label><input type="password" className="form-control" autoComplete="new-password" value={s.whatsapp.authToken} onChange={(e) => setBlock("whatsapp", { authToken: e.target.value })} disabled={!s.whatsapp.enabled} /></div>
          </div>
        </div>
      )}

      {/* SMS */}
      {tab === "sms" && (
        <div className="card stat-card" style={{ maxWidth: 720 }}>
          <div className="card-header d-flex justify-content-between align-items-center">
            <span><i className="bi bi-chat-dots me-1" />SMS Gateway</span>
            <div className="form-check form-switch m-0"><input className="form-check-input" type="checkbox" checked={s.sms.enabled} onChange={(e) => setBlock("sms", { enabled: e.target.checked })} id="sm" /><label className="form-check-label small" htmlFor="sm">Enabled</label></div>
          </div>
          <div className="card-body row g-3">
            <div className="col-md-6"><label className="form-label small">Provider</label><select className="form-select" value={s.sms.provider} onChange={(e) => setBlock("sms", { provider: e.target.value })} disabled={!s.sms.enabled}><option value="twilio">Twilio</option><option value="msg91">MSG91</option><option value="textlocal">Textlocal</option></select></div>
            <div className="col-md-6"><label className="form-label small">Sender ID</label><input className="form-control" value={s.sms.senderId} onChange={(e) => setBlock("sms", { senderId: e.target.value })} disabled={!s.sms.enabled} /></div>
            <div className="col-md-6"><label className="form-label small">API Key</label><input className="form-control" value={s.sms.apiKey} onChange={(e) => setBlock("sms", { apiKey: e.target.value })} disabled={!s.sms.enabled} /></div>
            <div className="col-md-6"><label className="form-label small">API Secret</label><input type="password" className="form-control" autoComplete="new-password" value={s.sms.apiSecret} onChange={(e) => setBlock("sms", { apiSecret: e.target.value })} disabled={!s.sms.enabled} /></div>
          </div>
        </div>
      )}
    </>
  );
}
