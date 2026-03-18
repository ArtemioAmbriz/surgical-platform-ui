import { useState, useRef, useEffect, useCallback } from "react";

const HOLD_DURATION = 400;
const BAT_LEVEL = 70;
const R = 108;
const CIRC = 2 * Math.PI * R;
const ARC_LEN = CIRC * 0.75;

const NIGHT = {
  panelBg: "#1a1a1a",
  panelBorder: "#2e2e2e",
  circleBg: "#131313",
  circleStroke: "#252525",
  arcBg: "#222",
  btnBg: "#111",
  btnBorder: "#2a2a2a",
  valueText: "#e0e0e0",
  subtitleText: "#444",
  tickMajor: "#333",
  tickMinor: "#2a2a2a",
  topText: "#555",
  dimLabel: "#444",
  loLabel: "#777",
};
const DAY = {
  panelBg: "#e0e0e0",
  panelBorder: "#cccccc",
  circleBg: "#cecece",
  circleStroke: "#bbbbbb",
  arcBg: "#bbb",
  btnBg: "#d0d0d0",
  btnBorder: "#bbbbbb",
  valueText: "#111",
  subtitleText: "#777",
  tickMajor: "#999",
  tickMinor: "#bbb",
  topText: "#555",
  dimLabel: "#888",
  loLabel: "#999",
};

function getArcColor(v, night) {
  if (v === 0) return night ? "#555" : "#999";
  if (v === 100) return "#c0823a";
  if (v < 20) return night ? "#6a6a6a" : "#888";
  return "#3a9e6e";
}
function getStatusLabel(v) {
  if (v === 0) return "BOTTOM";
  if (v === 100) return "MAX HEIGHT";
  if (v < 20) return "LOW";
  return "READY";
}
function getStatusColor(v) {
  if (v === 0) return "#555";
  if (v === 100) return "#c0823a";
  if (v < 20) return "#6a6a6a";
  return "#3a9e6e";
}
function getBatColor(pct) {
  return pct > 40 ? "#3a9e6e" : pct > 20 ? "#c0823a" : "#9e3a3a";
}

function Ticks({ night }) {
  const t = night ? NIGHT : DAY;
  const cx = 130,
    cy = 130;
  return (
    <g>
      {[0, 0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 0.875, 1.0].map((pos, i) => {
        const isMajor = i === 0 || i === 4 || i === 8;
        const angleRad = ((135 + pos * 270) * Math.PI) / 180;
        const r1 = isMajor ? 116 : 114,
          r2 = isMajor ? 104 : 107;
        return (
          <line
            key={i}
            x1={cx + r1 * Math.cos(angleRad)}
            y1={cy + r1 * Math.sin(angleRad)}
            x2={cx + r2 * Math.cos(angleRad)}
            y2={cy + r2 * Math.sin(angleRad)}
            stroke={isMajor ? t.tickMajor : t.tickMinor}
            strokeWidth={isMajor ? "1.5" : "1"}
            strokeLinecap="round"
          />
        );
      })}
    </g>
  );
}

