"use client";

/**
 * Win98 InstallShield-style room transition.
 *
 * Phase 1: "Installing" — fake progress bar, scrolling file-copy log,
 *          file/folder/disk illusion. Auto-advances when bar hits 100%.
 * Phase 2: "Setup Complete" — Finish button. Click → onDone() → room reveals.
 *
 * Component name + signature kept for RoomRenderer.tsx compatibility.
 */

import { useEffect, useMemo, useRef, useState } from "react";

type Props = { slug: string; onDone?: () => void };

const FILE_TEMPLATES = [
  "windows/system32/{slug}.dll",
  "windows/system32/{slug}.ocx",
  "{slug}/assets/index.idx",
  "{slug}/assets/sprites/01.gif",
  "{slug}/assets/sprites/02.gif",
  "{slug}/assets/sprites/03.gif",
  "{slug}/sounds/intro.wav",
  "{slug}/sounds/ambient.mid",
  "{slug}/cursors/default.cur",
  "{slug}/cursors/link.ani",
  "{slug}/data/manifest.dat",
  "{slug}/data/strings.txt",
  "{slug}/fonts/serif.fnt",
  "{slug}/fonts/sans.fnt",
  "{slug}/wallpapers/01.bmp",
  "{slug}/wallpapers/02.bmp",
  "{slug}/dlls/decoration.dll",
  "{slug}/dlls/glitter.dll",
  "{slug}/dlls/marquee.dll",
  "{slug}/scripts/onload.bat",
  "{slug}/registry/keys.reg",
  "{slug}/locales/en-us.lng",
  "{slug}/locales/tr-tr.lng",
  "shared/gifs/skull-flame.gif",
  "shared/gifs/spinning-globe.gif",
  "shared/gifs/under-construction.gif",
  "shared/buttons/netscape4.gif",
  "shared/buttons/html40.gif",
  "shared/midi/welcome.mid",
];

const DURATION_MS = 3200; // total install time
const FRAME_MS = 60;

