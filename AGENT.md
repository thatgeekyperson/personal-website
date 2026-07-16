# AGENT.md (Single Source of Truth)

## ⚡ Core Mandates

1.  **Trust the Code, Verify the Docs.** Always read source code before trusting documentation. Use grep_search and read_file extensively.
2.  **Strategic Delegation.** Use sub-agents (e.g., generalist) for smaller sub-tasks to minimize main session context creep.
3.  **Zero-Secret Mandate.** NEVER read, print, or log secrets or .env files. Treat credentials as invisible, environment-managed entities.


## Project Goal
A minimal, production-ready personal website built with React, Vite, TypeScript, and Tailwind CSS v4. Features a hero section, about section, projects showcase, and navigation.

## Tech Stack
| Concern | Choice |
|---|---|
| **Build tool** | Vite 8 + @vitejs/plugin-react-swc |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS v4 |
| **Routing** | React Router v7 |
| **Icons** | lucide-react |
| **Testing** | Vitest 4 + @testing-library/react 16 |
| **Analytics** | @vercel/analytics |
| **Deployment** | Vercel |
| **CI/CD** | GitHub Actions + Lighthouse CI |

## CLI Commands
| Command | Purpose |
|---|---|
| npm run dev | Start development server at http://localhost:5173 |
| npm run build | Build for production (outputs to dist/) |
| npm run preview | Preview production build at http://localhost:4173 |
| npm test | Run tests with Vitest |
| npm run test:coverage | Run tests with coverage report |
| vercel --prod | Manual production deployment |
| node scripts/deploy-optimize.js | Run the full audit & deploy loop (CI entry point) |

## Autonomous Deploy Pipeline
Every push to main triggers .github/workflows/deploy-optimize.yml.

### Pipeline Logic (scripts/deploy-optimize.js)
1. **Build & Serve**: Builds the project and serves it on :4173.
2. **Lighthouse Audit**: Runs 3 collections for mobile and 3 collections for desktop against localhost:4173, calculating the **median** score per category for each.
3. **Threshold Gate**: Validates both mobile and desktop median scores against:
   - Performance: **95**
   - Accessibility: **100**
   - Best Practices: **96** (Lowered due to localhost @vercel/analytics 404 artifact)
   - SEO: **90**
4. **Fix Loop**: If thresholds fail on either pass, it extracts failing audit IDs from both passes and applies fixes from scripts/lighthouse-playbook.js.
5. **Iteration**: Rebuilds and re-audits up to 3 times.
6. **Deploy**: Only deploys to production if all thresholds pass for both mobile and desktop.

### Static Fix Playbook (scripts/lighthouse-playbook.js)
| Audit ID | Fix Strategy |
|---|---|
| meta-description | Injects meta description in index.html |
| document-title | Fixes empty <title> in index.html |
| html-has-lang | Adds lang="en" to <html> |
| is-crawlable | Creates public/robots.txt |
| font-display | Appends &display=swap to Google Fonts URL |
| uses-rel-preconnect | Adds fonts.gstatic.com preconnect |
| scroll-padding | Adds scroll-padding-top: 64px to src/index.css |
| viewport | Adds viewport meta tag to index.html |

## Constraints & Development Rules
- **Verify before Commit**: Always run npm test before committing.
- **Production Previews**: Always run Lighthouse audits against http://localhost:4173. Never against Vercel preview URLs (they contain extra JS and protection layers that skew scores).
- **Privacy Check**: Grep for yourusername across the codebase before committing personal content changes.
- **Docs First**: Create/Update plan files in .claude/plans/*.md before significant execution.
- **Build Requirement**: After any code change, run npm run build before npm run preview (as preview serves dist/).

## Directory Structure
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
.claude/plans/      # Architecture decision records & feature plans
.claude/reviews/    # Pre-push code review records
vercel.json         # SPA routing config for Vercel
.lighthouserc.json  # Lighthouse CI thresholds
```

## Active Plans
Active feature plans and step-by-step tasks are located in the `./.claude/plans/` directory.
