import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";

const cardDefs = [
  { key: "totalWebsites", label: "Total Websites", icon: "bi-globe2", color: "primary" },
  { key: "publishedWebsites", label: "Published", icon: "bi-check-circle", color: "success" },
  { key: "draftWebsites", label: "Drafts", icon: "bi-pencil-square", color: "warning" },
  { key: "totalPages", label: "Total Pages", icon: "bi-file-earmark-text", color: "info" },
];

export default function Dashboard() {
  const [data, setData] = useState(null);
  const nav = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    api.get("/dashboard/stats").then((r) => setData(r.data));
  }, []);

  if (!data) return <div className="text-center p-5"><span className="spinner-border" /></div>;

  return (
    <>
      <h3 className="mb-4"><i className="bi bi-speedometer2 me-2" />Dashboard</h3>
      <div className="row g-3 mb-4">
        {cardDefs.map((c) => (
          <div className="col-sm-6 col-lg-3" key={c.key}>
            <div className="card stat-card shadow-sm">
              <div className="card-body d-flex align-items-center">
                <div className={`rounded-circle bg-${c.color} bg-opacity-10 text-${c.color} p-3 me-3`}>
                  <i className={`bi ${c.icon} fs-4`} />
                </div>
                <div>
                  <div className="fs-3 fw-bold">{data.cards[c.key]}</div>
                  <div className="text-muted small">{c.label}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {data.cards.totalWebsites === 0 && (
        <div className="card stat-card mb-4" style={{ background: "linear-gradient(135deg,#1d4ed8,#0b1f5c)", color: "#fff", border: "none" }}>
          <div className="card-body p-4">
            <h4 className="fw-bold"><i className="bi bi-rocket-takeoff me-2" />Welcome{user?.name ? `, ${user.name}` : ""}! Launch your first site in 3 steps</h4>
            <div className="row g-3 mt-1">
              <div className="col-md-4"><div className="bg-white bg-opacity-10 rounded-3 p-3 h-100"><div className="fs-3 fw-bold">1</div><div className="fw-semibold">Create a website</div><div className="small opacity-75">Name it and pick a category.</div></div></div>
              <div className="col-md-4"><div className="bg-white bg-opacity-10 rounded-3 p-3 h-100"><div className="fs-3 fw-bold">2</div><div className="fw-semibold">Apply a template</div><div className="small opacity-75">Open a page → Templates → pick a design.</div></div></div>
              <div className="col-md-4"><div className="bg-white bg-opacity-10 rounded-3 p-3 h-100"><div className="fs-3 fw-bold">3</div><div className="fw-semibold">Publish &amp; go live</div><div className="small opacity-75">Hit publish and share your live link.</div></div></div>
            </div>
            <button className="btn btn-light fw-semibold mt-3" onClick={() => nav("/websites")}><i className="bi bi-plus-lg me-1" />Create Website</button>
          </div>
        </div>
      )}

      <div className="card stat-card shadow-sm">
        <div className="card-header bg-white"><i className="bi bi-clock-history me-2" />Recent Activity</div>
        <ul className="list-group list-group-flush">
          {data.recentActivities.length === 0 && <li className="list-group-item text-muted">No activity yet.</li>}
          {data.recentActivities.map((a) => (
            <li className="list-group-item d-flex justify-content-between" key={a._id}>
              <span><i className="bi bi-dot" />{a.action} {a.entity && <span className="text-muted">· {a.entity}</span>}</span>
              <small className="text-muted">{a.user?.name} · {new Date(a.createdAt).toLocaleString()}</small>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
