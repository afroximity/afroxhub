import Link from "next/link";
import { listTools } from "@/lib/tools";

export const dynamic = "force-dynamic";

export default async function ToolsPage() {
  const tools = await listTools();

  return (
    <div style={{ fontFamily: "'Courier New', monospace", color: "#ccc" }}>

      {/* ── HEADER ── */}
      <div style={{ marginBottom: 14 }}>
        <h1 style={{
          fontFamily: "Impact, 'Arial Black', sans-serif",
          fontSize: 28,
          letterSpacing: "0.2em",
          color: "#00FFFF",
          textShadow: "0 0 10px #00FFFF, 0 0 20px rgba(0,255,255,0.3)",
          margin: 0,
          textTransform: "uppercase",
        }}>
          [ TOOLS ARCHIVE ]
        </h1>

        <div className="gc-divider" style={{ marginTop: 8 }} />

        <p style={{ fontSize: 11, color: "#555", marginTop: 8 }}>
          {/* COPY: tools directory description — fill via enrich session */}
          {tools.length} tool{tools.length !== 1 ? "s" : ""} in the archive.
        </p>
      </div>

      {/* ── TOOL CARDS ── */}
      {tools.length === 0 && (
        <div style={{
          border: "1px dashed #3a0066",
          padding: "16px",
          color: "#444",
          fontSize: 12,
          textAlign: "center",
        }}>
          No tools yet. Add a manifest under{" "}
          <code style={{ color: "#00FFFF" }}>/content/tools/*/index.ts</code>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {tools.map((tool, i) => (
          <Link
            key={tool.slug}
            href={`/tools/${tool.slug}`}
            style={{ textDecoration: "none" }}
          >
            <div
              className="gc-room-card"
              style={{
                height: "100%",
                boxSizing: "border-box",
                borderColor: "#006655",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                <span className="gc-blink" style={{ color: "#00FFFF", fontSize: 10, flexShrink: 0 }}>
                  ◈
                </span>
                <span style={{
                  fontSize: 9,
                  color: "#00FFFF",
                  letterSpacing: "0.12em",
                }}>
                  TOOL/{String(i + 1).padStart(3, "0")}
                </span>
              </div>

              <div style={{
                fontFamily: "Impact, 'Arial Black', sans-serif",
                fontSize: 17,
                color: "#fff",
                letterSpacing: "0.05em",
                marginBottom: 4,
              }}>
                {tool.title}
              </div>

              {tool.description ? (
                <div style={{ fontSize: 11, color: "#666", lineHeight: 1.5 }}>
                  {tool.description}
                </div>
              ) : (
                <div style={{ fontSize: 11, color: "#333", fontStyle: "italic" }}>
                  {/* COPY: tool description — fill via enrich session */}
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
                OPEN TOOL →
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="gc-divider" style={{ marginTop: 16 }} />
      <p style={{ fontSize: 9, color: "#333", textAlign: "center", marginTop: 8 }}>
        Utilities. Each tool persists its own state.
      </p>

    </div>
  );
}
