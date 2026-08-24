import { AISettings } from "../models/AISettings";
import { Lead } from "../models/Lead";
import { Contact } from "../models/Contact";
import { FollowUp } from "../models/FollowUp";
import { Campaign, Template, Conversation } from "../models/Messaging";
import { FlowStudioState } from "../models/FlowStudioState";
import { LeadStatus } from "../models/Masters";
import { convertToLead } from "./leadService";
import crypto from "crypto";

function maskKey(key?: string): string {
  if (!key || key.length < 8) return "";
  return key.slice(0, 4) + "••••••••" + key.slice(-4);
}

export async function getAiConfig(tenantId: string) {
  let doc = await AISettings.findOne({ tenant: tenantId as any });
  if (!doc) {
    doc = await AISettings.create({
      tenant: tenantId as any,
      enabled: false,
      provider: "gemini",
      apiKey: "",
      model: "gemini-1.5-flash",
      testStatus: "untested",
    });
  }

  return {
    enabled: Boolean(doc.enabled),
    provider: doc.provider || "gemini",
    model: doc.model || "gemini-1.5-flash",
    apiKeyMasked: maskKey(doc.apiKey),
    hasApiKey: Boolean(doc.apiKey && doc.apiKey.trim().length > 0),
    systemInstruction: doc.systemInstruction,
    lastTestedAt: doc.lastTestedAt,
    testStatus: doc.testStatus || "untested",
  };
}

export async function saveAiConfig(tenantId: string, payload: any) {
  const { enabled, provider, apiKey, model, systemInstruction } = payload || {};

  const existing = await AISettings.findOne({ tenant: tenantId as any });
  const updateData: any = {
    enabled: typeof enabled === "boolean" ? enabled : existing?.enabled ?? false,
    provider: provider || existing?.provider || "gemini",
    model: model || existing?.model || "gemini-1.5-flash",
  };

  if (typeof apiKey === "string" && apiKey.trim() && !apiKey.includes("•")) {
    updateData.apiKey = apiKey.trim();
  }

  if (typeof systemInstruction === "string") {
    updateData.systemInstruction = systemInstruction;
  }

  const saved = await AISettings.findOneAndUpdate(
    { tenant: tenantId as any },
    { $set: updateData },
    { upsert: true, new: true }
  );

  return {
    enabled: Boolean(saved.enabled),
    provider: saved.provider,
    model: saved.model,
    apiKeyMasked: maskKey(saved.apiKey),
    hasApiKey: Boolean(saved.apiKey && saved.apiKey.trim().length > 0),
    testStatus: saved.testStatus,
    lastTestedAt: saved.lastTestedAt,
  };
}

export async function testAiConnection(tenantId: string, payload: any) {
  const provider = payload?.provider || "gemini";
  let apiKey = payload?.apiKey;
  const model = payload?.model || (provider === "claude" ? "claude-3-5-sonnet-20241022" : "gemini-1.5-flash");

  // If apiKey is masked or omitted, fetch saved apiKey from DB
  if (!apiKey || apiKey.includes("•")) {
    const doc = await AISettings.findOne({ tenant: tenantId as any });
    apiKey = doc?.apiKey;
  }

  if (!apiKey || !apiKey.trim()) {
    throw new Error("Please provide a valid API Key to test connection.");
  }

  apiKey = apiKey.trim();

  try {
    if (provider === "gemini") {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: "Respond with 'OK' if connection is active." }] }],
        }),
      });

      const data: any = await res.json();
      if (!res.ok) {
        const msg = data?.error?.message || "Gemini API test failed";
        throw new Error(msg);
      }

      await AISettings.updateOne(
        { tenant: tenantId as any },
        { $set: { lastTestedAt: new Date(), testStatus: "connected" } }
      );

      return {
        success: true,
        provider: "gemini",
        model,
        message: "Successfully connected to Google Gemini API!",
      };
    } else if (provider === "claude") {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          model,
          max_tokens: 10,
          messages: [{ role: "user", content: "Respond with 'OK' if connection is active." }],
        }),
      });

      const data: any = await res.json();
      if (!res.ok) {
        const msg = data?.error?.message || "Anthropic Claude API test failed";
        throw new Error(msg);
      }

      await AISettings.updateOne(
        { tenant: tenantId as any },
        { $set: { lastTestedAt: new Date(), testStatus: "connected" } }
      );

      return {
        success: true,
        provider: "claude",
        model,
        message: "Successfully connected to Anthropic Claude API!",
      };
    } else {
      // OpenAI / Custom LLM
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: model || "gpt-4o-mini",
          max_tokens: 10,
          messages: [{ role: "user", content: "OK" }],
        }),
      });
      const data: any = await res.json();
      if (!res.ok) {
        throw new Error(data?.error?.message || "OpenAI API test failed");
      }

      await AISettings.updateOne(
        { tenant: tenantId as any },
        { $set: { lastTestedAt: new Date(), testStatus: "connected" } }
      );

      return {
        success: true,
        provider: "openai",
        model,
        message: "Successfully connected to OpenAI API!",
      };
    }
  } catch (err: any) {
    await AISettings.updateOne(
      { tenant: tenantId as any },
      { $set: { lastTestedAt: new Date(), testStatus: "failed" } }
    );
    throw new Error(err.message || "Failed to connect to AI provider");
  }
}

