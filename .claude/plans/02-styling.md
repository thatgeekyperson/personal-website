# Phase 2 — Tailwind CSS v4 Setup

## Goal

Tailwind utility classes work in any `.tsx` file. Design tokens (brand color, font) are defined. CSS reset and smooth scroll are in place.

## Install

```
npm install tailwindcss@4 @tailwindcss/vite@4
```

## Key Difference from Tailwind v3

Tailwind v4 requires **no** `tailwind.config.js`. Configuration lives entirely in CSS using `@theme`. The Vite plugin replaces the PostCSS setup and uses Vite's module graph to scan files — no `content` array needed.

Reference: [Tailwind CSS v4 docs — Installation with Vite](https://tailwindcss.com/docs/installation/using-vite)

## `vite.config.ts` Changes

Add the Tailwind plugin (must come before the React plugin):

```ts
import tailwindcss from '@tailwindcss/vite'
plugins: [tailwindcss(), react()]
```

## `src/index.css` (full file content)

```css
@import "tailwindcss";

html {
  scroll-behavior: smooth;
}

@theme {
  --color-brand: #2563eb;
  --font-sans: 'Inter', system-ui, sans-serif;
}
```

- `scroll-behavior: smooth` enables native browser smooth scrolling on anchor links — no JS scroll library needed
- `--color-brand` registers `text-brand`, `bg-brand`, `border-brand` as Tailwind utilities

## `src/main.tsx` — import the CSS

```ts
import './index.css'
```

## `index.html` — Inter font + page title

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<title>Manan — Developer</title>
```

## Verification

In `src/App.tsx`, add a test class and confirm it renders:

```tsx
<h1 className="text-3xl font-bold text-brand">Hello</h1>
```

Text should appear in blue-600. Remove after confirming.
