import React, { useEffect, useMemo, useRef, useState } from "react";
import * as XLSX from "xlsx";
import QRCodeStyling from "qr-code-styling";
import { toast } from "react-toastify";
import { useParams, useNavigate } from "../lib/router-shim";
import { useEventData } from "../context/EventDataContext";
import SendCommunicationModal from "../components/SendCommunicationModal";

// ── Country codes & phone helpers ─────────────────────────────────────────────

const COUNTRY_CODES = [
  { code: "+91",  country: "India",        digits: 10 },
  { code: "+1",   country: "USA / Canada", digits: 10 },
  { code: "+44",  country: "UK",           digits: 10 },
  { code: "+971", country: "UAE",          digits: 9  },
  { code: "+65",  country: "Singapore",    digits: 8  },
  { code: "+60",  country: "Malaysia",     digits: 9  },
  { code: "+61",  country: "Australia",    digits: 9  },
  { code: "+49",  country: "Germany",      digits: 11 },
  { code: "+33",  country: "France",       digits: 9  },
  { code: "+86",  country: "China",        digits: 11 },
];

// Parse a stored phone string into { code, number }
const parsePhoneValue = (fullPhone) => {
  if (!fullPhone) return { code: "+91", number: "" };
  const s = fullPhone.toString().trim();
  for (const cc of COUNTRY_CODES) {
    if (s.startsWith(cc.code + " ")) return { code: cc.code, number: s.slice(cc.code.length + 1) };
    if (s.startsWith(cc.code))       return { code: cc.code, number: s.slice(cc.code.length) };
  }
  // "919876543210" style (no +)
  const allDigits = s.replace(/\D/g, "");
  for (const cc of COUNTRY_CODES) {
    const codeDigits = cc.code.slice(1);
    if (allDigits.startsWith(codeDigits) && allDigits.length === codeDigits.length + cc.digits)
      return { code: cc.code, number: allDigits.slice(codeDigits.length) };
  }
  return { code: "+91", number: allDigits };
};

// Validation helpers ──────────────────────────────────────────────────────────

const validatePhone = (v) => {
  if (!v) return true;
  const digits = v.toString().replace(/[\s\-\(\)\.\+]/g, "");
  // Accept 10 digits (plain mobile) or 12 digits (country code + 10, e.g. 91XXXXXXXXXX)
  return /^\d{10}$/.test(digits) || /^\d{12}$/.test(digits);
};

// ── PhoneInput component ──────────────────────────────────────────────────────

const PhoneInput = ({ value, onChange, isInvalid }) => {
  const parsed = useMemo(() => parsePhoneValue(value), [value]);
  const [code, setCode] = useState(parsed.code);
  const [number, setNumber] = useState(parsed.number);

  useEffect(() => {
    setCode(parsed.code);
    setNumber(parsed.number);
  }, [parsed.code, parsed.number]);

  const maxDigits = COUNTRY_CODES.find((c) => c.code === code)?.digits || 10;

  const handleCode = (e) => {
    const newCode = e.target.value;
    setCode(newCode);
    onChange(number ? `${newCode} ${number}` : "");
  };

  const handleNumber = (e) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, maxDigits);
    setNumber(digits);
    onChange(digits ? `${code} ${digits}` : "");
  };

  return (
    <div className="input-group input-group-sm">
      <select
        className={`form-select form-select-sm flex-shrink-0 ${isInvalid ? "is-invalid" : ""}`}
        style={{ maxWidth: 80 }}
        value={code}
        onChange={handleCode}
      >
        {COUNTRY_CODES.map((cc) => (
          <option key={cc.code} value={cc.code}>{cc.code}</option>
        ))}
      </select>
      <input
        type="tel"
        inputMode="numeric"
        className={`form-control form-control-sm ${isInvalid ? "is-invalid" : ""}`}
        placeholder={`${maxDigits} digits`}
        maxLength={maxDigits}
        value={number}
        onChange={handleNumber}
      />
    </div>
  );
};

const validateEmail = (v) => {
  if (!v) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.toString());
};

const normalizeKey = (k) =>
  k
    ?.toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "") || "";

const getCol = (row, ...keys) => {
  const norm = {};
  Object.entries(row).forEach(([k, v]) => { norm[normalizeKey(k)] = v; });
  for (const key of keys) {
    const nk = normalizeKey(key);
    if (norm[nk] != null && norm[nk] !== "") return norm[nk].toString().trim();
  }
  return "";
};

// Finds a phone value from any column whose header contains "phone" or "mobile"
const getPhoneCol = (row) => {
  const norm = {};
  Object.entries(row).forEach(([k, v]) => { norm[normalizeKey(k)] = v; });
  // Exact keys first
  const exactKeys = ["phone", "mobile", "phonenumber", "mobilenumber",
    "mobileno", "phoneno", "contactnumber", "mobilephone", "cellnumber", "mob"];
  for (const k of exactKeys) {
    if (norm[k] != null && norm[k] !== "") return norm[k].toString().trim();
  }
  // Fuzzy: any key that contains "phone" or "mobile"
  for (const [k, v] of Object.entries(norm)) {
    if ((k.includes("phone") || k.includes("mobile")) && v != null && v !== "") {
      return v.toString().trim();
    }
  }
  return "";
};

const DEFAULT_CATEGORIES = [
  { name: "VIP", color: "var(--warning)" },
  { name: "General", color: "var(--info)" },
  { name: "Staff", color: "var(--success)" },
  { name: "Speaker", color: "#8B5CF6" },
  { name: "Press", color: "#EF4444" },
];

const STATUS_MAP = {
  registered: { label: "Registered", cls: "bg-secondary" },
  "checked-in": { label: "Checked In", cls: "bg-success" },
  "checked-out": { label: "Checked Out", cls: "bg-warning text-dark" },
};

// ── Import Modal ──────────────────────────────────────────────────────────────

