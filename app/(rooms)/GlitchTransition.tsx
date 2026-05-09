"use client";

import { useEffect, useState } from "react";

type Props = { slug: string; onDone?: () => void };

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&!?";

function randomChar() {
  return CHARS[Math.floor(Math.random() * CHARS.length)];
}

function scramble(target: string, progress: number) {
  return target
    .split("")
    .map((char, i) => (i < Math.floor(progress * target.length) ? char : randomChar()))
    .join("");
}

export default function GlitchTransition({ slug, onDone }: Props) {
  const label = slug.toUpperCase().replace(/-/g, " ");
  const [displayLabel, setDisplayLabel] = useState(scramble(label, 0));
  const [progress, setProgress] = useState(0);
  const [lat] = useState(() => (Math.random() * 180 - 90).toFixed(4));
  const [lon] = useState(() => (Math.random() * 360 - 180).toFixed(4));
  const [phase, setPhase] = useState<"glitch" | "reveal">("glitch");

  useEffect(() => {
    let frame = 0;
    const totalFrames = 48; // ~800ms at 60fps-ish
    let raf: number;

    function tick() {
      frame++;
      const p = Math.min(frame / totalFrames, 1);
      setProgress(p);

      if (p < 0.6) {
        // pure scramble
        setDisplayLabel(scramble(label, 0));
      } else {
        // reveal left-to-right
        setPhase("reveal");
        setDisplayLabel(scramble(label, (p - 0.6) / 0.4));
      }

      if (frame < totalFrames + 6) {
        raf = requestAnimationFrame(tick);
      } else {
        onDone?.();
      }
    }

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [label, onDone]);

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: "#000",
      zIndex: 9998,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'Courier New', monospace",
      overflow: "hidden",
    }}>

      {/* CRT scanlines */}
      <div style={{
        position: "absolute",
        inset: 0,
        background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)",
        pointerEvents: "none",
        zIndex: 1,
      }} />

      {/* Chromatic aberration layers */}
      <div style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: "none",
        zIndex: 0,
      }}>
        {/* Red offset */}
        <div style={{
          position: "absolute",
          fontFamily: "Impact, sans-serif",
          fontSize: "clamp(20px, 4vw, 44px)",
          letterSpacing: "0.3em",
          color: "rgba(255,0,0,0.35)",
          transform: `translate(${-3 + Math.sin(progress * Math.PI * 4) * 2}px, 1px)`,
          whiteSpace: "nowrap",
          textTransform: "uppercase",
        }}>
          {displayLabel}
        </div>
        {/* Cyan offset */}
        <div style={{
          position: "absolute",
          fontFamily: "Impact, sans-serif",
          fontSize: "clamp(20px, 4vw, 44px)",
          letterSpacing: "0.3em",
          color: "rgba(0,255,255,0.35)",
          transform: `translate(${3 + Math.cos(progress * Math.PI * 4) * 2}px, -1px)`,
          whiteSpace: "nowrap",
          textTransform: "uppercase",
        }}>
          {displayLabel}
        </div>
      </div>

      {/* Main label */}
      <div style={{
        position: "relative",
        zIndex: 2,
        fontFamily: "Impact, 'Arial Black', sans-serif",
        fontSize: "clamp(20px, 4vw, 44px)",
        letterSpacing: "0.3em",
        color: phase === "reveal" ? "#fff" : "#9D00FF",
        textShadow: phase === "reveal"
          ? "0 0 12px #fff"
          : "0 0 8px #9D00FF, 0 0 20px rgba(157,0,255,0.5)",
        textTransform: "uppercase",
        whiteSpace: "nowrap",
        transition: "color 0.2s, text-shadow 0.2s",
      }}>
        {displayLabel}
      </div>

      {/* Status line */}
      <div style={{
        position: "relative",
        zIndex: 2,
        marginTop: 24,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 6,
      }}>
        <div style={{ fontSize: 11, color: "#00FF00", letterSpacing: "0.15em" }}>
          ACCESSING ZONE<span className="gc-blink">_</span>
        </div>
        <div style={{ fontSize: 9, color: "#444", letterSpacing: "0.1em" }}>
          SECTOR: {slug} / LAT: {lat} / LONG: {lon}
        </div>

        {/* Progress bar */}
        <div style={{
          width: 200,
          height: 3,
          background: "#111",
          border: "1px solid #3a0066",
          marginTop: 8,
          overflow: "hidden",
        }}>
          <div style={{
            height: "100%",
            width: `${progress * 100}%`,
            background: "linear-gradient(90deg, #9D00FF, #00FFFF)",
            transition: "width 0.05s linear",
            boxShadow: "0 0 6px #9D00FF",
          }} />
        </div>
      </div>

      {/* Horizontal scan-tear lines (random positions) */}
      {[15, 38, 62, 79].map((top, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            top: `${top}%`,
            left: 0,
            right: 0,
            height: "2px",
            background: i % 2 === 0
              ? "rgba(157,0,255,0.4)"
              : "rgba(0,255,255,0.3)",
            animation: `gc-scanrip ${0.6 + i * 0.15}s ease-out forwards`,
            animationDelay: `${i * 0.08}s`,
            zIndex: 3,
          }}
        />
      ))}

    </div>
  );
}
