import Head from 'next/head'
import SeriesCard from '../../components/SeriesCard'
import { getAllSeries } from '../../lib/content'

export default function SeriesIndex({ allSeries }) {
  return (
    <>
      <Head>
        <title>All Series — PanelVerse</title>
      </Head>
      <div className="container">
        <div className="section">
          <div className="section-head">
            <div className="section-title">All Series ({allSeries.length})</div>
          </div>
          {allSeries.length > 0 ? (
            <div className="series-grid">
              {allSeries.map(s => <SeriesCard key={s.slug} series={s} />)}
            </div>
          ) : (
            <p style={{ color: 'var(--muted)' }}>No series yet.</p>
          )}
        </div>
      </div>
    </>
  )
}

export async function getStaticProps() {
  return { props: { allSeries: getAllSeries() } }
}
