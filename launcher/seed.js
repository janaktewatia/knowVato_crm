/**
 * Seeds demo data into both databases. Run: `npm run seed`
 * (MongoDB must be running first — `npm run mongo`.)
 */
const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");

const root = path.join(__dirname, "..");
const steps = [
  { name: "Identity (users, roles)", dir: "platform/services/identity" },
  { name: "Communication / CRM (templates, contacts, leads)", dir: "backend" },
];

for (const s of steps) {
  const dir = path.join(root, s.dir);
  if (!fs.existsSync(dir)) { console.log(`!! Skipping ${s.name} — not found`); continue; }
  console.log(`\nSeeding ${s.name}…`);
  try {
    execSync("npm run seed", { cwd: dir, stdio: "inherit" });
  } catch (e) {
    console.log(`!! Seed failed for ${s.name}. Is MongoDB running? (npm run mongo)`);
  }
}
console.log("\nSeeding complete. Now run:  npm start\n");
