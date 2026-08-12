/**
 * Provider abstraction for Meta WhatsApp Business Platform / Cloud API & vendors.
 */

export type VendorKey = "simulation" | "meta" | "pinnacle" | "gupshup" | "twilio";

export interface SendResult {
  waMessageId: string;
  simulated: boolean;
  raw?: any;
}

export type MetaHeaderFormat = "TEXT" | "IMAGE" | "VIDEO" | "DOCUMENT" | "LOCATION";

export type MetaButtonType = "QUICK_REPLY" | "PHONE_NUMBER" | "URL" | "COPY_CODE" | "FLOW";

export interface MetaTemplateButton {
  type: MetaButtonType;
  text: string;
  url?: string;
  phoneNumber?: string;
  code?: string;
  flowId?: string;
  example?: string[];
}

export interface MetaTemplateComponent {
  type: "HEADER" | "BODY" | "FOOTER" | "BUTTONS";
  format?: MetaHeaderFormat;
  text?: string;
  example?: any;
  buttons?: MetaTemplateButton[];
}

export interface InteractiveButton {
  id: string;
  title: string;
}

export interface InteractiveListRow {
  id: string;
  title: string;
  description?: string;
}

export interface InteractiveListSection {
  title: string;
  rows: InteractiveListRow[];
}

/** Normalized inbound event after parsing webhook payload */
export interface InboundEvent {
  kind: "status" | "message" | "template_status_update";
  // status events
  waMessageId?: string;
  status?: "sent" | "delivered" | "read" | "failed";
  errorReason?: string;
  timestamp?: Date;

  // message events
  from?: string;
  to?: string;
  text?: string;
  messageType?: "text" | "image" | "video" | "document" | "audio" | "location" | "interactive" | "template" | "button" | "contacts";
  mediaUrl?: string;
  mediaCaption?: string;
  mediaFilename?: string;
  location?: {
    latitude: number;
    longitude: number;
    name?: string;
    address?: string;
  };
  interactiveReply?: {
    id: string;
    title: string;
    description?: string;
    type: "button_reply" | "list_reply";
  };

  // template status update events
  templateStatus?: "APPROVED" | "REJECTED" | "PENDING" | "PAUSED" | "DISABLED";
  templateName?: string;
  templateId?: string;
}

export interface ProviderCredentials {
  vendor: VendorKey;
  apiBaseUrl?: string;
  apiKey?: string;
  accessToken?: string;
  phoneNumberId?: string;
  wabaId?: string;
  senderNumber?: string;
  verifyToken?: string;
  appSecret?: string;
  extra?: Record<string, any>;
}

export interface WhatsAppProvider {
  readonly vendor: VendorKey;
  readonly isLive: boolean;

  sendTemplate(
    to: string,
    templateName: string,
    languageCode?: string,
    components?: any[]
  ): Promise<SendResult>;

  sendText(to: string, text: string, previewUrl?: boolean): Promise<SendResult>;

  sendMedia(
    to: string,
    mediaType: "image" | "video" | "document" | "audio",
    mediaUrl: string,
    caption?: string,
    filename?: string
  ): Promise<SendResult>;

  sendLocation(
    to: string,
    lat: number,
    lng: number,
    name?: string,
    address?: string
  ): Promise<SendResult>;

  sendInteractiveButtons(
    to: string,
    bodyText: string,
    buttons: InteractiveButton[],
    header?: { type: "text" | "image"; textOrUrl: string },
    footer?: string
  ): Promise<SendResult>;

  sendInteractiveList(
    to: string,
    bodyText: string,
    buttonTitle: string,
    sections: InteractiveListSection[],
    header?: string,
    footer?: string
  ): Promise<SendResult>;

  createMetaTemplate(wabaId: string, templatePayload: any): Promise<any>;

  fetchMetaTemplates(wabaId: string): Promise<any[]>;

  deleteMetaTemplate(wabaId: string, templateName: string): Promise<any>;

  getPhoneProfile(): Promise<any>;

  updateBusinessProfile(profileData: any): Promise<any>;

  verifyWebhook(rawBody: Buffer, headers: Record<string, any>): boolean;

  parseInbound(body: any): InboundEvent[];
}

export function normalizePhone(p: string): string {
  return p.replace(/[^\d]/g, "");
}
