import React, { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "react-toastify";
import {
  fetchPassTemplates,
  createPassTemplate,
  updatePassTemplate,
  deletePassTemplate,
} from "../services/api";

// ── Constants ─────────────────────────────────────────────────────────────────

const DYNAMIC_FIELDS = [
  { key: "{{name}}", label: "Attendee Name" },
  { key: "{{email}}", label: "Email" },
  { key: "{{phone}}", label: "Phone" },
  { key: "{{passId}}", label: "Pass ID" },
  { key: "{{category}}", label: "Category" },
  { key: "{{eventName}}", label: "Event Name" },
  { key: "{{venue}}", label: "Venue" },
  { key: "{{startDate}}", label: "Start Date" },
  { key: "{{endDate}}", label: "End Date" },
];

const FONTS = [
  "Inter, sans-serif",
  "Arial, sans-serif",
  "Georgia, serif",
  "Courier New, monospace",
  "Verdana, sans-serif",
  "Trebuchet MS, sans-serif",
  "Times New Roman, serif",
  "Impact, sans-serif",
];

const CANVAS_PRESETS = [
  { label: "Badge (400×600)", w: 400, h: 600 },
  { label: "Card (350×200)", w: 350, h: 200 },
  { label: "Ticket (600×250)", w: 600, h: 250 },
  { label: "A5 (420×595)", w: 420, h: 595 },
];

const uid = () => Math.random().toString(36).slice(2, 9);

const DEFAULT_ELEMENT = {
  text: {
    w: 200,
    h: 36,
    label: "Text",
    icon: "bi-type-h1",
    content: "Text Here",
    fontSize: 16,
    fontWeight: "400",
    fontFamily: "Inter, sans-serif",
    fontStyle: "normal",
    textDecoration: "none",
    color: "#1e293b",
    textAlign: "left",
    lineHeight: 1.4,
    bg: "transparent",
    borderRadius: 0,
    borderWidth: 0,
    borderColor: "var(--border)",
    borderStyle: "solid",
    paddingX: 0,
    paddingY: 0,
    opacity: 1,
  },
  header: {
    w: 400,
    h: 72,
    label: "Header",
    icon: "bi-layout-text-window",
    content: "Event Header",
    fontSize: 22,
    fontWeight: "700",
    fontFamily: "Inter, sans-serif",
    fontStyle: "normal",
    textDecoration: "none",
    color: "var(--card)",
    textAlign: "center",
    lineHeight: 1.3,
    bg: "var(--primary)",
    borderRadius: 0,
    borderWidth: 0,
    borderColor: "transparent",
    borderStyle: "solid",
    paddingX: 16,
    paddingY: 16,
    opacity: 1,
  },
  footer: {
    w: 400,
    h: 48,
    label: "Footer",
    icon: "bi-layout-text-sidebar-reverse",
    content: "Event Footer",
    fontSize: 12,
    fontWeight: "400",
    fontFamily: "Inter, sans-serif",
    fontStyle: "normal",
    textDecoration: "none",
    color: "var(--muted-foreground)",
    textAlign: "center",
    lineHeight: 1.4,
    bg: "var(--background)",
    borderRadius: 0,
    borderWidth: 0,
    borderColor: "transparent",
    borderStyle: "solid",
    paddingX: 8,
    paddingY: 8,
    opacity: 1,
  },
  qr: {
    w: 100,
    h: 100,
    label: "QR Code",
    icon: "bi-qr-code",
    content: "{{passId}}",
    fontSize: 10,
    fontWeight: "400",
    fontFamily: "Inter, sans-serif",
    fontStyle: "normal",
    textDecoration: "none",
    color: "#000000",
    textAlign: "center",
    lineHeight: 1,
    bg: "var(--card)",
    borderRadius: 4,
    borderWidth: 0,
    borderColor: "var(--border)",
    borderStyle: "solid",
    paddingX: 4,
    paddingY: 4,
    opacity: 1,
  },
  image: {
    w: 140,
    h: 140,
    label: "Image",
    icon: "bi-image",
    content: "",
    imageUrl: "",
    objectFit: "cover",
    fontSize: 12,
    fontWeight: "400",
    fontFamily: "Inter, sans-serif",
    fontStyle: "normal",
    textDecoration: "none",
    color: "var(--muted-foreground)",
    textAlign: "center",
    lineHeight: 1,
    bg: "var(--border)",
    borderRadius: 8,
    borderWidth: 0,
    borderColor: "var(--border)",
    borderStyle: "solid",
    paddingX: 0,
    paddingY: 0,
    opacity: 1,
  },
  logo: {
    w: 80,
    h: 80,
    label: "Logo",
    icon: "bi-patch-check",
    content: "",
    imageUrl: "",
    objectFit: "contain",
    fontSize: 12,
    fontWeight: "400",
    fontFamily: "Inter, sans-serif",
    fontStyle: "normal",
    textDecoration: "none",
    color: "var(--muted-foreground)",
    textAlign: "center",
    lineHeight: 1,
    bg: "transparent",
    borderRadius: 0,
    borderWidth: 0,
    borderColor: "transparent",
    borderStyle: "solid",
    paddingX: 0,
    paddingY: 0,
    opacity: 1,
  },
  card: {
    w: 340,
    h: 80,
    label: "Card",
    icon: "bi-card-text",
    content: "",
    fontSize: 13,
    fontWeight: "400",
    fontFamily: "Inter, sans-serif",
    fontStyle: "normal",
    textDecoration: "none",
    color: "#1e293b",
    textAlign: "left",
    lineHeight: 1.4,
    bg: "var(--background)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "var(--border)",
    borderStyle: "solid",
    paddingX: 12,
    paddingY: 12,
    opacity: 1,
  },
  divider: {
    w: 360,
    h: 2,
    label: "Divider",
    icon: "bi-dash-lg",
    content: "",
    fontSize: 0,
    fontWeight: "400",
    fontFamily: "Inter, sans-serif",
    fontStyle: "normal",
    textDecoration: "none",
    color: "transparent",
    textAlign: "left",
    lineHeight: 1,
    bg: "var(--border)",
    borderRadius: 0,
    borderWidth: 0,
    borderColor: "transparent",
    borderStyle: "solid",
    paddingX: 0,
    paddingY: 0,
    opacity: 1,
  },
};

const makeElement = (type, x = 40, y = 40) => ({
  id: uid(),
  type,
  x,
  y,
  w: DEFAULT_ELEMENT[type].w,
  h: DEFAULT_ELEMENT[type].h,
  zIndex: 1,
  locked: false,
  ...DEFAULT_ELEMENT[type],
});

// ── Resize handles ────────────────────────────────────────────────────────────
const HANDLES = ["nw", "n", "ne", "e", "se", "s", "sw", "w"];
const handleCursor = {
  nw: "nw-resize",
  n: "n-resize",
  ne: "ne-resize",
  e: "e-resize",
  se: "se-resize",
  s: "s-resize",
  sw: "sw-resize",
  w: "w-resize",
};

// ── Canvas Element renderer (purely visual — all events at canvas level) ────
const CanvasEl = ({ el, selected }) => {
  const isText = ["text", "header", "footer", "card"].includes(el.type);
  const isMedia = ["image", "logo"].includes(el.type);

  const hPos = (h) => {
    const s = {
      position: "absolute",
      width: 8,
      height: 8,
      borderRadius: 2,
      background: "var(--primary)",
      border: "2px solid var(--card)",
      zIndex: 10,
      boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
      pointerEvents: "none",
    };
    if (h === "nw") return { ...s, top: -4, left: -4 };
    if (h === "n")
      return { ...s, top: -4, left: "50%", transform: "translateX(-50%)" };
    if (h === "ne") return { ...s, top: -4, right: -4 };
    if (h === "e")
      return { ...s, top: "50%", right: -4, transform: "translateY(-50%)" };
    if (h === "se") return { ...s, bottom: -4, right: -4 };
    if (h === "s")
      return { ...s, bottom: -4, left: "50%", transform: "translateX(-50%)" };
    if (h === "sw") return { ...s, bottom: -4, left: -4 };
    if (h === "w")
      return { ...s, top: "50%", left: -4, transform: "translateY(-50%)" };
  };

  return (
    <div
      style={{
        position: "absolute",
        left: el.x,
        top: el.y,
        width: el.w,
        height: el.h,
        zIndex: (el.zIndex || 1) + 1 + (selected ? 1000 : 0),
        opacity: el.opacity ?? 1,
        background: el.bg,
        borderRadius: el.borderRadius,
        border:
          (el.borderWidth || 0) > 0
            ? `${el.borderWidth}px ${el.borderStyle} ${el.borderColor}`
            : "none",
        boxSizing: "border-box",
        outline: selected ? "2px solid var(--primary)" : "none",
        outlineOffset: 2,
        overflow: "visible",
        pointerEvents: "none",
        userSelect: "none",
      }}
    >
      {/* Inner clip div for content */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          overflow: "hidden",
          borderRadius: el.borderRadius,
        }}
      >
        {el.type === "qr" && (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 4,
            }}
          >
            <i
              className="bi bi-qr-code"
              style={{
                fontSize: Math.min(el.w, el.h) * 0.55,
                color: "#1e293b",
              }}
            />
            <span style={{ fontSize: 9, color: "var(--muted-foreground)" }}>
              {el.content || "{{passId}}"}
            </span>
          </div>
        )}
        {isMedia &&
          (el.imageUrl ? (
            <img
              src={el.imageUrl}
              alt=""
              style={{
                width: "100%",
                height: "100%",
                objectFit: el.objectFit,
                display: "block",
              }}
            />
          ) : (
            <div
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                gap: 4,
              }}
            >
              <i
                className={`bi ${el.type === "logo" ? "bi-patch-check" : "bi-image"}`}
                style={{ fontSize: 28, color: "#cbd5e1" }}
              />
              <span style={{ fontSize: 10, color: "var(--muted-foreground)" }}>{el.label}</span>
            </div>
          ))}
        {el.type === "divider" && (
          <div style={{ width: "100%", height: "100%", background: el.bg }} />
        )}
        {isText && (
          <div
            style={{
              width: "100%",
              height: "100%",
              padding: `${el.paddingY}px ${el.paddingX}px`,
              fontSize: el.fontSize,
              fontWeight: el.fontWeight,
              fontFamily: el.fontFamily,
              fontStyle: el.fontStyle,
              textDecoration: el.textDecoration,
              color: el.color,
              textAlign: el.textAlign,
              lineHeight: el.lineHeight,
              display: "flex",
              alignItems: "center",
              justifyContent:
                el.textAlign === "center"
                  ? "center"
                  : el.textAlign === "right"
                    ? "flex-end"
                    : "flex-start",
              overflow: "hidden",
              boxSizing: "border-box",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            {el.content || (
              <span style={{ color: "#cbd5e1", fontStyle: "italic" }}>
                Empty…
              </span>
            )}
          </div>
        )}
      </div>
      {/* Resize handle dots (visual only) */}
      {selected &&
        !el.locked &&
        HANDLES.map((h) => <div key={h} style={hPos(h)} />)}
    </div>
  );
};

