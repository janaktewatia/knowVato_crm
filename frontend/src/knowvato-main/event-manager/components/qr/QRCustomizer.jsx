import React, { useEffect, useState } from "react";
import { useQR } from "../../context/QRContext";
import { ChromePicker } from "react-color";
import { FiChevronDown, FiChevronUp, FiCheck, FiLayers, FiDroplet } from "react-icons/fi";

const bodyStyles = [
  {
    id: "square",
    name: "Square",
    svg: (
      <svg viewBox="0 0 24 24" className="w-100 h-100">
        <rect x="3" y="3" width="7" height="7" rx="0" fill="currentColor" />
        <rect x="14" y="3" width="7" height="7" rx="0" fill="currentColor" />
        <rect x="3" y="14" width="7" height="7" rx="0" fill="currentColor" />
        <rect x="14" y="14" width="7" height="7" rx="0" fill="currentColor" />
      </svg>
    ),
  },
  {
    id: "dots",
    name: "Dots",
    svg: (
      <svg viewBox="0 0 24 24" className="w-100 h-100">
        <circle cx="6.5" cy="6.5" r="3.5" fill="currentColor" />
        <circle cx="17.5" cy="6.5" r="3.5" fill="currentColor" />
        <circle cx="6.5" cy="17.5" r="3.5" fill="currentColor" />
        <circle cx="17.5" cy="17.5" r="3.5" fill="currentColor" />
      </svg>
    ),
  },
  {
    id: "rounded",
    name: "Rounded",
    svg: (
      <svg viewBox="0 0 24 24" className="w-100 h-100">
        <rect x="3" y="3" width="7" height="7" rx="2" fill="currentColor" />
        <rect x="14" y="3" width="7" height="7" rx="2" fill="currentColor" />
        <rect x="3" y="14" width="7" height="7" rx="2" fill="currentColor" />
        <rect x="14" y="14" width="7" height="7" rx="2" fill="currentColor" />
      </svg>
    ),
  },
  {
    id: "extra-rounded",
    name: "Extra Round",
    svg: (
      <svg viewBox="0 0 24 24" className="w-100 h-100">
        <rect x="3" y="3" width="7" height="7" rx="3.5" fill="currentColor" />
        <rect x="14" y="3" width="7" height="7" rx="3.5" fill="currentColor" />
        <rect x="3" y="14" width="7" height="7" rx="3.5" fill="currentColor" />
        <rect x="14" y="14" width="7" height="7" rx="3.5" fill="currentColor" />
      </svg>
    ),
  },
  {
    id: "classy",
    name: "Classy",
    svg: (
      <svg viewBox="0 0 24 24" className="w-100 h-100">
        <path d="M3,3 h7 v7 h-7 z" fill="currentColor" />
        <path d="M14,3 h7 a4,4 0 0 1 -4,4 h-3 z" fill="currentColor" />
        <path d="M3,14 h3 a4,4 0 0 1 4,4 v3 h-7 z" fill="currentColor" />
        <path d="M14,14 h7 v7 h-7 z" fill="currentColor" />
      </svg>
    ),
  },
  {
    id: "classy-rounded",
    name: "Classy Soft",
    svg: (
      <svg viewBox="0 0 24 24" className="w-100 h-100">
        <rect x="3" y="3" width="7" height="7" rx="1.5" fill="currentColor" />
        <path d="M14,3 h7 a4,4 0 0 1 -4,4 h-3 z" fill="currentColor" />
        <path d="M3,14 h3 a4,4 0 0 1 4,4 v3 h-7 z" fill="currentColor" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" fill="currentColor" />
      </svg>
    ),
  },
];

const eyeFrameStyles = [
  {
    id: "square",
    name: "Square Frame",
    svg: (
      <svg viewBox="0 0 24 24" className="w-100 h-100">
        <rect x="3" y="3" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="3" />
      </svg>
    ),
  },
  {
    id: "dot",
    name: "Circle Frame",
    svg: (
      <svg viewBox="0 0 24 24" className="w-100 h-100">
        <circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" strokeWidth="3" />
      </svg>
    ),
  },
  {
    id: "extra-rounded",
    name: "Rounded Frame",
    svg: (
      <svg viewBox="0 0 24 24" className="w-100 h-100">
        <rect x="3" y="3" width="18" height="18" rx="6" fill="none" stroke="currentColor" strokeWidth="3" />
      </svg>
    ),
  },
];

