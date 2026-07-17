// src/components/forms/PhoneForm.jsx
import React, { useState, useEffect } from "react";
import { useQR } from "../../context/QRContext";

const PhoneForm = () => {
  const { qrData, updateQRData } = useQR();
  const [phone, setPhone] = useState("");

  useEffect(() => {
    const val = qrData.value || "";
    if (val.startsWith("tel:")) {
      setPhone(val.substring(4));
    } else {
      setPhone("");
    }
  }, [qrData.value]);

  const handleChange = (e) => {
    const val = e.target.value;
    setPhone(val);
    updateQRData({ value: `tel:${val}` });
  };

  return (
    <div className="phone-form">
      <label className="form-label fw-bold">Phone Number</label>
      <input
        type="tel"
        className="form-control mb-2"
        placeholder="+1234567890"
        value={phone}
        onChange={handleChange}
      />
      <small className="text-muted">
        Include country code for international numbers.
      </small>
    </div>
  );
};

export default PhoneForm;
