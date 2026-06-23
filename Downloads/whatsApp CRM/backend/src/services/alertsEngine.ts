import { ILead } from "../models/Lead";
import { Workflow, ICondition } from "../models/Workflow";
import { FollowUp } from "../models/FollowUp";
import { LeadStatus } from "../models/Masters";
import { sendText, sendTemplate } from "./whatsapp";
import { sendEmail } from "./email";
import { audit } from "../utils/http";

export async function fireAlerts(event: string, lead: ILead, tenantId: string, user?: string): Promise<void> {
  try {
    const workflows = await Workflow.find({
      tenant: tenantId,
      type: "Alert",
      active: true,
      event: event,
    });

    for (const workflow of workflows) {
      const conditionsMet = evaluateConditions(lead, workflow.conditions || []);
      if (!conditionsMet) continue;

      for (const action of workflow.actions || []) {
        try {
          await executeAction(action, lead, tenantId, user);
        } catch (err) {
          console.error(`[alertsEngine] Error executing action ${action.kind}:`, err);
        }
      }
    }
  } catch (err) {
    console.error("[alertsEngine] fireAlerts error:", err);
  }
}

function evaluateConditions(lead: ILead, conditions: ICondition[]): boolean {
  if (!conditions || conditions.length === 0) return true;

  let result = true;
  let currentLogic = "and";

  for (const cond of conditions) {
    const condMet = evaluateCondition(lead, cond);

    if (currentLogic === "and") {
      result = result && condMet;
    } else if (currentLogic === "or") {
      result = result || condMet;
    }

    currentLogic = cond.logic || "and";
  }

  return result;
}

function evaluateCondition(lead: ILead, cond: ICondition): boolean {
  const fieldValue = getFieldValue(lead, cond.field);

  switch (cond.operator) {
    case "equals":
      return fieldValue === cond.value;

    case "not_equals":
      return fieldValue !== cond.value;

    case "contains":
      if (typeof fieldValue === "string") {
        return fieldValue.includes(cond.value);
      }
      if (Array.isArray(fieldValue)) {
        return fieldValue.includes(cond.value);
      }
      return false;

    case "in":
      if (!Array.isArray(cond.value)) return false;
      if (Array.isArray(fieldValue)) {
        return fieldValue.some((v) => cond.value.includes(v));
      }
      return cond.value.includes(fieldValue);

    case "not_in":
      if (!Array.isArray(cond.value)) return true;
      if (Array.isArray(fieldValue)) {
        return !fieldValue.some((v) => cond.value.includes(v));
      }
      return !cond.value.includes(fieldValue);

    case "is_empty":
      return fieldValue == null || fieldValue === "" || (Array.isArray(fieldValue) && fieldValue.length === 0);

    case "is_not_empty":
      return fieldValue != null && fieldValue !== "" && (!Array.isArray(fieldValue) || fieldValue.length > 0);

    case "gt":
      return Number(fieldValue) > Number(cond.value);

    case "lt":
      return Number(fieldValue) < Number(cond.value);

    default:
      return false;
  }
}

function getFieldValue(lead: ILead, field: string): any {
  switch (field) {
    case "name":
      return lead.name;
    case "phone":
      return lead.phone;
    case "email":
      return lead.email;
    case "state":
      return lead.state;
    case "city":
      return lead.city;
    case "score":
      return lead.score;
    case "source":
      return lead.source?.toString();
    case "status":
      return lead.status?.toString();
    case "service":
      return lead.serviceTracks?.[0]?.service?.toString();
    case "subStatus":
      return lead.subStatus?.toString();
    case "tags":
      return lead.tags;
    case "owner":
      return lead.owner;
    default:
      return null;
  }
}

async function executeAction(action: any, lead: ILead, tenantId: string, user?: string): Promise<void> {
  const { kind, params } = action;

  switch (kind) {
    case "whatsapp":
      if (params.template) {
        await sendTemplate(tenantId, lead.phone, params.template, "en", params.bodyParams || []);
      } else if (params.message) {
        await sendText(tenantId, lead.phone, params.message);
      }
      break;

    case "email":
      if (params.subject && params.template) {
        await sendEmail({
          to: lead.email || "",
          subject: params.subject,
          html: params.template,
          text: params.template,
        });
      }
      break;

    case "sms":
      console.log(`[alertsEngine] SMS action placeholder for ${lead.phone}: ${params.message}`);
      break;

    case "followup":
      await FollowUp.create({
        tenant: tenantId,
        lead: lead._id,
        leadName: lead.name,
        phone: lead.phone,
        due: new Date(Date.now() + (params.daysFromNow || 1) * 24 * 60 * 60 * 1000),
        type: params.type || "Call",
        note: params.note || "Auto-created by workflow",
        owner: lead.owner,
      });
      break;

    case "status":
      if (params.statusId) {
        lead.status = params.statusId;
        if (params.subStatusId) {
          lead.subStatus = params.subStatusId;
        }
        lead.lastActivity = new Date();
        await lead.save();
      }
      break;

    case "assign_lead":
      if (params.userId) {
        lead.owner = params.userId;
        lead.lastActivity = new Date();
        await lead.save();
      }
      break;

    default:
      console.log(`[alertsEngine] Unknown action kind: ${kind}`);
  }

  await audit({
    tenant: tenantId,
    user: user || "workflow",
    action: `WORKFLOW_${kind.toUpperCase()}`,
    module: "workflows",
    entity: lead.name,
  });
}
