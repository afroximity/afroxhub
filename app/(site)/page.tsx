import Link from "next/link";
import { listRooms } from "@/lib/rooms";
import { listTools } from "@/lib/tools";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [rooms, tools] = await Promise.all([listRooms(), listTools()]);

  return (
    <div className="space-y-10">
      <section className="rounded-3xl border border-white/5 bg-gradient-to-br from-slate-900/80 via-slate-900/60 to-slate-800/70 p-8 shadow-2xl shadow-cyan-500/10 backdrop-blur">
        <p className="mb-3 inline-flex items-center rounded-full bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">
          Modular playground
        </p>
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="space-y-4">
            <h1 className="text-4xl font-semibold text-white sm:text-5xl">
              The hub for experiments, rooms, and tools.
            </h1>
            <p className="max-w-3xl text-lg text-slate-200">
              Drop any experience into <code className="rounded bg-white/10 px-1">/content</code>{" "}
              and it is instantly routable. Each room/tool is sandboxed with its
              own UI, assets, and optional backend.
            </p>
          </div>
          <div className="flex gap-3 text-sm font-medium">
            <Link
              href="/rooms"
              className="rounded-full bg-cyan-400 px-4 py-2 text-slate-900 shadow-lg shadow-cyan-400/40 transition hover:-translate-y-0.5 hover:shadow-emerald-300/30"
            >
              Browse Rooms
            </Link>
            <Link
              href="/tools"
              className="rounded-full border border-white/20 px-4 py-2 text-white transition hover:bg-white/10"
            >
              Browse Tools
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-8 md:grid-cols-2">
        <PreviewPanel
          title="Rooms"
          description="Fully isolated experiences that can be React components, iframes, games, or anything else."
          items={rooms.slice(0, 3)}
          moreHref="/rooms"
        />
        <PreviewPanel
          title="Tools"
          description="Utilities with persistence baked in. Each tool ships with its own manifest and assets."
          items={tools.slice(0, 3)}
          moreHref="/tools"
        />
      </section>
    </div>
  );
}

type PreviewPanelProps = {
  title: string;
  description: string;
  items: Array<{ slug: string; title: string; description?: string }> | [];
  moreHref: string;
};

function PreviewPanel({ title, description, items, moreHref }: PreviewPanelProps) {
  return (
    <div className="flex h-full flex-col gap-4 rounded-2xl border border-white/5 bg-white/5 p-6 shadow-lg backdrop-blur">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-white">{title}</h2>
          <p className="text-sm text-slate-300">{description}</p>
        </div>
        <Link
          href={moreHref}
          className="text-sm font-medium text-cyan-200 underline-offset-4 transition hover:text-white hover:underline"
        >
          View all →
        </Link>
      </div>
      <div className="grid gap-3">
        {items.length === 0 && (
          <p className="text-sm text-slate-400">No entries yet. Add a manifest under /content.</p>
        )}
        {items.map((item) => (
          <Link
            key={item.slug}
            href={`${moreHref}/${item.slug}`}
            className="group rounded-xl border border-white/5 bg-gradient-to-r from-white/5 to-white/0 px-4 py-3 transition hover:-translate-y-[2px] hover:border-cyan-400/50 hover:from-cyan-500/10"
          >
            <p className="text-sm uppercase tracking-[0.15em] text-cyan-200">
              {item.slug}
            </p>
            <h3 className="text-lg font-semibold text-white group-hover:text-cyan-50">
              {item.title}
            </h3>
            {item.description && (
              <p className="text-sm text-slate-300">{item.description}</p>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
