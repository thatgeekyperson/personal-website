# Personal Website

A minimal, production-ready personal website built with React, Vite, TypeScript, and Tailwind CSS v4. Features a hero section, about section, projects showcase, and navigation with GitHub/LinkedIn links.

**Live site:** Custom domain configured in Vercel dashboard. CI/CD pipeline deploys automatically on every push to `main`.

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

Every push to `main` triggers an automated pipeline (`.github/workflows/deploy-optimize.yml`) that:

1. Runs tests and builds
2. Deploys a Vercel preview
3. Runs Lighthouse CI against the preview
4. Deploys to production only if all Lighthouse thresholds pass

**Lighthouse thresholds (CI):** Performance ≥ 90 · Accessibility = 100 · Best Practices ≥ 96 · SEO skipped (Vercel adds `noindex` to preview URLs)

**Required GitHub secrets** (Settings → Secrets and variables → Actions):

| Secret | Source |
|---|---|
| `VERCEL_TOKEN` | vercel.com/account/tokens |
| `VERCEL_ORG_ID` | `.vercel/project.json` → `orgId` (run `vercel link` locally) |
| `VERCEL_PROJECT_ID` | `.vercel/project.json` → `projectId` |
| `VERCEL_AUTOMATION_BYPASS_SECRET` | Vercel dashboard → Project → Settings → Deployment Protection |

To deploy manually:

```
vercel --prod
```

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
scripts/
  deploy-optimize.js      # Autonomous deploy + Lighthouse loop
  lighthouse-playbook.js  # Static fix map (audit ID → file edit)
.github/workflows/
  deploy-optimize.yml     # CI/CD pipeline
plans/              # Architecture decision records (one per phase)
vercel.json         # SPA routing config for Vercel
.lighthouserc.json  # Lighthouse CI thresholds (local reference)
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
| Autonomous Deploy Pipeline | [plans/10-autonomous-deploy.md](plans/10-autonomous-deploy.md) |

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
| Icons | lucide-react (+ inline SVGs for GitHub/LinkedIn) |
| Testing | Vitest 4 + @testing-library/react 16 |
| Analytics | @vercel/analytics/react |
| Deployment | Vercel (custom domain) |
| CI/CD | GitHub Actions + Lighthouse CI |
