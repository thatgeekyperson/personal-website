# Phase 6 — Navigation Bar

## Goal

A sticky top nav with links to each section via smooth scroll. Collapses to a hamburger menu on mobile.

## `src/components/Navbar.tsx`

Structure:
- Fixed/sticky header spanning full width
- Left: name/logo — links to `#hero` (top of page)
- Right (desktop, `md:` breakpoint): anchor links — About, Projects, GitHub icon, LinkedIn icon
- Right (mobile): hamburger button toggles mobile menu

Tailwind container: `fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100`

Inner: `max-w-6xl mx-auto px-6 h-16 flex items-center justify-between`

## Smooth Scroll

Anchor links (`<a href="#projects">`) trigger native browser smooth scroll via:

```css
html { scroll-behavior: smooth; }
```

Already set in `src/index.css` (Phase 2). No JavaScript scroll library needed.

## Mobile Menu

State managed with a single `useState<boolean>` inside `Navbar.tsx`. No external state management required.

```tsx
const [menuOpen, setMenuOpen] = useState(false)
```

## Accessibility Requirements

These are required for screen reader compatibility and WCAG 2.1 AA compliance:

- Wrap links in `<nav aria-label="Main navigation">`
- Hamburger button must have:
  ```tsx
  aria-label={menuOpen ? 'Close menu' : 'Open menu'}
  aria-expanded={menuOpen}
  ```
- Mobile menu links should be focusable and close the menu on selection

Reference: [WAI-ARIA — Disclosure Navigation Menu](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/examples/disclosure-navigation/)

## Desktop Nav Links

```tsx
<a href="#about">About</a>
<a href="#projects">Projects</a>
<a href={SOCIAL_LINKS.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub">
  <Github size={20} />
</a>
<a href={SOCIAL_LINKS.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
  <Linkedin size={20} />
</a>
```

Social links imported from `src/constants/social.ts` (Phase 7).