const eyeBallStyles = [
  {
    id: "square",
    name: "Square Eye",
    svg: (
      <svg viewBox="0 0 24 24" className="w-100 h-100">
        <rect x="7" y="7" width="10" height="10" fill="currentColor" />
      </svg>
    ),
  },
  {
    id: "dot",
    name: "Circle Eye",
    svg: (
      <svg viewBox="0 0 24 24" className="w-100 h-100">
        <circle cx="12" cy="12" r="5.5" fill="currentColor" />
      </svg>
    ),
  },
];

const stylePresets = [
  {
    name: "Classic",
    style: "square",
    eyeFrameStyle: "square",
    eyeBallStyle: "square",
    gradientType: "none",
    foregroundColor: "#000000",
    backgroundColor: "#ffffff",
  },
  {
    name: "Modern Dots",
    style: "dots",
    eyeFrameStyle: "dot",
    eyeBallStyle: "dot",
    gradientType: "linear",
    gradientStart: "#3b82f6",
    gradientEnd: "#1d4ed8",
  },
  {
    name: "Emerald Round",
    style: "extra-rounded",
    eyeFrameStyle: "extra-rounded",
    eyeBallStyle: "dot",
    gradientType: "linear",
    gradientStart: "#10b981",
    gradientEnd: "#047857",
  },
  {
    name: "Classy Luxury",
    style: "classy",
    eyeFrameStyle: "extra-rounded",
    eyeBallStyle: "square",
    gradientType: "linear",
    gradientStart: "#8b5cf6",
    gradientEnd: "#6d28d9",
  },
  {
    name: "Sunset Flare",
    style: "rounded",
    eyeFrameStyle: "extra-rounded",
    eyeBallStyle: "dot",
    gradientType: "linear",
    gradientStart: "#f97316",
    gradientEnd: "#ec4899",
  },
];

