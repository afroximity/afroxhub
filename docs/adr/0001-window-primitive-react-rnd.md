# ADR 0001 — Window primitive: `react-rnd`

Date: 2026-05-10
Status: Accepted
Supersedes: —
Superseded by: —

## Context

afroxOS '97 needs a draggable + resizable window primitive. The kernel will own focus, z-order, minimize/maximize, persistence, lifecycle — but the actual "user grabs the titlebar and drags the window" mechanic is well-trodden ground we should not reimplement.

Candidates surveyed:

| Library | Verdict |
|---------|---------|
| `react-rnd` (bokuweb) | ✅ Selected |
| `winbox.js` + `react-winbox` | Rejected |
| `react-kitten` (rohanrhu) | Rejected |
| `react-mosaic` (nomcopter) | Rejected — tiling only |
| `maomaolabs/core` | Rejected — too new |
| Hand-rolled | Rejected — no upside |

## Decision

Use **`react-rnd`** as the only window-mechanic dependency. The kernel (`lib/wm`) wraps it in `<AxWindow>`; nothing else in the codebase imports `react-rnd` directly.

## Rationale

- **538 k weekly npm downloads, 4.2 k GitHub stars, React 19 ready.** Battle-tested in production.
- **Zero runtime dependencies that conflict with our stack.** No styled-components (see ADR 0004), no opinionated chrome.
- **Combines `react-draggable` + `re-resizable` cleanly.** Single component, single API.
- **No chrome opinions.** It's a positioning + sizing primitive only — we write our own titlebar, controls, bevels. This matches our goal of full visual ownership.
- Author (`bokuweb`) is responsive, semver discipline is good, last release 2025.

## Why not the alternatives

- **`winbox.js`** is excellent but ships its own chrome and theme system. Using it means fighting its CSS or accepting its look — defeats the point of afroxOS being *ours*.
- **`react-kitten`** (v0.4.x) is interesting because it offers higher-level abstractions (workspaces, stage manager). But it's pre-1.0, single-author, and locks us into its WM model. We want to own the WM model.
- **`react-mosaic`** is tiling-only. We want overlapping windows.
- **`maomaolabs/core`** is too new (no production track record). Re-evaluate in 2027.
- **Hand-rolling** the drag/resize math is a 2-week side quest with subtle bugs (touch events, pointer capture, boundary clamping, snap zones). `react-rnd` already solved these.

## Consequences

- The `AxWindow` chrome is fully in our control; the inside-the-window app body is fully in the app's control. The boundary is the titlebar/border that `react-rnd` paints (which we restyle via its `className` and `enableResizing` knobs).
- Bundle cost: ~12 KB gzipped for `react-rnd` + transitive deps. Inside our budget (§ 10.12).
- Migration risk if `react-rnd` is ever abandoned: the public API is small enough that swapping the underlying primitive is a localized refactor inside `<AxWindow>`. The contract in AFROXOS.md § 10 does not leak `react-rnd` types.

## Revisit if

- `react-rnd` is unmaintained for > 12 months and React N+1 ships breaking changes.
- We need true touch-first window manipulation (multi-touch resize, gestures) — `react-rnd` is mouse-first.
- We add tiling/snapping that `react-rnd` doesn't compose well with (e.g. WinKey+arrow snap zones).
