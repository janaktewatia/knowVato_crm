import React, { useRef, useEffect, useState } from "react";
import QRCodeStyling from "qr-code-styling";
import { useQR } from "../../context/QRContext";
import { useHistory } from "../../context/HistoryContext";

const getDotsOptions = (style, color, gradient) => {
  const supportedTypes = [
    "square",
    "dots",
    "rounded",
    "extra-rounded",
    "classy",
    "classy-rounded",
  ];

  return {
    color,
    type: supportedTypes.includes(style) ? style : "square",
    gradient: gradient || undefined,
  };
};

const getCornersSquareOptions = (frameStyle, color, gradient) => {
  const supportedFrames = ["square", "dot", "extra-rounded"];

  return {
    color,
    type: supportedFrames.includes(frameStyle) ? frameStyle : "square",
    gradient: gradient || undefined,
  };
};

const getCornersDotOptions = (ballStyle, color, gradient) => {
  const supportedDots = ["square", "dot"];

  return {
    color,
    type: supportedDots.includes(ballStyle) ? ballStyle : "square",
    gradient: gradient || undefined,
  };
};

const QRPreview = () => {
  const { qrData, setCurrentQRImage } = useQR();
  const { addToHistory } = useHistory();

  const qrRef = useRef(null);
  const [qrCode, setQRCode] = useState(null);

  const getQRValue = () => {
    switch (qrData.type) {
      case "url":
        return qrData.value || "https://knowvato.in";

      case "text":
        return qrData.value || "Knowvato QR";

      case "email":
        return qrData.email
          ? `mailto:${qrData.email}`
          : "mailto:test@example.com";

      case "phone":
        return qrData.phoneNumber
          ? `tel:${qrData.phoneNumber}`
          : "tel:9999999999";

      default:
        return qrData.value || "https://knowvato.in";
    }
  };

  useEffect(() => {
    const qrValue = getQRValue();

    const baseColor =
      qrData.gradientType !== "none"
        ? qrData.gradientStart
        : qrData.foregroundColor;

    const gradientObj =
      qrData.gradientType !== "none"
        ? {
            type: qrData.gradientType,
            rotation: 0,
            colorStops: [
              {
                offset: 0,
                color: qrData.gradientStart,
              },
              {
                offset: 1,
                color: qrData.gradientEnd,
              },
            ],
          }
        : null;

    const options = {
      width: qrData.size,
      height: qrData.size,
      type: "canvas",
      data: qrValue,

      dotsOptions: getDotsOptions(qrData.style, baseColor, gradientObj),

      cornersSquareOptions: getCornersSquareOptions(
        qrData.eyeFrameStyle,
        baseColor,
        gradientObj,
      ),

      cornersDotOptions: getCornersDotOptions(
        qrData.eyeBallStyle,
        baseColor,
        gradientObj,
      ),

      backgroundOptions: {
        color: qrData.transparentBg ? "transparent" : qrData.backgroundColor,
      },

      qrOptions: {
        errorCorrectionLevel: qrData.errorCorrection || "Q",
      },

      ...(qrData.logo && {
        image: qrData.logo,
        imageOptions: {
          hideBackgroundDots: true,
          imageSize: qrData.logoSize / 100,
          margin: 0,
          crossOrigin: "anonymous",
        },
      }),
    };

    const newQRCode = new QRCodeStyling(options);

    setQRCode(newQRCode);

    if (qrRef.current) {
      qrRef.current.innerHTML = "";
      newQRCode.append(qrRef.current);
    }

    newQRCode.getRawData("png").then((data) => {
      if (data) {
        const url = URL.createObjectURL(data);
        setCurrentQRImage(url);
      }
    });

    addToHistory({
      name: `${qrData.type?.toUpperCase()} QR Code`,
      type: qrData.type,
      value: qrValue,
      settings: { ...qrData },
    });
  }, [qrData]);

  return (
    <div className="qr-preview-container">
      <div
        className="qr-wrapper bg-white p-4 rounded-5 shadow-sm mx-auto"
        style={{
          maxWidth: "76%",
          overflow: "hidden",
        }}
      >
        <div ref={qrRef} className="qr-canvas mx-auto"></div>
      </div>
    </div>
  );
};

export default QRPreview;
