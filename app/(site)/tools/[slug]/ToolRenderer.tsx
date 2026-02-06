"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import { toolRegistry } from "@/content/tools/registry";

const toolComponents = Object.fromEntries(
  Object.entries(toolRegistry).map(([slug, loader]) => [
    slug,
    dynamic(loader as () => Promise<{ default: ComponentType }>, {
      ssr: false,
      loading: () => (
        <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
          Loading tool...
        </div>
      ),
    }),
  ]),
) as Record<keyof typeof toolRegistry, ComponentType>;

type ToolRendererProps = {
  slug: string;
};

export default function ToolRenderer({ slug }: ToolRendererProps) {
  const Component = toolComponents[slug as keyof typeof toolComponents];
  if (!Component) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
        No client renderer registered for this tool.
      </div>
    );
  }
  return <Component />;
}
