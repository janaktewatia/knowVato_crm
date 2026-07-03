import { useEffect, useState } from "react";
import api from "../api/client";
import PageHeader from "../components/PageHeader";
import Loader from "../components/Loader";
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Tooltip, Legend, Filler,
} from "chart.js";
import { Line, Doughnut, Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Tooltip, Legend, Filler);

const PALETTE = ["#0d6efd", "#6610f2", "#198754", "#fd7e14", "#dc3545", "#20c997", "#6c757d"];

export default function Analytics() {
  const [days, setDays] = useState(30);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get("/analytics/overview", { params: { days } }).then((r) => { setData(r.data); setLoading(false); });
  }, [days]);

  if (loading) return <Loader />;

  const cards = [
    { label: "Total Visits", value: data.totals.total, icon: "bi-people", color: "primary" },
    { label: "Unique Visitors", value: data.totals.unique, icon: "bi-person-badge", color: "success" },
    { label: "Returning", value: data.totals.returning, icon: "bi-arrow-repeat", color: "info" },
  ];

  const lineData = {
    labels: data.byDay.map((d) => d._id),
    datasets: [{ label: "Visits", data: data.byDay.map((d) => d.count), borderColor: "#0d6efd", backgroundColor: "rgba(13,110,253,.15)", fill: true, tension: .35 }],
  };
  const pie = (arr) => ({
    labels: arr.map((a) => a._id || "unknown"),
    datasets: [{ data: arr.map((a) => a.count), backgroundColor: PALETTE }],
  });
  const sourceBar = {
    labels: data.bySource.map((s) => s._id),
    datasets: [{ label: "Visits", data: data.bySource.map((s) => s.count), backgroundColor: "#6610f2" }],
  };

  const hasData = data.totals.total > 0;

  return (
    <>
      <PageHeader icon="bi-graph-up" title="Analytics" subtitle="Traffic, devices & sources">
        <select className="form-select" style={{ maxWidth: 160 }} value={days} onChange={(e) => setDays(+e.target.value)}>
          <option value={7}>Last 7 days</option><option value={30}>Last 30 days</option><option value={90}>Last 90 days</option>
        </select>
      </PageHeader>

      {!hasData && (
        <div className="alert alert-info"><i className="bi bi-info-circle me-2" />No visit data yet. Visits get recorded via <code>POST /api/analytics/record</code> from your published sites. Charts will populate once data arrives.</div>
      )}

      <div className="row g-3 mb-3">
        {cards.map((c) => (
          <div className="col-md-4" key={c.label}>
            <div className="card stat-card shadow-sm">
              <div className="card-body d-flex align-items-center">
                <div className={`rounded-circle bg-${c.color} bg-opacity-10 text-${c.color} p-3 me-3`}><i className={`bi ${c.icon} fs-4`} /></div>
                <div><div className="fs-3 fw-bold">{c.value}</div><div className="text-muted small">{c.label}</div></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-3">
        <div className="col-lg-8">
          <div className="card stat-card shadow-sm h-100">
            <div className="card-header bg-white small fw-semibold"><i className="bi bi-activity me-1" />Traffic Over Time</div>
            <div className="card-body"><div style={{ height: 280 }}><Line data={lineData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} /></div></div>
          </div>
        </div>
        <div className="col-lg-4">
          <div className="card stat-card shadow-sm h-100">
            <div className="card-header bg-white small fw-semibold"><i className="bi bi-phone me-1" />Device Usage</div>
            <div className="card-body d-flex align-items-center justify-content-center"><div style={{ height: 260, width: "100%" }}><Doughnut data={pie(data.byDevice)} options={{ maintainAspectRatio: false }} /></div></div>
          </div>
        </div>
        <div className="col-lg-6">
          <div className="card stat-card shadow-sm">
            <div className="card-header bg-white small fw-semibold"><i className="bi bi-browser-chrome me-1" />Browsers</div>
            <div className="card-body d-flex align-items-center justify-content-center"><div style={{ height: 240, width: "100%" }}><Doughnut data={pie(data.byBrowser)} options={{ maintainAspectRatio: false }} /></div></div>
          </div>
        </div>
        <div className="col-lg-6">
          <div className="card stat-card shadow-sm">
            <div className="card-header bg-white small fw-semibold"><i className="bi bi-signpost-split me-1" />Traffic Sources</div>
            <div className="card-body"><div style={{ height: 240 }}><Bar data={sourceBar} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} /></div></div>
          </div>
        </div>
      </div>
    </>
  );
}
