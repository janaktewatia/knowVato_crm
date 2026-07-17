// src/components/forms/SocialForm.jsx
import React, { useState, useEffect } from "react";
import { useQR } from "../../context/QRContext";

const SocialForm = () => {
  const { qrData, updateQRData } = useQR();
  const [platform, setPlatform] = useState("instagram");
  const [username, setUsername] = useState("");

  const platforms = {
    instagram: "https://instagram.com/",
    twitter: "https://twitter.com/",
    facebook: "https://facebook.com/",
    linkedin: "https://linkedin.com/in/",
    youtube: "https://youtube.com/@",
    tiktok: "https://tiktok.com/@",
    github: "https://github.com/",
    pinterest: "https://pinterest.com/",
  };

  useEffect(() => {
    const val = qrData.value || "";
    for (let [key, base] of Object.entries(platforms)) {
      if (val.startsWith(base)) {
        setPlatform(key);
        setUsername(val.substring(base.length));
        break;
      }
    }
  }, [qrData.value]);

  const updateSocial = () => {
    const url = platforms[platform] + username;
    updateQRData({ value: url });
  };

  useEffect(() => {
    if (username) updateSocial();
  }, [platform, username]);

  return (
    <div className="social-form">
      <label className="form-label fw-bold">Platform</label>
      <select
        className="form-select mb-2"
        value={platform}
        onChange={(e) => setPlatform(e.target.value)}
      >
        {Object.keys(platforms).map((p) => (
          <option key={p}>{p}</option>
        ))}
      </select>
      <label className="form-label fw-bold mt-2">Username / Handle</label>
      <input
        className="form-control"
        placeholder="@username"
        value={username}
        onChange={(e) => setUsername(e.target.value.replace("@", ""))}
      />
      <small className="text-muted mt-2">
        Opens your social profile directly.
      </small>
    </div>
  );
};

export default SocialForm;
