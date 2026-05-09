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

## Tenet A — GeoCities Aesthetic

The `(site)` group IS a period-correct 1998–2003 GeoCities Area51 page. Non-negotiable elements:

**Palette:**
- `--gc-bg: #0a0014` (near-black, purple bias)
- `--gc-purple: #9D00FF`
- `--gc-green: #00FF00` (acid green)
- `--gc-magenta: #FF00FF`
- `--gc-cyan: #00FFFF`
- `--gc-red: #FF0000`

**Typography:**
- Headers: VT323 or Press Start 2P
- Body: Courier New
- SCREAMING TITLES: Impact, spaced-out caps (`W E L C O M E`)
- Colored `<font>`-era vibes via CSS, not semantic markup

**Layout:**
- Table-based three-column: nav | content | gifs sidebar
- Fixed 780px width, centered with margin auto
- `border: 1px solid var(--gc-purple)` framing

**Required furniture on every hub page:**
- Under-construction GIF slot
- Visitor counter (fake, CSS-styled)
- Webring nav `[◄ Prev] [Random] [Next ►]`
- 88×31 button row at footer
- "Last Updated" timestamp
- Guestbook link
- Spinning `@` email link

**GIF slots:**
Every GIF position must have a comment: `{/* GIF: public/gifs/{category}/{name}.gif */}`
The CSS fallback (gradient + animation) stands until real GIFs are sourced.
NEVER hotlink external GIFs. Always self-host under `public/gifs/`.

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

## Tenet D — World-Shift Transition

Navigating from `(site)` hub into a `(rooms)` room triggers a full-screen glitch transition (`GlitchTransition.tsx`). This is the postmodern time-shift that signals "you are leaving the GeoCities realm." It replaces the generic loading state in `RoomRenderer.tsx`.

---

## HUB_STATE.md

`HUB_STATE.md` at the project root is the elaborate sitemap. It tracks:
- Every hub page: status, aesthetic direction, content inventory, copy, lore
- Every room: spec, questionnaire answers, GIF needs, interaction ideas
- Asset pipeline: sourced vs. placeholder GIFs

Read it before every build session. Update it after every `enrich`/`enrich+` session.

---

## GIF Asset Pipeline

When user has sourced GIFs from gifcities.org or similar:
1. Save to `public/gifs/{category}/{name}.gif`
2. Search codebase for `/* GIF: public/gifs/{category}/{name}.gif */`
3. Replace the CSS placeholder `background` with `background-image: url('/gifs/{category}/{name}.gif')`
4. Remove the CSS animation fallback

Suggested GifCities searches: "skull flame", "spinning globe", "under construction", "purple border", "matrix rain", "new badge", "spinning at sign", "lightning divider"
