import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'

export default function Navbar({ allSeries = [] }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [showDrop, setShowDrop] = useState(false)
  const [focused, setFocused] = useState(-1)
  const wrapRef = useRef(null)
  const router = useRouter()

  const links = [
    { href: '/',       label: 'Home' },
    { href: '/series', label: 'Series' },
    { href: '/latest', label: 'Latest' },
  ]

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
    const sugg = getSuggestions(q)
    setSuggestions(sugg)
    setShowDrop(q.length >= 2 && sugg.length > 0)
  }

  function handleSubmit(e) {
    e.preventDefault()
    setShowDrop(false)
    if (focused >= 0 && suggestions[focused]) {
      router.push(`/series/${suggestions[focused].slug}`)
    } else if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`)
    }
    setQuery('')
  }

  function handleKeyDown(e) {
    if (!showDrop || suggestions.length === 0) return
    if (e.key === 'ArrowDown') { e.preventDefault(); setFocused(f => Math.min(f + 1, suggestions.length - 1)) }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setFocused(f => Math.max(f - 1, -1)) }
    if (e.key === 'Escape')    { setShowDrop(false); setFocused(-1) }
  }

  useEffect(() => {
    function onClickOutside(e) {
      if (!wrapRef.current?.contains(e.target)) setShowDrop(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  useEffect(() => {
    setShowDrop(false)
    setQuery('')
    setOpen(false)
    setFocused(-1)
  }, [router.asPath])

  return (
    <>
      <style>{`
        .nav-search-wrap { position: relative; }
        .sugg-drop {
          position: absolute; top: calc(100% + 8px); left: 0;
          min-width: 320px;
          background: #1a1d27; border: 1px solid #2a2e42;
          border-radius: 8px; overflow: hidden;
          box-shadow: 0 12px 40px rgba(0,0,0,0.7);
          z-index: 9999;
        }
        .sugg-item {
          display: flex; align-items: center; gap: 12px;
          padding: 10px 14px; cursor: pointer; text-decoration: none;
          color: inherit; transition: background .1s;
          border-bottom: 1px solid rgba(42,46,66,0.5);
        }
        .sugg-item:last-of-type { border-bottom: none; }
        .sugg-item:hover, .sugg-item.active { background: rgba(255,255,255,0.06); }
        .sugg-thumb { width: 32px; height: 44px; border-radius: 3px; object-fit: cover; flex-shrink: 0; }
        .sugg-thumb-ph {
          width: 32px; height: 44px; border-radius: 3px; flex-shrink: 0;
          background: #22263a; display: flex; align-items: center;
          justify-content: center; font-size: 9px; font-weight: 700; color: rgba(255,255,255,.25);
        }
        .sugg-name { font-size: 13px; font-weight: 600; color: #e8eaf0; margin-bottom: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .sugg-meta { font-size: 11px; color: #7a7f9a; }
        .sugg-footer {
          display: flex; align-items: center; gap: 8px;
          padding: 9px 14px; font-size: 11px; color: #7a7f9a;
          background: rgba(0,0,0,0.25); cursor: pointer; transition: background .1s;
        }
        .sugg-footer:hover { background: rgba(255,255,255,0.04); color: #e8eaf0; }
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
            <form className="nav-search nav-search-wrap" ref={wrapRef} onSubmit={handleSubmit}>
              <input
                name="q" type="text" value={query}
                placeholder="Search series..." autoComplete="off"
                onChange={handleChange} onKeyDown={handleKeyDown}
                onFocus={() => suggestions.length > 0 && setShowDrop(true)}
              />
              <button type="submit">⌕</button>

              {showDrop && suggestions.length > 0 && (
                <div className="sugg-drop">
                  {suggestions.map((s, i) => (
                    <Link
                      key={s.slug}
                      href={`/series/${s.slug}`}
                      className={`sugg-item${focused === i ? ' active' : ''}`}
                      onMouseEnter={() => setFocused(i)}
                    >
                      {s.cover
                        ? <img src={s.cover} alt={s.title} className="sugg-thumb" />
                        : <div className="sugg-thumb-ph">{s.title.slice(0, 2).toUpperCase()}</div>
                      }
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="sugg-name">{s.title}</div>
                        <div className="sugg-meta">{s.type?.toUpperCase()} · {s.genres?.slice(0, 2).join(', ')}</div>
                      </div>
                    </Link>
                  ))}
                  <div className="sugg-footer" onMouseDown={() => {
                    setShowDrop(false)
                    router.push(`/search?q=${encodeURIComponent(query)}`)
                  }}>
                    <span>⌕</span> See all results for <strong style={{ color: '#e8eaf0', marginLeft: 2 }}>"{query}"</strong>
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

      <div className={`mobile-menu${open ? ' open' : ''}`}>
        {links.map(l => (
          <Link key={l.href} href={l.href} onClick={() => setOpen(false)}>{l.label}</Link>
        ))}
        <form className="mobile-search" onSubmit={(e) => { setOpen(false); handleSubmit(e) }}>
          <input name="q" type="text" value={query} placeholder="Search series..."
            autoComplete="off" onChange={handleChange} />
          <button type="submit">⌕</button>
        </form>
      </div>
    </>
  )
}