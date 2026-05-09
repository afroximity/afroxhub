/**
 * 88×31 button batch downloader.
 *
 * Thin wrapper over gifcities.ts: prepends "88x31" to the query and defaults
 * the output category to `buttons`. People uploaded their button collections
 * to GeoCities too, so the same archive is the right source.
 *
 * Usage:
 *   pnpm assets:buttons "<theme>" --count <n> [--out buttons]
 *   npx tsx scripts/assets/buttons.ts "truck"      // → search "88x31 truck"
 *   npx tsx scripts/assets/buttons.ts "scania"     // → search "88x31 scania"
 */

import { spawnSync } from "node:child_process";
import { resolve } from "node:path";

function parseArgs(argv: string[]) {
  const positional: string[] = [];
  const flags: Record<string, string> = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith("--")) flags[a.slice(2)] = argv[++i] ?? "";
    else positional.push(a);
  }
  const theme = positional.join(" ").trim();
  if (!theme) throw new Error('usage: tsx scripts/assets/buttons.ts "<theme>" --count <n>');
  return { theme, flags };
}

function main() {
  const { theme, flags } = parseArgs(process.argv.slice(2));
  const query = `88x31 ${theme}`;
  const out = flags.out || "buttons";
  const count = flags.count || "20";

  const child = spawnSync(
    "npx",
    ["tsx", resolve(__dirname, "gifcities.ts"), query, "--count", count, "--out", out, "--prefix", `btn-${theme.replace(/\s+/g, "-")}`],
    { stdio: "inherit" },
  );
  process.exit(child.status ?? 0);
}

main();
