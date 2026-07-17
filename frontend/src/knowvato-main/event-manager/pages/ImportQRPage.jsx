// src/pages/ImportQRPage.js
import React, { useEffect, useMemo, useRef, useState } from "react";
import * as XLSX from "xlsx";
import JSZip from "jszip";
import QRCodeStyling from "qr-code-styling";
import { toast } from "react-toastify";
import { useQR } from "../context/QRContext";
import { useEventData } from "../context/EventDataContext";
import {
  BiCloudUpload,
  BiDownload,
  BiCheckCircle,
  BiErrorCircle,
} from "react-icons/bi";
import {
  BiGlobe,
  BiText,
  BiEnvelope,
  BiPhone,
  BiMessageSquare,
  BiLogoWhatsapp,
  BiWifi,
  BiIdCard,
} from "react-icons/bi";

const CONTENT_TYPES = [
  {
    id: "url",
    name: "URL",
    icon: BiGlobe,
    fields: [{ key: "url", label: "URL", keys: ["url", "website", "link"] }],
    build: (row) => {
      const url = row.url;
      if (!url) return "";
      return url.toString().trim().startsWith("http")
        ? url.toString().trim()
        : `https://${url.toString().trim()}`;
    },
  },
  {
    id: "whatsapp",
    name: "WhatsApp",
    icon: BiLogoWhatsapp,
    fields: [
      {
        key: "phone",
        label: "Mobile Number",
        keys: ["phone", "phonenumber", "mobile", "mobilenumber", "number"],
      },
      {
        key: "message",
        label: "Message",
        keys: ["message", "msg", "text", "body"],
      },
    ],
    build: (row) => {
      const phone = row.phone?.toString().replace(/[^0-9+]/g, "") || "";
      const text = row.message || row.msg || row.text || "";
      if (!phone) return "";
      const encoded = encodeURIComponent(text);
      return `https://wa.me/${phone}${encoded ? `?text=${encoded}` : ""}`;
    },
  },
  // {
  //   id: "sms",
  //   name: "SMS",
  //   icon: BiMessageSquare,
  //   fields: [
  //     {
  //       key: "phone",
  //       label: "Mobile Number",
  //       keys: ["phone", "phonenumber", "mobile", "mobilenumber", "number"],
  //     },
  //     {
  //       key: "message",
  //       label: "Message",
  //       keys: ["message", "msg", "text", "body"],
  //     },
  //   ],
  //   build: (row) => {
  //     const phone = row.phone?.toString().replace(/[^0-9+]/g, "") || "";
  //     const text = row.message || row.msg || row.text || "";
  //     if (!phone) return "";
  //     const encoded = encodeURIComponent(text);
  //     return `SMSTO:${phone}:${encoded}`;
  //   },
  // },
  {
    id: "email",
    name: "Email",
    icon: BiEnvelope,
    fields: [
      {
        key: "email",
        label: "Email",
        keys: ["email", "emailid", "emailaddress", "e-mail"],
      },
      { key: "subject", label: "Subject", keys: ["subject", "subjectline"] },
      {
        key: "message",
        label: "Message",
        keys: ["body", "message", "msg", "content"],
      },
    ],
    build: (row) => {
      const email = row.email || "";
      if (!email) return "";
      const subject = encodeURIComponent(row.subject || "");
      const body = encodeURIComponent(row.body || row.message || row.msg || "");
      return `mailto:${email}${
        subject || body
          ? `?${[
              subject ? `subject=${subject}` : null,
              body ? `body=${body}` : null,
            ]
              .filter(Boolean)
              .join("&")}`
          : ""
      }`;
    },
  },
  // {
  //   id: "phone",
  //   name: "Phone",
  //   icon: BiPhone,
  //   fields: [
  //     {
  //       key: "phone",
  //       label: "Phone Number",
  //       keys: ["phone", "phonenumber", "mobile", "mobilenumber", "number"],
  //     },
  //   ],
  //   build: (row) => {
  //     const phone = row.phone?.toString().replace(/[^0-9+]/g, "") || "";
  //     return phone ? `tel:${phone}` : "";
  //   },
  // },
  // {
  //   id: "text",
  //   name: "Text",
  //   icon: BiText,
  //   fields: [
  //     {
  //       key: "text",
  //       label: "Text",
  //       keys: ["text", "message", "value", "content"],
  //     },
  //   ],
  //   build: (row) => row.text || row.message || row.value || row.content || "",
  // },
  {
    id: "vcard",
    name: "vCard",
    icon: BiIdCard,
    fields: [
      { key: "name", label: "Name", keys: ["name", "fullname", "full name"] },
      {
        key: "phone",
        label: "Phone",
        keys: ["phone", "phonenumber", "mobile", "mobilenumber"],
      },
      {
        key: "email",
        label: "Email",
        keys: ["email", "emailid", "emailaddress", "e-mail"],
      },
      { key: "title", label: "Job Title", keys: ["title", "jobtitle", "role"] },
      {
        key: "organization",
        label: "Company",
        keys: ["organization", "company", "org"],
      },
      { key: "website", label: "Website", keys: ["website", "url", "link"] },
      {
        key: "address",
        label: "Address",
        keys: ["address", "location", "addr"],
      },
    ],
    build: (row) => {
      const lines = ["BEGIN:VCARD", "VERSION:3.0"];
      if (row.name) lines.push(`FN:${row.name}`);
      if (row.phone) lines.push(`TEL:${row.phone}`);
      if (row.email) lines.push(`EMAIL:${row.email}`);
      if (row.title) lines.push(`TITLE:${row.title}`);
      if (row.organization) lines.push(`ORG:${row.organization}`);
      if (row.website) lines.push(`URL:${row.website}`);
      if (row.address) lines.push(`ADR:${row.address}`);
      lines.push("END:VCARD");
      return lines.join("\n");
    },
  },
];

