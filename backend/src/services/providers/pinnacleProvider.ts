import crypto from "crypto";
import {
  WhatsAppProvider, SendResult, InboundEvent, ProviderCredentials, normalizePhone,
} from "./types";

/**
 * Pinnacle Teleservices — BSP vendor adapter (STUB).
 *
 * Structure is in place; the exact endpoint paths, request body shape, auth
 * header, and webhook payload format must be filled in from Pinnacle's API
 * documentation. Every spot that needs their doc is marked  ▶ FROM PINNACLE DOC.
 *
 * Once the doc is provided, only this file changes — the CRM, queue, message
 * log, 24h-window logic and webhook controller stay exactly as they are.
 */
export class PinnacleProvider implements WhatsAppProvider {
  readonly vendor = "pinnacle" as const;
  private baseUrl: string;
  private apiKey: string;
  private sender: string;
  private verifyTokenValue: string;
  private signingSecret: string;

  constructor(creds: ProviderCredentials) {
    // ▶ FROM PINNACLE DOC: confirm which of these they issue.
    this.baseUrl = creds.apiBaseUrl || "";       // e.g. https://api.pinnacle.in/... (placeholder)
    this.apiKey = creds.apiKey || creds.accessToken || "";
    this.sender = creds.senderNumber || creds.phoneNumberId || "";
    this.verifyTokenValue = creds.verifyToken || "";
    this.signingSecret = creds.appSecret || "";
  }

  get isLive() {
    return !!this.baseUrl && !!this.apiKey && !!this.sender;
  }

  get verifyToken() {
    return this.verifyTokenValue;
  }

  private notConfigured(): never {
    throw new Error(
      "Pinnacle provider is not fully configured. Fill the endpoint/payload " +
        "details from Pinnacle's API doc in pinnacleProvider.ts, and set " +
        "apiBaseUrl + apiKey + senderNumber on the active WhatsApp account."
    );
  }

  private async call(path: string, body: any): Promise<any> {
    if (!this.isLive) this.notConfigured();
    // ▶ FROM PINNACLE DOC: confirm auth header name/scheme (Bearer? apikey? key in body?).
    const res = await fetch(`${this.baseUrl}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`, // ▶ adjust to their scheme
      },
      body: JSON.stringify(body),
    });
    const json: any = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(`Pinnacle API ${res.status}: ${JSON.stringify(json)}`);
    return json;
  }

  async sendTemplate(to: string, templateName: string, languageCode = "en", bodyParams: string[] = []): Promise<SendResult> {
    // ▶ FROM PINNACLE DOC: their exact send-template endpoint + body shape.
    const payload = {
      from: this.sender,
      to: normalizePhone(to),
      type: "template",
      template: { name: templateName, language: languageCode, params: bodyParams },
    };
    const json = await this.call("/messages", payload); // ▶ confirm path
    // ▶ FROM PINNACLE DOC: where the provider message id lives in the response.
    const id = json.messageId || json.id || json.data?.id || "pinnacle-unknown";
    return { waMessageId: id, simulated: false, raw: json };
  }

  async sendText(to: string, text: string): Promise<SendResult> {
    // ▶ FROM PINNACLE DOC: their session/free-form text endpoint + body shape.
    const payload = { from: this.sender, to: normalizePhone(to), type: "text", text };
    const json = await this.call("/messages", payload); // ▶ confirm path
    const id = json.messageId || json.id || json.data?.id || "pinnacle-unknown";
    return { waMessageId: id, simulated: false, raw: json };
  }

  verifyWebhook(rawBody: Buffer, headers: Record<string, any>): boolean {
    // ▶ FROM PINNACLE DOC: do they sign webhooks? which header / algorithm?
    if (!this.signingSecret) return true; // accept until their scheme is known
    const signature = headers["x-pinnacle-signature"]; // ▶ confirm header name
    if (!signature) return false;
    const expected = crypto.createHmac("sha256", this.signingSecret).update(rawBody).digest("hex");
    try {
      return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
    } catch {
      return false;
    }
  }

  parseInbound(body: any): InboundEvent[] {
    // ▶ FROM PINNACLE DOC: their webhook payload shape for statuses + inbound msgs.
    // Below is a reasonable guess to be corrected against the doc.
    const events: InboundEvent[] = [];
    const items = Array.isArray(body?.events) ? body.events : Array.isArray(body) ? body : [body];
    for (const ev of items) {
      if (!ev) continue;
      if (ev.status) {
        events.push({
          kind: "status",
          waMessageId: ev.messageId || ev.id,
          status: ev.status,
          errorReason: ev.reason,
          timestamp: ev.timestamp ? new Date(ev.timestamp) : new Date(),
        });
      } else if (ev.message || ev.text) {
        events.push({
          kind: "message",
          from: ev.from || ev.mobile || ev.sender,
          text: ev.message || ev.text,
          messageType: ev.type || "text",
          timestamp: ev.timestamp ? new Date(ev.timestamp) : new Date(),
        });
      }
    }
    return events;
  }
}
