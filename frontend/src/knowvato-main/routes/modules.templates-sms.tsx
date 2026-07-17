import { useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Save, MessageSquare } from "lucide-react";
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
  channel: "sms",
  name: "",
  category: "MARKETING",
  language: "en_US",
  body: "",
  buttons: [],
  sample: "",
  status: "PENDING",
  active: true,
  createdAt: new Date().toISOString(),
});

export default function SmsTemplatesPage() {
  const list = useTemplates("sms");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Template>(empty());

  const save = () => {
    if (!form.name.trim() || !form.body.trim()) return toast.error("Name and body required");
    templateStore.upsert(form);
    toast.success("SMS template saved");
    setOpen(false);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">SMS Templates</h1>
          <p className="text-sm text-muted-foreground">Create and manage SMS templates.</p>
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
              <TableHead>Body</TableHead>
              <TableHead>Length</TableHead>
              <TableHead>Active</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {list.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                  <MessageSquare className="mx-auto mb-2 h-8 w-8" />
                  No SMS templates yet.
                </TableCell>
              </TableRow>
            )}
            {list.map((t) => (
              <TableRow key={t.id}>
                <TableCell className="font-medium">{t.name}</TableCell>
                <TableCell className="max-w-md truncate">{t.body}</TableCell>
                <TableCell>
                  <Badge variant="outline">{t.body.length}</Badge>
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
        <SheetContent className="sm:max-w-lg overflow-y-auto">
          <SheetHeader className="mb-4">
            <SheetTitle>{list.find((x) => x.id === form.id) ? "Edit" : "Create"} SMS Template</SheetTitle>
          </SheetHeader>
          <div className="space-y-4">
            <div>
              <Label className="mb-2 block">Template Name</Label>
              <Input
                value={form.name}
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value.toLowerCase().replace(/\s/g, "_") })
                }
                placeholder="otp_login"
              />
            </div>
            <div>
              <Label className="mb-2 block">Message Body *</Label>
              <Textarea
                rows={5}
                value={form.body}
                onChange={(e) => setForm({ ...form, body: e.target.value })}
                placeholder="Your OTP is {{1}}. Valid for 5 minutes."
                maxLength={480}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {form.body.length}/480 chars · {Math.ceil(form.body.length / 160) || 0} SMS segment(s)
              </p>
            </div>
            <div>
              <Label className="mb-2 block">Sample Values</Label>
              <Input
                value={form.sample || ""}
                onChange={(e) => setForm({ ...form, sample: e.target.value })}
                placeholder="123456"
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
        </SheetContent>
      </Sheet>
    </div>
  );
}
