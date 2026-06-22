import { WhatsAppAccount, IWhatsAppAccount } from "../../models/WhatsAppAccount";
import { WhatsAppProvider, ProviderCredentials, VendorKey } from "./types";
import { SimulationProvider } from "./simulationProvider";
import { MetaProvider } from "./metaProvider";
import { PinnacleProvider } from "./pinnacleProvider";

/** Build a provider instance for a given vendor + credentials. */
export function makeProvider(creds: ProviderCredentials): WhatsAppProvider {
  switch (creds.vendor) {
    case "meta":
      return new MetaProvider(creds);
    case "pinnacle":
      return new PinnacleProvider(creds);
    // case "gupshup": return new GupshupProvider(creds);   // add when needed
    // case "twilio":  return new TwilioProvider(creds);
    case "simulation":
    default:
      return new SimulationProvider(creds);
  }
}

function toCreds(acc: IWhatsAppAccount): ProviderCredentials {
  return {
    vendor: acc.vendor as VendorKey,
    apiBaseUrl: acc.apiBaseUrl,
    apiKey: acc.apiKey,
    accessToken: acc.accessToken,
    phoneNumberId: acc.phoneNumberId,
    wabaId: acc.wabaId,
    senderNumber: acc.senderNumber,
    verifyToken: acc.verifyToken,
    appSecret: acc.appSecret,
    extra: acc.extra,
  };
}

/* ── small per-tenant cache so we don't hit the DB on every send ── */
interface CacheEntry { provider: WhatsAppProvider; at: number; }
const cache = new Map<string, CacheEntry>();
const TTL_MS = 30_000;

const simulation = new SimulationProvider();

/** Resolve the ACTIVE provider for a tenant (falls back to simulation). */
export async function getActiveProvider(tenantId: string): Promise<WhatsAppProvider> {
  const cached = cache.get(tenantId);
  if (cached && Date.now() - cached.at < TTL_MS) return cached.provider;

  const acc = await WhatsAppAccount.findOne({ tenant: tenantId, active: true });
  const provider = acc ? makeProvider(toCreds(acc)) : simulation;

  cache.set(tenantId, { provider, at: Date.now() });
  return provider;
}

/** Invalidate the cache for a tenant (call after activating/editing accounts). */
export function invalidateProvider(tenantId: string) {
  cache.delete(tenantId);
}

/** Activate exactly one account for a tenant (deactivates the others). */
export async function activateAccount(tenantId: string, accountId: string): Promise<IWhatsAppAccount> {
  const acc = await WhatsAppAccount.findOne({ _id: accountId, tenant: tenantId });
  if (!acc) throw new Error("WhatsApp account not found");
  await WhatsAppAccount.updateMany({ tenant: tenantId }, { $set: { active: false } });
  acc.active = true;
  await acc.save();
  invalidateProvider(tenantId);
  return acc;
}
