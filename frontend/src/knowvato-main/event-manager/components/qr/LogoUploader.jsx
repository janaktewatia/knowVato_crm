// src/components/qr/LogoUploader.jsx
import React, { useRef } from "react";
import { useQR } from "../../context/QRContext";
import { FiUpload, FiX } from "react-icons/fi";

const LogoUploader = () => {
  const { qrData, updateQRData } = useQR();
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        updateQRData({ logo: e.target.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFilePicker = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const removeLogo = () => {
    updateQRData({ logo: null });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const controlField = (label, value, onChange, suffix) => (
    <div className="d-flex align-items-center gap-2" style={{ minWidth: 0 }}>
      <label
        className="form-label mb-0 small"
        style={{ minWidth: 80, whiteSpace: "nowrap" }}
      >
        {label}
      </label>
      <div
        className="input-group input-group-sm flex-shrink-1"
        style={{ minWidth: 0, maxWidth: 170, width: "100%" }}
      >
        <input
          type="number"
          className="form-control"
          min={label === "Logo size" ? 20 : 0}
          max={label === "Logo size" ? 80 : 50}
          step="1"
          value={value}
          onChange={onChange}
        />
        <span className="input-group-text">{suffix}</span>
      </div>
    </div>
  );

  return (
    <div className="logo-uploader d-flex align-items-center gap-3">
      <div className="d-flex flex-column align-items-center text-center">
        <h6 className="mb-2">Logo / Image</h6>

        <div
          className="logo-upload-box border rounded-3 d-flex align-items-center justify-content-center"
          style={{ width: 92, minHeight: 62 }}
          onClick={triggerFilePicker}
          role="button"
          tabIndex={0}
        >
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
          {!qrData.logo ? (
            <div className="d-flex flex-column align-items-center text-secondary">
              <FiUpload size={24} />
              <small>Upload</small>
            </div>
          ) : (
            <img
              src={qrData.logo}
              alt="Logo"
              className="img-fluid rounded-3"
              style={{
                maxWidth: "100%",
                maxHeight: 84,
                borderRadius: `${qrData.logoBorderRadius}px`,
              }}
            />
          )}
        </div>
      </div>

      {qrData.logo && (
        <div className="logo-settings-panel position-relative p-3 border rounded-3 flex-fill bg-white shadow-sm">
          <button
            type="button"
            onClick={removeLogo}
            className="btn-close position-absolute top-0 end-0 m-0 p-1"
            aria-label="Remove logo"
          />
          <div className="d-flex flex-column gap-3 pt-2">
            {controlField(
              "Logo size",
              qrData.logoSize,
              (e) =>
                updateQRData({ logoSize: parseInt(e.target.value, 10) || 0 }),
              "%",
            )}
            {controlField(
              "Logo radius",
              qrData.logoBorderRadius,
              (e) =>
                updateQRData({
                  logoBorderRadius: parseInt(e.target.value, 10) || 0,
                }),
              "px",
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LogoUploader;
