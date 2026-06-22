import { Router } from "express";
import { authenticate, require_ } from "../middleware/auth";
import { crud } from "../controllers/crudFactory";

import * as authC from "../controllers/authController";
import * as leadC from "../controllers/leadController";
import * as trackC from "../controllers/serviceTrackController";
import * as fuC from "../controllers/followUpController";
import * as msgC from "../controllers/messagingController";

import { Lead } from "../models/Lead";
import { FollowUp } from "../models/FollowUp";
import { Contact } from "../models/Contact";
import { LeadStatus, SubStatus, LeadSource } from "../models/Masters";
import { Service } from "../models/Service";
import { User, UserType } from "../models/User";
import { Campaign, Template, Conversation, Message } from "../models/Messaging";
import { Integration, AuditLog } from "../models/System";

const r = Router();

/* ---- public ---- */
r.post("/auth/login", authC.login);

/* ---- everything below requires auth ---- */
r.use(authenticate);
r.get("/auth/me", authC.me);
r.get("/system/status", msgC.status);

/* ---- Leads ---- */
const leadCrud = crud(Lead, { module: "leads", searchFields: ["name", "phone", "course"], populate: "status source subStatus" });
r.get("/leads", require_("leads", "view"), leadCrud.list);
r.get("/leads/:id", require_("leads", "view"), leadCrud.get);
r.post("/leads", require_("leads", "create"), leadCrud.create);
r.patch("/leads/:id", require_("leads", "edit"), leadCrud.update);
r.delete("/leads/:id", require_("leads", "del"), leadCrud.remove);
r.post("/leads/convert", require_("leads", "create"), leadC.convert);
r.post("/leads/:id/status", require_("leads", "edit"), leadC.setStatus);
r.post("/leads/:id/services", require_("leads", "edit"), trackC.addTrack);
r.post("/leads/:id/services/status", require_("leads", "edit"), trackC.setTrackStatus);
r.delete("/leads/:id/services/:serviceId", require_("leads", "edit"), trackC.removeTrack);
r.post("/leads/:id/notes", require_("leads", "edit"), leadC.addNote);

/* ---- Follow-ups ---- */
const fuCrud = crud(FollowUp, { module: "followups", searchFields: ["leadName", "phone"] });
r.get("/followups", require_("followups", "view"), fuCrud.list);
r.get("/followups/buckets", require_("followups", "view"), fuC.buckets);
r.post("/followups", require_("followups", "create"), fuCrud.create);
r.post("/followups/:id/complete", require_("followups", "edit"), fuC.complete);
r.post("/followups/:id/reschedule", require_("followups", "edit"), fuC.reschedule);

/* ---- Contacts ---- */
const contactCrud = crud(Contact, { module: "contacts", searchFields: ["name", "phone", "email"] });
r.get("/contacts", require_("contacts", "view"), contactCrud.list);
r.get("/contacts/:id", require_("contacts", "view"), contactCrud.get);
r.post("/contacts", require_("contacts", "create"), contactCrud.create);
r.patch("/contacts/:id", require_("contacts", "edit"), contactCrud.update);
r.delete("/contacts/:id", require_("contacts", "del"), contactCrud.remove);

/* ---- Masters (Setup) ---- */
const statusCrud = crud(LeadStatus, { module: "setup" });
r.get("/masters/statuses", require_("setup", "view"), statusCrud.list);
r.post("/masters/statuses", require_("setup", "create"), statusCrud.create);
r.patch("/masters/statuses/:id", require_("setup", "edit"), statusCrud.update);
r.delete("/masters/statuses/:id", require_("setup", "del"), statusCrud.remove);

/* ---- Services (custom pipelines a lead can be in) ---- */
const serviceCrud = crud(Service, { module: "setup", searchFields: ["name", "key"] });
r.get("/services", require_("leads", "view"), serviceCrud.list);
r.post("/services", require_("setup", "create"), serviceCrud.create);
r.patch("/services/:id", require_("setup", "edit"), serviceCrud.update);
r.delete("/services/:id", require_("setup", "del"), serviceCrud.remove);

const subCrud = crud(SubStatus, { module: "setup", populate: "status" });
r.get("/masters/substatuses", require_("setup", "view"), subCrud.list);
r.post("/masters/substatuses", require_("setup", "create"), subCrud.create);
r.delete("/masters/substatuses/:id", require_("setup", "del"), subCrud.remove);

