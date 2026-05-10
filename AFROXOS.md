# afroxOS '97 — Design System Spec

Last updated: 2026-05-10
Status: API contract drafted (§ 10) and pending sign-off. ADRs in `docs/adr/`. No code migration started yet.
Scope: This document is the source of truth for the afroxOS '97 visual + interaction system. It supersedes the Win98-chrome direction described in `CLAUDE.md` Tenet A *for the hub shell only*. Individual rooms keep full opt-out (see § Room sovereignty).

---

## 1. Identity — the alt-history pitch

**afroxOS '97** is a homemade boutique operating system that, in our alt-history, shipped on CD-R one year before Windows 98 and lost the OS war anyway. Microsoft happened. The afroxOS team kept shipping for the people who already had the disc. This site is afroxOS '97 — still booting, still beloved, still built by one person.

**Tone target:** *a teenager built this in their bedroom in 1999 and shipped it on warez disks.* Hand-made, idiosyncratic, lovable. Rough edges are charm, not bugs to polish out.

**Why this works for Afroximity:**
- Predating Win98 makes the chrome feel original, not derivative
- "Homemade" frames every design quirk as personality, not failure
- The OS metaphor turns rooms into apps, tools into an OS surface, and the splash into a real boot — collapsing three nav layers into one spatial frame
- Keeps the existing InstallShield wizard transition (the "install to enter" metaphor still slaps; it's now period-correct for an alt-history '97 OS)

**Versioning:** chrome reads `afroxOS '97` everywhere user-visible (splash, About box, fake browser titlebar, status footer). Internal package/component naming uses `ax` prefix (`--ax-*`, `<AxWindow>`, `useAxWindowManager`).

---

## 2. Lineage — what we borrow, what we don't

| From | What we take | What we leave |
|------|--------------|---------------|
| **AmigaOS Workbench** | "Drawers" instead of "folders". The desktop is the **Workbench**. Right-click context menus on objects. Icons-on-desktop as the primary launch surface. | Multi-screen scrolling, the actual Amiga palette (we use our own). |
| **Windows 95/98** | Window chrome math (raised/sunken bevels, titlebar with min/max/close, sunken inputs), Start button + bottom taskbar pattern, system tray. *They won the war for a reason — these conventions just work.* | Teal desktop, navy gradient titlebars, MS Sans Serif chrome font (we replace), the literal "Microsoft" feel. |
| **NeXTSTEP** | The dock as a separate surface from the launcher. | Right-side titlebars, the literal NeXT palette. |
| **BeOS / OS/2 / Mac 8** | Inspiration only. Not directly fused into afroxOS '97. | Per-window tabs, popup folder tabs, Workplace Shell, etc. |

**Net:** Win-style window chrome + Amiga workbench/drawer metaphor + NeXT-style dock as a third surface. Three influences, fused into one alt-history OS.

---

## 3. Palette — `--ax-*` tokens (Ochre + Sage)

These live in `app/globals.css` alongside (not replacing) `--win-*` and `--gc-*`. The hub shell migrates from `--win-*` to `--ax-*`. `--win-*` stays defined so any room that wants Win98 can opt in. `--gc-*` stays for cyber-purple rooms.

```css
/* afroxOS '97 — Ochre + Sage */
--ax-desktop:        #c89545; /* deep ochre — the workbench wallpaper */
--ax-desktop-tile:   url('/gifs/bg/ax-desktop-tile.png'); /* optional pattern, see § Assets */

--ax-face:           #f0e6d2; /* cream — window face, drawer body */
--ax-face-shadow:    #d9cba8; /* slightly darker cream for depth */
--ax-bevel-light:    #fffaee; /* 3D bevel highlight (top + left) */
--ax-bevel-shadow:   #8a7a5c; /* 3D bevel shadow (bottom + right) */
--ax-bevel-dark:     #2a2418; /* outer ring + dark shadow */

--ax-titlebar:       #4d5a3a; /* deep sage — active titlebar */
--ax-titlebar-2:     #6e7a52; /* sage gradient end (subtle) */
--ax-titlebar-text:  #f0e6d2; /* cream on sage */
--ax-titlebar-inactive: #8a8470; /* greyed sage for unfocused windows */

--ax-panel:          #fffaee; /* inner content surfaces (cream-white) */
--ax-text:           #1a1410; /* sepia-ink body text */
--ax-text-muted:     #5a4f3a; /* secondary text */
--ax-link:           #2c5282; /* ink blue — unvisited link */
--ax-link-visit:     #6b3a8b; /* dusty purple — visited link */
--ax-accent:         #8b3a2e; /* rust — NEW, warnings, marquee emphasis */
--ax-success:        #4d5a3a; /* sage = success in this palette */
```

**Rule:** the (site) shell uses `--ax-*` only. No teal, no navy, no neon glow. The accent for emphasis is rust (`--ax-accent`), not burgundy.

**Desktop tile:** ochre flat is the default. We may overlay a subtle hand-drawn parchment-noise tile via `assets:grab "parchment texture"` later. Keep it < 256×256, < 50 KB, low-contrast.

