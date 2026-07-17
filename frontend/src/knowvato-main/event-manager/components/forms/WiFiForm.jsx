// src/components/forms/WiFiForm.jsx
import React, { useState, useEffect } from "react";
import { useQR } from "../../context/QRContext";

const WiFiForm = () => {
  const { qrData, updateQRData } = useQR();
  const [ssid, setSsid] = useState("");
  const [password, setPassword] = useState("");
  const [encryption, setEncryption] = useState("WPA");
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const val = qrData.value || "";
    if (val.startsWith("WIFI:")) {
      const parts = val.split(";");
      parts.forEach((part) => {
        if (part.startsWith("S:")) setSsid(part.substring(2));
        if (part.startsWith("P:")) setPassword(part.substring(2));
        if (part.startsWith("T:")) setEncryption(part.substring(2));
        if (part.startsWith("H:")) setHidden(part.substring(2) === "true");
      });
    } else {
      setSsid("");
      setPassword("");
      setEncryption("WPA");
      setHidden(false);
    }
  }, [qrData.value]);

  const updateWiFiQR = () => {
    const wifiString = `WIFI:T:${encryption};S:${ssid};P:${password};H:${hidden};;`;
    updateQRData({ value: wifiString });
  };

  useEffect(() => {
    if (ssid || password) updateWiFiQR();
  }, [ssid, password, encryption, hidden]);

  return (
    <div className="wifi-form">
      <label className="form-label fw-bold">Network Name (SSID)</label>
      <input
        type="text"
        className="form-control mb-2"
        placeholder="MyWiFi"
        value={ssid}
        onChange={(e) => setSsid(e.target.value)}
      />
      <label className="form-label fw-bold mt-2">Password</label>
      <input
        type="text"
        className="form-control mb-2"
        placeholder="password123"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <label className="form-label fw-bold mt-2">Encryption</label>
      <select
        className="form-select mb-2"
        value={encryption}
        onChange={(e) => setEncryption(e.target.value)}
      >
        <option value="WPA">WPA/WPA2</option>
        <option value="WEP">WEP</option>
        <option value="nopass">None (Open)</option>
      </select>
      <div className="form-check mb-2">
        <input
          type="checkbox"
          className="form-check-input"
          id="hiddenNetwork"
          checked={hidden}
          onChange={(e) => setHidden(e.target.checked)}
        />
        <label className="form-check-label" htmlFor="hiddenNetwork">
          Hidden Network
        </label>
      </div>
      <small className="text-muted">
        Users can scan and connect to WiFi instantly (Android/iOS).
      </small>
    </div>
  );
};

export default WiFiForm;
