import { getActiveProvider } from "./providers/registry";
import { SendResult, InboundEvent } from "./providers/types";

/**
 * Tenant-aware WhatsApp facade.
 *
 * The rest of the app calls these functions; they resolve whichever vendor is
 * ACTIVE for the tenant (Meta direct, Pinnacle, …, or simulation) and delegate.
 * Switching vendors is done by activating a different WhatsAppAccount — no code
 * change here or in the callers.
 */

export async function sendTemplate(
  tenantId: string,
  to: string,
  templateName: string,
  languageCode = "en",
  bodyParams: string[] = []
): Promise<SendResult> {
  const provider = await getActiveProvider(tenantId);
  if (!provider.isLive) {
    // active vendor not fully configured → simulate so the pipeline still works
    return { waMessageId: "wamid.SIM-" + Math.random().toString(16).slice(2, 18), simulated: true };
  }
  return provider.sendTemplate(to, templateName, languageCode, bodyParams);
}

export async function sendText(tenantId: string, to: string, text: string): Promise<SendResult> {
  const provider = await getActiveProvider(tenantId);
  if (!provider.isLive) {
    return { waMessageId: "wamid.SIM-" + Math.random().toString(16).slice(2, 18), simulated: true };
  }
  return provider.sendText(to, text);
}

export async function verifyWebhook(tenantId: string, rawBody: Buffer, headers: Record<string, any>): Promise<boolean> {
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
