import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext({});

const STORAGE_KEY = "em_auth_user";

const storage = {
  get() {
    if (typeof window === "undefined") return null;
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      try {
        window.localStorage.removeItem(STORAGE_KEY);
      } catch {}
      return null;
    }
  },
  set(userData) {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
    }
  },
  clear() {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  },
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => storage.get());

  const logout = () => {
    storage.clear();
    setUser(null);
  };

  const login = (userData) => {
    storage.set(userData);
    setUser(userData);
  };

  const hasPermission = (key) => user?.permissions?.includes(key) ?? false;

  // NOTE: inactivity timeout and activity listeners removed temporarily
  // to avoid automatic logouts during testing / development.

  return (
    <AuthContext.Provider value={{ user, login, logout, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
