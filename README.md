# GitHub Popular Languages

A [Next.js](https://nextjs.org) app that ranks the most-used programming languages on
GitHub by public repository count, pulled from the GitHub Search API and cached hourly.

## Stack

- Next.js 16 (App Router, Turbopack)
- React 19
- TypeScript 6
- `next/font` for self-hosted Google Fonts
- Async Server Component data fetch with an hourly disk cache

## Getting started

```bash
bun install
bun run dev
```

Open http://localhost:3000.

## GitHub token

The page works without auth, but GitHub's unauthenticated Search API is limited to
10 requests/minute, which isn't enough for the 14 tracked languages. Add a token to lift
the limit to 30/minute.

Add a [personal access token](https://github.com/settings/tokens) (no scopes needed) to
`.env` or `.env.local`:

```
GITHUB_TOKEN=ghp_xxx
```

Add or remove languages in the `LANGUAGES` list in
[src/server/languages.ts](src/server/languages.ts).

## Scripts

- `bun run dev` — start the dev server on port 3000
- `bun run build` — production build
- `bun run start` — serve the production build on port 3000
- `bun run lint` — ESLint (`eslint-config-next`)
- `bun run typecheck` — TypeScript check

## How it works

[src/server/languages.ts](src/server/languages.ts) queries
`search/repositories?q=language:<lang>` for each tracked language, reads `total_count`, and
sorts by repo count. It's called directly from the home Server Component in
[src/app/page.tsx](src/app/page.tsx), which is marked `dynamic = 'force-dynamic'` so it
renders per request.

Results are cached to a local JSON file and only refetched when older than **one hour**, so
most page loads (and server restarts) serve the cached data with no API call. Last-known-good
counts are retained, so a transient rate limit never zeroes out the rankings.

- Locally the cache lives at `.cache/languages.json`.
- On Vercel it lives in the OS temp dir (the only writable location), and all cache writes
  are wrapped so a read-only filesystem can never crash a request.

## Deploying to Vercel

1. Push the repo to GitHub and import it in Vercel — the Next.js preset is detected
   automatically.
2. **Environment variables:** add `GITHUB_TOKEN` in the Vercel project settings.
3. Deploy.

### Caching caveat on serverless

Vercel functions are ephemeral: the temp-dir cache persists only within a warm instance, so
the GitHub fetch runs again on cold starts and per new instance rather than strictly once an
hour globally. With a `GITHUB_TOKEN` (30 req/min) this stays well within rate limits. For a
true cross-instance cache, swap the disk cache in
[src/server/languages.ts](src/server/languages.ts) for a shared store such as Vercel KV /
Upstash Redis.