const ImportModal = ({ eventId, event, existingAttendees, onClose, onImported }) => {
  const fileRef = useRef(null);
  const [step, setStep] = useState("main");
  const [validRows, setValidRows] = useState([]);
  const [invalidRows, setInvalidRows] = useState([]);
  const [dupRows, setDupRows] = useState([]);
  const [fileName, setFileName] = useState("");
  const [importing, setImporting] = useState(false);
  const [allowDuplicates, setAllowDuplicates] = useState(true);
  const [importedCount, setImportedCount] = useState(0);

  // Active categories and custom fields from this event
  const activeCats = (event?.categories || []).filter((c) => c.enabled === true);
  const catNames = activeCats.map((c) => c.label);

  // Normalized labels of the fixed columns — skip any user field that duplicates them
  const FIXED_NORMALIZED = new Set([
    "name", "fullname", "attendee",
    "phone", "mobile", "phonenumber", "mobilenumber",
    "email", "emailid", "emailaddress",
    "category", "type", "group",
    "organization", "company", "org",
  ]);
  const customFields = (event?.attendeeFields || []).filter((f) => {
    const key = normalizeKey(f.label);
    return f.enabled !== false && !FIXED_NORMALIZED.has(key);
  });

  const downloadFormat = () => {
    const allFields = event?.attendeeFields || [];
    const hasMobile = allFields.find((f) => f.fieldId === "mobile")?.enabled !== false;
    const hasEmail = allFields.find((f) => f.fieldId === "email")?.enabled !== false;
    const hasCat = activeCats.length > 0;
    const hasOrg = allFields.some((f) => normalizeKey(f.label) === "organization" && f.enabled === true);

    // Build headers dynamically — only enabled fields
    const headers = ["Name*"];
    if (hasMobile) headers.push("Phone");
    if (hasEmail) headers.push("Email");
    if (hasCat) headers.push("Category");
    if (hasOrg) headers.push("Organization");
    customFields.forEach((f) => headers.push(f.required ? `${f.label}*` : f.label));

    // Example rows — include only enabled columns
    const cat1 = catNames[0] || "";
    const cat2 = catNames[1] || catNames[0] || "";
    const ex1 = ["Ravi Kumar"];
    const ex2 = ["Priya Singh"];
    if (hasMobile) { ex1.push("9876543210"); ex2.push("918527270287"); }
    if (hasEmail) { ex1.push("ravi@example.com"); ex2.push("priya@example.com"); }
    if (hasCat) { ex1.push(cat1); ex2.push(cat2); }
    if (hasOrg) { ex1.push("Infosys"); ex2.push("TCS"); }
    customFields.forEach((f) => { ex1.push(f.options?.[0] || ""); ex2.push(""); });
    const examples = [ex1, ex2];

    // Category reference sheet from event categories
    const catRows = activeCats.length > 0
      ? activeCats.map((c) => [c.label, c.color])
      : DEFAULT_CATEGORIES.map((c) => [c.name, c.color]);

    const wb = XLSX.utils.book_new();
    const ws1 = XLSX.utils.aoa_to_sheet([headers, ...examples]);
    ws1["!cols"] = headers.map(() => ({ wch: 22 }));
    XLSX.utils.book_append_sheet(wb, ws1, "Attendees");
    const ws2 = XLSX.utils.aoa_to_sheet([["Category", "Color"], ...catRows]);
    ws2["!cols"] = [{ wch: 16 }, { wch: 10 }];
    XLSX.utils.book_append_sheet(wb, ws2, "Categories");
    XLSX.writeFile(wb, "attendees_template.xlsx");
    toast.success("Template downloaded.");
  };

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = file.name.split(".").pop().toLowerCase();
    if (!["xlsx", "xls", "csv"].includes(ext)) {
      toast.error("Please upload an Excel or CSV file.");
      e.target.value = "";
      return;
    }
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const wb = XLSX.read(new Uint8Array(ev.target.result), {
          type: "array",
        });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(ws, { defval: "" });

        const existPhones = new Set(
          existingAttendees
            .map((a) => a.phone?.replace(/\D/g, ""))
            .filter(Boolean),
        );
        const existEmails = new Set(
          existingAttendees.map((a) => a.email?.toLowerCase()).filter(Boolean),
        );
        const seenPhones = new Set(),
          seenEmails = new Set();
        const valid = [],
          invalid = [],
          dup = [];

        json.forEach((row, i) => {
          const name = getCol(row, "name", "full name", "fullname", "attendee");
          const phone = getPhoneCol(row);
          const email = getCol(row, "email", "emailid", "emailaddress");
          const category = getCol(row, "category", "type", "group");
          const organization = getCol(row, "organization", "company", "org");

          // Extract values for each enabled custom field
          const customValues = {};
          customFields.forEach((f) => {
            customValues[f.label] = getCol(row, f.label);
          });

          const errors = [];
          if (!name) errors.push("Name required");

          // Phone: blank is OK; if provided must match country code + correct digit count
          if (phone && !validatePhone(phone)) errors.push("Invalid phone — enter 10 digits (e.g. 9876543210) or 12 digits with country code (e.g. 919876543210)");

          // Email: blank is OK; if provided must match email format
          if (email && !validateEmail(email)) errors.push("Invalid email address");

          // Category: blank is OK; if provided must be one of the event's categories
          if (category && catNames.length > 0) {
            const catMatch = catNames.some(
              (c) => c.toLowerCase() === category.toLowerCase()
            );
            if (!catMatch) errors.push(`Invalid category "${category}" — use values from Categories sheet`);
          }

          // Validate required custom fields
          customFields.filter((f) => f.required).forEach((f) => {
            if (!customValues[f.label]) errors.push(`${f.label} required`);
          });

          const phoneKey = phone.replace(/\D/g, "");
          const emailKey = email.toLowerCase();

          if (phoneKey && seenPhones.has(phoneKey))
            errors.push("Duplicate phone in file");
          else if (phoneKey) seenPhones.add(phoneKey);
          if (emailKey && seenEmails.has(emailKey))
            errors.push("Duplicate email in file");
          else if (emailKey) seenEmails.add(emailKey);
          if (phoneKey && existPhones.has(phoneKey))
            errors.push("Phone already exists");
          if (emailKey && existEmails.has(emailKey))
            errors.push("Email already exists");

          const record = {
            row: i + 2,
            name,
            phone,
            email,
            category,
            organization,
            customValues,
            errors,
          };
          if (
            errors.some(
              (e) => e.includes("Duplicate") || e.includes("already exists"),
            )
          )
            dup.push(record);
          else if (errors.length > 0) invalid.push(record);
          else valid.push(record);
        });

        setValidRows(valid);
        setInvalidRows(invalid);
        setDupRows(dup);
        setStep("validate");
      } catch {
        toast.error("Failed to parse file.");
      }
      e.target.value = "";
    };
    reader.readAsArrayBuffer(file);
  };

  const handleConfirm = () => {
    setImporting(true);
    const toImport = allowDuplicates ? [...validRows, ...dupRows] : validRows;
    const rows = toImport.map(({ name, phone, email, category, organization, customValues }) => ({
      name,
      phone,
      email,
      category,
      organization,
      ...(customValues || {}),
    }));
    setImportedCount(rows.length);
    onImported(rows);
    setStep("success");
    setImporting(false);
  };

  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-sheet">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div className="d-flex align-items-center gap-2">
            {step !== "main" && (
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary p-1"
                onClick={() => setStep("main")}
              >
                <i className="bi bi-arrow-left" />
              </button>
            )}
            <h5 className="fw-bold mb-0">
              {step === "main" && "Import Registrants"}
              {step === "validate" && "Validation Results"}
              {step === "success" && "Import Complete"}
            </h5>
          </div>
          <button type="button" className="btn-close" onClick={onClose} />
        </div>

        {step === "main" && (
          <div className="row g-3">
            <div className="col-12 col-sm-6">
              <button
                type="button"
                className="import-option-card w-100 h-100"
                onClick={downloadFormat}
              >
                <i className="bi bi-download mb-2 text-primary" style={{ fontSize: 32 }} />
                <div className="fw-semibold mb-1">Download Format</div>
                <div className="text-muted small">
                  Get the Excel template with correct column headers.
                </div>
              </button>
            </div>
            <div className="col-12 col-sm-6">
              <button
                type="button"
                className="import-option-card w-100 h-100"
                onClick={() => fileRef.current?.click()}
              >
                <i className="bi bi-upload mb-2 text-success" style={{ fontSize: 32 }} />
                <div className="fw-semibold mb-1">Import Data</div>
                <div className="text-muted small">
                  Upload your filled Excel / CSV file.
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  style={{ display: "none" }}
                  onChange={handleFile}
                />
              </button>
            </div>
          </div>
        )}

        {step === "validate" && (
          <>
            <div className="mb-3 small text-muted">
              File: <strong>{fileName}</strong>
            </div>
            <div className="d-flex flex-wrap gap-2 mb-3">
              <span className="badge bg-success py-2 px-3">
                <i className="bi bi-check me-1" /> {validRows.length} Valid
              </span>
              {invalidRows.length > 0 && (
                <span className="badge bg-danger py-2 px-3">
                  <i className="bi bi-x me-1" /> {invalidRows.length} Invalid
                </span>
              )}
              {dupRows.length > 0 && (
                <span className="badge bg-warning text-dark py-2 px-3">
                  <i className="bi bi-exclamation-triangle me-1" /> {dupRows.length}{" "}
                  Duplicate
                </span>
              )}
            </div>
            {(invalidRows.length > 0 || dupRows.length > 0) && (
              <div
                className="mb-3"
                style={{ maxHeight: 200, overflowY: "auto" }}
              >
                <table
                  className="table table-sm table-bordered mb-0"
                  style={{ fontSize: 12 }}
                >
                  <thead className="table-light">
                    <tr>
                      <th>Row</th>
                      <th>Name</th>
                      <th>Issue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...invalidRows, ...dupRows].map((r) => (
                      <tr
                        key={r.row}
                        className={
                          dupRows.includes(r) ? "table-warning" : "table-danger"
                        }
                      >
                        <td>{r.row}</td>
                        <td>{r.name || "—"}</td>
                        <td>{r.errors.join(", ")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {/* Duplicate handling option */}
            {dupRows.length > 0 && (
              <div className="border rounded px-3 py-2 mb-3 d-flex align-items-center gap-2" style={{ background: "#fffbeb" }}>
                <input
                  type="checkbox"
                  id="allowDupCheck"
                  className="form-check-input mt-0"
                  checked={allowDuplicates}
                  onChange={(e) => setAllowDuplicates(e.target.checked)}
                />
                <label htmlFor="allowDupCheck" className="small mb-0" style={{ cursor: "pointer" }}>
                  Allow duplicate phone / email — same contact can appear for multiple attendees
                </label>
              </div>
            )}

            {(() => {
              const importCount = allowDuplicates
                ? validRows.length + dupRows.length
                : validRows.length;
              if (importCount === 0) {
                return (
                  <div className="alert alert-danger mb-3">
                    No rows to import. Fix the issues and try again.
                  </div>
                );
              }
              return (
                <div className="alert alert-success mb-3">
                  {importCount} row{importCount !== 1 ? "s" : ""} ready to import.
                  {dupRows.length > 0 && !allowDuplicates && " Duplicates will be skipped."}
                  {dupRows.length > 0 && allowDuplicates && ` Includes ${dupRows.length} duplicate entr${dupRows.length !== 1 ? "ies" : "y"}.`}
                </div>
              );
            })()}

            <div className="d-flex gap-2 justify-content-end">
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={handleConfirm}
                disabled={(allowDuplicates ? validRows.length + dupRows.length : validRows.length) === 0 || importing}
              >
                <i className="bi bi-check me-1" /> Import{" "}
                {allowDuplicates ? validRows.length + dupRows.length : validRows.length}{" "}
                Registrants
              </button>
            </div>
          </>
        )}

        {step === "success" && (
          <div className="text-center py-4">
            <div style={{ fontSize: 48 }}>✅</div>
            <h5 className="fw-bold mt-2">
              {importedCount} Registrants Imported
            </h5>
            <p className="text-muted small">
              Data is now available in the registrant table.
            </p>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={onClose}
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Communication Modal ───────────────────────────────────────────────────────

const CommModal = ({ attendee, onClose, eventId, allAttendees = [] }) => {
  const [sendModalType, setSendModalType] = useState(null);

  const actions = attendee
    ? [
        {
          type: "whatsapp",
          icon: "💬",
          label: "WhatsApp",
          desc: `Send WhatsApp message to ${attendee.name || "this attendee"}`,
        },
        {
          type: "email",
          icon: "✉️",
          label: "Email",
          desc: `Send email to ${attendee.name || "this attendee"}`,
        },
        {
          type: "sms",
          icon: "📱",
          label: "SMS",
          desc: `Send SMS to ${attendee.name || "this attendee"}`,
        },
      ]
    : [
        {
          type: "whatsapp",
          icon: "💬",
          label: "WhatsApp Blast",
          desc: "Send WhatsApp message to all registrants",
        },
        {
          type: "email",
          icon: "✉️",
          label: "Email Blast",
          desc: "Send email to all registrants",
        },
        {
          type: "sms",
          icon: "📱",
          label: "SMS Blast",
          desc: "Send SMS to all registrants",
        },
      ];

  if (sendModalType) {
    return (
      <SendCommunicationModal
        show={true}
        initialType={sendModalType}
        onHide={() => {
          setSendModalType(null);
        }}
        eventId={eventId}
        attendees={attendee ? [attendee] : allAttendees}
        onSuccess={() => {
          setSendModalType(null);
          onClose();
        }}
      />
    );
  }

  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-sheet" style={{ maxWidth: 380 }}>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="fw-bold mb-0">
            {attendee ? "Message attendee" : "Send"}
          </h5>
          <button type="button" className="btn-close" onClick={onClose} />
        </div>
        {actions.map(({ type, icon, label, desc }) => (
          <button
            key={type}
            type="button"
            onClick={() => setSendModalType(type)}
            className="d-flex align-items-center gap-3 p-2 rounded mb-2 bg-light w-100 border-0"
            style={{ cursor: "pointer", transition: "all 0.2s" }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f0f0f0"}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#f8f9fa"}
          >
            <span style={{ fontSize: 24 }}>{icon}</span>
            <div className="text-start flex-grow-1">
              <div className="fw-semibold small">{label}</div>
              <div className="text-muted" style={{ fontSize: 11 }}>
                {desc}
              </div>
            </div>
            <span className="badge bg-primary ms-auto">Ready</span>
          </button>
        ))}
      </div>
    </div>
  );
};

// ── Edit Attendee Modal ───────────────────────────────────────────────────────

const EditModal = ({ attendee, eventCats, onSave, onClose, title = "Edit Registrant", saveLabel = "Save Changes" }) => {
  const [form, setForm] = useState({
    name: attendee.name,
    phone: attendee.phone,
    email: attendee.email,
    category: attendee.category,
    organization: attendee.organization,
  });

  const [errors, setErrors] = useState({});

  const handleSave = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Name is required.";
    if (form.phone && !validatePhone(form.phone)) errs.phone = "Enter the correct number of digits for the selected country code.";
    if (form.email && !validateEmail(form.email)) errs.email = "Invalid email address.";
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    onSave(form);
  };

  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-sheet" style={{ maxWidth: 440 }}>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="fw-bold mb-0">{title}</h5>
          <button type="button" className="btn-close" onClick={onClose} />
        </div>
        <div className="row g-2">
          {/* Name */}
          <div className="col-12 col-sm-6">
            <label className="form-label small fw-semibold mb-1">Name *</label>
            <input
              type="text"
              className={`form-control form-control-sm ${errors.name ? "is-invalid" : ""}`}
              value={form.name}
              onChange={(e) => { setForm((p) => ({ ...p, name: e.target.value })); setErrors((p) => ({ ...p, name: "" })); }}
            />
            {errors.name && <div className="invalid-feedback">{errors.name}</div>}
          </div>

          {/* Phone with country code */}
          <div className="col-12 col-sm-6">
            <label className="form-label small fw-semibold mb-1">Phone</label>
            <PhoneInput
              value={form.phone}
              isInvalid={!!errors.phone}
              onChange={(val) => { setForm((p) => ({ ...p, phone: val })); setErrors((p) => ({ ...p, phone: "" })); }}
            />
            {errors.phone && <div className="text-danger" style={{ fontSize: "0.75em", marginTop: 4 }}>{errors.phone}</div>}
          </div>

          {/* Email */}
          <div className="col-12 col-sm-6">
            <label className="form-label small fw-semibold mb-1">Email</label>
            <input
              type="email"
              className={`form-control form-control-sm ${errors.email ? "is-invalid" : ""}`}
              value={form.email}
              onChange={(e) => { setForm((p) => ({ ...p, email: e.target.value })); setErrors((p) => ({ ...p, email: "" })); }}
            />
            {errors.email && <div className="invalid-feedback">{errors.email}</div>}
          </div>

          {/* Organization */}
          <div className="col-12 col-sm-6">
            <label className="form-label small fw-semibold mb-1">Organization</label>
            <input
              type="text"
              className="form-control form-control-sm"
              value={form.organization}
              onChange={(e) => setForm((p) => ({ ...p, organization: e.target.value }))}
            />
          </div>
          <div className="col-12">
            <label className="form-label small fw-semibold mb-1">
              Category
            </label>
            <select
              className="form-select form-select-sm"
              value={form.category}
              onChange={(e) =>
                setForm((p) => ({ ...p, category: e.target.value }))
              }
            >
              <option value="">— None —</option>
              {(eventCats?.length > 0 ? eventCats.map((c) => ({ name: c.label, color: c.color })) : DEFAULT_CATEGORIES).map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="d-flex gap-2 justify-content-end mt-3">
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={handleSave}
          >
            {saveLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Pass View Modal ───────────────────────────────────────────────────────────

const PASS_PREVIEW_W = 280;

const DEFAULT_PASS_LAYOUT = {
  headerTitle: {
    x: 18,
    y: 20,
    w: 320,
    h: 26,
    fontSize: 19,
    fontWeight: "700",
    fontStyle: "normal",
    fontFamily: "Segoe UI",
    color: "var(--card)",
  },
  headerSub: {
    x: 18,
    y: 52,
    w: 320,
    h: 18,
    fontSize: 13,
    fontWeight: "400",
    fontStyle: "normal",
    fontFamily: "Segoe UI",
    color: "rgba(255,255,255,0.82)",
  },
  headerBrand: {
    x: 330,
    y: 20,
    w: 80,
    h: 14,
    fontSize: 11,
    fontWeight: "400",
    fontStyle: "normal",
    fontFamily: "Segoe UI",
    color: "rgba(255,255,255,0.55)",
  },
  logo: { x: 330, y: 8, w: 72, h: 72, opacity: 1, src: null },
  categoryBadge: { x: 18, y: 120, w: 116, h: 28 },
  name: {
    x: 18,
    y: 160,
    w: 385,
    h: 34,
    fontSize: 24,
    fontWeight: "700",
    fontStyle: "normal",
    fontFamily: "Segoe UI",
    color: "#0f172a",
  },
  organization: {
    x: 18,
    y: 204,
    w: 385,
    h: 22,
    fontSize: 13,
    fontWeight: "400",
    fontStyle: "normal",
    fontFamily: "Segoe UI",
    color: "var(--foreground)",
  },
  phone: {
    x: 18,
    y: 230,
    w: 385,
    h: 22,
    fontSize: 13,
    fontWeight: "400",
    fontStyle: "normal",
    fontFamily: "Segoe UI",
    color: "var(--foreground)",
  },
  email: {
    x: 18,
    y: 256,
    w: 385,
    h: 22,
    fontSize: 13,
    fontWeight: "400",
    fontStyle: "normal",
    fontFamily: "Segoe UI",
    color: "var(--foreground)",
  },
  qr: { x: 135, y: 460, w: 150, h: 150 },
};

const PassViewModal = ({ attendee, event, onClose }) => {
  const [qrSrc, setQrSrc] = useState(null);

  // Check if using new elements-based design
  const fullDesign = event?.passDesign || {};
  const isNewDesign = fullDesign.elements && Array.isArray(fullDesign.elements);

  // Pick category-specific design if saved
  const catDesigns = fullDesign.categoryDesigns || {};
  const categoryDesign = catDesigns[attendee.category] || catDesigns["Default"];

  // Use new format if available
  const canvas = categoryDesign?.canvas || fullDesign.canvas || { width: 420, height: 640, background: "var(--card)" };
  const elements = categoryDesign?.elements || fullDesign.elements || [];

  // For backward compatibility with old format
  const design = categoryDesign || fullDesign;

  const passW = canvas.width;
  const passH = canvas.height;
  const S = PASS_PREVIEW_W / passW;
  const previewH = Math.round(passH * S);

  // Old format fallback values
  const primaryColor = design.primaryColor || "var(--primary)";
  const headerColor = design.headerColor || primaryColor;
  const qrColor = design.qrColor || "#000000";
  const bgColor = design.bgColor || canvas.background || "var(--card)";
  const bgImage = design.bgImage || null;
  const bgOpacity = design.bgOpacity ?? 60;
  const bgFit = design.bgFit || "cover";
  const bgPosX = design.bgPosX ?? 50;
  const bgPosY = design.bgPosY ?? 50;
  const showHeader = design.showHeader !== false;
  const headerHeight = design.headerHeight || 108;
  const headerConfig = design.headerConfig || {};
  const layout = { ...DEFAULT_PASS_LAYOUT, ...(design.layout || {}) };

  const eventCats = (event?.categories || []).filter((c) => c.enabled !== false);
  const catColor =
    eventCats.find((c) => c.label?.toLowerCase() === (attendee.category || "").toLowerCase())?.color ||
    DEFAULT_CATEGORIES.find((c) => c.name.toLowerCase() === (attendee.category || "").toLowerCase())?.color ||
    primaryColor;

  // Generate real QR code
  useEffect(() => {
    let active = true;
    const qr = new QRCodeStyling({
      width: 240,
      height: 240,
      type: "canvas",
      data: attendee.passId || "PASS",
      dotsOptions: { color: qrColor, type: "square" },
      backgroundOptions: { color: "var(--card)" },
      qrOptions: { errorCorrectionLevel: "M" },
    });
    qr.getRawData("png")
      .then((blob) => {
        if (!active) return;
        const url = URL.createObjectURL(blob);
        setQrSrc((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return url;
        });
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [attendee.passId, qrColor]);

  const passRadius = design.passRadius ?? 14;
  const bgSizeCSS = bgFit === "stretch" ? "100% 100%" : bgFit;
  const bgPosCSS = `${bgPosX}% ${bgPosY}%`;

  const elStyle = (el, defSize, defWeight, defColor) => ({
    fontWeight: el?.fontWeight || defWeight,
    fontSize: (el?.fontSize || defSize) * S,
    fontStyle: el?.fontStyle || "normal",
    fontFamily: `"${el?.fontFamily || "Segoe UI"}", Arial, sans-serif`,
    color: el?.color || defColor,
    whiteSpace: "nowrap",
  });

  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-sheet" style={{ maxWidth: PASS_PREVIEW_W + 60 }}>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h6 className="fw-bold mb-0">Pass Preview</h6>
            <small className="text-muted">
              {attendee.name}
              {attendee.category && (
                <span style={{ color: catColor }}> · {attendee.category}</span>
              )}
            </small>
          </div>
          <button type="button" className="btn-close" onClick={onClose} />
        </div>

        <div
          style={{
            position: "relative",
            width: PASS_PREVIEW_W,
            height: previewH,
            margin: "0 auto",
            borderRadius: passRadius * S,
            overflow: "hidden",
            boxShadow: "0 8px 32px rgba(0,0,0,0.16)",
          }}
        >
          {/* Background */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: bgColor,
              backgroundImage: bgImage ? `url(${bgImage})` : undefined,
              backgroundSize: bgSizeCSS,
              backgroundPosition: bgPosCSS,
              backgroundRepeat: "no-repeat",
            }}
          />
          {bgImage && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: `rgba(255,255,255,${(100 - bgOpacity) / 100})`,
              }}
            />
          )}
          {/* Border */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              border: `${2.5 * S}px solid ${primaryColor}`,
              borderRadius: passRadius * S,
              pointerEvents: "none",
              zIndex: 10,
            }}
          />

          {/* New elements-based design */}
          {isNewDesign && elements.length > 0 && (
            <>
              {elements.map((el) => {
                const substitute = (str) =>
                  (str || "")
                    .replace(/\{\{name\}\}/g, attendee.name || "")
                    .replace(/\{\{email\}\}/g, attendee.email || "")
                    .replace(/\{\{phone\}\}/g, attendee.phone || "")
                    .replace(/\{\{passId\}\}/g, attendee.passId || "")
                    .replace(/\{\{category\}\}/g, attendee.category || "")
                    .replace(/\{\{eventName\}\}/g, event?.eventName || "")
                    .replace(/\{\{venue\}\}/g, event?.venue || "")
                    .replace(/\{\{startDate\}\}/g, event?.startDate || "")
                    .replace(/\{\{endDate\}\}/g, event?.endDate || "");

                const isText = ["text", "header", "footer", "card"].includes(el.type);
                const isMedia = ["image", "logo"].includes(el.type);

                return (
                  <div
                    key={el.id}
                    style={{
                      position: "absolute",
                      left: el.x * S,
                      top: el.y * S,
                      width: el.w * S,
                      height: el.h * S,
                      zIndex: el.zIndex || 1,
                      background: el.bg || "transparent",
                      borderRadius: (el.borderRadius || 0) * S,
                      border:
                        (el.borderWidth || 0) > 0
                          ? `${el.borderWidth * S}px ${el.borderStyle} ${el.borderColor}`
                          : "none",
                      overflow: "hidden",
                      opacity: el.opacity ?? 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: el.textAlign === "center" ? "center" : el.textAlign === "right" ? "flex-end" : "flex-start",
                      padding: `${el.paddingY * S}px ${el.paddingX * S}px`,
                      boxSizing: "border-box",
                    }}
                  >
                    {isText && (
                      <div
                        style={{
                          fontSize: el.fontSize * S,
                          fontWeight: el.fontWeight,
                          fontFamily: el.fontFamily,
                          fontStyle: el.fontStyle,
                          textDecoration: el.textDecoration,
                          color: el.color,
                          textAlign: el.textAlign,
                          lineHeight: el.lineHeight,
                          width: "100%",
                          height: "100%",
                          display: "flex",
                          alignItems: "center",
                          whiteSpace: "pre-wrap",
                          wordBreak: "break-word",
                        }}
                      >
                        {substitute(el.content)}
                      </div>
                    )}
                    {el.type === "qr" && qrSrc && (
                      <img src={qrSrc} alt="QR" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                    )}
                    {isMedia && el.imageUrl && (
                      <img src={el.imageUrl} alt={el.label} style={{ width: "100%", height: "100%", objectFit: el.objectFit || "cover" }} />
                    )}
                  </div>
                );
              })}
            </>
          )}

          {/* Old layout-based design (fallback) */}
          {!isNewDesign && showHeader && (
            <>
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: headerHeight * S,
                  background: headerColor,
                  zIndex: 2,
                }}
              />
              {layout.headerTitle?.visible !== false && (
                <div
                  style={{
                    position: "absolute",
                    left: (layout.headerTitle?.x || 18) * S,
                    top: (layout.headerTitle?.y || 20) * S,
                    zIndex: 3,
                    ...elStyle(layout.headerTitle, 19, "700", "var(--card)"),
                    overflow: "hidden",
                    maxWidth: (passW - (layout.headerTitle?.x || 18)) * S,
                  }}
                >
                  {headerConfig.customTitle || event?.eventName || "Event"}
                </div>
              )}
              {headerConfig.showDates !== false && layout.headerSub?.visible !== false && (
                <div
                  style={{
                    position: "absolute",
                    left: (layout.headerSub?.x || 18) * S,
                    top: (layout.headerSub?.y || 52) * S,
                    zIndex: 3,
                    ...elStyle(layout.headerSub, 13, "400", "rgba(255,255,255,0.82)"),
                  }}
                >
                  {[
                    event?.startDate,
                    event?.endDate && `– ${event.endDate}`,
                    headerConfig.showVenue !== false && event?.venue,
                  ]
                    .filter(Boolean)
                    .join("  ")}
                </div>
              )}
              {layout.headerBrand?.visible !== false && (
                <div
                  style={{
                    position: "absolute",
                    left: (layout.headerBrand?.x || 330) * S,
                    top: (layout.headerBrand?.y || 20) * S,
                    zIndex: 3,
                    ...elStyle(layout.headerBrand, 11, "400", "rgba(255,255,255,0.55)"),
                  }}
                >
                  {headerConfig.brandText || "KnowVato"}
                </div>
              )}
              {layout.logo?.src && layout.logo?.visible !== false && (
                <img
                  src={layout.logo.src}
                  alt="Logo"
                  style={{
                    position: "absolute",
                    zIndex: 5,
                    left: layout.logo.x * S,
                    top: layout.logo.y * S,
                    width: layout.logo.w * S,
                    height: layout.logo.h * S,
                    objectFit: "contain",
                    opacity: layout.logo.opacity ?? 1,
                  }}
                />
              )}
            </>
          )}

          {/* Category badge */}
          {!isNewDesign && layout.categoryBadge?.visible !== false && (
            <div
              style={{
                position: "absolute",
                zIndex: 3,
                left: layout.categoryBadge.x * S,
                top: layout.categoryBadge.y * S,
                width: layout.categoryBadge.w * S,
                height: layout.categoryBadge.h * S,
                background: catColor,
                color: "var(--card)",
                borderRadius: (layout.categoryBadge.h / 2) * S,
                fontSize: (layout.categoryBadge.fontSize || 11) * S,
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                whiteSpace: "nowrap",
              }}
            >
              {attendee.category || "General"}
            </div>
          )}

          {/* Name */}
          {!isNewDesign && layout.name?.visible !== false && (
            <div
              style={{
                position: "absolute",
                zIndex: 3,
                left: layout.name.x * S,
                top: layout.name.y * S,
                ...elStyle(layout.name, 24, "700", "#0f172a"),
                overflow: "hidden",
                maxWidth: (passW - layout.name.x) * S,
              }}
            >
              {attendee.name || "—"}
            </div>
          )}
          {!isNewDesign && attendee.organization && layout.organization?.visible !== false && (
            <div
              style={{
                position: "absolute",
                zIndex: 3,
                left: layout.organization.x * S,
                top: layout.organization.y * S,
                ...elStyle(layout.organization, 13, "400", "var(--foreground)"),
              }}
            >
              ⊞ {attendee.organization}
            </div>
          )}
          {!isNewDesign && attendee.phone && layout.phone?.visible !== false && (
            <div
              style={{
                position: "absolute",
                zIndex: 3,
                left: layout.phone.x * S,
                top: layout.phone.y * S,
                ...elStyle(layout.phone, 13, "400", "var(--foreground)"),
              }}
            >
              ◉ {attendee.phone}
            </div>
          )}
          {!isNewDesign && attendee.email && layout.email?.visible !== false && (
            <div
              style={{
                position: "absolute",
                zIndex: 3,
                left: layout.email.x * S,
                top: layout.email.y * S,
                ...elStyle(layout.email, 13, "400", "var(--foreground)"),
              }}
            >
              ✉ {attendee.email}
            </div>
          )}

          {/* Custom images */}
          {!isNewDesign && Object.entries(layout)
            .filter(([k]) => k.startsWith("ci_"))
            .map(([k, el]) =>
              el.src && el.visible !== false ? (
                <img
                  key={k}
                  src={el.src}
                  alt="Custom"
                  style={{
                    position: "absolute",
                    zIndex: 3,
                    left: el.x * S,
                    top: el.y * S,
                    width: el.w * S,
                    height: el.h * S,
                    objectFit: "contain",
                    opacity: el.opacity ?? 1,
                  }}
                />
              ) : null,
            )}
          {/* Custom texts */}
          {!isNewDesign && Object.entries(layout)
            .filter(([k]) => k.startsWith("ct_"))
            .map(([k, el]) =>
              el.visible !== false ? (
                <div
                  key={k}
                  style={{
                    position: "absolute",
                    zIndex: 3,
                    left: el.x * S,
                    top: el.y * S,
                    ...elStyle(el, 14, "400", "var(--foreground)"),
                    opacity: el.opacity ?? 1,
                  }}
                >
                  {el.content || ""}
                </div>
              ) : null,
            )}

          {/* QR divider + QR */}
          {!isNewDesign && layout.qr?.visible !== false && (
            <>
              <div
                style={{
                  position: "absolute",
                  top: (layout.qr.y - 12) * S,
                  left: 18 * S,
                  right: 18 * S,
                  height: 1,
                  background: "var(--border)",
                  zIndex: 1,
                }}
              />
              <div
                style={{
                  position: "absolute",
                  zIndex: 3,
                  left: layout.qr.x * S,
                  top: layout.qr.y * S,
                  width: layout.qr.w * S,
                  height: layout.qr.h * S,
                  background: "var(--border)",
                  borderRadius: 8 * S,
                  overflow: "hidden",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {qrSrc ? (
                  <img
                    src={qrSrc}
                    alt="QR"
                    style={{ width: "100%", height: "100%", objectFit: "contain" }}
                  />
                ) : (
                  <span style={{ fontSize: 8 * S, color: "var(--muted-foreground)" }}>
                    Generating…
                  </span>
                )}
              </div>
            </>
          )}

          {/* Pass ID */}
          <div
            style={{
              position: "absolute",
              bottom: 6 * S,
              left: 0,
              right: 0,
              textAlign: "center",
              fontSize: 8 * S,
              color: "var(--muted-foreground)",
              fontFamily: "monospace",
              zIndex: 1,
            }}
          >
            {attendee.passId}
          </div>
        </div>

        <p
          className="text-muted text-center mt-3 mb-0"
          style={{ fontSize: 11 }}
        >
          Pass ID: <code>{attendee.passId}</code>
        </p>
      </div>
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────

const EventAttendeesPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { events, attendees, addSingleAttendee, addAttendees, updateAttendee, deleteAttendee, setSelectedEventId } =
    useEventData();

  // Tell the context which event is active so it fetches attendees
  useEffect(() => {
    if (eventId) setSelectedEventId(eventId);
  }, [eventId, setSelectedEventId]);

  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("");
  const [filterPass, setFilterPass] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useRef(null);
  const [showImport, setShowImport] = useState(false);

  useEffect(() => {
    if (!filterOpen) return;
    const handler = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) setFilterOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [filterOpen]);
  const [showComm, setShowComm] = useState(false);
  const [commTarget, setCommTarget] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [passPreviewTarget, setPassPreviewTarget] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const selectedEvent = useMemo(
    () =>
      events.find((e) => e.id === Number(eventId) || e.id === eventId) || null,
    [events, eventId],
  );

  const eventAttendees = useMemo(
    () => attendees.filter((a) => a.eventId === selectedEvent?.id),
    [attendees, selectedEvent],
  );

  // Active categories configured for this event
  const eventCats = useMemo(
    () => (selectedEvent?.categories || []).filter((c) => c.enabled === true),
    [selectedEvent],
  );

  const isPast = !!selectedEvent?.endDate &&
    selectedEvent.endDate < new Date().toISOString().split("T")[0];

  // Dynamic column visibility based on event field settings
  const showPhone = useMemo(() => {
    const fields = selectedEvent?.attendeeFields;
    if (!fields?.length) return true;
    const f = fields.find((f) => f.fieldId === "mobile");
    return f ? f.enabled !== false : true;
  }, [selectedEvent]);

  const showEmail = useMemo(() => {
    const fields = selectedEvent?.attendeeFields;
    if (!fields?.length) return true;
    const f = fields.find((f) => f.fieldId === "email");
    return f ? f.enabled !== false : true;
  }, [selectedEvent]);

  const showCat = useMemo(() => eventCats.length > 0, [eventCats]);

  const showOrg = useMemo(() => {
    const fields = selectedEvent?.attendeeFields;
    if (!fields?.length) return false;
    return fields.some(
      (f) => normalizeKey(f.label) === "organization" && f.enabled === true,
    );
  }, [selectedEvent]);

  const getCatColor = (name) => {
    const evtCat = eventCats.find((c) => c.label?.toLowerCase() === name?.toLowerCase());
    if (evtCat?.color) return evtCat.color;
    return DEFAULT_CATEGORIES.find((c) => c.name.toLowerCase() === name?.toLowerCase())?.color || "var(--muted-foreground)";
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    const designSaved = selectedEvent?.passDesignSaved;
    return eventAttendees.filter((a) => {
      if (filterCat && a.category !== filterCat) return false;
      const hasPass = designSaved || a.passGenerated;
      if (filterPass === "generated" && !hasPass) return false;
      if (filterPass === "not-generated" && hasPass) return false;
      if (
        q &&
        !`${a.name} ${a.phone} ${a.email} ${a.organization}`
          .toLowerCase()
          .includes(q)
      )
        return false;
      return true;
    });
  }, [eventAttendees, search, filterCat, filterPass, selectedEvent]);

  const handleImported = async (list) => {
    if (!selectedEvent?.id) return;
    try {
      await addAttendees(selectedEvent.id, list);
      toast.success(`${list.length} registrants imported.`);
      setShowImport(false);
    } catch (err) {
      toast.error(err.message || "Failed to import registrants.");
    }
  };

  const handleDelete = (a) => {
    if (!window.confirm(`Remove "${a.name}"?`)) return;
    deleteAttendee(a.id);
    toast.success("Registrant removed.");
  };

  const handleEditSave = async (data) => {
    try {
      await updateAttendee(editTarget.id, data, editTarget);
      toast.success("Registrant updated.");
      setEditTarget(null);
    } catch (err) {
      toast.error(err.message || "Failed to update registrant.");
    }
  };

  const handleAddSave = async (data) => {
    try {
      await addSingleAttendee(selectedEvent.id, data);
      toast.success("Registrant added.");
      setShowAddModal(false);
    } catch (err) {
      toast.error(err.message || "Failed to add registrant.");
    }
  };

  const passGeneratedCount = eventAttendees.filter(
    (a) => a.passGenerated,
  ).length;

  if (!selectedEvent) {
    return (
      <div className="container-fluid p-2 fade-in">
        <div className="card border-0 shadow-sm">
          <div className="card-body text-center py-5">
            <p className="text-muted mb-3">
              Event not found. Go to Create Event and click "Upload Data".
            </p>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => navigate("/events")}
            >
              Go to Create Event
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid p-2 fade-in">
      {/* Header */}
      <div className="card border-0 shadow-sm mb-3">
        <div className="card-body p-3">
          <nav aria-label="breadcrumb" className="mb-2">
            <ol className="breadcrumb mb-0 flex-nowrap" style={{ minWidth: 0 }}>
              <li className="breadcrumb-item flex-shrink-0">
                <button
                  type="button"
                  className="btn btn-link p-0"
                  style={{ fontSize: "inherit", lineHeight: "inherit", textDecoration: "none", whiteSpace: "nowrap" }}
                  onClick={() => navigate("/events")}
                >
                  Events
                </button>
              </li>
              <li
                className="breadcrumb-item active text-truncate"
                style={{ minWidth: 0, maxWidth: "100%" }}
              >
                {selectedEvent.eventName} — Upload Data
              </li>
            </ol>
          </nav>

          {/* Row 1: Filter + Search + Count + Action buttons */}
          <div className="d-flex gap-2 align-items-center mb-2">
            <div className="position-relative" ref={filterRef}>
              <button
                type="button"
                className={"btn btn-sm " + ((filterCat || filterPass) ? "btn-primary" : "btn-outline-secondary")}
                onClick={() => setFilterOpen((o) => !o)}
              >
                <i className="bi bi-funnel me-1" />
                Filter
                {(filterCat || filterPass) && (
                  <span className="badge bg-white text-primary ms-1" style={{ fontSize: 10 }}>
                    {[filterCat, filterPass].filter(Boolean).length}
                  </span>
                )}
              </button>
              {filterOpen && (
                <div className="card border-0 shadow" style={{ position: "absolute", top: "calc(100% + 6px)", left: 0, zIndex: 999, minWidth: 240, padding: "0.85rem" }}>
                  <div className="mb-2">
                    <label className="form-label small fw-semibold mb-1">Category</label>
                    <select className="form-select form-select-sm" value={filterCat} onChange={(e) => setFilterCat(e.target.value)}>
                      <option value="">All Categories</option>
                      {(eventCats.length > 0 ? eventCats.map((c) => c.label) : DEFAULT_CATEGORIES.map((c) => c.name)).map((name) => (
                        <option key={name} value={name}>{name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold mb-1">Pass Status</label>
                    <select className="form-select form-select-sm" value={filterPass} onChange={(e) => setFilterPass(e.target.value)}>
                      <option value="">All</option>
                      <option value="generated">Generated</option>
                      <option value="not-generated">Not Generated</option>
                    </select>
                  </div>
                  <button type="button" className="btn btn-sm btn-outline-secondary w-100"
                    onClick={() => { setFilterCat(""); setFilterPass(""); setFilterOpen(false); }}>
                    Clear Filters
                  </button>
                </div>
              )}
            </div>

            <div className="position-relative" style={{ width: "300px" }}>
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Search name, phone, email…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ paddingRight: "2rem" }}
              />
              <i className="bi bi-search text-muted" style={{ position: "absolute", right: "0.6rem", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", fontSize: 13 }} />
            </div>

            <span className="text-muted small text-nowrap">{filtered.length}/{eventAttendees.length}</span>

            {/* Spacer to push buttons to the right */}
            <div style={{ flex: 1 }}></div>

            {/* Action buttons aligned right */}
            <button
              type="button"
              className={`btn btn-sm ${showComm ? "btn-primary" : "btn-outline-secondary"}`}
              onClick={() => { setCommTarget(null); setShowComm(true); }}
            >
              <i className="bi bi-send me-1" /> Send
            </button>
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm"
              onClick={() => navigate(`/events/${eventId}/upload/generatepass`)}
              disabled={isPast || eventAttendees.length === 0}
              title={isPast ? "Event has ended — pass generation is locked" : undefined}
            >
              <i className="bi bi-qr-code-scan me-1" /> Generate Pass
              {selectedEvent?.passDesignSaved && (
                <i className="bi bi-check-circle-fill ms-1" style={{ color: "var(--success)", fontSize: 12 }} />
              )}
            </button>
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary"
              onClick={() => setShowAddModal(true)}
              disabled={isPast}
            >
              <i className="bi bi-person-plus me-1" /> Add
            </button>
            <button
              type="button"
              className={`btn btn-sm ${showImport ? "btn-primary" : "btn-outline-secondary"}`}
              onClick={() => setShowImport(true)}
              disabled={isPast}
            >
              <i className="bi bi-cloud-upload me-1" /> Import
            </button>
          </div>
        </div>
      </div>

      {/* Desktop table */}
      <div className="card border-0 shadow-sm d-none d-md-block">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table
              className="table table-hover align-middle mb-0"
              style={{ fontSize: 13 }}
            >
              <thead className="table-light">
                <tr>
                  <th style={{ width: 36 }}>#</th>
                  <th>Name</th>
                  {showPhone && <th>Phone</th>}
                  {showEmail && <th>Email</th>}
                  {showCat && <th>Category</th>}
                  {showOrg && <th>Organization</th>}
                  <th>Pass</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={4 + (showPhone ? 1 : 0) + (showEmail ? 1 : 0) + (showCat ? 1 : 0) + (showOrg ? 1 : 0)} className="text-center py-5 text-muted">
                      {eventAttendees.length === 0
                        ? "No registrants yet. Click Import to upload data."
                        : "No results match your filter."}
                    </td>
                  </tr>
                ) : (
                  filtered.map((a, i) => {
                    const st = STATUS_MAP[a.status] || STATUS_MAP.registered;
                    return (
                      <tr key={a.id}>
                        <td className="text-muted">{i + 1}</td>
                        <td className="fw-semibold">{a.name || "—"}</td>
                        {showPhone && <td>{a.phone || "—"}</td>}
                        {showEmail && (
                          <td className="text-truncate" style={{ maxWidth: 160 }}>
                            {a.email || "—"}
                          </td>
                        )}
                        {showCat && (
                          <td>
                            {a.category ? (
                              <span
                                className="badge"
                                style={{ background: getCatColor(a.category), color: "#fff" }}
                              >
                                {a.category}
                              </span>
                            ) : "—"}
                          </td>
                        )}
                        {showOrg && <td>{a.organization || "—"}</td>}
                        <td>
                          {(selectedEvent?.passDesignSaved || a.passGenerated) ? (
                            <i
                              className="bi bi-eyeglasses"
                              style={{ cursor: "pointer", fontSize: 16, color: a.passGenerated ? "var(--success)" : "#343a40" }}
                              title="Click to preview pass"
                              onClick={() => setPassPreviewTarget(a)}
                            />
                          ) : (
                            <span className="text-muted small">—</span>
                          )}
                        </td>
                        <td className="text-center">
                          <div className="d-flex gap-2 justify-content-center">
                            <i
                              className="bi bi-chat"
                              title="Message attendee"
                              style={{ cursor: "pointer", fontSize: 15, color: "#343a40" }}
                              onClick={() => { setCommTarget(a); setShowComm(true); }}
                            />
                            {!isPast && (
                              <>
                                <i
                                  className="bi bi-pencil"
                                  title="Edit"
                                  style={{ cursor: "pointer", fontSize: 15, color: "#343a40" }}
                                  onClick={() => setEditTarget(a)}
                                />
                                <i
                                  className="bi bi-trash"
                                  title="Delete"
                                  style={{ cursor: "pointer", fontSize: 15, color: "var(--destructive)" }}
                                  onClick={() => handleDelete(a)}
                                />
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Mobile cards */}
      <div className="d-md-none">
        {filtered.length === 0 ? (
          <div className="text-center py-5 text-muted">
            {eventAttendees.length === 0
              ? "No registrants yet. Tap Import."
              : "No results match."}
          </div>
        ) : (
          filtered.map((a) => {
            const st = STATUS_MAP[a.status] || STATUS_MAP.registered;
            return (
              <div key={a.id} className="card border-0 shadow-sm mb-2">
                <div className="card-body p-3">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div>
                      <div className="fw-bold">{a.name || "—"}</div>
                      {a.organization && (
                        <div className="text-muted small">{a.organization}</div>
                      )}
                    </div>
                    <div className="d-flex gap-1 align-items-center flex-wrap justify-content-end">
                      {(selectedEvent?.passDesignSaved || a.passGenerated) && (
                        <i
                          className="bi bi-eyeglasses"
                          title="Click to preview pass"
                          style={{ fontSize: 16, cursor: "pointer", color: a.passGenerated ? "var(--success)" : "#343a40" }}
                          onClick={() => setPassPreviewTarget(a)}
                        />
                      )}
                      {a.category && (
                        <span
                          className="badge"
                          style={{
                            background: getCatColor(a.category),
                            color: "var(--card)",
                            fontSize: 10,
                          }}
                        >
                          {a.category}
                        </span>
                      )}
                      <span
                        className={`badge ${st.cls}`}
                        style={{ fontSize: 10 }}
                      >
                        {st.label}
                      </span>
                    </div>
                  </div>
                  <div className="row g-1 small text-muted mb-2">
                    {a.phone && <div className="col-12">📞 {a.phone}</div>}
                    {a.email && <div className="col-12">✉ {a.email}</div>}
                    <div className="col-12" style={{ fontSize: 10 }}>
                      <code>{a.passId}</code>
                    </div>
                  </div>
                  <div className="d-flex gap-2 flex-wrap">
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-info flex-fill"
                      onClick={() => {
                        setCommTarget(a);
                        setShowComm(true);
                      }}
                    >
                      <i className="bi bi-chat me-1" /> Message
                    </button>
                    {!isPast && (
                      <>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-secondary flex-fill"
                          onClick={() => setEditTarget(a)}
                        >
                          <i className="bi bi-pencil me-1" /> Edit
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger flex-fill"
                          onClick={() => handleDelete(a)}
                        >
                          <i className="bi bi-trash" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modals */}
      {showAddModal && (
        <EditModal
          attendee={{ name: "", phone: "", email: "", category: "", organization: "" }}
          eventCats={eventCats}
          onSave={handleAddSave}
          onClose={() => setShowAddModal(false)}
          title="Add Registrant"
          saveLabel="Save"
        />
      )}
      {showImport && (
        <ImportModal
          eventId={selectedEvent.id}
          event={selectedEvent}
          existingAttendees={eventAttendees}
          onClose={() => setShowImport(false)}
          onImported={handleImported}
        />
      )}
      {showComm && (
        <CommModal
          attendee={commTarget}
          eventId={eventId}
          allAttendees={eventAttendees}
          onClose={() => {
            setCommTarget(null);
            setShowComm(false);
          }}
        />
      )}
      {editTarget && (
        <EditModal
          attendee={editTarget}
          eventCats={eventCats}
          onSave={handleEditSave}
          onClose={() => setEditTarget(null)}
        />
      )}
      {passPreviewTarget && (
        <PassViewModal
          attendee={passPreviewTarget}
          event={selectedEvent}
          onClose={() => setPassPreviewTarget(null)}
        />
      )}
    </div>
  );
};

export default EventAttendeesPage;
