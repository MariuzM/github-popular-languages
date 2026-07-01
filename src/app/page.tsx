import { getLanguages } from '~/server/languages'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

const numberFormatter = new Intl.NumberFormat('en-US')

const Home = async () => {
  const data = await getLanguages()

  const topCount = data.languages[0]?.repoCount ?? 0
  const leaderName = data.languages[0]?.name ?? '—'
  const totalM = `${(data.totalRepos / 1e6).toFixed(1)}M`

  return (
    <main className="page">
      <section className="card">
        <div className="badge">
          <span className="badge-dot" />
          Live Index
        </div>

        <h1 className="title">GitHub Popular Languages</h1>
        <p className="subtitle">
          Programming languages ranked by the number of public repositories on GitHub.
        </p>

        {data.rateLimited && (
          <p className="warning">
            Some results may be incomplete — GitHub rate limited the request. Set a GITHUB_TOKEN to
            raise the limit.
          </p>
        )}

        <div className="stats">
          <div className="stat">
            <div className="stat-label">Total repos</div>
            <div className="stat-value">{totalM}</div>
          </div>
          <div className="stat">
            <div className="stat-label">Languages</div>
            <div className="stat-value">{data.languages.length}</div>
          </div>
          <div className="stat">
            <div className="stat-label">Leader</div>
            <div className="stat-value stat-value--leader">{leaderName}</div>
          </div>
        </div>

        <ol className="list">
          {data.languages.map((lang, i) => (
            <li key={lang.name} className="row">
              <span className="rank">{i + 1}</span>
              <span
                className="dot"
                style={{ background: lang.color, boxShadow: `0 0 9px ${lang.color}` }}
              />
              <span className="name">{lang.name}</span>
              <span className="bar-track">
                <span
                  className="bar-fill"
                  style={{
                    width: `${topCount > 0 ? (lang.repoCount / topCount) * 100 : 0}%`,
                    background: lang.color,
                  }}
                />
              </span>
              <span className="count">{numberFormatter.format(lang.repoCount)}</span>
              <span className="share">{(lang.share * 100).toFixed(1)}%</span>
            </li>
          ))}
        </ol>

        <p className="footer">
          Based on {numberFormatter.format(data.totalRepos)} repositories across{' '}
          {data.languages.length} tracked languages. Source: GitHub Search API.
        </p>
      </section>
    </main>
  )
}

export default Home
