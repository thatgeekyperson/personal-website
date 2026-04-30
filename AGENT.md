# Website Builder

We want to build a website but want to do it in a step by step way. Documenting the whole process such that it is easier for me and the agent to follow through the step.
The webiste will create a landing page for me and will have a navigation for any projects, links to github and linkedin. 

We first want to make a guide to install required dependencies react and such to start building. Document the steps in the README.md.
We always want to create plan files in the main folder of the project under plans/*.md path.

Constraints:
- After any code change, always run `npm run build` before running or testing the preview server (`npm run preview`) — it serves `dist/` and does not reflect changes automatically. The dev server (`npm run dev`) does not require a rebuild.
- All documents to be up-to-dat after each iteration.
- No execution until we finalize on the plan, and docs are updated. We update the docs again at the end, with any decisions we took which digressed from the earlier though process.
- Always run `npm test` before any `git commit` — all tests must pass before committing.
- Run a code review agent before pushing to GitHub — do not skip even for small changes.
- After any personal content change, grep for `yourusername` across the codebase and confirm zero results before committing.
- Lighthouse audits must be run against `http://localhost:4173` (production preview) — never against a Vercel preview URL, which requires auth and produces invalid results.
- We do spin up code review agent to verify all the changes.
- We create/update tests and/or a testing plan for any changes.
- We aways refer to the documentation of the library version in use and refer to best practices in stackoverflow or medium articles.
- If there are any commands user needs to run, do display the command in a single line and make it easily copiable.
- After every few prompts, suggest how we can make the process better.

## Autonomous Deploy Pipeline (Phase 10)

Every push to `main` triggers `.github/workflows/deploy-optimize.yml` which:
1. Deploys a Vercel preview via `scripts/deploy-optimize.js`
2. Runs Lighthouse CI against the preview (using `VERCEL_AUTOMATION_BYPASS_SECRET` header to bypass auth)
3. If any score < threshold, invokes `claude --print` with failing audits to fix code, commits, and retries (max 3 iterations)
4. Promotes to production only when all four thresholds pass

**Thresholds:** Performance ≥ 95 · Accessibility ≥ 100 · Best Practices ≥ 100 · SEO ≥ 90

**Required GitHub Secrets** (Settings → Secrets and variables → Actions):
- `ANTHROPIC_API_KEY` — from console.anthropic.com
- `VERCEL_TOKEN` — from vercel.com/account/tokens
- `VERCEL_ORG_ID` — from `.vercel/project.json` after running `vercel link`
- `VERCEL_PROJECT_ID` — same file
- `VERCEL_AUTOMATION_BYPASS_SECRET` — Vercel dashboard → Project → Settings → Deployment Protection

**Local equivalent:** use the `/optimize` skill.

**When extending the pipeline:**
- Edit thresholds in `scripts/deploy-optimize.js` (THRESHOLDS constant) and `.lighthouserc.json`
- The Claude fix prompt is in `scripts/deploy-optimize.js` → `claudeFix()` — update it if new fix patterns emerge
- Do NOT run Lighthouse against Vercel preview URLs without the bypass header — scores will be invalid

## Analytics

`@vercel/analytics/react` is installed. The `<Analytics />` component is mounted in `src/App.tsx`. View traffic at vercel.com → project → Analytics tab.