// src/pages/series/[slug]/chapter/[chapterNum].js
// URL: /series/overpowered-hero/chapter/1
//
// THE READER. This single template handles every chapter of every series.
// Images are lazy-loaded. Keyboard left/right arrow navigation works.
// Prev/Next chapter buttons auto-populate from chapter list in index.md.

import { useEffect, useCallback } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { getAllChapterPaths, getChapter, formatDate } from '../../../../lib/content'

export default function ChapterReader({ data }) {
  const router = useRouter()

  if (!data) {
    return (
      <div className="container" style={{ padding: '60px 20px', color: 'var(--muted)' }}>
        Chapter not found.
      </div>
    )
  }

  const { series, chapter, images, prev, next } = data

  // ── Keyboard navigation (← →) ──────────────────────────────────────────────
  const handleKey = useCallback((e) => {
    if (e.key === 'ArrowLeft'  && prev) router.push(`/series/${series.slug}/chapter/${prev.num}`)
    if (e.key === 'ArrowRight' && next) router.push(`/series/${series.slug}/chapter/${next.num}`)
  }, [prev, next, router, series.slug])

  useEffect(() => {
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [handleKey])

  return (
    <>
      <Head>
        <title>{series.title} — Chapter {chapter.num}{chapter.title ? `: ${chapter.title}` : ''} | PanelVerse</title>
        <meta name="description" content={`Read ${series.title} Chapter ${chapter.num} online free on PanelVerse.`} />
        {/* Prevent search engines from indexing every chapter page if you want */}
        {/* <meta name="robots" content="noindex" /> */}
      </Head>

      {/* ── TOP BAR ────────────────────────────────────────────────────────── */}
      <div style={styles.topBar}>
        <div style={styles.topBarInner}>

          {/* Breadcrumb */}
          <div style={styles.breadcrumb}>
            <Link href="/" style={styles.breadLink}>Home</Link>
            <span style={styles.sep}>›</span>
            <Link href={`/series/${series.slug}`} style={styles.breadLink}>{series.title}</Link>
            <span style={styles.sep}>›</span>
            <span style={{ color: 'var(--text)' }}>Chapter {chapter.num}</span>
          </div>

          {/* Chapter selector + prev/next */}
          <div style={styles.navGroup}>
            {prev ? (
              <Link href={`/series/${series.slug}/chapter/${prev.num}`} className="btn btn-ghost" style={styles.navBtn}>
                ← Ch. {prev.num}
              </Link>
            ) : (
              <button className="btn btn-ghost" style={{...styles.navBtn, opacity:.4}} disabled>← Prev</button>
            )}

            <Link href={`/series/${series.slug}`} className="btn btn-ghost" style={styles.navBtn}>
              ☰ Chapters
            </Link>

            {next ? (
              <Link href={`/series/${series.slug}/chapter/${next.num}`} className="btn btn-ghost" style={styles.navBtn}>
                Ch. {next.num} →
              </Link>
            ) : (
              <button className="btn btn-ghost" style={{...styles.navBtn, opacity:.4}} disabled>Next →</button>
            )}
          </div>
        </div>
      </div>

      {/* ── CHAPTER TITLE ──────────────────────────────────────────────────── */}
      <div style={styles.chapterHead}>
        <h1 style={styles.chapterTitle}>
          Chapter {chapter.num}{chapter.title ? `: ${chapter.title}` : ''}
        </h1>
        <div style={styles.chapterMeta}>
          <span>{series.title}</span>
          {chapter.date && <span>· {formatDate(chapter.date)}</span>}
          {chapter.pages && <span>· {chapter.pages} pages</span>}
          <span style={{ color: 'var(--muted)', fontSize: '11px' }}>
            (Use ← → arrow keys to navigate chapters)
          </span>
        </div>
      </div>

      {/* ── IMAGE READER ───────────────────────────────────────────────────── */}
      <div style={styles.reader}>
        {images.length > 0 ? (
          images.map((src, i) => (
            <div key={src} style={styles.pageWrap}>
              <Image
                src={src}
                alt={`Page ${i + 1}`}
                width={800}
                height={1200}
                style={styles.page}
                // Only load the first 3 pages eagerly, rest are lazy
                loading={i < 3 ? 'eager' : 'lazy'}
                priority={i === 0}
                sizes="(max-width: 768px) 100vw, 800px"
              />
              <div style={styles.pageNum}>{i + 1} / {images.length}</div>
            </div>
          ))
        ) : (
          // ── PLACEHOLDER when no images uploaded yet ──────────────────────
          <div style={styles.noImages}>
            <div style={styles.noImagesBox}>
              <div style={{ fontSize: '40px', marginBottom: '16px' }}>📁</div>
              <h3 style={{ marginBottom: '8px' }}>Images not uploaded yet</h3>
              <p style={{ color: 'var(--muted)', fontSize: '13px', lineHeight: 1.6 }}>
                Add chapter images to:<br />
                <code style={styles.code}>
                  public/images/{series.slug}/ch{String(chapter.num).padStart(2,'0')}/001.jpg
                </code>
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ── BOTTOM NAVIGATION ──────────────────────────────────────────────── */}
      <div style={styles.bottomNav}>
        <div style={styles.topBarInner}>
          {prev ? (
            <Link href={`/series/${series.slug}/chapter/${prev.num}`} className="btn btn-ghost">
              ← Chapter {prev.num}
            </Link>
          ) : <span />}

          <Link href={`/series/${series.slug}`} className="btn btn-ghost">
            ↑ Series Page
          </Link>

          {next ? (
            <Link href={`/series/${series.slug}/chapter/${next.num}`} className="btn">
              Chapter {next.num} →
            </Link>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <p style={{ color: 'var(--muted)', fontSize: '12px', marginBottom: '10px' }}>
                You&apos;re up to date! No more chapters yet.
              </p>
              <Link href={`/series/${series.slug}`} className="btn btn-ghost">
                Back to Series
              </Link>
            </div>
          )}
        </div>
      </div>

    </>
  )
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = {
  topBar: {
    background: 'var(--surface)',
    borderBottom: '1px solid var(--border)',
    position: 'sticky', top: '54px', zIndex: 90,
  },
  topBarInner: {
    maxWidth: '860px', margin: '0 auto', padding: '0 20px',
    display: 'flex', alignItems: 'center',
    justifyContent: 'space-between', gap: '12px',
    flexWrap: 'wrap', minHeight: '50px',
  },
  breadcrumb: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--muted)', flexWrap: 'wrap' },
  breadLink: { color: 'var(--muted)', transition: 'color .2s' },
  sep: { color: 'var(--border)' },
  navGroup: { display: 'flex', gap: '6px', alignItems: 'center' },
  navBtn: { padding: '6px 12px', fontSize: '12px' },

  chapterHead: {
    maxWidth: '860px', margin: '0 auto', padding: '20px 20px 12px',
  },
  chapterTitle: { fontSize: '18px', fontWeight: 700, marginBottom: '6px' },
  chapterMeta: { display: 'flex', gap: '8px', flexWrap: 'wrap', fontSize: '12px', color: 'var(--muted)' },

  reader: {
    maxWidth: '860px', margin: '0 auto', padding: '0 0 40px',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px',
  },
  pageWrap: { position: 'relative', width: '100%', maxWidth: '800px' },
  page: { width: '100%', height: 'auto', display: 'block' },
  pageNum: {
    position: 'absolute', bottom: '8px', right: '12px',
    background: 'rgba(0,0,0,.65)', color: '#ccc',
    fontSize: '11px', padding: '2px 8px', borderRadius: '3px',
  },

  noImages: {
    width: '100%', padding: '60px 20px',
    display: 'flex', justifyContent: 'center',
  },
  noImagesBox: {
    background: 'var(--surface)', border: '1px solid var(--border)',
    borderRadius: '8px', padding: '40px', textAlign: 'center', maxWidth: '420px',
  },
  code: {
    display: 'block', marginTop: '10px',
    background: 'var(--surface2)', padding: '8px 12px', borderRadius: '4px',
    fontSize: '11px', color: 'var(--accent)', wordBreak: 'break-all',
  },

  bottomNav: {
    background: 'var(--surface)', borderTop: '1px solid var(--border)', padding: '16px 0',
  },
}

// ── Static generation ─────────────────────────────────────────────────────────
export async function getStaticPaths() {
  return {
    paths: getAllChapterPaths(),
    fallback: false,
  }
}

export async function getStaticProps({ params }) {
  const data = getChapter(params.slug, params.chapterNum)
  if (!data) return { notFound: true }
  return { props: { data } }
}
