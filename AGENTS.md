# Repository Guidelines

## Project Structure & Module Organization
- `app/` houses the Next.js App Router entry points, layouts, routes, and API handlers.
- `content/` stores tool and room content bundles (each in its own folder with `index.ts` and optional `Tool.tsx`/`Room.tsx`).
- `lib/` contains server-side helpers (loading manifests, storage adapters, utilities).
- `types/` defines shared TypeScript types.
- `public/` holds static assets served by Next.js.

## Build, Test, and Development Commands
- `npm run dev`: start the local dev server at `http://localhost:3000`.
- `npm run build`: create a production build.
- `npm run start`: run the production server (after `build`).
- `npm run lint`: run ESLint (Next.js core-web-vitals + TypeScript rules).

## Coding Style & Naming Conventions
- TypeScript + React (App Router) with ES modules.
- Use 2-space indentation and double quotes, matching existing files (see `lib/`).
- Folder naming: kebab-case under `content/tools/` and `content/rooms/` (e.g., `water-tracker`).
- Components in content folders use `Tool.tsx` or `Room.tsx` naming.

## Testing Guidelines
- No automated test framework is configured yet.
- If you add tests later, keep them colocated with features or under a `tests/` directory and document the command in this file.

## Room Experience Guidelines
- Rooms may use entirely distinct aesthetics (colors, typography, layout) and should not inherit the shared site header.
- Each room must include its own “back to hub” affordance that links to `/rooms` (style can vary per room).
- Keep room-specific styling inside the room component and avoid global changes unless the effect is shared.

## Commit & Pull Request Guidelines
- No commit convention is established (current history is a single bootstrap commit).
- Use concise, imperative commit messages (e.g., "Add autophagy tracker content").
- PRs should include: a short summary, validation steps (commands run), and screenshots for UI changes.

## Configuration & Data Notes
- Content discovery relies on folder structure and manifest files; keep `index.ts` exports correct.
- Storage utilities live in `lib/storage/`; prefer existing adapters over new ad-hoc storage.
