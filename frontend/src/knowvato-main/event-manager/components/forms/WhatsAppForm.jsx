// src/components/forms/WhatsAppForm.jsx
import React, { useState, useEffect } from "react";
import { useQR } from "../../context/QRContext";

const WhatsAppForm = () => {
  const { qrData, updateQRData } = useQR();
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const val = qrData.value || "";
    if (val.includes("wa.me")) {
      const url = new URL(val);
      const phoneNum = url.pathname.substring(1);
      setPhone(phoneNum);
      setMessage(url.searchParams.get("text") || "");
    } else {
      setPhone("");
      setMessage("");
    }
  }, [qrData.value]);

  const updateWhatsAppQR = (newPhone, newMessage) => {
    let url = `https://wa.me/${newPhone.replace(/\D/g, "")}`;
    if (newMessage) url += `?text=${encodeURIComponent(newMessage)}`;
    updateQRData({ value: url });
  };

  const handlePhoneChange = (e) => {
    const val = e.target.value;
    setPhone(val);
    updateWhatsAppQR(val, message);
  };

  const handleMessageChange = (e) => {
    const val = e.target.value;
    setMessage(val);
    updateWhatsAppQR(phone, val);
  };

  return (
    <div className="whatsapp-form">
      <label className="form-label fw-bold">WhatsApp Number</label>
      <input
        type="tel"
        className="form-control mb-2"
        placeholder="1234567890 (no + or spaces)"
        value={phone}
        onChange={handlePhoneChange}
      />
      <label className="form-label fw-bold mt-2">
        Pre-filled Message (optional)
      </label>
      <textarea
        className="form-control"
        rows="3"
        placeholder="Hello! I'm interested..."
        value={message}
        onChange={handleMessageChange}
      />
      <small className="text-muted mt-2 d-block">
        Opens WhatsApp chat with number and optional message.
      </small>
    </div>
  );
};

export default WhatsAppForm;
