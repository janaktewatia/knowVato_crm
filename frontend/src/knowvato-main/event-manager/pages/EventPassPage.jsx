import React, { useState, useMemo, useRef, useEffect, useCallback } from "react";
import * as XLSX from "xlsx";
import JSZip from "jszip";
import QRCodeStyling from "qr-code-styling";
import { toast } from "react-toastify";
import { useEventData } from "../context/EventDataContext";
import {
  FiDownload, FiChevronLeft, FiChevronRight, FiPlus, FiTrash2, FiUpload,
} from "react-icons/fi";
import { BiPalette, BiDownload } from "react-icons/bi";

// Maps content type id → display field labels
const CT_FIELDS = {
  url: ["URL"],
  whatsapp: ["Mobile Number", "Message"],
  email: ["Email", "Subject", "Message"],
  vcard: ["Name", "Phone", "Email", "Job Title", "Company", "Website", "Address"],
};

const DEFAULT_CATEGORIES = [
  { id: 1, name: "VIP", color: "var(--warning)" },
  { id: 2, name: "General", color: "var(--info)" },
  { id: 3, name: "Staff", color: "var(--success)" },
  { id: 4, name: "Speaker", color: "#8B5CF6" },
];

// Auto-map field index based on content type
const AUTO_MAP = {
  vcard: { name: 0, phone: 1, email: 2, title: 3, organization: 4 },
  whatsapp: { phone: 0 },
  email: { email: 0 },
};

// ─── Canvas helpers ──────────────────────────────────────────────────────────

const loadImage = (src) =>
  new Promise((res, rej) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => res(img);
    img.onerror = rej;
    img.src = src;
  });

const drawRoundedRect = (ctx, x, y, w, h, r, color) => {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  ctx.fill();
};

const drawRoundedRectStroke = (ctx, x, y, w, h, r, color, lw = 2) => {
  ctx.strokeStyle = color;
  ctx.lineWidth = lw;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  ctx.stroke();
};

const truncate = (str, n) =>
  str && str.length > n ? str.substring(0, n - 1) + "…" : str || "";

const generateQRBlob = async (data, color) => {
  const qr = new QRCodeStyling({
    width: 240,
    height: 240,
    type: "canvas",
    data: data || "PASS",
    dotsOptions: { color: color || "#000000", type: "square" },
    backgroundOptions: { color: "var(--card)" },
    qrOptions: { errorCorrectionLevel: "M" },
  });
  return await qr.getRawData("png");
};

