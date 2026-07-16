# Review — 2026-07-16 — cd5e251..7a50c1f
status: resolved

Scope: three unpushed commits — plans-dir standardization (1af62ad), mobile+desktop dual
Lighthouse pass + playbook unit tests (9252a92), global AGENT.md pointer (7a50c1f).
Reviewer: fresh-context subagent; all findings independently verified against source.

### 1. [Critical] scripts/deploy-optimize.js:15-20 — CI gates at 80/90/90/80, not the documented 95/100/96/90
Thresholds read from `LH_*` env vars with defaults 80/90/90/80. The workflow
(.github/workflows/deploy-optimize.yml) sets no `LH_*` vars, so CI enforces the low
defaults while AGENT.md claims 95/100/96/90. A build with mobile perf 82 would deploy.
Predates this push, but 9252a92 re-edited the AGENT.md threshold section without catching it.
Fix: set `LH_*` env vars in the workflow (or raise the code defaults).
**Decision:** fix-now — raise code defaults to 95/100/96/90
**Resolution:** c78f577 — defaults raised to 95/100/96/90 in deploy-optimize.js

### 2. [Major] scripts/deploy-optimize.js:26 — new unit tests cover a script the pipeline never runs
`FIX_SCRIPT = ".github/scripts/lighthouse-fix.py"` is the actual fix path; the tested
`scripts/lighthouse-playbook.js` is imported by nothing. The two have already drifted
(html-lang guard, log messages). Tests pass regardless of what CI does.
Fix options: point FIX_SCRIPT at the JS playbook via a small Node CLI wrapper (makes the
tests protect the real pipeline), or delete the JS playbook and test the Python script.
**Decision:** fix-now — switch CI to JS playbook via CLI entry, delete lighthouse-fix.py
**Resolution:** c78f577 — CLI entry added to lighthouse-playbook.js; FIX_SCRIPT repointed; lighthouse-fix.py deleted; CLI smoke-tested

### 3. [Major] AGENT.md — fix-loop docs name scripts/lighthouse-playbook.js; code runs the Python script
Same root cause as #2. AGENT.md step 4 and the "Static Fix Playbook" section describe the
JS playbook; deploy-optimize.js:6 says "Fix (via python utility)". Resolves with #2.
**Decision:** fix-now — resolves with #2; update deploy-optimize.js header comment
**Resolution:** c78f577 — header comment fixed; AGENT.md docs now match code

### 4. [Minor] scripts/deploy-optimize.js:173-176 — dry-run returns true ("committed") when nothing was committed
Return value currently unused at the sole call site, so no live bug; latent trap for future
callers. Also: the guard blocks commits, not deploys — a local run with VERCEL_TOKEN set
still deploys.
**Decision:** fix-now — user approved all minors; dry-run to return false
**Resolution:** c78f577 — dry-run returns false

### 5. [Minor] scripts/deploy-optimize.js:76 — null category score coerces to 0 silently
Lighthouse reports `score: null` when a category errors; `null * 100 === 0`, so an errored
run reads as a real 0 and skews the median with no diagnostic.
**Decision:** fix-now — guard null category scores
**Resolution:** c78f577 — medianScore() filters null scores with warning; throws if all runs errored

### 6. [Minor] .gitignore:16 + AGENT.md — plans moved into gitignored .claude/; AGENT.md points three ways
`.claude/` is gitignored, so new plan files will be silently excluded by `git add .`
(including CI's fix-commit). AGENT.md still references `plans/*.md` (line 68) and lists
`plans/` in the directory tree (line 87) alongside the new `.claude/plans/` note (line 93).
**Decision:** fix-now — un-ignore .claude/plans + reviews, fix AGENT.md refs
**Resolution:** c78f577 — .gitignore negations for .claude/plans + .claude/reviews; AGENT.md refs updated

### 7. [Minor] .lighthouserc.json — third divergent threshold set (90/100/96/50)
Its assert block is never run by the orchestrator; disagrees with both AGENT.md and code
defaults. Consolidate when fixing #1.
**Decision:** fix-now — align .lighthouserc.json assert thresholds
**Resolution:** c78f577 — assert block aligned to 95/100/96/90, seo warn→error

### 8. [Minor] src/test/lighthouse-playbook.test.ts — test-quality nits
Unused `import fs` (line 2); readFileSync mock's `|| ''` fallback lets negative tests pass
for the wrong reason; no test for all-unknown audit IDs ("No known fixes" path).
**Decision:** fix-now — test nits
**Resolution:** c78f577 — unused import removed, strict readFileSync mock, all-unknown-audits test added (42 tests pass)

### 9. [Minor] NEXT.md / CLAUDE.md — doc overstatements
NEXT.md says mobile audit "validated" but the dual pass has never run in CI (this push is
the first exercise). CLAUDE.md/GEMINI.md "MUST also read ../StandardLibrary/AGENT.md"
resolves to nothing in CI or fresh clones — intentional, but consider "if present" wording.
**Decision:** fix-now — doc wording
**Resolution:** c78f577 — NEXT.md "validated" reworded; CLAUDE.md/GEMINI.md pointer now "if present"

## Verified non-issues
- Mobile reports parsed into memory before `.lighthouseci` wipe — no cross-pass contamination.
- `--settings.preset=desktop` is correct LHCI syntax.
- CI fix-commit push uses default GITHUB_TOKEN → no workflow self-trigger loop.
- `fixOut.includes("[playbook] Fixed:")` matches the Python script's output format.
