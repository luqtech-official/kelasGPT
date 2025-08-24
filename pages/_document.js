import { Html, Head, Main, NextScript } from "next/document";
import Script from "next/script";

export default function Document() {
  return (
    <Html lang="ms">
      <Head>
        {/* Google Fonts preconnect for faster loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Critical font CSS - only essential weights for FCP */}
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@700&display=swap" rel="stylesheet"/>
        
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon.ico" />
      </Head>
      <body>
        <Main />
        <NextScript />
        
        {/* Non-critical fonts - loaded after page interaction */}
        <Script
          id="load-non-critical-fonts"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              const link1 = document.createElement('link');
              link1.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;500;800&display=swap';
              link1.rel = 'stylesheet';
              document.head.appendChild(link1);
              
              const link2 = document.createElement('link');
              link2.href = 'https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&display=swap';
              link2.rel = 'stylesheet';
              document.head.appendChild(link2);
              
              const link3 = document.createElement('link');
              link3.href = 'https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600&display=swap';
              link3.rel = 'stylesheet';
              document.head.appendChild(link3);
            `
          }}
        />
      </body>
    </Html>
  );
}
