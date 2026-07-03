import { createApp } from "./app";
import { connectDB } from "./config/db";
import { config } from "./config";

async function main() {
  await connectDB();
  const app = createApp();
  app.listen(config.port, () => {
    console.log(`\n  WhatsApp CRM API running`);
    console.log(`  → http://localhost:${config.port}`);
    console.log(`  → health:  /health`);
    console.log(`  → api:     /api`);
    console.log(`  → webhook: /webhooks/whatsapp`);
    console.log(`  → WhatsApp mode: ${config.whatsapp.mode}\n`);
  });
}

main().catch((e) => {
  console.error("Fatal startup error:", e);
  process.exit(1);
});