---

## 4. Typography

afroxOS '97 keeps the existing `--gc-font-*` token names (no rename — the stacks are already correct for the era). The hub stops using pixel fonts entirely; pixel fonts move to the `<Sticker>` slot only (see § 11).

| Token | Stack | Use in afroxOS |
|-------|-------|----------------|
| `--gc-font-body` | Verdana, Tahoma, DejaVu Sans, Geneva | Window body text, paragraphs, drawer item names |
| `--gc-font-ui` | MS Sans Serif → Tahoma | Titlebars, menu bar, buttons, start menu items, dock tooltips |
| `--gc-font-italic` | Times New Roman, Georgia | Manifesto, captions, blockquotes |
| `--gc-font-display` | Comic Sans MS | **The author's signature only** — appears once in About box, once on the Workbench (a "signed by" sticker) |
| `--gc-font-code` | Courier New | Address bars, file paths, status bar tickers, slugs |
| `--gc-font-pixel` | VT323 | Counter LEDs, sticker badges only |
| `--gc-font-pixel-tight` | Press Start 2P | NEVER on the shell. Reserved for 88×31 button text and system-tray icons. |

---

## 5. Window chrome — the `Ax*` component family

Built on `react-rnd` for drag/resize primitives. Chrome is hand-authored.

| Component | Replaces / extends | Notes |
|-----------|--------------------|-------|
| `<AxWindow>` | The Win98 `<Window>` helper currently in `app/(site)/hub/page.tsx` | Wraps `react-rnd`, renders titlebar + body. Props: `title`, `icon`, `defaultPosition`, `defaultSize`, `minimizable`, `maximizable`, `resizable`, `onClose`. Registers itself with the WM store on mount. |
| `<AxTitlebar>` | `.win-titlebar` | Sage gradient, cream text, hand-drawn 16px icon on the left, `_ □ ×` controls on the right. Double-click to maximize. Drag to move. |
| `<AxButton>` | `.win-button` | Cream-faced button with ochre bevel. Depresses on `:active`. `min-width: 75px`. |
| `<AxBevelOut>` / `<AxBevelIn>` | `.win-bevel-out` / `.win-bevel-in` | Standalone bevel utilities for tiles, wells, status bars. |
| `<AxField>` | sunken white input | Sunken cream input with sage focus ring. |
| `<AxLink>` | `.win-link` | Ink-blue underlined link, dusty-purple when visited. |
| `<AxMenu>` / `<AxMenuItem>` | New | The menu bar inside windows (File / Edit / View …) and the Start menu use the same primitive. |

**CSS lives in `app/globals.css`** under a `/* === afroxOS '97 chrome === */` section. Keep `.win-*` classes intact below it for room opt-in.

---

## 6. The Workbench — desktop layer

The Workbench is the new `(site)` shell, replacing the IE5 fake-browser frame.

**Anatomy (top to bottom):**

1. **Workbench surface** — full viewport, ochre bg with optional parchment tile. Hosts:
   - **Drawer icons** (desktop icons): hand-drawn pixel art, double-click to open
   - **Stickers / decorations** (NEW! badges, "signed by", an `@` mailto sticker, a pixel pet)
   - **Floating windows** (managed by `react-rnd` + WM store)
2. **Dock** (optional, default visible) — small floating shelf, top-right or bottom-center. Pinned tools. ~28px tall, hand-drawn icons.
3. **Taskbar** — bottom strip, `--ax-face` background, sage bevel:
   - **`afroxOS` Start button** (left) — opens the start menu
   - **Open-window buttons** (middle) — one per non-minimized AxWindow
   - **System tray** (right) — clock (Courier, sepia), tiny "modem connected" lamp icon, volume sticker

**Default Workbench drawers** (icons on the desktop):
- `Tools` — opens a window with the contents of `app/(site)/tools/`
- `Rooms` — opens a window with the room directory (icons, not list)
- `Read Me` — opens a `.txt`-style window with the manifesto (current hub manifesto copy)
- `Junk Drawer` — easter eggs, half-finished ideas, the credits.exe, a `secrets.txt`
- `Recycle Bin` — opens to "(empty)" — homemade detail, never functional

**Implementation:** `app/(site)/page.tsx` *becomes* the Workbench (was: redirect-to-hub). The current `/hub` route keeps existing for direct linking but renders identically (the Workbench is now the home).

---

## 7. Drawers — the folder metaphor

A **drawer** is a window that contains an icon grid. It replaces what Windows would call a folder.

```
┌─────────────────────────────────────┐
│ ▣ Tools                    _ □ ×    │  ← AxTitlebar (sage)
├─────────────────────────────────────┤
│ File  Edit  View  Drawer  Help      │  ← AxMenu bar
├─────────────────────────────────────┤
│  ┌──┐    ┌──┐    ┌──┐    ┌──┐      │
│  │📐│    │💱│    │📅│    │🔧│      │  ← drawer items
│  └──┘    └──┘    └──┘    └──┘      │
│  ruler  convert  agenda  fixit      │
│                                     │
├─────────────────────────────────────┤
│ 4 items                  Drawer ▽   │  ← status bar
└─────────────────────────────────────┘
```

