import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Bookmark,
  BookmarkCheck,
  ArrowLeft,
  MessageSquare,
  Puzzle,
  ChevronDown,
  LayoutDashboard,
  Settings as SettingsIcon,
} from "lucide-react";
import { useBookmarks } from "@/lib/bookmarks";

// Import Full-Fledged Module Pages
import WebsiteBuilderPage from "../pages/WebsiteBuilderPage";
import UserManagementPage from "../pages/UserManagementPage";
import CommunicationPage from "../pages/CommunicationPage";
import FrontOfficePage from "../pages/FrontOfficePage";
import ReportsPage from "../pages/ReportsPage";
import EmailIntegrationPage from "../pages/EmailIntegrationPage";
import SmsIntegrationPage from "../pages/SmsIntegrationPage";
import FacebookIntegrationPage from "../pages/FacebookIntegrationPage";
import OtherIntegrationPage from "../pages/OtherIntegrationPage";
import AIIntegrationPage from "../pages/AIIntegrationPage";

// Import Configuration Submodule Pages
import TemplatesWhatsapp from "./modules.templates-whatsapp";
import TemplatesEmail from "./modules.templates-email";
import TemplatesSms from "./modules.templates-sms";
import IntegrationsWhatsapp from "./modules.integrations-whatsapp";
import { Sparkles } from "lucide-react";

const CONFIGURATION_CATEGORIES = [
  {
    id: "general",
    title: "General",
    icon: LayoutDashboard,
    color: "#6366f1",
    items: [
      { slug: "configuration", label: "Overview Dashboard" },
    ],
  },
  {
    id: "templates",
    title: "Communication Templates",
    icon: MessageSquare,
    color: "#059669",
    items: [
      { slug: "templates-whatsapp", label: "WhatsApp Template" },
      { slug: "templates-sms", label: "SMS Template" },
      { slug: "templates-email", label: "Email Template" },
    ],
  },
  {
    id: "integrations",
    title: "Integrations",
    icon: Puzzle,
    color: "#2563eb",
    items: [
      { slug: "integrations-ai", label: "AI Integration" },
      { slug: "integrations-whatsapp", label: "WhatsApp Integration" },
      { slug: "integrations-email", label: "Email Integration" },
      { slug: "integrations-sms", label: "SMS Integration" },
      { slug: "integrations-facebook", label: "Facebook Integration" },
      { slug: "integrations-other", label: "Other API Integration" },
    ],
  },
];

