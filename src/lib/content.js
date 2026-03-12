/**
 * lib/content.js
 *
 * The ONLY file that touches the filesystem.
 * Every page imports from here — never reads files directly.
 *
 * Key idea: this runs at BUILD TIME only (getStaticProps / getStaticPaths).
 * Users never hit the filesystem. They get pre-built HTML from the CDN.
 */

import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const SERIES_DIR = path.join(process.cwd(), 'content/series')
const R2_BASE_URL = 'https://pub-e13b23f611944371985db7aa97d5341c.r2.dev'

// ─────────────────────────────────────────────
// Get all series slugs  (used by getStaticPaths)
// ─────────────────────────────────────────────
export function getAllSeriesSlugs() {
  return fs.readdirSync(SERIES_DIR).filter((name) => {
    return fs.statSync(path.join(SERIES_DIR, name)).isDirectory()
  })
}

// ─────────────────────────────────────────────
// Get one series + its chapters
// ─────────────────────────────────────────────
export function getSeries(slug) {
  const indexPath = path.join(SERIES_DIR, slug, 'index.md')
  const raw = fs.readFileSync(indexPath, 'utf8')
  const { data } = matter(raw)

  // Sort chapters ascending by num
  const chapters = (data.chapters || []).sort((a, b) => a.num - b.num)

  return {
    ...data,
    slug,
    chapters,
  }
}

// ─────────────────────────────────────────────
// Get ALL series (for homepage grid / latest)
// ─────────────────────────────────────────────
export function getAllSeries() {
  const slugs = getAllSeriesSlugs()
  return slugs.map((slug) => getSeries(slug))
}

// ─────────────────────────────────────────────
// Get all chapter paths for getStaticPaths
// ─────────────────────────────────────────────
export function getAllChapterPaths() {
  const slugs = getAllSeriesSlugs()
  const paths = []
  for (const slug of slugs) {
    const series = getSeries(slug)
    for (const ch of series.chapters) {
      paths.push({ params: { slug, chapterNum: String(ch.num) } })
    }
  }
  return paths
}

// ─────────────────────────────────────────────
// Get a single chapter with all data needed by the reader
// ─────────────────────────────────────────────
export function getChapter(slug, chapterNum) {
  const series = getSeries(slug)
  const num = Number(chapterNum)
  const chapter = series.chapters.find(c => c.num === num)
  if (!chapter) return null
  const images = getChapterPages(slug, num)
  const idx = series.chapters.findIndex(c => c.num === num)
  const prev = idx > 0 ? series.chapters[idx - 1] : null
  const next = idx < series.chapters.length - 1 ? series.chapters[idx + 1] : null
  return { series, chapter, images, prev, next }
}

// ─────────────────────────────────────────────
// Format date helper
// ─────────────────────────────────────────────
export function formatDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// ─────────────────────────────────────────────
// Get featured series for hero banner
// ─────────────────────────────────────────────
export function getFeaturedSeries() {
  return getAllSeries().filter((s) => s.featured === true)
}

// ─────────────────────────────────────────────
// Get latest updated chapters across all series
// Returns array of { seriesTitle, seriesSlug, cover, num, title, date }
// ─────────────────────────────────────────────
export function getLatestChapters(limit = 12) {
  const all = getAllSeries()

  const flat = all.flatMap((s) =>
    (s.chapters || []).map((ch) => ({
      seriesTitle: s.title,
      seriesSlug: s.slug,
      cover: s.cover,
      genres: s.genres || [],
      num: ch.num,
      title: ch.title || null,
      date: ch.date,
    }))
  )

  // Keep only the latest chapter per series, then sort by date descending
  const latestPerSeries = Object.values(
    flat.reduce((acc, ch) => {
      const existing = acc[ch.seriesSlug]
      if (!existing) {
        acc[ch.seriesSlug] = ch
      } else {
        const dateDiff = new Date(ch.date) - new Date(existing.date)
        // If same date, pick highest chapter number
        if (dateDiff > 0 || (dateDiff === 0 && ch.num > existing.num)) {
          acc[ch.seriesSlug] = ch
        }
      }
      return acc
    }, {})
  )

  return latestPerSeries
    .sort((a, b) => {
      const dateDiff = new Date(b.date) - new Date(a.date)
      if (dateDiff !== 0) return dateDiff
      return b.num - a.num // same date → highest chapter first
    })
    .slice(0, limit)
}

// ─────────────────────────────────────────────
// Get one chapter's page image list
// Serves images from Cloudflare R2
// e.g. https://pub-xxx.r2.dev/solo-leveling/ch001/001.webp
// ─────────────────────────────────────────────
export function getChapterPages(slug, num) {
  const paddedNum = String(num).padStart(3, '0')
  const chapterKey = `ch${paddedNum}`

  // Read page count from index.md chapters data
  const series = getSeries(slug)
  const chapter = series.chapters.find(c => c.num === Number(num))
  if (!chapter || !chapter.pages) return []

  return Array.from({ length: chapter.pages }, (_, i) => {
    const page = String(i + 1).padStart(3, '0')
    return `${R2_BASE_URL}/${slug}/${chapterKey}/${page}.webp`
  })
}

// ─────────────────────────────────────────────
// Helper: get prev/next chapter numbers for a series
// ─────────────────────────────────────────────
export function getAdjacentChapters(slug, currentNum) {
  const series = getSeries(slug)
  const nums = series.chapters.map((c) => c.num)
  const idx = nums.indexOf(Number(currentNum))
  return {
    prev: idx > 0 ? nums[idx - 1] : null,
    next: idx < nums.length - 1 ? nums[idx + 1] : null,
  }
}

// ─────────────────────────────────────────────
// Relative time helper  ("2 hours ago", "Yesterday")
// ─────────────────────────────────────────────
export function timeAgo(dateStr) {
  if (typeof window === 'undefined') return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}