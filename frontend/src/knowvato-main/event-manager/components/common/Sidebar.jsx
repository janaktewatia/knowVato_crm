import React from "react";
import { useLocation, useNavigate } from "../../lib/router-shim";
import { BiScan, BiUpload, BiUserPlus } from "react-icons/bi";
import { AiOutlineQrcode } from "react-icons/ai";
import { FiX, FiGrid, FiCalendar, FiSettings, FiMessageCircle } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";

const Sidebar = ({ isMobileMenuOpen, onClose }) => {
  const location = useLocation();
  const path = location.pathname;
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const isActive = (p) => path === p || path.startsWith(p + "/");

  const can = (permission) => {
    if (!permission) return true;
    if (!user?.permissions?.length) return true;
    return user.permissions.includes(permission);
  };

  const NavItem = ({ icon, label, to, exact, permission }) => {
    if (!can(permission)) return null;
    const active = exact ? path === to : isActive(to);
    return (
      <button
        type="button"
        onClick={() => {
          // debug: confirm click handler runs
          // eslint-disable-next-line no-console
          console.debug("Sidebar navigate:", to);
          navigate(to);
          if (onClose) onClose();
        }}
        className={`nav-link btn btn-ghost text-start w-100 mb-1 d-flex align-items-center gap-2 ${
          active ? "active" : ""
        }`}
        style={{
          color: active ? "var(--sidebar-primary)" : "var(--sidebar-foreground)",
          background: active ? "var(--sidebar-primary)" : "transparent",
          fontWeight: active ? 600 : 400,
          textDecoration: "none",
          borderRadius: "var(--radius)",
          padding: "0.5rem 0.75rem",
          transition: "all 0.2s",
        }}
        onMouseEnter={(e) => {
          if (!active) {
            e.currentTarget.style.background = "var(--sidebar-accent)";
            e.currentTarget.style.color = "var(--sidebar-accent-foreground)";
          }
        }}
        onMouseLeave={(e) => {
          if (!active) {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "var(--sidebar-foreground)";
          }
        }}
      >
        <span style={{ fontSize: 16, display: "flex", alignItems: "center" }}>
          {icon}
        </span>
        {label}
      </button>
    );
  };

  return (
    <aside
      className={`sidebar d-flex flex-column p-3 ${isMobileMenuOpen ? "show" : ""}`}
      style={{ background: "var(--sidebar)", color: "var(--sidebar-foreground)" }}
      onPointerDown={(e) => {
        // eslint-disable-next-line no-console
        console.debug("Sidebar pointerDown", e.target && e.target.tagName);
      }}
    >
      {/* Header */}
      <div className="sidebar__header mb-4">
        <div>
          <h4
            className="fw-bold mb-1"
            style={{ color: "var(--sidebar-primary)", fontSize: 16 }}
          >
            Event Management
          </h4>
          <p className="small mb-0" style={{ fontSize: 11, color: "var(--sidebar-foreground)", opacity: 0.7 }}>
            Scan · Register · Track
          </p>
        </div>
        <button
          type="button"
          className="sidebar__close d-md-none"
          onClick={onClose}
          aria-label="Close navigation"
        >
          <FiX size={20} />
        </button>
      </div>

      {/* Primary nav */}
      <div className="flex-grow-1">
        <NavItem
          icon={<FiGrid />}
          label="Dashboard"
          to="/dashboard"
          exact
          permission="reports.dashboard"
        />
        <NavItem
          icon={<FiCalendar />}
          label="Create Event"
          to="/events"
          permission="events.view"
        />
        <NavItem
          icon={<BiUserPlus className="fs-6" />}
          label="Registrants"
          to="/registrants"
          permission="attendees.view"
        />
        <NavItem
          icon={<BiScan className="fs-6" />}
          label="Scan Pass"
          to="/scan"
          exact
          permission="scan.access"
        />

        {(can("events.view") || can("reports.dashboard")) &&
          can("scan.access") && (
            <div
              style={{ height: 1, background: "var(--sidebar-border)", margin: "0.6rem 0" }}
            />
          )}

        <NavItem
          icon={<AiOutlineQrcode className="fs-5" />}
          label="Generate QR Code"
          to="/"
          exact
          permission="pass.generate"
        />
        <NavItem
          icon={<BiUpload className="fs-6" />}
          label="Bulk QR Codes"
          to="/bulk-qr"
          exact
          permission="pass.generate"
        />

        {can("setup.access") && (
          <div
            style={{ height: 1, background: "var(--sidebar-border)", margin: "0.6rem 0" }}
          />
        )}

        <NavItem
          icon={<FiSettings />}
          label="Setup"
          to="/setup"
          exact
          permission="setup.access"
        />
        <NavItem
          icon={<FiSettings />}
          label="Communication Setup"
          to="/communication-setup"
          exact
          permission="setup.access"
        />
        <NavItem
          icon={<FiSettings />}
          label="Templates"
          to="/communication-templates"
          exact
          permission="setup.access"
        />
        <NavItem
          icon={<FiMessageCircle />}
          label="WhatsApp Integration"
          to="/whatsapp"
          exact
          permission="setup.access"
        />
      </div>

      {/* Profile & Logout */}
      {user && (
        <div className="pt-3 mt-auto" style={{ borderTop: "1px solid var(--sidebar-border)" }}>
          <div className="d-flex align-items-center gap-2 mb-2">
            <div
              className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
              style={{ width: 34, height: 34, background: "var(--sidebar-primary)" }}
            >
              <i
                className="bi bi-person"
                style={{ fontSize: 14, color: "var(--sidebar-primary-foreground)" }}
              />
            </div>
            <div className="flex-grow-1 min-w-0">
              <p
                className="small fw-600 mb-0"
                style={{ fontSize: 12, color: "var(--sidebar-foreground)" }}
              >
                {user.name || "User"}
              </p>
              <p className="small mb-0" style={{ fontSize: 11, color: "var(--sidebar-foreground)", opacity: 0.7 }}>
                {user.userTypeName || ""}
              </p>
            </div>
          </div>
          <button
            type="button"
            className="btn btn-sm w-100"
            style={{
              background: "var(--sidebar-accent)",
              color: "var(--sidebar-accent-foreground)",
              border: "1px solid var(--sidebar-border)",
              borderRadius: "var(--radius)",
              fontSize: 12,
              fontWeight: 500,
              transition: "all 0.2s",
            }}
            onClick={logout}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--sidebar-primary)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "var(--sidebar-accent)";
            }}
          >
            <i className="bi bi-box-arrow-right me-2" />
            Logout
          </button>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
