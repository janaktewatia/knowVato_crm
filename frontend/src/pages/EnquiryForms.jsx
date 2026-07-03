import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { mastersApi, sessionsApi, gradesApi, workflowConfigApi } from "../api";
import { useApi } from "../hooks/useApi";
import { useToast } from "../context/ToastContext";
import { Spinner, ErrorBox, EmptyState, Modal, IconBtn } from "../components/ui";

const ENQUIRY_FORM_DEFAULT_FIELDS = [
  { fieldName: "studentName", label: "Student Name", fieldType: "text", isRequired: true, selected: true, hidden: false, defaultValue: "", options: [] },
  { fieldName: "mobileNumber", label: "Mobile Number", fieldType: "phone", isRequired: true, selected: true, hidden: false, defaultValue: "", options: [] },
  { fieldName: "emailId", label: "Email Id", fieldType: "email", isRequired: false, selected: true, hidden: false, defaultValue: "", options: [] },
  { fieldName: "courseInterested", label: "Course Interested", fieldType: "text", isRequired: false, selected: true, hidden: false, defaultValue: "", options: [] },
  { fieldName: "enquirySource", label: "Enquiry Source", fieldType: "select", isRequired: false, selected: true, hidden: false, defaultValue: "", options: [] },
  { fieldName: "academicYear", label: "Academic Year", fieldType: "select", isRequired: false, selected: true, hidden: false, defaultValue: "", options: [] },
  { fieldName: "grade", label: "Class", fieldType: "select", isRequired: false, selected: true, hidden: false, defaultValue: "", options: [] }
];

const ENQUIRY_FIELD_TYPES = [
  { value: "text", label: "Text" },
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone" },
  { value: "number", label: "Number" },
  { value: "textarea", label: "Textarea" },
  { value: "select", label: "Dropdown" },
  { value: "date", label: "Date" },
  { value: "checkbox", label: "Checkbox" }
];

function normalizeFieldName(value) {
  return String(value || "").trim().replace(/[^a-zA-Z0-9_]/g, "_").replace(/^_+|_+$/g, "");
}

function canonicalFieldKey(value) {
  return String(value || "")
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .toLowerCase();
}

function formatDateDMY(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  const pad = (num) => String(num).padStart(2, "0");
  return `${pad(date.getDate())}-${pad(date.getMonth() + 1)}-${date.getFullYear()}`;
}

function getShareUrl(formId) {
  return `${window.location.origin}/public/enquiry-form/${formId}`;
}

function normalizeForm(form) {
  return {
    ...form,
    name: String(form.name || "").trim(),
    heading: String(form.heading || "").trim(),
    tagline: String(form.tagline || "").trim(),
    fields: (form.fields || []).map((field) => ({
      fieldName: normalizeFieldName(field.fieldName || field.label || ""),
      label: String(field.label || "").trim(),
      fieldType: field.fieldType || "text",
      isRequired: Boolean(field.isRequired),
      selected: Boolean(field.selected),
      hidden: Boolean(field.hidden),
      defaultValue: field.defaultValue || "",
      options: Array.isArray(field.options) ? field.options : []
    })),
    isActive: Boolean(form.isActive),
    updatedAt: form.updatedAt || new Date().toISOString(),
    createdAt: form.createdAt || form.updatedAt || new Date().toISOString(),
    _id: form._id || `${Date.now()}`
  };
}

function getEnquiryConfigData(raw) {
  const config = raw?.data || raw;
  return Array.isArray(config) ? config : config?.forms || config?.fields || [];
}

