

import { useState } from "react";
import { templatesApi } from "../api";
import { useApi } from "../hooks/useApi";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { PageHeader, ErrorBox, DataTable, Modal, Tabs } from "../components/ui";
import WhatsAppTemplateBuilder from "../components/WhatsAppTemplateBuilder";

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
  const [creatingMeta, setCreatingMeta] = useState(false);
  const [channel, setChannel] = useState("all");
  const [syncing, setSyncing] = useState(false);
  const toast = useToast();

  const rows = (list.data || []).filter((t) => channel === "all" || (t.channel || "whatsapp") === channel);

  async function handleSyncMeta() {
    setSyncing(true);
    try {
      const res = await templatesApi.syncMeta();
      toast(`Synced ${res.count} templates from Meta Graph API ✓`);
      list.reload();
    } catch (e) {
      toast(e.message, "error");
    } finally {
      setSyncing(false);
    }
  }

  async function handleDeleteMeta(templateName) {
    if (!confirm(`Delete template '${templateName}' from Meta Graph API?`)) return;
    try {
      await templatesApi.deleteMeta(templateName);
      toast("Template deleted from Meta Graph API");
      list.reload();
    } catch (e) {
      toast(e.message, "error");
    }
  }

  const columns = [
    { key: "name", label: "Name", render: (t) => <span className="row-name font-monospace">{t.name}</span> },
    { key: "channel", label: "Channel", render: (t) => (
      <span className="pill" style={{ background: "var(--accent-soft)", color: "var(--accent-ink)" }}>
        <i className={`bi bi-${(t.channel || "whatsapp") === "email" ? "envelope" : "whatsapp"} me-1`}></i>{t.channel || "whatsapp"}
      </span>
    ) },
    { key: "category", label: "Category", render: (t) => <span className="pill">{t.category}</span> },
    { key: "status", label: "Meta Status", render: (t) => <span className="pill" style={TONE[t.status] || TONE.Draft}>{t.status}</span> },
    { key: "body", label: "Content", render: (t) => <span className="small text-muted text-truncate d-inline-block" style={{ maxWidth: 320 }}>{t.subject ? `[${t.subject}] ` : ""}{(t.body || "").replace(/<[^>]+>/g, " ")}</span> },
    { key: "actions", label: "Actions", render: (t) => (
      <div className="d-flex gap-1">
        {t.channel === "whatsapp" && (
          <button className="btn btn-sm btn-outline-danger" title="Delete from Meta" onClick={() => handleDeleteMeta(t.name)}>
            <i className="bi bi-trash"></i>
          </button>
        )}
      </div>
    ) },
  ];

  return (
    <div>
      <PageHeader
        title="Meta WhatsApp & Email Templates"
        subtitle="Manage and submit message templates directly to Meta Graph API"
        actions={
          <div className="d-flex gap-2">
            <button className="btn btn-outline-secondary btn-sm" disabled={syncing} onClick={handleSyncMeta}>
              {syncing ? <span className="spinner-border spinner-border-sm me-1" /> : <i className="bi bi-arrow-repeat me-1"></i>}
              Sync from Meta
            </button>
            {can("blast", "create") && (
              <button className="btn btn-wa btn-sm" onClick={() => setCreatingMeta(true)}>
                <i className="bi bi-meta me-1"></i>New Meta Template
              </button>
            )}
          </div>
        }
      />
      {creatingMeta ? (
        <div className="mt-4">
          <WhatsAppTemplateBuilder
            onCancel={() => setCreatingMeta(false)}
            onSaved={() => {
              setCreatingMeta(false);
              list.reload();
            }}
          />
        </div>
      ) : (
        <>
          <div className="mb-3">
            <Tabs tabs={[{ value: "all", label: "All" }, { value: "whatsapp", label: "WhatsApp" }, { value: "email", label: "Email" }]} value={channel} onChange={setChannel} />
          </div>
          <ErrorBox error={list.error} />
          <DataTable columns={columns} rows={rows} loading={list.loading} empty={{ icon: "file-text", text: "No templates found." }} />
        </>
      )}
    </div>
  );
}

