import Head from 'next/head'
import Link from 'next/link'

export default function NotFound() {
  return (
    <>
      <Head>
        <title>404 — Page Not Found | PanelVerse</title>
        <meta name="robots" content="noindex" />
      </Head>

      <div style={{
        minHeight: '70vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', textAlign: 'center', padding: '40px 20px'
      }}>
        <div>
          <div style={{ fontSize: '80px', fontWeight: 800, color: 'var(--accent)', lineHeight: 1 }}>404</div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text)', margin: '16px 0 8px' }}>
            Page Not Found
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '28px' }}>
            The page you're looking for doesn't exist or was moved.
          </p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/" className="btn">Go Home</Link>
            <Link href="/series" className="btn btn-ghost">Browse Series</Link>
          </div>
        </div>
      </div>
    </>
  )
}