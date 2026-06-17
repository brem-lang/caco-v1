@AGENTS.md

## Tech Stack

- Next.js 15 (App Router)
- Supabase (latest)
- shadcn/ui + Tailwind CSS v4
- TypeScript (strict mode)

## Code Style

- Use TypeScript for all files, avoid `any`
- Use arrow functions for components
- Use named exports, not default exports (except pages)
- Use `const` over `let` when possible
- Keep components small and single-responsibility

## Supabase

- Use server-side client for protected routes
- Use `@supabase/ssr` for cookie-based auth
- Always handle loading and error states
- Use RLS (Row Level Security) on all tables
- Keep all DB types in `/types/supabase.ts`

## UI

- All components must support dark and light mode
- Use CSS variables for colors, never hardcode hex
- Use shadcn/ui components as base, extend when needed
- Use `cn()` utility for conditional classnames

## Performance

- Use `next/image` for all images
- Use `next/font` for fonts
- Prefer Server Components, use `"use client"` only when needed
- Lazy load heavy components with `dynamic()`

## Error Handling

- Always wrap async functions in try/catch
- Use `error.tsx` and `not-found.tsx` per route
- Show user-friendly error messages
- Log errors properly, never console.log in production

## Security

- Never expose service role key on the client
- Validate all inputs with Zod
- Always check auth session in server actions
- Use environment variables for all secrets
