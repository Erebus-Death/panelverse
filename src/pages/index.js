import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import HeroBanner from '../components/HeroBanner'
import SeriesCard from '../components/SeriesCard'
import { getAllSeries, getLatestChapters, getFeaturedSeries } from '../lib/content'

const SITE_URL = 'https://www.thepanelverse.com'

function UpdateMeta({ date }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) return <span style={{ fontSize: 13, color: 'var(--muted)' }}>...</span>
  const diff = Date.now() - new Date(date).getTime()
  const isRecent = diff < 3 * 24 * 60 * 60 * 1000
  const mins = Math.floor(diff / 60000)
  const hrs = Math.floor(mins / 60)
  const days = Math.floor(hrs / 24)
  let timeStr
  if (mins < 60) timeStr = `${mins}m ago`
  else if (hrs < 24) timeStr = `${hrs}h ago`
  else if (days === 1) timeStr = 'Yesterday'
  else if (days < 7) timeStr = `${days} days ago`
  else timeStr = new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  return (
    <>
      {isRecent && <span className="badge-new">New</span>}
      <span>{timeStr}</span>
    </>
  )
}

export default function Home({ allSeries, latestChapters, featuredSeries }) {
  return (
    <>
      <Head>
        <title>PanelVerse — Read Manga & Manhwa Free Online</title>
        <meta name="description" content={`Read the best manga and manhwa online for free. Browse ${allSeries.length} series including Solo Leveling, Nano Machine, The Beginning After the End, and more. New chapters added regularly. No account needed.`} />
        <link rel="canonical" href={SITE_URL} />
        <meta property="og:url" content={SITE_URL} />
        <meta property="og:title" content="PanelVerse — Read Manga & Manhwa Free" />
        <meta property="og:description" content={`Read the best manga and manhwa online for free. ${allSeries.length} series available. New chapters added regularly.`} />
        <meta property="og:image" content={`${SITE_URL}/og-image.png`} />
        <meta name="twitter:title" content="PanelVerse — Read Manga & Manhwa Free" />
        <meta name="twitter:description" content={`Read the best manga and manhwa online for free. ${allSeries.length} series available.`} />
        <meta name="twitter:image" content={`${SITE_URL}/og-image.png`} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "PanelVerse",
            "url": SITE_URL,
            "potentialAction": {
              "@type": "SearchAction",
              "target": `${SITE_URL}/search?q={search_term_string}`,
              "query-input": "required name=search_term_string"
            }
          })}}
        />
      </Head>

      {featuredSeries.length > 0 && <HeroBanner series={featuredSeries} />}
      <h1 style={{ position: 'absolute', width: '1px', height: '1px', overflow: 'hidden', clip: 'rect(0,0,0,0)' }}>
  Read Manga and Manhwa Online Free — PanelVerse
</h1>

      <div className="container">
        <div className="section">
          <div className="section-head">
            <div className="section-title">Latest Updates</div>
            <Link href="/latest" className="view-all">View All →</Link>
          </div>
          <div className="updates-grid">
            {latestChapters.map((ch) => (
              <div key={`${ch.seriesSlug}-${ch.num}`} className="update-row">
                <Link href={`/series/${ch.seriesSlug}`} style={{ flexShrink: 0 }}>
                  {ch.cover ? (
                    <img src={ch.cover} alt={ch.seriesTitle}
                      style={{ width: '80px', height: '112px', borderRadius: '6px', objectFit: 'cover', display: 'block' }} />
                  ) : (
                    <div style={{
                      width: '80px', height: '112px', borderRadius: '6px',
                      background: 'var(--surface2)', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,.35)',
                    }}>
                      {ch.seriesTitle.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                </Link>
                <div className="ur-info">
                  <div className="ur-title">
                    <Link href={`/series/${ch.seriesSlug}`} style={{ textDecoration: 'none', color: 'var(--text)' }}>
                      {ch.seriesTitle}
                    </Link>
                    <Link href={`/series/${ch.seriesSlug}/chapter/${ch.num}`} style={{ textDecoration: 'none', color: 'var(--accent)', fontWeight: 500, fontSize: '14px' }}>
                      Chapter {ch.num}{ch.title ? ` — ${ch.title}` : ''}
                    </Link>
                  </div>
                  <div className="ur-meta">
                    <UpdateMeta date={ch.date} />
                  </div>
                </div>
              </div>
            ))}
            {latestChapters.length === 0 && (
              <div style={{ color: 'var(--muted)', padding: '24px', gridColumn: '1/-1' }}>No chapters yet.</div>
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
            <div style={{ color: 'var(--muted)', padding: '24px' }}>No series added yet.</div>
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