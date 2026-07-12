import { Router } from "express";
import { authenticate, require_ } from "../middleware/auth";
import { crud } from "../controllers/crudFactory";
import { ok, asyncHandler, ApiError } from "../utils/http";
import { WORKFLOW_EVENTS, CONDITION_FIELDS, CONDITION_OPERATORS, ACTION_TYPES, ASSIGNMENT_STRATEGIES } from "../config/workflowConfig";

import * as authC from "../controllers/authController";
import * as leadC from "../controllers/leadController";
import * as trackC from "../controllers/serviceTrackController";
import * as fuC from "../controllers/followUpController";
import * as msgC from "../controllers/messagingController";

import { Lead } from "../models/Lead";
import { FollowUp } from "../models/FollowUp";
import { Contact } from "../models/Contact";
import { LeadStatus, SubStatus, LeadSource, AcademicSession, Grade, Designation } from "../models/Masters";
import { Service } from "../models/Service";
import { User, UserType } from "../models/User";
import { Campaign, Template, Conversation, Message } from "../models/Messaging";
import { Integration, AuditLog } from "../models/System";
import { Team } from "../models/Team";
import { Workflow } from "../models/Workflow";
import { Registration } from "../models/Registration";
import { WorkflowConfig } from "../models/WorkflowConfig";
import { Tenant } from "../models/Tenant";
import { convertToLead } from "../services/leadService";

const r = Router();

/* ---- public ---- */
r.post("/auth/login", authC.login);

const getEnquiryFormById = async (formId: string) => {
  const config = await WorkflowConfig.findOne({ key: "enquiryForms" }).lean();
  const forms = Array.isArray((config as any)?.data?.forms) ? (config as any).data.forms : [];
  const form = forms.find((item: any) => String(item._id) === String(formId));
  const tenant = (config as any)?.tenant || (await Tenant.findOne({}).lean())?._id;
  return { config, form, tenant };
};

r.get(
  "/public/enquiry-form/:formId",
  asyncHandler(async (req, res) => {
    const { form } = await getEnquiryFormById(req.params.formId);
    if (!form) throw new ApiError(404, "Enquiry form not found");
    if (form.isActive === false) throw new ApiError(403, "This enquiry form is not live");
    ok(res, { form });
  })
);

r.post(
  "/public/enquiry-form/:formId",
  asyncHandler(async (req, res) => {
    const { config, form, tenant } = await getEnquiryFormById(req.params.formId);
    if (!form) throw new ApiError(404, "Enquiry form not found");
    if (form.isActive === false) throw new ApiError(403, "This enquiry form is not live");

    const values = req.body || {};
    const pickValue = (...keys: string[]) => {
      for (const key of keys) {
        const val = values[key];
        if (typeof val === "string" && val.trim()) return val.trim();
        if (typeof val === "number") return String(val);
      }
      return "";
    };

    const name = pickValue("studentName", "name", "fullName", "student_name");
    const phone = pickValue("mobileNumber", "phone", "mobile", "contactNumber");
    const email = pickValue("emailId", "email");
    const course = pickValue("courseInterested", "course", "courseName");
    const source = pickValue("enquirySource", "source", "leadSource");

    if (!name || !phone) throw new ApiError(400, "Name and phone are required");

    const result = await convertToLead({
      tenant: tenant,
      name,
      phone,
      email: email || undefined,
      sourceKeyOrId: source || undefined,
      course: course || undefined,
      user: "Public Enquiry Form",
    });

    ok(res, { lead: result.lead, created: result.created });
  })
);

const getLandingPageById = async (pageId: string) => {
  const config = await WorkflowConfig.findOne({ key: "landingPages" }).lean();
  const pages = Array.isArray((config as any)?.data?.pages) ? (config as any).data.pages : [];
  const page = pages.find((item: any) => String(item._id) === String(pageId));
  const tenant = (config as any)?.tenant || (await Tenant.findOne({}).lean())?._id;
  return { config, page, tenant };
};

r.get(
  "/public/landing-page/:pageId",
  asyncHandler(async (req, res) => {
    const { page } = await getLandingPageById(req.params.pageId);
    if (!page) throw new ApiError(404, "Landing page not found");
    if (page.isActive === false) throw new ApiError(403, "This landing page is not live");
    ok(res, { page });
  })
);

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
r.post("/leads/:id/followups", require_("leads", "edit"), fuC.createFollowUpForLead);
r.get("/leads/:id/service/:serviceId/statuses", require_("leads", "view"), leadC.getServiceStatuses);

/* ---- Follow-ups ---- */
const fuCrud = crud(FollowUp, { module: "followups", searchFields: ["leadName", "phone"] });
r.get("/followups", require_("followups", "view"), fuCrud.list);
r.get("/followups/buckets", require_("followups", "view"), fuC.buckets);
r.get("/followups/workload", require_("followups", "view"), fuC.getWorkload);
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

