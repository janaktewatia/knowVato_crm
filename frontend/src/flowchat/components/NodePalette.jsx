import React from 'react';
import { NODE_TYPES, PALETTE_ORDER } from '../data/nodeTypes';

export default function NodePalette({ readOnly = false }) {
  const handleDragStart = (e, type) => {
    if (readOnly) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData('application/flowchat-node-type', type);
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <div className="palette">
      <div className="text-uppercase text-muted fw-bold mb-2" style={{ fontSize: 11, letterSpacing: '.06em' }}>
        Blocks Palette
      </div>
      <div className="text-muted mb-3" style={{ fontSize: 11.5 }}>
        {readOnly ? (
          <span className="text-warning fw-semibold">
            <i className="bi bi-lock-fill me-1"></i>Published Flow (Read-only). Switch to Draft to add blocks.
          </span>
        ) : (
          'Drag a block onto the canvas to add it to your flow.'
        )}
      </div>
      {PALETTE_ORDER.filter((t) => t !== 'start').map((type) => {
        const def = NODE_TYPES[type];
        if (!def) return null;
        return (
          <div
            key={type}
            className={`palette-item ${readOnly ? 'opacity-50 cursor-not-allowed' : ''}`}
            draggable={!readOnly}
            onDragStart={(e) => handleDragStart(e, type)}
            title={readOnly ? 'Published Flow is locked. Switch to Draft to edit.' : def.description}
            style={{ cursor: readOnly ? 'not-allowed' : 'grab' }}
          >
            <div className="palette-icon" style={{ background: def.color }}>
              <i className={`bi ${def.icon}`}></i>
            </div>
            <div>
              <div className="fw-semibold" style={{ fontSize: 13 }}>{def.label}</div>
              <div className="text-muted" style={{ fontSize: 10.5 }}>{def.description}</div>
            </div>
          </div>
        );
      })}

      <hr className="my-3" />
      <div className="text-muted" style={{ fontSize: 11 }}>
        <i className="bi bi-lightbulb text-warning me-1"></i>
        <strong>Tip:</strong> Drag from a right port to a left port to connect. Right-click canvas to add nodes quickly.
      </div>
    </div>
  );
}
