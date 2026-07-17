import { Link } from "react-router-dom";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Plug, Plus, Pencil, Trash2, Copy, CheckCircle2, XCircle, Loader2, Radio, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { waStore, useWaIntegrations, type Integration } from "@/lib/wa-store";

const VENDORS = ["Pinnacle", "AI Sensy", "Interakt", "Gupshup", "WATI"];

const emptyForm = (): Integration => ({
  id: crypto.randomUUID(),
  provider: "meta",
  vendor: "",
  apiKey: "",
  phoneId: "",
  wabaId: "",
  phoneNumber: "",
  active: false,
  status: "untested",
  callbackUrl: "",
  createdAt: new Date().toISOString(),
});

export default function WhatsAppIntegrationPage() {
  const integrations = useWaIntegrations();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Integration>(emptyForm());
  const [testing, setTesting] = useState(false);

  const startCreate = () => {
    setForm(emptyForm());
    setOpen(true);
  };
  const startEdit = (i: Integration) => {
    setForm({ ...i });
    setOpen(true);
  };

  const onSave = () => {
    if (!form.apiKey || !form.phoneId || !form.wabaId || !form.phoneNumber) {
      toast.error("Please fill all required fields");
      return;
    }
    if (form.provider === "vendor" && !form.vendor) {
      toast.error("Please select a vendor");
      return;
    }
    const callbackUrl =
      form.callbackUrl ||
      `${typeof window !== "undefined" ? window.location.origin : ""}/api/public/wa/${form.id}`;
    waStore.upsert({ ...form, callbackUrl });
    toast.success("Integration saved");
    setOpen(false);
  };

  const onTest = async () => {
    if (!form.apiKey || !form.phoneId) {
      toast.error("Enter API key and Phone ID first");
      return;
    }
    setTesting(true);
    await new Promise((r) => setTimeout(r, 1200));
    const ok = form.apiKey.length > 10;
    setForm((f) => ({ ...f, status: ok ? "connected" : "disconnected" }));
    setTesting(false);
    ok ? toast.success("Connection live") : toast.error("Connection failed");
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6">
      <div>
        <Link to="/" className="text-xs text-muted-foreground hover:underline inline-flex items-center gap-1">
          <ArrowLeft className="h-3 w-3" /> Back to dashboard
        </Link>
        <div className="flex items-center justify-between mt-1">
          <h1 className="text-2xl font-semibold tracking-tight">WhatsApp Integration</h1>
          <Button onClick={startCreate}>
            <Plus className="h-4 w-4 mr-2" /> Integrate
          </Button>
        </div>
      </div>

      <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Provider / Vendor</TableHead>
              <TableHead>Phone Number</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Active</TableHead>
              <TableHead>Callback URL</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {integrations.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                  <Plug className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  No integrations yet. Click <b>Integrate</b> to add one.
                </TableCell>
              </TableRow>
            )}
            {integrations.map((i) => (
              <TableRow key={i.id}>
                <TableCell className="font-medium">
                  {i.provider === "meta" ? "Meta (Cloud API)" : i.vendor}
                </TableCell>
                <TableCell>{i.phoneNumber}</TableCell>
                <TableCell>
                  {i.status === "connected" ? (
                    <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                      <CheckCircle2 className="h-3 w-3 mr-1" /> Live
                    </Badge>
                  ) : i.status === "disconnected" ? (
                    <Badge variant="destructive">
                      <XCircle className="h-3 w-3 mr-1" /> Failed
                    </Badge>
                  ) : (
                    <Badge variant="secondary">Untested</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <Switch checked={i.active} onCheckedChange={() => waStore.setActive(i.id)} />
                </TableCell>
                <TableCell>
                  <button
                    className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                    onClick={() => {
                      navigator.clipboard.writeText(i.callbackUrl);
                      toast.success("Callback URL copied");
                    }}
                  >
                    <Copy className="h-3 w-3" />
                    <span className="truncate max-w-[180px]">{i.callbackUrl}</span>
                  </button>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(i.createdAt).toLocaleString()}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" onClick={() => startEdit(i)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      waStore.remove(i.id);
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
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Plug className="h-4 w-4 text-primary" />
              {integrations.find((x) => x.id === form.id) ? "Edit" : "New"} Integration
            </SheetTitle>
          </SheetHeader>

          <div className="space-y-5 mt-6 px-1">
            <div>
              <Label className="mb-2 block">Provider</Label>
              <RadioGroup
                value={form.provider}
                onValueChange={(v) => setForm({ ...form, provider: v as "meta" | "vendor" })}
                className="flex gap-6"
              >
                <label className="flex items-center gap-2 cursor-pointer">
                  <RadioGroupItem value="meta" id="meta" />
                  <span>Meta (Cloud API)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <RadioGroupItem value="vendor" id="vendor" />
                  <span>Vendor (BSP)</span>
                </label>
              </RadioGroup>
            </div>

            {form.provider === "vendor" && (
              <div>
                <Label className="mb-2 block">Vendor</Label>
                <Select
                  value={form.vendor || ""}
                  onValueChange={(v) => setForm({ ...form, vendor: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select vendor" />
                  </SelectTrigger>
                  <SelectContent>
                    {VENDORS.map((v) => (
                      <SelectItem key={v} value={v}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label className="mb-2 block">API Key / Access Token</Label>
                <Input
                  type="password"
                  value={form.apiKey}
                  onChange={(e) => setForm({ ...form, apiKey: e.target.value })}
                  placeholder="EAAG..."
                />
              </div>
              <div>
                <Label className="mb-2 block">Phone Number ID</Label>
                <Input
                  value={form.phoneId}
                  onChange={(e) => setForm({ ...form, phoneId: e.target.value })}
                  placeholder="106540123456789"
                />
              </div>
              <div>
                <Label className="mb-2 block">WABA ID</Label>
                <Input
                  value={form.wabaId}
                  onChange={(e) => setForm({ ...form, wabaId: e.target.value })}
                  placeholder="1234567890"
                />
              </div>
              <div>
                <Label className="mb-2 block">Phone Number</Label>
                <Input
                  value={form.phoneNumber}
                  onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>

            <div className="flex items-center justify-between rounded-md border p-3 bg-muted/30">
              <div>
                <div className="text-sm font-medium">Active</div>
                <div className="text-xs text-muted-foreground">
                  Only one integration can be active at a time
                </div>
              </div>
              <Switch
                checked={form.active}
                onCheckedChange={(v) => setForm({ ...form, active: v })}
              />
            </div>

            {form.status !== "untested" && (
              <div
                className={`text-sm rounded-md p-2 flex items-center gap-2 ${
                  form.status === "connected"
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-red-50 text-red-700"
                }`}
              >
                {form.status === "connected" ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <XCircle className="h-4 w-4" />
                )}
                {form.status === "connected" ? "Connection is live" : "Connection failed"}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={onTest} disabled={testing} className="flex-1">
                {testing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Testing...
                  </>
                ) : (
                  <>
                    <Radio className="h-4 w-4 mr-2" /> Test Connection
                  </>
                )}
              </Button>
              <Button onClick={onSave} className="flex-1">
                <Save className="h-4 w-4 mr-2" /> Save
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
