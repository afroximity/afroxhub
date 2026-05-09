# Afroxhub — Project Instructions

## Code Exploration

Always use jCodemunch-MCP tools for code navigation. Never fall back to Read, Grep, Glob, or Bash for code exploration.
**Exception:** Use `Read` when you need to edit a file — the harness requires a `Read` before `Edit`/`Write` will succeed.

---

## Architecture

Next.js app router. Two route groups with different purposes:

- **`app/(site)/`** — the GeoCities hub shell. Hub homepage at `/hub`, rooms directory at `/rooms`, tools at `/tools`. This is the chaotic 1998-2003 world.
- **`app/(rooms)/`** — isolated room experiences. Passthrough layout. Each room owns 100% of its visual world. No hub chrome leaks in.
- **`app/(splash)/`** — the splash gate at `/`. No chrome. Full-screen entry animation.

Rooms and tools follow a **manifest + registry** pattern:
- `content/rooms/{slug}/index.ts` → manifest (slug, title, description, component loader)
- `content/rooms/{slug}/Room.tsx` → the room itself (client component, full isolation)
- `content/rooms/registry.ts` + `manifestRegistry.ts` → register both
- Rooms render via `app/(rooms)/rooms/[slug]/RoomRenderer.tsx` with `next/dynamic` + `ssr: false`

---

## Tenet A — Hub Aesthetic: Win98 Chrome

The `(site)` group is a **Windows 98 personal homepage** — IE5 browser chrome around hand-built content panels. Quiet system colors, raised/sunken bevels, navy title bars, white inner panels. The teal desktop is the wallpaper. NOT cyber-purple, NOT acid-green-on-black, NOT 2010s pixel-retro. If a screenshot looks like a tarot reader's website or a club flyer, the implementation has drifted.

This was a deliberate redirect on 2026-05-09: the saturated neon (purple/cyan/magenta/lime + glow text-shadows) read as Y2K cyber-club, not 1998 personal page. The neon `--gc-*` tokens stay defined so individual *rooms* can opt into Area51 cyber-purple, but the hub shell never uses them.

### Palette — Win98 chrome (`--win-*` in `app/globals.css`)

| Token | Value | Use |
|-------|-------|-----|
| `--win-desktop` | `#008080` | Outer page background (classic teal) |
| `--win-face` | `#c0c0c0` | Window face / chrome panels |
| `--win-light` | `#ffffff` | 3D bevel highlight (top + left edge of raised) |
| `--win-shadow` | `#808080` | 3D bevel shadow (bottom + right edge of raised) |
| `--win-dark` | `#000000` | Outer ring + dark shadow |
| `--win-titlebar` | `#000080` | Active title bar (navy) |
| `--win-titlebar-2` | `#1084d0` | Title bar gradient end |
| `--win-titletext` | `#ffffff` | Title bar text |
| `--win-panel` | `#ffffff` | Inner content surfaces |
| `--win-text` | `#000000` | Body text |
| `--win-link` | `#0000ee` | Unvisited hyperlink |
| `--win-link-visit` | `#551a8b` | Visited hyperlink |
| `--win-accent` | `#800000` | Burgundy emphasis (NEW, marquee, warnings) |

Rule: **no neon and no glow on the (site) shell.** No `text-shadow: 0 0 Xpx`. No saturated cyan/magenta/lime. If you need emphasis, use `--win-titlebar` (navy) or `--win-accent` (burgundy).

### Win98 utility classes (`app/globals.css` — use these, don't reinvent inline)

| Class | What it is |
|-------|-----------|
| `.win-window` | Raised grey window: 2px outset bevel + 1px outer ring + face background |
| `.win-titlebar` | Navy gradient bar with white bold text — pair with `.win-window` |
| `.win-titlebar-buttons` + `.win-titlebar-btn` | Fake `_ □ ×` mini buttons for the titlebar |
| `.win-window-body` | White panel inside a window (Verdana 13/1.5) |
| `.win-bevel-out` | Standalone raised bevel (e.g. for a tile) |
| `.win-bevel-in` | Sunken bevel — input fields, wells, counter slots |
| `.win-well` | Sunken white panel — status bar, marquee container, address bar |
| `.win-button` | Win98 raised button — `min-width: 75px`, depresses on `:active` |
| `.win-link` | Hyperlink in `--win-link` blue, visited goes purple |

