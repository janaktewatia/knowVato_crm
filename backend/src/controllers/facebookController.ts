import { Request, Response } from "express";
import { Integration } from "../models/System";
import { Lead } from "../models/Lead";
import { LeadSource } from "../models/Masters";
import { asyncHandler, ok, ApiError, audit } from "../utils/http";

/**
 * List Facebook Lead Ads Integration accounts for current tenant
 */
export const listAccounts = asyncHandler(async (req: Request, res: Response) => {
  const tenant = req.tenantId;
  const list = await Integration.find({ tenant, key: { $regex: /^facebook/i } }).sort({ createdAt: -1 });
  ok(res, list);
});

/**
 * Create a new Facebook Integration account
 */
export const createAccount = asyncHandler(async (req: Request, res: Response) => {
  const tenant = req.tenantId;
  const { pageName, pageId, pageAccessToken, verifyToken, appSecret, active, formMapping } = req.body;

  if (!pageName || !pageId) {
    throw new ApiError("Page Name and Page ID are required", 400);
  }

  // Set other facebook integrations inactive if this one is set active
  if (active) {
    await Integration.updateMany({ tenant, key: { $regex: /^facebook/i } }, { connected: false });
  }

  const doc = await Integration.create({
    tenant,
    key: `facebook_${pageId}`,
    name: pageName,
    category: "Facebook Lead Ads",
    icon: "facebook",
    desc: `Facebook Page: ${pageName} (${pageId})`,
    connected: Boolean(active),
    account: pageId,
    config: {
      pageName,
      pageId,
      pageAccessToken: pageAccessToken || "",
      verifyToken: verifyToken || "knowvato_fb_token",
      appSecret: appSecret || "",
      formMapping: formMapping || { name: "full_name", phone: "phone_number", email: "email" },
      active: Boolean(active),
      status: pageAccessToken ? "connected" : "untested"
    }
  });

  await audit(req, "create", "setup", `Facebook Integration: ${pageName}`, undefined, doc._id.toString());
  ok(res, doc, 201);
});

/**
 * Update an existing Facebook Integration account
 */
export const updateAccount = asyncHandler(async (req: Request, res: Response) => {
  const tenant = req.tenantId;
  const { id } = req.params;
  const doc = await Integration.findOne({ _id: id, tenant });
  if (!doc) throw new ApiError("Facebook integration not found", 404);

  const prev = JSON.stringify(doc);
  const { pageName, pageId, pageAccessToken, verifyToken, appSecret, active, formMapping } = req.body;

  if (active) {
    await Integration.updateMany({ tenant, key: { $regex: /^facebook/i }, _id: { $ne: id } }, { connected: false });
  }

  doc.name = pageName || doc.name;
  doc.account = pageId || doc.account;
  doc.connected = active !== undefined ? Boolean(active) : doc.connected;
  doc.config = {
    ...doc.config,
    pageName: pageName || doc.config?.pageName,
    pageId: pageId || doc.config?.pageId,
    pageAccessToken: pageAccessToken !== undefined ? pageAccessToken : doc.config?.pageAccessToken,
    verifyToken: verifyToken !== undefined ? verifyToken : doc.config?.verifyToken,
    appSecret: appSecret !== undefined ? appSecret : doc.config?.appSecret,
    formMapping: formMapping || doc.config?.formMapping,
    active: active !== undefined ? Boolean(active) : doc.config?.active
  };

  await doc.save();
  await audit(req, "update", "setup", `Facebook Integration: ${doc.name}`, prev, JSON.stringify(doc));
  ok(res, doc);
});

/**
 * Delete a Facebook Integration account
 */
export const deleteAccount = asyncHandler(async (req: Request, res: Response) => {
  const tenant = req.tenantId;
  const { id } = req.params;
  const doc = await Integration.findOneAndDelete({ _id: id, tenant });
  if (!doc) throw new ApiError("Facebook integration not found", 404);
  await audit(req, "delete", "setup", `Facebook Integration: ${doc.name}`, JSON.stringify(doc), undefined);
  ok(res, { deleted: true });
});

/**
 * Activate a Facebook Integration
 */
export const activate = asyncHandler(async (req: Request, res: Response) => {
  const tenant = req.tenantId;
  const { id } = req.params;
  await Integration.updateMany({ tenant, key: { $regex: /^facebook/i } }, { connected: false });
  const doc = await Integration.findOneAndUpdate({ _id: id, tenant }, { connected: true }, { new: true });
  if (!doc) throw new ApiError("Facebook integration not found", 404);
  ok(res, doc);
});

