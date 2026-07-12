import React, { useEffect, useRef } from 'react';

/*
 * RegistrationFormBuilder
 * -----------------------
 * Ported 1:1 from the standalone HTML prototype (form-builder.html).
 * Same look, same functionality, same internal logic — only the app
 * shell (mounting + CSS scoping) was adapted for React.
 *
 * The original app is an imperative, template-string-based renderer
 * (a single mutable `state` object + manual innerHTML re-render on every
 * change). Rather than rewrite ~1100 lines of tightly-coupled render/state
 * logic into idiomatic React hooks (high risk of behavior drift), this
 * component mounts that exact engine inside a React-managed container:
 *   - All CSS is scoped under a single `.rfb-scope` wrapper class so it
 *     can't leak into (or be clobbered by) the host app's styles.
 *   - The two root containers (sidebar/main) get unique ids per instance
 *     so multiple copies of this component can coexist on one page.
 *   - All interactive functions are attached to `window` once on mount,
 *     because the engine renders plain HTML strings with inline
 *     onclick="..." / onchange="..." attributes, which the browser
 *     resolves against the global scope.
 *
 * To wire this up to a real backend: see `publishForm()` and `toggleJson()`
 * near the bottom of the effect — `publishForm()` currently just shows an
 * alert with `state.formTitle`; replace that with your API call, and use
 * the same `state` (formTitle, formType, formColumns, steps) as the
 * payload shape (see `toggleJson()`'s `exportable` object for the exact
 * shape already being used for the JSON export debug view).
 */

const SCOPED_CSS = `
  .rfb-scope {
    --accent:#0d6efd;
    --accent-dark:#0b5ed7;
    --bg:#F7FBFE;
    --text:#40474D;
    --border:#E5EAEE;
    --white:#ffffff;
    --green:#1E9E6B;
    --amber:#C98A1F;
    --red:#D14343;
    --radius:10px;
  }
  .rfb-scope * {box-sizing:border-box;}
  .rfb-scope {
    margin:0; font-family:'Inter',-apple-system,BlinkMacSystemFont,sans-serif;
    background:var(--bg); color:var(--text);
  }
  .rfb-scope .app {display:flex; min-height:100vh;}
  /* ===== Sidebar ===== */
  .rfb-scope .side {
    width:230px; background:var(--white); border-right:1px solid var(--border);
    padding:18px 16px; flex-shrink:0;
  }
  .rfb-scope .brand {display:flex; align-items:center; gap:8px; margin-bottom:18px;}
  .rfb-scope .brand-mark {width:30px;height:30px;border-radius:8px;background:var(--accent);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:14px;}
  .rfb-scope .brand-name {font-weight:700; font-size:15px; color:var(--text);}
  .rfb-scope .side-step {
    display:flex; gap:10px; align-items:flex-start; padding:8px 8px; border-radius:8px; margin-bottom:2px; cursor:pointer; opacity:.5;
  }
  .rfb-scope .side-step.active {background:#EAF6FA; opacity:1;}
  .rfb-scope .side-step.done {opacity:1;}
  .rfb-scope .side-num {
    width:22px;height:22px;border-radius:50%;background:var(--border);color:#fff;font-size:11px;
    display:flex;align-items:center;justify-content:center;flex-shrink:0;font-weight:700;
  }
  .rfb-scope .side-step.active .side-num, .rfb-scope .side-step.done .side-num {background:var(--accent);}
  .rfb-scope .side-label {font-size:13px; font-weight:600; line-height:1.4;}
  .rfb-scope .side-sub {font-size:11px; color:#8a939b; margin-top:1px;}

  /* ===== Main ===== */
  .rfb-scope .main {flex:1; padding:18px 20px; width:100%;}
  .rfb-scope .titlerow {display:flex; align-items:baseline; gap:10px; margin-bottom:3px;}
  .rfb-scope .topline {font-size:11px; color:var(--accent); font-weight:700; letter-spacing:.04em; text-transform:uppercase; margin-bottom:0;}
  .rfb-scope h1 {font-size:19px; margin:0; font-weight:700;}
  .rfb-scope .desc {color:#76808a; font-size:12.5px; margin-bottom:14px; max-width:640px; line-height:1.4;}

  .rfb-scope .card {background:var(--white); border:1px solid var(--border); border-radius:var(--radius); padding:14px 16px; margin-bottom:12px;}
  .rfb-scope .card h3 {margin:0 0 4px; font-size:15px;}
  .rfb-scope .card .hint {font-size:12.5px; color:#8a939b; margin-bottom:14px;}

  /* choice cards */
  .rfb-scope .choice-grid {display:grid; grid-template-columns:1fr 1fr; gap:12px;}
  .rfb-scope .setup-row {display:grid; grid-template-columns:0.8fr 1fr 1fr; gap:12px; align-items:stretch;}
  .rfb-scope .setup-row .card {margin-bottom:0; display:flex; flex-direction:column; justify-content:center;}
  .rfb-scope .choice {
    position:relative; border:2px solid var(--border); border-radius:var(--radius); padding:14px; cursor:pointer; background:#fff;
    transition:.15s; box-shadow:0 1px 2px rgba(20,30,40,.03);
  }
  .rfb-scope .choice:hover {border-color:#bfe3ee; box-shadow:0 2px 8px rgba(0,133,168,.08);}
  .rfb-scope .choice.selected {border-color:var(--accent); background:#F0FAFC; box-shadow:0 2px 10px rgba(0,133,168,.12);}
  .rfb-scope .choice-radio {
    position:absolute; top:18px; right:18px; width:20px;height:20px;border-radius:50%;border:2px solid #cdd6db;background:#fff;
  }
  .rfb-scope .choice.selected .choice-radio {border-color:var(--accent); background:#fff;}
  .rfb-scope .choice.selected .choice-radio::after {
    content:''; display:block; width:10px; height:10px; margin:3px auto; border-radius:50%; background:var(--accent);
  }
  .rfb-scope .choice-head {display:flex; align-items:center; gap:10px; margin-bottom:10px;}
  .rfb-scope .choice-icon {width:30px;height:30px;border-radius:8px;background:var(--accent);color:#fff;display:flex;align-items:center;justify-content:center;font-size:15px;flex-shrink:0;}
  .rfb-scope .choice h4 {margin:0; font-size:14px;}
  .rfb-scope .choice p {margin:0 0 8px; font-size:12px; color:#8a939b; line-height:1.4;}
  .rfb-scope .wireframe {width:100%; border-radius:7px; background:#F4F8FA; border:1px solid var(--border); padding:10px;}
  .rfb-scope .choice.selected .wireframe {background:#fff; border-color:#d7ecf2;}

  /* step list builder (for choosing stepper steps) */
  .rfb-scope .steplist {display:flex; flex-direction:column; gap:8px;}
  .rfb-scope .step-row {display:flex; align-items:center; gap:10px; border:1px solid var(--border); border-radius:8px; padding:10px 12px;}
  .rfb-scope .step-row input[type=text] {flex:1; border:none; font-size:13.5px; font-weight:600; outline:none; background:transparent; color:var(--text);}
  .rfb-scope .step-row-wrap {border-radius:8px;}
  .rfb-scope .step-row-wrap.has-approval .step-row {border-color:#bfe3ee; background:#FAFEFF; border-radius:8px 8px 0 0;}
  .rfb-scope .approval-check {display:flex; align-items:center; gap:6px; font-size:11.5px; font-weight:600; color:#76808a; cursor:pointer; flex-shrink:0; padding:5px 9px; border-radius:20px; background:#F2F4F6;}
  .rfb-scope .approval-check input {margin:0; accent-color:var(--green);}
  .rfb-scope .step-row-wrap.has-approval .approval-check {background:#E8F6EF; color:var(--green);}
  .rfb-scope .approval-check.checked {background:#E8F6EF; color:var(--green);}
  .rfb-scope .approval-detail {display:flex; align-items:flex-start; gap:10px; background:#F0FAF5; border:1px solid #cdeede; border-top:none; border-radius:0 0 8px 8px; padding:10px 14px 12px;}
  .rfb-scope .approval-detail-ic {font-size:14px; margin-top:2px;}
  .rfb-scope .add-row-btn.approval-add {color:var(--green); border-color:#bfe3cf;}
  .rfb-scope .add-row-btn.approval-add:hover {border-color:var(--green); background:#F0FAF5;}
  .rfb-scope .approval-group-card {background:#F7FDFA; border:1px solid #cdeede; border-radius:var(--radius); padding:0; margin-bottom:14px; overflow:hidden;}
  .rfb-scope .approval-group-header {display:flex; align-items:center; gap:10px; padding:14px 18px; background:#EEF9F3;}
  .rfb-scope .approval-group-header .group-name-input {flex:1; border:none; background:transparent; font-size:13.5px; font-weight:600; color:var(--text); outline:none;}
  .rfb-scope .chip-approval {font-size:11px; padding:3px 8px; border-radius:20px; background:#D9F0E2; color:var(--green); font-weight:600;}
  .rfb-scope .approval-group-card .approval-detail {padding:14px 18px 16px;}
  .rfb-scope .drag {color:#c4cbd1; cursor:grab; font-size:14px;}
  .rfb-scope .chip {
    font-size:11px; padding:3px 8px; border-radius:20px; background:#EAF6FA; color:var(--accent-dark); font-weight:600;
  }
  .rfb-scope .icon-btn {
    background:none;border:none;color:#b6bec5;cursor:pointer;font-size:15px;padding:2px 6px;border-radius:6px;
  }
  .rfb-scope .icon-btn:hover {color:var(--red); background:#FDF0F0;}
  .rfb-scope .add-row-btn {
    border:1.5px dashed #c9d3da; border-radius:8px; padding:10px; text-align:center; font-size:13px; color:var(--accent-dark);
    cursor:pointer; font-weight:600; background:#fff;
  }
  .rfb-scope .add-row-btn:hover {border-color:var(--accent); background:#F0FAFC;}

  /* tabs for stepper config */
  .rfb-scope .tabbar {display:flex; gap:6px; border-bottom:1px solid var(--border); margin-bottom:18px; overflow-x:auto;}
  .rfb-scope .tab {
    padding:9px 16px; font-size:13px; font-weight:600; color:#8a939b; cursor:pointer; border-bottom:2px solid transparent;
    white-space:nowrap;
  }
  .rfb-scope .tab.active {color:var(--accent-dark); border-color:var(--accent);}
  .rfb-scope .tab-add {color:var(--accent-dark);}
  .rfb-scope .tab.tab-approval:not(.active) {color:var(--green);}
  .rfb-scope .tab-settings {margin-left:auto; color:#8a939b; font-weight:500;}
  .rfb-scope .tab-settings:hover {color:var(--accent-dark);}

  /* builder screen 2 header */
  .rfb-scope .builder-head {display:flex; align-items:flex-start; gap:14px; margin-bottom:16px; padding-bottom:16px; border-bottom:1px solid var(--border);}
  .rfb-scope .builder-head-ic {width:36px;height:36px;border-radius:10px;background:linear-gradient(135deg,var(--accent),var(--accent-dark));color:#fff;display:flex;align-items:center;justify-content:center;font-size:17px;flex-shrink:0; box-shadow:0 3px 8px rgba(0,133,168,.25);}
  .rfb-scope .builder-head h1 {margin-bottom:3px;}
  .rfb-scope .builder-stats {display:flex; gap:18px; margin-left:auto; flex-shrink:0; padding-top:2px;}
  .rfb-scope .builder-stat {text-align:center; min-width:46px;}
  .rfb-scope .builder-stat strong {display:block; font-size:17px; color:var(--accent-dark); line-height:1.1;}
  .rfb-scope .builder-stat span {font-size:10.5px; color:#9aa3ab; text-transform:uppercase; letter-spacing:.03em;}

  .rfb-scope .step-info-card {
    background:#fff; border:1px solid var(--border); border-radius:var(--radius); padding:14px 16px; margin-bottom:16px;
    box-shadow:0 1px 3px rgba(20,30,40,.03);
  }
  .rfb-scope .step-info-top {display:flex; align-items:center; gap:12px;}
  .rfb-scope .step-info-num {width:26px;height:26px;border-radius:50%;background:var(--accent);color:#fff;font-size:12px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0;}

  /* field rows */
  .rfb-scope .field-card {border:1px solid var(--border); border-radius:9px; padding:14px 16px; margin-bottom:10px; background:#fff;}
  .rfb-scope .field-top {display:flex; align-items:center; gap:10px;}
  .rfb-scope .field-name {font-weight:600; font-size:13.5px; flex:1;}
  .rfb-scope .field-type-badge {font-size:11px; background:#F2F4F6; color:#76808a; padding:3px 8px; border-radius:6px;}
  .rfb-scope .field-actions {display:flex; align-items:center; gap:6px;}
  .rfb-scope .toggle {
    width:34px;height:19px;border-radius:20px;background:#dfe5e9; position:relative; cursor:pointer; transition:.15s; flex-shrink:0;
  }
  .rfb-scope .toggle.on {background:var(--accent);}
  .rfb-scope .toggle::after {
    content:''; position:absolute; top:2px; left:2px; width:15px;height:15px;border-radius:50%;background:#fff; transition:.15s;
    box-shadow:0 1px 2px rgba(0,0,0,.25);
  }
  .rfb-scope .toggle.on::after {left:17px;}
  .rfb-scope .toggle-label {font-size:11px; color:#8a939b; width:64px;}
  .rfb-scope .field-meta {display:flex; gap:18px; margin-top:8px; font-size:11.5px; color:#8a939b; padding-left:0;}
  .rfb-scope .cond-box {
    margin-top:10px; padding:10px 12px; background:#FBFAF3; border:1px solid #EFE8C8; border-radius:7px; font-size:12.5px;
  }
  .rfb-scope .cond-box select, .rfb-scope .cond-box input {font-size:12.5px; padding:4px 6px; border-radius:5px; border:1px solid var(--border); margin:0 3px;}

  .rfb-scope select, .rfb-scope input[type=text], .rfb-scope input[type=number], .rfb-scope input[type=email], .rfb-scope input[type=tel], .rfb-scope input[type=date], .rfb-scope input[type=file], .rfb-scope textarea {
    font-family:inherit; padding:8px 10px; border-radius:7px; border:1px solid var(--border); font-size:13px; color:var(--text); background:#fff;
    transition:border-color .15s, box-shadow .15s;
  }
  .rfb-scope select:focus, .rfb-scope input[type=text]:focus, .rfb-scope input[type=number]:focus, .rfb-scope input[type=email]:focus, .rfb-scope input[type=tel]:focus, .rfb-scope input[type=date]:focus, .rfb-scope textarea:focus {
    outline:none; border-color:var(--accent); box-shadow:0 0 0 3px rgba(0,133,168,.12);
  }
  .rfb-scope textarea {font-family:inherit; resize:vertical;}
  .rfb-scope input[type=file] {padding:6px 10px; font-size:12.5px; cursor:pointer;}
  .rfb-scope label.f {display:block; font-size:12px; font-weight:600; color:#76808a; margin-bottom:5px;}

  .rfb-scope .field-builder-form {display:grid; grid-template-columns:1.4fr 1fr 1fr; gap:12px; margin-bottom:14px; align-items:end;}
  .rfb-scope .full-w {grid-column:1/-1;}

  .rfb-scope .btn {
    background:var(--accent); color:#fff; border:none; padding:10px 18px; border-radius:8px; font-size:13.5px; font-weight:700; cursor:pointer;
  }
  .rfb-scope .btn:hover {background:var(--accent-dark);}
  .rfb-scope .btn.secondary {background:#fff; color:var(--accent-dark); border:1px solid var(--accent);}
  .rfb-scope .btn.secondary:hover {background:#F0FAFC;}
  .rfb-scope .btn.ghost {background:none; color:#8a939b; border:1px solid var(--border);}
  .rfb-scope .btn.ghost:hover {color:var(--text); border-color:#c9d3da;}
  .rfb-scope .btn:disabled {opacity:.4; cursor:not-allowed;}

  .rfb-scope .footer-nav {display:flex; justify-content:space-between; margin-top:4px;}

  /* notification config */
  .rfb-scope .notif-grid {display:grid; grid-template-columns:repeat(3,1fr); gap:14px; margin-bottom:16px;}
  .rfb-scope .notif-card {border:1px solid var(--border); border-radius:9px; padding:14px;}
  .rfb-scope .notif-card .ic {font-size:18px; margin-bottom:6px;}
  .rfb-scope .notif-card h4 {margin:0 0 8px; font-size:13px;}
  .rfb-scope .notif-card select {width:100%; margin-bottom:8px;}
  .rfb-scope .status-row {display:flex; align-items:center; gap:10px; border:1px solid var(--border); border-radius:9px; padding:12px 14px; margin-bottom:10px;}
  .rfb-scope .status-dot {width:9px;height:9px;border-radius:50%;background:var(--accent); flex-shrink:0;}

  /* preview pane */
  .rfb-scope .preview-wrap {display:flex; gap:20px;}
  .rfb-scope .preview-form {flex:1.3; background:#fff; border:1px solid var(--border); border-radius:var(--radius); padding:24px;}
  .rfb-scope .preview-side {flex:1; }
  .rfb-scope .pf-field {margin-bottom:16px;}
  .rfb-scope .pf-field label {display:block; font-size:12.5px; font-weight:600; margin-bottom:6px;}
  .rfb-scope .pf-field .req {color:var(--red);}
  .rfb-scope .pf-field input, .rfb-scope .pf-field select {width:100%;}
  .rfb-scope .pf-stepper {display:flex; gap:0; margin-bottom:26px;}
  .rfb-scope .pf-step {flex:1; text-align:center; position:relative;}
  .rfb-scope .pf-step .dot {width:26px;height:26px;border-radius:50%;background:#dfe5e9;color:#fff;display:flex;align-items:center;justify-content:center;margin:0 auto 6px;font-size:12px;font-weight:700;}
  .rfb-scope .pf-step.active .dot {background:var(--accent);}
  .rfb-scope .pf-step.done .dot {background:var(--green);}
  .rfb-scope .pf-step span {font-size:11px;color:#8a939b;}
  .rfb-scope .pf-step.active span {color:var(--text); font-weight:600;}
  .rfb-scope .pf-step::after {content:'';position:absolute; top:13px; right:-50%; width:100%; height:2px; background:#dfe5e9; z-index:-1;}
  .rfb-scope .pf-step:last-child::after {display:none;}

  .rfb-scope .summary-pill {
    display:inline-flex; align-items:center; gap:6px; background:#EAF6FA; color:var(--accent-dark); font-size:11.5px; font-weight:600;
    padding:4px 10px; border-radius:20px; margin:3px 4px 0 0;
  }
  .rfb-scope .json-box {
    background:#26303A; color:#cfe8f0; font-family:'SFMono-Regular',Consolas,monospace; font-size:11.5px; padding:14px;
    border-radius:8px; max-height:340px; overflow:auto; white-space:pre-wrap; line-height:1.5;
  }
  .rfb-scope .empty {font-size:12.5px; color:#aab2b8; text-align:center; padding:20px 0;}
  .rfb-scope .small-link {font-size:12px; color:var(--accent-dark); cursor:pointer; font-weight:600;}
  .rfb-scope .field-type-list {display:flex; gap:8px; flex-wrap:wrap; margin-bottom:4px;}

  /* ===== Field groups (accordion) ===== */
  .rfb-scope .group-card {background:#fff; border:1px solid var(--border); border-radius:var(--radius); padding:18px; margin-bottom:14px; transition:box-shadow .15s, border-color .15s;}
  .rfb-scope .group-card:hover {box-shadow:0 2px 10px rgba(20,30,40,.05);}
  .rfb-scope .acc-header {display:flex; align-items:center; gap:10px; cursor:pointer;}
  .rfb-scope .acc-chevron {font-size:18px; color:#6b7580; width:18px; flex-shrink:0; display:flex; align-items:center; justify-content:center; font-weight:700;}
  .rfb-scope .group-name-input {font-weight:700; font-size:14.5px; border:none; background:transparent; flex:1; padding:4px 0; color:var(--text);}
  .rfb-scope .group-name-input:focus {outline:none; border-bottom:1.5px solid var(--accent);}
  .rfb-scope .preset-row {display:flex; gap:8px; flex-wrap:wrap; margin-bottom:10px;}
  .rfb-scope .preset-chip {
    border:1.5px dashed #c9d3da; border-radius:20px; padding:7px 14px; font-size:12.5px; font-weight:600; color:var(--accent-dark);
    cursor:pointer; background:#fff;
  }
  .rfb-scope .preset-chip:hover {border-color:var(--accent); background:#F0FAFC;}
  .rfb-scope .preset-chip.selected {border:1.5px solid var(--accent); background:var(--accent); color:#fff;}
  .rfb-scope .seqlist {display:flex; flex-direction:column; gap:6px;}
  .rfb-scope .seq-row {display:flex; align-items:center; gap:10px; border:1px solid var(--border); border-radius:8px; padding:9px 12px; background:#fff;}
  .rfb-scope .seq-num {
    width:22px;height:22px;border-radius:50%;background:var(--accent);color:#fff;font-size:11px;font-weight:700;
    display:flex;align-items:center;justify-content:center;flex-shrink:0;
  }
  .rfb-scope input.seq-num-input {
    width:40px;height:26px;border-radius:6px;background:var(--accent);color:#fff;font-size:12px;font-weight:700;
    display:flex;align-items:center;justify-content:center;flex-shrink:0;border:none;text-align:center;outline:none;
    padding:0 2px; -moz-appearance:textfield; box-sizing:border-box; line-height:26px;
  }
  .rfb-scope input.seq-num-input::-webkit-outer-spin-button, .rfb-scope input.seq-num-input::-webkit-inner-spin-button {-webkit-appearance:none; margin:0;}
  .rfb-scope input.seq-num-input:focus {box-shadow:0 0 0 2px rgba(0,133,168,.3); border-color:transparent;}
  .rfb-scope .seq-name {flex:1; font-size:13px; font-weight:600;}
  .rfb-scope .editable-name-wrap {flex:1; display:flex; align-items:center; gap:6px; min-width:0;}
  .rfb-scope .editable-name-wrap input[type=text] {flex:1; min-width:0; border:none; background:transparent; font-size:13px; font-weight:600; color:var(--text); outline:none; padding:2px 0;}
  .rfb-scope .editable-name-wrap:hover input[type=text] {background:#F4F8FA; border-radius:4px; padding:2px 4px;}
  .rfb-scope .edit-pencil {font-size:11px; color:#b7c0c7; flex-shrink:0; cursor:default;}
  .rfb-scope .editable-name-wrap:hover .edit-pencil {color:var(--accent);}
  .rfb-scope .seq-actions {display:flex; gap:2px;}
  .rfb-scope .seq-row-add {border-style:dashed; cursor:pointer; background:#fff;}
  .rfb-scope .seq-row-add:hover {border-color:var(--accent); background:#F0FAFC;}
  .rfb-scope .seq-num-empty {background:#fff; border:1.5px dashed #c9d3da; color:#c9d3da;}
  .rfb-scope .seq-name-muted {color:var(--accent-dark); font-weight:600;}
  .rfb-scope .new-group-row {display:flex; gap:8px; align-items:center;}
  .rfb-scope .new-group-row input {flex:1; max-width:280px;}
  .rfb-scope .add-group-bar {
    display:flex; align-items:center; gap:14px; flex-wrap:wrap;
    background:#fff; border:1px dashed var(--border); border-radius:var(--radius);
    padding:12px 16px; margin-bottom:14px;
  }
  .rfb-scope .comm-status-card {padding:16px 18px;}
  .rfb-scope .comm-status-header {display:flex; align-items:flex-start; justify-content:space-between; gap:12px; cursor:pointer;}
  .rfb-scope .comm-status-header .acc-chevron {color:#8a939b; font-size:13px; margin-top:2px;}

  /* ===== Inline field-library checklist (inside accordion) ===== */
  .rfb-scope .lib-inline {border:1px solid var(--border); border-radius:9px; margin-top:14px; overflow:hidden; background:#FAFCFD;}
  .rfb-scope .lib-inline-head {padding:10px 12px; border-bottom:1px solid var(--border); display:flex; flex-direction:column; gap:8px; background:#fff;}
  .rfb-scope .lib-inline-top {display:flex; align-items:center; gap:12px; flex-wrap:wrap;}
  .rfb-scope .lib-cat-pills {display:flex; gap:6px; flex-wrap:wrap; flex:1; justify-content:flex-end;}
  .rfb-scope .lib-cat-pill {padding:6px 11px; font-size:11.5px; font-weight:600; border-radius:20px; cursor:pointer; color:#76808a; background:#F2F4F6; white-space:nowrap;}
  .rfb-scope .lib-cat-pill.active {background:var(--accent); color:#fff;}
  .rfb-scope .lib-search {width:260px; flex-shrink:0;}
  .rfb-scope .select-all-row {display:flex; align-items:center; gap:7px; font-size:12px; font-weight:600; color:var(--accent-dark); cursor:pointer; padding-top:2px;}
  .rfb-scope .select-all-row input {margin:0;}
  .rfb-scope .lib-inline-list {
    max-height:260px; overflow-y:auto; padding:8px 12px; border: 1px solid var(--border); border-radius: 8px; background: #fafafa;
    display:grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap:6px 12px;
  }
  .rfb-scope .lib-row {
    display:flex; align-items:center; gap:6px; padding:6px 8px; border-radius:7px; font-size:13px; break-inside:avoid;
  }
  .rfb-scope .lib-row:hover {background:#fff;}
  .rfb-scope .lib-row-check {display:flex; align-items:center; gap:9px; cursor:pointer; flex:1; min-width:0;}
  .rfb-scope .lib-row-check input {margin:0; flex-shrink:0;}
  .rfb-scope .lib-row-label {overflow:hidden; text-overflow:ellipsis; white-space:nowrap;}
  .rfb-scope .lib-row-label-empty {color:var(--text);}
  .rfb-scope .lib-row .cat-tag {font-size:10px; color:#aab2b8; margin-left:auto; flex-shrink:0;}
  .rfb-scope .lib-row-dup {opacity:.65;}
  .rfb-scope .lib-row-dup .lib-row-check {cursor:not-allowed;}
  .rfb-scope .lib-row-label-dup {color:#aab2b8;}
  .rfb-scope .dup-tag {background:#F2F4F6; color:#8a939b; padding:2px 8px; border-radius:10px; font-weight:600;}
  .rfb-scope .rename-input {font-size:12.5px; padding:3px 6px; width:140px;}
  .rfb-scope .row-icons {display:flex; gap:3px; margin-left:auto; flex-shrink:0;}
  .rfb-scope .row-icon {
    width:22px; height:22px; border-radius:5px; border:1px solid var(--border); background:#fff; color:#9aa3a9;
    font-size:11px; cursor:pointer; display:flex; align-items:center; justify-content:center; flex-shrink:0; padding:0;
  }
  .rfb-scope .row-icon:hover {border-color:#c9d3da; color:var(--text);}
  .rfb-scope .row-icon.on {background:var(--accent); border-color:var(--accent); color:#fff;}

  /* column selector */
  .rfb-scope .col-selector {display:flex; gap:8px; margin-top:8px;}
  .rfb-scope .col-option {
    display:flex; flex-direction:column; align-items:center; gap:6px; padding:10px 14px; border:2px solid var(--border);
    border-radius:9px; cursor:pointer; background:#fff; transition:.15s; min-width:68px;
  }
  .rfb-scope .col-option:hover {border-color:#bfe3ee;}
  .rfb-scope .col-option.active {border-color:var(--accent); background:#F0FAFC;}
  .rfb-scope .col-option-vis {display:flex; gap:3px; align-items:flex-end; height:28px;}
  .rfb-scope .col-bar {background:#d5e8ef; border-radius:3px; width:14px;}
  .rfb-scope .col-option.active .col-bar {background:var(--accent);}
  .rfb-scope .col-option-label {font-size:11.5px; font-weight:700; color:#76808a;}
  .rfb-scope .col-option.active .col-option-label {color:var(--accent-dark);}

  /* approval type radio */
  .rfb-scope .approval-type-row {display:flex; gap:8px; flex-wrap:wrap; margin:8px 0 0;}
  .rfb-scope .approval-type-opt {
    display:flex; align-items:center; gap:6px; padding:7px 13px; border:1.5px solid var(--border);
    border-radius:20px; cursor:pointer; font-size:12.5px; font-weight:600; color:#76808a; background:#fff;
    transition:.15s;
  }
  .rfb-scope .approval-type-opt:hover {border-color:#bfe3ee;}
  .rfb-scope .approval-type-opt.active {border-color:var(--accent); background:#F0FAFC; color:var(--accent-dark);}
  .rfb-scope .approval-type-dot {width:12px;height:12px;border-radius:50%;border:2px solid #c9d3da;flex-shrink:0;}
  .rfb-scope .approval-type-opt.active .approval-type-dot {background:var(--accent);border-color:var(--accent);}

  /* Simulator Styles */
  .rfb-scope .sim-container {display:flex; border:1.5px solid var(--border); border-radius:12px; overflow:hidden; background:#fff; min-height:420px; box-shadow: 0 4px 12px rgba(0,0,0,0.04);}
  .rfb-scope .sim-sidebar {width:200px; background:#f8fafc; border-right:1px solid var(--border); padding:16px 12px; flex-shrink:0;}
  .rfb-scope .sim-step-item {display:flex; align-items:center; gap:8px; padding:10px 12px; border-radius:6px; font-size:12.5px; font-weight:500; color:#64748b; margin-bottom:4px; cursor:pointer; transition: background .15s;}
  .rfb-scope .sim-step-item:hover {background:#f1f5f9; color:#334155;}
  .rfb-scope .sim-step-item.active {background:#e0f2fe; color:#0369a1; font-weight:600;}
  .rfb-scope .sim-step-item.done {color:#0f766e; font-weight:600;}
  .rfb-scope .sim-content {flex:1; padding:24px; background:#fff; display:flex; flex-direction:column;}
  .rfb-scope .sim-header {border-bottom:1px solid #f1f5f9; padding-bottom:12px; margin-bottom:16px;}
  .rfb-scope .sim-title {font-size:17px; font-weight:700; color:#1e293b; margin:0;}
  .rfb-scope .sim-tagline {font-size:12.5px; color:#64748b; font-style:italic; margin-top:2px;}

`;