- Drawer items are also `<AxIcon>` components — same primitive as desktop icons
- Right-click an item: context menu with `Open / Open in window / Properties / Throw in junk drawer`
- Double-click a tool item → launches the tool **as an `<AxWindow>`** in the WM
- Properties dialog is itself a tiny AxWindow with a sunken-bevel info panel — period-correct, makes everything feel like a real OS

**`<AxIcon>`** props: `label`, `image` (path to hand-drawn 32×32 PNG/GIF), `onOpen`, `onContextMenu`.

---

## 8. Tool surface — three scoped placements

| Surface | Scope | What lives here |
|---------|-------|------------------|
| **Start menu** (afroxOS button → bottom-left) | The complete index | All tools, all rooms, About afroxOS, Shut Down (re-runs splash), Run… (joke text input) |
| **Dock** (floating shelf) | Pinned favorites | 4–6 most-used items, user-curated in `content/dock.ts` (manifest pattern). Hover = title tooltip. |
| **Desktop drawers** (Workbench icons) | Thematic groups | `Tools`, `Rooms`, `Read Me`, `Junk Drawer`, `Recycle Bin`. Visible at all times, give the desktop personality. |

The same item (e.g., "Currency Converter") can appear in all three — that's intentional, mirrors how real OS launchers overlap.

**Manifest extension:** every tool/room manifest gets two new optional fields:
```ts
// content/tools/{slug}/index.ts
{
  slug, title, description, component,
  icon: '/gifs/icons/tools/converter.png',     // 32×32 PNG, hand-drawn
  defaultDrawer: 'tools',                       // 'tools' | 'rooms' | 'junk' | null
  pinnedToDock?: boolean,                       // appears in dock if true
  windowDefaults?: { width, height, resizable }
}
```

---

## 9. Window manager — architecture overview

**Dependencies (locked):** only `react-rnd` and `zustand`. No styled-components, no React95, no winbox, no react-kitten. Rationale in `docs/adr/0001-window-primitive-react-rnd.md` and `docs/adr/0002-state-management-zustand.md`.

**Layered design — boundary rules are enforceable:**

```
lib/wm/                    ← kernel. Zero React below store.ts. Pure TS.
├── types.ts               ← all public types
├── store.ts               ← zustand store, pure state machine
├── store.test.ts          ← reducer + invariants (vitest)
├── api.ts                 ← public WM API (the only thing apps import)
├── hooks.ts               ← React hooks for app code (useAxWindow etc.)
├── events.ts              ← typed event bus
├── manifest.ts            ← defineApp validator + registry
├── persist.ts             ← session restore (window positions to localStorage)
├── README.md              ← API reference, agent-onboarding, worked example
└── index.ts               ← single entry, re-exports api/hooks/types only

components/ax/             ← chrome. Imports from lib/wm via index.ts only.
└── (AxWindow.tsx, AxTitlebar.tsx, AxButton.tsx, ...)

app/(site)/                ← shell. Imports lib/wm + components/ax.
└── (AxWorkbench, AxTaskbar, AxStartMenu, AxDock, AxSystemTray)

content/apps/{slug}/       ← apps. Import only useAxWindow + useAxWindowChrome.
├── manifest.ts            ← defineApp({ ... })
└── App.tsx                ← the app
```

**Boundary enforcement:** `eslint-plugin-boundaries` config — apps may only import from `lib/wm` (public surface), never from `lib/wm/store` or `lib/wm/persist`. Components/ax may import from `lib/wm` only via its index. Lint failure = blocked merge.

---

## 10. Window API contract — the public surface

This section is the **stable** contract. Everything in this section is the API agents/devs depend on. Anything not in this section is implementation detail and can change. Breaking changes to this section require an ADR.

### 10.1 Types (`lib/wm/types.ts`)

