// src/context/QRContext.jsx
import React, { createContext, useState, useContext } from "react";

const QRContext = createContext();

export const useQR = () => useContext(QRContext);

const DEFAULT_QR_DATA = {
  type: "url",
  value: "",
  foregroundColor: "#000000",
  backgroundColor: "#ffffff",
  gradientStart: "#000000",
  gradientEnd: "#ffffff",
  gradientType: "none",
  style: "square",
  eyeFrameStyle: "square",
  eyeBallStyle: "square",
  size: 420,
  errorCorrection: "M",
  padding: 10,
  logo: null,
  logoSize: 50,
  logoBorderRadius: 0,
  logoBackground: "#ffffff",
  logoPosition: { x: 50, y: 50 },
  shadow: false,
  border: false,
  borderWidth: 2,
  borderColor: "#000000",
  transparentBg: false,
};

export const QRProvider = ({ children }) => {
  const [qrData, setQRData] = useState(DEFAULT_QR_DATA);

  const [loading, setLoading] = useState(false);
  const [currentQRImage, setCurrentQRImage] = useState(null);

  const updateQRData = (updates) => {
    setQRData((prev) => ({ ...prev, ...updates }));
  };

  const resetQRData = () => {
    setQRData(DEFAULT_QR_DATA);
  };

  return (
    <QRContext.Provider
      value={{
        qrData,
        updateQRData,
        resetQRData,
        loading,
        setLoading,
        currentQRImage,
        setCurrentQRImage,
      }}
    >
      {children}
    </QRContext.Provider>
  );
};
