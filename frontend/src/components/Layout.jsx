import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Avatar } from "./ui";

const NAV = [
  {
    label: "CRM",
    items: [
      { to: "/", end: true, icon: "speedometer2", label: "Dashboard", module: "dashboard" },
      { to: "/leads", icon: "flag", label: "Leads", module: "leads" },
      { to: "/followups", icon: "bell", label: "Follow-ups", module: "followups" },
      { to: "/conversion", icon: "graph-up", label: "Conversion", module: "conversion" },
      { to: "/contacts", icon: "people", label: "Contacts", module: "contacts" },
    ],
  },
  {
    label: "Engage",
    items: [
      { to: "/chat", icon: "chat-dots", label: "Conversations", module: "chat" },
      { to: "/campaigns", icon: "send", label: "Bulk Campaigns", module: "blast" },
      { to: "/history", icon: "clock-history", label: "Message History", module: "reports" },
      { to: "/templates", icon: "file-text", label: "Templates", module: "blast" },
    ],
  },
  {
    label: "Administration",
    items: [
      { to: "/setup", icon: "gear", label: "Setup", module: "setup" },
      { to: "/audit", icon: "shield-check", label: "Audit Logs", module: "reports" },
    ],
  },
];

const TITLES = {
  "/": "Dashboard", "/leads": "Leads", "/followups": "Follow-ups", "/conversion": "Conversion Dashboard",
  "/contacts": "Contacts", "/chat": "Conversations", "/campaigns": "Bulk Campaigns",
  "/history": "Message History", "/templates": "Templates", "/setup": "Setup", "/audit": "Audit Logs",
};

export default function Layout() {
  const { user, logout, can } = useAuth();
  const loc = useLocation();
  const title = TITLES[loc.pathname] || "CRM";
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const stored = localStorage.getItem("sidebar-open");
    return stored !== null ? JSON.parse(stored) : true;
  });

  useEffect(() => {
    localStorage.setItem("sidebar-open", JSON.stringify(sidebarOpen));
  }, [sidebarOpen]);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className={`app-shell ${sidebarOpen ? "" : "sidebar-closed"}`}>
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="brand">
            <span className="mark"><i className="bi bi-whatsapp"></i></span>
            <div className="brand-copy">
              <div className="brand-title">WhatsApp CRM</div>
              <div className="brand-sub">Admissions Suite</div>
            </div>
          </div>
          <button
            className="sidebar-toggle btn btn-sm btn-outline-light border-0"
            title={sidebarOpen ? "Close sidebar" : "Open sidebar"}
            onClick={toggleSidebar}
          >
            <i className={`bi ${sidebarOpen ? "bi-layout-sidebar" : "bi-layout-sidebar-reverse"}`}></i>
          </button>
        </div>

        <div className="flex-grow-1 overflow-auto">
          {NAV.map((group) => {
            const visible = group.items.filter((it) => can(it.module, "view"));
            if (!visible.length) return null;
            return (
              <div className="nav-section" key={group.label}>
                <div className="nav-label">{group.label}</div>
                {visible.map((it) => (
                  <NavLink
                    key={it.to}
                    to={it.to}
                    end={it.end}
                    className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}
                    onClick={() => {
                      if (it.to === "/setup") {
                        setSidebarOpen(false);
                      }
                    }}
                  >
                    <i className={`bi bi-${it.icon}`}></i>
                    <span>{it.label}</span>
                  </NavLink>
                ))}
              </div>
            );
          })}
        </div>

        <div className="side-footer">
          <Avatar name={user?.name || "?"} size={30} />
          <div className="flex-grow-1 min-w-0">
            <div className="text-white text-truncate" style={{ fontSize: 12.5 }}>{user?.name}</div>
            <div className="text-truncate" style={{ fontSize: 10.5, color: "#6b7480" }}>{user?.userType?.name}</div>
          </div>
          <button className="btn btn-sm btn-outline-light border-0" title="Log out" onClick={logout}>
            <i className="bi bi-box-arrow-right"></i>
          </button>
        </div>
      </aside>

      <div className="main">
        <div className="topbar">
          <h2 className="h6 mb-0 fw-semibold">{title}</h2>
          <div className="ms-auto d-flex align-items-center gap-3 text-secondary">
            <i className="bi bi-bell"></i>
            <span className="small">{user?.email}</span>
          </div>
        </div>
        <div className="content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