```ts
/** Stable, opaque window identifier. Format: `ax-${nanoid(10)}`. */
export type WindowId = string & { readonly __brand: 'WindowId' };

/** Props passed by the WM into every windowed app's default export. */
export interface AppProps {
  /** The window's stable ID. Same as useAxWindow().id. */
  windowId: WindowId;
  /** Caller-supplied props from WindowSpec.props, narrowed by the app's own type. */
  [key: string]: unknown;
}

export interface WindowSpec {
  /** Shown in titlebar, taskbar, and Alt+Tab. */
  title: string;
  /** Path to a 16×16 (or 32×32) PNG. Shown in titlebar + taskbar. */
  icon?: string;
  /** Lazy-loaded component module. Use `() => import('./App')`. */
  component: () => Promise<{ default: React.ComponentType<AppProps> }>;
  /** Forwarded to the app component as props. Must be JSON-serializable for session restore. */
  props?: Record<string, unknown>;
  /** Initial position in Workbench coords. Default: cascading offset from last open. */
  defaultPosition?: { x: number; y: number };
  /** Initial size. Default: 640×480. */
  defaultSize?: { width: number; height: number };
  /** Minimum size during resize. Default: 240×160. */
  minSize?: { width: number; height: number };
  resizable?: boolean;     // default true
  minimizable?: boolean;   // default true
  maximizable?: boolean;   // default true
  /** If true, opening when an instance with same `singletonKey` exists focuses the existing window. */
  singleton?: boolean;
  /** Required when `singleton: true`. Defaults to manifest slug if opened via launchApp(). */
  singletonKey?: string;
  /** If true, window is modal — blocks clicks on others, dimmed backdrop. Use sparingly. */
  modal?: boolean;
}

export interface WindowState {
  readonly id: WindowId;
  readonly title: string;
  readonly icon?: string;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly z: number;
  readonly minimized: boolean;
  readonly maximized: boolean;
  readonly focused: boolean;
  readonly modal: boolean;
  readonly mountState: 'loading' | 'ready' | 'errored' | 'closing';
  readonly singletonKey?: string;
}

export interface WindowHandle {
  readonly id: WindowId;
  close(): void;
  focus(): void;
  minimize(): void;
  restore(): void;
  toggleMaximize(): void;
  setTitle(title: string): void;
  /** Imperative move/resize. Prefer letting the user drag. */
  setRect(rect: Partial<{ x: number; y: number; width: number; height: number }>): void;
}
```

### 10.2 The `wm` object (`lib/wm/api.ts`)

```ts
export const wm: {
  /**
   * Open a window. Returns a handle with imperative controls.
   * - If `singleton: true` and an instance with the same key exists, focuses it
   *   and returns the existing handle (does NOT re-mount).
   * - Component import is awaited lazily; window appears immediately in
   *   `mountState: 'loading'` and renders a sage-on-cream loading bevel until
   *   ready. If import rejects, transitions to `mountState: 'errored'` and
   *   shows an AxErrorWindow.
   */
  open(spec: WindowSpec): WindowHandle;

  /** Returns null if id no longer exists (closed). */
  get(id: WindowId): WindowHandle | null;

  /** Snapshot of all windows in z-order (lowest first). */
  list(): readonly WindowState[];

  /** Currently focused window, or null if Workbench has focus. */
  focused(): WindowState | null;

  /** Subscribe to typed events. Returns an unsubscribe fn. */
  on<E extends WMEventName>(event: E, cb: WMEventHandler<E>): () => void;
};

/**
 * Convenience for opening a registered app by slug. Looks up the manifest,
 * applies its windowDefaults, and calls wm.open().
 *
 * Apps SHOULD call this to launch other apps (cross-app coordination)
 * instead of importing each other's components.
 */
export function launchApp(slug: string, props?: Record<string, unknown>): WindowHandle | null;
```

### 10.3 Hooks for app code (`lib/wm/hooks.ts`)

These are the only kernel imports apps should touch.

```ts
/**
 * App reads its own window state + requests changes.
 * Must be called from inside a component rendered by the WM.
 * Throws if called outside a WM-managed window.
 */
export function useAxWindow(): {
  readonly id: WindowId;
  readonly title: string;
  readonly focused: boolean;
  readonly minimized: boolean;
  readonly maximized: boolean;
  setTitle(title: string): void;
  requestClose(): void;
  requestFocus(): void;
};

/**
 * Declares chrome the WM should render around the app.
 * Re-runs on every render; the WM diffs internally.
 */
export function useAxWindowChrome(opts: {
  /** Menu bar spec (File / Edit / etc.). Rendered inside AxWindow above the app body. */
  menu?: AxMenuSpec;
  /** Status bar spec, rendered at window bottom. */
  statusBar?: AxStatusBarSpec;
  /** When true, titlebar shows a • prefix and onBeforeClose is consulted. */
  dirty?: boolean;
  /** Return false (or a Promise resolving false) to cancel close. */
  onBeforeClose?: () => boolean | Promise<boolean>;
}): void;

/** Subscribe to a slice of WM state with automatic re-render on change. */
export function useWMSelector<T>(selector: (state: WMSnapshot) => T): T;
```

### 10.4 Manifest registration (`lib/wm/manifest.ts`)

```ts
export interface AppManifest {
  /** kebab-case, must be unique across all apps. Used in URLs and singletonKey. */
  slug: string;
  title: string;
  icon: string;
  /** One-line description for the directory views. */
  description: string;
  /** Lazy import of the app's default export. */
  component: () => Promise<{ default: React.ComponentType<AppProps> }>;

  defaultDrawer?: 'tools' | 'rooms' | 'junk' | null;
  pinnedToDock?: boolean;

  /** Defaults applied when the app is launched via launchApp(slug). */
  windowDefaults?: Partial<Pick<WindowSpec,
    | 'defaultSize' | 'minSize' | 'resizable'
    | 'minimizable' | 'maximizable' | 'singleton'>>;
}

/**
 * Validates and registers an app at module-load time.
 *
 * Throws (at import) if:
 *   - slug is duplicate
 *   - slug is not kebab-case
 *   - icon path is not an absolute path under /gifs/icons/
 *   - description is empty (Tenet C — copy must be intentional)
 */
export function defineApp(manifest: AppManifest): AppManifest;
```

