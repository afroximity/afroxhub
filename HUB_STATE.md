# AFROXIMITY.COM — Hub State & Sitemap

Last updated: 2026-05-09
Status: Foundation phase — hub copy live, 1024px stage, period-correct font stack, asset pipeline built.

---

## Identity

**What this site is:** A personal homepage in the tradition of 1998–2003 GeoCities Area51 pages. Chaotic, dark, purple-neon, hand-built feeling. The hub is the chaos. The rooms behind it are completely different worlds.

**Owner:** afroximity (Oguzhan Eren)

**The tenet:** Every room is a reflection of something real. No AI slop. No filler. Everything on this site came from a conversation.

---

## Palette & Typography

**Active hub aesthetic (2026-05-09 redirect): Win98 chrome.** Grey desktop windows, navy title bars, white inner panels, system fonts. The neon `--gc-*` tokens stay defined for *rooms* that want to opt into Area51 cyber-purple, but the `(site)` shell no longer uses them.

### Win98 chrome tokens (`--win-*` in `globals.css`)

| Token | Value | Use |
|-------|-------|-----|
| `--win-desktop` | `#008080` | Outer page bg (classic teal desktop) |
| `--win-face` | `#c0c0c0` | Window face / chrome panels |
| `--win-light` | `#ffffff` | 3D bevel highlight |
| `--win-shadow` | `#808080` | 3D bevel shadow |
| `--win-dark` | `#000000` | Outer ring + dark shadow |
| `--win-titlebar` | `#000080` | Active title bar (navy) |
| `--win-titlebar-2` | `#1084d0` | Title bar gradient end |
| `--win-titletext` | `#ffffff` | Title bar text |
| `--win-panel` | `#ffffff` | Inner content surfaces |
| `--win-text` | `#000000` | Body text |
| `--win-link` | `#0000ee` | Unvisited hyperlink |
| `--win-link-visit` | `#551a8b` | Visited hyperlink |
| `--win-accent` | `#800000` | Burgundy emphasis (NEW, marquee) |

### Win98 utility classes (CSS — use these, don't reinvent inline)

- `.win-window`, `.win-titlebar`, `.win-titlebar-buttons`, `.win-titlebar-btn`
- `.win-window-body`, `.win-bevel-out`, `.win-bevel-in`, `.win-well`
- `.win-button`, `.win-link`

Hub TSX wraps content in a small `<Window title="...">` helper (in `app/(site)/hub/page.tsx`) that emits a titlebar + body. Use it for new sections.

### Legacy GC neon tokens (kept for rooms only)

| Token | Value | Use |
|-------|-------|-----|
| `--gc-bg` | `#0a0014` | Room background (Area51 dark) |
| `--gc-purple` | `#9D00FF` | Cyber primary |
| `--gc-green` | `#00FF00` | Acid highlights |
| `--gc-magenta` | `#FF00FF` | Cyber headlines |
| `--gc-cyan` | `#00FFFF` | Cyber secondary |
| `--gc-red` | `#FF0000` | Warnings |

### Fonts (`--gc-font-*` in `globals.css`)

- `--gc-font-body`: **Verdana, Tahoma** — primary body / paragraph font (the actual late-90s Windows personal-page stack)
- `--gc-font-ui`: **MS Sans Serif → Tahoma** — chrome, title bars, buttons
- `--gc-font-italic`: **Times New Roman** — italic asides only (taglines, captions in italic)
- `--gc-font-display`: **Comic Sans MS** — hand-written feel only (signatures, captions)
- `--gc-font-scream`: Impact — use sparingly, room titles
- `--gc-font-code`: Courier New — addresses, slugs, code, terminal text
- `--gc-font-pixel` / `--gc-font-pixel-tight`: VT323 / Press Start 2P — badges, counters, "NEW!" stickers only

Stage: **1024px** wide window centered on a teal desktop.

---

## Splash Gate — `/`

**Status:** Planned (CSS skeleton)  
**Route:** `app/(splash)/page.tsx`  
**Aesthetic:** Pure black, full screen, single burning entrance  

**Elements:**
- Animated border (CSS pulse, replace with `/* GIF: public/gifs/flames/border-fire.gif */`)
- Giant: `ENTER AFROXIMITY.ZONE` — magenta, blinking
- Subtext: `best viewed in Netscape Navigator 4.0 at 800×600`
- Click anywhere → `/hub`
- GIF slot: `/* GIF: public/gifs/skulls/burning-skull.gif */`
- MIDI slot: `/* MIDI: public/midi/xfiles-theme.mid */`

**Copy:** No prose needed. The title IS the copy.

---

## THE LAB — Hub Homepage — `/hub`

