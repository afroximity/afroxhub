import Link from "next/link";
import type { ReactNode } from "react";

const NAV_LINKS = [
  { href: "/rooms", label: "Rooms" },
  { href: "/tools", label: "Tools" },
  { href: "/", label: "Home" },
];

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.18),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(139,92,246,0.18),transparent_30%),radial-gradient(circle_at_30%_90%,rgba(34,197,94,0.16),transparent_32%)]" />
      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col px-6 pb-10 pt-8">
        <header className="flex flex-col gap-4 rounded-2xl border border-white/5 bg-white/5 px-5 py-4 shadow-lg backdrop-blur">
          <div className="flex items-center justify-between gap-4">
            <Link href="/" className="group flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-cyan-400 to-emerald-400 text-slate-950 shadow-lg shadow-cyan-500/40 transition duration-300 group-hover:scale-105 group-hover:shadow-emerald-500/40" />
              <div className="leading-tight">
                <p className="text-sm uppercase tracking-[0.2em] text-cyan-200">
                  Afrox Hub
                </p>
                <p className="text-lg font-semibold text-white">
                  Experiments, Rooms & Tools
                </p>
              </div>
            </Link>
            <nav className="flex items-center gap-2 text-sm font-medium text-slate-200">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-full px-3 py-1 transition hover:bg-white/10"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
          <p className="max-w-3xl text-sm text-slate-300">
            A modular playground for rooms and tools. Each experience lives in
            its own sandboxed directory with its own assets, UI, and optional
            backend logic.
          </p>
        </header>
        <main className="mt-8 flex-1">{children}</main>
        <footer className="mt-10 text-xs text-slate-400">
          Ready to drop in new rooms and tools — just add a manifest under
          <code className="ml-1 rounded bg-white/10 px-1 py-0.5 text-[0.8em] text-slate-200">
            /content
          </code>
          .
        </footer>
      </div>
    </div>
  );
}