function CreateMetaTemplateModal({ onClose, onSaved }) {
  const toast = useToast();
  const [form, setForm] = useState({
    name: "",
    category: "UTILITY",
    language: "en",
    headerType: "NONE",
    headerText: "",
    headerMediaUrl: "",
    body: "",
    footer: "",
    buttons: [],
  });
  const [submitting, setSubmitting] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  function addButton(type) {
    if (form.buttons.length >= 3 && type === "QUICK_REPLY") {
      toast("Max 3 quick reply buttons allowed", "error");
      return;
    }
    const newBtn =
      type === "QUICK_REPLY"
        ? { type: "QUICK_REPLY", text: "Reply Option" }
        : type === "URL"
        ? { type: "URL", text: "Visit Website", url: "https://greenwood.edu" }
        : type === "PHONE_NUMBER"
        ? { type: "PHONE_NUMBER", text: "Call Us", phoneNumber: "+919999900001" }
        : { type: "COPY_CODE", text: "Copy Code", code: "PROMO50" };

    setForm((f) => ({ ...f, buttons: [...f.buttons, newBtn] }));
  }

  function removeButton(index) {
    setForm((f) => ({ ...f, buttons: f.buttons.filter((_, i) => i !== index) }));
  }

  async function handleSubmitMeta() {
    if (!form.name || !form.body) {
      toast("Template name and body content are required", "error");
      return;
    }
    setSubmitting(true);
    try {
      await templatesApi.createMeta(form);
      toast("Meta Template submitted successfully to Graph API ✓");
      onSaved();
    } catch (e) {
      toast(e.message, "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      title="Create Meta WhatsApp Template"
      onClose={onClose}
      footer={
        <>
          <button className="btn btn-outline-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-wa" disabled={submitting || !form.name || !form.body} onClick={handleSubmitMeta}>
            {submitting && <span className="spinner-border spinner-border-sm me-1" />}
            Submit to Meta Graph API
          </button>
        </>
      }
    >
      <div className="row g-3">
        <div className="col-6">
          <label className="form-label fw-semibold">Template Name (a-z, 0-9, _)</label>
          <input
            className="form-control"
            value={form.name}
            onChange={(e) => set("name", e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "_"))}
            placeholder="fee_due_reminder_v1"
          />
        </div>
        <div className="col-3">
          <label className="form-label fw-semibold">Category</label>
          <select className="form-select" value={form.category} onChange={(e) => set("category", e.target.value)}>
            <option value="UTILITY">Utility</option>
            <option value="MARKETING">Marketing</option>
            <option value="AUTHENTICATION">Authentication</option>
          </select>
        </div>
        <div className="col-3">
          <label className="form-label fw-semibold">Language</label>
          <select className="form-select" value={form.language} onChange={(e) => set("language", e.target.value)}>
            <option value="en">English (en)</option>
            <option value="hi">Hindi (hi)</option>
            <option value="es">Spanish (es)</option>
            <option value="fr">French (fr)</option>
          </select>
        </div>

        {/* Header Section */}
        <div className="col-12 border-top pt-3">
          <label className="form-label fw-semibold">Header (Optional)</label>
          <div className="row g-2">
            <div className="col-4">
              <select className="form-select" value={form.headerType} onChange={(e) => set("headerType", e.target.value)}>
                <option value="NONE">None</option>
                <option value="TEXT">Text Header</option>
                <option value="IMAGE">Image Media</option>
                <option value="VIDEO">Video Media</option>
                <option value="DOCUMENT">Document PDF</option>
              </select>
            </div>
            {form.headerType === "TEXT" && (
              <div className="col-8">
                <input className="form-control" placeholder="Header text..." value={form.headerText} onChange={(e) => set("headerText", e.target.value)} />
              </div>
            )}
            {["IMAGE", "VIDEO", "DOCUMENT"].includes(form.headerType) && (
              <div className="col-8">
                <input className="form-control" placeholder="Sample media URL..." value={form.headerMediaUrl} onChange={(e) => set("headerMediaUrl", e.target.value)} />
              </div>
            )}
          </div>
        </div>

        {/* Body Section */}
        <div className="col-12">
          <label className="form-label fw-semibold">Body Content (Meta Required)</label>
          <textarea
            className="form-control"
            rows={4}
            value={form.body}
            onChange={(e) => set("body", e.target.value)}
            placeholder="Hi {{1}}, your fee of ₹{{2}} is due on {{3}}."
          />
          <div className="form-text small">Use {"{{1}}"}, {"{{2}}"} for dynamic variables.</div>
        </div>

        {/* Footer Section */}
        <div className="col-12">
          <label className="form-label fw-semibold">Footer Text (Optional)</label>
          <input className="form-control" value={form.footer} onChange={(e) => set("footer", e.target.value)} placeholder="e.g. Greenwood Admissions" />
        </div>

        {/* Buttons Section */}
        <div className="col-12 border-top pt-3">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <label className="form-label fw-semibold mb-0">Interactive Buttons (Optional)</label>
            <div className="btn-group btn-group-sm">
              <button className="btn btn-outline-secondary" onClick={() => addButton("QUICK_REPLY")}>+ Quick Reply</button>
              <button className="btn btn-outline-secondary" onClick={() => addButton("URL")}>+ Call to Action URL</button>
              <button className="btn btn-outline-secondary" onClick={() => addButton("PHONE_NUMBER")}>+ Phone Number</button>
            </div>
          </div>

          {form.buttons.map((btn, idx) => (
            <div key={idx} className="p-2 border rounded mb-2 d-flex gap-2 align-items-center bg-light">
              <span className="badge bg-secondary text-capitalize">{btn.type.replace("_", " ")}</span>
              <input
                className="form-control form-control-sm"
                placeholder="Button Label"
                value={btn.text}
                onChange={(e) => {
                  const updated = [...form.buttons];
                  updated[idx].text = e.target.value;
                  set("buttons", updated);
                }}
              />
              {btn.type === "URL" && (
                <input
                  className="form-control form-control-sm"
                  placeholder="URL (https://...)"
                  value={btn.url || ""}
                  onChange={(e) => {
                    const updated = [...form.buttons];
                    updated[idx].url = e.target.value;
                    set("buttons", updated);
                  }}
                />
              )}
              {btn.type === "PHONE_NUMBER" && (
                <input
                  className="form-control form-control-sm"
                  placeholder="+91..."
                  value={btn.phoneNumber || ""}
                  onChange={(e) => {
                    const updated = [...form.buttons];
                    updated[idx].phoneNumber = e.target.value;
                    set("buttons", updated);
                  }}
                />
              )}
              <button className="btn btn-sm btn-outline-danger" onClick={() => removeButton(idx)}>
                <i className="bi bi-x"></i>
              </button>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
}