/**
 * Test Facebook Meta Graph API Connection
 */
export const testConnection = asyncHandler(async (req: Request, res: Response) => {
  const { pageAccessToken, pageId } = req.body;
  const token = pageAccessToken || "";
  
  if (!token) {
    throw new ApiError("Page Access Token is required to test connection", 400);
  }

  try {
    const apiRes = await fetch(`https://graph.facebook.com/v21.0/me?access_token=${encodeURIComponent(token)}`);
    const data = await apiRes.json();

    if (data.error) {
      return ok(res, { ok: false, error: data.error.message || "Meta API error" });
    }

    return ok(res, { ok: true, me: data, pageId: data.id || pageId });
  } catch (err: any) {
    return ok(res, { ok: false, error: err.message || "Network error contacting Meta Graph API" });
  }
});

/**
 * Fetch Facebook Page Lead Generation Forms
 */
export const fetchLeadForms = asyncHandler(async (req: Request, res: Response) => {
  const tenant = req.tenantId;
  const { id } = req.params;
  const doc = await Integration.findOne({ _id: id, tenant });
  const token = doc?.config?.pageAccessToken || req.body?.pageAccessToken;
  const pageId = doc?.config?.pageId || req.body?.pageId;

  if (!token || !pageId) {
    throw new ApiError("Page Access Token and Page ID are required", 400);
  }

  try {
    const apiRes = await fetch(`https://graph.facebook.com/v21.0/${pageId}/leadgen_forms?access_token=${encodeURIComponent(token)}`);
    const data = await apiRes.json();

    if (data.error) {
      return ok(res, { ok: false, error: data.error.message });
    }

    return ok(res, { ok: true, forms: data.data || [] });
  } catch (err: any) {
    return ok(res, { ok: false, error: err.message });
  }
});

/**
 * Facebook Webhook Verification Challenge (GET /webhooks/facebook/:tenantId)
 */
export const fbWebhookVerify = (req: Request, res: Response) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && challenge) {
    return res.status(200).send(challenge);
  }
  return res.sendStatus(403);
};

/**
 * Facebook Incoming Lead Webhook Event Handler (POST /webhooks/facebook/:tenantId)
 */
export const fbWebhookReceive = asyncHandler(async (req: Request, res: Response) => {
  const { tenantId } = req.params;
  const body = req.body;

  res.status(200).send("EVENT_RECEIVED");

  if (body.object === "page") {
    for (const entry of body.entry || []) {
      for (const change of entry.changes || []) {
        if (change.field === "leadgen") {
          const leadgenId = change.value?.leadgen_id;
          const pageId = change.value?.page_id;

          if (leadgenId && tenantId) {
            // Find Facebook integration config for tenant
            const doc = await Integration.findOne({ tenant: tenantId, account: pageId });
            const token = doc?.config?.pageAccessToken;

            if (token) {
              try {
                const leadRes = await fetch(`https://graph.facebook.com/v21.0/${leadgenId}?access_token=${encodeURIComponent(token)}`);
                const leadData = await leadRes.json();

                if (leadData && leadData.field_data) {
                  let name = "Facebook Lead";
                  let phone = "";
                  let email = "";

                  for (const f of leadData.field_data) {
                    if (["full_name", "name", "first_name"].includes(f.name)) name = f.values?.[0] || name;
                    if (["phone_number", "phone", "mobile"].includes(f.name)) phone = f.values?.[0] || phone;
                    if (["email", "email_address"].includes(f.name)) email = f.values?.[0] || email;
                  }

                  if (phone || email) {
                    let source = await LeadSource.findOne({ tenant: tenantId, name: /facebook/i });
                    if (!source) source = await LeadSource.create({ tenant: tenantId, name: "Facebook Ads" });

                    await Lead.create({
                      tenant: tenantId,
                      name,
                      phone: phone.replace(/[^0-9+]/g, ""),
                      email,
                      source: source._id,
                      notes: `Auto-captured from Facebook Lead Ad #${leadgenId}`,
                    });
                  }
                }
              } catch (e) {
                console.error("Error processing Facebook lead:", e);
              }
            }
          }
        }
      }
    }
  }
});
