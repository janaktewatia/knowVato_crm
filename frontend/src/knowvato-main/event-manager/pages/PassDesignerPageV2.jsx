import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { toast } from "react-toastify";
import { useParams, useNavigate } from "../lib/router-shim";
import { useEventData } from "../context/EventDataContext";
import { fetchPassTemplates, createPassTemplate } from "../services/api";
import JSZip from "jszip";
import QRCodeStyling from "qr-code-styling";
import { generateProfessionalPassDesign, generateModernPassDesign, generateMinimalPassDesign } from "../utils/generatePassDesigns";

// ── Constants (copied from PassTemplateEditor) ────────────────────────────────────

const DYNAMIC_FIELDS = [
  { key: "{{name}}",      label: "Attendee Name" },
  { key: "{{email}}",     label: "Email" },
  { key: "{{phone}}",     label: "Phone" },
  { key: "{{passId}}",    label: "Pass ID" },
  { key: "{{category}}", label: "Category" },
  { key: "{{eventName}}",label: "Event Name" },
  { key: "{{venue}}",     label: "Venue" },
  { key: "{{startDate}}",label: "Start Date" },
  { key: "{{endDate}}",  label: "End Date" },
];

const FONTS = [
  "Inter, sans-serif", "Arial, sans-serif", "Georgia, serif",
  "Courier New, monospace", "Verdana, sans-serif", "Trebuchet MS, sans-serif",
  "Times New Roman, serif", "Impact, sans-serif",
];

const CANVAS_PRESETS = [
  { label: "Badge (400×600)", w: 400, h: 600 },
  { label: "Card (350×200)",  w: 350, h: 200 },
  { label: "Ticket (600×250)", w: 600, h: 250 },
  { label: "A5 (420×595)",    w: 420, h: 595 },
];

const uid = () => Math.random().toString(36).slice(2, 9);

const DEFAULT_ELEMENT = {
  text:    { w: 200, h: 36,  label: "Text",     icon: "bi-type-h1",
    content: "Text Here", fontSize: 16, fontWeight: "400",
    fontFamily: "Inter, sans-serif", fontStyle: "normal", textDecoration: "none",
    color: "#1e293b", textAlign: "left", lineHeight: 1.4,
    bg: "transparent", borderRadius: 0, borderWidth: 0, borderColor: "var(--border)",
    borderStyle: "solid", paddingX: 0, paddingY: 0, opacity: 1 },
  header:  { w: 400, h: 72,  label: "Header",   icon: "bi-layout-text-window",
    content: "Event Header", fontSize: 22, fontWeight: "700",
    fontFamily: "Inter, sans-serif", fontStyle: "normal", textDecoration: "none",
    color: "var(--card)", textAlign: "center", lineHeight: 1.3,
    bg: "var(--primary)", borderRadius: 0, borderWidth: 0, borderColor: "transparent",
    borderStyle: "solid", paddingX: 16, paddingY: 16, opacity: 1 },
  footer:  { w: 400, h: 48,  label: "Footer",   icon: "bi-layout-text-sidebar-reverse",
    content: "Event Footer", fontSize: 12, fontWeight: "400",
    fontFamily: "Inter, sans-serif", fontStyle: "normal", textDecoration: "none",
    color: "var(--muted-foreground)", textAlign: "center", lineHeight: 1.4,
    bg: "var(--background)", borderRadius: 0, borderWidth: 0, borderColor: "transparent",
    borderStyle: "solid", paddingX: 8, paddingY: 8, opacity: 1 },
  qr:      { w: 100, h: 100, label: "QR Code",  icon: "bi-qr-code",
    content: "{{passId}}", fontSize: 10, fontWeight: "400",
    fontFamily: "Inter, sans-serif", fontStyle: "normal", textDecoration: "none",
    color: "#000000", textAlign: "center", lineHeight: 1,
    bg: "var(--card)", borderRadius: 4, borderWidth: 0, borderColor: "var(--border)",
    borderStyle: "solid", paddingX: 4, paddingY: 4, opacity: 1 },
  image:   { w: 140, h: 140, label: "Image",    icon: "bi-image",
    content: "", imageUrl: "", objectFit: "cover", fontSize: 12, fontWeight: "400",
    fontFamily: "Inter, sans-serif", fontStyle: "normal", textDecoration: "none",
    color: "var(--muted-foreground)", textAlign: "center", lineHeight: 1,
    bg: "var(--border)", borderRadius: 8, borderWidth: 0, borderColor: "var(--border)",
    borderStyle: "solid", paddingX: 0, paddingY: 0, opacity: 1 },
  logo:    { w: 80,  h: 80,  label: "Logo",     icon: "bi-patch-check",
    content: "", imageUrl: "", objectFit: "contain", fontSize: 12, fontWeight: "400",
    fontFamily: "Inter, sans-serif", fontStyle: "normal", textDecoration: "none",
    color: "var(--muted-foreground)", textAlign: "center", lineHeight: 1,
    bg: "transparent", borderRadius: 0, borderWidth: 0, borderColor: "transparent",
    borderStyle: "solid", paddingX: 0, paddingY: 0, opacity: 1 },
  card:    { w: 340, h: 80,  label: "Card",     icon: "bi-card-text",
    content: "", fontSize: 13, fontWeight: "400",
    fontFamily: "Inter, sans-serif", fontStyle: "normal", textDecoration: "none",
    color: "#1e293b", textAlign: "left", lineHeight: 1.4,
    bg: "var(--background)", borderRadius: 12, borderWidth: 1, borderColor: "var(--border)",
    borderStyle: "solid", paddingX: 12, paddingY: 12, opacity: 1 },
  divider: { w: 360, h: 2,   label: "Divider",  icon: "bi-dash-lg",
    content: "", fontSize: 0, fontWeight: "400",
    fontFamily: "Inter, sans-serif", fontStyle: "normal", textDecoration: "none",
    color: "transparent", textAlign: "left", lineHeight: 1,
    bg: "var(--border)", borderRadius: 0, borderWidth: 0, borderColor: "transparent",
    borderStyle: "solid", paddingX: 0, paddingY: 0, opacity: 1 },
};

const makeElement = (type, x = 40, y = 40) => ({
  id: uid(), type, x, y,
  w: DEFAULT_ELEMENT[type].w,
  h: DEFAULT_ELEMENT[type].h,
  zIndex: 1,
  locked: false,
  ...DEFAULT_ELEMENT[type],
});

const ELEMENT_BTNS = Object.entries(DEFAULT_ELEMENT).map(([type, def]) => ({ type, ...def }));

const toolBtn = {
  height: 30, minWidth: 30, borderRadius: 8, border: "1px solid var(--border)",
  background: "var(--background)", color: "var(--foreground)", cursor: "pointer", fontSize: 13,
  display: "flex", alignItems: "center", justifyContent: "center",
};

const HANDLES = ["nw","n","ne","e","se","s","sw","w"];
const handleCursor = {
  nw:"nw-resize", n:"n-resize", ne:"ne-resize", e:"e-resize",
  se:"se-resize", s:"s-resize", sw:"sw-resize", w:"w-resize"
};

const genQRBlob = (data, color) => {
  const qr = new QRCodeStyling({
    width: 240, height: 240, type: "canvas",
    data: data || "PASS",
    dotsOptions: { color: color || "#000000", type: "square" },
    backgroundOptions: { color: "var(--card)" },
    qrOptions: { errorCorrectionLevel: "M" },
  });
  return new Promise((resolve) => qr.getRawData("png").then(resolve));
};

const loadImage = (src) =>
  new Promise((res, rej) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => res(img);
    img.onerror = rej;
    img.src = src;
  });

