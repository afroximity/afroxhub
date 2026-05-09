import Link from "next/link";
import { listRooms } from "@/lib/rooms";
import { listTools } from "@/lib/tools";
import RoomLink from "@/app/(site)/RoomLink";

export const dynamic = "force-dynamic";

const PANEL_BODY: React.CSSProperties = {
  background: "var(--win-panel)",
  border: "1px solid var(--win-dark)",
  marginTop: 3,
  padding: "10px 12px",
  fontFamily: "var(--gc-font-body)",
  fontSize: 13,
  lineHeight: 1.5,
  color: "var(--win-text)",
};

function Window({ title, children, bodyStyle }: { title: string; children: React.ReactNode; bodyStyle?: React.CSSProperties }) {
  return (
    <div className="win-window" style={{ marginBottom: 10 }}>
      <div className="win-titlebar">
        <span>{title}</span>
        <div className="win-titlebar-buttons">
          <span className="win-titlebar-btn" aria-hidden>_</span>
          <span className="win-titlebar-btn" aria-hidden>×</span>
        </div>
      </div>
      <div style={{ ...PANEL_BODY, ...bodyStyle }}>{children}</div>
    </div>
  );
}

export default async function HubPage() {
  const [rooms, tools] = await Promise.all([listRooms(), listTools()]);

  return (
    <div style={{ fontFamily: "var(--gc-font-body)", color: "var(--win-text)" }}>

      {/* ── PAGE HEADER ── */}
      <Window title="W E L C O M E . T O . T H E . L A B" bodyStyle={{ textAlign: "center", padding: "14px 12px" }}>
        <div style={{
          fontFamily: "var(--gc-font-ui)",
          fontWeight: "bold",
          fontSize: 28,
          letterSpacing: "0.06em",
          color: "var(--win-titlebar)",
          margin: 0,
        }}>
          Welcome to the Lab.
        </div>
        <div style={{ fontFamily: "var(--gc-font-italic)", fontStyle: "italic", fontSize: 13, color: "var(--win-shadow)", marginTop: 4 }}>
          {rooms.length} room{rooms.length !== 1 ? "s" : ""} · {tools.length} tool{tools.length !== 1 ? "s" : ""} · last updated 2026-05-09
        </div>
      </Window>

      {/* ── THREE COLUMN TABLE ── */}
      <table className="gc-table-layout">
        <tbody>
          <tr>

            {/* ── LEFT: NAV ── */}
            <td className="gc-nav-col">
              <Window title="navigate.exe">
                <nav style={{ display: "flex", flexDirection: "column", gap: 4, fontFamily: "var(--gc-font-ui)", fontSize: 12 }}>
                  <Link href="/hub" className="win-link">⌂ Home</Link>
                  <Link href="/rooms" className="win-link">▸ Rooms</Link>
                  <Link href="/tools" className="win-link">▸ Tools</Link>
                  <span style={{ color: "var(--win-shadow)" }}>▸ Guestbook</span>
                  <span style={{ color: "var(--win-shadow)" }}>▸ Links</span>
                </nav>

                <hr style={{ border: "none", borderTop: "1px solid var(--win-shadow)", borderBottom: "1px solid var(--win-light)", margin: "10px 0" }} />

                {/* GIF: public/gifs/misc/spinning-at.gif */}
                <div style={{ textAlign: "center" }}>
                  <div className="win-bevel-in" style={{ width: 28, height: 28, lineHeight: "24px", margin: "0 auto 4px", fontFamily: "var(--gc-font-ui)", fontWeight: "bold", fontSize: 16, color: "var(--win-titlebar)" }}>
                    @
                  </div>
                  <a href="mailto:oguzhan.ern@gmail.com" className="win-link" style={{ fontSize: 11 }}>
                    contact
                  </a>
                </div>

                <hr style={{ border: "none", borderTop: "1px solid var(--win-shadow)", borderBottom: "1px solid var(--win-light)", margin: "10px 0" }} />

                <p style={{ fontFamily: "var(--gc-font-ui)", fontSize: 11, color: "var(--win-text)", textAlign: "center", margin: 0 }}>
                  {rooms.length} room{rooms.length !== 1 ? "s" : ""}<br />
                  {tools.length} tool{tools.length !== 1 ? "s" : ""}
                </p>
              </Window>
            </td>

            {/* ── CENTER: MAIN CONTENT ── */}
            <td style={{ padding: 0, verticalAlign: "top" }}>

              {/* Marquee — sunken well, classic IE 'status text' vibe */}
              <div className="win-well gc-marquee-wrap" style={{ marginBottom: 10, padding: "4px 6px" }}>
                <span
                  className="gc-marquee-text"
                  style={{ fontFamily: "var(--gc-font-ui)", fontSize: 12, color: "var(--win-accent)" }}
                >
                  &nbsp;&nbsp;&nbsp;&nbsp;★ UNDER ETERNAL CONSTRUCTION ★ &nbsp;&nbsp;&nbsp;&nbsp;★ UNDER ETERNAL CONSTRUCTION ★ &nbsp;&nbsp;&nbsp;&nbsp;★ UNDER ETERNAL CONSTRUCTION ★ &nbsp;&nbsp;&nbsp;&nbsp;
                </span>
              </div>

              {/* Welcome manifesto */}
              <Window title="About this page">
                <p style={{ margin: 0, fontFamily: "var(--gc-font-body)", fontSize: 13, lineHeight: 1.55, color: "var(--win-text)" }}>
                  I made this because the internet stopped feeling like anyone lived here.
                  Every door now leads to the same five lobbies, and what used to be a million
                  weird front yards is a feed someone else owns. So this is me standing my
                  ground &mdash; a homepage in the old sense, hand-built, on my own handle, away
                  from the megacorps that turned the web into a mall. It will not be the
                  prettiest thing you see this week, but it is mine, and it will still be here.
                </p>
              </Window>

              {/* Under construction notice */}
              {/* GIF: public/gifs/construction/under-construction.gif */}
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 10,
                padding: "6px 10px",
                background: "#ffffcc",
                border: "1px solid var(--win-dark)",
                fontFamily: "var(--gc-font-ui)",
                fontSize: 12,
                color: "var(--win-text)",
              }}>
                <span style={{ fontSize: 16 }}>⚠</span>
                <span>Under construction. Come back soon.</span>
              </div>

              {/* Rooms preview */}
              {rooms.length > 0 && (
                <Window title={`Rooms [ ${rooms.length} ]`}>
                  {rooms.slice(0, 3).map((room) => (
                    <RoomLink
                      key={room.slug}
                      href={`/rooms/${room.slug}`}
                      style={{
                        display: "block",
                        padding: "6px 8px",
                        marginBottom: 4,
                        background: "var(--win-face)",
                        border: "1px solid var(--win-shadow)",
                        textDecoration: "none",
                        color: "var(--win-text)",
                      }}
                    >
                      <span style={{ fontFamily: "var(--gc-font-code)", fontSize: 10, color: "var(--win-shadow)" }}>
                        /{room.slug}/
                      </span>
                      <br />
                      <span style={{ fontFamily: "var(--gc-font-ui)", fontWeight: "bold", fontSize: 13, color: "var(--win-titlebar)" }}>
                        {room.title}
                      </span>
                    </RoomLink>
                  ))}
                  {rooms.length > 3 && (
                    <Link href="/rooms" className="win-link" style={{ fontSize: 11, display: "block", marginTop: 4, textAlign: "right" }}>
                      + {rooms.length - 3} more →
                    </Link>
                  )}
                </Window>
              )}

              <p style={{ fontFamily: "var(--gc-font-code)", fontSize: 10, color: "var(--win-shadow)", marginTop: 8 }}>
                ── Last Updated: 2026-05-09 ──
              </p>
            </td>

            {/* ── RIGHT: SIDEBAR / WIDGETS ── */}
            <td className="gc-sidebar-col" style={{ padding: 0 }}>

              {/* Visitor counter */}
              <Window title="Visitors">
                <p style={{ fontFamily: "var(--gc-font-ui)", fontSize: 11, color: "var(--win-text)", margin: "0 0 4px", textAlign: "center" }}>
                  YOU ARE VISITOR
                </p>
                <div className="win-bevel-in" style={{ fontFamily: "var(--gc-font-code)", fontSize: 14, color: "#000", background: "#000", padding: "2px 0", textAlign: "center", letterSpacing: "0.1em" }}>
                  <span style={{ color: "#0f0" }}>#004,721</span>
                </div>
              </Window>

              {/* GIF slot: spinning globe */}
              {/* GIF: public/gifs/globes/spinning-globe.gif */}
              <Window title="Earth">
                <div className="win-bevel-in" style={{ width: 64, height: 64, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32 }}>
                  🌐
                </div>
              </Window>

              {/* NEW badge */}
              {/* GIF: public/gifs/badges/new-badge.gif */}
              <Window title="What's new">
                <div style={{ textAlign: "center", fontFamily: "var(--gc-font-ui)", fontWeight: "bold", fontSize: 12, color: "var(--win-accent)" }}>
                  ★ NEW ★
                </div>
                <p style={{ fontFamily: "var(--gc-font-body)", fontSize: 11, color: "var(--win-text)", margin: "4px 0 0", textAlign: "center" }}>
                  Hub copy live.
                </p>
              </Window>

              {/* Webring */}
              <Window title="Webring">
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <a href="#" className="win-button" style={{ minWidth: 0, fontSize: 11, height: 21 }}>◄ Prev</a>
                  <a href="#" className="win-button" style={{ minWidth: 0, fontSize: 11, height: 21 }}>Random</a>
                  <a href="#" className="win-button" style={{ minWidth: 0, fontSize: 11, height: 21 }}>Next ►</a>
                </div>
              </Window>

              {/* GIF slot: cat or misc */}
              {/* GIF: public/gifs/misc/pixel-cat.gif */}
              <Window title="Pixel.exe">
                <div className="win-bevel-in" style={{ width: 60, height: 60, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26 }}>
                  🐱
                </div>
              </Window>

            </td>

          </tr>
        </tbody>
      </table>

      {/* ── FOOTER ── */}
      <div style={{
        marginTop: 10,
        background: "var(--win-face)",
        padding: "10px",
        borderTop: "1px solid var(--win-light)",
        textAlign: "center",
      }}>
        {/* 88×31 button row */}
        <div style={{ display: "flex", gap: 4, justifyContent: "center", flexWrap: "wrap", marginBottom: 8 }}>
          <div className="gc-button-88">Best viewed in<br />Netscape 4.0</div>
          <div className="gc-button-88">HTML 4.0<br />Compliant</div>
          <div className="gc-button-88">Powered by<br />Notepad</div>
          <div className="gc-button-88">afroximity<br />.com</div>
          {/* GIF: public/gifs/buttons/netscape-88x31.gif */}
        </div>

        <p style={{ fontFamily: "var(--gc-font-ui)", fontSize: 11, color: "var(--win-text)", marginTop: 4 }}>
          <a href="#" className="win-link">Sign Guestbook</a>
          <span style={{ color: "var(--win-shadow)", margin: "0 8px" }}>|</span>
          <a href="#" className="win-link">View Guestbook</a>
        </p>
        <p style={{ fontFamily: "var(--gc-font-ui)", fontSize: 11, color: "var(--win-shadow)", marginTop: 4 }}>
          © 2026 afroximity — All Rights Reserved
        </p>
      </div>

    </div>
  );
}
