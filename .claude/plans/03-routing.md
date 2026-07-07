# Phase 3 — Routing Setup

## Goal

The app is wrapped in a React Router v7 provider. A central route file defines all routes. A 404 fallback page exists.

## Why `createBrowserRouter`

React Router v7 recommends `createBrowserRouter` + `RouterProvider` over the legacy `<BrowserRouter>` wrapper. Benefits:
- All routes declared in one object — easier to audit
- Enables future data loaders/actions without refactoring
- `errorElement` provides a declarative 404/error boundary per route

Reference: [React Router v7 — createBrowserRouter](https://reactrouter.com/en/main/routers/create-browser-router)

## Page Structure Decision

All content (Hero, About, Projects) lives on `/` as scroll sections with `id` anchors. Nav links use `href="#section-id"` — native anchor links. This keeps the URL clean and requires no sub-route configuration in v1.

`createBrowserRouter` is still used (rather than `HashRouter`) because:
- Vercel handles SPA routing via `vercel.json` rewrites — no `#` in URLs
- Clean URLs look professional and are SEO-friendly
- Future pages (e.g. a blog or project detail) can be added as new routes without refactoring

## Files to Create

### `src/router.tsx`

```tsx
import { createBrowserRouter } from 'react-router-dom'
import App from '@/App'
import NotFound from '@/pages/NotFound'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <NotFound />,
  },
])
```

### `src/pages/NotFound.tsx`

```tsx
import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="text-gray-500">Page not found.</p>
      <Link to="/" className="text-brand hover:underline">Go home</Link>
    </div>
  )
}
```

## `src/main.tsx` Change

Replace `<App />` with the router provider:

```tsx
import { RouterProvider } from 'react-router-dom'
import { router } from '@/router'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)
```
