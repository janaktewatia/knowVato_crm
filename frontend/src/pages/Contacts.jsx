import { useState } from "react";
import { contactsApi } from "../api";
import { useApi } from "../hooks/useApi";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { PageHeader, ErrorBox, Avatar, FilterBar, Field, DataTable, Modal, IconBtn } from "../components/ui";

export default function Contacts() {
  const toast = useToast();
  const { can } = useAuth();
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState(null);
  const list = useApi(() => contactsApi.list({ q, perPage: 100 }), [q]);

  async function remove(id) {
    if (!confirm("Delete this contact?")) return;
    try { await contactsApi.remove(id); toast("Deleted"); list.reload(); } catch (e) { toast(e.message, "error"); }
  }

  const columns = [
    { key: "name", label: "Contact", render: (c) => (
      <div className="d-flex align-items-center gap-2"><Avatar name={c.name} size={30} /><div><div className="row-name">{c.name}</div><div className="row-sub">{c.phone}</div></div></div>
    ) },
    { key: "category", label: "Category", render: (c) => <span className="pill">{c.category}</span> },
    { key: "tags", label: "Tags", render: (c) => (c.tags || []).slice(0, 2).map((t) => <span key={t} className="pill me-1">{t}</span>) },
    { key: "stage", label: "Stage", render: (c) => <span className="small">{c.lifecycleStage}</span> },
    { key: "value", label: "Value", align: "right", render: (c) => "₹" + (c.value || 0).toLocaleString() },
    { key: "optIn", label: "Opt-in", render: (c) => c.optIn ? <span className="pill" style={{ background: "var(--ok-bg)", color: "var(--ok)" }}>Opted in</span> : <span className="pill" style={{ background: "var(--err-bg)", color: "var(--err)" }}>Out</span> },
    { key: "act", label: "", align: "right", render: (c) => (
      <>{can("contacts", "edit") && <IconBtn icon="pencil" title="Edit" onClick={() => setEditing(c)} />}{can("contacts", "del") && <IconBtn icon="trash" title="Delete" danger onClick={() => remove(c._id)} />}</>
    ) },
  ];

  return (
    <div>
      <PageHeader title="Contacts" subtitle="People in your CRM"
        actions={can("contacts", "create") && <button className="btn btn-wa btn-sm" onClick={() => setEditing({})}><i className="bi bi-plus-lg me-1"></i>Add Contact</button>} />
      <FilterBar>
        <Field label="Search" style={{ minWidth: 260 }}>
          <div className="input-group input-group-sm"><span className="input-group-text"><i className="bi bi-search"></i></span>
            <input className="form-control" placeholder="Search contacts…" value={q} onChange={(e) => setQ(e.target.value)} /></div>
        </Field>
      </FilterBar>
      <ErrorBox error={list.error} />
      <DataTable columns={columns} rows={list.data} loading={list.loading} empty={{ icon: "people", text: "No contacts." }} />
      {editing && <ContactModal contact={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); list.reload(); }} />}
    </div>
  );
}

function ContactModal({ contact, onClose, onSaved }) {
  const toast = useToast();
  const isNew = !contact._id;
  const [form, setForm] = useState({
    name: contact.name || "", phone: contact.phone || "+91 ", email: contact.email || "",
    category: contact.category || "Admission", lifecycleStage: contact.lifecycleStage || "Lead",
    value: contact.value || 0, optIn: contact.optIn !== false, tags: (contact.tags || []).join(", "),
  });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  async function save() {
    const payload = { ...form, value: Number(form.value) || 0, tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean) };
    try { if (isNew) await contactsApi.create(payload); else await contactsApi.update(contact._id, payload); toast("Saved"); onSaved(); }
    catch (e) { toast(e.message, "error"); }
  }
  return (
    <Modal title={isNew ? "Add Contact" : "Edit Contact"} onClose={onClose}
      footer={<><button className="btn btn-outline-secondary" onClick={onClose}>Cancel</button><button className="btn btn-wa" disabled={!form.name || form.phone.length < 5} onClick={save}>Save</button></>}>
      <div className="row g-3">
        <div className="col-6"><label className="form-label">Name</label><input className="form-control" value={form.name} onChange={(e) => set("name", e.target.value)} /></div>
        <div className="col-6"><label className="form-label">Phone</label><input className="form-control" value={form.phone} onChange={(e) => set("phone", e.target.value)} /></div>
        <div className="col-6"><label className="form-label">Email</label><input className="form-control" value={form.email} onChange={(e) => set("email", e.target.value)} /></div>
        <div className="col-6"><label className="form-label">Category</label><input className="form-control" value={form.category} onChange={(e) => set("category", e.target.value)} /></div>
        <div className="col-6"><label className="form-label">Stage</label><select className="form-select" value={form.lifecycleStage} onChange={(e) => set("lifecycleStage", e.target.value)}><option>Lead</option><option>Prospect</option><option>Customer</option></select></div>
        <div className="col-6"><label className="form-label">Value (₹)</label><input type="number" className="form-control" value={form.value} onChange={(e) => set("value", e.target.value)} /></div>
        <div className="col-12"><label className="form-label">Tags (comma-separated)</label><input className="form-control" value={form.tags} onChange={(e) => set("tags", e.target.value)} /></div>
        <div className="col-12 form-check ms-2"><input className="form-check-input" type="checkbox" checked={form.optIn} onChange={(e) => set("optIn", e.target.checked)} id="optin" /><label className="form-check-label small" htmlFor="optin">Marketing opt-in</label></div>
      </div>
    </Modal>
  );
}
