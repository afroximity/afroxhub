# ADR 0002 — WM state management: `zustand`

Date: 2026-05-10
Status: Accepted

## Context

The window manager needs to own a non-trivial chunk of state:

- Window record (id → position, size, z, mountState, focused, minimized, maximized, ...)
- Z-counter
- Focused window id
- Singleton key index
- Persist hydration flag
- Event subscribers

Many components read this state at different granularities:
- `<AxTaskbar>` needs the list of all open windows (title + minimized + focused)
- `<AxWindow>` (each one) needs *its own* state
- `<AxStartMenu>` reads almost nothing
- `useAxWindow()` reads one window's slice

Re-render storms are easy to introduce here. We need scoped subscriptions.

## Decision

Use **`zustand`** as the kernel store. Subscriptions go through a `useWMSelector` hook (thin wrapper over `zustand`'s selector API) so every component re-renders only when its selected slice changes.

## Rationale

- **~1 KB gzipped.** Negligible.
- **No provider tree.** The store is a singleton accessed via hook + imperative `getState()`/`setState()` — perfect for both React components and the imperative `wm.open()` API.
- **Per-component subscription via selectors.** Moving window A doesn't re-render window B's body.
- **Same author as Jotai (Daishi Kato).** Mature, well-supported.
- **First-party persist middleware.** Hydration-safe, serializable check, version migration. Drops in for our session-restore requirement (§ 10.8).
- **First-party devtools middleware.** Action log + state snapshots in Redux DevTools.

## Why not the alternatives

- **React Context.** Triggers full re-render of all consumers on any state change. Catastrophic for a window list with N items where each window's drag fires updates at 60Hz. We'd end up writing our own selector layer on top of context — i.e., reinventing zustand.
- **Jotai.** Atomic model is elegant but the WM state is genuinely a graph (focus, z, singletons reference each other). Centralized store fits better. Same author so we can switch later if needed; the public API in § 10 doesn't expose either.
- **Redux Toolkit.** Heavier (~10 KB), more boilerplate, async middleware overkill for our needs.
- **Valtio.** Proxy-based mutability is ergonomic but harder to reason about under React 19 strict mode + concurrent rendering.
- **`useReducer` + Context.** See "React Context" above. Same problem.

## Consequences

- The store is the **only** place WM state lives. No duplication into refs, no `useState` shadows.
- Imperative API (`wm.open()`) and reactive API (`useAxWindow()`) read from the same store. Consistency by construction.
- DevTools middleware is dev-only (stripped via `process.env.NODE_ENV !== 'production'`).
- Persist middleware writes are debounced (200ms) — protects against drag-spam writes.

## Revisit if

- We add multi-window collaboration (multiple browser tabs sharing WM state). Then we'd need a sync layer (e.g. `zustand` + `BroadcastChannel`) — but the store choice itself still works.
- React ships a built-in primitive that subsumes selector-based stores (e.g. Signals proposal). Re-evaluate.
