import { conversionApi, followUpsApi, leadsApi } from "../api";
import { useApi } from "../hooks/useApi";
import { PageHeader, Spinner, ErrorBox } from "../components/ui";

function Kpi({ label, value, sub, icon, tone = "wa" }) {
  return (
    <div className="col">
      <div className="card kpi-card h-100">
        <div className="card-body">
          <div className="d-flex justify-content-between">
            <div className="kpi-label">{label}</div>
            <i className={`bi bi-${icon} text-${tone === "wa" ? "success" : tone}`}></i>
          </div>
          <div className="kpi-value">{value}</div>
          {sub && <div className="text-secondary small">{sub}</div>}
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const stats = useApi(() => conversionApi.stats(), []);
  const buckets = useApi(() => followUpsApi.buckets(), []);

  if (stats.loading || buckets.loading) return <Spinner />;

  const t = stats.data?.totals || {};
  const c = buckets.data?.counts || {};

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Live overview from your CRM database" />
      <ErrorBox error={stats.error || buckets.error} />

      <div className="row row-cols-2 row-cols-md-5 g-3 mb-4">
        <Kpi label="Total leads" value={t.leads ?? 0} sub={`${t.open ?? 0} open`} icon="flag" />
        <Kpi label="Admitted" value={t.won ?? 0} sub="won" icon="check-circle" tone="success" />
        <Kpi label="Conversion" value={(t.convRate ?? 0) + "%"} sub="won / total" icon="graph-up" />
        <Kpi label="Follow-ups today" value={c.today ?? 0} sub={c.overdue ? `${c.overdue} overdue` : "on track"} icon="bell" tone={c.overdue ? "danger" : "wa"} />
        <Kpi label="Lost" value={t.lost ?? 0} sub="closed-lost" icon="x-circle" tone="danger" />
      </div>

      <div className="row g-3">
        <div className="col-lg-7">
          <div className="card h-100">
            <div className="card-header bg-white fw-semibold">Conversion funnel</div>
            <div className="card-body">
              {(stats.data?.funnel || []).map((f) => {
                const max = Math.max(1, ...(stats.data?.funnel || []).map((x) => x.count));
                const pct = Math.round((f.count / max) * 100);
                return (
                  <div key={f.status} className="mb-2">
                    <div className="d-flex justify-content-between small mb-1">
                      <span><span className="d-inline-block rounded me-1" style={{ width: 8, height: 8, background: f.color }} />{f.status}</span>
                      <strong>{f.count}</strong>
                    </div>
                    <div className="progress" style={{ height: 18 }}>
                      <div className="progress-bar" style={{ width: pct + "%", background: f.color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div className="col-lg-5">
          <div className="card h-100">
            <div className="card-header bg-white fw-semibold">By source</div>
            <div className="card-body p-0">
              <table className="table table-sm mb-0">
                <thead><tr><th>Source</th><th className="text-end">Leads</th><th className="text-end">Won</th><th className="text-end">Rate</th></tr></thead>
                <tbody>
                  {(stats.data?.bySource || []).map((r) => (
                    <tr key={r.source}>
                      <td><span className="d-inline-block rounded me-1" style={{ width: 8, height: 8, background: r.color }} />{r.source}</td>
                      <td className="text-end">{r.total}</td>
                      <td className="text-end">{r.won}</td>
                      <td className="text-end">{r.rate}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
