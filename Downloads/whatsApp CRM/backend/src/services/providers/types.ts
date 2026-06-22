/**
 * Provider abstraction for WhatsApp vendors.
 *
 * The CRM/messaging pipeline never talks to a vendor directly — it talks to a
 * WhatsAppProvider. Each vendor (Meta direct, Pinnacle, Gupshup, Twilio, …)
 * implements this same contract, so adding or switching a vendor is config,
 * not code.
 */

export type VendorKey = "simulation" | "meta" | "pinnacle" | "gupshup" | "twilio";

export interface SendResult {
  waMessageId: string;
  simulated: boolean;
  raw?: any;
}

/** A normalized inbound event after a provider parses its own webhook payload. */
export interface InboundEvent {
  kind: "status" | "message";
  // status events
  waMessageId?: string;
  status?: "sent" | "delivered" | "read" | "failed";
  errorReason?: string;
  timestamp?: Date;
  // message events
  from?: string;
  text?: string;
  messageType?: string;
}

/** Credentials/config for one configured vendor account (decrypted, runtime shape). */
export interface ProviderCredentials {
  vendor: VendorKey;
  // common
  apiBaseUrl?: string;
  apiKey?: string;
  accessToken?: string;
  phoneNumberId?: string;
  wabaId?: string;
  senderNumber?: string;
  // webhook trust
  verifyToken?: string;
  appSecret?: string;
  // vendor-specific extras live here
  extra?: Record<string, any>;
}

export interface WhatsAppProvider {
  readonly vendor: VendorKey;
  readonly isLive: boolean;

  sendTemplate(
    to: string,
    templateName: string,
    languageCode: string,
    bodyParams: string[]
  ): Promise<SendResult>;

  sendText(to: string, text: string): Promise<SendResult>;

  /** Verify an incoming webhook (signature/token). Return true if trusted. */
  verifyWebhook(rawBody: Buffer, headers: Record<string, any>): boolean;

  /** Parse this vendor's webhook body into normalized InboundEvent[]. */
  parseInbound(body: any): InboundEvent[];
}

export function normalizePhone(p: string): string {
  return p.replace(/[^\d]/g, "");
}
