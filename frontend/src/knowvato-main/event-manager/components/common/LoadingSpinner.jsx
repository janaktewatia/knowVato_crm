// src/components/common/LoadingSpinner.jsx
import React from "react";

const LoadingSpinner = () => {
  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{ minHeight: "200px" }}
    >
      <div className="text-center">
        <div
          className="spinner-border text-primary"
          role="status"
          style={{ width: "3rem", height: "3rem" }}
        >
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3 text-muted">Loading, please wait...</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
