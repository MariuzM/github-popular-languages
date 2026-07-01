import { unstable_cache } from 'next/cache'

export type LanguageStat = {
  name: string
  color: string
  repoCount: number
  share: number
}

export type LanguagesResult = {
  languages: LanguageStat[]
  totalRepos: number
  fetchedAt: string
  rateLimited: boolean
}

const LANGUAGES: { name: string; color: string }[] = [
  { name: 'C', color: '#555555' },
  { name: 'C#', color: '#178600' },
  { name: 'C++', color: '#f34b7d' },
  { name: 'Go', color: '#00ADD8' },
  { name: 'Jai', color: '#9d6b53' },
  { name: 'Java', color: '#b07219' },
  { name: 'JavaScript', color: '#f1e05a' },
  { name: 'Odin', color: '#60AFFE' },
  { name: 'PHP', color: '#4F5D95' },
  { name: 'Python', color: '#3572A5' },
  { name: 'Ruby', color: '#701516' },
  { name: 'Rust', color: '#dea584' },
  { name: 'TypeScript', color: '#3178c6' },
  { name: 'Zig', color: '#ec915c' },
]

const CACHE_TTL_SECONDS = 60 * 60

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const fetchRepoCount = async (language: string, token: string | undefined) => {
  const q = encodeURIComponent(`language:${language}`)
  const url = `https://api.github.com/search/repositories?q=${q}&per_page=1`

  for (let attempt = 0; attempt < 2; attempt++) {
    const res = await fetch(url, {
      headers: {
        Accept: 'application/vnd.github+json',
        'User-Agent': 'github-popular-languages',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })

    if (res.ok) {
      const data = (await res.json()) as { total_count?: number }
      return { count: data.total_count ?? 0, ok: true }
    }

    const retryable = res.status === 403 || res.status === 429
    if (retryable && attempt === 0) {
      const retryAfter = Number(res.headers.get('retry-after'))
      await sleep(Number.isFinite(retryAfter) && retryAfter > 0 ? Math.min(retryAfter, 2) * 1000 : 900)
      continue
    }

    return { count: 0, ok: false }
  }

  return { count: 0, ok: false }
}

const buildResult = async (): Promise<LanguagesResult> => {
  const token = process.env.GITHUB_TOKEN

  let rateLimited = false

  const stats = await Promise.all(
    LANGUAGES.map(async (language) => {
      const { count, ok } = await fetchRepoCount(language.name, token)
      if (!ok) {
        rateLimited = true
      }

      return {
        name: language.name,
        color: language.color,
        repoCount: count,
      }
    }),
  )

  const totalRepos = stats.reduce((sum, s) => sum + s.repoCount, 0)

  const languages: LanguageStat[] = stats
    .map((s) => ({
      ...s,
      share: totalRepos > 0 ? s.repoCount / totalRepos : 0,
    }))
    .sort((a, b) => b.repoCount - a.repoCount)

  return {
    languages,
    totalRepos,
    fetchedAt: new Date().toISOString(),
    rateLimited,
  }
}

export const getLanguages = unstable_cache(
  buildResult,
  ['github-popular-languages', ...LANGUAGES.map(({ name }) => name)],
  {
    revalidate: CACHE_TTL_SECONDS,
    tags: ['github-popular-languages'],
  },
)
