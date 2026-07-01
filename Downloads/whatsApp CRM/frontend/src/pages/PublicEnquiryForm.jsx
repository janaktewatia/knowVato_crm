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

  const visibleFields = useMemo(() => (form?.fields || []).filter((field) => !field.hidden), [form]);

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
          <div className="card shadow-sm">
            <div className="card-body">
              <h2 className="mb-2">{form?.heading || form?.name || "Enquiry Form"}</h2>
              <p className="text-muted mb-4">{form?.tagline || "Share your details and we’ll follow up with you."}</p>

              {error ? <div className="alert alert-danger">{error}</div> : null}
              {success ? <div className="alert alert-success">{success}</div> : null}

              <form onSubmit={handleSubmit}>
                {visibleFields.map((field) => {
                  const fieldName = field.fieldName || field.label;
                  const key = fieldName || `field-${Math.random()}`;
                  const label = field.label || fieldName;
                  const value = values[key] ?? "";

                  if (field.fieldType === "textarea") {
                    return (
                      <div className="mb-2" key={key}>
                        <label className="form-label">{label}</label>
                        <textarea
                          className="form-control"
                          style={{ padding: "0.35rem 0.6rem" }}
                          rows="3"
                          value={value}
                          onChange={(e) => handleChange(key, e.target.value)}
                          required={Boolean(field.isRequired)}
                        />
                      </div>
                    );
                  }

                  if (field.fieldType === "date") {
                    return (
                      <div className="mb-2" key={key}>
                        <label className="form-label">{label}</label>
                        <input
                          className="form-control"
                          style={{ padding: "0.35rem 0.6rem" }}
                          type="text"
                          inputMode="numeric"
                          placeholder="dd-mm-yyyy"
                          pattern="\\d{2}-\\d{2}-\\d{4}"
                          value={value}
                          onChange={(e) => handleChange(key, e.target.value)}
                          required={Boolean(field.isRequired)}
                        />
                      </div>
                    );
                  }

                  if (field.fieldType === "select") {
                    return (
                      <div className="mb-2" key={key}>
                        <label className="form-label">{label}</label>
                        <select
                          className="form-select"
                          style={{ padding: "0.35rem 0.6rem" }}
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
                      </div>
                    );
                  }

                  return (
                    <div className="mb-2" key={key}>
                      <label className="form-label">{label}</label>
                      <input
                        className="form-control"
                        style={{ padding: "0.35rem 0.6rem" }}
                        type={field.fieldType || "text"}
                        value={value}
                        onChange={(e) => handleChange(key, e.target.value)}
                        required={Boolean(field.isRequired)}
                      />
                    </div>
                  );
                })}

                <button className="btn btn-primary" type="submit" disabled={submitting}>
                  {submitting ? "Submitting…" : "Submit Enquiry"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
