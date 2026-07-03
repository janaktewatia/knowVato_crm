import { config } from "../config";
import { connectDB } from "../config/db";
import { sendOneCampaignMessage } from "../services/campaignService";

/**
 * Campaign worker. Run with `npm run worker` (needs Redis + USE_QUEUE=true).
 * Processes send jobs with a concurrency/rate limit so we respect Meta's
 * messaging tier. If queue libs aren't installed, this exits gracefully.
 */
async function main() {
  if (!config.useQueue) {
    console.log("[worker] USE_QUEUE=false — nothing to do. Set USE_QUEUE=true and run Redis to use the worker.");
    process.exit(0);
  }
  await connectDB();

  let Worker: any, IORedis: any;
  try {
    ({ Worker } = await import("bullmq"));
    IORedis = (await import("ioredis")).default;
  } catch (e) {
    console.error("[worker] bullmq/ioredis not installed. Run: npm i bullmq ioredis");
    process.exit(1);
  }

  const connection = new IORedis(config.redisUrl, { maxRetriesPerRequest: null });

  const worker = new Worker(
    "campaign-send",
    async (job: any) => {
      await sendOneCampaignMessage(job.data);
    },
    {
      connection,
      concurrency: 10,
      limiter: { max: 500, duration: 60_000 }, // 500 msg/min — match your Meta tier
    }
  );

  worker.on("completed", (job: any) => console.log(`[worker] sent job ${job.id}`));
  worker.on("failed", (job: any, err: Error) => console.warn(`[worker] job ${job?.id} failed: ${err.message}`));
  console.log("[worker] campaign-send worker started (500 msg/min, concurrency 10)");
}

main().catch((e) => {
  console.error("[worker] fatal:", e);
  process.exit(1);
});
