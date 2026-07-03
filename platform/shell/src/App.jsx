import { useState, useEffect } from "react";
import modules from "../modules.json";
import ModuleHost from "./ModuleHost";

// Gateway base — in dev the Vite proxy forwards /api to the gateway.
const API = "/api";

function useAuth() {
  const [token, setToken] = useState(() => localStorage.getItem("kv_token"));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) { setLoading(false); return; }
    fetch(`${API}/identity/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((j) => { if (j.ok) setUser(j.data.user); else logout(); })
      .catch(() => logout())
      .finally(() => setLoading(false));
  }, [token]);

  async function login(email, password) {
    const r = await fetch(`${API}/identity/auth/login`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const j = await r.json();
    if (!j.ok) throw new Error(j.error || "Login failed");
    localStorage.setItem("kv_token", j.data.accessToken);
    setToken(j.data.accessToken);
    setUser(j.data.user);
  }
  function logout() { localStorage.removeItem("kv_token"); setToken(null); setUser(null); }
  return { token, user, loading, login, logout };
}

export default function App() {
  const auth = useAuth();
  const [active, setActive] = useState("dashboard");

  if (auth.loading) return <Centered><div className="spinner-border text-primary" /></Centered>;
  if (!auth.user) return <Login onLogin={auth.login} />;

  const can = (perm) => !perm || (auth.user.perms || []).includes(perm) || (auth.user.perms || []).includes("*");
  const visible = modules.modules.filter((m) => can(m.permission));
  const current = visible.find((m) => m.id === active) || visible[0];

  return (
    <div className="d-flex" style={{ minHeight: "100vh" }}>
      {/* sidebar — one nav across all modules, filtered by permission */}
      <aside className="text-white d-flex flex-column" style={{ width: 240, background: "#0d1116" }}>
        <div className="p-3 border-bottom border-secondary d-flex align-items-center gap-2">
          <span className="d-grid" style={{ width: 30, height: 30, placeItems: "center", background: "#0085a8", borderRadius: 8 }}>
            <i className="bi bi-hexagon-fill"></i>
          </span>
          <strong>Knowvato</strong>
        </div>
        <div className="p-2 flex-grow-1">
          <div className="text-uppercase small px-2 py-1" style={{ color: "#6b7480", fontSize: 10.5, letterSpacing: ".07em" }}>Modules</div>
          {visible.map((m) => (
            <button key={m.id} onClick={() => setActive(m.id)}
              className={"btn btn-sm w-100 text-start d-flex align-items-center gap-2 mb-1 " + (current?.id === m.id ? "text-white" : "text-secondary")}
              style={{ background: current?.id === m.id ? "#0085a8" : "transparent" }}>
              <i className={`bi bi-${m.icon}`}></i> {m.name}
            </button>
          ))}
        </div>
        <div className="p-2 border-top border-secondary small">
          <div className="text-white">{auth.user.name}</div>
          <div className="text-secondary" style={{ fontSize: 11 }}>{(auth.user.roles || []).join(", ")}</div>
          <button className="btn btn-sm btn-outline-light border-0 mt-1 px-1" onClick={auth.logout}>
            <i className="bi bi-box-arrow-right"></i> Sign out
          </button>
        </div>
      </aside>

      {/* module host */}
      <main className="flex-grow-1" style={{ background: "#f7fbfe" }}>
        <div className="d-flex align-items-center px-4 border-bottom bg-white" style={{ height: 56 }}>
          <h6 className="mb-0">{current?.name}</h6>
          <span className="ms-auto text-secondary small">{modules.tenant} · signed in as {auth.user.email}</span>
        </div>
        <div className="p-4">
          <ModuleHost module={current} token={auth.token} user={auth.user} />
        </div>
      </main>
    </div>
  );
}

function Login({ onLogin }) {
  const [email, setEmail] = useState("priya@knowvato.in");
  const [password, setPassword] = useState("password123");
  const [err, setErr] = useState(null);
  const [busy, setBusy] = useState(false);
  async function submit(e) {
    e.preventDefault(); setBusy(true); setErr(null);
    try { await onLogin(email, password); } catch (e) { setErr(e.message); } finally { setBusy(false); }
  }
  return (
    <Centered>
      <form onSubmit={submit} className="card shadow-sm p-4" style={{ width: 360 }}>
        <div className="text-center mb-3">
          <span className="d-inline-grid" style={{ width: 46, height: 46, placeItems: "center", background: "#0085a8", color: "#fff", borderRadius: 12, fontSize: 22 }}>
            <i className="bi bi-hexagon-fill"></i>
          </span>
          <h5 className="mt-2 mb-0">Knowvato</h5>
          <div className="text-secondary small">Sign in to the platform</div>
        </div>
        {err && <div className="alert alert-danger py-2 small">{err}</div>}
        <input className="form-control mb-2" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
        <input className="form-control mb-3" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
        <button className="btn w-100 text-white" style={{ background: "#0085a8" }} disabled={busy}>{busy ? "…" : "Sign in"}</button>
        <div className="text-center text-secondary mt-2" style={{ fontSize: 11 }}>priya@knowvato.in / password123</div>
      </form>
    </Centered>
  );
}

function Centered({ children }) {
  return <div className="d-flex align-items-center justify-content-center" style={{ minHeight: "100vh", background: "linear-gradient(135deg,#0d1116,#0085a8)" }}>{children}</div>;
}
