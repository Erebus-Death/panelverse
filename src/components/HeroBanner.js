import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'

export default function HeroBanner({ series }) {
  const [current, setCurrent] = useState(0)
  const [fade, setFade] = useState(true)
  const touchStartX = useRef(null)
  const touchEndX = useRef(null)

  useEffect(() => {
    const timer = setInterval(() => goTo((current + 1) % series.length), 5000)
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
          background: #0d0e14;
          min-height: 450px; user-select: none; -webkit-user-select: none;
        }
        .hero-bg {
          position: absolute; inset: 0; background-size: cover;
          background-position: center top;
          filter: blur(40px) brightness(0.25) saturate(1.2); transform: scale(1.1);
        }
        .hero-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(105deg, rgba(13,14,20,0.92) 0%, rgba(13,14,20,0.6) 55%, rgba(13,14,20,0.15) 100%);
        }
        .hero-content {
          position: relative; z-index: 2; max-width: 1280px; margin: 0 auto;
          padding: 48px 40px; display: flex; align-items: center;
          justify-content: space-between; gap: 32px; min-height: 450px;
        }
        .hero-left { flex: 1; min-width: 0; }
        .hero-right { flex-shrink: 0; }

        /* Cover */
        .hero-cover {
          width: 200px; height: 285px; object-fit: cover;
          border-radius: 10px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.06);
          pointer-events: none; display: block;
        }
        .hero-cover-ph {
          width: 200px; height: 285px; border-radius: 10px;
          background: #1a1d2e; display: flex; align-items: center;
          justify-content: center; font-size: 48px; font-weight: 800;
          color: rgba(255,255,255,.15);
          box-shadow: 0 20px 60px rgba(0,0,0,0.8);
        }

        /* Type label */
        .hero-type {
          font-size: 11px; font-weight: 700; letter-spacing: 1.5px;
          color: #7c3aed; margin-bottom: 8px; text-transform: uppercase;
        }

        .hero-title {
          font-size: clamp(20px, 3vw, 32px); font-weight: 800;
          line-height: 1.15; color: #fff; margin-bottom: 8px;
        }
        .hero-rating-genres {
          display: flex; align-items: center; gap: 8px;
          flex-wrap: wrap; margin-bottom: 14px;
        }
        .hero-rating {
          display: inline-flex; align-items: center; gap: 3px; flex-shrink: 0;
        }
        .hero-rating-star { font-size: 13px; color: #f59e0b; }
        .hero-rating-num  { font-size: 13px; font-weight: 700; color: #f59e0b; }
        .hero-genres {
          font-size: 13px; color: rgba(255,255,255,0.45); line-height: 1.5;
        }

        /* Description */
        .hero-desc {
          font-size: 13px; color: rgba(255,255,255,0.6);
          line-height: 1.7; margin-bottom: 10px; max-width: 520px;
        }

        /* Status */
        .hero-status { font-size: 13px; color: rgba(255,255,255,0.5); margin-bottom: 20px; }

        /* Buttons */
        .hero-buttons { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; }
        .hero-btn-primary {
          background: #7c3aed; color: #fff;
          padding: 10px 22px; border-radius: 25px;
          font-size: 14px; font-weight: 700; text-decoration: none;
          display: inline-flex; align-items: center; gap: 6px;
          transition: background .2s, transform .15s;
          box-shadow: 0 4px 20px rgba(124,58,237,.4);
        }
        .hero-btn-primary:hover { background: #6d28d9; transform: translateY(-1px); }
        .hero-btn-ghost {
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.15);
          color: #fff; padding: 10px 18px; border-radius: 25px;
          font-size: 13px; font-weight: 600; text-decoration: none;
          display: inline-flex; align-items: center; gap: 6px;
          transition: background .2s; backdrop-filter: blur(4px);
        }
        .hero-btn-ghost:hover { background: rgba(255,255,255,0.15); }

        /* Dots */
        .hero-dots {
          position: absolute; bottom: 16px; left: 50%;
          transform: translateX(-50%);
          display: flex; gap: 6px; z-index: 10;
        }
        .hero-dot {
          height: 6px; border-radius: 3px; border: none; cursor: pointer; padding: 0;
          transition: width .3s, background .3s; width: 6px; background: rgba(255,255,255,.3);
        }
        .hero-dot.active { width: 20px; background: #7c3aed; }

        /* Swipe hint */
        .hero-swipe-hint {
          display: none; position: absolute; bottom: 20px; right: 16px;
          font-size: 10px; color: rgba(255,255,255,0.25); z-index: 10; letter-spacing: 0.5px;
        }

        /* ── MOBILE ── */
        @media (max-width: 768px) {
          .hero-content {
            flex-direction: row; align-items: stretch;
            padding: 0 0 44px 0; gap: 0; min-height: unset;
          }
          /* Cover takes 45% of card width on mobile */
          .hero-right {
            order: -1; flex-shrink: 0;
            width: 45%; min-width: 140px;
          }
          .hero-cover {
            width: 100% !important; height: 100% !important;
            min-height: 240px;
            border-radius: 0 !important;
            object-fit: cover;
          }
          .hero-cover-ph {
            width: 100% !important; height: 100% !important;
            min-height: 240px; border-radius: 0 !important;
          }
          .hero-left {
            flex: 1; padding: 18px 14px 8px; display: flex;
            flex-direction: column; justify-content: center;
          }
          .hero-desc { display: none; }
          .hero-swipe-hint { display: block; }
          .hero-title { font-size: 16px; margin-bottom: 6px; }
          .hero-genres { font-size: 11px; margin-bottom: 8px; }
          .hero-type { font-size: 10px; margin-bottom: 4px; }
          .hero-buttons { gap: 6px; }
          .hero-btn-primary { padding: 8px 14px; font-size: 12px; }
          .hero-btn-ghost { padding: 8px 12px; font-size: 11px; }
        }

        @media (max-width: 680px) {
          .hero-wrapper {
            margin: 10px 12px;
            border-radius: 16px;
            border: 1px solid rgba(255,255,255,.06);
            box-shadow: 0 8px 32px rgba(0,0,0,.5);
            min-height: unset; overflow: hidden;
          }
        }

        @media (max-width: 480px) {
          .hero-right { width: 45%; }
          .hero-cover { min-height: 220px; }
          .hero-status { display: none; }
          .hero-rating { padding: 3px 8px; }
          .hero-rating-num { font-size: 12px; }
        }

        @media (max-width: 360px) {
          .hero-right { width: 44%; }
          .hero-title { font-size: 14px; }
          .hero-left { padding: 14px 10px 8px; }
        }
      `}</style>

      <div className="hero-wrapper" onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
        {s.cover && <div className="hero-bg" style={{ backgroundImage: `url(${s.cover})` }} />}
        <div className="hero-overlay" />

        <div className="hero-content" style={{ opacity: fade ? 1 : 0, transition: 'opacity 0.25s ease' }}>
          <div className="hero-left">
            <div className="hero-type">{s.type?.toUpperCase() || 'MANHWA'}</div>
            <h2 className="hero-title">{s.title}</h2>
            <div className="hero-rating-genres">
              {s.rating && (
                <span className="hero-rating">
                  <span className="hero-rating-star">★</span>
                  <span className="hero-rating-num">{s.rating}</span>
                </span>
              )}
              {s.rating && s.genres?.length > 0 && (
                <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '13px' }}>·</span>
              )}
              {s.genres?.length > 0 && (
                <span className="hero-genres">{s.genres.join(' · ')}</span>
              )}
            </div>
            {s.description && (
              <p className="hero-desc">
                {s.description.length > 160 ? s.description.slice(0, 160) + '...' : s.description}
              </p>
            )}
            <div className="hero-status">
              Status: <strong style={{ color: s.status === 'ongoing' ? '#22c55e' : '#3b82f6', marginLeft: 4 }}>
                {s.status === 'ongoing' ? 'Ongoing' : 'Completed'}
              </strong>
            </div>
            <div className="hero-buttons">
              {firstChapter && (
                <Link href={`/series/${s.slug}/chapter/${firstChapter.num}`} className="hero-btn-primary">
                  ▶ Start Reading
                </Link>
              )}
              <Link href={`/series/${s.slug}`} className="hero-btn-ghost">
                Details
              </Link>
            </div>
          </div>

          <div className="hero-right">
            {s.cover
              ? <img src={s.cover} alt={s.title} className="hero-cover" />
              : <div className="hero-cover-ph">{s.title?.slice(0,2).toUpperCase()}</div>
            }
          </div>
        </div>

        <div className="hero-swipe-hint">← swipe →</div>

        <div className="hero-dots">
          {series.map((_, i) => (
            <button
              key={i} onClick={() => goTo(i)}
              className={`hero-dot${i === current ? ' active' : ''}`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </>
  )
}