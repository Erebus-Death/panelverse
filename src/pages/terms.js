import Head from 'next/head'

export default function Terms() {
  return (
    <>
      <Head>
        <title>Terms of Service — PanelVerse</title>
        <meta name="robots" content="noindex" />
      </Head>
      <div className="container" style={{ maxWidth: 760, padding: '40px 20px' }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 8 }}>Terms of Service</h1>
        <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 32 }}>Last updated: {2026}</p>

        <section style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 10 }}>Use of the Site</h2>
          <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.8 }}>
            By accessing PanelVerse, you agree to use the site for personal, non-commercial purposes only. You may not reproduce, redistribute, or scrape content from this site without prior written permission.
          </p>
        </section>

        <section style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 10 }}>Intellectual Property</h2>
          <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.8 }}>
            All manga and manhwa content belongs to their respective authors and publishers. PanelVerse does not claim ownership of any series hosted on this platform.
          </p>
        </section>

        <section style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 10 }}>Disclaimer</h2>
          <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.8 }}>
            PanelVerse is provided "as is" without warranties of any kind. We reserve the right to modify or discontinue the service at any time without notice.
          </p>
        </section>

        <section style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 10 }}>Contact</h2>
          <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.8 }}>
            For questions about these terms, contact us at <strong style={{ color: 'var(--text)' }}>support@thepanelverse.com</strong>.
          </p>
        </section>
      </div>
    </>
  )
}