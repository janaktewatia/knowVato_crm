// src/components/forms/TextForm.jsx
import React, { useState, useEffect } from "react";
import { useQR } from "../../context/QRContext";

const TextForm = () => {
  const { qrData, updateQRData } = useQR();
  const [text, setText] = useState(qrData.value || "");

  useEffect(() => {
    setText(qrData.value || "");
  }, [qrData.value]);

  const handleChange = (e) => {
    const value = e.target.value;
    setText(value);
    updateQRData({ value });
  };

  return (
    <div className="text-form">
      <label className="form-label fw-bold">Plain Text</label>
      <textarea
        className="form-control mb-2"
        rows="4"
        placeholder="Enter any text you want to encode in QR code..."
        value={text}
        onChange={handleChange}
      />
      <small className="text-muted">
        Maximum{" "}
        {qrData.errorCorrection === "L"
          ? "~2953"
          : qrData.errorCorrection === "M"
            ? "~2331"
            : qrData.errorCorrection === "Q"
              ? "~1663"
              : "~1273"}{" "}
        characters (depends on error correction)
      </small>
    </div>
  );
};

export default TextForm;
