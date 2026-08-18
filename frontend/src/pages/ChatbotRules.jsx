import React, { useState } from "react";
import FlowChatDashboard from "../flowchat/pages/Dashboard";
import FormsManager from "../flowchat/pages/FormsManager";

export default function ChatbotRules() {
  const [activeTab, setActiveTab] = useState("flows"); // "flows" | "forms"

  return (
    <div>
      {/* Top Tab Bar */}
      <div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-2">
        <ul className="nav nav-pills gap-2">
          <li className="nav-item">
            <button
              className={`nav-link rounded-pill px-3 py-1 fw-semibold ${
                activeTab === "flows" ? "active bg-success text-white" : "text-secondary"
              }`}
              onClick={() => setActiveTab("flows")}
            >
              <i className="bi bi-diagram-3 me-2"></i>Visual Bot Flows (FlowChat Studio)
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link rounded-pill px-3 py-1 fw-semibold ${
                activeTab === "forms" ? "active bg-primary text-white" : "text-secondary"
              }`}
              onClick={() => setActiveTab("forms")}
            >
              <i className="bi bi-ui-checks me-2"></i>WhatsApp Forms Builder
            </button>
          </li>
        </ul>
      </div>

      {activeTab === "flows" && <FlowChatDashboard />}
      {activeTab === "forms" && <FormsManager />}
    </div>
  );
}
