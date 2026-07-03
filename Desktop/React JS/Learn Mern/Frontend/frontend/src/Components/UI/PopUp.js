import React, { useEffect } from "react";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa"; // icons

const ShowPopup = ({ msg, type, onClose }) => {

  useEffect(() => {
    // 3 second ke baad popup automatically close ho jaye
    const timer = setTimeout(() => {
      onClose(); // parent me setPopUp({show:false})
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  // colors aur icon define kar rahe
  const bgColor = type === "success" ? "#d4edda" : "#f8d7da";
  const textColor = type === "success" ? "#155724" : "#721c24";
  const borderColor = type === "success" ? "#c3e6cb" : "#f5c6cb";
  const Icon = type === "success" ? FaCheckCircle : FaTimesCircle;

  return (
    <div
      style={{
        position: "fixed",
        top: "20px",
        right: "20px",
        backgroundColor: bgColor,
        color: textColor,
        border: `1px solid ${borderColor}`,
        borderRadius: "8px",
        padding: "15px 20px",
        display: "flex",
        alignItems: "center",
        zIndex: 999,
        minWidth: "280px",
        boxShadow: "0 4px 8px rgba(0,0,0,0.2)"
      }}
    >
      <Icon style={{ marginRight: "10px", fontSize: "20px" }} />
      <div style={{ fontSize: "16px" }}>
        {msg.split("Name:").map((part, i) =>
          i === 1 ? (
            <span key={i} style={{ color: "#0d6efd", fontWeight: "bold" }}>
              {part}
            </span>
          ) : (
            <span key={i}>{part}</span>
          )
        )}
      </div>
    </div>
  );
};

export default ShowPopup;
