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
      backgroundColor: "#0a0014",
      backgroundImage: "url('/gifs/bg/purple-lace.jpg')",
      backgroundRepeat: "repeat",
      minHeight: "100vh",
      fontFamily: "var(--gc-font-ui)",
      fontSize: 15,
      color: "#ccc",
    }}>
      <div style={{
        width: "1024px",
        maxWidth: "100%",
        margin: "0 auto",
        border: "1px solid #9D00FF",
        borderTop: "none",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}>

        {/* ── SITE HEADER ── */}
        <header style={{
          borderBottom: "2px solid #9D00FF",
          background: "linear-gradient(180deg, #1a0033 0%, #0a0014 100%)",
          padding: "0",
        }}>
          {/* Top banner row */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "10px 14px",
            borderBottom: "1px dotted #3a0066",
          }}>
            <Link href="/hub" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
              {/* GIF: public/gifs/misc/site-logo.gif */}
              <div style={{
                width: 36,
                height: 36,
                background: "radial-gradient(circle, #9D00FF 0%, #0a0014 80%)",
                border: "1px solid #9D00FF",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 18,
                boxShadow: "0 0 10px rgba(157,0,255,0.5)",
                animation: "gc-float 4s ease-in-out infinite",
              }}>
                ✦
              </div>
              <div>
                <div style={{
                  fontFamily: "var(--gc-font-scream)",
                  fontSize: 38,
                  letterSpacing: "0.18em",
                  color: "#9D00FF",
                  textShadow: "0 0 10px #9D00FF, 0 0 20px rgba(157,0,255,0.4)",
                  textTransform: "uppercase",
                }}>
                  AFROXIMITY.COM
                </div>
                <div style={{ fontFamily: "var(--gc-font-display)", fontSize: 12, color: "#888", letterSpacing: "0.05em", marginTop: 2 }}>
                  {/* COPY: site tagline — fill via enrich session */}
                  Area51 / Vault / afroxhub
                </div>
              </div>
            </Link>

            <nav style={{ display: "flex", gap: 0 }}>
              {NAV_LINKS.map((link, i) => (
                <span key={link.href} style={{ display: "flex", alignItems: "center" }}>
                  {i > 0 && <span style={{ color: "#3a0066", padding: "0 4px", fontSize: 12 }}>|</span>}
                  <Link
                    href={link.href}
                    style={{
                      fontFamily: "var(--gc-font-display)",
                      fontSize: 16,
                      color: "#00FF00",
                      textDecoration: "none",
                      padding: "3px 10px",
                      textShadow: "0 0 4px rgba(0,255,0,0.5)",
                      letterSpacing: "0.04em",
                      transition: "color 0.15s, text-shadow 0.15s",
                    }}
                  >
                    [ {link.label} ]
                  </Link>
                </span>
              ))}
            </nav>
          </div>

          {/* Animated divider */}
          <div className="gc-divider" style={{ margin: 0 }} />
        </header>

        {/* ── MAIN CONTENT ── */}
        <main style={{ flex: 1, padding: "14px" }}>
          {children}
        </main>

        {/* ── SITE FOOTER ── */}
        <footer style={{
          borderTop: "1px solid #3a0066",
          padding: "10px 14px",
          background: "rgba(0,0,0,0.6)",
          textAlign: "center",
        }}>
          <div className="gc-divider" style={{ marginBottom: 8 }} />
          <p style={{ fontFamily: "var(--gc-font-body)", fontStyle: "italic", fontSize: 12, color: "#555", letterSpacing: "0.03em" }}>
            afroximity.com — best viewed in Netscape Navigator 4.0 at 1024×768 — © 2026
          </p>
          <p style={{ fontFamily: "var(--gc-font-display)", fontSize: 11, color: "#444", marginTop: 4 }}>
            <a href="/" style={{ color: "#444", textDecoration: "none" }}>SPLASH</a>
            {" · "}
            <a href="/rooms" style={{ color: "#444", textDecoration: "none" }}>ROOMS</a>
            {" · "}
            <a href="/tools" style={{ color: "#444", textDecoration: "none" }}>TOOLS</a>
          </p>
        </footer>

      </div>
    </div>
  );
}
