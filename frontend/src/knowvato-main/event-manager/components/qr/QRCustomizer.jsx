import React, { useEffect, useState } from "react";
import { useQR } from "../../context/QRContext";
import { ChromePicker } from "react-color";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";

const QRCustomizer = () => {
  const { qrData, updateQRData } = useQR();

  const [showColorPicker, setShowColorPicker] = useState(null);
  const [pickerColor, setPickerColor] = useState(qrData.foregroundColor);

  const [sections, setSections] = useState({
    colors: true,
    style: false,
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

  // ================= BODY SHAPES =================

  const bodyShapePaths = {
    square:
      "M2,2 h6 v6 h-6 z M10,2 h6 v6 h-6 z M2,10 h6 v6 h-6 z M10,10 h6 v6 h-6 z",

    dots: "M5,5 m-2.5,0 a2.5,2.5 0 1,0 5,0 a2.5,2.5 0 1,0 -5,0",

    rounded:
      "M2,2 h6 a1,1 0 0 1 1,1 v5 a1,1 0 0 1 -1,1 h-6 a1,1 0 0 1 -1,-1 v-5 a1,1 0 0 1 1,-1 z",

    "extra-rounded":
      "M2,2 h6 a2,2 0 0 1 2,2 v4 a2,2 0 0 1 -2,2 h-6 a2,2 0 0 1 -2,-2 v-4 a2,2 0 0 1 2,-2 z",

    classy: "M2,2 h6 v6 h-6 z",

    "classy-rounded":
      "M2,2 h6 a1,1 0 0 1 1,1 v5 a1,1 0 0 1 -1,1 h-6 a1,1 0 0 1 -1,-1 v-5 a1,1 0 0 1 1,-1 z",
  };

  // ================= EYE FRAME SHAPES =================

  const eyeFramePaths = {
    square: "M2,2 h14 v14 h-14 z M4,4 h10 v10 h-10 z",

    dot: "M9,2 m-7,0 a7,7 0 1,0 14,0 a7,7 0 1,0 -14,0",

    "extra-rounded":
      "M2,2 h14 a3,3 0 0 1 3,3 v10 a3,3 0 0 1 -3,3 h-14 a3,3 0 0 1 -3,-3 v-10 a3,3 0 0 1 3,-3 z",
  };

  // ================= EYE BALL SHAPES =================

  const eyeBallPaths = {
    square: "M5,5 h8 v8 h-8 z",

    dot: "M9,9 m-4,0 a4,4 0 1,0 8,0 a4,4 0 1,0 -8,0",
  };

  return (
    <div className="qr-customizer">
      <h5 className="mb-3">Customize QR Code</h5>

      {/* ================= COLORS SECTION ================= */}

      <div className="customizer-section mb-3 border-bottom pb-3">
        <div
          className="d-flex justify-content-between align-items-center cursor-pointer"
          onClick={() => toggleSection("colors")}
          style={{ cursor: "pointer" }}
        >
          <h6 className="mb-0">Colors & Gradient</h6>

          {sections.colors ? <FiChevronUp /> : <FiChevronDown />}
        </div>

        {sections.colors && (
          <div className="mt-3">
            <div className="mb-3">
              <label className="form-label small d-block mb-2">
                Color Mode
              </label>
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
                  Foreground
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
                  className="color-preview border rounded p-2 d-flex align-items-center"
                  style={{
                    backgroundColor: qrData.foregroundColor,
                    height: "40px",
                    cursor: "pointer",
                  }}
                  onClick={() => setShowColorPicker("foregroundColor")}
                >
                  <span className="text-white ms-2">
                    {qrData.foregroundColor}
                  </span>
                </div>
              </div>
            ) : (
              <>
                <div className="mb-3">
                  <label className="form-label small d-block mb-2">
                    Gradient Type
                  </label>
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
                      className="color-preview border rounded p-2 d-flex align-items-center"
                      style={{
                        backgroundColor: qrData.gradientStart,
                        height: "40px",
                        cursor: "pointer",
                      }}
                      onClick={() => setShowColorPicker("gradientStart")}
                    >
                      <span className="text-white ms-2">
                        {qrData.gradientStart}
                      </span>
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <label className="form-label small">Gradient End</label>
                    <div
                      className="color-preview border rounded p-2 d-flex align-items-center"
                      style={{
                        backgroundColor: qrData.gradientEnd,
                        height: "40px",
                        cursor: "pointer",
                      }}
                      onClick={() => setShowColorPicker("gradientEnd")}
                    >
                      <span className="text-white ms-2">
                        {qrData.gradientEnd}
                      </span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* ================= STYLE SECTION ================= */}

      <div className="customizer-section mb-3 border-bottom pb-3">
        <div
          className="d-flex justify-content-between align-items-center cursor-pointer"
          onClick={() => toggleSection("style")}
          style={{ cursor: "pointer" }}
        >
          <h6 className="mb-0">QR Style</h6>

          {sections.style ? <FiChevronUp /> : <FiChevronDown />}
        </div>

        {sections.style && (
          <div className="mt-3">
            {/* BODY SHAPE */}

            <label className="form-label small fw-bold mb-2">Body Shape</label>

            <div className="d-flex flex-wrap gap-2 mb-3">
              {Object.entries(bodyShapePaths).map(([value, path]) => (
                <button
                  key={value}
                  className={`btn p-2 ${
                    qrData.style === value
                      ? "btn-primary border-primary"
                      : "btn-light border"
                  }`}
                  style={{
                    width: "50px",
                    height: "50px",
                  }}
                  onClick={() =>
                    updateQRData({
                      style: value,
                    })
                  }
                  title={value}
                >
                  <svg
                    viewBox="0 0 18 18"
                    style={{
                      width: "100%",
                      height: "100%",
                    }}
                  >
                    <path d={path} fill="currentColor" />
                  </svg>
                </button>
              ))}
            </div>

            {/* EYE FRAME */}

            <label className="form-label small fw-bold mb-2">
              Eye Frame Shape
            </label>

            <div className="d-flex flex-wrap gap-2 mb-3">
              {Object.entries(eyeFramePaths).map(([value, path]) => (
                <button
                  key={value}
                  className={`btn p-2 ${
                    qrData.eyeFrameStyle === value
                      ? "btn-primary border-primary"
                      : "btn-light border"
                  }`}
                  style={{
                    width: "50px",
                    height: "50px",
                  }}
                  onClick={() =>
                    updateQRData({
                      eyeFrameStyle: value,
                    })
                  }
                  title={value}
                >
                  <svg
                    viewBox="0 0 18 18"
                    style={{
                      width: "100%",
                      height: "100%",
                    }}
                  >
                    <path d={path} fill="currentColor" fillRule="evenodd" />
                  </svg>
                </button>
              ))}
            </div>

            {/* EYE BALL */}

            <label className="form-label small fw-bold mb-2">
              Eye Ball Shape
            </label>

            <div className="d-flex flex-wrap gap-2 mb-3">
              {Object.entries(eyeBallPaths).map(([value, path]) => (
                <button
                  key={value}
                  className={`btn p-2 ${
                    qrData.eyeBallStyle === value
                      ? "btn-primary border-primary"
                      : "btn-light border"
                  }`}
                  style={{
                    width: "50px",
                    height: "50px",
                  }}
                  onClick={() =>
                    updateQRData({
                      eyeBallStyle: value,
                    })
                  }
                  title={value}
                >
                  <svg
                    viewBox="0 0 18 18"
                    style={{
                      width: "100%",
                      height: "100%",
                    }}
                  >
                    <path d={path} fill="currentColor" />
                  </svg>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ================= COLOR PICKER ================= */}

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
              <span className="fw-semibold">Choose color</span>
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
