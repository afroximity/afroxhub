# A Soulful GeoCities-Style Personal Museum for 2026

> **2026-05-09 — Aesthetic redirect.** This document was written before the hub shell took its final visual direction. The `(site)` shell is now **Windows 98 chrome** (teal desktop, IE5 window with title bar / menu bar / address bar, raised+sunken bevels, white inner panels, MS Sans Serif + Verdana + Comic Sans), not the saturated cyber-purple/acid-green look this doc occasionally implies. See `CLAUDE.md` § Tenet A and `HUB_STATE.md` § Palette & Typography for the live design system. The neon `--gc-*` palette is reserved for individual *rooms* that opt into Area51 cyber-purple. Read this document for **soul, structure, rituals, decoration grammar, and rubric** — read `CLAUDE.md` for the actual visual tokens.

The target is not “make it look old.” The target is “make it feel authored.” The archival and scholarly record around GeoCities points to a web culture built from neighborhoods, guest books, web rings, diaries, visible incompletion, background sound, and shameless element-combining. Later preservation work frames that culture as expressive, decentralized, sincere, and neighborly rather than merely “bad design.” When entity["company","Yahoo!","internet portal"] shut the service in 2009, what preservation groups rushed to save was precisely that messy personal culture, and today it survives through work by the entity["organization","Internet Archive","web archive org"], entity["organization","Archive Team","digital preservation group"], and entity["organization","Restorativland","geocities mirror project"]. citeturn1view0turn14view3turn15view0turn15view1

## What your screenshots already say

Your reference screenshot succeeds because it is not just decorative. It is socially chunked. “Link me,” “Vote me,” “Post me,” “Welcome,” “Updates,” and navigation are all separate little booths in the fairground. The page feels alive because every box suggests a different verb: link, vote, sign, browse, return, collect.

Your current hub is already closer to the real target than you think. It has the right macro instincts: a fixed central stage instead of endless scroll, side rails, a visible visitor counter, footer buttons, and a room-based spatial model. Those are all stronger foundations for a GeoCities-inspired project than a sleek responsive portfolio or a single infinite feed.

What still reads as too AI-clean is the uniformity. The current hub feels tightly art-directed, almost like one coherent cyberpunk poster. GeoCities soul usually came from friction between modules, not perfect harmony: too many boxes, too many assets, too many niche declarations, too many tiny invitations, and a visible sense that the author kept adding things over time. Your hub needs more residue, more thematic contamination, more asymmetry, more “this page accumulated a life.”

The most important design move from here is not to abandon your existing cyber aesthetic. It is to let that aesthetic get invaded by fandom, jokes, grief, cats, favorite machines, unfinished experiments, and page furniture that looks like it was added because you loved it, not because a design system demanded it.

## What made the old web feel human

GeoCities mattered because it lowered the barrier to publishing and wrapped people into thematic “neighborhoods.” Ian Milligan’s historical account describes a web where ordinary users could publish without dealing with intimidating tooling, then become part of communities held together by volunteer neighborhood watches, web rings, and guest books. The Web Design Museum’s neighborhood archive still shows how strongly the service organized itself as a themed city rather than a feed: Area51, Hollywood, Heartland, MotorCity, SiliconValley, EnchantedForest, and many more. citeturn14view0turn14view3

Just as important, the era was emotionally direct. James Baker’s study of GeoCities diaries describes users experimenting with the boundary between public and private life, using personal pages to stage identity, memory, confession, and everyday writing in public. That matters for your project because a dead-cat shrine, a jokes museum, a truck-devotion page, and a lab of strange UI experiments are not eccentric extras; they are exactly the sort of intimate-public hybrids that gave personal sites their pulse. citeturn14view4turn27view0

The visual language was not simply “ugly.” One of the best modern readings of the archive, through entity["organization","Rhizome","digital art org"] and the *One Terabyte of Kilobyte Age* project, argues that what made these pages distinctive was the absence of a fixed standard for self-expression. Users often could not produce polished original graphics, so they built pages by combining found elements, circulating motifs, and attaching meaning through arrangement. That is why the right goal is not a single perfectly art-directed retro page. It is a page ecology of combinations, borrowings, badges, stickers, dividers, gifs, and tiny rituals that reveal taste and obsession. citeturn15view0turn15view1

