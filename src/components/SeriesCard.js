import Link from 'next/link'

export default function SeriesCard({ series }) {
  const { slug, title, cover, status, genres = [], chapters = [] } = series
  const latestCh = chapters.at(-1)

  return (
    <Link href={`/series/${slug}`} className="series-card">
      <div className="card-cover">
        {cover ? (
          <img
            src={cover}
            alt={title}
            style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }}
          />
        ) : (
          <div className="card-cover-ph" style={{ background: slugToColor(slug) }}>
            {initials(title)}
          </div>
        )}
        <span className={`card-status status-${status}`}>
          {status === 'ongoing' ? 'Ongoing' : status === 'hiatus' ? 'Hiatus' : 'Completed'}
        </span>
        {latestCh && <div className="card-ch">Ch. {latestCh.num}</div>}
      </div>
      <div className="card-body">
        <div className="card-title">{title}</div>
        <div className="card-tags">
          {genres.slice(0, 2).map(g => (
            <span key={g} className="card-tag">{g}</span>
          ))}
        </div>
      </div>
    </Link>
  )
}

function initials(title) {
  return title.split(' ').filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('')
}

function slugToColor(slug) {
  const colors = [
    'linear-gradient(160deg,#1a0010,#600030,#ff2055)',
    'linear-gradient(160deg,#00102a,#003088,#0a84ff)',
    'linear-gradient(160deg,#1a1200,#604000,#ffd60a)',
    'linear-gradient(160deg,#001a0a,#006633,#00cc55)',
    'linear-gradient(160deg,#0a0a1a,#303070,#8888ff)',
    'linear-gradient(160deg,#1a0a00,#603000,#ff8800)',
  ]
  let hash = 0
  for (const c of slug) hash = (hash * 31 + c.charCodeAt(0)) & 0xffffffff
  return colors[Math.abs(hash) % colors.length]
}
