import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { authApi } from "../api";
import { setToken, getToken } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [perms, setPerms] = useState([]);
  const [loading, setLoading] = useState(true);

  // On boot, if a token exists, fetch the current user
  useEffect(() => {
    (async () => {
      if (!getToken()) {
        setLoading(false);
        return;
      }
      try {
        const res = await authApi.me();
        setUser(res.data.user);
        setPerms(res.data.perms || []);
      } catch {
        setToken(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await authApi.login(email, password);
    setToken(res.data.token);
    setUser(res.data.user);
    setPerms(res.data.user?.userType?.perms || []);
    return res.data.user;
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    setPerms([]);
  }, []);

  // permission check: can(module, action)
  const can = useCallback(
    (module, action = "view") => {
      const p = perms.find((x) => x.module === module);
      return !!p && !!p[action];
    },
    [perms]
  );

  return (
    <AuthContext.Provider value={{ user, perms, loading, login, logout, can }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
