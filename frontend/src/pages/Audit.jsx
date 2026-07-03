import { auditApi } from "../api";
import { useApi } from "../hooks/useApi";
import { PageHeader, ErrorBox, DataTable } from "../components/ui";

export default function Audit() {
  const list = useApi(() => auditApi.list({ perPage: 100 }), []);
  const columns = [
    { key: "time", label: "Time", render: (a) => <span className="small font-monospace">{new Date(a.createdAt).toLocaleString()}</span> },
    { key: "user", label: "User", render: (a) => <span className="small">{a.user}</span> },
    { key: "action", label: "Action", render: (a) => <span className="pill">{a.action}</span> },
    { key: "module", label: "Module", render: (a) => <span className="small">{a.module}</span> },
    { key: "entity", label: "Entity", render: (a) => <span className="small">{a.entity}</span> },
    { key: "change", label: "Change", render: (a) => <span className="small text-muted">{a.prev !== "—" ? `${a.prev} → ${a.next}` : a.next}</span> },
  ];
  return (
    <div>
      <PageHeader title="Audit Logs" subtitle="Every change, recorded" />
      <ErrorBox error={list.error} />
      <DataTable columns={columns} rows={list.data} loading={list.loading} empty={{ icon: "shield-check", text: "No audit entries." }} />
    </div>
  );
}