// ── Properties Panel ──────────────────────────────────────────────────────────
const PropRow = ({ label, children }) => (
  <div className="mb-2">
    <label
      style={{
        fontSize: 11,
        fontWeight: 600,
        color: "var(--muted-foreground)",
        display: "block",
        marginBottom: 3,
        textTransform: "uppercase",
        letterSpacing: 0.5,
      }}
    >
      {label}
    </label>
    {children}
  </div>
);

const NumInput = ({
  value,
  onChange,
  min = 0,
  max = 9999,
  step = 1,
  suffix,
}) => (
  <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
    <input
      type="number"
      value={value}
      min={min}
      max={max}
      step={step}
      onChange={(e) => onChange(Number(e.target.value))}
      style={{
        width: suffix ? 56 : 72,
        height: 28,
        borderRadius: 6,
        border: "1px solid var(--border)",
        fontSize: 12,
        padding: "0 6px",
        outline: "none",
      }}
    />
    {suffix && <span style={{ fontSize: 10, color: "var(--muted-foreground)" }}>{suffix}</span>}
  </div>
);

const ColorInput = ({ value, onChange }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
    <input
      type="color"
      value={value === "transparent" ? "var(--card)" : value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        width: 28,
        height: 28,
        borderRadius: 6,
        border: "1px solid var(--border)",
        cursor: "pointer",
        padding: 2,
      }}
    />
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        width: 80,
        height: 28,
        borderRadius: 6,
        border: "1px solid var(--border)",
        fontSize: 11,
        padding: "0 6px",
        fontFamily: "monospace",
      }}
    />
    <button
      type="button"
      title="Transparent"
      onClick={() => onChange("transparent")}
      style={{
        width: 28,
        height: 28,
        borderRadius: 6,
        border: "1px solid var(--border)",
        background: "var(--card)",
        cursor: "pointer",
        fontSize: 11,
      }}
    >
      ✕
    </button>
  </div>
);

const SelectInput = ({ value, onChange, options }) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    style={{
      width: "100%",
      height: 28,
      borderRadius: 6,
      border: "1px solid var(--border)",
      fontSize: 12,
      padding: "0 6px",
    }}
  >
    {options.map((o) => (
      <option key={o.value ?? o} value={o.value ?? o}>
        {o.label ?? o}
      </option>
    ))}
  </select>
);