// ── Canvas Element Renderer ────────────────────────────────────
const CanvasEl = ({ el, selected }) => {
  const isText = ["text","header","footer","card"].includes(el.type);
  const isMedia = ["image","logo"].includes(el.type);

  const hPos = (h) => {
    const s = { position: "absolute", width: 8, height: 8, borderRadius: 2,
      background: "var(--primary)", border: "2px solid var(--card)", zIndex: 10,
      boxShadow: "0 1px 4px rgba(0,0,0,0.2)", cursor: handleCursor[h], pointerEvents: "auto" };
    if (h === "nw") return { ...s, top: -4, left: -4 };
    if (h === "n")  return { ...s, top: -4, left: "50%", transform: "translateX(-50%)" };
    if (h === "ne") return { ...s, top: -4, right: -4 };
    if (h === "e")  return { ...s, top: "50%", right: -4, transform: "translateY(-50%)" };
    if (h === "se") return { ...s, bottom: -4, right: -4 };
    if (h === "s")  return { ...s, bottom: -4, left: "50%", transform: "translateX(-50%)" };
    if (h === "sw") return { ...s, bottom: -4, left: -4 };
    if (h === "w")  return { ...s, top: "50%", left: -4, transform: "translateY(-50%)" };
  };

  return (
    <div style={{
      position: "absolute", left: el.x, top: el.y, width: el.w, height: el.h,
      zIndex: (el.zIndex || 1) + 1,
      opacity: el.opacity ?? 1,
      background: el.bg,
      borderRadius: el.borderRadius,
      border: (el.borderWidth || 0) > 0 ? `${el.borderWidth}px ${el.borderStyle} ${el.borderColor}` : "none",
      boxSizing: "border-box",
      outline: selected ? "2px solid var(--primary)" : "none",
      outlineOffset: 2,
      boxShadow: selected ? "0 0 0 1px #e9d5ff, 0 0 8px rgba(168,85,247,0.3)" : "none",
      overflow: "visible",
      pointerEvents: "none",
      userSelect: "none",
    }}>
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", borderRadius: el.borderRadius }}>
        {el.type === "qr" && (
          <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4 }}>
            <i className="bi bi-qr-code" style={{ fontSize: Math.min(el.w, el.h) * 0.55, color: "#1e293b" }} />
            <span style={{ fontSize: 9, color: "var(--muted-foreground)" }}>{el.content || "{{passId}}"}</span>
          </div>
        )}
        {isMedia && (
          el.imageUrl
            ? <img src={el.imageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: el.objectFit, display: "block" }} />
            : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 4 }}>
                <i className={`bi ${el.type === "logo" ? "bi-patch-check" : "bi-image"}`} style={{ fontSize: 28, color: "#cbd5e1" }} />
                <span style={{ fontSize: 10, color: "var(--muted-foreground)" }}>{el.label}</span>
              </div>
        )}
        {el.type === "divider" && <div style={{ width: "100%", height: "100%", background: el.bg }} />}
        {isText && (
          <div style={{
            width: "100%", height: "100%",
            padding: `${el.paddingY}px ${el.paddingX}px`,
            fontSize: el.fontSize, fontWeight: el.fontWeight,
            fontFamily: el.fontFamily, fontStyle: el.fontStyle,
            textDecoration: el.textDecoration, color: el.color,
            textAlign: el.textAlign, lineHeight: el.lineHeight,
            display: "flex", alignItems: "center",
            justifyContent: el.textAlign === "center" ? "center" : el.textAlign === "right" ? "flex-end" : "flex-start",
            overflow: "hidden", boxSizing: "border-box",
            whiteSpace: "pre-wrap", wordBreak: "break-word",
          }}>
            {el.content && el.content.trim() ? el.content : ""}
          </div>
        )}
      </div>
      {selected && !el.locked && HANDLES.map((h) => (
        <div key={h} style={hPos(h)} />
      ))}
    </div>
  );
};

// ── Helper Styles & Components ────────────────────────────────
const btnStyle = (bg, color) => ({
  width: 28, height: 28, borderRadius: 6, border: `1px solid ${bg}`,
  background: bg, color, cursor: "pointer", fontSize: 12,
  display: "flex", alignItems: "center", justifyContent: "center",
});
const smallBtn = {
  height: 26, borderRadius: 6, border: "1px solid var(--border)",
  background: "var(--card)", color: "var(--foreground)", cursor: "pointer", fontSize: 11,
  display: "flex", alignItems: "center", justifyContent: "center",
};

const PropRow = ({ label, children }) => (
  <div className="mb-2">
    <label style={{ fontSize: 11, fontWeight: 600, color: "var(--muted-foreground)", display: "block", marginBottom: 3, textTransform: "uppercase", letterSpacing: 0.5 }}>
      {label}
    </label>
    {children}
  </div>
);

const NumInput = ({ value, onChange, min = 0, max = 9999, step = 1, suffix }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
    <input type="number" value={value} min={min} max={max} step={step}
      onChange={(e) => onChange(Number(e.target.value))}
      style={{ width: suffix ? 56 : 72, height: 28, borderRadius: 6, border: "1px solid var(--border)", fontSize: 12, padding: "0 6px", outline: "none" }} />
    {suffix && <span style={{ fontSize: 10, color: "var(--muted-foreground)" }}>{suffix}</span>}
  </div>
);

const ColorInput = ({ value, onChange }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
    <input type="color" value={value === "transparent" ? "var(--card)" : value}
      onChange={(e) => onChange(e.target.value)}
      style={{ width: 28, height: 28, borderRadius: 6, border: "1px solid var(--border)", cursor: "pointer", padding: 2 }} />
    <input type="text" value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{ width: 80, height: 28, borderRadius: 6, border: "1px solid var(--border)", fontSize: 11, padding: "0 6px", fontFamily: "monospace" }} />
    <button type="button" title="Transparent"
      onClick={() => onChange("transparent")}
      style={{ width: 28, height: 28, borderRadius: 6, border: "1px solid var(--border)", background: "var(--card)", cursor: "pointer", fontSize: 11 }}>✕</button>
  </div>
);

const SelectInput = ({ value, onChange, options }) => (
  <select value={value} onChange={(e) => onChange(e.target.value)}
    style={{ width: "100%", height: 28, borderRadius: 6, border: "1px solid var(--border)", fontSize: 12, padding: "0 6px" }}>
    {options.map(o => <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>)}
  </select>
);

