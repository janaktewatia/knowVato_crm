import { generateKeyPairSync } from "crypto";
import fs from "fs";
import path from "path";

/**
 * Generates an RSA keypair used to sign JWTs (RS256).
 * The PRIVATE key signs tokens (Identity only); the PUBLIC key is published at
 * /.well-known/jwks.json so every other service can verify offline.
 * Run once: `npm run genkeys`.
 */
const dir = path.join(__dirname, "..", "keys");
fs.mkdirSync(dir, { recursive: true });

const { publicKey, privateKey } = generateKeyPairSync("rsa", {
  modulusLength: 2048,
  publicKeyEncoding: { type: "spki", format: "pem" },
  privateKeyEncoding: { type: "pkcs8", format: "pem" },
});

fs.writeFileSync(path.join(dir, "private.pem"), privateKey);
fs.writeFileSync(path.join(dir, "public.pem"), publicKey);
console.log("Wrote keys/private.pem and keys/public.pem");
console.log("Keep private.pem secret. public.pem is served via JWKS.");
