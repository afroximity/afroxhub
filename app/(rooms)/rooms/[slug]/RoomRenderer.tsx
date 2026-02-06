"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import { roomRegistry } from "@/content/rooms/registry";

const roomComponents = Object.fromEntries(
  Object.entries(roomRegistry).map(([slug, loader]) => [
    slug,
    dynamic(loader as () => Promise<{ default: ComponentType }>, {
      ssr: false,
      loading: () => (
        <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
          Loading room...
        </div>
      ),
    }),
  ]),
) as Record<keyof typeof roomRegistry, ComponentType>;

type RoomRendererProps = {
  slug: string;
};

export default function RoomRenderer({ slug }: RoomRendererProps) {
  const Component = roomComponents[slug as keyof typeof roomComponents];
  if (!Component) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
        No client renderer registered for this room.
      </div>
    );
  }
  return <Component />;
}
