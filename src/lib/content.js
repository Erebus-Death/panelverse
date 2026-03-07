import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const CONTENT_DIR = path.join(process.cwd(), 'content/series')

export function getAllSeriesSlugs() {
  if (!fs.existsSync(CONTENT_DIR)) return []
  return fs.readdirSync(CONTENT_DIR).filter(name => {
    return fs.statSync(path.join(CONTENT_DIR, name)).isDirectory()
  })
}

export function getSeries(slug) {
  const filePath = path.join(CONTENT_DIR, slug, 'index.md')
  if (!fs.existsSync(filePath)) return null
  const { data } = matter(fs.readFileSync(filePath, 'utf8'))
  const chapters = (data.chapters || []).sort((a, b) => a.num - b.num)
  return { ...data, slug, chapters }
}

export function getAllSeries() {
  return getAllSeriesSlugs()
    .map(slug => getSeries(slug))
    .filter(Boolean)
    .sort((a, b) => {
      const aLast = a.chapters.at(-1)?.date || ''
      const bLast = b.chapters.at(-1)?.date || ''
      return bLast.localeCompare(aLast)
    })
}

export function getLatestUpdates(limit = 12) {
  const updates = []
  for (const series of getAllSeries()) {
    const latestCh = series.chapters.at(-1)
    if (!latestCh) continue
    updates.push({
      seriesTitle: series.title,
      seriesSlug: series.slug,
      cover: series.cover || null,
      chapterNum: latestCh.num,
      chapterTitle: latestCh.title || '',
      date: latestCh.date,
    })
  }
  return updates
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, limit)
}

export function getChapter(slug, chapterNum) {
  const series = getSeries(slug)
  if (!series) return null

  const chapter = series.chapters.find(ch => ch.num === Number(chapterNum))
  if (!chapter) return null

  const sorted = series.chapters
  const idx = sorted.findIndex(ch => ch.num === Number(chapterNum))
  const prev = idx > 0 ? sorted[idx - 1] : null
  const next = idx < sorted.length - 1 ? sorted[idx + 1] : null

  const padded = String(chapterNum).padStart(2, '0')
  const imageDir = path.join(process.cwd(), 'public', 'images', slug, `ch${padded}`)

  let images = []
  if (fs.existsSync(imageDir)) {
    images = fs.readdirSync(imageDir)
      .filter(f => /\.(jpe?g|png|webp|avif)$/i.test(f))
      .sort()
      .map(f => `/images/${slug}/ch${padded}/${f}`)
  }

  return { series, chapter, images, prev, next }
}

export function getAllChapterPaths() {
  const paths = []
  for (const slug of getAllSeriesSlugs()) {
    const series = getSeries(slug)
    if (!series) continue
    for (const ch of series.chapters) {
      paths.push({ params: { slug, chapterNum: String(ch.num) } })
    }
  }
  return paths
}

export function formatDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric'
  })
}

export function timeAgo(dateStr) {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (hours < 1) return 'Just now'
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return formatDate(dateStr)
}
