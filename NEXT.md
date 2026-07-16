# NEXT.md - Active Priorities

## Active Tasks
- [ ] **SEO Expansion**: Add OpenGraph and Twitter card meta tags to the playbook fix list.

## Recent Completions
- [x] **Test Hardening**: Added unit tests for `scripts/lighthouse-playbook.js` covering all 8 playbook fixes (`src/test/lighthouse-playbook.test.ts`).
- [x] **Mobile Audit**: Integrated mobile and desktop sequential Lighthouse passes in `deploy-optimize.js`, both gated against thresholds (first CI exercise pending next push).
- [x] **Documentation Hardening**: Consolidated tech stack and pipeline logic into `AGENT.md`.
- [x] **Pointerization**: Updated `GEMINI.md` and `CLAUDE.md` as thin pointers.
- [x] **Threshold Alignment**: Verified and synchronized Lighthouse thresholds between code and docs.

## Backlog
- [ ] PWA Support (manifest, service worker).
- [ ] Dark mode toggle (Tailwind v4 native support).
