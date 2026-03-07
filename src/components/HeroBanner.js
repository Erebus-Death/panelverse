import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'

export default function HeroBanner({ series }) {
  const [current, setCurrent] = useState(0)
  const [fade, setFade] = useState(true)
  const touchStartX = useRef(null)
  const touchEndX = useRef(null)

  useEffect(() => {
    const timer = setInterval(() => {
      goTo((current + 1) % series.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [current, series.length])

  function goTo(n) {
    setFade(false)
    setTimeout(() => { setCurrent(n); setFade(true) }, 200)
  }

  function handleTouchStart(e) { touchStartX.current = e.changedTouches[0].clientX; touchEndX.current = null }
  function handleTouchMove(e)  { touchEndX.current = e.changedTouches[0].clientX }
  function handleTouchEnd() {
    if (!touchStartX.current || !touchEndX.current) return
    const diff = touchStartX.current - touchEndX.current
    if (Math.abs(diff) < 50) return
    diff > 0 ? goTo((current + 1) % series.length) : goTo((current - 1 + series.length) % series.length)
    touchStartX.current = null; touchEndX.current = null
  }

  if (!series || series.length === 0) return null
  const s = series[current]
  const firstChapter = s.chapters?.[0]
  const latestChapter = s.chapters?.at(-1)

  return (
    <>
      <style>{`
        .hero-wrapper {
          position: relative; overflow: hidden;
          background: #0f1117; border-bottom: 1px solid #2a2e42;
          min-height: 260px; user-select: none; -webkit-user-select: none;
        }
        .hero-bg {
          position: absolute; inset: 0; background-size: cover;
          background-position: center top;
          filter: blur(40px) brightness(0.3) saturate(0.8); transform: scale(1.1);
        }
        .hero-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(90deg, rgba(15,17,23,0.75) 0%, rgba(15,17,23,0.2) 100%);
        }
        .hero-content {
          position: relative; z-index: 2; max-width: 1280px; margin: 0 auto;
          padding: 32px 40px; display: flex; align-items: center;
          justify-content: space-between; gap: 32px;
        }
        .hero-left { flex: 1; min-width: 0; }
        .hero-right { flex-shrink: 0; }
        .hero-cover { width: 150px; height: 212px; object-fit: cover; border-radius: 6px; box-shadow: 0 8px 32px rgba(0,0,0,0.7); pointer-events: none; }
        .hero-rating { display: inline-flex; align-items: center; gap: 4px; background: #f59e0b; border-radius: 8px; padding: 4px 10px; margin-bottom: 10px; }
        .hero-rating-star { font-size: 15px; color: #fff; }
        .hero-rating-num  { font-size: 15px; font-weight: 800; color: #fff; }
        .hero-type { font-size: 11px; font-weight: 700; letter-spacing: 1px; color: #e8462a; margin-bottom: 6px; text-transform: uppercase; }
        .hero-title { font-size: clamp(16px, 2.5vw, 24px); font-weight: 700; line-height: 1.2; color: #fff; margin-bottom: 8px; }
        .hero-genres { font-size: 13px; color: rgba(255,255,255,0.65); margin-bottom: 10px; }
        .hero-summary-label { font-size: 11px; font-weight: 700; letter-spacing: 1px; color: #fff; margin-bottom: 5px; }
        .hero-desc { font-size: 13px; color: rgba(255,255,255,0.6); line-height: 1.7; margin-bottom: 10px; max-width: 560px; }
        .hero-status { font-size: 13px; color: rgba(255,255,255,0.6); margin-bottom: 18px; }
        .hero-buttons { display: flex; gap: 10px; flex-wrap: wrap; }
        .hero-btn-primary { background: #e8462a; color: #fff; padding: 8px 18px; border-radius: 6px; font-size: 13px; font-weight: 600; text-decoration: none; white-space: nowrap; }
        .hero-btn-ghost { background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: #fff; padding: 8px 18px; border-radius: 6px; font-size: 13px; font-weight: 600; text-decoration: none; white-space: nowrap; }
        .hero-dots { position: absolute; bottom: 12px; left: 50%; transform: translateX(-50%); display: flex; gap: 6px; z-index: 10; }
        .hero-dot { width: 8px; height: 8px; border-radius: 50%; border: none; cursor: pointer; padding: 0; transition: background .2s, transform .2s; }
        .hero-swipe-hint { display: none; position: absolute; bottom: 30px; right: 16px; font-size: 10px; color: rgba(255,255,255,0.3); z-index: 10; letter-spacing: 0.5px; }
        @media (max-width: 768px) {
          .hero-content { padding: 24px 20px; gap: 20px; }
          .hero-cover { width: 120px; height: 170px; }
          .hero-desc { display: none; }
          .hero-summary-label { display: none; }
          .hero-swipe-hint { display: block; }
        }
        @media (max-width: 480px) {
          .hero-content { padding: 20px 16px; }
          .hero-cover { width: 90px; height: 128px; }
          .hero-title { font-size: 15px; }
          .hero-genres { font-size: 12px; margin-bottom: 8px; }
          .hero-status { display: none; }
          .hero-btn-primary, .hero-btn-ghost { padding: 7px 14px; font-size: 12px; }
          .hero-rating { padding: 3px 8px; }
          .hero-rating-num { font-size: 13px; }
        }
      `}</style>

      <div className="hero-wrapper" onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
        {s.cover && <div className="hero-bg" style={{ backgroundImage: `url(${s.cover})` }} />}
        <div className="hero-overlay" />

        <div className="hero-content" style={{ opacity: fade ? 1 : 0, transition: 'opacity 0.25s ease' }}>
          <div className="hero-left">
            {s.rating && (
              <div className="hero-rating">
                <span className="hero-rating-star">★</span>
                <span className="hero-rating-num">{s.rating}</span>
              </div>
            )}
            <div className="hero-type">{s.type?.toUpperCase() || 'MANHWA'}</div>
            <h2 className="hero-title">{s.title}</h2>
            {s.genres?.length > 0 && <div className="hero-genres">{s.genres.join(', ')}</div>}
            {s.description && (
              <>
                <div className="hero-summary-label">SUMMARY</div>
                <p className="hero-desc">{s.description.length > 160 ? s.description.slice(0, 160) + '...' : s.description}</p>
              </>
            )}
            <div className="hero-status">
              Status:{' '}
              <strong style={{ color: s.status === 'ongoing' ? '#22c55e' : '#3b82f6', marginLeft: 4 }}>
                {s.status === 'ongoing' ? 'Ongoing' : 'Completed'}
              </strong>
            </div>
            <div className="hero-buttons">
              {firstChapter && <Link href={`/series/${s.slug}/chapter/${firstChapter.num}`} className="hero-btn-primary">▶ Start Reading</Link>}
              {latestChapter && latestChapter.num !== firstChapter?.num && <Link href={`/series/${s.slug}/chapter/${latestChapter.num}`} className="hero-btn-ghost">Latest: Ch. {latestChapter.num}</Link>}
              <Link href={`/series/${s.slug}`} className="hero-btn-ghost">Details</Link>
            </div>
          </div>
          <div className="hero-right">
            {s.cover && <img src={s.cover} alt={s.title} className="hero-cover" />}
          </div>
        </div>

        <div className="hero-swipe-hint">← swipe →</div>
        <div className="hero-dots">
          {series.map((_, i) => (
            <button key={i} onClick={() => goTo(i)} className="hero-dot"
              style={{ background: i === current ? '#fff' : 'rgba(255,255,255,0.3)', transform: i === current ? 'scale(1.3)' : 'scale(1)' }}
              aria-label={`Slide ${i + 1}`} />
          ))}
        </div>
      </div>
    </>
  )
}