const srcCrud = crud(LeadSource, { module: "setup" });
r.get("/masters/sources", require_("setup", "view"), srcCrud.list);
r.post("/masters/sources", require_("setup", "create"), srcCrud.create);
r.delete("/masters/sources/:id", require_("setup", "del"), srcCrud.remove);

/* ---- Users & roles (Setup) ---- */
const userTypeCrud = crud(UserType, { module: "setup" });
r.get("/usertypes", require_("setup", "view"), userTypeCrud.list);
r.post("/usertypes", require_("setup", "create"), userTypeCrud.create);
r.patch("/usertypes/:id", require_("setup", "edit"), userTypeCrud.update);
r.delete("/usertypes/:id", require_("setup", "del"), userTypeCrud.remove);

const userCrud = crud(User, { module: "setup", searchFields: ["name", "email"], populate: "userType" });
r.get("/users", require_("setup", "view"), userCrud.list);
r.post("/users", require_("setup", "create"), userCrud.create);
r.patch("/users/:id", require_("setup", "edit"), userCrud.update);
r.delete("/users/:id", require_("setup", "del"), userCrud.remove);

/* ---- Integrations (Setup) ---- */
const intCrud = crud(Integration, { module: "setup" });
r.get("/integrations", require_("setup", "view"), intCrud.list);
r.patch("/integrations/:id", require_("setup", "edit"), intCrud.update);

/* ---- WhatsApp accounts (multi-vendor; one active) ---- */
r.get("/whatsapp-accounts", require_("setup", "view"), msgC.listAccounts);
r.post("/whatsapp-accounts", require_("setup", "create"), msgC.createAccount);
r.patch("/whatsapp-accounts/:id", require_("setup", "edit"), msgC.updateAccount);
r.delete("/whatsapp-accounts/:id", require_("setup", "del"), msgC.deleteAccount);
r.post("/whatsapp-accounts/:id/activate", require_("setup", "edit"), msgC.activate);

/* ---- Templates ---- */
const tplCrud = crud(Template, { module: "blast", searchFields: ["name"] });
r.get("/templates", require_("blast", "view"), tplCrud.list);
r.post("/templates", require_("blast", "create"), tplCrud.create);
r.patch("/templates/:id", require_("blast", "edit"), tplCrud.update);

/* ---- Campaigns ---- */
const campCrud = crud(Campaign, { module: "blast", searchFields: ["name", "template"] });
r.get("/campaigns", require_("blast", "view"), campCrud.list);
r.get("/campaigns/:id", require_("blast", "view"), campCrud.get);
r.post("/campaigns", require_("blast", "create"), campCrud.create);
r.patch("/campaigns/:id", require_("blast", "edit"), campCrud.update);
r.delete("/campaigns/:id", require_("blast", "del"), campCrud.remove);
r.post("/campaigns/:id/launch", require_("blast", "create"), msgC.launch);
r.post("/campaigns/:id/pause", require_("blast", "edit"), msgC.pauseCampaign);

/* ---- Messages (history) ---- */
const msgCrud = crud(Message, { module: "reports", searchFields: ["contactName", "phone", "template"] });
r.get("/messages", require_("reports", "view"), msgCrud.list);
r.post("/messages/send", require_("blast", "create"), msgC.sharedSend);
r.post("/messages/:id/convert", require_("leads", "create"), msgC.messageToLead);

/* ---- Conversations (chat) ---- */
const convCrud = crud(Conversation, { module: "chat", searchFields: ["name", "phone"] });
r.get("/conversations", require_("chat", "view"), convCrud.list);
r.get("/conversations/:id", require_("chat", "view"), convCrud.get);
r.post("/conversations/:id/reply", require_("chat", "create"), msgC.replyToConversation);
r.post("/conversations/:id/read", require_("chat", "edit"), msgC.markRead);

/* ---- Conversion analytics ---- */
r.get("/conversion/stats", require_("conversion", "view"), msgC.conversionStats);

/* ---- Audit log ---- */
const auditCrud = crud(AuditLog, { module: "reports", searchFields: ["entity", "user", "action"] });
r.get("/audit", require_("reports", "view"), auditCrud.list);

export default r;
