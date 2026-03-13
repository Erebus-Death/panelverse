import Head from 'next/head'

export default function DMCA() {
  return (
    <>
      <Head>
        <title>DMCA — PanelVerse</title>
        <meta name="robots" content="noindex" />
      </Head>
      <div className="container" style={{ maxWidth: 760, padding: '40px 20px' }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 8 }}>DMCA Policy</h1>
        <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 32 }}>Last updated: {2026}</p>

        <section style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 10 }}>Overview</h2>
          <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.8 }}>
            PanelVerse respects the intellectual property rights of others. If you believe that material available on this site infringes your copyright, you may submit a DMCA takedown notice.
          </p>
        </section>

        <section style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 10 }}>How to Submit a Takedown Request</h2>
          <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.8, marginBottom: 12 }}>
            Send an email to <strong style={{ color: 'var(--text)' }}>support@thepanelverse.com</strong> with the following information:
          </p>
          <ul style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 2, paddingLeft: 20 }}>
            <li>Your full legal name and contact information</li>
            <li>A description of the copyrighted work you claim has been infringed</li>
            <li>The specific URL(s) of the infringing content on our site</li>
            <li>A statement that you have a good faith belief the use is not authorized</li>
            <li>A statement that the information in your notice is accurate</li>
            <li>Your electronic or physical signature</li>
          </ul>
        </section>

        <section style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 10 }}>Response Time</h2>
          <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.8 }}>
            We will respond to valid DMCA notices within 3–5 business days and remove infringing content promptly.
          </p>
        </section>
      </div>
    </>
  )
}