The characteristic surface features were real, and they mattered. Research describing GeoCities-era design explicitly points to “under construction” notices, blinking or marquee text, visitor counters, and background music as characteristic of the period. Restorativland’s reconstructed gallery also notes that some archived pages contain embedded MIDI or WAV audio, marked with a sound icon, and require a click to begin playback. In other words, the old web felt alive not only because it was visually busy, but because it exposed status, incompletion, repetition, and ambience on the page itself. citeturn14view1turn27view0

The shortest useful summary is this: the soul came from self-categorization, public traces of visitors, visible incompletion, obsessive collections, and personal writing that sat in plain sight. If your site accumulates those traits, it will feel right even if some of the exact visuals are contemporary reconstructions. citeturn14view3turn15view0turn27view0

## The site architecture you actually want

### User-facing brief

Treat the hub as a city map or station concourse, not as an about-me landing page. It should be the switchboard that tells a stranger what worlds exist, what has changed recently, what is unfinished, and where the weirdness lives. That is historically closer to GeoCities’ neighborhood logic than a modern homepage hero. citeturn14view0turn14view3

The fixed-width central stage is the correct choice. Keep it. On modern wide screens, the wallpaper should absorb the surplus space while the main stage stays intentionally bounded and legible. Use oversized headers, thick borders, obvious modules, and multiple “zones” rather than a long narrative scroll. The stage should feel like it was designed for a smaller monitor and then lovingly preserved, not stretched to fill a cinema display.

The `rooms` idea is your strongest concept. Lean into it harder. Each room should behave like its own neighborhood with its own local customs, background, cursor, mini-heading treatment, badge cluster, and optional soundtrack. The hub should not try to contain everything; it should advertise the worlds.

A strong user-facing room taxonomy for your project would look like this:

- **Hub**: map, updates, featured room, sound toggle, counter, guestbook link, “link me” button, “best viewed with curiosity” line.
- **Rooms index**: a thumbnail atlas or directory page, not just a card grid. Each room gets a mood line, status, and last-updated stamp.
- **Memorial room for your cat**: candle gifs, a quieter palette, photos, favorite habits, text fragments, a condolence corner in the guestbook, maybe one restrained song choice.
- **New cat page with a Feed Pixel button**: a little creature toy, feeding state, nameplate, toys, “today’s mood,” perhaps an adoption certificate or sticker shelf.
- **Scania shrine**: effectively your own MotorCity annex. Favorite models, engine love notes, wallpapers, found imagery, truck facts that matter to *you*, “why I love this machine” writing, maybe route cards or faux spec sheets.
- **Lab and tools**: your artistic UI/UX rooms, room-switch glitches, unfinished experiments, interface artifacts, downloadable toys.
- **Jokes and cursed relics**: fake awards, cursed screenshots, one-liners, tiny strange pages you only find by clicking around.
- **Diary and obituaries**: a dated log of life, creations, losses, updates, and dead-end notes.
- **Links and neighbors**: outbound links, buttons, maybe a ring slot, recommended personal sites, and things you want people to discover next.

Every room should answer a different human question: what do you love, what do you mourn, what do you collect, what do you make, what do you find funny, what are you still building. That is how a “mental museum” becomes legible.

The home page should also include visible incompletion. You should have pages that are intentionally half-built, marked as under construction, but already decorated and named. This is not failure. It is period-correct life. A room called “future truck wallpapers,” “pixel mausoleum,” or “cursed tools archive” can exist before it is full, as long as it already has a mood and an invitation. citeturn27view0

A practical rule: no major topic should live only as a box on the hub. If a box is important enough to be teased on the home page, it deserves its own room. That one structural decision alone will keep the project from collapsing into a one-page retro skin.

## The decorative and interactive grammar

