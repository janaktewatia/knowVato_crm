import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("Admin@123");
  const [code, setCode] = useState("");
  const [step, setStep] = useState("creds"); // "creds" | "2fa"
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const res = await login(email, password, step === "2fa" ? code : undefined);
      if (res?.requires2FA) {
        setStep("2fa");
        setError(step === "2fa" ? "Invalid code, try again." : "");
      } else if (res?.mustSetup2FA) {
        nav("/settings?setup2fa=1");
      } else {
        nav("/");
      }
    } catch (err) {
      const data = err.response?.data;
      if (data?.requires2FA) { setStep("2fa"); setError("Invalid code, try again."); }
      else setError(data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center vh-100">
      <div className="card shadow-sm border-0 stat-card" style={{ width: 380 }}>
        <div className="card-body p-4">
          <h4 className="mb-1"><i className="bi bi-building-gear me-2" />WebBuilder</h4>
          <p className="text-muted small mb-4">{step === "creds" ? "Sign in to your account" : "Enter your authenticator code"}</p>
          {error && <div className="alert alert-danger py-2 small">{error}</div>}
          <form onSubmit={submit}>
            {step === "creds" ? (
              <>
                <div className="mb-3">
                  <label className="form-label small">Email</label>
                  <div className="input-group">
                    <span className="input-group-text"><i className="bi bi-envelope" /></span>
                    <input className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label small">Password</label>
                  <div className="input-group">
                    <span className="input-group-text"><i className="bi bi-lock" /></span>
                    <input type="password" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} required />
                  </div>
                </div>
              </>
            ) : (
              <div className="mb-3">
                <label className="form-label small">6-digit code</label>
                <div className="input-group">
                  <span className="input-group-text"><i className="bi bi-shield-lock" /></span>
                  <input className="form-control" placeholder="123456" maxLength="6" autoFocus
                    value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} required />
                </div>
                <button type="button" className="btn btn-link btn-sm px-0 mt-1" onClick={() => { setStep("creds"); setCode(""); setError(""); }}>
                  <i className="bi bi-arrow-left me-1" />Back
                </button>
              </div>
            )}
            <button className="btn btn-primary w-100" disabled={loading || (step === "2fa" && code.length !== 6)}>
              {loading ? <span className="spinner-border spinner-border-sm" /> : <><i className="bi bi-box-arrow-in-right me-1" />{step === "creds" ? "Sign In" : "Verify"}</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