const renderPassToCanvas = async (attendee, event, config) => {
  const W = 420, H = 640;
  const SCALE = 2;
  const canvas = document.createElement("canvas");
  canvas.width = W * SCALE;
  canvas.height = H * SCALE;
  const ctx = canvas.getContext("2d");
  ctx.scale(SCALE, SCALE);

  // Background
  if (config.bgImage) {
    try {
      const bgImg = await loadImage(config.bgImage);
      ctx.drawImage(bgImg, 0, 0, W, H);
      ctx.fillStyle = "rgba(255,255,255,0.82)";
      ctx.fillRect(0, 0, W, H);
    } catch {
      ctx.fillStyle = config.bgColor || "var(--card)";
      ctx.fillRect(0, 0, W, H);
    }
  } else {
    ctx.fillStyle = config.bgColor || "var(--card)";
    ctx.fillRect(0, 0, W, H);
  }

  // Border
  drawRoundedRectStroke(ctx, 1, 1, W - 2, H - 2, 14, config.primaryColor, 2.5);

  // Header band
  drawRoundedRect(ctx, 0, 0, W, 108, 14, config.primaryColor);
  // Fix bottom corners of header
  ctx.fillStyle = config.primaryColor;
  ctx.fillRect(0, 94, W, 14);

  // Event name
  ctx.fillStyle = "var(--card)";
  ctx.font = `bold 19px "Segoe UI", Arial, sans-serif`;
  ctx.fillText(truncate(event?.eventName || "Event", 38), 18, 38);

  ctx.font = `13px "Segoe UI", Arial, sans-serif`;
  ctx.fillStyle = "rgba(255,255,255,0.82)";
  const dateLine = [event?.startDate, event?.endDate && `– ${event.endDate}`, event?.venue]
    .filter(Boolean).join("  ");
  ctx.fillText(truncate(dateLine, 52), 18, 60);

  ctx.font = `11px "Segoe UI", Arial, sans-serif`;
  ctx.fillStyle = "rgba(255,255,255,0.55)";
  ctx.textAlign = "right";
  ctx.fillText("KnowVato", W - 16, 38);
  ctx.textAlign = "left";

  // Category badge
  const catColor = (() => {
    if (!attendee.category) return config.primaryColor;
    const found = (config.categories || []).find(
      (c) => c.name.toLowerCase() === attendee.category.toLowerCase(),
    );
    return found?.color || config.primaryColor;
  })();
  drawRoundedRect(ctx, 18, 118, 116, 28, 14, catColor);
  ctx.fillStyle = "var(--card)";
  ctx.font = `bold 12px "Segoe UI", Arial, sans-serif`;
  ctx.textAlign = "center";
  ctx.fillText(truncate(attendee.category || "General", 16), 76, 136);
  ctx.textAlign = "left";

  // Attendee Name
  ctx.fillStyle = "#0f172a";
  ctx.font = `bold 26px "Segoe UI", Arial, sans-serif`;
  const name = truncate(attendee.name || attendee.qrName || "—", 26);
  ctx.fillText(name, 18, 185);

  // Sub-fields
  const infoLines = [
    attendee.title && { icon: "◈", val: attendee.title },
    attendee.organization && { icon: "⊞", val: attendee.organization },
    attendee.phone && { icon: "◉", val: attendee.phone },
    attendee.email && { icon: "✉", val: attendee.email },
  ].filter(Boolean);

  ctx.font = `13px "Segoe UI", Arial, sans-serif`;
  ctx.fillStyle = "var(--foreground)";
  let infoY = 215;
  infoLines.forEach(({ icon, val }) => {
    ctx.fillText(`${icon}  ${truncate(val, 34)}`, 18, infoY);
    infoY += 24;
  });

  // Divider
  ctx.strokeStyle = "var(--border)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(18, H - 175);
  ctx.lineTo(W - 18, H - 175);
  ctx.stroke();

  // QR background box
  const qrBoxSize = 150;
  const qrX = (W - qrBoxSize) / 2;
  const qrY = H - 168;
  drawRoundedRect(ctx, qrX - 4, qrY - 4, qrBoxSize + 8, qrBoxSize + 8, 8, "var(--border)");

  // QR code image
  try {
    const qrBlob = await generateQRBlob(attendee.passId, config.primaryColor);
    const qrUrl = URL.createObjectURL(qrBlob);
    const qrImg = await loadImage(qrUrl);
    URL.revokeObjectURL(qrUrl);
    ctx.drawImage(qrImg, qrX, qrY, qrBoxSize, qrBoxSize);
  } catch {
    ctx.fillStyle = "var(--border)";
    ctx.fillRect(qrX, qrY, qrBoxSize, qrBoxSize);
    ctx.fillStyle = "var(--muted-foreground)";
    ctx.font = "11px monospace";
    ctx.textAlign = "center";
    ctx.fillText("QR Error", W / 2, qrY + qrBoxSize / 2);
    ctx.textAlign = "left";
  }

  // Pass ID
  ctx.fillStyle = "var(--muted-foreground)";
  ctx.font = `10px "Courier New", monospace`;
  ctx.textAlign = "center";
  ctx.fillText(truncate(attendee.passId, 40), W / 2, H - 12);
  ctx.textAlign = "left";

  return canvas;
};

// ─── Pass Preview (CSS render for display) ──────────────────────────────────

