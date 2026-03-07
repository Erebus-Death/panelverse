import Head from 'next/head'
import Link from 'next/link'
import HeroBanner from '../components/HeroBanner'
import SeriesCard from '../components/SeriesCard'
import { getAllSeries, getLatestChapters, getFeaturedSeries, timeAgo } from '../lib/content'

export default function Home({ allSeries, latestChapters, featuredSeries }) {
  return (
    <>
      <Head>
        <title>PanelVerse — Read Manga & Manhwa Free</title>
        <meta name="description" content="Read manga and manhwa online for free." />
      </Head>

      {featuredSeries.length > 0 && <HeroBanner series={featuredSeries} />}

      <div className="container">

        <div className="section">
          <div className="section-head">
            <div className="section-title">Latest Updates</div>
            <Link href="/latest" className="view-all">View All →</Link>
          </div>
          <div className="updates-grid">
            {latestChapters.map((ch) => (
              <div key={`${ch.seriesSlug}-${ch.num}`} className="update-row">
                <Link href={`/series/${ch.seriesSlug}`} style={{ flexShrink:0 }}>
                  {ch.cover ? (
                    <img src={ch.cover} alt={ch.seriesTitle}
                      style={{ width:'80px', height:'112px', borderRadius:'6px', objectFit:'cover', display:'block' }} />
                  ) : (
                    <div style={{
                      width:'80px', height:'112px', borderRadius:'6px',
                      background:'var(--surface2)', display:'flex', alignItems:'center',
                      justifyContent:'center', fontSize:'10px', fontWeight:700, color:'rgba(255,255,255,.35)',
                    }}>
                      {ch.seriesTitle.slice(0,2).toUpperCase()}
                    </div>
                  )}
                </Link>
                <div className="ur-info">
                  <div className="ur-title">
                    <Link href={`/series/${ch.seriesSlug}`} style={{ textDecoration:'none', color:'var(--text)' }}>
                      {ch.seriesTitle}
                    </Link>
                    <Link href={`/series/${ch.seriesSlug}/chapter/${ch.num}`} style={{ textDecoration:'none', color:'var(--accent)', fontWeight:500, fontSize:'14px' }}>
                      Chapter {ch.num}{ch.title ? ` — ${ch.title}` : ''}
                    </Link>
                  </div>
                  <div className="ur-meta">
                    {isRecent(ch.date) && <span className="badge-new">New</span>}
                    <span>{timeAgo(ch.date)}</span>
                  </div>
                </div>
              </div>
            ))}
            {latestChapters.length === 0 && (
              <div style={{ color:'var(--muted)', padding:'24px', gridColumn:'1/-1' }}>No chapters yet.</div>
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
            <div style={{ color:'var(--muted)', padding:'24px' }}>No series added yet.</div>
          )}
        </div>

      </div>
    </>
  )
}

export async function getStaticProps() {
  const allSeries = getAllSeries()
  const latestChapters = getLatestChapters(12)
  const featuredSeries = getFeaturedSeries()
  return { props: { allSeries, latestChapters, featuredSeries } }
}

function isRecent(dateStr) {
  return Date.now() - new Date(dateStr).getTime() < 3 * 24 * 60 * 60 * 1000
}