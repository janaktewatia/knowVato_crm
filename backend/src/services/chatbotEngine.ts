import { ChatbotRule } from "../models/ChatbotRule";
import { Lead } from "../models/Lead";
import { FollowUp } from "../models/FollowUp";
import { InboundEvent } from "./providers/types";
import { sendText, sendInteractiveButtons, sendInteractiveList, sendTemplate } from "./whatsapp";

/**
 * Chatbot Engine — processes inbound WhatsApp events and triggers automated bot flows.
 */
export async function processChatbotInbound(tenantId: string, event: InboundEvent): Promise<void> {
  if (event.kind !== "message" || !event.from) return;

  const phone = event.from;
  const messageText = (event.text || "").trim().toLowerCase();
  const interactiveReply = event.interactiveReply;

  // Fetch active chatbot rules for tenant, sorted by order
  const rules = await ChatbotRule.find({ tenant: tenantId, active: true }).sort({ order: 1 });
  if (rules.length === 0) return;

  let matchedRule: any = null;

  // 1. Try matching button/list click rules
  if (interactiveReply) {
    const replyId = interactiveReply.id.toLowerCase();
    const replyTitle = interactiveReply.title.toLowerCase();
    matchedRule = rules.find((r) => {
      if (r.triggerType !== "button_click" && r.triggerType !== "list_selection") return false;
      return r.keywords.some(
        (kw) => kw.toLowerCase() === replyId || kw.toLowerCase() === replyTitle
      );
    });
  }

  // 2. Try matching keyword rules
  if (!matchedRule && messageText) {
    matchedRule = rules.find((r) => {
      if (r.triggerType !== "keyword") return false;
      return r.keywords.some((kw) => {
        const keyword = kw.trim().toLowerCase();
        if (!keyword) return false;
        if (r.matchType === "exact") return messageText === keyword;
        if (r.matchType === "starts_with") return messageText.startsWith(keyword);
        if (r.matchType === "regex") {
          try {
            return new RegExp(keyword, "i").test(messageText);
          } catch {
            return false;
          }
        }
        // default: contains
        return messageText.includes(keyword);
      });
    });
  }

  // 3. Fallback to default rule if available
  if (!matchedRule) {
    matchedRule = rules.find((r) => r.triggerType === "default");
  }

  if (!matchedRule) return;

  const payload = matchedRule.actionPayload || {};

  // Execute chatbot action
  try {
    switch (matchedRule.actionType) {
      case "send_text": {
        if (payload.text) {
          await sendText(tenantId, phone, payload.text);
        }
        break;
      }
      case "send_buttons": {
        if (payload.text && payload.buttons && payload.buttons.length > 0) {
          await sendInteractiveButtons(tenantId, phone, payload.text, payload.buttons);
        }
        break;
      }
      case "send_list": {
        if (
          payload.text &&
          payload.listButtonText &&
          payload.listSections &&
          payload.listSections.length > 0
        ) {
          await sendInteractiveList(
            tenantId,
            phone,
            payload.text,
            payload.listButtonText,
            payload.listSections
          );
        }
        break;
      }
      case "send_template": {
        if (payload.templateName) {
          await sendTemplate(
            tenantId,
            phone,
            payload.templateName,
            payload.languageCode || "en",
            payload.templateParams || []
          );
        }
        break;
      }
      case "update_status": {
        if (payload.statusId) {
          const lead = await Lead.findOne({ tenant: tenantId, phone });
          if (lead) {
            lead.status = payload.statusId as any;
            if (payload.subStatusId) lead.subStatus = payload.subStatusId as any;
            lead.lastActivity = new Date();
            await lead.save();
          }
        }
        break;
      }
      case "assign_counsellor": {
        if (payload.counsellorName) {
          const lead = await Lead.findOne({ tenant: tenantId, phone });
          if (lead) {
            lead.owner = payload.counsellorName;
            await lead.save();
          }
        }
        break;
      }
      case "create_followup": {
        const lead = await Lead.findOne({ tenant: tenantId, phone });
        if (lead) {
          const due = new Date();
          due.setDate(due.getDate() + (payload.followupDays || 1));
          await FollowUp.create({
            tenant: tenantId,
            lead: lead._id,
            leadName: lead.name,
            phone: lead.phone,
            due,
            type: "WhatsApp",
            note: payload.followupNote || `Automated Bot Trigger: ${matchedRule.name}`,
            owner: lead.owner || "Priya Kothari",
            status: lead.status,
          });
        }
        break;
      }
    }
  } catch (err) {
    console.error(`[ChatbotEngine] Error executing rule ${matchedRule.name}:`, err);
  }
}