const PassPreview = ({ attendee, event, config, qrDataUrl }) => {
  if (!attendee) {
    return (
      <div
        className="pass-empty d-flex flex-column align-items-center justify-content-center"
        style={{ minHeight: 360 }}
      >
        <div className="text-muted">No attendee data.</div>
        <small className="text-muted">Select an event with imported rows.</small>
      </div>
    );
  }

  const catColor = (() => {
    if (!attendee.category) return config.primaryColor;
    const found = (config.categories || []).find(
      (c) => c.name.toLowerCase() === (attendee.category || "").toLowerCase(),
    );
    return found?.color || config.primaryColor;
  })();

  return (
    <div
      className="pass-card mx-auto"
      style={{
        background: config.bgColor || "var(--card)",
        backgroundImage: config.bgImage ? `url(${config.bgImage})` : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
        border: `2.5px solid ${config.primaryColor}`,
        borderRadius: 16,
        overflow: "hidden",
        width: 340,
        fontFamily: "'Segoe UI', Arial, sans-serif",
        boxShadow: "0 8px 32px rgba(0,0,0,0.14)",
        position: "relative",
      }}
    >
      {config.bgImage && (
        <div
          style={{
            position: "absolute", inset: 0,
            background: "rgba(255,255,255,0.82)",
            zIndex: 0,
          }}
        />
      )}
      <div style={{ position: "relative", zIndex: 1 }}>
        {/* Header */}
        <div
          style={{
            background: config.primaryColor,
            padding: "14px 16px 12px",
          }}
        >
          <div style={{ fontWeight: 700, fontSize: 15, color: "#fff" }}>
            {event?.eventName || "Event Name"}
          </div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.8)", marginTop: 3 }}>
            {[event?.startDate, event?.endDate && `– ${event.endDate}`, event?.venue]
              .filter(Boolean).join("  ")}
          </div>
          <div
            style={{
              position: "absolute", top: 10, right: 14,
              fontSize: 10, color: "rgba(255,255,255,0.5)",
            }}
          >
            KnowVato
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: "12px 16px" }}>
          {/* Category badge */}
          <span
            style={{
              display: "inline-block",
              background: catColor,
              color: "var(--card)",
              borderRadius: 12,
              padding: "3px 12px",
              fontSize: 11,
              fontWeight: 700,
              marginBottom: 10,
            }}
          >
            {attendee.category || "General"}
          </span>

          {/* Name */}
          <div style={{ fontWeight: 700, fontSize: 20, color: "#0f172a", marginBottom: 8 }}>
            {attendee.name || attendee.qrName || "—"}
          </div>

          {/* Info lines */}
          <div style={{ fontSize: 12, color: "var(--foreground)", lineHeight: 1.9 }}>
            {attendee.title && <div>◈&nbsp; {attendee.title}</div>}
            {attendee.organization && <div>⊞&nbsp; {attendee.organization}</div>}
            {attendee.phone && <div>◉&nbsp; {attendee.phone}</div>}
            {attendee.email && <div>✉&nbsp; {attendee.email}</div>}
          </div>

          {/* Divider */}
          <div style={{ borderTop: "1px solid var(--border)", margin: "12px 0" }} />

          {/* QR + Pass ID */}
          <div style={{ textAlign: "center" }}>
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt="Pass QR"
                style={{
                  width: 130, height: 130,
                  borderRadius: 8,
                  border: "1px solid var(--border)",
                  padding: 4,
                  background: "var(--card)",
                }}
              />
            ) : (
              <div
                style={{
                  width: 130, height: 130,
                  background: "var(--border)",
                  borderRadius: 8,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--muted-foreground)",
                  fontSize: 11,
                }}
              >
                Generating…
              </div>
            )}
            <div style={{ fontSize: 9, color: "var(--muted-foreground)", marginTop: 4, letterSpacing: 1 }}>
              {attendee.passId}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

