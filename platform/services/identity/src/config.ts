import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { generateKeyPairSync } from "crypto";
dotenv.config();

const keysDir = path.join(__dirname, "..", "keys");

/** Load RSA keys; if absent (e.g. fresh checkout/dev), generate an ephemeral pair. */
function loadKeys() {
  try {
    const privateKey = fs.readFileSync(path.join(keysDir, "private.pem"), "utf8");
    const publicKey = fs.readFileSync(path.join(keysDir, "public.pem"), "utf8");
    return { privateKey, publicKey, ephemeral: false };
  } catch {
    const { publicKey, privateKey } = generateKeyPairSync("rsa", {
      modulusLength: 2048,
      publicKeyEncoding: { type: "spki", format: "pem" },
      privateKeyEncoding: { type: "pkcs8", format: "pem" },
    });
    console.warn("[identity] No keys found — generated an EPHEMERAL keypair (dev only). Run `npm run genkeys` for a stable one.");
    return { privateKey, publicKey, ephemeral: true };
  }
}

const keys = loadKeys();

export const config = {
  port: parseInt(process.env.PORT || "4100", 10),
  mongoUri: process.env.MONGO_URI || "mongodb://127.0.0.1:27017/knowvato_identity",
  issuer: process.env.JWT_ISSUER || "https://api.knowvato.in/identity",
  accessTtl: process.env.ACCESS_TTL || "30m",
  refreshTtl: process.env.REFRESH_TTL || "30d",
  keyId: process.env.KEY_ID || "knowvato-key-1",
  clientOrigins: (process.env.CLIENT_ORIGINS || "*").split(","),
  privateKey: keys.privateKey,
  publicKey: keys.publicKey,
};
