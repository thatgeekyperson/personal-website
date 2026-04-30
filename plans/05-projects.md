# Phase 5 — Projects Section

## Goal

Projects are rendered from a typed data array. Adding a new project requires editing only `src/data/projects.ts` — no component changes.

## `src/data/projects.ts`

```ts
export interface Project {
  id: string
  title: string
  description: string
  techStack: string[]
  githubUrl: string
  liveUrl?: string
  imageUrl?: string
}

export const projects: Project[] = [
  // Fill in real projects here
]
```

The `Project` interface is the single contract between data and UI. TypeScript will catch mismatches at compile time.

## `src/components/ProjectCard.tsx`

Props: `project: Project`

Card layout:
- Container: `rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col gap-4`
- Title: `<h3>` bold
- Description: `<p>` text-gray-600
- Tech stack: pill badges per item
- Links row: GitHub icon-link (always shown) + optional live demo link

All external links **must** use:
```tsx
target="_blank" rel="noopener noreferrer"
```

This is both a security requirement (prevents new tab from accessing `window.opener`) and a privacy measure (suppresses Referer header). Reference: [MDN — Link types: noopener](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/rel/noopener)

## `src/components/Projects.tsx`

```tsx
import { projects } from '@/data/projects'
import ProjectCard from './ProjectCard'

export default function Projects() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-24">
      <h2 className="text-3xl font-bold mb-12">Projects</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map(project => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </section>
  )
}
```

## Icons

Uses `lucide-react` for GitHub and ExternalLink icons (already installed in Phase 1):

```tsx
import { Github, ExternalLink } from 'lucide-react'
```

## Content to Fill In

Provide at least 1–2 projects with: id, title, description, techStack array, githubUrl.
