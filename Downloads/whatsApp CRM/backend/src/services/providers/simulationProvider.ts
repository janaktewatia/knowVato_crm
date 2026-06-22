import crypto from "crypto";
import { WhatsAppProvider, SendResult, InboundEvent, ProviderCredentials } from "./types";

/**
 * Simulation provider — the default when no vendor is active/live.
 * Returns realistic fake message IDs so the whole pipeline works with no
 * external account. Never makes a network call.
 */
export class SimulationProvider implements WhatsAppProvider {
  readonly vendor = "simulation" as const;
  readonly isLive = false;

  constructor(_creds?: ProviderCredentials) {}

  private id() {
    return "wamid.SIM-" + crypto.randomBytes(8).toString("hex");
  }

  async sendTemplate(): Promise<SendResult> {
    return { waMessageId: this.id(), simulated: true };
  }

  async sendText(): Promise<SendResult> {
    return { waMessageId: this.id(), simulated: true };
  }

  verifyWebhook(): boolean {
    return true;
  }

  parseInbound(_body: any): InboundEvent[] {
    return [];
  }
}
