import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ChromePicker } from "react-color";
import JSZip from "jszip";
import QRCodeStyling from "qr-code-styling";
import { toast } from "react-toastify";
import { useParams, useNavigate } from "../lib/router-shim";
import { useEventData } from "../context/EventDataContext";
import { fetchPassTemplates } from "../services/api";
import {
  FiSave,
  FiDownload,
  FiSearch,
  FiUploadCloud,
  FiX,
  FiRefreshCcw,
  FiPlus,
  FiTrash2,
} from "react-icons/fi";
import {
  BsType,
  BsCalendar3,
  BsStarFill,
  BsBookmarkFill,
  BsPerson,
  BsBriefcase,
  BsTelephone,
  BsEnvelope,
  BsQrCode,
  BsImage,
  BsTextLeft,
} from "react-icons/bs";

// ── Constants ──────────────────────────────────────────────────────────────────

const PREVIEW_W = 300;

const FONT_FAMILIES = [
  "Segoe UI",
  "Arial",
  "Helvetica",
  "Verdana",
  "Georgia",
  "Times New Roman",
  "Courier New",
  "Trebuchet MS",
];

const PASS_PRESETS = [
  { label: "Portrait", w: 420, h: 640 },
  { label: "Landscape", w: 640, h: 420 },
  { label: "Square", w: 420, h: 420 },
  { label: "Badge", w: 420, h: 300 },
];

const DEFAULT_CATEGORIES = [
  { name: "VIP", color: "var(--warning)" },
  { name: "General", color: "var(--info)" },
  { name: "Staff", color: "var(--success)" },
  { name: "Speaker", color: "#8B5CF6" },
  { name: "Press", color: "#EF4444" },
];

const DEFAULT_LAYOUT = {
  // Header elements — y is from pass top, drag constrained within header band
  headerTitle: {
    x: 18,
    y: 20,
    w: 320,
    h: 26,
    fontSize: 19,
    fontWeight: "700",
    fontStyle: "normal",
    fontFamily: "Segoe UI",
    color: "var(--card)",
  },
  headerSub: {
    x: 18,
    y: 52,
    w: 320,
    h: 18,
    fontSize: 13,
    fontWeight: "400",
    fontStyle: "normal",
    fontFamily: "Segoe UI",
    color: "rgba(255,255,255,0.82)",
  },
  headerBrand: {
    x: 330,
    y: 20,
    w: 80,
    h: 14,
    fontSize: 11,
    fontWeight: "400",
    fontStyle: "normal",
    fontFamily: "Segoe UI",
    color: "rgba(255,255,255,0.55)",
  },
  logo: { x: 330, y: 8, w: 72, h: 72, opacity: 1, src: null },
  // Body elements
  categoryBadge: { x: 18, y: 120, w: 116, h: 28 },
  name: {
    x: 18,
    y: 160,
    w: 385,
    h: 34,
    fontSize: 24,
    fontWeight: "700",
    fontStyle: "normal",
    fontFamily: "Segoe UI",
    color: "#0f172a",
  },
  organization: {
    x: 18,
    y: 204,
    w: 385,
    h: 22,
    fontSize: 13,
    fontWeight: "400",
    fontStyle: "normal",
    fontFamily: "Segoe UI",
    color: "var(--foreground)",
  },
  phone: {
    x: 18,
    y: 230,
    w: 385,
    h: 22,
    fontSize: 13,
    fontWeight: "400",
    fontStyle: "normal",
    fontFamily: "Segoe UI",
    color: "var(--foreground)",
  },
  email: {
    x: 18,
    y: 256,
    w: 385,
    h: 22,
    fontSize: 13,
    fontWeight: "400",
    fontStyle: "normal",
    fontFamily: "Segoe UI",
    color: "var(--foreground)",
  },
  qr: { x: 135, y: 460, w: 150, h: 150 },
};

// Elements that support text style props
const HEADER_ELEM_SET = new Set(["headerTitle", "headerSub", "headerBrand"]);
const BODY_TEXT_ELEMS = new Set(["name", "organization", "phone", "email"]);
const TEXT_ELEMS = new Set([...HEADER_ELEM_SET, ...BODY_TEXT_ELEMS]);

const ELEM_META = {
  headerTitle: { label: "Header Title", Icon: BsType, group: "header" },
  headerSub: { label: "Header Subtitle", Icon: BsCalendar3, group: "header" },
  headerBrand: { label: "Brand Text", Icon: BsStarFill, group: "header" },
  logo: { label: "Logo", Icon: BsImage, group: "header" },
  categoryBadge: {
    label: "Category Badge",
    Icon: BsBookmarkFill,
    group: "body",
  },
  name: { label: "Name", Icon: BsPerson, group: "body" },
  organization: { label: "Organization", Icon: BsBriefcase, group: "body" },
  phone: { label: "Phone", Icon: BsTelephone, group: "body" },
  email: { label: "Email", Icon: BsEnvelope, group: "body" },
  qr: { label: "QR Code", Icon: BsQrCode, group: "body" },
};

const DEFAULT_HEADER = {
  customTitle: "",
  showDates: true,
  showVenue: true,
  brandText: "KnowVato",
};

const getCatColor = (name, eventCats = []) => {
  const evtMatch = eventCats.find(
    (c) => c.label?.toLowerCase() === (name || "").toLowerCase(),
  );
  if (evtMatch?.color) return evtMatch.color;
  return (
    DEFAULT_CATEGORIES.find(
      (c) => c.name.toLowerCase() === (name || "").toLowerCase(),
    )?.color || "var(--muted-foreground)"
  );
};

// ── Canvas helpers ─────────────────────────────────────────────────────────────

const loadImage = (src) =>
  new Promise((res, rej) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => res(img);
    img.onerror = rej;
    img.src = src;
  });

const drawRR = (ctx, x, y, w, h, r, color) => {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  ctx.fill();
};

const drawRRStroke = (ctx, x, y, w, h, r, color, lw = 2) => {
  ctx.strokeStyle = color;
  ctx.lineWidth = lw;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  ctx.stroke();
};

const trunc = (s, n) => (s && s.length > n ? s.slice(0, n - 1) + "…" : s || "");

const genQRBlob = (data, color) => {
  const qr = new QRCodeStyling({
    width: 240,
    height: 240,
    type: "canvas",
    data: data || "PASS",
    dotsOptions: { color: color || "#000000", type: "square" },
    backgroundOptions: { color: "var(--card)" },
    qrOptions: { errorCorrectionLevel: "M" },
  });
  return qr.getRawData("png");
};

const drawBgImage = (ctx, img, W, H, fit, posX, posY) => {
  const iw = img.naturalWidth || img.width,
    ih = img.naturalHeight || img.height;
  if (!fit || fit === "stretch") {
    ctx.drawImage(img, 0, 0, W, H);
    return;
  }
  const s =
    fit === "cover" ? Math.max(W / iw, H / ih) : Math.min(W / iw, H / ih);
  const dw = iw * s,
    dh = ih * s;
  ctx.drawImage(
    img,
    (W - dw) * ((posX ?? 50) / 100),
    (H - dh) * ((posY ?? 50) / 100),
    dw,
    dh,
  );
};

const ctxFont = (el, defSize, defWeight) =>
  `${el.fontStyle || "normal"} ${el.fontWeight || defWeight || "400"} ${el.fontSize || defSize}px "${el.fontFamily || "Segoe UI"}", Arial, sans-serif`;