const normalizeKey = (key) =>
  key
    ?.toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "") || "";

const getFieldValue = (row, keys) => {
  for (const key of keys) {
    const normalized = normalizeKey(key);
    if (normalized && row[normalized] != null && row[normalized] !== "") {
      return row[normalized].toString().trim();
    }
  }
  return "";
};

const makeQRPreview = async (data, styleData) => {
  const qr = new QRCodeStyling({
    width: 140,
    height: 140,
    type: "canvas",
    data,
    dotsOptions: {
      color:
        styleData.gradientType !== "none"
          ? styleData.gradientStart
          : styleData.foregroundColor,
      type: styleData.style || "square",
      gradient:
        styleData.gradientType !== "none"
          ? {
              type: styleData.gradientType,
              rotation: 0,
              colorStops: [
                { offset: 0, color: styleData.gradientStart },
                { offset: 1, color: styleData.gradientEnd },
              ],
            }
          : undefined,
    },
    cornersSquareOptions: {
      color:
        styleData.gradientType !== "none"
          ? styleData.gradientStart
          : styleData.foregroundColor,
      type: styleData.eyeFrameStyle || "square",
    },
    cornersDotOptions: {
      color:
        styleData.gradientType !== "none"
          ? styleData.gradientStart
          : styleData.foregroundColor,
      type: styleData.eyeBallStyle === "dot" ? "dot" : "square",
    },
    backgroundOptions: {
      color: styleData.transparentBg
        ? "transparent"
        : styleData.backgroundColor,
    },
    qrOptions: { errorCorrectionLevel: styleData.errorCorrection || "M" },
  });
  const blob = await qr.getRawData("png");
  return blob;
};

