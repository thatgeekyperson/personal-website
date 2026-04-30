# Phase 9 — Production Build & Vercel Deployment

## Goal

`npm run build` produces a clean `dist/` output. The site is live on Vercel. The live URL is in README.md.

## `vercel.json`

Required for SPA routing — without this, any direct URL other than `/` returns a 404 from Vercel's CDN:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

## `.gitignore` Verification

Vite creates `.gitignore` automatically. Verify these entries are present:

```
node_modules/
dist/
dist-ssr/
*.local
.env*
```

## Pre-Deploy Checklist

- [x] `npm run build` exits 0 with no TypeScript errors
- [x] `npm test` exits 0 with all tests passing (20/20)
- [x] All external links open in new tab
- [x] Replace placeholder `yourusername` in `src/constants/social.ts` with real values
- [x] Replace placeholder projects in `src/data/projects.ts` with real projects

## Build Commands

Production build:

```
npm run build
```

Preview the production build locally:

```
npm run preview
```

## Git Setup (user runs)

Initialize repository and first commit:

```
git init && git add . && git commit -m "feat: initial personal website"
```

## GitHub Repository (user runs, requires `gh auth login` first)

```
gh repo create personal-website --public --source=. --remote=origin --push
```

## Vercel Deploy

**Option A — Vercel CLI:**

Install CLI (one-time):

```
npm install -g vercel
```

Deploy:

```
vercel --prod
```

**Option B — Vercel Dashboard (recommended for first deploy):**

1. Go to vercel.com → New Project
2. Import the GitHub repository
3. Vercel auto-detects Vite: build command = `npm run build`, output directory = `dist`
4. Click Deploy

Future pushes to `main` trigger automatic re-deploys.

## Deployment (Actual — 2026-04-30)

- GitHub repo created via `gh repo create personal-website --public --source=. --remote=origin --push`
- Deployed via Vercel dashboard (Option B) — zero config, Vite auto-detected
- **Live URL:** https://personal-website-4sq3ryba4-manankh-5932s-projects.vercel.app
- Future pushes to `main` trigger automatic re-deploys

## Post-Deploy

- [x] README.md updated with live URL
- [ ] Run Lighthouse audit:

```
npx lighthouse https://your-site.vercel.app --view
```

Target scores: Performance > 90, Accessibility > 90, Best Practices > 90, SEO > 90.

## Why Vercel over Alternatives

| Option | SPA Routing | Setup |
|---|---|---|
| Vercel | Automatic via `vercel.json` | Zero-config Vite detection |
| Netlify | Requires `public/_redirects` | Similar zero-config |
| GitHub Pages | Requires HashRouter or custom `404.html` hack | More friction |

Vercel is the best fit for this project.
