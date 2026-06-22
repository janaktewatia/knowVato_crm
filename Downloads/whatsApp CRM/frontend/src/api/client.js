// Central HTTP client. Attaches the JWT, parses the backend's {ok,data} envelope,
// and throws a useful error on failure. All API modules build on this.

const BASE = import.meta.env.VITE_API_BASE || ""; // "" → use Vite proxy in dev

let token = localStorage.getItem("wacrm_token") || null;

export function setToken(t) {
  token = t;
  if (t) localStorage.setItem("wacrm_token", t);
  else localStorage.removeItem("wacrm_token");
}
export function getToken() {
  return token;
}

async function request(method, path, body) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE}/api${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  let json = null;
  try {
    json = await res.json();
  } catch {
    /* non-JSON response */
  }

  if (!res.ok) {
    // 401 → token invalid/expired: clear it so the app redirects to login
    if (res.status === 401) setToken(null);
    const message = json?.error || `${res.status} ${res.statusText}`;
    const err = new Error(message);
    err.status = res.status;
    err.details = json?.details;
    throw err;
  }

  // backend envelope is { ok, data, ... } — return the useful part
  if (json && Object.prototype.hasOwnProperty.call(json, "data")) return json;
  return json;
}

export const http = {
  get: (p) => request("GET", p),
  post: (p, b) => request("POST", p, b),
  patch: (p, b) => request("PATCH", p, b),
  del: (p) => request("DELETE", p),
};