export default function EnquiryForms() {
  const navigate = useNavigate();
  const { formId } = useParams();
  const toast = useToast();
  const config = useApi(() => workflowConfigApi.get("enquiryForms"), []);
  const sources = useApi(() => mastersApi.sources(), []);
  const sessions = useApi(() => sessionsApi.list(), []);
  const grades = useApi(() => gradesApi.list(), []);
  const [forms, setForms] = useState([]);
  const [activeForm, setActiveForm] = useState(null);
  const [fieldEditor, setFieldEditor] = useState(null);
  const [previewForm, setPreviewForm] = useState(null);

  useEffect(() => {
    setForms(getEnquiryConfigData(config.data));
  }, [config.data]);

  useEffect(() => {
    if (!config.loading && !config.error) {
      if (formId === "new") {
        setActiveForm({
          _id: undefined,
          name: "",
          heading: "",
          tagline: "",
          isActive: true,
          fields: ENQUIRY_FORM_DEFAULT_FIELDS.map((field) => ({ ...field }))
        });
      } else if (formId) {
        const existing = forms.find((form) => String(form._id) === String(formId));
        if (existing) {
          setActiveForm({
            ...existing,
            heading: existing.heading || "",
            tagline: existing.tagline || "",
            fields: (existing.fields || []).map((field) => ({ ...field }))
          });
        } else {
          setActiveForm(null);
        }
      } else {
        setActiveForm(null);
      }
    }
  }, [formId, forms, config.loading, config.error]);

  const fieldOptions = {
    source: (sources.data || []).map((item) => item.name || item.value || item.label || item._id).filter(Boolean),
    year: (sessions.data || []).map((item) => item.name || item.year || item.label || item._id).filter(Boolean),
    grade: (grades.data || []).map((item) => item.name || item.grade || item.label || item._id).filter(Boolean)
  };

  const getDefaultOptions = (field) => {
    const normalized = String(field.fieldName || field.label || "").toLowerCase();
    if (normalized.includes("source")) return fieldOptions.source;
    if (normalized.includes("year") || normalized.includes("session") || normalized.includes("academic")) return fieldOptions.year;
    if (normalized.includes("grade") || normalized.includes("class") || normalized.includes("standard")) return fieldOptions.grade;
    if (Array.isArray(field.options) && field.options.length) return field.options;
    return null;
  };

  const saveConfig = async (nextForms) => {
    const normalized = nextForms.map((form) => normalizeForm(form));
    try {
      await workflowConfigApi.save("enquiryForms", { forms: normalized });
      setForms(normalized);
      toast("Enquiry form saved");
      config.reload();
    } catch (e) {
      toast(e.message, "error");
    }
  };

  const createNewForm = () => navigate("/setup/enquiry-forms/new");
  const editForm = (form) => navigate(`/setup/enquiry-forms/${form._id}`);
  const closeEditor = () => navigate("/setup?active=enquiry-form");
  const openPreview = (form) => setPreviewForm(form);
  const closePreview = () => setPreviewForm(null);

  const openFieldEditor = (field = null, idx = undefined) => {
    setFieldEditor({
      _idx: idx,
      fieldName: field?.fieldName || "",
      label: field?.label || "",
      fieldType: field?.fieldType || "text",
      isRequired: Boolean(field?.isRequired),
      selected: field?.selected !== false,
      hidden: Boolean(field?.hidden),
      defaultValue: field?.defaultValue || "",
      options: Array.isArray(field?.options) ? [...field.options] : [],
      optionsText: Array.isArray(field?.options) ? field.options.join(", ") : "",
      error: ""
    });
  };

  const closeFieldEditor = () => setFieldEditor(null);

  const saveFieldEditor = () => {
    if (!fieldEditor) return;
    const normalizedFieldName = normalizeFieldName(fieldEditor.fieldName || fieldEditor.label || "");
    if (!fieldEditor.label.trim()) {
      setFieldEditor({ ...fieldEditor, error: "Field label is required" });
      return;
    }

    const siblingFieldKeys = (activeForm.fields || [])
      .map((field, idx) => canonicalFieldKey(field.fieldName || field.label || ""))
      .filter((_, idx) => idx !== fieldEditor._idx);

    const fieldKey = canonicalFieldKey(fieldEditor.fieldName || fieldEditor.label || "");
    if (siblingFieldKeys.includes(fieldKey)) {
      setFieldEditor({ ...fieldEditor, error: `Field label "${fieldEditor.label}" must be unique.` });
      return;
    }

    const normalizedField = {
      ...fieldEditor,
      fieldName: normalizedFieldName,
      label: fieldEditor.label.trim(),
      fieldType: fieldEditor.fieldType || "text",
      isRequired: Boolean(fieldEditor.isRequired),
      selected: Boolean(fieldEditor.selected),
      hidden: Boolean(fieldEditor.hidden),
      defaultValue: fieldEditor.defaultValue || "",
      options:
        fieldEditor.fieldType === "select"
          ? String(fieldEditor.optionsText || "")
              .split(",")
              .map((o) => o.trim())
              .filter(Boolean)
          : []
    };

    const nextFields = [...(activeForm.fields || [])];
    if (fieldEditor._idx !== undefined && fieldEditor._idx !== null) {
      nextFields[fieldEditor._idx] = normalizedField;
    } else {
      nextFields.push(normalizedField);
    }
    setActiveForm({ ...activeForm, fields: nextFields });
    closeFieldEditor();
  };

  const deleteForm = async (formIdToDelete) => {
    if (!confirm("Delete this enquiry form?")) return;
    const next = forms.filter((form) => form._id !== formIdToDelete);
    await saveConfig(next);
  };

  const saveForm = async () => {
    if (!activeForm) return;
    if (!activeForm.name.trim()) {
      toast("Form name is required", "error");
      return;
    }

    const fieldKeys = (activeForm.fields || [])
      .map((field) => canonicalFieldKey(field.fieldName || field.label || ""))
      .filter(Boolean);

    const duplicateKey = fieldKeys.find((key, idx) => fieldKeys.indexOf(key) !== idx);
    if (duplicateKey) {
      toast(`Duplicate field found. Please use unique field labels.`, "error");
      return;
    }

    const nextForm = normalizeForm(activeForm);
    const nextForms = activeForm._id
      ? forms.map((form) => (String(form._id) === String(activeForm._id) ? nextForm : form))
      : [...forms, nextForm];

    await saveConfig(nextForms);
    navigate("/setup?active=enquiry-form");
  };

  const displayedForms = forms.filter((form) => form.name.toLowerCase().includes((form?.name || "").toLowerCase()));

  return (
    <div style={{ padding: "0 2px" }}>
      <ErrorBox error={config.error} />

      {config.loading ? (
        <Spinner />
      ) : activeForm ? (
        <div className="card" style={{ borderRadius: "16px" }}>
          <div className="card-header d-flex justify-content-between align-items-center py-2" style={{ gap: "12px" }}>
            <div>
              <h6 className="mb-1" style={{ fontSize: "0.96rem", fontWeight: 700, letterSpacing: "0.01em" }}>
                {activeForm._id ? "Edit enquiry form" : "Create enquiry form"}
              </h6>
              <div className="text-muted small" style={{ fontSize: "0.8rem" }}>A full page editor for form fields and required settings.</div>
            </div>
            <button className="btn btn-sm btn-outline-secondary" onClick={closeEditor}>Back to setup</button>
          </div>
          <div className="card-body py-3" style={{ fontSize: "0.92rem" }}>
            <div className="row gx-2 gy-1 mb-2">
              <div className="col-md-4">
                <label className="form-label small mb-1">Form Name</label>
                <input
                  className="form-control form-control-sm"
                  style={{ padding: "0.45rem 0.6rem" }}
                  value={activeForm.name}
                  onChange={(e) => setActiveForm({ ...activeForm, name: e.target.value })}
                  placeholder="e.g. Admission Enquiry"
                />
              </div>
              <div className="col-md-4">
                <label className="form-label small mb-1">Form Heading</label>
                <input
                  className="form-control form-control-sm"
                  style={{ padding: "0.45rem 0.6rem" }}
                  value={activeForm.heading || ""}
                  onChange={(e) => setActiveForm({ ...activeForm, heading: e.target.value })}
                  placeholder="e.g. Admission Enquiry"
                />
              </div>
              <div className="col-md-4">
                <label className="form-label small mb-1">Tagline</label>
                <input
                  className="form-control form-control-sm"
                  style={{ padding: "0.45rem 0.6rem" }}
                  value={activeForm.tagline || ""}
                  onChange={(e) => setActiveForm({ ...activeForm, tagline: e.target.value })}
                  placeholder="e.g. Share your details and we’ll follow up with you."
                />
              </div>
            </div>

            <div className="d-flex justify-content-between align-items-center mb-2">
              <div>
                <h6 className="mb-1" style={{ fontSize: "0.92rem", fontWeight: 600 }}>Form fields</h6>
                <div className="text-muted small" style={{ fontSize: "0.82rem" }}>Select fields to include in the form and mark required fields.</div>
              </div>
              <div className="d-flex gap-2 align-items-center">
                {activeForm._id && (
                  <button className="btn btn-sm btn-outline-secondary" type="button" onClick={() => openPreview(activeForm)}>
                    <i className="bi bi-eye me-1"></i>Preview
                  </button>
                )}
                <button className="btn btn-sm btn-wa" onClick={() => openFieldEditor()}>
                  <i className="bi bi-plus-lg me-1"></i>Add Field
                </button>
              </div>
            </div>

            {(activeForm.fields || []).length === 0 ? (
              <EmptyState title="No fields yet" subtitle="Add a field to start building this enquiry form." />
            ) : (
              <div className="table-responsive mb-2">
                <table className="table table-sm table-bordered align-middle mb-0" style={{ fontSize: "0.9rem", borderCollapse: "collapse", borderSpacing: 0, "--bs-table-cell-padding": "0.35rem", marginBottom: 0 }}>
                  <thead>
                    <tr>
                      <th style={{ width: 50 }}></th>
                      <th>Field label</th>
                      <th>Type</th>
                      <th>Default value</th>
                      <th style={{ width: 80 }}>Hidden</th>
                      <th style={{ width: 120 }}>Mandatory</th>
                      <th style={{ width: 80 }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeForm.fields.map((field, idx) => {
                      const defaultOptions = getDefaultOptions(field);
                      return (
                        <tr key={idx} style={{ lineHeight: 1.1 }}>
                          <td className="text-center" style={{ paddingTop: 2, paddingBottom: 2 }}>
                            <input
                              type="checkbox"
                              className="form-check-input"
                              checked={Boolean(field.selected)}
                              onChange={(e) => {
                                const next = [...activeForm.fields];
                                next[idx] = { ...field, selected: e.target.checked };
                                setActiveForm({ ...activeForm, fields: next });
                              }}
                            />
                          </td>
                          <td style={{ paddingTop: 2, paddingBottom: 2 }}>
                            <input
                              className="form-control form-control-sm"
                              style={{ padding: "0.45rem 0.6rem", minHeight: "2.1rem" }}
                              value={field.label}
                              onChange={(e) => {
                                const next = [...activeForm.fields];
                                next[idx] = {
                                  ...field,
                                  label: e.target.value,
                                  fieldName: normalizeFieldName(e.target.value)
                                };
                                setActiveForm({ ...activeForm, fields: next });
                              }}
                              placeholder="Label"
                            />
                          </td>
                          <td style={{ paddingTop: 2, paddingBottom: 2 }}>
                            <select
                              className="form-select form-select-sm"
                              style={{ padding: "0.45rem 0.6rem", minHeight: "2.1rem" }}
                              value={field.fieldType}
                              onChange={(e) => {
                                const next = [...activeForm.fields];
                                next[idx] = { ...field, fieldType: e.target.value };
                                setActiveForm({ ...activeForm, fields: next });
                              }}
                            >
                              {ENQUIRY_FIELD_TYPES.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}
                            </select>
                          </td>
                          <td style={{ paddingTop: 2, paddingBottom: 2 }}>
                            {defaultOptions ? (
                              <select
                                className="form-select form-select-sm"
                                style={{ padding: "0.45rem 0.6rem", minHeight: "2.1rem" }}
                                value={field.defaultValue || ""}
                                onChange={(e) => {
                                  const next = [...activeForm.fields];
                                  next[idx] = { ...field, defaultValue: e.target.value };
                                  setActiveForm({ ...activeForm, fields: next });
                                }}
                              >
                                <option value="">None</option>
                                {defaultOptions.map((option) => (
                                  <option key={option} value={option}>{option}</option>
                                ))}
                              </select>
                            ) : (
                              <input
                                className="form-control form-control-sm"
                                style={{ padding: "0.45rem 0.6rem", minHeight: "2.1rem" }}
                                value={field.defaultValue || ""}
                                onChange={(e) => {
                                  next[idx] = { ...field, defaultValue: e.target.value };
                                  setActiveForm({ ...activeForm, fields: next });
                                }}
                                placeholder="Default value"
                              />
                            )}
                          </td>
                          <td className="text-center" style={{ paddingTop: 2, paddingBottom: 2 }}>
                            <input
                              type="checkbox"
                              className="form-check-input"
                              checked={Boolean(field.hidden)}
                              onChange={(e) => {
                                const next = [...activeForm.fields];
                                next[idx] = { ...field, hidden: e.target.checked };
                                setActiveForm({ ...activeForm, fields: next });
                              }}
                            />
                          </td>
                          <td className="text-center" style={{ paddingTop: 2, paddingBottom: 2 }}>
                            <input
                              type="checkbox"
                              className="form-check-input"
                              checked={Boolean(field.isRequired)}
                              onChange={(e) => {
                                const next = [...activeForm.fields];
                                next[idx] = { ...field, isRequired: e.target.checked };
                                setActiveForm({ ...activeForm, fields: next });
                              }}
                            />
                          </td>
                          <td className="text-end">
                            <button
                              className="btn btn-sm btn-link-secondary me-2"
                              onClick={() => openFieldEditor(field, idx)}
                              title="Edit field"
                            >
                              <i className="bi bi-pencil"></i>
                            </button>
                            <button
                              className="btn btn-sm btn-link-danger"
                              onClick={() => {
                                const next = activeForm.fields.filter((_, i) => i !== idx);
                                setActiveForm({ ...activeForm, fields: next });
                              }}
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {activeForm._id && (
              <div className="alert alert-light border small mb-2">
                <div className="fw-semibold mb-1">Share link</div>
                <div className="text-break">{getShareUrl(activeForm._id)}</div>
              </div>
            )}

            <div className="d-flex gap-2">
              <button className="btn btn-sm btn-wa" onClick={saveForm}>Save form</button>
              <button className="btn btn-sm btn-outline-secondary" onClick={closeEditor}>Cancel</button>
            </div>
          </div>
        </div>
      ) : (
        <div>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <p className="mb-1 text-muted">Saved enquiry forms are available for campaigns.</p>
            </div>
            <button className="btn btn-wa" onClick={createNewForm}><i className="bi bi-plus-lg me-1"></i>Create Enquiry Form</button>
          </div>

          {forms.length === 0 ? (
            <EmptyState title="No enquiry forms yet" subtitle="Create a form to start using it in your campaigns." />
          ) : (
            <div className="table-responsive">
              <table className="table mb-0 align-middle">
                <thead>
                  <tr>
                                    <th>Name</th>
                    <th>Status</th>
                    <th>Selected fields</th>
                    <th>Updated</th>
                    <th>Link</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {forms.map((form) => (
                    <tr key={form._id}>
                      <td>{form.name}</td>
                      <td>
                        <span className="badge" style={{ background: form.isActive ? "#e6f4ea" : "#f3f2f1", color: form.isActive ? "#10714a" : "#6b6b6b" }}>
                          {form.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td>{(form.fields || []).filter((field) => field.selected).length}</td>
                      <td>{formatDateDMY(form.updatedAt)}</td>
                      <td>
                        <div className="small text-break mb-1">
                          <a href={getShareUrl(form._id)} target="_blank" rel="noreferrer">{getShareUrl(form._id)}</a>
                        </div>
                        <button
                          className="btn btn-sm btn-outline-secondary"
                          type="button"
                          title="Copy share link"
                          onClick={() => navigator.clipboard.writeText(getShareUrl(form._id))}
                        >
                          <i className="bi bi-clipboard"></i>
                        </button>
                      </td>
                      <td className="text-end">
                        <div className="d-flex justify-content-end gap-1">
                          <IconBtn icon="eye" title="Preview form" onClick={() => openPreview(form)} />
                          <IconBtn icon="pencil" title="Edit form" onClick={() => editForm(form)} />
                          <IconBtn icon="trash" title="Delete form" danger onClick={() => deleteForm(form._id)} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {previewForm && (
        <Modal size="lg" title={`Preview: ${previewForm.name || "Enquiry Form"}`} onClose={closePreview} footer={<button className="btn btn-outline-secondary" onClick={closePreview}>Close</button>}>
          <div className="mb-2">
            <div className="small text-muted">This preview uses the same public form URL that can be shared.</div>
          </div>
          <iframe
            src={getShareUrl(previewForm._id)}
            title={`Preview ${previewForm.name}`}
            style={{ width: "100%", minHeight: "560px", border: "1px solid #e5e7eb", borderRadius: 8 }}
          />
        </Modal>
      )}

      {fieldEditor && (
        <Modal
          title={fieldEditor._idx !== undefined && fieldEditor._idx !== null ? "Edit Field" : "Add Field"}
          onClose={closeFieldEditor}
          footer={
            <>
              <button className="btn btn-outline-secondary" onClick={closeFieldEditor}>Cancel</button>
              <button className="btn btn-wa" onClick={saveFieldEditor}>Save Field</button>
            </>
          }
        >
          <div className="mb-2">
            <label className="form-label">Field Label</label>
            <input
              className="form-control"
              value={fieldEditor.label}
              onChange={(e) => setFieldEditor({ ...fieldEditor, label: e.target.value, error: "" })}
              placeholder="e.g. Student Name"
            />
          </div>

          <div className="mb-2">
            <label className="form-label">Field Type</label>
            <select
              className="form-select"
              value={fieldEditor.fieldType}
              onChange={(e) => setFieldEditor({ ...fieldEditor, fieldType: e.target.value, error: "" })}
            >
              {ENQUIRY_FIELD_TYPES.map((type) => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          {fieldEditor.fieldType === "select" && (
            <div className="mb-2">
              <label className="form-label">Dropdown Options</label>
              <textarea
                className="form-control"
                rows={4}
                value={fieldEditor.optionsText || ""}
                onChange={(e) => setFieldEditor({ ...fieldEditor, optionsText: e.target.value })}
                placeholder="Option 1, Option 2, Option 3"
              />
              <small className="text-muted">Enter values separated by commas for the dropdown menu.</small>
            </div>
          )}

          <div className="mb-2">
            <label className="form-label">Default Value</label>
            <input
              className="form-control"
              value={fieldEditor.defaultValue || ""}
              onChange={(e) => setFieldEditor({ ...fieldEditor, defaultValue: e.target.value })}
              placeholder="Optional default value"
            />
          </div>

          <div className="form-check mb-2">
            <input
              type="checkbox"
              className="form-check-input"
              id="fieldRequired"
              checked={fieldEditor.isRequired}
              onChange={(e) => setFieldEditor({ ...fieldEditor, isRequired: e.target.checked })}
            />
            <label className="form-check-label" htmlFor="fieldRequired">
              Required
            </label>
            <div className="form-text text-muted">
              Make this field mandatory for the user when filling the enquiry form.
            </div>
          </div>

          {fieldEditor.error && (
            <div className="alert alert-danger py-2" role="alert">
              {fieldEditor.error}
            </div>
          )}

          <div className="form-check">
            <input
              type="checkbox"
              className="form-check-input"
              id="fieldSelected"
              checked={fieldEditor.selected}
              onChange={(e) => setFieldEditor({ ...fieldEditor, selected: e.target.checked })}
            />
            <label className="form-check-label" htmlFor="fieldSelected">Include field in form</label>
          </div>
        </Modal>
      )}
    </div>
  );
}