const renderPass = async (attendee, event, cfg, layout) => {
  const W = cfg.passW || 420,
    H = cfg.passH || 640;
  const HDR =
    cfg.showHeader !== false
      ? cfg.headerHeight || Math.round((H * 108) / 640)
      : 0;
  const S = 2;
  const canvas = document.createElement("canvas");
  canvas.width = W * S;
  canvas.height = H * S;
  const ctx = canvas.getContext("2d");
  ctx.scale(S, S);

  // Background
  if (cfg.bgImage) {
    try {
      const bg = await loadImage(cfg.bgImage);
      drawBgImage(ctx, bg, W, H, cfg.bgFit, cfg.bgPosX, cfg.bgPosY);
      ctx.fillStyle = `rgba(255,255,255,${(100 - (cfg.bgOpacity ?? 60)) / 100})`;
      ctx.fillRect(0, 0, W, H);
    } catch {
      ctx.fillStyle = cfg.bgColor || "var(--card)";
      ctx.fillRect(0, 0, W, H);
    }
  } else {
    ctx.fillStyle = cfg.bgColor || "var(--card)";
    ctx.fillRect(0, 0, W, H);
  }

  const RX = cfg.passRadius ?? 14;

  // Border
  drawRRStroke(ctx, 1, 1, W - 2, H - 2, RX, cfg.primaryColor || "var(--primary)", 2.5);

  // Header band
  const hdrColor = cfg.headerColor || cfg.primaryColor || "var(--primary)";
  if (HDR > 0) {
    drawRR(ctx, 0, 0, W, HDR, RX, hdrColor);
    ctx.fillStyle = hdrColor;
    ctx.fillRect(0, HDR - RX, W, RX);

    const hdr = cfg.headerConfig || DEFAULT_HEADER;

    // Header title
    if (layout.headerTitle?.visible !== false) {
      const ht = layout.headerTitle || {
        x: 18,
        y: 20,
        h: 26,
        fontSize: 19,
        fontWeight: "700",
      };
      ctx.fillStyle = ht.color || "var(--card)";
      ctx.font = ctxFont(ht, 19, "700");
      ctx.fillText(
        trunc(hdr.customTitle || event?.eventName || "Event", 38),
        ht.x,
        ht.y + (ht.h || 26) * 0.82,
      );
    }

    // Header subtitle
    if (hdr.showDates !== false && layout.headerSub?.visible !== false) {
      const hs = layout.headerSub || { x: 18, y: 52, h: 18, fontSize: 13 };
      ctx.fillStyle = hs.color || "rgba(255,255,255,0.82)";
      ctx.font = ctxFont(hs, 13, "400");
      const parts = [];
      if (event?.startDate) parts.push(event.startDate);
      if (event?.endDate) parts.push(`– ${event.endDate}`);
      if (hdr.showVenue !== false && event?.venue) parts.push(event.venue);
      if (parts.length)
        ctx.fillText(
          trunc(parts.join("  "), 52),
          hs.x,
          hs.y + (hs.h || 18) * 0.82,
        );
    }

    // Brand text
    if (layout.headerBrand?.visible !== false) {
      const hb = layout.headerBrand || {
        x: W - 70,
        y: 20,
        h: 14,
        fontSize: 11,
      };
      ctx.fillStyle = hb.color || "rgba(255,255,255,0.55)";
      ctx.font = ctxFont(hb, 11, "400");
      ctx.fillText(
        trunc(hdr.brandText || "KnowVato", 20),
        hb.x,
        hb.y + (hb.h || 14) * 0.82,
      );
    }
  }

  // Category badge
  if (layout.categoryBadge?.visible !== false) {
    const cb = layout.categoryBadge;
    drawRR(
      ctx,
      cb.x,
      cb.y,
      cb.w,
      cb.h,
      14,
      getCatColor(attendee.category, event?.categories || []),
    );
    ctx.fillStyle = "var(--card)";
    ctx.font = `bold 12px "Segoe UI", Arial, sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText(
      trunc(attendee.category || "General", 16),
      cb.x + cb.w / 2,
      cb.y + cb.h * 0.72,
    );
    ctx.textAlign = "left";
  }

  // Name
  if (layout.name?.visible !== false) {
    const nm = layout.name;
    ctx.fillStyle = nm.color || "#0f172a";
    ctx.font = ctxFont(nm, 24, "700");
    ctx.fillText(trunc(attendee.name || "—", 26), nm.x, nm.y + nm.h * 0.82);
  }

  // Org / phone / email
  const renderField = (key, prefix, val) => {
    if (!val || layout[key]?.visible === false) return;
    const el = layout[key];
    ctx.fillStyle = el.color || "var(--foreground)";
    ctx.font = ctxFont(el, 13, "400");
    ctx.fillText(`${prefix}${trunc(val, 34)}`, el.x, el.y + el.h * 0.82);
  };
  renderField("organization", "⊞  ", attendee.organization);
  renderField("phone", "◉  ", attendee.phone);
  renderField("email", "✉  ", attendee.email);

  // QR
  if (layout.qr?.visible !== false) {
    const qr = layout.qr;
    ctx.strokeStyle = "var(--border)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(18, qr.y - 12);
    ctx.lineTo(W - 18, qr.y - 12);
    ctx.stroke();
    drawRR(ctx, qr.x - 4, qr.y - 4, qr.w + 8, qr.h + 8, 8, "var(--border)");
    try {
      const blob = await genQRBlob(attendee.passId, cfg.qrColor || "#000000");
      const url = URL.createObjectURL(blob);
      const img = await loadImage(url);
      URL.revokeObjectURL(url);
      ctx.drawImage(img, qr.x, qr.y, qr.w, qr.h);
    } catch {
      ctx.fillStyle = "var(--border)";
      ctx.fillRect(qr.x, qr.y, qr.w, qr.h);
    }
  }

  // Logo
  if (layout.logo?.src && layout.logo?.visible !== false) {
    try {
      const logoImg = await loadImage(layout.logo.src);
      const l = layout.logo;
      ctx.globalAlpha = l.opacity ?? 1;
      ctx.drawImage(logoImg, l.x, l.y, l.w, l.h);
      ctx.globalAlpha = 1;
    } catch {}
  }
  // Custom images (drawn before custom text so text sits on top)
  for (const key of Object.keys(layout)) {
    if (!key.startsWith("ci_")) continue;
    const el = layout[key];
    if (!el.src) continue;
    try {
      const img = await loadImage(el.src);
      ctx.globalAlpha = el.opacity ?? 1;
      ctx.drawImage(img, el.x, el.y, el.w, el.h);
      ctx.globalAlpha = 1;
    } catch {}
  }
  // Custom text
  for (const key of Object.keys(layout)) {
    if (!key.startsWith("ct_")) continue;
    const el = layout[key];
    ctx.globalAlpha = el.opacity ?? 1;
    ctx.fillStyle = el.color || "var(--foreground)";
    ctx.font = ctxFont(el, 14, "400");
    ctx.fillText(el.content || "", el.x, el.y + (el.h || 20) * 0.82);
    ctx.globalAlpha = 1;
  }

  ctx.fillStyle = "var(--muted-foreground)";
  ctx.font = `10px "Courier New", monospace`;
  ctx.textAlign = "center";
  ctx.fillText(trunc(attendee.passId, 40), W / 2, H - 12);
  ctx.textAlign = "left";
  return canvas;
};

// ── PassPreview component ──────────────────────────────────────────────────────

const PassPreview = ({
  attendee,
  event,
  config,
  layout,
  onLayoutChange,
  previewQR,
  selectedElems,
  onSetSelectedElems,
  passW,
  passH,
  scale,
  previewH,
  hdrH,
  availableElems,
}) => {
  const dragRef = useRef(null);
  const layoutRef = useRef(layout);
  useEffect(() => {
    layoutRef.current = layout;
  }); // always stays current; no deps needed

  const clampX = (k, x) => {
    const el = layoutRef.current[k];
    return Math.max(0, Math.min(passW - (el.w || 20), x));
  };
  const clampY = (k, y) => {
    const el = layoutRef.current[k];
    return Math.max(0, Math.min(passH - (el.h || 20), y));
  };

  // Drag
  useEffect(() => {
    const move = (cx, cy) => {
      if (!dragRef.current) return;
      const { keys, sx, sy, origins } = dragRef.current;
      const dx = (cx - sx) / scale,
        dy = (cy - sy) / scale;
      const updates = {};
      keys.forEach((k) => {
        updates[k] = {
          x: clampX(k, origins[k].x + dx),
          y: clampY(k, origins[k].y + dy),
        };
      });
      onLayoutChange(updates);
    };
    const onMM = (e) => {
      if (e.buttons === 0) {
        dragRef.current = null;
        return;
      } // clear any stale drag if no button held
      move(e.clientX, e.clientY);
    };
    const onTM = (e) => {
      e.preventDefault();
      move(e.touches[0].clientX, e.touches[0].clientY);
    };
    const stop = () => {
      dragRef.current = null;
    };
    document.addEventListener("mousemove", onMM);
    document.addEventListener("mouseup", stop);
    document.addEventListener("touchmove", onTM, { passive: false });
    document.addEventListener("touchend", stop);
    return () => {
      document.removeEventListener("mousemove", onMM);
      document.removeEventListener("mouseup", stop);
      document.removeEventListener("touchmove", onTM);
      document.removeEventListener("touchend", stop);
    };
  }, [onLayoutChange, scale, passW, passH, hdrH]); // layout accessed via layoutRef — no dep needed

  // Arrow keys
  useEffect(() => {
    if (selectedElems.size === 0) return;
    const onKey = (e) => {
      if (["INPUT", "TEXTAREA", "SELECT"].includes(e.target.tagName)) return;
      const step = e.shiftKey ? 10 : 1;
      let dx = 0,
        dy = 0;
      if (e.key === "ArrowLeft") dx = -step;
      else if (e.key === "ArrowRight") dx = step;
      else if (e.key === "ArrowUp") dy = -step;
      else if (e.key === "ArrowDown") dy = step;
      else return;
      e.preventDefault();
      const updates = {};
      [...selectedElems].forEach((k) => {
        const el = layoutRef.current[k];
        updates[k] = { x: clampX(k, el.x + dx), y: clampY(k, el.y + dy) };
      });
      onLayoutChange(updates);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [selectedElems, onLayoutChange, passW, passH, hdrH]); // layout accessed via layoutRef — no dep needed

  const startDrag = (e, key) => {
    e.preventDefault();
    e.stopPropagation();
    let next;
    if (e.shiftKey) {
      next = new Set(selectedElems);
      if (next.has(key)) next.delete(key);
      else next.add(key);
    } else {
      next = selectedElems.has(key) ? new Set(selectedElems) : new Set([key]);
    }
    onSetSelectedElems(next);
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    const cy = e.touches ? e.touches[0].clientY : e.clientY;
    const keysToMove = [...next];
    const origins = {};
    keysToMove.forEach((k) => {
      origins[k] = { x: layout[k].x, y: layout[k].y };
    });
    dragRef.current = { keys: keysToMove, sx: cx, sy: cy, origins };
  };

  const hdr = config.headerConfig || DEFAULT_HEADER;
  const hdrColor = config.headerColor || config.primaryColor || "var(--primary)";

  const renderElem = (key) => {
    if (!availableElems.has(key)) return null;
    if (HEADER_ELEM_SET.has(key) && config.showHeader === false) return null;
    const pos = layout[key];
    if (pos?.visible === false) return null;
    const isSelected = selectedElems.has(key);
    const isText = TEXT_ELEMS.has(key);
    const isCustomText = key.startsWith("ct_");
    const isCustomImg = key.startsWith("ci_");
    const isLogo = key === "logo";
    const ac = config.primaryColor;

    const base = {
      position: "absolute",
      left: pos.x * scale,
      top: pos.y * scale,
      cursor: "grab",
      zIndex: HEADER_ELEM_SET.has(key) ? 4 : isLogo ? 5 : 3,
      userSelect: "none",
      outline: isSelected ? `2px dashed ${ac}` : "none",
      outlineOffset: 2,
      borderRadius: (pos.borderRadius ?? 0) * scale,
      boxSizing: "border-box",
      border: pos.borderWidth
        ? `${(pos.borderWidth || 1) * scale}px solid ${pos.borderColor || ac}`
        : undefined,
      overflow: "hidden",
      backgroundClip: "padding-box",
    };

    if (isText || isCustomText) {
      base.width = Math.min(pos.w || 200, passW - pos.x) * scale;
      base.height = Math.max(pos.h || 20, 22) * scale;
      base.display = "flex";
      base.alignItems = "center";
      base.justifyContent =
        pos.textAlign === "center"
          ? "center"
          : pos.textAlign === "right"
            ? "flex-end"
            : "flex-start";
      base.padding = 0;
    } else {
      base.width = pos.w * scale;
      base.height = pos.h * scale;
      base.display = "flex";
      base.alignItems = "center";
      if (isLogo || isCustomImg) base.opacity = pos.opacity ?? 1;
      if (key === "qr") base.justifyContent = "center";
    }

    const textStyle = (defSize, defWeight, defColor) => ({
      fontSize: (pos.fontSize || defSize) * scale,
      fontWeight: pos.fontWeight || defWeight,
      fontStyle: pos.fontStyle || "normal",
      fontFamily: `"${pos.fontFamily || "Segoe UI"}", Arial, sans-serif`,
      color: pos.color || defColor,
      whiteSpace: "nowrap",
      textDecoration: pos.textDecoration || "none",
      lineHeight: 1,
      width: "100%",
      display: "inline-block",
      textAlign: pos.textAlign || "left",
    });

    let inner = null;

    if (isLogo) {
      inner = pos.src ? (
        <img
          src={pos.src}
          alt="Logo"
          style={{ width: "100%", height: "100%", objectFit: "contain" }}
        />
      ) : (
        <div
          style={{
            width: "100%",
            height: "100%",
            border: `1.5px dashed var(--muted-foreground)`,
            borderRadius: 4 * scale,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--muted-foreground)",
            fontSize: 9 * scale,
          }}
        >
          Logo
        </div>
      );
    } else if (isCustomImg) {
      inner = pos.src ? (
        <img
          src={pos.src}
          alt="Custom"
          style={{ width: "100%", height: "100%", objectFit: "contain" }}
        />
      ) : (
        <div
          style={{
            width: "100%",
            height: "100%",
            border: `1.5px dashed var(--muted-foreground)`,
            borderRadius: 4 * scale,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--muted-foreground)",
            fontSize: 9 * scale,
          }}
        >
          Image
        </div>
      );
    } else if (isCustomText) {
      inner = (
        <span
          style={{
            ...textStyle(14, "400", "var(--foreground)"),
            opacity: pos.opacity ?? 1,
          }}
        >
          {pos.content || "Custom Text"}
        </span>
      );
    } else if (key === "headerTitle") {
      inner = (
        <span style={textStyle(19, "700", "var(--card)")}>
          {hdr.customTitle || event?.eventName || "Event"}
        </span>
      );
    } else if (key === "headerSub") {
      if (hdr.showDates === false) return null;
      const parts = [
        event?.startDate,
        event?.endDate && `– ${event.endDate}`,
        hdr.showVenue !== false && event?.venue,
      ].filter(Boolean);
      inner = (
        <span style={textStyle(13, "400", "rgba(255,255,255,0.82)")}>
          {parts.join("  ") || "—"}
        </span>
      );
    } else if (key === "headerBrand") {
      inner = (
        <span style={textStyle(11, "400", "rgba(255,255,255,0.55)")}>
          {hdr.brandText || "KnowVato"}
        </span>
      );
    } else if (key === "categoryBadge") {
      inner = (
        <div
          style={{
            background: getCatColor(
              attendee?.category,
              event?.categories || [],
            ),
            color: "var(--card)",
            borderRadius: ((pos.h || 28) / 2) * scale,
            fontSize: (pos.fontSize || 11) * scale,
            fontWeight: 700,
            whiteSpace: "nowrap",
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {attendee?.category || "General"}
        </div>
      );
    } else if (key === "name") {
      inner = (
        <span style={textStyle(24, "700", "#0f172a")}>
          {attendee?.name || "—"}
        </span>
      );
    } else if (key === "organization") {
      inner = (
        <span
          style={textStyle(
            13,
            "400",
            attendee?.organization ? "var(--foreground)" : "#cbd5e1",
          )}
        >
          ⊞ {attendee?.organization || "Organization"}
        </span>
      );
    } else if (key === "phone") {
      inner = (
        <span
          style={textStyle(13, "400", attendee?.phone ? "var(--foreground)" : "#cbd5e1")}
        >
          ◉ {attendee?.phone || "Phone"}
        </span>
      );
    } else if (key === "email") {
      inner = (
        <span
          style={textStyle(13, "400", attendee?.email ? "var(--foreground)" : "#cbd5e1")}
        >
          ✉ {attendee?.email || "Email"}
        </span>
      );
    } else if (key === "qr") {
      inner = (
        <div
          style={{
            width: "100%",
            height: "100%",
            background: "var(--border)",
            borderRadius: 8 * scale,
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {previewQR ? (
            <img
              src={previewQR}
              alt="QR"
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          ) : (
            <span style={{ fontSize: 11 * scale, color: "var(--muted-foreground)" }}>QR</span>
          )}
        </div>
      );
    }
    if (!inner) return null;
    const elemLabel =
      ELEM_META[key]?.label ||
      (isCustomText ? "Custom Text" : isCustomImg ? "Custom Image" : key);
    return (
      <div
        key={key}
        style={base}
        onMouseDown={(e) => startDrag(e, key)}
        onTouchStart={(e) => startDrag(e, key)}
        onClick={(e) => e.stopPropagation()}
        title={`${isSelected ? "Drag" : "Click"} · ${elemLabel}`}
      >
        {inner}
      </div>
    );
  };

  return (
    <div
      style={{
        position: "relative",
        width: PREVIEW_W,
        height: previewH,
        userSelect: "none",
        flexShrink: 0,
        borderRadius: (config.passRadius ?? 14) * scale,
        overflow: "hidden",
        boxShadow: "0 8px 32px rgba(0,0,0,0.16)",
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSetSelectedElems(new Set());
      }}
    >
      {/* Background */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: config.bgColor || "var(--card)",
          backgroundImage: config.bgImage
            ? `url(${config.bgImage})`
            : undefined,
          backgroundSize:
            config.bgFit === "stretch" ? "100% 100%" : config.bgFit || "cover",
          backgroundPosition: `${config.bgPosX ?? 50}% ${config.bgPosY ?? 50}%`,
          backgroundRepeat: "no-repeat",
        }}
      />
      {config.bgImage && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `rgba(255,255,255,${(100 - (config.bgOpacity ?? 60)) / 100})`,
          }}
        />
      )}
      {/* Border */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          border: `${2.5 * scale}px solid ${config.primaryColor}`,
          borderRadius: (config.passRadius ?? 14) * scale,
          pointerEvents: "none",
          zIndex: 10,
        }}
      />

      {/* Header band */}
      {config.showHeader !== false && hdrH > 0 && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: hdrH * scale,
            background: hdrColor,
            zIndex: 2,
          }}
        />
      )}

      {/* QR divider */}
      <div
        style={{
          position: "absolute",
          top: (layout.qr.y - 12) * scale,
          left: 18 * scale,
          right: 18 * scale,
          height: 1,
          background: "var(--border)",
          zIndex: 1,
        }}
      />

      {/* Pass ID */}
      <div
        style={{
          position: "absolute",
          bottom: 6 * scale,
          left: 0,
          right: 0,
          textAlign: "center",
          fontSize: 8 * scale,
          color: "var(--muted-foreground)",
          fontFamily: "monospace",
          zIndex: 1,
        }}
      >
        {attendee?.passId || "PASS-0000"}
      </div>

      {/* All draggable elements */}
      {Object.keys(layout).map((key) => renderElem(key))}

      {!attendee && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--muted-foreground)",
            fontSize: 13 * scale,
            paddingTop: hdrH * scale,
          }}
        >
          No attendees to preview
        </div>
      )}

      {selectedElems.size > 1 && (
        <div
          style={{
            position: "absolute",
            bottom: 20 * scale,
            right: 4 * scale,
            background: "rgba(0,0,0,0.6)",
            color: "var(--card)",
            borderRadius: 4,
            fontSize: 9 * scale,
            padding: "2px 5px",
            zIndex: 20,
            pointerEvents: "none",
          }}
        >
          {selectedElems.size} selected
        </div>
      )}
    </div>
  );
};

// ── Color picker widget (portal-based, uncontrolled input) ────────────────────
// Must be defined at module level — never inside another component —
// so React does not unmount/remount it on every parent render.

const ColorPickerWidget = ({ label, value, onChange }) => {
  const [open, setOpen] = useState(false);
  const [pickerColor, setPickerColor] = useState(value || "#000000");
  const hexValue = /^#[0-9a-fA-F]{6}$/.test(value) ? value : "var(--card)";

  // Sync picker to current value each time the panel opens
  useEffect(() => {
    if (open) setPickerColor(hexValue);
  }, [open]); // only sync on open; hexValue intentionally excluded

  return (
    <>
      <div className="mb-2">
        {label && (
          <label
            className="form-label mb-1"
            style={{ fontSize: 11, fontWeight: 600 }}
          >
            {label}
          </label>
        )}
        <div className="d-flex align-items-center gap-1">
          <button
            type="button"
            className="color-preview rounded"
            onClick={(e) => {
              e.stopPropagation();
              setOpen(true);
            }}
            style={{
              width: 32,
              height: 26,
              background: hexValue,
              padding: 0,
              flexShrink: 0,
            }}
          />
          <input
            type="text"
            className="form-control form-control-sm"
            style={{ fontSize: 11 }}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      </div>
      {open && (
        <div className="color-picker-overlay" onClick={() => setOpen(false)}>
          <div
            className="color-picker-shell"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="color-picker-header">
              <span className="fw-semibold">{label || "Choose color"}</span>
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                onClick={() => setOpen(false)}
              >
                Close
              </button>
            </div>
            <ChromePicker
              color={pickerColor}
              onChange={(color) => setPickerColor(color.hex)}
              onChangeComplete={(color) => onChange(color.hex)}
              disableAlpha
            />
          </div>
        </div>
      )}
    </>
  );
};

// ── Shared style control sub-component ────────────────────────────────────────

const TextStyleControls = ({ keys, layout, onLayoutChange, primaryColor }) => {
  const firstEl = layout[keys[0]] || {};
  const apply = (prop, val) => {
    setLayout_multi(keys, prop, val, onLayoutChange, layout);
  };
  const curSize = firstEl.fontSize || (keys.includes("name") ? 24 : 13);
  const curBold = (firstEl.fontWeight || "400") === "700";
  const curItalic = (firstEl.fontStyle || "normal") === "italic";
  const curFont = firstEl.fontFamily || "Segoe UI";
  const curColor = firstEl.color || "var(--foreground)";
  const isSingleKey = keys.length === 1;

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <div className="mb-2">
        <label
          className="form-label mb-1"
          style={{ fontSize: 11, fontWeight: 600 }}
        >
          Font Family
        </label>
        <select
          className="form-select form-select-sm"
          style={{ fontSize: 11 }}
          value={curFont}
          onChange={(e) => apply("fontFamily", e.target.value)}
        >
          {FONT_FAMILIES.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
      </div>
      <div className="mb-2">
        <label
          className="form-label mb-1"
          style={{ fontSize: 11, fontWeight: 600 }}
        >
          Size: {curSize}px{" "}
          {!isSingleKey && (
            <span style={{ color: "var(--muted-foreground)" }}>(all selected)</span>
          )}
        </label>
        <input
          type="range"
          className="form-range"
          min="8"
          max="52"
          step="1"
          value={curSize}
          onChange={(e) => apply("fontSize", Number(e.target.value))}
        />
      </div>
      <div className="d-flex gap-2 mb-2">
        <button
          type="button"
          className={`btn btn-sm flex-fill ${curBold ? "btn-primary" : "btn-outline-secondary"}`}
          style={{ fontWeight: 700, fontSize: 13, padding: "3px 0" }}
          onClick={(e) => {
            e.stopPropagation();
            apply("fontWeight", curBold ? "400" : "700");
          }}
        >
          B
        </button>
        <button
          type="button"
          className={`btn btn-sm flex-fill ${curItalic ? "btn-primary" : "btn-outline-secondary"}`}
          style={{ fontStyle: "italic", fontSize: 13, padding: "3px 0" }}
          onClick={(e) => {
            e.stopPropagation();
            apply("fontStyle", curItalic ? "normal" : "italic");
          }}
        >
          I
        </button>
      </div>
      <ColorPickerWidget
        label="Text Color"
        value={curColor}
        onChange={(v) => apply("color", v)}
      />
    </div>
  );
};

const ElementStyleControls = ({
  keys,
  layout,
  onLayoutChange,
  passW,
  passH,
  primaryColor,
  showTextStyle = false,
}) => {
  const firstEl = layout[keys[0]] || {};
  const curW = firstEl.w || 100;
  const curH = firstEl.h || 20;
  const curBorderRadius = firstEl.borderRadius ?? 0;
  const curBorderWidth = firstEl.borderWidth ?? 0;
  const curBorderColor = firstEl.borderColor || primaryColor;
  const curTextAlign = firstEl.textAlign || "left";
  const curTextDecoration = firstEl.textDecoration || "none";
  const apply = (prop, val) =>
    setLayout_multi(keys, prop, val, onLayoutChange, layout);
  const center = (axis) => {
    const updates = {};
    keys.forEach((key) => {
      const el = layout[key];
      updates[key] = {
        ...el,
        x: axis !== "y" ? Math.round((passW - (el.w || 20)) / 2) : el.x,
        y: axis !== "x" ? Math.round((passH - (el.h || 20)) / 2) : el.y,
      };
    });
    onLayoutChange(updates);
  };
  return (
    <div onClick={(e) => e.stopPropagation()}>
      <div className="mb-2">
        <label
          className="form-label mb-1"
          style={{ fontSize: 11, fontWeight: 600 }}
        >
          Size
        </label>
        <div className="d-flex gap-2">
          <div className="flex-fill">
            <input
              type="range"
              className="form-range"
              min="20"
              max="420"
              step="4"
              value={curW}
              onChange={(e) => apply("w", Number(e.target.value))}
            />
            <div style={{ fontSize: 11, fontWeight: 600 }}>W: {curW}px</div>
          </div>
          <div className="flex-fill">
            <input
              type="range"
              className="form-range"
              min="20"
              max="420"
              step="4"
              value={curH}
              onChange={(e) => apply("h", Number(e.target.value))}
            />
            <div style={{ fontSize: 11, fontWeight: 600 }}>H: {curH}px</div>
          </div>
        </div>
      </div>
      <div className="mb-2">
        <label
          className="form-label mb-1"
          style={{ fontSize: 11, fontWeight: 600 }}
        >
          Border
        </label>
        <div className="d-flex gap-2">
          <div className="flex-fill">
            <input
              type="range"
              className="form-range"
              min="0"
              max="16"
              step="1"
              value={curBorderWidth}
              onChange={(e) => apply("borderWidth", Number(e.target.value))}
            />
            <div style={{ fontSize: 11, fontWeight: 600 }}>
              Width: {curBorderWidth}px
            </div>
          </div>
          <div className="flex-fill">
            <ColorPickerWidget
              label="Border Color"
              value={curBorderColor}
              onChange={(v) => apply("borderColor", v)}
            />
          </div>
        </div>
      </div>
      <div className="mb-2">
        <label
          className="form-label mb-1"
          style={{ fontSize: 11, fontWeight: 600 }}
        >
          Radius
        </label>
        <input
          type="range"
          className="form-range"
          min="0"
          max="60"
          step="1"
          value={curBorderRadius}
          onChange={(e) => apply("borderRadius", Number(e.target.value))}
        />
        <div style={{ fontSize: 11, fontWeight: 600 }}>
          Radius: {curBorderRadius}px
        </div>
      </div>
      {showTextStyle && (
        <>
          <div className="d-flex gap-2 mb-2">
            {["left", "center", "right"].map((align) => (
              <button
                key={align}
                type="button"
                className={`btn btn-sm flex-fill ${curTextAlign === align ? "btn-primary" : "btn-outline-secondary"}`}
                style={{ fontSize: 12, padding: "4px 0" }}
                onClick={(e) => {
                  e.stopPropagation();
                  apply("textAlign", align);
                }}
              >
                {align.charAt(0).toUpperCase() + align.slice(1)}
              </button>
            ))}
          </div>
          <div className="d-flex gap-2 mb-2">
            <button
              type="button"
              className={`btn btn-sm flex-fill ${curTextDecoration === "underline" ? "btn-primary" : "btn-outline-secondary"}`}
              style={{ fontSize: 12, padding: "4px 0" }}
              onClick={(e) => {
                e.stopPropagation();
                apply(
                  "textDecoration",
                  curTextDecoration === "underline" ? "none" : "underline",
                );
              }}
            >
              Underline
            </button>
          </div>
        </>
      )}
      <div className="mb-2">
        <label
          className="form-label mb-1"
          style={{ fontSize: 11, fontWeight: 600 }}
        >
          Position
        </label>
        <div className="d-flex gap-2">
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary flex-fill"
            style={{ fontSize: 11 }}
            onClick={(e) => {
              e.stopPropagation();
              center("x");
            }}
          >
            Center X
          </button>
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary flex-fill"
            style={{ fontSize: 11 }}
            onClick={(e) => {
              e.stopPropagation();
              center("y");
            }}
          >
            Center Y
          </button>
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary flex-fill"
            style={{ fontSize: 11 }}
            onClick={(e) => {
              e.stopPropagation();
              center("xy");
            }}
          >
            Center XY
          </button>
        </div>
      </div>
    </div>
  );
};

// Helper: apply prop to multiple layout keys
const setLayout_multi = (keys, prop, val, onLayoutChange, layout) => {
  const updates = {};
  keys.forEach((k) => {
    updates[k] = { ...layout[k], [prop]: val };
  });
  onLayoutChange(updates);
};

// ── Accordion Panel ───────────────────────────────────────────────────────────
// Module-level so React never unmounts/remounts it on parent re-render.

const AccordionPanel = ({ id, title, open, onToggle, badge, children }) => (
  <div style={{ borderBottom: "1px solid #f0f4f8" }}>
    <button
      type="button"
      className="w-100 d-flex align-items-center justify-content-between border-0 bg-white"
      style={{
        cursor: "pointer",
        fontSize: 12,
        fontWeight: 600,
        color: "var(--foreground)",
        padding: "9px 14px",
        minHeight: 38,
      }}
      onClick={() => onToggle(id)}
    >
      <span className="d-flex align-items-center gap-2">
        {title}
        {badge && (
          <span className="badge bg-primary" style={{ fontSize: 9 }}>
            {badge}
          </span>
        )}
      </span>
      <span
        style={{
          display: "inline-block",
          transform: open ? "rotate(180deg)" : "rotate(0deg)",
          transition: "transform 0.2s ease",
          color: "var(--muted-foreground)",
          lineHeight: 1,
        }}
      >
        ▾
      </span>
    </button>
    <div
      style={{
        maxHeight: open ? "1600px" : "0px",
        overflow: "hidden",
        transition: "max-height 0.3s ease-in-out",
      }}
    >
      <div style={{ padding: "2px 14px 14px" }}>{children}</div>
    </div>
  </div>
);

// ── Category tab with colored background + hover color-code tooltip ───────────

const contrastColor = (hex) => {
  const h = hex.replace("#", "");
  const r = parseInt(h.substr(0, 2), 16);
  const g = parseInt(h.substr(2, 2), 16);
  const b = parseInt(h.substr(4, 2), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.55
    ? "#1e293b"
    : "var(--card)";
};

const CategoryTab = ({ cat, color, isActive, hasDesign, onSwitch }) => {
  const [hover, setHover] = useState(false);
  const [copied, setCopied] = useState(false);
  const hideTimer = useRef(null);

  const showTooltip = () => {
    clearTimeout(hideTimer.current);
    setHover(true);
  };

  const hideTooltip = () => {
    hideTimer.current = setTimeout(() => setHover(false), 200);
  };

  const handleCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(color).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <div
      className="position-relative d-inline-block"
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
    >
      <button
        type="button"
        style={{
          fontSize: 11,
          padding: "3px 12px",
          background: color,
          borderColor: color,
          color: contrastColor(color),
          outline: isActive ? `2px solid ${color}` : "none",
          outlineOffset: 2,
          opacity: isActive ? 1 : 0.72,
          transition: "opacity 0.15s",
        }}
        className="btn btn-sm"
        onClick={(e) => {
          e.stopPropagation();
          onSwitch(cat);
        }}
      >
        {cat}
        {hasDesign && !isActive && (
          <span style={{ fontSize: 9, opacity: 0.8, marginLeft: 4 }}>✓</span>
        )}
      </button>

      {hover && (
        <div
          onMouseEnter={showTooltip}
          onMouseLeave={hideTooltip}
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: "50%",
            transform: "translateX(-50%)",
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: 5,
            boxShadow: "0 2px 8px rgba(0,0,0,0.10)",
            padding: "3px 8px",
            display: "flex",
            alignItems: "center",
            gap: 5,
            fontSize: 11,
            whiteSpace: "nowrap",
            zIndex: 1000,
            color: "var(--foreground)",
          }}
        >
          {color}
          <button
            type="button"
            onClick={handleCopy}
            style={{
              background: "none",
              border: "none",
              padding: 0,
              cursor: "pointer",
              color: copied ? "#16a34a" : "var(--muted-foreground)",
              display: "flex",
              alignItems: "center",
            }}
          >
            <i
              className={`bi ${copied ? "bi-check-lg" : "bi-clipboard"}`}
              style={{ fontSize: 11 }}
            />
          </button>
        </div>
      )}
    </div>
  );
};

// ── Main Page ──────────────────────────────────────────────────────────────────

const PassDesignerPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { events, attendees, saveEventPassDesign, markPassesGenerated } =
    useEventData();

  const selectedEvent = useMemo(
    () => events.find((e) => String(e.id) === String(eventId)) || null,
    [events, eventId],
  );
  const eventAttendees = useMemo(
    () => attendees.filter((a) => String(a.eventId) === String(eventId)),
    [attendees, eventId],
  );

  const saved = selectedEvent?.passDesign;

  const [primaryColor, setPrimaryColor] = useState(
    saved?.primaryColor || "var(--primary)",
  );
  const [headerColor, setHeaderColor] = useState(
    saved?.headerColor || "var(--primary)",
  );
  const [qrColor, setQrColor] = useState(saved?.qrColor || "#000000");
  const [bgColor, setBgColor] = useState(saved?.bgColor || "var(--card)");
  const [bgOpacity, setBgOpacity] = useState(saved?.bgOpacity ?? 60);
  const [bgImage, setBgImage] = useState(saved?.bgImage || null);
  const [bgFit, setBgFit] = useState(saved?.bgFit || "cover");
  const [bgPosX, setBgPosX] = useState(saved?.bgPosX ?? 50);
  const [bgPosY, setBgPosY] = useState(saved?.bgPosY ?? 50);
  const [passW, setPassW] = useState(saved?.passW || 420);
  const [passH, setPassH] = useState(saved?.passH || 640);
  const [passRadius, setPassRadius] = useState(saved?.passRadius ?? 14);
  const [headerHeight, setHeaderHeight] = useState(saved?.headerHeight || 108);
  const [headerConfig, setHeaderConfig] = useState(
    saved?.headerConfig || DEFAULT_HEADER,
  );
  const [showHeader, setShowHeader] = useState(saved?.showHeader ?? true);
  const [layout, setLayout] = useState(() => {
    const base = saved?.layout || DEFAULT_LAYOUT;
    // ensure logo key exists (for designs saved before this feature was added)
    return base.logo ? base : { ...base, logo: DEFAULT_LAYOUT.logo };
  });

  const [search, setSearch] = useState("");
  const [previewQR, setPreviewQR] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedElems, setSelectedElems] = useState(new Set());
  const bgInputRef = useRef(null);
  const logoInputRef = useRef(null);
  const customImgInputRef = useRef(null);
  const [activeCatName, setActiveCatName] = useState(
    saved?.activeCatName || "Default",
  );
  const [categoryDesigns, setCategoryDesigns] = useState(
    saved?.categoryDesigns || {},
  );

  const [templates, setTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState(null);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);

  useEffect(() => {
    const loadTemplates = async () => {
      try {
        setIsLoadingTemplates(true);
        const data = await fetchPassTemplates();
        setTemplates(data || []);
      } catch (err) {
        console.error("Failed to load templates:", err);
        toast.error("Failed to load pass templates");
      } finally {
        setIsLoadingTemplates(false);
      }
    };
    loadTemplates();
  }, []);

  // Derived
  const scale = PREVIEW_W / passW;
  const previewH = Math.round(passH * scale);
  const hdrH = showHeader ? headerHeight : 0;

  const config = useMemo(
    () => ({
      primaryColor,
      headerColor,
      qrColor,
      bgColor,
      bgOpacity,
      bgImage,
      bgFit,
      bgPosX,
      bgPosY,
      passW,
      passH,
      passRadius,
      headerHeight,
      showHeader,
      headerConfig,
    }),
    [
      primaryColor,
      headerColor,
      qrColor,
      bgColor,
      bgOpacity,
      bgImage,
      bgFit,
      bgPosX,
      bgPosY,
      passW,
      passH,
      passRadius,
      headerHeight,
      showHeader,
      headerConfig,
    ],
  );

  // Which elements are available based on imported data + custom/logo elements
  const availableElems = useMemo(() => {
    const set = new Set([
      "headerTitle",
      "headerSub",
      "headerBrand",
      "logo",
      "categoryBadge",
      "name",
      "qr",
    ]);
    if (eventAttendees.some((a) => a.organization)) set.add("organization");
    if (eventAttendees.some((a) => a.phone)) set.add("phone");
    if (eventAttendees.some((a) => a.email)) set.add("email");
    Object.keys(layout).forEach((k) => {
      if (k.startsWith("ct_") || k.startsWith("ci_")) set.add(k);
    });
    return set;
  }, [eventAttendees, layout]);

  const eventCategories = useMemo(() => {
    const cats = new Set(eventAttendees.map((a) => a.category).filter(Boolean));
    return ["Default", ...cats];
  }, [eventAttendees]);

  const previewAttendee = useMemo(() => {
    if (!eventAttendees.length) return null;
    if (!search.trim()) {
      if (activeCatName === "Default") return eventAttendees[0];
      return (
        eventAttendees.find((a) => a.category === activeCatName) ||
        eventAttendees[0]
      );
    }
    const q = search.toLowerCase();
    return (
      eventAttendees.find(
        (a) =>
          (a.name || "").toLowerCase().includes(q) ||
          (a.phone || "").includes(q) ||
          (a.email || "").toLowerCase().includes(q),
      ) || eventAttendees[0]
    );
  }, [eventAttendees, search, activeCatName]);

  useEffect(() => {
    if (!previewAttendee?.passId) {
      setPreviewQR(null);
      return;
    }
    let active = true;
    genQRBlob(previewAttendee.passId, qrColor)
      .then((blob) => {
        if (!active) return;
        const url = URL.createObjectURL(blob);
        setPreviewQR((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return url;
        });
      })
      .catch(() => setPreviewQR(null));
    return () => {
      active = false;
    };
  }, [previewAttendee?.passId, qrColor]);

  const handleLayoutChange = useCallback((keyOrMap, pos) => {
    setLayout((prev) => {
      if (typeof keyOrMap === "string")
        return { ...prev, [keyOrMap]: { ...prev[keyOrMap], ...pos } };
      const next = { ...prev };
      Object.entries(keyOrMap).forEach(([k, p]) => {
        next[k] = { ...next[k], ...p };
      });
      return next;
    });
  }, []);

  const handlePassSize = (newW, newH) => {
    const rx = newW / passW,
      ry = newH / passH;
    setLayout((prev) => {
      const next = {};
      Object.entries(prev).forEach(([k, el]) => {
        const scaleBox = k === "qr" || k === "logo" || k.startsWith("ci_");
        next[k] = {
          ...el,
          x: Math.round(el.x * rx),
          y: Math.round(el.y * ry),
          w: scaleBox ? Math.round(el.w * Math.min(rx, ry)) : el.w,
          h: scaleBox ? Math.round(el.h * Math.min(rx, ry)) : el.h,
        };
      });
      return next;
    });
    setPassW(newW);
    setPassH(newH);
  };

  const handleBgUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) {
      toast.error("Please upload an image file.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => setBgImage(ev.target.result);
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleLogoUpload = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setLayout((prev) => ({
        ...prev,
        logo: { ...prev.logo, src: ev.target.result },
      }));
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }, []);

  const addCustomText = useCallback(() => {
    const key = `ct_${Date.now()}`;
    setLayout((prev) => ({
      ...prev,
      [key]: {
        x: 20,
        y: hdrH + 30,
        w: 200,
        h: 20,
        fontSize: 14,
        fontWeight: "400",
        fontStyle: "normal",
        fontFamily: "Segoe UI",
        color: "var(--foreground)",
        opacity: 1,
        content: "Custom Text",
      },
    }));
    setSelectedElems(new Set([key]));
  }, [hdrH]);

  const addCustomImage = useCallback(
    (e) => {
      const file = e.target.files?.[0];
      if (!file || !file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const key = `ci_${Date.now()}`;
        setLayout((prev) => ({
          ...prev,
          [key]: {
            x: 20,
            y: hdrH + 30,
            w: 120,
            h: 120,
            opacity: 1,
            src: ev.target.result,
          },
        }));
        setSelectedElems(new Set([key]));
      };
      reader.readAsDataURL(file);
      e.target.value = "";
    },
    [hdrH],
  );

  const deleteCustomElem = useCallback((key) => {
    setLayout((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
    setSelectedElems((prev) => {
      const n = new Set(prev);
      n.delete(key);
      return n;
    });
  }, []);

  const currentDesign = useCallback(
    () => ({
      primaryColor,
      headerColor,
      qrColor,
      bgColor,
      bgOpacity,
      bgImage,
      bgFit,
      bgPosX,
      bgPosY,
      passW,
      passH,
      passRadius,
      headerHeight,
      showHeader,
      headerConfig,
      layout,
      categoryDesigns,
      activeCatName,
    }),
    [
      primaryColor,
      headerColor,
      qrColor,
      bgColor,
      bgOpacity,
      bgImage,
      bgFit,
      bgPosX,
      bgPosY,
      passW,
      passH,
      passRadius,
      headerHeight,
      showHeader,
      headerConfig,
      layout,
      categoryDesigns,
      activeCatName,
    ],
  );

  const loadDesignState = useCallback((design) => {
    if (!design) return;
    if (design.primaryColor !== undefined) setPrimaryColor(design.primaryColor);
    if (design.headerColor !== undefined) setHeaderColor(design.headerColor);
    if (design.qrColor !== undefined) setQrColor(design.qrColor);
    if (design.bgColor !== undefined) setBgColor(design.bgColor);
    if (design.bgOpacity !== undefined) setBgOpacity(design.bgOpacity);
    if (design.bgImage !== undefined) setBgImage(design.bgImage);
    if (design.bgFit !== undefined) setBgFit(design.bgFit);
    if (design.bgPosX !== undefined) setBgPosX(design.bgPosX);
    if (design.bgPosY !== undefined) setBgPosY(design.bgPosY);
    if (design.passW !== undefined) setPassW(design.passW);
    if (design.passH !== undefined) setPassH(design.passH);
    if (design.passRadius !== undefined) setPassRadius(design.passRadius);
    if (design.headerHeight !== undefined) setHeaderHeight(design.headerHeight);
    if (design.headerConfig !== undefined) setHeaderConfig(design.headerConfig);
    if (design.showHeader !== undefined) setShowHeader(design.showHeader);
    if (design.layout !== undefined) setLayout(design.layout);
  }, []);

  const applyTemplate = useCallback(
    (templateId) => {
      const template = templates.find((t) => t.id === templateId);
      if (!template || !template.canvas) return;
      const { canvas, elements } = template;

      setPassW(canvas.width || 400);
      setPassH(canvas.height || 600);
      setBgColor(canvas.background || "var(--card)");

      const newLayout = {};

      for (const el of elements || []) {
        if (!el) continue;
        const base = { x: el.x, y: el.y, w: el.w, h: el.h, visible: true };

        if (el.type === "header") {
          setShowHeader(true);
          setHeaderColor(el.bg || "var(--primary)");
          setHeaderHeight(el.h);
          newLayout.headerTitle = {
            ...base,
            fontSize: el.fontSize || 19,
            fontWeight: el.fontWeight || "700",
            color: el.color || "var(--card)",
            fontFamily: el.fontFamily || "Segoe UI",
          };
        } else if (el.type === "qr") {
          newLayout.qr = { ...base };
        } else if (el.type === "logo" || el.type === "image") {
          newLayout.logo = {
            ...base,
            src: el.imageUrl || null,
            opacity: el.opacity ?? 1,
          };
        } else if (["text", "footer", "card"].includes(el.type)) {
          const content = el.content || "";
          if (content.includes("{{name}}")) {
            newLayout.name = {
              ...base,
              fontSize: el.fontSize || 14,
              color: el.color || "#000000",
            };
          } else if (content.includes("{{email}}")) {
            newLayout.email = {
              ...base,
              fontSize: el.fontSize || 12,
              color: el.color || "#000000",
            };
          } else if (content.includes("{{phone}}")) {
            newLayout.phone = {
              ...base,
              fontSize: el.fontSize || 12,
              color: el.color || "#000000",
            };
          } else if (content.includes("{{category}}")) {
            newLayout.categoryBadge = { ...base };
          } else {
            const key = `ct_${el.id}`;
            newLayout[key] = {
              ...base,
              content: el.content || "",
              fontSize: el.fontSize || 14,
              fontWeight: el.fontWeight || "400",
              fontFamily: el.fontFamily || "Segoe UI",
              fontStyle: el.fontStyle || "normal",
              color: el.color || "#000000",
              opacity: el.opacity ?? 1,
              textAlign: el.textAlign || "left",
              textDecoration: el.textDecoration || "none",
            };
          }
        } else if (el.type === "divider") {
          const key = `ct_${el.id}`;
          newLayout[key] = {
            ...base,
            content: "",
            bg: el.bg || "#000000",
            opacity: el.opacity ?? 1,
          };
        }
      }

      setLayout(newLayout);
      setSelectedElems(new Set());
      setSelectedTemplateId(templateId);
      toast.success(`Template "${template.name}" loaded!`);
    },
    [templates],
  );

  const switchCategory = useCallback(
    (newCat) => {
      if (newCat === activeCatName) return;
      const full = currentDesign();
      // Strip the meta fields — per-category snaps must not contain nested categoryDesigns
      const {
        categoryDesigns: savedCats,
        activeCatName: _acn,
        ...catSnap
      } = full;
      const savedTarget = savedCats[newCat];
      setCategoryDesigns((prev) => ({ ...prev, [activeCatName]: catSnap }));
      setActiveCatName(newCat);
      if (savedTarget) loadDesignState(savedTarget);
      // else: no saved design for newCat → current state stays as the base
    },
    [activeCatName, currentDesign, loadDesignState],
  );

  const handleSave = async () => {
    if (!selectedEvent) return;
    const full = currentDesign();
    const {
      categoryDesigns: savedCats,
      activeCatName: activeKey,
      ...catSnap
    } = full;
    try {
      await saveEventPassDesign(selectedEvent.id, {
        ...full,
        categoryDesigns: { ...savedCats, [activeKey]: catSnap },
      });
      toast.success("Pass design saved!");
      navigate(`/events/${eventId}/upload`);
    } catch (err) {
      toast.error("Save failed — " + (err.message || "please try again"));
    }
  };

  const handleDownloadAll = async () => {
    if (!eventAttendees.length) {
      toast.error("No attendees.");
      return;
    }
    setIsGenerating(true);
    const full = currentDesign();
    const {
      categoryDesigns: savedCats,
      activeCatName: activeKey,
      ...activeSnap
    } = full;
    const allCatDesigns = { ...savedCats, [activeKey]: activeSnap };
    saveEventPassDesign(selectedEvent.id, {
      ...full,
      categoryDesigns: allCatDesigns,
    });
    toast.info(`Generating ${eventAttendees.length} passes…`);
    try {
      const zip = new JSZip();
      for (const att of eventAttendees) {
        const attDesign =
          allCatDesigns[att.category] || allCatDesigns["Default"] || activeSnap;
        const canvas = await renderPass(
          att,
          selectedEvent,
          attDesign,
          attDesign.layout,
        );
        const blob = await new Promise((res) =>
          canvas.toBlob(res, "image/png"),
        );
        zip.file(
          `${(att.name || att.passId).replace(/[/\\:*?"<>|]/g, "_")}.png`,
          blob,
        );
      }
      const content = await zip.generateAsync({ type: "blob" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(content);
      a.download = `${selectedEvent.eventName}_passes.zip`;
      a.click();
      URL.revokeObjectURL(a.href);
      toast.success(`${eventAttendees.length} passes downloaded!`);
      markPassesGenerated(selectedEvent.id);
      navigate(`/events/${eventId}/upload`);
    } catch {
      toast.error("Failed to generate passes.");
    } finally {
      setIsGenerating(false);
    }
  };

  const matchCount = useMemo(() => {
    if (!search.trim()) return eventAttendees.length;
    const q = search.toLowerCase();
    return eventAttendees.filter(
      (a) =>
        (a.name || "").toLowerCase().includes(q) ||
        (a.phone || "").includes(q) ||
        (a.email || "").toLowerCase().includes(q),
    ).length;
  }, [eventAttendees, search]);

  const [openPanels, setOpenPanels] = useState(
    new Set(["header-elems", "body-elems", "colors"]),
  );
  const togglePanel = useCallback((id) => {
    setOpenPanels((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  if (!selectedEvent) {
    return (
      <div className="container-fluid p-4 text-center">
        <p className="text-muted">Event not found.</p>
        <button
          className="btn btn-primary btn-sm"
          onClick={() => navigate("/events")}
        >
          Go to Events
        </button>
      </div>
    );
  }

  // Per-group selected element lists (derived, not hooks)
  const textSelected = [...selectedElems].filter(
    (k) => TEXT_ELEMS.has(k) && availableElems.has(k),
  );
  const customTextSelected = [...selectedElems].filter(
    (k) => k.startsWith("ct_") && availableElems.has(k),
  );
  const customImgSelected = [...selectedElems].filter(
    (k) => k.startsWith("ci_") && availableElems.has(k),
  );
  const showTextProps = textSelected.length > 0;
  const showQRProps = selectedElems.size === 1 && selectedElems.has("qr");
  const showLogoProps = selectedElems.size === 1 && selectedElems.has("logo");
  const showCustomTextProps = customTextSelected.length > 0;
  const showCustomImgProps = customImgSelected.length === 1;
  const showCatBadgeProps =
    selectedElems.size === 1 && selectedElems.has("categoryBadge");
  const hdrTextSelected = textSelected.filter((k) => HEADER_ELEM_SET.has(k));
  const bodyTextSelected = textSelected.filter((k) => BODY_TEXT_ELEMS.has(k));

  return (
    <div
      className="container-fluid p-2 fade-in"
      onClick={() => setSelectedElems(new Set())}
    >
      {/* Header bar */}
      <div className="card border-0 shadow-sm mb-2">
        <div className="card-body p-2">
          <nav aria-label="breadcrumb" className="mb-1">
            <ol
              className="breadcrumb mb-0 app-breadcrumb"
              style={{ fontSize: 12 }}
            >
              <li className="breadcrumb-item flex-shrink-0">
                <button
                  type="button"
                  className="btn btn-link p-0"
                  style={{
                    fontSize: "inherit",
                    lineHeight: "inherit",
                    textDecoration: "none",
                    whiteSpace: "nowrap",
                  }}
                  onClick={() => navigate("/events")}
                >
                  Events
                </button>
              </li>
              <li
                className="breadcrumb-item flex-shrink-0 text-truncate"
                style={{ minWidth: 0, maxWidth: "35vw" }}
              >
                <button
                  type="button"
                  className="btn btn-link p-0"
                  style={{
                    fontSize: "inherit",
                    lineHeight: "inherit",
                    textDecoration: "none",
                  }}
                  onClick={() => navigate(`/events/${eventId}/upload`)}
                >
                  {selectedEvent.eventName}
                </button>
              </li>
              <li className="breadcrumb-item active flex-shrink-0">
                Generate Pass
              </li>
            </ol>
          </nav>
          <div className="d-flex justify-content-between align-items-center gap-2 flex-wrap">
            <div>
              <span className="fw-bold" style={{ fontSize: 15 }}>
                Pass Designer
              </span>
              <span className="text-muted ms-2" style={{ fontSize: 12 }}>
                {selectedEvent.eventName} · {eventAttendees.length} registrants
              </span>
            </div>
            <div className="d-flex gap-2">
              <select
                className="form-select form-select-sm"
                style={{ maxWidth: 200 }}
                value={selectedTemplateId || ""}
                onChange={(e) => {
                  if (e.target.value) {
                    applyTemplate(e.target.value);
                  }
                }}
              >
                <option value="">Default Layout</option>
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm"
                onClick={() => {
                  setLayout(DEFAULT_LAYOUT);
                  setPassW(420);
                  setPassH(640);
                  setHeaderHeight(108);
                  setShowHeader(true);
                  setCategoryDesigns({});
                  setActiveCatName("Default");
                  setSelectedTemplateId(null);
                  toast.info("Reset.");
                }}
              >
                <FiRefreshCcw size={12} className="me-1" /> Reset
              </button>
              <button
                type="button"
                className="btn btn-outline-primary btn-sm"
                onClick={handleSave}
              >
                <FiSave size={12} className="me-1" /> Save
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm"
                onClick={handleDownloadAll}
                disabled={isGenerating || !eventAttendees.length}
              >
                <FiDownload size={12} className="me-1" />
                {isGenerating
                  ? "Generating…"
                  : `Download (${eventAttendees.length})`}
              </button>
            </div>
          </div>
          {/* Category design tabs — inside the header card */}
          {eventCategories.length > 1 && (
            <div
              className="d-flex align-items-center gap-1 flex-wrap mt-2 pt-2"
              style={{ borderTop: "1px solid #f0f4f8" }}
            >
              <span className="text-muted me-1" style={{ fontSize: 11 }}>
                Category design:
              </span>
              {eventCategories.map((cat) => {
                const eventCat = (selectedEvent?.categories || []).find(
                  (c) => c.label?.toLowerCase() === cat.toLowerCase(),
                );
                const color =
                  cat === "Default"
                    ? "var(--muted-foreground)"
                    : eventCat?.color || getCatColor(cat);
                return (
                  <CategoryTab
                    key={cat}
                    cat={cat}
                    color={color}
                    isActive={activeCatName === cat}
                    hasDesign={!!categoryDesigns[cat]}
                    onSwitch={switchCategory}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Editor | Preview — 40 / 60 split */}
      <div className="row g-2">
        {/* ── LEFT 40%: Accordion Editor ── */}
        <div className="col-lg-5" onClick={(e) => e.stopPropagation()}>
          <div
            className="card border-0 shadow-sm"
            style={{ overflow: "hidden" }}
          >
            {/* ── Header Elements ── */}
            <AccordionPanel
              id="header-elems"
              title="Header Elements"
              open={openPanels.has("header-elems")}
              onToggle={togglePanel}
            >
              <div className="d-flex align-items-center gap-2 mb-2">
                <div className="form-check form-check-sm mb-0 flex-grow-1">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="chk-show-header"
                    checked={showHeader}
                    onChange={(e) => setShowHeader(e.target.checked)}
                  />
                  <label
                    className="form-check-label fw-semibold"
                    htmlFor="chk-show-header"
                    style={{ fontSize: 11 }}
                  >
                    Show Header
                  </label>
                </div>
                {showHeader && (
                  <span className="text-muted" style={{ fontSize: 10 }}>
                    {headerHeight}px
                  </span>
                )}
              </div>
              {showHeader && (
                <>
                  <input
                    type="range"
                    className="form-range mb-2"
                    min="44"
                    max="200"
                    step="4"
                    value={headerHeight}
                    onChange={(e) => setHeaderHeight(Number(e.target.value))}
                  />
                  <div className="mb-2">
                    <label
                      className="form-label mb-1"
                      style={{ fontSize: 11, fontWeight: 600 }}
                    >
                      Title
                    </label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      style={{ fontSize: 11 }}
                      placeholder={selectedEvent.eventName}
                      value={headerConfig.customTitle}
                      onChange={(e) =>
                        setHeaderConfig((p) => ({
                          ...p,
                          customTitle: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="mb-2">
                    <label
                      className="form-label mb-1"
                      style={{ fontSize: 11, fontWeight: 600 }}
                    >
                      Brand Text
                    </label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      style={{ fontSize: 11 }}
                      placeholder="KnowVato"
                      value={headerConfig.brandText ?? "KnowVato"}
                      onChange={(e) =>
                        setHeaderConfig((p) => ({
                          ...p,
                          brandText: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="d-flex gap-3 mb-2">
                    <div className="form-check form-check-sm mb-0">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="chk-dates"
                        checked={headerConfig.showDates !== false}
                        onChange={(e) =>
                          setHeaderConfig((p) => ({
                            ...p,
                            showDates: e.target.checked,
                          }))
                        }
                      />
                      <label
                        className="form-check-label"
                        htmlFor="chk-dates"
                        style={{ fontSize: 11 }}
                      >
                        Show dates
                      </label>
                    </div>
                    <div className="form-check form-check-sm mb-0">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="chk-venue"
                        checked={headerConfig.showVenue !== false}
                        onChange={(e) =>
                          setHeaderConfig((p) => ({
                            ...p,
                            showVenue: e.target.checked,
                          }))
                        }
                      />
                      <label
                        className="form-check-label"
                        htmlFor="chk-venue"
                        style={{ fontSize: 11 }}
                      >
                        Show venue
                      </label>
                    </div>
                  </div>
                </>
              )}

              <div
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  color: "var(--muted-foreground)",
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                  marginBottom: 3,
                }}
              >
                Elements
              </div>
              <p className="text-muted mb-2" style={{ fontSize: 10 }}>
                Click to select · Drag on preview · ↑↓←→ keys
              </p>
              {["headerTitle", "headerSub", "headerBrand", "logo"].map(
                (key) => {
                  const { label, Icon } = ELEM_META[key];
                  const isSel = selectedElems.has(key);
                  const isHidden = layout[key]?.visible === false;
                  return (
                    <div
                      key={key}
                      className="d-flex align-items-center gap-2 rounded mb-1"
                      style={{
                        background: isSel ? "#f3e8ff" : "var(--background)",
                        border: `1px solid ${isSel ? primaryColor : "transparent"}`,
                        cursor: "pointer",
                        padding: "4px 8px",
                        opacity: isHidden ? 0.45 : 1,
                      }}
                      onClick={(e) => {
                        if (e.shiftKey) {
                          const n = new Set(selectedElems);
                          if (n.has(key)) n.delete(key);
                          else n.add(key);
                          setSelectedElems(n);
                        } else setSelectedElems(new Set([key]));
                      }}
                    >
                      <Icon
                        size={12}
                        color={isSel ? primaryColor : "var(--muted-foreground)"}
                      />
                      <span
                        style={{
                          fontSize: 12,
                          color: isSel ? primaryColor : "var(--foreground)",
                          fontWeight: isSel ? 600 : 400,
                        }}
                      >
                        {label}
                      </span>
                      <button
                        type="button"
                        className="ms-auto btn btn-link p-0 d-flex align-items-center"
                        style={{
                          color: isHidden ? "var(--muted-foreground)" : "var(--muted-foreground)",
                          lineHeight: 1,
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLayoutChange({
                            [key]: {
                              ...(layout[key] || {}),
                              visible: isHidden ? true : false,
                            },
                          });
                        }}
                      >
                        <i
                          className={`bi ${isHidden ? "bi-eye-slash" : "bi-eye"}`}
                          style={{ fontSize: 12 }}
                        />
                      </button>
                    </div>
                  );
                },
              )}

              {/* Logo upload */}
              <div className="d-flex gap-1 mt-2 mb-2">
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary flex-fill"
                  style={{ fontSize: 11 }}
                  onClick={() => logoInputRef.current?.click()}
                >
                  <FiUploadCloud size={11} className="me-1" /> Upload Logo
                </button>
                {layout.logo?.src && (
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-danger"
                    onClick={() =>
                      handleLayoutChange({
                        logo: { ...layout.logo, src: null },
                      })
                    }
                  >
                    <FiX size={11} />
                  </button>
                )}
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handleLogoUpload}
                />
              </div>
              {layout.logo?.src && (
                <div className="mb-2 text-center">
                  <img
                    src={layout.logo.src}
                    alt="Logo preview"
                    style={{
                      maxHeight: 48,
                      maxWidth: "100%",
                      objectFit: "contain",
                      borderRadius: 4,
                    }}
                  />
                </div>
              )}

              {/* Inline properties for selected header elements */}
              {showLogoProps && (
                <div
                  className="mt-2 pt-2"
                  style={{ borderTop: "1px solid var(--border)" }}
                >
                  <div
                    className="fw-semibold mb-2"
                    style={{
                      fontSize: 11,
                      color: "var(--muted-foreground)",
                      textTransform: "uppercase",
                      letterSpacing: 0.4,
                    }}
                  >
                    Logo Properties
                  </div>
                  <ElementStyleControls
                    keys={["logo"]}
                    layout={layout}
                    onLayoutChange={handleLayoutChange}
                    passW={passW}
                    passH={passH}
                    primaryColor={primaryColor}
                    showTextStyle={false}
                  />
                  <div style={{ fontSize: 11, fontWeight: 600 }}>
                    Opacity: {Math.round((layout.logo?.opacity ?? 1) * 100)}%
                  </div>
                  <input
                    type="range"
                    className="form-range mb-0"
                    min="0"
                    max="1"
                    step="0.05"
                    value={layout.logo?.opacity ?? 1}
                    onChange={(e) =>
                      handleLayoutChange({
                        logo: {
                          ...layout.logo,
                          opacity: Number(e.target.value),
                        },
                      })
                    }
                  />
                </div>
              )}
              {hdrTextSelected.length > 0 && (
                <div
                  className="mt-2 pt-2"
                  style={{ borderTop: "1px solid var(--border)" }}
                >
                  <div
                    className="fw-semibold mb-2"
                    style={{
                      fontSize: 11,
                      color: "var(--muted-foreground)",
                      textTransform: "uppercase",
                      letterSpacing: 0.4,
                    }}
                  >
                    Text Style
                    {hdrTextSelected.length > 1 && (
                      <span
                        className="badge bg-secondary ms-1"
                        style={{ fontSize: 9 }}
                      >
                        ×{hdrTextSelected.length}
                      </span>
                    )}
                  </div>
                  <TextStyleControls
                    keys={hdrTextSelected}
                    layout={layout}
                    onLayoutChange={handleLayoutChange}
                    primaryColor={primaryColor}
                  />
                  <ElementStyleControls
                    keys={hdrTextSelected}
                    layout={layout}
                    onLayoutChange={handleLayoutChange}
                    passW={passW}
                    passH={passH}
                    primaryColor={primaryColor}
                    showTextStyle={true}
                  />
                </div>
              )}
            </AccordionPanel>

            {/* ── Body Elements ── */}
            <AccordionPanel
              id="body-elems"
              title="Body Elements"
              open={openPanels.has("body-elems")}
              onToggle={togglePanel}
            >
              <p className="text-muted mb-2" style={{ fontSize: 10 }}>
                Click to select · Drag on preview · ↑↓←→ keys
              </p>
              {["categoryBadge", "name", "organization", "phone", "email", "qr"]
                .filter((k) => availableElems.has(k))
                .map((key) => {
                  const { label, Icon } = ELEM_META[key];
                  const isSel = selectedElems.has(key);
                  const isHidden = layout[key]?.visible === false;
                  return (
                    <div
                      key={key}
                      className="d-flex align-items-center gap-2 rounded mb-1"
                      style={{
                        background: isSel ? "#f3e8ff" : "var(--background)",
                        border: `1px solid ${isSel ? primaryColor : "transparent"}`,
                        cursor: "pointer",
                        padding: "4px 8px",
                        opacity: isHidden ? 0.45 : 1,
                      }}
                      onClick={(e) => {
                        if (e.shiftKey) {
                          const n = new Set(selectedElems);
                          if (n.has(key)) n.delete(key);
                          else n.add(key);
                          setSelectedElems(n);
                        } else setSelectedElems(new Set([key]));
                      }}
                    >
                      <Icon
                        size={12}
                        color={isSel ? primaryColor : "var(--muted-foreground)"}
                      />
                      <span
                        style={{
                          fontSize: 12,
                          color: isSel ? primaryColor : "var(--foreground)",
                          fontWeight: isSel ? 600 : 400,
                          flexGrow: 1,
                        }}
                      >
                        {label}
                      </span>
                      {/* Eye toggle — show / hide on pass */}
                      <button
                        type="button"
                        title={isHidden ? "Show on pass" : "Hide from pass"}
                        style={{
                          background: "none",
                          border: "none",
                          padding: 0,
                          cursor: "pointer",
                          color: isHidden ? "var(--muted-foreground)" : "var(--muted-foreground)",
                          display: "flex",
                          alignItems: "center",
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLayoutChange({
                            [key]: {
                              ...(layout[key] || {}),
                              visible: isHidden ? true : false,
                            },
                          });
                        }}
                      >
                        <i
                          className={`bi ${isHidden ? "bi-eye-slash" : "bi-eye"}`}
                          style={{ fontSize: 12 }}
                        />
                      </button>
                    </div>
                  );
                })}

              {/* Inline properties for selected body elements */}
              {showCatBadgeProps && (
                <div
                  className="mt-2 pt-2"
                  style={{ borderTop: "1px solid var(--border)" }}
                >
                  <div
                    className="fw-semibold mb-2"
                    style={{
                      fontSize: 11,
                      color: "var(--muted-foreground)",
                      textTransform: "uppercase",
                      letterSpacing: 0.4,
                    }}
                  >
                    Category Badge
                  </div>
                  <ElementStyleControls
                    keys={["categoryBadge"]}
                    layout={layout}
                    onLayoutChange={handleLayoutChange}
                    passW={passW}
                    passH={passH}
                    primaryColor={primaryColor}
                    showTextStyle={false}
                  />
                </div>
              )}
              {bodyTextSelected.length > 0 && (
                <div
                  className="mt-2 pt-2"
                  style={{ borderTop: "1px solid var(--border)" }}
                >
                  <div
                    className="fw-semibold mb-2"
                    style={{
                      fontSize: 11,
                      color: "var(--muted-foreground)",
                      textTransform: "uppercase",
                      letterSpacing: 0.4,
                    }}
                  >
                    Text Style
                    {bodyTextSelected.length > 1 && (
                      <span
                        className="badge bg-secondary ms-1"
                        style={{ fontSize: 9 }}
                      >
                        ×{bodyTextSelected.length}
                      </span>
                    )}
                  </div>
                  <TextStyleControls
                    keys={bodyTextSelected}
                    layout={layout}
                    onLayoutChange={handleLayoutChange}
                    primaryColor={primaryColor}
                  />
                  <ElementStyleControls
                    keys={bodyTextSelected}
                    layout={layout}
                    onLayoutChange={handleLayoutChange}
                    passW={passW}
                    passH={passH}
                    primaryColor={primaryColor}
                    showTextStyle={true}
                  />
                </div>
              )}
              {showQRProps && (
                <div
                  className="mt-2 pt-2"
                  style={{ borderTop: "1px solid var(--border)" }}
                >
                  <div
                    className="fw-semibold mb-2"
                    style={{
                      fontSize: 11,
                      color: "var(--muted-foreground)",
                      textTransform: "uppercase",
                      letterSpacing: 0.4,
                    }}
                  >
                    QR Code
                  </div>
                  <ElementStyleControls
                    keys={["qr"]}
                    layout={layout}
                    onLayoutChange={handleLayoutChange}
                    passW={passW}
                    passH={passH}
                    primaryColor={primaryColor}
                    showTextStyle={false}
                  />
                </div>
              )}
            </AccordionPanel>

            {/* ── Custom Elements ── */}
            <AccordionPanel
              id="custom-elems"
              title="Custom Elements"
              open={openPanels.has("custom-elems")}
              onToggle={togglePanel}
              badge={
                Object.keys(layout).filter(
                  (k) => k.startsWith("ct_") || k.startsWith("ci_"),
                ).length > 0
                  ? String(
                      Object.keys(layout).filter(
                        (k) => k.startsWith("ct_") || k.startsWith("ci_"),
                      ).length,
                    )
                  : null
              }
            >
              <div className="d-flex gap-1 mb-2">
                <button
                  type="button"
                  className="btn btn-sm btn-outline-primary flex-fill"
                  style={{ fontSize: 10, padding: "3px 0" }}
                  onClick={addCustomText}
                >
                  <FiPlus size={10} className="me-1" /> Add Text
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-primary flex-fill"
                  style={{ fontSize: 10, padding: "3px 0" }}
                  onClick={() => customImgInputRef.current?.click()}
                >
                  <FiPlus size={10} className="me-1" /> Add Image
                </button>
                <input
                  ref={customImgInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={addCustomImage}
                />
              </div>
              {Object.keys(layout).filter(
                (k) => k.startsWith("ct_") || k.startsWith("ci_"),
              ).length === 0 && (
                <p className="text-muted mb-1" style={{ fontSize: 11 }}>
                  No custom elements. Add text or images above.
                </p>
              )}
              {Object.keys(layout)
                .filter((k) => k.startsWith("ct_") || k.startsWith("ci_"))
                .map((key) => {
                  const isCustomText = key.startsWith("ct_");
                  const Icon = isCustomText ? BsTextLeft : BsImage;
                  const label = isCustomText
                    ? layout[key]?.content || "Text"
                    : "Image";
                  const isSel = selectedElems.has(key);
                  return (
                    <div
                      key={key}
                      className="d-flex align-items-center gap-2 rounded mb-1"
                      style={{
                        background: isSel ? "#f3e8ff" : "var(--background)",
                        border: `1px solid ${isSel ? primaryColor : "transparent"}`,
                        cursor: "pointer",
                        padding: "4px 8px",
                      }}
                      onClick={(e) => {
                        if (e.shiftKey) {
                          const n = new Set(selectedElems);
                          if (n.has(key)) n.delete(key);
                          else n.add(key);
                          setSelectedElems(n);
                        } else setSelectedElems(new Set([key]));
                      }}
                    >
                      <Icon
                        size={12}
                        color={isSel ? primaryColor : "var(--muted-foreground)"}
                      />
                      <span
                        style={{
                          fontSize: 12,
                          color: isSel ? primaryColor : "var(--foreground)",
                          fontWeight: isSel ? 600 : 400,
                        }}
                        className="flex-grow-1 text-truncate"
                      >
                        {label}
                      </span>
                      <button
                        type="button"
                        className="btn p-0 border-0"
                        style={{ lineHeight: 1 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteCustomElem(key);
                        }}
                      >
                        <FiTrash2 size={10} color="#EF4444" />
                      </button>
                    </div>
                  );
                })}

              {/* Inline properties for selected custom elements */}
              {showCustomTextProps && (
                <div
                  className="mt-2 pt-2"
                  style={{ borderTop: "1px solid var(--border)" }}
                >
                  <div
                    className="fw-semibold mb-2"
                    style={{
                      fontSize: 11,
                      color: "var(--muted-foreground)",
                      textTransform: "uppercase",
                      letterSpacing: 0.4,
                    }}
                  >
                    Custom Text
                    {customTextSelected.length > 1 && (
                      <span
                        className="badge bg-secondary ms-1"
                        style={{ fontSize: 9 }}
                      >
                        ×{customTextSelected.length}
                      </span>
                    )}
                  </div>
                  {customTextSelected.length === 1 && (
                    <div className="mb-2">
                      <label
                        className="form-label mb-1"
                        style={{ fontSize: 11, fontWeight: 600 }}
                      >
                        Content
                      </label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        style={{ fontSize: 11 }}
                        value={layout[customTextSelected[0]]?.content || ""}
                        onChange={(e) =>
                          handleLayoutChange({
                            [customTextSelected[0]]: {
                              ...layout[customTextSelected[0]],
                              content: e.target.value,
                            },
                          })
                        }
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  )}
                  <TextStyleControls
                    keys={customTextSelected}
                    layout={layout}
                    onLayoutChange={handleLayoutChange}
                    primaryColor={primaryColor}
                  />
                  <ElementStyleControls
                    keys={customTextSelected}
                    layout={layout}
                    onLayoutChange={handleLayoutChange}
                    passW={passW}
                    passH={passH}
                    primaryColor={primaryColor}
                    showTextStyle={true}
                  />
                  <div className="mb-2">
                    <label
                      className="form-label mb-1"
                      style={{ fontSize: 11, fontWeight: 600 }}
                    >
                      Opacity:{" "}
                      {Math.round(
                        (layout[customTextSelected[0]]?.opacity ?? 1) * 100,
                      )}
                      %
                    </label>
                    <input
                      type="range"
                      className="form-range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={layout[customTextSelected[0]]?.opacity ?? 1}
                      onChange={(e) => {
                        const v = Number(e.target.value);
                        const updates = {};
                        customTextSelected.forEach((k) => {
                          updates[k] = { ...layout[k], opacity: v };
                        });
                        handleLayoutChange(updates);
                      }}
                    />
                  </div>
                  {customTextSelected.length === 1 && (
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger w-100"
                      style={{ fontSize: 11 }}
                      onClick={() => deleteCustomElem(customTextSelected[0])}
                    >
                      <FiTrash2 size={11} className="me-1" /> Delete Text
                    </button>
                  )}
                </div>
              )}
              {showCustomImgProps && (
                <div
                  className="mt-2 pt-2"
                  style={{ borderTop: "1px solid var(--border)" }}
                >
                  <div
                    className="fw-semibold mb-2"
                    style={{
                      fontSize: 11,
                      color: "var(--muted-foreground)",
                      textTransform: "uppercase",
                      letterSpacing: 0.4,
                    }}
                  >
                    Custom Image
                  </div>
                  <ElementStyleControls
                    keys={customImgSelected}
                    layout={layout}
                    onLayoutChange={handleLayoutChange}
                    passW={passW}
                    passH={passH}
                    primaryColor={primaryColor}
                    showTextStyle={false}
                  />
                  <div style={{ fontSize: 11, fontWeight: 600 }}>
                    Opacity:{" "}
                    {Math.round(
                      (layout[customImgSelected[0]]?.opacity ?? 1) * 100,
                    )}
                    %
                  </div>
                  <input
                    type="range"
                    className="form-range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={layout[customImgSelected[0]]?.opacity ?? 1}
                    onChange={(e) =>
                      handleLayoutChange({
                        [customImgSelected[0]]: {
                          ...layout[customImgSelected[0]],
                          opacity: Number(e.target.value),
                        },
                      })
                    }
                  />
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-danger w-100 mt-1"
                    style={{ fontSize: 11 }}
                    onClick={() => deleteCustomElem(customImgSelected[0])}
                  >
                    <FiTrash2 size={11} className="me-1" /> Delete Image
                  </button>
                </div>
              )}
            </AccordionPanel>

            {/* Colors */}
            <AccordionPanel
              id="colors"
              title="Colors"
              open={openPanels.has("colors")}
              onToggle={togglePanel}
            >
              <ColorPickerWidget
                label="Pass Border"
                value={primaryColor}
                onChange={setPrimaryColor}
              />
              <ColorPickerWidget
                label="Header Background"
                value={headerColor}
                onChange={setHeaderColor}
              />
              <ColorPickerWidget
                label="QR Code Dots"
                value={qrColor}
                onChange={setQrColor}
              />
              <ColorPickerWidget
                label="Card Background"
                value={bgColor}
                onChange={setBgColor}
              />
            </AccordionPanel>

            {/* Background Image */}
            <AccordionPanel
              id="background"
              title="Background Image"
              open={openPanels.has("background")}
              onToggle={togglePanel}
            >
              <div className="d-flex gap-1 mb-2">
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary flex-fill"
                  style={{ fontSize: 11 }}
                  onClick={() => bgInputRef.current?.click()}
                >
                  <FiUploadCloud size={11} className="me-1" /> Upload
                </button>
                {bgImage && (
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => setBgImage(null)}
                  >
                    <FiX size={11} />
                  </button>
                )}
                <input
                  ref={bgInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handleBgUpload}
                />
              </div>
              {bgImage ? (
                <>
                  <div className="d-flex gap-1 mb-2">
                    {["cover", "contain", "stretch"].map((v) => (
                      <button
                        key={v}
                        type="button"
                        className={`btn flex-fill ${bgFit === v ? "btn-primary" : "btn-outline-secondary"}`}
                        style={{ fontSize: 10, padding: "2px 0" }}
                        onClick={() => setBgFit(v)}
                      >
                        {v[0].toUpperCase() + v.slice(1)}
                      </button>
                    ))}
                  </div>
                  {bgFit !== "stretch" && (
                    <>
                      <div style={{ fontSize: 10, fontWeight: 600 }}>
                        X: {bgPosX}%
                      </div>
                      <input
                        type="range"
                        className="form-range"
                        min="0"
                        max="100"
                        step="5"
                        value={bgPosX}
                        onChange={(e) => setBgPosX(Number(e.target.value))}
                        style={{ marginBottom: 2 }}
                      />
                      <div style={{ fontSize: 10, fontWeight: 600 }}>
                        Y: {bgPosY}%
                      </div>
                      <input
                        type="range"
                        className="form-range"
                        min="0"
                        max="100"
                        step="5"
                        value={bgPosY}
                        onChange={(e) => setBgPosY(Number(e.target.value))}
                      />
                    </>
                  )}
                  <div style={{ fontSize: 10, fontWeight: 600, marginTop: 4 }}>
                    Opacity: {bgOpacity}%
                  </div>
                  <input
                    type="range"
                    className="form-range mb-0"
                    min="0"
                    max="100"
                    step="5"
                    value={bgOpacity}
                    onChange={(e) => setBgOpacity(Number(e.target.value))}
                  />
                </>
              ) : (
                <p className="text-muted mb-0" style={{ fontSize: 11 }}>
                  Upload an image to enable controls.
                </p>
              )}
            </AccordionPanel>

            {/* Pass Size */}
            <AccordionPanel
              id="passsize"
              title="Pass Size"
              open={openPanels.has("passsize")}
              onToggle={togglePanel}
            >
              <div className="d-flex flex-wrap gap-1 mb-2">
                {PASS_PRESETS.map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    className={`btn btn-sm ${passW === p.w && passH === p.h ? "btn-primary" : "btn-outline-secondary"}`}
                    style={{ fontSize: 10, padding: "2px 7px" }}
                    onClick={() => handlePassSize(p.w, p.h)}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
              <div className="d-flex gap-1 align-items-end mb-1">
                <div className="flex-fill">
                  <div style={{ fontSize: 10, fontWeight: 600 }}>W (px)</div>
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    style={{ fontSize: 11 }}
                    value={passW}
                    min="200"
                    max="1200"
                    step="10"
                    onChange={(e) =>
                      handlePassSize(Number(e.target.value), passH)
                    }
                  />
                </div>
                <div
                  style={{ paddingBottom: 6, color: "var(--muted-foreground)", fontSize: 12 }}
                >
                  ×
                </div>
                <div className="flex-fill">
                  <div style={{ fontSize: 10, fontWeight: 600 }}>H (px)</div>
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    style={{ fontSize: 11 }}
                    value={passH}
                    min="200"
                    max="1200"
                    step="10"
                    onChange={(e) =>
                      handlePassSize(passW, Number(e.target.value))
                    }
                  />
                </div>
              </div>
              <p className="text-muted mb-0" style={{ fontSize: 10 }}>
                {passW} × {passH} px
              </p>
              <div className="mt-2">
                <div
                  className="d-flex justify-content-between"
                  style={{ fontSize: 10, fontWeight: 600, marginBottom: 2 }}
                >
                  <span>Corner Radius</span>
                  <span>{passRadius}px</span>
                </div>
                <input
                  type="range"
                  className="form-range"
                  min="0"
                  max="40"
                  step="1"
                  value={passRadius}
                  onChange={(e) => setPassRadius(Number(e.target.value))}
                />
              </div>
            </AccordionPanel>
          </div>
        </div>

        {/* ── RIGHT 60%: Preview ── */}
        <div className="col-lg-7">
          <div
            className="card border-0 shadow-sm"
            style={{ position: "sticky", top: 8 }}
          >
            <div className="card-body p-2 d-flex flex-column">
              <div className="d-flex justify-content-between align-items-center mb-2 gap-2 flex-wrap">
                <h6 className="fw-semibold mb-0" style={{ fontSize: 12 }}>
                  Preview
                </h6>
                <div className="d-flex align-items-center gap-1">
                  <div className="position-relative" style={{ width: 190 }}>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      style={{ fontSize: 11, paddingRight: "1.8rem" }}
                      placeholder="Search attendee…"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    {search ? (
                      <button
                        type="button"
                        onClick={() => setSearch("")}
                        style={{
                          position: "absolute",
                          right: "0.4rem",
                          top: "50%",
                          transform: "translateY(-50%)",
                          background: "none",
                          border: "none",
                          padding: 0,
                          cursor: "pointer",
                          color: "var(--muted-foreground)",
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <FiX size={11} />
                      </button>
                    ) : (
                      <FiSearch
                        size={11}
                        className="text-muted"
                        style={{
                          position: "absolute",
                          right: "0.6rem",
                          top: "50%",
                          transform: "translateY(-50%)",
                          pointerEvents: "none",
                        }}
                      />
                    )}
                  </div>
                  {search && (
                    <span className="text-muted" style={{ fontSize: 10 }}>
                      {matchCount}
                    </span>
                  )}
                </div>
              </div>
              {previewAttendee && (
                <p className="text-muted mb-2" style={{ fontSize: 11 }}>
                  <strong>{previewAttendee.name}</strong>
                  {previewAttendee.category && (
                    <>
                      {" "}
                      ·{" "}
                      <span
                        style={{
                          color: getCatColor(
                            previewAttendee.category,
                            selectedEvent?.categories || [],
                          ),
                        }}
                      >
                        {previewAttendee.category}
                      </span>
                    </>
                  )}
                </p>
              )}
              <div
                className="d-flex justify-content-center"
                onClick={(e) => e.stopPropagation()}
              >
                <PassPreview
                  attendee={previewAttendee}
                  event={selectedEvent}
                  config={config}
                  layout={layout}
                  onLayoutChange={handleLayoutChange}
                  previewQR={previewQR}
                  selectedElems={selectedElems}
                  onSetSelectedElems={setSelectedElems}
                  passW={passW}
                  passH={passH}
                  scale={scale}
                  previewH={previewH}
                  hdrH={hdrH}
                  availableElems={availableElems}
                />
              </div>
              <p
                className="text-muted text-center mt-2 mb-0"
                style={{ fontSize: 10 }}
              >
                Click to select · Shift+click multi · Drag or ↑↓←→ (Shift=10px)
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PassDesignerPage;
