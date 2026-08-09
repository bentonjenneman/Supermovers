# Next.js Site

A Next.js 14 App Router scaffold with TypeScript, Tailwind CSS, Supabase SSR, Resend, and Cloudflare Pages compatibility.

## Run & Operate

- `pnpm --filter @workspace/next-site run dev` — run the Next.js dev server (port 24118)
- `pnpm --filter @workspace/next-site run build` — standard Next.js build
- `pnpm --filter @workspace/next-site run pages:build` — Cloudflare Pages build via `@cloudflare/next-on-pages`
- `pnpm --filter @workspace/next-site run typecheck` — typecheck the Next.js app
- `pnpm --filter @workspace/api-server run dev` — run the shared Express API server

## Stack

- **Framework:** Next.js 14, App Router, TypeScript, React 18
- **Styling:** Tailwind CSS v3
- **Auth/DB:** Supabase (`@supabase/ssr`) — browser + server clients
- **Email:** Resend
- **Deployment target:** Cloudflare Pages (`@cloudflare/next-on-pages`, `wrangler.toml`)
- **Monorepo:** pnpm workspaces, Node.js 24, TypeScript 5.9

## Where things live

- `artifacts/next-site/app/` — Next.js App Router pages and API routes
- `artifacts/next-site/lib/supabase/client.ts` — browser Supabase client
- `artifacts/next-site/lib/supabase/server.ts` — server Supabase client (uses `cookies()`)
- `artifacts/next-site/wrangler.toml` — Cloudflare Pages config
- `artifacts/next-site/.env.local.example` — required environment variables template
- `artifacts/next-site/tailwind.config.ts` — Tailwind v3 config
- `artifacts/next-site/next.config.mjs` — Next.js config

## Architecture decisions

- **Next.js 14 (not 15):** Cloudflare Pages adapter (`@cloudflare/next-on-pages`) targets 14.x.
- **`next.config.mjs` (not `.ts`):** Next.js 14 does not support TypeScript config files.
- **Tailwind v3:** Next.js 14 App Router works best with Tailwind v3 + PostCSS; Tailwind v4 requires Vite.
- **React 18:** Pinned to 18.x because the workspace catalog uses React 19 for other packages; this package declares its own dep.
- **Supabase SSR pattern:** Browser client in `lib/supabase/client.ts`, cookie-based server client in `lib/supabase/server.ts` — both read from env vars, no hardcoded keys.

## Required env vars

Copy `.env.local.example` to `.env.local` and fill in:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`

## User preferences

_Populate as you build._

## Gotchas

- Do not use `next.config.ts` — Next.js 14 rejects it at startup; use `next.config.mjs`.
- Tailwind v3 requires `postcss.config.js` + `tailwind.config.ts` content globs; the `@tailwind` directives go in `app/globals.css`.
- `cookies()` from `next/headers` is synchronous in Next.js 14 (it becomes async in Next.js 15).

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
