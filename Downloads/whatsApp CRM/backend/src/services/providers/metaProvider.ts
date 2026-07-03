import crypto from "crypto";
import {
  WhatsAppProvider, SendResult, InboundEvent, ProviderCredentials, normalizePhone,
} from "./types";

/**
 * Meta direct — talks straight to graph.facebook.com (WhatsApp Cloud API).
 * Use this when you hold the WABA + token directly from Meta (no BSP vendor).
 */
export class MetaProvider implements WhatsAppProvider {
  readonly vendor = "meta" as const;
  private apiVersion: string;
  private token: string;
  private phoneNumberId: string;
  private appSecret: string;
  private verifyTokenValue: string;

  constructor(creds: ProviderCredentials) {
    this.apiVersion = creds.extra?.apiVersion || "v21.0";
    this.token = creds.accessToken || "";
    this.phoneNumberId = creds.phoneNumberId || "";
    this.appSecret = creds.appSecret || "";
    this.verifyTokenValue = creds.verifyToken || "";
  }

  get isLive() {
    return !!this.token && !!this.phoneNumberId;
  }

  private async post(path: string, body: any): Promise<any> {
    const url = `https://graph.facebook.com/${this.apiVersion}/${path}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${this.token}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json: any = await res.json();
    if (!res.ok) throw new Error(`Meta API ${res.status}: ${JSON.stringify(json?.error || json)}`);
    return json;
  }

  async sendTemplate(to: string, templateName: string, languageCode = "en", bodyParams: string[] = []): Promise<SendResult> {
    const components =
      bodyParams.length > 0
        ? [{ type: "body", parameters: bodyParams.map((t) => ({ type: "text", text: t })) }]
        : undefined;
    const payload: any = {
      messaging_product: "whatsapp",
      to: normalizePhone(to),
      type: "template",
      template: { name: templateName, language: { code: languageCode }, ...(components ? { components } : {}) },
    };
    const json = await this.post(`${this.phoneNumberId}/messages`, payload);
    return { waMessageId: json.messages?.[0]?.id, simulated: false, raw: json };
  }

  async sendText(to: string, text: string): Promise<SendResult> {
    const payload = {
      messaging_product: "whatsapp",
      to: normalizePhone(to),
      type: "text",
      text: { body: text },
    };
    const json = await this.post(`${this.phoneNumberId}/messages`, payload);
    return { waMessageId: json.messages?.[0]?.id, simulated: false, raw: json };
  }

  verifyWebhook(rawBody: Buffer, headers: Record<string, any>): boolean {
    if (!this.appSecret) return true; // dev: can't verify without secret
    const signature = headers["x-hub-signature-256"];
    if (!signature) return false;
    const expected = "sha256=" + crypto.createHmac("sha256", this.appSecret).update(rawBody).digest("hex");
    try {
      return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
    } catch {
      return false;
    }
  }

  // GET-handshake verify token (used by the webhook controller)
  get verifyToken() {
    return this.verifyTokenValue;
  }

  parseInbound(body: any): InboundEvent[] {
    const events: InboundEvent[] = [];
    for (const entry of body.entry || []) {
      for (const change of entry.changes || []) {
        const value = change.value || {};
        for (const st of value.statuses || []) {
          events.push({
            kind: "status",
            waMessageId: st.id,
            status: st.status,
            errorReason: st.errors?.[0]?.title,
            timestamp: st.timestamp ? new Date(+st.timestamp * 1000) : new Date(),
          });
        }
        for (const msg of value.messages || []) {
          events.push({
            kind: "message",
            from: msg.from,
            text: msg.text?.body || `[${msg.type}]`,
            messageType: msg.type,
            timestamp: msg.timestamp ? new Date(+msg.timestamp * 1000) : new Date(),
          });
        }
      }
    }
    return events;
  }
}
