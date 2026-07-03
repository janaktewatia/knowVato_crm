/**
 * Shared platform types — the common vocabulary every module speaks.
 */

/** A permission is "module:action". Examples:
 *  events:view, events:create, communication:send,
 *  crm.leads:edit, identity.users:manage
 */
export type Permission = string;

export interface PlatformUser {
  id: string;
  tenant: string;
  name: string;
  email: string;
  roles: string[];
  perms: Permission[];
}

/** What every JWT carries. Services trust this after verifying the signature. */
export interface JwtClaims {
  sub: string;        // user id
  tenant: string;
  name: string;
  email: string;
  roles: string[];
  perms: Permission[];
  iat?: number;
  exp?: number;
  iss?: string;       // issuer = identity service
}

/** Modules registered in the platform (drives the shell nav + gateway routes). */
export interface ModuleManifest {
  id: string;             // "events", "crm", "websitebuilder"
  name: string;           // "Event Management"
  icon?: string;
  baseUrl: string;        // where its UI/remote lives, e.g. https://event.knowvato.in
  remoteEntry?: string;   // module-federation remoteEntry.js URL (if a micro-frontend)
  apiPrefix: string;      // gateway path prefix, e.g. "/events"
  permissionsPrefix: string; // e.g. "events" — its permissions namespace
}

/* ---- Cross-service event names + payloads (for when a broker is added) ---- */
export const PlatformEvents = {
  TemplateApproved: "communication.template.approved",
  TemplateUpdated: "communication.template.updated",
  MessageDelivered: "communication.message.delivered",
  UserCreated: "identity.user.created",
  UserPermissionsChanged: "identity.user.perms_changed",
} as const;

export interface TemplateUpdatedEvent {
  tenant: string;
  templateId: string;
  name: string;
  status: string;
}
export interface UserPermsChangedEvent {
  tenant: string;
  userId: string;
  perms: Permission[];
}
