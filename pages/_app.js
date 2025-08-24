import "@/styles/globals.css";
import { Inter, Manrope, IBM_Plex_Mono } from 'next/font/google';
import Script from 'next/script';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ["normal", "italic"], 
  variable: '--font-inter',
  display: 'swap',
});

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  style: ["normal"], 
  variable: '--font-manrope',
  display: 'swap',
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['300', '400', '600'],
  style: ["normal", "italic"], 
  variable: '--font-ibm-plex-mono',
  display: 'swap',
});

export default function App({ Component, pageProps }) {
  return (
    <>
      {/* Facebook Pixel - Lazy loaded for optimal performance */}
      <Script id="facebook-pixel" strategy="lazyOnload">
        {`
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          
          ${process.env.NEXT_PUBLIC_META_PIXEL_ID ? `
            fbq('init', '${process.env.NEXT_PUBLIC_META_PIXEL_ID}');
            fbq('track', 'PageView');
          ` : '/* Facebook Pixel ID not configured */'}
        `}
      </Script>

      <main className={`${inter.variable} ${manrope.variable} ${ibmPlexMono.variable}`}>
        <Component {...pageProps} />
      </main>
    </>
  );
}
