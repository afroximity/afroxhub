# AFROXIMITY.COM — Hub State & Sitemap

Last updated: 2026-05-03  
Status: Foundation phase — harness built, GeoCities shell in progress.

---

## Identity

**What this site is:** A personal homepage in the tradition of 1998–2003 GeoCities Area51 pages. Chaotic, dark, purple-neon, hand-built feeling. The hub is the chaos. The rooms behind it are completely different worlds.

**Owner:** afroximity (Oguzhan Eren)

**The tenet:** Every room is a reflection of something real. No AI slop. No filler. Everything on this site came from a conversation.

---

## Palette & Typography

| Token | Value | Use |
|-------|-------|-----|
| `--gc-bg` | `#0a0014` | Page background |
| `--gc-purple` | `#9D00FF` | Primary accent, borders |
| `--gc-green` | `#00FF00` | Nav links, acid highlights |
| `--gc-magenta` | `#FF00FF` | Headlines, blink elements |
| `--gc-cyan` | `#00FFFF` | Secondary accent |
| `--gc-red` | `#FF0000` | Warnings, blink |

Fonts: VT323 (headers), Press Start 2P (pixel labels), Courier New (body), Impact (SCREAMING TITLES)

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

**Status:** Planned  
**Route:** `app/(site)/hub/page.tsx`  
**Aesthetic:** Three-column table, purple/neon, maximum density  

**Left column — Nav:**
- Links: Home | Rooms | Tools | About | Guestbook
- Style: acid-green, blinking on hover
- Spinning `@` email link at bottom

**Center column — Content:**
- `<h1>`: `W E L C O M E  T O  T H E  L A B`
- Marquee greeting (CSS simulated)
- Welcome manifesto: `{/* COPY: personal welcome manifesto — fill via enrich session */}`
- "Last Updated: 2026-05-03" in Courier
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
- `backg130.jpg` — purple lace/fabric tile from pixelmoondust.neocities.org. Currently hotlinked from file.garden. **Self-host:** download and save to `public/gifs/bg/purple-lace.jpg`, then update `backgroundImage` url in `app/(site)/layout.tsx` and `app/(site)/page.tsx`.

**To source GIFs:**
1. Visit gifcities.org
2. Search: "skull flame" | "spinning globe" | "under construction" | "purple border" | "matrix rain" | "new badge" | "spinning at sign" | "lightning divider" | "eagle" | "cat sparkle"
3. Download → `public/gifs/{category}/{name}.gif`
4. Search codebase for `/* GIF: public/gifs/{category}/{name}.gif */`
5. Swap CSS placeholder for `background-image: url('/gifs/{category}/{name}.gif')`

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
| Hub manifesto copy | `enrich: hub homepage copy` | Blocker for launch |