// ── Properties Panel Component (EXACT COPY from PassTemplateEditor) ────────────────────────────────
const PropertiesPanel = ({ el, selectedElements, onChange, onDelete, onDuplicate, onBring, onSend, canvasState, onCanvasChange, alignElements, distributeHorizontally, distributeVertically }) => {
  if (!el) return (
    <div style={{ padding: 16 }}>
      <div style={{ fontSize: 12, color: "var(--muted-foreground)", textAlign: "center", marginTop: 40 }}>
        <i className="bi bi-cursor" style={{ fontSize: 28, display: "block", marginBottom: 8 }} />
        Click an element to edit its properties
      </div>
    </div>
  );

  const p = (key) => (val) => onChange({ ...el, [key]: val });
  const isText = ["text","header","footer","card"].includes(el.type);
  const isMedia = ["image","logo"].includes(el.type);

  return (
    <div style={{ padding: 12, overflowY: "auto", height: "100%" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, paddingBottom: 10, borderBottom: "1px solid var(--border)" }}>
        <span style={{ fontWeight: 700, fontSize: 13, color: "#1e293b", display: "flex", alignItems: "center", gap: 6 }}>
          <i className={`bi ${DEFAULT_ELEMENT[el.type]?.icon}`} style={{ color: "var(--primary)" }} />
          {el.label || el.type}
        </span>
        <div style={{ display: "flex", gap: 4 }}>
          <button onClick={onDuplicate} title="Duplicate" style={btnStyle("var(--border)","var(--foreground)")}><i className="bi bi-copy" /></button>
          <button onClick={onDelete} title="Delete" style={btnStyle("oklch(var(--destructive-h) var(--destructive-s) var(--destructive-l) / 10%)","#dc2626")}><i className="bi bi-trash" /></button>
        </div>
      </div>

      {/* Multi-Select Controls */}
      {selectedElements && selectedElements.length > 1 && (
        <div style={{ background: "#f0fdf4", borderRadius: 8, padding: 10, marginBottom: 10, border: "1px solid #bbf7d0" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#22c55e", marginBottom: 8 }}>
            {selectedElements.length} Elements Selected
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, marginBottom: 6 }}>
            <button onClick={() => alignElements("left")} style={{ height: 26, borderRadius: 6, border: "1px solid var(--border)", background: "var(--card)", color: "var(--foreground)", cursor: "pointer", fontSize: 9, display: "flex", alignItems: "center", justifyContent: "center" }} title="Align Left">
              <i className="bi bi-align-start" /> Left
            </button>
            <button onClick={() => alignElements("centerX")} style={{ height: 26, borderRadius: 6, border: "1px solid var(--border)", background: "var(--card)", color: "var(--foreground)", cursor: "pointer", fontSize: 9, display: "flex", alignItems: "center", justifyContent: "center" }} title="Align Center">
              <i className="bi bi-distribute-horizontal" /> Center
            </button>
            <button onClick={() => alignElements("top")} style={{ height: 26, borderRadius: 6, border: "1px solid var(--border)", background: "var(--card)", color: "var(--foreground)", cursor: "pointer", fontSize: 9, display: "flex", alignItems: "center", justifyContent: "center" }} title="Align Top">
              <i className="bi bi-align-top" /> Top
            </button>
            <button onClick={() => alignElements("centerY")} style={{ height: 26, borderRadius: 6, border: "1px solid var(--border)", background: "var(--card)", color: "var(--foreground)", cursor: "pointer", fontSize: 9, display: "flex", alignItems: "center", justifyContent: "center" }} title="Align Middle">
              <i className="bi bi-distribute-vertical" /> Middle
            </button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
            <button onClick={() => distributeHorizontally()} style={{ height: 26, borderRadius: 6, border: "1px solid var(--border)", background: "var(--card)", color: "var(--foreground)", cursor: "pointer", fontSize: 9, display: "flex", alignItems: "center", justifyContent: "center" }} title="Distribute Horizontally">
              <i className="bi bi-columns-gap" /> Dist H
            </button>
            <button onClick={() => distributeVertically()} style={{ height: 26, borderRadius: 6, border: "1px solid var(--border)", background: "var(--card)", color: "var(--foreground)", cursor: "pointer", fontSize: 9, display: "flex", alignItems: "center", justifyContent: "center" }} title="Distribute Vertically">
              <i className="bi bi-rows-gap" /> Dist V
            </button>
          </div>
        </div>
      )}

      {/* Lock */}
      <PropRow label="State">
        <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, cursor: "pointer" }}>
          <input type="checkbox" checked={el?.locked} onChange={(e) => onChange({ ...el, locked: e.target.checked })} />
          Lock element
        </label>
      </PropRow>

      {/* Position & Size */}
      <div style={{ background: "var(--background)", borderRadius: 8, padding: 10, marginBottom: 10 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted-foreground)", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>Position & Size</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <div><span style={{ fontSize: 10, color: "var(--muted-foreground)" }}>X</span><NumInput value={Math.round(el.x)} onChange={p("x")} /></div>
          <div><span style={{ fontSize: 10, color: "var(--muted-foreground)" }}>Y</span><NumInput value={Math.round(el.y)} onChange={p("y")} /></div>
          <div><span style={{ fontSize: 10, color: "var(--muted-foreground)" }}>W</span><NumInput value={Math.round(el.w)} min={10} onChange={p("w")} /></div>
          <div><span style={{ fontSize: 10, color: "var(--muted-foreground)" }}>H</span><NumInput value={Math.round(el.h)} min={4} onChange={p("h")} /></div>
        </div>
      </div>

      {/* Alignment */}
      <div style={{ background: "var(--background)", borderRadius: 8, padding: 10, marginBottom: 10 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted-foreground)", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>Alignment</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 4, marginBottom: 8 }}>
          <button onClick={() => onChange({ ...el, x: 0 })} style={{ ...smallBtn, fontSize: 10 }} title="Align Left"><i className="bi bi-align-start" /></button>
          <button onClick={() => onChange({ ...el, x: (canvasState.width - el.w) / 2 })} style={{ ...smallBtn, fontSize: 10 }} title="Center X"><i className="bi bi-distribute-horizontal" /></button>
          <button onClick={() => onChange({ ...el, x: canvasState.width - el.w })} style={{ ...smallBtn, fontSize: 10 }} title="Align Right"><i className="bi bi-align-end" /></button>
          <button onClick={() => onChange({ ...el, y: 0 })} style={{ ...smallBtn, fontSize: 10 }} title="Align Top"><i className="bi bi-align-top" /></button>
          <button onClick={() => onChange({ ...el, x: (canvasState.width - el.w) / 2, y: (canvasState.height - el.h) / 2 })} style={{ ...smallBtn, fontSize: 10, background: "var(--accent)", color: "var(--primary)", border: "1px solid #e9d5ff" }} title="Center"><i className="bi bi-bullseye" /></button>
          <button onClick={() => onChange({ ...el, y: canvasState.height - el.h })} style={{ ...smallBtn, fontSize: 10 }} title="Align Bottom"><i className="bi bi-align-bottom" /></button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
          <button onClick={() => onChange({ ...el, y: (canvasState.height - el.h) / 2 })} style={{ ...smallBtn, fontSize: 10 }} title="Center Y"><i className="bi bi-distribute-vertical" /> Center Y</button>
          <button onClick={() => onChange({ ...el, x: (canvasState.width - el.w) / 2 })} style={{ ...smallBtn, fontSize: 10 }} title="Center X"><i className="bi bi-distribute-horizontal" /> Center X</button>
        </div>
      </div>

      {/* Layer */}
      <div style={{ background: "var(--background)", borderRadius: 8, padding: 10, marginBottom: 10 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted-foreground)", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>Layer</div>
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={onBring} style={{ flex: 1, ...smallBtn }}><i className="bi bi-layers-fill me-1" />Bring Forward</button>
          <button onClick={onSend} style={{ flex: 1, ...smallBtn }}><i className="bi bi-layers me-1" />Send Back</button>
        </div>
        <div style={{ marginTop: 8 }}>
          <span style={{ fontSize: 10, color: "var(--muted-foreground)" }}>Z-Index: {el.zIndex}</span>
        </div>
      </div>

      {/* Appearance */}
      <div style={{ background: "var(--background)", borderRadius: 8, padding: 10, marginBottom: 10 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted-foreground)", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>Appearance</div>
        <PropRow label="Background"><ColorInput value={el.bg || "transparent"} onChange={p("bg")} /></PropRow>
        <PropRow label="Border Radius">
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <input type="range" min={0} max={60} value={el.borderRadius} onChange={(e) => p("borderRadius")(Number(e.target.value))}
              style={{ flex: 1 }} />
            <NumInput value={el.borderRadius} min={0} max={200} suffix="px" onChange={p("borderRadius")} />
          </div>
        </PropRow>
        <PropRow label="Border Width"><NumInput value={el.borderWidth} min={0} max={20} suffix="px" onChange={p("borderWidth")} /></PropRow>
        {el.borderWidth > 0 && <>
          <PropRow label="Border Color"><ColorInput value={el.borderColor} onChange={p("borderColor")} /></PropRow>
          <PropRow label="Border Style"><SelectInput value={el.borderStyle} onChange={p("borderStyle")} options={["solid","dashed","dotted","double"]} /></PropRow>
        </>}
        <PropRow label="Opacity">
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <input type="range" min={0} max={1} step={0.05} value={el.opacity} onChange={(e) => p("opacity")(Number(e.target.value))} style={{ flex: 1 }} />
            <span style={{ fontSize: 11, color: "var(--muted-foreground)", width: 32 }}>{Math.round(el.opacity * 100)}%</span>
          </div>
        </PropRow>
      </div>

      {/* Text */}
      {isText && (
        <div style={{ background: "var(--background)", borderRadius: 8, padding: 10, marginBottom: 10 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted-foreground)", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>Text</div>
          <PropRow label="Content">
            <textarea value={el.content} onChange={(e) => onChange({ ...el, content: e.target.value })}
              rows={3} style={{ width: "100%", borderRadius: 6, border: "1px solid var(--border)", fontSize: 12, padding: "6px 8px", resize: "vertical" }} />
          </PropRow>
          <PropRow label="Insert Dynamic Field">
            <select onChange={(e) => { if (e.target.value) onChange({ ...el, content: (el.content || "") + e.target.value }); e.target.value = ""; }}
              style={{ width: "100%", height: 28, borderRadius: 6, border: "1px solid var(--border)", fontSize: 12, padding: "0 6px" }}>
              <option value="">— Insert field —</option>
              {DYNAMIC_FIELDS.map(f => <option key={f.key} value={f.key}>{f.label} ({f.key})</option>)}
            </select>
          </PropRow>
          <PropRow label="Font Family"><SelectInput value={el.fontFamily} onChange={p("fontFamily")} options={FONTS} /></PropRow>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
            <div><PropRow label="Size"><NumInput value={el.fontSize} min={6} max={120} suffix="px" onChange={p("fontSize")} /></PropRow></div>
            <div><PropRow label="Line Height"><NumInput value={el.lineHeight} min={0.8} max={4} step={0.1} onChange={p("lineHeight")} /></PropRow></div>
          </div>
          <PropRow label="Weight">
            <div style={{ display: "flex", gap: 4 }}>
              {[["100","Thin"],["400","Regular"],["600","Semi"],["700","Bold"],["900","Black"]].map(([v,l]) => (
                <button key={v} onClick={() => p("fontWeight")(v)}
                  style={{ flex: 1, height: 26, borderRadius: 5, border: `1px solid ${el.fontWeight === v ? "var(--primary)" : "var(--border)"}`,
                    background: el.fontWeight === v ? "var(--accent)" : "var(--card)", color: el.fontWeight === v ? "var(--primary)" : "var(--foreground)",
                    cursor: "pointer", fontSize: 10, fontWeight: v }}>
                  {l}
                </button>
              ))}
            </div>
          </PropRow>
          <PropRow label="Style">
            <div style={{ display: "flex", gap: 4 }}>
              {[["normal","N"],["italic","I"],["oblique","O"]].map(([v,l]) => (
                <button key={v} onClick={() => p("fontStyle")(v)}
                  style={{ width: 30, height: 26, borderRadius: 5, border: `1px solid ${el.fontStyle===v?"var(--primary)":"var(--border)"}`,
                    background: el.fontStyle===v?"var(--accent)":"var(--card)", color: el.fontStyle===v?"var(--primary)":"var(--foreground)",
                    cursor: "pointer", fontSize: 12, fontStyle: v }}>
                  {l}
                </button>
              ))}
              <button onClick={() => p("textDecoration")(el.textDecoration === "underline" ? "none" : "underline")}
                style={{ width: 30, height: 26, borderRadius: 5, border: `1px solid ${el.textDecoration==="underline"?"var(--primary)":"var(--border)"}`,
                  background: el.textDecoration==="underline"?"var(--accent)":"var(--card)", color: el.textDecoration==="underline"?"var(--primary)":"var(--foreground)",
                  cursor: "pointer", fontSize: 12, textDecoration: "underline" }}>
                U
              </button>
            </div>
          </PropRow>
          <PropRow label="Alignment">
            <div style={{ display: "flex", gap: 4 }}>
              {[["left","bi-text-left"],["center","bi-text-center"],["right","bi-text-right"]].map(([v,ic]) => (
                <button key={v} onClick={() => p("textAlign")(v)}
                  style={{ flex: 1, height: 26, borderRadius: 5, border: `1px solid ${el.textAlign===v?"var(--primary)":"var(--border)"}`,
                    background: el.textAlign===v?"var(--accent)":"var(--card)", color: el.textAlign===v?"var(--primary)":"var(--foreground)", cursor: "pointer" }}>
                  <i className={`bi ${ic}`} />
                </button>
              ))}
            </div>
          </PropRow>
          <PropRow label="Text Color"><ColorInput value={el.color} onChange={p("color")} /></PropRow>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <PropRow label="Pad X"><NumInput value={el.paddingX} min={0} max={60} suffix="px" onChange={p("paddingX")} /></PropRow>
            <PropRow label="Pad Y"><NumInput value={el.paddingY} min={0} max={60} suffix="px" onChange={p("paddingY")} /></PropRow>
          </div>
        </div>
      )}

      {/* Image/Logo */}
      {isMedia && (
        <div style={{ background: "var(--background)", borderRadius: 8, padding: 10, marginBottom: 10 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted-foreground)", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>Image</div>
          <PropRow label="Image URL">
            <input type="text" value={el.imageUrl || ""} placeholder="https://... or upload"
              onChange={(e) => onChange({ ...el, imageUrl: e.target.value })}
              style={{ width: "100%", height: 28, borderRadius: 6, border: "1px solid var(--border)", fontSize: 11, padding: "0 8px" }} />
          </PropRow>
          <PropRow label="Dynamic Field">
            <select value={el.content || ""} onChange={(e) => onChange({ ...el, content: e.target.value })}
              style={{ width: "100%", height: 28, borderRadius: 6, border: "1px solid var(--border)", fontSize: 12, padding: "0 6px" }}>
              <option value="">— Static URL —</option>
              {DYNAMIC_FIELDS.map(f => <option key={f.key} value={f.key}>{f.label}</option>)}
            </select>
          </PropRow>
          <PropRow label="Fit">
            <SelectInput value={el.objectFit} onChange={p("objectFit")} options={["cover","contain","fill","none"]} />
          </PropRow>
        </div>
      )}
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────
const PassDesignerPageV2 = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { events, attendees, saveEventPassDesign, markPassesGenerated } = useEventData();

  const selectedEvent = useMemo(
    () => events.find((e) => String(e.id) === String(eventId)) || null,
    [events, eventId]
  );

  const eventAttendees = useMemo(
    () => attendees.filter((a) => String(a.eventId) === String(eventId)),
    [attendees, eventId]
  );

  const saved = selectedEvent?.passDesign;

  // State
  const [canvas, setCanvas] = useState(saved?.canvas || { width: 400, height: 600, background: "var(--card)", borderRadius: 0 });
  const [elements, setElements] = useState(saved?.elements || []);
  const [selectedIds, setSelectedIds] = useState([]);
  const [zoom, setZoom] = useState(1);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeCatName, setActiveCatName] = useState(saved?.activeCatName || "Default");
  const [categoryDesigns, setCategoryDesigns] = useState(saved?.categoryDesigns || {});
  const [isSaving, setIsSaving] = useState(false);
  const [templateNameInput, setTemplateNameInput] = useState("");
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [copiedCategory, setCopiedCategory] = useState(null);

  // Refs
  const canvasRef = useRef(null);
  const dragRef = useRef(null);
  const resizeRef = useRef(null);
  const historyRef = useRef([]);
  const historyIndexRef = useRef(0);

  // Get unique categories from attendees
  const categories = useMemo(() => {
    const cats = new Set(eventAttendees.map(a => a.category || "Default"));
    return Array.from(cats).sort();
  }, [eventAttendees]);

  // Load templates
  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const data = await fetchPassTemplates();
        setTemplates(data || []);
      } catch (err) {
        console.error("Failed to load templates:", err);
      }
    };
    loadTemplates();
  }, []);

  // Switch category and load/save designs
  const switchCategory = useCallback((catName) => {
    // Save current design for active category
    const updated = { ...categoryDesigns, [activeCatName]: { canvas, elements } };
    setCategoryDesigns(updated);

    // Load design for new category
    const catDesign = updated[catName] || { canvas: { width: 400, height: 600, background: "var(--card)" }, elements: [] };
    setCanvas(catDesign.canvas);
    setElements(catDesign.elements);
    setSelectedIds([]);
    setActiveCatName(catName);
    historyRef.current = [];
    historyIndexRef.current = 0;
  }, [activeCatName, canvas, elements, categoryDesigns]);

  // History functions
  const captureHistory = useCallback(() => {
    const snap = JSON.stringify({ canvas, elements });
    if (historyIndexRef.current < historyRef.current.length - 1) {
      historyRef.current = historyRef.current.slice(0, historyIndexRef.current + 1);
    }
    historyRef.current.push(snap);
    historyIndexRef.current = historyRef.current.length - 1;
  }, [canvas, elements]);

  const undo = useCallback(() => {
    if (historyIndexRef.current > 0) {
      historyIndexRef.current -= 1;
      const snap = JSON.parse(historyRef.current[historyIndexRef.current]);
      setCanvas(snap.canvas);
      setElements(snap.elements);
    }
  }, []);

  const redo = useCallback(() => {
    if (historyIndexRef.current < historyRef.current.length - 1) {
      historyIndexRef.current += 1;
      const snap = JSON.parse(historyRef.current[historyIndexRef.current]);
      setCanvas(snap.canvas);
      setElements(snap.elements);
    }
  }, []);

  // Editor functions
  const getElementAtPoint = useCallback((px, py) => {
    // Sort elements by z-index in descending order (highest first)
    const sorted = [...elements].sort((a, b) => (b.zIndex || 1) - (a.zIndex || 1));
    for (const el of sorted) {
      if (px >= el.x && px < el.x + el.w && py >= el.y && py < el.y + el.h) return el;
    }
    return null;
  }, [elements]);

  const addElement = useCallback((type) => {
    const el = makeElement(type);
    setElements([...elements, el]);
    setSelectedIds([el.id]);
    setTimeout(captureHistory, 0);
  }, [elements, captureHistory]);

  const updateElement = useCallback((updated) => {
    setElements(elements.map(el => el.id === updated.id ? updated : el));
    setTimeout(captureHistory, 0);
  }, [elements, captureHistory]);

  const deleteSelected = useCallback(() => {
    setElements(elements.filter(el => !selectedIds.includes(el.id)));
    setSelectedIds([]);
    setTimeout(captureHistory, 0);
  }, [elements, selectedIds, captureHistory]);

  const duplicateSelected = useCallback(() => {
    const el = elements.find(e => e.id === selectedIds[0]);
    if (!el) return;
    const dup = { ...el, id: uid(), x: el.x + 16, y: el.y + 16 };
    setElements([...elements, dup]);
    setSelectedIds([dup.id]);
    setTimeout(captureHistory, 0);
  }, [elements, selectedIds, captureHistory]);

  const bringForward = useCallback(() => {
    const el = elements.find(e => e.id === selectedIds[0]);
    if (!el) return;
    const maxZ = Math.max(...elements.map(e => e.zIndex || 1), 0);
    updateElement({ ...el, zIndex: maxZ + 1 });
  }, [elements, selectedIds, updateElement]);

  const sendBackward = useCallback(() => {
    const el = elements.find(e => e.id === selectedIds[0]);
    if (!el) return;
    const minZ = Math.min(...elements.map(e => e.zIndex || 1), 0);
    updateElement({ ...el, zIndex: minZ - 1 });
  }, [elements, selectedIds, updateElement]);

  // Distribute elements horizontally
  const distributeHorizontally = useCallback((gap = 10) => {
    const selected = elements.filter(e => selectedIds.includes(e.id));
    if (selected.length < 2) return;
    const sorted = [...selected].sort((a, b) => a.x - b.x);
    let currentX = sorted[0].x;
    sorted.forEach((el) => {
      updateElement({ ...el, x: currentX });
      currentX += el.w + gap;
    });
  }, [elements, selectedIds, updateElement]);

  // Distribute elements vertically
  const distributeVertically = useCallback((gap = 10) => {
    const selected = elements.filter(e => selectedIds.includes(e.id));
    if (selected.length < 2) return;
    const sorted = [...selected].sort((a, b) => a.y - b.y);
    let currentY = sorted[0].y;
    sorted.forEach((el) => {
      updateElement({ ...el, y: currentY });
      currentY += el.h + gap;
    });
  }, [elements, selectedIds, updateElement]);

  // Align selected elements
  const alignElements = useCallback((direction) => {
    const selected = elements.filter(e => selectedIds.includes(e.id));
    if (selected.length < 2) return;
    selected.forEach((el) => {
      let updates = {};
      switch (direction) {
        case "left":
          updates.x = Math.min(...selected.map(e => e.x));
          break;
        case "centerX":
          updates.x = selected.reduce((sum, e) => sum + e.x + e.w / 2, 0) / selected.length - el.w / 2;
          break;
        case "right":
          updates.x = Math.max(...selected.map(e => e.x + e.w)) - el.w;
          break;
        case "top":
          updates.y = Math.min(...selected.map(e => e.y));
          break;
        case "centerY":
          updates.y = selected.reduce((sum, e) => sum + e.y + e.h / 2, 0) / selected.length - el.h / 2;
          break;
        case "bottom":
          updates.y = Math.max(...selected.map(e => e.y + e.h)) - el.h;
          break;
        default:
          return;
      }
      if (Object.keys(updates).length > 0) updateElement({ ...el, ...updates });
    });
  }, [elements, selectedIds, updateElement]);

  // Canvas mouse handler
  const onCanvasMouseDown = useCallback((e) => {
    if (e.button !== 0) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const px = (e.clientX - rect.left) / zoom;
    const py = (e.clientY - rect.top) / zoom;

    const clicked = getElementAtPoint(px, py);
    if (!clicked) {
      setSelectedIds([]);
      return;
    }

    // Multi-select with Ctrl/Cmd + Click
    if (e.ctrlKey || e.metaKey) {
      setSelectedIds((prev) =>
        prev.includes(clicked.id) ? prev.filter((id) => id !== clicked.id) : [...prev, clicked.id]
      );
    } else {
      setSelectedIds([clicked.id]);
    }
    if (clicked.locked) return;

    // Check for resize handle (8px tolerance)
    const handles = {
      nw: clicked.x <= px && px < clicked.x + 8 && clicked.y <= py && py < clicked.y + 8,
      n: clicked.x + clicked.w / 2 - 4 <= px && px < clicked.x + clicked.w / 2 + 4 && clicked.y <= py && py < clicked.y + 8,
      ne: clicked.x + clicked.w - 8 <= px && px < clicked.x + clicked.w && clicked.y <= py && py < clicked.y + 8,
      e: clicked.x + clicked.w - 8 <= px && px < clicked.x + clicked.w && clicked.y + clicked.h / 2 - 4 <= py && py < clicked.y + clicked.h / 2 + 4,
      se: clicked.x + clicked.w - 8 <= px && px < clicked.x + clicked.w && clicked.y + clicked.h - 8 <= py && py < clicked.y + clicked.h,
      s: clicked.x + clicked.w / 2 - 4 <= px && px < clicked.x + clicked.w / 2 + 4 && clicked.y + clicked.h - 8 <= py && py < clicked.y + clicked.h,
      sw: clicked.x <= px && px < clicked.x + 8 && clicked.y + clicked.h - 8 <= py && py < clicked.y + clicked.h,
      w: clicked.x <= px && px < clicked.x + 8 && clicked.y + clicked.h / 2 - 4 <= py && py < clicked.y + clicked.h / 2 + 4,
    };

    const handle = Object.entries(handles).find(([, hit]) => hit)?.[0];
    if (handle) {
      resizeRef.current = { id: clicked.id, handle, startX: px, startY: py, origX: clicked.x, origY: clicked.y, origW: clicked.w, origH: clicked.h };
    } else {
      dragRef.current = { id: clicked.id, startX: px, startY: py, origX: clicked.x, origY: clicked.y };
    }

    const onMouseMove = (me) => {
      const cx = (me.clientX - rect.left) / zoom / window.devicePixelRatio;
      const cy = (me.clientY - rect.top) / zoom / window.devicePixelRatio;

      if (dragRef.current) {
        const dx = cx - dragRef.current.startX;
        const dy = cy - dragRef.current.startY;
        const el = elements.find(e => e.id === dragRef.current.id);
        if (el) {
          updateElement({ ...el, x: Math.max(0, dragRef.current.origX + dx), y: Math.max(0, dragRef.current.origY + dy) });
        }
      } else if (resizeRef.current) {
        const dx = cx - resizeRef.current.startX;
        const dy = cy - resizeRef.current.startY;
        const h = resizeRef.current.handle;
        const el = elements.find(e => e.id === resizeRef.current.id);
        if (!el) return;

        let nx = el.x, ny = el.y, nw = el.w, nh = el.h;
        if (["nw","w","sw"].includes(h)) { nx = resizeRef.current.origX + dx; nw = resizeRef.current.origW - dx; }
        if (["ne","e","se"].includes(h)) nw = Math.max(20, resizeRef.current.origW + dx);
        if (["nw","n","ne"].includes(h)) { ny = resizeRef.current.origY + dy; nh = resizeRef.current.origH - dy; }
        if (["sw","s","se"].includes(h)) nh = Math.max(4, resizeRef.current.origH + dy);

        updateElement({ ...el, x: nx, y: ny, w: nw, h: nh });
      }
    };

    const onMouseUp = () => {
      dragRef.current = null;
      resizeRef.current = null;
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
      setTimeout(captureHistory, 0);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  }, [zoom, getElementAtPoint, elements, updateElement, captureHistory]);

  // Keyboard shortcuts
  useEffect(() => {
    const onKeyDown = (e) => {
      // Don't handle keyboard shortcuts if user is typing in an input field
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") {
        return;
      }

      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        selectedIds.length > 0 && deleteSelected();
      }
      if (e.key === "Escape") setSelectedIds([]);
      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        e.preventDefault();
        e.shiftKey ? redo() : undo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "d") {
        e.preventDefault();
        selectedIds.length > 0 && duplicateSelected();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedIds, deleteSelected, undo, redo, duplicateSelected]);

  const selectedElement = elements.find(el => el.id === selectedIds[0]);
  const selectedElements = elements.filter(el => selectedIds.includes(el.id));

  // Apply template
  const applyTemplate = useCallback((templateId) => {
    const template = templates.find(t => t.id === templateId);
    if (!template) return;
    setCanvas(template.canvas || { width: 400, height: 600, background: "var(--card)" });
    setElements(template.elements || []);
    setSelectedIds([]);
    setSelectedTemplateId(templateId);
    setTimeout(captureHistory, 0);
    toast.success(`Template "${template.name}" loaded!`);
  }, [templates, captureHistory]);

  // Save as Template
  const handleSaveAsTemplate = async () => {
    if (!templateNameInput.trim()) {
      toast.error("Please enter a template name");
      return;
    }
    setIsSaving(true);
    try {
      await createPassTemplate({
        name: templateNameInput,
        canvas,
        elements,
      });
      toast.success(`Template "${templateNameInput}" saved!`);
      setTemplateNameInput("");
      const data = await fetchPassTemplates();
      setTemplates(data || []);
    } catch (err) {
      toast.error("Failed to save template");
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  // Save design to event
  const handleSave = async () => {
    if (!selectedEvent) return;
    setIsSaving(true);
    // Save current category design
    const catSnap = { ...categoryDesigns, [activeCatName]: { canvas, elements } };
    try {
      await saveEventPassDesign(selectedEvent.id, {
        canvas, elements, activeCatName, categoryDesigns: catSnap
      });
      toast.success("Pass design saved!");
      navigate(`/events/${eventId}/upload`);
    } catch (err) {
      toast.error("Save failed");
    } finally {
      setIsSaving(false);
    }
  };

  // Render pass
  const renderPass = async (attendee, canvasState = canvas, els = elements) => {
    const c = document.createElement("canvas");
    const dpr = 2;
    c.width = canvasState.width * dpr;
    c.height = canvasState.height * dpr;
    const ctx = c.getContext("2d");
    ctx.scale(dpr, dpr);

    const substitute = (str) => (str || "")
      .replace(/\{\{name\}\}/g, attendee.name || "")
      .replace(/\{\{email\}\}/g, attendee.email || "")
      .replace(/\{\{phone\}\}/g, attendee.phone || "")
      .replace(/\{\{passId\}\}/g, attendee.passId || "")
      .replace(/\{\{category\}\}/g, attendee.category || "")
      .replace(/\{\{eventName\}\}/g, selectedEvent.eventName || "")
      .replace(/\{\{venue\}\}/g, selectedEvent.venue || "")
      .replace(/\{\{startDate\}\}/g, selectedEvent.startDate || "")
      .replace(/\{\{endDate\}\}/g, selectedEvent.endDate || "");

    // Background
    ctx.fillStyle = canvasState.background;
    ctx.fillRect(0, 0, canvasState.width, canvasState.height);

    // Elements sorted by zIndex
    const sorted = [...els].sort((a, b) => (a.zIndex || 1) - (b.zIndex || 1));
    for (const el of sorted) {
      ctx.globalAlpha = el.opacity ?? 1;

      if (["text","header","footer","card"].includes(el.type)) {
        // Substitute content and check if empty
        const substitutedContent = substitute(el.content).trim();

        // Skip rendering if content is empty or only contains whitespace
        if (!substitutedContent && el.type !== "card") {
          ctx.globalAlpha = 1;
          continue;
        }

        ctx.fillStyle = el.bg || "transparent";
        ctx.fillRect(el.x, el.y, el.w, el.h);

        // Only draw text if it has content
        if (substitutedContent) {
          ctx.fillStyle = el.color;
          ctx.font = `${el.fontStyle === "italic" ? "italic " : ""}${el.fontWeight} ${el.fontSize}px ${el.fontFamily}`;
          ctx.textAlign = el.textAlign || "left";
          const lines = substitutedContent.split("\n");
          const lh = el.lineHeight || 1.4;
          const lineHeightPx = el.fontSize * lh;
          const totalHeight = lineHeightPx * lines.length;
          let startY = el.y + (el.h - totalHeight) / 2 + el.fontSize;

          for (const line of lines) {
            const x = el.textAlign === "center" ? el.x + el.w / 2 : el.textAlign === "right" ? el.x + el.w - 4 : el.x + 4;
            ctx.fillText(line, x, startY);
            startY += lineHeightPx;
          }
        }
      } else if (el.type === "qr") {
        const qrBlob = await genQRBlob(substitute(el.content), "#000000");
        const qrImg = await loadImage(URL.createObjectURL(qrBlob));
        ctx.drawImage(qrImg, el.x, el.y, el.w, el.h);
      } else if (["image","logo"].includes(el.type) && el.imageUrl) {
        try {
          const img = await loadImage(el.imageUrl);
          ctx.drawImage(img, el.x, el.y, el.w, el.h);
        } catch (e) {
          console.error("Image load failed:", e);
        }
      }

      ctx.globalAlpha = 1;
    }

    return c.toDataURL("image/png");
  };

  // Download all
  const handleDownloadAll = async () => {
    if (!eventAttendees.length || !selectedEvent) return;
    setIsGenerating(true);
    try {
      const zip = new JSZip();
      // Save current design before generating
      const finalCatDesigns = { ...categoryDesigns, [activeCatName]: { canvas, elements } };
      for (const att of eventAttendees) {
        const catDesign = finalCatDesigns[att.category || "Default"] || finalCatDesigns["Default"] || { canvas, elements };
        const dataUrl = await renderPass(att, catDesign.canvas, catDesign.elements);
        const blob = await (await fetch(dataUrl)).blob();
        zip.file(`${att.name || att.passId}.png`, blob);
      }
      const zipBlob = await zip.generateAsync({ type: "blob" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(zipBlob);
      a.download = `${selectedEvent.eventName}_passes.zip`;
      a.click();
      toast.success(`${eventAttendees.length} passes downloaded!`);
      markPassesGenerated(selectedEvent.id);
      navigate(`/events/${eventId}/upload`);
    } catch (err) {
      toast.error("Download failed");
    } finally {
      setIsGenerating(false);
    }
  };

  if (!selectedEvent) {
    return (
      <div className="container-fluid p-4 text-center">
        <p className="text-muted">Event not found.</p>
        <button className="btn btn-primary btn-sm" onClick={() => navigate("/events")}>Go to Events</button>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "var(--border)" }}>
      {/* Breadcrumb & Title */}
      <div style={{ padding: "12px 16px", background: "var(--card)", borderBottom: "1px solid var(--border)" }}>
        <nav aria-label="breadcrumb" className="mb-2">
          <ol className="breadcrumb mb-0" style={{ fontSize: 12 }}>
            <li className="breadcrumb-item"><button type="button" className="btn btn-link p-0" style={{ fontSize: "inherit", textDecoration: "none" }} onClick={() => navigate("/events")}>Events</button></li>
            <li className="breadcrumb-item"><button type="button" className="btn btn-link p-0" style={{ fontSize: "inherit", textDecoration: "none" }} onClick={() => navigate(`/events/${eventId}/upload`)}>{selectedEvent.eventName}</button></li>
            <li className="breadcrumb-item active">Generate Pass</li>
          </ol>
        </nav>
        <div>
          <span className="fw-bold" style={{ fontSize: 15 }}>Pass Designer</span>
          <span className="text-muted ms-2" style={{ fontSize: 12 }}>{selectedEvent.eventName} · {eventAttendees.length} registrants</span>
        </div>
      </div>

      {/* Category Tabs */}
      {categories.length > 0 && (
        <div style={{ padding: "8px 16px", background: "var(--background)", borderBottom: "1px solid var(--border)", display: "flex", gap: 8, overflowX: "auto", overflowY: "visible", position: "relative", zIndex: 100 }}>
          {categories.map((cat) => {
            // Get category color from event
            const eventCats = selectedEvent?.categories || [];
            const catColor = eventCats.find(c => c.label?.toLowerCase() === cat.toLowerCase())?.color || "var(--primary)";

            const handleCopyColor = (e) => {
              e.stopPropagation();
              navigator.clipboard.writeText(catColor);
              setCopiedCategory(cat);
              setTimeout(() => setCopiedCategory(null), 2000);
            };

            return (
              <div key={cat} style={{ display: "flex", alignItems: "center", gap: 2 }}>
                <button onClick={() => switchCategory(cat)}
                  title={`${cat} - Color: ${catColor}`}
                  style={{
                    padding: "6px 16px",
                    borderRadius: 6,
                    border: activeCatName === cat ? `2px solid #000` : `1px solid rgba(0,0,0,0.2)`,
                    background: catColor,
                    color: "var(--card)",
                    cursor: "pointer",
                    fontSize: 12,
                    fontWeight: activeCatName === cat ? 700 : 500,
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                    transition: "all 0.2s",
                    boxShadow: activeCatName === cat ? "0 2px 8px rgba(0,0,0,0.2)" : "none"
                  }}>
                  {cat}
                </button>

                {/* Copy Icon Only */}
                <button
                  onClick={handleCopyColor}
                  title={copiedCategory === cat ? "Copied!" : `Copy ${catColor}`}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "var(--foreground)",
                    cursor: "pointer",
                    fontSize: 16,
                    flexShrink: 0,
                    transition: "all 0.2s",
                    padding: 0,
                    width: "auto",
                    height: "auto"
                  }}
                >
                  {copiedCategory === cat ? <span style={{ color: "#22c55e", fontWeight: "bold" }}>✓</span> : <i className="bi bi-copy" />}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Toolbar (Clean Layout) */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", background: "var(--card)", borderBottom: "1px solid var(--border)", overflowX: "auto" }}>
        {/* Add elements with labels - scrollable if needed */}
        <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
          {ELEMENT_BTNS.map(({ type, icon, label }) => (
            <button key={type} onClick={() => addElement(type)}
              title={`Add ${label}`}
              style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 8px", height: 32, borderRadius: 6, border: "1px solid var(--border)", background: "var(--background)", color: "var(--foreground)", cursor: "pointer", fontSize: 11, fontWeight: 500, whiteSpace: "nowrap", flexShrink: 0 }}>
              <i className={`bi ${icon}`} />
              {label}
            </button>
          ))}
        </div>

        <div style={{ flex: 1, minWidth: 0 }} />

        {/* Save Button */}
        <button onClick={handleSave} disabled={isSaving}
          style={{ height: 32, borderRadius: 6, border: "none", background: "linear-gradient(135deg,var(--primary),var(--primary))", color: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 600, padding: "0 16px", display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
          {isSaving ? <><span className="spinner-border spinner-border-sm" /> Saving…</> : <><i className="bi bi-floppy" /> Save</>}
        </button>
      </div>

      {/* Editor */}
      <div style={{ display: "flex", flex: 1, gap: 0, minHeight: 0, overflow: "hidden" }}>
        {/* Left Panel (EXACT COPY from PassTemplateEditor) */}
        <div style={{ width: 200, background: "var(--card)", borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {/* Pass Designs - At Top */}
          <div style={{ padding: "10px 12px", borderBottom: "1px solid var(--border)" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted-foreground)", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>Pass Designs</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <button onClick={() => {
                const designs = generateProfessionalPassDesign(selectedEvent);
                setElements(designs);
                setSelectedIds([]);
                setTimeout(captureHistory, 0);
              }}
                style={{ fontSize: 10, padding: "6px 8px", borderRadius: 4, border: "1px solid var(--border)", background: "var(--background)", cursor: "pointer", color: "var(--muted-foreground)", fontWeight: 500 }}>
                Professional
              </button>
              <button onClick={() => {
                const designs = generateModernPassDesign(selectedEvent);
                setElements(designs);
                setSelectedIds([]);
                setTimeout(captureHistory, 0);
              }}
                style={{ fontSize: 10, padding: "6px 8px", borderRadius: 4, border: "1px solid var(--border)", background: "var(--background)", cursor: "pointer", color: "var(--muted-foreground)", fontWeight: 500 }}>
                Modern
              </button>
              <button onClick={() => {
                const designs = generateMinimalPassDesign(selectedEvent);
                setElements(designs);
                setSelectedIds([]);
                setTimeout(captureHistory, 0);
              }}
                style={{ fontSize: 10, padding: "6px 8px", borderRadius: 4, border: "1px solid var(--border)", background: "var(--background)", cursor: "pointer", color: "var(--muted-foreground)", fontWeight: 500 }}>
                Minimal
              </button>
            </div>
          </div>

          {/* Canvas settings */}
          <div style={{ padding: "10px 12px", borderBottom: "1px solid var(--border)" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted-foreground)", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>Canvas</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, marginBottom: 6 }}>
              <div><span style={{ fontSize: 10, color: "var(--muted-foreground)" }}>Width</span>
                <NumInput value={canvas.width} min={100} max={2000} onChange={(v) => setCanvas((c) => ({ ...c, width: v }))} /></div>
              <div><span style={{ fontSize: 10, color: "var(--muted-foreground)" }}>Height</span>
                <NumInput value={canvas.height} min={100} max={3000} onChange={(v) => setCanvas((c) => ({ ...c, height: v }))} /></div>
            </div>
            <div style={{ marginBottom: 6 }}>
              <span style={{ fontSize: 10, color: "var(--muted-foreground)" }}>Background</span>
              <ColorInput value={canvas.background} onChange={(v) => setCanvas((c) => ({ ...c, background: v }))} />
            </div>
            <div style={{ marginBottom: 6 }}>
              <span style={{ fontSize: 10, color: "var(--muted-foreground)" }}>Border Radius</span>
              <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
                <input type="number" value={canvas.borderRadius || 0} min={0} max={100} onChange={(e) => setCanvas((c) => ({ ...c, borderRadius: Number(e.target.value) }))}
                  style={{ width: 56, height: 28, borderRadius: 6, border: "1px solid var(--border)", fontSize: 12, padding: "0 6px", outline: "none" }} />
                <span style={{ fontSize: 10, color: "var(--muted-foreground)" }}>px</span>
              </div>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 3, marginBottom: 10 }}>
              {CANVAS_PRESETS.map((p) => (
                <button key={p.label} onClick={() => setCanvas((c) => ({ ...c, width: p.w, height: p.h }))}
                  style={{ fontSize: 9, padding: "2px 5px", borderRadius: 4, border: "1px solid var(--border)", background: "var(--background)", cursor: "pointer", color: "var(--muted-foreground)" }}>
                  {p.label}
                </button>
              ))}
            </div>
            {/* Use Template */}
            {templates.length > 0 && (
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 10, color: "var(--muted-foreground)", marginBottom: 4, fontWeight: 600, textTransform: "uppercase" }}>Use Template</div>
                <select onChange={(e) => { if (e.target.value) applyTemplate(e.target.value); e.target.value = ""; }}
                  style={{ width: "100%", height: 28, borderRadius: 6, border: "1px solid var(--border)", fontSize: 11, padding: "0 6px" }}>
                  <option value="">— Select template —</option>
                  {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
            )}

            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 10, color: "var(--muted-foreground)", marginBottom: 4, fontWeight: 600, textTransform: "uppercase" }}>Save Template</div>
              <div style={{ display: "flex", gap: 4 }}>
                <input
                  type="text"
                  value={templateNameInput}
                  onChange={(e) => setTemplateNameInput(e.target.value)}
                  placeholder="Template name…"
                  style={{ flex: 1, height: 28, borderRadius: 6, border: "1px solid var(--border)", fontSize: 11, padding: "0 8px" }}
                />
              </div>
              <button onClick={handleSaveAsTemplate} disabled={isSaving || !templateNameInput.trim()} style={{
                width: "100%", height: 28, marginTop: 4, borderRadius: 6, border: "none",
                background: !templateNameInput.trim() ? "#cbd5e1" : "linear-gradient(135deg,var(--primary),var(--primary))",
                color: "var(--card)",
                cursor: !templateNameInput.trim() ? "not-allowed" : "pointer",
                fontSize: 11, fontWeight: 600, display: "flex",
                alignItems: "center", justifyContent: "center", gap: 4
              }}>
                {isSaving ? <><span className="spinner-border spinner-border-sm" /> Saving…</> : <><i className="bi bi-floppy" /> Save Template</>}
              </button>
            </div>
          </div>

          {/* Layers */}
          <div style={{ padding: "8px 12px 4px", fontWeight: 700, fontSize: 11, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: 0.5 }}>
            Layers ({elements.length})
          </div>
          <div style={{ flex: 1, overflowY: "auto" }}>
            {[...elements].filter(Boolean).reverse().map((el) => (
              <div key={el.id}
                onClick={(e) => {
                  if (e.ctrlKey || e.metaKey) {
                    setSelectedIds((prev) =>
                      prev.includes(el.id) ? prev.filter((id) => id !== el.id) : [...prev, el.id]
                    );
                  } else {
                    setSelectedIds([el.id]);
                  }
                }}
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 12px", cursor: "pointer",
                  background: selectedIds.includes(el.id) ? "var(--accent)" : "transparent",
                  borderLeft: `3px solid ${selectedIds.includes(el.id) ? "var(--primary)" : "transparent"}` }}>
                <i className={`bi ${DEFAULT_ELEMENT[el.type]?.icon}`} style={{ fontSize: 12, color: selectedIds.includes(el.id) ? "var(--primary)" : "var(--muted-foreground)", flexShrink: 0 }} />
                <span style={{ fontSize: 11, color: "var(--foreground)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {el.content?.replace(/\{\{[^}]+\}\}/g, "…") || el.label || el.type}
                </span>
                {el.locked && <i className="bi bi-lock-fill" style={{ fontSize: 10, color: "var(--muted-foreground)" }} />}
              </div>
            ))}
            {elements.length === 0 && (
              <div style={{ padding: 16, fontSize: 11, color: "var(--muted-foreground)", textAlign: "center" }}>
                Add elements from toolbar
              </div>
            )}
          </div>
        </div>

        {/* Center Canvas */}
        <div style={{ flex: 1, background: "var(--border)", position: "relative", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", overflow: "auto", padding: "24px" }}>
          {/* Canvas with Zoom Wrapper */}
          <div style={{ width: canvas.width * zoom, height: canvas.height * zoom, flexShrink: 0, position: "relative" }}>
            <div
              ref={canvasRef}
              onMouseDown={onCanvasMouseDown}
              style={{
                position: "absolute",
                top: 0, left: 0,
                width: canvas.width,
                height: canvas.height,
                background: canvas.background,
                borderRadius: canvas.borderRadius || 0,
                boxShadow: "0 4px 30px rgba(0,0,0,0.15)",
                transform: `scale(${zoom})`, transformOrigin: "top left",
                backgroundImage: "radial-gradient(#cbd5e1 0.5px, transparent 0.5px)", backgroundSize: "16px 16px",
                cursor: "default", userSelect: "none"
              }}>
              {elements.map(el => <CanvasEl key={el.id} el={el} selected={selectedIds.includes(el.id)} />)}
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div style={{ width: 240, background: "var(--card)", borderLeft: "1px solid var(--border)", overflow: "hidden" }}>
          <PropertiesPanel el={selectedElement} selectedElements={selectedElements} onChange={updateElement} onDelete={deleteSelected} onDuplicate={duplicateSelected} onBring={bringForward} onSend={sendBackward} canvasState={canvas} alignElements={alignElements} distributeHorizontally={distributeHorizontally} distributeVertically={distributeVertically} />
        </div>
      </div>
    </div>
  );
};

export default PassDesignerPageV2;
