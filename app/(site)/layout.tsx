import Link from "next/link";
import type { ReactNode } from "react";

const NAV_LINKS = [
  { href: "/hub",   label: "Home" },
  { href: "/rooms", label: "Rooms" },
  { href: "/tools", label: "Tools" },
];

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div style={{
      backgroundColor: "var(--win-desktop)",
      minHeight: "100vh",
      fontFamily: "var(--gc-font-ui)",
      fontSize: 12,
      color: "var(--win-text)",
      padding: "16px 0",
    }}>
      <div
        className="win-window"
        style={{
          width: "1024px",
          maxWidth: "calc(100% - 16px)",
          margin: "0 auto",
          minHeight: "calc(100vh - 32px)",
          display: "flex",
          flexDirection: "column",
          padding: 3,
        }}
      >

        {/* ── TITLE BAR ── */}
        <div className="win-titlebar">
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {/* GIF: public/gifs/misc/site-logo.gif */}
            <span
              style={{
                display: "inline-block",
                width: 16,
                height: 16,
                background: "var(--win-face)",
                border: "1px solid var(--win-dark)",
                color: "var(--win-titlebar)",
                fontFamily: "var(--gc-font-ui)",
                fontWeight: "bold",
                fontSize: 12,
                lineHeight: "14px",
                textAlign: "center",
              }}
            >
              ✦
            </span>
            <span>afroximity.com — Microsoft Internet Explorer</span>
          </div>
          <div className="win-titlebar-buttons">
            <span className="win-titlebar-btn" aria-hidden>_</span>
            <span className="win-titlebar-btn" aria-hidden>□</span>
            <span className="win-titlebar-btn" aria-hidden>×</span>
          </div>
        </div>

        {/* ── MENU BAR (File / Edit / View ...) ── */}
        <div
          style={{
            display: "flex",
            gap: 14,
            padding: "3px 8px",
            background: "var(--win-face)",
            fontFamily: "var(--gc-font-ui)",
            fontSize: 12,
            color: "var(--win-text)",
            borderBottom: "1px solid var(--win-shadow)",
          }}
        >
          <span><u>F</u>ile</span>
          <span><u>E</u>dit</span>
          <span><u>V</u>iew</span>
          <span><u>F</u>avorites</span>
          <span><u>T</u>ools</span>
          <span><u>H</u>elp</span>
        </div>

        {/* ── ADDRESS BAR ── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "4px 8px",
            background: "var(--win-face)",
            borderBottom: "1px solid var(--win-shadow)",
          }}
        >
          <span style={{ fontSize: 11, color: "var(--win-text)" }}>Address</span>
          <div className="win-well" style={{ flex: 1, padding: "2px 6px", fontFamily: "var(--gc-font-code)", fontSize: 12 }}>
            http://www.afroximity.com/hub
          </div>
        </div>

        {/* ── BRAND HEADER (inside the window) ── */}
        <header
          style={{
            background: "var(--win-face)",
            padding: "10px 14px 6px",
            borderBottom: "1px solid var(--win-shadow)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <Link href="/hub" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10, color: "var(--win-text)" }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  background: "var(--win-titlebar)",
                  border: "1px solid var(--win-dark)",
                  color: "var(--win-titletext)",
                  fontFamily: "var(--gc-font-ui)",
                  fontWeight: "bold",
                  fontSize: 22,
                  lineHeight: "30px",
                  textAlign: "center",
                }}
              >
                ✦
              </div>
              <div>
                <div
                  style={{
                    fontFamily: "var(--gc-font-ui)",
                    fontWeight: "bold",
                    fontSize: 22,
                    color: "var(--win-titlebar)",
                    letterSpacing: "0.02em",
                  }}
                >
                  AFROXIMITY.COM
                </div>
                <div style={{ fontFamily: "var(--gc-font-italic)", fontStyle: "italic", fontSize: 12, color: "var(--win-text)", marginTop: 1 }}>
                  a personal mausoleum, under construction forever.
                </div>
              </div>
            </Link>

            <nav style={{ display: "flex", gap: 6 }}>
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="win-button"
                  style={{ minWidth: 64 }}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>

        {/* ── MAIN CONTENT ── */}
        <main style={{ flex: 1, padding: "10px", background: "var(--win-face)" }}>
          {children}
        </main>

        {/* ── STATUS BAR ── */}
        <footer
          style={{
            background: "var(--win-face)",
            borderTop: "1px solid var(--win-light)",
            padding: "3px 8px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 8,
            fontFamily: "var(--gc-font-ui)",
            fontSize: 11,
            color: "var(--win-text)",
          }}
        >
          <div className="win-well" style={{ flex: 1, padding: "1px 6px", fontSize: 11 }}>
            Done — afroximity.com © 2026
          </div>
          <div className="win-well" style={{ width: 110, padding: "1px 6px", fontSize: 11, textAlign: "center" }}>
            <a href="/" style={{ color: "var(--win-link)", marginRight: 4 }}>splash</a>·
            <a href="/rooms" style={{ color: "var(--win-link)", margin: "0 4px" }}>rooms</a>·
            <a href="/tools" style={{ color: "var(--win-link)", marginLeft: 4 }}>tools</a>
          </div>
        </footer>

      </div>
    </div>
  );
}
