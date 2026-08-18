import React from 'react';
import { useBots } from '../context/BotContext.jsx';
import { NODE_TYPES } from '../data/nodeTypes';
import { uid } from '../utils/id';

export default function NodeConfigPanel({
  bot,
  selectedNodeId,
  setSelectedNodeId,
  connectingFrom,
  setConnectingFrom,
  readOnly = false,
}) {
  const { bots = [], forms = [], updateNodeData, deleteNode, setConnection } = useBots() || {};
  const node = selectedNodeId && bot?.nodes ? bot.nodes[selectedNodeId] : null;

  if (!node) {
    return (
      <div className="config-panel">
        <div className="text-center text-muted mt-5 pt-5">
          <i className="bi bi-cursor-fill" style={{ fontSize: 28 }}></i>
          <p className="mt-3 mb-1 fw-semibold">No block selected</p>
          <p className="small">Click any block on the canvas to edit its properties.</p>
        </div>
        <VariablesHelp bot={bot} />
      </div>
    );
  }

  const def = NODE_TYPES[node.type] || { label: 'Node', color: '#64748b', icon: 'bi-box', description: '' };
  const patch = (data) => !readOnly && updateNodeData(bot.id, node.id, data);
  const otherNodes = Object.values(bot?.nodes || {}).filter((n) => n && n.id !== node.id);

  // Compute outputs dynamically
  let outputs = [];
  if (def.outputs === 'dynamic') {
    outputs = (node.data?.buttons || []).map((b) => ({ key: b.id || b.label, label: b.label || 'Option' }));
  } else if (def.outputs === 'dynamic_condition') {
    const branches = (node.data?.branches || []).map((b, i) => ({
      key: b.id || `branch_${i}`,
      label: b.label || `Branch ${i + 1}`,
    }));
    outputs = [...branches, { key: 'else', label: node.data?.elseLabel || 'Default (Else)' }];
  } else {
    outputs = def.outputs || [];
  }

  return (
    <div className="config-panel">
      {/* Read-Only Notice */}
      {readOnly && (
        <div className="alert alert-warning py-2 px-3 mb-3 d-flex align-items-center gap-2 small">
          <i className="bi bi-lock-fill text-warning"></i>
          <div>
            <strong>Published Flow (Locked)</strong>
            <div style={{ fontSize: 11 }}>Switch to Draft in topbar to edit properties.</div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="d-flex align-items-center gap-2 mb-1">
        <div className="palette-icon" style={{ background: def.color || '#64748b', width: 30, height: 30, fontSize: 13 }}>
          <i className={`bi ${def.icon || 'bi-box'}`}></i>
        </div>
        <div className="fw-bold">{def.label}</div>
        {node.id !== bot.startNodeId && !readOnly && (
          <button
            className="btn btn-sm btn-outline-danger ms-auto rounded-pill"
            onClick={() => {
              deleteNode(bot.id, node.id);
              setSelectedNodeId(null);
            }}
            title="Delete block"
          >
            <i className="bi bi-trash3"></i>
          </button>
        )}
      </div>
      <p className="text-muted small mb-3">{def.description}</p>
      <hr className="my-2" />

      {/* Field Editors */}
      <fieldset disabled={readOnly}>
        {/* START BLOCK */}
        {node.type === 'start' && (
          <>
            <Label>Trigger Keywords</Label>
            <input
              className="form-control mb-1"
              placeholder="hi, hello, start, enquiry"
              value={(node.data?.keywords || []).join(', ')}
              onChange={(e) => patch({ keywords: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })}
            />
            <HelpText>Type comma-separated keywords. Leave empty to trigger on ANY message.</HelpText>
          </>
        )}

        {/* MESSAGE BLOCK */}
        {node.type === 'message' && (
          <>
            <Label>Message Text</Label>
            <textarea
              className="form-control mb-1"
              rows={5}
              value={node.data?.text || ''}
              onChange={(e) => patch({ text: e.target.value })}
            />
            <HelpText>
              Insert saved variables using <code className="inline-var">{'{{variable_name}}'}</code> or <code className="inline-var">{'{{api_response.title}}'}</code>.
            </HelpText>
          </>
        )}

        {/* BUTTONS BLOCK */}
        {node.type === 'buttons' && (
          <>
            <Label>Message Text</Label>
            <textarea
              className="form-control mb-3"
              rows={3}
              value={node.data?.text || ''}
              onChange={(e) => patch({ text: e.target.value })}
            />
            <Label>Buttons (max 3 on WhatsApp)</Label>
            {(node.data?.buttons || []).map((btn, i) => (
              <div className="input-group mb-2" key={btn.id || i}>
                <input
                  className="form-control"
                  value={btn.label || ''}
                  onChange={(e) => {
                    const buttons = [...(node.data.buttons || [])];
                    buttons[i] = { ...btn, label: e.target.value };
                    patch({ buttons });
                  }}
                />
                <button
                  className="btn btn-outline-danger"
                  disabled={(node.data.buttons || []).length <= 1}
                  onClick={() => patch({ buttons: (node.data.buttons || []).filter((b) => b.id !== btn.id) })}
                >
                  <i className="bi bi-x"></i>
                </button>
              </div>
            ))}
            {(node.data?.buttons || []).length < 3 && (
              <button
                className="btn btn-sm btn-outline-primary rounded-pill mt-1 mb-2"
                onClick={() => patch({ buttons: [...(node.data?.buttons || []), { id: uid('btn'), label: 'New Option' }] })}
              >
                <i className="bi bi-plus-lg me-1"></i> Add Button
              </button>
            )}
          </>
        )}

        {/* QUESTION BLOCK */}
        {node.type === 'question' && (
          <>
            <Label>Question Text</Label>
            <textarea
              className="form-control mb-3"
              rows={3}
              value={node.data?.text || ''}
              onChange={(e) => patch({ text: e.target.value })}
            />
            <Label>Save Answer as Variable</Label>
            <input
              className="form-control mb-3"
              value={node.data?.variableName || ''}
              onChange={(e) => patch({ variableName: e.target.value.replace(/\s/g, '_') })}
            />
            <Label>Expected Input Type</Label>
            <select
              className="form-select"
              value={node.data?.inputType || 'text'}
              onChange={(e) => patch({ inputType: e.target.value })}
            >
              <option value="text">Free text</option>
              <option value="number">Number</option>
              <option value="email">Email</option>
            </select>
          </>
        )}

        {/* WHATSAPP FORM BLOCK */}
        {node.type === 'whatsappForm' && (
          <>
            <Label>Select WhatsApp Form</Label>
            <select
              className="form-select mb-3"
              value={node.data?.formId || ''}
              onChange={(e) => patch({ formId: e.target.value })}
            >
              <option value="">— Choose a WhatsApp Form —</option>
              {(forms || []).map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} ({(f.fields || []).length} fields)
                </option>
              ))}
            </select>

            {node.data?.formId && (
              <div className="bg-light p-3 rounded-3 mb-3 border">
                {(() => {
                  const form = forms.find((f) => f.id === node.data.formId);
                  if (!form) return <div className="text-muted small">Form not found.</div>;
                  return (
                    <div>
                      <div className="fw-bold small mb-1">{form.name}</div>
                      <div className="text-muted small mb-2">{form.description}</div>
                      <div className="text-uppercase text-muted fw-bold" style={{ fontSize: 10 }}>Form Fields:</div>
                      <ul className="mb-0 ps-3 small text-muted">
                        {(form.fields || []).map((fld) => (
                          <li key={fld.id}>
                            <strong>{fld.label}</strong> ({fld.type}) {fld.required && <span className="text-danger">*</span>} ➔ <code className="inline-var">{`{{${node.data?.saveResponseAs || 'form_data'}.${fld.fieldKey}}}`}</code>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })()}
              </div>
            )}

            <Label>Save Form Response in Variable</Label>
            <input
              className="form-control mb-1"
              value={node.data?.saveResponseAs || 'form_data'}
              onChange={(e) => patch({ saveResponseAs: e.target.value.replace(/\s/g, '_') })}
            />
            <HelpText>
              Access collected fields in subsequent messages as <code className="inline-var">{`{{${node.data?.saveResponseAs || 'form_data'}.field_name}}`}</code>.
            </HelpText>
          </>
        )}

        {/* API REQUEST BLOCK */}
        {node.type === 'apiRequest' && (
          <>
            <Label>Method & URL</Label>
            <div className="input-group mb-3">
              <select
                className="form-select"
                style={{ maxWidth: 100 }}
                value={node.data?.method || 'GET'}
                onChange={(e) => patch({ method: e.target.value })}
              >
                <option>GET</option>
                <option>POST</option>
                <option>PUT</option>
                <option>DELETE</option>
              </select>
              <input
                className="form-control"
                value={node.data?.url || ''}
                onChange={(e) => patch({ url: e.target.value })}
                placeholder="https://api.example.com/..."
              />
            </div>

            <Label>Headers</Label>
            {(node.data?.headers || []).map((h, i) => (
              <div className="input-group input-group-sm mb-2" key={i}>
                <input
                  className="form-control"
                  placeholder="Key"
                  value={h.key || ''}
                  onChange={(e) => {
                    const headers = [...(node.data.headers || [])];
                    headers[i] = { ...h, key: e.target.value };
                    patch({ headers });
                  }}
                />
                <input
                  className="form-control"
                  placeholder="Value"
                  value={h.value || ''}
                  onChange={(e) => {
                    const headers = [...(node.data.headers || [])];
                    headers[i] = { ...h, value: e.target.value };
                    patch({ headers });
                  }}
                />
                <button
                  className="btn btn-outline-danger"
                  onClick={() => patch({ headers: (node.data.headers || []).filter((_, idx) => idx !== i) })}
                >
                  <i className="bi bi-x"></i>
                </button>
              </div>
            ))}
            <button
              className="btn btn-sm btn-outline-primary rounded-pill mb-3"
              onClick={() => patch({ headers: [...(node.data?.headers || []), { key: '', value: '' }] })}
            >
              <i className="bi bi-plus-lg me-1"></i> Add Header
            </button>

            {(node.data?.method === 'POST' || node.data?.method === 'PUT') && (
              <>
                <Label>Request Body (JSON)</Label>
                <textarea
                  className="form-control mb-3"
                  rows={4}
                  value={node.data?.body || ''}
                  onChange={(e) => patch({ body: e.target.value })}
                  placeholder='{ "lead_id": "{{lead_id}}" }'
                />
              </>
            )}

            <Label>Save Response as Variable</Label>
            <input
              className="form-control mb-1"
              value={node.data?.saveResponseAs || 'api_response'}
              onChange={(e) => patch({ saveResponseAs: e.target.value.replace(/\s/g, '_') })}
            />
            <HelpText>
              Access response fields with <code className="inline-var">{`{{${node.data?.saveResponseAs || 'api_response'}.field}}`}</code>.
            </HelpText>
          </>
        )}

        {/* ADVANCED MULTIPLE CONDITION BLOCK */}
        {node.type === 'condition' && (
          <>
            <div className="d-flex align-items-center justify-content-between mb-2">
              <Label>Condition Branches ({(node.data?.branches || []).length})</Label>
              <button
                className="btn btn-sm btn-outline-primary rounded-pill px-2"
                onClick={() => {
                  const branches = [
                    ...(node.data?.branches || []),
                    {
                      id: uid('branch'),
                      label: `Branch ${(node.data?.branches || []).length + 1}`,
                      matchType: 'AND',
                      rules: [{ variable: 'api_response.status', operator: 'equals', value: '1' }],
                    },
                  ];
                  patch({ branches });
                }}
              >
                <i className="bi bi-plus-lg me-1"></i> Add Branch
              </button>
            </div>

            {(node.data?.branches || []).map((branch, bIdx) => (
              <div className="border rounded-3 p-3 bg-light mb-3" key={branch.id || bIdx}>
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <input
                    className="form-control form-control-sm fw-bold"
                    style={{ maxWidth: 180 }}
                    value={branch.label}
                    onChange={(e) => {
                      const branches = [...(node.data.branches || [])];
                      branches[bIdx] = { ...branch, label: e.target.value };
                      patch({ branches });
                    }}
                    placeholder="Branch Name"
                  />
                  <div className="d-flex align-items-center gap-2">
                    <select
                      className="form-select form-select-sm"
                      style={{ width: 85 }}
                      value={branch.matchType || 'AND'}
                      onChange={(e) => {
                        const branches = [...(node.data.branches || [])];
                        branches[bIdx] = { ...branch, matchType: e.target.value };
                        patch({ branches });
                      }}
                    >
                      <option value="AND">ALL (AND)</option>
                      <option value="OR">ANY (OR)</option>
                    </select>
                    {(node.data?.branches || []).length > 1 && (
                      <button
                        className="btn btn-sm btn-outline-danger p-0 px-2"
                        onClick={() => {
                          const branches = (node.data.branches || []).filter((_, i) => i !== bIdx);
                          patch({ branches });
                        }}
                      >
                        <i className="bi bi-trash3"></i>
                      </button>
                    )}
                  </div>
                </div>

                {/* Rules in this Branch */}
                {(branch.rules || []).map((rule, rIdx) => (
                  <div className="bg-white p-2 rounded-2 border mb-2" key={rIdx}>
                    <div className="mb-1">
                      <input
                        className="form-control form-control-sm font-monospace"
                        placeholder="Variable: api_response.userId"
                        value={rule.variable || ''}
                        onChange={(e) => {
                          const branches = [...(node.data.branches || [])];
                          const rules = [...(branch.rules || [])];
                          rules[rIdx] = { ...rule, variable: e.target.value };
                          branches[bIdx] = { ...branch, rules };
                          patch({ branches });
                        }}
                      />
                    </div>
                    <div className="d-flex gap-1">
                      <select
                        className="form-select form-select-sm"
                        value={rule.operator || 'equals'}
                        onChange={(e) => {
                          const branches = [...(node.data.branches || [])];
                          const rules = [...(branch.rules || [])];
                          rules[rIdx] = { ...rule, operator: e.target.value };
                          branches[bIdx] = { ...branch, rules };
                          patch({ branches });
                        }}
                      >
                        <option value="equals">Equals (==)</option>
                        <option value="not_equals">Not Equals (!=)</option>
                        <option value="contains">Contains</option>
                        <option value="greater_than">Greater than (&gt;)</option>
                        <option value="less_than">Less than (&lt;)</option>
                      </select>
                      <input
                        className="form-control form-control-sm"
                        placeholder="Value (e.g. 1)"
                        value={rule.value || ''}
                        onChange={(e) => {
                          const branches = [...(node.data.branches || [])];
                          const rules = [...(branch.rules || [])];
                          rules[rIdx] = { ...rule, value: e.target.value };
                          branches[bIdx] = { ...branch, rules };
                          patch({ branches });
                        }}
                      />
                      {(branch.rules || []).length > 1 && (
                        <button
                          className="btn btn-sm btn-outline-danger p-0 px-2"
                          onClick={() => {
                            const branches = [...(node.data.branches || [])];
                            const rules = (branch.rules || []).filter((_, i) => i !== rIdx);
                            branches[bIdx] = { ...branch, rules };
                            patch({ branches });
                          }}
                        >
                          <i className="bi bi-x"></i>
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                <button
                  className="btn btn-sm btn-link p-0 text-decoration-none small"
                  onClick={() => {
                    const branches = [...(node.data.branches || [])];
                    const rules = [...(branch.rules || []), { variable: '', operator: 'equals', value: '' }];
                    branches[bIdx] = { ...branch, rules };
                    patch({ branches });
                  }}
                >
                  <i className="bi bi-plus-circle me-1"></i> Add Variable Rule ({branch.matchType || 'AND'})
                </button>
              </div>
            ))}

            <Label>Default Fallback Branch (Else)</Label>
            <input
              className="form-control form-control-sm mb-3"
              value={node.data?.elseLabel || 'Default (Else)'}
              onChange={(e) => patch({ elseLabel: e.target.value })}
            />
          </>
        )}

        {/* SUBCHATBOT BLOCK */}
        {node.type === 'subchatbot' && (
          <>
            <Label>Target Chatbot</Label>
            <select
              className="form-select"
              value={node.data?.targetBotId || ''}
              onChange={(e) => patch({ targetBotId: e.target.value })}
            >
              <option value="">— Select a chatbot —</option>
              {bots
                .filter((b) => b && b.clientId === bot?.clientId && b.id !== bot?.id)
                .map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
            </select>
            <HelpText>The conversation will jump into that chatbot's Start block.</HelpText>
          </>
        )}

        {/* END BLOCK */}
        {node.type === 'end' && (
          <>
            <Label>Optional Closing Message</Label>
            <textarea
              className="form-control"
              rows={3}
              value={node.data?.text || ''}
              onChange={(e) => patch({ text: e.target.value })}
            />
          </>
        )}

        {/* CONNECTION OUTPUT DROPDOWNS */}
        {outputs.length > 0 && (
          <>
            <hr className="my-3" />
            <Label>Connects to</Label>
            {outputs.map((out) => (
              <div className="mb-2" key={out.key}>
                <div className="text-muted small mb-1">{out.label || out.key}</div>
                <select
                  className="form-select form-select-sm"
                  value={node.connections?.[out.key] || ''}
                  onChange={(e) => setConnection(bot.id, node.id, out.key, e.target.value || null)}
                >
                  <option value="">— Not connected —</option>
                  {otherNodes.map((n) => (
                    <option key={n.id} value={n.id}>
                      {NODE_TYPES[n.type]?.label || n.type} — {shortLabel(n)}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </>
        )}
      </fieldset>

      <VariablesHelp bot={bot} forms={forms} />
    </div>
  );
}

function shortLabel(n) {
  if (!n) return '';
  const t = n.data?.text || n.data?.url || n.data?.formId || n.id;
  return (t || '').slice(0, 28);
}

function Label({ children }) {
  return <label className="form-label small fw-semibold mb-1">{children}</label>;
}
function HelpText({ children }) {
  return <div className="text-muted mb-3" style={{ fontSize: 11.5 }}>{children}</div>;
}

function VariablesHelp({ bot, forms = [] }) {
  const vars = new Set();
  Object.values(bot?.nodes || {}).forEach((n) => {
    if (n?.type === 'question' && n?.data?.variableName) vars.add(n.data.variableName);
    if (n?.type === 'apiRequest' && n?.data?.saveResponseAs) vars.add(n.data.saveResponseAs);
    if (n?.type === 'whatsappForm' && n?.data?.saveResponseAs) {
      const formKey = n.data.saveResponseAs;
      vars.add(formKey);
      const form = forms.find((f) => f.id === n.data?.formId);
      (form?.fields || []).forEach((f) => vars.add(`${formKey}.${f.fieldKey}`));
    }
  });
  if (vars.size === 0) return null;
  return (
    <div className="mt-4 pt-3 border-top">
      <div className="text-uppercase text-muted fw-bold mb-2" style={{ fontSize: 10.5, letterSpacing: '.06em' }}>
        Available Flow Variables
      </div>
      <div className="d-flex flex-wrap gap-1">
        {[...vars].map((v) => (
          <code className="inline-var" key={v}>{`{{${v}}}`}</code>
        ))}
      </div>
    </div>
  );
}
