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

  const goNext = () => router.push("/hub");

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "var(--win-desktop)",
        fontFamily: "var(--gc-font-ui)",
        color: "var(--win-text)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        userSelect: "none",
        overflow: "hidden",
      }}
    >
      {/* Setup wizard window */}
      <div
        className="win-window"
        style={{
          width: 503,
          maxWidth: "calc(100% - 24px)",
          padding: 3,
          boxShadow: "2px 2px 0 rgba(0,0,0,0.4)",
        }}
      >
        {/* Title bar */}
        <div className="win-titlebar">
          <span>afroximity.zone Setup</span>
          <div className="win-titlebar-buttons">
            <span className="win-titlebar-btn" aria-hidden>?</span>
            <span className="win-titlebar-btn" aria-hidden>×</span>
          </div>
        </div>

        {/* Body — left art panel + right content */}
        <div
          style={{
            background: "var(--win-face)",
            display: "flex",
            borderTop: "1px solid var(--win-light)",
          }}
        >
          {/* Left art panel — fake "Setup" splash banner */}
          <div
            style={{
              width: 164,
              minHeight: 314,
              background:
                "linear-gradient(180deg, #000080 0%, #1084d0 60%, #87ceeb 100%)",
              color: "#fff",
              padding: "16px 12px",
              fontFamily: "var(--gc-font-ui)",
              fontSize: 11,
              borderRight: "1px solid var(--win-shadow)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div style={{ fontFamily: "var(--gc-font-italic)", fontStyle: "italic", fontSize: 28, lineHeight: 1, fontWeight: "bold" }}>
              afro
              <br />
              ximity
              <br />
              .zone
            </div>
            <div style={{ fontSize: 10, opacity: 0.85, lineHeight: 1.4 }}>
              Personal Edition
              <br />
              Version 1.0 (1998)
              <br />
              <br />
              © 2026 afroximity
            </div>
          </div>

          {/* Right content — Welcome page */}
          <div
            style={{
              flex: 1,
              padding: "18px 22px 14px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                fontFamily: "var(--gc-font-ui)",
                fontWeight: "bold",
                fontSize: 13,
                color: "var(--win-text)",
                marginBottom: 10,
              }}
            >
              Welcome to the afroximity.zone Setup Wizard
            </div>

            <p
              style={{
                fontFamily: "var(--gc-font-body)",
                fontSize: 12,
                lineHeight: 1.5,
                color: "var(--win-text)",
                margin: "0 0 10px",
              }}
            >
              This wizard will install <b>afroximity.zone</b> on your computer.
              It is strongly recommended that you close all other programs and
              browsers before continuing.
            </p>
            <p
              style={{
                fontFamily: "var(--gc-font-body)",
                fontSize: 12,
                lineHeight: 1.5,
                color: "var(--win-text)",
                margin: "0 0 10px",
              }}
            >
              This is a personal homepage in the old sense — hand-built, on its
              own handle, away from the megacorps that turned the web into a
              mall. It will not be the prettiest thing you see this week, but
              it is mine, and it will still be here.
            </p>
            <p
              style={{
                fontFamily: "var(--gc-font-body)",
                fontSize: 12,
                lineHeight: 1.5,
                color: "var(--win-text)",
                margin: "0 0 14px",
              }}
            >
              Click <b>Next</b> to continue, or <b>Cancel</b> to exit Setup.
            </p>

            <div style={{ flex: 1 }} />

            {/* Footer divider + buttons */}
            <div
              style={{
                marginTop: 8,
                paddingTop: 10,
                borderTop: "1px solid var(--win-shadow)",
                boxShadow: "0 -1px 0 var(--win-light) inset",
                display: "flex",
                justifyContent: "flex-end",
                gap: 6,
              }}
            >
              <button
                type="button"
                className="win-button"
                style={{ minWidth: 75 }}
                disabled
                onClick={(e) => e.preventDefault()}
              >
                &lt; Back
              </button>
              <button
                type="button"
                className="win-button"
                style={{ minWidth: 75, fontWeight: "bold" }}
                onClick={goNext}
                autoFocus
              >
                Next &gt;
              </button>
              <button
                type="button"
                className="win-button"
                style={{ minWidth: 75, marginLeft: 8 }}
                onClick={goNext}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Click anywhere fallback (preserves the original "click to enter" feel) */}
      <button
        onClick={goNext}
        aria-label="Enter site"
        style={{
          position: "absolute",
          inset: 0,
          background: "transparent",
          border: 0,
          cursor: "default",
          zIndex: -1,
        }}
      />
    </div>
  );
}
