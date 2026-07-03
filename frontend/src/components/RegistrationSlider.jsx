import { useState, useEffect } from "react";
import { registrationsApi, mastersApi } from "../api";
import { useApi } from "../hooks/useApi";
import { useToast } from "../context/ToastContext";
import { Spinner, ErrorBox } from "./ui";

export default function RegistrationSlider({ lead, onClose, registrationFields = [] }) {
  const toast = useToast();
  const [formData, setFormData] = useState({
    name: lead?.name || "",
    phone: lead?.phone || "",
    email: lead?.email || "",
    course: "",
    ...Object.fromEntries((registrationFields || []).map(f => [f.fieldName, ""]))
  });
  const [saving, setSaving] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const registrations = useApi(() => registrationsApi.list({ leadId: lead._id }), [lead._id]);

  const handleClose = () => {
    setIsClosing(true);
  };

  const handleFieldChange = (fieldName, value) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
  };

  async function saveRegistration() {
    // Validation
    if (!formData.name.trim()) {
      toast("Name is required", "error");
      return;
    }
    if (!formData.phone.trim()) {
      toast("Phone is required", "error");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        lead: lead._id,
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        course: formData.course
      };

      // Add custom fields to payload
      (registrationFields || []).forEach(f => {
        if (formData[f.fieldName]) {
          payload[f.fieldName] = formData[f.fieldName];
        }
      });

      await registrationsApi.create(payload);
      toast("Registration created successfully");
      setFormData({
        name: lead?.name || "",
        phone: lead?.phone || "",
        email: lead?.email || "",
        course: "",
        ...Object.fromEntries((registrationFields || []).map(f => [f.fieldName, ""]))
      });
      registrations.reload();
      onClose();
    } catch (e) {
      toast(e.message, "error");
    } finally {
      setSaving(false);
    }
  }

  // Get field type render function
  const renderField = (field) => {
    const value = formData[field.fieldName] || "";

    switch (field.fieldType) {
      case "text":
        return (
          <input
            type="text"
            className="form-control"
            value={value}
            onChange={(e) => handleFieldChange(field.fieldName, e.target.value)}
            placeholder={field.label}
          />
        );
      case "email":
        return (
          <input
            type="email"
            className="form-control"
            value={value}
            onChange={(e) => handleFieldChange(field.fieldName, e.target.value)}
            placeholder={field.label}
          />
        );
      case "phone":
        return (
          <input
            type="tel"
            className="form-control"
            value={value}
            onChange={(e) => handleFieldChange(field.fieldName, e.target.value)}
            placeholder={field.label}
          />
        );
      case "number":
        return (
          <input
            type="number"
            className="form-control"
            value={value}
            onChange={(e) => handleFieldChange(field.fieldName, e.target.value)}
            placeholder={field.label}
          />
        );
      case "textarea":
        return (
          <textarea
            className="form-control"
            value={value}
            onChange={(e) => handleFieldChange(field.fieldName, e.target.value)}
            placeholder={field.label}
            rows="3"
          />
        );
      case "select":
        return (
          <select
            className="form-control"
            value={value}
            onChange={(e) => handleFieldChange(field.fieldName, e.target.value)}
          >
            <option value="">Select {field.label}</option>
            {(field.options || []).map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        );
      case "date":
        return (
          <input
            type="date"
            className="form-control"
            value={value}
            onChange={(e) => handleFieldChange(field.fieldName, e.target.value)}
            placeholder={field.label}
          />
        );
      case "checkbox":
        return (
          <div className="form-check">
            <input
              type="checkbox"
              className="form-check-input"
              id={`check-${field.fieldName}`}
              checked={value === "true" || value === true}
              onChange={(e) => handleFieldChange(field.fieldName, e.target.checked)}
            />
            <label className="form-check-label" htmlFor={`check-${field.fieldName}`}>
              {field.label}
            </label>
          </div>
        );
      default:
        return (
          <input
            type="text"
            className="form-control"
            value={value}
            onChange={(e) => handleFieldChange(field.fieldName, e.target.value)}
            placeholder={field.label}
          />
        );
    }
  };

  return (
    <>
      <div className="offcanvas-backdrop fade show" onClick={handleClose}></div>
      <div
        className="offcanvas offcanvas-end show"
        style={{
          visibility: "visible",
          width: 550,
          animation: isClosing ? "slideOutRight 0.5s ease-out forwards" : "slideInRight 0.5s ease-out"
        }}
        onAnimationEnd={() => isClosing && onClose()}
      >
        <div className="offcanvas-header border-bottom">
          <div>
            <h5 className="offcanvas-title mb-0" style={{ fontSize: 18, fontWeight: 600 }}>Registration</h5>
            <div className="text-muted small">{lead?.name} • {lead?.phone}</div>
          </div>
          <button className="btn-close" onClick={handleClose}></button>
        </div>

        <div className="offcanvas-body" style={{ maxHeight: "calc(100vh - 100px)", overflowY: "auto" }}>
          {/* Lead Info Section */}
          <div className="mb-4 pb-3 border-bottom">
            <div style={{ fontSize: 11, color: "var(--text-2)", textTransform: "uppercase", marginBottom: 8, fontWeight: 600 }}>
              Lead Information
            </div>
            <div className="fw-semibold">{lead?.name}</div>
            <div className="text-muted small">{lead?.phone}</div>
            {lead?.email && <div className="text-muted small">{lead?.email}</div>}
          </div>

          {/* Registration Form */}
          <form className="mb-4">
            {/* Name - Always show */}
            <div className="mb-3">
              <label className="form-label">Name *</label>
              <input
                type="text"
                className="form-control"
                value={formData.name}
                onChange={(e) => handleFieldChange("name", e.target.value)}
                placeholder="Full name"
              />
            </div>

            {/* Phone - Always show */}
            <div className="mb-3">
              <label className="form-label">Phone *</label>
              <input
                type="tel"
                className="form-control"
                value={formData.phone}
                onChange={(e) => handleFieldChange("phone", e.target.value)}
                placeholder="Phone number"
              />
            </div>

            {/* Email - Always show */}
            <div className="mb-3">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-control"
                value={formData.email}
                onChange={(e) => handleFieldChange("email", e.target.value)}
                placeholder="Email address"
              />
            </div>

            {/* Course - Always show */}
            <div className="mb-3">
              <label className="form-label">Course</label>
              <input
                type="text"
                className="form-control"
                value={formData.course}
                onChange={(e) => handleFieldChange("course", e.target.value)}
                placeholder="Course or program name"
              />
            </div>

            {/* Custom Fields from Config */}
            {(registrationFields || []).map((field, idx) => (
              <div key={idx} className="mb-3">
                <label className="form-label">
                  {field.label}
                  {field.isRequired && <span style={{ color: "var(--error)" }}>*</span>}
                </label>
                {renderField(field)}
                {field.helpText && (
                  <small className="text-muted d-block mt-1">{field.helpText}</small>
                )}
              </div>
            ))}
          </form>

          {/* Recent Registrations */}
          {registrations.data && registrations.data.length > 0 && (
            <div className="mt-4 pt-3 border-top">
              <div style={{ fontSize: 11, color: "var(--text-2)", textTransform: "uppercase", marginBottom: 12, fontWeight: 600 }}>
                Recent Registrations
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {registrations.data.map((reg, idx) => (
                  <div key={idx} className="card" style={{ padding: "10px 12px", fontSize: 12 }}>
                    <div className="fw-medium">{reg.name}</div>
                    <div className="text-muted small">{reg.phone}</div>
                    {reg.course && <div className="text-muted small">{reg.course}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="offcanvas-footer border-top p-3" style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={handleClose}
            disabled={saving}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-wa"
            onClick={saveRegistration}
            disabled={saving || !formData.name.trim() || !formData.phone.trim()}
          >
            {saving ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Saving...
              </>
            ) : (
              "Save Registration"
            )}
          </button>
        </div>
      </div>
    </>
  );
}
