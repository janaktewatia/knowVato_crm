import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { publicApi } from "../api";

export default function PublicEnquiryForm() {
  const { formId } = useParams();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [values, setValues] = useState({});

  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        setLoading(true);
        setError("");
        const res = await publicApi.getEnquiryForm(formId);
        if (!ignore) {
          const payload = res?.data?.form || res?.form || null;
          setForm(payload);
          const initial = {};
          (payload?.fields || []).forEach((field) => {
            initial[field.fieldName || field.label] = field.defaultValue || "";
          });
          setValues(initial);
        }
      } catch (e) {
        if (!ignore) setError(e.message || "Unable to load enquiry form.");
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    load();
    return () => {
      ignore = true;
    };
  }, [formId]);

  useEffect(() => {
    const linkId = "google-fonts-public";
    let link = document.getElementById(linkId);
    if (!link) {
      link = document.createElement("link");
      link.id = linkId;
      link.rel = "stylesheet";
      link.href = "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Lora:ital,wght@0,400;0,700;1,400&family=Montserrat:wght@400;500;600;700&family=Outfit:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,600;0,700;1,600&family=Fira+Code:wght@400;500&display=swap";
      document.head.appendChild(link);
    }
  }, []);

  const visibleFields = useMemo(() => (form?.fields || []).filter((field) => field.selected && !field.hidden), [form]);

  const handleChange = (fieldName, value) => {
    setValues((prev) => ({ ...prev, [fieldName]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError("");
      setSuccess("");
      await publicApi.submitEnquiryForm(formId, values);
      setSuccess("Your enquiry has been received. We will contact you shortly.");
      setValues({});
    } catch (e) {
      setError(e.message || "Unable to submit enquiry form.");
    } finally {
      setSubmitting(false);
    }
  };

  const normalizeSize = (v) => {
    if (v === undefined || v === null) return null;
    const s = String(v).trim();
    if (!s) return null;
    if (/^[0-9]+$/.test(s)) return `${s}px`;
    return s;
  };

  const getShadowStyle = (shadow) => {
    if (shadow === "none") return "none";
    if (shadow === "small") return "0 2px 4px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.05)";
    if (shadow === "large") return "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)";
    return "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)"; // default medium
  };

  const getFontFamilyStyle = (font) => {
    if (!font || font === "Default") return "inherit";
    if (font === "Playfair Display" || font === "Lora") return `'${font}', serif`;
    if (font === "Fira Code") return `'${font}', monospace`;
    return `'${font}', sans-serif`;
  };

  if (loading) {
    return (
      <div className="container py-5">
        <div className="card shadow-sm">
          <div className="card-body">Loading enquiry form…</div>
        </div>
      </div>
    );
  }

  if (form?.isActive === false) {
    return (
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-7">
            <div className="card shadow-sm">
              <div className="card-body">
                <div className="alert alert-warning mb-0">This enquiry form is not live right now. Please contact the administrator.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-7">
          <div className="card" style={{
            width: normalizeSize(form?.width) || "100%",
            maxWidth: normalizeSize(form?.width) || "100%",
            boxSizing: "border-box",
            margin: form?.align === "center" ? "0 auto" : form?.align === "right" ? "0 0 0 auto" : "0",
            borderRadius: form?.cardBorderRadius || "12px",
            boxShadow: getShadowStyle(form?.cardShadow),
            backgroundColor: form?.cardBgColor || "#ffffff",
            fontFamily: getFontFamilyStyle(form?.fontFamily)
          }}>
            <div className="card-body" style={{ boxSizing: "border-box", height: normalizeSize(form?.height) || "auto" }}>
              <h2 className="mb-2" style={{
                fontSize: form?.headingFontSize || "24px",
                color: form?.headingColor || "#111827",
                textAlign: form?.headingAlign || "left",
                fontWeight: form?.headingBold ? 700 : 400,
                fontStyle: form?.headingItalic ? "italic" : "normal",
                fontFamily: getFontFamilyStyle(form?.headingFontFamily || form?.fontFamily)
              }}>{form?.heading || form?.name || "Enquiry Form"}</h2>
              <p className="mb-4" style={{
                fontSize: form?.taglineFontSize || "16px",
                color: form?.taglineColor || "#4b5563",
                textAlign: form?.taglineAlign || "left",
                fontWeight: form?.taglineBold ? 600 : 400,
                fontStyle: form?.taglineItalic ? "italic" : "normal",
                fontFamily: getFontFamilyStyle(form?.taglineFontFamily || form?.fontFamily)
              }}>{form?.tagline || "Share your details and we’ll follow up with you."}</p>

              {error ? <div className="alert alert-danger">{error}</div> : null}
              {success ? <div className="alert alert-success">{success}</div> : null}

              <form onSubmit={handleSubmit}>
                <div className="row gx-3">
                  {visibleFields.map((field) => {
                    const fieldName = field.fieldName || field.label;
                    const key = fieldName || `field-${Math.random()}`;
                    const label = field.label || fieldName;
                    const value = values[key] ?? "";
                    const labelStyle = { color: field.textColor || "#000000" };

                    // Determine bootstrap col span based on field.column
                    const fieldCol = Number(field.column || form?.columns || 1);

                    let colClass = "col-12";
                    if (fieldCol === 2) colClass = "col-md-6 col-12";
                    else if (fieldCol === 3) colClass = "col-md-4 col-12";
                    else colClass = "col-12";

                    return (
                      <div className={`${colClass} mb-3`} key={key}>
                        <label className="form-label" style={{ ...labelStyle, fontSize: form?.fieldLabelFontSize || "14px" }}>{label}</label>
                        {/* field elements render with form?.fieldInputFontSize */}
                        {(() => {
                          const elStyle = { padding: "0.35rem 0.6rem", borderRadius: form?.fieldBorderRadius || "6px", fontSize: form?.fieldInputFontSize || "14px" };
                          if (field.fieldType === "textarea") {
                            return (
                              <textarea
                                className="form-control"
                                style={elStyle}
                                rows="3"
                                value={value}
                                onChange={(e) => handleChange(key, e.target.value)}
                                required={Boolean(field.isRequired)}
                              />
                            );
                          }

                          if (field.fieldType === "date") {
                            return (
                              <input
                                className="form-control"
                                style={elStyle}
                                type="text"
                                inputMode="numeric"
                                placeholder="dd-mm-yyyy"
                                pattern="\\d{2}-\\d{2}-\\d{4}"
                                value={value}
                                onChange={(e) => handleChange(key, e.target.value)}
                                required={Boolean(field.isRequired)}
                              />
                            );
                          }

                          if (field.fieldType === "select") {
                            return (
                              <select
                                className="form-select"
                                style={elStyle}
                                value={value}
                                onChange={(e) => handleChange(key, e.target.value)}
                                required={Boolean(field.isRequired)}
                              >
                                <option value="">Select</option>
                                {(field.options || []).map((option) => (
                                  <option key={option} value={option}>
                                    {option}
                                  </option>
                                ))}
                              </select>
                            );
                          }

                          return (
                            <input
                              className="form-control"
                              style={elStyle}
                              type={field.fieldType || "text"}
                              value={value}
                              onChange={(e) => handleChange(key, e.target.value)}
                              required={Boolean(field.isRequired)}
                            />
                          );
                        })()}
                      </div>
                    );
                  })}
                </div>

                <div className={`mt-4 d-flex ${
                  form?.buttonAlign === "center"
                    ? "justify-content-center"
                    : form?.buttonAlign === "right"
                      ? "justify-content-end"
                      : "justify-content-start"
                }`}>
                  <button
                    className="btn"
                    type="submit"
                    disabled={submitting}
                    style={{
                      backgroundColor: form?.buttonColor || "#0d6efd",
                      color: form?.buttonTextColor || "#ffffff",
                      fontSize: form?.buttonFontSize || "16px",
                      fontWeight: form?.buttonBold ? 700 : 500,
                      fontStyle: form?.buttonItalic ? "italic" : "normal",
                      borderRadius: form?.buttonBorderRadius || "6px",
                      width: form?.buttonAlign === "full" ? "100%" : "auto"
                    }}
                  >
                    {submitting ? "Submitting…" : form?.submitText || "Submit Enquiry"}
                  </button>
                </div>
              </form>
              {form?.footerText ? (
                <div className="mt-4 border-top pt-2" style={{
                  fontSize: form.footerFontSize || "13px",
                  color: form.footerColor || "#6b7280",
                  textAlign: form.footerAlign || "left",
                  fontFamily: getFontFamilyStyle(form.footerFontFamily || form.fontFamily),
                  fontWeight: form.footerBold ? "bold" : "normal",
                  fontStyle: form.footerItalic ? "italic" : "normal"
                }}>
                  {form.footerText}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
