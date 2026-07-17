import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Eye,
  Plus,
  RefreshCw,
  Save,
  Send,
  Trash2,
  Pencil,
  X,
  Link2,
  Phone,
  Reply,
  Image as ImageIcon,
  Video,
  FileText,
  Upload,
  CheckCheck,
  AlertCircle,
  Copy,
  Clock,
  Sparkles,
  Smartphone,
  ChevronDown,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import {
  templateStore,
  useTemplates,
  type Template,
  type TemplateButton,
} from "@/lib/template-store";

const HEADER_TYPES = [
  { value: "none", label: "None" },
  { value: "text", label: "Text" },
  { value: "image", label: "Image" },
  { value: "video", label: "Video" },
  { value: "document", label: "Document" },
  { value: "location", label: "Location" },
] as const;

const emptyTemplate = (): Template => ({
  id: crypto.randomUUID(),
  channel: "whatsapp",
  name: "",
  category: "MARKETING",
  language: "en_US",
  header: { type: "none" },
  body: "",
  footer: "",
  buttons: [],
  sample: "",
  status: "PENDING",
  active: true,
  createdAt: new Date().toISOString(),
});

export default function WhatsAppTemplatesPage() {
  const templates = useTemplates("whatsapp");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Template>(emptyTemplate());
  const [filter, setFilter] = useState({ category: "all", status: "all", from: "", to: "" });
  const [testFor, setTestFor] = useState<Template | null>(null);
  const [testPhone, setTestPhone] = useState("");

  const filtered = useMemo(() => {
    return templates.filter((t) => {
      if (filter.category !== "all" && t.category !== filter.category) return false;
      if (filter.status === "active" && !t.active) return false;
      if (filter.status === "inactive" && t.active) return false;
      if (filter.from && new Date(t.createdAt) < new Date(filter.from)) return false;
      if (filter.to && new Date(t.createdAt) > new Date(filter.to + "T23:59:59")) return false;
      return true;
    });
  }, [templates, filter]);

  const startCreate = () => {
    setForm(emptyTemplate());
    setOpen(true);
  };
  const startEdit = (t: Template) => {
    setForm({ ...t, buttons: [...t.buttons] });
    setOpen(true);
  };

  const onSave = () => {
    if (!form.name.trim() || !form.body.trim()) {
      toast.error("Name and body are required");
      return;
    }
    templateStore.upsert({ ...form });
    toast.success("Template saved");
    setOpen(false);
  };

  const sync = () => toast.success("Synced templates from Meta");

  const addButton = (type: TemplateButton["type"]) => {
    if (form.buttons.length >= 3) return toast.error("Max 3 buttons");
    const nb: TemplateButton =
      type === "quick_reply"
        ? { type, text: "Quick reply" }
        : type === "url"
          ? { type, text: "Visit website", url: "https://" }
          : { type, text: "Call us", phone: "+1" };
    setForm({ ...form, buttons: [...form.buttons, nb] });
  };

  const updateButton = (i: number, patch: Partial<TemplateButton>) => {
    const buttons = form.buttons.map((b, idx) =>
      idx === i ? ({ ...b, ...patch } as TemplateButton) : b,
    );
    setForm({ ...form, buttons });
  };
  const removeButton = (i: number) =>
    setForm({ ...form, buttons: form.buttons.filter((_, idx) => idx !== i) });

  const onTest = () => {
    if (!testPhone.match(/^\+?[\d\s-]{8,}$/)) {
      toast.error("Enter a valid mobile number");
      return;
    }
    toast.success(`Test message sent to ${testPhone}`);
    setTestFor(null);
    setTestPhone("");
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">WhatsApp Templates</h1>
          <p className="text-sm text-muted-foreground">
            Create, sync and test WhatsApp message templates.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={sync}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Sync
          </Button>
          <Button onClick={startCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Create
          </Button>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-4 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-3">
        <div>
          <Label className="text-xs mb-1 block">Type</Label>
          <Select
            value={filter.category}
            onValueChange={(v) => setFilter({ ...filter, category: v })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="MARKETING">Marketing</SelectItem>
              <SelectItem value="UTILITY">Utility</SelectItem>
              <SelectItem value="AUTHENTICATION">Authentication</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs mb-1 block">Status</Label>
          <Select
            value={filter.status}
            onValueChange={(v) => setFilter({ ...filter, status: v })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs mb-1 block">From</Label>
          <Input
            type="date"
            value={filter.from}
            onChange={(e) => setFilter({ ...filter, from: e.target.value })}
          />
        </div>
        <div>
          <Label className="text-xs mb-1 block">To</Label>
          <Input
            type="date"
            value={filter.to}
            onChange={(e) => setFilter({ ...filter, to: e.target.value })}
          />
        </div>
      </div>

      <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Active</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                  <FileText className="mx-auto mb-2 h-8 w-8" />
                  No templates found.
                </TableCell>
              </TableRow>
            )}
            {filtered.map((t) => (
              <TableRow key={t.id}>
                <TableCell className="font-medium">{t.name}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize">
                    {t.category.toLowerCase()}
                  </Badge>
                </TableCell>
                <TableCell>
                  {t.status === "APPROVED" ? (
                    <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                      Approved
                    </Badge>
                  ) : t.status === "REJECTED" ? (
                    <Badge variant="destructive">Rejected</Badge>
                  ) : (
                    <Badge variant="secondary">Pending</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <Switch
                    checked={t.active}
                    onCheckedChange={(v) => templateStore.upsert({ ...t, active: v })}
                  />
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(t.createdAt).toLocaleString()}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" onClick={() => startEdit(t)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setTestFor(t)}>
                    <Send className="h-4 w-4" />
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

      {/* Create/Edit Drawer */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="w-full sm:max-w-4xl overflow-y-auto p-0">
          <div className="grid grid-cols-1 md:grid-cols-2 min-h-screen">
            <div className="p-6 border-r overflow-y-auto">
              <SheetHeader className="mb-4">
                <SheetTitle>
                  {templates.find((x) => x.id === form.id) ? "Edit" : "Create"} Template
                </SheetTitle>
              </SheetHeader>

              <div className="space-y-4">
                <div>
                  <Label className="mb-2 block">Template Name</Label>
                  <Input
                    value={form.name}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        name: e.target.value.toLowerCase().replace(/\s/g, "_"),
                      })
                    }
                    placeholder="welcome_offer"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="mb-2 block">Type</Label>
                    <Select
                      value={form.category}
                      onValueChange={(v) =>
                        setForm({ ...form, category: v as Template["category"] })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MARKETING">Marketing</SelectItem>
                        <SelectItem value="UTILITY">Utility</SelectItem>
                        <SelectItem value="AUTHENTICATION">Authentication</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="mb-2 block">Language</Label>
                    <Select
                      value={form.language}
                      onValueChange={(v) => setForm({ ...form, language: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en_US">English (US)</SelectItem>
                        <SelectItem value="en_GB">English (UK)</SelectItem>
                        <SelectItem value="hi">Hindi</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label className="mb-2 block">Header</Label>
                  <Select
                    value={form.header?.type || "none"}
                    onValueChange={(v) =>
                      setForm({
                        ...form,
                        header: { type: v as NonNullable<Template["header"]>["type"], text: form.header?.text },
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {HEADER_TYPES.map((h) => (
                        <SelectItem key={h.value} value={h.value}>
                          {h.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.header?.type === "text" && (
                    <Input
                      className="mt-2"
                      value={form.header.text || ""}
                      onChange={(e) =>
                        setForm({ ...form, header: { type: "text", text: e.target.value } })
                      }
                      placeholder="Header text (max 60 chars)"
                      maxLength={60}
                    />
                  )}
                  {["image", "video", "document"].includes(form.header?.type || "") && (
                    <div className="mt-2 border-2 border-dashed rounded-md p-4 text-center text-sm text-muted-foreground">
                      <Upload className="mx-auto mb-1 h-6 w-6" />
                      Upload {form.header?.type}
                    </div>
                  )}
                </div>

                <div>
                  <Label className="mb-2 block">Body *</Label>
                  <Textarea
                    rows={5}
                    value={form.body}
                    onChange={(e) => setForm({ ...form, body: e.target.value })}
                    placeholder="Hi {{1}}, your order is confirmed."
                    maxLength={1024}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Use {"{{1}}, {{2}}"} for variables. {form.body.length}/1024
                  </p>
                </div>

                <div>
                  <Label className="mb-2 block">Footer (optional)</Label>
                  <Input
                    value={form.footer || ""}
                    onChange={(e) => setForm({ ...form, footer: e.target.value })}
                    maxLength={60}
                    placeholder="Reply STOP to opt out"
                  />
                </div>

                <div>
                  <Label className="mb-2 block">Sample Values</Label>
                  <Input
                    value={form.sample || ""}
                    onChange={(e) => setForm({ ...form, sample: e.target.value })}
                    placeholder="John (sample for {{1}})"
                  />
                </div>

                <div>
                  <Label className="mb-2 block">Buttons (max 3)</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addButton("quick_reply")}
                    >
                      <Reply className="mr-1 h-4 w-4" />
                      Quick Reply
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addButton("url")}
                    >
                      <Link2 className="mr-1 h-4 w-4" />
                      Website
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addButton("phone")}
                    >
                      <Phone className="mr-1 h-4 w-4" />
                      Call
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {form.buttons.map((b, i) => (
                      <div key={i} className="flex gap-2 items-center border rounded-md p-2">
                        <Badge variant="secondary" className="capitalize">
                          {b.type.replace("_", " ")}
                        </Badge>
                        <Input
                          value={b.text}
                          onChange={(e) => updateButton(i, { text: e.target.value })}
                          placeholder="Button text"
                          className="h-8"
                        />
                        {b.type === "url" && (
                          <Input
                            value={(b as Extract<TemplateButton, { type: "url" }>).url}
                            onChange={(e) => updateButton(i, { url: e.target.value })}
                            placeholder="https://"
                            className="h-8"
                          />
                        )}
                        {b.type === "phone" && (
                          <Input
                            value={(b as Extract<TemplateButton, { type: "phone" }>).phone}
                            onChange={(e) => updateButton(i, { phone: e.target.value })}
                            placeholder="+1..."
                            className="h-8"
                          />
                        )}
                        <Button variant="ghost" size="sm" onClick={() => removeButton(i)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-2 sticky bottom-0 bg-card pb-1">
                  <Button variant="outline" onClick={() => setOpen(false)} className="flex-1">
                    Cancel
                  </Button>
                  <Button onClick={onSave} className="flex-1">
                    <Save className="mr-2 h-4 w-4" />
                    Save
                  </Button>
                </div>
              </div>
            </div>

            <div className="bg-[#e5ddd5] p-6 overflow-y-auto">
              <div className="text-xs text-muted-foreground mb-3 flex items-center gap-2">
                <Eye className="h-4 w-4" /> Live preview
              </div>
              <PhonePreview t={form} />
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <Dialog open={!!testFor} onOpenChange={(o) => !o && setTestFor(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Test Template</DialogTitle>
          </DialogHeader>
          {testFor && (
            <div className="space-y-4">
              <div className="rounded-md bg-[#e5ddd5] p-3">
                <PhonePreview t={testFor} compact />
              </div>
              <div>
                <Label className="mb-2 block">Mobile Number</Label>
                <Input
                  value={testPhone}
                  onChange={(e) => setTestPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setTestFor(null)}>
              Cancel
            </Button>
            <Button onClick={onTest}>
              <Send className="mr-2 h-4 w-4" />
              Send Test
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PhonePreview({ t, compact }: { t: Template; compact?: boolean }) {
  const renderBody = (text: string) => {
    const samples = (t.sample || "").split(",").map((s) => s.trim());
    return text.replace(/\{\{(\d+)\}\}/g, (_, n) => samples[Number(n) - 1] || `{{${n}}}`);
  };
  return (
    <div className={`bg-white rounded-lg shadow-sm max-w-sm ml-auto ${compact ? "" : "mt-2"}`}>
      {t.header?.type === "text" && t.header.text && (
        <div className="px-3 pt-2 font-semibold text-sm">{renderBody(t.header.text)}</div>
      )}
      {["image", "video", "document"].includes(t.header?.type || "") && (
        <div className="bg-gray-200 aspect-video rounded-t-lg flex items-center justify-center text-gray-500">
          {t.header?.type === "image" ? (
            <ImageIcon className="h-8 w-8" />
          ) : t.header?.type === "video" ? (
            <Video className="h-8 w-8" />
          ) : (
            <FileText className="h-8 w-8" />
          )}
        </div>
      )}
      <div className="p-3 text-sm whitespace-pre-wrap">
        {renderBody(t.body) || (
          <span className="text-muted-foreground">Your message body...</span>
        )}
      </div>
      {t.footer && <div className="px-3 pb-2 text-xs text-gray-500">{t.footer}</div>}
      <div className="px-3 pb-2 text-[10px] text-gray-400 text-right flex items-center justify-end gap-1">
        {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        <CheckCheck className="h-3 w-3 text-blue-500" />
      </div>
      {t.buttons.length > 0 && (
        <div className="border-t divide-y">
          {t.buttons.map((b, i) => (
            <div
              key={i}
              className="py-2 text-center text-sm text-blue-600 font-medium flex items-center justify-center gap-1"
            >
              {b.type === "url" ? (
                <Link2 className="h-4 w-4" />
              ) : b.type === "phone" ? (
                <Phone className="h-4 w-4" />
              ) : (
                <Reply className="h-4 w-4" />
              )}
              {b.text}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