function MainScreen({
  value,
  night,
  lowerProgress,
  raiseProgress,
  onStartHold,
  onEndHold,
  onGoSettings,
}) {
  const t = night ? NIGHT : DAY;
  const filled = (value / 100) * ARC_LEN;
  const gap = CIRC - filled;
  const arcColor = getArcColor(value, night);
  const dimLabel = t.dimLabel;
  const loLabel = t.loLabel;
  const l0Color = value === 0 ? loLabel : value < 20 ? loLabel : dimLabel;
  const l100Color = value === 100 ? "#c0823a" : dimLabel;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: t.panelBg,
        border: `2px solid ${t.panelBorder}`,
        borderRadius: "12px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        boxSizing: "border-box",
        fontFamily: "'Courier New', monospace",
      }}
    >
      {/* TOP BAR */}
      <div
        style={{
          position: "absolute",
          top: "3.5%",
          left: "2.6%",
          right: "2.6%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          zIndex: 3,
        }}
      >
        <span
          style={{
            fontSize: "clamp(8px,1.43vw,11px)",
            color: t.topText,
            letterSpacing: "2px",
          }}
        >
          SURGICAL PLATFORM CONTROL
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <div
              style={{
                position: "relative",
                width: "28px",
                height: "13px",
                border: "1.5px solid #444",
                borderRadius: "2px",
                display: "flex",
                alignItems: "center",
                padding: "2px",
                boxSizing: "border-box",
              }}
            >
              <div
                style={{
                  height: "100%",
                  background: getBatColor(BAT_LEVEL),
                  borderRadius: "1px",
                  width: BAT_LEVEL + "%",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  right: "-5px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: "3px",
                  height: "7px",
                  background: "#444",
                  borderRadius: "0 1px 1px 0",
                }}
              />
            </div>
            <span
              style={{
                fontSize: "clamp(8px,1.32vw,10px)",
                color: t.topText,
                letterSpacing: "1px",
              }}
            >
              {BAT_LEVEL}%
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <div
              style={{
                width: "7px",
                height: "7px",
                borderRadius: "50%",
                background: getStatusColor(value),
              }}
            />
            <span
              style={{
                fontSize: "clamp(8px,1.43vw,11px)",
                color: getStatusColor(value),
                letterSpacing: "1px",
              }}
            >
              {getStatusLabel(value)}
            </span>
          </div>
        </div>
      </div>

      {/* LOWER */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 3,
        }}
      >
        <button
          onMouseDown={() => onStartHold(-1)}
          onMouseUp={onEndHold}
          onMouseLeave={onEndHold}
          onTouchStart={(e) => {
            e.preventDefault();
            onStartHold(-1);
          }}
          onTouchEnd={onEndHold}
          style={{
            width: "clamp(70px,14vw,108px)",
            height: "clamp(70px,14vw,108px)",
            background: t.btnBg,
            border: `1.5px solid ${t.btnBorder}`,
            borderRadius: "50%",
            cursor: "pointer",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            outline: "none",
            userSelect: "none",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              width: lowerProgress + "%",
              height: "3px",
              background: "#3a9e6e",
              transition: lowerProgress === 0 ? "width 0.2s" : "none",
            }}
          />
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <line
              x1="10"
              y1="2"
              x2="10"
              y2="18"
              stroke="#666"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
            <polyline
              points="4,12 10,18 16,12"
              stroke="#666"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
          <span
            style={{
              fontSize: "clamp(7px,1.3vw,10px)",
              color: t.topText,
              letterSpacing: "2.5px",
            }}
          >
            LOWER
          </span>
        </button>
      </div>

      {/* CENTER DISPLAY */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          flexShrink: 0,
          width: "260px",
          height: "260px",
        }}
      >
        <svg width="260" height="260" viewBox="0 0 260 260">
          <circle
            cx="130"
            cy="130"
            r="128"
            fill={t.circleBg}
            stroke={t.circleStroke}
            strokeWidth="1.5"
          />
          <circle
            cx="130"
            cy="130"
            r={R}
            fill="none"
            stroke={t.arcBg}
            strokeWidth="10"
            strokeDasharray={`${ARC_LEN} ${CIRC - ARC_LEN}`}
            transform="rotate(135 130 130)"
            strokeLinecap="round"
          />
          <circle
            cx="130"
            cy="130"
            r={R}
            fill="none"
            stroke={arcColor}
            strokeWidth="10"
            strokeDasharray={`${filled} ${gap}`}
            transform="rotate(135 130 130)"
            strokeLinecap="round"
            style={{ transition: "stroke-dasharray 0.15s, stroke 0.3s" }}
          />
          <Ticks night={night} />
          <text
            x="56"
            y="214"
            textAnchor="middle"
            fontSize="12"
            fill={l0Color}
            fontFamily="Courier New,monospace"
          >
            {0}
          </text>
          <text
            x="204"
            y="214"
            textAnchor="middle"
            fontSize="12"
            fill={l100Color}
            fontFamily="Courier New,monospace"
          >
            100
          </text>
          <text
            x="130"
            y="148"
            textAnchor="middle"
            fontSize="80"
            fontWeight="200"
            fill={t.valueText}
            fontFamily="Courier New,monospace"
            letterSpacing="-3"
          >
            {value}
          </text>
          <text
            x="130"
            y="178"
            textAnchor="middle"
            fontSize="11"
            fill={t.subtitleText}
            fontFamily="Courier New,monospace"
            letterSpacing="4"
          >
            HEIGHT %
          </text>
        </svg>
      </div>

      {/* RAISE */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 3,
        }}
      >
        <button
          onMouseDown={() => onStartHold(1)}
          onMouseUp={onEndHold}
          onMouseLeave={onEndHold}
          onTouchStart={(e) => {
            e.preventDefault();
            onStartHold(1);
          }}
          onTouchEnd={onEndHold}
          style={{
            width: "clamp(70px,14vw,108px)",
            height: "clamp(70px,14vw,108px)",
            background: t.btnBg,
            border: `1.5px solid ${t.btnBorder}`,
            borderRadius: "50%",
            cursor: "pointer",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            outline: "none",
            userSelect: "none",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              width: raiseProgress + "%",
              height: "3px",
              background: "#3a9e6e",
              transition: raiseProgress === 0 ? "width 0.2s" : "none",
            }}
          />
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <line
              x1="10"
              y1="18"
              x2="10"
              y2="2"
              stroke="#666"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
            <polyline
              points="4,8 10,2 16,8"
              stroke="#666"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
          <span
            style={{
              fontSize: "clamp(7px,1.3vw,10px)",
              color: t.topText,
              letterSpacing: "2.5px",
            }}
          >
            RAISE
          </span>
        </button>
      </div>

      {/* SETTINGS BTN */}
      <button
        onClick={onGoSettings}
        style={{
          position: "absolute",
          bottom: "12px",
          right: "16px",
          background: "none",
          border: `1px solid ${t.panelBorder}`,
          borderRadius: "8px",
          padding: "5px 10px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "6px",
          outline: "none",
          zIndex: 4,
        }}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <circle cx="7" cy="7" r="2" stroke="#555" strokeWidth="1.2" />
          <path
            d="M7 1v1.5M7 11.5V13M1 7h1.5M11.5 7H13M2.93 2.93l1.06 1.06M10.01 10.01l1.06 1.06M2.93 11.07l1.06-1.06M10.01 3.99l1.06-1.06"
            stroke="#555"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        </svg>
        <span style={{ fontSize: "9px", color: "#555", letterSpacing: "2px" }}>
          SETTINGS
        </span>
      </button>
    </div>
  );
}

