import { Analytics } from '@vercel/analytics/next'
import Script from 'next/script'
import Head from "next/head";
import "../../styles/globals.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { getAllSeries } from "../lib/content";

export default function App({ Component, pageProps, allSeries }) {
  return (
    <>
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-R2VTVZ1DWL"
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-R2VTVZ1DWL');
        `}
      </Script>

      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#0f1117" />
        <meta property="og:site_name" content="PanelVerse" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="preconnect" href="https://pub-e13b23f611944371985db7aa97d5341c.r2.dev" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
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

App.getInitialProps = async () => {
  const allSeries = getAllSeries();
  return { allSeries };
};