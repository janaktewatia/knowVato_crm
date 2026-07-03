import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/client";
import Loader from "../components/Loader";

const FIELD_DEFS = [
  { type: "text", icon: "bi-input-cursor-text", label: "Text" },
  { type: "textarea", icon: "bi-textarea-resize", label: "Text Area" },
  { type: "number", icon: "bi-123", label: "Number" },
  { type: "email", icon: "bi-envelope", label: "Email" },
  { type: "mobile", icon: "bi-phone", label: "Mobile" },
  { type: "dropdown", icon: "bi-menu-button-wide", label: "Dropdown" },
  { type: "checkbox", icon: "bi-check-square", label: "Checkbox" },
  { type: "radio", icon: "bi-ui-radios", label: "Radio" },
  { type: "date", icon: "bi-calendar-date", label: "Date Picker" },
  { type: "file", icon: "bi-paperclip", label: "File Upload" },
  { type: "signature", icon: "bi-pencil", label: "Signature" },
];
const HAS_OPTIONS = ["dropdown", "checkbox", "radio"];

const FORM_TEMPLATES = {
  blank: {
    title: "New Form",
    description: "",
    fields: [],
  },
  contact: {
    title: "Contact Form",
    description: "Get in touch with us. We'll be happy to hear from you.",
    fields: [
      { type: "text", label: "Name", placeholder: "Your full name", required: true, width: "full", options: [] },
      { type: "email", label: "Email", placeholder: "your@email.com", required: true, width: "full", options: [] },
      { type: "mobile", label: "Phone", placeholder: "Your phone number", required: false, width: "half", options: [] },
      { type: "textarea", label: "Message", placeholder: "Tell us more...", required: true, width: "full", options: [] },
    ],
  },
  enquiry: {
    title: "Enquiry Form",
    description: "Submit your enquiry and we'll get back to you shortly.",
    fields: [
      { type: "text", label: "Full Name", placeholder: "Your full name", required: true, width: "half", options: [] },
      { type: "email", label: "Email", placeholder: "your@email.com", required: true, width: "half", options: [] },
      { type: "mobile", label: "Phone", placeholder: "Your phone number", required: true, width: "half", options: [] },
      { type: "text", label: "Company", placeholder: "Your company", required: false, width: "half", options: [] },
      { type: "dropdown", label: "Enquiry Type", placeholder: "", required: true, width: "full", options: ["General", "Support", "Sales", "Partnership"] },
      { type: "textarea", label: "Message", placeholder: "Tell us about your enquiry...", required: true, width: "full", options: [] },
    ],
  },
  registration: {
    title: "Registration Form",
    description: "Create your account in just a few steps.",
    fields: [
      { type: "text", label: "First Name", placeholder: "First name", required: true, width: "half", options: [] },
      { type: "text", label: "Last Name", placeholder: "Last name", required: true, width: "half", options: [] },
      { type: "email", label: "Email", placeholder: "your@email.com", required: true, width: "full", options: [] },
      { type: "mobile", label: "Phone", placeholder: "Your phone number", required: false, width: "half", options: [] },
      { type: "date", label: "Date of Birth", placeholder: "", required: false, width: "half", options: [] },
      { type: "text", label: "Password", placeholder: "Create a password", required: true, width: "half", options: [] },
      { type: "text", label: "Confirm Password", placeholder: "Confirm your password", required: true, width: "half", options: [] },
      { type: "checkbox", label: "I agree to terms and conditions", placeholder: "", required: true, width: "full", options: ["I accept"] },
    ],
  },
  newsletter: {
    title: "Newsletter Signup",
    description: "Subscribe to our newsletter for the latest updates.",
    fields: [
      { type: "email", label: "Email", placeholder: "your@email.com", required: true, width: "full", options: [] },
      { type: "text", label: "First Name", placeholder: "First name (optional)", required: false, width: "full", options: [] },
      { type: "checkbox", label: "Subscribe", placeholder: "", required: false, width: "full", options: ["Send me updates"] },
    ],
  },
  survey: {
    title: "Customer Survey",
    description: "Help us improve by sharing your feedback.",
    fields: [
      { type: "text", label: "Name", placeholder: "Your name", required: false, width: "full", options: [] },
      { type: "email", label: "Email", placeholder: "your@email.com", required: false, width: "full", options: [] },
      { type: "radio", label: "How satisfied are you?", placeholder: "", required: true, width: "full", options: ["Very Satisfied", "Satisfied", "Neutral", "Dissatisfied"] },
      { type: "textarea", label: "Feedback", placeholder: "Tell us what you think...", required: true, width: "full", options: [] },
      { type: "checkbox", label: "Follow up", placeholder: "", required: false, width: "full", options: ["Yes, contact me"] },
    ],
  },
  jobApplication: {
    title: "Job Application",
    description: "Apply for a position in our company.",
    fields: [
      { type: "text", label: "Full Name", placeholder: "Your full name", required: true, width: "full", options: [] },
      { type: "email", label: "Email", placeholder: "your@email.com", required: true, width: "half", options: [] },
      { type: "mobile", label: "Phone", placeholder: "Your phone number", required: true, width: "half", options: [] },
      { type: "dropdown", label: "Position Applied For", placeholder: "", required: true, width: "full", options: ["Developer", "Designer", "Manager", "Sales", "Other"] },
      { type: "text", label: "Experience (Years)", placeholder: "Number of years", required: false, width: "half", options: [] },
      { type: "file", label: "Upload Resume", placeholder: "", required: true, width: "full", options: [] },
      { type: "textarea", label: "Cover Letter", placeholder: "Tell us why you'd be a great fit...", required: false, width: "full", options: [] },
    ],
  },
};

