import { useState, useEffect } from "react";

/**
 * Loads the active module into the shell.
 *
 * - In PRODUCTION with Module Federation, a "remote" module's UI is loaded from
 *   its own subdomain (module.remoteEntry) and mounted here — so each team
 *   deploys independently yet the user sees one app.
 * - In THIS reference shell we demonstrate the host contract: built-in views
 *   render directly, and remote modules show a live "integration card" that
 *   actually calls the module's API through the gateway (proving the wiring +
 *   permissions) with a note on where the federated remote would mount.
 */
export default function ModuleHost({ module, token, user }) {
  if (!module) return <p className="text-secondary">No module selected.</p>;
  if (module.id === "dashboard") return <Dashboard user={user} />;
  if (module.id === "users") return <UsersView token={token} />;
  if (module.id === "events") return <EventsView token={token} />;
  return <RemotePlaceholder module={module} />;
}

function Dashboard({ user }) {
  return (
    <div>
      <h4>Welcome, {user.name.split(" ")[0]}</h4>
      <p className="text-secondary">You have access to the modules in the sidebar, based on your roles: <strong>{(user.roles || []).join(", ")}</strong>.</p>
      <div className="row g-3 mt-1">
        {(user.perms || []).slice(0, 12).map((p) => (
          <div className="col-auto" key={p}><span className="badge text-bg-light border">{p}</span></div>
        ))}
      </div>
    </div>
  );
}

// Built-in User Management view — calls Identity through the gateway
function UsersView({ token }) {
  const [users, setUsers] = useState(null);
  const [err, setErr] = useState(null);
  useEffect(() => {
    fetch("/api/identity/users", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json()).then((j) => j.ok ? setUsers(j.data) : setErr(j.error)).catch((e) => setErr(e.message));
  }, [token]);
  if (err) return <Alert text={err} />;
  if (!users) return <Spinner />;
  return (
    <div className="card"><table className="table mb-0">
      <thead><tr><th>Name</th><th>Email</th><th>Roles</th></tr></thead>
      <tbody>{users.map((u) => (
        <tr key={u._id}><td>{u.name}</td><td className="font-monospace small">{u.email}</td>
          <td>{(u.roles || []).map((r) => <span key={r._id || r} className="badge text-bg-light border me-1">{r.name || r}</span>)}</td></tr>
      ))}</tbody>
    </table></div>
  );
}

// Events module view — calls the Events service through the gateway, and can
// trigger a shared-template WhatsApp invite via Communication.
function EventsView({ token }) {
  const [events, setEvents] = useState(null);
  const [err, setErr] = useState(null);
  const [msg, setMsg] = useState(null);
  function load() {
    fetch("/api/events/events", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json()).then((j) => j.ok ? setEvents(j.data) : setErr(j.error)).catch((e) => setErr(e.message));
  }
  useEffect(load, [token]);
  async function invite(id) {
    setMsg("Sending…");
    const r = await fetch(`/api/events/events/${id}/invite`, {
      method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ phones: ["+91 98200 11111", "+91 98300 22222"], template: "campus_visit_invite" }),
    });
    const j = await r.json();
    setMsg(j.ok ? `Invited via shared template — ${j.data.sent.filter((x) => x.ok).length} sent` : (j.error || "Failed"));
    load();
  }
  if (err) return <Alert text={err} />;
  if (!events) return <Spinner />;
  return (
    <div>
      <p className="text-secondary small">This module calls the <strong>Events</strong> service, which in turn sends WhatsApp through the shared <strong>Communication</strong> service using a template created once in the CRM.</p>
      {msg && <div className="alert alert-info py-2 small">{msg}</div>}
      <div className="card"><table className="table mb-0">
        <thead><tr><th>Event</th><th>Date</th><th>Invited</th><th></th></tr></thead>
        <tbody>{events.map((e) => (
          <tr key={e.id}><td>{e.title}</td><td>{e.date}</td><td>{e.invited}</td>
            <td className="text-end"><button className="btn btn-sm text-white" style={{ background: "#0085a8" }} onClick={() => invite(e.id)}>
              <i className="bi bi-whatsapp me-1"></i>Invite via WhatsApp</button></td></tr>
        ))}</tbody>
      </table></div>
    </div>
  );
}

function RemotePlaceholder({ module }) {
  return (
    <div className="card"><div className="card-body">
      <h5><i className={`bi bi-${module.icon} me-2`}></i>{module.name}</h5>
      <p className="text-secondary mb-2">This is a <strong>remote module</strong>. In production the shell loads its UI at runtime via Module Federation:</p>
      <pre className="bg-light p-3 rounded small mb-2">{`remoteEntry: ${module.remoteEntry || module.baseUrl + "/assets/remoteEntry.js"}
scope:       ${module.scope}
exposes:     ${module.module}`}</pre>
      <p className="text-secondary small mb-0">It is also independently reachable at <a href={module.baseUrl}>{module.baseUrl}</a>. Its API is routed through the gateway at <code>{module.apiPrefix}</code>, and access requires <code>{module.permission}</code>.</p>
    </div></div>
  );
}

const Spinner = () => <div className="text-center text-secondary py-5"><div className="spinner-border spinner-border-sm" /></div>;
const Alert = ({ text }) => <div className="alert alert-warning py-2 small">{text}</div>;
