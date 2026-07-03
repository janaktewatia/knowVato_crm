import { useEffect, useState, useRef } from "react";
import api from "../api/client";

// Floating chatbot widget for the public site. Fetches config by slug.
export default function ChatWidget({ slug }) {
  const [cfg, setCfg] = useState(null);
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const endRef = useRef();

  useEffect(() => {
    api.get(`/chatbot/public/${slug}/config`).then((r) => {
      if (r.data.enabled) { setCfg(r.data); setMessages([{ from: "bot", text: r.data.greeting }]); }
    }).catch(() => {});
  }, [slug]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, open]);

  if (!cfg) return null;
  const color = cfg.color || "#1d4ed8";

  const send = async () => {
    const text = input.trim();
    if (!text) return;
    setMessages((m) => [...m, { from: "user", text }]);
    setInput(""); setSending(true);
    try {
      const r = await api.post(`/chatbot/public/${slug}/ask`, { message: text });
      setMessages((m) => [...m, { from: "bot", text: r.data.reply }]);
    } catch {
      setMessages((m) => [...m, { from: "bot", text: "Something went wrong." }]);
    } finally { setSending(false); }
  };

  return (
    <div style={{ position: "fixed", bottom: 20, right: 20, zIndex: 1050 }}>
      {open && (
        <div className="card shadow" style={{ width: 320, height: 420, marginBottom: 12, borderRadius: 16, overflow: "hidden" }}>
          <div style={{ background: color }} className="text-white p-3 d-flex justify-content-between align-items-center">
            <span className="fw-semibold"><i className="bi bi-robot me-2" />{cfg.botName}</span>
            <button className="btn btn-sm text-white p-0" onClick={() => setOpen(false)}><i className="bi bi-dash-lg" /></button>
          </div>
          <div className="flex-grow-1 p-3 overflow-auto" style={{ background: "#f7f9fc" }}>
            {messages.map((m, i) => (
              <div key={i} className={`d-flex mb-2 ${m.from === "user" ? "justify-content-end" : "justify-content-start"}`}>
                <div className="px-3 py-2 rounded-3 small" style={{ maxWidth: "80%", background: m.from === "user" ? color : "#fff", color: m.from === "user" ? "#fff" : "#222", border: m.from === "bot" ? "1px solid #e3e8f0" : "none" }}>
                  {m.text}
                </div>
              </div>
            ))}
            {sending && <div className="text-muted small"><i className="bi bi-three-dots" /> typing...</div>}
            <div ref={endRef} />
          </div>
          <div className="p-2 border-top bg-white d-flex gap-2">
            <input className="form-control form-control-sm" placeholder="Type a message..." value={input}
              onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} />
            <button className="btn btn-sm" style={{ background: color, color: "#fff" }} onClick={send} disabled={sending}><i className="bi bi-send" /></button>
          </div>
        </div>
      )}
      <button onClick={() => setOpen((o) => !o)} className="btn shadow d-flex align-items-center justify-content-center"
        style={{ background: color, color: "#fff", width: 56, height: 56, borderRadius: "50%", marginLeft: "auto" }}>
        <i className={`bi ${open ? "bi-x-lg" : "bi-chat-dots-fill"} fs-5`} />
      </button>
    </div>
  );
}
