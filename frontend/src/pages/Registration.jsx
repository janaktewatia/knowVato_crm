import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { leadsApi, registrationsApi, workflowConfigApi, mastersApi } from "../api";
import { useApi } from "../hooks/useApi";
import { useToast } from "../context/ToastContext";
import { PageHeader, Spinner, ErrorBox, Field } from "../components/ui";

function renderFieldInput(field, value, onChange) {
  const commonProps = {
    className: "form-control",
    value: value || "",
    onChange: (e) => onChange(field.fieldName, e.target.value),
    placeholder: field.label
  };

  switch (field.fieldType) {
    case "email":
      return <input type="email" {...commonProps} />;
    case "phone":
      return <input type="tel" {...commonProps} />;
    case "number":
      return <input type="number" {...commonProps} />;
    case "textarea":
      return <textarea rows={3} {...commonProps} />;
    case "select":
      return (
        <select className="form-select" value={value || ""} onChange={(e) => onChange(field.fieldName, e.target.value)}>
          <option value="">Select {field.label}</option>
          {(field.options || []).map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      );
    case "date":
      return <input type="date" {...commonProps} />;
    case "checkbox":
      return (
        <div className="form-check">
          <input
            type="checkbox"
            className="form-check-input"
            id={field.fieldName}
            checked={value === true || value === "true"}
            onChange={(e) => onChange(field.fieldName, e.target.checked)}
          />
          <label className="form-check-label" htmlFor={field.fieldName}>{field.label}</label>
        </div>
      );
    default:
      return <input type="text" {...commonProps} />;
  }
}

export default function Registration() {
  const { leadId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({});
  const [documents, setDocuments] = useState([]);
  const [interaction, setInteraction] = useState({ type: "", notes: "" });
  const [payment, setPayment] = useState({ amount: "", method: "", reference: "" });
  const [selectedStatus, setSelectedStatus] = useState("");
  const [saving, setSaving] = useState(false);

  const lead = useApi(() => leadsApi.get(leadId), [leadId]);
  const config = useApi(() => workflowConfigApi.get("registrationForm"), []);
  const statuses = useApi(() => mastersApi.statuses(), []);

  const registrationConfig = config.data || {};
  const mode = registrationConfig.mode || "single";
  const fields = registrationConfig.fields || [
    { fieldName: "name", label: "Name", fieldType: "text", isRequired: true, helpText: "" },
    { fieldName: "phone", label: "Phone", fieldType: "phone", isRequired: true, helpText: "" },
    { fieldName: "email", label: "Email", fieldType: "email", isRequired: false, helpText: "" },
    { fieldName: "course", label: "Course", fieldType: "text", isRequired: false, helpText: "" }
  ];
  const steps = registrationConfig.steps || [{ title: "Registration", type: "form", fieldNames: fields.map((f) => f.fieldName) }];
  const documentTypes = registrationConfig.documentTypes || [];

  useEffect(() => {
    if (lead.data) {
      const initial = { ...lead.data };
      fields.forEach((field) => {
        if (initial[field.fieldName] === undefined) {
          initial[field.fieldName] = field.fieldType === "checkbox" ? false : "";
        }
      });
      setFormData({
        name: lead.data.name || "",
        phone: lead.data.phone || "",
        email: lead.data.email || "",
        course: lead.data.course || "",
        ...initial
      });
    }
  }, [lead.data, fields]);

  const currentStep = steps[activeStep] || {};
  const currentStepName = currentStep.title || "Step";

  const setFieldValue = (fieldName, value) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
  };

  const toggleDocument = (id) => {
    setDocuments((prev) => (prev.includes(id) ? prev.filter((doc) => doc !== id) : [...prev, id]));
  };

  const renderFormFields = (fieldNames) => {
    const visibleFields = fieldNames?.length
      ? fields.filter((field) => fieldNames.includes(field.fieldName))
      : fields;

    return visibleFields.map((field) => (
      <div className="mb-3" key={field.fieldName}>
        {field.fieldType !== "checkbox" ? (
          <>
            <label className="form-label">
              {field.label}{field.isRequired && <span className="text-danger">*</span>}
            </label>
            {renderFieldInput(field, formData[field.fieldName], setFieldValue)}
            {field.helpText && <div className="form-text">{field.helpText}</div>}
          </>
        ) : (
          renderFieldInput(field, formData[field.fieldName], setFieldValue)
        )}
      </div>
    ));
  };

  const validateStep = () => {
    if (currentStep.type === "form") {
      const requiredFields = fields.filter((field) => field.isRequired && (!currentStep.fieldNames || currentStep.fieldNames.includes(field.fieldName)));
      for (const field of requiredFields) {
        const value = formData[field.fieldName];
        if (field.fieldType === "checkbox") {
          if (value !== true) {
            toast(`${field.label} is required`, "error");
            return false;
          }
        } else if (!value || !String(value).trim()) {
          toast(`${field.label} is required`, "error");
          return false;
        }
      }
    }
    if (currentStep.type === "documents" && currentStep.required && documents.length === 0) {
      toast("Please select required document types", "error");
      return false;
    }
    if (currentStep.type === "payment") {
      if (!payment.amount) {
        toast("Payment amount is required", "error");
        return false;
      }
    }
    if (currentStep.type === "status" && !selectedStatus) {
      toast("Please select status", "error");
      return false;
    }
    return true;
  };

  const isLastStep = () => activeStep === steps.length - 1;

  const handleNext = () => {
    if (!validateStep()) return;
    setActiveStep((prev) => Math.min(steps.length - 1, prev + 1));
  };

  const handleBack = () => {
    setActiveStep((prev) => Math.max(0, prev - 1));
  };

  const handleSubmit = async () => {
    if (mode !== "single" && !validateStep()) return;
    if (mode === "multistep" && !isLastStep()) {
      handleNext();
      return;
    }

    // Validation for required form fields in single mode
    if (mode === "single") {
      const required = fields.filter((field) => field.isRequired);
      for (const field of required) {
        const value = formData[field.fieldName];
        if (field.fieldType === "checkbox") {
          if (value !== true) {
            toast(`${field.label} is required`, "error");
            return;
          }
        } else if (!value || !String(value).trim()) {
          toast(`${field.label} is required`, "error");
          return;
        }
      }
    }

    setSaving(true);
    try {
      const payload = {
        lead: leadId,
        ...Object.fromEntries(fields.map((field) => [field.fieldName, formData[field.fieldName] ?? ""])),
        documents: documentTypes.filter((doc) => documents.includes(doc._id)).map((doc) => ({ _id: doc._id, name: doc.name })),
        interaction: interaction.type || interaction.notes ? interaction : undefined,
        payment: payment.amount || payment.method || payment.reference ? payment : undefined,
        status: selectedStatus || undefined,
      };
      await registrationsApi.create(payload);
      toast("Registration submitted successfully");
      navigate("/leads");
    } catch (e) {
      toast(e.message, "error");
    } finally {
      setSaving(false);
    }
  };

  if (lead.loading || config.loading || statuses.loading) return <Spinner />;
  if (lead.error) return <ErrorBox error={lead.error} />;
  if (!lead.data) return <ErrorBox error={{ message: "Lead not found" }} />;

  return (
    <div>
      <PageHeader
        title="Registration"
        subtitle={`Lead: ${lead.data.name} • ${lead.data.phone}`}
        actions={<button className="btn btn-outline-secondary" onClick={() => navigate(-1)}>Back</button>}
      />

      <div className="card mb-4">
        <div className="card-body">
          <div className="mb-3">
            <strong>Registration mode:</strong> {mode === "single" ? "Single form" : "Multi-step"}
          </div>
          {mode === "multistep" && (
            <div className="d-flex flex-wrap gap-2 mb-4">
              {steps.map((step, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`btn btn-sm ${idx === activeStep ? "btn-wa" : "btn-outline-secondary"}`}
                  onClick={() => setActiveStep(idx)}
                >
                  {idx + 1}. {step.title}
                </button>
              ))}
            </div>
          )}

          <div className="card" style={{ minHeight: 320 }}>
            <div className="card-body">
              {mode === "single" ? (
                <>
                  {renderFormFields(fields.map((field) => field.fieldName))}

                  {documentTypes.length > 0 && (
                    <div className="mb-4">
                      <h6 className="mb-3">Documents</h6>
                      <div className="row g-3">
                        {documentTypes.map((doc) => (
                          <div className="col-md-6" key={doc._id}>
                            <div className="form-check">
                              <input className="form-check-input" type="checkbox" id={`doc-${doc._id}`} checked={documents.includes(doc._id)} onChange={() => toggleDocument(doc._id)} />
                              <label className="form-check-label" htmlFor={`doc-${doc._id}`}>
                                {doc.name}
                              </label>
                              {doc.description && <div className="form-text">{doc.description}</div>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mb-4">
                    <h6 className="mb-3">Interaction</h6>
                    <Field label="Next interaction type">
                      <select className="form-select" value={interaction.type} onChange={(e) => setInteraction({ ...interaction, type: e.target.value })}>
                        <option value="">Select interaction</option>
                        <option value="call">Call</option>
                        <option value="email">Email</option>
                        <option value="whatsapp">WhatsApp</option>
                        <option value="meeting">Meeting</option>
                      </select>
                    </Field>
                    <Field label="Notes">
                      <textarea className="form-control" rows={3} value={interaction.notes} onChange={(e) => setInteraction({ ...interaction, notes: e.target.value })} />
                    </Field>
                  </div>

                  <div className="mb-4">
                    <h6 className="mb-3">Payment</h6>
                    <div className="row g-3">
                      <div className="col-md-4">
                        <Field label="Amount">
                          <input className="form-control" type="number" value={payment.amount} onChange={(e) => setPayment({ ...payment, amount: e.target.value })} />
                        </Field>
                      </div>
                      <div className="col-md-4">
                        <Field label="Payment method">
                          <input className="form-control" value={payment.method} onChange={(e) => setPayment({ ...payment, method: e.target.value })} />
                        </Field>
                      </div>
                      <div className="col-md-4">
                        <Field label="Reference">
                          <input className="form-control" value={payment.reference} onChange={(e) => setPayment({ ...payment, reference: e.target.value })} />
                        </Field>
                      </div>
                    </div>
                  </div>

                  <Field label="Status after registration">
                    <select className="form-select" value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
                      <option value="">Select status</option>
                      {(statuses.data || []).map((s) => (
                        <option key={s._id} value={s._id}>{s.name}</option>
                      ))}
                    </select>
                  </Field>
                </>
              ) : (
                <>
                  <h5 className="mb-4">{currentStepName}</h5>
                  {currentStep.type === "form" && renderFormFields(currentStep.fieldNames || fields.map((f) => f.fieldName))}
                  {currentStep.type === "documents" && (
                    <div>
                      <div className="mb-3">Select document types that apply.</div>
                      <div className="row g-3">
                        {documentTypes.map((doc) => (
                          <div className="col-md-6" key={doc._id}>
                            <div className="form-check">
                              <input className="form-check-input" type="checkbox" id={`doc-step-${doc._id}`} checked={documents.includes(doc._id)} onChange={() => toggleDocument(doc._id)} />
                              <label className="form-check-label" htmlFor={`doc-step-${doc._id}`}>{doc.name}</label>
                              {doc.description && <div className="form-text">{doc.description}</div>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {currentStep.type === "interaction" && (
                    <>
                      <Field label="Interaction Type">
                        <select className="form-select" value={interaction.type} onChange={(e) => setInteraction({ ...interaction, type: e.target.value })}>
                          <option value="">Select interaction</option>
                          <option value="call">Call</option>
                          <option value="email">Email</option>
                          <option value="whatsapp">WhatsApp</option>
                          <option value="meeting">Meeting</option>
                        </select>
                      </Field>
                      <Field label="Notes">
                        <textarea className="form-control" rows={4} value={interaction.notes} onChange={(e) => setInteraction({ ...interaction, notes: e.target.value })} />
                      </Field>
                    </>
                  )}
                  {currentStep.type === "payment" && (
                    <div className="row g-3">
                      <div className="col-md-4"><Field label="Amount"><input className="form-control" type="number" value={payment.amount} onChange={(e) => setPayment({ ...payment, amount: e.target.value })} /></Field></div>
                      <div className="col-md-4"><Field label="Method"><input className="form-control" value={payment.method} onChange={(e) => setPayment({ ...payment, method: e.target.value })} /></Field></div>
                      <div className="col-md-4"><Field label="Reference"><input className="form-control" value={payment.reference} onChange={(e) => setPayment({ ...payment, reference: e.target.value })} /></Field></div>
                    </div>
                  )}
                  {currentStep.type === "status" && (
                    <Field label="Select status">
                      <select className="form-select" value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
                        <option value="">Select status</option>
                        {(statuses.data || []).map((s) => (
                          <option key={s._id} value={s._id}>{s.name}</option>
                        ))}
                      </select>
                    </Field>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="d-flex justify-content-end gap-2 mt-4">
            {mode === "multistep" && (
              <button className="btn btn-outline-secondary" onClick={handleBack} disabled={activeStep === 0}>Back</button>
            )}
            <button className="btn btn-wa" onClick={handleSubmit} disabled={saving}>
              {saving ? "Saving..." : mode === "multistep" ? (isLastStep() ? "Submit Registration" : "Next Step") : "Submit Registration"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