export default function RegistrationFormBuilder({ initialForm, onSave, onCancel, statuses = [], templates = [], startScreen = "setup" }) {
  const sidebarRef = useRef(null);
  const mainRef = useRef(null);
  const initialized = useRef(false);
  const instanceId = useRef('rfb_' + Math.random().toString(36).slice(2, 9));

  useEffect(() => {
    if (initialized.current) return; // guard against double-mount (e.g. React StrictMode in dev)
    initialized.current = true;

    const SIDEBAR_ID = instanceId.current + '-sidebar';
    const MAIN_ID = instanceId.current + '-main';
    if (sidebarRef.current) sidebarRef.current.id = SIDEBAR_ID;
    if (mainRef.current) mainRef.current.id = MAIN_ID;

    const emailTemplates = templates.filter(t => t.channel === "email");
    const smsTemplates = templates.filter(t => t.channel === "sms");
    const whatsappTemplates = templates.filter(t => t.channel === "whatsapp");

    const getTemplateOptions = (channel, sel) => {
      let optsList = [];
      if (channel === "email") optsList = emailTemplates;
      else if (channel === "sms") optsList = smsTemplates;
      else if (channel === "whatsapp") optsList = whatsappTemplates;

      const baseOpts = `<option value="none" ${sel === 'none' || !sel ? 'selected' : ''}>No message</option>`;
      const dbOpts = optsList.map(t => `<option value="${esc(t.name)}" ${sel === t.name ? 'selected' : ''}>${esc(t.name)}</option>`).join('');
      return baseOpts + dbOpts;
    };

const FIELD_TYPES = [
  {v:'text', l:'Short Text'}, {v:'textarea', l:'Long Text'}, {v:'number', l:'Number'},
  {v:'date', l:'Date'}, {v:'select', l:'Dropdown'}, {v:'multiselect', l:'Multi-select (Checkboxes)'},
  {v:'radio', l:'Yes/No (Radio)'}, {v:'phone', l:'Phone'}, {v:'email', l:'Email'}, {v:'file', l:'Document Upload'}
];

const PRESET_GROUPS = ['Instructions','Student Details','Address Details','Parent / Guardian Details','Documents','Payment Details','Declaration'];

const FIELD_LIBRARY = {
  "Student Details": [
    {l:'Student Full Name', t:'text'}, {l:'Grade', t:'select', o:'Nursery,LKG,UKG,1,2,3,4,5,6,7,8,9,10,11,12'},
    {l:'Previous Class Name', t:'select', o:'Nursery,LKG,UKG,1,2,3,4,5,6,7,8,9,10,11,12'},
    {l:'Session', t:'select', o:'2025-26,2026-27'}, {l:'Student First Name', t:'text'},
    {l:'Student Middle Name', t:'text'}, {l:'Student Last Name', t:'text'}, {l:'Email Id', t:'email'},
    {l:'Date of Birth', t:'date'}, {l:'Gender', t:'select', o:'Male,Female,Other'},
    {l:'Blood Group', t:'select', o:'A+,A-,B+,B-,O+,O-,AB+,AB-'}, {l:'Home Phone No.', t:'phone'},
    {l:'Primary Contact', t:'phone'}, {l:'House', t:'text'}, {l:'Category', t:'select', o:'General,OBC,SC,ST,EWS'},
    {l:'Nationality', t:'text'}, {l:'Religion', t:'text'}, {l:'Height', t:'number'}, {l:'Weight', t:'number'},
    {l:'Vision_L', t:'text'}, {l:'Vision_R', t:'text'}, {l:'Aadhaar No.', t:'text'}, {l:'Student Photo', t:'file'},
    {l:'No. of Brother', t:'number'}, {l:'No. of Sister', t:'number'}, {l:'Mother Tongue', t:'text'},
    {l:'Place Of Birth', t:'text'}, {l:'Special Needs if any', t:'text'}, {l:'Primary WhatsApp Number', t:'phone'},
    {l:'APAAR ID', t:'text'}, {l:'Is Physically Challenged', t:'select', o:'Yes,No'},
  ],
  "Address Details": [
    {l:'Address', t:'textarea'}, {l:'City', t:'text'}, {l:'State', t:'text'}, {l:'Country', t:'text'}, {l:'PIN', t:'text'},
    {l:'Corr. Address', t:'textarea'}, {l:'Corr. City', t:'text'}, {l:'Corr. State', t:'text'},
    {l:'Corr. Country', t:'text'}, {l:'Corr. PIN', t:'text'},
  ],
  "Parent / Guardian Details": [
    {l:'Father Name', t:'text'}, {l:'Father Email Id', t:'email'}, {l:'Father Phone No.', t:'phone'},
    {l:'Father DOB', t:'date'}, {l:'Father Specialization', t:'text'}, {l:'Father Qualification', t:'text'},
    {l:'Father Designation', t:'text'}, {l:'Father Profession', t:'text'}, {l:'Father Office Name', t:'text'},
    {l:'Father Office Address', t:'textarea'}, {l:'Father Office Contact No.', t:'phone'},
    {l:'Father Annual Income', t:'number'}, {l:'Father Photo', t:'file'}, {l:'Father Aadhaar No.', t:'text'},
    {l:'Father Department', t:'text'}, {l:'Father WhatsApp Number', t:'phone'}, {l:'Father PAN No.', t:'text'},
    {l:'Mother Name', t:'text'}, {l:'Mother Emailid', t:'email'}, {l:'Mother Phone No.', t:'phone'},
    {l:'Mother DOB', t:'date'}, {l:'Mother Specialization', t:'text'}, {l:'Mother Qualification', t:'text'},
    {l:'Mother Designation', t:'text'}, {l:'Mother Profession', t:'text'}, {l:'Mother Office Name', t:'text'},
    {l:'Mother Office Address', t:'textarea'}, {l:'Mother Office Contact No.', t:'phone'},
    {l:'Mother Annual Income', t:'number'}, {l:'Mother Photo', t:'file'}, {l:'Mother Aadhaar No.', t:'text'},
    {l:'Mother Department', t:'text'}, {l:'Mother WhatsApp Number', t:'phone'}, {l:'Mother PAN No.', t:'text'},
    {l:'Local Guardian Name', t:'text'}, {l:'Local Guardian Phone', t:'phone'}, {l:'Local Guardian Address', t:'textarea'},
  ],
  "Documents": [
    {l:'STUDENT VACCINATION RECORD', t:'file'}, {l:'Vaccination Report', t:'file'}, {l:'Vaccination report 1', t:'file'},
  ],
  "Payment Details": [
    {l:'Fee Heads', t:'multiselect', o:'Registration Fee,Admission Fee,Tuition Fee,Development Fee,Transport Fee,Hostel Fee,Library Fee,Lab Fee,Exam Fee,Miscellaneous Fee'},
    {l:'Payment Mode', t:'select', o:'Online,Cash,Cheque,Bank Transfer'},
    {l:'Total Amount', t:'number'},
  ],
};

let state = {
  screen: (startScreen === 'preview_only') ? 'preview' : (startScreen || 'setup'),
  previewOnly: startScreen === 'preview_only',
  formType: initialForm ? (initialForm.formType || null) : null,            // single | stepper
  formCategory: initialForm ? (initialForm.formCategory || 'registration') : 'registration', // enquiry | registration | payment
  steps: initialForm ? (initialForm.steps || []) : [],                 // {id,name,groups:[{id,name,fields:[]}],notif:{...}}
  activeStepIdx: 0,
  formTitle: initialForm ? (initialForm.formTitle || initialForm.name || '') : '',
  formColumns: initialForm ? (initialForm.formColumns || 2) : 2,            // 2 | 3 | 4 — columns in live form layout
  openCustomFieldGroupId: null,
  openGroupAccordion: null,   // id of the group whose accordion is expanded
  groupAccordionInitStepId: null, // tracks which step's accordion was last auto-opened
  groupActiveCat: {},         // groupId -> active library category
  groupSearch: {},            // groupId -> search text
  openFieldPanel: null,       // {fieldId, type:'rename'|'cond'} — which inline panel is open
  previewStepIdx: 0,          // which step is currently shown in the live preview
  stepSettingsOpenId: null,   // id of the step whose name/approval settings panel is expanded
  commPanelOpenId: null,      // id of the step whose communication & status panel is expanded
  _id: initialForm ? initialForm._id : undefined,
  isActive: initialForm ? (initialForm.isActive !== false) : true,
  createdAt: initialForm ? initialForm.createdAt : undefined,
  updatedAt: initialForm ? initialForm.updatedAt : undefined,
  headerName: initialForm ? (initialForm.headerName || '') : '',
  tagline: initialForm ? (initialForm.tagline || '') : '',
  instructions: initialForm ? (initialForm.instructions || '') : '',
  declarationText: initialForm ? (initialForm.declarationText || '') : '',
  declarationPoints: initialForm ? (initialForm.declarationPoints || []) : [],
  theme: initialForm ? (initialForm.theme || {}) : {},
  openStyleAccordion: 'portal',
  simActiveIdx: 0
};

if (!state.declarationPoints) {
  state.declarationPoints = [];
}
if (state.declarationPoints.length === 0) {
  state.declarationPoints = [
    { id: Math.random().toString(36).slice(2,9), text: state.declarationText || "I hereby declare that all the information provided in this form is true and correct to the best of my knowledge.", requiredCheckbox: true }
  ];
}

function compareStepsAndGroups(a, b) {
  const aName = (a.name || '').toLowerCase().trim();
  const bName = (b.name || '').toLowerCase().trim();
  
  if (aName === 'instructions' || aName === 'instruction') return -1;
  if (bName === 'instructions' || bName === 'instruction') return 1;
  
  if (aName === 'declaration') return 1;
  if (bName === 'declaration') return -1;
  
  return (a.seq || 0) - (b.seq || 0);
}

function cleanAndSortSteps() {
  state.steps.sort(compareStepsAndGroups);
  state.steps.forEach((s, idx) => {
    s.seq = idx + 1;
    if (s.groups) {
      s.groups.sort(compareStepsAndGroups);
      s.groups.forEach((g, gidx) => {
        g.seq = gidx + 1;
      });
    }
  });
}

function cleanAndSortGroups(step) {
  if (!step || !step.groups) return;
  step.groups.sort(compareStepsAndGroups);
  step.groups.forEach((g, gidx) => {
    g.seq = gidx + 1;
  });
}

function uid(){ return Math.random().toString(36).slice(2,9); }

function defaultStepperSteps(){
  const category = state.formCategory || 'registration';
  if (category === 'enquiry') {
    return [
      mkStep('Instructions', null, 1),
      mkStep('Enquiry Details', 'Student Details', 2),
      mkStep('Address Details', 'Address Details', 3),
      mkStep('Declaration', null, 4),
    ];
  } else if (category === 'payment') {
    return [
      mkStep('Instructions', null, 1),
      mkStep('Student Details', 'Student Details', 2),
      mkStep('Payment Details', 'Payment Details', 3),
      mkStep('Declaration', null, 4),
    ];
  } else {
    return [
      mkStep('Instructions', null, 1),
      mkStep('Basic Details', 'Student Details', 2),
      mkStep('Parent / Guardian Details', 'Parent / Guardian Details', 3),
      mkStep('Documents', 'Documents', 4),
      mkStep('Payment', null, 5),
      mkStep('Declaration', null, 6),
    ];
  }
}
function defaultSinglePageStep(){
  const category = state.formCategory || 'registration';
  const s = mkStep('Registration Form', null, 1);
  let groupNames = [];
  if (category === 'enquiry') {
    groupNames = ['Instructions', 'Student Details', 'Address Details', 'Declaration'];
  } else if (category === 'payment') {
    groupNames = ['Instructions', 'Student Details', 'Payment Details', 'Declaration'];
  } else {
    groupNames = PRESET_GROUPS;
  }
  s.groups = groupNames.map((name, i) => mkGroup(name, i + 1));
  return s;
}
function mkStep(name, seedGroupName, seq){
  return {id:uid(), name, seq: seq||1, groups: seedGroupName ? [mkGroup(seedGroupName)] : [], notif:{email:'none', sms:'none', whatsapp:'none', statusLabel:''}, approvalRequired:false, approvalAuthority:'', approvalType:'lead', approvalEmployeeName:''};
}
function mkGroup(name, seq){
  const catKey = Object.keys(FIELD_LIBRARY).find(c=>c.toLowerCase()===(name||'').toLowerCase());
  let fields = [];
  if(catKey){
    const usedLabels = new Set();
    (state.steps||[]).forEach(s=> s.groups.forEach(g=> g.fields.forEach(f=>{ if(f.sourceLabel) usedLabels.add(f.sourceLabel); })));
    
    let libraryFields = FIELD_LIBRARY[catKey];
    
    const category = state.formCategory || 'registration';
    if (category === 'enquiry') {
      if (catKey === 'Student Details') {
        const enquiryLabels = ['Student Full Name', 'Grade', 'Email Id', 'Primary Contact', 'Primary WhatsApp Number', 'Category'];
        libraryFields = libraryFields.filter(item => enquiryLabels.includes(item.l));
      } else if (catKey === 'Address Details') {
        const enquiryLabels = ['City', 'State', 'PIN'];
        libraryFields = libraryFields.filter(item => enquiryLabels.includes(item.l));
      }
    } else if (category === 'payment') {
      if (catKey === 'Student Details') {
        const paymentLabels = ['Student Full Name', 'Grade', 'Primary Contact', 'Primary WhatsApp Number'];
        libraryFields = libraryFields.filter(item => paymentLabels.includes(item.l));
      }
    }
    
    fields = libraryFields
      .filter(item=>!usedLabels.has(item.l))
      .map(item=> mkField({label:item.l, sourceLabel:item.l, type:item.t, mandatory:true, options:item.o||''}));
  }
  return {id:uid(), name, seq: seq||1, fields, type:'fields'};
}
function mkApprovalGroup(name){
  return {id:uid(), name: name||'Approval', fields:[], type:'approval', approvalType:'lead', approvalEmployeeName:''};
}
function mkField(opts){
  return Object.assign({id:uid(), label:'', type:'text', mandatory:true, options:'', conditional:null, sourceLabel:null}, opts);
}

/* ================= RENDER ROOT ================= */
function render(){
  renderSidebar();
  renderMain();
}

/* ---------- SIDEBAR ---------- */
function sidebarSteps(){
  let arr = [{key:'setup', label:'Name & form type', sub:'Title + layout'}];
  arr.push({key:'builder', label:'Add fields', sub:'Build each step / form'});
  if(state.formType!=='stepper'){
    arr.push({key:'notif', label:'Alerts', sub:'Email, SMS, WhatsApp, status'});
  }
  arr.push({key:'preview', label:'Preview & publish', sub:'Review the live form'});
  return arr;
}

function renderSidebar(){
  const order = sidebarSteps();
  const curIdx = order.findIndex(s=>s.key===state.screen);
  let html = `<div class="brand"><div class="brand-mark">E</div><div class="brand-name">EduNext Form Builder</div></div>`;
  order.forEach((s,i)=>{
    const cls = i===curIdx ? 'active' : (i<curIdx ? 'done':'');
    html += `<div class="side-step ${cls}" onclick="${i<=curIdx?`goScreen('${s.key}')`:''}">
      <div class="side-num">${i<curIdx?'✓':i+1}</div>
      <div><div class="side-label">${s.label}</div><div class="side-sub">${s.sub}</div></div>
    </div>`;
  });
  document.getElementById(SIDEBAR_ID).innerHTML = html;
}

function goScreen(key){
  if(key==='builder' && state.steps.length===0){
    state.steps = state.formType==='stepper' ? defaultStepperSteps() : [defaultSinglePageStep()];
  }
  if(key==='builder'){
    cleanAndSortSteps();
    state.activeStepIdx = 0;
  }
  state.screen = key;
  render();
}
function builderSaveNext(){
  if(state.formType==='stepper'){
    if(state.activeStepIdx < state.steps.length-1){
      state.activeStepIdx++;
      state.stepSettingsOpenId = null;
      state.commPanelOpenId = null;
      render();
    } else {
      goScreen('preview'); // last step done — communication already captured per-step, skip the Alerts screen
    }
  } else {
    goScreen('notif');
  }
}
function builderGoBack(){
  if(state.formType==='stepper' && state.activeStepIdx > 0){
    state.activeStepIdx--;
    state.stepSettingsOpenId = null;
    state.commPanelOpenId = null;
    render();
  } else {
    goScreen('setup');
  }
}

/* ---------- MAIN ROUTER ---------- */
function renderMain(){
  const m = document.getElementById(MAIN_ID);
  if(state.screen==='setup') m.innerHTML = screenSetup();
  else if(state.screen==='builder') m.innerHTML = screenBuilder();
  else if(state.screen==='notif') m.innerHTML = screenNotif();
  else if(state.screen==='preview') m.innerHTML = screenPreview();
}

/* ================= SCREEN: NAME + CHOOSE TYPE + GROUPS/STEPS (combined) ================= */
function screenSetup(){
  // Auto-migrate single page steps if they are missing Instructions or Declaration group name
  if (state.formType === 'single' && state.steps && state.steps[0]) {
    const step = state.steps[0];
    const selectedNames = step.groups.map(g => g.name.toLowerCase());
    
    // Check Instructions
    if (!selectedNames.includes('instructions') && !selectedNames.includes('instruction')) {
      const maxSeq = step.groups.reduce((m,g)=>Math.max(m, g.seq||0), 0);
      step.groups.push(mkGroup('Instructions', Math.min(99, maxSeq+1)));
    }
    // Check Declaration
    if (!selectedNames.includes('declaration')) {
      const maxSeq = step.groups.reduce((m,g)=>Math.max(m, g.seq||0), 0);
      step.groups.push(mkGroup('Declaration', Math.min(99, maxSeq+1)));
    }
    // Sort to keep order and clean sequences
    cleanAndSortGroups(step);
  }

  // Auto-migrate stepper steps if they are missing Instructions or Declaration steps
  if (state.formType === 'stepper' && state.steps) {
    const selectedNames = state.steps.map(s => s.name.toLowerCase());
    
    // Check Instructions
    if (!selectedNames.includes('instructions') && !selectedNames.includes('instruction')) {
      const maxSeq = state.steps.reduce((m,s)=>Math.max(m, s.seq||0), 0);
      state.steps.push(mkStep('Instructions', null, Math.min(99, maxSeq+1)));
    }
    // Check Declaration
    if (!selectedNames.includes('declaration')) {
      const maxSeq = state.steps.reduce((m,s)=>Math.max(m, s.seq||0), 0);
      state.steps.push(mkStep('Declaration', null, Math.min(99, maxSeq+1)));
    }
    // Sort to keep order and clean sequences
    cleanAndSortSteps();
  }

  const followUp = !state.formType ? '' : (state.formType==='single' ? setupGroupsSection() : setupStepsSection());
  return `
  <div class="titlerow"><span class="topline">Step 1</span></div>
  <h1>Let's set up your form</h1>
  <div class="desc">Give it a name and pick how it should work. You can fill in the fields next — nothing is locked in yet.</div>

  <div class="setup-row">
    <div class="card">
      <label class="f" style="display:flex; align-items:center; gap:6px; font-size:11px; letter-spacing:.03em; text-transform:uppercase; margin-bottom:8px;">
        <span style="width:18px;height:18px;border-radius:5px;background:var(--accent);color:#fff;display:inline-flex;align-items:center;justify-content:center;font-size:10px;">✎</span>
        Form name
      </label>
      <input type="text" id="formTitleInput" value="${esc(state.formTitle)}" style="width:100%; padding:11px 12px; font-size:14px; border-radius:8px;" placeholder="e.g. Class 1 Admission Registration" oninput="state.formTitle=this.value; refreshContinueBtn();">
      <div style="margin-top:14px; padding-top:14px; border-top:1px solid var(--border);">
        <label class="f" style="font-size:11px; letter-spacing:.03em; text-transform:uppercase; margin-bottom:8px;">Form Type</label>
        <div style="display:flex; gap:4px; background:#f8fafc; padding:4px; border-radius:24px; border:1px solid var(--border); margin-bottom:14px;">
          ${['enquiry', 'registration', 'payment'].map(cat=>`
            <div style="flex:1; text-align:center; padding:6px 12px; border-radius:20px; cursor:pointer; font-size:12px; font-weight:600; color:${state.formCategory===cat?'var(--accent-dark)':'#76808a'}; background:${state.formCategory===cat?'#ffffff':'transparent'}; box-shadow:${state.formCategory===cat?'0 2px 4px rgba(0,0,0,0.05)':'none'}; transition:.15s;" onclick="pickCategory('${cat}')">
              ${cat.charAt(0).toUpperCase() + cat.slice(1)}
            </div>
          `).join('')}
        </div>
      </div>
      <div style="margin-top:14px; padding-top:14px; border-top:1px solid var(--border);">
        <label class="f" style="font-size:11px; letter-spacing:.03em; text-transform:uppercase; margin-bottom:8px;">Form layout — columns</label>
        <div class="col-selector">
          ${[2,3,4].map(n=>`
          <div class="col-option ${state.formColumns===n?'active':''}" onclick="state.formColumns=${n}; render();">
            <div class="col-option-vis">
              ${Array.from({length:n}).map((_,i)=>`<div class="col-bar" style="height:${16+i*3}px;"></div>`).join('')}
            </div>
            <div class="col-option-label">${n} col${n>1?'s':''}</div>
          </div>`).join('')}
        </div>
      </div>
    </div>
    <div class="choice ${state.formType==='single'?'selected':''}" onclick="pickType('single')">
      <div class="choice-radio"></div>
      <div class="choice-head"><div class="choice-icon">▭</div><h4>Single Page Form</h4></div>
      <svg class="wireframe" viewBox="0 0 240 150" height="140">
        <rect x="0" y="0" width="240" height="150" fill="none"/>
        <rect x="8" y="10" width="60" height="8" rx="2" fill="#cfd8dd"/>
        <rect x="8" y="26" width="224" height="18" rx="3" fill="#e7edf0"/>
        <rect x="8" y="56" width="60" height="8" rx="2" fill="#cfd8dd"/>
        <rect x="8" y="72" width="224" height="18" rx="3" fill="#e7edf0"/>
        <rect x="8" y="102" width="60" height="8" rx="2" fill="#cfd8dd"/>
        <rect x="8" y="118" width="224" height="18" rx="3" fill="#e7edf0"/>
        <rect x="184" y="130" width="48" height="16" rx="4" fill="#0085A8"/>
      </svg>
    </div>
    <div class="choice ${state.formType==='stepper'?'selected':''}" onclick="pickType('stepper')">
      <div class="choice-radio"></div>
      <div class="choice-head"><div class="choice-icon">▤</div><h4>Stepper Form</h4></div>
      <svg class="wireframe" viewBox="0 0 240 150" height="140">
        <circle cx="20" cy="16" r="10" fill="#0085A8"/>
        <text x="20" y="20" font-size="10" fill="#fff" text-anchor="middle" font-family="Arial">1</text>
        <line x1="30" y1="16" x2="76" y2="16" stroke="#cfd8dd" stroke-width="2"/>
        <circle cx="86" cy="16" r="10" fill="#dfe5e9"/>
        <text x="86" y="20" font-size="10" fill="#fff" text-anchor="middle" font-family="Arial">2</text>
        <line x1="96" y1="16" x2="142" y2="16" stroke="#cfd8dd" stroke-width="2"/>
        <circle cx="152" cy="16" r="10" fill="#dfe5e9"/>
        <text x="152" y="20" font-size="10" fill="#fff" text-anchor="middle" font-family="Arial">3</text>
        <line x1="162" y1="16" x2="208" y2="16" stroke="#cfd8dd" stroke-width="2"/>
        <circle cx="218" cy="16" r="10" fill="#dfe5e9"/>
        <text x="218" y="20" font-size="10" fill="#fff" text-anchor="middle" font-family="Arial">4</text>
        <rect x="8" y="44" width="60" height="8" rx="2" fill="#cfd8dd"/>
        <rect x="8" y="60" width="224" height="18" rx="3" fill="#e7edf0"/>
        <rect x="8" y="90" width="60" height="8" rx="2" fill="#cfd8dd"/>
        <rect x="8" y="106" width="224" height="18" rx="3" fill="#e7edf0"/>
        <rect x="184" y="130" width="48" height="16" rx="4" fill="#0085A8"/>
      </svg>
    </div>
  </div>

  ${followUp}

  <div class="footer-nav">
    <button class="btn ghost" onclick="closeEditor()">Cancel</button>
    <button class="btn" id="setupContinueBtn" ${(!state.formTitle.trim()||!state.formType)?'disabled':''} onclick="goScreen('builder')">Continue →</button>
  </div>`;
}

/* ---- Single-page: choose how many groups, and which ones, right here ---- */
function setupGroupsSection(){
  const step = state.steps[0];
  const groups = step ? step.groups : [];
  groups.sort(compareStepsAndGroups);
  const selectedNames = groups.map(g=>g.name.toLowerCase());
  const unselectedPresets = PRESET_GROUPS.filter(p=>!selectedNames.includes(p.toLowerCase()));

  const selectedRows = groups.map((g,i)=>`
    <tr>
      <td>
        <input type="number" class="form-control form-control-sm text-center" style="width: 70px; border: 1px solid var(--border); border-radius: 6px;" min="1" max="99" value="${g.seq||(i+1)}" oninput="this.value=this.value.replace(/[^0-9]/g,'').slice(0,2)" onchange="reorderGroupToPosition('${g.id}', this.value)">
      </td>
      <td>
        <input type="text" class="form-control form-control-sm" style="border: 1px solid var(--border); border-radius: 6px; font-weight: 500;" value="${esc(g.name)}" onchange="renameGroup('${g.id}',this.value)">
      </td>
      <td style="text-align: center;">
        <button class="btn btn-sm btn-outline-danger" style="padding: 4px 8px;" title="Remove" onclick="removeSetupGroup('${g.id}')">
          <i class="bi bi-trash"></i>
        </button>
      </td>
    </tr>`).join('');

  return `
  <h3 style="font-size:14.5px; margin:22px 0 4px;">What groups should this form have, and in what order?</h3>
  <div class="desc" style="margin-bottom:14px;">Define the groups that will collect fields. The sequence numbers will dictate the layout order. Click preset chips below to quick-add, or create custom ones.</div>
  
  <div class="card" style="padding: 18px; border-radius: 12px; background: #fff; border: 1px solid var(--border);">
    <div class="table-responsive">
      <table class="table align-middle" style="margin-bottom: 12px; width: 100%;">
        <thead>
          <tr style="background: var(--surface-light); border-bottom: 2px solid var(--border);">
            <th style="width: 110px; font-size: 12px; font-weight: 600; text-transform: uppercase; color: var(--text-muted); padding: 8px;">Sequence</th>
            <th style="font-size: 12px; font-weight: 600; text-transform: uppercase; color: var(--text-muted); padding: 8px;">Group Name</th>
            <th style="width: 110px; text-align: center; font-size: 12px; font-weight: 600; text-transform: uppercase; color: var(--text-muted); padding: 8px;">Action</th>
          </tr>
        </thead>
        <tbody>
          ${selectedRows || '<tr><td colspan="3" class="text-center text-muted py-3">No groups added yet. Quick-add presets below or create a custom group.</td></tr>'}
        </tbody>
      </table>
    </div>

    <div style="display: flex; justify-content: space-between; align-items: flex-end; gap: 20px; margin-top: 18px; flex-wrap: wrap;">
      <div>
        <div style="display: flex; flex-wrap: wrap; gap: 8px;">
          ${unselectedPresets.map(p => `<button class="btn btn-sm btn-outline-secondary" style="border-radius: 20px; font-size: 12px; padding: 4px 12px;" onclick="toggleSetupGroup('${escJs(p)}')">+ ${p}</button>`).join('')}
        </div>
      </div>
      
      <div style="display: flex; gap: 8px; align-items: center; margin-left: auto;">
        <input type="text" id="setupNewGroupName" class="form-control form-control-sm" placeholder="e.g. Sibling Details" style="width: 220px; border-radius: 6px; padding: 6px 12px; border: 1px solid var(--border);">
        <button class="btn btn-sm btn-wa" style="border-radius: 6px; font-size: 12px; font-weight: 600; padding: 6px 14px;" onclick="addSetupGroup()">+ Add Custom Group</button>
      </div>
    </div>
  </div>`;
}
function toggleSetupGroup(name){
  const step = state.steps[0];
  const idx = step.groups.findIndex(g=>g.name.toLowerCase()===name.toLowerCase());
  if(idx>-1) step.groups.splice(idx,1);
  else {
    const maxSeq = step.groups.reduce((m,g)=>Math.max(m, g.seq||0), 0);
    step.groups.push(mkGroup(name, Math.min(99, maxSeq+1)));
  }
  render();
}
function addSetupGroup(){
  const el = document.getElementById('setupNewGroupName');
  const val = el.value.trim();
  if(!val){ alert('Please enter a group name.'); return; }
  const step = state.steps[0];
  if(step.groups.some(g=>g.name.toLowerCase()===val.toLowerCase())){ alert('That group already exists.'); return; }
  const maxSeq = step.groups.reduce((m,g)=>Math.max(m, g.seq||0), 0);
  step.groups.push(mkGroup(val, Math.min(99, maxSeq+1)));
  render();
}
function removeSetupGroup(id){
  const step = state.steps[0];
  step.groups = step.groups.filter(g=>g.id!==id);
  render();
}
function moveGroup(id, dir){
  const step = state.steps[0];
  step.groups.sort(compareStepsAndGroups);
  const idx = step.groups.findIndex(g=>g.id===id);
  const newIdx = idx + dir;
  if(idx<0 || newIdx<0 || newIdx>=step.groups.length) return;
  const a = step.groups[idx], b = step.groups[newIdx];
  const tmp = a.seq; a.seq = b.seq; b.seq = tmp;
  step.groups.sort(compareStepsAndGroups);
  render();
}
function reorderGroupToPosition(id, val){
  const step = state.steps[0];
  const g = step.groups.find(x=>x.id===id);
  if(!g) return;
  let pos = parseInt(val, 10);
  if(isNaN(pos)) { render(); return; }
  pos = Math.max(1, Math.min(99, pos));
  g.seq = pos;
  step.groups.sort(compareStepsAndGroups);
  render();
}

/* ---- Stepper: define how many steps, and name them, right here ---- */
function setupStepsSection(){
  const activeId = state.steps[state.activeStepIdx] ? state.steps[state.activeStepIdx].id : null;
  state.steps.sort(compareStepsAndGroups);
  if(activeId){ const ni = state.steps.findIndex(s=>s.id===activeId); if(ni>-1) state.activeStepIdx = ni; }
  const rows = state.steps.map((s,i)=>`
    <tr>
      <td>
        <input type="number" class="form-control form-control-sm text-center" style="width: 70px; border: 1px solid var(--border); border-radius: 6px;" min="1" max="99" value="${s.seq||(i+1)}" oninput="this.value=this.value.replace(/[^0-9]/g,'').slice(0,2)" onchange="reorderStepToPosition('${s.id}', this.value)">
      </td>
      <td>
        <input type="text" class="form-control form-control-sm" style="border: 1px solid var(--border); border-radius: 6px; font-weight: 500;" value="${esc(s.name)}" onchange="renameStep('${s.id}',this.value)">
      </td>
      <td style="text-align: center;">
        ${state.steps.length > 1 ? `
          <button class="btn btn-sm btn-outline-danger" style="padding: 4px 8px;" title="Remove" onclick="removeStep('${s.id}')">
            <i class="bi bi-trash"></i>
          </button>
        ` : '—'}
      </td>
    </tr>`).join('');

  return `
  <h3 style="font-size:14.5px; margin:22px 0 4px;">How many steps, and in what sequence?</h3>
  <div class="desc" style="margin-bottom:14px;">These become the pages of your form, shown to applicants in this order. Use the sequence numbers to reorder, rename or remove steps.</div>
  
  <div class="card" style="padding: 18px; border-radius: 12px; background: #fff; border: 1px solid var(--border);">
    <div class="table-responsive">
      <table class="table align-middle" style="margin-bottom: 12px; width: 100%;">
        <thead>
          <tr style="background: var(--surface-light); border-bottom: 2px solid var(--border);">
            <th style="width: 110px; font-size: 12px; font-weight: 600; text-transform: uppercase; color: var(--text-muted); padding: 8px;">Sequence</th>
            <th style="font-size: 12px; font-weight: 600; text-transform: uppercase; color: var(--text-muted); padding: 8px;">Step Name</th>
            <th style="width: 110px; text-align: center; font-size: 12px; font-weight: 600; text-transform: uppercase; color: var(--text-muted); padding: 8px;">Action</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    </div>

    <div style="display: flex; justify-content: flex-end; margin-top: 18px;">
      <button class="btn btn-sm btn-wa" style="border-radius: 6px; font-size: 12px; font-weight: 600; padding: 6px 14px;" onclick="addStep()">+ Add Step</button>
    </div>
  </div>`;
}
function moveStep(id, dir){
  const activeId = state.steps[state.activeStepIdx] ? state.steps[state.activeStepIdx].id : null;
  cleanAndSortSteps();
  const idx = state.steps.findIndex(s=>s.id===id);
  const newIdx = idx + dir;
  if(idx<0 || newIdx<0 || newIdx>=state.steps.length) return;
  const a = state.steps[idx], b = state.steps[newIdx];
  const tmp = a.seq; a.seq = b.seq; b.seq = tmp;
  cleanAndSortSteps();
  if(activeId){ const ni = state.steps.findIndex(s=>s.id===activeId); if(ni>-1) state.activeStepIdx = ni; }
  render();
}
function reorderStepToPosition(id, val){
  const s = state.steps.find(x=>x.id===id);
  if(!s) return;
  let pos = parseInt(val, 10);
  if(isNaN(pos)) { render(); return; }
  pos = Math.max(1, Math.min(99, pos));
  const activeId = state.steps[state.activeStepIdx] ? state.steps[state.activeStepIdx].id : null;
  s.seq = pos;
  cleanAndSortSteps();
  if(activeId){ const ni = state.steps.findIndex(x=>x.id===activeId); if(ni>-1) state.activeStepIdx = ni; }
  render();
}

function pickType(t){
  if(state.formType !== t){
    if (state.formTitle.trim() && state.steps.some(s => s.groups.some(g => g.fields.length > 0))) {
      if (!confirm("Changing layout will reset your current form steps and fields. Do you want to proceed?")) {
        render();
        return;
      }
    }
    state.formType = t;
    state.activeStepIdx = 0;
    state.steps = []; // clear first so mkGroup's duplicate-field check doesn't see the previous form type's data
    state.steps = (t==='single') ? [defaultSinglePageStep()] : defaultStepperSteps();
    cleanAndSortSteps();
  }
  render();
}

function pickCategory(cat){
  if(state.formCategory !== cat){
    if (state.formTitle.trim() && state.steps.some(s => s.groups.some(g => g.fields.length > 0))) {
      if (!confirm("Changing form type will reset your current form steps and fields. Do you want to proceed?")) {
        render();
        return;
      }
    }
    state.formCategory = cat;
    state.activeStepIdx = 0;
    state.steps = []; // clear first
    if (state.formType) {
      state.steps = (state.formType==='single') ? [defaultSinglePageStep()] : defaultStepperSteps();
      cleanAndSortSteps();
    }
  }
  render();
}
function refreshContinueBtn(){
  const btn = document.getElementById('setupContinueBtn');
  if(btn) btn.disabled = !(state.formTitle.trim() && state.formType);
}

/* Step list management — used on the setup page (stepper) and inline inside the builder's tab bar */
function renameStep(id,val){ const s=state.steps.find(s=>s.id===id); if(s) s.name=val; }
function toggleStepSettings(id){
  state.stepSettingsOpenId = (state.stepSettingsOpenId===id) ? null : id;
  render();
}
function toggleCommPanel(id){
  state.commPanelOpenId = (state.commPanelOpenId===id) ? null : id;
  render();
}
function setStepNotif(stepId,key,val){
  const s = state.steps.find(s=>s.id===stepId);
  if(s) s.notif[key]=val;
}
function toggleStepApproval(id){
  const s = state.steps.find(s=>s.id===id);
  if(!s) return;
  s.approvalRequired = !s.approvalRequired;
  render();
}
function setStepApprovalAuthority(id,val){
  const s = state.steps.find(s=>s.id===id);
  if(s) s.approvalAuthority = val;
}
function setStepApprovalType(id, type){
  const s = state.steps.find(s=>s.id===id);
  if(s){ s.approvalType = type; if(type==='lead') s.approvalEmployeeName=''; }
  render();
}
function setStepApprovalEmployee(id, val){
  const s = state.steps.find(s=>s.id===id);
  if(s) s.approvalEmployeeName = val;
}
function addApprovalStep(){
  const maxSeq = state.steps.reduce((m,s)=>Math.max(m, s.seq||0), 0);
  const s = mkStep('Approval', null, Math.min(99, maxSeq+1));
  s.approvalRequired = true;
  state.steps.push(s);
  state.activeStepIdx = state.steps.length-1;
  render();
}
function addStep(){
  const el = document.getElementById('setupNewStepName');
  const val = el ? el.value.trim() : '';
  if(!val){ alert('Please enter a step name.'); return; }
  if(state.steps.some(s=>s.name.toLowerCase()===val.toLowerCase())){ alert('That step already exists.'); return; }
  const maxSeq = state.steps.reduce((m,s)=>Math.max(m, s.seq||0), 0);
  state.steps.push(mkStep(val, val, Math.min(99, maxSeq+1)));
  state.activeStepIdx = state.steps.length-1;
  render();
}
function removeStep(id){
  if(state.steps.length<=1){ alert('You need at least one step.'); return; }
  state.steps = state.steps.filter(s=>s.id!==id);
  if(state.activeStepIdx>=state.steps.length) state.activeStepIdx=0;
  render();
}

/* ================= SCREEN 2: FIELD BUILDER (groups) ================= */
function screenBuilder(){
  if(state.activeStepIdx>=state.steps.length) state.activeStepIdx=0;
  const step = state.steps[state.activeStepIdx];
  const settingsOpen = state.stepSettingsOpenId === step.id;
  const tabs = state.formType==='stepper' ? `
    <div class="tabbar">
      ${state.steps.map((s,i)=>`<div class="tab ${i===state.activeStepIdx?'active':''} ${s.approvalRequired?'tab-approval':''}" onclick="state.activeStepIdx=${i};render()">${i+1}. ${esc(s.name)}${s.approvalRequired?' ✅':''}</div>`).join('')}
      <div class="tab tab-add" onclick="addStep()">+ Add step</div>
      <div class="tab tab-settings" title="Step name & approval settings" onclick="toggleStepSettings('${step.id}')">⚙ ${esc(step.name)}${settingsOpen?' ▲':' ▼'}</div>
    </div>
    ${settingsOpen ? `
    <div class="step-info-card">
      <div class="step-info-top">
        <div class="step-info-num">${state.activeStepIdx+1}</div>
        <div style="flex:1;">
          <label class="f" style="margin-bottom:4px;">Step name</label>
          <input type="text" style="width:100%;max-width:320px;" value="${esc(step.name)}" onchange="renameStep('${step.id}',this.value)">
        </div>
        <label class="approval-check" title="Mark this step as requiring approval">
          <input type="checkbox" ${step.approvalRequired?'checked':''} onchange="toggleStepApproval('${step.id}')">
          <span>Approval required</span>
        </label>
        ${state.steps.length>1?`<button class="icon-btn" title="Remove this step" onclick="removeStep('${step.id}')">✕ Remove step</button>`:''}
      </div>
      ${step.approvalRequired?`
      <div class="approval-detail" style="border-radius:8px; border-top:1px solid #cdeede; margin-top:12px;">
        <span class="approval-detail-ic">✅</span>
        <div style="flex:1;">
          <label class="f" style="margin-bottom:6px;">Who approves this step?</label>
          <div class="approval-type-row">
            <div class="approval-type-opt ${(step.approvalType||'lead')==='lead'?'active':''}" onclick="setStepApprovalType('${step.id}','lead')">
              <span class="approval-type-dot"></span> Lead Owner
            </div>
            <div class="approval-type-opt ${step.approvalType==='other'?'active':''}" onclick="setStepApprovalType('${step.id}','other')">
              <span class="approval-type-dot"></span> Other Employee
            </div>
          </div>
          ${step.approvalType==='other'?`
          <div style="margin-top:8px;">
            <label class="f" style="margin-bottom:4px;">Employee name</label>
            <input type="text" style="width:100%;max-width:320px;" placeholder="e.g. Admissions Head, Class Coordinator" value="${esc(step.approvalEmployeeName||'')}" onchange="setStepApprovalEmployee('${step.id}', this.value)">
          </div>`:''}
        </div>
      </div>`:''}
    </div>` : ''}` : '';

  // Default: auto-open the first group only the first time we land on this step.
  // After that, respect whatever the user has explicitly opened/closed (including "all closed").
  if(state.groupAccordionInitStepId !== step.id){
    state.openGroupAccordion = step.groups.length ? step.groups[0].id : null;
    state.groupAccordionInitStepId = step.id;
  }

  step.groups.sort(compareStepsAndGroups);
  const groupsHtml = step.groups.length ? step.groups.map((g,i)=>
    renderGroupAccordion(g,step,i)
  ).join('') : '';
  const existingNames = step.groups.map(g=>g.name.toLowerCase());
  const presetChips = PRESET_GROUPS.filter(p=>!existingNames.includes(p.toLowerCase()))
    .map(p=>`<div class="preset-chip" onclick="addGroup('${escJs(p)}')">+ ${p}</div>`).join('');

  const totalFields = step.groups.reduce((n,g)=>n+g.fields.length,0);
  const totalMandatory = step.groups.reduce((n,g)=>n+g.fields.filter(f=>f.mandatory).length,0);

  const commOpen = state.commPanelOpenId === step.id;
  const commStatusCard = `
  <div class="card comm-status-card">
    <div class="comm-status-header" onclick="toggleCommPanel('${step.id}')">
      <div>
        <h3 style="margin:0;">Communication &amp; Status Update <span style="font-weight:500;color:#8a939b;font-size:12px;">(optional)</span></h3>
        <div class="hint" style="margin-top:2px;">Choose what happens after ${state.formType==='stepper'?`"${esc(step.name)}"`:'this form'} is completed — not required to continue.</div>
      </div>
      <span class="acc-chevron">${commOpen?'▾':'▸'}</span>
    </div>
    ${commOpen?`
    <div class="notif-grid" style="margin-top:14px;">
      <div class="notif-card">
        <div class="ic">✉️</div>
        <h4>Email template</h4>
        <select onchange="setStepNotif('${step.id}','email',this.value)">${getTemplateOptions('email', step.notif.email)}</select>
      </div>
      <div class="notif-card">
        <div class="ic">💬</div>
        <h4>SMS template</h4>
        <select onchange="setStepNotif('${step.id}','sms',this.value)">${getTemplateOptions('sms', step.notif.sms)}</select>
      </div>
      <div class="notif-card">
        <div class="ic">📱</div>
        <h4>WhatsApp template</h4>
        <select onchange="setStepNotif('${step.id}','whatsapp',this.value)">${getTemplateOptions('whatsapp', step.notif.whatsapp)}</select>
      </div>
    </div>
    <label class="f">Status label shown to applicant</label>
    <select style="width:340px; padding: 8px 10px; border-radius: 7px; border: 1px solid var(--border); font-size: 13px;" onchange="setStepNotif('${step.id}','statusLabel',this.value)">
      <option value="">-- select status --</option>
      ${(statuses || []).map(s => `<option value="${esc(s.name)}" ${step.notif.statusLabel === s.name ? 'selected' : ''}>${esc(s.name)}</option>`).join('')}
    </select>
    `:''}
  </div>`;

  return `
  <div class="builder-head">
    <div class="builder-head-ic">▤</div>
    <div>
      <div class="topline">Step 2</div>
      <h1>Add fields ${state.formType==='stepper'?`— ${esc(step.name)}`:''}</h1>
      <div class="desc" style="margin-bottom:0;">Open a group, tick the fields you need from the list, then move to the next group.</div>
    </div>
    <div class="builder-stats">
      <div class="builder-stat"><strong>${step.groups.length}</strong><span>group${step.groups.length!==1?'s':''}</span></div>
      <div class="builder-stat"><strong>${totalFields}</strong><span>field${totalFields!==1?'s':''}</span></div>
      <div class="builder-stat"><strong>${totalMandatory}</strong><span>mandatory</span></div>
    </div>
  </div>
  ${tabs}

  ${step.groups.length===0?`<div class="card"><div class="empty">No groups in ${state.formType==='stepper'?'this step':'this form'} yet.</div></div>`:''}
  ${groupsHtml}

  ${state.formType==='stepper' ? commStatusCard : ''}

  <div class="footer-nav">
    <button class="btn ghost" onclick="builderGoBack()">← Back</button>
    <button class="btn" onclick="builderSaveNext()">${state.formType==='stepper' && state.activeStepIdx<state.steps.length-1 ? `Save & Next: ${esc(state.steps[state.activeStepIdx+1].name)} →` : (state.formType==='stepper' ? 'Save & Continue to Preview →' : 'Save & Next →')}</button>
  </div>`;
}

/* ---- Group management ---- */
function findGroup(id){
  for(const s of state.steps){ const g=s.groups.find(g=>g.id===id); if(g) return g; }
}
function findStepForGroup(id){
  return state.steps.find(s=>s.groups.some(g=>g.id===id));
}
function fieldUsedInOtherGroup(step, label, excludeGroupId){
  for(const s of state.steps){
    for(const g of s.groups){
      if(g.id===excludeGroupId || g.type==='approval') continue;
      if(g.fields.some(f=>f.sourceLabel===label)) return g;
    }
  }
  return null;
}
function addGroup(name){
  const list = state.steps[state.activeStepIdx].groups;
  const maxSeq = list.reduce((m,g)=>Math.max(m, g.seq||0), 0);
  const g = mkGroup(name, Math.min(99, maxSeq+1));
  list.push(g);
  state.openGroupAccordion = g.id;
  render();
}
function addCustomGroup(){
  const el = document.getElementById('newGroupName');
  const val = el.value.trim();
  if(!val){ alert('Please enter a group name.'); return; }
  const list = state.steps[state.activeStepIdx].groups;
  const maxSeq = list.reduce((m,g)=>Math.max(m, g.seq||0), 0);
  const g = mkGroup(val, Math.min(99, maxSeq+1));
  list.push(g);
  state.openGroupAccordion = g.id;
  render();
}
function reorderGroupInStep(id, val){
  const step = findStepForGroup(id);
  if(!step) return;
  const g = step.groups.find(x=>x.id===id);
  if(!g) return;
  let pos = parseInt(val, 10);
  if(isNaN(pos)) { render(); return; }
  pos = Math.max(1, Math.min(99, pos));
  g.seq = pos;
  step.groups.sort(compareStepsAndGroups);
  render();
}
function renameGroup(id,val){ const g=findGroup(id); if(g) g.name=val||g.name; }
function removeGroup(id){
  state.steps.forEach(s=> s.groups = s.groups.filter(g=>g.id!==id));
  render();
}
function toggleAccordion(id){
  state.openGroupAccordion = (state.openGroupAccordion===id) ? null : id;
  render();
}
function matchLibraryCategory(name){
  const key = Object.keys(FIELD_LIBRARY).find(c=>c.toLowerCase()===name.toLowerCase());
  return key || Object.keys(FIELD_LIBRARY)[0];
}
function getGroupCat(groupId, fallbackName){
  return state.groupActiveCat[groupId] || matchLibraryCategory(fallbackName||'');
}
function setGroupCat(groupId,cat){ state.groupActiveCat[groupId]=cat; render(); }
function setGroupSearch(groupId,val){ state.groupSearch[groupId]=val; render(); }

function toggleGroupApprovalAfter(groupId){
  for(const step of state.steps){
    const idx = step.groups.findIndex(g=>g.id===groupId);
    if(idx===-1) continue;
    const next = step.groups[idx+1];
    if(next && next.type==='approval'){
      step.groups.splice(idx+1,1);
    } else {
      const g = step.groups[idx];
      const approvalGroup = mkApprovalGroup();
      approvalGroup.seq = (g.seq||0) + 0.5; // keeps it sorted right after its group, before the next one
      step.groups.splice(idx+1,0, approvalGroup);
    }
    render();
    return;
  }
}
function setGroupApprovalType(id, type){
  const g = findGroup(id);
  if(g){ g.approvalType = type; if(type==='lead') g.approvalEmployeeName=''; render(); }
}
function setGroupApprovalEmployee(id, val){
  const g = findGroup(id);
  if(g) g.approvalEmployeeName = val;
}
function renderApprovalGroupCard(group){
  return `
  <div class="group-card approval-group-card">
    <div class="acc-header approval-group-header">
      <span class="acc-chevron" style="visibility:hidden;"></span>
      <span style="flex:1;"></span>
      <span class="chip chip-approval">Approval checkpoint</span>
      <button class="icon-btn" title="Remove this approval step" onclick="removeGroup('${group.id}')">✕</button>
    </div>
    <div class="approval-detail" style="border-radius:0 0 8px 8px; border-top:none; padding-top:2px;">
      <div style="flex:1;">
        <label class="f" style="margin-bottom:6px; margin-top:0;">Who approves before applicants can continue past this point?</label>
        <div class="approval-type-row">
          <div class="approval-type-opt ${(group.approvalType||'lead')==='lead'?'active':''}" onclick="setGroupApprovalType('${group.id}','lead')">
            <span class="approval-type-dot"></span> Lead Owner
          </div>
          <div class="approval-type-opt ${group.approvalType==='other'?'active':''}" onclick="setGroupApprovalType('${group.id}','other')">
            <span class="approval-type-dot"></span> Other Employee
          </div>
        </div>
        ${group.approvalType==='other'?`
        <div style="margin-top:8px;">
          <label class="f" style="margin-bottom:4px;">Employee name</label>
          <input type="text" style="width:100%;max-width:320px;" placeholder="e.g. Admissions Head, Class Coordinator" value="${esc(group.approvalEmployeeName||'')}" onchange="setGroupApprovalEmployee('${group.id}', this.value)">
        </div>`:''}
      </div>
    </div>
  </div>`;
}

/* ---- Accordion group: header + checkbox field list + custom field form ---- */
function renderGroupAccordion(group, step, gIdx){
  if(group.type==='approval') return renderApprovalGroupCard(group);
  const isOpen = state.openGroupAccordion===group.id;
  const lowerName = group.name.toLowerCase();
  const isSpecialGroup = ["instructions", "declaration"].includes(lowerName);

  const header = `
    <div class="acc-header" onclick="toggleAccordion('${group.id}')">
      <input type="number" class="seq-num-input" min="1" max="99" step="1" value="${group.seq||(gIdx+1)}" title="Type a position (1-99) to move this group there" onclick="event.stopPropagation()" oninput="this.value=this.value.replace(/[^0-9]/g,'').slice(0,2)" onchange="event.stopPropagation(); reorderGroupInStep('${group.id}', this.value)">
      <span class="acc-chevron">${isOpen?'▾':'▸'}</span>
      <input type="text" class="group-name-input" onclick="event.stopPropagation()" value="${esc(group.name)}" onchange="renameGroup('${group.id}',this.value)">
      <span class="chip">${isSpecialGroup ? 'Page Text' : `${group.fields.length} field${group.fields.length!==1?'s':''}`}</span>
      <button class="icon-btn" title="Delete group" onclick="event.stopPropagation(); removeGroup('${group.id}')">✕</button>
    </div>`;

  if(!isOpen){
    return `<div class="group-card">${header}</div>`;
  }

  if (lowerName === "instructions") {
    return `
    <div class="group-card">
      ${header}
      <div style="padding: 14px 18px 18px;">
        <label class="f" style="font-size:11px; letter-spacing:.03em; text-transform:uppercase; margin-bottom:8px; display:block; font-weight:600; color:var(--text-muted);">Instructions Page Text</label>
        <textarea class="form-control form-control-sm" rows="5" placeholder="Write any instructions for applicants here (leave empty to skip instructions page)..." style="border:1px solid var(--border); border-radius:6px; padding:8px 12px; font-size:12.5px; width: 100%; box-sizing: border-box;" oninput="state.instructions=this.value;">${esc(state.instructions)}</textarea>
      </div>
    </div>`;
  }

  if (lowerName === "declaration") {
    const pointsListHtml = state.declarationPoints.map((p, idx) => `
      <div style="display: flex; align-items: flex-start; gap: 10px; margin-bottom: 12px;">
        <div style="flex: 1;">
          <textarea class="form-control form-control-sm" style="border: 1px solid var(--border); border-radius: 6px; font-size: 12.5px; width: 100%; box-sizing: border-box; padding: 6px 10px;" rows="2" placeholder="e.g. I hereby declare that all the information provided is correct..." oninput="updateDeclarationPointText('${p.id}', this.value)">${esc(p.text)}</textarea>
        </div>
        <label style="display: flex; align-items: center; gap: 6px; font-size: 11.5px; margin-top: 8px; cursor: pointer; user-select: none; white-space: nowrap; font-weight: 500; color: var(--text);">
          <input type="checkbox" ${p.requiredCheckbox ? 'checked' : ''} onchange="toggleDeclarationPointCheckbox('${p.id}', this.checked)">
          <span>Require checkbox</span>
        </label>
        <button class="btn btn-sm btn-outline-danger" style="padding: 4px 8px; margin-top: 4px;" title="Delete point" onclick="removeDeclarationPoint('${p.id}')">
          <i class="bi bi-trash"></i>
        </button>
      </div>`).join('');

    return `
    <div class="group-card">
      ${header}
      <div style="padding: 14px 18px 18px;">
        <div style="font-size: 11px; letter-spacing: .03em; text-transform: uppercase; margin-bottom: 10px; font-weight: 600; color: var(--text-muted);">Declaration Points &amp; Checkboxes</div>
        
        <div id="declarationPointsList">
          ${pointsListHtml || '<div class="text-muted small mb-2">No declaration points added.</div>'}
        </div>
        
        <div style="margin-top: 10px; text-align: right;">
          <button class="btn btn-sm btn-wa" style="border-radius: 6px; font-size: 11px; font-weight: 600; padding: 4px 12px;" onclick="addDeclarationPoint()">+ Add Point</button>
        </div>
      </div>
    </div>`;
  }

  const customFields = group.fields.filter(f=>!f.sourceLabel);
  const customFieldsHtml = customFields.length ? `
    <div style="margin-top:14px;">
      <div class="hint" style="margin-bottom:6px;">Custom fields in this group:</div>
      <div class="lib-inline-list" style="grid-template-columns: 1fr;">${customFields.map(f=>fieldRow(f,step,null,null)).join('')}</div>
    </div>` : '';

  const activeCat = getGroupCat(group.id, group.name);
  const search = (state.groupSearch[group.id]||'').trim().toLowerCase();
  let viewItems = [];
  if(search){
    Object.entries(FIELD_LIBRARY).forEach(([cat,items])=>{
      items.filter(i=>i.l.toLowerCase().includes(search)).forEach(item=> viewItems.push({cat,item}));
    });
  } else {
    (FIELD_LIBRARY[activeCat]||[]).forEach(item=> viewItems.push({cat:activeCat,item}));
  }
  const checklist = viewItems.length ? viewItems.map(({cat,item})=>{
    const f = group.fields.find(x=>x.sourceLabel===item.l);
    const dupGroup = !f ? fieldUsedInOtherGroup(step, item.l, group.id) : null;
    return fieldRow(f, step, cat, item, !!search, dupGroup);
  }).join('') : `<div class="empty" style="padding:10px 0;">No fields match "${esc(state.groupSearch[group.id]||'')}".</div>`;

  const selectableViewItems = viewItems.filter(({item})=> group.fields.some(f=>f.sourceLabel===item.l) || !fieldUsedInOtherGroup(step, item.l, group.id));
  const allChecked = selectableViewItems.length>0 && selectableViewItems.every(({item})=>group.fields.some(f=>f.sourceLabel===item.l));
  const catTabs = Object.keys(FIELD_LIBRARY).map(cat=>
    `<div class="lib-cat-pill ${cat===activeCat && !search?'active':''}" onclick="setGroupSearch('${group.id}','');setGroupCat('${group.id}','${escJs(cat)}')">${cat}</div>`
  ).join('');

  const customOpen = state.openCustomFieldGroupId===group.id;
  const immediateNext = step.groups[gIdx+1];
  let nextNavIdx = gIdx+1;
  while(step.groups[nextNavIdx] && step.groups[nextNavIdx].type==='approval') nextNavIdx++;
  const nextGroup = step.groups[nextNavIdx];

  return `
  <div class="group-card">
    ${header}
    ${customFieldsHtml}
    <div class="lib-inline">
      <div class="lib-inline-head">
        <div class="lib-inline-top">
          <input type="text" class="lib-search" placeholder="Search fields..." value="${esc(state.groupSearch[group.id]||'')}" oninput="setGroupSearch('${group.id}', this.value)">
          <div class="lib-cat-pills">${catTabs}</div>
        </div>
        <label class="select-all-row">
          <input type="checkbox" ${allChecked?'checked':''} ${selectableViewItems.length===0?'disabled':''} onchange="toggleSelectAllGroup('${group.id}')">
          <span>Select all ${search?'matching':`in ${esc(activeCat)}`} (${viewItems.length})</span>
        </label>
      </div>
      <div class="lib-inline-list">${checklist}</div>
    </div>
    <div style="display:flex; gap:8px; margin-top:12px; align-items:center;">
      <button class="btn ghost" onclick="toggleCustomFieldForm('${group.id}')">${customOpen?'Cancel':'+ Custom field'}</button>
      <label class="approval-check ${immediateNext && immediateNext.type==='approval' ? 'checked' : ''}" title="Require approval before applicants can move past this group">
        <input type="checkbox" ${immediateNext && immediateNext.type==='approval' ? 'checked' : ''} onchange="toggleGroupApprovalAfter('${group.id}')">
        <span>Approval required</span>
      </label>
      ${nextGroup ? `<button class="btn secondary" style="margin-left:auto;" onclick="toggleAccordion('${nextGroup.id}')">Next: ${esc(nextGroup.name)} →</button>` : ''}
    </div>
    ${customOpen ? renderCustomFieldForm(group.id) : ''}
  </div>`;
}

/* fieldRow: used both for library checklist rows (item given) and custom-field rows (item=null).
   f = the field object if already added (else null/undefined for unchecked library rows). */
function fieldRow(f, step, cat, item, showCatTag, dupGroup){
  const checked = !!f;
  const labelText = f ? f.label : item.l;
  const fid = f ? f.id : null;
  const dupGroupStep = dupGroup ? findStepForGroup(dupGroup.id) : null;
  const dupGroupStepName = (dupGroupStep && step && dupGroupStep.id!==step.id) ? dupGroupStep.name : null;
  const renaming = f && state.openFieldPanel && state.openFieldPanel.fieldId===f.id && state.openFieldPanel.type==='rename';
  const condOpen = f && state.openFieldPanel && state.openFieldPanel.fieldId===f.id && state.openFieldPanel.type==='cond';
  const labelHtml = renaming
    ? `<input type="text" class="rename-input" value="${esc(labelText)}" onclick="event.stopPropagation()" onchange="renameField('${fid}', this.value)" onkeydown="if(event.key==='Enter') this.blur();">`
    : `<span class="lib-row-label ${checked?'':'lib-row-label-empty'} ${dupGroup?'lib-row-label-dup':''}">${esc(labelText)}</span>`;

  const icons = checked ? `
    <div class="row-icons">
      <button class="row-icon ${f.mandatory?'on':''}" title="${f.mandatory?'Mandatory (click to make optional)':'Optional (click to make mandatory)'}" onclick="event.stopPropagation(); toggleMandatory('${f.id}')">M</button>
      ${f.type!=='file' ? `<button class="row-icon ${f.conditional&&f.conditional.fieldId?'on':''}" title="Conditional display" onclick="event.stopPropagation(); toggleFieldPanel('${f.id}','cond')">⚑</button>` : ''}
      <button class="row-icon" title="Rename" onclick="event.stopPropagation(); toggleFieldPanel('${f.id}','rename')">✎</button>
      <button class="row-icon" title="Remove" onclick="event.stopPropagation(); deleteField('${f.id}')">✕</button>
    </div>` : '';

  const row = `
  <div class="lib-row ${dupGroup?'lib-row-dup':''}">
    <label class="lib-row-check" onclick="event.stopPropagation();" title="${dupGroup?`Already added in \u201c${esc(dupGroup.name)}\u201d${dupGroupStepName?` (${esc(dupGroupStepName)})`:''} — remove it there first to move it here`:''}">
      ${item ? (dupGroup
          ? `<input type="checkbox" disabled>`
          : `<input type="checkbox" ${checked?'checked':''} onchange="toggleLibField('${state.openGroupAccordion}','${escJs(cat)}','${escJs(item.l)}')">`
        ) : ''}
      ${labelHtml}
    </label>
    ${dupGroup ? `<span class="cat-tag dup-tag">Added in ${esc(dupGroup.name)}${dupGroupStepName?` (${esc(dupGroupStepName)})`:''}</span>` : (showCatTag && !checked ? `<span class="cat-tag">${esc(cat)}</span>` : '')}
    ${icons}
  </div>`;

  const condPanel = (condOpen) ? renderCondPanel(f, step) : '';
  return row + condPanel;
}

const COND_OPERATORS = [
  {v:'equals', l:'equals'},
  {v:'not_equals', l:'not equals'},
  {v:'greater_than', l:'greater than'},
  {v:'less_than', l:'less than'},
  {v:'between', l:'between'},
];

function renderCondPanel(f, step){
  const allStepFields = step.groups.flatMap(g=>g.fields);
  const condTargets = allStepFields.filter(ff=>ff.id!==f.id);
  if(!condTargets.length){
    return `<div class="cond-box">Add another field first to use as a condition.</div>`;
  }
  const c = f.conditional || {fieldId:'', operator:'equals', value:'', value2:''};
  const target = condTargets.find(t=>t.id===c.fieldId);
  const isChoiceTarget = target && (target.type==='radio' || target.type==='select');
  const opts = isChoiceTarget ? (target.options||'').split(',').map(s=>s.trim()).filter(Boolean) : [];

  const valueField = c.operator==='between'
    ? `<input type="text" style="width:90px" value="${esc(c.value)}" placeholder="min" onchange="setCondValue('${f.id}', this.value)">
       <span style="font-size:12px;color:#8a939b;">and</span>
       <input type="text" style="width:90px" value="${esc(c.value2||'')}" placeholder="max" onchange="setCondValue2('${f.id}', this.value)">`
    : isChoiceTarget
      ? `<select onchange="setCondValue('${f.id}', this.value)">
           <option value="">-- choose value --</option>
           ${opts.map(o=>`<option value="${esc(o)}" ${c.value===o?'selected':''}>${esc(o)}</option>`).join('')}
         </select>`
      : `<input type="text" style="width:140px" value="${esc(c.value)}" placeholder="e.g. Yes" onchange="setCondValue('${f.id}', this.value)">`;

  return `
  <div class="cond-box">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
      <label style="font-weight:600;">Show this field only if…</label>
      <button class="row-icon" title="Remove condition" onclick="event.stopPropagation(); removeCond('${f.id}')">✕</button>
    </div>
    <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
      <select onchange="setCondField('${f.id}', this.value)">
        <option value="">-- choose field --</option>
        ${condTargets.map(t=>`<option value="${t.id}" ${c.fieldId===t.id?'selected':''}>${esc(t.label||'(untitled)')}</option>`).join('')}
      </select>
      <select onchange="setCondOperator('${f.id}', this.value)">
        ${COND_OPERATORS.map(o=>`<option value="${o.v}" ${c.operator===o.v?'selected':''}>${o.l}</option>`).join('')}
      </select>
      ${valueField}
    </div>
  </div>`;
}

function toggleLibField(groupId, cat, label){
  const group = findGroup(groupId);
  if(!group) return;
  const existing = group.fields.find(f=>f.sourceLabel===label);
  if(existing){ purgeField(existing.id); render(); return; }
  const step = findStepForGroup(groupId);
  if(fieldUsedInOtherGroup(step, label, groupId)) { render(); return; }
  const item = (FIELD_LIBRARY[cat]||[]).find(i=>i.l===label);
  if(item){ group.fields.push(mkField({label:item.l, sourceLabel:item.l, type:item.t, mandatory:true, options:item.o||''})); }
  render();
}
function toggleSelectAllGroup(groupId){
  const group = findGroup(groupId);
  if(!group) return;
  const step = findStepForGroup(groupId);
  const activeCat = getGroupCat(group.id, group.name);
  const search = (state.groupSearch[group.id]||'').trim().toLowerCase();
  let viewItems = [];
  if(search){
    Object.entries(FIELD_LIBRARY).forEach(([cat,items])=>{
      items.filter(i=>i.l.toLowerCase().includes(search)).forEach(item=> viewItems.push({cat,item}));
    });
  } else {
    (FIELD_LIBRARY[activeCat]||[]).forEach(item=> viewItems.push({cat:activeCat,item}));
  }
  const selectable = viewItems.filter(({item})=> group.fields.some(f=>f.sourceLabel===item.l) || !fieldUsedInOtherGroup(step, item.l, groupId));
  if(!selectable.length) return;
  const allChecked = selectable.every(({item})=>group.fields.some(f=>f.sourceLabel===item.l));
  selectable.forEach(({cat,item})=>{
    const existing = group.fields.find(f=>f.sourceLabel===item.l);
    if(allChecked){
      if(existing) purgeField(existing.id);
    } else if(!existing){
      group.fields.push(mkField({label:item.l, sourceLabel:item.l, type:item.t, mandatory:true, options:item.o||''}));
    }
  });
  render();
}

function renderCustomFieldForm(groupId){
  return `
  <div style="margin-top:12px; padding-top:12px; border-top:1px dashed var(--border);">
    <div class="field-builder-form" style="margin-bottom:10px;">
      <div>
        <label class="f">Field label</label>
        <input type="text" id="cf_label_${groupId}" placeholder="e.g. Student's Full Name" style="width:100%">
      </div>
      <div>
        <label class="f">Field type</label>
        <select id="cf_type_${groupId}" style="width:100%" onchange="toggleCfOptions('${groupId}')">
          ${FIELD_TYPES.map(t=>`<option value="${t.v}">${t.l}</option>`).join('')}
        </select>
      </div>
      <div>
        <label class="f">Required?</label>
        <select id="cf_mandatory_${groupId}" style="width:100%">
          <option value="yes">Mandatory</option>
          <option value="no">Optional</option>
        </select>
      </div>
      <div class="full-w" id="cf_opts_wrap_${groupId}" style="display:none;">
        <label class="f">Dropdown options (comma separated)</label>
        <input type="text" id="cf_options_${groupId}" placeholder="e.g. General, OBC, SC, ST" style="width:100%">
      </div>
    </div>
    <button class="btn secondary" onclick="addCustomField('${groupId}')">+ Add field</button>
  </div>`;
}
function toggleCfOptions(groupId){
  const t = document.getElementById('cf_type_'+groupId).value;
  document.getElementById('cf_opts_wrap_'+groupId).style.display = (t==='select'||t==='multiselect') ? 'block':'none';
}
function toggleCustomFieldForm(groupId){
  state.openCustomFieldGroupId = state.openCustomFieldGroupId===groupId ? null : groupId;
  render();
}
function addCustomField(groupId){
  const label = document.getElementById('cf_label_'+groupId).value.trim();
  const type = document.getElementById('cf_type_'+groupId).value;
  const mandatory = document.getElementById('cf_mandatory_'+groupId).value==='yes';
  const optEl = document.getElementById('cf_options_'+groupId);
  const options = optEl ? optEl.value : '';
  if(!label){ alert('Please enter a field label.'); return; }
  const group = findGroup(groupId);
  group.fields.push(mkField({label,type,mandatory,options}));
  state.openCustomFieldGroupId = null;
  render();
}

/* ---- Field actions: mandatory toggle, rename, conditional logic, delete ---- */
function findField(id){
  for(const s of state.steps){ for(const g of s.groups){ const f=g.fields.find(f=>f.id===id); if(f) return f; } }
}
function toggleFieldPanel(fieldId, type){
  if(state.openFieldPanel && state.openFieldPanel.fieldId===fieldId && state.openFieldPanel.type===type){
    state.openFieldPanel = null;
  } else {
    state.openFieldPanel = {fieldId, type};
    if(type==='cond'){
      const f = findField(fieldId);
      if(f && !f.conditional) f.conditional = {fieldId:'', operator:'equals', value:'', value2:''};
    }
  }
  render();
}
function renameField(id, val){
  const f = findField(id);
  if(f) f.label = val.trim() || f.label;
  state.openFieldPanel = null;
  render();
}
function toggleMandatory(id){ const f=findField(id); f.mandatory=!f.mandatory; render(); }
function purgeField(id){
  state.steps.forEach(s=> s.groups.forEach(g=> g.fields = g.fields.filter(f=>f.id!==id)));
  state.steps.forEach(s=> s.groups.forEach(g=> g.fields.forEach(f=>{ if(f.conditional && f.conditional.fieldId===id) f.conditional=null; })));
}
function deleteField(id){
  purgeField(id);
  if(state.openFieldPanel && state.openFieldPanel.fieldId===id) state.openFieldPanel=null;
  render();
}
function setCondField(id,val){ const f=findField(id); f.conditional.fieldId=val; f.conditional.value=''; f.conditional.value2=''; render(); }
function setCondOperator(id,val){ const f=findField(id); f.conditional.operator=val; render(); }
function setCondValue(id,val){ const f=findField(id); f.conditional.value=val; }
function setCondValue2(id,val){ const f=findField(id); f.conditional.value2=val; }
function removeCond(id){ const f=findField(id); f.conditional=null; state.openFieldPanel=null; render(); }

function screenNotif(){
  const tabs = `
    <div class="tabbar">
      ${state.steps.map((s,i)=>`<div class="tab ${i===state.activeStepIdx?'active':''}" onclick="state.activeStepIdx=${i};render()">${i+1}. ${esc(s.name)}</div>`).join('')}
    </div>`;
  const step = state.steps[state.activeStepIdx];

  return `
  <div class="topline">Step 3</div>
  <h1>Alerts</h1>
  <div class="desc">Decide what happens after someone completes ${state.formType==='stepper'?'each step':'the form'} — which message goes out, and how the status updates.</div>
  ${state.formType==='stepper'?tabs:''}
  <div class="card">
    <h3>After "${esc(step.name)}" is completed</h3>
    <div class="hint">Choose templates to send automatically. Pick "No message" to skip a channel.</div>
    <div class="notif-grid">
      <div class="notif-card">
        <div class="ic">✉️</div>
        <h4>Email template</h4>
        <select onchange="setNotif('email',this.value)">${getTemplateOptions('email', step.notif.email)}</select>
      </div>
      <div class="notif-card">
        <div class="ic">💬</div>
        <h4>SMS template</h4>
        <select onchange="setNotif('sms',this.value)">${getTemplateOptions('sms', step.notif.sms)}</select>
      </div>
      <div class="notif-card">
        <div class="ic">📱</div>
        <h4>WhatsApp template</h4>
        <select onchange="setNotif('whatsapp',this.value)">${getTemplateOptions('whatsapp', step.notif.whatsapp)}</select>
      </div>
    </div>
    <label class="f">Status label shown to applicant</label>
    <select style="width:340px; padding: 8px 10px; border-radius: 7px; border: 1px solid var(--border); font-size: 13px;" onchange="setNotif('statusLabel',this.value)">
      <option value="">-- select status --</option>
      ${(statuses || []).map(s => `<option value="${esc(s.name)}" ${step.notif.statusLabel === s.name ? 'selected' : ''}>${esc(s.name)}</option>`).join('')}
    </select>
  </div>

  <div class="footer-nav">
    <button class="btn ghost" onclick="goScreen('builder')">← Back</button>
    <button class="btn" onclick="goScreen('preview')">Continue to Preview →</button>
  </div>`;
}
function setNotif(key,val){ state.steps[state.activeStepIdx].notif[key]=val; render(); }
function toggleStepFlag(key){
  const n = state.steps[state.activeStepIdx].notif;
  n[key] = !n[key];
  render();
}

/* ================= SCREEN 5: PREVIEW ================= */
function screenPreview(){
  const simSteps = [
    { key: 'instructions', label: 'Instructions' },
    { key: 'form', label: 'Registration Form' }
  ];

  if (state.simActiveIdx === undefined || state.simActiveIdx >= simSteps.length) {
    state.simActiveIdx = 0;
  }
  const curSimStep = simSteps[state.simActiveIdx];

  let simContentHtml = '';
  if (curSimStep.key === 'instructions') {
    simContentHtml = `
      <div style="flex:1;">
        <div style="${getGroupHeaderStyles()}">Instructions</div>
        <p class="sim-inst-text" style="white-space:pre-wrap; color:${getThemeVal('instColor')}; font-size:${getThemeVal('instFontSize')}; line-height:${getThemeVal('instLineHeight')}; margin-bottom:24px;">${esc(state.instructions || 'Please read the instructions carefully before filling out the form.')}</p>
      </div>
      <div style="display:flex; justify-content:flex-end; border-top:1px solid #f1f5f9; padding-top:14px; margin-top:auto;">
        <button class="btn" style="${getBtnStyles()}" onclick="nextSimStep()">Next: Fill Registration Form →</button>
      </div>
    `;
  }
  else if (curSimStep.key === 'form') {
    // Collect all visible groups from all steps (except instructions & declaration)
    const visibleGroups = [];
    let hasPayment = false;
    state.steps
      .slice()
      .sort(compareStepsAndGroups)
      .forEach((s) => {
        const sName = s.name.toLowerCase();
        if (sName !== 'instructions' && sName !== 'instruction' && sName !== 'declaration') {
          if (sName === 'payment' || sName.includes('payment')) {
            hasPayment = true;
          }
          s.groups.forEach((g) => {
            if (g.type !== 'approval') {
              visibleGroups.push(g);
            }
          });
        }
      });

    const cols = state.formColumns || 2;
    const groupsPreviewHtml = visibleGroups.length ? visibleGroups.map(g => `
      <div style="margin-bottom:18px;">
        <div style="${getGroupHeaderStyles()}">${esc(g.name)}</div>
        ${g.fields.length ? `<div style="display:grid;grid-template-columns:repeat(${cols},1fr);gap:10px 14px;">${g.fields.map(f=>previewField(f)).join('')}</div>` : `<div class="empty" style="padding:6px 0; font-size:12px;">No fields in this group.</div>`}
      </div>`).join('') : `<div class="empty" style="font-size:12px;">This step has no fields yet.</div>`;

    // Render Declaration points
    const pointsHtml = state.declarationPoints.map((p, idx) => {
      if (p.requiredCheckbox) {
        return `
          <div style="margin-bottom:12px;">
            <label style="display:flex; align-items:flex-start; gap:8px; cursor:pointer; font-size:${getThemeVal('declFontSize')}; color:${getThemeVal('declColor')}; font-weight:500; text-align: left;">
              <input type="checkbox" class="sim-required-checkbox" data-point-id="${p.id}" style="margin-top:3px; flex-shrink: 0;" onchange="validateSimDeclarationCheckboxes()">
              <span>${esc(p.text || 'I agree.')}</span>
            </label>
          </div>
        `;
      } else {
        return `
          <div style="margin-bottom:12px; padding-left:22px; font-size:${getThemeVal('declFontSize')}; color:${getThemeVal('declColor')}; line-height:1.5; text-align: left;">
            • ${esc(p.text)}
          </div>
        `;
      }
    }).join('');

    const paymentHtml = hasPayment ? `
      <div style="margin-bottom:24px;">
        <div style="${getGroupHeaderStyles()}">Payment Details</div>
        <div style="display:grid; grid-template-columns:repeat(${cols}, 1fr); gap:10px 14px;">
          <div class="pf-field"><label style="${getFieldLabelStyles()}">Amount</label><input type="number" class="form-control form-control-sm" style="border: 1px solid var(--border); border-radius: 6px; padding: 6px 10px;" value="" placeholder="e.g. 5000"></div>
          <div class="pf-field"><label style="${getFieldLabelStyles()}">Payment Method</label><input type="text" class="form-control form-control-sm" style="border: 1px solid var(--border); border-radius: 6px; padding: 6px 10px;" value="" placeholder="e.g. Online"></div>
          <div class="pf-field"><label style="${getFieldLabelStyles()}">Reference Number</label><input type="text" class="form-control form-control-sm" style="border: 1px solid var(--border); border-radius: 6px; padding: 6px 10px;" value="" placeholder="e.g. TXN12345"></div>
        </div>
      </div>` : '';

    const nextBtnLabel = hasPayment ? 'Proceed to Payment' : 'Save';

    simContentHtml = `
      <div style="flex:1; overflow-y:auto; padding-right:6px;">
        ${groupsPreviewHtml}
        
        ${paymentHtml}
        
        <div style="${getGroupHeaderStyles()}">Declaration</div>
        <div class="sim-decl-box" style="background:${getThemeVal('declBgColor')}; border:1px solid var(--border); padding:16px; border-radius:8px; margin-bottom:16px; color:${getThemeVal('declColor')}; font-size:${getThemeVal('declFontSize')};">
          ${pointsHtml || '<p class="text-muted small">No declaration points configured.</p>'}
        </div>
      </div>
      <div style="display:flex; justify-content:space-between; border-top:1px solid #f1f5f9; padding-top:14px; margin-top:auto; gap:10px;">
        <button class="btn ghost" style="font-size:12px; font-weight:600; padding:6px 14px;" onclick="prevSimStep()">← Back</button>
        <button class="btn" id="simSubmitBtn" style="${getBtnStyles()}" ${state.declarationPoints.some(p => p.requiredCheckbox) ? 'disabled' : ''} onclick="alert('This is a preview — form submitted successfully! 🎉');">${nextBtnLabel}</button>
      </div>
    `;
  }

  const openAcc = state.openStyleAccordion;
  
  // Card 1: Portal Content
  const portalHeader = `
    <div style="display:flex; justify-content:space-between; align-items:center; padding:10px 14px; background:#f8fafc; border:1px solid var(--border); border-radius:8px; cursor:pointer;" onclick="toggleStyleAccordion('portal')">
      <span style="font-size:12.5px; font-weight:700; color:var(--text);"><i class="bi bi-file-text"></i> Portal Content</span>
      <span style="font-size:10px; color:#94a3b8;">${openAcc === 'portal' ? '▾' : '▸'}</span>
    </div>`;
  const portalBody = openAcc === 'portal' ? `
    <div style="padding:12px; border:1px solid var(--border); border-top:none; border-radius:0 0 8px 8px; display:flex; flex-direction:column; gap:10px; background:#fff;">
      <div>
        <label class="f" style="font-size:11px; text-transform:uppercase; font-weight:600; color:var(--text-muted); display:block; margin-bottom:4px;">Portal Header Name</label>
        <input type="text" class="form-control form-control-sm" value="${esc(state.headerName || '')}" oninput="updateHeaderName(this.value)" placeholder="e.g. EduNext International School" style="border:1px solid var(--border); border-radius:6px; padding:6px 10px;">
      </div>
      <div>
        <label class="f" style="font-size:11px; text-transform:uppercase; font-weight:600; color:var(--text-muted); display:block; margin-bottom:4px;">Portal Tagline</label>
        <input type="text" class="form-control form-control-sm" value="${esc(state.tagline || '')}" oninput="updateTagline(this.value)" placeholder="e.g. Shaping Future Leaders" style="border:1px solid var(--border); border-radius:6px; padding:6px 10px;">
      </div>
      <div>
        <label class="f" style="font-size:11px; text-transform:uppercase; font-weight:600; color:var(--text-muted); display:block; margin-bottom:4px;">Instructions Page Text</label>
        <textarea class="form-control form-control-sm" rows="3" oninput="updateInstructions(this.value)" placeholder="Write any instructions for applicants..." style="border:1px solid var(--border); border-radius:6px; padding:6px 10px; font-size:12px;">${esc(state.instructions || '')}</textarea>
      </div>
    </div>` : '';

  // Card 2: Theme & Card Styling
  const themeHeader = `
    <div style="display:flex; justify-content:space-between; align-items:center; padding:10px 14px; background:#f8fafc; border:1px solid var(--border); border-radius:8px; cursor:pointer;" onclick="toggleStyleAccordion('theme')">
      <span style="font-size:12.5px; font-weight:700; color:var(--text);"><i class="bi bi-sliders"></i> Theme &amp; Layout</span>
      <span style="font-size:10px; color:#94a3b8;">${openAcc === 'theme' ? '▾' : '▸'}</span>
    </div>`;
  const themeBody = openAcc === 'theme' ? `
    <div style="padding:12px; border:1px solid var(--border); border-top:none; border-radius:0 0 8px 8px; display:flex; flex-direction:column; gap:10px; background:#fff;">
      <div>
        <label class="f" style="font-size:11px; text-transform:uppercase; font-weight:600; color:var(--text-muted); display:block; margin-bottom:4px;">Font Style</label>
        <select class="form-select form-select-sm" data-prop="fontFamily" onchange="updateThemeProp('fontFamily', this.value)">
          <option value="Default" ${getThemeVal('fontFamily')==='Default'?'selected':''}>System default</option>
          <option value="Inter" ${getThemeVal('fontFamily')==='Inter'?'selected':''}>Inter (Modern)</option>
          <option value="Outfit" ${getThemeVal('fontFamily')==='Outfit'?'selected':''}>Outfit (Premium)</option>
          <option value="Montserrat" ${getThemeVal('fontFamily')==='Montserrat'?'selected':''}>Montserrat</option>
          <option value="Playfair Display" ${getThemeVal('fontFamily')==='Playfair Display'?'selected':''}>Playfair Display (Serif)</option>
          <option value="Lora" ${getThemeVal('fontFamily')==='Lora'?'selected':''}>Lora (Classic)</option>
        </select>
      </div>
      <div>
        <label class="f" style="font-size:11px; text-transform:uppercase; font-weight:600; color:var(--text-muted); display:block; margin-bottom:4px;">Card Background</label>
        <div style="display:flex; gap:6px; align-items:center;">
          <input type="color" data-prop="cardBgColor" style="height:30px; width:45px; padding:2px; border-radius:4px; border:1px solid var(--border); cursor:pointer;" value="${getThemeVal('cardBgColor')}" oninput="updateThemeProp('cardBgColor', this.value)">
          <input type="text" data-prop="cardBgColor" class="form-control form-control-sm" style="font-size:12px; height:30px;" value="${getThemeVal('cardBgColor')}" oninput="updateThemeProp('cardBgColor', this.value)" placeholder="#ffffff">
        </div>
      </div>
      <div>
        <label class="f" style="font-size:11px; text-transform:uppercase; font-weight:600; color:var(--text-muted); display:block; margin-bottom:4px;">Card Shadow</label>
        <select class="form-select form-select-sm" data-prop="cardShadow" onchange="updateThemeProp('cardShadow', this.value)">
          <option value="none" ${getThemeVal('cardShadow')==='none'?'selected':''}>None</option>
          <option value="small" ${getThemeVal('cardShadow')==='small'?'selected':''}>Small</option>
          <option value="medium" ${getThemeVal('cardShadow')==='medium'?'selected':''}>Medium</option>
          <option value="large" ${getThemeVal('cardShadow')==='large'?'selected':''}>Large</option>
        </select>
      </div>
      <div>
        <label class="f" style="font-size:11px; text-transform:uppercase; font-weight:600; color:var(--text-muted); display:block; margin-bottom:4px;">Card Border Radius</label>
        <input type="text" data-prop="cardBorderRadius" class="form-control form-control-sm" value="${getThemeVal('cardBorderRadius')}" oninput="updateThemeProp('cardBorderRadius', this.value)" placeholder="e.g. 12px">
      </div>
      <div>
        <label class="f" style="font-size:11px; text-transform:uppercase; font-weight:600; color:var(--text-muted); display:block; margin-bottom:4px;">Page Background Color</label>
        <div style="display:flex; gap:6px; align-items:center;">
          <input type="color" data-prop="pageBgColor" style="height:30px; width:45px; padding:2px; border-radius:4px; border:1px solid var(--border); cursor:pointer;" value="${getThemeVal('pageBgColor')}" oninput="updateThemeProp('pageBgColor', this.value)">
          <input type="text" data-prop="pageBgColor" class="form-control form-control-sm" style="font-size:12px; height:30px;" value="${getThemeVal('pageBgColor')}" oninput="updateThemeProp('pageBgColor', this.value)" placeholder="#f1f5f9">
        </div>
      </div>
      <div>
        <label class="f" style="font-size:11px; text-transform:uppercase; font-weight:600; color:var(--text-muted); display:block; margin-bottom:4px;">Page Gradient Wallpaper</label>
        <select class="form-select form-select-sm" data-prop="pageBgGradient" onchange="updateThemeProp('pageBgGradient', this.value)">
          <option value="none" ${getThemeVal('pageBgGradient')==='none'?'selected':''}>Solid Color Only</option>
          <option value="cool" ${getThemeVal('pageBgGradient')==='cool'?'selected':''}>Cool Slate</option>
          <option value="sunset" ${getThemeVal('pageBgGradient')==='sunset'?'selected':''}>Warm Sunset</option>
          <option value="emerald" ${getThemeVal('pageBgGradient')==='emerald'?'selected':''}>Emerald wave</option>
          <option value="cosmic" ${getThemeVal('pageBgGradient')==='cosmic'?'selected':''}>Cosmic Purple</option>
          <option value="ocean" ${getThemeVal('pageBgGradient')==='ocean'?'selected':''}>Deep Ocean</option>
        </select>
      </div>
      <div>
        <label class="f" style="font-size:11px; text-transform:uppercase; font-weight:600; color:var(--text-muted); display:block; margin-bottom:4px;">Form Padding</label>
        <input type="text" data-prop="containerPadding" class="form-control form-control-sm" value="${getThemeVal('containerPadding')}" oninput="updateThemeProp('containerPadding', this.value)" placeholder="e.g. 24px">
      </div>
      <div>
        <label class="f" style="font-size:11px; text-transform:uppercase; font-weight:600; color:var(--text-muted); display:block; margin-bottom:4px;">Field Vertical Spacing</label>
        <select class="form-select form-select-sm" data-prop="fieldSpacing" onchange="updateThemeProp('fieldSpacing', this.value)">
          <option value="tight" ${getThemeVal('fieldSpacing')==='tight'?'selected':''}>Tight</option>
          <option value="cozy" ${getThemeVal('fieldSpacing')==='cozy'?'selected':''}>Cozy</option>
          <option value="normal" ${getThemeVal('fieldSpacing')==='normal'?'selected':''}>Normal</option>
          <option value="spacious" ${getThemeVal('fieldSpacing')==='spacious'?'selected':''}>Spacious</option>
        </select>
      </div>
    </div>` : '';

  // Card 3: Header Styling
  const headerStyleHeader = `
    <div style="display:flex; justify-content:space-between; align-items:center; padding:10px 14px; background:#f8fafc; border:1px solid var(--border); border-radius:8px; cursor:pointer;" onclick="toggleStyleAccordion('header')">
      <span style="font-size:12.5px; font-weight:700; color:var(--text);"><i class="bi bi-type-h1"></i> Header &amp; Tagline</span>
      <span style="font-size:10px; color:#94a3b8;">${openAcc === 'header' ? '▾' : '▸'}</span>
    </div>`;
  const headerStyleBody = openAcc === 'header' ? `
    <div style="padding:12px; border:1px solid var(--border); border-top:none; border-radius:0 0 8px 8px; display:flex; flex-direction:column; gap:10px; background:#fff;">
      <div>
        <label class="f" style="font-size:11px; text-transform:uppercase; font-weight:600; color:var(--text-muted); display:block; margin-bottom:4px;">Header Color</label>
        <div style="display:flex; gap:6px; align-items:center;">
          <input type="color" data-prop="headerColor" style="height:30px; width:45px; padding:2px; border-radius:4px; border:1px solid var(--border); cursor:pointer;" value="${getThemeVal('headerColor')}" oninput="updateThemeProp('headerColor', this.value)">
          <input type="text" data-prop="headerColor" class="form-control form-control-sm" style="font-size:12px; height:30px;" value="${getThemeVal('headerColor')}" oninput="updateThemeProp('headerColor', this.value)" placeholder="#1e293b">
        </div>
      </div>
      <div>
        <label class="f" style="font-size:11px; text-transform:uppercase; font-weight:600; color:var(--text-muted); display:block; margin-bottom:4px;">Header Size</label>
        <input type="text" data-prop="headerFontSize" class="form-control form-control-sm" value="${getThemeVal('headerFontSize')}" oninput="updateThemeProp('headerFontSize', this.value)" placeholder="e.g. 22px">
      </div>
      <div>
        <label class="f" style="font-size:11px; text-transform:uppercase; font-weight:600; color:var(--text-muted); display:block; margin-bottom:4px;">Header Alignment</label>
        <select class="form-select form-select-sm" data-prop="headerAlign" onchange="updateThemeProp('headerAlign', this.value)">
          <option value="left" ${getThemeVal('headerAlign')==='left'?'selected':''}>Left</option>
          <option value="center" ${getThemeVal('headerAlign')==='center'?'selected':''}>Center</option>
          <option value="right" ${getThemeVal('headerAlign')==='right'?'selected':''}>Right</option>
        </select>
      </div>
      <div style="display:flex; gap:14px; margin-top:4px;">
        <label style="display:flex; align-items:center; gap:5px; font-size:11px; font-weight:600; color:var(--text); cursor:pointer;">
          <input type="checkbox" data-prop="headerBold" ${getThemeVal('headerBold') ? 'checked' : ''} onchange="updateThemeProp('headerBold', this.checked)"> BOLD
        </label>
        <label style="display:flex; align-items:center; gap:5px; font-size:11px; font-weight:600; color:var(--text); cursor:pointer;">
          <input type="checkbox" data-prop="headerItalic" ${getThemeVal('headerItalic') ? 'checked' : ''} onchange="updateThemeProp('headerItalic', this.checked)"> ITALIC
        </label>
      </div>
      <hr style="margin:8px 0; border-color:#e2e8f0;"/>
      <div>
        <label class="f" style="font-size:11px; text-transform:uppercase; font-weight:600; color:var(--text-muted); display:block; margin-bottom:4px;">Tagline Color</label>
        <div style="display:flex; gap:6px; align-items:center;">
          <input type="color" data-prop="taglineColor" style="height:30px; width:45px; padding:2px; border-radius:4px; border:1px solid var(--border); cursor:pointer;" value="${getThemeVal('taglineColor')}" oninput="updateThemeProp('taglineColor', this.value)">
          <input type="text" data-prop="taglineColor" class="form-control form-control-sm" style="font-size:12px; height:30px;" value="${getThemeVal('taglineColor')}" oninput="updateThemeProp('taglineColor', this.value)" placeholder="#64748b">
        </div>
      </div>
      <div>
        <label class="f" style="font-size:11px; text-transform:uppercase; font-weight:600; color:var(--text-muted); display:block; margin-bottom:4px;">Tagline Size</label>
        <input type="text" data-prop="taglineFontSize" class="form-control form-control-sm" value="${getThemeVal('taglineFontSize')}" oninput="updateThemeProp('taglineFontSize', this.value)" placeholder="e.g. 14px">
      </div>
      <div>
        <label class="f" style="font-size:11px; text-transform:uppercase; font-weight:600; color:var(--text-muted); display:block; margin-bottom:4px;">Tagline Alignment</label>
        <select class="form-select form-select-sm" data-prop="taglineAlign" onchange="updateThemeProp('taglineAlign', this.value)">
          <option value="left" ${getThemeVal('taglineAlign')==='left'?'selected':''}>Left</option>
          <option value="center" ${getThemeVal('taglineAlign')==='center'?'selected':''}>Center</option>
          <option value="right" ${getThemeVal('taglineAlign')==='right'?'selected':''}>Right</option>
        </select>
      </div>
    </div>` : '';

  // Card 4: Group Name Styling
  const groupStyleHeader = `
    <div style="display:flex; justify-content:space-between; align-items:center; padding:10px 14px; background:#f8fafc; border:1px solid var(--border); border-radius:8px; cursor:pointer;" onclick="toggleStyleAccordion('group')">
      <span style="font-size:12.5px; font-weight:700; color:var(--text);"><i class="bi bi-folder2"></i> Group Titles</span>
      <span style="font-size:10px; color:#94a3b8;">${openAcc === 'group' ? '▾' : '▸'}</span>
    </div>`;
  const groupStyleBody = openAcc === 'group' ? `
    <div style="padding:12px; border:1px solid var(--border); border-top:none; border-radius:0 0 8px 8px; display:flex; flex-direction:column; gap:10px; background:#fff;">
      <div>
        <label class="f" style="font-size:11px; text-transform:uppercase; font-weight:600; color:var(--text-muted); display:block; margin-bottom:4px;">Group Name Color</label>
        <div style="display:flex; gap:6px; align-items:center;">
          <input type="color" data-prop="groupNameColor" style="height:30px; width:45px; padding:2px; border-radius:4px; border:1px solid var(--border); cursor:pointer;" value="${getThemeVal('groupNameColor')}" oninput="updateThemeProp('groupNameColor', this.value)">
          <input type="text" data-prop="groupNameColor" class="form-control form-control-sm" style="font-size:12px; height:30px;" value="${getThemeVal('groupNameColor')}" oninput="updateThemeProp('groupNameColor', this.value)" placeholder="#475569">
        </div>
      </div>
      <div>
        <label class="f" style="font-size:11px; text-transform:uppercase; font-weight:600; color:var(--text-muted); display:block; margin-bottom:4px;">Background Color</label>
        <div style="display:flex; gap:6px; align-items:center;">
          <input type="color" data-prop="groupNameBgColor" style="height:30px; width:45px; padding:2px; border-radius:4px; border:1px solid var(--border); cursor:pointer;" value="${getThemeVal('groupNameBgColor')}" oninput="updateThemeProp('groupNameBgColor', this.value)">
          <input type="text" data-prop="groupNameBgColor" class="form-control form-control-sm" style="font-size:12px; height:30px;" value="${getThemeVal('groupNameBgColor')}" oninput="updateThemeProp('groupNameBgColor', this.value)" placeholder="transparent">
        </div>
      </div>
      <div>
        <label class="f" style="font-size:11px; text-transform:uppercase; font-weight:600; color:var(--text-muted); display:block; margin-bottom:4px;">Font Size</label>
        <input type="text" data-prop="groupNameFontSize" class="form-control form-control-sm" value="${getThemeVal('groupNameFontSize')}" oninput="updateThemeProp('groupNameFontSize', this.value)" placeholder="e.g. 12px">
      </div>
      <div>
        <label class="f" style="font-size:11px; text-transform:uppercase; font-weight:600; color:var(--text-muted); display:block; margin-bottom:4px;">Alignment</label>
        <select class="form-select form-select-sm" data-prop="groupNameAlign" onchange="updateThemeProp('groupNameAlign', this.value)">
          <option value="left" ${getThemeVal('groupNameAlign')==='left'?'selected':''}>Left</option>
          <option value="center" ${getThemeVal('groupNameAlign')==='center'?'selected':''}>Center</option>
          <option value="right" ${getThemeVal('groupNameAlign')==='right'?'selected':''}>Right</option>
        </select>
      </div>
      <div style="display:flex; gap:14px; margin-top:4px;">
        <label style="display:flex; align-items:center; gap:5px; font-size:11px; font-weight:600; color:var(--text); cursor:pointer;">
          <input type="checkbox" data-prop="groupNameBold" ${getThemeVal('groupNameBold') ? 'checked' : ''} onchange="updateThemeProp('groupNameBold', this.checked)"> BOLD
        </label>
        <label style="display:flex; align-items:center; gap:5px; font-size:11px; font-weight:600; color:var(--text); cursor:pointer;">
          <input type="checkbox" data-prop="groupNameItalic" ${getThemeVal('groupNameItalic') ? 'checked' : ''} onchange="updateThemeProp('groupNameItalic', this.checked)"> ITALIC
        </label>
      </div>
    </div>` : '';

  // Card 5: Field Label Styling
  const fieldStyleHeader = `
    <div style="display:flex; justify-content:space-between; align-items:center; padding:10px 14px; background:#f8fafc; border:1px solid var(--border); border-radius:8px; cursor:pointer;" onclick="toggleStyleAccordion('field')">
      <span style="font-size:12.5px; font-weight:700; color:var(--text);"><i class="bi bi-type"></i> Field Labels</span>
      <span style="font-size:10px; color:#94a3b8;">${openAcc === 'field' ? '▾' : '▸'}</span>
    </div>`;
  const fieldStyleBody = openAcc === 'field' ? `
    <div style="padding:12px; border:1px solid var(--border); border-top:none; border-radius:0 0 8px 8px; display:flex; flex-direction:column; gap:10px; background:#fff;">
      <div>
        <label class="f" style="font-size:11px; text-transform:uppercase; font-weight:600; color:var(--text-muted); display:block; margin-bottom:4px;">Field Label Color</label>
        <div style="display:flex; gap:6px; align-items:center;">
          <input type="color" data-prop="fieldLabelColor" style="height:30px; width:45px; padding:2px; border-radius:4px; border:1px solid var(--border); cursor:pointer;" value="${getThemeVal('fieldLabelColor')}" oninput="updateThemeProp('fieldLabelColor', this.value)">
          <input type="text" data-prop="fieldLabelColor" class="form-control form-control-sm" style="font-size:12px; height:30px;" value="${getThemeVal('fieldLabelColor')}" oninput="updateThemeProp('fieldLabelColor', this.value)" placeholder="#334155">
        </div>
      </div>
      <div>
        <label class="f" style="font-size:11px; text-transform:uppercase; font-weight:600; color:var(--text-muted); display:block; margin-bottom:4px;">Font Size</label>
        <input type="text" data-prop="fieldLabelFontSize" class="form-control form-control-sm" value="${getThemeVal('fieldLabelFontSize')}" oninput="updateThemeProp('fieldLabelFontSize', this.value)" placeholder="e.g. 13px">
      </div>
      <div style="display:flex; gap:14px; margin-top:4px;">
        <label style="display:flex; align-items:center; gap:5px; font-size:11px; font-weight:600; color:var(--text); cursor:pointer;">
          <input type="checkbox" data-prop="fieldLabelBold" ${getThemeVal('fieldLabelBold') ? 'checked' : ''} onchange="updateThemeProp('fieldLabelBold', this.checked)"> BOLD
        </label>
        <label style="display:flex; align-items:center; gap:5px; font-size:11px; font-weight:600; color:var(--text); cursor:pointer;">
          <input type="checkbox" data-prop="fieldLabelItalic" ${getThemeVal('fieldLabelItalic') ? 'checked' : ''} onchange="updateThemeProp('fieldLabelItalic', this.checked)"> ITALIC
        </label>
      </div>
    </div>` : '';

  // Card 6: Button Styling
  const buttonStyleHeader = `
    <div style="display:flex; justify-content:space-between; align-items:center; padding:10px 14px; background:#f8fafc; border:1px solid var(--border); border-radius:8px; cursor:pointer;" onclick="toggleStyleAccordion('button')">
      <span style="font-size:12.5px; font-weight:700; color:var(--text);"><i class="bi bi-box-arrow-in-right"></i> Navigation Buttons</span>
      <span style="font-size:10px; color:#94a3b8;">${openAcc === 'button' ? '▾' : '▸'}</span>
    </div>`;
  const buttonStyleBody = openAcc === 'button' ? `
    <div style="padding:12px; border:1px solid var(--border); border-top:none; border-radius:0 0 8px 8px; display:flex; flex-direction:column; gap:10px; background:#fff;">
      <div>
        <label class="f" style="font-size:11px; text-transform:uppercase; font-weight:600; color:var(--text-muted); display:block; margin-bottom:4px;">Button Background</label>
        <div style="display:flex; gap:6px; align-items:center;">
          <input type="color" data-prop="btnBgColor" style="height:30px; width:45px; padding:2px; border-radius:4px; border:1px solid var(--border); cursor:pointer;" value="${getThemeVal('btnBgColor')}" oninput="updateThemeProp('btnBgColor', this.value)">
          <input type="text" data-prop="btnBgColor" class="form-control form-control-sm" style="font-size:12px; height:30px;" value="${getThemeVal('btnBgColor')}" oninput="updateThemeProp('btnBgColor', this.value)" placeholder="#00aa6d">
        </div>
      </div>
      <div>
        <label class="f" style="font-size:11px; text-transform:uppercase; font-weight:600; color:var(--text-muted); display:block; margin-bottom:4px;">Button Text Color</label>
        <div style="display:flex; gap:6px; align-items:center;">
          <input type="color" data-prop="btnTextColor" style="height:30px; width:45px; padding:2px; border-radius:4px; border:1px solid var(--border); cursor:pointer;" value="${getThemeVal('btnTextColor')}" oninput="updateThemeProp('btnTextColor', this.value)">
          <input type="text" data-prop="btnTextColor" class="form-control form-control-sm" style="font-size:12px; height:30px;" value="${getThemeVal('btnTextColor')}" oninput="updateThemeProp('btnTextColor', this.value)" placeholder="#ffffff">
        </div>
      </div>
      <div>
        <label class="f" style="font-size:11px; text-transform:uppercase; font-weight:600; color:var(--text-muted); display:block; margin-bottom:4px;">Border Radius</label>
        <input type="text" data-prop="btnBorderRadius" class="form-control form-control-sm" value="${getThemeVal('btnBorderRadius')}" oninput="updateThemeProp('btnBorderRadius', this.value)" placeholder="e.g. 6px">
      </div>
      <div>
        <label class="f" style="font-size:11px; text-transform:uppercase; font-weight:600; color:var(--text-muted); display:block; margin-bottom:4px;">Font Size</label>
        <input type="text" data-prop="btnFontSize" class="form-control form-control-sm" value="${getThemeVal('btnFontSize')}" oninput="updateThemeProp('btnFontSize', this.value)" placeholder="e.g. 13px">
      </div>
      <div style="display:flex; gap:14px; margin-top:4px;">
        <label style="display:flex; align-items:center; gap:5px; font-size:11px; font-weight:600; color:var(--text); cursor:pointer;">
          <input type="checkbox" data-prop="btnBold" ${getThemeVal('btnBold') ? 'checked' : ''} onchange="updateThemeProp('btnBold', this.checked)"> BOLD
        </label>
      </div>
    </div>` : '';
  // Card 7: Instructions Styling
  const instStyleHeader = `
    <div style="display:flex; justify-content:space-between; align-items:center; padding:10px 14px; background:#f8fafc; border:1px solid var(--border); border-radius:8px; cursor:pointer;" onclick="toggleStyleAccordion('instructions')">
      <span style="font-size:12.5px; font-weight:700; color:var(--text);"><i class="bi bi-info-circle"></i> Instructions Page</span>
      <span style="font-size:10px; color:#94a3b8;">${openAcc === 'instructions' ? '▾' : '▸'}</span>
    </div>`;
  const instStyleBody = openAcc === 'instructions' ? `
    <div style="padding:12px; border:1px solid var(--border); border-top:none; border-radius:0 0 8px 8px; display:flex; flex-direction:column; gap:10px; background:#fff;">
      <div>
        <label class="f" style="font-size:11px; text-transform:uppercase; font-weight:600; color:var(--text-muted); display:block; margin-bottom:4px;">Text Color</label>
        <div style="display:flex; gap:6px; align-items:center;">
          <input type="color" data-prop="instColor" style="height:30px; width:45px; padding:2px; border-radius:4px; border:1px solid var(--border); cursor:pointer;" value="${getThemeVal('instColor')}" oninput="updateThemeProp('instColor', this.value)">
          <input type="text" data-prop="instColor" class="form-control form-control-sm" style="font-size:12px; height:30px;" value="${getThemeVal('instColor')}" oninput="updateThemeProp('instColor', this.value)" placeholder="#334155">
        </div>
      </div>
      <div>
        <label class="f" style="font-size:11px; text-transform:uppercase; font-weight:600; color:var(--text-muted); display:block; margin-bottom:4px;">Font Size</label>
        <input type="text" data-prop="instFontSize" class="form-control form-control-sm" value="${getThemeVal('instFontSize')}" oninput="updateThemeProp('instFontSize', this.value)" placeholder="e.g. 14px">
      </div>
      <div>
        <label class="f" style="font-size:11px; text-transform:uppercase; font-weight:600; color:var(--text-muted); display:block; margin-bottom:4px;">Line Height</label>
        <input type="text" data-prop="instLineHeight" class="form-control form-control-sm" value="${getThemeVal('instLineHeight')}" oninput="updateThemeProp('instLineHeight', this.value)" placeholder="e.g. 1.6">
      </div>
    </div>` : '';

  // Card 8: Declaration Styling
  const declStyleHeader = `
    <div style="display:flex; justify-content:space-between; align-items:center; padding:10px 14px; background:#f8fafc; border:1px solid var(--border); border-radius:8px; cursor:pointer;" onclick="toggleStyleAccordion('declaration')">
      <span style="font-size:12.5px; font-weight:700; color:var(--text);"><i class="bi bi-file-earmark-check"></i> Declaration Page</span>
      <span style="font-size:10px; color:#94a3b8;">${openAcc === 'declaration' ? '▾' : '▸'}</span>
    </div>`;
  const declStyleBody = openAcc === 'declaration' ? `
    <div style="padding:12px; border:1px solid var(--border); border-top:none; border-radius:0 0 8px 8px; display:flex; flex-direction:column; gap:10px; background:#fff;">
      <div>
        <label class="f" style="font-size:11px; text-transform:uppercase; font-weight:600; color:var(--text-muted); display:block; margin-bottom:4px;">Text Color</label>
        <div style="display:flex; gap:6px; align-items:center;">
          <input type="color" data-prop="declColor" style="height:30px; width:45px; padding:2px; border-radius:4px; border:1px solid var(--border); cursor:pointer;" value="${getThemeVal('declColor')}" oninput="updateThemeProp('declColor', this.value)">
          <input type="text" data-prop="declColor" class="form-control form-control-sm" style="font-size:12px; height:30px;" value="${getThemeVal('declColor')}" oninput="updateThemeProp('declColor', this.value)" placeholder="#475569">
        </div>
      </div>
      <div>
        <label class="f" style="font-size:11px; text-transform:uppercase; font-weight:600; color:var(--text-muted); display:block; margin-bottom:4px;">Background Color</label>
        <div style="display:flex; gap:6px; align-items:center;">
          <input type="color" data-prop="declBgColor" style="height:30px; width:45px; padding:2px; border-radius:4px; border:1px solid var(--border); cursor:pointer;" value="${getThemeVal('declBgColor')}" oninput="updateThemeProp('declBgColor', this.value)">
          <input type="text" data-prop="declBgColor" class="form-control form-control-sm" style="font-size:12px; height:30px;" value="${getThemeVal('declBgColor')}" oninput="updateThemeProp('declBgColor', this.value)" placeholder="#f8fafc">
        </div>
      </div>
      <div>
        <label class="f" style="font-size:11px; text-transform:uppercase; font-weight:600; color:var(--text-muted); display:block; margin-bottom:4px;">Font Size</label>
        <input type="text" data-prop="declFontSize" class="form-control form-control-sm" value="${getThemeVal('declFontSize')}" oninput="updateThemeProp('declFontSize', this.value)" placeholder="e.g. 12.5px">
      </div>
    </div>` : '';

  // Card 9: Left Sidebar Styling
  const sidebarStyleHeader = `
    <div style="display:flex; justify-content:space-between; align-items:center; padding:10px 14px; background:#f8fafc; border:1px solid var(--border); border-radius:8px; cursor:pointer;" onclick="toggleStyleAccordion('sidebar')">
      <span style="font-size:12.5px; font-weight:700; color:var(--text);"><i class="bi bi-layout-sidebar"></i> Left Sidebar</span>
      <span style="font-size:10px; color:#94a3b8;">${openAcc === 'sidebar' ? '▾' : '▸'}</span>
    </div>`;
  const sidebarStyleBody = openAcc === 'sidebar' ? `
    <div style="padding:12px; border:1px solid var(--border); border-top:none; border-radius:0 0 8px 8px; display:flex; flex-direction:column; gap:10px; background:#fff;">
      <div>
        <label class="f" style="font-size:11px; text-transform:uppercase; font-weight:600; color:var(--text-muted); display:block; margin-bottom:4px;">Sidebar Background</label>
        <div style="display:flex; gap:6px; align-items:center;">
          <input type="color" data-prop="sidebarBgColor" style="height:30px; width:45px; padding:2px; border-radius:4px; border:1px solid var(--border); cursor:pointer;" value="${getThemeVal('sidebarBgColor')}" oninput="updateThemeProp('sidebarBgColor', this.value)">
          <input type="text" data-prop="sidebarBgColor" class="form-control form-control-sm" style="font-size:12px; height:30px;" value="${getThemeVal('sidebarBgColor')}" oninput="updateThemeProp('sidebarBgColor', this.value)" placeholder="#f8fafc">
        </div>
      </div>
      <div>
        <label class="f" style="font-size:11px; text-transform:uppercase; font-weight:600; color:var(--text-muted); display:block; margin-bottom:4px;">Step Text Color</label>
        <div style="display:flex; gap:6px; align-items:center;">
          <input type="color" data-prop="sidebarTextColor" style="height:30px; width:45px; padding:2px; border-radius:4px; border:1px solid var(--border); cursor:pointer;" value="${getThemeVal('sidebarTextColor')}" oninput="updateThemeProp('sidebarTextColor', this.value)">
          <input type="text" data-prop="sidebarTextColor" class="form-control form-control-sm" style="font-size:12px; height:30px;" value="${getThemeVal('sidebarTextColor')}" oninput="updateThemeProp('sidebarTextColor', this.value)" placeholder="#64748b">
        </div>
      </div>
      <div>
        <label class="f" style="font-size:11px; text-transform:uppercase; font-weight:600; color:var(--text-muted); display:block; margin-bottom:4px;">Active/Done Accent Color</label>
        <div style="display:flex; gap:6px; align-items:center;">
          <input type="color" data-prop="sidebarActiveColor" style="height:30px; width:45px; padding:2px; border-radius:4px; border:1px solid var(--border); cursor:pointer;" value="${getThemeVal('sidebarActiveColor')}" oninput="updateThemeProp('sidebarActiveColor', this.value)">
          <input type="text" data-prop="sidebarActiveColor" class="form-control form-control-sm" style="font-size:12px; height:30px;" value="${getThemeVal('sidebarActiveColor')}" oninput="updateThemeProp('sidebarActiveColor', this.value)" placeholder="#00aa6d">
        </div>
      </div>
      <div>
        <label class="f" style="font-size:11px; text-transform:uppercase; font-weight:600; color:var(--text-muted); display:block; margin-bottom:4px;">Divider Border Color</label>
        <div style="display:flex; gap:6px; align-items:center;">
          <input type="color" data-prop="sidebarBorderColor" style="height:30px; width:45px; padding:2px; border-radius:4px; border:1px solid var(--border); cursor:pointer;" value="${getThemeVal('sidebarBorderColor')}" oninput="updateThemeProp('sidebarBorderColor', this.value)">
          <input type="text" data-prop="sidebarBorderColor" class="form-control form-control-sm" style="font-size:12px; height:30px;" value="${getThemeVal('sidebarBorderColor')}" oninput="updateThemeProp('sidebarBorderColor', this.value)" placeholder="#e2e8f0">
        </div>
      </div>
    </div>` : '';

  const headerHtml = state.previewOnly ? '' : `
  <div class="topline">Step 4</div>
  <h1>Customize Portal &amp; Preview</h1>
  <div class="desc">Define applicant portal properties, customize fonts &amp; colors, and test the live application flow.</div>`;

  const settingsPanelHtml = state.previewOnly ? '' : `
    <!-- Portal Settings & Style Panel -->
    <div style="width:320px; flex-shrink:0; display:flex; flex-direction:column; gap:12px; border-right:1px solid var(--border); padding-right:20px; max-height:640px; overflow-y:auto;">
      <h3 style="margin:0 0 4px 0; font-size:14px; font-weight:700; color:var(--text); text-transform:uppercase; letter-spacing:.03em;">Portal &amp; Theme Style</h3>
      
      <div style="margin-bottom:2px;">
        ${portalHeader}
        ${portalBody}
      </div>
      <div style="margin-bottom:2px;">
        ${themeHeader}
        ${themeBody}
      </div>
      <div style="margin-bottom:2px;">
        ${headerStyleHeader}
        ${headerStyleBody}
      </div>
      <div style="margin-bottom:2px;">
        ${groupStyleHeader}
        ${groupStyleBody}
      </div>
      <div style="margin-bottom:2px;">
        ${fieldStyleHeader}
        ${fieldStyleBody}
      </div>
      <div style="margin-bottom:2px;">
        ${buttonStyleHeader}
        ${buttonStyleBody}
      </div>
      <div style="margin-bottom:2px;">
        ${instStyleHeader}
        ${instStyleBody}
      </div>
      <div style="margin-bottom:2px;">
        ${declStyleHeader}
        ${declStyleBody}
      </div>
      <div style="margin-bottom:2px;">
        ${sidebarStyleHeader}
        ${sidebarStyleBody}
      </div>
    </div>`;

  const simHeaderHtml = state.previewOnly ? '' : `
      <h3 style="margin:0; font-size:14px; font-weight:700; color:var(--text); text-transform:uppercase; letter-spacing:.03em;">Applicant Flow Simulator</h3>`;

  const simContainerWrapperStyle = state.previewOnly
    ? 'flex:1; display:flex; flex-direction:column; gap:12px; max-width:850px; margin:0 auto; width: 100%;'
    : 'flex:1; display:flex; flex-direction:column; gap:12px;';

  const footerHtml = state.previewOnly ? `
  <div class="footer-nav" style="margin-top:24px; border-top:1px solid var(--border); padding-top:16px; display:flex; justify-content:flex-end;">
    <button class="btn btn-secondary" onclick="closeEditor()">Close Preview</button>
  </div>` : `
  <div class="footer-nav" style="margin-top:24px; border-top:1px solid var(--border); padding-top:16px;">
    <button class="btn ghost" onclick="goScreen('${state.formType==='stepper'?'builder':'notif'}')">← Back</button>
    <button class="btn" onclick="publishForm()">✅ Publish form</button>
  </div>`;

  if (state.previewOnly) {
    let containerBgStyle = '';
    const pageBgColor = getThemeVal('pageBgColor');
    const pageBgGradient = getThemeVal('pageBgGradient');
    if (pageBgGradient !== 'none') {
      containerBgStyle = `background: ${GRADIENTS[pageBgGradient]};`;
    } else {
      containerBgStyle = `background-color: ${pageBgColor};`;
    }

    return `
    <div style="height: 100vh; width: 100vw; display: flex; flex-direction: column; overflow: hidden; margin: 0; padding: 0; background: #f8fafc;">
      
      <!-- Top header bar for exiting preview -->
      <div class="d-flex justify-content-between align-items-center px-4 py-3 border-bottom bg-white" style="position: sticky; top: 0; z-index: 10; flex-shrink: 0; display: flex !important;">
        <div class="text-secondary small fw-medium" style="font-size: 14px; font-weight: 600; color: #475569;">Form Preview Mode</div>
        <button class="btn btn-sm btn-outline-secondary" style="font-size: 12.5px; padding: 4px 10px;" onclick="closeEditor()">← Back to List</button>
      </div>

      <!-- Live Simulator wrapper with padding -->
      <div style="flex: 1; padding: 24px; box-sizing: border-box; display: flex; justify-content: center; align-items: center; overflow: hidden;">
        <div class="sim-container" style="display: flex; flex: 1; height: 100%; border: 1px solid var(--border); border-radius: 12px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); overflow: hidden; ${containerBgStyle}">
          <!-- Simulator Left Steps Sidebar -->
          <div class="sim-sidebar" style="${getSidebarStyles()}; height: 100%;">
            ${simSteps.map((s, idx) => {
              const isActive = idx === state.simActiveIdx;
              const isDone = idx < state.simActiveIdx;
              const cls = isActive ? 'active' : (isDone ? 'done' : '');
              return `
                <div class="sim-step-item ${cls}" style="${getSidebarStepItemStyles(isActive, isDone)}" onclick="state.simActiveIdx=${idx}; render();">
                  <span class="sim-dot" style="${getSidebarDotStyles(isActive, isDone)}">${isDone?'✓':idx+1}</span>
                  <span>${esc(s.label)}</span>
                </div>
              `;
            }).join('')}
          </div>
          
          <!-- Simulator Right Content Panel -->
          <div class="sim-content" style="${getSimContentStyles()}; flex: 1; height: 100%; display: flex; flex-direction: column; overflow-y: auto;">
            <div class="sim-header" style="text-align: center; margin-bottom: 20px;">
              <h2 class="sim-title" style="${getTitleStyles()}">${esc(state.headerName || 'EduNext Form Portal')}</h2>
              <div class="sim-tagline" style="${getTaglineStyles()}">${esc(state.tagline || 'Admission Registration Form')}</div>
            </div>
            ${simContentHtml}
          </div>
        </div>
      </div>
    </div>`;
  }

  return `
  ${headerHtml}

  <div style="display:flex; gap:24px; margin-top:20px; align-items:stretch;">
    ${settingsPanelHtml}

    <!-- Applicant View Live Simulator -->
    <div style="${simContainerWrapperStyle}">
      ${simHeaderHtml}
      
      <div class="sim-container" style="${getSimContainerStyles()}">
        <!-- Simulator Left Steps Sidebar -->
        <div class="sim-sidebar" style="${getSidebarStyles()}">
          ${simSteps.map((s, idx) => {
            const isActive = idx === state.simActiveIdx;
            const isDone = idx < state.simActiveIdx;
            const cls = isActive ? 'active' : (isDone ? 'done' : '');
            return `
              <div class="sim-step-item ${cls}" style="${getSidebarStepItemStyles(isActive, isDone)}" onclick="state.simActiveIdx=${idx}; render();">
                <span class="sim-dot" style="${getSidebarDotStyles(isActive, isDone)}">${isDone?'✓':idx+1}</span>
                <span>${esc(s.label)}</span>
              </div>
            `;
          }).join('')}
        </div>
        
        <!-- Simulator Right Content Panel -->
        <div class="sim-content" style="${getSimContentStyles()}">
          <div class="sim-header">
            <h2 class="sim-title" style="${getTitleStyles()}">${esc(state.headerName || 'EduNext Form Portal')}</h2>
            <div class="sim-tagline" style="${getTaglineStyles()}">${esc(state.tagline || 'Admission Registration Form')}</div>
          </div>
          ${simContentHtml}
        </div>
      </div>
    </div>
  </div>

  ${footerHtml}`;
}

function nextSimStep(){
  if (state.simActiveIdx < 1) {
    state.simActiveIdx = 1;
    render();
  }
}

function prevSimStep(){
  if (state.simActiveIdx > 0) {
    state.simActiveIdx = 0;
    render();
  }
}

function toggleSimSubmitBtn(checked) {
  const btn = document.getElementById('simSubmitBtn');
  if (btn) btn.disabled = !checked;
}

const DEFAULT_THEME = {
  fontFamily: 'Default',
  cardBgColor: '#ffffff',
  cardBorderRadius: '12px',
  cardShadow: 'medium',
  width: '100%',
  pageBgColor: '#f1f5f9',
  pageBgGradient: 'none',
  containerPadding: '24px',
  fieldSpacing: 'normal',
  
  headerColor: '#1e293b',
  headerFontSize: '22px',
  headerAlign: 'center',
  headerBold: true,
  headerItalic: false,
  
  taglineColor: '#64748b',
  taglineFontSize: '14px',
  taglineAlign: 'center',
  
  groupNameColor: '#475569',
  groupNameBgColor: 'transparent',
  groupNameFontSize: '12px',
  groupNameAlign: 'left',
  groupNameBold: true,
  groupNameItalic: false,
  
  fieldLabelColor: '#334155',
  fieldLabelFontSize: '13px',
  fieldLabelBold: true,
  fieldLabelItalic: false,
  
  btnBgColor: '#00aa6d',
  btnTextColor: '#ffffff',
  btnBorderRadius: '6px',
  btnFontSize: '13px',
  btnBold: true,

  instColor: '#334155',
  instFontSize: '14px',
  instLineHeight: '1.6',
  
  declColor: '#475569',
  declFontSize: '12.5px',
  declBgColor: '#f8fafc',
  
  sidebarBgColor: '#f8fafc',
  sidebarTextColor: '#64748b',
  sidebarActiveColor: '#00aa6d',
  sidebarBorderColor: '#e2e8f0'
};

const GRADIENTS = {
  none: '',
  cool: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
  sunset: 'linear-gradient(135deg, #fffaf0 0%, #ffe4e6 100%)',
  emerald: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
  cosmic: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)',
  ocean: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)'
};

function getThemeVal(prop) {
  if (!state.theme) state.theme = {};
  if (state.theme[prop] !== undefined) return state.theme[prop];
  return DEFAULT_THEME[prop];
}

window.updateHeaderName = function(val) {
  state.headerName = val;
  const simTitle = document.querySelector('.sim-title');
  if (simTitle) {
    simTitle.textContent = val || 'EduNext Form Portal';
  }
};

window.updateTagline = function(val) {
  state.tagline = val;
  const simTagline = document.querySelector('.sim-tagline');
  if (simTagline) {
    simTagline.textContent = val || 'Admission Registration Form';
  }
};

window.updateInstructions = function(val) {
  state.instructions = val;
  const simInstructionsText = document.querySelector('.sim-content p');
  if (simInstructionsText && state.simActiveIdx === 0 && state.instructions) {
    simInstructionsText.textContent = val;
  }
};

function updateThemeProp(prop, val) {
  if (!state.theme) state.theme = {};
  state.theme[prop] = val;
  
  if (prop === 'fontFamily') {
    const linkId = "google-font-link-preview";
    let link = document.getElementById(linkId);
    if (!link) {
      link = document.createElement("link");
      link.id = linkId;
      link.rel = "stylesheet";
      document.head.appendChild(link);
    }
    if (val && val !== 'Default') {
      link.href = `https://fonts.googleapis.com/css2?family=${val.replace(/\s+/g, '+')}:wght@400;500;600;700&display=swap`;
    } else {
      link.href = "";
    }
    const simContent = document.querySelector('.sim-content');
    if (simContent) simContent.style.fontFamily = val !== 'Default' ? `'${val}', sans-serif` : 'inherit';
  }
  
  if (prop === 'pageBgColor' || prop === 'pageBgGradient') {
    const simContainer = document.querySelector('.sim-container');
    if (simContainer) {
      const grad = getThemeVal('pageBgGradient');
      if (grad !== 'none') {
        simContainer.style.background = GRADIENTS[grad];
      } else {
        simContainer.style.background = '';
        simContainer.style.backgroundColor = getThemeVal('pageBgColor');
      }
    }
  }

  if (prop === 'containerPadding') {
    const simContent = document.querySelector('.sim-content');
    if (simContent) simContent.style.padding = val;
  }
  
  if (prop === 'fieldSpacing') {
    const simContent = document.querySelector('.sim-content');
    if (simContent) {
      let spacing = '18px';
      if (val === 'tight') spacing = '10px';
      else if (val === 'cozy') spacing = '14px';
      else if (val === 'spacious') spacing = '24px';
      
      const fields = simContent.querySelectorAll('.pf-field');
      fields.forEach(f => {
        if (f.parentNode) f.parentNode.style.marginBottom = spacing;
      });
    }
  }
  
  if (prop === 'cardBgColor') {
    const simContent = document.querySelector('.sim-content');
    if (simContent) simContent.style.backgroundColor = val;
  }
  if (prop === 'cardBorderRadius') {
    const simContent = document.querySelector('.sim-content');
    if (simContent) simContent.style.borderRadius = val;
  }
  if (prop === 'cardShadow') {
    const simContent = document.querySelector('.sim-content');
    if (simContent) {
      let shadow = 'none';
      if (val === 'small') shadow = '0 1px 3px rgba(0,0,0,0.1)';
      else if (val === 'medium') shadow = '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)';
      else if (val === 'large') shadow = '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)';
      simContent.style.boxShadow = shadow;
    }
  }
  
  if (prop === 'headerColor') {
    const simTitle = document.querySelector('.sim-title');
    if (simTitle) simTitle.style.color = val;
  }
  if (prop === 'headerFontSize') {
    const simTitle = document.querySelector('.sim-title');
    if (simTitle) simTitle.style.fontSize = val;
  }
  if (prop === 'headerAlign') {
    const simTitle = document.querySelector('.sim-title');
    if (simTitle) simTitle.style.textAlign = val;
  }
  if (prop === 'headerBold') {
    const simTitle = document.querySelector('.sim-title');
    if (simTitle) simTitle.style.fontWeight = val ? 'bold' : 'normal';
  }
  if (prop === 'headerItalic') {
    const simTitle = document.querySelector('.sim-title');
    if (simTitle) simTitle.style.fontStyle = val ? 'italic' : 'normal';
  }
  
  if (prop === 'taglineColor') {
    const simTagline = document.querySelector('.sim-tagline');
    if (simTagline) simTagline.style.color = val;
  }
  if (prop === 'taglineFontSize') {
    const simTagline = document.querySelector('.sim-tagline');
    if (simTagline) simTagline.style.fontSize = val;
  }
  if (prop === 'taglineAlign') {
    const simTagline = document.querySelector('.sim-tagline');
    if (simTagline) simTagline.style.textAlign = val;
  }
  
  if (prop === 'groupNameColor' || prop === 'groupNameBgColor' || prop === 'groupNameFontSize' || prop === 'groupNameAlign' || prop === 'groupNameBold' || prop === 'groupNameItalic') {
    const headers = document.querySelectorAll('.sim-content [style*="padding: 6px 10px;"]');
    headers.forEach(h => {
      if (prop === 'groupNameColor') h.style.color = val;
      if (prop === 'groupNameBgColor') h.style.backgroundColor = val;
      if (prop === 'groupNameFontSize') h.style.fontSize = val;
      if (prop === 'groupNameAlign') h.style.textAlign = val;
      if (prop === 'groupNameBold') h.style.fontWeight = val ? 'bold' : 'normal';
      if (prop === 'groupNameItalic') h.style.fontStyle = val ? 'italic' : 'normal';
    });
  }
  
  if (prop === 'fieldLabelColor' || prop === 'fieldLabelFontSize' || prop === 'fieldLabelBold' || prop === 'fieldLabelItalic') {
    const labels = document.querySelectorAll('.sim-content .pf-field label');
    labels.forEach(l => {
      if (prop === 'fieldLabelColor') l.style.color = val;
      if (prop === 'fieldLabelFontSize') l.style.fontSize = val;
      if (prop === 'fieldLabelBold') l.style.fontWeight = val ? 'bold' : 'normal';
      if (prop === 'fieldLabelItalic') l.style.fontStyle = val ? 'italic' : 'normal';
    });
  }
  
  if (prop === 'btnBgColor' || prop === 'btnTextColor' || prop === 'btnBorderRadius' || prop === 'btnFontSize' || prop === 'btnBold') {
    const buttons = document.querySelectorAll('.sim-content button.btn:not(.ghost)');
    buttons.forEach(b => {
      if (prop === 'btnBgColor') b.style.backgroundColor = val;
      if (prop === 'btnTextColor') b.style.color = val;
      if (prop === 'btnBorderRadius') b.style.borderRadius = val;
      if (prop === 'btnFontSize') b.style.fontSize = val;
      if (prop === 'btnBold') b.style.fontWeight = val ? 'bold' : 'normal';
    });
  }

  if (prop === 'declBgColor') {
    const simDeclBox = document.querySelector('.sim-decl-box');
    if (simDeclBox) simDeclBox.style.backgroundColor = val;
  }
  if (prop === 'declColor') {
    const simDeclBox = document.querySelector('.sim-decl-box');
    if (simDeclBox) {
      simDeclBox.style.color = val;
      const sub = simDeclBox.querySelectorAll('label, span, div');
      sub.forEach(el => el.style.color = val);
    }
  }
  if (prop === 'declFontSize') {
    const simDeclBox = document.querySelector('.sim-decl-box');
    if (simDeclBox) {
      simDeclBox.style.fontSize = val;
      const sub = simDeclBox.querySelectorAll('label, span, div');
      sub.forEach(el => el.style.fontSize = val);
    }
  }
  if (prop === 'instColor') {
    const simInstText = document.querySelector('.sim-inst-text');
    if (simInstText) simInstText.style.color = val;
  }
  if (prop === 'instFontSize') {
    const simInstText = document.querySelector('.sim-inst-text');
    if (simInstText) simInstText.style.fontSize = val;
  }
  if (prop === 'instLineHeight') {
    const simInstText = document.querySelector('.sim-inst-text');
    if (simInstText) simInstText.style.lineHeight = val;
  }

  const syncInputs = document.querySelectorAll(`[data-prop="${prop}"]`);
  syncInputs.forEach(i => {
    if (i !== document.activeElement) {
      if (i.type === 'checkbox') i.checked = val;
      else i.value = val;
    }
  });
}

function toggleStyleAccordion(id) {
  state.openStyleAccordion = state.openStyleAccordion === id ? null : id;
  render();
}

function getSimContentStyles() {
  let styles = '';
  const fontFamily = getThemeVal('fontFamily');
  if (fontFamily && fontFamily !== 'Default') {
    styles += `font-family: '${fontFamily}', sans-serif; `;
  }
  const cardBgColor = getThemeVal('cardBgColor');
  if (cardBgColor) {
    styles += `background-color: ${cardBgColor}; `;
  }
  const cardBorderRadius = getThemeVal('cardBorderRadius');
  if (cardBorderRadius) {
    styles += `border-radius: ${cardBorderRadius}; `;
  }
  const cardShadow = getThemeVal('cardShadow');
  if (cardShadow) {
    let shadow = 'none';
    if (cardShadow === 'small') shadow = '0 1px 3px rgba(0,0,0,0.1)';
    else if (cardShadow === 'medium') shadow = '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)';
    else if (cardShadow === 'large') shadow = '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)';
    styles += `box-shadow: ${shadow}; `;
  }
  const containerPadding = getThemeVal('containerPadding');
  if (containerPadding) {
    styles += `padding: ${containerPadding}; `;
  }
  return styles;
}

function getSimContainerStyles() {
  let styles = 'display: flex; height: 640px; border: 1px solid var(--border); border-radius: 8px; overflow: hidden; ';
  const pageBgColor = getThemeVal('pageBgColor');
  const pageBgGradient = getThemeVal('pageBgGradient');
  if (pageBgGradient !== 'none') {
    styles += `background: ${GRADIENTS[pageBgGradient]}; `;
  } else {
    styles += `background-color: ${pageBgColor}; `;
  }
  return styles;
}

function getSidebarStyles() {
  const bg = getThemeVal('sidebarBgColor');
  const border = getThemeVal('sidebarBorderColor');
  return `width: 180px; background-color: ${bg}; border-right: 1px solid ${border}; padding: 16px 10px; display: flex; flex-direction: column; gap: 8px; flex-shrink: 0;`;
}

function getSidebarStepItemStyles(isActive, isDone) {
  const activeColor = getThemeVal('sidebarActiveColor');
  const textColor = getThemeVal('sidebarTextColor');
  let styles = `display: flex; align-items: center; gap: 8px; padding: 8px 10px; border-radius: 6px; font-size: 12px; font-weight: 500; cursor: pointer; transition: all 0.2s; `;
  if (isActive) {
    styles += `background-color: ${activeColor}15; color: ${activeColor}; font-weight: 600;`;
  } else {
    styles += `color: ${textColor};`;
  }
  return styles;
}

function getSidebarDotStyles(isActive, isDone) {
  const activeColor = getThemeVal('sidebarActiveColor');
  let bg = '#cbd5e1';
  let color = '#ffffff';
  if (isActive || isDone) {
    bg = activeColor;
    color = '#ffffff';
  }
  return `width: 16px; height: 16px; border-radius: 50%; background: ${bg}; color: ${color}; display: inline-flex; align-items: center; justify-content: center; font-size: 9px; font-weight: 700; flex-shrink: 0;`;
}

function getTitleStyles() {
  let styles = 'margin: 0; ';
  const headerColor = getThemeVal('headerColor');
  if (headerColor) styles += `color: ${headerColor}; `;
  const headerFontSize = getThemeVal('headerFontSize');
  if (headerFontSize) styles += `font-size: ${headerFontSize}; `;
  const headerAlign = getThemeVal('headerAlign');
  if (headerAlign) styles += `text-align: ${headerAlign}; `;
  styles += `font-weight: ${getThemeVal('headerBold') ? 'bold' : 'normal'}; `;
  styles += `font-style: ${getThemeVal('headerItalic') ? 'italic' : 'normal'}; `;
  return styles;
}

function getTaglineStyles() {
  let styles = 'margin-top: 4px; ';
  const taglineColor = getThemeVal('taglineColor');
  if (taglineColor) styles += `color: ${taglineColor}; `;
  const taglineFontSize = getThemeVal('taglineFontSize');
  if (taglineFontSize) styles += `font-size: ${taglineFontSize}; `;
  const taglineAlign = getThemeVal('taglineAlign');
  if (taglineAlign) styles += `text-align: ${taglineAlign}; `;
  return styles;
}

function getGroupHeaderStyles() {
  let styles = 'padding: 6px 10px; margin-bottom: 8px; border-radius: 4px; ';
  const groupNameColor = getThemeVal('groupNameColor');
  if (groupNameColor) styles += `color: ${groupNameColor}; `;
  const groupNameFontSize = getThemeVal('groupNameFontSize');
  if (groupNameFontSize) styles += `font-size: ${groupNameFontSize}; `;
  const groupNameAlign = getThemeVal('groupNameAlign');
  if (groupNameAlign) styles += `text-align: ${groupNameAlign}; `;
  styles += `font-weight: ${getThemeVal('groupNameBold') ? 'bold' : 'normal'}; `;
  styles += `font-style: ${getThemeVal('groupNameItalic') ? 'italic' : 'normal'}; `;
  const groupNameBgColor = getThemeVal('groupNameBgColor');
  if (groupNameBgColor) styles += `background-color: ${groupNameBgColor}; `;
  return styles;
}

function getFieldLabelStyles() {
  let styles = 'display: block; margin-bottom: 4px; ';
  const fieldLabelColor = getThemeVal('fieldLabelColor');
  if (fieldLabelColor) styles += `color: ${fieldLabelColor}; `;
  const fieldLabelFontSize = getThemeVal('fieldLabelFontSize');
  if (fieldLabelFontSize) styles += `font-size: ${fieldLabelFontSize}; `;
  styles += `font-weight: ${getThemeVal('fieldLabelBold') ? 'bold' : 'normal'}; `;
  styles += `font-style: ${getThemeVal('fieldLabelItalic') ? 'italic' : 'normal'}; `;
  return styles;
}

function getBtnStyles() {
  let styles = 'border: none; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; ';
  const btnBgColor = getThemeVal('btnBgColor');
  if (btnBgColor) styles += `background-color: ${btnBgColor}; `;
  const btnTextColor = getThemeVal('btnTextColor');
  if (btnTextColor) styles += `color: ${btnTextColor}; `;
  const btnBorderRadius = getThemeVal('btnBorderRadius');
  if (btnBorderRadius) styles += `border-radius: ${btnBorderRadius}; `;
  const btnFontSize = getThemeVal('btnFontSize');
  if (btnFontSize) styles += `font-size: ${btnFontSize}; `;
  styles += `font-weight: ${getThemeVal('btnBold') ? 'bold' : 'normal'}; `;
  return styles;
}

function previewField(f){
  let input = '';
  if(f.type==='textarea') input = `<textarea rows="2" style="width:100%;" autocomplete="off"></textarea>`;
  else if(f.type==='select') input = `<select style="width:100%;" autocomplete="off"><option>-- select --</option>${(f.options||'').split(',').filter(Boolean).map(o=>`<option>${esc(o.trim())}</option>`).join('')}</select>`;
  else if(f.type==='multiselect') input = `<div style="display:flex; flex-wrap:wrap; gap:6px 14px; border:1px solid var(--border); border-radius:8px; padding:10px 12px;">${(f.options||'').split(',').filter(Boolean).map(o=>`<label style="display:flex; align-items:center; gap:5px; font-size:12.5px; color:#5a636b; cursor:pointer;"><input type="checkbox">${esc(o.trim())}</label>`).join('')}</div>`;
  else if(f.type==='radio') input = `<select style="width:100%;" autocomplete="off"><option>Yes</option><option>No</option></select>`;
  else if(f.type==='file') input = `<input type="file" style="width:100%;">`;
  else if(f.type==='date') input = `<input type="date" style="width:100%;" autocomplete="off">`;
  else if(f.type==='number') input = `<input type="number" style="width:100%;" placeholder="Type here" autocomplete="off">`;
  else if(f.type==='email') input = `<input type="email" style="width:100%;" placeholder="name@example.com" autocomplete="off">`;
  else if(f.type==='phone') input = `<input type="tel" style="width:100%;" placeholder="Type here" autocomplete="off">`;
  else input = `<input type="text" style="width:100%;" placeholder="Type here" autocomplete="off">`;
  const condNote = f.conditional && f.conditional.fieldId ? `<div style="font-size:11px;color:#aa9c4a;margin-top:4px;">Shown only if another answer ${
    f.conditional.operator==='between' ? `is between "${esc(f.conditional.value)}" and "${esc(f.conditional.value2||'')}"`
    : f.conditional.operator==='not_equals' ? `≠ "${esc(f.conditional.value)}"`
    : f.conditional.operator==='greater_than' ? `&gt; "${esc(f.conditional.value)}"`
    : f.conditional.operator==='less_than' ? `&lt; "${esc(f.conditional.value)}"`
    : `= "${esc(f.conditional.value)}"`
  }</div>` : '';
  return `<div class="pf-field ${f.type==='multiselect'?'full-w':''}"><label style="${getFieldLabelStyles()}">${esc(f.label)} ${f.mandatory?'<span class="req">*</span>':''}</label>${input}${condNote}</div>`;
}

function updateDeclarationPointText(id, val) {
  const p = state.declarationPoints.find(x => x.id === id);
  if (p) {
    p.text = val;
    state.declarationText = state.declarationPoints.map(x => x.text).join('\n');
  }
}

function toggleDeclarationPointCheckbox(id, checked) {
  const p = state.declarationPoints.find(x => x.id === id);
  if (p) {
    p.requiredCheckbox = checked;
    render();
  }
}

function removeDeclarationPoint(id) {
  state.declarationPoints = state.declarationPoints.filter(x => x.id !== id);
  state.declarationText = state.declarationPoints.map(x => x.text).join('\n');
  render();
}

function addDeclarationPoint() {
  state.declarationPoints.push({
    id: uid(),
    text: "",
    requiredCheckbox: true
  });
  render();
}

function validateSimDeclarationCheckboxes() {
  const checkboxes = document.querySelectorAll('.sim-required-checkbox');
  const allChecked = Array.from(checkboxes).every(cb => cb.checked);
  const submitBtn = document.getElementById('simSubmitBtn');
  if (submitBtn) {
    submitBtn.disabled = !allChecked;
  }
}

function toggleJson(){
  const box = document.getElementById('jsonBox');
  if(box.style.display==='none'){
    box.style.display='block';
    const exportable = {formTitle:state.formTitle, formType:state.formType, formCategory:state.formCategory, formColumns:state.formColumns, steps:state.steps};
    box.textContent = JSON.stringify(exportable, null, 2);
  } else { box.style.display='none'; }
}

function publishForm(){
  cleanAndSortSteps();
  if (typeof onSave === 'function') {
    onSave({
      _id: state._id,
      isActive: state.isActive,
      createdAt: state.createdAt,
      updatedAt: new Date().toISOString(),
      formTitle: state.formTitle,
      formType: state.formType,
      formCategory: state.formCategory,
      formColumns: state.formColumns,
      steps: state.steps,
      headerName: state.headerName,
      tagline: state.tagline,
      instructions: state.instructions,
      declarationText: state.declarationText,
      declarationPoints: state.declarationPoints,
      theme: state.theme
    });
  } else {
    alert('Form "'+state.formTitle+'" published! (This is a demo UI — connect it to EduNext backend to go live.)');
  }
}

function closeEditor(){
  if (typeof onCancel === 'function') {
    onCancel();
  }
}

/* ---------- utils ---------- */
function esc(s){ return (s||'').replace(/[&<>"]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }
function escJs(s){ return (s||'').replace(/\\/g,'\\\\').replace(/'/g,"\\'"); }

    // `state` is only ever mutated in place after this point (its properties change,
    // but the object reference itself is never reassigned) — safe to expose once.
    window.state = state;

    Object.assign(window, {
  toggleStyleAccordion,
  updateThemeProp,
  getThemeVal,
  getSimContainerStyles,
  getSimContentStyles,
  getSidebarStyles,
  getSidebarStepItemStyles,
  getSidebarDotStyles,
  getTitleStyles,
  getTaglineStyles,
  getGroupHeaderStyles,
  getFieldLabelStyles,
  getBtnStyles,
  updateDeclarationPointText,
  toggleDeclarationPointCheckbox,
  removeDeclarationPoint,
  addDeclarationPoint,
  validateSimDeclarationCheckboxes,
  closeEditor,
  addApprovalStep,
  addCustomField,
  addCustomGroup,
  addGroup,
  addSetupGroup,
  addStep,
  builderGoBack,
  builderSaveNext,
  defaultSinglePageStep,
  defaultStepperSteps,
  deleteField,
  esc,
  escJs,
  fieldRow,
  fieldUsedInOtherGroup,
  findField,
  findGroup,
  findStepForGroup,
  getGroupCat,
  goScreen,
  matchLibraryCategory,
  mkApprovalGroup,
  mkField,
  mkGroup,
  mkStep,
  moveGroup,
  moveStep,
  pickType,
  pickCategory,
  nextSimStep,
  prevSimStep,
  previewField,
  toggleSimSubmitBtn,
  publishForm,
  purgeField,
  refreshContinueBtn,
  removeCond,
  removeGroup,
  removeSetupGroup,
  removeStep,
  renameField,
  renameGroup,
  renameStep,
  render,
  renderApprovalGroupCard,
  renderCondPanel,
  renderCustomFieldForm,
  renderGroupAccordion,
  renderMain,
  renderSidebar,
  reorderGroupInStep,
  reorderGroupToPosition,
  reorderStepToPosition,
  screenBuilder,
  screenNotif,
  screenPreview,
  screenSetup,
  setCondField,
  setCondOperator,
  setCondValue,
  setCondValue2,
  setGroupApprovalEmployee,
  setGroupApprovalType,
  setGroupCat,
  setGroupSearch,
  setNotif,
  setStepApprovalAuthority,
  setStepApprovalEmployee,
  setStepApprovalType,
  setStepNotif,
  setupGroupsSection,
  setupStepsSection,
  sidebarSteps,
  toggleAccordion,
  toggleCfOptions,
  toggleCommPanel,
  toggleCustomFieldForm,
  toggleFieldPanel,
  toggleGroupApprovalAfter,
  toggleJson,
  toggleLibField,
  toggleMandatory,
  toggleSelectAllGroup,
  toggleSetupGroup,
  toggleStepApproval,
  toggleStepFlag,
  toggleStepSettings,
  uid
});

    render();
  }, []);

  return (
    <div className={`rfb-scope ${startScreen === 'preview_only' ? 'preview-only-mode' : ''}`}>
      <style>{SCOPED_CSS}</style>
      {startScreen === 'preview_only' && (
        <style>{`
          .rfb-scope.preview-only-mode .app { min-height: 100vh !important; height: 100vh !important; }
          .rfb-scope.preview-only-mode .main { padding: 0 !important; margin: 0 !important; height: 100vh !important; width: 100vw !important; overflow: hidden !important; }
        `}</style>
      )}
      <div className="app">
        <div className="side" ref={sidebarRef} style={{ display: "none" }}></div>
        <div className="main" ref={mainRef}></div>
      </div>
    </div>
  );
}
