import { Analytics } from '@vercel/analytics/next'
import Head from "next/head";
import "../../styles/globals.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { getAllSeries } from "../lib/content";

export default function App({ Component, pageProps, allSeries }) {
  return (
    <>
      <Head>
        {/* Viewport — critical for mobile SEO */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        {/* Default fallback meta — overridden per page */}
        <meta name="theme-color" content="#0f1117" />
        <meta property="og:site_name" content="PanelVerse" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />

        {/* Preconnect to R2 for faster image loads */}
        <link
          rel="preconnect"
          href="https://pub-e13b23f611944371985db7aa97d5341c.r2.dev"
        />

        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link rel="manifest" href="/site.webmanifest" />
      </Head>

      <Navbar allSeries={allSeries} />
      <main>
        <Component {...pageProps} />
      </main>
      <Footer />
      <Analytics />
    </>
  );
}

// Runs once at build time — passes allSeries to every page via App
App.getInitialProps = async () => {
  const allSeries = getAllSeries();
  return { allSeries };
};