The easiest way to avoid AI-slop retro is to make decoration specific. Old-web surfaces were crowded, but they were crowded *about something*. If you love animals, then a title followed by 30 small animal gifs is not noise; it is evidence. If you love trucks, a border row of chrome, road, diesel, and warning-sign stickers is better than a generic neon divider because it belongs to your obsession. The same principle applies to cat pages, joke pages, memorial pages, and lab pages. citeturn15view0turn27view0

A good decorative grammar for this project includes tiled wallpapers, transparent gif stickers, divider bars, “link me” buttons, under-construction strips, 88x31 button gardens, counter badges, last-updated labels, “best viewed in…” jokes, shrine candles, favorite-things collages, sidebars full of tiny utilities, and small downloadable artifacts like wallpapers or icons. Collections of 88x31 buttons remain widely archived today, and contemporary button archives explicitly advise downloading rather than hot-linking. citeturn22search1turn22search4

You should actively research from living and archived sources when you do not know what comes next. The 2025 version of GifCities added semantic search, size filtering, pagination, and links back to the original archived pages each gif came from, which makes it a very strong scavenging tool. Neocities remains useful not just as hosting culture but as a living inspiration field: its official browse pages expose tags, popularity, recent updates, and niche collections such as blinkies. Restorativland gives you neighborhood-based browsing of reconstructed GeoCities pages, and OldWeb.Today exists specifically to let people browse older sites through emulated browsers and archived contexts. citeturn1view4turn14view1turn23search0turn23search1turn23search2turn0search9

For audio, use an opt-in ritual rather than fighting the browser. MDN and Chrome’s autoplay guidance are clear: audible autoplay is commonly blocked, while muted autoplay is broadly permitted. That means the period-correct move in 2026 is not “music starts instantly no matter what,” but “Enter site with sound?” or a visible sound toggle that arms the page after user interaction. If you want a glorious optional player, Webamp is a strong late-90s/early-2000s companion: it is a Winamp reimplementation with full skin support, a modern browser compatibility target, examples for multiple skins and tracks, and even HTML playlist export in the classic style. citeturn16view1turn16view2turn19view0turn19view1turn19view2

For custom cursors, stay grounded in browser reality. MDN notes that browsers commonly restrict cursor images to 128×128 pixels and recommend 32×32 pixels; oversize images are often ignored. Static `.cur` files are broadly workable. If you want truly animated cursors in the old Windows spirit, Jordan Eldredge’s work on `ani-cursor` is relevant: modern browsers do not support `.ani` files natively, and they also do not support animated image formats such as GIF or APNG as cursors, so animation requires a JavaScript/CSS workaround. The safest design choice is to reserve animated cursors for hover-specific flourishes, secret pages, or shrine zones, not for the entire site shell. citeturn17view1turn28view0

For marquee and blink effects, recreate the *effect*, not the obsolete tag. The `<marquee>` element is deprecated, and `<blink>` is obsolete. MDN explicitly recommends CSS animations instead of `<marquee>` and also recommends pairing the effect with `prefers-reduced-motion`. That is exactly how you should handle scrolling headlines, warning strips, and “new!” blinkies: build them as CSS components with an escape hatch, not as unbounded chaos. citeturn5search2turn5search3turn16view3

Large decorative animations also need performance discipline. web.dev and MDN both note that animated GIFs can become huge and that video equivalents are often far more efficient. That does **not** mean “ban gifs” — gifs are part of the language — but it does mean you should reserve actual GIFs for small, iconic stickers and badges, and convert large ambient loops to muted WebM/MP4 video where needed. citeturn29view0turn29view1turn29view2

A useful rule of thumb is this:
- **Small symbolic motion**: GIF, APNG, or tiny sprite.
- **Large decorative loop**: muted video.
- **Text motion**: CSS component with reduced-motion fallback.
- **Rare special cursor**: `.cur` or JS-based `.ani` workaround.
- **Room transition**: view-transition enhancement, not a full-site animation storm.

## What to avoid if you want soul rather than parody

Do not treat the old web as a punchline. Preservation scholarship and restoration projects consistently present GeoCities as digital folklore, a site of early self-publishing, and a “network of care,” not just an archive of embarrassing glitter. If your project only ironizes the era, it will feel hollow. The site should be strange, but the strangeness has to protect sincerity rather than flatten it. citeturn15view0turn15view1

