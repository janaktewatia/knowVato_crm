import { useEffect, useState } from "react";

export type Channel = "whatsapp" | "sms" | "email";

export type TemplateButton =
  | { type: "quick_reply"; text: string }
  | { type: "url"; text: string; url: string }
  | { type: "phone"; text: string; phone: string };

export type Template = {
  id: string;
  channel: Channel;
  name: string;
  category: "MARKETING" | "UTILITY" | "AUTHENTICATION";
  language: string;
  header?: { type: "none" | "text" | "image" | "video" | "document" | "location"; text?: string };
  body: string;
  subject?: string; // email only
  footer?: string;
  buttons: TemplateButton[];
  sample?: string;
  status: "APPROVED" | "PENDING" | "REJECTED";
  active: boolean;
  createdAt: string;
};

const KEY = "kv_templates_v1";

function seed(): Template[] {
  return [
    {
      id: crypto.randomUUID(),
      channel: "whatsapp",
      name: "welcome_offer",
      category: "MARKETING",
      language: "en_US",
      header: { type: "text", text: "Welcome to {{1}}!" },
      body: "Hi {{1}}, thanks for joining. Use code SAVE10 for 10% off your first order.",
      footer: "Reply STOP to opt out",
      buttons: [
        { type: "url", text: "Shop Now", url: "https://example.com" },
        { type: "quick_reply", text: "Talk to agent" },
      ],
      sample: "Acme",
      status: "APPROVED",
      active: true,
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    },
    {
      id: crypto.randomUUID(),
      channel: "whatsapp",
      name: "order_update",
      category: "UTILITY",
      language: "en_US",
      header: { type: "text", text: "Order Update" },
      body: "Your order #{{1}} has been shipped and will arrive on {{2}}.",
      buttons: [{ type: "url", text: "Track", url: "https://track.example.com" }],
      sample: "1234",
      status: "PENDING",
      active: true,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
  ];
}

function load(): Template[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return seed();
}

let data: Template[] = load();
const listeners = new Set<() => void>();
function persist() {
  if (typeof window !== "undefined") localStorage.setItem(KEY, JSON.stringify(data));
  listeners.forEach((l) => l());
}

export const templateStore = {
  getAll: () => data,
  getByChannel: (c: Channel) => data.filter((t) => t.channel === c),
  upsert(t: Template) {
    const i = data.findIndex((x) => x.id === t.id);
    if (i >= 0) data[i] = t;
    else data.push(t);
    persist();
  },
  remove(id: string) {
    data = data.filter((x) => x.id !== id);
    persist();
  },
  subscribe(fn: () => void) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
};

export function useTemplates(channel: Channel) {
  const [, tick] = useState(0);
  useEffect(() => {
    const unsub = templateStore.subscribe(() => tick((n) => n + 1));
    return () => {
      unsub();
    };
  }, []);
  return templateStore.getByChannel(channel);
}
