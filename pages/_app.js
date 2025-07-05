import "@/styles/globals.css";
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';

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
    <main className={`${inter.variable} ${plusJakartaSans.variable}`}>
      <Component {...pageProps} />
    </main>
  );
}
