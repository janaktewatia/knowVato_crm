/**
 * One-time setup. Run: `npm run setup`
 * Installs dependencies in every project, generates Identity keys, and writes
 * the .env files with the right ports so you never have to think about them.
 *
 * Folder layout it expects (all siblings):
 *   ../backend        (Communication service / WhatsApp CRM API)
 *   ../frontend       (CRM frontend)
 *   ../platform/...   (identity, gateway, shell, events-example)
 *   ../launcher       (this folder)
 */
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const projects = [
  { name: "Communication (backend)", dir: "backend" },
  { name: "CRM frontend", dir: "frontend" },
  { name: "Identity", dir: "platform/services/identity" },
  { name: "Events example", dir: "platform/services/events-example" },
  { name: "Gateway", dir: "platform/gateway" },
  { name: "Shell", dir: "platform/shell" },
];

function run(cmd, cwd) {
  execSync(cmd, { cwd, stdio: "inherit" });
}

function ensureEnv(dir, lines) {
  const p = path.join(root, dir, ".env");
  if (fs.existsSync(p)) { console.log(`  .env already exists in ${dir} (left as-is)`); return; }
  fs.writeFileSync(p, lines.join("\n") + "\n");
  console.log(`  wrote ${dir}/.env`);
}

console.log("\n=== Knowvato setup ===\n");

// 1. install launcher's own deps (concurrently, cross-env)
console.log("Installing launcher tools…");
run("npm install", __dirname);

// 2. install each project
for (const p of projects) {
  const dir = path.join(root, p.dir);
  if (!fs.existsSync(dir)) { console.log(`!! Skipping ${p.name} — folder not found at ${p.dir}`); continue; }
  console.log(`\nInstalling ${p.name} (${p.dir})…`);
  run("npm install", dir);
}

// 3. write .env files with correct ports
console.log("\nWriting .env files…");
ensureEnv("backend", [
  "PORT=4001",
  "MONGO_URI=mongodb://127.0.0.1:27017/whatsapp_crm",
  "JWT_SECRET=dev-secret-change-me",
  "CLIENT_ORIGIN=http://localhost:5173,http://localhost:5000",
  "WHATSAPP_MODE=simulation",
]);
ensureEnv("platform/services/identity", [
  "PORT=4100",
  "MONGO_URI=mongodb://127.0.0.1:27017/knowvato_identity",
  "JWT_ISSUER=https://api.knowvato.in/identity",
  "CLIENT_ORIGINS=http://localhost:5000",
]);
ensureEnv("platform/gateway", [
  "PORT=4000",
  "JWKS_URI=http://localhost:4100/.well-known/jwks.json",
  "JWT_ISSUER=https://api.knowvato.in/identity",
  "IDENTITY_URL=http://localhost:4100",
  "COMMUNICATION_URL=http://localhost:4001",
  "EVENTS_URL=http://localhost:4002",
  "CLIENT_ORIGINS=http://localhost:5000",
]);
ensureEnv("platform/services/events-example", [
  "PORT=4002",
  "COMMUNICATION_URL=http://localhost:4001/api",
]);

// 4. generate Identity signing keys
const idDir = path.join(root, "platform/services/identity");
if (fs.existsSync(idDir)) {
  console.log("\nGenerating Identity signing keys…");
  try { run("npm run genkeys", idDir); } catch { console.log("  (genkeys skipped — will auto-generate at runtime)"); }
}

console.log("\n=== Setup done ===");
console.log("Next:");
console.log("  1) Start MongoDB:   npm run mongo      (or run your own MongoDB)");
console.log("  2) Seed demo data:  npm run seed");
console.log("  3) Start everything: npm start");
console.log("\nThen open http://localhost:5000  (login: priya@knowvato.in / password123)\n");