let uid = 0;
const key = () => `f${Date.now()}_${uid++}`;
const nameFromLabel = (l) => l.toLowerCase().trim().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "") || `field_${uid}`;

// Live preview of a single field
function FieldPreview({ f }) {
  const common = { className: "form-control", placeholder: f.placeholder, disabled: true };
  switch (f.type) {
    case "textarea": return <textarea {...common} rows="3" />;
    case "number": return <input type="number" {...common} />;
    case "email": return <input type="email" {...common} />;
    case "mobile": return <input type="tel" {...common} />;
    case "date": return <input type="date" {...common} />;
    case "file": return <input type="file" {...common} />;
    case "signature": return <div className="border rounded bg-light text-muted text-center py-4"><i className="bi bi-pencil me-1" />Signature pad</div>;
    case "dropdown": return <select className="form-select" disabled><option>Select...</option>{f.options.map((o, i) => <option key={i}>{o}</option>)}</select>;
    case "checkbox": return f.options.map((o, i) => <div className="form-check" key={i}><input className="form-check-input" type="checkbox" disabled /><label className="form-check-label">{o}</label></div>);
    case "radio": return f.options.map((o, i) => <div className="form-check" key={i}><input className="form-check-input" type="radio" disabled /><label className="form-check-label">{o}</label></div>);
    default: return <input type="text" {...common} />;
  }
}

