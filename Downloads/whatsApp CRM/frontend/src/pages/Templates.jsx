import { useState } from "react";
import { templatesApi } from "../api";
import { useApi } from "../hooks/useApi";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { PageHeader, ErrorBox, DataTable, Modal, Tabs } from "../components/ui";

const TONE = {
  Approved: { background: "var(--ok-bg)", color: "var(--ok)" },
  Pending: { background: "var(--warn-bg)", color: "var(--warn)" },
  Rejected: { background: "var(--err-bg)", color: "var(--err)" },
  Draft: { background: "var(--pill-bg)", color: "var(--pill-ink)" },
};

export default function Templates() {
  const { can } = useAuth();
  const list = useApi(() => templatesApi.list({ perPage: 100 }), []);
  const [creating, setCreating] = useState(false);
  const [channel, setChannel] = useState("all");

  const rows = (list.data || []).filter((t) => channel === "all" || (t.channel || "whatsapp") === channel);

  const columns = [
    { key: "name", label: "Name", render: (t) => <span className="row-name font-monospace">{t.name}</span> },
    { key: "channel", label: "Channel", render: (t) => (
      <span className="pill" style={{ background: "var(--accent-soft)", color: "var(--accent-ink)" }}>
        <i className={`bi bi-${(t.channel || "whatsapp") === "email" ? "envelope" : "whatsapp"} me-1`}></i>{t.channel || "whatsapp"}
      </span>
    ) },
    { key: "category", label: "Category", render: (t) => <span className="pill">{t.category}</span> },
    { key: "status", label: "Status", render: (t) => <span className="pill" style={TONE[t.status]}>{t.status}</span> },
    { key: "body", label: "Content", render: (t) => <span className="small text-muted text-truncate d-inline-block" style={{ maxWidth: 320 }}>{t.subject ? `[${t.subject}] ` : ""}{(t.body || "").replace(/<[^>]+>/g, " ")}</span> },
  ];

  return (
    <div>
      <PageHeader title="Templates" subtitle="WhatsApp & Email message templates"
        actions={can("blast", "create") && <button className="btn btn-wa btn-sm" onClick={() => setCreating(true)}><i className="bi bi-plus-lg me-1"></i>New Template</button>} />
      <div className="mb-3"><Tabs tabs={[{ value: "all", label: "All" }, { value: "whatsapp", label: "WhatsApp" }, { value: "email", label: "Email" }]} value={channel} onChange={setChannel} /></div>
      <ErrorBox error={list.error} />
      <DataTable columns={columns} rows={rows} loading={list.loading} empty={{ icon: "file-text", text: "No templates." }} />
      {creating && <CreateTemplate onClose={() => setCreating(false)} onSaved={() => { setCreating(false); list.reload(); }} />}
    </div>
  );
}

function CreateTemplate({ onClose, onSaved }) {
  const toast = useToast();
  const [form, setForm] = useState({ name: "", channel: "whatsapp", subject: "", language: "en", category: "Utility", body: "", status: "Draft" });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  async function save() { try { await templatesApi.create(form); toast("Template created"); onSaved(); } catch (e) { toast(e.message, "error"); } }
  const isEmail = form.channel === "email";
  return (
    <Modal title="New Template" onClose={onClose}
      footer={<><button className="btn btn-outline-secondary" onClick={onClose}>Cancel</button><button className="btn btn-wa" disabled={!form.name} onClick={save}>Create</button></>}>
      <div className="row g-3">
        <div className="col-6"><label className="form-label">Name</label><input className="form-control" value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="fee_reminder_v1" /></div>
        <div className="col-6"><label className="form-label">Channel</label>
          <select className="form-select" value={form.channel} onChange={(e) => set("channel", e.target.value)}><option value="whatsapp">WhatsApp</option><option value="email">Email</option></select>
        </div>
        {isEmail && <div className="col-12"><label className="form-label">Email subject</label><input className="form-control" value={form.subject} onChange={(e) => set("subject", e.target.value)} /></div>}
        <div className="col-4"><label className="form-label">Lang</label><input className="form-control" value={form.language} onChange={(e) => set("language", e.target.value)} /></div>
        <div className="col-8"><label className="form-label">Category</label><select className="form-select" value={form.category} onChange={(e) => set("category", e.target.value)}><option>Utility</option><option>Marketing</option><option>Authentication</option></select></div>
        <div className="col-12"><label className="form-label">{isEmail ? "Body (HTML allowed)" : "Body"}</label><textarea className="form-control" rows={isEmail ? 5 : 3} value={form.body} onChange={(e) => set("body", e.target.value)} placeholder="Hi {{1}}, ..."></textarea></div>
      </div>
      <div className="text-muted small mt-2">Use {"{{1}}"}, {"{{2}}"} for variables. WhatsApp templates need Meta approval before live use; Email templates can be used immediately.</div>
    </Modal>
  );
}
