# Phase 10 — Autonomous Deploy & Optimize

## Goal

Every push to `main` triggers a pipeline that:
1. Runs tests and builds
2. Serves the production build locally (`vite preview` on `:4173`)
3. Runs Lighthouse CI against `localhost:4173` (median of 3 runs)
4. If any score is below threshold, applies the static fix playbook, rebuilds, and re-audits
5. Loops up to 3 times
6. Only deploys to production (`vercel deploy --prod`) when all thresholds pass

Local equivalent: `/optimize` skill, or `SKIP_DEPLOY=1 node scripts/deploy-optimize.js`
runs the same audit loop without deploying.

> **Why localhost, not the Vercel preview URL** (changed 2026-06-14): see Key Learnings —
> the preview injects a toolbar/protection script that depresses Performance ~12 pts vs
> production, making it an unreliable, pessimistic gate.

## Thresholds

| Category | Minimum | Notes |
|---|---|---|
| Performance | 95 | Stable on localhost (median of 3 ≈ 99) |
| Accessibility | 100 | |
| Best Practices | 96 | On localhost, `@vercel/analytics` insights script 404s → one `errors-in-console` failure (localhost-only; production = 100) |
| SEO | 90 | Real value now — localhost has no `noindex` header (scores 100). Was disabled (0) only while the gate ran against preview URLs. |

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

1. `lhci collect` runs Lighthouse 3× against `localhost:4173`; scores are graded on the **median** per category
2. Failing audit IDs are extracted (union across runs — anything that fails in any run)
3. `scripts/lighthouse-playbook.js` maps each audit ID to a deterministic file edit
4. If any fix was applied, changes are committed and `npm run build` re-runs
5. The build is re-served and Lighthouse runs again — up to 3 total iterations
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

## Key Learnings (from initial runs + Phase 11 review)

- **Vercel preview URLs are always `noindex`** — Lighthouse SEO will always fail against preview URLs. Never gate production on SEO score from CI.
- **CI performance scores are 5 pts lower** — shared GitHub runners have variable resources. Use 90 as the CI threshold, 95 as the local target.
- **`actions/checkout` and `actions/setup-node` needed v6** — v4 still ran on Node 20 internally. v6 is native Node 24.
- **`package.json` has `"type": "module"`** — all scripts must use ESM `import`, not `require()`.
- **Don't commit when the fix loop fails** — the original Claude-based loop committed empty changes on API errors. Playbook skips commit if nothing changed.
- **`vercel promote` fails with "Deployment belongs to a different team"** — `.vercel/` is gitignored so project.json is absent from CI. Without `VERCEL_ORG_ID`/`VERCEL_PROJECT_ID` env vars, the deploy and promote contexts diverge. Fixed by using `vercel deploy --prod` (no team lookup) and passing both ID vars explicitly.
- **Always pass `VERCEL_ORG_ID` and `VERCEL_PROJECT_ID` as env vars to the deploy step** — the CLI cannot read `.vercel/project.json` in CI since that directory is gitignored.
- **`git add -A` in fix commits will stage `.lighthouseci/` report JSON** — add `.lighthouseci` to `.gitignore` and stage only the specific files playbook edits.
- **Fix commits must `git push origin HEAD`** — CI runners are ephemeral; local-only commits vanish when the job ends. `contents: write` permission grants push access but doesn't auto-push.
- **Don't interpolate secrets into JS template literals for shell commands** — use `'cmd --token "$VAR"'` so the shell expands it safely from `process.env`.
- **Pin global npm installs** — `npm install -g vercel@latest` is a reliability risk. Use `vercel@39` and `@lhci/cli@0.14.0`; remove unused packages (`@anthropic-ai/claude-code` was a leftover).
- **Remove redundant rebuilds** — the fix block called `npm run build` before committing, then the next iteration rebuilt again from the same source. The fix-block build was unnecessary.
- **Cold-start variance can flake the Performance gate** — Lighthouse runs once (`--numberOfRuns=1`) against a freshly-deployed (cold) preview. A cold first hit (slow TTFB + busy main thread) can drop Performance 10–15 pts; the failing sub-audits are typically `first-contentful-paint`, `total-blocking-time`, and `max-potential-fid`. This is usually NOT a real regression. Verify locally with `--numberOfRuns=3` against `localhost:4173` (expect ~99); if local passes, just re-run the workflow (`gh run rerun <id> --failed`). Durable fix if it recurs: collect 3 runs and grade the **median** (the script currently reads a single arbitrary report via `.sort().pop()`, so bumping runs alone won't help) plus a warm-up `curl` before collecting. *(Observed 2026-06-14: Performance 81 in CI, 94–99 locally for a data-only change.)*

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
