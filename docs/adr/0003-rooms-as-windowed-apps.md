# ADR 0003 — Rooms render in two modes: windowed (Workbench) and full-screen (URL)

Date: 2026-05-10
Status: Accepted

## Context

Afroximity has two existing primitives for "places":

- **Rooms** (`app/(rooms)/rooms/[slug]/`) — full-bleed isolated experiences. Each room owns 100% of its visual world. Direct URLs (`/rooms/japan2026`) are shareable and central to the project's identity.
- **Tools** (`app/(site)/tools/`) — utility components.

afroxOS '97 reframes both as **apps** that run in windows on the Workbench. But we cannot break direct-URL room visits — the `/rooms/japan2026` URL is shared in chat, bookmarked, and linked from external sites. The room-owns-its-world tenet (CLAUDE.md) must also survive: hub chrome cannot leak into a room.

Tension:
- Workbench experience wants windowed apps (multiple open at once, draggable, minimizable).
- URL experience wants full-bleed sovereignty (no chrome, no Workbench peeking through).

## Decision

**Apps render in one of two modes, decided by the entry point. Apps must be authored to be mode-agnostic.**

| Entry point | Mode | Container |
|-------------|------|-----------|
| Direct URL `/rooms/[slug]` | Full-screen | `app/(rooms)/rooms/[slug]/RoomRenderer.tsx` (existing) — no Workbench, no chrome, InstallShield wizard transition still plays. |
| Workbench drawer / Start menu / Dock click | Windowed | `<AxWindow>` via `wm.open()`. Workbench visible behind. Multiple instances allowed (subject to `singleton` flag). |

## Authoring rules for apps

To support both modes cleanly:

1. **No `position: fixed` against the viewport.** Use the parent container as the positioning context. (Inside an `<AxWindow>`, the window body *is* the container.)
2. **No `100vh` / `100vw` for layout.** Use `100%` of the parent. The window decides how big the parent is.
3. **Container queries over media queries** for any responsive behavior. The window can be 320px wide on a 1920px screen.
4. **No `document.body` mutations.** No setting body class, no document-level event listeners that assume singleton-app semantics.
5. **App reads its window via `useAxWindow()`.** It is null when running full-screen — apps gracefully degrade (no titlebar tricks like `setTitle` if running standalone).

The `useAxWindow` hook returns `null` (or throws, TBD during Phase 2 review) when called outside a WM-managed render. The full-screen route renders the app directly — no WM context — so `useAxWindow` returning `null` is the signal to skip windowed-only behavior.

## Rationale

- **Sharing URLs is non-negotiable** — they're the primary growth vector for an indie personal site.
- **Windowed mode is the OS metaphor's payoff** — without it, afroxOS '97 is just a skin.
- **Authoring rules are cheap** — they're already implicit in the existing room sovereignty tenet (rooms can't assume hub chrome). Making them explicit lets us safely embed.

## Why not the alternatives

- **Always windowed (no full-screen URL).** Breaks share-the-URL and direct-link UX. Rejected.
- **Always full-screen (no windowed mode).** Defeats the OS metaphor. Rejected.
- **Iframe the room when windowed.** Heavy, double-loads the bundle, breaks shared state, kills SSR/SEO. Rejected.
- **Two separate codebases for room-vs-windowed.** Unmaintainable. Rejected.
- **A "preview mode" prop** that the app branches on. Worse than container-query authoring rules — explodes app complexity. Rejected.

## Consequences

- Existing rooms get audited against the authoring rules during Phase 2 migration. Each room's PR has a checklist.
- The `japan2026` room currently uses `100vh` in a few spots — flagged for the migration.
- Tools are easier (already small, parent-relative).
- The InstallShield wizard transition only fires on direct URL visits — not on `wm.open()` (windowed launches use a quick fade-in instead).

## Revisit if

- We discover a class of room that genuinely cannot work windowed (e.g. needs > 1024px to be readable, hardware sensors, etc.). Such a room can opt out via `windowDefaults.maximizable: 'force'` (Phase 3+).
