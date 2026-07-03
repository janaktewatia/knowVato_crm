import { Campaign, Message } from "../models/Messaging";
import { Contact as ContactModel } from "../models/Contact";
import { sendTemplate } from "./whatsapp";
import { audit } from "../utils/http";
import { config } from "../config";

/**
 * Campaign sender.
 *
 * If USE_QUEUE=true and Redis is available, jobs are pushed to BullMQ and the
 * worker (src/jobs/worker.ts) processes them with rate limiting. Otherwise we
 * fall back to an inline send (fine for dev / small batches).
 */

let queue: any = null;
export async function getQueue() {
  if (!config.useQueue) return null;
  if (queue) return queue;
  try {
    const { Queue } = await import("bullmq");
    const IORedis = (await import("ioredis")).default;
    const connection = new IORedis(config.redisUrl, { maxRetriesPerRequest: null });
    queue = new Queue("campaign-send", { connection: connection as any });
    return queue;
  } catch (e) {
    console.warn("[campaign] queue unavailable, using inline send:", (e as Error).message);
    return null;
  }
}

/** Resolve recipients for a campaign (here: opted-in contacts, optionally by category). */
async function resolveRecipients(tenant: any, category?: string) {
  const filter: any = { tenant, optIn: true };
  if (category && category !== "All") filter.category = category;
  return ContactModel.find(filter).limit(5000);
}

export async function launchCampaign(opts: {
  tenant: any;
  campaignId: string;
  user?: string;
}) {
  const campaign = await Campaign.findOne({ _id: opts.campaignId, tenant: opts.tenant });
  if (!campaign) throw new Error("Campaign not found");

  const recipients = await resolveRecipients(opts.tenant, campaign.category);
  campaign.audienceSize = recipients.length;
  campaign.status = campaign.scheduledFor && campaign.scheduledFor > new Date() ? "Scheduled" : "Running";
  await campaign.save();

  if (campaign.status === "Scheduled") {
    await audit({ tenant: opts.tenant, user: opts.user, action: "SCHEDULE", module: "Blast", entity: campaign.name });
    return { queued: 0, scheduled: true };
  }

  const q = await getQueue();
  let processed = 0;

  for (const r of recipients) {
    if (q) {
      await q.add(
        "send",
        { tenant: String(opts.tenant), campaignId: String(campaign._id), contactId: String(r._id), phone: r.phone, name: r.name, template: campaign.template, category: campaign.category },
        { attempts: 5, backoff: { type: "exponential", delay: 2000 }, removeOnComplete: true }
      );
    } else {
      await sendOneCampaignMessage({
        tenant: opts.tenant,
        campaignId: String(campaign._id),
        contactId: String(r._id),
        phone: r.phone,
        name: r.name,
        template: campaign.template,
        category: campaign.category,
      });
    }
    processed++;
  }

  await audit({ tenant: opts.tenant, user: opts.user, action: "SEND", module: "Blast", entity: campaign.name, next: `${processed} recipients` });
  return { queued: processed, scheduled: false, viaQueue: !!q };
}

/** Send a single campaign message and persist the delivery row. Used by worker + inline. */
export async function sendOneCampaignMessage(job: {
  tenant: any;
  campaignId: string;
  contactId?: string;
  phone: string;
  name: string;
  template: string;
  category?: string;
}) {
  try {
    const result = await sendTemplate(job.tenant, job.phone, job.template);
    await Message.create({
      tenant: job.tenant,
      campaign: job.campaignId,
      contact: job.contactId || null,
      waMessageId: result.waMessageId,
      direction: "outbound",
      type: "template",
      template: job.template,
      contactName: job.name,
      phone: job.phone,
      category: job.category,
      status: "sent",
      sentAt: new Date(),
    });
    await Campaign.updateOne({ _id: job.campaignId }, { $inc: { sent: 1 } });

    // In simulation mode, fake an async delivery+read so the funnel populates.
    if (result.simulated) {
      const roll = Math.random();
      setTimeout(async () => {
        const update: any = { status: "delivered", deliveredAt: new Date() };
        await Message.updateOne({ waMessageId: result.waMessageId }, { $set: update });
        await Campaign.updateOne({ _id: job.campaignId }, { $inc: { delivered: 1 } });
        if (roll > 0.4) {
          setTimeout(async () => {
            await Message.updateOne({ waMessageId: result.waMessageId }, { $set: { status: "read", readAt: new Date() } });
            await Campaign.updateOne({ _id: job.campaignId }, { $inc: { read: 1 } });
          }, 400);
        }
      }, 300);
    }
    return { ok: true };
  } catch (e) {
    await Message.create({
      tenant: job.tenant,
      campaign: job.campaignId,
      contact: job.contactId || null,
      direction: "outbound",
      type: "template",
      template: job.template,
      contactName: job.name,
      phone: job.phone,
      category: job.category,
      status: "failed",
      failReason: (e as Error).message,
    });
    await Campaign.updateOne({ _id: job.campaignId }, { $inc: { failed: 1 } });
    return { ok: false, error: (e as Error).message };
  }
}
