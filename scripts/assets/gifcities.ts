/**
 * GifCities batch downloader.
 *
 * Queries the Internet Archive's GifCities search API, downloads the top N
 * matching GIFs into public/gifs/<category>/, dedupes by content hash, skips
 * files already on disk, and appends provenance entries to
 * public/gifs/asset-manifest.yaml (schema from geocity.md §Preservation).
 *
 * Usage:
 *   pnpm assets:grab "<query>" --count <n> --out <category> [--prefix <slug>]
 *   npx tsx scripts/assets/gifcities.ts "skull flame" --count 30 --out skulls
 *
 * --out is the subfolder under public/gifs/ (e.g. skulls, flames, dividers).
 * --prefix is an optional filename prefix; defaults to a sanitized query.
 *
 * Re-running the same query is safe: dedupes by checksum *and* by filename.
 */

import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync, appendFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";

type GifEntry = {
  url_text: string;
  weight: number;
  gif: string;
  checksum: string;
  height: number;
  width: number;
  page: string;
};

const SEARCH_API = "https://gifcities.archive.org/api/v1/gifsearch";
const BLOB_BASE = "https://blob.gifcities.org/gifcities";

function parseArgs(argv: string[]) {
  const positional: string[] = [];
  const flags: Record<string, string> = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith("--")) {
      flags[a.slice(2)] = argv[++i] ?? "";
    } else {
      positional.push(a);
    }
  }
  const query = positional.join(" ").trim();
  const count = Number(flags.count ?? 20);
  const out = (flags.out ?? "misc").trim();
  const prefix = (flags.prefix ?? "").trim();
  if (!query) throw new Error('usage: tsx scripts/assets/gifcities.ts "<query>" --count <n> --out <category>');
  if (!Number.isFinite(count) || count <= 0) throw new Error("--count must be a positive integer");
  return { query, count, out, prefix };
}

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40) || "gif";
}

async function fetchJson<T>(url: string): Promise<T> {
  const r = await fetch(url, { headers: { "User-Agent": "afroxhub-asset-grabber/1.0" } });
  if (!r.ok) throw new Error(`GET ${url} → ${r.status}`);
  return (await r.json()) as T;
}

async function downloadBytes(url: string): Promise<Buffer> {
  const r = await fetch(url, { headers: { "User-Agent": "afroxhub-asset-grabber/1.0" } });
  if (!r.ok) throw new Error(`GET ${url} → ${r.status}`);
  const ab = await r.arrayBuffer();
  return Buffer.from(ab);
}

function sha1(b: Buffer) {
  return createHash("sha1").update(b).digest("hex");
}

async function main() {
  const { query, count, out, prefix } = parseArgs(process.argv.slice(2));
  const repoRoot = resolve(__dirname, "..", "..");
  const gifsRoot = join(repoRoot, "public", "gifs");
  const outDir = join(gifsRoot, out);
  const manifestPath = join(gifsRoot, "asset-manifest.yaml");
  mkdirSync(outDir, { recursive: true });

  const namePrefix = prefix || slugify(query);
  const today = new Date().toISOString().slice(0, 10);

  // Existing checksum index — avoid re-downloading the same content under another name.
  const seenHashes = new Set<string>();
  if (existsSync(manifestPath)) {
    const txt = readFileSync(manifestPath, "utf8");
    for (const m of txt.matchAll(/^\s*content_sha1:\s*([a-f0-9]{40})/gm)) seenHashes.add(m[1]);
  }

  const apiUrl = `${SEARCH_API}?q=${encodeURIComponent(query)}`;
  console.log(`[gifcities] querying: ${apiUrl}`);
  const results = await fetchJson<GifEntry[]>(apiUrl);
  console.log(`[gifcities] ${results.length} hits, taking top ${count}`);

  let grabbed = 0;
  let dedup = 0;
  let skipped = 0;
  const manifestEntries: string[] = [];

  for (const entry of results.slice(0, count)) {
    const blobUrl = `${BLOB_BASE}/${entry.checksum}.gif`;
    const fname = `${namePrefix}-${entry.checksum.slice(0, 10).toLowerCase()}.gif`;
    const fpath = join(outDir, fname);

    if (existsSync(fpath)) {
      skipped++;
      continue;
    }

    let bytes: Buffer;
    try {
      bytes = await downloadBytes(blobUrl);
    } catch (e) {
      console.warn(`  ✗ ${entry.checksum}: ${(e as Error).message}`);
      continue;
    }

    const hash = sha1(bytes);
    if (seenHashes.has(hash)) {
      dedup++;
      continue;
    }
    seenHashes.add(hash);

    writeFileSync(fpath, bytes);
    grabbed++;

    const id = `${out}_${namePrefix}_${entry.checksum.slice(0, 8).toLowerCase()}`;
    const altText = entry.url_text.replace(/"/g, "'");
    manifestEntries.push(
      [
        `- id: ${id}`,
        `  file: /public/gifs/${out}/${fname}`,
        `  source_page: "${entry.page}"`,
        `  source_blob: "${blobUrl}"`,
        `  source_type: archived_gif`,
        `  captured_on: ${today}`,
        `  query: "${query}"`,
        `  dimensions: ${entry.width}x${entry.height}`,
        `  content_sha1: ${hash}`,
        `  mood_tags:`,
        `    - ${out}`,
        `  alt: "${altText} (archived GeoCities gif, ${entry.width}x${entry.height})"`,
        `  license_note: "Internet Archive / GifCities — original GeoCities user content; verify before commercial use"`,
        ``,
      ].join("\n"),
    );
  }

  if (manifestEntries.length > 0) {
    if (!existsSync(manifestPath)) {
      writeFileSync(
        manifestPath,
        `# afroxhub asset manifest\n# Auto-appended by scripts/assets/gifcities.ts and scripts/assets/buttons.ts.\n# One YAML doc per asset. See geocity.md §Preservation for the schema.\n\n`,
      );
    }
    appendFileSync(manifestPath, manifestEntries.join(""));
  }

  console.log(`[gifcities] grabbed ${grabbed}, dedup ${dedup}, skipped ${skipped} → public/gifs/${out}/`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