function ConfigurationOverview({ onSelect }: { onSelect: (slug: string) => void }) {
  const cards = [
    {
      title: "WhatsApp Templates",
      desc: "Manage Meta-approved WhatsApp message templates, variables, and quick replies.",
      slug: "templates-whatsapp",
      badge: "Meta Approved",
      color: "bg-emerald-500/10 text-emerald-600 border-emerald-200",
      icon: MessageSquare,
    },
    {
      title: "SMS Templates",
      desc: "Configure DLT-registered SMS templates for transactional and marketing alerts.",
      slug: "templates-sms",
      badge: "DLT Ready",
      color: "bg-blue-500/10 text-blue-600 border-blue-200",
      icon: MessageSquare,
    },
    {
      title: "Email Templates",
      desc: "Design responsive HTML & rich-text email templates for automated workflows.",
      slug: "templates-email",
      badge: "HTML & Text",
      color: "bg-purple-500/10 text-purple-600 border-purple-200",
      icon: MessageSquare,
    },
    {
      title: "AI Integration & Copilot",
      desc: "Connect Google Gemini or Anthropic Claude to automate operational CRM workflows and database tasks.",
      slug: "integrations-ai",
      badge: "Gemini & Claude",
      color: "bg-emerald-500/10 text-emerald-600 border-emerald-200",
      icon: Sparkles,
    },
    {
      title: "WhatsApp API Integration",
      desc: "Connect your WhatsApp Business API account, webhook tokens, and phone numbers.",
      slug: "integrations-whatsapp",
      badge: "Connected",
      color: "bg-emerald-500/10 text-emerald-600 border-emerald-200",
      icon: Puzzle,
    },
    {
      title: "Email Gateway Integration",
      desc: "Configure SMTP, SendGrid, Amazon SES, or Mailgun for outbound emails.",
      slug: "integrations-email",
      badge: "SMTP / SES",
      color: "bg-blue-500/10 text-blue-600 border-blue-200",
      icon: Puzzle,
    },
    {
      title: "SMS Gateway Integration",
      desc: "Link SMS gateways like Twilio, Fast2SMS, MSG91, or custom API endpoints.",
      slug: "integrations-sms",
      badge: "Active Gateway",
      color: "bg-indigo-500/10 text-indigo-600 border-indigo-200",
      icon: Puzzle,
    },
    {
      title: "Facebook Lead Ads Integration",
      desc: "Automatically sync leads from Facebook & Instagram ad campaigns into CRM.",
      slug: "integrations-facebook",
      badge: "Auto Sync",
      color: "bg-sky-500/10 text-sky-600 border-sky-200",
      icon: Puzzle,
    },
    {
      title: "Other API & Webhooks",
      desc: "Set up inbound & outbound REST webhooks and external API integrations.",
      slug: "integrations-other",
      badge: "REST Webhooks",
      color: "bg-amber-500/10 text-amber-600 border-amber-200",
      icon: Puzzle,
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-foreground">Configuration Dashboard</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Configure your communication templates, API gateways, and external integrations in one place.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div
              key={c.slug}
              onClick={() => onSelect(c.slug)}
              className="group rounded-xl border bg-card p-5 shadow-xs hover:shadow-md transition-all cursor-pointer hover:border-primary/50 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className={`p-2.5 rounded-lg border ${c.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                    {c.badge}
                  </span>
                </div>
                <h3 className="font-semibold text-base text-foreground group-hover:text-primary transition-colors">
                  {c.title}
                </h3>
                <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">
                  {c.desc}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t flex items-center justify-between text-xs font-medium text-primary">
                <span>Configure Settings</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function ModulePage() {
  const { module } = useParams();
  const navigate = useNavigate();
  const activeModule = module || "configuration";

  // Standalone Main Suite Direct Modules
  if (activeModule === "website") return <WebsiteBuilderPage />;
  if (activeModule === "users") return <UserManagementPage />;
  if (activeModule === "communication") return <CommunicationPage />;
  if (activeModule === "front-office") return <FrontOfficePage />;
  if (activeModule === "reports") return <ReportsPage />;

  // Configuration / Templates / Integrations PERSISTENT 2-Column Shell
  const activeSlug = activeModule === "settings" ? "configuration" : activeModule;

  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({
    general: true,
    templates: true,
    integrations: true,
  });

  const url = `/modules/${activeModule}`;
  const { add, remove, has } = useBookmarks();
  const pinned = has(url);

  const handleSelectSlug = (slug: string) => {
    navigate(`/modules/${slug}`);
  };

  const renderActiveConfigComponent = (slug: string) => {
    switch (slug) {
      case "templates-whatsapp":
        return <TemplatesWhatsapp />;
      case "templates-email":
        return <TemplatesEmail />;
      case "templates-sms":
        return <TemplatesSms />;
      case "integrations-ai":
        return <AIIntegrationPage />;
      case "integrations-whatsapp":
        return <IntegrationsWhatsapp />;
      case "integrations-email":
        return <EmailIntegrationPage />;
      case "integrations-sms":
        return <SmsIntegrationPage />;
      case "integrations-facebook":
        return <FacebookIntegrationPage />;
      case "integrations-other":
        return <OtherIntegrationPage />;
      case "configuration":
      case "settings":
      default:
        return <ConfigurationOverview onSelect={(slug) => navigate(`/modules/${slug}`)} />;
    }
  };

  return (
    <div className="p-4 max-w-[1600px] mx-auto space-y-4">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between gap-4 pb-2 border-b">
        <div>
          <Link
            to="/"
            className="text-xs text-muted-foreground hover:underline inline-flex items-center gap-1 text-decoration-none"
          >
            <ArrowLeft className="h-3 w-3" /> Back to dashboard
          </Link>
          <h1 className="text-xl font-semibold tracking-tight mt-0.5">Configuration</h1>
        </div>
        <Button
          variant={pinned ? "secondary" : "outline"}
          size="sm"
          onClick={() => (pinned ? remove(url) : add({ title: "Configuration", url }))}
        >
          {pinned ? <BookmarkCheck className="h-4 w-4 mr-1" /> : <Bookmark className="h-4 w-4 mr-1" />}
          {pinned ? "Bookmarked" : "Bookmark"}
        </Button>
      </div>

      {/* 2-Column Setup Layout: Left Submenu Sidebar (PERSISTENT) + Right Active Submodule Component */}
      <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-4">
        {/* Left Submenu Navigation */}
        <div className="space-y-2 sticky top-[70px] align-self-start">
          {CONFIGURATION_CATEGORIES.map((cat) => (
            <div key={cat.id} className="rounded-xl border bg-card overflow-hidden shadow-2xs">
              <button
                type="button"
                className="w-full flex items-center justify-between gap-2 p-2.5 bg-muted/20 border-b text-left text-xs font-semibold text-foreground cursor-pointer"
                onClick={() =>
                  setOpenCategories((prev) => ({ ...prev, [cat.id]: !prev[cat.id] }))
                }
              >
                <div className="flex items-center gap-2 min-w-0">
                  <cat.icon className="h-4 w-4 shrink-0" style={{ color: cat.color }} />
                  <span className="truncate">{cat.title}</span>
                </div>
                <ChevronDown
                  className={`h-3.5 w-3.5 text-muted-foreground shrink-0 transition-transform ${
                    openCategories[cat.id] ? "" : "-rotate-90"
                  }`}
                />
              </button>

              {openCategories[cat.id] && (
                <div className="p-1 space-y-0.5">
                  {cat.items.map((item) => {
                    const isSelected = activeSlug === item.slug;
                    return (
                      <button
                        key={item.slug}
                        type="button"
                        onClick={() => handleSelectSlug(item.slug)}
                        className={`w-full text-left px-2.5 py-2 rounded-md text-xs font-medium transition-colors flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                            : "text-muted-foreground hover:bg-slate-200/80 hover:text-foreground"
                        }`}
                      >
                        <span className="truncate">{item.label}</span>
                        {isSelected && <div className="h-1.5 w-1.5 rounded-full bg-white shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Right Panel: Active Submodule Component */}
        <div className="min-w-0 rounded-xl border bg-card shadow-2xs overflow-hidden">
          {renderActiveConfigComponent(activeSlug)}
        </div>
      </div>
    </div>
  );
}
