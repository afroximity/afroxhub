"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function SplashGate() {
  const router = useRouter();

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") router.push("/hub");
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [router]);

  return (
    /*
     * position:fixed + z-index:9999 breaks out of the (site) layout visually.
     * The geocities site chrome renders behind this — invisible to the user.
     */
    <div
      onClick={() => router.push("/hub")}
      style={{
        position: "fixed",
        backgroundImage: "url('https://file.garden/ZWlUCY4S7Xz2vypS/archived%20backgrounds/colours/purple/backg130.jpg')",
        backgroundRepeat: "repeat",
        inset: 0,
        zIndex: 9999,
        background: "#000000",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        userSelect: "none",
        fontFamily: "'Courier New', monospace",
        overflow: "hidden",
      }}
    >
      {/* Animated neon corner borders — CSS placeholder until real flame border GIF */}
      {/* GIF: public/gifs/flames/border-fire-top.gif */}
      <div style={{
        position: "absolute",
        inset: 0,
        border: "3px solid transparent",
        animation: "gc-pulse-border 2.5s ease-in-out infinite",
        pointerEvents: "none",
      }} />

      {/* Top-left corner accent */}
      <div style={{
        position: "absolute",
        top: 16,
        left: 16,
        width: 60,
        height: 60,
        borderTop: "2px solid #9D00FF",
        borderLeft: "2px solid #9D00FF",
        animation: "gc-pulse-border 2s ease-in-out infinite",
      }} />
      <div style={{
        position: "absolute",
        top: 16,
        right: 16,
        width: 60,
        height: 60,
        borderTop: "2px solid #9D00FF",
        borderRight: "2px solid #9D00FF",
        animation: "gc-pulse-border 2s ease-in-out infinite 0.5s",
      }} />
      <div style={{
        position: "absolute",
        bottom: 16,
        left: 16,
        width: 60,
        height: 60,
        borderBottom: "2px solid #9D00FF",
        borderLeft: "2px solid #9D00FF",
        animation: "gc-pulse-border 2s ease-in-out infinite 1s",
      }} />
      <div style={{
        position: "absolute",
        bottom: 16,
        right: 16,
        width: 60,
        height: 60,
        borderBottom: "2px solid #9D00FF",
        borderRight: "2px solid #9D00FF",
        animation: "gc-pulse-border 2s ease-in-out infinite 1.5s",
      }} />

      {/* GIF slot: skull or flame centerpiece */}
      {/* GIF: public/gifs/skulls/burning-skull.gif */}
      <div style={{
        width: 100,
        height: 100,
        marginBottom: 32,
        background: "radial-gradient(circle, #3a0066 0%, #000 70%)",
        border: "1px solid #9D00FF",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 40,
        animation: "gc-float 3s ease-in-out infinite",
        boxShadow: "0 0 20px #9D00FF, 0 0 40px rgba(157,0,255,0.3)",
      }}>
        ☠
      </div>

      {/* Main title */}
      <h1
        className="gc-blink"
        style={{
          fontFamily: "var(--font-vt323), Impact, 'Arial Black', sans-serif",
          fontSize: "clamp(36px, 8vw, 80px)",
          letterSpacing: "0.3em",
          textTransform: "uppercase",
          color: "#FF00FF",
          textShadow: "0 0 10px #FF00FF, 0 0 30px rgba(255,0,255,0.5), 0 0 60px rgba(255,0,255,0.2), 3px 3px 0 #660033",
          margin: 0,
          textAlign: "center",
          padding: "0 20px",
        }}
      >
        ENTER AFROXIMITY.ZONE
      </h1>

      {/* Enter button */}
      <div
        style={{
          marginTop: 32,
          border: "2px solid #9D00FF",
          padding: "10px 28px",
          fontFamily: "Impact, sans-serif",
          fontSize: 20,
          letterSpacing: "0.25em",
          color: "#9D00FF",
          textShadow: "0 0 8px #9D00FF",
          boxShadow: "0 0 12px rgba(157,0,255,0.4), inset 0 0 12px rgba(157,0,255,0.1)",
          cursor: "pointer",
          transition: "all 0.2s",
          animation: "gc-pulse-border 3s ease-in-out infinite",
        }}
      >
        [ ENTER ]
      </div>

      {/* Subtext */}
      <p style={{
        marginTop: 40,
        fontSize: 11,
        color: "#555",
        fontFamily: "'Courier New', monospace",
        letterSpacing: "0.1em",
      }}>
        best viewed in Netscape Navigator 4.0 at 800×600
      </p>

      <p style={{
        marginTop: 6,
        fontSize: 10,
        color: "#333",
        fontFamily: "'Courier New', monospace",
      }}>
        press ENTER or click anywhere to proceed
      </p>

      {/* MIDI: public/midi/xfiles-theme.mid */}
      {/* <audio autoPlay loop src="/midi/xfiles.mp3" /> */}
    </div>
  );
}
