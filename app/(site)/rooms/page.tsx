import { listRooms } from "@/lib/rooms";
import RoomLink from "@/app/(site)/RoomLink";

export const dynamic = "force-dynamic";

export default async function RoomsPage() {
  const rooms = await listRooms();

  return (
    <div style={{ fontFamily: "'Courier New', monospace", color: "#ccc" }}>

      {/* ── HEADER ── */}
      <div style={{ marginBottom: 14 }}>
        <h1 style={{
          fontFamily: "Impact, 'Arial Black', sans-serif",
          fontSize: 28,
          letterSpacing: "0.2em",
          color: "#00FF00",
          textShadow: "0 0 10px #00FF00, 0 0 20px rgba(0,255,0,0.3)",
          margin: 0,
          textTransform: "uppercase",
        }}>
          [ ROOMS DIRECTORY ]
        </h1>

        <div className="gc-marquee-wrap" style={{ marginTop: 6, marginBottom: 8 }}>
          <span
            className="gc-marquee-text"
            style={{ fontSize: 11, color: "#FF00FF", textShadow: "0 0 4px #FF00FF" }}
          >
            &nbsp;&nbsp;
            ★ NEW ★ &nbsp; kira-minimalist-murders &nbsp;
            ★ NEW ★ &nbsp; japan2026 &nbsp;
            ★ NEW ★ &nbsp; allocation-review &nbsp;
            ★ NEW ★ &nbsp; kira-minimalist-murders &nbsp;
            ★ NEW ★ &nbsp; japan2026 &nbsp;
          </span>
        </div>

        <div className="gc-divider" />

        <p style={{ fontSize: 11, color: "#555", marginTop: 8 }}>
          {/* COPY: rooms directory description — fill via enrich session */}
          Explore the zones. Each is a different world.
          &nbsp;|&nbsp; {rooms.length} zone{rooms.length !== 1 ? "s" : ""} currently accessible.
        </p>
      </div>

      {/* ── ROOM CARDS ── */}
      {rooms.length === 0 && (
        <div style={{
          border: "1px dashed #3a0066",
          padding: "16px",
          color: "#444",
          fontSize: 12,
          textAlign: "center",
        }}>
          No zones yet. Add a manifest under{" "}
          <code style={{ color: "#9D00FF" }}>/content/rooms/*/index.ts</code>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {rooms.map((room, i) => (
          <RoomLink
            key={room.slug}
            href={`/rooms/${room.slug}`}
            style={{ textDecoration: "none" }}
          >
            <div className="gc-room-card" style={{ height: "100%", boxSizing: "border-box" }}>
              {/* Address line */}
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                {/* GIF: public/gifs/bullets/star-bullet.gif */}
                <span className="gc-blink" style={{ color: "#9D00FF", fontSize: 10, flexShrink: 0 }}>
                  ◈
                </span>
                <span style={{
                  fontSize: 9,
                  color: "#9D00FF",
                  letterSpacing: "0.12em",
                  fontFamily: "'Courier New', monospace",
                }}>
                  Area51/Zone/{String(i + 1).padStart(4, "0")}
                </span>
              </div>

              {/* Title */}
              <div style={{
                fontFamily: "Impact, 'Arial Black', sans-serif",
                fontSize: 17,
                color: "#fff",
                letterSpacing: "0.05em",
                marginBottom: 4,
              }}>
                {room.title}
              </div>

              {/* Description */}
              {room.description ? (
                <div style={{ fontSize: 11, color: "#666", lineHeight: 1.5 }}>
                  {room.description}
                </div>
              ) : (
                <div style={{ fontSize: 11, color: "#333", fontStyle: "italic" }}>
                  {/* COPY: room description — fill via enrich session */}
                  [no description yet]
                </div>
              )}

              <div style={{
                marginTop: 8,
                fontSize: 10,
                color: "#00FFFF",
                textShadow: "0 0 4px #00FFFF",
                textAlign: "right",
              }}>
                ENTER THE ZONE →
              </div>
            </div>
          </RoomLink>
        ))}
      </div>

      {/* ── FOOTER NOTE ── */}
      <div className="gc-divider" style={{ marginTop: 16 }} />
      <p style={{ fontSize: 9, color: "#333", textAlign: "center", marginTop: 8 }}>
        Each room is isolated — different world, different rules.
      </p>

    </div>
  );
}
