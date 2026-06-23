import { ILead } from "../models/Lead";
import { Workflow, IAssignmentRule } from "../models/Workflow";
import { Team } from "../models/Team";
import { Types } from "mongoose";

export async function applyLeadAssignment(lead: ILead, tenantId: string): Promise<void> {
  try {
    const workflow = await Workflow.findOne({
      tenant: tenantId,
      type: "LeadAssignment",
      active: true,
    });

    if (!workflow || !workflow.assignmentRule) {
      return;
    }

    const rule = workflow.assignmentRule;
    let assignedUserId: string | null = null;

    switch (rule.strategy) {
      case "round_robin":
        assignedUserId = await roundRobinAssign(rule, workflow._id, tenantId);
        break;

      case "source_wise_round_robin":
        assignedUserId = await sourceWiseRoundRobin(lead, rule, workflow._id, tenantId);
        break;

      case "state_wise":
        assignedUserId = await stateWiseAssign(lead, rule, workflow._id, tenantId);
        break;

      case "city_wise":
        assignedUserId = await cityWiseAssign(lead, rule, workflow._id, tenantId);
        break;

      case "grade_wise":
        assignedUserId = await gradeWiseAssign(lead, rule, workflow._id, tenantId);
        break;
    }

    if (assignedUserId) {
      lead.owner = assignedUserId;
      await lead.save();
    }
  } catch (err) {
    console.error("[workflowEngine] applyLeadAssignment error:", err);
  }
}

async function roundRobinAssign(rule: IAssignmentRule, workflowId: any, tenantId: string): Promise<string | null> {
  if (!rule.teamId) return null;

  const team = await Team.findOne({ _id: rule.teamId, tenant: tenantId }).populate("members.user");
  if (!team || team.members.length === 0) return null;

  const rrIndex = rule.rrIndex || 0;
  const selectedMember = team.members[rrIndex % team.members.length];

  await Workflow.findByIdAndUpdate(
    workflowId,
    { "assignmentRule.rrIndex": (rrIndex + 1) % team.members.length },
    { new: true }
  );

  return selectedMember.user?.toString() || null;
}

async function sourceWiseRoundRobin(
  lead: ILead,
  rule: IAssignmentRule,
  workflowId: any,
  tenantId: string
): Promise<string | null> {
  if (!lead.source) return null;

  const sourceEntry = rule.sourceMap?.find((entry) => entry.source?.toString() === lead.source?.toString());
  if (!sourceEntry || !sourceEntry.team) return null;

  const team = await Team.findOne({ _id: sourceEntry.team, tenant: tenantId }).populate("members.user");
  if (!team || team.members.length === 0) return null;

  const rrIndex = rule.rrIndex || 0;
  const selectedMember = team.members[rrIndex % team.members.length];

  await Workflow.findByIdAndUpdate(
    workflowId,
    { "assignmentRule.rrIndex": (rrIndex + 1) % team.members.length },
    { new: true }
  );

  return selectedMember.user?.toString() || null;
}

async function stateWiseAssign(
  lead: ILead,
  rule: IAssignmentRule,
  workflowId: any,
  tenantId: string
): Promise<string | null> {
  if (!lead.state) return null;

  const stateEntry = rule.stateMap?.find((entry) => entry.state === lead.state);
  if (!stateEntry || !stateEntry.team) return null;

  const team = await Team.findOne({ _id: stateEntry.team, tenant: tenantId }).populate("members.user");
  if (!team || team.members.length === 0) return null;

  const rrIndex = rule.rrIndex || 0;
  const selectedMember = team.members[rrIndex % team.members.length];

  await Workflow.findByIdAndUpdate(
    workflowId,
    { "assignmentRule.rrIndex": (rrIndex + 1) % team.members.length },
    { new: true }
  );

  return selectedMember.user?.toString() || null;
}

async function cityWiseAssign(
  lead: ILead,
  rule: IAssignmentRule,
  workflowId: any,
  tenantId: string
): Promise<string | null> {
  if (!lead.city) return null;

  const cityEntry = rule.cityMap?.find((entry) => entry.city === lead.city);
  if (!cityEntry || !cityEntry.team) return null;

  const team = await Team.findOne({ _id: cityEntry.team, tenant: tenantId }).populate("members.user");
  if (!team || team.members.length === 0) return null;

  const rrIndex = rule.rrIndex || 0;
  const selectedMember = team.members[rrIndex % team.members.length];

  await Workflow.findByIdAndUpdate(
    workflowId,
    { "assignmentRule.rrIndex": (rrIndex + 1) % team.members.length },
    { new: true }
  );

  return selectedMember.user?.toString() || null;
}

async function gradeWiseAssign(
  lead: ILead,
  rule: IAssignmentRule,
  workflowId: any,
  tenantId: string
): Promise<string | null> {
  if (!lead.grade) return null;

  const gradeEntry = rule.gradeMap?.find((entry) => entry.grade === lead.grade);
  if (!gradeEntry || !gradeEntry.team) return null;

  const team = await Team.findOne({ _id: gradeEntry.team, tenant: tenantId }).populate("members.user");
  if (!team || team.members.length === 0) return null;

  const rrIndex = rule.rrIndex || 0;
  const selectedMember = team.members[rrIndex % team.members.length];

  await Workflow.findByIdAndUpdate(
    workflowId,
    { "assignmentRule.rrIndex": (rrIndex + 1) % team.members.length },
    { new: true }
  );

  return selectedMember.user?.toString() || null;
}