function SettingsScreen({ night, onToggleMode, onGoHome }) {
  const t = night ? NIGHT : DAY;
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: t.panelBg,
        border: `2px solid ${t.panelBorder}`,
        borderRadius: "12px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        boxSizing: "border-box",
        fontFamily: "'Courier New', monospace",
        flexDirection: "column",
      }}
    >
      {/* TOP BAR */}
      <div
        style={{
          position: "absolute",
          top: "3.5%",
          left: "2.6%",
          right: "2.6%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span
          style={{
            fontSize: "clamp(8px,1.43vw,11px)",
            color: t.topText,
            letterSpacing: "2px",
          }}
        >
          SETTINGS
        </span>
        <span
          style={{ fontSize: "9px", color: t.dimLabel, letterSpacing: "2px" }}
        >
          SURGICAL PLATFORM CONTROL
        </span>
      </div>

      {/* CONTENT */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "24px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          {/* Sun */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "5px",
            }}
          >
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <circle
                cx="11"
                cy="11"
                r="4"
                stroke={!night ? "#c4a84a" : "#666"}
                strokeWidth="1.2"
              />
              <line
                x1="11"
                y1="1"
                x2="11"
                y2="4"
                stroke={!night ? "#c4a84a" : "#666"}
                strokeWidth="1.2"
                strokeLinecap="round"
              />
              <line
                x1="11"
                y1="18"
                x2="11"
                y2="21"
                stroke={!night ? "#c4a84a" : "#666"}
                strokeWidth="1.2"
                strokeLinecap="round"
              />
              <line
                x1="1"
                y1="11"
                x2="4"
                y2="11"
                stroke={!night ? "#c4a84a" : "#666"}
                strokeWidth="1.2"
                strokeLinecap="round"
              />
              <line
                x1="18"
                y1="11"
                x2="21"
                y2="11"
                stroke={!night ? "#c4a84a" : "#666"}
                strokeWidth="1.2"
                strokeLinecap="round"
              />
              <line
                x1="3.93"
                y1="3.93"
                x2="6.05"
                y2="6.05"
                stroke={!night ? "#c4a84a" : "#666"}
                strokeWidth="1.2"
                strokeLinecap="round"
              />
              <line
                x1="15.95"
                y1="15.95"
                x2="18.07"
                y2="18.07"
                stroke={!night ? "#c4a84a" : "#666"}
                strokeWidth="1.2"
                strokeLinecap="round"
              />
              <line
                x1="18.07"
                y1="3.93"
                x2="15.95"
                y2="6.05"
                stroke={!night ? "#c4a84a" : "#666"}
                strokeWidth="1.2"
                strokeLinecap="round"
              />
              <line
                x1="6.05"
                y1="15.95"
                x2="3.93"
                y2="18.07"
                stroke={!night ? "#c4a84a" : "#666"}
                strokeWidth="1.2"
                strokeLinecap="round"
              />
            </svg>
            <span
              style={{
                fontSize: "9px",
                color: !night ? "#c4a84a" : "#555",
                letterSpacing: "1.5px",
              }}
            >
              DAY
            </span>
          </div>

          {/* Toggle */}
          <div
            onClick={onToggleMode}
            style={{
              width: "52px",
              height: "26px",
              background: night ? "#222" : "#c4a84a",
              border: "1.5px solid #444",
              borderRadius: "13px",
              position: "relative",
              cursor: "pointer",
              transition: "background 0.3s",
            }}
          >
            <div
              style={{
                width: "20px",
                height: "20px",
                background: night ? "#3a9e6e" : "#fff",
                borderRadius: "50%",
                position: "absolute",
                top: "2px",
                left: night ? "2px" : "28px",
                transition: "left 0.3s",
              }}
            />
          </div>

          {/* Moon */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "5px",
            }}
          >
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <path
                d="M20 13.5A9 9 0 0 1 8.5 2a9 9 0 1 0 11.5 11.5z"
                stroke={night ? "#3a9e6e" : "#888"}
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </svg>
            <span
              style={{
                fontSize: "9px",
                color: night ? "#3a9e6e" : "#888",
                letterSpacing: "1.5px",
              }}
            >
              NIGHT
            </span>
          </div>
        </div>

        <span
          style={{
            fontSize: "10px",
            color: night ? "#3a9e6e" : "#c4a84a",
            letterSpacing: "3px",
          }}
        >
          {night ? "NIGHT MODE ACTIVE" : "DAY MODE ACTIVE"}
        </span>
      </div>

      {/* HOME BTN */}
      <button
        onClick={onGoHome}
        style={{
          position: "absolute",
          bottom: "12px",
          left: "50%",
          transform: "translateX(-50%)",
          background: "none",
          border: `1px solid ${t.panelBorder}`,
          borderRadius: "8px",
          padding: "5px 18px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "6px",
          outline: "none",
        }}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path
            d="M1 6.5L7 1l6 5.5"
            stroke="#555"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M2.5 5.5V13h3.5V9.5h2V13H11.5V5.5"
            stroke="#555"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span style={{ fontSize: "9px", color: "#555", letterSpacing: "2px" }}>
          HOME
        </span>
      </button>
    </div>
  );
}

