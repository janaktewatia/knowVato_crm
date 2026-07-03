import mongoose from "mongoose";
import { config } from "./index";

export async function connectDB(): Promise<void> {
  mongoose.set("strictQuery", true);
  try {
    await mongoose.connect(config.mongoUri, { serverSelectionTimeoutMS: 5000 });
    console.log(`[db] connected ✓`);
  } catch (err) {
    console.error("[db] connection error:", (err as Error).message);
    process.exit(1);
  }

  mongoose.connection.on("disconnected", () => console.warn("[db] disconnected"));
  mongoose.connection.on("error", (e) => console.error("[db] error:", e.message));
}

export async function disconnectDB(): Promise<void> {
  await mongoose.disconnect();
}
