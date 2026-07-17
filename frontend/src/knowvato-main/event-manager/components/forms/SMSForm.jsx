// src/components/forms/SMSForm.jsx
import React, { useState, useEffect } from "react";
import { useQR } from "../../context/QRContext";

const SMSForm = () => {
  const { qrData, updateQRData } = useQR();
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const val = qrData.value || "";
    if (val.startsWith("sms:")) {
      const parts = val.substring(4).split("?body=");
      setPhone(parts[0]);
      setMessage(parts[1] ? decodeURIComponent(parts[1]) : "");
    } else {
      setPhone("");
      setMessage("");
    }
  }, [qrData.value]);

  const updateSMSQR = (newPhone, newMessage) => {
    let sms = `sms:${newPhone}`;
    if (newMessage) sms += `?body=${encodeURIComponent(newMessage)}`;
    updateQRData({ value: sms });
  };

  const handlePhoneChange = (e) => {
    const val = e.target.value;
    setPhone(val);
    updateSMSQR(val, message);
  };

  const handleMessageChange = (e) => {
    const val = e.target.value;
    setMessage(val);
    updateSMSQR(phone, val);
  };

  return (
    <div className="sms-form">
      <label className="form-label fw-bold">Phone Number</label>
      <input
        type="tel"
        className="form-control mb-2"
        placeholder="+1234567890"
        value={phone}
        onChange={handlePhoneChange}
      />
      <label className="form-label fw-bold mt-2">Message</label>
      <textarea
        className="form-control"
        rows="3"
        placeholder="Type your SMS text..."
        value={message}
        onChange={handleMessageChange}
      />
      <small className="text-muted mt-2 d-block">
        QR code will open SMS app with pre-filled number and message.
      </small>
    </div>
  );
};

export default SMSForm;
