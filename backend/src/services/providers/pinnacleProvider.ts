import crypto from "crypto";
import {
  WhatsAppProvider,
  SendResult,
  InboundEvent,
  ProviderCredentials,
  normalizePhone,
  InteractiveButton,
  InteractiveListSection,
} from "./types";

/**
 * Pinnacle Teleservices — BSP vendor adapter.
 */
export class PinnacleProvider implements WhatsAppProvider {
  readonly vendor = "pinnacle" as const;
  private baseUrl: string;
  private apiKey: string;
  private sender: string;
  private verifyTokenValue: string;
  private signingSecret: string;

  constructor(creds: ProviderCredentials) {
    this.baseUrl = creds.apiBaseUrl || "";
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
    throw new Error("Pinnacle provider is not fully configured.");
  }

  private async call(path: string, body: any): Promise<any> {
    if (!this.isLive) this.notConfigured();
    const res = await fetch(`${this.baseUrl}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(body),
    });
    const json: any = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(`Pinnacle API ${res.status}: ${JSON.stringify(json)}`);
    return json;
  }

  async sendTemplate(
    to: string,
    templateName: string,
    languageCode = "en",
    bodyParams: string[] = []
  ): Promise<SendResult> {
    const payload = {
      from: this.sender,
      to: normalizePhone(to),
      type: "template",
      template: { name: templateName, language: languageCode, params: bodyParams },
    };
    const json = await this.call("/messages", payload);
    const id = json.messageId || json.id || json.data?.id || "pinnacle-unknown";
    return { waMessageId: id, simulated: false, raw: json };
  }

  async sendText(to: string, text: string): Promise<SendResult> {
    const payload = { from: this.sender, to: normalizePhone(to), type: "text", text };
    const json = await this.call("/messages", payload);
    const id = json.messageId || json.id || json.data?.id || "pinnacle-unknown";
    return { waMessageId: id, simulated: false, raw: json };
  }

  async sendMedia(
    to: string,
    mediaType: "image" | "video" | "document" | "audio",
    mediaUrl: string,
    caption?: string
  ): Promise<SendResult> {
    const payload = {
      from: this.sender,
      to: normalizePhone(to),
      type: mediaType,
      mediaUrl,
      caption,
    };
    const json = await this.call("/messages", payload);
    const id = json.messageId || json.id || json.data?.id || "pinnacle-unknown";
    return { waMessageId: id, simulated: false, raw: json };
  }

  async sendLocation(
    to: string,
    lat: number,
    lng: number,
    name?: string,
    address?: string
  ): Promise<SendResult> {
    const payload = {
      from: this.sender,
      to: normalizePhone(to),
      type: "location",
      location: { latitude: lat, longitude: lng, name, address },
    };
    const json = await this.call("/messages", payload);
    const id = json.messageId || json.id || json.data?.id || "pinnacle-unknown";
    return { waMessageId: id, simulated: false, raw: json };
  }

  async sendInteractiveButtons(
    to: string,
    bodyText: string,
    buttons: InteractiveButton[]
  ): Promise<SendResult> {
    const payload = {
      from: this.sender,
      to: normalizePhone(to),
      type: "interactive_buttons",
      body: bodyText,
      buttons,
    };
    const json = await this.call("/messages", payload);
    const id = json.messageId || json.id || json.data?.id || "pinnacle-unknown";
    return { waMessageId: id, simulated: false, raw: json };
  }

  async sendInteractiveList(
    to: string,
    bodyText: string,
    buttonTitle: string,
    sections: InteractiveListSection[]
  ): Promise<SendResult> {
    const payload = {
      from: this.sender,
      to: normalizePhone(to),
      type: "interactive_list",
      body: bodyText,
      buttonTitle,
      sections,
    };
    const json = await this.call("/messages", payload);
    const id = json.messageId || json.id || json.data?.id || "pinnacle-unknown";
    return { waMessageId: id, simulated: false, raw: json };
  }

  async createMetaTemplate(): Promise<any> {
    return { status: "submitted" };
  }

  async fetchMetaTemplates(): Promise<any[]> {
    return [];
  }

  async deleteMetaTemplate(): Promise<any> {
    return { success: true };
  }

  async getPhoneProfile(): Promise<any> {
    return { display_phone_number: this.sender };
  }

  async updateBusinessProfile(profileData: any): Promise<any> {
    return { success: true, updated: profileData };
  }

  verifyWebhook(rawBody: Buffer, headers: Record<string, any>): boolean {
    if (!this.signingSecret) return true;
    const signature = headers["x-pinnacle-signature"];
    if (!signature) return false;
    const expected = crypto.createHmac("sha256", this.signingSecret).update(rawBody).digest("hex");
    try {
      return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
    } catch {
      return false;
    }
  }

  parseInbound(body: any): InboundEvent[] {
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
