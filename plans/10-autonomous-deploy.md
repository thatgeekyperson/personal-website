# Phase 10 — Autonomous Deploy & Optimize

## Goal

Every push to `main` triggers a pipeline that:
1. Runs tests and builds
2. Deploys to a Vercel preview
3. Runs Lighthouse CI against the preview (with auth bypass)
4. If any score is below threshold, spawns Claude Code to diagnose and fix, commits, and re-deploys
5. Loops up to 3 times
6. Only promotes to production when all four scores pass

Local equivalent: `/optimize` slash command runs the same loop against `localhost:4173`.

## Thresholds

| Category | Minimum |
|---|---|
| Performance | 95 |
| Accessibility | 100 |
| Best Practices | 100 |
| SEO | 90 |

## Files Added

| File | Purpose |
|---|---|
| `.github/workflows/deploy-optimize.yml` | CI/CD pipeline definition |
| `scripts/deploy-optimize.js` | Orchestration: deploy → Lighthouse → Claude fix loop |
| `.lighthouserc.json` | Lighthouse CI threshold assertions |
| `.claude/skills/optimize/SKILL.md` | Local `/optimize` slash command |

## GitHub Secrets Required

Add at: github.com → repo → Settings → Secrets and variables → Actions

| Secret | How to get it |
|---|---|
| `ANTHROPIC_API_KEY` | console.anthropic.com → API Keys |
| `VERCEL_TOKEN` | vercel.com/account/tokens → Create Token |
| `VERCEL_ORG_ID` | Run `vercel link` locally → read `.vercel/project.json` |
| `VERCEL_PROJECT_ID` | Same `.vercel/project.json` |
| `VERCEL_AUTOMATION_BYPASS_SECRET` | Vercel dashboard → Project → Settings → Deployment Protection → Automation Bypass |

## Vercel Deployment Protection Bypass

Vercel preview URLs require authentication by default, which blocks Lighthouse in CI.

**Fix:** Vercel dashboard → Project → Settings → Deployment Protection → enable "Protection Bypass for Automation" → copy the generated secret into the `VERCEL_AUTOMATION_BYPASS_SECRET` GitHub secret.

## How the Claude Fix Loop Works

1. `lhci collect` runs Lighthouse against the preview URL (with `x-vercel-protection-bypass` header)
2. Results are parsed from `.lighthouseci/` JSON report
3. If thresholds not met, failing category scores + top 15 failing audits are passed to `claude --print`
4. Claude edits files in the checked-out repo, then runs `npm test` and `npm run build`
5. Changes are committed and a new preview is deployed
6. Lighthouse runs again — up to 3 total iterations
7. If still failing after 3 iterations, the workflow exits non-zero (production deploy blocked)

## Local Usage

In Claude Code, type:
```
/optimize
```

The skill runs `npx lighthouse` against `localhost:4173` and iterates up to 3 times.

## Key Constraints (for future agents)

- Always run Lighthouse against `localhost:4173`, never against Vercel preview URLs (auth wall = invalid scores)
- The bypass secret is for CI Lighthouse only — local Lighthouse needs no bypass
- Claude's fixes must not change visual design or text content
- All 20 tests must pass after any Claude fix before committing
- Never promote to production if any Lighthouse threshold is not met
