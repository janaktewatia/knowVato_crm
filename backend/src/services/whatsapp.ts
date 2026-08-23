import { getActiveProvider } from "./providers/registry";
import {
  SendResult,
  InboundEvent,
  InteractiveButton,
  InteractiveListSection,
} from "./providers/types";

/**
 * Tenant-aware WhatsApp facade connecting to Meta Graph API or active vendor.
 */

export async function sendTemplate(
  tenantId: string,
  to: string,
  templateName: string,
  languageCode = "en",
  componentsOrParams: any = []
): Promise<SendResult> {
  const provider = await getActiveProvider(tenantId);
  // Support legacy array of strings or full Meta component array
  let components: any[] = [];
  if (Array.isArray(componentsOrParams)) {
    if (componentsOrParams.length > 0 && typeof componentsOrParams[0] === "string") {
      components = [
        {
          type: "body",
          parameters: componentsOrParams.map((t) => ({ type: "text", text: t })),
        },
      ];
    } else {
      components = componentsOrParams;
    }
  }

  return provider.sendTemplate(to, templateName, languageCode, components);
}

export async function sendText(
  tenantId: string,
  to: string,
  text: string,
  previewUrl = true
): Promise<SendResult> {
  const provider = await getActiveProvider(tenantId);
  return provider.sendText(to, text, previewUrl);
}

export async function sendMedia(
  tenantId: string,
  to: string,
  mediaType: "image" | "video" | "document" | "audio",
  mediaUrl: string,
  caption?: string,
  filename?: string
): Promise<SendResult> {
  const provider = await getActiveProvider(tenantId);
  return provider.sendMedia(to, mediaType, mediaUrl, caption, filename);
}

export async function sendLocation(
  tenantId: string,
  to: string,
  lat: number,
  lng: number,
  name?: string,
  address?: string
): Promise<SendResult> {
  const provider = await getActiveProvider(tenantId);
  return provider.sendLocation(to, lat, lng, name, address);
}

export async function sendInteractiveButtons(
  tenantId: string,
  to: string,
  bodyText: string,
  buttons: InteractiveButton[],
  header?: { type: "text" | "image"; textOrUrl: string },
  footer?: string
): Promise<SendResult> {
  const provider = await getActiveProvider(tenantId);
  return provider.sendInteractiveButtons(to, bodyText, buttons, header, footer);
}

export async function sendInteractiveList(
  tenantId: string,
  to: string,
  bodyText: string,
  buttonTitle: string,
  sections: InteractiveListSection[],
  header?: string,
  footer?: string
): Promise<SendResult> {
  const provider = await getActiveProvider(tenantId);
  return provider.sendInteractiveList(to, bodyText, buttonTitle, sections, header, footer);
}

export async function createMetaTemplate(tenantId: string, templatePayload: any): Promise<any> {
  const provider = await getActiveProvider(tenantId);
  if ((provider as any).vendor !== "meta" || !(provider as any).isLive) {
    throw new Error("Active WhatsApp account is not a live Meta Cloud API account");
  }

  const wabaId = (provider as any).wabaId;
  if (!wabaId) {
    throw new Error("WABA ID is required for Meta template operations. Please save the correct WhatsApp Business Account ID in integration settings.");
  }

  return provider.createMetaTemplate(wabaId, templatePayload);
}

export async function fetchMetaTemplates(tenantId: string): Promise<any[]> {
  const provider = await getActiveProvider(tenantId);
  if ((provider as any).vendor !== "meta" || !(provider as any).isLive) {
    throw new Error("Active WhatsApp account is not a live Meta Cloud API account");
  }

  const wabaId = (provider as any).wabaId;
  if (!wabaId) {
    throw new Error("WABA ID is required for Meta template operations. Please save the correct WhatsApp Business Account ID in integration settings.");
  }

  return provider.fetchMetaTemplates(wabaId);
}

export async function getMetaTemplateById(tenantId: string, templateId: string): Promise<any> {
  const provider = await getActiveProvider(tenantId);
  if ((provider as any).vendor !== "meta" || !(provider as any).isLive) {
    throw new Error("Active WhatsApp account is not a live Meta Cloud API account");
  }

  if (!templateId) {
    throw new Error("Template ID is required for Meta template operations.");
  }

  return (provider as any).getMetaTemplateById(templateId);
}

export async function editMetaTemplateById(tenantId: string, templateId: string, payload: any): Promise<any> {
  const provider = await getActiveProvider(tenantId);
  if ((provider as any).vendor !== "meta" || !(provider as any).isLive) {
    throw new Error("Active WhatsApp account is not a live Meta Cloud API account");
  }

  if (!templateId) {
    throw new Error("Template ID is required for Meta template operations.");
  }

  return (provider as any).editMetaTemplateById(templateId, payload);
}

export async function uploadMetaMedia(
  tenantId: string,
  filePath: string,
  mimeType?: string,
  fileName?: string
): Promise<any> {
  const provider = await getActiveProvider(tenantId);
  if ((provider as any).vendor !== "meta" || !(provider as any).isLive) {
    throw new Error("Active WhatsApp account is not a live Meta Cloud API account");
  }

  return (provider as any).uploadMetaMedia(filePath, mimeType, fileName);
}

export async function deleteMetaTemplate(tenantId: string, templateName: string): Promise<any> {
  const provider = await getActiveProvider(tenantId);
  if ((provider as any).vendor !== "meta" || !(provider as any).isLive) {
    throw new Error("Active WhatsApp account is not a live Meta Cloud API account");
  }

  const wabaId = (provider as any).wabaId;
  if (!wabaId) {
    throw new Error("WABA ID is required for Meta template operations. Please save the correct WhatsApp Business Account ID in integration settings.");
  }

  return provider.deleteMetaTemplate(wabaId, templateName);
}

export async function getPhoneProfile(tenantId: string): Promise<any> {
  const provider = await getActiveProvider(tenantId);
  return provider.getPhoneProfile();
}

export async function updateBusinessProfile(tenantId: string, profileData: any): Promise<any> {
  const provider = await getActiveProvider(tenantId);
  return provider.updateBusinessProfile(profileData);
}

export async function verifyWebhook(
  tenantId: string,
  rawBody: Buffer,
  headers: Record<string, any>
): Promise<boolean> {
  const provider = await getActiveProvider(tenantId);
  return provider.verifyWebhook(rawBody, headers);
}

export async function parseInbound(tenantId: string, body: any): Promise<InboundEvent[]> {
  const provider = await getActiveProvider(tenantId);
  return provider.parseInbound(body);
}

export async function activeVendor(tenantId: string): Promise<string> {
  const provider = await getActiveProvider(tenantId);
  return provider.isLive ? provider.vendor : `${provider.vendor} (simulation)`;
}

export function normalizePhone(p: string): string {
  return p.replace(/[^\d]/g, "");
}
