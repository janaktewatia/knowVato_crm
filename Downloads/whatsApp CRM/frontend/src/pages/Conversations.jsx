import { useState, useEffect } from "react";
import { conversationsApi, templatesApi, leadsApi } from "../api";
import { useApi } from "../hooks/useApi";
import { useToast } from "../context/ToastContext";
import { Spinner, EmptyState, Avatar } from "../components/ui";

export default function Conversations() {
  const toast = useToast();
  const convs = useApi(() => conversationsApi.list({ perPage: 100 }), []);
  const templates = useApi(() => templatesApi.list({ status: "Approved" }), []);
  const [activeId, setActiveId] = useState(null);
  const [draft, setDraft] = useState("");

  const list = convs.data || [];
  const active = list.find((c) => c._id === activeId) || list[0];
  const windowOpen = active ? new Date(active.windowExpiresAt).getTime() > Date.now() : false;

  useEffect(() => { if (!activeId && list.length) setActiveId(list[0]._id); }, [list, activeId]);

  async function send() {
    if (!draft.trim() || !active) return;
    try {
      await conversationsApi.reply(active._id, { text: draft });
      setDraft(""); convs.reload();
    } catch (e) { toast(e.message, "error"); }
  }
  async function sendTemplate(name) {
    try { await conversationsApi.reply(active._id, { template: name }); toast("Template sent"); convs.reload(); }
    catch (e) { toast(e.message, "error"); }
  }
  async function convertToLead() {
    try { await leadsApi.convert({ name: active.name, phone: active.phone, source: undefined }); toast("Converted to lead"); }
    catch (e) { toast(e.message, "error"); }
  }

  if (convs.loading) return <Spinner />;
  if (!list.length) return <EmptyState icon="chat-dots" text="No conversations yet. In the WhatsApp Business model, customers message you first." />;

  return (
    <div className="chat-grid" style={{ margin: -20 }}>
      {/* list */}
      <div className="chat-list">
        <div className="p-2 border-bottom small text-secondary d-flex justify-content-between align-items-center">
          <span>Inbox · {list.length}</span>
          <span className="badge text-bg-light"><i className="bi bi-arrow-down-left"></i> User-initiated</span>
        </div>
        {list.map((c) => {
          const open = new Date(c.windowExpiresAt).getTime() > Date.now();
          return (
            <div key={c._id} className={"conv-item" + (active?._id === c._id ? " active" : "")} onClick={() => { setActiveId(c._id); if (c.unread) conversationsApi.markRead(c._id).then(convs.reload); }}>
              <Avatar name={c.name} size={40} />
              <div className="flex-grow-1 min-w-0">
                <div className="d-flex justify-content-between"><span className="fw-medium text-truncate">{c.name}</span><span className="text-secondary" style={{ fontSize: 10 }}>{c.lastTime}</span></div>
                <div className="text-secondary text-truncate" style={{ fontSize: 12 }}>{c.last}</div>
                <div className="mt-1">{open ? <span className="badge text-bg-success" style={{ fontSize: 9 }}>Open</span> : <span className="badge text-bg-warning" style={{ fontSize: 9 }}>Window closed</span>}{c.unread > 0 && <span className="badge text-bg-success ms-1" style={{ fontSize: 9 }}>{c.unread}</span>}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* thread */}
      <div className="chat-thread">
        {active && (
          <>
            <div className="d-flex align-items-center gap-2 p-2 bg-white border-bottom">
              <Avatar name={active.name} size={38} />
              <div className="flex-grow-1"><div className="fw-semibold">{active.name}</div><div className="text-secondary" style={{ fontSize: 11 }}>{active.phone} · {windowOpen ? <span className="text-success">window open</span> : <span className="text-warning">window closed</span>}</div></div>
              <button className="btn btn-sm btn-wa" onClick={convertToLead}><i className="bi bi-flag me-1"></i>Convert to lead</button>
            </div>

            <div className="messages">
              <div className="text-center"><span className="badge text-bg-light">Conversation started by {active.name.split(" ")[0]}</span></div>
              {(active.messages || []).map((m, i) => (
                <div key={i} className={"bubble " + (m.from === "me" ? "me" : "them")}>
                  {m.type === "template" && <div className="text-success fw-semibold mb-1" style={{ fontSize: 10 }}><i className="bi bi-file-text me-1"></i>Template · {m.template}</div>}
                  {m.text}
                  <div className="text-secondary text-end" style={{ fontSize: 9 }}>{m.time}</div>
                </div>
              ))}
            </div>

            {!windowOpen && <div className="alert alert-warning rounded-0 mb-0 py-2 small"><i className="bi bi-exclamation-triangle me-1"></i>24-hour window closed — only approved templates can be sent.</div>}

            <div className="p-2 bg-white border-top d-flex gap-2">
              <input className="form-control" placeholder={windowOpen ? "Type a message" : "Window closed — use a template"} value={draft} disabled={!windowOpen} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} />
              <div className="dropdown">
                <button className="btn btn-outline-secondary dropdown-toggle" data-bs-toggle="dropdown" title="Send template"><i className="bi bi-file-text"></i></button>
                <ul className="dropdown-menu dropdown-menu-end">
                  {(templates.data || []).map((t) => <li key={t._id}><button className="dropdown-item small" onClick={() => sendTemplate(t.name)}>{t.name}</button></li>)}
                </ul>
              </div>
              <button className="btn btn-wa" disabled={!windowOpen} onClick={send}><i className="bi bi-send"></i></button>
            </div>
          </>
        )}
      </div>

      {/* details */}
      <div className="chat-aside p-3">
        {active && (
          <>
            <div className="text-center mb-3"><Avatar name={active.name} size={64} /><div className="fw-semibold mt-2">{active.name}</div><div className="text-secondary small">{active.phone}</div></div>
            <dl className="row small">
              <dt className="col-5 text-secondary fw-normal">Started by</dt><dd className="col-7">{active.name.split(" ")[0]}</dd>
              <dt className="col-5 text-secondary fw-normal">Window</dt><dd className="col-7">{windowOpen ? "Open" : "Closed"}</dd>
              <dt className="col-5 text-secondary fw-normal">Assigned</dt><dd className="col-7">{active.assigned || "—"}</dd>
              <dt className="col-5 text-secondary fw-normal">Category</dt><dd className="col-7">{active.category || "—"}</dd>
            </dl>
          </>
        )}
      </div>
    </div>
  );
}
