import Head from 'next/head'
import { useRouter } from 'next/router'
import SeriesCard from '../../components/SeriesCard'
import { getAllSeries } from '../../lib/content'

const PER_PAGE = 24

export default function SeriesIndex({ allSeries, totalPages, currentPage }) {
  const router = useRouter()

  function goToPage(page) {
    router.push(page === 1 ? '/series' : `/series?page=${page}`)
  }

  return (
    <>
      <Head>
        <title>{currentPage > 1 ? `All Series — Page ${currentPage} — PanelVerse` : 'All Series — PanelVerse'}</title>
        {currentPage > 1 && <meta name="robots" content="noindex" />}
      </Head>
      <div className="container">
        <div className="section">
          <div className="section-head">
            <div className="section-title">All Series</div>
            <div style={{ fontSize: '13px', color: 'var(--muted)' }}>
              Page {currentPage} of {totalPages}
            </div>
          </div>

          {allSeries.length > 0 ? (
            <div className="series-grid">
              {allSeries.map(s => <SeriesCard key={s.slug} series={s} />)}
            </div>
          ) : (
            <p style={{ color: 'var(--muted)' }}>No series yet.</p>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: '8px', marginTop: '48px', flexWrap: 'wrap'
            }}>
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                style={{
                  padding: '8px 16px', borderRadius: '6px', border: '1px solid var(--border)',
                  background: currentPage === 1 ? 'transparent' : 'var(--card)',
                  color: currentPage === 1 ? 'var(--muted)' : 'var(--text)',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  fontSize: '14px', opacity: currentPage === 1 ? 0.4 : 1
                }}
              >
                ← Prev
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
                const isActive = page === currentPage
                const show = page === 1 || page === totalPages || Math.abs(page - currentPage) <= 2
                const showEllipsisBefore = page === currentPage - 3
                const showEllipsisAfter = page === currentPage + 3

                if (showEllipsisBefore || showEllipsisAfter) {
                  return <span key={page} style={{ color: 'var(--muted)', padding: '0 4px' }}>…</span>
                }
                if (!show) return null

                return (
                  <button
                    key={page}
                    onClick={() => goToPage(page)}
                    style={{
                      width: '36px', height: '36px', borderRadius: '6px',
                      border: isActive ? '1px solid var(--accent)' : '1px solid var(--border)',
                      background: isActive ? 'var(--accent)' : 'var(--card)',
                      color: isActive ? '#fff' : 'var(--text)',
                      cursor: 'pointer', fontSize: '14px', fontWeight: isActive ? '700' : '400'
                    }}
                  >
                    {page}
                  </button>
                )
              })}

              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                style={{
                  padding: '8px 16px', borderRadius: '6px', border: '1px solid var(--border)',
                  background: currentPage === totalPages ? 'transparent' : 'var(--card)',
                  color: currentPage === totalPages ? 'var(--muted)' : 'var(--text)',
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                  fontSize: '14px', opacity: currentPage === totalPages ? 0.4 : 1
                }}
              >
                Next →
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export async function getServerSideProps({ query }) {
  const all = getAllSeries()
  const currentPage = Math.max(1, parseInt(query.page) || 1)
  const totalPages = Math.ceil(all.length / PER_PAGE)
  const start = (currentPage - 1) * PER_PAGE
  const allSeries = all.slice(start, start + PER_PAGE)
  return { props: { allSeries, totalPages, currentPage } }
}