import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("priya@greenwood.edu");
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await login(email, password);
      nav("/");
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100" style={{ background: "linear-gradient(135deg,#0d1116,#005c47)" }}>
      <div className="card shadow-lg border-0" style={{ width: 380 }}>
        <div className="card-body p-4">
          <div className="text-center mb-4">
            <span className="d-inline-grid" style={{ width: 48, height: 48, placeItems: "center", background: "var(--wa-green)", borderRadius: 12, color: "#fff", fontSize: 24 }}>
              <i className="bi bi-whatsapp"></i>
            </span>
            <h1 className="h5 mt-3 mb-0 fw-semibold">WhatsApp CRM</h1>
            <p className="text-secondary small">Sign in to your admissions suite</p>
          </div>

          {error && <div className="alert alert-danger py-2 small">{error}</div>}

          <form onSubmit={submit}>
            <div className="mb-3">
              <label className="form-label small fw-medium">Email</label>
              <input className="form-control" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="mb-3">
              <label className="form-label small fw-medium">Password</label>
              <input className="form-control" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <button className="btn btn-wa w-100" disabled={busy}>
              {busy ? <span className="spinner-border spinner-border-sm me-2" /> : <i className="bi bi-box-arrow-in-right me-2"></i>}
              Sign in
            </button>
          </form>

          <div className="text-center text-secondary mt-3" style={{ fontSize: 11.5 }}>
            Demo: priya@greenwood.edu / password123
          </div>
        </div>
      </div>
    </div>
  );
}