**Status:** Live (copy captured 2026-05-09 via `enrich: hub homepage copy`)
**Route:** `app/(site)/hub/page.tsx`
**Aesthetic:** Three-column table, 1024px stage, **Win98 chrome** (teal desktop, navy title bars, white panels, Verdana/Tahoma body, MS Sans Serif chrome). Burgundy accents replace neon green/magenta on the hub. Neon `--gc-*` tokens reserved for individual rooms.
**Voice / target feeling:** Welcomed into a private den — *you found me*. Sincere first-person. No legal name on the hub (only `afroximity`).

**Captured copy (do not auto-edit without re-running questionnaire):**
- **Site tagline** (header sub-line): `a personal mausoleum, under construction forever.`
- **Marquee:** `★ UNDER ETERNAL CONSTRUCTION ★` (repeating)
- **About-this-page manifesto:**
  > I made this because the internet stopped feeling like anyone lived here. Every door now leads to the same five lobbies, and what used to be a million weird front yards is a feed someone else owns. So this is me standing my ground... A homepage in the old sense, hand-built, on my own handle, away from the megacorps that turned the web into a mall. It will not be the prettiest thing you see this week, but it is mine, and it will still be here.
- **Contact email:** `oguzhan.ern@gmail.com` (mailto on the spinning `@` slot).
- **Root metadata description:** matches tagline.

**Left column — Nav:**
- Links: Home | Rooms | Tools | Guestbook (placeholder) | Links (placeholder)
- Style: acid-green Comic Sans, blinking on hover
- Spinning `@` email link at bottom — live mailto

**Center column — Content:**
- `<h1>`: `W E L C O M E  T O  T H E  L A B` (Impact, clamp 48–84px)
- Marquee greeting (CSS simulated, VT323)
- Welcome manifesto in `▌ ABOUT THIS PAGE` box (Times, 17px)
- "Last Updated: 2026-05-03" in Courier (refresh on edit)
- GIF slot: `/* GIF: public/gifs/construction/under-construction.gif */`

**Right column — Widgets:**
- Visitor counter: `YOU ARE VISITOR #004,721`
- GIF slot: `/* GIF: public/gifs/globes/spinning-globe.gif */`
- GIF slot: `/* GIF: public/gifs/bullets/new-badge.gif */`
- Webring nav

**Footer:**
- 88×31 buttons: "Best viewed in Netscape" | "HTML 4.0" | "Powered by Notepad" | "afroximity.com"
- Guestbook link
- `© 2026 afroximity — All Rights Reserved`

---

## Rooms Directory — `/rooms`

**Status:** Planned  
**Route:** `app/(site)/rooms/page.tsx`  
**Aesthetic:** GeoCities directory, table-grid of room cards  

Each card: slug as "address" / title in Impact / description placeholder / `ENTER →` link  
GIF slot per card: `/* GIF: public/gifs/bullets/star-bullet.gif */`

---

## Tools Directory — `/tools`

**Status:** Phase 2  
Same GeoCities treatment as rooms directory, "TOOLS ARCHIVE" header.

---

## Live Rooms

### JAPAN 2026 — Trip Operations Center
**Slug:** `japan2026`
**Status:** Baseline complete (2026-05-09). Itinerary refined through 12 May. Days 13–17 narrative pending.
**Owner-trio:** Eren · Zenci (Burak Kahraman) · Ossan (Oğuzhan Üretmen)
**Aesthetic:** Editorial magazine — Fraunces serif, DM Sans, off-white + red dot accent. Distinct from GeoCities hub.
**Tabs:** Özet · Günler · Uçuşlar · Oteller · Araç · Checklist · Belgeler · Acil
**Persistence:** Neon (`room_checklist`, `room_activity`, `room_notes`, `room_checklist_schema`, `room_itinerary`, `room_documents`, all keyed `room='japan2026'`).
**Document pipeline:** `scripts/japan2026/ingest-docs.ts` — drop new files into `resources/`, run script, docs auto-classified into `public/docs/japan2026/` and Neon. See `content/rooms/japan2026/INGEST.md`.
**Persona pinning:** Logged-in user's PNR / docs / driver banner highlight with red border + ★. Everyone sees everything.
**Source-of-truth resolutions:**
- Outbound IST→ULN dep `13:20` (Burak's PDF wins; Eren's PDF marked `eski tarifeli` in Belgeler)
- Hanabi check-out `18 Mayıs` (was wrongly 19), final IST arrival `19 Mayıs 11:25` (was wrongly 20)
- Nissan return `14 Mayıs 07:00` (was wrongly 15) — confirmation PDF cited
**Open items:** Zenci Visit Japan QR (in Eksik panel), itinerary days 13/15/16/17.

---

## Planned Rooms

### LACAN — Digital Shrine / Obituary
**Slug:** `lacan`  
**Status:** Questionnaire pending — use `enrich: Lacan shrine`  
**Notes:** Dead cat. An obituary / memorial. Very personal.  
**Copy:** `{/* fill via enrich session */}`  
**Aesthetic direction:** TBD via questionnaire  
**GIF needs:** TBD  
**Interactions:** TBD  

