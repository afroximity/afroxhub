/**
 * Japan 2026 — document ingestion pipeline.
 *
 * Reads /resources, classifies each file via the heuristic table below,
 * copies into /public/docs/japan2026/, and upserts metadata into Neon
 * via POST /api/japan2026 type=documents.
 *
 * Usage:
 *   npx tsx scripts/japan2026/ingest-docs.ts
 *   BASE_URL=https://your.deploy.app npx tsx scripts/japan2026/ingest-docs.ts
 *
 * Mobile flow: drop a new file into /resources, then ask Claude Code
 * to run "ingest japan2026 docs" — it executes this script.
 *
 * Adding a new doc category? Edit RULES below. Re-run.
 */

import { createHash } from "node:crypto";
import { copyFileSync, mkdirSync, readdirSync, statSync } from "node:fs";
import { extname, join, resolve } from "node:path";

type Owner = "eren" | "zenci" | "ossan" | "shared";
type Lang = "tr" | "en" | null;

type Rule = {
  match: (name: string) => boolean;
  owner: Owner;
  category: string;
  doc_type: string;
  slug: string;
  lang: Lang;
  title: string;
  meta?: Record<string, unknown>;
};

const SKIP = new Set<string>([
  "passport.pdf",            // physical only
  "bilet.pdf",               // out of scope (bus ticket)
  "jp otel-1.pdf",           // duplicate of jp otel.pdf
  "rip.html",                // tooling reference, not a doc
  "ripped.html",             // tooling reference, not a doc
  "selected-car.png",        // moved to /public/japan2026/nissan
  "nissan1.jpg", "nissan2.jpg", "nissan3.jpg", "nissan4.jpg",
  "nissan5p1.jpg", "nissan5p2.jpg", "nissan6-7.jpg", "nissan7-8.jpg",
  "eren.png", "ossan.png", "zenci.png",  // persona avatars, in /public/japan2026/avatars
]);

const nfc = (s: string) => s.normalize("NFC");
const eq = (a: string) => (n: string) => nfc(n) === nfc(a);
const startsWith = (a: string) => (n: string) => nfc(n).startsWith(nfc(a));

// Order matters: first matching rule wins.
const RULES: Rule[] = [
  {
    match: eq("eren-flight-ticket-en.pdf"),
    owner: "eren", category: "ticket", doc_type: "flight-ticket", slug: "flight-ticket",
    lang: "en", title: "Eren · Flight ticket",
    meta: { pnr: "9OY2JB", carrier: "MIAT", schedule_canonical: true },
  },
  {
    match: eq("ossan-flight-ticket-en.pdf"),
    owner: "ossan", category: "ticket", doc_type: "flight-ticket", slug: "flight-ticket",
    lang: "en", title: "Ossan · Flight ticket",
    meta: { carrier: "MIAT", schedule_canonical: true },
  },
  {
    match: eq("zenci-flight-ticket-en.pdf"),
    owner: "zenci", category: "ticket", doc_type: "flight-ticket", slug: "flight-ticket",
    lang: "en", title: "Zenci · Flight ticket",
    meta: { pnr: "HAIWZK", airline_pnr: "9NVSB3", carrier: "MIAT", schedule_canonical: true },
  },
  {
    match: eq("Burak Seyahat Sigortası Poliçesi.pdf"),
    owner: "zenci", category: "insurance", doc_type: "travel-insurance", slug: "travel-insurance",
    lang: "tr", title: "Zenci · Seyahat sigortası poliçesi",
    meta: { insurer: "HEPİYİ" },
  },
  // Ossan insurance — two language copies of same policy 600000003104129
  {
    match: eq("600000003104129_bd2735b4-6569-4af8-9381-983bee5a3afb.pdf"),
    owner: "ossan", category: "insurance", doc_type: "travel-insurance", slug: "travel-insurance",
    lang: "tr", title: "Ossan · Seyahat sigortası (TR)",
    meta: { policy_no: "600000003104129", insurer: "HEPİYİ" },
  },
  {
    match: eq("600000003104129_cc21d48d-81fe-43d9-8f7e-0d8f6a5af5b0.pdf"),
    owner: "ossan", category: "insurance", doc_type: "travel-insurance", slug: "travel-insurance",
    lang: "en", title: "Ossan · Travel insurance (EN)",
    meta: { policy_no: "600000003104129", insurer: "HEPİYİ" },
  },
  // Eren insurance — policy 600000003104383
  {
    match: eq("600000003104383_5ff0b791-477d-4511-9cea-531fa91ad82c.pdf"),
    owner: "eren", category: "insurance", doc_type: "travel-insurance", slug: "travel-insurance",
    lang: "tr", title: "Eren · Seyahat sigortası (TR)",
    meta: { policy_no: "600000003104383", insurer: "HEPİYİ" },
  },
  {
    match: eq("600000003104383_a25bea04-c198-4404-b1a7-ec858369838c.pdf"),
    owner: "eren", category: "insurance", doc_type: "travel-insurance", slug: "travel-insurance",
    lang: "en", title: "Eren · Travel insurance (EN)",
    meta: { policy_no: "600000003104383", insurer: "HEPİYİ" },
  },
  {
    match: eq("WhatsApp Image 2026-05-02 at 13.06.15.jpeg"),
    owner: "eren", category: "visa-qr", doc_type: "visit-japan-web", slug: "visit-japan-web-qr",
    lang: null, title: "Eren · Visit Japan Web QR",
    meta: { qr_for: "Immigration + Customs" },
  },
  {
    match: eq("WhatsApp Image 2026-05-03 at 14.07.07.jpeg"),
    owner: "ossan", category: "visa-qr", doc_type: "visit-japan-web", slug: "visit-japan-web-qr",
    lang: null, title: "Ossan · Visit Japan Web QR",
    meta: { qr_for: "Immigration + Customs" },
  },
  {
    match: eq("WhatsApp Image 2026-05-03 at 14.14.13.jpeg"),
    owner: "ossan", category: "criminal-record", doc_type: "adli-sicil-kaydi", slug: "adli-sicil-kaydi",
    lang: "tr", title: "Ossan · Adli Sicil Kaydı (Japonya için)",
    meta: { issued_by: "T.C. Adalet Bakanlığı" },
  },
  {
    match: eq("jp otel.pdf"),
    owner: "shared", category: "hotel", doc_type: "hotel-confirmation", slug: "hotel-hanabi-tokyo",
    lang: "tr", title: "Hanabi Hotel · Tokyo (11–18 May)",
    meta: { confirmation: "5001.805.511", pin: "4826", booked_by: "zenci",
            check_in: "2026-05-11", check_out: "2026-05-18" },
  },
  {
    match: eq("osakaotel.pdf"),
    owner: "shared", category: "hotel", doc_type: "hotel-confirmation", slug: "hotel-hillarys-osaka",
    lang: "en", title: "Hotel Hillarys · Osaka (12–13 May)",
    meta: { confirmation: "6237128862", booked_by: "eren",
            check_in: "2026-05-12", check_out: "2026-05-13" },
  },
  {
    match: eq("Reservation details _ NISSAN Rent a Car.pdf"),
    owner: "shared", category: "car", doc_type: "car-rental-confirmation", slug: "nissan-rental-confirmation",
    lang: "en", title: "Nissan Rent a Car · Rezervasyon onayı",
    meta: {
      reservation_no: "26050202231",
      vehicle: "NOTE e-POWER",
      capacity: 5,
      pickup_at: "2026-05-12T07:00:00",
      dropoff_at: "2026-05-14T07:00:00",
      pickup_branch: "Takadanobaba Station",
      compensation_plan: "Full Support Plan",
      options: ["ETC Card", "Drive Recorder"],
      passengers: 3,
      upgrade: "Acceptable",
      total_jpy: 19646,
      booked_by: "eren",
    },
  },
];

