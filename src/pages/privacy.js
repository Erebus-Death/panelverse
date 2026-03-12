import Head from 'next/head'

export default function Privacy() {
  return (
    <>
      <Head>
        <title>Privacy Policy — PanelVerse</title>
        <meta name="robots" content="noindex" />
      </Head>
      <div className="container" style={{ maxWidth: 760, padding: '40px 20px' }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 8 }}>Privacy Policy</h1>
        <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 32 }}>Last updated: {new Date().getFullYear()}</p>

        <section style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 10 }}>Information We Collect</h2>
          <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.8 }}>
            PanelVerse does not require account registration. We do not collect personal information such as your name, email, or payment details. We may collect anonymous usage data (pages visited, browser type) through analytics to improve the site.
          </p>
        </section>

        <section style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 10 }}>Cookies</h2>
          <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.8 }}>
            We may use cookies to remember your reading preferences. No personal data is stored in cookies. You can disable cookies in your browser settings at any time.
          </p>
        </section>

        <section style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 10 }}>Third Party Services</h2>
          <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.8 }}>
            Images are served via Cloudflare R2. The site is hosted on Vercel. These services may collect standard server logs (IP addresses, request times) as part of normal operation. Please refer to their respective privacy policies for details.
          </p>
        </section>

        <section style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 10 }}>Contact</h2>
          <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.8 }}>
            For privacy-related questions, contact us at <strong style={{ color: 'var(--text)' }}>support@thepanelverse.com</strong>.
          </p>
        </section>
      </div>
    </>
  )
}