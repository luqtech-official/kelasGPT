import "@/styles/globals.css";
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';
import Script from 'next/script';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['700', '800'],
  variable: '--font-plus-jakarta-sans',
});

export default function App({ Component, pageProps }) {
  return (
    <>
      {/* Facebook Pixel - Battle-tested standard implementation */}
      <Script id="facebook-pixel" strategy="afterInteractive">
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

      <main className={`${inter.variable} ${plusJakartaSans.variable}`}>
        <Component {...pageProps} />
      </main>
    </>
  );
}
