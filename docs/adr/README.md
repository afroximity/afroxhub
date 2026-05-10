# Architecture Decision Records

Short, dated, immutable records of decisions that shape the project's architecture.

## Convention

- One file per decision, named `NNNN-kebab-case-title.md`.
- Front matter:
  - **Date** — when the decision was made
  - **Status** — `Proposed` | `Accepted` | `Superseded by NNNN`
  - **Supersedes** / **Superseded by** — links to related ADRs
- Sections: **Context**, **Decision**, **Rationale**, **Why not the alternatives**, **Consequences**, **Revisit if**.
- Length target: 200–500 words. Re-readable in one sitting.
- Once accepted, an ADR is **immutable**. New decisions get new ADRs that supersede old ones.

## Index

| # | Title | Status |
|---|-------|--------|
| [0001](0001-window-primitive-react-rnd.md) | Window primitive: `react-rnd` | Accepted |
| [0002](0002-state-management-zustand.md) | WM state management: `zustand` | Accepted |
| [0003](0003-rooms-as-windowed-apps.md) | Rooms render in two modes (windowed + URL full-screen) | Accepted |
| [0004](0004-no-styled-components.md) | No styled-components, no React95 | Accepted |

## When to write a new ADR

- Picking a foundational dependency (state mgmt, routing, styling, build tooling)
- Defining a contract that other code will depend on
- Reversing or significantly changing a prior decision
- Choosing between two reasonable approaches and the choice is non-obvious

## When NOT to write an ADR

- Implementation details inside a module
- Style preferences (use a linter)
- Anything captured well by a code comment + types