export default function InstallTransition({ slug, onDone }: Props) {
  const label = slug.toUpperCase().replace(/-/g, " ");
  const fileList = useMemo(
    () => FILE_TEMPLATES.map(t => t.replace(/\{slug\}/g, slug)),
    [slug],
  );

  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<"install" | "complete">("install");
  const [logIndex, setLogIndex] = useState(0);
  const startedAt = useRef<number | null>(null);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    function tick(t: number) {
      if (startedAt.current === null) startedAt.current = t;
      const elapsed = t - startedAt.current;
      const p = Math.min(elapsed / DURATION_MS, 1);
      setProgress(p);

      // advance scrolling file log
      const idx = Math.min(
        fileList.length - 1,
        Math.floor(p * fileList.length * 1.4),
      );
      setLogIndex(idx);

      if (p < 1) {
        frameRef.current = requestAnimationFrame(tick);
      } else {
        setPhase("complete");
      }
    }
    frameRef.current = requestAnimationFrame(tick);
    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, [fileList.length]);

  // Visible window of recent files (scrolling effect)
  const WINDOW = 6;
  const visible = fileList.slice(Math.max(0, logIndex - WINDOW + 1), logIndex + 1);
  const currentFile = fileList[logIndex] ?? "";
  const pctText = `${Math.floor(progress * 100)}%`;

  // Win98 progress bar = stack of vertical blue blocks separated by 1px gaps
  const TOTAL_BLOCKS = 28;
  const filledBlocks = Math.round(progress * TOTAL_BLOCKS);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9998,
        background: "var(--win-desktop)",
        fontFamily: "var(--gc-font-ui)",
        color: "var(--win-text)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        userSelect: "none",
      }}
      onKeyDown={(e) => {
        if (phase === "complete" && (e.key === "Enter" || e.key === " ")) {
          onDone?.();
        }
      }}
      tabIndex={-1}
    >
      <div
        className="win-window"
        style={{
          width: 460,
          maxWidth: "calc(100% - 24px)",
          padding: 3,
          boxShadow: "2px 2px 0 rgba(0,0,0,0.4)",
        }}
      >
        {/* Title bar */}
        <div className="win-titlebar">
          <span>
            {phase === "install"
              ? `afroximity.zone Setup — Installing ${label}`
              : "Setup Complete"}
          </span>
          <div className="win-titlebar-buttons">
            <span className="win-titlebar-btn" aria-hidden>?</span>
            <span className="win-titlebar-btn" aria-hidden>×</span>
          </div>
        </div>

        {phase === "install" ? (
          <div
            style={{
              background: "var(--win-face)",
              padding: "16px 18px 14px",
              borderTop: "1px solid var(--win-light)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 14,
              }}
            >
              {/* Animated 'copying files' icon — folder + paper sliding */}
              <div style={{ width: 56, height: 56, position: "relative", flexShrink: 0 }}>
                {/* destination folder */}
                <div
                  style={{
                    position: "absolute",
                    bottom: 4,
                    right: 0,
                    width: 36,
                    height: 28,
                    background: "#ffd86b",
                    border: "1px solid #000",
                    boxShadow: "inset -1px -1px 0 #b8893a",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    bottom: 26,
                    right: 6,
                    width: 14,
                    height: 5,
                    background: "#ffd86b",
                    border: "1px solid #000",
                    borderBottom: 0,
                  }}
                />
                {/* source folder */}
                <div
                  style={{
                    position: "absolute",
                    top: 4,
                    left: 0,
                    width: 36,
                    height: 28,
                    background: "#ffd86b",
                    border: "1px solid #000",
                    boxShadow: "inset -1px -1px 0 #b8893a",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    top: -2,
                    left: 6,
                    width: 14,
                    height: 5,
                    background: "#ffd86b",
                    border: "1px solid #000",
                    borderBottom: 0,
                  }}
                />
                {/* flying paper */}
                <div
                  style={{
                    position: "absolute",
                    width: 10,
                    height: 12,
                    background: "#fff",
                    border: "1px solid #000",
                    animation: "gc-file-fly 0.9s linear infinite",
                  }}
                />
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontFamily: "var(--gc-font-body)",
                    fontSize: 12,
                    color: "var(--win-text)",
                    marginBottom: 4,
                  }}
                >
                  Copying files...
                </div>
                <div
                  style={{
                    fontFamily: "var(--gc-font-code)",
                    fontSize: 11,
                    color: "var(--win-text)",
                    background: "var(--win-panel)",
                    border: "1px solid var(--win-shadow)",
                    padding: "2px 6px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                  title={currentFile}
                >
                  {currentFile}
                </div>
              </div>
            </div>

            {/* Win98-style progress bar */}
            <div style={{ marginTop: 14 }}>
              <div
                style={{
                  fontFamily: "var(--gc-font-body)",
                  fontSize: 12,
                  marginBottom: 4,
                }}
              >
                {pctText} Complete
              </div>
              <div
                className="win-bevel-in"
                style={{
                  height: 22,
                  padding: 2,
                  display: "flex",
                  gap: 2,
                  background: "var(--win-panel)",
                }}
              >
                {Array.from({ length: TOTAL_BLOCKS }).map((_, i) => (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      background: i < filledBlocks ? "var(--win-titlebar)" : "transparent",
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Scrolling log */}
            <div
              className="win-bevel-in"
              style={{
                marginTop: 12,
                background: "var(--win-panel)",
                fontFamily: "var(--gc-font-code)",
                fontSize: 10,
                color: "#444",
                padding: "4px 6px",
                height: 88,
                overflow: "hidden",
              }}
            >
              {visible.map((f, i) => (
                <div
                  key={`${logIndex}-${i}`}
                  style={{
                    opacity: 0.4 + (i / WINDOW) * 0.6,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  &gt; {f}
                </div>
              ))}
            </div>

            {/* Cancel (disabled, like real installers) */}
            <div
              style={{
                marginTop: 14,
                paddingTop: 10,
                borderTop: "1px solid var(--win-shadow)",
                boxShadow: "0 -1px 0 var(--win-light) inset",
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <button
                type="button"
                className="win-button"
                style={{ minWidth: 75, opacity: 0.7 }}
                disabled
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div
            style={{
              background: "var(--win-face)",
              padding: "16px 18px 14px",
              borderTop: "1px solid var(--win-light)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div style={{ display: "flex", gap: 14 }}>
              {/* Big checkmark icon */}
              <div
                style={{
                  width: 48,
                  height: 48,
                  flexShrink: 0,
                  background: "#fff",
                  border: "1px solid var(--win-dark)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 32,
                  lineHeight: 1,
                  color: "#008000",
                  fontWeight: "bold",
                }}
              >
                ✓
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontFamily: "var(--gc-font-ui)",
                    fontWeight: "bold",
                    fontSize: 13,
                    marginBottom: 6,
                  }}
                >
                  {label} has been installed.
                </div>
                <p
                  style={{
                    fontFamily: "var(--gc-font-body)",
                    fontSize: 12,
                    lineHeight: 1.5,
                    margin: 0,
                  }}
                >
                  Setup has finished installing the room on your computer.
                  Click <b>Finish</b> to enter <b>{label}</b>.
                </p>
              </div>
            </div>

            <div
              style={{
                marginTop: 18,
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
              >
                &lt; Back
              </button>
              <button
                type="button"
                className="win-button"
                style={{ minWidth: 75, fontWeight: "bold" }}
                autoFocus
                onClick={() => onDone?.()}
              >
                Finish
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
