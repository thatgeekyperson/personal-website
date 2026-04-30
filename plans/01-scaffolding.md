# Phase 1 — Project Scaffolding

## Goal

Running `npm run dev` opens a blank React app with TypeScript, path aliases, and dev dependencies installed.

## What Actually Happened (deviation from original plan)

`create-vite@9` (the version pulled by `npm create vite@latest`) requires Node >= 20.19.0. The system had Node 18.17.0. Additionally, `create-vite@9` uses a new interactive TUI that ignores the `--template` flag in non-interactive contexts.

**Resolution:**
1. Installed Node 20 via Homebrew: `brew install node@20`
2. Scaffolded all project files manually (equivalent to what `create-vite react-swc-ts` would have produced)
3. This means a fresh clone only needs `npm install` — no scaffold step required

**Node Version Note:**
The existing Node 18.17.0 at `/usr/local/bin/node` was left in place. To make Node 20 the default:

```
echo 'export PATH="/opt/homebrew/opt/node@20/bin:$PATH"' >> ~/.zshrc && source ~/.zshrc
```

To remove the old Node 18 installation (requires sudo):

```
sudo rm /usr/local/bin/node /usr/local/bin/npm && sudo rm -rf /usr/local/lib/node_modules /usr/local/include/node
```

## Files Created Manually

```
package.json          - all dependencies declared upfront (no separate install steps)
tsconfig.json         - references tsconfig.app.json and tsconfig.node.json
tsconfig.app.json     - React/browser TS config with path aliases and ignoreDeprecations
tsconfig.node.json    - Vite/Node TS config
vite.config.ts        - React SWC + Tailwind plugins, @/ alias
vitest.config.ts      - mergeConfig pattern to avoid Vite 8/Vitest 3 type mismatch
index.html            - entry HTML with Inter font, title
src/main.tsx          - app entry, RouterProvider
src/App.tsx           - shell component
src/index.css         - Tailwind v4 @import + @theme tokens
src/vite-env.d.ts     - Vite client types
src/router.tsx        - createBrowserRouter setup
src/pages/NotFound.tsx
src/test/setup.ts     - @testing-library/jest-dom import
vercel.json           - SPA rewrite rule
.gitignore
```

## Vitest Config Pattern (deviation from plan)

Original plan used a standalone `vitest.config.ts` with `defineConfig` from `vitest/config` and the React SWC plugin. This caused a type mismatch because Vite 8 uses rolldown internally while Vitest 3 bundles its own rollup-based Vite.

**Fix:** Use `mergeConfig` from `vitest/config` to extend the main `vite.config.ts`:

```ts
import { defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from './vite.config'

export default mergeConfig(viteConfig, defineConfig({
  test: { environment: 'jsdom', setupFiles: ['./src/test/setup.ts'], globals: true },
}))
```

This avoids the plugin duplication and type mismatch entirely.

## TypeScript 6 Path Alias Deviation

`baseUrl` is deprecated in TypeScript 6. Used `"ignoreDeprecations": "6.0"` in `tsconfig.app.json` to maintain the `@/` alias pattern. This is the recommended migration path per the TypeScript 6 docs until a non-baseUrl alias approach is standardized.

## Install Command (for future reference / fresh clone)

```
npm install
```
