// src/components/qr/DownloadOptions.jsx
import React, { useState } from "react";
import { useQR } from "../../context/QRContext";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { toast } from "react-toastify";
import {
  FiDownload,
  FiPrinter,
  FiCopy,
  FiShare2,
  FiPackage,
  FiImage,
  FiFileText,
} from "react-icons/fi";

const DownloadOptions = () => {
  const { qrData, currentQRImage, setLoading } = useQR();
  const [downloading, setDownloading] = useState(false);
  const [activeFormat, setActiveFormat] = useState("png");

  const downloadAsPNG = async () => {
    setActiveFormat("png");
    setDownloading(true);
    try {
      const canvas = await getQRCanvas();
      const link = document.createElement("a");
      link.download = `qrcode-${Date.now()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      toast.success("QR Code downloaded as PNG!");
    } catch (error) {
      toast.error("Failed to download PNG");
    } finally {
      setDownloading(false);
    }
  };

  const downloadAsJPG = async () => {
    setActiveFormat("jpg");
    setDownloading(true);
    try {
      const canvas = await getQRCanvas();
      const link = document.createElement("a");
      link.download = `qrcode-${Date.now()}.jpg`;
      link.href = canvas.toDataURL("image/jpeg", 0.9);
      link.click();
      toast.success("QR Code downloaded as JPG!");
    } catch (error) {
      toast.error("Failed to download JPG");
    } finally {
      setDownloading(false);
    }
  };

  const downloadAsPDF = async () => {
    setDownloading(true);
    try {
      const canvas = await getQRCanvas();
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });
      const imgWidth = 100;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const x = (pdf.internal.pageSize.width - imgWidth) / 2;
      const y = (pdf.internal.pageSize.height - imgHeight) / 2;
      pdf.addImage(imgData, "PNG", x, y, imgWidth, imgHeight);
      pdf.save(`qrcode-${Date.now()}.pdf`);
      toast.success("QR Code downloaded as PDF!");
    } catch (error) {
      toast.error("Failed to download PDF");
    } finally {
      setDownloading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      const canvas = await getQRCanvas();

      // Check if clipboard API is available
      if (!navigator.clipboard) {
        // Fallback: Download the image instead on unsupported browsers
        const link = document.createElement("a");
        link.download = `qrcode-${Date.now()}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
        toast.info(
          "Downloaded QR Code (Clipboard not supported on this device)",
        );
        return;
      }

      // Try modern Clipboard API with write()
      if (navigator.clipboard.write) {
        canvas.toBlob(async (blob) => {
          try {
            await navigator.clipboard.write([
              new ClipboardItem({
                [blob.type]: blob,
              }),
            ]);
            toast.success("QR Code copied to clipboard!");
          } catch (err) {
            // Fallback to text copy if image copy fails
            copyDataURLToClipboard(canvas);
          }
        });
      } else {
        // Fallback for browsers that don't support clipboard.write
        copyDataURLToClipboard(canvas);
      }
    } catch (error) {
      console.error("Copy error:", error);
      toast.error("Failed to copy. Try downloading instead.");
    }
  };

  // Fallback method: Copy data URL as text
  const copyDataURLToClipboard = (canvas) => {
    const dataURL = canvas.toDataURL("image/png");

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(dataURL)
        .then(() => {
          toast.success("QR Code data copied to clipboard!");
        })
        .catch(() => {
          // Final fallback: download
          const link = document.createElement("a");
          link.download = `qrcode-${Date.now()}.png`;
          link.href = dataURL;
          link.click();
          toast.info("Downloaded QR Code (Copy not supported)");
        });
    } else {
      // Download as last resort
      const link = document.createElement("a");
      link.download = `qrcode-${Date.now()}.png`;
      link.href = dataURL;
      link.click();
      toast.info("Downloaded QR Code (Copy not supported)");
    }
  };

  const getQRCanvas = async () => {
    const qrElement = document.querySelector(".qr-canvas canvas");
    if (qrElement) {
      return qrElement;
    }
    throw new Error("QR element not found");
  };

  return (
    <div className="download-options">
      {/* Desktop: Single row, Mobile: Two rows */}
      <div className="row g-2">
        {/* PNG Button */}
        <div className="col-6 col-md-3">
          <button
            className={`btn p-1 w-100 ${activeFormat === "png" ? "btn-primary" : "btn-outline-primary"}`}
            onClick={downloadAsPNG}
            disabled={downloading}
          >
            <FiImage className="me-2" />
            PNG
          </button>
        </div>

        {/* JPG Button */}
        <div className="col-6 col-md-3">
          <button
            className={`btn p-1 w-100 ${activeFormat === "jpg" ? "btn-primary" : "btn-outline-primary"}`}
            onClick={downloadAsJPG}
            disabled={downloading}
          >
            <FiImage className="me-2" />
            JPG
          </button>
        </div>

        {/* PDF Button */}
        <div className="col-6 col-md-3">
          <button
            className="btn p-1 btn-outline-primary w-100"
            onClick={downloadAsPDF}
            disabled={downloading}
          >
            <FiFileText className="me-2" />
            PDF
          </button>
        </div>

        {/* Copy QR Button */}
        <div className="col-6 col-md-3">
          <button
            className="btn p-1 btn-secondary w-100"
            onClick={copyToClipboard}
            disabled={downloading}
          >
            <FiCopy className="me-2" />
            Copy
          </button>
        </div>
      </div>

      {downloading && (
        <div className="mt-3 text-center">
          <div
            className="spinner-border spinner-border-sm text-primary"
            role="status"
          >
            <span className="visually-hidden">Downloading...</span>
          </div>
          <span className="ms-2">Processing...</span>
        </div>
      )}
    </div>
  );
};

export default DownloadOptions;
