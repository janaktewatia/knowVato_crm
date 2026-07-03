import { useEffect, useState } from "react";
import api from "../api/client";
import PageHeader from "../components/PageHeader";
import EmptyState from "../components/EmptyState";
import Loader from "../components/Loader";

export default function Chatbot() {
  const [websites, setWebsites] = useState([]);
  const [siteId, setSiteId] = useState("");
  const [bot, setBot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.get("/websites", { params: { limit: 100 } }).then((r) => {
      setWebsites(r.data.items);
      if (r.data.items[0]) setSiteId(r.data.items[0]._id);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!siteId) return;
    api.get(`/chatbot/admin/${siteId}`).then((r) => setBot(r.data));
  }, [siteId]);

  const save = async () => {
    const r = await api.put(`/chatbot/admin/${siteId}`, bot);
    setBot(r.data); setSaved(true); setTimeout(() => setSaved(false), 1500);
  };

  const setRule = (i, field, val) => {
    const rules = [...bot.rules];
    rules[i] = { ...rules[i], [field]: field === "keywords" ? val.split(",").map((k) => k.trim()).filter(Boolean) : val };
    setBot({ ...bot, rules });
  };
  const addRule = () => setBot({ ...bot, rules: [...bot.rules, { keywords: [], answer: "" }] });
  const removeRule = (i) => setBot({ ...bot, rules: bot.rules.filter((_, j) => j !== i) });

  if (loading) return <Loader />;
  if (websites.length === 0) return (<><PageHeader icon="bi-robot" title="Chatbot" /><EmptyState icon="bi-globe2" title="No websites" text="Create a website first." /></>);
  if (!bot) return <Loader />;

  return (
    <>
      <PageHeader icon="bi-robot" title="Chatbot" subtitle="Answer visitor queries automatically">
        <select className="form-select" style={{ maxWidth: 220 }} value={siteId} onChange={(e) => setSiteId(e.target.value)}>
          {websites.map((w) => <option key={w._id} value={w._id}>{w.name}</option>)}
        </select>
        <button className="btn btn-primary" onClick={save}><i className="bi bi-save me-1" />Save</button>
      </PageHeader>
      {saved && <div className="alert alert-success py-2"><i className="bi bi-check-circle me-1" />Chatbot saved</div>}

      <div className="row g-3">
        <div className="col-lg-5">
          <div className="card stat-card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <span><i className="bi bi-gear me-1" />Settings</span>
              <div className="form-check form-switch m-0"><input className="form-check-input" type="checkbox" checked={bot.enabled} onChange={(e) => setBot({ ...bot, enabled: e.target.checked })} id="be" /><label className="form-check-label small" htmlFor="be">Enabled</label></div>
            </div>
            <div className="card-body">
              <div className="mb-2"><label className="form-label small">Bot Name</label><input className="form-control" value={bot.botName} onChange={(e) => setBot({ ...bot, botName: e.target.value })} /></div>
              <div className="mb-2"><label className="form-label small">Greeting message</label><textarea className="form-control" rows="2" value={bot.greeting} onChange={(e) => setBot({ ...bot, greeting: e.target.value })} /></div>
              <div className="mb-2"><label className="form-label small">Fallback (when no match)</label><textarea className="form-control" rows="2" value={bot.fallback} onChange={(e) => setBot({ ...bot, fallback: e.target.value })} /></div>
              <div className="mb-0"><label className="form-label small">Theme color</label><input type="color" className="form-control form-control-color" value={bot.color} onChange={(e) => setBot({ ...bot, color: e.target.value })} /></div>
            </div>
          </div>
        </div>

        <div className="col-lg-7">
          <div className="card stat-card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <span><i className="bi bi-chat-dots me-1" />Q&A Rules</span>
              <button className="btn btn-sm btn-outline-primary" onClick={addRule}><i className="bi bi-plus-lg me-1" />Add Rule</button>
            </div>
            <div className="card-body">
              {bot.rules.length === 0 && <p className="small text-muted">Add rules: if a visitor's message contains any keyword, the bot replies with the answer.</p>}
              {bot.rules.map((rule, i) => (
                <div className="border rounded p-2 mb-2 bg-light" key={i}>
                  <div className="d-flex justify-content-between mb-1"><span className="small fw-semibold">Rule {i + 1}</span>
                    <button className="btn btn-sm btn-light py-0 text-danger" onClick={() => removeRule(i)}><i className="bi bi-trash" /></button></div>
                  <div className="mb-2"><label className="form-label small mb-0">Keywords (comma separated)</label>
                    <input className="form-control form-control-sm" value={(rule.keywords || []).join(", ")} onChange={(e) => setRule(i, "keywords", e.target.value)} placeholder="price, cost, pricing" /></div>
                  <div><label className="form-label small mb-0">Answer</label>
                    <textarea className="form-control form-control-sm" rows="2" value={rule.answer} onChange={(e) => setRule(i, "answer", e.target.value)} /></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