const ImportQRPage = () => {
  const { qrData } = useQR();
  const {
    events,
    selectedEventId,
    setSelectedEventId,
    syncImportedRowsForEvent,
    importedRows,
  } = useEventData();
  const fileInputRef = useRef(null);
  const previewUrlsRef = useRef({});
  const [activeType, setActiveType] = useState("url");
  const [file, setFile] = useState(null);
  const [rows, setRows] = useState([]);
  const [parsedRows, setParsedRows] = useState([]);
  const [previewUrls, setPreviewUrls] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [baseName, setBaseName] = useState("");
  const [qrColor, setQrColor] = useState("#000000");
  const [warnings, setWarnings] = useState([]);

  const activeConfig = useMemo(
    () => CONTENT_TYPES.find((item) => item.id === activeType),
    [activeType],
  );

  const selectedEvent = useMemo(
    () => events.find((event) => event.id === selectedEventId) || null,
    [events, selectedEventId],
  );

  const handleFileChange = (event) => {
    const selected = event.target.files?.[0];

    if (!selected) return;

    const allowedExtensions = [".xlsx", ".xls", ".csv"];

    const extension = "." + selected.name.split(".").pop().toLowerCase();

    if (!allowedExtensions.includes(extension)) {
      toast.error("Please upload Excel or CSV file only");

      event.target.value = "";
      return;
    }

    setFile(selected);
    setRows([]);
    setParsedRows([]);
    setPreviewUrls({});
    setWarnings([]);

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);

        const workbook = XLSX.read(data, {
          type: "array",
        });

        const worksheet = workbook.Sheets[workbook.SheetNames[0]];

        const json = XLSX.utils.sheet_to_json(worksheet, {
          defval: "",
        });

        setRows(json);

        toast.success(`${json.length} rows loaded from ${selected.name}`);
      } catch (error) {
        console.error(error);

        toast.error("Unable to parse file. Please upload valid Excel/CSV.");
      }

      // allow selecting same file again later
      event.target.value = "";
    };

    reader.readAsArrayBuffer(selected);
  };

  // const handleFileInputClick = (event) => {
  //   event.target.value = null;
  // };

  const triggerFilePicker = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  useEffect(() => {
    if (!rows.length) {
      setParsedRows([]);
      return;
    }

    // First pass: normalize and extract fields including optional qr_name
    const interim = rows.map((row, index) => {
      const normalized = {};
      Object.entries(row).forEach(([key, value]) => {
        normalized[normalizeKey(key)] = value;
      });
      const rowData = {};
      activeConfig.fields.forEach((field) => {
        rowData[field.key] = getFieldValue(normalized, field.keys);
      });
      // optional QR Name column (keys: name, qrname, qr_name)
      rowData.qr_name = getFieldValue(normalized, [
        "name",
        "qrname",
        "qr_name",
      ]);
      const built = activeConfig.build(rowData);
      const valid = Boolean(built && (!activeConfig.id || built.length > 0));
      return {
        index,
        id: `row-${index}`,
        original: row,
        normalized: rowData,
        value: built,
        valid,
        display: activeConfig.fields.map((field) => rowData[field.key] || ""),
      };
    });

    // detect duplicate QR names (non-empty, case-insensitive)
    const nameCounts = interim.reduce((acc, r) => {
      const raw = (r.normalized?.qr_name || "").toString().trim();
      if (!raw) return acc;
      const key = raw.toLowerCase();
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    const duplicateNames = Object.keys(nameCounts).filter(
      (k) => nameCounts[k] > 1,
    );

    const normalizedRows = interim.map((r) => {
      const raw = (r.normalized?.qr_name || "").toString().trim();
      const isDuplicate = raw
        ? duplicateNames.includes(raw.toLowerCase())
        : false;
      return {
        ...r,
        valid: r.valid && !isDuplicate,
        duplicate: isDuplicate,
      };
    });

    const newWarnings = [];
    if (normalizedRows.some((row) => !row.valid)) {
      newWarnings.push(
        "Some rows are missing required fields for the selected QR type or have duplicate QR Names. Those rows are shown as invalid.",
      );
    }
    // If there are duplicate names, add more specific guidance
    const dupNames = normalizedRows
      .filter((r) => r.duplicate)
      .map((r) => r.normalized?.qr_name)
      .filter(Boolean);
    if (dupNames.length) {
      const unique = [...new Set(dupNames)];
      newWarnings.push(
        `Duplicate QR Name(s) found: ${unique.join(", ")}. Please ensure QR Name values are unique before downloading.`,
      );
    }
    setWarnings(newWarnings);
    setParsedRows(normalizedRows);
  }, [rows, activeConfig]);

  useEffect(() => {
    if (!selectedEventId || !parsedRows.length) {
      return;
    }

    syncImportedRowsForEvent(selectedEventId, parsedRows, {
      sourceFile: file?.name || "uploaded-file",
      contentType: activeType,
    });
  }, [activeType, file, parsedRows, selectedEventId, syncImportedRowsForEvent]);

  useEffect(() => {
    let cancelled = false;

    const runPreview = async () => {
      // Revoke previous object URLs before generating new ones
      Object.values(previewUrlsRef.current).forEach((url) =>
        URL.revokeObjectURL(url),
      );
      previewUrlsRef.current = {};

      if (!parsedRows.length) {
        setPreviewUrls({});
        return;
      }

      setIsProcessing(true);
      const urls = {};
      const previewStyle = {
        ...qrData,
        gradientType: "none",
        foregroundColor: qrColor,
        gradientStart: qrColor,
        gradientEnd: qrColor,
      };
      for (const row of parsedRows) {
        if (cancelled) break;
        if (!row.valid) continue;
        try {
          const blob = await makeQRPreview(row.value, previewStyle);
          urls[row.id] = URL.createObjectURL(blob);
        } catch (error) {
          console.error("Preview generation failed", error);
        }
      }

      if (!cancelled) {
        previewUrlsRef.current = urls;
        setPreviewUrls(urls);
        setIsProcessing(false);
      } else {
        Object.values(urls).forEach((url) => URL.revokeObjectURL(url));
      }
    };

    runPreview();

    return () => {
      cancelled = true;
      Object.values(previewUrlsRef.current).forEach((url) =>
        URL.revokeObjectURL(url),
      );
      previewUrlsRef.current = {};
    };
  }, [parsedRows, qrData, qrColor]);

  const getValidRows = () => parsedRows.filter((row) => row.valid);

  const downloadAllQRCodes = async () => {
    const items = getValidRows();
    if (!items.length) {
      toast.error("No valid rows to download.");
      return;
    }

    const sanitizeFilename = (name) =>
      name
        .toString()
        .trim()
        .replace(/[^a-z0-9-_ ]+/gi, "")
        .replace(/\s+/g, "-")
        .substring(0, 120) || "qrcode";

    setIsProcessing(true);
    try {
      const zip = new JSZip();
      const downloadStyle = {
        ...qrData,
        gradientType: "none",
        foregroundColor: qrColor,
        gradientStart: qrColor,
        gradientEnd: qrColor,
      };
      for (let i = 0; i < items.length; i += 1) {
        const item = items[i];
        const blob = await makeQRPreview(item.value, downloadStyle);
        const desired = item.normalized?.qr_name || baseName || "qrcode";
        const safe = sanitizeFilename(desired);
        const name = `${safe}.png`;
        zip.file(name, blob);
      }
      const zipBlob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${baseName || "QR_Codes"}.zip`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      toast.error("Failed to create bulk download.");
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadTemplate = () => {
    const templateData = [
      activeConfig.fields.map((field) => field.label).concat(["QR Name"]),
    ];

    const ws = XLSX.utils.aoa_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, `${activeType}_template.xlsx`);
    toast.success(`${activeConfig.name} template downloaded.`);
  };

  return (
    <div className="import-page container-fluid p-2 fade-in">
      <div className="row mb-3">
        <div className="col-12">
          <div className="card shadow-sm border-0 rounded-5">
            <div className="card-body p-3">
              <div className="d-flex flex-column flex-md-row justify-content-between gap-1">
                <div>
                  <h2 className="fw-bold">Bulk QR Import</h2>
                  <p className="text-muted mb-0">
                    Choose the content type first, then upload the file. The
                    table below will show the imported rows and generated QR
                    previews.
                  </p>
                </div>
                <div className="d-flex gap-2 flex-nowrap align-items-center overflow-auto">
                  <div className="d-flex gap-2 flex-nowrap overflow-auto">
                    {CONTENT_TYPES.map((type) => {
                      const Icon = type.icon;
                      return (
                        <button
                          key={type.id}
                          type="button"
                          className={`btn btn-sm ${activeType === type.id ? "btn-primary" : "btn-outline-secondary"}`}
                          onClick={() => setActiveType(type.id)}
                        >
                          <Icon className="me-1 fs-6" />
                          {type.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row mb-4 align-items-stretch">
        <div className="col-lg-6 d-flex">
          <div className="card shadow-sm border-0 rounded-5 h-100 w-100">
            <div className="card-body p-3 d-flex flex-column h-100">
              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <label className="form-label fw-semibold mb-0">
                    Upload Excel / CSV file
                  </label>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-primary download-format"
                    onClick={downloadTemplate}
                  >
                    <BiDownload className="me-1" /> Download Format
                  </button>
                </div>
                <div className="bulk-file-input-wrapper">
                  <input
                    id="excelInput"
                    ref={fileInputRef}
                    className="bulk-file-input"
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleFileChange}
                  />

                  <label
                    htmlFor="excelInput"
                    className="bulk-file-input-button me-2"
                    style={{
                      height: "36px",
                      fontSize: "0.9rem",
                      borderRadius: "var(--radius)",
                    }}
                  >
                    <BiCloudUpload className="me-2" />
                    {file ? "Change File" : "Choose File"}
                  </label>

                  {/* <span className="bulk-file-meta">
                    {file ? file.name : "No file selected"}
                  </span> */}
                  <span className="bulk-file-input-hint">
                    Excel or CSV only
                  </span>
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label small text-muted">
                  File Name for Downloaded QRs
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={baseName}
                  onChange={(e) => setBaseName(e.target.value)}
                  placeholder="Enter base name for downloaded files"
                />
              </div>
              <div className="alert alert-light mb-0">
                <strong>Required columns:</strong>{" "}
                {activeConfig.fields.map((field) => field.label).join(", ")}.
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-6 d-flex">
          <div className="card shadow-sm border-0 rounded-5 h-100 w-100">
            <div className="card-header bg-white border-bottom">
              <div className="d-flex align-items-center gap-2">
                <BiCloudUpload className="fs-3 text-primary" />
                <h5 className="mb-0">File Summary</h5>
              </div>
            </div>
            <div className="card-body justify-content-between p-3 d-flex flex-column h-100">
              <div className="bulk-summary-row d-flex justify-content-between align-items-start align-items-md-center flex-column flex-md-row gap-3 mt-4 mb-3">
                <div className="bulk-summary-copy">
                  <p className="mb-2 text-muted">
                    {file?.name || "No file selected yet."}
                  </p>
                  <p className="mb-0 text-muted">
                    {rows.length
                      ? `${rows.length} rows loaded`
                      : "Upload a file to start."}
                  </p>
                </div>
                <div className="bulk-color-control d-flex align-items-center gap-3">
                  <div>
                    <p className="mb-1 fw-semibold">Choose Color</p>
                  </div>
                  <input
                    type="color"
                    className="form-control form-control-color"
                    value={qrColor}
                    onChange={(e) => setQrColor(e.target.value)}
                    title="Choose QR code color"
                    style={{
                      width: 56,
                      height: 40,
                      padding: 0,
                      borderRadius: "var(--radius)",
                    }}
                  />
                </div>
              </div>
              <div className="mb-3"></div>
              <div>
                <button
                  className="bulk-download-button btn w-100"
                  type="button"
                  onClick={downloadAllQRCodes}
                  disabled={isProcessing || !getValidRows().length}
                >
                  <BiDownload className="me-2" /> Download All QR Codes
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {warnings.length > 0 && (
        <div className="row mb-3">
          <div className="col-12">
            <div className="alert alert-warning">
              <ul className="mb-0">
                {warnings.map((warning, index) => (
                  <li key={index}>{warning}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className="row">
        <div className="col-12">
          <div className="card shadow-sm border-0 rounded-5">
            <div className="card-body p-0">
              <div className="table-responsive d-none d-md-block">
                <table className="table table-striped table-hover table-sm mb-0 align-middle">
                  <thead className="table-light">
                    <tr>
                      <th style={{ width: 50 }} className="small text-muted">
                        #
                      </th>
                      <th className="small text-muted">Preview</th>
                      <th className="small text-muted">QR Name</th>
                      {activeConfig.fields.map((field) => (
                        <th key={field.label} className="small text-muted">
                          {field.label}
                        </th>
                      ))}
                      <th className="small text-muted">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedRows.length ? (
                      parsedRows.map((row, index) => (
                        <tr key={row.id}>
                          <td>{index + 1}</td>
                          <td style={{ minWidth: 180, width: 180 }}>
                            <div className="d-flex align-items-center justify-content-center">
                              {previewUrls[row.id] ? (
                                <div
                                  className="qr-preview-box rounded bg-white d-flex align-items-center justify-content-center"
                                  style={{
                                    width: 140,
                                    height: 140,
                                    padding: 8,
                                    boxShadow: "0 0 0 1px rgba(0,0,0,0.08)",
                                  }}
                                >
                                  <img
                                    src={previewUrls[row.id]}
                                    alt="QR preview"
                                    className="img-fluid"
                                    style={{
                                      maxWidth: "100%",
                                      maxHeight: "100%",
                                    }}
                                  />
                                </div>
                              ) : row.valid ? (
                                <div
                                  className="spinner-border spinner-border-sm text-primary"
                                  role="status"
                                >
                                  <span className="visually-hidden">
                                    Generating...
                                  </span>
                                </div>
                              ) : (
                                <span className="text-danger">Invalid</span>
                              )}
                            </div>
                          </td>
                          <td>
                            {row.normalized?.qr_name ? (
                              <span
                                className={row.duplicate ? "text-danger" : ""}
                              >
                                {row.normalized.qr_name}
                              </span>
                            ) : (
                              "—"
                            )}
                          </td>
                          {row.display.map((text, idx) => (
                            <td key={`${row.id}-${idx}`}>{text || "—"}</td>
                          ))}
                          <td>
                            {row.valid ? (
                              <span className="badge bg-success">
                                <BiCheckCircle className="me-1" /> Ready
                              </span>
                            ) : (
                              <span className="badge bg-danger">
                                <BiErrorCircle className="me-1" /> Invalid
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={activeConfig.fields.length + 4}
                          className="text-center py-4 text-muted"
                        >
                          Upload a file and select a type to preview your QR
                          list.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="bulk-mobile-results d-md-none p-3">
                {parsedRows.length ? (
                  parsedRows.map((row, index) => (
                    <div
                      className="bulk-mobile-result-card card mb-3"
                      key={row.id}
                    >
                      <div className="card-body p-3">
                        <div className="d-flex justify-content-between align-items-start gap-3 mb-3">
                          <div>
                            <p className="small text-muted mb-1">
                              Row {index + 1}
                            </p>
                            <h6 className="mb-1">
                              {row.normalized?.qr_name || "Untitled QR"}
                            </h6>
                            <p className="small text-muted mb-0">
                              {row.display.filter(Boolean).join(" • ") ||
                                "No details available"}
                            </p>
                          </div>
                          <div>
                            {row.valid ? (
                              <span className="badge bg-success">
                                <BiCheckCircle className="me-1" /> Ready
                              </span>
                            ) : (
                              <span className="badge bg-danger">
                                <BiErrorCircle className="me-1" /> Invalid
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="bulk-mobile-preview-box d-flex justify-content-center">
                          {previewUrls[row.id] ? (
                            <div className="qr-preview-box rounded bg-white d-flex align-items-center justify-content-center">
                              <img
                                src={previewUrls[row.id]}
                                alt="QR preview"
                                className="img-fluid"
                              />
                            </div>
                          ) : row.valid ? (
                            <div
                              className="spinner-border spinner-border-sm text-primary"
                              role="status"
                            >
                              <span className="visually-hidden">
                                Generating...
                              </span>
                            </div>
                          ) : (
                            <span className="text-danger">Invalid</span>
                          )}
                        </div>

                        <div className="mt-3 small">
                          <div className="row g-2">
                            {activeConfig.fields.map((field, fieldIndex) => (
                              <div
                                className="col-12"
                                key={`${row.id}-${field.label}`}
                              >
                                <div className="d-flex justify-content-between gap-3">
                                  <span className="text-muted">
                                    {field.label}
                                  </span>
                                  <span className="text-end fw-semibold">
                                    {row.display[fieldIndex] || "—"}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-muted">
                    Upload a file and select a type to preview your QR list.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImportQRPage;