Avoid the following failure modes:

- one giant homepage with every idea crammed into an endless scroll;
- one immaculate palette and one immaculate grid used for every room;
- generic retro copy like “welcome to my world” without actual personal specifics;
- decorative clutter that is not tied to a topic or emotion;
- fake brokenness that makes the site annoying rather than haunted;
- a “museum” that contains no dated entries, no updates, no links out, and no visitor traces;
- retro Chrome wrapped around writing that could have been generated for any portfolio on earth.

Also avoid unsafe or joyless implementations. W3C’s flashing guidance says content should not flash more than three times per second, and MDN warns that flicker, blink, stripes, and motion can trigger seizures or other physical reactions. Respect `prefers-reduced-motion`, keep a visible sound toggle, and let users pause nonessential movement. Soul is not worth making someone nauseous. citeturn16view3turn16view4turn16view5

Finally, avoid shipping every toy on first load. Heavy gifs, autoplaying media, and too many client-only effects will punish the exact density you want. Delayed loading and progressive enhancement let the page feel fuller *and* more stable. citeturn18view1turn29view0turn29view2

## How to build it in Next.js

### AI coding agent brief

You do **not** need to switch away from Next.js to get this done. In the App Router, layouts and pages are Server Components by default, while Client Components are the intended place for state, browser APIs, effects, and interaction. That maps cleanly onto your use case: the shell, room content, and route structure can stay server-rendered, while the sound gate, cursor manager, guestbook interactions, counter, and glitch transitions live in small client islands. If a widget causes hydration problems, Next explicitly supports disabling prerendering for that component with `dynamic(..., { ssr: false })`. Lazy loading is also first-class for Client Components and third-party libraries. citeturn18view0turn18view1turn18view2turn18view3

This repo is already organized around three App Router **route groups** that enforce the GeoCities-vs-rooms boundary, plus a **manifest + registry** pattern so each room is its own self-contained world. Do not invent parallel structures — extend these:

```text
app/
  (splash)/
    page.tsx                  // splash gate at /  — full-screen, no chrome
  (site)/                     // the GeoCities hub world (1998–2003 Area51)
    layout.tsx                // hub shell: 1024px stage, 3-col table, GeoCities chrome
    hub/page.tsx              // /hub
    rooms/page.tsx            // /rooms directory
    tools/page.tsx
    tools/[slug]/page.tsx
  (rooms)/                    // isolated room experiences
    layout.tsx                // passthrough — no hub chrome leaks in
    GlitchTransition.tsx      // world-shift animation between hub and rooms
    rooms/[slug]/
      page.tsx
      RoomRenderer.tsx        // next/dynamic + ssr: false per room

content/rooms/{slug}/
  index.ts                    // manifest: slug, title, description, component loader
  Room.tsx                    // the room itself — TSX client component, full visual isolation
content/rooms/registry.ts     // central registration of room components
content/rooms/manifestRegistry.ts

public/gifs/                  // hub-shared decorative pool
  skulls/  flames/  globes/  construction/
  bullets/  dividers/  buttons/  badges/
  bg/  misc/
  asset-manifest.yaml         // provenance for every sourced gif/button (see §Preservation)
public/{room-slug}/           // each room owns its own assets under its slug
  e.g. public/japan2026/{avatars,hotels,nissan,source}/

scripts/
  assets/
    gifcities.ts              // batch GIF downloader → public/gifs/<category>/
    buttons.ts                // batch 88×31 button downloader
  japan2026/ingest-docs.ts    // example of the per-room ingestion pattern
```

Key rules this layout encodes:

