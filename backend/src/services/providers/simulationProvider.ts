import crypto from "crypto";
import {
  WhatsAppProvider,
  SendResult,
  InboundEvent,
  ProviderCredentials,
  InteractiveButton,
  InteractiveListSection,
} from "./types";

/**
 * Simulation provider — default for local testing or simulated Meta API mode.
 * Returns realistic simulated responses for text, templates, media, location,
 * interactive messages, and Meta template syncing.
 */
export class SimulationProvider implements WhatsAppProvider {
  readonly vendor = "simulation" as const;
  readonly isLive = false;
  private static simTemplates: any[] = [
    {
      id: "sim_tpl_1",
      name: "admission_welcome",
      language: "en",
      category: "MARKETING",
      status: "APPROVED",
      components: [
        { type: "HEADER", format: "TEXT", text: "Welcome to Greenwood" },
        { type: "BODY", text: "Hi {{1}}, welcome to Greenwood International!" },
        { type: "FOOTER", text: "Greenwood Admissions" },
        {
          type: "BUTTONS",
          buttons: [
            { type: "QUICK_REPLY", text: "Schedule Visit" },
            { type: "URL", text: "Visit Website", url: "https://greenwood.edu" },
          ],
        },
      ],
    },
    {
      id: "sim_tpl_2",
      name: "fee_due_reminder_v3",
      language: "en",
      category: "UTILITY",
      status: "APPROVED",
      components: [
        { type: "BODY", text: "Hi {{1}}, your fee of ₹{{2}} is due on {{3}}." },
        {
          type: "BUTTONS",
          buttons: [{ type: "QUICK_REPLY", text: "Pay Now" }, { type: "QUICK_REPLY", text: "Request Callback" }],
        },
      ],
    },
  ];

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

  async sendMedia(): Promise<SendResult> {
    return { waMessageId: this.id(), simulated: true };
  }

  async sendLocation(): Promise<SendResult> {
    return { waMessageId: this.id(), simulated: true };
  }

  async sendInteractiveButtons(): Promise<SendResult> {
    return { waMessageId: this.id(), simulated: true };
  }

  async sendInteractiveList(): Promise<SendResult> {
    return { waMessageId: this.id(), simulated: true };
  }

  async createMetaTemplate(_wabaId: string, templatePayload: any): Promise<any> {
    const newTpl = {
      id: "sim_tpl_" + Date.now(),
      name: templatePayload.name,
      language: templatePayload.language || "en",
      category: templatePayload.category || "UTILITY",
      status: "APPROVED",
      components: templatePayload.components || [],
    };
    SimulationProvider.simTemplates.push(newTpl);
    return { id: newTpl.id, status: "APPROVED" };
  }

  async fetchMetaTemplates(): Promise<any[]> {
    return SimulationProvider.simTemplates;
  }

  async deleteMetaTemplate(_wabaId: string, templateName: string): Promise<any> {
    SimulationProvider.simTemplates = SimulationProvider.simTemplates.filter(
      (t) => t.name !== templateName
    );
    return { success: true };
  }

  async getPhoneProfile(): Promise<any> {
    return {
      display_phone_number: "+91 99999 00001",
      verified_name: "Greenwood International (Demo)",
      code_verification_status: "VERIFIED",
      quality_rating: "GREEN",
      whatsapp_business_account: { id: "DEMO_WABA_ID" },
    };
  }

  async updateBusinessProfile(profileData: any): Promise<any> {
    return { success: true, updated: profileData };
  }

  verifyWebhook(): boolean {
    return true;
  }

  parseInbound(_body: any): InboundEvent[] {
    return [];
  }
}
