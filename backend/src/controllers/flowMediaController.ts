import { Request, Response } from "express";
import path from "path";
import fs from "fs/promises";
import { asyncHandler, ok, ApiError, audit } from "../utils/http";
import { FlowMediaAsset } from "../models/FlowMediaAsset";
import { FlowStudioState } from "../models/FlowStudioState";
import { Template } from "../models/Messaging";

const MAX_MEDIA_BYTES = 5 * 1024 * 1024;
const MEDIA_TYPES = new Set(["image", "video", "document", "audio"]);

const MIME_GUARDS: Record<string, RegExp> = {
  image: /^image\//i,
  video: /^video\//i,
  document: /^application\/pdf$/i,
  audio: /^audio\//i,
};

function cleanType(input: any): "image" | "video" | "document" | "audio" {
  const value = String(input || "").trim().toLowerCase();
  if (!MEDIA_TYPES.has(value)) {
    throw new ApiError(400, "Invalid media type. Allowed: image, video, document, audio");
  }
  return value as "image" | "video" | "document" | "audio";
}

function cleanName(input: any): string {
  const value = String(input || "").trim();
  if (!value) throw new ApiError(400, "Media name is required");
  return value;
}

function normalizeValue(value: any): string {
  return String(value || "").trim();
}

function buildAbsoluteUrl(req: Request, relativePath: string): string {
  const host = req.get("host");
  return `${req.protocol}://${host}${relativePath}`;
}

async function buildUsageMap(tenantId: string) {
  const usage = new Map<string, { templates: Set<string>; bots: Set<string> }>();

  const mark = (url: any, source: "templates" | "bots", name: string) => {
    const key = normalizeValue(url);
    if (!key) return;
    if (!usage.has(key)) usage.set(key, { templates: new Set(), bots: new Set() });
    usage.get(key)![source].add(name);
  };

  const templates = await Template.find({ tenant: tenantId, channel: "whatsapp" }).select("name components").lean();
  templates.forEach((tpl: any) => {
    (tpl?.components || []).forEach((comp: any) => {
      const headerUrls = comp?.type === "HEADER" ? comp?.example?.header_handle || [] : [];
      if (Array.isArray(headerUrls)) headerUrls.forEach((u: any) => mark(u, "templates", String(tpl?.name || "template")));
    });
  });

  const state = await FlowStudioState.findOne({ tenant: tenantId }).select("bots").lean();
  (state?.bots || []).forEach((bot: any) => {
    const botName = String(bot?.name || "Bot");
    Object.values(bot?.nodes || {}).forEach((node: any) => {
      if (node?.type === "mediaMessage") {
        mark(node?.data?.mediaUrl, "bots", botName);
      }
    });
  });

  return usage;
}

function withUsage(asset: any, usageMap: Map<string, { templates: Set<string>; bots: Set<string> }>) {
  const hit = usageMap.get(normalizeValue(asset.url));
  const templates = hit ? Array.from(hit.templates) : [];
  const bots = hit ? Array.from(hit.bots) : [];
  return {
    ...asset,
    inUse: templates.length > 0 || bots.length > 0,
    usage: {
      templates,
      bots,
      templateCount: templates.length,
      botCount: bots.length,
    },
  };
}

export const listFlowMedia = asyncHandler(async (req: Request, res: Response) => {
  if (!req.tenantId) throw new ApiError(401, "Tenant not resolved");
  const assets = await FlowMediaAsset.find({ tenant: req.tenantId }).sort({ updatedAt: -1 }).lean();
  const usageMap = await buildUsageMap(req.tenantId);
  ok(res, assets.map((asset) => withUsage(asset, usageMap)));
});

export const createFlowMedia = asyncHandler(async (req: any, res: Response) => {
  if (!req.tenantId) throw new ApiError(401, "Tenant not resolved");
  if (!req.file) throw new ApiError(400, "Media file is required");

  const file = req.file;
  const name = cleanName(req.body?.name);
  const type = cleanType(req.body?.type);

  if (file.size > MAX_MEDIA_BYTES) {
    await fs.unlink(file.path).catch(() => undefined);
    throw new ApiError(400, "Media file must be 5 MB or smaller");
  }

  if (!MIME_GUARDS[type].test(String(file.mimetype || ""))) {
    await fs.unlink(file.path).catch(() => undefined);
    throw new ApiError(400, `Invalid file type for ${type}`);
  }

  const ext = path.extname(file.originalname || "") || (type === "document" ? ".pdf" : "");
  const safeName = name.toLowerCase().replace(/[^a-z0-9_]+/g, "_").replace(/^_+|_+$/g, "") || "media";
  const finalFileName = `${Date.now()}_${safeName}_${Math.random().toString(36).slice(2, 8)}${ext}`;
  const rootUploadsDir = path.join(process.cwd(), "uploads", "flowchat-media");
  await fs.mkdir(rootUploadsDir, { recursive: true });
  const finalPath = path.join(rootUploadsDir, finalFileName);
  await fs.rename(file.path, finalPath);

  const relativeUrl = `/uploads/flowchat-media/${finalFileName}`;
  const asset = await FlowMediaAsset.create({
    tenant: req.tenantId,
    name,
    type,
    url: buildAbsoluteUrl(req, relativeUrl),
    fileName: file.originalname || finalFileName,
    mimeType: file.mimetype || "application/octet-stream",
    sizeBytes: file.size || 0,
  });

  await audit({
    tenant: req.tenantId,
    user: req.auth?.name,
    action: "CREATE",
    module: "Workflows",
    entity: `Flow Media: ${asset.name}`,
  });

  ok(res, { asset }, 201);
});

export const updateFlowMedia = asyncHandler(async (req: Request, res: Response) => {
  if (!req.tenantId) throw new ApiError(401, "Tenant not resolved");
  const id = String(req.params.id || "");
  const asset = await FlowMediaAsset.findOne({ _id: id, tenant: req.tenantId });
  if (!asset) throw new ApiError(404, "Media not found");

  const patch: any = {};
  if (req.body?.name !== undefined) patch.name = cleanName(req.body.name);
  if (req.body?.type !== undefined) patch.type = cleanType(req.body.type);

  const updated = await FlowMediaAsset.findOneAndUpdate({ _id: id, tenant: req.tenantId }, { $set: patch }, { new: true }).lean();
  ok(res, { asset: updated });
});

export const deleteFlowMedia = asyncHandler(async (req: Request, res: Response) => {
  if (!req.tenantId) throw new ApiError(401, "Tenant not resolved");
  const id = String(req.params.id || "");
  const asset = await FlowMediaAsset.findOne({ _id: id, tenant: req.tenantId }).lean();
  if (!asset) throw new ApiError(404, "Media not found");

  const usageMap = await buildUsageMap(req.tenantId);
  const used = withUsage(asset, usageMap);
  if (used.inUse) {
    throw new ApiError(409, "Media is in use in template/chatbot and cannot be deleted", used.usage);
  }

  await FlowMediaAsset.deleteOne({ _id: id, tenant: req.tenantId });

  const maybeRelative = String(asset.url || "").replace(/^https?:\/\/[^/]+/i, "");
  if (maybeRelative.startsWith("/uploads/flowchat-media/")) {
    const fullPath = path.join(process.cwd(), maybeRelative);
    await fs.unlink(fullPath).catch(() => undefined);
  }

  await audit({
    tenant: req.tenantId,
    user: req.auth?.name,
    action: "DELETE",
    module: "Workflows",
    entity: `Flow Media: ${asset.name}`,
  });

  ok(res, { deleted: true });
});
