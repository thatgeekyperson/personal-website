# Phase 8 — Testing

## Goal

`npm test` runs green from a fresh clone. Tests cover all critical user-facing components. A testing plan documents what is covered and what is deferred.

## Test Stack

- **Vitest 3** — Vite-native test runner (same config, same module resolution)
- **@testing-library/react 16** — component rendering and querying by accessible roles
- **@testing-library/jest-dom 6** — DOM assertion matchers (`toBeInTheDocument`, `toHaveAttribute`)
- **jsdom 26** — browser simulation environment

## `vitest.config.ts`

Uses `mergeConfig` to extend `vite.config.ts` — avoids plugin duplication and Vite 8/Vitest 3 type mismatch:

```ts
import { defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from './vite.config'

export default mergeConfig(viteConfig, defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
})
```

The `resolve.alias` must match `vite.config.ts` exactly — otherwise `@/` imports fail in tests but work in the dev server.

## `src/test/setup.ts`

```ts
import '@testing-library/jest-dom'
```

## Test Files

### `src/components/Hero.test.tsx`
- Renders the developer's name in an `<h1>`
- Renders the tagline
- "View Projects" link has `href="#projects"`
- "Contact" link has `href` starting with `mailto:`

### `src/components/Navbar.test.tsx`
- `<nav>` element has `aria-label="Main navigation"`
- Hamburger button has an `aria-label`
- Clicking hamburger shows the mobile menu
- All nav links (About, Projects) are present

### `src/components/ProjectCard.test.tsx`
- Renders project title and description
- GitHub link has `target="_blank"` and `rel="noopener noreferrer"`
- Live demo link is absent when `liveUrl` is `undefined`
- Live demo link is present when `liveUrl` is provided

### `src/components/Footer.test.tsx`
- GitHub link has `rel="noopener noreferrer"`
- LinkedIn link has `rel="noopener noreferrer"`

### `src/data/projects.test.ts`
- Each project has a non-empty `id`, `title`, `description`, `githubUrl`
- Each `githubUrl` starts with `https://github.com/`
- Each `id` is unique

## What Is Deferred

- **E2E testing (Playwright)** — out of scope for v1. The complexity of setting up browser automation is not justified for a personal site at this stage.
- **Snapshot tests** — deliberately excluded. Snapshot tests are brittle against Tailwind class changes and produce false failures on trivial styling updates.
- **Visual regression** — out of scope for v1.

## Coverage Target

70% statement coverage minimum. Run:

```
npm run test:coverage
```

## Run Tests

```
npm test
```
