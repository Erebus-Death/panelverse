import Head from 'next/head'
import Link from 'next/link'
import HeroBanner from '../components/HeroBanner'
import SeriesCard from '../components/SeriesCard'
import { getAllSeries, getLatestUpdates, timeAgo } from '../lib/content'

export default function Home({ allSeries, latestUpdates, featuredSeries }) {
  return (
    <>
      <Head>
        <title>PanelVerse — Read Manga & Manhwa Free</title>
        <meta name="description" content="Read manga and manhwa online for free." />
      </Head>

      {/* Hero banner — only shows if you have featured series */}
      {featuredSeries.length > 0 && <HeroBanner series={featuredSeries} />}

      <div className="container">

        <div className="section">
          <div className="section-head">
            <div className="section-title">Latest Updates</div>
            <Link href="/latest" className="view-all">View All →</Link>
          </div>
          <div className="updates-grid">
            {latestUpdates.map((u, i) => (
              <Link
                key={`${u.seriesSlug}-${u.chapterNum}`}
                href={`/series/${u.seriesSlug}/chapter/${u.chapterNum}`}
                className="update-row"
              >
                {u.cover ? (
                  <img src={u.cover} alt={u.seriesTitle}
                    style={{width:'36px',height:'50px',borderRadius:'3px',objectFit:'cover',flexShrink:0}} />
                ) : (
                  <div style={{
                    width:'36px',height:'50px',borderRadius:'3px',flexShrink:0,
                    background:'var(--surface2)',display:'flex',alignItems:'center',
                    justifyContent:'center',fontSize:'10px',fontWeight:700,color:'rgba(255,255,255,.35)',
                  }}>
                    {u.seriesTitle.slice(0,2).toUpperCase()}
                  </div>
                )}
                <div className="ur-info">
                  <div className="ur-title">{u.seriesTitle}</div>
                  <div className="ur-ch">Chapter {u.chapterNum}{u.chapterTitle ? ` — ${u.chapterTitle}` : ''}</div>
                  <div className="ur-meta">
                    {i < 2 && <span className="badge-new">New</span>}
                    <span>{timeAgo(u.date)}</span>
                  </div>
                </div>
              </Link>
            ))}
            {latestUpdates.length === 0 && (
              <div style={{color:'var(--muted)',padding:'24px',gridColumn:'1/-1'}}>No chapters yet.</div>
            )}
          </div>
        </div>

        <div className="section">
          <div className="section-head">
            <div className="section-title">All Series</div>
            <Link href="/series" className="view-all">Browse All →</Link>
          </div>
          {allSeries.length > 0 ? (
            <div className="series-grid">
              {allSeries.map(s => <SeriesCard key={s.slug} series={s} />)}
            </div>
          ) : (
            <div style={{color:'var(--muted)',padding:'24px'}}>No series added yet.</div>
          )}
        </div>

      </div>
    </>
  )
}

export async function getStaticProps() {
  const allSeries = getAllSeries()
  const latestUpdates = getLatestUpdates(8)
  const featuredSeries = allSeries.filter(s => s.featured).slice(0, 8)
  return { props: { allSeries, latestUpdates, featuredSeries } }
}
