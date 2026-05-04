# Phase 10 — Autonomous Deploy & Optimize

## Goal

Every push to `main` triggers a pipeline that:
1. Runs tests and builds
2. Deploys to a Vercel preview
3. Runs Lighthouse CI against the preview (with auth bypass)
4. If any score is below threshold, applies the static fix playbook and re-deploys
5. Loops up to 3 times
6. Only promotes to production when all thresholds pass

Local equivalent: `/optimize` skill runs the same loop against `localhost:4173`.

## Thresholds

| Category | CI Minimum | Notes |
|---|---|---|
| Performance | 90 | CI runners score ~5 pts lower than local due to shared resources |
| Accessibility | 100 | |
| Best Practices | 96 | Vercel analytics script accounts for the 4-pt gap vs local |
| SEO | 0 (skipped) | Vercel adds `X-Robots-Tag: noindex` to all previews — SEO checked locally only |

## Files

| File | Purpose |
|---|---|
| `.github/workflows/deploy-optimize.yml` | CI/CD pipeline |
| `scripts/deploy-optimize.js` | Orchestration: deploy → Lighthouse → playbook fix loop |
| `scripts/lighthouse-playbook.js` | Static fix map: audit ID → deterministic file edit |
| `.lighthouserc.json` | Lighthouse CI threshold assertions |
| `.claude/skills/optimize/SKILL.md` | Local `/optimize` slash command |
| `.claude/skills/ship/SKILL.md` | Full ship checklist skill |

## GitHub Secrets Required

Add at: github.com → repo → Settings → Secrets and variables → Actions

| Secret | How to get it |
|---|---|
| `VERCEL_TOKEN` | vercel.com/account/tokens → Create Token |
| `VERCEL_ORG_ID` | Run `vercel link` locally → read `.vercel/project.json` |
| `VERCEL_PROJECT_ID` | Same `.vercel/project.json` |
| `VERCEL_AUTOMATION_BYPASS_SECRET` | Vercel dashboard → Project → Settings → Deployment Protection → Automation Bypass |

Note: `ANTHROPIC_API_KEY` is no longer required — the fix loop uses a static playbook.

## Vercel Deployment Protection Bypass

Vercel preview URLs require authentication by default, blocking Lighthouse in CI.

**Fix:** Vercel dashboard → Project → Settings → Deployment Protection → enable "Protection Bypass for Automation" → copy the secret into `VERCEL_AUTOMATION_BYPASS_SECRET`.

## How the Static Fix Playbook Works

1. `lhci collect` runs Lighthouse against the preview URL (with `x-vercel-protection-bypass` header)
2. Failing audit IDs are extracted from the JSON report
3. `scripts/lighthouse-playbook.js` maps each audit ID to a deterministic file edit
4. If any fix was applied, `npm run build` runs and changes are committed
5. A new preview is deployed and Lighthouse runs again — up to 3 total iterations
6. If no playbook fix exists for the remaining audit, the loop stops early with a clear message

## Playbook Coverage

| Audit ID | Fix Applied |
|---|---|
| `meta-description` | Injects `<meta name="description">` into `index.html` |
| `document-title` | Patches empty `<title>` in `index.html` |
| `html-has-lang` | Adds `lang="en"` to `<html>` tag |
| `is-crawlable` / `robots-txt` | Creates `public/robots.txt` |
| `font-display` | Appends `&display=swap` to Google Fonts URL |
| `uses-rel-preconnect` | Adds `fonts.gstatic.com` preconnect link |
| `scroll-padding` | Adds `scroll-padding-top: 64px` to `html {}` in CSS |
| `viewport` | Adds viewport meta tag |

Audits not in the playbook (e.g. `color-contrast`, `tap-targets`) require manual fixes.

## Key Learnings (from initial runs)

- **Vercel preview URLs are always `noindex`** — Lighthouse SEO will always fail against preview URLs. Never gate production on SEO score from CI.
- **CI performance scores are 5 pts lower** — shared GitHub runners have variable resources. Use 90 as the CI threshold, 95 as the local target.
- **`actions/checkout` and `actions/setup-node` needed v6** — v4 still ran on Node 20 internally. v6 is native Node 24.
- **`package.json` has `"type": "module"`** — all scripts must use ESM `import`, not `require()`.
- **Don't commit when the fix loop fails** — the original Claude-based loop committed empty changes on API errors. Playbook skips commit if nothing changed.

## Local Usage

```
/optimize
```

The skill builds → runs Lighthouse → applies playbook fixes → iterates up to 3 times.

## Extending the Playbook

To add a new fix, edit `scripts/lighthouse-playbook.js`:
1. Write a fix function that edits a file and returns `true` if a change was made
2. Add it to the `PLAYBOOK` registry keyed by the Lighthouse audit ID
3. The audit ID appears in the CI logs as `[score] audit-id: title`
