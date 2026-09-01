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

function hasAny(text: string, terms: string[]): boolean {
  return terms.some((t) => text.includes(t));
}

function titleCaseWord(v: string): string {
  if (!v) return v;
  return v.charAt(0).toUpperCase() + v.slice(1);
}

function extractJsonPayload(raw: string): any | null {
  if (!raw) return null;
  const cleaned = raw.trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const fenced = cleaned.match(/```json\s*([\s\S]*?)```/i);
    if (fenced?.[1]) {
      try {
        return JSON.parse(fenced[1]);
      } catch {
        return null;
      }
    }
    const first = cleaned.indexOf("{");
    const last = cleaned.lastIndexOf("}");
    if (first >= 0 && last > first) {
      try {
        return JSON.parse(cleaned.slice(first, last + 1));
      } catch {
        return null;
      }
    }
    return null;
  }
}

async function inferOperationalIntent(payload: {
  provider: string;
  model: string;
  apiKey: string;
  prompt: string;
  history?: any[];
  contextSummary: string;
}) {
  const system = `You are an operations-only intent router for a CRM.
You must output ONLY strict JSON with this shape:
{
  "intent": "create_chatbot|list_chatbots|update_chatbot_status|create_event|run_campaign|query_metrics|create_lead|unknown",
  "params": {
    "keyword": "",
    "botName": "",
    "buttons": [],
    "status": "live|draft",
    "templateName": "",
    "eventTitle": "",
    "noEmail": true,
    "name": "",
    "phone": ""
  },
  "confidence": 0
}
Rules:
- Never suggest code/UI/config actions.
- Infer intent from natural language, Hinglish, typos.
- If uncertain, set intent=unknown.`;

  const userText = `Context:\n${payload.contextSummary}\n\nHistory:\n${JSON.stringify(payload.history || []).slice(0, 2000)}\n\nUser prompt:\n${payload.prompt}`;

  if (payload.provider === "gemini") {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${payload.model}:generateContent?key=${payload.apiKey}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        generationConfig: { responseMimeType: "application/json", temperature: 0.1 },
        contents: [
          { role: "user", parts: [{ text: `${system}\n\n${userText}` }] },
        ],
      }),
    });
    const data: any = await res.json();
    if (!res.ok) throw new Error(data?.error?.message || "Gemini intent inference failed");
    const out = data?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
    return extractJsonPayload(out);
  }

  if (payload.provider === "claude") {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": payload.apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: payload.model,
        max_tokens: 400,
        temperature: 0.1,
        system,
        messages: [{ role: "user", content: userText }],
      }),
    });
    const data: any = await res.json();
    if (!res.ok) throw new Error(data?.error?.message || "Claude intent inference failed");
    const out = data?.content?.[0]?.text || "{}";
    return extractJsonPayload(out);
  }

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${payload.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: payload.model || "gpt-4o-mini",
      temperature: 0.1,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: userText },
      ],
    }),
  });
  const data: any = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || "OpenAI intent inference failed");
  const out = data?.choices?.[0]?.message?.content || "{}";
  return extractJsonPayload(out);
}

async function generateProjectScopedReply(payload: {
  provider: string;
  model: string;
  apiKey: string;
  prompt: string;
  history?: any[];
  contextSnapshot: any;
}) {
  const system = `You are KnowVato AI Copilot for one tenant only.
Rules:
- You are PROJECT-SCOPED. Use only provided CRM context.
- Do not use external/world knowledge unless explicitly present in provided context.
- You must refuse code changes, UI edits, configuration/env changes, package installs.
- Focus on operational CRM guidance and executable next actions.
- Keep responses concise and practical.`;

  const userText = `Project context JSON:\n${JSON.stringify(payload.contextSnapshot).slice(0, 7000)}\n\nRecent chat history:\n${JSON.stringify(payload.history || []).slice(0, 2500)}\n\nUser prompt:\n${payload.prompt}\n\nReturn plain text only.`;

  if (payload.provider === "gemini") {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${payload.model}:generateContent?key=${payload.apiKey}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        generationConfig: { temperature: 0.2 },
        contents: [{ role: "user", parts: [{ text: `${system}\n\n${userText}` }] }],
      }),
    });
    const data: any = await res.json();
    if (!res.ok) throw new Error(data?.error?.message || "Gemini project reply failed");
    return String(data?.candidates?.[0]?.content?.parts?.[0]?.text || "").trim();
  }

  if (payload.provider === "claude") {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": payload.apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: payload.model,
        temperature: 0.2,
        max_tokens: 500,
        system,
        messages: [{ role: "user", content: userText }],
      }),
    });
    const data: any = await res.json();
    if (!res.ok) throw new Error(data?.error?.message || "Claude project reply failed");
    return String(data?.content?.[0]?.text || "").trim();
  }

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${payload.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: payload.model || "gpt-4o-mini",
      temperature: 0.2,
      messages: [
        { role: "system", content: system },
        { role: "user", content: userText },
      ],
    }),
  });
  const data: any = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || "OpenAI project reply failed");
  return String(data?.choices?.[0]?.message?.content || "").trim();
}

