import Link from "next/link";
import { listRooms } from "@/lib/rooms";

export const dynamic = "force-dynamic";

export default async function RoomsPage() {
  const rooms = await listRooms();

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-sm uppercase tracking-[0.2em] text-cyan-200">
          Rooms
        </p>
        <h1 className="text-3xl font-semibold text-white">Rooms Directory</h1>
        <p className="text-slate-200">
          Each room is sandboxed with its own manifest, components, assets, and
          optional backend endpoints.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        {rooms.length === 0 && (
          <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-6 text-sm text-slate-300">
            No rooms yet. Add a manifest under{" "}
            <code className="rounded bg-white/10 px-1">/content/rooms/*/index.ts</code>{" "}
            to make it appear here.
          </div>
        )}
        {rooms.map((room) => (
          <Link
            key={room.slug}
            href={`/rooms/${room.slug}`}
            className="group block rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 via-slate-900/60 to-slate-800/70 p-5 transition hover:-translate-y-[2px] hover:border-cyan-400/50"
          >
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">
              {room.slug}
            </p>
            <h2 className="text-xl font-semibold text-white group-hover:text-cyan-50">
              {room.title}
            </h2>
            {room.description && (
              <p className="text-sm text-slate-200">{room.description}</p>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