const MIME: Record<string, string> = {
  ".pdf": "application/pdf",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

function shortId(s: string) {
  return createHash("sha256").update(s).digest("hex").slice(0, 16);
}

async function main() {
  const repoRoot = resolve(__dirname, "..", "..");
  const resourcesDir = join(repoRoot, "public", "japan2026", "source");
  const outDir = join(repoRoot, "public", "docs", "japan2026");
  const baseUrl = process.env.BASE_URL ?? "http://localhost:3000";

  mkdirSync(outDir, { recursive: true });

  const files = readdirSync(resourcesDir).filter(n => !n.startsWith("."));
  const docs: Array<{
    id: string; slug: string; owner: Owner; category: string; doc_type: string;
    lang: Lang; title: string; original_name: string; public_path: string;
    size_bytes: number; mime: string; meta: Record<string, unknown>;
  }> = [];
  const skipped: string[] = [];
  const unclassified: string[] = [];

  for (const name of files) {
    if (SKIP.has(name)) { skipped.push(name); continue; }
    const rule = RULES.find(r => r.match(name));
    if (!rule) { unclassified.push(name); continue; }

    const ext = extname(name).toLowerCase();
    const langSuffix = rule.lang ? `__${rule.lang}` : "";
    const outName = `${rule.owner}__${rule.slug}${langSuffix}${ext}`;
    const srcPath = join(resourcesDir, name);
    const dstPath = join(outDir, outName);
    const size = statSync(srcPath).size;
    copyFileSync(srcPath, dstPath);

    docs.push({
      id: shortId(name),
      slug: rule.slug,
      owner: rule.owner,
      category: rule.category,
      doc_type: rule.doc_type,
      lang: rule.lang,
      title: rule.title,
      original_name: name,
      public_path: `/docs/japan2026/${outName}`,
      size_bytes: size,
      mime: MIME[ext] ?? "application/octet-stream",
      meta: rule.meta ?? {},
    });
  }

  // POST batch (uses x-jp26-pin to bypass cookie auth in middleware)
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const pin = process.env.JP26_PIN;
  if (pin) headers["x-jp26-pin"] = pin;
  const res = await fetch(`${baseUrl}/api/japan2026`, {
    method: "POST",
    headers,
    body: JSON.stringify({ type: "documents", docs }),
  });
  const json = await res.json().catch(() => ({}));

  console.log("─".repeat(60));
  console.log(`Japan 2026 ingestion · ${baseUrl}`);
  console.log("─".repeat(60));
  console.log(`Classified : ${docs.length}`);
  console.log(`Skipped    : ${skipped.length}  (${skipped.join(", ") || "—"})`);
  console.log(`Unclassified: ${unclassified.length}${unclassified.length ? `  (${unclassified.join(", ")})` : ""}`);
  console.log(`API response: ${res.status} ${JSON.stringify(json)}`);
  for (const d of docs) {
    console.log(`  · [${d.owner}] ${d.title}  →  ${d.public_path}`);
  }
  if (!res.ok) process.exit(1);
}

main().catch(err => { console.error(err); process.exit(1); });
