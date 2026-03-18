import { useState, useRef, useEffect, useCallback } from "react";

const HOLD_DURATION = 800;
const TOTAL_ARC = 628 * 0.75;
const BAT_LEVEL = 70;

function drawTicks(svgRef) {
  const svg = svgRef.current;
  if (!svg) return;
  while (svg.firstChild) svg.removeChild(svg.firstChild);
  const cx = 134.5,
    cy = 134.5,
    r = 108;
  for (let i = 0; i <= 10; i++) {
    const angle = ((135 + (i / 10) * 270) * Math.PI) / 180;
    const len = i % 5 === 0 ? 10 : 5;
    const x1 = cx + r * Math.cos(angle),
      y1 = cy + r * Math.sin(angle);
    const x2 = cx + (r - len) * Math.cos(angle),
      y2 = cy + (r - len) * Math.sin(angle);
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", x1);
    line.setAttribute("y1", y1);
    line.setAttribute("x2", x2);
    line.setAttribute("y2", y2);
    line.setAttribute("stroke", i % 5 === 0 ? "#3a3a3a" : "#252525");
    line.setAttribute("stroke-width", i % 5 === 0 ? "1.5" : "1");
    svg.appendChild(line);
  }
}

function getArcColor(v) {
  if (v === 0) return "#555";
  if (v === 100) return "#c0823a";
  if (v < 20) return "#6a6a6a";
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
  if (pct > 40) return "#3a9e6e";
  if (pct > 20) return "#c0823a";
  return "#9e3a3a";
}

export default function App() {
  const [value, setValue] = useState(50);
  const [lowerProgress, setLowerProgress] = useState(0);
  const [raiseProgress, setRaiseProgress] = useState(0);

  const ticksRef = useRef(null);
  const repeatRef = useRef(null);
  const holdProgressRef = useRef(null);
  const progressValRef = useRef(0);

  useEffect(() => {
    drawTicks(ticksRef);
  }, []);

  const arcOffset = 628 - TOTAL_ARC + (TOTAL_ARC - (value / 100) * TOTAL_ARC);

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
      const p = Math.min(progressValRef.current, 100);
      setProgress(p);
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
          background: "#1a1a1a",
          borderRadius: "12px",
          border: "2px solid #2e2e2e",
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
          }}
        >
          <span
            style={{
              fontSize: "clamp(7px, 1.3vw, 10px)",
              color: "#555",
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
                  fontSize: "clamp(7px, 1.2vw, 9px)",
                  color: "#555",
                  letterSpacing: "1px",
                }}
              >
                {BAT_LEVEL}%
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
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
                  fontSize: "clamp(7px, 1.3vw, 10px)",
                  color: "#555",
                  letterSpacing: "1px",
                }}
              >
                {getStatusLabel(value)}
              </span>
            </div>
          </div>
        </div>

        {/* LOWER BUTTON */}
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <button
            onMouseDown={() => startHold(-1)}
            onMouseUp={endHold}
            onMouseLeave={endHold}
            onTouchStart={(e) => {
              e.preventDefault();
              startHold(-1);
            }}
            onTouchEnd={endHold}
            style={{
              width: "clamp(70px, 14.3vw, 110px)",
              height: "clamp(70px, 14.3vw, 110px)",
              background: "#111",
              border: "1.5px solid #333",
              borderRadius: "50%",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
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
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <line
                x1="14"
                y1="6"
                x2="14"
                y2="22"
                stroke="#aaa"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <polyline
                points="7,16 14,22 21,16"
                stroke="#aaa"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </svg>
            <span
              style={{
                fontSize: "clamp(6px, 1.2vw, 9px)",
                color: "#666",
                letterSpacing: "2px",
              }}
            >
              LOWER
            </span>
          </button>
        </div>

        {/* CENTER DISPLAY */}
        <div
          style={{
            width: "clamp(150px, 35vw, 269px)",
            height: "clamp(150px, 35vw, 269px)",
            background: "#0d0d0d",
            border: "1.5px solid #2a2a2a",
            borderRadius: "50%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            position: "relative",
          }}
        >
          <svg
            ref={ticksRef}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
            }}
            viewBox="0 0 269 269"
          />
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1,
              marginTop: "-8px",
            }}
          >
            <span
              style={{
                fontSize: "clamp(32px, 8vw, 64px)",
                fontWeight: 200,
                color: "#e8e8e8",
                lineHeight: 1,
                letterSpacing: "-2px",
                fontFamily: "'Courier New', monospace",
              }}
            >
              {value}
            </span>
            <span
              style={{
                fontSize: "clamp(6px, 1.3vw, 10px)",
                color: "#444",
                letterSpacing: "3px",
                marginTop: "4px",
              }}
            >
              HEIGHT %
            </span>
          </div>
          <svg
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              pointerEvents: "none",
            }}
            viewBox="0 0 269 269"
          >
            <circle
              cx="134.5"
              cy="134.5"
              r="118"
              fill="none"
              stroke="#1e1e1e"
              strokeWidth="4"
              strokeDasharray="628"
              strokeDashoffset="0"
              transform="rotate(135 134.5 134.5)"
              strokeLinecap="round"
            />
            <circle
              cx="134.5"
              cy="134.5"
              r="118"
              fill="none"
              stroke={getArcColor(value)}
              strokeWidth="4"
              strokeDasharray="628"
              strokeDashoffset={arcOffset}
              transform="rotate(135 134.5 134.5)"
              strokeLinecap="round"
              style={{ transition: "stroke-dashoffset 0.15s, stroke 0.3s" }}
            />
          </svg>
        </div>

        {/* RAISE BUTTON */}
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <button
            onMouseDown={() => startHold(1)}
            onMouseUp={endHold}
            onMouseLeave={endHold}
            onTouchStart={(e) => {
              e.preventDefault();
              startHold(1);
            }}
            onTouchEnd={endHold}
            style={{
              width: "clamp(70px, 14.3vw, 110px)",
              height: "clamp(70px, 14.3vw, 110px)",
              background: "#111",
              border: "1.5px solid #333",
              borderRadius: "50%",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
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
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <line
                x1="14"
                y1="22"
                x2="14"
                y2="6"
                stroke="#aaa"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <polyline
                points="7,12 14,6 21,12"
                stroke="#aaa"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </svg>
            <span
              style={{
                fontSize: "clamp(6px, 1.2vw, 9px)",
                color: "#666",
                letterSpacing: "2px",
              }}
            >
              RAISE
            </span>
          </button>
        </div>

        {/* BOTTOM LABEL */}
        <div
          style={{
            position: "absolute",
            bottom: "4%",
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            gap: "32px",
            alignItems: "center",
          }}
        >
          <span
            style={{
              fontSize: "clamp(6px, 1.2vw, 9px)",
              color: "#333",
              letterSpacing: "2px",
            }}
          >
            0 BOTTOM
          </span>
          <span style={{ fontSize: "clamp(6px, 1.2vw, 9px)", color: "#333" }}>
            |
          </span>
          <span
            style={{
              fontSize: "clamp(6px, 1.2vw, 9px)",
              color: "#333",
              letterSpacing: "2px",
            }}
          >
            100 TOP
          </span>
        </div>
      </div>
    </div>
  );
}
