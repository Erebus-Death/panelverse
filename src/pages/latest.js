import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { getLatestChapters } from '../lib/content'

function UpdateMeta({ date }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) return <span style={{ fontSize: 13, color: 'var(--muted)' }}>...</span>
  const diff = Date.now() - new Date(date).getTime()
  const isRecent = diff < 7 * 24 * 60 * 60 * 1000
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

export default function Latest({ chapters }) {
  return (
    <>
      <Head><title>Latest Updates — PanelVerse</title></Head>
      <main>
        <div className="container">
          <div className="section">
            <div className="section-head">
              <div className="section-title">Latest Updates</div>
            </div>
            <div className="updates-grid">
              {chapters.map((ch) => (
                <div key={`${ch.seriesSlug}-${ch.num}`} className="update-row">
                  <Link href={`/series/${ch.seriesSlug}`} style={{ flexShrink: 0 }}>
                    {ch.cover ? (
                      <img src={ch.cover} alt={ch.seriesTitle}
                        style={{ width: '80px', height: '112px', borderRadius: '6px', objectFit: 'cover', display: 'block' }} />
                    ) : (
                      <div style={{
                        width: '80px', height: '112px', borderRadius: '6px', flexShrink: 0,
                        background: '#1a1d2e', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', fontSize: '14px', fontWeight: 800, color: 'rgba(255,255,255,.25)'
                      }}>
                        {ch.seriesTitle.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                  </Link>
                  <div className="ur-info">
                    <Link href={`/series/${ch.seriesSlug}`} style={{ textDecoration: 'none', color: 'var(--text)' }}>
                      <div className="ur-title" style={{ fontWeight: 700, marginBottom: 4 }}>{ch.seriesTitle}</div>
                    </Link>
                    <Link href={`/series/${ch.seriesSlug}/chapter/${ch.num}`} style={{ textDecoration: 'none' }}>
                      <div className="ur-ch">Chapter {ch.num}{ch.title ? ` — ${ch.title}` : ''}</div>
                    </Link>
                    <div className="ur-meta">
                      <UpdateMeta date={ch.date} />
                    </div>
                  </div>
                </div>
              ))}
              {chapters.length === 0 && (
                <div style={{ color: 'var(--muted)', padding: '24px' }}>No chapters yet.</div>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  )
}

export async function getStaticProps() {
  const chapters = getLatestChapters(50)
  return { props: { chapters } }
}