export default function App() {
  const [value, setValue] = useState(0);
  const [night, setNight] = useState(true);
  const [screen, setScreen] = useState("main");
  const [lowerProgress, setLowerProgress] = useState(0);
  const [raiseProgress, setRaiseProgress] = useState(0);

  const repeatRef = useRef(null);
  const holdProgressRef = useRef(null);
  const progressValRef = useRef(0);

  const stopAll = useCallback(() => {
    clearInterval(repeatRef.current);
    clearInterval(holdProgressRef.current);
    progressValRef.current = 0;
    setLowerProgress(0);
    setRaiseProgress(0);
  }, []);

  const startHold = useCallback((dir) => {
    const setProgress = dir === -1 ? setLowerProgress : setRaiseProgress;
    progressValRef.current = 0;
    holdProgressRef.current = setInterval(() => {
      progressValRef.current += 100 / (HOLD_DURATION / 30);
      setProgress(Math.min(progressValRef.current, 100));
      if (progressValRef.current >= 100) {
        clearInterval(holdProgressRef.current);
        setValue((v) => Math.min(100, Math.max(0, v + dir)));
        repeatRef.current = setInterval(() => {
          setValue((v) => Math.min(100, Math.max(0, v + dir)));
        }, 80);
      }
    }, 30);
  }, []);

  const endHold = useCallback(() => {
    stopAll();
  }, [stopAll]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#111",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          width: "min(768px, 100%)",
          aspectRatio: "768 / 288",
          position: "relative",
        }}
      >
        {screen === "main" ? (
          <MainScreen
            value={value}
            night={night}
            lowerProgress={lowerProgress}
            raiseProgress={raiseProgress}
            onStartHold={startHold}
            onEndHold={endHold}
            onGoSettings={() => setScreen("settings")}
          />
        ) : (
          <SettingsScreen
            night={night}
            onToggleMode={() => setNight((n) => !n)}
            onGoHome={() => setScreen("main")}
          />
        )}
      </div>
    </div>
  );
}
