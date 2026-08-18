import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBots } from '../context/BotContext.jsx';
import NodePalette from '../components/NodePalette.jsx';
import FlowCanvas from '../components/FlowCanvas.jsx';
import NodeConfigPanel from '../components/NodeConfigPanel.jsx';
import WhatsAppPreview from '../components/WhatsAppPreview.jsx';
import MetaSettingsModal from '../components/MetaSettingsModal.jsx';
import '../flowchat.css';

export default function BotBuilder() {
  const { botId } = useParams();
  const navigate = useNavigate();
  const { bots, updateBotMeta } = useBots() || {};
  const bot = bots?.find((b) => b.id === botId);

  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [connectingFrom, setConnectingFrom] = useState(null); // { nodeId, outputKey }
  const [showSettings, setShowSettings] = useState(false);
  const [nameDraft, setNameDraft] = useState(bot?.name || '');
  const [editingName, setEditingName] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [showPalette, setShowPalette] = useState(true);

  if (!bot) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center vh-100 bg-light">
        <div className="text-center p-5 bg-white rounded-4 shadow-sm" style={{ maxWidth: 450 }}>
          <i className="bi bi-robot text-muted mb-3" style={{ fontSize: 42 }}></i>
          <h5 className="fw-bold">Chatbot Flow Not Found</h5>
          <p className="text-muted mb-4">This chatbot flow may have been deleted or doesn't exist.</p>
          <button className="btn btn-brand rounded-pill px-4" onClick={() => navigate('/crm/chatbot')}>
            <i className="bi bi-arrow-left me-1"></i> Return to Chatbot Studio
          </button>
        </div>
      </div>
    );
  }

  const isPublished = bot.status === 'live';

  const commitName = () => {
    if (nameDraft.trim() && !isPublished) updateBotMeta(bot.id, { name: nameDraft.trim() });
    setEditingName(false);
  };

  return (
    <div className="builder-shell">
      {/* Top bar */}
      <div className="builder-topbar">
        <button
          className="btn btn-light rounded-circle me-3 border"
          onClick={() => navigate('/crm/chatbot')}
          title="Back to Chatbot List"
        >
          <i className="bi bi-arrow-left"></i>
        </button>

        {editingName && !isPublished ? (
          <input
            className="form-control form-control-sm fw-bold"
            style={{ width: 260 }}
            autoFocus
            value={nameDraft}
            onChange={(e) => setNameDraft(e.target.value)}
            onBlur={commitName}
            onKeyDown={(e) => e.key === 'Enter' && commitName()}
          />
        ) : (
          <div
            className="fw-bold d-flex align-items-center"
            style={{ fontSize: 16, cursor: isPublished ? 'default' : 'pointer' }}
            onClick={() => {
              if (!isPublished) {
                setNameDraft(bot.name);
                setEditingName(true);
              }
            }}
            title={isPublished ? 'Flow is published' : 'Click to rename'}
          >
            {bot.name}
            {!isPublished && <i className="bi bi-pencil-fill text-muted ms-2" style={{ fontSize: 11 }}></i>}
          </div>
        )}

        <span className={`badge rounded-pill ms-3 ${isPublished ? 'badge-status-live' : 'badge-status-draft'}`}>
          <i className={`bi ${isPublished ? 'bi-broadcast' : 'bi-pencil'} me-1`}></i>
          {isPublished ? 'Live on WhatsApp' : 'Draft Flow'}
        </span>

        {isPublished && (
          <span className="badge bg-secondary-subtle text-secondary border ms-2 small d-none d-sm-inline">
            <i className="bi bi-lock-fill me-1"></i>Read-Only
          </span>
        )}

        {/* View toggles */}
        <div className="d-none d-md-flex align-items-center gap-1 ms-4 border-start ps-3">
          <button
            className={`btn btn-sm rounded-pill px-3 ${showPalette ? 'btn-light border fw-semibold' : 'btn-outline-secondary'}`}
            onClick={() => setShowPalette(!showPalette)}
            title="Toggle block palette"
          >
            <i className="bi bi-grid-fill me-1"></i> Palette
          </button>
          <button
            className={`btn btn-sm rounded-pill px-3 ${showPreview ? 'btn-light border fw-semibold' : 'btn-outline-secondary'}`}
            onClick={() => setShowPreview(!showPreview)}
            title="Toggle WhatsApp Phone Simulator"
          >
            <i className="bi bi-phone-fill me-1"></i> Live Phone
          </button>
        </div>

        <div className="ms-auto d-flex align-items-center gap-2">
          <button className="btn btn-outline-secondary btn-sm rounded-pill" onClick={() => setShowSettings(true)}>
            <i className="bi bi-gear me-1"></i> Meta API
          </button>

          {isPublished ? (
            <button
              className="btn btn-sm btn-outline-warning text-dark rounded-pill px-3 fw-semibold border-warning"
              onClick={() => updateBotMeta(bot.id, { status: 'draft' })}
              title="Switch to Draft mode to edit blocks and properties"
            >
              <i className="bi bi-pencil-square me-1"></i> Switch to Draft to Edit
            </button>
          ) : (
            <button
              className="btn btn-sm btn-brand rounded-pill px-3 fw-semibold shadow-xs"
              onClick={() => updateBotMeta(bot.id, { status: 'live' })}
              title="Publish flow to WhatsApp"
            >
              <i className="bi bi-broadcast me-1"></i> Publish Live Flow
            </button>
          )}
        </div>
      </div>

      {/* Body: palette | canvas | config | preview */}
      <div className="builder-body">
        {showPalette && <NodePalette readOnly={isPublished} />}
        <FlowCanvas
          bot={bot}
          selectedNodeId={selectedNodeId}
          setSelectedNodeId={setSelectedNodeId}
          connectingFrom={connectingFrom}
          setConnectingFrom={setConnectingFrom}
          readOnly={isPublished}
        />
        <NodeConfigPanel
          bot={bot}
          selectedNodeId={selectedNodeId}
          setSelectedNodeId={setSelectedNodeId}
          connectingFrom={connectingFrom}
          setConnectingFrom={setConnectingFrom}
          readOnly={isPublished}
        />
        {showPreview && <WhatsAppPreview bot={bot} />}
      </div>

      {showSettings && <MetaSettingsModal bot={bot} onClose={() => setShowSettings(false)} />}
    </div>
  );
}