/* ---- Academic Sessions (Setup) ---- */
const sessionCrud = crud(AcademicSession, { module: "setup", searchFields: ["name"] });
r.get("/masters/sessions", require_("setup", "view"), sessionCrud.list);
r.post("/masters/sessions", require_("setup", "create"), sessionCrud.create);
r.patch("/masters/sessions/:id", require_("setup", "edit"), sessionCrud.update);
r.delete("/masters/sessions/:id", require_("setup", "del"), sessionCrud.remove);

/* ---- Grades (Setup) ---- */
const gradeCrud = crud(Grade, { module: "setup", searchFields: ["name"] });
r.get("/grades", require_("setup", "view"), gradeCrud.list);
r.post("/grades", require_("setup", "create"), gradeCrud.create);
r.patch("/grades/:id", require_("setup", "edit"), gradeCrud.update);
r.delete("/grades/:id", require_("setup", "del"), gradeCrud.remove);

/* ---- Designations (Setup) ---- */
const desgCrud = crud(Designation, { module: "setup", searchFields: ["name"] });
r.get("/designations", require_("setup", "view"), desgCrud.list);
r.post("/designations", require_("setup", "create"), desgCrud.create);
r.patch("/designations/:id", require_("setup", "edit"), desgCrud.update);
r.delete("/designations/:id", require_("setup", "del"), desgCrud.remove);

/* ---- Teams (Setup) ---- */
const teamCrud = crud(Team, { module: "setup", searchFields: ["name"], populate: "manager members.user sources" });
r.get("/teams", require_("setup", "view"), teamCrud.list);
r.post("/teams", require_("setup", "create"), async (req, res) => {
  try {
    const { name, manager, members, sources } = req.body;

    if (!name || !name.trim()) throw new Error("Team name is required");
    if (!manager) throw new Error("Manager is required");
    if (!members || members.length === 0) throw new Error("At least one team member is required");

    const team = new Team({
      tenant: req.tenantId,
      name,
      manager,
      members: members.map(m => ({ user: m })),
      sources: sources || [],
      active: true
    });
    const saved = await team.save();
    const populated = await saved.populate("manager members.user sources");
    res.json(populated);
  } catch (e) { res.status(400).json({ error: (e instanceof Error ? e.message : String(e)) }); }
});
r.patch("/teams/:id", require_("setup", "edit"), async (req, res) => {
  try {
    const { name, manager, members, sources } = req.body;

    if (!name || !name.trim()) throw new Error("Team name is required");
    if (!manager) throw new Error("Manager is required");
    if (!members || members.length === 0) throw new Error("At least one team member is required");

    const update = {
      name,
      manager,
      members: members.map(m => ({ user: m })),
      sources: sources || []
    };
    const team = await Team.findByIdAndUpdate(req.params.id, update, { new: true }).populate("manager members.user sources");
    res.json(team);
  } catch (e) { res.status(400).json({ error: (e instanceof Error ? e.message : String(e)) }); }
});
r.delete("/teams/:id", require_("setup", "del"), teamCrud.remove);

/* ---- Workflows (Setup) ---- */
const wfCrud = crud(Workflow, { module: "setup", searchFields: ["name"] });
r.get("/workflows", require_("setup", "view"), wfCrud.list);
r.post("/workflows", require_("setup", "create"), wfCrud.create);
r.patch("/workflows/:id", require_("setup", "edit"), wfCrud.update);
r.delete("/workflows/:id", require_("setup", "del"), wfCrud.remove);

/* ---- Registrations ---- */
const regCrud = crud(Registration, { module: "registrations", searchFields: ["name", "phone", "email"], populate: "lead" });
r.get("/registrations", require_("leads", "view"), regCrud.list);
r.get("/registrations/:id", require_("leads", "view"), regCrud.get);
r.post("/registrations", require_("leads", "create"), regCrud.create);
r.patch("/registrations/:id", require_("leads", "edit"), regCrud.update);
r.delete("/registrations/:id", require_("leads", "del"), regCrud.remove);

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
r.delete("/templates/:id", require_("blast", "del"), tplCrud.remove);

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

/* ---- Workflow config (metadata for UI) ---- */
r.get("/workflow-config/default", (_req, res) => {
  ok(res, { WORKFLOW_EVENTS, CONDITION_FIELDS, CONDITION_OPERATORS, ACTION_TYPES, ASSIGNMENT_STRATEGIES });
});

r.get("/workflow-config/:key", authenticate, async (req, res) => {
  try {
    const config = await WorkflowConfig.findOne({
      tenant: (req as any).tenant,
      key: req.params.key
    });
    ok(res, config || { fields: [] });
  } catch (e) {
    res.status(500).json({ error: e instanceof Error ? e.message : String(e) });
  }
});

r.post("/workflow-config/:key", authenticate, require_("setup", "edit"), async (req, res) => {
  try {
    const config = await WorkflowConfig.findOneAndUpdate(
      { tenant: (req as any).tenant, key: req.params.key },
      { data: req.body, tenant: (req as any).tenant, key: req.params.key },
      { upsert: true, new: true }
    );
    ok(res, config);
  } catch (e) {
    res.status(500).json({ error: e instanceof Error ? e.message : String(e) });
  }
});

export default r;
