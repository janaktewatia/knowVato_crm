import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function ActionColumn({ lead, onMessage, onEdit, onService, onFollowUp }) {
  const { can } = useAuth();
  const [showMenu, setShowMenu] = useState(false);

  const handleAction = (action) => {
    setShowMenu(false);
    action();
  };

  const actions = [];
  
  if (can("blast", "create")) {
    actions.push({ icon: "chat-dots", label: "Communication", onClick: onMessage, color: "#0085a8" });
  }
  if (can("leads", "edit")) {
    actions.push({ icon: "pencil", label: "Edit", onClick: onEdit, color: "#6c757d" });
  }
  if (can("leads", "edit")) {
    actions.push({ icon: "arrow-left-right", label: "Service & Status", onClick: onService, color: "#6c757d" });
  }
  if (can("followups", "create")) {
    actions.push({ icon: "calendar-event", label: "Follow-up", onClick: onFollowUp, color: "#6c757d" });
  }

  if (actions.length === 0) return null;

  return (
    <div className="dropdown" onClick={(e) => e.stopPropagation()}>
      <button
        className="btn btn-sm btn-outline-primary"
        style={{ width: 36, height: 36, padding: 0, display: "flex", alignItems: "center", justifyContent: "center" }}
        onClick={() => setShowMenu(!showMenu)}
        title="Actions"
      >
        <i className="bi bi-three-dots-vertical"></i>
      </button>

      {showMenu && (
        <div className="dropdown-menu show" style={{ display: "block", minWidth: 220, position: "absolute", right: 0, zIndex: 1000 }}>
          {actions.map((action, idx) => (
            <button
              key={idx}
              className="dropdown-item"
              onClick={() => handleAction(action.onClick)}
              style={{ fontSize: 13, textAlign: "left" }}
            >
              <i className={`bi bi-${action.icon} me-2`} style={{ color: action.color }}></i>
              {action.label}
            </button>
          ))}
        </div>
      )}
      {showMenu && <div className="dropdown-backdrop fade show" onClick={() => setShowMenu(false)} style={{ zIndex: 999 }}></div>}
    </div>
  );
}