Hub TSX uses a small local `<Window title="...">` helper (in `app/(site)/hub/page.tsx`) that wraps a titlebar + body. Use it for new sections. Don't introduce a parallel "Card" / "Panel" component — extend the Window helper.

### Typography (`--gc-font-*` in `app/globals.css`)

The hub uses the actual Windows 98 personal-page font stack:

| Token | Stack | Use |
|-------|-------|-----|
| `--gc-font-body` | **Verdana, Tahoma, DejaVu Sans, Geneva, sans-serif** | Primary body / paragraph text |
| `--gc-font-ui` | **MS Sans Serif → Tahoma** | Chrome: title bars, menu bar, buttons, nav |
| `--gc-font-italic` | Times New Roman, Georgia | Italic asides only (taglines, captions) |
| `--gc-font-display` | Comic Sans MS | Hand-written feel only (signatures, captions, shrine notes) — sparing |
| `--gc-font-scream` | Impact, Haettenschweiler | Sparing — major room titles, never on the hub itself |
| `--gc-font-code` | Courier New | Addresses, slugs, code, terminal text |
| `--gc-font-pixel` / `--gc-font-pixel-tight` | VT323 / Press Start 2P | Demoted: badges, counter LEDs, "NEW!" stickers only |

Rule: **don't apply pixel fonts (VT323, Press Start 2P) to body, headings, or nav.** They scream "2010s pixel art game", not 1998. Keep them inside small chrome ornaments only.

### Layout

- **Stage**: 1024px wide centered window on the teal desktop. `max-width: calc(100% - 16px)`.
- **Window shell** (in `(site)/layout.tsx`): title bar `afroximity.com — Microsoft Internet Explorer` with fake `_ □ ×` controls, fake `File / Edit / View / Favorites / Tools / Help` menu bar, fake address bar with `http://www.afroximity.com/...`, status bar at the bottom with `Done — afroximity.com © 2026`.
- **Hub three-column**: nav (190px) | content (flex) | sidebar (200px). `.gc-table-layout` is `width: 100%` with `border-spacing: 6px 0` for window gutters. Each column hosts stacked `<Window>`s.

### Required hub furniture (each in its own `<Window>`)

- About-this-page manifesto window (center, top)
- Marquee well (sunken, burgundy text on white) — short repeated slogan
- Rooms preview window (center) — pulls from `listRooms()`
- Visitor counter window (sidebar) — black LED-style display in a `.win-bevel-in`
- Globe / NEW / Webring / a personal pixel pet window (sidebar)
- 88×31 button row at footer (`.gc-button-88` — keep this small-text classic)
- Sign / View Guestbook footer links (`.win-link`)
- Last-updated date (Courier, footer)

### GIF slots

Every GIF position keeps its comment: `{/* GIF: public/gifs/{category}/{name}.gif */}`
- The CSS / emoji fallback stands until real GIFs are sourced via `pnpm assets:grab`.
- **NEVER hotlink external GIFs.** Always self-host under `public/gifs/<category>/`.
- Provenance for every sourced asset goes into `public/gifs/asset-manifest.yaml` (the `assets:grab` script does this automatically).

### What rooms can do differently

Rooms own 100% of their visual world inside `(rooms)/`. A room can be Win98, Area51 cyber-purple (`--gc-*` tokens), Fraunces editorial (japan2026), CRT scanlines, whatever. The hub's job is to be the IE5 window the rooms live behind. Don't backport room aesthetics into the hub.

---

## Tenet B — Questionnaire Protocol

Two invocation modes. Both start by reading `HUB_STATE.md`.

### `enrich: X`
User may not know GeoCities aesthetics. Ask personal questions ONLY:
- What do you want visitors to feel?
- What content/memories/objects exist for this?
- What tone — tender, raw, funny, chaotic?
- What specific moments or details must be preserved?

Zero era assumptions. Pure soul-extraction.

### `enrich+: X`
Same personal questions first, THEN surface 2–3 period-correct direction options drawn from `geocity.md` research. User picks/mixes.

### Protocol for both:
1. Read `HUB_STATE.md` — check what's already captured
2. Ask 5–10 targeted questions (personal first, aesthetic second)
3. **NEVER generate copy or personal content from assumptions** — wait for answers
4. Update `HUB_STATE.md` with the spec
5. Only then: build

