# GitHub Popular Languages

A [Next.js](https://nextjs.org) app that ranks the most-used programming languages on
GitHub by public repository count, pulled from the GitHub Search API and cached hourly.

## Stack

- Next.js 16 (App Router, Turbopack)
- React 19
- TypeScript 6
- `next/font` for self-hosted Google Fonts
- Async Server Component data fetch with hourly ISR and shared data caching

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
sorts by repo count. The GitHub requests run concurrently, and the combined result is stored
in Next.js's persistent data cache for **one hour**.

[src/app/page.tsx](src/app/page.tsx) also uses hourly Incremental Static Regeneration (ISR).
Vercel can therefore serve the generated page from its edge cache instead of invoking a
function and waiting for GitHub during each visit. When the cached page expires, stale content
continues to be served while Next.js regenerates it.

## Deploying to Vercel

1. Push the repo to GitHub and import it in Vercel — the Next.js preset is detected
   automatically.
2. **Environment variables:** add `GITHUB_TOKEN` in the Vercel project settings.
3. Deploy.

The cache uses Next.js's platform cache rather than a function's temporary filesystem, so it
is shared across serverless instances on Vercel.