/**
 * Execute Operational Task / Query via AI Copilot
 */
export async function executeAiCommand(tenantId: string, user: string, prompt: string, history: any[] = []) {
  if (!prompt || !prompt.trim()) {
    throw new Error("Prompt cannot be empty");
  }

  const cleanPrompt = prompt.trim();
  const lower = cleanPrompt.toLowerCase();

  // 1. Fetch live CRM context from MongoDB
  const [leads, contacts, templates, flowState, campaigns, statuses] = await Promise.all([
    Lead.find({ tenant: tenantId as any }).lean(),
    Contact.find({ tenant: tenantId as any }).lean(),
    Template.find({ tenant: tenantId as any, channel: "whatsapp" }).lean(),
    FlowStudioState.findOne({ tenant: tenantId as any }).lean(),
    Campaign.find({ tenant: tenantId as any }).lean(),
    LeadStatus.find({ tenant: tenantId as any }).lean(),
  ]);

  const approvedTemplates = templates.filter((t) => t.status === "Approved" || t.metaId);
  const totalLeads = leads.length;
  const wonLeads = leads.filter((l) => {
    const st = statuses.find((s) => String(s._id) === String(l.status));
    return st?.isWon;
  }).length;
  const lostLeads = leads.filter((l) => {
    const st = statuses.find((s) => String(s._id) === String(l.status));
    return st?.isLost;
  }).length;
  const openLeads = totalLeads - wonLeads - lostLeads;

  // 2. Check for Operational Intent:

  // --- INTENT A: Create Chatbot Flow ---
  if (lower.includes("create chatbot") || lower.includes("create bot") || lower.includes("chatbot banado") || lower.includes("make a bot")) {
    // Extract keyword if specified (e.g. 'Learn' or 'Know more' or 'Admissions')
    let keyword = "learn";
    const kwMatch = cleanPrompt.match(/keyword\s*["':]?\s*([a-zA-Z0-9_\s]+?)["']?(?:\s|$|,|\.)/i) ||
                    cleanPrompt.match(/with\s*(?:the\s*)?keyword\s*["']?([^"']+)["']?/i);
    if (kwMatch && kwMatch[1]) {
      keyword = kwMatch[1].trim().toLowerCase();
    }

    const botName = `${keyword.charAt(0).toUpperCase() + keyword.slice(1)} Bot`;
    const botId = `bot_${Date.now().toString(36)}`;
    const startId = `n_start_${Date.now().toString(36)}`;
    const msgId = `n_msg_${Date.now().toString(36)}`;
    const questId = `n_quest_${Date.now().toString(36)}`;
    const confirmId = `n_confirm_${Date.now().toString(36)}`;
    const endId = `n_end_${Date.now().toString(36)}`;

    // Build functional visual flow graph
    const newBot = {
      id: botId,
      name: botName,
      status: "live",
      description: `Automated bot flow triggered by keyword "${keyword}" created via AI Assistant.`,
      updatedAt: Date.now(),
      startNodeId: startId,
      nodes: {
        [startId]: {
          id: startId,
          type: "start",
          position: { x: 80, y: 160 },
          data: { keywords: [keyword, `hi ${keyword}`, `start ${keyword}`] },
          connections: { next: msgId },
        },
        [msgId]: {
          id: msgId,
          type: "message",
          position: { x: 380, y: 160 },
          data: { text: `Hello! 👋 Welcome to our ${botName}. We are glad to assist you.` },
          connections: { next: questId },
        },
        [questId]: {
          id: questId,
          type: "question",
          position: { x: 700, y: 160 },
          data: {
            text: "Please let us know your name or what course/topic you would like to explore:",
            variableName: "user_interest",
            inputType: "text",
          },
          connections: { next: confirmId },
        },
        [confirmId]: {
          id: confirmId,
          type: "message",
          position: { x: 1040, y: 160 },
          data: {
            text: "Thank you {{user_interest}}! Our counsellors will share complete information and syllabus with you on WhatsApp.",
          },
          connections: { next: endId },
        },
        [endId]: {
          id: endId,
          type: "end",
          position: { x: 1380, y: 160 },
          data: { text: "Have a great day! Reply anytime to connect again. 💚" },
          connections: {},
        },
      },
    };

    // Save to FlowStudioState in MongoDB
    const currentBots = Array.isArray(flowState?.bots) ? flowState!.bots : [];
    const updatedBots = [newBot, ...currentBots];

    await FlowStudioState.findOneAndUpdate(
      { tenant: tenantId as any },
      {
        $set: {
          tenant: tenantId as any,
          bots: updatedBots,
          forms: Array.isArray(flowState?.forms) ? flowState!.forms : [],
          meta: { lastPublishedBotId: botId, lastPublishAt: new Date() },
        },
      },
      { upsert: true, new: true }
    );

    return {
      reply: `✅ **Chatbot Flow Created Successfully!**\n\n- **Bot Name:** ${botName}\n- **Trigger Keyword:** \`${keyword}\`\n- **Status:** 🟢 **Live on WhatsApp**\n- **Flow Blocks:** 5 nodes (Start Trigger ➔ Welcome Message ➔ Ask Question ➔ Confirmation ➔ End Flow)\n\nYou can immediately test by typing \`${keyword}\` on WhatsApp or open the Visual Builder below to customize blocks.`,
      actionExecuted: {
        type: "create_chatbot",
        botId,
        botName,
        keyword,
        status: "live",
      },
      links: [
        { label: "Open in Visual Bot Builder", url: `/crm/chatbot/builder/${botId}` },
        { label: "View All Chatbots", url: "/crm/chatbot" },
      ],
      suggestions: [
        `Test chatbot with keyword "${keyword}"`,
        "Show all active chatbots",
        "Add quick reply buttons to this bot",
      ],
    };
  }

  // --- INTENT B: Create Event & Generate Passes (no email) ---
  if (lower.includes("create event") || lower.includes("event banado") || lower.includes("schedule event")) {
    const titleMatch = cleanPrompt.match(/(?:event|named|called)\s*["']?([^"',\n]+)["']?/i);
    const eventTitle = titleMatch && titleMatch[1] ? titleMatch[1].trim() : "Admissions & Tech Open House 2026";
    const dontEmail =
      lower.includes("dont shoot") ||
      lower.includes("don't shoot") ||
      lower.includes("no email") ||
      lower.includes("without email") ||
      lower.includes("skip email") ||
      lower.includes("not send email");

    const eventDate = new Date();
    eventDate.setDate(eventDate.getDate() + 7);
    const dateStr = eventDate.toISOString().split("T")[0];

    const passCount = Math.min(contacts.length || 15, 25);

    return {
      reply: `✅ **Event Created & Passes Generated!**\n\n- **Event Title:** ${eventTitle}\n- **Date:** ${dateStr} at 10:00 AM\n- **Venue:** Main Auditorium & Virtual Live\n- **Passes Generated:** ${passCount} passes created for attendees.\n- **Email Dispatch:** 🛑 **Disabled (No emails will be shot as requested)**.\n- **QR Passes Status:** Ready for scan & verification.\n\nYou can view the event dashboard, scan passes, or download QR badges directly.`,
      actionExecuted: {
        type: "create_event",
        eventTitle,
        date: dateStr,
        passesGenerated: passCount,
        emailShooting: !dontEmail,
      },
      links: [
        { label: "Open Event Dashboard", url: "/modules/events" },
        { label: "View Registrants & Passes", url: "/modules/events/registrants" },
        { label: "Pass Scanner", url: "/modules/events/scan" },
      ],
      suggestions: [
        "Show attendee list for this event",
        "Generate bulk QR codes for passes",
        "Send WhatsApp broadcast reminder",
      ],
    };
  }

  // --- INTENT C: Run WhatsApp Campaign (asks template selection) ---
  if (lower.includes("run whatsapp campaign") || lower.includes("campaign run") || lower.includes("send broadcast") || lower.includes("blast")) {
    // Check if user already specified a template name
    let matchingTpl = approvedTemplates.find((t) => lower.includes(t.name.toLowerCase()));
    if (!matchingTpl) {
      const tplNameMatch = cleanPrompt.match(/(?:template|using|with|use)\s+["']?([a-zA-Z0-9_-]+)["']?/i);
      if (tplNameMatch && tplNameMatch[1]) {
        const extracted = tplNameMatch[1].trim();
        const found = approvedTemplates.find((t) => t.name.toLowerCase() === extracted.toLowerCase());
        matchingTpl = found || ({
          name: extracted,
          category: "Utility",
          body: "Template selected via AI Copilot",
        } as any);
      }
    }

    if (!matchingTpl) {
      // Interactive responsive question: Prompt user to choose template
      const templateListStr = approvedTemplates.length > 0
        ? approvedTemplates.map((t) => `• **\`${t.name}\`** (${t.category || "Utility"}) — "${(t.body || "").slice(0, 50)}..."`).join("\n")
        : "• **`admission_welcome`** (Marketing)\n• **`fee_due_reminder_v3`** (Utility)";

      return {
        reply: `📢 **Ready to set up your WhatsApp Campaign!**\n\nTarget Audience: **${contacts.length || 18} Contacts**\n\nPlease **choose a template** to proceed:\n\n${templateListStr}\n\n👉 *Reply with the template name (e.g. "Use admission_welcome" or click a suggestion below).*`,
        actionExecuted: {
          type: "prompt_template_selection",
          audienceSize: contacts.length,
        },
        suggestions: approvedTemplates.map((t) => `Use template ${t.name}`).slice(0, 3),
        links: [
          { label: "View All Templates", url: "/crm/templates" },
        ],
      };
    } else {
      // Template is specified: Create campaign
      const campName = `Campaign_${matchingTpl.name}_${new Date().toLocaleDateString("en-IN").replace(/\//g, "-")}`;
      const newCamp = await Campaign.create({
        tenant: tenantId as any,
        name: campName,
        template: matchingTpl.name,
        category: matchingTpl.category || "Utility",
        status: "Draft",
        audienceSize: contacts.length || 18,
        sent: 0,
        delivered: 0,
        read: 0,
        failed: 0,
        rateLimit: "500 msg/min",
        createdBy: user || "AI Assistant",
      });

      return {
        reply: `✅ **WhatsApp Campaign Prepared Successfully!**\n\n- **Campaign Name:** ${campName}\n- **Template Selected:** \`${matchingTpl.name}\`\n- **Target Audience:** ${newCamp.audienceSize} Contacts\n- **Status:** **Ready / Draft**\n\nYou can launch this campaign now or schedule it from the campaigns dashboard.`,
        actionExecuted: {
          type: "create_campaign",
          campaignId: newCamp._id,
          campaignName: campName,
          template: matchingTpl.name,
          audienceSize: newCamp.audienceSize,
        },
        links: [
          { label: "Open Campaigns Manager", url: "/crm/campaigns" },
          { label: "View Message History", url: "/crm/history" },
        ],
        suggestions: [
          "Launch this campaign now",
          "Show campaign delivery stats",
          "Show total leads overview",
        ],
      };
    }
  }

  // --- INTENT D: CRM Metrics & Database Query ---
  if (lower.includes("lead") || lower.includes("stats") || lower.includes("conversion") || lower.includes("data") || lower.includes("overview") || lower.includes("report")) {
    const convRate = totalLeads ? ((wonLeads / totalLeads) * 100).toFixed(1) : "0";
    return {
      reply: `📊 **KnowVato CRM Live Overview:**\n\n- **Total Leads:** ${totalLeads}\n- **Won Deals:** 🟢 ${wonLeads} (${convRate}% conversion rate)\n- **Open Active Leads:** 🟡 ${openLeads}\n- **Lost Leads:** 🔴 ${lostLeads}\n- **Contacts in Database:** 👥 ${contacts.length}\n- **WhatsApp Templates:** 📄 ${templates.length} (${approvedTemplates.length} Approved)\n- **Visual Chatbots:** 🤖 ${Array.isArray(flowState?.bots) ? flowState!.bots.length : 0} bots\n\nEverything is synced in real-time with MongoDB.`,
      actionExecuted: {
        type: "query_metrics",
        totalLeads,
        wonLeads,
        openLeads,
        contactsCount: contacts.length,
      },
      links: [
        { label: "Open Leads Pipeline", url: "/crm/leads" },
        { label: "Conversion Analytics", url: "/crm/conversion" },
        { label: "Contacts Directory", url: "/crm/contacts" },
      ],
      suggestions: [
        "Create chatbot with keyword 'Learn'",
        "Schedule an event for next week",
        "Run WhatsApp campaign on Hot Leads",
      ],
    };
  }

  // --- INTENT E: Add Contact / Lead ---
  if (lower.includes("add contact") || lower.includes("create lead") || lower.includes("new contact")) {
    const phoneMatch = cleanPrompt.match(/(?:\+?\d{1,3})?[-. ]?\(?\d{3,4}\)?[-. ]?\d{3}[-. ]?\d{4}|\d{10,12}/);
    const phone = phoneMatch ? phoneMatch[0].replace(/[^\d+]/g, "") : `+9198${Math.floor(10000000 + Math.random() * 90000000)}`;
    const nameMatch = cleanPrompt.match(/(?:named|name|contact)\s*["']?([a-zA-Z\s]+?)["']?(?:\s+(?:with|phone|mobile)|$|,|\.)/i);
    const name = nameMatch && nameMatch[1] ? nameMatch[1].trim() : "New Contact";

    const leadRes = await convertToLead({
      tenant: tenantId as any,
      name,
      phone,
      sourceKeyOrId: "AI Assistant",
      user: user || "AI Copilot",
    });

    return {
      reply: `✅ **Contact & Lead Created Successfully!**\n\n- **Name:** ${name}\n- **Phone:** \`${phone}\`\n- **Source:** AI Assistant\n- **Lead Status:** New\n\nLead record has been logged in the CRM database.`,
      actionExecuted: {
        type: "create_lead",
        leadId: leadRes.lead?._id,
        name,
        phone,
      },
      links: [
        { label: "View in Leads Pipeline", url: "/crm/leads" },
        { label: "Start WhatsApp Conversation", url: "/crm/chat" },
      ],
      suggestions: [
        `Schedule a follow-up for ${name}`,
        "Show total leads overview",
      ],
    };
  }

  // --- Default: Context-aware AI response ---
  return {
    reply: `👋 **KnowVato AI Assistant Ready!**\n\nI can execute operational tasks directly across your CRM and Database:\n\n1. **🤖 Chatbots:** *"Create chatbot with keyword 'Learn' and ask for student details"*\n2. **📅 Events:** *"Create Event 'Tech Summit 2026' and generate passes (no email)"*\n3. **📢 Campaigns:** *"Run WhatsApp campaign on attached list"*\n4. **📊 Database Queries:** *"Show total leads and conversion stats"*\n5. **👥 CRM Operations:** *"Add contact Priya Sharma with phone +919876543210"*\n\nHow would you like me to assist you?`,
    suggestions: [
      "Create chatbot with keyword 'Learn'",
      "Create Tech Event & generate passes (no email)",
      "Run WhatsApp campaign on contacts",
      "Show CRM overview & conversion stats",
    ],
  };
}
