# ADR 0004 — No styled-components, no React95

Date: 2026-05-10
Status: Accepted

## Context

A natural first instinct for a Win9x-flavored UI in React is to reach for **React95** — the most popular Windows 95 component library. It has the bevels, the buttons, the dialogs, and a community.

It also has a hard dependency on **styled-components**.

In March 2025, the styled-components maintainers announced the library is in **maintenance mode**. New features are not coming. Bug fixes ship for critical compatibility issues only. The ecosystem has begun migrating to alternatives (vanilla-extract, panda-css, plain CSS modules, Tailwind).

afroxOS '97 is intended as a multi-year, evolving project. Adopting a styling layer that is in maintenance mode at project inception is a known liability.

## Decision

**Do not depend on `styled-components`. Do not depend on `React95`.** Author all chrome with plain CSS in `app/globals.css` (CSS variables + utility classes) and component-level CSS modules where component-scoped styles are needed.

## Rationale

- **styled-components in maintenance** = no React 19+ improvements, no concurrent-features tuning, growing risk of subtle bugs as React evolves.
- **React95 forces a specific Win95 visual** — but afroxOS '97 is *deliberately not* Win95. We want our own palette (ochre + sage, not Microsoft grey + teal), our own titlebars (sage gradient, not navy), our own typography. We'd be overriding React95 more than using it.
- **CSS variables + utility classes already power the existing hub** (`--win-*`, `--gc-*`, `.win-window`, `.win-button`, etc.). Extending the same pattern to `--ax-*` and `.ax-window` is consistent and zero-runtime-cost.
- **No CSS-in-JS runtime cost.** Important for an OS-shell app where every window mounts a chrome subtree.
- **Server-rendering and hydration are simpler** without a runtime style injector.

## What we use instead

- **Plain CSS in `app/globals.css`** for tokens (`--ax-*`) and utility classes (`.ax-window`, `.ax-titlebar`, `.ax-button`, etc.).
- **Tailwind v4** (already in the project) for ad-hoc layout utilities inside app/component files.
- **CSS modules** (`Component.module.css`) for component-private styles when they're too specific for a utility class.
- No CSS-in-JS library. No styled-components, no emotion, no stitches.

## Consequences

- Manual class composition in TSX (no template literal sugar). We trade ergonomics for stability — acceptable.
- We re-author the chrome math (bevels, titlebar gradients, button states) instead of importing it. We have references (`98.css`, `xp.css`, current `--win-*` tokens) to crib from.
- Our component primitives (`<AxWindow>`, `<AxButton>`, etc.) are thin wrappers around semantic HTML + utility classes. Easy to read, easy to fork.
- We can revisit a CSS-in-JS choice later (e.g. vanilla-extract) without breaking the public component API — styles are an internal concern.

## Why not the alternatives

- **`React95`** — see context. Hard styled-components dep + forces Win95 look = double-no.
- **`98.css` / `xp.css` (Jordan Scales)** — wonderful reference, pure CSS, but they re-skin semantic HTML globally. We want component primitives, not a global stylesheet, so we *steal patterns* from these without taking them as deps.
- **Adopting styled-components anyway** with the assumption "maintenance mode is fine, the API is stable" — it might be fine for 12 months. It is not fine for a multi-year project. We're paying down a known debt at zero hour.
- **vanilla-extract / panda-css** — both excellent, but introducing a CSS-in-JS layer for a project that already uses Tailwind + CSS variables successfully is gratuitous complexity. Revisit only if we hit a real ergonomics wall.

## Revisit if

- styled-components exits maintenance mode and ships a credible v7 with React 19+ optimizations (unlikely, but possible if the fork ecosystem reconsolidates).
- We onboard contributors who strongly prefer CSS-in-JS and the manual-class-composition friction becomes a productivity tax we can measure.
- A future need (e.g. theming N user-selectable skins at runtime) exceeds what CSS variables can express ergonomically.
