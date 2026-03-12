import { useEffect, useCallback, useState, useRef } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { getAllChapterPaths, getChapter, getAllSeries } from '../../../../lib/content'

const SITE_URL = 'https://www.thepanelverse.com'

export default function ChapterReader({ data, relatedSeries }) {
  const router = useRouter()
  const [showTop, setShowTop] = useState(false)
  const [imgErrors, setImgErrors] = useState({})
  const lastScrollY = useRef(0)

  const { series, chapter, images, prev, next } = data || {}

  useEffect(() => {
    function onScroll() {
      const y = window.scrollY
      setShowTop(y > 600)
      lastScrollY.current = y
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleKey = useCallback((e) => {
    if (e.key === 'ArrowLeft'  && prev) router.push(`/series/${series.slug}/chapter/${prev.num}`)
    if (e.key === 'ArrowRight' && next) router.push(`/series/${series.slug}/chapter/${next.num}`)
  }, [prev, next, router, series?.slug])

  useEffect(() => {
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [handleKey])

  if (!data) return <div style={{ padding: '60px 20px', color: '#7a7f9a', textAlign: 'center' }}>Chapter not found.</div>

  const otherSeries = relatedSeries.filter(s => s.slug !== series.slug).slice(0, 8)
  const pageUrl = `${SITE_URL}/series/${series.slug}/chapter/${chapter.num}`
  const pageTitle = `${series.title} Chapter ${chapter.num}${chapter.title ? ` — ${chapter.title}` : ''}`
  const pageDesc = `Read ${series.title} Chapter ${chapter.num} free on PanelVerse.${chapter.title ? ` ${chapter.title}.` : ''} ${images.length} pages.`

  return (
    <>
      <Head>
        <title>{pageTitle} | PanelVerse</title>
        <meta name="description" content={pageDesc} />
        <link rel="canonical" href={pageUrl} />

        {/* Prev/Next for Google pagination */}
        {prev && <link rel="prev" href={`${SITE_URL}/series/${series.slug}/chapter/${prev.num}`} />}
        {next && <link rel="next" href={`${SITE_URL}/series/${series.slug}/chapter/${next.num}`} />}

        {/* Open Graph */}
        <meta property="og:url" content={pageUrl} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDesc} />
        {series.cover && <meta property="og:image" content={series.cover} />}

        {/* Twitter */}
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDesc} />
        {series.cover && <meta name="twitter:image" content={series.cover} />}
      </Head>

      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .ch-select-wrap { display: flex; align-items: center; gap: 8px; }
        .ch-select {
          background: #1a1d2e;
          border: 2px solid #7c3aed; color: #e8eaf0;
          font-size: 13px; font-weight: 600;
          padding: 7px 14px; border-radius: 20px;
          cursor: pointer; min-width: 130px;
        }
        .ch-select:focus { outline: none; border-color: #7c3aed; }

        .ch-nav { display: flex; gap: 8px; align-items: center; }
        .ch-btn {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 7px 16px; border-radius: 20px;
          font-size: 13px; font-weight: 700; text-decoration: none;
          transition: all .2s; border: none; cursor: pointer; white-space: nowrap;
        }
        .ch-btn-prev { background: #1a1d2e; color: #e8eaf0; border: 2px solid #7c3aed !important; }
        .ch-btn-prev:hover { border-color: #7c3aed !important; color: #7c3aed; }
        .ch-btn-next { background: #7c3aed; color: #fff; }
        .ch-btn-next:hover { background: #6d28d9; }
        .ch-btn-disabled { background: #111420; color: #2a2e42; border: 2px solid #1e2235 !important; cursor: not-allowed; }

        .ch-back {
          font-size: 12px; color: #7a7f9a; text-decoration: none;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          max-width: 180px; flex-shrink: 0;
        }
        .ch-back:hover { color: #e8eaf0; }

        .reader-header {
          max-width: 800px; margin: 0 auto;
          padding: 24px 16px 16px; text-align: center;
        }
        .reader-h1 {
          font-size: clamp(16px, 2.5vw, 22px); font-weight: 800;
          color: #e8eaf0; line-height: 1.3; margin-bottom: 10px;
        }
        .reader-breadcrumb {
          display: flex; align-items: center; justify-content: center;
          gap: 6px; flex-wrap: wrap;
          font-size: 12px; color: #7a7f9a;
          background: #111420; border: 1px solid #1e2235;
          border-radius: 6px; padding: 8px 16px;
        }
        .reader-bread-link { color: #7c3aed; text-decoration: none; }
        .reader-bread-link:hover { text-decoration: underline; }
        .reader-bread-sep { color: #2a2e42; }
        .reader-inline-nav {
          display: flex; align-items: center; justify-content: space-between;
          gap: 10px; margin-top: 14px;
        }

        .reader-main { background: #0d0e14; min-height: 100vh; }
        .reader-pages { max-width: 800px; margin: 0 auto; }
        .page-img { width: 100%; display: block; opacity: 0; transition: opacity .35s; }
        .page-img.loaded { opacity: 1; }
        .page-error {
          width: 100%; min-height: 100px; background: #111420;
          display: flex; align-items: center; justify-content: center;
          color: #2a2e42; font-size: 12px;
        }

        .reader-empty { padding: 80px 20px; text-align: center; color: #7a7f9a; }
        .reader-empty h2 { font-size: 18px; color: #e8eaf0; margin-bottom: 12px; }
        .reader-empty code {
          display: inline-block; background: #1a1d2e; padding: 6px 14px;
          border-radius: 4px; color: #7c3aed; font-size: 12px; margin: 8px 0; word-break: break-all;
        }

        .reader-bottom {
          max-width: 900px; margin: 0 auto;
          padding: 28px 16px 16px;
          display: flex; align-items: center; justify-content: space-between; gap: 10px;
        }

        .related-wrap {
          max-width: 900px; margin: 0 auto; padding: 0 16px 60px;
        }
        .related-head {
          background: linear-gradient(90deg, #7c3aed, #4f1fb5);
          padding: 10px 16px; border-radius: 8px 8px 0 0;
          font-size: 15px; font-weight: 800; color: #fff; margin-bottom: 0;
        }
        .related-grid {
          display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px;
          padding: 16px; background: #111420; border-radius: 0 0 8px 8px;
          border: 1px solid #1e2235; border-top: none;
        }
        .related-card { text-decoration: none; display: block; }
        .related-card:hover .related-cover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(124,58,237,.3); }
        .related-cover {
          width: 100%; aspect-ratio: 3/4; object-fit: cover;
          border-radius: 6px; display: block; transition: transform .2s, box-shadow .2s;
          background: #1a1d2e;
        }
        .related-cover-ph {
          width: 100%; aspect-ratio: 3/4; border-radius: 6px;
          background: #1a1d2e; display: flex; align-items: center; justify-content: center;
          font-size: 20px; font-weight: 800; color: rgba(255,255,255,.2);
          transition: transform .2s;
        }
        .related-title {
          font-size: 12px; font-weight: 600; color: #e8eaf0;
          margin-top: 6px; line-height: 1.3;
          display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
        }
        .related-ch { font-size: 11px; color: #7a7f9a; margin-top: 2px; }

        .back-top {
          position: fixed; bottom: 24px; right: 18px; z-index: 200;
          width: 42px; height: 42px; border-radius: 50%;
          background: #7c3aed; color: #fff; border: none;
          font-size: 18px; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 20px rgba(124,58,237,.5);
          opacity: 0; pointer-events: none; transform: translateY(10px);
          transition: opacity .25s, transform .25s;
        }
        .back-top.visible { opacity: 1; pointer-events: auto; transform: translateY(0); }
        .back-top:hover { background: #6d28d9; }

        @media (max-width: 680px) {
          .ch-back { display: none; }
          .reader-bar-inner { padding: 8px 12px; }
          .ch-btn { padding: 6px 12px; font-size: 12px; }
          .ch-select { font-size: 12px; padding: 6px 28px 6px 10px; min-width: 110px; }
          .related-grid { grid-template-columns: repeat(3, 1fr); gap: 8px; padding: 12px; }
          .reader-bottom { justify-content: center; }
        }

        @media (max-width: 400px) {
          .related-grid { grid-template-columns: repeat(2, 1fr); }
          .ch-btn span { display: none; }
        }
      `}</style>

      <div className="reader-main">
        <div className="reader-header">
          <h1 className="reader-h1">{series.title} Chapter {chapter.num}{chapter.title ? ` — ${chapter.title}` : ''}</h1>
          <div className="reader-breadcrumb">
            <Link href="/" className="reader-bread-link">PanelVerse</Link>
            <span className="reader-bread-sep">›</span>
            <Link href={`/series/${series.slug}`} className="reader-bread-link">{series.title}</Link>
            <span className="reader-bread-sep">›</span>
            <span style={{ color: '#7a7f9a' }}>Chapter {chapter.num}</span>
          </div>

          <div className="reader-inline-nav">
            <select
              className="ch-select"
              value={chapter.num}
              onChange={e => router.push(`/series/${series.slug}/chapter/${e.target.value}`)}
            >
              {[...series.chapters].reverse().map(ch => (
                <option key={ch.num} value={ch.num}>
                  Chapter {ch.num}{ch.title ? ` — ${ch.title}` : ''}
                </option>
              ))}
            </select>
            <div className="ch-nav">
              {prev
                ? <Link href={`/series/${series.slug}/chapter/${prev.num}`} className="ch-btn ch-btn-prev">‹ Prev</Link>
                : <span className="ch-btn ch-btn-disabled">‹ Prev</span>
              }
              {next
                ? <Link href={`/series/${series.slug}/chapter/${next.num}`} className="ch-btn ch-btn-next">Next ›</Link>
                : <span className="ch-btn ch-btn-disabled">Next ›</span>
              }
            </div>
          </div>
        </div>

        <div className="reader-pages">
          {images.length === 0 ? (
            <div className="reader-empty">
              <h2>No pages yet</h2>
              <p>Add images to:</p>
              <code>public/images/{series.slug}/ch{String(chapter.num).padStart(2,'0')}/</code>
              <p style={{ marginTop: 8, fontSize: 13 }}>Named <code>000.webp</code>, <code>001.webp</code>...</p>
            </div>
          ) : (
            images.map((src, i) => (
              imgErrors[src]
                ? <div key={src} className="page-error">Failed to load</div>
                : <img
                    key={src}
                    src={src}
                    alt={`${series.title} Chapter ${chapter.num} Page ${i + 1}`}
                    className="page-img"
                    loading={i < 2 ? 'eager' : 'lazy'}
                    decoding="async"
                    onLoad={e => e.currentTarget.classList.add('loaded')}
                    onError={() => setImgErrors(e => ({ ...e, [src]: true }))}
                  />
            ))
          )}
        </div>

        <div className="reader-bottom">
          <select
            className="ch-select"
            value={chapter.num}
            onChange={e => router.push(`/series/${series.slug}/chapter/${e.target.value}`)}
          >
            {[...series.chapters].reverse().map(ch => (
              <option key={ch.num} value={ch.num}>
                Chapter {ch.num}{ch.title ? ` — ${ch.title}` : ''}
              </option>
            ))}
          </select>
          <div className="ch-nav">
            {prev
              ? <Link href={`/series/${series.slug}/chapter/${prev.num}`} className="ch-btn ch-btn-prev">‹ Prev</Link>
              : <span className="ch-btn ch-btn-disabled">‹ Prev</span>
            }
            {next
              ? <Link href={`/series/${series.slug}/chapter/${next.num}`} className="ch-btn ch-btn-next">Next ›</Link>
              : <span className="ch-btn ch-btn-disabled">Next ›</span>
            }
          </div>
        </div>

        {otherSeries.length > 0 && (
          <div className="related-wrap">
            <div className="related-head">Related Series</div>
            <div className="related-grid">
              {otherSeries.map(s => {
                const latest = s.chapters?.at(-1)
                return (
                  <Link key={s.slug} href={`/series/${s.slug}`} className="related-card">
                    {s.cover
                      ? <img src={s.cover} alt={s.title} className="related-cover" loading="lazy" />
                      : <div className="related-cover-ph">{s.title.slice(0,2).toUpperCase()}</div>
                    }
                    <div className="related-title">{s.title}</div>
                    {latest && <div className="related-ch">Ch. {latest.num}</div>}
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </div>

      <button
        className={`back-top${showTop ? ' visible' : ''}`}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        title="Back to top"
      >↑</button>
    </>
  )
}

export async function getStaticPaths() {
  return { paths: getAllChapterPaths(), fallback: false }
}

export async function getStaticProps({ params }) {
  const data = getChapter(params.slug, params.chapterNum)
  if (!data) return { notFound: true }
  const relatedSeries = getAllSeries()
  return { props: { data, relatedSeries } }
}