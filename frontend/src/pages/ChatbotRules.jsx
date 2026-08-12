import { useState } from "react";
import { chatbotApi, templatesApi, mastersApi } from "../api";
import { useApi } from "../hooks/useApi";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { PageHeader, ErrorBox, DataTable, Modal, Tabs } from "../components/ui";

export default function ChatbotRules() {
  const { can } = useAuth();
  const list = useApi(() => chatbotApi.list(), []);
  const templates = useApi(() => templatesApi.list({ status: "Approved" }), []);
  const statuses = useApi(() => mastersApi.statuses(), []);
  const [creating, setCreating] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [testing, setTesting] = useState(false);

  const rows = list.data || [];

  async function toggleRule(rule) {
    try {
      await chatbotApi.update(rule._id, { active: !rule.active });
      list.reload();
    } catch (e) {
      alert(e.message);
    }
  }

  async function deleteRule(id) {
    if (!confirm("Are you sure you want to delete this chatbot rule?")) return;
    try {
      await chatbotApi.remove(id);
      list.reload();
    } catch (e) {
      alert(e.message);
    }
  }

  const columns = [
    {
      key: "active",
      label: "Status",
      render: (r) => (
        <div className="form-check form-switch">
          <input
            className="form-check-input"
            type="checkbox"
            checked={r.active}
            onChange={() => toggleRule(r)}
          />
        </div>
      ),
    },
    {
      key: "name",
      label: "Rule Name",
      render: (r) => <span className="fw-semibold">{r.name}</span>,
    },
    {
      key: "triggerType",
      label: "Trigger",
      render: (r) => (
        <div>
          <span className="badge bg-secondary text-capitalize me-1">{r.triggerType}</span>
          {r.keywords && r.keywords.length > 0 && (
            <span className="small text-muted">({r.keywords.join(", ")})</span>
          )}
        </div>
      ),
    },
    {
      key: "actionType",
      label: "Action",
      render: (r) => (
        <span className="pill" style={{ background: "var(--accent-soft)", color: "var(--accent-ink)" }}>
          <i className="bi bi-robot me-1"></i>
          {r.actionType.replace("_", " ")}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (r) => (
        <div className="d-flex gap-2">
          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={() => setEditingRule(r)}
          >
            <i className="bi bi-pencil me-1"></i>Edit
          </button>
          <button
            className="btn btn-sm btn-outline-danger"
            onClick={() => deleteRule(r._id)}
          >
            <i className="bi bi-trash"></i>
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="WhatsApp Chatbot & Automation Rules"
        subtitle="Configure automated keyword triggers, interactive button replies, template responses, and CRM actions"
        actions={
          <div className="d-flex gap-2">
            <button className="btn btn-outline-secondary btn-sm" onClick={() => setTesting(true)}>
              <i className="bi bi-play-circle me-1"></i>Test Bot Simulator
            </button>
            {can("setup", "create") && (
              <button className="btn btn-wa btn-sm" onClick={() => setCreating(true)}>
                <i className="bi bi-plus-lg me-1"></i>New Chatbot Rule
              </button>
            )}
          </div>
        }
      />
      <ErrorBox error={list.error} />
      <DataTable
        columns={columns}
        rows={rows}
        loading={list.loading}
        empty={{ icon: "robot", text: "No chatbot rules configured." }}
      />

      {(creating || editingRule) && (
        <RuleModal
          rule={editingRule}
          templates={templates.data || []}
          statuses={statuses.data || []}
          onClose={() => {
            setCreating(false);
            setEditingRule(null);
          }}
          onSaved={() => {
            setCreating(false);
            setEditingRule(null);
            list.reload();
          }}
        />
      )}

      {testing && <BotSimulatorModal onClose={() => setTesting(false)} />}
    </div>
  );
}

function RuleModal({ rule, templates, statuses, onClose, onSaved }) {
  const toast = useToast();
  const [form, setForm] = useState(
    rule || {
      name: "",
      triggerType: "keyword",
      keywords: ["fee"],
      matchType: "contains",
      actionType: "send_text",
      actionPayload: {
        text: "",
        templateName: "",
        buttons: [
          { id: "btn1", title: "Yes" },
          { id: "btn2", title: "No" },
        ],
        counsellorName: "Priya Kothari",
        followupNote: "Bot auto follow-up",
        followupDays: 1,
      },
      active: true,
      order: 1,
    }
  );

  const [keywordsStr, setKeywordsStr] = useState(
    (form.keywords || []).join(", ")
  );

  const setPayload = (k, v) =>
    setForm((f) => ({
      ...f,
      actionPayload: { ...f.actionPayload, [k]: v },
    }));

  async function save() {
    try {
      const payload = {
        ...form,
        keywords: keywordsStr
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      };
      if (rule?._id) {
        await chatbotApi.update(rule._id, payload);
        toast("Chatbot rule updated");
      } else {
        await chatbotApi.create(payload);
        toast("Chatbot rule created");
      }
      onSaved();
    } catch (e) {
      toast(e.message, "error");
    }
  }

  return (
    <Modal
      title={rule ? "Edit Chatbot Rule" : "New Chatbot Rule"}
      onClose={onClose}
      footer={
        <>
          <button className="btn btn-outline-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-wa" disabled={!form.name} onClick={save}>
            Save Rule
          </button>
        </>
      }
    >
      <div className="row g-3">
        <div className="col-8">
          <label className="form-label fw-semibold">Rule Name</label>
          <input
            className="form-control"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. Fee Inquiry Bot"
          />
        </div>
        <div className="col-4">
          <label className="form-label fw-semibold">Priority Order</label>
          <input
            type="number"
            className="form-control"
            value={form.order}
            onChange={(e) => setForm({ ...form, order: +e.target.value })}
          />
        </div>

        <div className="col-6">
          <label className="form-label fw-semibold">Trigger Type</label>
          <select
            className="form-select"
            value={form.triggerType}
            onChange={(e) => setForm({ ...form, triggerType: e.target.value })}
          >
            <option value="keyword">Keyword Match</option>
            <option value="button_click">Interactive Button Click</option>
            <option value="list_selection">List Menu Selection</option>
            <option value="default">Default Fallback Greeting</option>
          </select>
        </div>

        {form.triggerType !== "default" && (
          <div className="col-6">
            <label className="form-label fw-semibold">Match Logic</label>
            <select
              className="form-select"
              value={form.matchType}
              onChange={(e) => setForm({ ...form, matchType: e.target.value })}
            >
              <option value="contains">Contains Keyword</option>
              <option value="exact">Exact Match</option>
              <option value="starts_with">Starts With</option>
              <option value="regex">Regex Match</option>
            </select>
          </div>
        )}

        {form.triggerType !== "default" && (
          <div className="col-12">
            <label className="form-label fw-semibold">Keywords / Button IDs (Comma-separated)</label>
            <input
              className="form-control"
              value={keywordsStr}
              onChange={(e) => setKeywordsStr(e.target.value)}
              placeholder="e.g. fee, fees, cost, pricing"
            />
          </div>
        )}

        <div className="col-12 border-top pt-3 mt-3">
          <label className="form-label fw-bold">Bot Action</label>
          <select
            className="form-select mb-3"
            value={form.actionType}
            onChange={(e) => setForm({ ...form, actionType: e.target.value })}
          >
            <option value="send_text">Send Automated Text Response</option>
            <option value="send_buttons">Send Interactive Quick Reply Buttons</option>
            <option value="send_template">Send Meta WhatsApp Template</option>
            <option value="update_status">Update Lead Pipeline Status</option>
            <option value="assign_counsellor">Assign Lead to Counsellor</option>
            <option value="create_followup">Create Follow-up Task</option>
          </select>

          {/* Action Specific Fields */}
          {form.actionType === "send_text" && (
            <div>
              <label className="form-label">Auto-Reply Text</label>
              <textarea
                className="form-control"
                rows={3}
                value={form.actionPayload?.text || ""}
                onChange={(e) => setPayload("text", e.target.value)}
                placeholder="Type the message the bot will send..."
              />
            </div>
          )}

          {form.actionType === "send_buttons" && (
            <div>
              <label className="form-label">Message Text</label>
              <textarea
                className="form-control mb-2"
                rows={2}
                value={form.actionPayload?.text || ""}
                onChange={(e) => setPayload("text", e.target.value)}
                placeholder="Header body text above buttons..."
              />
              <label className="form-label">Interactive Buttons (Up to 3)</label>
              {(form.actionPayload?.buttons || []).map((btn, idx) => (
                <div className="d-flex gap-2 mb-2" key={idx}>
                  <input
                    className="form-control form-control-sm"
                    placeholder="Button Title (e.g. View Fees)"
                    value={btn.title}
                    onChange={(e) => {
                      const newBtns = [...(form.actionPayload?.buttons || [])];
                      newBtns[idx] = { ...btn, title: e.target.value, id: e.target.value.toLowerCase().replace(/[^a-z0-9]/g, "_") };
                      setPayload("buttons", newBtns);
                    }}
                  />
                </div>
              ))}
            </div>
          )}

          {form.actionType === "send_template" && (
            <div>
              <label className="form-label">Select Meta Approved Template</label>
              <select
                className="form-select"
                value={form.actionPayload?.templateName || ""}
                onChange={(e) => setPayload("templateName", e.target.value)}
              >
                <option value="">Select template...</option>
                {templates.map((t) => (
                  <option key={t._id} value={t.name}>
                    {t.name} ({t.category})
                  </option>
                ))}
              </select>
            </div>
          )}

          {form.actionType === "update_status" && (
            <div>
              <label className="form-label">Move Lead to Status</label>
              <select
                className="form-select"
                value={form.actionPayload?.statusId || ""}
                onChange={(e) => setPayload("statusId", e.target.value)}
              >
                <option value="">Select status...</option>
                {statuses.map((st) => (
                  <option key={st._id} value={st._id}>
                    {st.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {form.actionType === "assign_counsellor" && (
            <div>
              <label className="form-label">Counsellor Name</label>
              <input
                className="form-control"
                value={form.actionPayload?.counsellorName || ""}
                onChange={(e) => setPayload("counsellorName", e.target.value)}
                placeholder="Priya Kothari"
              />
            </div>
          )}

          {form.actionType === "create_followup" && (
            <div className="row g-2">
              <div className="col-8">
                <label className="form-label">Follow-up Task Note</label>
                <input
                  className="form-control"
                  value={form.actionPayload?.followupNote || ""}
                  onChange={(e) => setPayload("followupNote", e.target.value)}
                  placeholder="Bot triggered call"
                />
              </div>
              <div className="col-4">
                <label className="form-label">Due Days</label>
                <input
                  type="number"
                  className="form-control"
                  value={form.actionPayload?.followupDays || 1}
                  onChange={(e) => setPayload("followupDays", +e.target.value)}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}

function BotSimulatorModal({ onClose }) {
  const [messageText, setMessageText] = useState("");
  const [history, setHistory] = useState([
    { sender: "bot", text: "🤖 Chatbot Engine Test Console. Type 'FEE' or 'ADMISSION' to test automated flows." },
  ]);

  async function sendTest() {
    if (!messageText.trim()) return;
    const txt = messageText;
    setMessageText("");
    setHistory((h) => [...h, { sender: "user", text: txt }]);

    try {
      await chatbotApi.test({ messageText: txt });
      setHistory((h) => [
        ...h,
        { sender: "bot", text: `✓ Bot rule executed for "${txt}". Check chat room or database for auto-reply.` },
      ]);
    } catch (e) {
      setHistory((h) => [...h, { sender: "bot", text: `❌ Error: ${e.message}` }]);
    }
  }

  return (
    <Modal title="Interactive Chatbot Test Console" onClose={onClose}>
      <div
        className="p-3 border rounded mb-3 overflow-auto"
        style={{ height: 260, background: "var(--surface-2)" }}
      >
        {history.map((item, idx) => (
          <div
            key={idx}
            className={`d-flex mb-2 ${
              item.sender === "user" ? "justify-content-end" : "justify-content-start"
            }`}
          >
            <div
              className={`p-2 rounded ${
                item.sender === "user"
                  ? "bg-primary text-white"
                  : "bg-white border text-dark"
              }`}
              style={{ maxWidth: "80%", fontSize: 13 }}
            >
              {item.text}
            </div>
          </div>
        ))}
      </div>
      <div className="d-flex gap-2">
        <input
          className="form-control"
          placeholder="Type 'FEE', 'ADMISSION', or any message..."
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendTest()}
        />
        <button className="btn btn-wa" onClick={sendTest}>
          Send
        </button>
      </div>
    </Modal>
  );
}
