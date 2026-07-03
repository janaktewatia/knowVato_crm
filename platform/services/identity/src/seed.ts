import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { config } from "./config";
import { User, Role, Refresh } from "./models";

/**
 * Seeds platform-wide roles whose permissions span ALL modules, plus demo users.
 * Permission convention: "<module>:<action>" or "<module>.<entity>:<action>".
 */
async function seed() {
  await mongoose.connect(config.mongoUri);
  await Promise.all([User.deleteMany({}), Role.deleteMany({}), Refresh.deleteMany({})]);
  const tenant = "knowvato";

  const superAdmin = await Role.create({
    tenant, name: "Super Admin", builtIn: true, description: "Everything, everywhere",
    perms: ["*"],
  });

  const orgAdmin = await Role.create({
    tenant, name: "Org Admin", builtIn: true, description: "Manage org, users and all modules",
    perms: [
      "identity.users:view", "identity.users:manage", "identity.roles:view", "identity.roles:manage",
      "events:view", "events:create", "events:edit",
      "communication:view", "communication:send", "communication.templates:manage",
      "crm:view", "crm.leads:edit", "crm.leads:create",
      "websitebuilder:view", "websitebuilder:edit",
    ],
  });

  const counsellor = await Role.create({
    tenant, name: "Counsellor", builtIn: true, description: "CRM + send comms using shared templates",
    perms: ["crm:view", "crm.leads:edit", "communication:view", "communication:send", "events:view"],
  });

  const marketer = await Role.create({
    tenant, name: "Marketer", builtIn: true, description: "Templates + campaigns + website",
    perms: ["communication:view", "communication:send", "communication.templates:manage", "websitebuilder:view", "websitebuilder:edit", "events:view"],
  });

  const hash = await bcrypt.hash("password123", 10);
  await User.create([
    { tenant, name: "Priya Kothari", email: "priya@knowvato.in", passwordHash: hash, roles: [superAdmin._id] },
    { tenant, name: "Rahul Bhatt", email: "rahul@knowvato.in", passwordHash: hash, roles: [orgAdmin._id] },
    { tenant, name: "Ananya Saxena", email: "ananya@knowvato.in", passwordHash: hash, roles: [counsellor._id] },
    { tenant, name: "Megha Rao", email: "megha@knowvato.in", passwordHash: hash, roles: [marketer._id] },
  ]);

  console.log("[identity] seeded.");
  console.log("  Super Admin: priya@knowvato.in / password123");
  console.log("  Org Admin:   rahul@knowvato.in / password123");
  console.log("  Counsellor:  ananya@knowvato.in / password123");
  console.log("  Marketer:    megha@knowvato.in / password123");
  await mongoose.disconnect();
  process.exit(0);
}
seed().catch((e) => { console.error(e); process.exit(1); });
