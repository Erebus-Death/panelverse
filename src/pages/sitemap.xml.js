// src/pages/sitemap.xml.js
// Generates /sitemap.xml dynamically at build time
// Includes all series pages + all chapter pages

import { getAllSeries } from '../lib/content'

const SITE_URL = 'https://www.thepanelverse.com'

function generateSitemap(allSeries) {
  const staticPages = [
    { url: SITE_URL, priority: '1.0', changefreq: 'daily' },
    { url: `${SITE_URL}/series`, priority: '0.9', changefreq: 'daily' },
    { url: `${SITE_URL}/latest`, priority: '0.9', changefreq: 'daily' },
  ]

  const seriesPages = allSeries.map(s => ({
    url: `${SITE_URL}/series/${s.slug}`,
    priority: '0.8',
    changefreq: 'weekly',
  }))

  const chapterPages = allSeries.flatMap(s =>
    (s.chapters || []).map(ch => ({
      url: `${SITE_URL}/series/${s.slug}/chapter/${ch.num}`,
      priority: '0.6',
      changefreq: 'monthly',
    }))
  )

  const allPages = [...staticPages, ...seriesPages, ...chapterPages]

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages.map(p => `  <url>
    <loc>${p.url}</loc>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`).join('\n')}
</urlset>`
}

export default function Sitemap() {
  return null
}

export async function getServerSideProps({ res }) {
  const allSeries = getAllSeries()
  const sitemap = generateSitemap(allSeries)

  res.setHeader('Content-Type', 'text/xml')
  res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate')
  res.write(sitemap)
  res.end()

  return { props: {} }
}