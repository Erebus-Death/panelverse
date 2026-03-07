import Head from 'next/head'
import Link from 'next/link'
import Image from 'next/image'
import { getAllSeriesSlugs, getSeries, formatDate } from '../../../lib/content'

export default function SeriesPage({ series }) {
  if (!series) return (
    <div className="container" style={{padding:'60px 20px',color:'var(--muted)'}}>
      Series not found.
    </div>
  )

  const {
    title, cover, author, genres=[], status, type,
    year, rating, reviewCount, views, description, chapters=[], slug
  } = series

  const firstChapter = chapters[0]
  const latestChapter = chapters.at(-1)

  return (
    <>
      <Head>
        <title>{title} — PanelVerse</title>
        <meta name="description" content={description?.slice(0, 155)} />
        <meta property="og:title" content={title} />
        {cover && <meta property="og:image" content={cover} />}
      </Head>

      <div className="container">
        {/* Header */}
        <div style={{display:'flex',gap:'28px',flexWrap:'wrap',paddingTop:'8px'}}>
          <div style={{flexShrink:0}}>
            {cover ? (
              <Image
                src={cover} alt={title} width={200} height={285}
                style={{borderRadius:'6px',objectFit:'cover',boxShadow:'0 8px 24px rgba(0,0,0,.6)'}}
                priority
              />
            ) : (
              <div style={{width:'200px',height:'285px',borderRadius:'6px',background:'var(--surface2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'36px',fontWeight:800,color:'rgba(255,255,255,.2)',boxShadow:'0 8px 24px rgba(0,0,0,.6)'}}>
                {title.slice(0,2).toUpperCase()}
              </div>
            )}
          </div>

          <div style={{flex:1,minWidth:'260px'}}>
            <div style={{display:'inline-block',background:'var(--surface2)',border:'1px solid var(--border)',color:'var(--muted)',fontSize:'10px',fontWeight:600,textTransform:'uppercase',letterSpacing:'.4px',padding:'2px 8px',borderRadius:'3px',marginBottom:'10px'}}>
              {type || 'Manhwa'}
            </div>
            <h1 style={{fontSize:'22px',fontWeight:700,lineHeight:1.25,marginBottom:'12px'}}>{title}</h1>
            <div style={{display:'flex',gap:'20px',flexWrap:'wrap',fontSize:'12px',color:'var(--muted)',marginBottom:'12px'}}>
              {author && <span>Author: <strong>{author}</strong></span>}
              {year   && <span>Year: <strong>{year}</strong></span>}
              {views  && <span>Views: <strong>{views}</strong></span>}
            </div>
            <div style={{display:'flex',gap:'6px',flexWrap:'wrap',marginBottom:'14px',alignItems:'center'}}>
              <span className={`card-status status-${status}`} style={{position:'static',fontSize:'11px',padding:'3px 8px'}}>
                {status === 'ongoing' ? 'Ongoing' : 'Completed'}
              </span>
              {genres.map(g => <span key={g} className="tag">{g}</span>)}
            </div>
            {rating && (
              <div style={{display:'flex',alignItems:'center',gap:'6px',marginBottom:'14px'}}>
                <span style={{color:'#f59e0b',fontSize:'16px'}}>★</span>
                <strong style={{color:'#f59e0b',fontSize:'16px'}}>{rating}</strong>
                {reviewCount && <span style={{color:'var(--muted)',fontSize:'12px'}}>({reviewCount.toLocaleString()} reviews)</span>}
              </div>
            )}
            <p style={{fontSize:'13px',color:'var(--muted)',lineHeight:1.75,marginBottom:'20px',maxWidth:'600px'}}>
              {description}
            </p>
            <div style={{display:'flex',gap:'10px',flexWrap:'wrap'}}>
              {firstChapter && (
                <Link href={`/series/${slug}/chapter/${firstChapter.num}`} className="btn">
                  ▶ Start Reading
                </Link>
              )}
              {latestChapter && latestChapter.num !== firstChapter?.num && (
                <Link href={`/series/${slug}/chapter/${latestChapter.num}`} className="btn btn-ghost">
                  Latest: Ch. {latestChapter.num}
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Chapter list */}
        <div className="section" style={{marginTop:'32px'}}>
          <div className="section-head">
            <div className="section-title">Chapters ({chapters.length})</div>
          </div>
          <div style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:'var(--radius)',overflow:'hidden'}}>
            {[...chapters].reverse().map(ch => (
              <Link
                key={ch.num}
                href={`/series/${slug}/chapter/${ch.num}`}
                style={{display:'flex',alignItems:'center',gap:'12px',padding:'11px 16px',borderBottom:'1px solid var(--border)',textDecoration:'none',color:'inherit',transition:'background .2s'}}
                className="chapter-row-link"
              >
                <span style={{fontWeight:600,fontSize:'13px',flexShrink:0,minWidth:'90px'}}>
                  Chapter {ch.num}
                </span>
                {ch.title && (
                  <span style={{flex:1,fontSize:'13px',color:'var(--muted)'}}>{ch.title}</span>
                )}
                <span style={{fontSize:'11px',color:'var(--muted)',flexShrink:0}}>
                  {formatDate(ch.date)}
                </span>
              </Link>
            ))}
            {chapters.length === 0 && (
              <div style={{padding:'20px',color:'var(--muted)'}}>No chapters yet.</div>
            )}
          </div>
        </div>
      </div>

      <style>{`.chapter-row-link:hover { background: var(--surface2) !important; }`}</style>
    </>
  )
}

export async function getStaticPaths() {
  const slugs = getAllSeriesSlugs()
  return {
    paths: slugs.map(slug => ({ params: { slug } })),
    fallback: false,
  }
}

export async function getStaticProps({ params }) {
  const series = getSeries(params.slug)
  if (!series) return { notFound: true }
  return { props: { series } }
}