---

### KARTAL YUVASI — Football / Beşiktaş
**Slug:** `kartal-yuvasi` (Eagle's Nest)  
**Status:** Questionnaire pending — use `enrich+: football hobby`  
**Notes:** Beşiktaş JK. Football as ritual, not just sport.  
**Copy:** `{/* fill via enrich session */}`  
**Aesthetic direction:** TBD via questionnaire  
**GIF needs:** eagle, black-white color scheme, match results  
**Interactions:** TBD  

---

### PIXEL.EXE — Cat Corner
**Slug:** `pixel`  
**Status:** Questionnaire pending — use `enrich: Pixel corner`  
**Notes:** Living cat (Pixel). Very different from Lacan's room — this one is alive.  
**Copy:** `{/* fill via enrich session */}`  
**Aesthetic direction:** TBD via questionnaire  
**GIF needs:** sparkles, paw prints, animated cat  
**Interactions:** TBD  

---

### THE V8 SHRINE — Scania
**Slug:** `scania-shrine`  
**Status:** Questionnaire pending — use `enrich+: Scania shrine`  
**Notes:** Scania trucks, V8 cult. See geocity.md §6 for era research.  
**Copy:** `{/* fill via enrich session */}`  
**Aesthetic direction:** diamond-plate background, chrome borders, griffin logo  
**GIF needs:** V8 badge, drifting truck, chrome cab at night  
**Interactions:** TBD  

---

### GAMER ZONE — 2XKO / CS2
**Slug:** `gamer-zone`  
**Status:** Questionnaire pending — use `enrich+: gamer zone`  
**Notes:** Gaming section. 2XKO, CS2. CRT aesthetic.  
**Copy:** `{/* fill via enrich session */}`  
**Aesthetic direction:** CRT scanlines, controller GIFs  
**Interactions:** K/D marquee, screenshot table  

---

### THE TERMINAL — Dev Logs
**Slug:** `terminal`  
**Status:** Questionnaire pending — use `enrich: dev logs`  
**Notes:** Dev diary / blog. Green-on-black terminal aesthetic.  
**Copy:** `{/* fill via enrich session */}`  
**Aesthetic direction:** Courier, monospace, ASCII borders  
**Interactions:** code snippets, GitHub link  

---

## GIF Asset Pipeline

**Status:** Background texture sourced. GIF slots still CSS placeholders.

**Sourced assets:**
- `purple-lace.jpg` — purple lace/fabric tile from pixelmoondust.neocities.org. **Self-hosted 2026-05-09** at `public/gifs/bg/purple-lace.jpg`; `app/(site)/layout.tsx` already references it. Provenance in `public/gifs/asset-manifest.yaml`.

**Batch GIF tooling (NEW, 2026-05-09):**
- `pnpm assets:grab "<query>" --count <n> --out <category>` — `scripts/assets/gifcities.ts`. Hits `gifcities.archive.org/api/v1/gifsearch`, downloads via `blob.gifcities.org/<checksum>.gif`, dedupes by SHA-1, appends provenance YAML to `public/gifs/asset-manifest.yaml`.
- `pnpm assets:buttons "<theme>" --count <n>` — `scripts/assets/buttons.ts`. Wrapper that prepends `88x31` and routes to `public/gifs/buttons/`.
- Suggested first runs: `"skull flame"→skulls`, `"spinning globe"→globes`, `"under construction"→construction`, `"lightning divider"→dividers`, `"new badge"→badges`, `"spinning at sign"→misc`.

**To wire a sourced GIF into a slot:**
1. Run `pnpm assets:grab "..." --out <category>` — files land in `public/gifs/<category>/`.
2. Pick the one you want from the folder.
3. Search codebase for `/* GIF: public/gifs/{category}/{name}.gif */`.
4. Swap CSS placeholder for `background-image: url('/gifs/<category>/<actual-name>.gif')`.

**Category folders to create under `public/gifs/`:**
- `skulls/`
- `flames/`
- `globes/`
- `construction/`
- `bullets/`
- `dividers/`
- `buttons/`
- `badges/`
- `bg/`
- `misc/`

---

## Questionnaire Backlog

| Room | Command | Priority |
|------|---------|----------|
| Lacan shrine | `enrich: Lacan shrine` | High — most personal |
| Pixel corner | `enrich: Pixel corner` | High |
| Football / Beşiktaş | `enrich+: football hobby` | High |
| Scania shrine | `enrich+: Scania shrine` | Medium |
| Gamer zone | `enrich+: gamer zone` | Low |
| Dev terminal | `enrich: dev logs` | Low |
| Hub manifesto copy | `enrich: hub homepage copy` | ✅ Done 2026-05-09 |
