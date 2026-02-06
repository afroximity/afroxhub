import Link from "next/link";
import { listTools } from "@/lib/tools";

export const dynamic = "force-dynamic";

export default async function ToolsPage() {
  const tools = await listTools();

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-sm uppercase tracking-[0.2em] text-emerald-200">
          Tools
        </p>
        <h1 className="text-3xl font-semibold text-white">Tools Directory</h1>
        <p className="text-slate-200">
          Utilities live beside their manifests, components, assets, and optional
          API routes. Add more by dropping folders under <code className="rounded bg-white/10 px-1">/content/tools</code>.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        {tools.length === 0 && (
          <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-6 text-sm text-slate-300">
            No tools yet. Add a manifest under{" "}
            <code className="rounded bg-white/10 px-1">/content/tools/*/index.ts</code>{" "}
            to make it appear here.
          </div>
        )}
        {tools.map((tool) => (
          <Link
            key={tool.slug}
            href={`/tools/${tool.slug}`}
            className="group block rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 via-slate-900/60 to-slate-800/70 p-5 transition hover:-translate-y-[2px] hover:border-emerald-400/50"
          >
            <p className="text-xs uppercase tracking-[0.2em] text-emerald-200">
              {tool.slug}
            </p>
            <h2 className="text-xl font-semibold text-white group-hover:text-emerald-50">
              {tool.title}
            </h2>
            {tool.description && (
              <p className="text-sm text-slate-200">{tool.description}</p>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
