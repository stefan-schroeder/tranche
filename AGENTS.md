<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Security: lock down by default

Every page, route handler, and API endpoint is **protected by default** — access requires an authenticated session. When you add a new route, assume it must be locked down; only expose it publicly by a deliberate, explicit edit.

- **Central gate:** `proxy.ts` (Next 16's renamed middleware) denies unauthenticated requests to every route — redirecting pages to `/` and returning `401` for `/api/*`. New routes are covered automatically.
- **Public routes are opt-in only:** add the path to `PUBLIC_PATHS` in `proxy.ts`. Currently the only public page is `/` (landing/home); NextAuth's `/api/auth/*` is excluded via the matcher.
- **Defense in depth:** proxy is an optimistic cookie check, not the last line of defense. Every route handler that reads or mutates data must also verify the session at the data source — call `requireSession()` from `src/lib/api-auth.ts` (or `auth()` directly in server pages).
