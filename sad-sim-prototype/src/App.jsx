import { useState, useReducer, useEffect, useCallback, useRef } from "react";

// ─── STYLES ───────────────────────────────────────────────────────────────────
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg:    #1a1c1e;
    --bg2:   #111315;
    --bg3:   #0d0e10;
    --bord:  #3a4a54;
    --bord2: #2a3840;
    --txt:   #c8d8e0;
    --txt2:  #8090a0;
    --blue:  #4a9fc8;
    --green: #3a9e5a;
    --red:   #c83030;
    --amber: #c88030;
    --font:  'Share Tech Mono', monospace;
  }

  .gcs-root {
    width: 800px; height: 480px;
    background: var(--bg3); color: var(--txt);
    font-family: var(--font); font-size: 12px;
    border: 2px solid var(--bord);
    position: relative; overflow: hidden;
    display: flex; flex-direction: column;
    user-select: none;
  }

  /* ── SHARED ── */
  .col-hdr {
    font-size: 10px; letter-spacing: 3px; color: var(--txt2);
    padding: 5px 10px; border-bottom: 1px solid var(--bord2);
    text-align: center; flex-shrink: 0;
  }
  .col-hdr-row {
    font-size: 10px; letter-spacing: 3px; color: var(--txt2);
    padding: 4px 8px 4px 10px; border-bottom: 1px solid var(--bord2);
    display: flex; align-items: center; justify-content: space-between; flex-shrink: 0;
  }
  .list-area { flex: 1; overflow-y: auto; background: var(--bg3); }
  .list-area::-webkit-scrollbar { width: 4px; }
  .list-area::-webkit-scrollbar-track { background: var(--bg3); }
  .list-area::-webkit-scrollbar-thumb { background: var(--bord); }

  .entry {
    border-bottom: 1px solid var(--bord2); padding: 6px 10px;
    display: flex; align-items: center; gap: 8px; cursor: pointer;
  }
  .entry:hover { background: #1e2428; }
  .entry.sel { background: #1a2830; border-left: 2px solid var(--blue); }
  .entry-id  { font-size: 11px; letter-spacing: 1px; color: var(--txt); flex: 1; }
  .entry-sub { font-size: 9px;  letter-spacing: 1px; color: var(--txt2); }

  .dot   { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; display: inline-block; }
  .dot-g { background: var(--green); }
  .dot-r { background: var(--red); }
  .dot-a { background: var(--amber); }
  .dot-x { background: var(--txt2); }
  .dot-d { background: #2a2a2a; border: 1px solid #3a3a3a; }

  .bdg   { font-size: 8px; padding: 2px 5px; letter-spacing: 1px; border: 1px solid; }
  .bdg-p { color: var(--green); border-color: #1a4028; }
  .bdg-u { color: var(--amber); border-color: #3a2810; }
  .bdg-d { color: #404040; border-color: #2a2a2a; }

  .empty-msg { padding: 12px; font-size: 9px; letter-spacing: 2px; color: var(--txt2); }

  /* ── BUTTONS ── */
  .text-btn {
    height: 52px; background: var(--bg); border: 1px solid var(--bord);
    color: var(--txt); font-family: var(--font); font-size: 11px;
    letter-spacing: 3px; cursor: pointer; white-space: nowrap; padding: 0 18px;
    transition: border-color .12s, color .12s;
  }
  .text-btn:hover { border-color: var(--blue); color: var(--blue); }

  .icon-btn {
    width: 54px; height: 52px; background: var(--bg); border: 1px solid var(--bord);
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    gap: 2px; cursor: pointer; color: var(--txt2); font-size: 7px; letter-spacing: 1px;
    flex-shrink: 0; transition: border-color .12s, color .12s;
  }
  .icon-btn:hover { border-color: var(--blue); color: var(--blue); }
  .icon-btn.danger:hover { border-color: var(--red); color: var(--red); }
  .icon-btn svg { width: 20px; height: 20px; }

  .arr-btn {
    width: 28px; height: 28px; background: var(--bg); border: 1px solid var(--bord);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; color: var(--txt2); font-size: 13px;
    transition: border-color .12s, color .12s;
  }
  .arr-btn:hover { border-color: var(--blue); color: var(--blue); }

  .sm-btn {
    height: 26px; padding: 0 8px; background: var(--bg); border: 1px solid var(--bord);
    color: var(--txt2); font-family: var(--font); font-size: 8px; letter-spacing: 1px;
    cursor: pointer; transition: border-color .12s, color .12s;
  }
  .sm-btn:hover       { border-color: var(--blue); color: var(--blue); }
  .sm-btn.red:hover   { border-color: var(--red);  color: var(--red);  }

  .big-btn {
    flex: 1; background: var(--bg); border: 1px solid var(--bord); color: var(--txt);
    font-family: var(--font); font-size: 13px; letter-spacing: 4px; cursor: pointer;
    transition: border-color .12s, color .12s;
  }
  .big-btn:hover            { border-color: var(--blue); color: var(--blue); }
  .big-btn.fire:hover       { border-color: var(--red);  color: var(--red);  }
  .big-btn:disabled         { opacity: 0.2; cursor: not-allowed; border-color: var(--bord2); color: #303030; }
  .big-btn:disabled:hover   { border-color: var(--bord2); color: #303030; }

  .status-bar {
    flex: 1; height: 22px; border: 1px solid var(--bord2); background: var(--bg3);
    display: flex; align-items: center; padding: 0 10px;
  }
  .status-txt { font-size: 9px; letter-spacing: 2px; color: var(--txt2); }

  /* ── DELAY SELECTOR ── */
  .delay-selector {
    display: flex; flex-direction: column; gap: 3px; flex-shrink: 0;
  }
  .delay-label {
    font-size: 7px; letter-spacing: 2px; color: var(--txt2); text-align: center;
  }
  .delay-select {
    background: var(--bg3); border: 1px solid var(--bord); color: var(--amber);
    font-family: var(--font); font-size: 10px; letter-spacing: 1px;
    padding: 3px 6px; outline: none; height: 28px; width: 82px; cursor: pointer;
    transition: border-color .12s;
  }
  .delay-select:focus   { border-color: var(--amber); }
  .delay-select:hover   { border-color: var(--amber); }
  .delay-select:disabled { opacity: 0.25; cursor: not-allowed; }

  /* ── COUNTDOWN ── */
  .countdown-bar {
    background: #0a0600; border: 1px solid var(--amber);
    padding: 4px 10px; display: flex; align-items: center; gap: 10px;
    flex-shrink: 0;
  }
  .countdown-label { font-size: 9px; letter-spacing: 2px; color: var(--amber); }
  .countdown-timer { font-size: 18px; letter-spacing: 4px; color: var(--amber); min-width: 80px; }
  .countdown-track {
    flex: 1; height: 6px; background: #1a1000; border: 1px solid #3a2000; position: relative;
  }
  .countdown-fill {
    position: absolute; top: 0; left: 0; height: 100%;
    background: var(--amber); transition: width .9s linear;
  }
  .countdown-target { font-size: 9px; letter-spacing: 1px; color: #806030; margin-left: auto; }

  /* ── MISSION ── */
  .mission { width: 100%; height: 100%; display: flex; flex-direction: column; }
  .m-hdr {
    height: 38px; background: var(--bg2); border-bottom: 1px solid var(--bord);
    display: flex; align-items: center; padding: 0 12px; flex-shrink: 0;
  }
  .m-title { font-size: 20px; letter-spacing: 6px; color: var(--txt); margin-right: auto; }
  .m-stats { border: 1px solid var(--bord); padding: 4px 12px; font-size: 10px; letter-spacing: 2px; color: var(--txt2); }
  .m-body  { flex: 1; display: flex; overflow: hidden; }
  .m-left  { width: 280px; display: flex; flex-direction: column; border-right: 1px solid var(--bord); flex-shrink: 0; }
  .m-right { flex: 1; display: flex; flex-direction: column; }
  .arrow-col {
    width: 32px; display: flex; flex-direction: column; align-items: center;
    justify-content: space-around; background: var(--bg2);
    border-left: 1px solid var(--bord); border-right: 1px solid var(--bord);
    flex-shrink: 0; padding: 20px 0;
  }
  .m-bot {
    height: 72px; background: var(--bg2); border-top: 1px solid var(--bord);
    display: flex; align-items: center; padding: 0 10px; gap: 8px; flex-shrink: 0;
  }

  /* ── GROUP ── */
  .group   { width: 100%; height: 100%; display: flex; flex-direction: column; }
  .g-hdr   {
    height: 44px; background: var(--bg2); border-bottom: 1px solid var(--bord);
    display: flex; align-items: center; padding: 0 10px; gap: 10px; flex-shrink: 0;
  }
  .g-title { font-size: 16px; letter-spacing: 6px; color: var(--txt); flex: 1; text-align: center; }
  .home-btn {
    width: 40px; height: 36px; background: var(--bg); border: 1px solid var(--bord);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; color: var(--txt2); flex-shrink: 0;
    transition: border-color .12s, color .12s;
  }
  .home-btn:hover   { border-color: var(--blue); color: var(--blue); }
  .home-btn svg     { width: 20px; height: 20px; }

  .g-act {
    height: 68px; background: var(--bg2); border-bottom: 1px solid var(--bord);
    display: flex; align-items: center; padding: 0 10px; gap: 8px; flex-shrink: 0;
  }
  .prog-outer { flex: 1; border: 1px solid var(--bord); background: var(--bg3); min-width: 0; }
  .prog-info  {
    font-size: 9px; letter-spacing: 1px; color: var(--txt2);
    padding: 3px 8px; border-bottom: 1px solid var(--bord2);
    white-space: nowrap; overflow: hidden;
  }
  .prog-track  { height: 20px; display: flex; }
  .prog-seg    { flex: 1; position: relative; border-right: 1px solid var(--bord2); transition: background .3s; }
  .prog-seg:last-child    { border-right: none; }
  .prog-seg.on            { background: #0e2030; }
  .prog-seg.disarmed-seg  { background: #141414; }
  .prog-fill              { position: absolute; bottom: 0; left: 0; height: 3px; background: var(--blue); transition: width .4s; }
  .prog-fill.disarmed-fill { background: #2a2a2a; }
  .prog-labels { display: flex; }
  .prog-lbl    { flex: 1; font-size: 7px; letter-spacing: 1px; color: var(--txt2); text-align: center; padding: 2px 0; }

  .g-body { flex: 1; display: flex; overflow: hidden; flex-direction: column; }
  .g-list { flex: 1; overflow-y: auto; background: var(--bg3); }
  .g-list::-webkit-scrollbar       { width: 4px; }
  .g-list::-webkit-scrollbar-track { background: var(--bg3); }
  .g-list::-webkit-scrollbar-thumb { background: var(--bord); }

  .g-list-wrap { flex: 1; display: flex; overflow: hidden; }
  .scroll-col  {
    width: 32px; display: flex; flex-direction: column; align-items: center;
    justify-content: space-around; background: var(--bg2);
    border-left: 1px solid var(--bord); padding: 20px 0; flex-shrink: 0;
  }

  .sad-row { border-bottom: 1px solid var(--bord2); padding: 7px 12px; display: flex; align-items: center; gap: 8px; }
  .sad-row:hover           { background: #1a1e22; }
  .sad-row.disarmed        { opacity: 0.35; background: #0a0a0b; cursor: not-allowed; }
  .sad-row.disarmed:hover  { background: #0a0a0b; }
  .sad-nm    { font-size: 11px; letter-spacing: 2px; color: var(--txt); min-width: 80px; }
  .sad-state { font-size: 9px;  letter-spacing: 1px; color: var(--blue); min-width: 80px; }
  .sad-state.ds { color: #383838; }
  .sad-dly   { font-size: 9px;  letter-spacing: 1px; color: var(--txt2); }
  .row-btns  { margin-left: auto; display: flex; gap: 5px; }

  /* sad-row delay badge */
  .dly-badge {
    font-size: 8px; letter-spacing: 1px; padding: 2px 6px;
    border: 1px solid #3a2800; color: var(--amber); background: #100800;
  }

  .g-bot {
    height: 76px; background: var(--bg2); border-top: 1px solid var(--bord);
    display: flex; flex-direction: column; padding: 6px 10px; gap: 6px; flex-shrink: 0;
  }
  .g-bot-btns { display: flex; gap: 10px; flex: 1; }

  .grp-select {
    background: var(--bg3); border: 1px solid var(--bord); color: var(--txt);
    font-family: var(--font); font-size: 10px; letter-spacing: 1px;
    padding: 4px 6px; outline: none; width: 120px; height: 36px; flex-shrink: 0;
    transition: border-color .12s;
  }
  .grp-select:focus { border-color: var(--blue); }

  /* ── MODAL ── */
  .overlay {
    position: absolute; inset: 0; background: rgba(0,0,0,.82);
    display: flex; align-items: center; justify-content: center; z-index: 50;
  }
  .modal       { background: var(--bg2); border: 1px solid var(--blue); padding: 16px; width: 290px; }
  .modal-title { font-size: 10px; letter-spacing: 3px; color: var(--blue); margin-bottom: 12px; }
  .modal input, .modal select {
    background: var(--bg3); border: 1px solid var(--bord); color: var(--txt);
    font-family: var(--font); font-size: 11px; padding: 6px 8px;
    width: 100%; margin-bottom: 8px; outline: none;
  }
  .modal input:focus, .modal select:focus { border-color: var(--blue); }
  .modal-warn  { font-size: 9px; letter-spacing: 1px; color: var(--red); line-height: 1.8; margin-bottom: 8px; white-space: pre-line; }
  .modal-btns  { display: flex; gap: 8px; margin-top: 6px; }
  .modal-ok {
    flex: 1; height: 34px; background: var(--bg3); border: 1px solid var(--green);
    color: var(--green); font-family: var(--font); font-size: 9px; letter-spacing: 2px;
    cursor: pointer; transition: background .12s;
  }
  .modal-ok:hover      { background: #0a1a10; }
  .modal-ok.red        { border-color: var(--red); color: var(--red); }
  .modal-ok.red:hover  { background: #1a0808; }
  .modal-cx {
    flex: 1; height: 34px; background: var(--bg3); border: 1px solid var(--bord);
    color: var(--txt2); font-family: var(--font); font-size: 9px; letter-spacing: 2px;
    cursor: pointer; transition: border-color .12s, color .12s;
  }
  .modal-cx:hover { border-color: var(--red); color: var(--red); }

  /* ── TOAST ── */
  .toast {
    position: absolute; bottom: 88px; left: 50%; transform: translateX(-50%);
    background: var(--bg2); border: 1px solid var(--blue); color: var(--blue);
    font-size: 9px; letter-spacing: 2px; padding: 5px 14px;
    pointer-events: none; z-index: 60; white-space: nowrap;
  }

  /* ── NAV PILL ── */
  .nav-pill {
    font-size: 8px; letter-spacing: 2px; color: var(--blue); cursor: pointer;
    border: 1px solid var(--blue); padding: 2px 7px; background: var(--bg3);
    transition: background .12s; white-space: nowrap; flex-shrink: 0;
  }
  .nav-pill:hover { background: #0a1a28; }
`;

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const STAGE_LABELS = ["PAIRED", "SEPARATION", "ARMED", "FIRE SENT"];
const DELAY_OPTIONS = [
  { label: "0", mins: 0 },
  { label: "15m", mins: 15 },
  { label: "30m", mins: 30 },
  { label: "45m", mins: 45 },
  { label: "1hr", mins: 60 },
];

const pad2 = (n) => String(n).padStart(2, "0");

const stageOf = (sad) => {
  if (!sad) return -1;
  if (sad.disarmed) return 5;
  if (sad.fired) return 3;
  if (sad.armed) return 2;
  if (sad.separated) return 1;
  if (sad.paired) return 0;
  return -1;
};

const stageLabel = (sad) => {
  if (!sad) return "IDLE";
  if (sad.disarmed) return "DISARMED";
  const st = stageOf(sad);
  return st >= 0 && st <= 3 ? STAGE_LABELS[st] : "IDLE";
};

// Format seconds → MM:SS
const fmtCountdown = (secs) => {
  const s = Math.max(0, Math.round(secs));
  return `${pad2(Math.floor(s / 60))}:${pad2(s % 60)}`;
};

const makeSAD = () => ({
  paired: true,
  group: null,
  armed: false,
  deco: "DECO-01",
  fired: false,
  separated: false,
  disarmed: false,
});

// ─── STATE ────────────────────────────────────────────────────────────────────
const initState = () => ({ groups: [], sads: {}, selGroup: null });

function reducer(state, action) {
  switch (action.type) {
    case "ADD_SAD":
      return { ...state, sads: { ...state.sads, [action.id]: makeSAD() } };

    case "ADD_GROUP": {
      const g = {
        id: action.id,
        sads: [],
        delayMins: 0,
        disarmed: false,
        fireAt: null,
      };
      return {
        ...state,
        groups: [...state.groups, g],
        selGroup: state.selGroup || action.id,
      };
    }

    case "SEL_GROUP":
      return { ...state, selGroup: action.id };

    case "ASSIGN_SAD": {
      const groups = state.groups.map((g) =>
        g.id === action.grpId ? { ...g, sads: [...g.sads, action.sadId] } : g,
      );
      return {
        ...state,
        groups,
        sads: {
          ...state.sads,
          [action.sadId]: { ...state.sads[action.sadId], group: action.grpId },
        },
        selGroup: action.grpId,
      };
    }

    case "CLEAR_ALL":
      return initState();

    case "SYNC_GROUP": {
      const sads = { ...state.sads };
      const grp = state.groups.find((g) => g.id === action.grpId);
      if (grp)
        grp.sads.forEach((id) => {
          if (sads[id]) sads[id] = { ...sads[id], separated: true };
        });
      return { ...state, sads };
    }

    // Set delay on the GROUP — no per-SAD delay
    case "SET_GROUP_DELAY": {
      const groups = state.groups.map((g) =>
        g.id === action.grpId ? { ...g, delayMins: action.mins } : g,
      );
      return { ...state, groups };
    }

    case "PAIR_SAD":
      return {
        ...state,
        sads: {
          ...state.sads,
          [action.id]: { ...state.sads[action.id], paired: true },
        },
      };

    case "REMOVE_SAD_FROM_GROUP": {
      const groups = state.groups.map((g) =>
        g.id === action.grpId
          ? { ...g, sads: g.sads.filter((s) => s !== action.id) }
          : g,
      );
      return {
        ...state,
        groups,
        sads: {
          ...state.sads,
          [action.id]: {
            ...state.sads[action.id],
            group: null,
            armed: false,
            separated: false,
            fired: false,
          },
        },
      };
    }

    case "ARM_GROUP": {
      const sads = { ...state.sads };
      const grp = state.groups.find((g) => g.id === action.grpId);
      if (grp)
        grp.sads.forEach((id) => {
          if (sads[id] && !sads[id].disarmed)
            sads[id] = {
              ...sads[id],
              armed: action.arm,
              separated: action.arm ? true : sads[id].separated,
            };
        });
      return { ...state, sads };
    }

    case "DISARM_GROUP": {
      const sads = { ...state.sads };
      const groups = state.groups.map((g) => {
        if (g.id !== action.grpId) return g;
        g.sads.forEach((id) => {
          if (sads[id])
            sads[id] = { ...sads[id], armed: false, disarmed: true };
        });
        return { ...g, disarmed: true, fireAt: null };
      });
      return { ...state, groups, sads };
    }

    // Fire with optional delay — store fireAt timestamp (ms epoch) if delay > 0
    case "FIRE_GROUP": {
      const groups = state.groups.map((g) => {
        if (g.id !== action.grpId) return g;
        const delaySecs = (g.delayMins || 0) * 60;
        const fireAt = delaySecs > 0 ? Date.now() + delaySecs * 1000 : null;
        return { ...g, fireAt, firingPending: delaySecs > 0 };
      });
      // If no delay, immediately mark SADs fired
      const sads = { ...state.sads };
      const grp = groups.find((g) => g.id === action.grpId);
      if (grp && !grp.fireAt) {
        grp.sads.forEach((id) => {
          if (sads[id]?.armed)
            sads[id] = { ...sads[id], armed: false, fired: true };
        });
      }
      return { ...state, groups, sads };
    }

    // Called by the countdown timer when it hits zero
    case "FIRE_EXECUTE": {
      const sads = { ...state.sads };
      const groups = state.groups.map((g) => {
        if (g.id !== action.grpId) return g;
        g.sads.forEach((id) => {
          if (sads[id]?.armed)
            sads[id] = { ...sads[id], armed: false, fired: true };
        });
        return { ...g, fireAt: null, firingPending: false };
      });
      return { ...state, groups, sads };
    }

    default:
      return state;
  }
}

// ─── SVG ICONS ────────────────────────────────────────────────────────────────
const IconTrash = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);
const IconPlus = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="12" cy="12" r="9" />
    <line x1="12" y1="8" x2="12" y2="16" />
    <line x1="8" y1="12" x2="16" y2="12" />
  </svg>
);
const IconSync = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M4 12a8 8 0 018-8a8 8 0 018 8" />
    <path d="M20 12a8 8 0 01-8 8a8 8 0 01-8-8" />
    <polyline points="4 8 4 12 8 12" />
    <polyline points="20 16 20 12 16 12" />
  </svg>
);
const IconHome = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M3 12L12 3l9 9" />
    <path d="M9 21V12h6v9" />
  </svg>
);

// ─── MODAL ────────────────────────────────────────────────────────────────────
function Modal({ modal, onConfirm, onCancel }) {
  if (!modal) return null;
  return (
    <div className="overlay">
      <div className="modal">
        <div className="modal-title">{modal.title}</div>
        {modal.warn && <div className="modal-warn">{modal.warn}</div>}
        {(modal.fields || []).map((f, i) =>
          f.type === "select" ? (
            <select
              key={i}
              id={`mf${i}`}
              defaultValue={f.options[0]?.value ?? ""}
            >
              {f.options.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          ) : (
            <input
              key={i}
              id={`mf${i}`}
              type={f.inputType || "text"}
              placeholder={f.placeholder || ""}
              defaultValue={f.defaultValue ?? ""}
              min={f.min}
              max={f.max}
              autoFocus={i === 0}
            />
          ),
        )}
        <div className="modal-btns">
          <button
            className={`modal-ok${modal.danger ? " red" : ""}`}
            onClick={onConfirm}
          >
            {modal.ok || "CONFIRM"}
          </button>
          <button className="modal-cx" onClick={onCancel}>
            CANCEL
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── DELAY SELECTOR ──────────────────────────────────────────────────────────
function DelaySelector({ value, onChange, disabled }) {
  return (
    <div className="delay-selector">
      <div className="delay-label">DELAY</div>
      <select
        className="delay-select"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        disabled={disabled}
      >
        {DELAY_OPTIONS.map((opt) => (
          <option key={opt.mins} value={opt.mins}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

// ─── COUNTDOWN BANNER ────────────────────────────────────────────────────────
function CountdownBanner({ fireAt, totalSecs, onComplete }) {
  const [remaining, setRemaining] = useState(
    () => (fireAt - Date.now()) / 1000,
  );

  useEffect(() => {
    const tick = () => {
      const left = (fireAt - Date.now()) / 1000;
      setRemaining(left);
      if (left <= 0) onComplete();
    };
    tick();
    const id = setInterval(tick, 500);
    return () => clearInterval(id);
  }, [fireAt, onComplete]);

  const pct = Math.max(
    0,
    Math.min(100, ((totalSecs - remaining) / totalSecs) * 100),
  );

  return (
    <div className="countdown-bar">
      <div className="countdown-label">FIRE IN</div>
      <div className="countdown-timer">{fmtCountdown(remaining)}</div>
      <div className="countdown-track">
        <div className="countdown-fill" style={{ width: `${pct}%` }} />
      </div>
      <div className="countdown-target">
        T+{Math.round(totalSecs / 60)}m DELAY
      </div>
    </div>
  );
}

// ─── PROGRESS BAR ─────────────────────────────────────────────────────────────
function ProgressBar({ group, sads }) {
  const total = group ? group.sads.length : 0;
  const isDisarmed = group?.disarmed === true;
  const isFiring = !!group?.fireAt;
  let maxStage = -1;
  if (group && !isDisarmed) {
    group.sads.forEach((id) => {
      const s = stageOf(sads[id]);
      if (s >= 0 && s <= 3 && s > maxStage) maxStage = s;
    });
  }
  const stateName = isDisarmed
    ? "DISARMED"
    : isFiring
      ? "FIRE PENDING"
      : maxStage >= 0
        ? STAGE_LABELS[maxStage]
        : "IDLE";
  const delayStr = group?.delayMins > 0 ? `${group.delayMins} MIN` : "NONE";

  return (
    <div className="prog-outer">
      <div className="prog-info" style={isDisarmed ? { color: "#383838" } : {}}>
        {`GROUP: ${group?.id ?? "--"}   DEVICES: ${pad2(total)}   STATE: ${stateName}   DELAY: ${delayStr}`}
      </div>
      <div className="prog-track">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`prog-seg${isDisarmed ? " disarmed-seg" : i <= maxStage && total > 0 ? " on" : ""}`}
          >
            <div
              className={`prog-fill${isDisarmed ? " disarmed-fill" : ""}`}
              style={{
                width: isDisarmed
                  ? "100%"
                  : i <= maxStage && total > 0
                    ? "100%"
                    : "0%",
              }}
            />
          </div>
        ))}
      </div>
      <div className="prog-labels">
        {isDisarmed ? (
          <div
            className="prog-lbl"
            style={{ flex: 4, color: "#383838", letterSpacing: "4px" }}
          >
            — DISARMED — LOCKED —
          </div>
        ) : (
          STAGE_LABELS.map((l) => (
            <div key={l} className="prog-lbl">
              {l}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ─── MISSION SCREEN ───────────────────────────────────────────────────────────
function MissionScreen({
  state,
  dispatch,
  openModal,
  showToast,
  setStatus,
  statusMsg,
  onGoGroup,
}) {
  const { groups, sads, selGroup } = state;
  const unassigned = Object.keys(sads).filter((id) => !sads[id].group);

  const scrollEl = (id, dir) => {
    const el = document.getElementById(id);
    if (el) el.scrollTop += dir * 60;
  };

  const handleAddSAD = () =>
    openModal({
      title: "ADD & PAIR SAD TO DECO-01",
      fields: [{ placeholder: "SAD ID — e.g. SAD-004" }],
      ok: "ADD & PAIR",
      onConfirm: (vals) => {
        const raw = vals[0].trim().toUpperCase();
        const id = raw || `SAD-${pad2(Object.keys(sads).length + 1)}`;
        if (sads[id]) {
          showToast("SAD ID ALREADY EXISTS");
          return false;
        }
        dispatch({ type: "ADD_SAD", id });
        setStatus(`ADDED & PAIRED: ${id}`);
        showToast(`${id} ADDED & PAIRED TO DECO-01`);
      },
    });

  const handleAddGroup = () =>
    openModal({
      title: "ADD NEW GROUP",
      fields: [{ placeholder: "GROUP ID — e.g. GRP-ALPHA" }],
      ok: "ADD GROUP",
      onConfirm: (vals) => {
        const raw = vals[0].trim().toUpperCase();
        const id = raw || `GRP-${String.fromCharCode(65 + groups.length)}`;
        if (groups.find((g) => g.id === id)) {
          showToast("GROUP ALREADY EXISTS");
          return false;
        }
        dispatch({ type: "ADD_GROUP", id });
        setStatus(`GROUP CREATED: ${id}`);
        showToast("GROUP CREATED: " + id);
      },
    });

  const handleAssign = () => {
    if (!unassigned.length) {
      showToast("NO UNASSIGNED SADs");
      return;
    }
    if (!groups.length) {
      showToast("NO GROUPS — ADD A GROUP FIRST");
      return;
    }
    openModal({
      title: "ASSIGN SAD TO GROUP",
      fields: [
        {
          type: "select",
          options: unassigned.map((id) => ({ value: id, label: id })),
        },
        {
          type: "select",
          options: groups.map((g) => ({ value: g.id, label: g.id })),
        },
      ],
      ok: "ASSIGN",
      onConfirm: (vals) => {
        dispatch({ type: "ASSIGN_SAD", sadId: vals[0], grpId: vals[1] });
        setStatus(`${vals[0]} → ${vals[1]}`);
        showToast(`${vals[0]} ASSIGNED TO ${vals[1]}`);
      },
    });
  };

  const handleClear = () =>
    openModal({
      title: "CLEAR ALL — CONFIRM",
      warn: "WARNING: All SADs and Groups will be removed.\nThis cannot be undone.",
      ok: "CONFIRM CLEAR ALL",
      danger: true,
      onConfirm: () => {
        dispatch({ type: "CLEAR_ALL" });
        setStatus("MISSION CLEARED");
        showToast("MISSION CLEARED");
      },
    });

  return (
    <div className="mission">
      <div className="m-hdr">
        <div className="m-title">M I S S I O N</div>
        <div className="m-stats">
          {`TOTAL SADS: ${pad2(Object.keys(sads).length)}   TOTAL GROUPS: ${pad2(groups.length)}`}
        </div>
      </div>
      <div className="m-body">
        <div className="m-left">
          <div className="col-hdr">UNASSIGNED SAD</div>
          <div className="list-area" id="m-sad-list">
            {unassigned.length ? (
              unassigned.map((id) => (
                <div key={id} className="entry">
                  <span className="dot dot-x" />
                  <span className="entry-id">{id}</span>
                  <span
                    className={`bdg ${sads[id].paired ? "bdg-p" : "bdg-u"}`}
                  >
                    {sads[id].paired ? "PAIRED" : "UNPAIRED"}
                  </span>
                  <span className="entry-sub">DECO-01</span>
                </div>
              ))
            ) : (
              <div className="empty-msg">NO UNASSIGNED SADs</div>
            )}
          </div>
        </div>
        <div className="arrow-col">
          <div className="arr-btn" onClick={() => scrollEl("m-sad-list", -1)}>
            ▲
          </div>
          <div className="arr-btn" onClick={() => scrollEl("m-sad-list", 1)}>
            ▼
          </div>
        </div>
        <div className="m-right">
          <div className="col-hdr-row">
            <span>GROUPS</span>
            {groups.length > 0 && (
              <div className="nav-pill" onClick={onGoGroup}>
                GROUP SCREEN ▶
              </div>
            )}
          </div>
          <div className="list-area" id="m-grp-list">
            {groups.length ? (
              groups.map((g) => {
                const armedN = g.sads.filter((id) => sads[id]?.armed).length;
                const isDisarmed = g.disarmed === true;
                const hasFire = !!g.fireAt;
                return (
                  <div
                    key={g.id}
                    className={`entry${selGroup === g.id ? " sel" : ""}`}
                    onClick={() =>
                      !isDisarmed && dispatch({ type: "SEL_GROUP", id: g.id })
                    }
                    style={
                      isDisarmed ? { opacity: 0.3, cursor: "not-allowed" } : {}
                    }
                  >
                    <span
                      className={`dot ${isDisarmed ? "dot-d" : hasFire ? "dot-a" : g.sads.length ? "dot-g" : "dot-x"}`}
                    />
                    <span
                      className="entry-id"
                      style={isDisarmed ? { color: "#383838" } : {}}
                    >
                      {g.id}
                    </span>
                    <span className="entry-sub">
                      {isDisarmed
                        ? "DISARMED — LOCKED"
                        : hasFire
                          ? `FIRE PENDING — ${g.sads.length} SAD`
                          : `${g.sads.length} SAD | ${armedN} ARMED | DLY:${g.delayMins}m`}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="empty-msg">NO GROUPS</div>
            )}
          </div>
        </div>
      </div>
      <div className="m-bot">
        <div className="icon-btn danger" onClick={handleClear}>
          <IconTrash />
          <span>CLEAR ALL</span>
        </div>
        <button className="text-btn" onClick={handleAddSAD}>
          ADD SAD
        </button>
        <div className="status-bar">
          <span className="status-txt">{statusMsg}</span>
        </div>
        <button className="text-btn" onClick={handleAddGroup}>
          ADD GROUP
        </button>
        <button className="text-btn" onClick={handleAssign}>
          ASSIGN SAD
        </button>
      </div>
    </div>
  );
}

// ─── GROUP SCREEN ─────────────────────────────────────────────────────────────
function GroupScreen({
  state,
  dispatch,
  openModal,
  showToast,
  setStatus,
  statusMsg,
  onGoMission,
}) {
  const { groups, sads, selGroup } = state;
  const group = groups.find((g) => g.id === selGroup) || null;
  const isLocked = !!group?.disarmed;
  const isFiring = !!group?.fireAt;

  // Countdown completion callback
  const handleCountdownComplete = useCallback(() => {
    if (group?.fireAt && Date.now() >= group.fireAt) {
      dispatch({ type: "FIRE_EXECUTE", grpId: selGroup });
      setStatus(`FIRE EXECUTED — ${selGroup}`);
      showToast(`FIRE EXECUTED — ${selGroup}`);
    }
  }, [group, selGroup, dispatch, setStatus, showToast]);

  const scrollEl = (id, dir) => {
    const el = document.getElementById(id);
    if (el) el.scrollTop += dir * 60;
  };

  const handleAddSAD = () => {
    const unassigned = Object.keys(sads).filter((id) => !sads[id].group);
    if (!unassigned.length) {
      showToast("NO UNASSIGNED SADs — ADD FROM MISSION SCREEN");
      return;
    }
    openModal({
      title: `ADD SAD TO ${selGroup}`,
      fields: [
        {
          type: "select",
          options: unassigned.map((id) => ({ value: id, label: id })),
        },
      ],
      ok: "ADD TO GROUP",
      onConfirm: (vals) => {
        dispatch({ type: "ASSIGN_SAD", sadId: vals[0], grpId: selGroup });
        setStatus(`${vals[0]} ADDED TO ${selGroup}`);
        showToast(`${vals[0]} ADDED TO ${selGroup}`);
      },
    });
  };

  const handleSync = () => {
    if (!group?.sads.length) {
      showToast("NO SADs TO SYNC");
      return;
    }
    dispatch({ type: "SYNC_GROUP", grpId: selGroup });
    setStatus("SYNC COMPLETE — SEPARATION STATE");
    showToast(`SYNC: ${group.sads.length} SAD(s) → SEPARATION`);
  };

  const handleDelayChange = (mins) => {
    dispatch({ type: "SET_GROUP_DELAY", grpId: selGroup, mins });
    setStatus(mins > 0 ? `DELAY SET: ${mins} MIN` : "DELAY CLEARED");
    showToast(mins > 0 ? `GROUP DELAY: ${mins} MIN` : "DELAY CLEARED");
  };

  const handlePair = (id) => {
    dispatch({ type: "PAIR_SAD", id });
    setStatus(`${id} PAIRED`);
    showToast(`${id} PAIRED TO DECO-01`);
  };
  const handlePing = (id) => {
    setStatus(`PINGING ${id}...`);
    showToast(`PING → ${id}`);
    setTimeout(() => setStatus(`${id} RESPONDED — OK`), 900);
  };

  const handleRemove = (id) =>
    openModal({
      title: `REMOVE ${id}`,
      warn: `Remove ${id} from ${selGroup}?\nSAD returns to unassigned pool.`,
      ok: "REMOVE",
      danger: true,
      onConfirm: () => {
        dispatch({ type: "REMOVE_SAD_FROM_GROUP", id, grpId: selGroup });
        setStatus(`${id} REMOVED`);
        showToast(`${id} REMOVED FROM ${selGroup}`);
      },
    });

  const handleArm = (arm) => {
    if (!group?.sads.length) {
      showToast("NO SADs IN GROUP");
      return;
    }
    if (isLocked) {
      showToast("GROUP IS LOCKED — DISARMED");
      return;
    }
    if (isFiring) {
      showToast("FIRE SEQUENCE IN PROGRESS");
      return;
    }

    if (!arm) {
      openModal({
        title: `DISARM — ${selGroup}`,
        warn: `WARNING: DISARM is permanent and irreversible.\n\nGroup: ${selGroup}\nAll SADs in this group will be\ndeactivated and cannot be reused.\n\nConfirm to proceed.`,
        ok: "CONFIRM DISARM",
        danger: true,
        onConfirm: () => {
          dispatch({ type: "DISARM_GROUP", grpId: selGroup });
          setStatus(`${selGroup} DISARMED — LOCKED`);
          showToast(`${selGroup} PERMANENTLY DISARMED`);
        },
      });
      return;
    }
    dispatch({ type: "ARM_GROUP", grpId: selGroup, arm: true });
    const msg = `${group.sads.length} SAD(s) ARMED`;
    setStatus(msg);
    showToast(msg);
  };

  const handleFire = () => {
    if (!group?.sads.length) {
      showToast("NO SADs IN GROUP");
      return;
    }
    if (isFiring) {
      showToast("FIRE SEQUENCE ALREADY IN PROGRESS");
      return;
    }
    const armed = group.sads.filter((id) => sads[id]?.armed);
    if (!armed.length) {
      showToast("NO ARMED SADs — ARM BEFORE FIRING");
      return;
    }
    const delayMins = group.delayMins || 0;
    const delayNote =
      delayMins > 0
        ? `\nFIRE DELAY: ${delayMins} MIN`
        : "\nFIRE DELAY: NONE — IMMEDIATE";
    openModal({
      title: `FIRE COMMAND — ${selGroup}`,
      warn: `CONFIRM FIRE COMMAND\nGROUP: ${selGroup}\nARMED UNITS: ${armed.join(" | ")}${delayNote}\n\nTHIS ACTION CANNOT BE UNDONE.`,
      ok: "CONFIRM FIRE",
      danger: true,
      onConfirm: () => {
        dispatch({ type: "FIRE_GROUP", grpId: selGroup });
        const msg =
          delayMins > 0
            ? `FIRE QUEUED — ${delayMins}m DELAY — ${armed.length} UNIT(s)`
            : `FIRE SENT — ${armed.length} UNIT(s)`;
        setStatus(msg);
        showToast(msg);
      },
    });
  };

  const totalDelaySecs = (group?.delayMins || 0) * 60;

  return (
    <div className="group">
      <div className="g-hdr">
        <div className="home-btn" onClick={onGoMission}>
          <IconHome />
        </div>
        <div className="g-title">G R O U P &nbsp; S C R E E N</div>
      </div>

      <div className="g-act">
        <div
          className="icon-btn"
          onClick={isLocked || isFiring ? undefined : handleAddSAD}
          style={
            isLocked || isFiring ? { opacity: 0.2, cursor: "not-allowed" } : {}
          }
        >
          <IconPlus />
          <span>SAD</span>
        </div>
        <div
          className="icon-btn"
          onClick={isLocked || isFiring ? undefined : handleSync}
          style={
            isLocked || isFiring ? { opacity: 0.2, cursor: "not-allowed" } : {}
          }
        >
          <IconSync />
          <span>SYNC</span>
        </div>
        <ProgressBar group={group} sads={sads} />
        <select
          className="grp-select"
          value={selGroup || ""}
          onChange={(e) => dispatch({ type: "SEL_GROUP", id: e.target.value })}
        >
          {groups.length ? (
            groups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.id}
              </option>
            ))
          ) : (
            <option value="">NO GROUPS</option>
          )}
        </select>
        {/* Delay selector — group-level, 15-min steps */}
        <DelaySelector
          value={group?.delayMins || 0}
          onChange={handleDelayChange}
          disabled={isLocked || isFiring}
        />
      </div>

      <div className="g-body">
        {/* Countdown banner — shown when fire is pending with delay */}
        {isFiring && group.fireAt && totalDelaySecs > 0 && (
          <CountdownBanner
            fireAt={group.fireAt}
            totalSecs={totalDelaySecs}
            onComplete={handleCountdownComplete}
          />
        )}

        <div className="g-list-wrap">
          <div className="g-list" id="g-sad-list">
            {group?.sads.length ? (
              group.sads.map((id) => {
                const s = sads[id];
                if (!s) return null;
                const isDs = s.disarmed === true;
                const grpDelay = group?.delayMins || 0;
                return (
                  <div key={id} className={`sad-row${isDs ? " disarmed" : ""}`}>
                    <span
                      className={`dot ${isDs ? "dot-d" : s.armed ? "dot-r" : s.paired ? "dot-g" : "dot-x"}`}
                    />
                    <span
                      className="sad-nm"
                      style={isDs ? { color: "#383838" } : {}}
                    >
                      {id}
                    </span>
                    <span className={`sad-state${isDs ? " ds" : ""}`}>
                      {stageLabel(s)}
                    </span>
                    <span
                      className={`bdg ${isDs ? "bdg-d" : s.paired ? "bdg-p" : "bdg-u"}`}
                    >
                      {isDs ? "LOCKED" : s.paired ? "PAIRED" : "UNPAIRED"}
                    </span>
                    {/* Show group delay on each SAD row for clarity */}
                    {!isDs && grpDelay > 0 && (
                      <span className="dly-badge">DLY:{grpDelay}m</span>
                    )}
                    {!isDs && (
                      <div className="row-btns">
                        <button
                          className="sm-btn"
                          onClick={() => handlePair(id)}
                          disabled={isFiring}
                        >
                          PAIR
                        </button>
                        <button
                          className="sm-btn"
                          onClick={() => handlePing(id)}
                        >
                          PING
                        </button>
                        <button
                          className="sm-btn red"
                          onClick={() => handleRemove(id)}
                          disabled={isFiring}
                        >
                          REMOVE
                        </button>
                      </div>
                    )}
                    {isDs && (
                      <div className="row-btns">
                        <span
                          style={{
                            fontSize: "8px",
                            letterSpacing: "2px",
                            color: "#2a2a2a",
                          }}
                        >
                          — DEACTIVATED —
                        </span>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="empty-msg">
                NO SADs IN GROUP — USE + SAD OR ASSIGN FROM MISSION SCREEN
              </div>
            )}
          </div>
          <div className="scroll-col">
            <div className="arr-btn" onClick={() => scrollEl("g-sad-list", -1)}>
              ▲
            </div>
            <div className="arr-btn" onClick={() => scrollEl("g-sad-list", 1)}>
              ▼
            </div>
          </div>
        </div>
      </div>

      <div className="g-bot">
        <div className="status-bar">
          <span className="status-txt">{statusMsg}</span>
        </div>
        <div className="g-bot-btns">
          <button
            className="big-btn"
            onClick={() => handleArm(true)}
            disabled={isLocked || isFiring}
          >
            ARM
          </button>
          <button
            className="big-btn"
            onClick={() => handleArm(false)}
            disabled={isLocked || isFiring}
          >
            DISARM
          </button>
          <button
            className="big-btn fire"
            onClick={handleFire}
            disabled={isLocked || isFiring}
          >
            FIRE
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── ROOT APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [state, dispatch] = useReducer(reducer, initState());
  const [screen, setScreen] = useState("mission");
  const [modal, setModal] = useState(null);
  const [toastMsg, setToastMsg] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const [statusMsg, setStatusMsg] = useState("READY...");
  const toastTimer = useRef(null);

  useEffect(() => {
    const TAG = "gcs-styles";
    if (!document.getElementById(TAG)) {
      const el = document.createElement("style");
      el.id = TAG;
      el.textContent = STYLES;
      document.head.appendChild(el);
    }
  }, []);

  const showToast = useCallback((msg) => {
    setToastMsg(msg);
    setToastVisible(true);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastVisible(false), 2600);
  }, []);

  const setStatus = useCallback((msg) => setStatusMsg(msg), []);
  const openModal = useCallback((cfg) => setModal(cfg), []);
  const closeModal = useCallback(() => setModal(null), []);

  const handleModalConfirm = () => {
    if (!modal) return;
    const vals = (modal.fields || []).map((_, i) => {
      const el = document.getElementById(`mf${i}`);
      return el ? el.value : "";
    });
    const result = modal.onConfirm(vals);
    if (result !== false) closeModal();
  };

  const sharedProps = {
    state,
    dispatch,
    openModal,
    showToast,
    setStatus,
    statusMsg,
  };

  return (
    <div className="gcs-root">
      {screen === "mission" ? (
        <MissionScreen {...sharedProps} onGoGroup={() => setScreen("group")} />
      ) : (
        <GroupScreen
          {...sharedProps}
          onGoMission={() => setScreen("mission")}
        />
      )}
      <Modal
        modal={modal}
        onConfirm={handleModalConfirm}
        onCancel={closeModal}
      />
      {toastVisible && <div className="toast">{toastMsg}</div>}
    </div>
  );
}
