import { useState } from "react";
import { useApi } from "../hooks/useApi";
import { useToast } from "../context/ToastContext";
import { templatesApi, messagesApi } from "../api";
import { Spinner } from "./ui";

export default function MessagingSlider({ lead, onClose }) {
  const toast = useToast();
  const templates = useApi(() => templatesApi.list({ status: "Approved" }), []);
  const [channel, setChannel] = useState("whatsapp");
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [customText, setCustomText] = useState("");
  const [sending, setSending] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
  };

  const channelTemplates = (templates.data || []).filter((t) => (t.channel || "whatsapp") === channel);

  const selectedTpl = channelTemplates.find((t) => t.name === selectedTemplate);
  const messageContent = selectedTemplate ? (selectedTpl?.body || "") : customText;

  async function sendMessage() {
    setSending(true);
    try {
      const to = channel === "email" ? lead.email : lead.phone;
      if (!to) throw new Error(`Lead has no ${channel === "email" ? "email" : "phone"}`);
      
      await messagesApi.send({
        channel,
        to,
        template: selectedTemplate || undefined,
        text: customText || undefined
      });
      
      toast(`${channel === "email" ? "Email" : channel === "sms" ? "SMS" : "WhatsApp"} sent successfully`);
      setSelectedTemplate("");
      setCustomText("");
    } catch (e) {
      toast(e.message, "error");
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <div className="offcanvas-backdrop fade show" onClick={handleClose}></div>
      <div
        className="offcanvas offcanvas-end show"
        style={{
          visibility: "visible",
          width: 550,
          animation: isClosing ? "slideOutRight 0.5s ease-out forwards" : "slideInRight 0.5s ease-out"
        }}
        onAnimationEnd={() => isClosing && onClose()}
      >
        <div className="offcanvas-header border-bottom">
          <h5 className="offcanvas-title">Send Message</h5>
          <button className="btn-close" onClick={handleClose}></button>
        </div>

        <div className="offcanvas-body d-flex flex-column" style={{ height: "calc(100vh - 100px)" }}>
          {/* Lead Info */}
          <div className="mb-3 pb-3 border-bottom">
            <div style={{ fontSize: 12, color: "var(--text-2)", textTransform: "uppercase", marginBottom: 8 }}>To</div>
            <div className="fw-semibold">{lead.name}</div>
            <div className="text-muted small">{lead.phone}{lead.email ? " · " + lead.email : ""}</div>
          </div>

          {/* Channel Selector */}
          <div className="mb-3">
            <div style={{ fontSize: 12, color: "var(--text-2)", textTransform: "uppercase", marginBottom: 8 }}>Channel</div>
            <div className="btn-group w-100" role="group">
              <input type="radio" className="btn-check" name="channel" id="ch-wa" value="whatsapp" checked={channel === "whatsapp"} onChange={(e) => { setChannel(e.target.value); setSelectedTemplate(""); }} />
              <label className="btn btn-outline-secondary btn-sm" htmlFor="ch-wa">
                <i className="bi bi-chat-dots me-1"></i>WhatsApp
              </label>

              <input type="radio" className="btn-check" name="channel" id="ch-sms" value="sms" checked={channel === "sms"} onChange={(e) => { setChannel(e.target.value); setSelectedTemplate(""); }} />
              <label className="btn btn-outline-secondary btn-sm" htmlFor="ch-sms">
                <i className="bi bi-chat-left-text me-1"></i>SMS
              </label>

              <input type="radio" className="btn-check" name="channel" id="ch-email" value="email" checked={channel === "email"} onChange={(e) => { setChannel(e.target.value); setSelectedTemplate(""); }} />
              <label className="btn btn-outline-secondary btn-sm" htmlFor="ch-email">
                <i className="bi bi-envelope me-1"></i>Email
              </label>
            </div>
          </div>

          {/* Template Selector */}
          <div className="mb-3">
            <div style={{ fontSize: 12, color: "var(--text-2)", textTransform: "uppercase", marginBottom: 8 }}>Template</div>
            <select
              className="form-select form-select-sm"
              value={selectedTemplate}
              onChange={(e) => {
                setSelectedTemplate(e.target.value);
                if (e.target.value) setCustomText("");
              }}
            >
              <option value="">Custom message</option>
              {channelTemplates.map((t) => (
                <option key={t._id} value={t.name}>{t.name}</option>
              ))}
            </select>
          </div>

          {/* Message Content */}
          <div className="mb-3 flex-grow-1">
            <div style={{ fontSize: 12, color: "var(--text-2)", textTransform: "uppercase", marginBottom: 8 }}>Message</div>
            {selectedTemplate ? (
              <div className="p-3 border rounded" style={{ background: "var(--surface-2)", minHeight: 100, whiteSpace: "pre-wrap", fontSize: 13 }}>
                {messageContent}
              </div>
            ) : (
              <textarea
                className="form-control"
                rows={5}
                placeholder="Type your message..."
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                style={{ fontSize: 13 }}
              />
            )}
          </div>

          {/* Send Button */}
          <div className="mb-3">
            <button
              className="btn btn-primary w-100"
              disabled={sending || !messageContent.trim()}
              onClick={sendMessage}
            >
              {sending && <span className="spinner-border spinner-border-sm me-2" />}
              <i className="bi bi-send me-1"></i>
              Send
            </button>
          </div>

          {/* Message History */}
          <div className="border-top pt-3">
            <div style={{ fontSize: 12, color: "var(--text-2)", textTransform: "uppercase", marginBottom: 12 }}>History</div>
            <div style={{ maxHeight: 200, overflowY: "auto" }}>
              <div className="text-muted small text-center py-3">
                <i className="bi bi-inbox me-1"></i>No messages sent yet
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
