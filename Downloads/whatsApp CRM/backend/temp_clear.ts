import mongoose from "mongoose";
import { config } from "./src/config";
import { LeadStatus, SubStatus } from "./src/models/Masters";

async function clear() {
  await mongoose.connect(config.mongoUri);
  console.log("Deleting all statuses...");
  await LeadStatus.deleteMany({});
  console.log("Deleting all sub-statuses...");
  await SubStatus.deleteMany({});
  console.log("Done!");
  process.exit(0);
}

clear().catch(e => { console.error(e); process.exit(1); });