export default function FormBuilder() {
  const { id } = useParams();
  const nav = useNavigate();
  const [form, setForm] = useState(null);
  const [fields, setFields] = useState([]);
  const [selected, setSelected] = useState(null);
  const [saved, setSaved] = useState(false);
  const [tab, setTab] = useState("build"); // build | settings
  const [showTemplates, setShowTemplates] = useState(false);

  useEffect(() => {
    api.get(`/forms/${id}`).then((r) => {
      setForm(r.data);
      setFields((r.data.fields || []).map((f) => ({ ...f, _key: key() })));
    });
  }, [id]);

  const addField = (def) => {
    const label = def.label;
    const f = {
      _key: key(), type: def.type, label, name: nameFromLabel(label) + "_" + uid,
      placeholder: "", required: false, width: "full",
      options: HAS_OPTIONS.includes(def.type) ? ["Option 1", "Option 2"] : [],
    };
    setFields((s) => [...s, f]);
    setSelected(f._key);
  };

  const update = (k, patch) => setFields((s) => s.map((f) => f._key === k ? { ...f, ...patch } : f));
  const move = (k, dir) => setFields((s) => {
    const i = s.findIndex((x) => x._key === k), j = i + dir;
    if (j < 0 || j >= s.length) return s;
    const c = [...s]; [c[i], c[j]] = [c[j], c[i]]; return c;
  });
  const removeField = (k) => { setFields((s) => s.filter((f) => f._key !== k)); if (selected === k) setSelected(null); };

  const applyTemplate = (templateKey) => {
    if (fields.length && !window.confirm("Replace current fields with this template?")) return;
    const tpl = FORM_TEMPLATES[templateKey];
    setForm({ ...form, title: tpl.title, description: tpl.description });
    setFields((tpl.fields || []).map((f) => ({ ...f, _key: key(), name: nameFromLabel(f.label) + "_" + uid })));
    setShowTemplates(false);
    setSelected(null);
  };

  const save = async () => {
    const payload = { ...form, fields: fields.map(({ _key, ...rest }) => rest) };
    const r = await api.put(`/forms/${id}`, payload);
    setForm(r.data);
    setSaved(true); setTimeout(() => setSaved(false), 1500);
  };

  if (!form) return <Loader />;
  const sel = fields.find((f) => f._key === selected);

  return (
    <div className="d-flex flex-column" style={{ height: "calc(100vh - 3rem)" }}>
      {/* Toolbar */}
      <div className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-3 flex-wrap gap-2">
        <div className="d-flex align-items-center">
          <button className="btn btn-link px-0" onClick={() => nav("/forms")}><i className="bi bi-arrow-left me-1" />Back</button>
          <input className="form-control form-control-sm ms-3" style={{ maxWidth: 280 }} value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </div>
        <div className="d-flex align-items-center gap-2">
          <div className="btn-group btn-group-sm">
            <button className={`btn btn-outline-secondary ${tab === "build" ? "active" : ""}`} onClick={() => setTab("build")}><i className="bi bi-ui-checks me-1" />Build</button>
            <button className={`btn btn-outline-secondary ${tab === "settings" ? "active" : ""}`} onClick={() => setTab("settings")}><i className="bi bi-gear me-1" />Settings</button>
          </div>
          <div className="btn-group btn-group-sm">
            <button className="btn btn-outline-secondary" onClick={() => setShowTemplates(true)}><i className="bi bi-lightning me-1" />Templates</button>
          </div>
          {saved && <span className="text-success small"><i className="bi bi-check-circle" /> Saved</span>}
          <button className="btn btn-sm btn-primary" onClick={save}><i className="bi bi-save me-1" />Save</button>
          <button className="btn btn-sm btn-outline-info" onClick={() => nav(`/forms/${id}/responses`)}><i className="bi bi-inbox me-1" />Responses</button>
        </div>
      </div>

      {tab === "settings" ? (
        <div className="card stat-card shadow-sm" style={{ maxWidth: 640 }}>
          <div className="card-body">
            <h6 className="mb-3"><i className="bi bi-gear me-2" />Form Settings</h6>
            <div className="mb-3"><label className="form-label small">Description</label>
              <textarea className="form-control" rows="2" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div className="row g-3">
              <div className="col-md-6"><label className="form-label small">Submit button text</label>
                <input className="form-control" value={form.settings.submitText} onChange={(e) => setForm({ ...form, settings: { ...form.settings, submitText: e.target.value } })} /></div>
              <div className="col-md-6"><label className="form-label small">Notify email on submit</label>
                <input type="email" className="form-control" value={form.settings.notifyEmail} onChange={(e) => setForm({ ...form, settings: { ...form.settings, notifyEmail: e.target.value } })} /></div>
              <div className="col-12"><label className="form-label small">Success message</label>
                <input className="form-control" value={form.settings.successMessage} onChange={(e) => setForm({ ...form, settings: { ...form.settings, successMessage: e.target.value } })} /></div>
              <div className="col-12"><label className="form-label small">Redirect URL after submit (optional)</label>
                <input className="form-control" value={form.settings.redirectUrl} onChange={(e) => setForm({ ...form, settings: { ...form.settings, redirectUrl: e.target.value } })} /></div>
              <div className="col-md-6"><label className="form-label small">Status</label>
                <select className="form-select text-capitalize" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  {["draft", "active", "inactive"].map((s) => <option key={s} value={s}>{s}</option>)}
                </select></div>
            </div>
          </div>
        </div>
      ) : (
        <div className="row flex-grow-1 g-3 overflow-hidden">
          {/* Left: field types */}
          <div className="col-3">
            <div className="card stat-card shadow-sm h-100">
              <div className="card-header bg-white small fw-semibold"><i className="bi bi-plus-square me-1" />Add Field</div>
              <div className="card-body d-grid gap-2 overflow-auto">
                {FIELD_DEFS.map((d) => (
                  <button key={d.type} className="btn btn-light text-start btn-sm" onClick={() => addField(d)}>
                    <i className={`bi ${d.icon} me-2`} />{d.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Center: field list */}
          <div className="col-5">
            <div className="card stat-card shadow-sm h-100">
              <div className="card-header bg-white small fw-semibold"><i className="bi bi-list-ol me-1" />Fields ({fields.length})</div>
              <div className="card-body overflow-auto">
                {fields.length === 0 && <p className="text-muted text-center py-4"><i className="bi bi-arrow-left me-1" />Add fields from the left</p>}
                {fields.map((f) => (
                  <div key={f._key} className={`border rounded p-2 mb-2 ${selected === f._key ? "border-primary bg-light" : ""}`} role="button" onClick={() => setSelected(f._key)}>
                    <div className="d-flex justify-content-between align-items-center">
                      <div className="text-truncate">
                        <i className={`bi ${FIELD_DEFS.find((d) => d.type === f.type)?.icon} me-2`} />
                        <strong>{f.label}</strong>
                        {f.required && <span className="text-danger ms-1">*</span>}
                        <span className="badge bg-light text-muted ms-2">{f.type}</span>
                      </div>
                      <div className="btn-group btn-group-sm">
                        <button className="btn btn-sm btn-light" onClick={(e) => { e.stopPropagation(); move(f._key, -1); }}><i className="bi bi-arrow-up" /></button>
                        <button className="btn btn-sm btn-light" onClick={(e) => { e.stopPropagation(); move(f._key, 1); }}><i className="bi bi-arrow-down" /></button>
                        <button className="btn btn-sm btn-light text-danger" onClick={(e) => { e.stopPropagation(); removeField(f._key); }}><i className="bi bi-trash" /></button>
                      </div>
                    </div>
                    {selected === f._key && (
                      <div className="mt-2 border-top pt-2" onClick={(e) => e.stopPropagation()}>
                        <div className="row g-2">
                          <div className="col-12"><label className="form-label small mb-0">Label</label>
                            <input className="form-control form-control-sm" value={f.label} onChange={(e) => update(f._key, { label: e.target.value })} /></div>
                          <div className="col-7"><label className="form-label small mb-0">Field name (key)</label>
                            <input className="form-control form-control-sm" value={f.name} onChange={(e) => update(f._key, { name: e.target.value })} /></div>
                          <div className="col-5"><label className="form-label small mb-0">Width</label>
                            <select className="form-select form-select-sm" value={f.width} onChange={(e) => update(f._key, { width: e.target.value })}>
                              <option value="full">Full</option><option value="half">Half</option>
                            </select></div>
                          <div className="col-12"><label className="form-label small mb-0">Placeholder</label>
                            <input className="form-control form-control-sm" value={f.placeholder} onChange={(e) => update(f._key, { placeholder: e.target.value })} /></div>
                          {HAS_OPTIONS.includes(f.type) && (
                            <div className="col-12"><label className="form-label small mb-0">Options (one per line)</label>
                              <textarea className="form-control form-control-sm" rows="3" value={f.options.join("\n")}
                                onChange={(e) => update(f._key, { options: e.target.value.split("\n").map((o) => o.trim()).filter(Boolean) })} /></div>
                          )}
                          <div className="col-12">
                            <div className="form-check">
                              <input className="form-check-input" type="checkbox" checked={f.required} onChange={(e) => update(f._key, { required: e.target.checked })} id={`req-${f._key}`} />
                              <label className="form-check-label small" htmlFor={`req-${f._key}`}>Required field</label>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: live preview */}
          <div className="col-4">
            <div className="card stat-card shadow-sm h-100">
              <div className="card-header bg-white small fw-semibold"><i className="bi bi-eye me-1" />Live Preview</div>
              <div className="card-body overflow-auto">
                <h5>{form.title}</h5>
                {form.description && <p className="text-muted small">{form.description}</p>}
                <div className="row g-3">
                  {fields.map((f) => (
                    <div className={f.width === "half" ? "col-6" : "col-12"} key={f._key}>
                      <label className="form-label small">{f.label}{f.required && <span className="text-danger">*</span>}</label>
                      <FieldPreview f={f} />
                    </div>
                  ))}
                </div>
                {fields.length > 0 && <button className="btn btn-primary mt-3" disabled>{form.settings.submitText}</button>}
              </div>
            </div>
          </div>
        </div>
      )}

      {showTemplates && (
        <div className="modal d-block" style={{ background: "rgba(0,0,0,.5)" }} onClick={() => setShowTemplates(false)}>
          <div className="modal-dialog modal-lg modal-dialog-scrollable" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title"><i className="bi bi-lightning me-2" />Form Templates</h5>
                <button className="btn-close" onClick={() => setShowTemplates(false)} />
              </div>
              <div className="modal-body">
                <div className="row g-3">
                  {Object.entries(FORM_TEMPLATES).map(([key, tpl]) => (
                    <div className="col-md-6" key={key}>
                      <div className="card stat-card h-100">
                        <div className="card-body">
                          <h6 className="mb-2"><i className="bi bi-file-earmark-text me-2" />{tpl.title}</h6>
                          <p className="small text-muted mb-3">{tpl.description}</p>
                          <div className="mb-3">
                            <span className="badge bg-light text-muted">{tpl.fields?.length || 0} fields</span>
                          </div>
                          <button className="btn btn-sm btn-primary w-100" onClick={() => applyTemplate(key)}>
                            <i className="bi bi-check-lg me-1" />Use Template
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
