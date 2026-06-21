import { createContext, useContext, useEffect, useState, useCallback } from "react";
import api from "../api/client";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [perms, setPerms] = useState({ isSuperAdmin: false, permissions: {}, modules: [] });
  const [loading, setLoading] = useState(true);

  const loadPerms = useCallback(async () => {
    try {
      const r = await api.get("/users/me/permissions");
      setPerms(r.data);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    // Demo mode - skip auth and load default user with mock token
    const mockToken = "demo_token_" + Date.now();
    const mockUser = {
      _id: "demo-user",
      email: "admin@example.com",
      name: "Admin User",
      role: "super_admin"
    };
    const mockPerms = {
      isSuperAdmin: true,
      permissions: {
        dashboard: { view: true, create: true, edit: true, delete: true },
        websites: { view: true, create: true, edit: true, delete: true },
        pages: { view: true, create: true, edit: true, delete: true },
        media: { view: true, create: true, edit: true, delete: true },
        forms: { view: true, create: true, edit: true, delete: true },
        news: { view: true, create: true, edit: true, delete: true },
        events: { view: true, create: true, edit: true, delete: true },
        themes: { view: true, create: true, edit: true, delete: true },
        seo: { view: true, create: true, edit: true, delete: true },
        menus: { view: true, create: true, edit: true, delete: true },
        banners: { view: true, create: true, edit: true, delete: true },
        popups: { view: true, create: true, edit: true, delete: true },
        analytics: { view: true, create: true, edit: true, delete: true },
        settings: { view: true, create: true, edit: true, delete: true },
        chatbot: { view: true, create: true, edit: true, delete: true },
        backup: { view: true, create: true, edit: true, delete: true },
        employeeTypes: { view: true, create: true, edit: true, delete: true },
        users: { view: true, create: true, edit: true, delete: true },
        templates: { view: true, create: true, edit: true, delete: true }
      },
      modules: [
        { key: "dashboard", label: "Dashboard", icon: "bi-speedometer2", group: "" },
        { key: "websites", label: "Websites", icon: "bi-globe2", group: "" },
        { key: "templates", label: "Templates", icon: "bi-palette", group: "" },
        { key: "news", label: "News", icon: "bi-newspaper", group: "Content" },
        { key: "events", label: "Events", icon: "bi-calendar-event", group: "Content" },
        { key: "forms", label: "Forms", icon: "bi-file-earmark-text", group: "Content" },
        { key: "chatbot", label: "Chatbot", icon: "bi-chat-dots", group: "Content" },
        { key: "media", label: "Media", icon: "bi-image", group: "Content" },
        { key: "themes", label: "Themes", icon: "bi-paint-bucket", group: "Design" },
        { key: "menus", label: "Menus", icon: "bi-list-ul", group: "Design" },
        { key: "banners", label: "Banners", icon: "bi-badge-ad", group: "Design" },
        { key: "popups", label: "Popups", icon: "bi-window-fullscreen", group: "Design" },
        { key: "seo", label: "SEO", icon: "bi-search", group: "Grow" },
        { key: "analytics", label: "Analytics", icon: "bi-graph-up", group: "Grow" },
        { key: "settings", label: "Settings", icon: "bi-gear", group: "System" },
        { key: "backup", label: "Backup", icon: "bi-cloud-download", group: "System" },
        { key: "employeeTypes", label: "Employee Types", icon: "bi-person-badge", group: "System" },
        { key: "users", label: "Users", icon: "bi-people", group: "System" }
      ]
    };

    // Set mock token in localStorage so Axios includes it in requests
    localStorage.setItem("token", mockToken);
    setUser(mockUser);
    setPerms(mockPerms);
    setLoading(false);
  }, []);

  const login = async (email, password, token) => {
    const res = await api.post("/auth/login", { email, password, token });
    if (res.data.requires2FA) return { requires2FA: true, mustSetup: !!res.data.mustSetup };
    localStorage.setItem("token", res.data.token);
    setUser(res.data.user);
    await loadPerms();
    return { ok: true, mustSetup2FA: !!res.data.mustSetup2FA };
  };

  const logout = async () => {
    try { await api.post("/auth/logout"); } catch {}
    localStorage.removeItem("token");
    setUser(null);
    setPerms({ isSuperAdmin: false, permissions: {}, modules: [] });
  };

  // permission helper used across the app
  const can = (module, action = "view") => {
    if (perms.isSuperAdmin) return true;
    return !!perms.permissions?.[module]?.[action];
  };

  return (
    <AuthContext.Provider value={{ user, perms, loading, login, logout, can, reloadPerms: loadPerms }}>
      {children}
    </AuthContext.Provider>
  );
}
