import Link from 'next/link'

export default function Footer() {
  return (
    <footer>
      <div className="footer-inner">
        <div className="footer-brand">
          <div className="logo">Panel<span style={{color:'var(--accent)'}}>Verse</span></div>
          <p>Read manga and manhwa for free. New chapters added regularly.</p>
        </div>
        <div className="footer-col">
          <h4>Navigate</h4>
          <ul>
            <li><Link href="/">Home</Link></li>
            <li><Link href="/series">All Series</Link></li>
            <li><Link href="/latest">Latest Updates</Link></li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>Info</h4>
          <ul>
            <li><Link href="/dmca">DMCA</Link></li>
            <li><Link href="/privacy">Privacy Policy</Link></li>
            <li><Link href="/terms">Terms of Service</Link></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} PanelVerse. All rights reserved.</span>
        <div className="footer-links">
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/dmca">DMCA</Link>
        </div>
      </div>
    </footer>
  )
}