const PropertiesPanel = ({
  el,
  onChange,
  onDelete,
  onDuplicate,
  onBring,
  onSend,
  canvasState,
  onCanvasChange,
}) => {
  if (!el)
    return (
      <div style={{ padding: 16 }}>
        <div
          style={{
            fontSize: 12,
            color: "var(--muted-foreground)",
            textAlign: "center",
            marginTop: 40,
          }}
        >
          <i
            className="bi bi-cursor"
            style={{ fontSize: 28, display: "block", marginBottom: 8 }}
          />
          Click an element to edit its properties
        </div>
      </div>
    );

  const p = (key) => (val) => onChange({ ...el, [key]: val });
  const isText = ["text", "header", "footer", "card"].includes(el.type);
  const isMedia = ["image", "logo"].includes(el.type);

  return (
    <div style={{ padding: 12, overflowY: "auto", height: "100%" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 12,
          paddingBottom: 10,
          borderBottom: "1px solid var(--border)",
        }}
      >
        <span
          style={{
            fontWeight: 700,
            fontSize: 13,
            color: "#1e293b",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <i
            className={`bi ${DEFAULT_ELEMENT[el.type]?.icon}`}
            style={{ color: "var(--primary)" }}
          />
          {el.label || el.type}
        </span>
        <div style={{ display: "flex", gap: 4 }}>
          <button
            onClick={onDuplicate}
            title="Duplicate"
            style={btnStyle("var(--border)", "var(--foreground)")}
          >
            <i className="bi bi-copy" />
          </button>
          <button
            onClick={onDelete}
            title="Delete"
            style={btnStyle("oklch(var(--destructive-h) var(--destructive-s) var(--destructive-l) / 10%)", "#dc2626")}
          >
            <i className="bi bi-trash" />
          </button>
        </div>
      </div>

      {/* Lock */}
      <PropRow label="State">
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 12,
            cursor: "pointer",
          }}
        >
          <input
            type="checkbox"
            checked={el.locked}
            onChange={(e) => onChange({ ...el, locked: e.target.checked })}
          />
          Lock element
        </label>
      </PropRow>

      {/* Position & Size */}
      <div
        style={{
          background: "var(--background)",
          borderRadius: 8,
          padding: 10,
          marginBottom: 10,
        }}
      >
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: "var(--muted-foreground)",
            marginBottom: 8,
            textTransform: "uppercase",
            letterSpacing: 0.5,
          }}
        >
          Position & Size
        </div>
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}
        >
          <div>
            <span style={{ fontSize: 10, color: "var(--muted-foreground)" }}>X</span>
            <NumInput value={Math.round(el.x)} onChange={p("x")} />
          </div>
          <div>
            <span style={{ fontSize: 10, color: "var(--muted-foreground)" }}>Y</span>
            <NumInput value={Math.round(el.y)} onChange={p("y")} />
          </div>
          <div>
            <span style={{ fontSize: 10, color: "var(--muted-foreground)" }}>W</span>
            <NumInput value={Math.round(el.w)} min={10} onChange={p("w")} />
          </div>
          <div>
            <span style={{ fontSize: 10, color: "var(--muted-foreground)" }}>H</span>
            <NumInput value={Math.round(el.h)} min={4} onChange={p("h")} />
          </div>
        </div>
      </div>

      {/* Alignment */}
      <div
        style={{
          background: "var(--background)",
          borderRadius: 8,
          padding: 10,
          marginBottom: 10,
        }}
      >
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: "var(--muted-foreground)",
            marginBottom: 8,
            textTransform: "uppercase",
            letterSpacing: 0.5,
          }}
        >
          Alignment
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 4,
            marginBottom: 8,
          }}
        >
          <button
            onClick={() => onChange({ ...el, x: 0 })}
            style={{ ...smallBtn, fontSize: 10 }}
            title="Align Left"
          >
            <i className="bi bi-align-start" />
          </button>
          <button
            onClick={() =>
              onChange({ ...el, x: (canvasState.width - el.w) / 2 })
            }
            style={{ ...smallBtn, fontSize: 10 }}
            title="Center X"
          >
            <i className="bi bi-distribute-horizontal" />
          </button>
          <button
            onClick={() => onChange({ ...el, x: canvasState.width - el.w })}
            style={{ ...smallBtn, fontSize: 10 }}
            title="Align Right"
          >
            <i className="bi bi-align-end" />
          </button>
          <button
            onClick={() => onChange({ ...el, y: 0 })}
            style={{ ...smallBtn, fontSize: 10 }}
            title="Align Top"
          >
            <i className="bi bi-align-top" />
          </button>
          <button
            onClick={() =>
              onChange({
                ...el,
                x: (canvasState.width - el.w) / 2,
                y: (canvasState.height - el.h) / 2,
              })
            }
            style={{
              ...smallBtn,
              fontSize: 10,
              background: "var(--accent)",
              color: "var(--primary)",
              border: "1px solid #e9d5ff",
            }}
            title="Center"
          >
            <i className="bi bi-bullseye" />
          </button>
          <button
            onClick={() => onChange({ ...el, y: canvasState.height - el.h })}
            style={{ ...smallBtn, fontSize: 10 }}
            title="Align Bottom"
          >
            <i className="bi bi-align-bottom" />
          </button>
        </div>
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}
        >
          <button
            onClick={() =>
              onChange({ ...el, y: (canvasState.height - el.h) / 2 })
            }
            style={{ ...smallBtn, fontSize: 10 }}
            title="Center Y"
          >
            <i className="bi bi-distribute-vertical" /> Center Y
          </button>
          <button
            onClick={() =>
              onChange({ ...el, x: (canvasState.width - el.w) / 2 })
            }
            style={{ ...smallBtn, fontSize: 10 }}
            title="Center X"
          >
            <i className="bi bi-distribute-horizontal" /> Center X
          </button>
        </div>
      </div>

      {/* Layer */}
      <div
        style={{
          background: "var(--background)",
          borderRadius: 8,
          padding: 10,
          marginBottom: 10,
        }}
      >
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: "var(--muted-foreground)",
            marginBottom: 8,
            textTransform: "uppercase",
            letterSpacing: 0.5,
          }}
        >
          Layer
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={onBring} style={{ flex: 1, ...smallBtn }}>
            <i className="bi bi-layers-fill me-1" />
            Bring Forward
          </button>
          <button onClick={onSend} style={{ flex: 1, ...smallBtn }}>
            <i className="bi bi-layers me-1" />
            Send Back
          </button>
        </div>
        <div style={{ marginTop: 8 }}>
          <span style={{ fontSize: 10, color: "var(--muted-foreground)" }}>
            Z-Index: {el.zIndex}
          </span>
        </div>
      </div>

      {/* Appearance */}
      <div
        style={{
          background: "var(--background)",
          borderRadius: 8,
          padding: 10,
          marginBottom: 10,
        }}
      >
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: "var(--muted-foreground)",
            marginBottom: 8,
            textTransform: "uppercase",
            letterSpacing: 0.5,
          }}
        >
          Appearance
        </div>
        <PropRow label="Background">
          <ColorInput value={el.bg || "transparent"} onChange={p("bg")} />
        </PropRow>
        <PropRow label="Border Radius">
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <input
              type="range"
              min={0}
              max={60}
              value={el.borderRadius}
              onChange={(e) => p("borderRadius")(Number(e.target.value))}
              style={{ flex: 1 }}
            />
            <NumInput
              value={el.borderRadius}
              min={0}
              max={200}
              suffix="px"
              onChange={p("borderRadius")}
            />
          </div>
        </PropRow>
        <PropRow label="Border Width">
          <NumInput
            value={el.borderWidth}
            min={0}
            max={20}
            suffix="px"
            onChange={p("borderWidth")}
          />
        </PropRow>
        {el.borderWidth > 0 && (
          <>
            <PropRow label="Border Color">
              <ColorInput value={el.borderColor} onChange={p("borderColor")} />
            </PropRow>
            <PropRow label="Border Style">
              <SelectInput
                value={el.borderStyle}
                onChange={p("borderStyle")}
                options={["solid", "dashed", "dotted", "double"]}
              />
            </PropRow>
          </>
        )}
        <PropRow label="Opacity">
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={el.opacity}
              onChange={(e) => p("opacity")(Number(e.target.value))}
              style={{ flex: 1 }}
            />
            <span style={{ fontSize: 11, color: "var(--muted-foreground)", width: 32 }}>
              {Math.round(el.opacity * 100)}%
            </span>
          </div>
        </PropRow>
      </div>

      {/* Text */}
      {isText && (
        <div
          style={{
            background: "var(--background)",
            borderRadius: 8,
            padding: 10,
            marginBottom: 10,
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "var(--muted-foreground)",
              marginBottom: 8,
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            Text
          </div>
          <PropRow label="Content">
            <textarea
              value={el.content}
              onChange={(e) => onChange({ ...el, content: e.target.value })}
              rows={3}
              style={{
                width: "100%",
                borderRadius: 6,
                border: "1px solid var(--border)",
                fontSize: 12,
                padding: "6px 8px",
                resize: "vertical",
              }}
            />
          </PropRow>
          <PropRow label="Insert Dynamic Field">
            <select
              onChange={(e) => {
                if (e.target.value)
                  onChange({
                    ...el,
                    content: (el.content || "") + e.target.value,
                  });
                e.target.value = "";
              }}
              style={{
                width: "100%",
                height: 28,
                borderRadius: 6,
                border: "1px solid var(--border)",
                fontSize: 12,
                padding: "0 6px",
              }}
            >
              <option value="">— Insert field —</option>
              {DYNAMIC_FIELDS.map((f) => (
                <option key={f.key} value={f.key}>
                  {f.label} ({f.key})
                </option>
              ))}
            </select>
          </PropRow>
          <PropRow label="Font Family">
            <SelectInput
              value={el.fontFamily}
              onChange={p("fontFamily")}
              options={FONTS}
            />
          </PropRow>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 8,
              marginBottom: 8,
            }}
          >
            <div>
              <PropRow label="Size">
                <NumInput
                  value={el.fontSize}
                  min={6}
                  max={120}
                  suffix="px"
                  onChange={p("fontSize")}
                />
              </PropRow>
            </div>
            <div>
              <PropRow label="Line Height">
                <NumInput
                  value={el.lineHeight}
                  min={0.8}
                  max={4}
                  step={0.1}
                  onChange={p("lineHeight")}
                />
              </PropRow>
            </div>
          </div>
          <PropRow label="Weight">
            <div style={{ display: "flex", gap: 4 }}>
              {[
                ["100", "Thin"],
                ["400", "Regular"],
                ["600", "Semi"],
                ["700", "Bold"],
                ["900", "Black"],
              ].map(([v, l]) => (
                <button
                  key={v}
                  onClick={() => p("fontWeight")(v)}
                  style={{
                    flex: 1,
                    height: 26,
                    borderRadius: 5,
                    border: `1px solid ${el.fontWeight === v ? "var(--primary)" : "var(--border)"}`,
                    background: el.fontWeight === v ? "var(--accent)" : "var(--card)",
                    color: el.fontWeight === v ? "var(--primary)" : "var(--foreground)",
                    cursor: "pointer",
                    fontSize: 10,
                    fontWeight: v,
                  }}
                >
                  {l}
                </button>
              ))}
            </div>
          </PropRow>
          <PropRow label="Style">
            <div style={{ display: "flex", gap: 4 }}>
              {[
                ["normal", "N"],
                ["italic", "I"],
                ["oblique", "O"],
              ].map(([v, l]) => (
                <button
                  key={v}
                  onClick={() => p("fontStyle")(v)}
                  style={{
                    width: 30,
                    height: 26,
                    borderRadius: 5,
                    border: `1px solid ${el.fontStyle === v ? "var(--primary)" : "var(--border)"}`,
                    background: el.fontStyle === v ? "var(--accent)" : "var(--card)",
                    color: el.fontStyle === v ? "var(--primary)" : "var(--foreground)",
                    cursor: "pointer",
                    fontSize: 12,
                    fontStyle: v,
                  }}
                >
                  {l}
                </button>
              ))}
              <button
                onClick={() =>
                  p("textDecoration")(
                    el.textDecoration === "underline" ? "none" : "underline",
                  )
                }
                style={{
                  width: 30,
                  height: 26,
                  borderRadius: 5,
                  border: `1px solid ${el.textDecoration === "underline" ? "var(--primary)" : "var(--border)"}`,
                  background:
                    el.textDecoration === "underline" ? "var(--accent)" : "var(--card)",
                  color:
                    el.textDecoration === "underline" ? "var(--primary)" : "var(--foreground)",
                  cursor: "pointer",
                  fontSize: 12,
                  textDecoration: "underline",
                }}
              >
                U
              </button>
            </div>
          </PropRow>
          <PropRow label="Alignment">
            <div style={{ display: "flex", gap: 4 }}>
              {[
                ["left", "bi-text-left"],
                ["center", "bi-text-center"],
                ["right", "bi-text-right"],
              ].map(([v, ic]) => (
                <button
                  key={v}
                  onClick={() => p("textAlign")(v)}
                  style={{
                    flex: 1,
                    height: 26,
                    borderRadius: 5,
                    border: `1px solid ${el.textAlign === v ? "var(--primary)" : "var(--border)"}`,
                    background: el.textAlign === v ? "var(--accent)" : "var(--card)",
                    color: el.textAlign === v ? "var(--primary)" : "var(--foreground)",
                    cursor: "pointer",
                  }}
                >
                  <i className={`bi ${ic}`} />
                </button>
              ))}
            </div>
          </PropRow>
          <PropRow label="Text Color">
            <ColorInput value={el.color} onChange={p("color")} />
          </PropRow>
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}
          >
            <PropRow label="Pad X">
              <NumInput
                value={el.paddingX}
                min={0}
                max={60}
                suffix="px"
                onChange={p("paddingX")}
              />
            </PropRow>
            <PropRow label="Pad Y">
              <NumInput
                value={el.paddingY}
                min={0}
                max={60}
                suffix="px"
                onChange={p("paddingY")}
              />
            </PropRow>
          </div>
        </div>
      )}

      {/* Image/Logo */}
      {isMedia && (
        <div
          style={{
            background: "var(--background)",
            borderRadius: 8,
            padding: 10,
            marginBottom: 10,
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "var(--muted-foreground)",
              marginBottom: 8,
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            Image
          </div>
          <PropRow label="Image URL">
            <input
              type="text"
              value={el.imageUrl || ""}
              placeholder="https://... or upload"
              onChange={(e) => onChange({ ...el, imageUrl: e.target.value })}
              style={{
                width: "100%",
                height: 28,
                borderRadius: 6,
                border: "1px solid var(--border)",
                fontSize: 11,
                padding: "0 8px",
              }}
            />
          </PropRow>
          <PropRow label="Dynamic Field">
            <select
              value={el.content || ""}
              onChange={(e) => onChange({ ...el, content: e.target.value })}
              style={{
                width: "100%",
                height: 28,
                borderRadius: 6,
                border: "1px solid var(--border)",
                fontSize: 12,
                padding: "0 6px",
              }}
            >
              <option value="">— Static URL —</option>
              {DYNAMIC_FIELDS.map((f) => (
                <option key={f.key} value={f.key}>
                  {f.label}
                </option>
              ))}
            </select>
          </PropRow>
          <PropRow label="Fit">
            <SelectInput
              value={el.objectFit}
              onChange={p("objectFit")}
              options={["cover", "contain", "fill", "none"]}
            />
          </PropRow>
        </div>
      )}
    </div>
  );
};

