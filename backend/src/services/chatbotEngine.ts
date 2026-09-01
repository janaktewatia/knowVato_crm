import { FlowStudioState } from "../models/FlowStudioState";
import { BotSession, IBotSession } from "../models/BotSession";
import { ChatbotRule } from "../models/ChatbotRule";
import { Lead } from "../models/Lead";
import { FollowUp } from "../models/FollowUp";
import { Conversation, Message } from "../models/Messaging";
import { convertToLead } from "./leadService";
import { InboundEvent } from "./providers/types";
import {
  sendText,
  sendInteractiveButtons,
  sendInteractiveList,
  sendTemplate,
  sendMedia,
  sendLocation,
} from "./whatsapp";

// Helper: safe deep path resolver for variables like "enquiry_data.full_name" or "api_response.user.id"
function resolvePath(obj: any, path: string): any {
  if (!obj || !path) return undefined;
  return path
    .split(".")
    .reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), obj);
}

// Helper: template interpolation for {{variable}} or {{nested.path}}
function renderTemplate(text: string, vars: Record<string, any>): string {
  if (!text) return "";
  return text.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_m, path) => {
    const val = resolvePath(vars, path);
    if (val === undefined || val === null) return `(${path})`;
    if (typeof val === "object") return JSON.stringify(val);
    return String(val);
  });
}

// Helper: evaluate single rule in Condition node
function evalSingleRule(a: any, operator: string, b: any): boolean {
  const num = (v: any) => parseFloat(v);
  const strA = String(a ?? "").toLowerCase().trim();
  const strB = String(b ?? "").toLowerCase().trim();
  switch (operator) {
    case "equals":
      return strA === strB;
    case "not_equals":
      return strA !== strB;
    case "contains":
      return strA.includes(strB);
    case "greater_than":
      return num(a) > num(b);
    case "less_than":
      return num(a) < num(b);
    default:
      return strA === strB;
  }
}

// Helper: evaluate branch rules (AND / OR) in Condition node
function evalBranchRules(branch: any, vars: Record<string, any>): boolean {
  const rules = branch?.rules || [];
  if (rules.length === 0) return true;
  const matchType = branch?.matchType || "AND";

  if (matchType === "OR") {
    return rules.some((r: any) => {
      const val = resolvePath(vars, r.variable);
      return evalSingleRule(val, r.operator || "equals", r.value || "");
    });
  } else {
    return rules.every((r: any) => {
      const val = resolvePath(vars, r.variable);
      return evalSingleRule(val, r.operator || "equals", r.value || "");
    });
  }
}

