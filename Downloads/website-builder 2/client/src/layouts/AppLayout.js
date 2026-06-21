import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// map module key -> route path
const PATH = {
  dashboard: "/", websites: "/websites", templates: "/templates", news: "/news", events: "/events",
  forms: "/forms", chatbot: "/chatbot", media: "/media", themes: "/themes", menus: "/menus",
  banners: "/banners", popups: "/popups", seo: "/seo", analytics: "/analytics",
  settings: "/settings", backup: "/backup", employeeTypes: "/employee-types", users: "/users",
};
const GROUP_ORDER = ["", "Content", "Design", "Grow", "System"];

export default function AppLayout() {
  const { user, perms, can, logout } = useAuth();
  const nav = useNavigate();
  const handleLogout = async () => { await logout(); nav("/login"); };

  // build visible modules from registry filtered by view permission
  const visible = (perms.modules || []).filter((m) => can(m.key, "view") && PATH[m.key]);
  const groups = GROUP_ORDER.map((g) => ({
    title: g,
    links: visible.filter((m) => (m.group || "") === g)
      .map((m) => ({ to: PATH[m.key], icon: m.icon, label: m.label, end: m.key === "dashboard" })),
  })).filter((grp) => grp.links.length > 0);

  return (
    <div className="d-flex" style={{ minHeight: "100vh" }}>
      <aside className="sidebar bg-dark text-white p-3 d-flex flex-column" style={{ overflowY: "auto", width: "240px", flexShrink: 0 }}>
        <h5 className="mb-4"><i className="bi bi-building-gear me-2" />WebBuilder</h5>
        <div className="flex-grow-1">
          {groups.map((g, gi) => (
            <div key={gi} className="mb-2">
              {g.title && <div className="text-uppercase text-secondary small px-2 mb-1" style={{ fontSize: ".7rem", letterSpacing: ".05em" }}>{g.title}</div>}
              <ul className="nav nav-pills flex-column gap-1">
                {g.links.map((l) => (
                  <li className="nav-item" key={l.to}>
                    <NavLink end={l.end} to={l.to} className="nav-link py-1"><i className={`bi ${l.icon} me-2`} />{l.label}</NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-top border-secondary pt-3">
          <div className="small text-secondary">{user?.name}</div>
          <div className="small text-secondary mb-2">{user?.isSuperAdmin ? "Super Admin" : (user?.employeeTypeName || "—")}</div>
          <button className="btn btn-sm btn-outline-light w-100" onClick={handleLogout}><i className="bi bi-box-arrow-right me-1" />Logout</button>
        </div>
      </aside>
      <main className="flex-grow-1 p-4" style={{ minWidth: 0 }}>
        <Outlet />
      </main>
    </div>
  );
}
