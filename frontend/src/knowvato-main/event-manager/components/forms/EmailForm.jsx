// src/components/forms/EmailForm.jsx
import React, { useState, useEffect } from "react";
import { useQR } from "../../context/QRContext";

const EmailForm = () => {
  const { qrData, updateQRData } = useQR();
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  useEffect(() => {
    // Parse stored value if exists (format: mailto:email?subject=...&body=...)
    const val = qrData.value || "";
    if (val.startsWith("mailto:")) {
      const parts = val.substring(7).split("?");
      setEmail(parts[0]);
      if (parts[1]) {
        const params = new URLSearchParams(parts[1]);
        setSubject(params.get("subject") || "");
        setBody(params.get("body") || "");
      } else {
        setSubject("");
        setBody("");
      }
    } else {
      setEmail("");
      setSubject("");
      setBody("");
    }
  }, [qrData.value]);

  const updateEmailQR = (newEmail, newSubject, newBody) => {
    let mailto = `mailto:${newEmail}`;
    const params = [];
    if (newSubject) params.push(`subject=${encodeURIComponent(newSubject)}`);
    if (newBody) params.push(`body=${encodeURIComponent(newBody)}`);
    if (params.length) mailto += "?" + params.join("&");
    updateQRData({ value: mailto });
  };

  const handleEmailChange = (e) => {
    const val = e.target.value;
    setEmail(val);
    updateEmailQR(val, subject, body);
  };

  const handleSubjectChange = (e) => {
    const val = e.target.value;
    setSubject(val);
    updateEmailQR(email, val, body);
  };

  const handleBodyChange = (e) => {
    const val = e.target.value;
    setBody(val);
    updateEmailQR(email, subject, val);
  };

  return (
    <div className="email-form">
      <label className="form-label fw-bold">Email Address</label>
      <input
        type="email"
        className="form-control mb-2"
        placeholder="recipient@example.com"
        value={email}
        onChange={handleEmailChange}
      />
      <label className="form-label fw-bold mt-2">Subject (optional)</label>
      <input
        type="text"
        className="form-control mb-2"
        placeholder="Email subject"
        value={subject}
        onChange={handleSubjectChange}
      />
      <label className="form-label fw-bold mt-2">Body (optional)</label>
      <textarea
        className="form-control"
        rows="3"
        placeholder="Email content"
        value={body}
        onChange={handleBodyChange}
      />
      <small className="text-muted mt-2 d-block">
        QR code will pre-fill email details when scanned.
      </small>
    </div>
  );
};

export default EmailForm;