const btnStyle = (bg, color) => ({
  width: 28,
  height: 28,
  borderRadius: 6,
  border: `1px solid ${bg}`,
  background: bg,
  color,
  cursor: "pointer",
  fontSize: 12,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});
const smallBtn = {
  height: 26,
  borderRadius: 6,
  border: "1px solid var(--border)",
  background: "var(--card)",
  color: "var(--foreground)",
  cursor: "pointer",
  fontSize: 11,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

// ── Pass Preview Icon ─────────────────────────────────────────────────────────
const PassPreviewIcon = ({ onClick }) => (
  <button
    onClick={onClick}
    style={{
      background: "none",
      border: "none",
      cursor: "pointer",
      padding: 0,
      color: "var(--primary)",
      fontSize: 18,
      display: "flex",
      alignItems: "center",
      justify: "center",
      transition: "all 0.2s",
    }}
    onMouseEnter={(e) => (e.currentTarget.style.color = "var(--primary)")}
    onMouseLeave={(e) => (e.currentTarget.style.color = "var(--primary)")}
  >
    <i className="bi bi-eye" />
  </button>
);

const PassPreviewModal = ({ template, onClose }) => {
  const safeElements = (template.elements || []).filter(Boolean);
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 2000,
      }}
    >
      <div
        style={{
          background: "var(--card)",
          borderRadius: 12,
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
          maxHeight: "90vh",
          overflow: "auto",
          maxWidth: "90vw",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 20px",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <h3
            style={{
              margin: 0,
              fontSize: 16,
              fontWeight: 700,
              color: "var(--foreground)",
            }}
          >
            {template.name}
          </h3>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 20,
              color: "var(--muted-foreground)",
              padding: 0,
            }}
          >
            ✕
          </button>
        </div>
        {/* Preview Canvas */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 40,
            background: "var(--background)",
          }}
        >
          <div
            style={{
              position: "relative",
              width: template.canvas?.width || 400,
              height: template.canvas?.height || 600,
              background: template.canvas?.background || "var(--card)",
              borderRadius: 4,
              boxShadow: "0 4px 30px rgba(0,0,0,0.15)",
              overflow: "hidden",
            }}
          >
            {safeElements.map((el) => (
              <div
                key={el.id}
                style={{
                  position: "absolute",
                  left: el.x,
                  top: el.y,
                  width: el.w,
                  height: el.h,
                  background: el.bg,
                  borderRadius: el.borderRadius,
                  border:
                    el.borderWidth > 0
                      ? `${el.borderWidth}px ${el.borderStyle} ${el.borderColor}`
                      : "none",
                  opacity: el.opacity,
                  overflow: "hidden",
                  boxSizing: "border-box",
                }}
              >
                {["text", "header", "footer", "card"].includes(el.type) && (
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      padding: `${el.paddingY}px ${el.paddingX}px`,
                      fontSize: el.fontSize,
                      fontWeight: el.fontWeight,
                      fontFamily: el.fontFamily,
                      fontStyle: el.fontStyle,
                      textDecoration: el.textDecoration,
                      color: el.color,
                      textAlign: el.textAlign,
                      lineHeight: el.lineHeight,
                      display: "flex",
                      alignItems: "center",
                      justifyContent:
                        el.textAlign === "center"
                          ? "center"
                          : el.textAlign === "right"
                            ? "flex-end"
                            : "flex-start",
                      overflow: "hidden",
                      boxSizing: "border-box",
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                    }}
                  >
                    {el.content}
                  </div>
                )}
                {["image", "logo"].includes(el.type) && el.imageUrl && (
                  <img
                    src={el.imageUrl}
                    alt=""
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: el.objectFit,
                    }}
                  />
                )}
                {el.type === "qr" && (
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 4,
                    }}
                  >
                    <i
                      className="bi bi-qr-code"
                      style={{
                        fontSize: Math.min(el.w, el.h) * 0.55,
                        color: "#1e293b",
                      }}
                    />
                  </div>
                )}
                {el.type === "divider" && (
                  <div
                    style={{ width: "100%", height: "100%", background: el.bg }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Main Editor ───────────────────────────────────────────────────────────────
const PassTemplateEditor = () => {
  const canvasRef = useRef(null);
  const dragRef = useRef(null);
  const resizeRef = useRef(null);
  const historyRef = useRef([]);
  const historyIndexRef = useRef(-1);

  const [elements, setElements] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [canvas, setCanvas] = useState({
    width: 400,
    height: 600,
    background: "var(--card)",
  });
  const [templateName, setTemplateName] = useState("My Pass Template");
  const [templates, setTemplates] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [viewMode, setViewMode] = useState("list");
  const [previewTemplate, setPreviewTemplate] = useState(null);

  // ── History management ─────────────────────────────────────────────────────
  const captureHistory = useCallback(() => {
    historyIndexRef.current += 1;
    historyRef.current = historyRef.current.slice(0, historyIndexRef.current);
    historyRef.current.push({
      elements: JSON.parse(JSON.stringify(elements)),
      canvas: { ...canvas },
    });
  }, [elements, canvas]);

  const undo = useCallback(() => {
    if (historyIndexRef.current <= 0) return;
    historyIndexRef.current -= 1;
    const state = historyRef.current[historyIndexRef.current];
    if (state) {
      setElements(JSON.parse(JSON.stringify(state.elements)));
      setCanvas({ ...state.canvas });
      setSelectedId(null);
    }
  }, []);

  const redo = useCallback(() => {
    if (historyIndexRef.current >= historyRef.current.length - 1) return;
    historyIndexRef.current += 1;
    const state = historyRef.current[historyIndexRef.current];
    if (state) {
      setElements(JSON.parse(JSON.stringify(state.elements)));
      setCanvas({ ...state.canvas });
      setSelectedId(null);
    }
  }, []);

  useEffect(() => {
    fetchPassTemplates()
      .then((data) => setTemplates((data || []).filter(Boolean)))
      .catch(console.error);
  }, []);

  // ── Canvas-level mouse handler (no element-level handlers) ────────────────
  const getElementAtPoint = useCallback(
    (clientX, clientY) => {
      if (!canvasRef.current) return null;
      const rect = canvasRef.current.getBoundingClientRect();
      const canvasX = (clientX - rect.left) / zoom;
      const canvasY = (clientY - rect.top) / zoom;
      const sorted = [...elements]
        .filter(Boolean)
        .sort((a, b) => (b.zIndex || 0) - (a.zIndex || 0));
      for (const el of sorted) {
        if (
          canvasX >= el.x &&
          canvasX <= el.x + el.w &&
          canvasY >= el.y &&
          canvasY <= el.y + el.h
        )
          return el;
      }
      return null;
    },
    [elements, zoom],
  );

  const onCanvasMouseDown = useCallback(
    (e) => {
      if (!canvasRef.current) return;
      const el = getElementAtPoint(e.clientX, e.clientY);
      if (!el) {
        setSelectedId(null);
        return;
      }
      setSelectedId(el.id);
      if (el.locked) return;

      const rect = canvasRef.current.getBoundingClientRect();
      const px = (e.clientX - rect.left) / zoom;
      const py = (e.clientY - rect.top) / zoom;
      const h = 8;

      let handle = null;
      if (px < el.x + h && py < el.y + h) handle = "nw";
      else if (px > el.x + el.w - h && py < el.y + h) handle = "ne";
      else if (px > el.x + el.w - h && py > el.y + el.h - h) handle = "se";
      else if (px < el.x + h && py > el.y + el.h - h) handle = "sw";
      else if (py < el.y + h && px > el.x + h && px < el.x + el.w - h)
        handle = "n";
      else if (py > el.y + el.h - h && px > el.x + h && px < el.x + el.w - h)
        handle = "s";
      else if (px < el.x + h && py > el.y + h && py < el.y + el.h - h)
        handle = "w";
      else if (px > el.x + el.w - h && py > el.y + h && py < el.y + el.h - h)
        handle = "e";

      if (handle) {
        resizeRef.current = {
          id: el.id,
          handle,
          startX: e.clientX / zoom,
          startY: e.clientY / zoom,
          origX: el.x,
          origY: el.y,
          origW: el.w,
          origH: el.h,
        };
        const onMove = (ev) => {
          if (!resizeRef.current) return;
          const { handle, startX, startY, origX, origY, origW, origH } =
            resizeRef.current;
          const dx = ev.clientX / zoom - startX,
            dy = ev.clientY / zoom - startY;
          let x = origX,
            y = origY,
            w = origW,
            h = origH;
          if (handle.includes("e")) w = Math.max(20, origW + dx);
          if (handle.includes("s")) h = Math.max(4, origH + dy);
          if (handle.includes("w")) {
            w = Math.max(20, origW - dx);
            x = origX + origW - w;
          }
          if (handle.includes("n")) {
            h = Math.max(4, origH - dy);
            y = origY + origH - h;
          }
          setElements((prev) =>
            prev
              .filter(Boolean)
              .map((e) =>
                e.id === resizeRef.current.id ? { ...e, x, y, w, h } : e,
              ),
          );
        };
        const onUp = () => {
          resizeRef.current = null;
          window.removeEventListener("mousemove", onMove);
          window.removeEventListener("mouseup", onUp);
          setTimeout(captureHistory, 0);
        };
        window.addEventListener("mousemove", onMove);
        window.addEventListener("mouseup", onUp);
      } else {
        dragRef.current = {
          id: el.id,
          startX: e.clientX / zoom,
          startY: e.clientY / zoom,
          origX: el.x,
          origY: el.y,
        };
        const onMove = (ev) => {
          if (!dragRef.current) return;
          const dx = ev.clientX / zoom - dragRef.current.startX,
            dy = ev.clientY / zoom - dragRef.current.startY;
          setElements((prev) =>
            prev.filter(Boolean).map((e) =>
              e.id === dragRef.current.id
                ? {
                    ...e,
                    x: Math.max(0, dragRef.current.origX + dx),
                    y: Math.max(0, dragRef.current.origY + dy),
                  }
                : e,
            ),
          );
        };
        const onUp = () => {
          dragRef.current = null;
          window.removeEventListener("mousemove", onMove);
          window.removeEventListener("mouseup", onUp);
          setTimeout(captureHistory, 0);
        };
        window.addEventListener("mousemove", onMove);
        window.addEventListener("mouseup", onUp);
      }
    },
    [getElementAtPoint, zoom],
  );

  // ── Element actions ────────────────────────────────────────────────────────
  const addElement = useCallback(
    (type) => {
      const el = makeElement(
        type,
        (40 + Math.random() * 60) | 0,
        (40 + Math.random() * 60) | 0,
      );
      setElements((p) => [...p, el]);
      setSelectedId(el.id);
      setTimeout(captureHistory, 0);
    },
    [captureHistory],
  );

  const updateElement = useCallback(
    (updated) => {
      if (!updated?.id) return;
      setElements((p) =>
        p.filter(Boolean).map((e) => (e.id === updated.id ? updated : e)),
      );
      setTimeout(captureHistory, 0);
    },
    [captureHistory],
  );

  const deleteSelected = useCallback(() => {
    setElements((p) => p.filter(Boolean).filter((e) => e.id !== selectedId));
    setSelectedId(null);
    setTimeout(captureHistory, 0);
  }, [selectedId, captureHistory]);

  const duplicateSelected = useCallback(() => {
    const el = elements.find((e) => e.id === selectedId);
    if (!el) return;
    const dup = { ...el, id: uid(), x: el.x + 16, y: el.y + 16 };
    setElements((p) => [...p, dup]);
    setSelectedId(dup.id);
    setTimeout(captureHistory, 0);
  }, [elements, selectedId, captureHistory]);

  const bringForward = useCallback(() => {
    setElements((p) =>
      p
        .filter(Boolean)
        .map((e) =>
          e.id === selectedId ? { ...e, zIndex: (e.zIndex || 0) + 1 } : e,
        ),
    );
    setTimeout(captureHistory, 0);
  }, [selectedId, captureHistory]);

  const sendBackward = useCallback(() => {
    setElements((p) =>
      p
        .filter(Boolean)
        .map((e) =>
          e.id === selectedId
            ? { ...e, zIndex: Math.max(0, (e.zIndex || 0) - 1) }
            : e,
        ),
    );
    setTimeout(captureHistory, 0);
  }, [selectedId, captureHistory]);

  const selected =
    elements.filter(Boolean).find((e) => e.id === selectedId) || null;

  // ── Save ───────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!templateName.trim()) {
      toast.error("Enter a template name.");
      return;
    }
    setSaving(true);
    try {
      const payload = { name: templateName.trim(), canvas, elements };
      if (editingId) {
        const saved = await updatePassTemplate(editingId, payload);
        setTemplates((p) =>
          p.map((t) => ((t.id || t._id) === editingId ? saved : t)),
        );
        toast.success("Template updated.");
      } else {
        const saved = await createPassTemplate(payload);
        setTemplates((p) => [saved, ...p]);
        toast.success("Template saved.");
      }
      setViewMode("list");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const startDesignNew = () => {
    setElements([]);
    setCanvas({ width: 400, height: 600, background: "var(--card)" });
    setTemplateName("New Template");
    setEditingId(null);
    setSelectedId(null);
    historyRef.current = [];
    historyIndexRef.current = -1;
    setViewMode("editor");
  };

  const startEditTemplate = (t) => {
    const safeElements = (t.elements || []).filter(Boolean).map((el) => {
      const elType = el.type && DEFAULT_ELEMENT[el.type] ? el.type : "text";
      return {
        ...DEFAULT_ELEMENT[elType],
        x: 0,
        y: 0,
        zIndex: 1,
        locked: false,
        ...el,
        id: el.id || el._id?.toString() || uid(),
        type: elType,
      };
    });
    setElements(safeElements);
    setCanvas(t.canvas || { width: 400, height: 600, background: "var(--card)" });
    setTemplateName(t.name);
    setEditingId(t.id || t._id);
    setSelectedId(null);
    historyRef.current = [];
    historyIndexRef.current = -1;
    setViewMode("editor");
  };

  const handleDeleteTemplate = async (t) => {
    if (!window.confirm(`Delete "${t.name}"?`)) return;
    try {
      await deletePassTemplate(t.id || t._id);
      setTemplates((p) => p.filter((x) => (x.id || x._id) !== (t.id || t._id)));
      toast.info("Template deleted.");
    } catch (err) {
      toast.error(err.message);
    }
  };

  // ── Keyboard shortcuts ─────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (
        !e.target ||
        e.target.tagName === "INPUT" ||
        e.target.tagName === "TEXTAREA" ||
        e.target.tagName === "SELECT"
      )
        return;
      if ((e.key === "Delete" || e.key === "Backspace") && selectedId)
        deleteSelected();
      if (e.key === "Escape") setSelectedId(null);
      if (e.key === "d" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        duplicateSelected();
      }
      if (e.key === "z" && (e.metaKey || e.ctrlKey) && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      if (
        (e.key === "z" && (e.metaKey || e.ctrlKey) && e.shiftKey) ||
        (e.key === "y" && (e.metaKey || e.ctrlKey))
      ) {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [selectedId, elements, undo, redo]);

  const ELEMENT_BTNS = Object.entries(DEFAULT_ELEMENT).map(([type, def]) => ({
    type,
    ...def,
  }));

  // ── List View ──────────────────────────────────────────────────────────────
  if (viewMode === "list") {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "calc(100vh - 180px)",
          background: "var(--border)",
          borderRadius: 12,
          overflow: "hidden",
          border: "1px solid var(--border)",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 20px",
            background: "var(--card)",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: 18,
              fontWeight: 700,
              color: "var(--foreground)",
            }}
          >
            Pass Templates
          </h2>
          <button
            onClick={startDesignNew}
            style={{
              height: 36,
              borderRadius: 8,
              border: "none",
              background: "linear-gradient(135deg,var(--primary),var(--primary))",
              color: "var(--card)",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 600,
              padding: "0 16px",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <i className="bi bi-pencil-square" /> Design Pass
          </button>
        </div>

        {/* Templates Table */}
        <div style={{ flex: 1, overflow: "auto", padding: 16 }}>
          {templates.length === 0 ? (
            <div
              style={{ textAlign: "center", color: "var(--muted-foreground)", paddingTop: 60 }}
            >
              <i
                className="bi bi-inbox"
                style={{ fontSize: 36, display: "block", marginBottom: 12 }}
              />
              <p style={{ margin: 0 }}>
                No pass templates yet. Click "Design Pass" to create one.
              </p>
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr
                  style={{
                    background: "var(--background)",
                    borderBottom: "1px solid var(--border)",
                  }}
                >
                  <th
                    style={{
                      padding: "12px 16px",
                      textAlign: "left",
                      fontSize: 12,
                      fontWeight: 700,
                      color: "var(--muted-foreground)",
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                    }}
                  >
                    Name
                  </th>
                  <th
                    style={{
                      padding: "12px 16px",
                      textAlign: "left",
                      fontSize: 12,
                      fontWeight: 700,
                      color: "var(--muted-foreground)",
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                    }}
                  >
                    Pass
                  </th>
                  <th
                    style={{
                      padding: "12px 16px",
                      textAlign: "left",
                      fontSize: 12,
                      fontWeight: 700,
                      color: "var(--muted-foreground)",
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                    }}
                  >
                    Created By
                  </th>
                  <th
                    style={{
                      padding: "12px 16px",
                      textAlign: "left",
                      fontSize: 12,
                      fontWeight: 700,
                      color: "var(--muted-foreground)",
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                    }}
                  >
                    Date & Time
                  </th>
                  <th
                    style={{
                      padding: "12px 16px",
                      textAlign: "left",
                      fontSize: 12,
                      fontWeight: 700,
                      color: "var(--muted-foreground)",
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                    }}
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {templates.map((t) => (
                  <tr
                    key={t.id || t._id}
                    style={{
                      borderBottom: "1px solid var(--border)",
                      background: "var(--card)",
                      hover: { background: "var(--background)" },
                    }}
                  >
                    <td
                      style={{
                        padding: "12px 16px",
                        fontSize: 13,
                        color: "#1e293b",
                        fontWeight: 500,
                      }}
                    >
                      {t.name}
                    </td>
                    <td
                      style={{
                        padding: "12px 16px",
                        fontSize: 13,
                        color: "var(--muted-foreground)",
                        textAlign: "center",
                      }}
                    >
                      <PassPreviewIcon onClick={() => setPreviewTemplate(t)} />
                    </td>
                    <td
                      style={{
                        padding: "12px 16px",
                        fontSize: 13,
                        color: "var(--muted-foreground)",
                      }}
                    >
                      {t.createdBy || "Admin"}
                    </td>
                    <td
                      style={{
                        padding: "12px 16px",
                        fontSize: 13,
                        color: "var(--muted-foreground)",
                      }}
                    >
                      {t.createdAt ? (
                        <div style={{ lineHeight: 1.5 }}>
                          <div style={{ fontWeight: 500 }}>
                            {(() => {
                              const d = new Date(t.createdAt);
                              const day = String(d.getDate()).padStart(2, "0");
                              const month = String(d.getMonth() + 1).padStart(
                                2,
                                "0",
                              );
                              const year = d.getFullYear();
                              return `${day}-${month}-${year}`;
                            })()}
                          </div>
                          <div style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
                            {new Date(t.createdAt).toLocaleTimeString("en-GB", {
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: false,
                            })}
                          </div>
                        </div>
                      ) : (
                        "N/A"
                      )}
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 13 }}>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button
                          onClick={() => startEditTemplate(t)}
                          title="Edit"
                          style={{
                            height: 28,
                            width: 28,
                            borderRadius: 6,
                            border: "1px solid var(--border)",
                            background: "var(--background)",
                            color: "var(--primary)",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <i className="bi bi-pencil" />
                        </button>
                        <button
                          onClick={() => handleDeleteTemplate(t)}
                          disabled={t.inUse}
                          title={
                            t.inUse
                              ? "Cannot delete: Template in use"
                              : "Delete"
                          }
                          style={{
                            height: 28,
                            width: 28,
                            borderRadius: 6,
                            border: t.inUse
                              ? "1px solid #e5e7eb"
                              : "1px solid #fee2e2",
                            background: t.inUse ? "var(--secondary)" : "oklch(var(--destructive-h) var(--destructive-s) var(--destructive-l) / 10%)",
                            color: t.inUse ? "var(--muted-foreground)" : "#dc2626",
                            cursor: t.inUse ? "not-allowed" : "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            opacity: t.inUse ? 0.5 : 1,
                          }}
                        >
                          <i className="bi bi-trash" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Preview Modal */}
        {previewTemplate && (
          <PassPreviewModal
            template={previewTemplate}
            onClose={() => setPreviewTemplate(null)}
          />
        )}
      </div>
    );
  }

  // ── Editor View ────────────────────────────────────────────────────────────
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "calc(100vh - 180px)",
        background: "var(--border)",
        borderRadius: 12,
        overflow: "hidden",
        border: "1px solid var(--border)",
      }}
    >
      {/* ── Toolbar ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "8px 12px",
          background: "var(--card)",
          borderBottom: "1px solid var(--border)",
          flexWrap: "wrap",
        }}
      >
        {/* Add elements */}
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {ELEMENT_BTNS.map(({ type, icon, label }) => (
            <button
              key={type}
              onClick={() => addElement(type)}
              title={`Add ${label}`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                padding: "4px 10px",
                height: 30,
                borderRadius: 8,
                border: "1px solid var(--border)",
                background: "var(--background)",
                color: "var(--foreground)",
                cursor: "pointer",
                fontSize: 11,
                fontWeight: 500,
              }}
            >
              <i className={`bi ${icon}`} />
              <span className="d-none d-lg-inline">{label}</span>
            </button>
          ))}
        </div>

        <div style={{ flex: 1 }} />

        {/* Zoom */}
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <button
            onClick={() => setZoom((z) => Math.max(0.3, z - 0.1))}
            style={toolBtn}
          >
            −
          </button>
          <span
            style={{
              fontSize: 11,
              color: "var(--muted-foreground)",
              minWidth: 36,
              textAlign: "center",
            }}
          >
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom((z) => Math.min(2, z + 0.1))}
            style={toolBtn}
          >
            +
          </button>
          <button onClick={() => setZoom(1)} style={toolBtn} title="Reset">
            ↺
          </button>
        </div>

        <div style={{ width: 1, height: 24, background: "var(--border)" }} />

        {/* Editor actions */}
        <button
          onClick={() => setViewMode("list")}
          style={{
            ...toolBtn,
            padding: "0 10px",
            fontSize: 11,
            color: "var(--foreground)",
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          <i className="bi bi-arrow-left" /> Back
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <input
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            placeholder="Template name…"
            style={{
              height: 30,
              borderRadius: 8,
              border: "1px solid var(--border)",
              fontSize: 12,
              padding: "0 10px",
              width: 200,
            }}
          />
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              height: 30,
              borderRadius: 8,
              border: "none",
              background: "linear-gradient(135deg,var(--primary),var(--primary))",
              color: "var(--card)",
              cursor: "pointer",
              fontSize: 12,
              fontWeight: 600,
              padding: "0 14px",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            {saving ? (
              <>
                <span className="spinner-border spinner-border-sm" /> Saving…
              </>
            ) : (
              <>
                <i className="bi bi-floppy" /> Save
              </>
            )}
          </button>
        </div>
      </div>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* ── Left: Layers + Canvas Settings ── */}
        <div
          style={{
            width: 200,
            background: "var(--card)",
            borderRight: "1px solid var(--border)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {/* Canvas settings */}
          <div
            style={{ padding: "10px 12px", borderBottom: "1px solid var(--border)" }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "var(--muted-foreground)",
                marginBottom: 8,
                textTransform: "uppercase",
                letterSpacing: 0.5,
              }}
            >
              Canvas
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 4,
                marginBottom: 6,
              }}
            >
              <div>
                <span style={{ fontSize: 10, color: "var(--muted-foreground)" }}>Width</span>
                <NumInput
                  value={canvas.width}
                  min={100}
                  max={2000}
                  onChange={(v) => setCanvas((c) => ({ ...c, width: v }))}
                />
              </div>
              <div>
                <span style={{ fontSize: 10, color: "var(--muted-foreground)" }}>Height</span>
                <NumInput
                  value={canvas.height}
                  min={100}
                  max={3000}
                  onChange={(v) => setCanvas((c) => ({ ...c, height: v }))}
                />
              </div>
            </div>
            <div style={{ marginBottom: 6 }}>
              <span style={{ fontSize: 10, color: "var(--muted-foreground)" }}>Background</span>
              <ColorInput
                value={canvas.background}
                onChange={(v) => setCanvas((c) => ({ ...c, background: v }))}
              />
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
              {CANVAS_PRESETS.map((p) => (
                <button
                  key={p.label}
                  onClick={() =>
                    setCanvas((c) => ({ ...c, width: p.w, height: p.h }))
                  }
                  style={{
                    fontSize: 9,
                    padding: "2px 5px",
                    borderRadius: 4,
                    border: "1px solid var(--border)",
                    background: "var(--background)",
                    cursor: "pointer",
                    color: "var(--muted-foreground)",
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
          {/* Layers */}
          <div
            style={{
              padding: "8px 12px 4px",
              fontWeight: 700,
              fontSize: 11,
              color: "var(--muted-foreground)",
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            Layers ({elements.length})
          </div>
          <div style={{ flex: 1, overflowY: "auto" }}>
            {[...elements]
              .filter(Boolean)
              .reverse()
              .map((el) => (
                <div
                  key={el.id}
                  onClick={() => setSelectedId(el.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "5px 12px",
                    cursor: "pointer",
                    background:
                      el.id === selectedId ? "var(--accent)" : "transparent",
                    borderLeft: `3px solid ${el.id === selectedId ? "var(--primary)" : "transparent"}`,
                  }}
                >
                  <i
                    className={`bi ${DEFAULT_ELEMENT[el.type]?.icon}`}
                    style={{
                      fontSize: 12,
                      color: el.id === selectedId ? "var(--primary)" : "var(--muted-foreground)",
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      fontSize: 11,
                      color: "var(--foreground)",
                      flex: 1,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {el.content?.replace(/\{\{[^}]+\}\}/g, "…") ||
                      el.label ||
                      el.type}
                  </span>
                  {el.locked && (
                    <i
                      className="bi bi-lock-fill"
                      style={{ fontSize: 10, color: "var(--muted-foreground)" }}
                    />
                  )}
                </div>
              ))}
            {elements.length === 0 && (
              <div
                style={{
                  padding: 16,
                  fontSize: 11,
                  color: "var(--muted-foreground)",
                  textAlign: "center",
                }}
              >
                Add elements from toolbar
              </div>
            )}
          </div>
        </div>

        {/* ── Center: Canvas ── */}
        <div
          style={{
            flex: 1,
            overflow: "auto",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            padding: 24,
            background: "var(--border)",
          }}
        >
          {/* Wrapper reserves layout space for the scaled canvas */}
          <div
            style={{
              width: canvas.width * zoom,
              height: canvas.height * zoom,
              flexShrink: 0,
              position: "relative",
            }}
          >
            <div
              ref={canvasRef}
              onMouseDown={onCanvasMouseDown}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: canvas.width,
                height: canvas.height,
                background: canvas.background,
                boxShadow: "0 4px 30px rgba(0,0,0,0.15)",
                borderRadius: 4,
                overflow: "visible",
                transform: `scale(${zoom})`,
                transformOrigin: "top left",
                cursor: "default",
              }}
            >
              {/* Grid (visual only) */}
              {/* Grid */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  backgroundImage:
                    "radial-gradient(circle,var(--border) 1px,transparent 1px)",
                  backgroundSize: "20px 20px",
                  opacity: 0.4,
                  pointerEvents: "none",
                }}
              />

              {[...elements]
                .filter(Boolean)
                .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0))
                .map((el) => (
                  <CanvasEl
                    key={el.id}
                    el={el}
                    selected={el.id === selectedId}
                  />
                ))}

              {elements.length === 0 && (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "column",
                    gap: 8,
                    pointerEvents: "none",
                  }}
                >
                  <i
                    className="bi bi-plus-circle"
                    style={{ fontSize: 36, color: "#cbd5e1" }}
                  />
                  <span style={{ fontSize: 13, color: "var(--muted-foreground)" }}>
                    Add elements from the toolbar
                  </span>
                </div>
              )}
            </div>
          </div>
          {/* end zoom wrapper */}
        </div>

        {/* ── Right: Properties ── */}
        <div
          style={{
            width: 240,
            background: "var(--card)",
            borderLeft: "1px solid var(--border)",
            overflowY: "auto",
          }}
        >
          <PropertiesPanel
            el={selected}
            onChange={updateElement}
            onDelete={deleteSelected}
            onDuplicate={duplicateSelected}
            onBring={bringForward}
            onSend={sendBackward}
            canvasState={canvas}
            onCanvasChange={setCanvas}
          />
        </div>
      </div>

      {/* Shortcut hint */}
      <div
        style={{
          padding: "4px 12px",
          background: "var(--background)",
          borderTop: "1px solid var(--border)",
          display: "flex",
          gap: 12,
        }}
      >
        {[
          ["Del", "Delete element"],
          ["Esc", "Deselect"],
          ["Ctrl+D", "Duplicate"],
        ].map(([k, d]) => (
          <span key={k} style={{ fontSize: 10, color: "var(--muted-foreground)" }}>
            <kbd
              style={{
                background: "var(--border)",
                borderRadius: 3,
                padding: "1px 4px",
                fontSize: 10,
              }}
            >
              {k}
            </kbd>{" "}
            {d}
          </span>
        ))}
      </div>
    </div>
  );
};

const toolBtn = {
  height: 30,
  minWidth: 30,
  borderRadius: 8,
  border: "1px solid var(--border)",
  background: "var(--background)",
  color: "var(--foreground)",
  cursor: "pointer",
  fontSize: 13,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

export default PassTemplateEditor;
