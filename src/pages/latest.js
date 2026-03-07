import Head from 'next/head'
import Link from 'next/link'
import { getLatestUpdates, timeAgo } from '../lib/content'

export default function Latest({ latestUpdates }) {
  return (
    <>
      <Head>
        <title>Latest Updates — PanelVerse</title>
      </Head>
      <div className="container">
        <div className="section">
          <div className="section-head">
            <div className="section-title">Latest Updates</div>
          </div>
          <div className="updates-grid">
            {latestUpdates.map((u, i) => (
              <Link
                key={`${u.seriesSlug}-${u.chapterNum}`}
                href={`/series/${u.seriesSlug}/chapter/${u.chapterNum}`}
                className="update-row"
              >
                <div className="ur-cover" style={{
                  background: 'var(--surface2)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,.35)',
                  width: '36px', height: '50px', borderRadius: '3px', flexShrink: 0,
                }}>
                  {u.seriesTitle.slice(0, 2).toUpperCase()}
                </div>
                <div className="ur-info">
                  <div className="ur-title">{u.seriesTitle}</div>
                  <div className="ur-ch">Chapter {u.chapterNum}{u.chapterTitle ? ` — ${u.chapterTitle}` : ''}</div>
                  <div className="ur-meta">
                    {i < 3 && <span className="badge-new">New</span>}
                    <span>{timeAgo(u.date)}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

export async function getStaticProps() {
  return { props: { latestUpdates: getLatestUpdates(50) } }
}
