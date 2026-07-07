# Phase 7 — Social Links & Footer

## Goal

GitHub and LinkedIn links appear in both the Navbar and Footer. All external links open in new tabs with correct security attributes. URLs are centralized in one file.

## `src/constants/social.ts`

```ts
export const SOCIAL_LINKS = {
  github: 'https://github.com/yourusername',
  linkedin: 'https://linkedin.com/in/yourusername',
  email: 'mailto:manankh@gmail.com',
} as const
```

Both `Navbar` and `Footer` import from this file. Changing a URL here updates it everywhere — no grep-and-replace needed.

## `src/components/SocialLinks.tsx`

```tsx
import { Github, Linkedin } from 'lucide-react'
import { SOCIAL_LINKS } from '@/constants/social'

export default function SocialLinks() {
  return (
    <div className="flex items-center gap-4">
      <a
        href={SOCIAL_LINKS.github}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="GitHub profile"
        className="text-gray-500 hover:text-gray-900 transition-colors"
      >
        <Github size={20} />
      </a>
      <a
        href={SOCIAL_LINKS.linkedin}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="LinkedIn profile"
        className="text-gray-500 hover:text-gray-900 transition-colors"
      >
        <Linkedin size={20} />
      </a>
    </div>
  )
}
```

## `src/components/Footer.tsx`

```tsx
import SocialLinks from './SocialLinks'

export default function Footer() {
  return (
    <footer className="border-t border-gray-100 py-8">
      <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-gray-500">
          © {new Date().getFullYear()} Manan. All rights reserved.
        </p>
        <SocialLinks />
      </div>
    </footer>
  )
}
```

## Security Note

All `target="_blank"` links use `rel="noopener noreferrer"`:
- `noopener` — prevents the opened page from accessing `window.opener` (blocks tab-napping attacks)
- `noreferrer` — suppresses the Referer header (privacy)

Reference: [OWASP — Target="_blank" vulnerability](https://owasp.org/www-community/attacks/Reverse_Tabnapping)

## Content to Fill In

Replace `yourusername` in `src/constants/social.ts` with real GitHub username and LinkedIn handle before deploy.
