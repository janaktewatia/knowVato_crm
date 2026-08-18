import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBots } from '../context/BotContext.jsx';
import '../flowchat.css';

export default function FlowChatDashboard() {
  const { clients = [], bots = [], addClient, deleteClient, createBot, deleteBot, duplicateBot } = useBots() || {};
  const navigate = useNavigate();

  const [activeClientId, setActiveClientId] = useState(clients[0]?.id || null);
  const [showClientModal, setShowClientModal] = useState(false);
  const [showBotModal, setShowBotModal] = useState(false);
  const [clientForm, setClientForm] = useState({ name: '', industry: '' });
  const [botName, setBotName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [openMenuBotId, setOpenMenuBotId] = useState(null);

  const activeClient = clients?.find((c) => c?.id === activeClientId) || clients?.[0];
  const clientBots = (bots || []).filter((b) => {
    if (!b) return false;
    const matchesClient = b.clientId === activeClient?.id;
    if (!matchesClient) return false;
    if (!searchQuery.trim()) return true;
    return b.name?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleCreateClient = (e) => {
    e.preventDefault();
    if (!clientForm.name.trim()) return;
    const c = addClient(clientForm.name.trim(), clientForm.industry.trim() || 'Admissions & CRM');
    setClientForm({ name: '', industry: '' });
    setShowClientModal(false);
    setActiveClientId(c.id);
  };

  const handleCreateBot = (e) => {
    e.preventDefault();
    if (!botName.trim() || !activeClient) return;
    const bot = createBot(activeClient.id, botName.trim());
    setBotName('');
    setShowBotModal(false);
    navigate(`/crm/chatbot/builder/${bot.id}`);
  };

  return (
    <div className="flowchat-dashboard" onClick={() => setOpenMenuBotId(null)}>
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h4 className="fw-bold mb-1 d-flex align-items-center gap-2">
            <span className="brand-logo" style={{ width: 32, height: 32, fontSize: 16 }}>
              <i className="bi bi-diagram-3-fill"></i>
            </span>
            Chatbot Visual Flow Builder (FlowChat Studio)
          </h4>
          <p className="text-muted small mb-0">
            Build, test in real-time phone simulator, and deploy drag-and-drop WhatsApp automation flows.
          </p>
        </div>
        <div className="d-flex align-items-center gap-2">
          <button className="btn btn-outline-secondary btn-sm rounded-pill px-3" onClick={() => setShowClientModal(true)}>
            <i className="bi bi-building me-1"></i> New Client
          </button>
          <button className="btn btn-brand btn-sm rounded-pill px-3" onClick={() => setShowBotModal(true)}>
            <i className="bi bi-plus-lg me-1"></i> New Chatbot Flow
          </button>
        </div>
      </div>

      <div className="row g-4">
        {/* Client list */}
        <div className="col-12 col-lg-3">
          <div className="fc-card p-3">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <div className="text-uppercase text-muted fw-bold" style={{ fontSize: 11, letterSpacing: '.06em' }}>
                Organizations & Clients
              </div>
              <button
                className="btn btn-sm btn-link p-0 text-decoration-none"
                onClick={() => setShowClientModal(true)}
                title="Add client"
              >
                <i className="bi bi-plus-circle"></i>
              </button>
            </div>

            {(!clients || clients.length === 0) && <div className="text-muted small p-2">No organizations yet.</div>}

            {(clients || []).map((c) => {
              if (!c) return null;
              const count = (bots || []).filter((b) => b?.clientId === c.id).length;
              const isActive = activeClient?.id === c.id;
              return (
                <div
                  key={c.id}
                  onClick={() => setActiveClientId(c.id)}
                  className={`d-flex align-items-center justify-content-between px-3 py-2 rounded-3 mb-1 transition-all ${
                    isActive ? 'bg-light border fw-semibold' : 'hover-bg-light'
                  }`}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="min-w-0 flex-grow-1 me-2">
                    <div className="text-truncate" style={{ fontSize: 13.5 }}>{c.name}</div>
                    <div className="text-muted text-truncate" style={{ fontSize: 11 }}>
                      {count} flow{count === 1 ? '' : 's'} · {c.industry}
                    </div>
                  </div>
                  {clients.length > 1 && (
                    <button
                      className="btn btn-sm text-danger p-0 opacity-50 hover-opacity-100"
                      title="Delete client"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Delete organization "${c.name}" and all its chatbot flows?`)) {
                          deleteClient(c.id);
                        }
                      }}
                    >
                      <i className="bi bi-trash3"></i>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Bots grid */}
        <div className="col-12 col-lg-9">
          {!activeClient ? (
            <div className="fc-card p-5 text-center text-muted">
              <i className="bi bi-plus-circle text-muted mb-2" style={{ fontSize: 32 }}></i>
              <p className="mb-2">Create an organization to start building chatbot flows.</p>
              <button className="btn btn-brand btn-sm rounded-pill" onClick={() => setShowClientModal(true)}>
                Add Organization
              </button>
            </div>
          ) : (
            <>
              <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
                <div>
                  <h5 className="fw-bold mb-0">{activeClient.name}</h5>
                  <div className="text-muted small">{clientBots.length} active chatbot flow(s)</div>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <div className="input-group input-group-sm" style={{ width: 220 }}>
                    <span className="input-group-text bg-white"><i className="bi bi-search"></i></span>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search flows…"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="row g-3">
                {clientBots.map((bot) => {
                  if (!bot) return null;
                  const nodeCount = Object.keys(bot.nodes || {}).length;
                  return (
                    <div className="col-12 col-md-6 col-xl-4" key={bot.id}>
                      <div className="fc-card fc-card-hover p-3 h-100 d-flex flex-column position-relative">
                        <div className="d-flex align-items-center justify-content-between mb-2">
                          <span
                            className={`badge rounded-pill ${
                              bot.status === 'live' ? 'badge-status-live' : 'badge-status-draft'
                            }`}
                            style={{ fontSize: 11 }}
                          >
                            <i className={`bi ${bot.status === 'live' ? 'bi-broadcast' : 'bi-pencil'} me-1`}></i>
                            {bot.status === 'live' ? 'Live on WhatsApp' : 'Draft Flow'}
                          </span>

                          <div className="dropdown position-relative">
                            <button
                              className="btn btn-sm btn-light py-0 px-2 border"
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenMenuBotId(openMenuBotId === bot.id ? null : bot.id);
                              }}
                            >
                              <i className="bi bi-three-dots"></i>
                            </button>
                            {openMenuBotId === bot.id && (
                              <ul
                                className="dropdown-menu dropdown-menu-end shadow-sm show"
                                style={{ display: 'block', position: 'absolute', top: '100%', right: 0, zIndex: 100 }}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <li>
                                  <button
                                    className="dropdown-item"
                                    onClick={() => {
                                      duplicateBot(bot.id);
                                      setOpenMenuBotId(null);
                                    }}
                                  >
                                    <i className="bi bi-copy me-2 text-primary"></i>Duplicate Flow
                                  </button>
                                </li>
                                <li>
                                  <button
                                    className="dropdown-item text-danger"
                                    onClick={() => {
                                      if (confirm(`Delete flow "${bot.name}"?`)) deleteBot(bot.id);
                                      setOpenMenuBotId(null);
                                    }}
                                  >
                                    <i className="bi bi-trash3 me-2"></i>Delete Flow
                                  </button>
                                </li>
                              </ul>
                            )}
                          </div>
                        </div>

                        <div className="fw-bold mb-1" style={{ fontSize: 15 }}>{bot.name}</div>
                        <div className="text-muted small mb-3">
                          <i className="bi bi-diagram-2 me-1"></i>{nodeCount} block{nodeCount === 1 ? '' : 's'} · updated{' '}
                          {new Date(bot.updatedAt || Date.now()).toLocaleDateString()}
                        </div>

                        <button
                          className="btn btn-outline-brand rounded-pill mt-auto d-flex align-items-center justify-content-center gap-1"
                          onClick={() => navigate(`/crm/chatbot/builder/${bot.id}`)}
                        >
                          <i className="bi bi-pencil-square"></i> Open Visual Builder
                        </button>
                      </div>
                    </div>
                  );
                })}

                <div className="col-12 col-md-6 col-xl-4">
                  <button
                    onClick={() => setShowBotModal(true)}
                    className="fc-card fc-card-hover w-100 h-100 border-dashed d-flex flex-column align-items-center justify-content-center py-4"
                    style={{ borderStyle: 'dashed', minHeight: 150, background: '#fafbfc' }}
                  >
                    <i className="bi bi-plus-circle text-muted" style={{ fontSize: 28 }}></i>
                    <div className="text-muted mt-2 small fw-semibold">Create New Bot Flow</div>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* New client modal */}
      {showClientModal && (
        <Modal title="New Client / Organization" onClose={() => setShowClientModal(false)}>
          <form onSubmit={handleCreateClient}>
            <label className="form-label small fw-semibold">Client / Business Name</label>
            <input
              className="form-control mb-3"
              autoFocus
              value={clientForm.name}
              onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })}
              placeholder="e.g. Greenwood International"
            />
            <label className="form-label small fw-semibold">Industry / Domain</label>
            <input
              className="form-control mb-4"
              value={clientForm.industry}
              onChange={(e) => setClientForm({ ...clientForm, industry: e.target.value })}
              placeholder="e.g. Education & Admissions"
            />
            <button className="btn btn-brand w-100 rounded-pill">Create Organization</button>
          </form>
        </Modal>
      )}

      {/* New bot modal */}
      {showBotModal && (
        <Modal title={`New Chatbot Flow for ${activeClient?.name || 'Client'}`} onClose={() => setShowBotModal(false)}>
          <form onSubmit={handleCreateBot}>
            <label className="form-label small fw-semibold">Chatbot Flow Name</label>
            <input
              className="form-control mb-4"
              autoFocus
              value={botName}
              onChange={(e) => setBotName(e.target.value)}
              placeholder="e.g. Admission Enquiry & Fee Bot"
            />
            <button className="btn btn-brand w-100 rounded-pill">Create & Open Builder</button>
          </form>
        </Modal>
      )}
    </div>
  );
}

function Modal({ title, children, onClose }) {
  return (
    <div className="modal d-block" style={{ background: 'rgba(15,23,42,.45)', zIndex: 1060 }} onClick={onClose}>
      <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content rounded-4 border-0 p-2 shadow">
          <div className="modal-header border-0">
            <h6 className="modal-title fw-bold">{title}</h6>
            <button className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body pt-0">{children}</div>
        </div>
      </div>
    </div>
  );
}
