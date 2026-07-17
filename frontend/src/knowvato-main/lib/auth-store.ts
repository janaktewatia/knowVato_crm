import { useEffect, useState } from "react";

export type AuthUser = { name: string; email: string };

const KEY = "orbitops.auth";

function read(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

const listeners = new Set<() => void>();
function emit() {
  listeners.forEach((l) => l());
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    setUser(read());
    const cb = () => setUser(read());
    listeners.add(cb);
    return () => {
      listeners.delete(cb);
    };
  }, []);

  return {
    user,
    login: (u: AuthUser) => {
      localStorage.setItem(KEY, JSON.stringify(u));
      emit();
    },
    logout: () => {
      localStorage.removeItem(KEY);
      emit();
    },
  };
}
