import { Link, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bookmark, BookmarkCheck, ArrowLeft } from "lucide-react";
import { useBookmarks } from "@/lib/bookmarks";

const MODULE_META: Record<string, { title: string; description: string }> = {
  events: { title: "Event Manager", description: "Create, schedule and track events end-to-end." },
  whatsapp: { title: "WhatsApp CRM", description: "Conversations, broadcasts and automations on WhatsApp." },
  website: { title: "Website Builder", description: "Drag-and-drop pages, forms and landing experiences." },
  users: { title: "User Management", description: "Roles, permissions and team access." },
  communication: { title: "Communication", description: "Announcements, email and SMS campaigns." },
  "front-office": { title: "Front Office", description: "Check-ins, visitors and reception desk." },
  reports: { title: "Reports & Analytics", description: "Cross-module reporting and insights." },
  settings: { title: "Configuration", description: "Workspace, billing and integrations." },
  configuration: { title: "Configuration", description: "Workspace, billing and general settings." },
  "integrations-whatsapp": { title: "WhatsApp Integration", description: "Connect Meta Cloud API or BSP vendor for WhatsApp." },
  "integrations-email": { title: "Email Integration", description: "Connect SMTP, SendGrid or other email providers." },
  "integrations-sms": { title: "SMS Integration", description: "Connect SMS gateways like Twilio, MSG91 or Kaleyra." },
  "integrations-facebook": { title: "Facebook Integration", description: "Connect Facebook Pages, Ads and Lead forms." },
  "integrations-other": { title: "Other API Integration", description: "Connect custom REST APIs and webhooks." },
  "templates-whatsapp": { title: "WhatsApp Templates", description: "Create and manage WhatsApp templates." },
  "templates-sms": { title: "SMS Templates", description: "Create and manage SMS templates." },
  "templates-email": { title: "Email Templates", description: "Create and manage Email templates." },
};

export default function ModulePage() {
  const { module } = useParams();
  const activeModule = module || "configuration";
  const meta = MODULE_META[activeModule] ?? { title: activeModule, description: "Module" };
  const url = `/modules/${activeModule}`;
  const { add, remove, has } = useBookmarks();
  const pinned = has(url);

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <Link to="/" className="text-xs text-muted-foreground hover:underline inline-flex items-center gap-1 text-decoration-none">
            <ArrowLeft className="h-3 w-3" /> Back to dashboard
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight mt-1">{meta.title}</h1>
          <p className="text-sm text-muted-foreground">{meta.description}</p>
        </div>
        <Button
          variant={pinned ? "secondary" : "outline"}
          onClick={() => (pinned ? remove(url) : add({ title: meta.title, url }))}
        >
          {pinned ? <BookmarkCheck className="h-4 w-4 mr-1" /> : <Bookmark className="h-4 w-4 mr-1" />}
          {pinned ? "Bookmarked" : "Bookmark"}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Coming soon</CardTitle>
          <CardDescription>
            This is a placeholder for the {meta.title} module. We can build it out next.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-lg border p-4 bg-muted/30">
                <div className="h-3 w-20 bg-muted rounded mb-3" />
                <div className="h-6 w-32 bg-muted rounded mb-2" />
                <div className="h-3 w-full bg-muted rounded" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