### 10.5 Event bus (`lib/wm/events.ts`)

```ts
export type WMEventName =
  | 'window:open'      // payload: { id, spec }
  | 'window:close'     // payload: { id }
  | 'window:focus'     // payload: { id, prevId }
  | 'window:minimize'  // payload: { id }
  | 'window:restore'   // payload: { id }
  | 'window:maximize'  // payload: { id, maximized }
  | 'window:move'      // payload: { id, x, y }
  | 'window:resize'    // payload: { id, width, height }
  | 'app:launch'       // payload: { slug, id }
  | 'wm:ready';        // payload: {} — fires once after persist hydration
```

Use the bus for cross-cutting telemetry, debugging, and the `Junk Drawer` "what's running" panel. Do NOT use it as the primary state read path — `useWMSelector` is faster and consistent.

### 10.6 Lifecycle contract

A window goes through these states, in order. Apps can observe via `mountState`.

| State | When | App rendered? |
|-------|------|---------------|
| `loading` | After `wm.open()`, before `component` import resolves. | No — chrome shows loading bevel. |
| `ready` | Component imported and mounted. | Yes. |
| `errored` | `component` import rejected, or thrown during render. | No — chrome shows AxErrorWindow body with reload button. |
| `closing` | After `requestClose()`/`close()`, while `onBeforeClose` resolves. | Yes — app still mounted, frozen UI. |
| (removed) | `close()` resolved truthy. | No — fully unmounted, removed from store. |

**Ordering guarantees:**
- `wm.open()` is synchronous and returns a handle immediately. The window exists in the store before the import resolves.
- `window:focus` always fires *after* `window:open` for the same id (open implies focus unless `modal: false` and another modal exists).
- `window:close` fires before the app component unmounts. Cleanup (event listeners, intervals) happens in the app's own `useEffect` cleanup.

### 10.7 Error semantics — predictable failures

| Scenario | Behavior |
|----------|----------|
| `component` import rejects | Window enters `errored`. AxErrorWindow shows with the error message + "Reopen" button. Logs to console (dev) and `events.emit('window:open')` payload includes the error. |
| `singleton: true` opened twice | Second call returns the **existing** handle. No remount, no prop merge. (If you need to update props on a singleton, call `handle.setRect()` etc. or close+reopen.) |
| `singleton: true` without `singletonKey` and not via `launchApp` | Throws synchronously. Caller bug. |
| `defineApp` with duplicate slug | Throws at import. App registry is tree-shaken-safe; this fires during build/dev startup. |
| `setTitle("")` or > 80 chars | Truncates to 80, never empty. (Empty falls back to manifest title.) |
| Window dragged off-screen | Clamped on resize/load to keep ≥ 80px visible inside Workbench. Stored coords are the dragged coords; clamping is render-time. |

**No silent failures.** Every error path either throws (caller bug) or transitions `mountState` to `errored` (runtime). No try/catch swallowing.

### 10.8 Persistence (`lib/wm/persist.ts`)

Window positions, sizes, and "which apps were open" persist to `localStorage` under the key `afroxos.wm.session.v1`. Restore happens once on `<AxWorkbench>` mount, fires `wm:ready` when done.

**What persists:**
- For each open non-modal window: `slug` (if launched via `launchApp`), `x`, `y`, `width`, `height`, `minimized`, `maximized`, `props` (must be JSON-serializable).
- The `z` order.

**What does NOT persist:**
- Modal windows (always re-opened by the parent).
- Windows opened via `wm.open()` directly (no `slug` to re-launch from).
- Component-internal state (apps own their own persistence).

**Schema versioning:** the `v1` suffix is part of the contract. Bump = clear old state on read. Migration logic lives in `persist.ts`.

**Disable mechanism:** `?nopersist=1` query param skips both write and read. Useful for screenshots / demos.

### 10.9 Z-order rules

- Each open window has a `z` integer assigned monotonically.
- Focusing a window sets its `z` to `++zCounter`.
- Modals always render above non-modals (separate z-band: `modalZ = z + 1_000_000`).
- The Workbench (desktop, drawer icons) is conceptually at `z = -1` — never overlaps a window.
- Taskbar, Dock, Start menu render in a fixed top layer (`z = 10_000_000`) — they always overlay everything except modals' backdrop.

### 10.10 Keyboard contract (Phase 3)

Reserved by the WM — apps must not bind these:

| Combo | Action |
|-------|--------|
| `Alt+Tab` | Cycle focus through non-minimized windows. |
| `Alt+F4` | Close focused window. |
| `Ctrl+Alt+Esc` | Open `Task Manager` app (singleton). |
| `Esc` (when modal focused) | If modal has `dismissable: true`, close it. |
| `Win` / `Meta` | Toggle Start menu. |

