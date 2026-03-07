import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'

export default function Nav({ allSeries = [] }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [showDrop, setShowDrop] = useState(false)
  const [focused, setFocused] = useState(-1)
  const inputRef = useRef(null)
  const dropRef = useRef(null)
  const router = useRouter()

  const links = [
    { href: '/',        label: 'Home' },
    { href: '/series',  label: 'Series' },
    { href: '/latest',  label: 'Latest' },
  ]

  // Search logic
  function getSuggestions(q) {
    if (!q.trim() || q.length < 2) return []
    const terms = q.toLowerCase().trim().split(/\s+/)
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
    setShowDrop(q.length >= 2)
  }

  function handleSubmit(e) {
    e.preventDefault()
    const q = focused >= 0 && suggestions[focused]
      ? suggestions[focused].slug
      : query.trim()
    if (!q) return
    if (focused >= 0 && suggestions[focused]) {
      router.push(`/series/${suggestions[focused].slug}`)
    } else {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`)
    }
    setShowDrop(false)
    setQuery('')
  }

  // Keyboard navigation
  function handleKeyDown(e) {
    if (!showDrop || suggestions.length === 0) return
    if (e.key === 'ArrowDown') { e.preventDefault(); setFocused(f => Math.min(f + 1, suggestions.length - 1)) }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setFocused(f => Math.max(f - 1, -1)) }
    if (e.key === 'Escape')    { setShowDrop(false); setFocused(-1) }
  }

  // Close dropdown on outside click
  useEffect(() => {
    function onClick(e) {
      if (!dropRef.current?.contains(e.target) && !inputRef.current?.contains(e.target)) {
        setShowDrop(false)
      }
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  // Close dropdown on route change
  useEffect(() => {
    setShowDrop(false)
    setQuery('')
    setOpen(false)
  }, [router.pathname, router.query])

  return (
    <>
      <style>{`
        .search-wrap { position: relative; }
        .suggest-drop {
          position: absolute; top: calc(100% + 8px); left: 0; right: 0;
          background: #1a1d27; border: 1px solid #2a2e42;
          border-radius: 8px; overflow: hidden;
          box-shadow: 0 8px 32px rgba(0,0,0,0.6);
          z-index: 1000; min-width: 300px;
        }
        .suggest-item {
          display: flex; align-items: center; gap: 12px;
          padding: 10px 14px; cursor: pointer;
          text-decoration: none; color: inherit;
          border-bottom: 1px solid rgba(42,46,66,0.5);
          transition: background .1s;
        }
        .suggest-item:last-child { border-bottom: none; }
        .suggest-item:hover, .suggest-item.active { background: rgba(255,255,255,0.05); }
        .suggest-cover {
          width: 32px; height: 44px; border-radius: 3px;
          object-fit: cover; flex-shrink: 0;
        }
        .suggest-cover-placeholder {
          width: 32px; height: 44px; border-radius: 3px; flex-shrink: 0;
          background: #22263a; display: flex; align-items: center;
          justify-content: center; font-size: 9px; font-weight: 700;
          color: rgba(255,255,255,.3);
        }
        .suggest-title { font-size: 13px; font-weight: 600; color: #e8eaf0; margin-bottom: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .suggest-meta  { font-size: 11px; color: #7a7f9a; }
        .suggest-footer {
          padding: 8px 14px; font-size: 11px; color: #7a7f9a;
          background: rgba(0,0,0,0.2); cursor: pointer;
          display: flex; align-items: center; gap: 6px;
        }
        .suggest-footer:hover { background: rgba(255,255,255,0.03); color: #e8eaf0; }
      `}</style>

      <nav className="nav">
        <div className="nav-inner">
          <Link href="/" className="logo">Panel<span>Verse</span></Link>
          <ul className="nav-links">
            {links.map(l => (
              <li key={l.href}>
                <Link href={l.href} className={router.pathname === l.href ? 'active' : ''}>{l.label}</Link>
              </li>
            ))}
          </ul>
          <div className="nav-right">
            <form className="nav-search search-wrap" onSubmit={handleSubmit}>
              <input
                ref={inputRef}
                name="q"
                type="text"
                value={query}
                placeholder="Search series..."
                autoComplete="off"
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                onFocus={() => query.length >= 2 && setShowDrop(true)}
              />
              <button type="submit">⌕</button>

              {showDrop && suggestions.length > 0 && (
                <div className="suggest-drop" ref={dropRef}>
                  {suggestions.map((s, i) => (
                    <Link
                      key={s.slug}
                      href={`/series/${s.slug}`}
                      className={`suggest-item${focused === i ? ' active' : ''}`}
                      onMouseEnter={() => setFocused(i)}
                    >
                      {s.cover
                        ? <img src={s.cover} alt={s.title} className="suggest-cover" />
                        : <div className="suggest-cover-placeholder">{s.title.slice(0,2).toUpperCase()}</div>
                      }
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="suggest-title">{s.title}</div>
                        <div className="suggest-meta">{s.type?.toUpperCase()} · {s.genres?.slice(0,2).join(', ')}</div>
                      </div>
                    </Link>
                  ))}
                  <div
                    className="suggest-footer"
                    onMouseDown={() => router.push(`/search?q=${encodeURIComponent(query)}`)}
                  >
                    <span>⌕</span> See all results for <strong style={{color:'#e8eaf0'}}>"{query}"</strong>
                  </div>
                </div>
              )}
            </form>

            <button className="hamburger" onClick={() => setOpen(v => !v)} aria-label="Toggle menu">
              {open ? '✕' : '☰'}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      <div className={`mobile-menu${open ? ' open' : ''}`}>
        {links.map(l => (
          <Link key={l.href} href={l.href} onClick={() => setOpen(false)}>{l.label}</Link>
        ))}
        <form className="mobile-search" onSubmit={(e) => { setOpen(false); handleSubmit(e) }}>
          <input
            name="q" type="text" value={query}
            placeholder="Search series..."
            autoComplete="off"
            onChange={handleChange}
          />
          <button type="submit">⌕</button>
        </form>
      </div>
    </>
  )
}
