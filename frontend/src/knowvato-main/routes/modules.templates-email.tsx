import { useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Save, Mail, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { templateStore, useTemplates, type Template } from "@/lib/template-store";

const empty = (): Template => ({
  id: crypto.randomUUID(),
  channel: "email",
  name: "",
  category: "MARKETING",
  language: "en_US",
  subject: "",
  body: "",
  buttons: [],
  sample: "",
  status: "PENDING",
  active: true,
  createdAt: new Date().toISOString(),
});

export default function EmailTemplatesPage() {
  const list = useTemplates("email");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Template>(empty());

  const save = () => {
    if (!form.name.trim() || !form.subject?.trim() || !form.body.trim())
      return toast.error("Name, subject and body required");
    templateStore.upsert(form);
    toast.success("Email template saved");
    setOpen(false);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Email Templates</h1>
          <p className="text-sm text-muted-foreground">Design and manage transactional & marketing emails.</p>
        </div>
        <Button
          onClick={() => {
            setForm(empty());
            setOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" /> Create
        </Button>
      </div>

      <div className="rounded-lg border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Name</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Active</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {list.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                  <Mail className="mx-auto mb-2 h-8 w-8" />
                  No email templates yet.
                </TableCell>
              </TableRow>
            )}
            {list.map((t) => (
              <TableRow key={t.id}>
                <TableCell className="font-medium">{t.name}</TableCell>
                <TableCell className="max-w-md truncate">{t.subject}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{t.status}</Badge>
                </TableCell>
                <TableCell>
                  <Switch
                    checked={t.active}
                    onCheckedChange={(v) => templateStore.upsert({ ...t, active: v })}
                  />
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(t.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setForm({ ...t });
                      setOpen(true);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      templateStore.remove(t.id);
                      toast.success("Deleted");
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="w-full sm:max-w-3xl overflow-y-auto">
          <SheetHeader className="mb-4">
            <SheetTitle>{list.find((x) => x.id === form.id) ? "Edit" : "Create"} Email Template</SheetTitle>
          </SheetHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div>
                <Label className="mb-2 block">Template Name</Label>
                <Input
                  value={form.name}
                  onChange={(e) =>
                    setForm({ ...form, name: e.target.value.toLowerCase().replace(/\s/g, "_") })
                  }
                  placeholder="welcome_email"
                />
              </div>
              <div>
                <Label className="mb-2 block">Subject *</Label>
                <Input
                  value={form.subject || ""}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  placeholder="Welcome to {{1}}!"
                />
              </div>
              <div>
                <Label className="mb-2 block">Body (HTML or plain text) *</Label>
                <Textarea
                  rows={12}
                  value={form.body}
                  onChange={(e) => setForm({ ...form, body: e.target.value })}
                  placeholder="<h1>Hi {{1}}</h1><p>Thanks for joining.</p>"
                />
              </div>
              <div>
                <Label className="mb-2 block">Sample Values (comma separated)</Label>
                <Input
                  value={form.sample || ""}
                  onChange={(e) => setForm({ ...form, sample: e.target.value })}
                  placeholder="John, Acme"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button className="flex-1" onClick={save}>
                  <Save className="mr-2 h-4 w-4" /> Save
                </Button>
              </div>
            </div>
            <div className="bg-muted/30 rounded-md p-4 overflow-y-auto">
              <div className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                <Eye className="h-3 w-3" /> Preview
              </div>
              <div className="bg-card rounded border p-4">
                <div className="text-xs text-muted-foreground mb-1">Subject</div>
                <div className="font-semibold mb-3">
                  {renderVars(form.subject || "", form.sample) || "(no subject)"}
                </div>
                <div
                  className="prose prose-sm max-w-none text-sm"
                  dangerouslySetInnerHTML={{
                    __html: renderVars(form.body, form.sample) || "<em>Empty body</em>",
                  }}
                />
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function renderVars(text: string, sample?: string) {
  const samples = (sample || "").split(",").map((s) => s.trim());
  return text.replace(/\{\{(\d+)\}\}/g, (_, n) => samples[Number(n) - 1] || `{{${n}}}`);
}