Phase 1 ships none of these; Phase 3 adds them with this exact mapping.

### 10.11 SSR / hydration

The WM is **client-only**. `lib/wm/store.ts` reads `localStorage` lazily on first access; `lib/wm/api.ts` has zero side effects at module load. The Workbench is rendered with `'use client'` and `useEffect`-guarded persist read. Server-rendered HTML shows the desktop background + drawer icon SSG; windows hydrate in. No layout shift because window positions come from persist, which only runs after mount.

### 10.12 Performance contract

- Every WM read in a component goes through `useWMSelector` with a stable selector. Re-renders are scoped per window — moving window A doesn't re-render window B's body.
- `react-rnd` drag handlers are throttled to 60Hz internally; we do not add another rAF.
- The Workbench renders one `<react-rnd>` per non-minimized window. Minimized windows render zero DOM (state stays in store, body unmounts).
- Z-index changes do not trigger reorders in DOM — we set `z-index` CSS only. The DOM order matches insertion order.
- Bundle budget: `lib/wm` (kernel + chrome primitives) ≤ 25 KB gzipped, excluding `react-rnd` (~12 KB) and `zustand` (~1 KB). Tracked by `pnpm size`.

### 10.13 Accessibility

- Each `<AxWindow>` is a `role="dialog"` with `aria-labelledby` pointing at the titlebar's title text.
- Focused window has a sage-bordered focus ring and `aria-modal="false"` (modals get `aria-modal="true"`).
- Tab order inside a window is the natural DOM order. The WM does not steal Tab.
- `Esc` does not close non-modal windows by default — apps that want it bind it themselves.
- Drawer icons are `<button>`s with `aria-label`; double-click is the *primary* gesture but Enter/Space also opens.
- Color contrast: all `--ax-*` text-on-bg pairs in § 3 verified ≥ 4.5:1 (sage `#4d5a3a` on cream `#f0e6d2` is 6.8:1; cream `#f0e6d2` on sage `#4d5a3a` is 6.8:1; sepia `#1a1410` on cream is 14.6:1). Verified before merge.

### 10.14 Stability promise

Once Phase 2 ships and this section is reviewed + signed off:
- **No breaking changes to § 10.1–10.6 without an ADR.** Type rename, signature change, or behavior change to public functions counts as breaking.
- New optional fields on `WindowSpec` / `AppManifest` are non-breaking and don't need an ADR.
- Internal store shape, hook implementations, persist format (with version bump) are not part of the contract — change freely.

---

## 11. Routing — rooms as apps, URLs as fallback

The big architectural shift. Three states a room can render in:

| Entry point | Render |
|-------------|--------|
| Direct URL `/rooms/japan2026` | Full-screen, isolated, exactly as today (`app/(rooms)/rooms/[slug]/RoomRenderer.tsx`). The InstallShield wizard transition still plays. The room owns 100% of the viewport. **No afroxOS chrome leaks in.** |
| Click drawer icon on Workbench | Opens **inside an `<AxWindow>`** via the WM store. The room renders into the window's body. Multiple rooms can be open at once. |
| Click tool icon on Workbench | Same as drawer: opens inside `<AxWindow>`. Tools were already small components, so this is natural. |

**Implementation note:** rooms must already be self-contained client components (CLAUDE.md tenet — *"Each room owns 100% of its visual world. No hub chrome leaks in."*). This means they already render correctly in any container — full-screen *or* windowed. We just have to verify each room is window-resilient (no `position: fixed` that assumes viewport corners; use container queries, not media queries).

**Splash gate (`app/(splash)/page.tsx`)** — unchanged. Wizard chrome stays. Copy updates: `Welcome to the afroxOS '97 Setup Wizard`.

**InstallShield transition (`app/(rooms)/GlitchTransition.tsx`)** — unchanged. Still plays on direct-URL room visits. Title updates: `afroxOS '97 Setup — Installing <SLUG>`.

---

## 12. Homemade signature — the personality details

These are what make afroxOS '97 read as *one person made this*, not a Microsoft clone.