- **Rooms are TSX, not MDX.** Each room is a client component registered through `content/rooms/registry.ts` + `manifestRegistry.ts`, then mounted by `app/(rooms)/rooms/[slug]/RoomRenderer.tsx` via `next/dynamic` with `ssr: false`. This is what lets a room own 100% of its visual world (own fonts, own palette, own cursor) without leaking into the hub.
- **Room-owned assets live under `public/{slug}/`.** The shared `public/gifs/` pool is for hub chrome and cross-room decoration only. Do not dump room-specific imagery into it.
- **The world-shift between hub and rooms is `app/(rooms)/GlitchTransition.tsx`** — there is no separate `RoomTransitionLayer`. Replace the generic loading state in `RoomRenderer.tsx` with this component (Tenet D in `CLAUDE.md`).
- **Guestbook, links, about, sound gate, visitor counter, link-me button, sticker cloud, badge garden** — none of these exist as components yet. When you build them, place them under `app/(site)/` (route pages) or as small client islands colocated with `app/(site)/layout.tsx`. Do not create a `components/retro/` or `components/shell/` directory unless three or more pages share a piece — colocate first, extract on the third use.

This keeps the hub and rooms legible as content neighborhoods while isolating browser-only weirdness into deliberate modules. It also means future sessions can iterate room by room instead of rewriting the whole shell.

Use `next/image` for static PNG/JPG/WebP/AVIF artwork, and use the `unoptimized` prop for animated GIFs that should be served as-is. For large decorative motion, switch to `<video autoplay muted loop playsInline>` with lazy-loading discipline. Next also supports route-segment Open Graph and Twitter images out of the box, which is perfect for making each room look like its own collectible postcard when shared. citeturn21view1turn21view2turn18view5turn29view0turn29view1

For your existing “hub to rooms” time-travel/glitch move, keep it and formalize it. The View Transition API is now baseline across all three major browser engines for same-document transitions, and MDN describes it as a way to animate transitions between UI states and page views while reducing cognitive load and perceived latency. In practice, that means you can give room navigation a stylized flicker or ghost-image transition as a progressive enhancement, with an instant navigation fallback where the API is unavailable or when reduced motion is requested. citeturn20view0turn20view1

If you want optional room music with skins and a delightfully excessive UI, Webamp is the best “big toy” to lazy-load after user consent. It already documents minimal script integration, multiple tracks, multiple skins, and Milkdrop examples, and it fits the late-90s/early-2000s aesthetic without requiring you to hand-roll an entire desktop music player from scratch. citeturn19view0turn19view2

## Preservation and maintenance

The maintenance lesson from GeoCities is brutal and simple: build your museum as if it might disappear tomorrow. Bril calls GeoCities a warning about what happens when commercial platforms no longer find user content valuable, and the whole preservation ecosystem around the service exists because people acted before shutdown erased too much. If this project matters to you emotionally, its maintenance plan is part of its design. citeturn15view1turn1view0

Do not hot-link decorative assets. Download them, rename them sanely, store them in your repo, and keep provenance. Button archives still explicitly advise avoiding hot-linking, and preservation history is full of vanished sources. citeturn22search1turn22search4

A minimal asset manifest should exist from the first serious iteration:

```yaml
id: badge_scaniashrine_01
file: /public/buttons/scania-love-01.gif
source_page: "archived source or artist page"
source_type: archived_gif | self_made | commissioned | licensed
captured_on: 2026-05-04
used_in:
  - /rooms/scania-shrine
mood_tags:
  - chrome
  - truck
  - devotion
license_note: "status known / unknown / personal use only"
alt: "animated 88x31 button celebrating a truck shrine"
```

That manifest does three jobs at once: it preserves memory, it makes future cleanup possible, and it gives an AI helper factual context about what assets belong where.

You should also keep a public changelog culture. Old personal sites felt alive because they showed when things changed, what was new, and what was still being built. Add visible “last updated” lines to the hub and rooms, keep old entries rather than deleting them, and let some dead pages remain online with a tombstone note instead of disappearing quietly. That is not only historically resonant; it strengthens the museum quality of the project itself. citeturn14view3turn27view0

A low-drama preservation routine would be enough:
- keep the full site in Git;
- export a static snapshot or deployment artifact after major milestones;
- save a screenshot pack of the hub plus key rooms after each session;
- back up `public/` assets separately;
- maintain the asset manifest and room metadata;
- never “clean up” old room names without leaving redirects or tombstones.

## The iteration harness you can actually use