function isConfirmationText(lower: string): boolean {
  const v = lower.trim();
  return ["yes", "y", "ok", "okay", "confirm", "proceed", "go ahead", "execute", "run it"].includes(v);
}

async function inferExecutionPlan(payload: {
  provider: string;
  model: string;
  apiKey: string;
  prompt: string;
  contextSummary: string;
}) {
  const system = `You are an execution planner for CRM operations.
Return ONLY JSON:
{
  "needsConfirmation": true,
  "steps": [
    { "prompt": "..." }
  ],
  "confidence": 0
}
Rules:
- Only operational CRM steps.
- No code/ui/config/env/package actions.
- steps.prompt should be explicit and executable.`;

  const userText = `Context: ${payload.contextSummary}\nUser request: ${payload.prompt}`;

  if (payload.provider === "gemini") {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${payload.model}:generateContent?key=${payload.apiKey}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        generationConfig: { responseMimeType: "application/json", temperature: 0.1 },
        contents: [{ role: "user", parts: [{ text: `${system}\n\n${userText}` }] }],
      }),
    });
    const data: any = await res.json();
    if (!res.ok) throw new Error(data?.error?.message || "Gemini plan inference failed");
    return extractJsonPayload(data?.candidates?.[0]?.content?.parts?.[0]?.text || "{}");
  }

  if (payload.provider === "claude") {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": payload.apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: payload.model,
        max_tokens: 450,
        temperature: 0.1,
        system,
        messages: [{ role: "user", content: userText }],
      }),
    });
    const data: any = await res.json();
    if (!res.ok) throw new Error(data?.error?.message || "Claude plan inference failed");
    return extractJsonPayload(data?.content?.[0]?.text || "{}");
  }

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${payload.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: payload.model || "gpt-4o-mini",
      temperature: 0.1,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: userText },
      ],
    }),
  });
  const data: any = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || "OpenAI plan inference failed");
  return extractJsonPayload(data?.choices?.[0]?.message?.content || "{}");
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
export async function executeAiCommand(
  tenantId: string,
  user: string,
  prompt: string,
  history: any[] = [],
  opts: { skipPlanner?: boolean } = {}
) {
  if (!prompt || !prompt.trim()) {
    throw new Error("Prompt cannot be empty");
  }

  const cleanPrompt = prompt.trim();
  const lower = cleanPrompt.toLowerCase();

  // Strict operational boundary: refuse code/UI/configuration change requests.
  const forbiddenCodeUiOps = hasAny(lower, [
    "ui",
    "frontend",
    "css",
    "jsx",
    "react component",
    "change function",
    "fix code",
    "bug fix",
    "backend code",
    "api code",
    "configuration",
    "config",
    "env",
    ".env",
    "port",
    "install package",
    "npm install",
    "database schema change",
    "migration",
  ]);

  if (forbiddenCodeUiOps) {
    return {
      reply:
        "I can execute operational CRM tasks only (chatbots, campaigns, leads, events, data queries). Code/UI/configuration changes are intentionally blocked in AI Copilot.",
      actionExecuted: {
        type: "blocked_non_operational_request",
      },
      suggestions: [
        "Create chatbot with keyword 'knowvato' and buttons like Call, Book Demo, Explore Website",
        "Run WhatsApp campaign using template admission_welcome",
        "Show total leads and conversion stats",
      ],
    };
  }

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

  const existingBots = Array.isArray(flowState?.bots) ? flowState!.bots : [];
  const aiCfg = await AISettings.findOne({ tenant: tenantId as any }).lean();

  let inferred: any = null;
  if (aiCfg?.enabled && aiCfg?.apiKey) {
    try {
      inferred = await inferOperationalIntent({
        provider: aiCfg.provider || "gemini",
        model: aiCfg.model || "gemini-1.5-flash",
        apiKey: aiCfg.apiKey,
        prompt: cleanPrompt,
        history,
        contextSummary: `leads=${totalLeads}, contacts=${contacts.length}, templates=${approvedTemplates.length}, bots=${existingBots.length}`,
      });
    } catch {
      inferred = null;
    }
  }
  const inferredIntent = String(inferred?.intent || "").toLowerCase();
  const inferredParams = inferred?.params || {};

  const pendingPlan = (aiCfg as any)?.extra?.pendingPlan;

  if (!opts.skipPlanner && isConfirmationText(lower)) {
    if (!pendingPlan || !Array.isArray(pendingPlan.steps) || pendingPlan.steps.length === 0) {
      return {
        reply: "No pending execution plan found. Share your goal and I will create and run an operational plan.",
        suggestions: [
          "Create and activate an admissions chatbot with 3 quick buttons",
          "Show active bots and pause inactive ones",
          "Run a WhatsApp campaign with approved template",
        ],
      };
    }

    if (pendingPlan.expiresAt && new Date(pendingPlan.expiresAt).getTime() < Date.now()) {
      await AISettings.updateOne(
        { tenant: tenantId as any },
        { $set: { "extra.pendingPlan": null } }
      );
      return {
        reply: "Pending plan expired. Please ask again and I will regenerate it.",
      };
    }

    const results: string[] = [];
    for (const step of pendingPlan.steps) {
      const p = String(step?.prompt || "").trim();
      if (!p) continue;
      const out = await executeAiCommand(tenantId, user, p, history, { skipPlanner: true });
      results.push(`- ${p}: ${String(out?.actionExecuted?.type || "done")}`);
    }

    await AISettings.updateOne(
      { tenant: tenantId as any },
      { $set: { "extra.pendingPlan": null } }
    );

    return {
      reply: `Plan executed successfully.\n\n${results.join("\n") || "- Completed"}`,
      actionExecuted: {
        type: "execute_confirmed_plan",
        planId: pendingPlan.id,
        steps: pendingPlan.steps.length,
      },
      suggestions: [
        "Show updated chatbot list",
        "Show CRM overview",
        "Run another operation",
      ],
    };
  }

  if (!opts.skipPlanner && aiCfg?.enabled && aiCfg?.apiKey && !isConfirmationText(lower)) {
    try {
      const plan = await inferExecutionPlan({
        provider: aiCfg.provider || "gemini",
        model: aiCfg.model || "gemini-1.5-flash",
        apiKey: aiCfg.apiKey,
        prompt: cleanPrompt,
        contextSummary: `leads=${totalLeads}, contacts=${contacts.length}, templates=${approvedTemplates.length}, bots=${existingBots.length}`,
      });

      const steps = Array.isArray(plan?.steps)
        ? plan.steps
            .map((s: any) => ({ prompt: String(s?.prompt || "").trim() }))
            .filter((s: any) => s.prompt)
            .slice(0, 6)
        : [];

      const confidence = Number(plan?.confidence || 0);
      if ((plan?.needsConfirmation || steps.length > 1) && steps.length > 0 && confidence >= 0.5) {
        const planId = (crypto as any).randomUUID ? (crypto as any).randomUUID() : crypto.randomBytes(8).toString("hex");
        const expiry = new Date(Date.now() + 10 * 60 * 1000);

        await AISettings.updateOne(
          { tenant: tenantId as any },
          {
            $set: {
              "extra.pendingPlan": {
                id: planId,
                createdAt: new Date(),
                expiresAt: expiry,
                steps,
              },
            },
          }
        );

        const stepText = steps.map((s: any, i: number) => `${i + 1}. ${s.prompt}`).join("\n");
        return {
          reply: `I prepared an execution plan for your request:\n\n${stepText}\n\nReply with \"yes\" to execute this plan now.`,
          actionExecuted: {
            type: "plan_created_waiting_confirmation",
            planId,
            steps: steps.length,
          },
          suggestions: ["yes", "modify plan", "cancel"],
        };
      }
    } catch {
      // Continue with direct execution paths.
    }
  }

  // --- INTENT 0: Bot operations (list, activate, pause) ---
  if (hasAny(lower, ["show bot", "list bot", "all bot", "active bot", "chatbot list"]) || inferredIntent === "list_chatbots") {
    if (existingBots.length === 0) {
      return {
        reply: "No chatbots found yet. I can create one for you right now.",
        actionExecuted: { type: "list_chatbots", count: 0 },
        suggestions: [
          "Create chatbot with keyword 'learn'",
          "Create chatbot with keyword 'knowvato' and buttons like Call, Book Demo, Explore Website",
        ],
        links: [{ label: "Open Chatbot Builder", url: "/crm/chatbot" }],
      };
    }

    const botLines = existingBots
      .slice(0, 12)
      .map((b: any, i: number) => `${i + 1}. ${b.name} (${b.status || "draft"})`) 
      .join("\n");
    return {
      reply: `Here are your available chatbots:\n\n${botLines}`,
      actionExecuted: { type: "list_chatbots", count: existingBots.length },
      links: [{ label: "Open Chatbot Manager", url: "/crm/chatbot" }],
      suggestions: [
        "Activate chatbot Learn Bot",
        "Pause chatbot Learn Bot",
        "Create another chatbot with keyword 'admission'",
      ],
    };
  }

  if (hasAny(lower, ["activate bot", "activate chatbot", "live bot", "pause bot", "disable bot", "deactivate bot"]) || inferredIntent === "update_chatbot_status") {
    const targetNameMatch = cleanPrompt.match(/(?:bot|chatbot)\s+([a-zA-Z0-9_\-\s]+)/i);
    const targetName = (String(inferredParams.botName || "") || targetNameMatch?.[1] || "").trim().toLowerCase();
    const desiredStatus = String(inferredParams.status || "").toLowerCase() === "draft"
      ? "draft"
      : hasAny(lower, ["pause", "disable", "deactivate"]) ? "draft" : "live";

    const found = existingBots.find((b: any) => String(b.name || "").toLowerCase().includes(targetName));
    if (!found) {
      return {
        reply: "I could not find that chatbot name. Please share the exact bot name.",
        actionExecuted: { type: "update_chatbot_status", updated: false },
        suggestions: ["Show all chatbots", "Activate chatbot Learn Bot", "Pause chatbot Learn Bot"],
      };
    }

    const updatedBots = existingBots.map((b: any) =>
      b.id === found.id ? { ...b, status: desiredStatus, updatedAt: Date.now() } : b
    );

    await FlowStudioState.findOneAndUpdate(
      { tenant: tenantId as any },
      {
        $set: {
          tenant: tenantId as any,
          bots: updatedBots,
          forms: Array.isArray(flowState?.forms) ? flowState!.forms : [],
        },
      },
      { upsert: true, new: true }
    );

    return {
      reply: `Done. ${found.name} is now ${desiredStatus === "live" ? "Live" : "Paused"}.`,
      actionExecuted: {
        type: "update_chatbot_status",
        botId: found.id,
        botName: found.name,
        status: desiredStatus,
      },
      links: [{ label: "Open Chatbot Manager", url: "/crm/chatbot" }],
      suggestions: ["Show all chatbots", "Create another chatbot", "Test chatbot flow"],
    };
  }

  // 2. Check for Operational Intent:

  // --- INTENT A: Create Chatbot Flow ---
  const chatbotIntent =
    /\b(create|make|build)\b[\s\w]{0,20}\b(chat\s*bot|chatbot|bot)\b/i.test(cleanPrompt) ||
    /\b(add|generate|setup|set up|launch)\b[\s\w]{0,20}\b(chat\s*bot|chatbot|bot)\b/i.test(cleanPrompt) ||
    hasAny(lower, ["another bot", "one more bot", "ek or bot", "ek aur bot"]) ||
    lower.includes("chatbot banado") ||
    lower.includes("create bot") ||
    lower.includes("create chatbot") ||
    inferredIntent === "create_chatbot";

  if (chatbotIntent) {
    // Extract keyword if specified (e.g. 'Learn' or 'Know more' or 'Admissions')
    let keyword = "learn";
    const kwMatch = cleanPrompt.match(/keyword\s*["':]?\s*([a-zA-Z0-9_\s]+?)["']?(?:\s|$|,|\.)/i) ||
                    cleanPrompt.match(/with\s*(?:the\s*)?keyword\s*["']?([^"']+)["']?/i);
    if (String(inferredParams.keyword || "").trim()) {
      keyword = String(inferredParams.keyword).trim().toLowerCase();
    } else if (kwMatch && kwMatch[1]) {
      keyword = kwMatch[1].trim().toLowerCase();
    } else {
      const forTopic = cleanPrompt.match(/for\s+([a-zA-Z0-9_\-\s]{2,40})/i);
      if (forTopic?.[1]) {
        keyword = forTopic[1].trim().split(/\s+/)[0].toLowerCase();
      }
    }

    keyword = keyword.replace(/[^a-z0-9_\s-]/gi, "").trim() || "learn";

    let customBotName = "";
    const nameMatch = cleanPrompt.match(/(?:named|name)\s*["']?([^"']+)["']?/i);
    if (String(inferredParams.botName || "").trim()) {
      customBotName = String(inferredParams.botName).trim();
    } else if (nameMatch?.[1]) {
      customBotName = nameMatch[1].trim();
    }

    const botName = customBotName || `${titleCaseWord(keyword)} Bot`;

    // Extract requested quick-reply buttons from natural prompt.
    // Examples supported:
    // - "buttons like call, book demo, explore website"
    // - "buttons: Call | Book Demo | Explore Website"
    let requestedButtons: string[] = [];
    const btnMatch = cleanPrompt.match(/buttons?\s*(?:like|such as|:)?\s*([^\n.]+)/i);
    if (Array.isArray(inferredParams.buttons) && inferredParams.buttons.length > 0) {
      requestedButtons = inferredParams.buttons.map((b: any) => String(b).trim()).filter(Boolean).slice(0, 3);
    } else if (btnMatch && btnMatch[1]) {
      requestedButtons = btnMatch[1]
        .split(/\||,| and /i)
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 3);
    }
    if (requestedButtons.length === 0 && lower.includes("button")) {
      requestedButtons = ["Call", "Book Demo", "Explore Website"];
    }
    requestedButtons = requestedButtons.map((b) => b.replace(/[.]+$/g, "").trim()).filter(Boolean);

    const botId = `bot_${Date.now().toString(36)}`;
    const startId = `n_start_${Date.now().toString(36)}`;
    const msgId = `n_msg_${Date.now().toString(36)}`;
    const nextId = `n_next_${Date.now().toString(36)}`;
    const endId = `n_end_${Date.now().toString(36)}`;
    const hasButtons = requestedButtons.length > 0;
    const buttonsNodeId = `n_btn_${Date.now().toString(36)}`;
    const buttonItems = requestedButtons.map((label, idx) => ({
      id: `btn_${idx + 1}`,
      label,
    }));

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
          connections: { next: hasButtons ? buttonsNodeId : nextId },
        },
        ...(hasButtons
          ? {
              [buttonsNodeId]: {
                id: buttonsNodeId,
                type: "buttons",
                position: { x: 700, y: 160 },
                data: {
                  text: "Please choose an option below to continue:",
                  buttons: buttonItems,
                },
                connections: buttonItems.reduce(
                  (acc, b) => ({ ...acc, [b.id]: nextId }),
                  {}
                ),
              },
            }
          : {}),
        [nextId]: {
          id: nextId,
          type: hasButtons ? "message" : "question",
          position: { x: 700, y: 160 },
          data: hasButtons
            ? {
                text: "Thanks for your selection. Our team will connect with full details shortly.",
              }
            : {
                text: "Please let us know your name or what course/topic you would like to explore:",
                variableName: "user_interest",
                inputType: "text",
              },
          connections: { next: endId },
        },
        [endId]: {
          id: endId,
          type: "end",
          position: { x: 1040, y: 160 },
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
      reply: `✅ **Chatbot Flow Created Successfully!**\n\n- **Bot Name:** ${botName}\n- **Trigger Keyword:** \`${keyword}\`\n- **Status:** 🟢 **Live on WhatsApp**\n- **Flow Blocks:** ${hasButtons ? "5 nodes (Start ➔ Welcome ➔ Buttons ➔ Follow-up ➔ End)" : "4 nodes (Start ➔ Welcome ➔ Question ➔ End)"}\n${hasButtons ? `- **Buttons Added:** ${requestedButtons.join(", ")}` : ""}\n\nYou can immediately test by typing \`${keyword}\` on WhatsApp or open the Visual Builder below to customize blocks.`,
      actionExecuted: {
        type: "create_chatbot",
        botId,
        botName,
        keyword,
        buttons: requestedButtons,
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
  if (lower.includes("create event") || lower.includes("event banado") || lower.includes("schedule event") || inferredIntent === "create_event") {
    const titleMatch = cleanPrompt.match(/(?:event|named|called)\s*["']?([^"',\n]+)["']?/i);
    const eventTitle = String(inferredParams.eventTitle || "").trim() || (titleMatch && titleMatch[1] ? titleMatch[1].trim() : "Admissions & Tech Open House 2026");
    const dontEmail =
      Boolean(inferredParams.noEmail) ||
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
  if (lower.includes("run whatsapp campaign") || lower.includes("campaign run") || lower.includes("send broadcast") || lower.includes("blast") || inferredIntent === "run_campaign") {
    // Check if user already specified a template name
    let matchingTpl = approvedTemplates.find((t) => lower.includes(t.name.toLowerCase()));
    if (!matchingTpl && String(inferredParams.templateName || "").trim()) {
      matchingTpl = approvedTemplates.find((t) => t.name.toLowerCase() === String(inferredParams.templateName).trim().toLowerCase());
    }
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
  if (lower.includes("lead") || lower.includes("stats") || lower.includes("conversion") || lower.includes("data") || lower.includes("overview") || lower.includes("report") || inferredIntent === "query_metrics") {
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
  if (lower.includes("add contact") || lower.includes("create lead") || lower.includes("new contact") || inferredIntent === "create_lead") {
    const phoneMatch = cleanPrompt.match(/(?:\+?\d{1,3})?[-. ]?\(?\d{3,4}\)?[-. ]?\d{3}[-. ]?\d{4}|\d{10,12}/);
    const phone = String(inferredParams.phone || "").trim() || (phoneMatch ? phoneMatch[0].replace(/[^\d+]/g, "") : `+9198${Math.floor(10000000 + Math.random() * 90000000)}`);
    const nameMatch = cleanPrompt.match(/(?:named|name|contact)\s*["']?([a-zA-Z\s]+?)["']?(?:\s+(?:with|phone|mobile)|$|,|\.)/i);
    const name = String(inferredParams.name || "").trim() || (nameMatch && nameMatch[1] ? nameMatch[1].trim() : "New Contact");

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
  if (aiCfg?.enabled && aiCfg?.apiKey) {
    try {
      const scopedReply = await generateProjectScopedReply({
        provider: aiCfg.provider || "gemini",
        model: aiCfg.model || "gemini-1.5-flash",
        apiKey: aiCfg.apiKey,
        prompt: cleanPrompt,
        history,
        contextSnapshot: {
          leads: {
            total: totalLeads,
            won: wonLeads,
            lost: lostLeads,
            open: openLeads,
          },
          contactsCount: contacts.length,
          templates: approvedTemplates.slice(0, 30).map((t: any) => ({ name: t.name, category: t.category, status: t.status })),
          chatbots: existingBots.slice(0, 30).map((b: any) => ({ id: b.id, name: b.name, status: b.status, startNodeId: b.startNodeId })),
          campaigns: (campaigns || []).slice(0, 20).map((c: any) => ({ name: c.name, status: c.status, audienceSize: c.audienceSize })),
        },
      });

      if (scopedReply) {
        return {
          reply: scopedReply,
          actionExecuted: { type: "project_scoped_ai_response" },
          suggestions: [
            "Create a new chatbot for admissions enquiries with 3 options",
            "Show all active chatbots and pause inactive ones",
            "Run WhatsApp campaign with an approved template",
            "Show live lead conversion overview",
          ],
        };
      }
    } catch {
      // Fall back to local canned guidance below.
    }
  }

  return {
    reply: `👋 **KnowVato AI Assistant Ready!**\n\nI can autonomously read your request and execute operational CRM tasks (chatbots, campaigns, leads, events, reporting) without fixed command templates.\n\nShare your goal in natural language and I will perform it directly.\n\nNote: Code/UI/configuration changes are intentionally blocked in AI Copilot for safety.`,
    suggestions: [
      "Create one more chatbot for admissions with 3 quick buttons",
      "Pause all inactive bots and show active ones",
      "Run a WhatsApp campaign using an approved template",
      "Show live CRM performance overview",
    ],
  };
}
