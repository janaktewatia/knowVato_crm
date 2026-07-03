import crypto from "crypto";

/**
 * Email channel — simulation by default, SMTP-ready.
 *
 * Like the WhatsApp service, this runs in simulation unless real SMTP creds are
 * provided, so the whole flow (send → log) works with no external account.
 * To go live, set EMAIL_MODE=live + SMTP_* envs and install nodemailer
 * (kept optional so the build needs no extra deps).
 */

const live = () =>
  process.env.EMAIL_MODE === "live" && !!process.env.SMTP_HOST && !!process.env.SMTP_USER;

export interface EmailResult {
  messageId: string;
  simulated: boolean;
}

function simId() {
  return "email.SIM-" + crypto.randomBytes(8).toString("hex");
}

export async function sendEmail(opts: {
  to: string;
  subject: string;
  html?: string;
  text?: string;
  from?: string;
}): Promise<EmailResult> {
  if (!live()) {
    return { messageId: simId(), simulated: true };
  }
  // Live path (lazy require so nodemailer is only needed when actually sending).
  let nodemailer: any;
  try {
    // @ts-ignore - optional dependency, only needed in live mode
    nodemailer = await import("nodemailer");
  } catch {
    throw new Error("Email live mode needs nodemailer: npm i nodemailer");
  }
  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587", 10),
    secure: process.env.SMTP_SECURE === "true",
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
  const info = await transport.sendMail({
    from: opts.from || process.env.SMTP_FROM || process.env.SMTP_USER,
    to: opts.to,
    subject: opts.subject,
    text: opts.text,
    html: opts.html,
  });
  return { messageId: info.messageId, simulated: false };
}

export const emailMode = () => (live() ? "live" : "simulation");

/** Fill {{1}}, {{2}}… placeholders in a template body with params. */
export function renderTemplate(body: string, params: string[] = []): string {
  return body.replace(/\{\{(\d+)\}\}/g, (_m, n) => params[parseInt(n, 10) - 1] ?? `{{${n}}}`);
}
