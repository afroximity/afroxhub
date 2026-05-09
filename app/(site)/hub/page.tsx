import Link from "next/link";
import { listRooms } from "@/lib/rooms";
import { listTools } from "@/lib/tools";
import RoomLink from "@/app/(site)/RoomLink";

export const dynamic = "force-dynamic";

export default async function HubPage() {
  const [rooms, tools] = await Promise.all([listRooms(), listTools()]);

  return (
    <div style={{ fontFamily: "'Courier New', monospace", color: "#ccc" }}>

      {/* ── PAGE HEADER ── */}
      <div style={{
        textAlign: "center",
        borderBottom: "1px solid #9D00FF",
        paddingBottom: 12,
        marginBottom: 16,
      }}>
        <h1 style={{
          fontFamily: "var(--font-vt323), Impact, 'Arial Black', sans-serif",
          fontSize: "clamp(36px, 6vw, 64px)",
          letterSpacing: "0.25em",
          color: "#FF00FF",
          textShadow: "0 0 10px #FF00FF, 0 0 30px rgba(255,0,255,0.4), 2px 2px 0 #660033",
          margin: 0,
          textTransform: "uppercase",
          lineHeight: 1,
        }}>
          W E L C O M E &nbsp; T O &nbsp; T H E &nbsp; L A B
        </h1>
        {/* GIF: public/gifs/dividers/rainbow-divider.gif */}
        <div className="gc-divider" style={{ marginTop: 10 }} />
      </div>

      {/* ── THREE COLUMN TABLE ── */}
      <table className="gc-table-layout">
        <tbody>
          <tr>

            {/* ── LEFT: NAV ── */}
            <td className="gc-nav-col" style={{ padding: "12px 10px" }}>
              <p style={{
                fontFamily: "Impact, sans-serif",
                fontSize: 13,
                letterSpacing: "0.2em",
                color: "#9D00FF",
                textShadow: "0 0 6px #9D00FF",
                marginBottom: 10,
                borderBottom: "1px solid #9D00FF",
                paddingBottom: 4,
              }}>
                ══ NAVIGATE ══
              </p>

              <nav style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <Link href="/hub" className="gc-nav-link">⌂ Home</Link>
                <Link href="/rooms" className="gc-nav-link">▸ Rooms</Link>
                <Link href="/tools" className="gc-nav-link">▸ Tools</Link>
                {/* COPY: add personal section links once rooms exist */}
                <span className="gc-nav-link" style={{ color: "#555", cursor: "default" }}>▸ Guestbook</span>
                <span className="gc-nav-link" style={{ color: "#555", cursor: "default" }}>▸ Links</span>
              </nav>

              <div style={{ marginTop: 16 }}>
                <hr style={{ border: "none", borderTop: "1px dotted #9D00FF", margin: "8px 0" }} />
                {/* GIF: public/gifs/misc/spinning-at.gif */}
                <div className="gc-gif-slot" style={{ width: 30, height: 30, fontSize: 18, margin: "0 auto 4px" }}>
                  @
                </div>
                <a
                  href="mailto:{/* COPY: email — fill via enrich session */}"
                  style={{ fontSize: 10, color: "#00FFFF", display: "block", textAlign: "center", textDecoration: "none" }}
                >
                  contact
                </a>
              </div>

              <div style={{ marginTop: 16 }}>
                <hr style={{ border: "none", borderTop: "1px dotted #9D00FF", margin: "8px 0" }} />
                <p style={{ fontSize: 10, color: "#444", textAlign: "center" }}>
                  ═══════════
                </p>
                <p style={{ fontSize: 9, color: "#333", textAlign: "center" }}>
                  {rooms.length} room{rooms.length !== 1 ? "s" : ""}<br />
                  {tools.length} tool{tools.length !== 1 ? "s" : ""}
                </p>
              </div>
            </td>

            {/* ── CENTER: MAIN CONTENT ── */}
            <td style={{ padding: "12px 16px", verticalAlign: "top" }}>

              {/* Scrolling marquee */}
              <div className="gc-marquee-wrap" style={{ marginBottom: 12 }}>
                <span
                  className="gc-marquee-text"
                  style={{ fontSize: 12, color: "#00FF00", textShadow: "0 0 4px #00FF00" }}
                >
                  {/* COPY: marquee greeting text — fill via enrich session */}
                  &nbsp;&nbsp;&nbsp;&nbsp;★ WELCOME ★ &nbsp;&nbsp;&nbsp;&nbsp;★ WELCOME ★ &nbsp;&nbsp;&nbsp;&nbsp;★ WELCOME ★ &nbsp;&nbsp;&nbsp;&nbsp;
                </span>
              </div>

              {/* Welcome manifesto */}
              <div style={{
                border: "1px solid #3a0066",
                background: "rgba(10,0,20,0.8)",
                padding: "12px 14px",
                marginBottom: 14,
              }}>
                <p style={{
                  fontFamily: "Impact, sans-serif",
                  fontSize: 16,
                  color: "#9D00FF",
                  letterSpacing: "0.1em",
                  marginBottom: 8,
                }}>
                  ▌ ABOUT THIS PAGE
                </p>
                {/* COPY: welcome manifesto — fill via enrich session */}
                <p style={{ fontSize: 12, lineHeight: 1.7, color: "#888", fontStyle: "italic" }}>
                  [ This page is under construction. Check back soon. ]
                </p>
              </div>

              {/* Under construction notice */}
              {/* GIF: public/gifs/construction/under-construction.gif */}
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 14,
                padding: "8px 12px",
                border: "1px dashed #FFD700",
                background: "rgba(30, 20, 0, 0.8)",
              }}>
                <div className="gc-gif-slot gc-blink" style={{ width: 40, height: 40, flexShrink: 0, fontSize: 20 }}>
                  🚧
                </div>
                <span style={{ fontSize: 11, color: "#FFD700" }}>
                  UNDER CONSTRUCTION — Come back soon!
                </span>
              </div>

              {/* Rooms preview */}
              {rooms.length > 0 && (
                <div style={{ marginBottom: 14 }}>
                  <p style={{
                    fontFamily: "Impact, sans-serif",
                    fontSize: 14,
                    letterSpacing: "0.15em",
                    color: "#00FFFF",
                    textShadow: "0 0 6px #00FFFF",
                    borderBottom: "1px solid #00FFFF",
                    paddingBottom: 4,
                    marginBottom: 8,
                  }}>
                    ▌ ROOMS [ {rooms.length} ]
                  </p>
                  {rooms.slice(0, 3).map((room) => (
                    <RoomLink key={room.slug} href={`/rooms/${room.slug}`} className="gc-room-card" style={{ display: "block" }}>
                      <span style={{ fontSize: 9, color: "#9D00FF", letterSpacing: "0.1em" }}>
                        Area51/{room.slug.toUpperCase()}/
                      </span>
                      <br />
                      <span style={{ fontSize: 13, color: "#fff", fontFamily: "Impact, sans-serif" }}>
                        {room.title}
                      </span>
                    </RoomLink>
                  ))}
                  {rooms.length > 3 && (
                    <Link href="/rooms" style={{ fontSize: 11, color: "#9D00FF", display: "block", marginTop: 4, textAlign: "right" }}>
                      + {rooms.length - 3} more →
                    </Link>
                  )}
                </div>
              )}

              {/* Last updated */}
              <p style={{ fontSize: 10, color: "#444", marginTop: 8 }}>
                ── Last Updated: 2026-05-03 ──
              </p>
            </td>

            {/* ── RIGHT: SIDEBAR / WIDGETS ── */}
            <td className="gc-sidebar-col" style={{ padding: "12px 8px", textAlign: "center" }}>

              {/* Visitor counter */}
              <div style={{ marginBottom: 12 }}>
                <p style={{ fontSize: 9, color: "#9D00FF", letterSpacing: "0.1em", marginBottom: 4 }}>
                  YOU ARE VISITOR
                </p>
                <div className="gc-counter">
                  #004,721
                </div>
              </div>

              <div className="gc-divider" />

              {/* GIF slot: spinning globe */}
              {/* GIF: public/gifs/globes/spinning-globe.gif */}
              <div className="gc-gif-slot gc-spin" style={{ margin: "8px auto" }}>
                🌐
              </div>

              <div className="gc-divider" />

              {/* NEW badge */}
              {/* GIF: public/gifs/badges/new-badge.gif */}
              <div className="gc-gif-slot gc-blink" style={{ margin: "8px auto", width: 60, height: 20, fontSize: 9 }}>
                ★ NEW ★
              </div>

              <div className="gc-divider" />

              {/* Webring */}
              <div style={{ marginTop: 8 }}>
                <p style={{ fontSize: 9, color: "#555", marginBottom: 4, letterSpacing: "0.1em" }}>
                  WEBRING
                </p>
                <div className="gc-webring" style={{ flexDirection: "column", gap: 2 }}>
                  <a href="#">◄ Prev</a>
                  <a href="#">Rand</a>
                  <a href="#">Next ►</a>
                </div>
              </div>

              <div className="gc-divider" style={{ marginTop: 8 }} />

              {/* GIF slot: cat or misc */}
              {/* GIF: public/gifs/misc/pixel-cat.gif */}
              <div className="gc-gif-slot gc-float" style={{ margin: "8px auto", width: 60, height: 60, fontSize: 24 }}>
                🐱
              </div>

            </td>

          </tr>
        </tbody>
      </table>

      {/* ── FOOTER ── */}
      <div style={{
        marginTop: 16,
        borderTop: "1px solid #9D00FF",
        paddingTop: 12,
        textAlign: "center",
      }}>
        {/* 88×31 button row */}
        <div style={{ display: "flex", gap: 4, justifyContent: "center", flexWrap: "wrap", marginBottom: 10 }}>
          <div className="gc-button-88">Best viewed in<br />Netscape 4.0</div>
          <div className="gc-button-88">HTML 4.0<br />Compliant</div>
          <div className="gc-button-88">Powered by<br />Notepad</div>
          <div className="gc-button-88">afroximity<br />.com</div>
          {/* GIF: public/gifs/buttons/netscape-88x31.gif */}
          {/* GIF: public/gifs/buttons/html40-88x31.gif */}
        </div>

        <p style={{ fontSize: 10, color: "#444", marginTop: 6 }}>
          <a href="#" style={{ color: "#9D00FF", marginRight: 8 }}>Sign Guestbook</a>
          <span style={{ color: "#333" }}>|</span>
          <a href="#" style={{ color: "#9D00FF", marginLeft: 8 }}>View Guestbook</a>
        </p>
        <p style={{ fontSize: 9, color: "#333", marginTop: 4 }}>
          © 2026 afroximity — All Rights Reserved
        </p>
      </div>

    </div>
  );
}
