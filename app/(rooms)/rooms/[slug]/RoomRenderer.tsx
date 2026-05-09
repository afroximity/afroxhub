"use client";

import dynamic from "next/dynamic";
import { useState, useEffect, useRef } from "react";
import type { ComponentType } from "react";
import { roomRegistry } from "@/content/rooms/registry";
import GlitchTransition from "@/app/(rooms)/GlitchTransition";

const roomComponents = Object.fromEntries(
  Object.entries(roomRegistry).map(([slug, loader]) => [
    slug,
    dynamic(loader as () => Promise<{ default: ComponentType }>, {
      ssr: false,
      // No loading fallback — glitch (when shown) covers the load time.
      // Direct URL visitors see nothing while the room JS chunk loads (brief blank),
      // which is fine and consistent with the room being a self-contained world.
      loading: () => null,
    }),
  ]),
) as Record<keyof typeof roomRegistry, ComponentType>;

type RoomRendererProps = {
  slug: string;
};

export default function RoomRenderer({ slug }: RoomRendererProps) {
  const [showGlitch, setShowGlitch] = useState(false);
  const [ready, setReady] = useState(false);
  const checked = useRef(false);

  useEffect(() => {
    if (checked.current) return;
    checked.current = true;

    const fromHub = sessionStorage.getItem("gc-from-hub");
    if (fromHub) {
      sessionStorage.removeItem("gc-from-hub");
      setShowGlitch(true);
    }
    setReady(true);
  }, []);

  const Component = roomComponents[slug as keyof typeof roomComponents];

  if (!Component) {
    return (
      <div style={{
        position: "fixed",
        inset: 0,
        background: "#000",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Courier New', monospace",
        color: "#9D00FF",
        gap: 12,
      }}>
        <div style={{ fontSize: 32, letterSpacing: "0.2em" }}>ERROR</div>
        <div style={{ fontSize: 12, color: "#FF0000" }}>
          No renderer registered for: {slug}
        </div>
        <a href="/rooms" style={{ fontSize: 11, color: "#555", textDecoration: "none", marginTop: 16 }}>
          ← return to directory
        </a>
      </div>
    );
  }

  return (
    <>
      {/* Room always mounts and loads in background */}
      <Component />
      {/* Glitch overlays on top while it plays, then unmounts itself */}
      {ready && showGlitch && (
        <GlitchTransition slug={slug} onDone={() => setShowGlitch(false)} />
      )}
    </>
  );
}
