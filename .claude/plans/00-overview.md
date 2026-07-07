# Phase 0 — Overview & Tech Stack

## Goal

Document all architecture decisions before any code is written. This file is the top-level reference; each subsequent phase has its own plan document.

## Tech Stack

| Concern | Choice | Reason |
|---|---|---|
| Build tool | Vite 8 + SWC plugin | CRA is deprecated; Vite ESM-native dev server is near-instant; production build uses Rollup (rolldown in v8) |
| Language | TypeScript | Catches bugs at author time; industry standard for production React |
| Styling | Tailwind CSS v4 | Single Vite plugin, zero config file, auto-purged production CSS |
| Routing | React Router v7 | Modern `createBrowserRouter` API; future-proof data pattern |
| Icons | lucide-react | Tree-shakeable, TypeScript-native, no runtime dependency on icon font |
| Testing | Vitest + @testing-library/react | Vite-native; Jest-API-compatible; no duplicate build config |
| Deployment | Vercel | Zero-config Vite detection; built-in SPA routing support; free tier |

## Design Direction

- **Style:** Minimal & Clean — white/light background, generous whitespace, single accent color (blue-600 / `#2563eb`)
- **Font:** Inter (Google Fonts)
- **Page structure:** Single-page with scroll anchors (`#hero`, `#about`, `#projects`) — no sub-routes in v1

## Constraints (from AGENT.md)

1. All documents updated after each iteration
2. No code execution until plan finalized and docs updated
3. Code review agent verifies every phase
4. Tests and/or testing plan required for all changes
5. Commands are single-line and copy-pasteable
6. Refer to official library docs and best practices

## Phase Order

0. Documentation & README (this phase)
1. Project scaffolding
2. Tailwind CSS v4 setup
3. Routing setup
4. Hero + About sections
5. Projects section
6. Navigation bar
7. Social links + Footer
8. Testing
9. Production build + Vercel deployment
10. Autonomous deploy pipeline (GitHub Actions → Vercel preview → Lighthouse CI → prod)
11. Code review + pipeline hardening (security, pinning, gitignore, commit push)