// Helper: execute REST API request node
async function executeApiRequest(
  node: any,
  vars: Record<string, any>
): Promise<{ ok: boolean; status: number; data: any }> {
  const method = (node.data?.method || "GET").toUpperCase();
  const rawUrl = (node.data?.url || "").trim();
  if (!rawUrl) {
    return { ok: false, status: 400, data: { error: "No API URL specified" } };
  }

  const url = renderTemplate(rawUrl, vars);
  const headers: Record<string, string> = {};
  (node.data?.headers || []).forEach((h: any) => {
    if (h && h.key && h.key.trim()) {
      headers[h.key.trim()] = renderTemplate(h.value || "", vars);
    }
  });

  let body: string | undefined = undefined;
  if (["POST", "PUT", "PATCH"].includes(method) && node.data?.body) {
    body = renderTemplate(node.data.body, vars);
    if (!headers["Content-Type"]) headers["Content-Type"] = "application/json";
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(url, {
      method,
      headers: Object.keys(headers).length > 0 ? headers : undefined,
      body,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const contentType = response.headers.get("content-type") || "";
    let data: any;
    if (contentType.includes("application/json")) {
      data = await response.json();
    } else {
      const text = await response.text();
      try {
        data = JSON.parse(text);
      } catch {
        data = { responseText: text };
      }
    }

    return {
      ok: response.ok,
      status: response.status,
      data,
    };
  } catch (err: any) {
    console.warn(`[ChatbotEngine] API request failed (${method} ${url}):`, err.message);
    return {
      ok: false,
      status: 500,
      data: { error: err.message || "Request failed" },
    };
  }
}

// Helper: log outgoing bot messages in Conversation & Message models for live CRM tracking
async function logBotOutgoing(
  tenantId: string,
  phone: string,
  body: string,
  msgType: "text" | "template" | "image" | "document" = "text",
  extra: { templateName?: string } = {}
) {
  try {
    const now = new Date();
    const hhmm = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    const conv = await Conversation.findOne({ tenant: tenantId as any, phone });
    if (conv) {
      conv.messages.push({
        from: "me",
        time: hhmm,
        type: msgType,
        text: body,
        agent: "Chatbot",
        at: now,
      });
      conv.last = body;
      conv.lastTime = hhmm;
      await conv.save();
    }

    await Message.create({
      tenant: tenantId,
      conversation: conv?._id || null,
      direction: "outbound",
      type: msgType,
      template: extra.templateName,
      body,
      phone,
      status: "sent",
      sentAt: now,
      agent: "Chatbot",
    });
  } catch (err) {
    console.warn("[ChatbotEngine] Could not log bot outgoing message:", err);
  }
}

/**
 * Execute node graph recursively / sequentially until a user input / pause node or end is reached.
 */
async function executeFlow(
  tenantId: string,
  phone: string,
  bot: any,
  startNodeId: string,
  session: IBotSession,
  allBots: any[],
  forms: any[]
): Promise<void> {
  let currentNodeId: string | null = startNodeId;
  let steps = 0;
  const MAX_STEPS = 30; // Prevent infinite loops

  while (currentNodeId && steps < MAX_STEPS) {
    steps++;
    const node = bot.nodes?.[currentNodeId];
    if (!node) {
      console.warn(`[ChatbotEngine] Node ${currentNodeId} not found in bot ${bot.name} (${bot.id})`);
      break;
    }

    session.currentNodeId = node.id;
    session.updatedAt = new Date();

    switch (node.type) {
      case "start": {
        currentNodeId = node.connections?.next || null;
        break;
      }

      case "message": {
        const text = renderTemplate(node.data?.text || "", session.variables);
        if (text) {
          await sendText(tenantId, phone, text);
          await logBotOutgoing(tenantId, phone, text, "text");
        }
        currentNodeId = node.connections?.next || null;
        break;
      }

      case "templateMessage": {
        const tplName = node.data?.templateName;
        const lang = node.data?.languageCode || "en";
        const preview = renderTemplate(node.data?.previewText || "", session.variables);
        if (tplName) {
          await sendTemplate(tenantId, phone, tplName, lang, []);
          await logBotOutgoing(tenantId, phone, preview || `Template: ${tplName}`, "template", {
            templateName: tplName,
          });
        }
        currentNodeId = node.connections?.next || null;
        break;
      }

      case "mediaMessage": {
        const mediaType = (node.data?.mediaType || "image").toLowerCase();
        const mediaUrl = renderTemplate(node.data?.mediaUrl || "", session.variables);
        const caption = renderTemplate(node.data?.caption || "", session.variables);
        const filename = node.data?.filename;
        if (mediaUrl) {
          await sendMedia(tenantId, phone, mediaType as any, mediaUrl, caption, filename);
          await logBotOutgoing(tenantId, phone, caption || `[Media: ${mediaType}]`, "image");
        }
        currentNodeId = node.connections?.next || null;
        break;
      }

      case "locationMessage": {
        const lat = parseFloat(node.data?.latitude) || 0;
        const lng = parseFloat(node.data?.longitude) || 0;
        const locName = renderTemplate(node.data?.name || "", session.variables);
        const locAddress = renderTemplate(node.data?.address || "", session.variables);
        if (lat && lng) {
          await sendLocation(tenantId, phone, lat, lng, locName, locAddress);
          await logBotOutgoing(tenantId, phone, `📍 Location: ${locName || `${lat}, ${lng}`}`, "text");
        }
        currentNodeId = node.connections?.next || null;
        break;
      }

      case "buttons": {
        const text = renderTemplate(node.data?.text || "Please select an option:", session.variables);
        const rawButtons = node.data?.buttons || [];
        const buttons = rawButtons.slice(0, 3).map((b: any, idx: number) => ({
          id: b.id || `b_${idx + 1}`,
          title: (b.label || b.title || `Option ${idx + 1}`).slice(0, 20),
        }));

        if (buttons.length > 0) {
          await sendInteractiveButtons(tenantId, phone, text, buttons);
          await logBotOutgoing(tenantId, phone, `${text}\n[Buttons: ${buttons.map((b: any) => b.title).join(" | ")}]`, "text");
        } else {
          await sendText(tenantId, phone, text);
          await logBotOutgoing(tenantId, phone, text, "text");
        }

        session.awaitingType = "buttons";
        await session.save();
        return; // Wait for user button click or reply
      }

      case "listMessage": {
        const text = renderTemplate(node.data?.text || "Please select from the options below:", session.variables);
        const buttonTitle = (node.data?.buttonTitle || "View Options").slice(0, 20);
        const rawButtons = node.data?.buttons || [];
        const rows = rawButtons.slice(0, 10).map((b: any, idx: number) => ({
          id: b.id || `opt_${idx + 1}`,
          title: (b.label || b.title || `Option ${idx + 1}`).slice(0, 24),
          description: b.description ? String(b.description).slice(0, 72) : undefined,
        }));

        if (rows.length > 0) {
          const sections = [{ title: "Options", rows }];
          await sendInteractiveList(tenantId, phone, text, buttonTitle, sections);
          await logBotOutgoing(tenantId, phone, `${text}\n[List Menu: ${buttonTitle}]`, "text");
        } else {
          await sendText(tenantId, phone, text);
          await logBotOutgoing(tenantId, phone, text, "text");
        }

        session.awaitingType = "list";
        await session.save();
        return; // Wait for user list selection
      }

      case "question": {
        const promptText = renderTemplate(node.data?.text || "Please reply:", session.variables);
        await sendText(tenantId, phone, promptText);
        await logBotOutgoing(tenantId, phone, promptText, "text");

        session.awaitingType = "text";
        await session.save();
        return; // Wait for user text answer
      }

      case "whatsappForm": {
        const form = forms.find((f: any) => f.id === node.data?.formId);
        if (!form || String(form.status || "active").toLowerCase() === "inactive") {
          console.warn(`[ChatbotEngine] Form ${node.data?.formId} not found or inactive`);
          currentNodeId = node.connections?.cancelled || node.connections?.next || null;
          break;
        }

        const fields = form.fields || [];
        if (fields.length === 0) {
          session.variables[node.data?.saveResponseAs || "form_data"] = {};
          currentNodeId = node.connections?.submitted || node.connections?.next || null;
          break;
        }

        // Initialize conversational step-by-step form collection
        session.awaitingType = "form";
        session.formState = {
          formId: form.id,
          fieldIndex: 0,
          collectedData: {},
          nodeId: node.id,
        };

        const firstField = fields[0];
        const formIntro = `📋 *${form.name}*\n${form.description ? `${form.description}\n\n` : "\n"}👉 *${firstField.label}*${firstField.required ? " (Required)" : ""}:`;
        await sendText(tenantId, phone, formIntro);
        await logBotOutgoing(tenantId, phone, formIntro, "text");

        await session.save();
        return; // Wait for first field input
      }

      case "apiRequest": {
        const apiRes = await executeApiRequest(node, session.variables);
        const saveKey = (node.data?.saveResponseAs || "api_response").trim();
        session.variables[saveKey] = apiRes.data;

        if (apiRes.ok) {
          currentNodeId = node.connections?.success || null;
        } else {
          currentNodeId = node.connections?.error || null;
        }
        break;
      }

      case "condition": {
        const branches = node.data?.branches || [];
        let nextTarget = node.connections?.else || null;

        for (const branch of branches) {
          if (evalBranchRules(branch, session.variables)) {
            nextTarget = node.connections?.[branch.id] || null;
            break;
          }
        }

        currentNodeId = nextTarget;
        break;
      }

      case "subchatbot": {
        const targetBot = allBots.find((b: any) => b.id === node.data?.targetBotId);
        if (targetBot && targetBot.startNodeId) {
          session.botId = targetBot.id;
          session.currentNodeId = targetBot.startNodeId;
          bot = targetBot;
          currentNodeId = targetBot.startNodeId;
        } else {
          console.warn(`[ChatbotEngine] Subchatbot target ${node.data?.targetBotId} not found`);
          currentNodeId = null;
        }
        break;
      }

      case "end": {
        if (node.data?.text) {
          const endText = renderTemplate(node.data.text, session.variables);
          await sendText(tenantId, phone, endText);
          await logBotOutgoing(tenantId, phone, endText, "text");
        }
        await BotSession.deleteOne({ _id: session._id });
        return;
      }

      default: {
        currentNodeId = node.connections?.next || null;
        break;
      }
    }
  }

  if (session) {
    session.awaitingType = null;
    await session.save();
  }
}

/**
 * Fallback to legacy ChatbotRule if FlowChat Studio has no active flows
 */
async function processLegacyChatbotRules(tenantId: string, event: InboundEvent): Promise<void> {
  const phone = event.from!;
  const messageText = (event.text || "").trim().toLowerCase();
  const interactiveReply = event.interactiveReply;

  const rules = await ChatbotRule.find({ tenant: tenantId, active: true }).sort({ order: 1 });
  if (rules.length === 0) return;

  let matchedRule: any = null;

  if (interactiveReply) {
    const replyId = interactiveReply.id.toLowerCase();
    const replyTitle = interactiveReply.title.toLowerCase();
    matchedRule = rules.find((r) => {
      if (r.triggerType !== "button_click" && r.triggerType !== "list_selection") return false;
      return r.keywords.some((kw) => kw.toLowerCase() === replyId || kw.toLowerCase() === replyTitle);
    });
  }

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
        return messageText.includes(keyword);
      });
    });
  }

  if (!matchedRule) {
    matchedRule = rules.find((r) => r.triggerType === "default");
  }

  if (!matchedRule) return;

  const payload = matchedRule.actionPayload || {};
  try {
    switch (matchedRule.actionType) {
      case "send_text": {
        if (payload.text) await sendText(tenantId, phone, payload.text);
        break;
      }
      case "send_buttons": {
        if (payload.text && payload.buttons?.length > 0) {
          await sendInteractiveButtons(tenantId, phone, payload.text, payload.buttons);
        }
        break;
      }
      case "send_list": {
        if (payload.text && payload.listButtonText && payload.listSections?.length > 0) {
          await sendInteractiveList(tenantId, phone, payload.text, payload.listButtonText, payload.listSections);
        }
        break;
      }
      case "send_media": {
        if (payload.mediaUrl) {
          await sendMedia(tenantId, phone, payload.mediaType || "image", payload.mediaUrl, payload.caption, payload.filename);
        }
        break;
      }
      case "send_template": {
        if (payload.templateName) {
          await sendTemplate(tenantId, phone, payload.templateName, payload.languageCode || "en", payload.templateParams || []);
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
    console.error(`[ChatbotEngine] Error executing legacy rule ${matchedRule.name}:`, err);
  }
}

/**
 * Chatbot Engine — processes inbound WhatsApp events and triggers visual bot flows in real-time.
 */
// Helper: extract all trigger keywords from a bot's start node (handles array, CSV string, single string)
function getBotStartKeywords(bot: any): string[] {
  if (!bot || !bot.nodes) return [];
  let startNode = bot.nodes[bot.startNodeId];
  if (!startNode) {
    startNode = Object.values(bot.nodes).find((n: any) => n && n.type === "start");
  }
  if (!startNode || !startNode.data) return [];

  const raw = startNode.data.keywords;
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw
      .map((k: any) => String(k || "").trim().toLowerCase())
      .filter(Boolean);
  }
  if (typeof raw === "string") {
    return raw
      .split(/[,;\n]/)
      .map((k) => k.trim().toLowerCase())
      .filter(Boolean);
  }
  return [];
}

// Helper: robust keyword matching against user input
function matchesKeywords(userText: string, keywords: string[]): boolean {
  if (!keywords || keywords.length === 0) return false;
  const cleanText = userText.toLowerCase().replace(/[^\w\s]/g, " ").replace(/\s+/g, " ").trim();
  if (!cleanText) return false;

  for (const kw of keywords) {
    const cleanKw = kw.toLowerCase().replace(/[^\w\s]/g, " ").replace(/\s+/g, " ").trim();
    if (!cleanKw) continue;

    // 1. Exact match (e.g. "know more" === "know more")
    if (cleanText === cleanKw) return true;

    // 2. Starts with keyword (e.g. "know more details" -> starts with "know more")
    if (cleanText.startsWith(cleanKw)) return true;

    // 3. User message contains keyword phrase (e.g. "i want to know more" -> contains "know more")
    if (cleanText.includes(cleanKw)) return true;

    // 4. Keyword contains user message
    if (cleanKw.includes(cleanText)) return true;

    // 5. Multi-word match: all words in keyword are found in user text
    const kwWords = cleanKw.split(" ").filter(Boolean);
    if (kwWords.length > 1) {
      if (kwWords.every((w) => cleanText.includes(w))) return true;
    }
  }

  return false;
}

function isDuplicateKeyError(err: any): boolean {
  return err?.code === 11000 || String(err?.message || "").includes("E11000");
}

async function upsertBotSessionSafe(payload: {
  tenant: any;
  phone: string;
  botId: string;
  currentNodeId: string;
  variables?: Record<string, any>;
  awaitingType?: "buttons" | "list" | "text" | "form" | null;
  formState?: any;
}) {
  try {
    return await BotSession.create({
      tenant: payload.tenant,
      phone: payload.phone,
      botId: payload.botId,
      currentNodeId: payload.currentNodeId,
      variables: payload.variables || {},
      awaitingType: payload.awaitingType ?? null,
      formState: payload.formState ?? null,
    });
  } catch (err: any) {
    if (!isDuplicateKeyError(err)) throw err;
    return BotSession.findOneAndUpdate(
      { tenant: payload.tenant, phone: payload.phone },
      {
        $set: {
          botId: payload.botId,
          currentNodeId: payload.currentNodeId,
          variables: payload.variables || {},
          awaitingType: payload.awaitingType ?? null,
          formState: payload.formState ?? null,
        },
      },
      { new: true, upsert: true }
    );
  }
}

/**
 * Chatbot Engine — processes inbound WhatsApp events and triggers visual bot flows in real-time.
 */
export async function processChatbotInbound(tenantId: string, event: InboundEvent): Promise<void> {
  if (event.kind !== "message" || !event.from) return;

  const phone = event.from;
  const rawText = (event.text || "").trim();
  const lowerText = rawText.toLowerCase();
  const interactiveReply = event.interactiveReply;

  // 1. Fetch latest FlowStudioState (visual builder state)
  const flowState = await FlowStudioState.findOne({ tenant: tenantId }).lean();
  const bots: any[] = Array.isArray(flowState?.bots) ? flowState.bots : [];
  const forms: any[] = Array.isArray(flowState?.forms) ? flowState.forms : [];

  // If no bots defined in FlowStudioState, fall back to legacy rules
  if (bots.length === 0) {
    await processLegacyChatbotRules(tenantId, event);
    return;
  }

  // 2. Check for active session for this phone number
  let session = await BotSession.findOne({ tenant: tenantId as any, phone });

  // 3. Check if user typed a restart command or keyword that triggers a bot
  const RESTART_KEYWORDS = ["hi", "hello", "hey", "start", "restart", "menu", "reset", "help", "main menu"];
  const isGenericRestart = RESTART_KEYWORDS.includes(lowerText);

  // Helper: check if incoming text matches a bot's start node keywords with LIVE priority
  const findMatchingBot = (): { bot: any; isDirectKeywordMatch: boolean } | null => {
    const liveBots = bots.filter((b) => b.status === "live");
    const draftBots = bots.filter((b) => b.status !== "live");

    // 3a. Check LIVE bots first for direct keyword match (e.g. "know more")
    for (const b of liveBots) {
      const kws = getBotStartKeywords(b);
      if (matchesKeywords(lowerText, kws)) {
        return { bot: b, isDirectKeywordMatch: true };
      }
    }

    // 3b. Check DRAFT bots for direct keyword match (e.g. "know more" if currently in draft)
    for (const b of draftBots) {
      const kws = getBotStartKeywords(b);
      if (matchesKeywords(lowerText, kws)) {
        return { bot: b, isDirectKeywordMatch: true };
      }
    }

    // 3c. If user typed generic greeting ("hi", "hello", "start"):
    if (isGenericRestart) {
      // Prefer LIVE bot that has "hi" or "hello" or "start" in keywords
      const liveGreetingBot = liveBots.find((b) => {
        const kws = getBotStartKeywords(b);
        return kws.some((k) => ["hi", "hello", "start", "hey"].includes(k));
      });
      if (liveGreetingBot) return { bot: liveGreetingBot, isDirectKeywordMatch: false };

      // Otherwise pick the first LIVE bot (never run a draft bot if a live bot exists!)
      if (liveBots.length > 0) return { bot: liveBots[0], isDirectKeywordMatch: false };

      // If NO live bot exists in system at all, only then pick draft bot
      if (draftBots.length > 0) return { bot: draftBots[0], isDirectKeywordMatch: false };
    }

    // 3d. If single LIVE bot exists and no session, use it
    if (liveBots.length === 1 && !session) {
      return { bot: liveBots[0], isDirectKeywordMatch: false };
    }

    return null;
  };

  const matchResult = findMatchingBot();
  const matchedNewBot = matchResult?.bot || null;
  const isDirectKeywordMatch = Boolean(matchResult?.isDirectKeywordMatch);

  // If a direct keyword matched OR generic restart into a different bot / fresh start
  if (
    matchedNewBot &&
    (!session || isDirectKeywordMatch || isGenericRestart || matchedNewBot.id !== session.botId)
  ) {
    if (!session) {
      session = await upsertBotSessionSafe({
        tenant: tenantId,
        phone,
        botId: matchedNewBot.id,
        currentNodeId: matchedNewBot.startNodeId,
        variables: { phone, name: phone },
      });
    } else {
      session.botId = matchedNewBot.id;
      session.currentNodeId = matchedNewBot.startNodeId;
      session.awaitingType = null;
      session.formState = undefined;
      session.variables = { ...session.variables, phone, name: phone };
      try {
        await session.save();
      } catch (err: any) {
        if (!isDuplicateKeyError(err)) throw err;
        session = await upsertBotSessionSafe({
          tenant: tenantId,
          phone,
          botId: matchedNewBot.id,
          currentNodeId: matchedNewBot.startNodeId,
          variables: { ...session.variables, phone, name: phone },
          awaitingType: null,
          formState: null,
        });
      }
    }

    await executeFlow(
      tenantId,
      phone,
      matchedNewBot,
      matchedNewBot.startNodeId,
      session,
      bots,
      forms
    );
    return;
  }

  // 4. If an active session exists, resume from the waiting node
  if (session) {
    const activeBot = bots.find((b) => b.id === session!.botId);
    if (!activeBot) {
      // Bot was deleted or changed; restart
      await BotSession.deleteOne({ _id: session._id });
      const fallbackBot = bots.find((b) => b.status === "live") || bots[0];
      if (fallbackBot) {
        session = await upsertBotSessionSafe({
          tenant: tenantId,
          phone,
          botId: fallbackBot.id,
          currentNodeId: fallbackBot.startNodeId,
          variables: { phone },
        });
        await executeFlow(tenantId, phone, fallbackBot, fallbackBot.startNodeId, session, bots, forms);
      }
      return;
    }

    const currentNode = activeBot.nodes?.[session.currentNodeId];
    if (!currentNode) {
      // Node was deleted or edited in builder; restart bot from start node
      session.currentNodeId = activeBot.startNodeId;
      session.awaitingType = null;
      session.formState = undefined;
      await session.save();
      await executeFlow(tenantId, phone, activeBot, activeBot.startNodeId, session, bots, forms);
      return;
    }

    // --- Resume: Buttons or List reply ---
    if (session.awaitingType === "buttons" || session.awaitingType === "list") {
      const rawButtons = currentNode.data?.buttons || [];
      let targetConnectionNodeId: string | null = null;

      // Check interactive payload reply ID first
      if (interactiveReply) {
        const replyId = interactiveReply.id.toLowerCase();
        const replyTitle = interactiveReply.title.toLowerCase();

        const btnMatch = rawButtons.find(
          (b: any) =>
            b.id.toLowerCase() === replyId ||
            (b.label || b.title || "").toLowerCase() === replyTitle ||
            (b.label || b.title || "").toLowerCase() === replyId
        );
        if (btnMatch) {
          targetConnectionNodeId = currentNode.connections?.[btnMatch.id] || null;
        }
      }

      // Check text match (user typed button label or numeric option like "1", "2")
      if (!targetConnectionNodeId && rawText) {
        const numericChoice = parseInt(rawText, 10);
        if (!isNaN(numericChoice) && numericChoice >= 1 && numericChoice <= rawButtons.length) {
          const btn = rawButtons[numericChoice - 1];
          targetConnectionNodeId = currentNode.connections?.[btn.id] || null;
        } else {
          const btnMatch = rawButtons.find(
            (b: any) =>
              (b.label || b.title || "").toLowerCase() === lowerText ||
              b.id.toLowerCase() === lowerText ||
              lowerText.includes((b.label || b.title || "").toLowerCase())
          );
          if (btnMatch) {
            targetConnectionNodeId = currentNode.connections?.[btnMatch.id] || null;
          }
        }
      }

      if (targetConnectionNodeId) {
        session.awaitingType = null;
        await session.save();
        await executeFlow(tenantId, phone, activeBot, targetConnectionNodeId, session, bots, forms);
        return;
      } else {
        // Did not match buttons — re-prompt buttons
        const prompt = renderTemplate(currentNode.data?.text || "Please select one of the available options:", session.variables);
        const buttons = rawButtons.slice(0, 3).map((b: any, idx: number) => ({
          id: b.id || `b_${idx + 1}`,
          title: (b.label || b.title || `Option ${idx + 1}`).slice(0, 20),
        }));
        if (buttons.length > 0 && session.awaitingType === "buttons") {
          await sendInteractiveButtons(tenantId, phone, prompt, buttons);
        } else {
          await sendText(tenantId, phone, prompt);
        }
        return;
      }
    }

    // --- Resume: Question reply (text capture) ---
    if (session.awaitingType === "text") {
      const varName = (currentNode.data?.variableName || "user_reply").trim();
      session.variables = { ...session.variables, [varName]: rawText };
      session.awaitingType = null;
      await session.save();

      const nextNodeId = currentNode.connections?.next || null;
      if (nextNodeId) {
        await executeFlow(tenantId, phone, activeBot, nextNodeId, session, bots, forms);
      }
      return;
    }

    // --- Resume: WhatsApp Form step-by-step collection ---
    if (session.awaitingType === "form" && session.formState) {
      const form = forms.find((f: any) => f.id === session!.formState!.formId);
      const fields = form?.fields || [];
      const currentFieldIndex = session.formState.fieldIndex || 0;
      const currentField = fields[currentFieldIndex];

      if (currentField) {
        session.formState.collectedData[currentField.fieldKey] = rawText;
      }

      const nextFieldIndex = currentFieldIndex + 1;
      if (nextFieldIndex < fields.length) {
        // Prompt next field in form
        session.formState.fieldIndex = nextFieldIndex;
        await session.save();

        const nextField = fields[nextFieldIndex];
        const nextPrompt = `👉 *${nextField.label}*${nextField.required ? " (Required)" : ""}:`;
        await sendText(tenantId, phone, nextPrompt);
        await logBotOutgoing(tenantId, phone, nextPrompt, "text");
        return;
      } else {
        // All fields collected!
        const saveKey = (currentNode.data?.saveResponseAs || "form_data").trim();
        session.variables[saveKey] = { ...session.formState.collectedData };

        // Automatically convert collected form into a Lead in the CRM
        const formVal = session.formState.collectedData || {};
        const leadName = formVal.full_name || formVal.name || formVal.visitor_name || phone;
        const leadEmail = formVal.email || formVal.email_address || undefined;
        const leadCourse = formVal.course || formVal.program || undefined;

        try {
          await convertToLead({
            tenant: tenantId as any,
            name: leadName,
            phone,
            email: leadEmail,
            course: leadCourse,
            sourceKeyOrId: "WhatsApp Chatbot Form",
            user: "Chatbot Flow",
          });
        } catch (leadErr) {
          console.warn("[ChatbotEngine] Auto-lead creation notice:", leadErr);
        }

        if (form.submitSuccessMessage) {
          const successMsg = renderTemplate(form.submitSuccessMessage, session.variables);
          await sendText(tenantId, phone, successMsg);
          await logBotOutgoing(tenantId, phone, successMsg, "text");
        }

        session.formState = undefined;
        session.awaitingType = null;
        await session.save();

        const submitTargetNodeId = currentNode.connections?.submitted || currentNode.connections?.next || null;
        if (submitTargetNodeId) {
          await executeFlow(tenantId, phone, activeBot, submitTargetNodeId, session, bots, forms);
        }
        return;
      }
    }
  }

  // 5. If no session exists and message wasn't matched above, start live bot or first bot
  const defaultBot = bots.find((b) => b.status === "live") || bots[0];
  if (defaultBot && defaultBot.startNodeId) {
    session = await upsertBotSessionSafe({
      tenant: tenantId,
      phone,
      botId: defaultBot.id,
      currentNodeId: defaultBot.startNodeId,
      variables: { phone, name: phone },
    });
    await executeFlow(tenantId, phone, defaultBot, defaultBot.startNodeId, session, bots, forms);
  } else {
    // If no bot in FlowStudioState, fall back to legacy rules
    await processLegacyChatbotRules(tenantId, event);
  }
}