const QRCustomizer = () => {
  const { qrData, updateQRData } = useQR();

  const [showColorPicker, setShowColorPicker] = useState(null);
  const [pickerColor, setPickerColor] = useState(qrData.foregroundColor);

  const [sections, setSections] = useState({
    presets: true,
    style: true,
    colors: true,
  });

  useEffect(() => {
    if (showColorPicker) {
      setPickerColor(qrData[showColorPicker] || "#000000");
    }
  }, [showColorPicker, qrData]);

  const toggleSection = (section) => {
    setSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <div className="qr-customizer">
      <h5 className="mb-3 font-semibold text-slate-800">Customize QR Code</h5>

      {/* ================= QUICK PRESETS ================= */}
      <div className="customizer-section mb-4 border-bottom pb-3">
        <div
          className="d-flex justify-content-between align-items-center cursor-pointer mb-2"
          onClick={() => toggleSection("presets")}
          style={{ cursor: "pointer" }}
        >
          <div className="d-flex align-items-center gap-2">
            <FiLayers className="text-primary" />
            <h6 className="mb-0 font-semibold">Quick Presets</h6>
          </div>
          {sections.presets ? <FiChevronUp /> : <FiChevronDown />}
        </div>

        {sections.presets && (
          <div className="d-flex flex-wrap gap-2 mt-3">
            {stylePresets.map((preset) => (
              <button
                key={preset.name}
                type="button"
                className="btn btn-sm btn-outline-dark d-inline-flex align-items-center gap-1.5 rounded-pill px-3 py-1.5"
                style={{ fontSize: "12px", fontWeight: "500" }}
                onClick={() => updateQRData(preset)}
              >
                <span>{preset.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ================= STYLE SECTION ================= */}
      <div className="customizer-section mb-4 border-bottom pb-3">
        <div
          className="d-flex justify-content-between align-items-center cursor-pointer mb-2"
          onClick={() => toggleSection("style")}
          style={{ cursor: "pointer" }}
        >
          <div className="d-flex align-items-center gap-2">
            <FiLayers className="text-primary" />
            <h6 className="mb-0 font-semibold">QR Style & Shapes</h6>
          </div>
          {sections.style ? <FiChevronUp /> : <FiChevronDown />}
        </div>

        {sections.style && (
          <div className="mt-3">
            {/* BODY SHAPE */}
            <div className="mb-4">
              <label className="form-label small fw-bold mb-2 text-secondary uppercase tracking-wider" style={{ fontSize: "11px" }}>
                Body Pattern Style
              </label>
              <div className="row g-2">
                {bodyStyles.map((item) => {
                  const active = qrData.style === item.id;
                  return (
                    <div key={item.id} className="col-4 col-sm-2">
                      <button
                        type="button"
                        className={`btn w-100 p-2 d-flex flex-column align-items-center justify-content-center transition-all ${
                          active
                            ? "btn-primary shadow-sm"
                            : "btn-outline-light text-dark border"
                        }`}
                        style={{
                          height: "64px",
                          borderRadius: "10px",
                          borderColor: active ? "var(--bs-primary)" : "#e2e8f0",
                        }}
                        onClick={() => updateQRData({ style: item.id })}
                      >
                        <div style={{ width: "24px", height: "24px" }}>
                          {item.svg}
                        </div>
                        <span style={{ fontSize: "10px", marginTop: "4px", fontWeight: active ? "600" : "400" }}>
                          {item.name}
                        </span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* EYE FRAME */}
            <div className="mb-4">
              <label className="form-label small fw-bold mb-2 text-secondary uppercase tracking-wider" style={{ fontSize: "11px" }}>
                Eye Frame Outer Shape
              </label>
              <div className="row g-2">
                {eyeFrameStyles.map((item) => {
                  const active = qrData.eyeFrameStyle === item.id;
                  return (
                    <div key={item.id} className="col-4 col-sm-4">
                      <button
                        type="button"
                        className={`btn w-100 p-2 d-flex flex-column align-items-center justify-content-center transition-all ${
                          active
                            ? "btn-primary shadow-sm"
                            : "btn-outline-light text-dark border"
                        }`}
                        style={{
                          height: "64px",
                          borderRadius: "10px",
                          borderColor: active ? "var(--bs-primary)" : "#e2e8f0",
                        }}
                        onClick={() => updateQRData({ eyeFrameStyle: item.id })}
                      >
                        <div style={{ width: "24px", height: "24px" }}>
                          {item.svg}
                        </div>
                        <span style={{ fontSize: "10px", marginTop: "4px", fontWeight: active ? "600" : "400" }}>
                          {item.name}
                        </span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* EYE BALL */}
            <div className="mb-3">
              <label className="form-label small fw-bold mb-2 text-secondary uppercase tracking-wider" style={{ fontSize: "11px" }}>
                Eye Ball Inner Shape
              </label>
              <div className="row g-2">
                {eyeBallStyles.map((item) => {
                  const active = qrData.eyeBallStyle === item.id;
                  return (
                    <div key={item.id} className="col-6 col-sm-6">
                      <button
                        type="button"
                        className={`btn w-100 p-2 d-flex flex-column align-items-center justify-content-center transition-all ${
                          active
                            ? "btn-primary shadow-sm"
                            : "btn-outline-light text-dark border"
                        }`}
                        style={{
                          height: "64px",
                          borderRadius: "10px",
                          borderColor: active ? "var(--bs-primary)" : "#e2e8f0",
                        }}
                        onClick={() => updateQRData({ eyeBallStyle: item.id })}
                      >
                        <div style={{ width: "24px", height: "24px" }}>
                          {item.svg}
                        </div>
                        <span style={{ fontSize: "10px", marginTop: "4px", fontWeight: active ? "600" : "400" }}>
                          {item.name}
                        </span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ================= COLORS SECTION ================= */}
      <div className="customizer-section mb-3 border-bottom pb-3">
        <div
          className="d-flex justify-content-between align-items-center cursor-pointer mb-2"
          onClick={() => toggleSection("colors")}
          style={{ cursor: "pointer" }}
        >
          <div className="d-flex align-items-center gap-2">
            <FiDroplet className="text-primary" />
            <h6 className="mb-0 font-semibold">Colors & Gradient</h6>
          </div>
          {sections.colors ? <FiChevronUp /> : <FiChevronDown />}
        </div>

        {sections.colors && (
          <div className="mt-3">
            <div className="mb-3">
              <label className="form-label small d-block mb-2">Color Mode</label>
              <div className="btn-group gap-2" role="group">
                <button
                  type="button"
                  className={`btn btn-sm ${
                    qrData.gradientType === "none"
                      ? "btn-primary"
                      : "btn-outline-secondary"
                  }`}
                  onClick={() =>
                    updateQRData({
                      gradientType: "none",
                    })
                  }
                >
                  Solid Color
                </button>
                <button
                  type="button"
                  className={`btn btn-sm ${
                    qrData.gradientType !== "none"
                      ? "btn-primary"
                      : "btn-outline-secondary"
                  }`}
                  onClick={() =>
                    updateQRData({
                      gradientType:
                        qrData.gradientType === "none"
                          ? "linear"
                          : qrData.gradientType,
                    })
                  }
                >
                  Gradient
                </button>
              </div>
            </div>

            {qrData.gradientType === "none" ? (
              <div className="mb-3">
                <label className="form-label small">Foreground Color</label>
                <div
                  className="color-preview border rounded-3 p-2 d-flex align-items-center justify-content-between shadow-xs"
                  style={{
                    backgroundColor: qrData.foregroundColor,
                    height: "40px",
                    cursor: "pointer",
                  }}
                  onClick={() => setShowColorPicker("foregroundColor")}
                >
                  <span className="text-white ms-2 font-mono" style={{ fontSize: "12px", textShadow: "0 1px 2px rgba(0,0,0,0.6)" }}>
                    {qrData.foregroundColor}
                  </span>
                  <span className="badge bg-white text-dark me-1" style={{ fontSize: "10px" }}>Change</span>
                </div>
              </div>
            ) : (
              <>
                <div className="mb-3">
                  <label className="form-label small d-block mb-2">Gradient Type</label>
                  <div className="btn-group gap-2" role="group">
                    {[
                      { value: "linear", label: "Linear" },
                      { value: "radial", label: "Radial" },
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        className={`btn btn-sm ${
                          qrData.gradientType === option.value
                            ? "btn-primary"
                            : "btn-outline-secondary"
                        }`}
                        onClick={() =>
                          updateQRData({
                            gradientType: option.value,
                          })
                        }
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="row g-2 mb-3">
                  <div className="col-sm-6">
                    <label className="form-label small">Gradient Start</label>
                    <div
                      className="color-preview border rounded-3 p-2 d-flex align-items-center justify-content-between shadow-xs"
                      style={{
                        backgroundColor: qrData.gradientStart,
                        height: "40px",
                        cursor: "pointer",
                      }}
                      onClick={() => setShowColorPicker("gradientStart")}
                    >
                      <span className="text-white ms-2 font-mono" style={{ fontSize: "12px", textShadow: "0 1px 2px rgba(0,0,0,0.6)" }}>
                        {qrData.gradientStart}
                      </span>
                      <span className="badge bg-white text-dark me-1" style={{ fontSize: "10px" }}>Pick</span>
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <label className="form-label small">Gradient End</label>
                    <div
                      className="color-preview border rounded-3 p-2 d-flex align-items-center justify-content-between shadow-xs"
                      style={{
                        backgroundColor: qrData.gradientEnd,
                        height: "40px",
                        cursor: "pointer",
                      }}
                      onClick={() => setShowColorPicker("gradientEnd")}
                    >
                      <span className="text-white ms-2 font-mono" style={{ fontSize: "12px", textShadow: "0 1px 2px rgba(0,0,0,0.6)" }}>
                        {qrData.gradientEnd}
                      </span>
                      <span className="badge bg-white text-dark me-1" style={{ fontSize: "10px" }}>Pick</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* ================= COLOR PICKER OVERLAY ================= */}
      {showColorPicker && (
        <div
          className="color-picker-overlay"
          onClick={() => setShowColorPicker(null)}
        >
          <div
            className="color-picker-shell"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="color-picker-header">
              <span className="fw-semibold">Choose Color</span>
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                onClick={() => setShowColorPicker(null)}
              >
                Close
              </button>
            </div>
            <ChromePicker
              color={pickerColor}
              onChange={(color) => setPickerColor(color.hex)}
              onChangeComplete={(color) =>
                updateQRData({
                  [showColorPicker]: color.hex,
                })
              }
              disableAlpha
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default QRCustomizer;
