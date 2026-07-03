/**
 * Typed clients that modules use to call the central services.
 * A module never re-implements users or templates — it imports these.
 */
import { PlatformUser } from "./types";

async function call(base: string, path: string, token: string, init?: RequestInit): Promise<any> {
  const res = await fetch(`${base}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(init?.headers || {}),
    },
  });
  const json: any = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.error || `${res.status} calling ${path}`);
  return json?.data ?? json;
}

/* ---- Identity ---- */
export class IdentityClient {
  constructor(private baseUrl: string) {}
  me(token: string): Promise<{ user: PlatformUser; perms: string[] }> {
    return call(this.baseUrl, "/auth/me", token);
  }
  getUser(token: string, id: string): Promise<PlatformUser> {
    return call(this.baseUrl, `/users/${id}`, token);
  }
  listUsers(token: string): Promise<PlatformUser[]> {
    return call(this.baseUrl, "/users", token);
  }
}

/* ---- Communication (templates + sending; shared by all modules) ---- */
export interface Template {
  _id: string;
  name: string;
  language: string;
  category: string;
  status: string;
  body: string;
}
export class CommunicationClient {
  constructor(private baseUrl: string) {}

  // Templates created here are visible to EVERY module.
  listTemplates(token: string, params?: { status?: string }): Promise<Template[]> {
    const q = params?.status ? `?status=${params.status}` : "";
    return call(this.baseUrl, `/templates${q}`, token);
  }
  createTemplate(token: string, body: Partial<Template>): Promise<Template> {
    return call(this.baseUrl, `/templates`, token, { method: "POST", body: JSON.stringify(body) });
  }

  // Send a WhatsApp message using a shared template (any module can call this).
  sendWhatsAppTemplate(token: string, to: string, templateName: string, params: string[] = []): Promise<any> {
    return call(this.baseUrl, `/messages/send`, token, {
      method: "POST",
      body: JSON.stringify({ channel: "whatsapp", to, template: templateName, params }),
    });
  }
}

/** Factory: build all clients from the gateway base + service prefixes. */
export function createPlatformClients(gatewayBase: string) {
  return {
    identity: new IdentityClient(`${gatewayBase}/identity`),
    communication: new CommunicationClient(`${gatewayBase}/communication`),
  };
}
