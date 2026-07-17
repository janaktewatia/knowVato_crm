// src/components/forms/UPIPaymentForm.jsx
import React, { useState, useEffect } from "react";
import { useQR } from "../../context/QRContext";

const UPIPaymentForm = () => {
  const { qrData, updateQRData } = useQR();
  const [vpa, setVpa] = useState("");
  const [payeeName, setPayeeName] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    const val = qrData.value || "";
    if (val.startsWith("upi://pay?")) {
      const params = new URLSearchParams(val.substring(9));
      setVpa(params.get("pa") || "");
      setPayeeName(params.get("pn") || "");
      setAmount(params.get("am") || "");
      setNote(params.get("tn") || "");
    }
  }, [qrData.value]);

  const updateUPI = () => {
    let upiUrl = `upi://pay?pa=${encodeURIComponent(vpa)}`;
    if (payeeName) upiUrl += `&pn=${encodeURIComponent(payeeName)}`;
    if (amount) upiUrl += `&am=${amount}`;
    if (note) upiUrl += `&tn=${encodeURIComponent(note)}`;
    upiUrl += "&cu=INR";
    updateQRData({ value: upiUrl });
  };

  useEffect(() => {
    if (vpa) updateUPI();
  }, [vpa, payeeName, amount, note]);

  return (
    <div className="upi-form">
      <label className="form-label fw-bold">UPI ID / VPA</label>
      <input
        className="form-control mb-2"
        placeholder="username@okhdfcbank"
        value={vpa}
        onChange={(e) => setVpa(e.target.value)}
      />
      <label className="form-label fw-bold mt-2">Payee Name (optional)</label>
      <input
        className="form-control mb-2"
        placeholder="John Doe"
        value={payeeName}
        onChange={(e) => setPayeeName(e.target.value)}
      />
      <label className="form-label fw-bold mt-2">Amount (optional)</label>
      <input
        type="number"
        className="form-control mb-2"
        placeholder="100.00"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <label className="form-label fw-bold mt-2">Note (optional)</label>
      <input
        className="form-control"
        placeholder="Payment for services"
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />
      <small className="text-muted mt-2">
        Scan to pay via any UPI app (Google Pay, PhonePe, etc.)
      </small>
    </div>
  );
};

export default UPIPaymentForm;
