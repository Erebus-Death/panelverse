import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useState, useEffect, useRef } from 'react'
import { getAllSeries } from '../lib/content'

export default function SearchPage({ allSeries }) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [searched, setSearched] = useState(false)
  const [suggestions, setSuggestions] = useState([])
  const [showDrop, setShowDrop] = useState(false)
  const [focused, setFocused] = useState(-1)
  const inputRef = useRef(null)
  const dropRef = useRef(null)

  useEffect(() => {
    const q = router.query.q || ''
    setQuery(q)
    if (q.trim()) { setResults(doSearch(q, allSeries)); setSearched(true) }
    else { setResults([]); setSearched(false) }
  }, [router.query.q])

  function doSearch(q, series) {
    const terms = q.toLowerCase().trim().split(/\s+/).filter(Boolean)
    return series.filter(s => {
      const hay = [s.title, s.author, s.artist, s.type, s.status, s.description, ...(s.genres || [])].join(' ').toLowerCase()
      return terms.every(t => hay.includes(t))
    })
  }

  function getSuggestions(q) {
    if (!q.trim() || q.length < 2) return []
    const terms = q.toLowerCase().split(/\s+/)
    return allSeries.filter(s => {
      const hay = [s.title, s.type, ...(s.genres || []), s.author || ''].join(' ').toLowerCase()
      return terms.every(t => hay.includes(t))
    }).slice(0, 6)
  }

  function handleChange(e) {
    const q = e.target.value
    setQuery(q)
    setFocused(-1)
    const s = getSuggestions(q)
    setSuggestions(s)
    setShowDrop(q.length >= 2 && s.length > 0)
    if (q.trim()) { setResults(doSearch(q, allSeries)); setSearched(true) }
    else { setResults([]); setSearched(false) }
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (focused >= 0 && suggestions[focused]) {
      router.push(`/series/${suggestions[focused].slug}`)
    } else if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`)
    }
    setShowDrop(false)
  }

  function handleKeyDown(e) {
    if (!showDrop) return
    if (e.key === 'ArrowDown') { e.preventDefault(); setFocused(f => Math.min(f + 1, suggestions.length - 1)) }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setFocused(f => Math.max(f - 1, -1)) }
    if (e.key === 'Escape')    { setShowDrop(false) }
  }

  useEffect(() => {
    function onClick(e) {
      if (!dropRef.current?.contains(e.target) && !inputRef.current?.contains(e.target)) setShowDrop(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const latestChapter = (s) => s.chapters?.at(-1)

  return (
    <>
      <Head>
        <title>{query ? `Search: ${query} — PanelVerse` : 'Search — PanelVerse'}</title>
      </Head>
      <div className="container">
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '40px 0 60px' }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 24, color: 'var(--text)' }}>Search Series</h1>

          {/* Search bar with dropdown */}
          <div style={{ position: 'relative', marginBottom: 32 }}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 10 }}>
              <input
                ref={inputRef}
                type="text" value={query} onChange={handleChange} onKeyDown={handleKeyDown}
                onFocus={() => suggestions.length > 0 && setShowDrop(true)}
                placeholder="Search by title, genre, author, type..."
                autoComplete="off" autoFocus
                style={{
                  flex: 1, background: 'var(--surface)', border: '1px solid var(--border)',
                  borderRadius: 8, padding: '12px 16px', color: 'var(--text)', fontSize: 15, outline: 'none',
                }}
              />
              <button type="submit" style={{
                background: 'var(--accent)', color: '#fff', border: 'none',
                borderRadius: 8, padding: '12px 20px', fontSize: 15, fontWeight: 600, cursor: 'pointer',
              }}>Search</button>
            </form>

            {/* Suggestions dropdown */}
            {showDrop && suggestions.length > 0 && (
              <div ref={dropRef} style={{
                position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0,
                background: '#1a1d27', border: '1px solid #2a2e42', borderRadius: 8,
                overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.5)', zIndex: 100,
              }}>
                {suggestions.map((s, i) => (
                  <Link key={s.slug} href={`/series/${s.slug}`}
                    onMouseEnter={() => setFocused(i)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '10px 16px', textDecoration: 'none',
                      background: focused === i ? 'rgba(255,255,255,0.05)' : 'transparent',
                      borderBottom: '1px solid rgba(42,46,66,0.5)',
                    }}
                  >
                    {s.cover
                      ? <img src={s.cover} alt={s.title} style={{ width: 32, height: 44, objectFit: 'cover', borderRadius: 3, flexShrink: 0 }} />
                      : <div style={{ width: 32, height: 44, borderRadius: 3, background: '#22263a', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,.3)' }}>{s.title.slice(0,2).toUpperCase()}</div>
                    }
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#e8eaf0', marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.title}</div>
                      <div style={{ fontSize: 11, color: '#7a7f9a' }}>{s.type?.toUpperCase()} · {s.genres?.slice(0,2).join(', ')}</div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Genre hint tags */}
          {!searched && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 32 }}>
              {['Action', 'Fantasy', 'Romance', 'Manhwa', 'Manga', 'Ongoing', 'Completed', 'Martial Arts'].map(tag => (
                <button key={tag} onClick={() => {
                  setQuery(tag); setResults(doSearch(tag, allSeries)); setSearched(true)
                  router.push(`/search?q=${encodeURIComponent(tag)}`, undefined, { shallow: true })
                }} style={{
                  background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--muted)',
                  borderRadius: 20, padding: '5px 14px', fontSize: 12, cursor: 'pointer',
                }}>
                  {tag}
                </button>
              ))}
            </div>
          )}

          {/* Results */}
          {searched && (
            <div>
              <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 20 }}>
                {results.length > 0
                  ? <><strong style={{ color: 'var(--text)' }}>{results.length}</strong> result{results.length !== 1 ? 's' : ''} for <strong style={{ color: 'var(--text)' }}>"{router.query.q || query}"</strong></>
                  : <>No results for <strong style={{ color: 'var(--text)' }}>"{router.query.q || query}"</strong></>
                }
              </div>
              {results.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {results.map(s => {
                    const latest = latestChapter(s)
                    return (
                      <Link key={s.slug} href={`/series/${s.slug}`} style={{
                        display: 'flex', gap: 16, alignItems: 'center',
                        background: 'var(--surface)', border: '1px solid var(--border)',
                        borderRadius: 8, padding: '14px 16px', textDecoration: 'none',
                      }}>
                        {s.cover
                          ? <img src={s.cover} alt={s.title} style={{ width: 50, height: 70, objectFit: 'cover', borderRadius: 4, flexShrink: 0 }} />
                          : <div style={{ width: 50, height: 70, borderRadius: 4, flexShrink: 0, background: 'var(--surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,.3)' }}>{s.title.slice(0,2).toUpperCase()}</div>
                        }
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 700, color: 'var(--text)', fontSize: 14, marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.title}</div>
                          <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 6 }}>{s.type?.toUpperCase()} · {s.genres?.slice(0,3).join(', ')}</div>
                          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                            <span style={{
                              fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.5px',
                              padding: '2px 7px', borderRadius: 3,
                              background: s.status === 'ongoing' ? 'rgba(34,197,94,.15)' : 'rgba(59,130,246,.15)',
                              color: s.status === 'ongoing' ? '#22c55e' : '#3b82f6',
                            }}>{s.status}</span>
                            {latest && <span style={{ fontSize: 12, color: 'var(--muted)' }}>Ch. {latest.num} · {s.chapters?.length} chapter{s.chapters?.length !== 1 ? 's' : ''}</span>}
                          </div>
                        </div>
                        <div style={{ color: 'var(--muted)', fontSize: 18, flexShrink: 0 }}>›</div>
                      </Link>
                    )
                  })}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8 }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}>No series found</div>
                  <div style={{ fontSize: 13, color: 'var(--muted)' }}>Try searching by genre like "Action" or "Fantasy"</div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export async function getStaticProps() {
  const allSeries = getAllSeries()
  return { props: { allSeries } }
}
