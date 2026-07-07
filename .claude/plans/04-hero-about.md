# Phase 4 — Hero & About Sections

## Goal

The home page renders two distinct sections: a full-viewport hero and an about section below the fold.

## `src/App.tsx` Structure

```tsx
import Navbar from '@/components/Navbar'
import Hero from '@/components/Hero'
import About from '@/components/About'
import Projects from '@/components/Projects'
import Footer from '@/components/Footer'

export default function App() {
  return (
    <main>
      <Navbar />
      <section id="hero">
        <Hero />
      </section>
      <section id="about">
        <About />
      </section>
      <section id="projects">
        <Projects />
      </section>
      <Footer />
    </main>
  )
}
```

The `id` attributes are the scroll targets for navbar anchor links.

## `src/components/Hero.tsx`

Full-viewport (`min-h-screen`) centered section containing:
- `<h1>` — full name, large and bold
- `<p>` — one-liner tagline (e.g. "Software Engineer — building things on the web")
- Two CTA buttons:
  - "View Projects" → `href="#projects"` (smooth scrolls, native anchor)
  - "Contact" → `href="mailto:manankh@gmail.com"`

Tailwind layout: `min-h-screen flex flex-col items-center justify-center text-center px-6 gap-6`

Button styles:
- Primary: `bg-brand text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors`
- Secondary: `border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors`

## `src/components/About.tsx`

Two-column layout at `md:` breakpoint:
- Left column: bio paragraph (3–5 sentences about background, interests, what you build)
- Right column: skills list — pill badges per technology

Pill badge style: `bg-brand/10 text-brand rounded-full px-3 py-1 text-sm font-medium`

Layout: `max-w-5xl mx-auto px-6 py-24 grid md:grid-cols-2 gap-12 items-start`

## Content to Fill In

Before Phase 4 implementation, provide:
- Full name
- Tagline / one-liner bio
- About section bio text (3–5 sentences)
- Skills/technologies list