const EventPassPage = () => {
  const { events, importedRows, selectedEventId, setSelectedEventId } = useEventData();

  const [fieldMap, setFieldMap] = useState({
    name: -1, phone: -1, email: -1, title: -1, organization: -1, category: -1,
  });
  const [primaryColor, setPrimaryColor] = useState("var(--primary)");
  const [bgColor, setBgColor] = useState("var(--card)");
  const [bgImage, setBgImage] = useState(null);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [newCatName, setNewCatName] = useState("");
  const [newCatColor, setNewCatColor] = useState("#6366F1");
  const [previewIndex, setPreviewIndex] = useState(0);
  const [previewQR, setPreviewQR] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const bgInputRef = useRef(null);

  const config = useMemo(
    () => ({ primaryColor, bgColor, bgImage, categories }),
    [primaryColor, bgColor, bgImage, categories],
  );

  // Rows for selected event
  const eventRows = useMemo(
    () => importedRows.filter((r) => r.eventId === selectedEventId && r.valid),
    [importedRows, selectedEventId],
  );

  const selectedEvent = useMemo(
    () => events.find((e) => e.id === selectedEventId) || null,
    [events, selectedEventId],
  );

  // Infer content type field labels from first row
  const contentType = eventRows[0]?.contentType || "vcard";
  const fieldLabels = CT_FIELDS[contentType] || [];

  // Auto-map fields when event changes
  useEffect(() => {
    const autoMap = AUTO_MAP[contentType] || {};
    setFieldMap({
      name: autoMap.name ?? -1,
      phone: autoMap.phone ?? -1,
      email: autoMap.email ?? -1,
      title: autoMap.title ?? -1,
      organization: autoMap.organization ?? -1,
      category: -1,
    });
    setPreviewIndex(0);
  }, [selectedEventId, contentType]);

  // Build attendee object from a row
  const buildAttendee = useCallback(
    (row) => {
      const get = (idx) =>
        idx >= 0 && row.display?.[idx] ? row.display[idx] : "";
      return {
        passId: row.id,
        qrName: row.qrName || "",
        name: get(fieldMap.name) || row.qrName || "",
        phone: get(fieldMap.phone),
        email: get(fieldMap.email),
        title: get(fieldMap.title),
        organization: get(fieldMap.organization),
        category: get(fieldMap.category),
      };
    },
    [fieldMap],
  );

  const currentRow = eventRows[previewIndex] || null;
  const currentAttendee = currentRow ? buildAttendee(currentRow) : null;

  // Generate preview QR
  useEffect(() => {
    if (!currentAttendee?.passId) { setPreviewQR(null); return; }
    let active = true;
    generateQRBlob(currentAttendee.passId, primaryColor).then((blob) => {
      if (!active) return;
      const url = URL.createObjectURL(blob);
      setPreviewQR(url);
    }).catch(() => setPreviewQR(null));
    return () => {
      active = false;
    };
  }, [currentAttendee?.passId, primaryColor]);

  const handleBgUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => setBgImage(ev.target.result);
    reader.readAsDataURL(file);
  };

  const downloadTemplate = () => {
    const headers = ["Name", "Phone", "Email", "Job Title", "Company", "Category", "QR Name"];
    const example = [
      ["Ravi Kumar", "+91 9876543210", "ravi@example.com", "Manager", "Infosys", "VIP", "PASS-001"],
      ["Priya Singh", "+91 9123456789", "priya@example.com", "Engineer", "TCS", "General", "PASS-002"],
    ];
    const ws = XLSX.utils.aoa_to_sheet([headers, ...example]);
    ws["!cols"] = headers.map(() => ({ wch: 18 }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Passes");
    XLSX.writeFile(wb, "event_pass_template.xlsx");
    toast.success("Template downloaded.");
  };

  const downloadAllPasses = async () => {
    if (!eventRows.length) {
      toast.error("No imported rows for this event.");
      return;
    }
    setIsGenerating(true);
    toast.info(`Generating ${eventRows.length} passes…`);
    try {
      const zip = new JSZip();
      for (let i = 0; i < eventRows.length; i++) {
        const row = eventRows[i];
        const attendee = buildAttendee(row);
        const canvas = await renderPassToCanvas(attendee, selectedEvent, config);
        const blob = await new Promise((res) => canvas.toBlob(res, "image/png"));
        const safe = (attendee.name || attendee.qrName || `pass-${i + 1}`)
          .replace(/[^a-z0-9-_ ]/gi, "").replace(/\s+/g, "-").substring(0, 80);
        zip.file(`${safe}.png`, blob);
      }
      const zipBlob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${selectedEvent?.eventName || "passes"}_passes.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success("All passes downloaded.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate passes.");
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadCurrentPass = async () => {
    if (!currentAttendee) return;
    try {
      const canvas = await renderPassToCanvas(currentAttendee, selectedEvent, config);
      const url = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = url;
      a.download = `${currentAttendee.name || "pass"}.png`;
      a.click();
    } catch {
      toast.error("Failed to download pass.");
    }
  };

  const addCategory = () => {
    if (!newCatName.trim()) return;
    setCategories((prev) => [
      ...prev,
      { id: Date.now(), name: newCatName.trim(), color: newCatColor },
    ]);
    setNewCatName("");
  };

  const removeCategory = (id) =>
    setCategories((prev) => prev.filter((c) => c.id !== id));

  const PASS_FIELDS = [
    { id: "name", label: "Name" },
    { id: "phone", label: "Phone" },
    { id: "email", label: "Email" },
    { id: "title", label: "Job Title" },
    { id: "organization", label: "Organization" },
    { id: "category", label: "Category" },
  ];

  return (
    <div className="container-fluid p-2 fade-in">
      {/* Header */}
      <div className="row mb-3">
        <div className="col-12">
          <div className="card border-0 shadow-sm rounded-5">
            <div className="card-body p-3">
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2">
                <div>
                  <nav aria-label="breadcrumb" className="mb-1">
                    <ol className="breadcrumb mb-0">
                      <li className="breadcrumb-item">
                        <span className="text-muted">Manage Event</span>
                      </li>
                      <li className="breadcrumb-item active">Event Pass</li>
                    </ol>
                  </nav>
                  <h2 className="fw-bold mb-0">Event Pass Designer</h2>
                  <p className="text-muted mb-0 small">
                    Design and generate passes for your attendees
                  </p>
                </div>
                <div className="d-flex gap-2">
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm"
                    onClick={downloadTemplate}
                  >
                    <BiDownload className="me-1" /> Download Template
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={downloadAllPasses}
                    disabled={isGenerating || !eventRows.length}
                  >
                    <FiDownload className="me-1" />
                    {isGenerating ? "Generating…" : `Download All (${eventRows.length})`}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-3">
        {/* ── Left: Config ── */}
        <div className="col-lg-5">
          {/* Event Selector */}
          <div className="card border-0 shadow-sm rounded-5 mb-3">
            <div className="card-body p-3">
              <label className="form-label fw-semibold mb-1">Select Event</label>
              <select
                className="form-select"
                value={selectedEventId || ""}
                onChange={(e) =>
                  setSelectedEventId(e.target.value ? Number(e.target.value) : null)
                }
              >
                <option value="">— Choose an event —</option>
                {events.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.eventName} — {ev.startDate}
                    {ev.importedCount ? ` (${ev.importedCount} rows)` : ""}
                  </option>
                ))}
              </select>
              {selectedEventId && !eventRows.length && (
                <div className="alert alert-warning mt-2 mb-0 small">
                  No valid imported rows for this event. Import data from Bulk QR Codes first.
                </div>
              )}
            </div>
          </div>

          {/* Field Mapping */}
          <div className="card border-0 shadow-sm rounded-5 mb-3">
            <div className="card-body p-3">
              <h6 className="fw-bold mb-2">Field Mapping</h6>
              <p className="text-muted small mb-3">
                Map your imported columns to pass fields.
                {fieldLabels.length > 0 && (
                  <span> Content type: <strong>{contentType}</strong></span>
                )}
              </p>
              <div className="row g-2">
                {PASS_FIELDS.map((pf) => (
                  <div className="col-6" key={pf.id}>
                    <label className="form-label small mb-1">{pf.label}</label>
                    <select
                      className="form-select form-select-sm"
                      value={fieldMap[pf.id]}
                      onChange={(e) =>
                        setFieldMap((prev) => ({
                          ...prev,
                          [pf.id]: Number(e.target.value),
                        }))
                      }
                    >
                      <option value={-1}>— None —</option>
                      {fieldLabels.map((label, i) => (
                        <option key={i} value={i}>
                          [{i}] {label}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Design */}
          <div className="card border-0 shadow-sm rounded-5 mb-3">
            <div className="card-body p-3">
              <h6 className="fw-bold mb-2">
                <BiPalette className="me-1" /> Design
              </h6>
              <div className="row g-2 mb-2">
                <div className="col-6">
                  <label className="form-label small mb-1">Primary Color</label>
                  <div className="d-flex align-items-center gap-2">
                    <input
                      type="color"
                      className="form-control form-control-color"
                      style={{ width: 44, height: 36, padding: 2 }}
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                    />
                    <span className="small text-muted">{primaryColor}</span>
                  </div>
                </div>
                <div className="col-6">
                  <label className="form-label small mb-1">Background</label>
                  <div className="d-flex align-items-center gap-2">
                    <input
                      type="color"
                      className="form-control form-control-color"
                      style={{ width: 44, height: 36, padding: 2 }}
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                    />
                    <span className="small text-muted">{bgColor}</span>
                  </div>
                </div>
              </div>
              <div className="d-flex align-items-center gap-2">
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => bgInputRef.current?.click()}
                >
                  <FiUpload className="me-1" />
                  {bgImage ? "Change BG Image" : "Upload BG Image"}
                </button>
                {bgImage && (
                  <button
                    type="button"
                    className="btn btn-outline-danger btn-sm"
                    onClick={() => setBgImage(null)}
                  >
                    Remove
                  </button>
                )}
                <input
                  ref={bgInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handleBgUpload}
                />
              </div>
            </div>
          </div>

          {/* Categories */}
          <div className="card border-0 shadow-sm rounded-5">
            <div className="card-body p-3">
              <h6 className="fw-bold mb-2">Categories</h6>
              <div className="mb-2">
                {categories.map((cat) => (
                  <div
                    key={cat.id}
                    className="d-flex align-items-center justify-content-between mb-1"
                  >
                    <div className="d-flex align-items-center gap-2">
                      <span
                        style={{
                          width: 14, height: 14, borderRadius: "50%",
                          background: cat.color, display: "inline-block",
                          flexShrink: 0,
                        }}
                      />
                      <span className="small">{cat.name}</span>
                    </div>
                    <div className="d-flex align-items-center gap-1">
                      <input
                        type="color"
                        value={cat.color}
                        onChange={(e) =>
                          setCategories((prev) =>
                            prev.map((c) =>
                              c.id === cat.id ? { ...c, color: e.target.value } : c,
                            ),
                          )
                        }
                        style={{ width: 28, height: 24, padding: 1, border: "none", cursor: "pointer" }}
                      />
                      <button
                        type="button"
                        className="btn btn-sm p-0 text-danger"
                        style={{ lineHeight: 1 }}
                        onClick={() => removeCategory(cat.id)}
                      >
                        <FiTrash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="d-flex gap-1">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Category name"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addCategory()}
                />
                <input
                  type="color"
                  value={newCatColor}
                  onChange={(e) => setNewCatColor(e.target.value)}
                  style={{ width: 38, height: 31, padding: 1, border: "1px solid #ddd", borderRadius: 4, cursor: "pointer" }}
                />
                <button
                  type="button"
                  className="btn btn-primary btn-sm px-2"
                  onClick={addCategory}
                >
                  <FiPlus />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right: Preview ── */}
        <div className="col-lg-7">
          <div className="card border-0 shadow-sm rounded-5 sticky-top" style={{ top: 16 }}>
            <div className="card-body p-3">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="fw-bold mb-0">Pass Preview</h6>
                {eventRows.length > 0 && (
                  <div className="d-flex align-items-center gap-2">
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() => setPreviewIndex((i) => Math.max(0, i - 1))}
                      disabled={previewIndex === 0}
                    >
                      <FiChevronLeft />
                    </button>
                    <span className="small text-muted">
                      {previewIndex + 1} / {eventRows.length}
                    </span>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() =>
                        setPreviewIndex((i) => Math.min(eventRows.length - 1, i + 1))
                      }
                      disabled={previewIndex >= eventRows.length - 1}
                    >
                      <FiChevronRight />
                    </button>
                  </div>
                )}
              </div>

              <div className="d-flex justify-content-center py-2">
                <PassPreview
                  attendee={currentAttendee}
                  event={selectedEvent}
                  config={config}
                  qrDataUrl={previewQR}
                />
              </div>

              {currentAttendee && (
                <div className="d-flex gap-2 mt-3 justify-content-center">
                  <button
                    type="button"
                    className="btn btn-outline-primary btn-sm"
                    onClick={downloadCurrentPass}
                  >
                    <FiDownload className="me-1" /> Download This Pass
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={downloadAllPasses}
                    disabled={isGenerating || !eventRows.length}
                  >
                    <FiDownload className="me-1" />
                    {isGenerating ? "Generating…" : "Download All Passes"}
                  </button>
                </div>
              )}

              {eventRows.length > 0 && (
                <div className="mt-3">
                  <div className="alert alert-light small mb-0">
                    <strong>{eventRows.length}</strong> pass
                    {eventRows.length !== 1 ? "es" : ""} ready.
                    Pass QR encodes a unique ID — scan it from the{" "}
                    <strong>Scan Entry</strong> page to mark attendance.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventPassPage;