---

## Tenet C — Copy Quality

All human-readable copy (welcome text, manifesto, shrine text, obituary, room descriptions, any prose) must come from user answers in a questionnaire session.

**Never fill copy speculatively.** Placeholders in code:
```tsx
{/* COPY: [what goes here] — fill via enrich session */}
```

**In `index.ts` manifest files:** `description` fields that surface in the rooms directory must be written by the user, not generated. Leave blank or placeholder until `enrich` is done.

`HUB_STATE.md` is the source of truth for copy. Code pulls from it, not the other way around.

---

## Tenet D — World-Shift Transition: Win98 InstallShield Wizard

Navigating from the `(site)` hub into a `(rooms)` room overlays a fake **Windows 98 setup wizard** (`app/(rooms)/GlitchTransition.tsx` — filename kept for import stability; component is `InstallTransition`). Two phases:

1. **Installing** — title bar `afroximity.zone Setup — Installing <SLUG>`, animated folder→folder file-fly icon, scrolling `> windows/system32/<slug>.dll` log inside a sunken bevel, Win98 blue-block progress bar (28 vertical blocks), greyed-out Cancel button. Auto-runs ~3.2s.
2. **Setup Complete** — green ✓, `<SLUG> has been installed.` headline, `Click Finish to enter <SLUG>.` body, **Finish** button (autofocused). Clicking it / pressing Enter calls `onDone()` which unmounts the overlay and reveals the room.

The room mounts and loads in the background the whole time (`RoomRenderer.tsx` already does this), so Finish is instant.

**Splash gate** (`app/(site)/page.tsx`) uses the matching wizard chrome with a `Welcome to the afroximity.zone Setup Wizard` page, blue art panel on the left, Welcome copy on the right, `< Back` (disabled) / `Next >` (autofocus) / `Cancel` buttons. Next or click anywhere → `/hub`.

**Why the metaphor:** the site is a place you *install*, not a feed you scroll. Every room is its own program. This sets the spatial-software frame the rest of the design relies on.

**Don't replace the wizard with a generic loading spinner.** If you change the transition, change it to another period-correct OS ritual (BSOD, ScanDisk, defrag, dial-up handshake) — never a modern progress dot.

---

## HUB_STATE.md

`HUB_STATE.md` at the project root is the elaborate sitemap. It tracks:
- Every hub page: status, aesthetic direction, content inventory, copy, lore
- Every room: spec, questionnaire answers, GIF needs, interaction ideas
- Asset pipeline: sourced vs. placeholder GIFs

Read it before every build session. Update it after every `enrich`/`enrich+` session.

---

## GIF Asset Pipeline

Two batch downloaders live in `scripts/assets/` and are wired to `package.json`:

```sh
pnpm assets:grab "<query>" --count <n> --out <category>
pnpm assets:buttons "<theme>" --count <n>          # auto-prepends "88x31"
```

`scripts/assets/gifcities.ts` queries `https://gifcities.archive.org/api/v1/gifsearch`, downloads via `https://blob.gifcities.org/<checksum>.gif`, dedupes by SHA-1 + filename, and appends a provenance entry to `public/gifs/asset-manifest.yaml` (schema in `geocity.md` § Preservation). Re-runs are idempotent.

`<category>` is one of the existing folders under `public/gifs/`: `skulls`, `flames`, `globes`, `construction`, `bullets`, `dividers`, `buttons`, `badges`, `bg`, `misc`. Add new folders by `mkdir + .gitkeep` if needed.

To wire a sourced GIF into a slot:
1. Find the file in `public/gifs/<category>/`.
2. Search codebase for `/* GIF: public/gifs/<category>/<name>.gif */`.
3. Swap the CSS / emoji fallback with `background-image: url('/gifs/<category>/<actual-name>.gif')` (or `<img src=...>` for inline).
4. **NEVER hotlink** external GIFs. Always self-host.

Suggested initial searches: `"skull flame"→skulls`, `"spinning globe"→globes`, `"under construction"→construction`, `"lightning divider"→dividers`, `"new badge"→badges`, `"spinning at sign"→misc`, `"88x31 truck"`/`"88x31 cat"` via `assets:buttons`.