This project should be judged by a rubric that rewards authorship, intimacy, and accumulation rather than polish alone. That is the best defense against AI people-pleasing: the machine should be asked to detect missing life, not just presentational flaws. The rubric below is derived from the historical traits that repeatedly show up in accounts of GeoCities culture: neighborhoods, guest books, public-private writing, visible status, combinatory graphics, and community traces. citeturn14view3turn15view0turn27view0

### Definition of done

A page or milestone is “getting there” when a stranger can tell, within about twenty seconds:

- who made this;
- what they love;
- what they mourn;
- what is unfinished;
- where to go next;
- and why the page could not belong to anyone else.

If the site looks retro but those answers are still vague, you are not there.

### Soul rubric

Score each category from 0 to 5.

- **Authorship trace**: Could this only belong to you, or could it belong to any retro template pack?
- **Room identity**: Do rooms genuinely differ in mood, furniture, and content logic?
- **Emotional specificity**: Are grief, jokes, obsessions, tastes, and ordinary life plainly visible?
- **Social affordances**: Are there counters, guestbook links, buttons, outbound links, invitation points, or neighbor logic?
- **Decorative meaning**: Are gifs, badges, stickers, and backgrounds topic-specific rather than generic filler?
- **Temporal sediment**: Can I see updates, last-modified traces, under-construction zones, old layers, or a history of additions?
- **Spatial navigation**: Does the site feel like a place with rooms, rails, exits, indexes, and returns rather than a feed?
- **Performance and safety**: Are motion, sound, and heavy media optional or responsibly controlled?

A strong milestone is usually **32/40 or higher**, with no category below **3**. A weak “retro skin only” build almost always fails on authorship trace, emotional specificity, and temporal sediment.

### Hard fail conditions

If any of these are true, the build should be treated as not-there-yet regardless of score:

- the home page still reads as a portfolio landing page;
- the rooms still feel like cards in one design system rather than neighborhoods;
- there is no public trace of visitors or returnability;
- there is no page that reveals love, grief, or fixation in concrete terms;
- the decorations could be swapped with any other gif pack and nothing essential would change;
- audio or motion feels forced instead of invited.

### AI coding agent prompt

Use this prompt in future sessions when you paste a screenshot and want critique instead of flattery:

```text
You are reviewing a personal website that aims for a GeoCities-inspired, room-based, emotionally specific, pre-platform-web feeling.

Your job is not to be nice. Your job is to be accurate.

Inputs I will provide:
- one or more screenshots
- optional notes about what changed
- optional route/file names

Evaluate the site against these categories from 0 to 5:
1. authorship trace
2. room identity
3. emotional specificity
4. social affordances
5. decorative meaning
6. temporal sediment
7. spatial navigation
8. performance and safety

Rules:
- Do not compliment anything unless you can point to visible evidence in the screenshot.
- If something looks like AI slop, say so plainly and explain why.
- Prefer additive changes over full redesigns.
- Never recommend infinite scroll as the primary solution.
- Preserve strange ideas if they increase authorship, even if they reduce polish.
- Distinguish between “too clean,” “too empty,” “too generic,” and “too chaotic.”
- Call out what is missing, not only what is broken.

Output format:
- overall verdict in 3 sentences
- category scores with one-sentence justification each
- the single most AI-looking area
- the single most soulful area
- 3 highest-leverage improvements:
  - one content addition
  - one layout/navigation change
  - one decorative or interactive toy
- any SSR / hydration / performance / accessibility warnings relevant to implementation
```

### Session cadence

Do not one-shot the whole museum. A better rhythm is to move in layers:

- **Session one**: make the hub feel like a switchboard, not a shell.
- **Session two**: build your badge garden, sticker language, and utility sidebars.
- **Session three**: add guestbook, counter, and sound gate.
- **Session four**: build the cat memorial and the Feed Pixel page.
- **Session five**: build the Scania shrine and truck-specific decorative vocabulary.
- **Session six**: run the screenshot critic, then add one new room and one new toy instead of “polishing” everything.

That cadence keeps the project alive in the same way old personal sites stayed alive: by accreting worlds, not by waiting for one perfect launch.