# GitHub Popular Languages

A [TanStack Start](https://tanstack.com/start) app that ranks the most-used programming
languages on GitHub by public repository count, pulled from the GitHub Search API and
cached for a week.

## Stack

- TanStack Start + TanStack Router (file-based routing, SSR)
- React 19
- Vite 8
- TypeScript 6
- Nitro (via `@tanstack/nitro-v2-vite-plugin`) for the deployable server build
- Server function (`createServerFn`) for the GitHub API call, with a weekly disk cache

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

Copy `.env.example` to `.env` and add a
[personal access token](https://github.com/settings/tokens) (no scopes needed):

```
GITHUB_TOKEN=ghp_xxx
```

Add or remove languages in the `LANGUAGES` list in
[src/server/languages.ts](src/server/languages.ts).

## Scripts

- `bun run dev` — start the dev server on port 3000
- `bun run build` — production build
- `bun run start` — serve the production build (`node .output/server/index.mjs`)
- `bun run typecheck` — TypeScript check

## How it works

[src/server/languages.ts](src/server/languages.ts) queries
`search/repositories?q=language:<lang>` for each tracked language, reads `total_count`, and
sorts by repo count.

Results are cached to a local JSON file and only refetched when older than **one week**, so
every page load (and server restart) serves the cached data with no API call. Last-known-good
counts are retained, so a transient rate limit never zeroes out the rankings.

- Locally the cache lives at `.cache/languages.json`.
- On Vercel it lives in the OS temp dir (the only writable location), and all cache writes
  are wrapped so a read-only filesystem can never crash a request.

## Deploying to Vercel

The Nitro plugin auto-detects Vercel (via the `VERCEL` env var) and emits the Vercel
[Build Output API](https://vercel.com/docs/build-output-api/v3) at `.vercel/output`, which
Vercel serves directly.

1. Push the repo to GitHub and import it in Vercel.
2. **Build command:** `bun run build` (or `npm run build`). Leave the output directory blank —
   Vercel picks up `.vercel/output` automatically.
3. **Environment variables:** add `GITHUB_TOKEN` in the Vercel project settings.
4. Deploy.

### Caching caveat on serverless

Vercel functions are ephemeral: the temp-dir cache persists only within a warm instance, so
the GitHub fetch runs again on cold starts and per new instance rather than strictly once a
week globally. With a `GITHUB_TOKEN` (30 req/min) this stays well within rate limits. For a
true cross-instance weekly cache, swap the disk cache in
[src/server/languages.ts](src/server/languages.ts) for a shared store such as Vercel KV /
Upstash Redis.