**On the Workbench:**
- A "signed by afroximity" Comic Sans sticker in the bottom-right corner (rotated 4°, over a piece of pixel-art tape)
- The Recycle Bin always says `(empty)` even after you "throw" things in — no functional empty animation
- An `@` sticker (mailto, like the existing hub) but rendered as a pixel-art Post-it
- The clock in the system tray shows the *actual* date but with the year forced to `1997` — alt-history detail
- Hovering the desktop ochre triggers a 1px wobble on a random sticker (can't be CSS, needs a tiny effect — kept subtle)

**In the chrome:**
- 1px misalignments on titlebars are **kept on purpose** — feel hand-laid-out, not pixel-perfect
- Cursor changes to `wait` for ~120ms on every window open (fake "loading"), then snaps to default — feels like an OS
- All buttons have a 60ms depress + 40ms recoil — never instant
- Sounds (optional, behind a `🔊` toggle in the system tray):
  - Drawer open: floppy-seek sample (~600ms)
  - Window close: cassette-deck stop (~200ms)
  - Error dialog: a chord on a Casio keyboard (~400ms)
  - Splash: 2 seconds of modem handshake

**In the About box (`afroxOS button → About afroxOS`):**
- A small AxWindow titled `About afroxOS '97`
- Pixel logo, version `0.97 build 042`, "© 1997 afroximity" line
- A scrolling credits panel (sunken bevel) with names, in-jokes, "made on a ThinkPad in Beşiktaş"
- A `MORE…` button that opens a `MANIFESTO.TXT` window — manifesto copy from `HUB_STATE.md`

**In `Junk Drawer`:**
- `secrets.txt` — joke ASCII map of the site
- `unfinished.bmp` — a half-rendered icon
- `notes-to-self.txt` — TODOs the author "forgot to delete"
- `credits.exe` — when launched, opens a long scrolling-credits AxWindow with VT323 names

**Copy rule:** all human-readable copy on the Workbench, in the About box, in `MANIFESTO.TXT`, in `secrets.txt`, etc., follows **CLAUDE.md Tenet C**. Placeholders only until an enrich session captures real copy:

```tsx
{/* COPY: About afroxOS body — fill via `enrich: afroxOS about box` */}
{/* COPY: Junk Drawer secrets.txt — fill via `enrich: junk drawer` */}
```

---

## 13. Migration plan (phased)

### Phase 1 — tokens + chrome primitives (no behavior change)
- Add `--ax-*` tokens to `app/globals.css` (keep `--win-*` and `--gc-*`)
- Author `<AxWindow>`, `<AxTitlebar>`, `<AxButton>`, `<AxBevelOut>`, `<AxBevelIn>`, `<AxField>`, `<AxLink>`, `<AxMenu>` in `components/ax/`
- No `react-rnd` yet — `<AxWindow>` Phase-1 wraps a static div with the new chrome (drop-in replacement for the current `<Window>` helper)
- Update `app/(site)/layout.tsx` outer frame: replace IE5 fake browser with Workbench taskbar + Start button (still no WM)
- Update `app/(site)/hub/page.tsx` to use `<AxWindow>` instead of `<Window>`

**Outcome:** the hub looks like afroxOS '97 (ochre + sage, sage titlebars, cream chrome) but is still a static page. No regressions, no react-rnd dep yet.

### Phase 2 — Workbench + drawers (desktop layer)
- Install `react-rnd` and `zustand`
- Build WM store (`lib/wm/store.ts`)
- Build `<AxWorkbench>` component (replaces the `(site)` layout chrome)
- Build `<AxIcon>`, `<AxDrawer>`, `<AxStartMenu>`, `<AxDock>`, `<AxTaskbar>`, `<AxSystemTray>`
- Hand-draw initial 32×32 icons for: Tools, Rooms, Read Me, Junk Drawer, Recycle Bin, afroxOS logo
- Wire desktop drawers to existing tool/room registries
- Move `/hub` content into the `Read Me` drawer (manifesto stays)

**Outcome:** Workbench is the home. Desktop has icons. Tools and rooms launch as windows. Taskbar tracks open windows.

### Phase 3 — homemade personality
- Sound effects + 🔊 toggle in system tray
- Comic Sans signature sticker, rotated tape decorations
- Cursor wait effect, button micro-depress timing
- Junk Drawer easter eggs (`secrets.txt`, `credits.exe`, `unfinished.bmp`)
- About afroxOS dialog
- 1px misalignment audit (intentional, sign-off by author)
- Year-forced-to-1997 system tray clock

**Outcome:** afroxOS '97 reads as homemade. Personality complete.

### Phase 4 — copy enrich pass
- `enrich: afroxOS about box`
- `enrich: junk drawer`
- `enrich: workbench stickers` (signature copy, sticker text, manifesto sticker)
- Re-thread captured copy into placeholders

**Outcome:** all copy is real, not generated.

---

## 14. Room sovereignty (unchanged)

Rooms inside `(rooms)/` continue to own 100% of their visual world. afroxOS '97 chrome **never leaks into a room**. A room can:

- Use `--ax-*` tokens (afroxOS palette inside the room)
- Use `--win-*` tokens (Win98 throwback inside the room)
- Use `--gc-*` tokens (Area51 cyber-purple inside the room)
- Use entirely custom tokens (japan2026 already does this with Fraunces editorial)

The afroxOS shell's job is to be the OS the room launches *from*. Once the room is open (full-screen or windowed), the room is in charge of its own pixels.

---

## 15. Dependency rationale (what we considered, what we picked)

| Package | Verdict | Reason |
|---------|---------|--------|
| **`react-rnd`** | ✅ Use | 538 k weekly DLs, React 19 ready, 4.2 k stars, zero styled-components dep. Standard primitive. |
| **`zustand`** | ✅ Use | ~1 KB, no provider tree, perfect for WM stack. |
| **`98.css` / `xp.css` / `7.css`** | 📖 Reference | Read for bevel math + scrollbar tricks. Don't depend on. |
| **`daedalOS`** | 📖 Reference | Full browser DE in React — read source for WM patterns. Don't depend on. |
| **`React95`** | ❌ Skip | Built on styled-components which is in maintenance mode (March 2025). Long-lived project shouldn't take that coupling. Also forces Win95 look we want to escape. |
| **`react-kitten`** | ❌ Skip | Pre-1.0 (v0.4.x), single author, young. Borrow ideas, don't depend. |
| **`winbox.js` / `react-winbox`** | ❌ Skip | Overlaps `react-rnd`, less chrome control, no benefit. |
| **`react-mosaic`** | ❌ Skip | Tiling-only, we want overlapping. |
| **`maomaolabs/core`** | ❌ Skip | Too new. Re-evaluate in 2027 if it sticks. |

**Total new deps for afroxOS '97:** `react-rnd`, `zustand`. That's it.

---

## 16. Asset pipeline

**New asset categories** to create under `public/gifs/`:
- `icons/` — hand-drawn 32×32 OS icons (drawer, file, tool icons). Sub-folders: `icons/drawers/`, `icons/tools/`, `icons/rooms/`, `icons/system/`.
- `cursors/` — optional custom CUR/PNG cursors (default arrow, wait, hand)
- `stickers/` — Workbench decoration art (Post-its, tape, signed-by sticker)

**Initial icon sourcing strategy:**
- Existing `gifcities` archive likely has period-correct 32×32 OS icons — try `pnpm assets:grab "32x32 desktop icon" --out icons/system`
- Anything missing, hand-draw at 32×32 in `aseprite` or similar, save as PNG, drop into `public/gifs/icons/{subfolder}/`
- Provenance entry in `public/gifs/asset-manifest.yaml` for any sourced asset (script auto-handles)

**Sound assets** (Phase 3): `public/sounds/` — drawer-open.wav, window-close.wav, error.wav, modem.wav. Source from `archive.org/details/win98samples` (Win98 system sounds are public-archived — but we'll re-sample / pitch-shift them so they're not literal Microsoft sounds). Provenance same as GIFs.

---

## 17. What stays exactly the same

- `app/(rooms)/` — rooms own their world, untouched
- `app/(splash)/` splash gate — wizard chrome unchanged, copy reads `afroxOS '97`
- `app/(rooms)/GlitchTransition.tsx` (InstallShield) — unchanged, copy reads `afroxOS '97 Setup — Installing <SLUG>`
- The manifest + registry pattern for rooms and tools
- All existing room URLs (`/rooms/[slug]`) — direct visits still work
- All existing copy in `HUB_STATE.md` (manifesto, tagline, etc.) — re-threaded into the new shell
- `--win-*` and `--gc-*` tokens — kept for room opt-in
- The asset pipeline (`pnpm assets:grab`, `assets:buttons`)
- Tenet B (Questionnaire Protocol) and Tenet C (Copy Quality)

---

## 18. Open questions / parking lot

- **Workbench parchment tile** — flat ochre, or tiled parchment-noise texture? Decide after Phase 1 is on screen.
- **Dock position** — top-right (NeXT-ish) or bottom-center (macOS-ish)? Suggest top-right because the bottom is already taskbar territory.
- **Sound default state** — on or off? Default off with a 🔊 toggle. Annoying if on by default.
- **Multiple desktops / virtual workspaces?** — Probably not. Adds complexity, not personality. Park unless it earns its keep.
- **A "boot screen" before the splash?** — Tempting (BIOS POST text, then OS boot). Park; the splash already does the entry ritual.
- **MIDI on the splash** — the original plan had a MIDI slot. Keep, but use an afroxOS-original MIDI (commission or compose) rather than X-Files theme. Park until Phase 3.

---

## 19. Cross-references

**Tenet docs:**
- `CLAUDE.md` — project tenets. afroxOS '97 supersedes Tenet A (hub aesthetic) for the `(site)` shell.
- `HUB_STATE.md` — sitemap and copy state. Manifesto/tagline/email stay valid; just re-thread into the new shell.
- `geocity.md` — era research. Still the source for room aesthetic decisions.

**ADRs (`docs/adr/`):**
- `0001-window-primitive-react-rnd.md` — why react-rnd over winbox/kitten/mosaic
- `0002-state-management-zustand.md` — why zustand over Context/Jotai/Redux
- `0003-rooms-as-windowed-apps.md` — the dual-render contract (windowed vs full-screen URL)
- `0004-no-styled-components.md` — why we skip React95 and the styled-components ecosystem

**Code landing zones (Phase 1+):**
- `app/globals.css` — `--ax-*` tokens land here
- `app/(site)/page.tsx` — becomes the Workbench entry
- `lib/wm/` — kernel + public API (see § 9 for layout)
- `components/ax/` — chrome primitives
- `content/apps/{slug}/` — apps (rooms + tools, unified)
