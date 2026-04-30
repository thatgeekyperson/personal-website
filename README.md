# Personal Website

A minimal, production-ready personal website built with React, Vite, TypeScript, and Tailwind CSS v4. Features a hero section, about section, projects showcase, and navigation with GitHub/LinkedIn links.

**Live site:** _(to be updated after deploy)_

---

## Prerequisites

- Node.js >= 20.19.0 (LTS)
- npm >= 9

> Note: `create-vite@9` requires Node >= 20.19.0. The project was scaffolded manually to avoid this constraint — all source files are already in the repository. A fresh clone only needs `npm install`.

Verify your version:

```
node --version
```

If you are on Node 18, install Node 20 via Homebrew:

```
brew install node@20 && echo 'export PATH="/opt/homebrew/opt/node@20/bin:$PATH"' >> ~/.zshrc && source ~/.zshrc
```

---

## Local Development Setup

**Install dependencies:**

```
npm install
```

**Start the dev server:**

```
npm run dev
```

The site is available at `http://localhost:5173`.

---

## Running Tests

```
npm test
```

Run with coverage:

```
npm run test:coverage
```

---

## Production Build

Build:

```
npm run build
```

Preview the production build locally:

```
npm run preview
```

Preview runs at `http://localhost:4173`.

---

## Deployment

This site deploys to [Vercel](https://vercel.com). Vercel auto-detects Vite — no additional configuration is needed beyond `vercel.json` (already committed).

**Deploy via Vercel CLI:**

```
vercel --prod
```

**Or connect via Vercel dashboard:** import the GitHub repository and Vercel will configure everything automatically.

---

## Project Structure

```
src/
  components/       # UI components (Hero, Navbar, Footer, etc.)
  data/             # Static data (projects list)
  constants/        # App-wide constants (social links)
  pages/            # Route-level pages (NotFound)
  test/             # Test setup files
  router.tsx        # Route definitions
  main.tsx          # App entry point
  index.css         # Tailwind v4 entry + design tokens
plans/              # Architecture decision records (one per phase)
vercel.json         # SPA routing config for Vercel
```

---

## Architecture Decisions

| Phase | Plan Document |
|---|---|
| Overview | [plans/00-overview.md](plans/00-overview.md) |
| Scaffolding | [plans/01-scaffolding.md](plans/01-scaffolding.md) |
| Styling | [plans/02-styling.md](plans/02-styling.md) |
| Routing | [plans/03-routing.md](plans/03-routing.md) |
| Hero & About | [plans/04-hero-about.md](plans/04-hero-about.md) |
| Projects | [plans/05-projects.md](plans/05-projects.md) |
| Navigation | [plans/06-navbar.md](plans/06-navbar.md) |
| Social Links | [plans/07-social-links.md](plans/07-social-links.md) |
| Testing | [plans/08-testing.md](plans/08-testing.md) |
| Deployment | [plans/09-deployment.md](plans/09-deployment.md) |

---

## Code Review

Each phase is implemented on a feature branch and reviewed before merging to `main`. A code review agent validates all changes against the plan and coding standards before approval.

---

## Tech Stack

| Concern | Choice |
|---|---|
| Build tool | Vite 8 + @vitejs/plugin-react-swc |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Routing | React Router v7 |
| Icons | lucide-react |
| Testing | Vitest + @testing-library/react |
| Deployment | Vercel |
