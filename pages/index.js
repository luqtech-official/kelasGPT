import Head from "next/head";
import Link from "next/link";
import styles from "@/styles/Home.module.css";
import SocialProof from "@/components/SocialProof"; // Assuming this component exists and works
import { getProductSettings, formatPrice } from "../lib/settings";

// --- SVG Icon Components ---
// Using simple functional components for SVG icons for reusability and cleanliness.

const CheckCircleIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
);

const ArrowRightIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <line x1="5" y1="12" x2="19" y2="12"></line>
    <polyline points="12 5 19 12 12 19"></polyline>
  </svg>
);

const BrainCircuitIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M12 5a3 3 0 1 0-5.993.142M12 5a3 3 0 1 1 5.993.142M12 19a3 3 0 1 0-5.993-.142M12 19a3 3 0 1 1 5.993-.142M5 12a3 3 0 1 0-.142-5.993M5 12a3 3 0 1 1-.142 5.993M19 12a3 3 0 1 0 .142-5.993M19 12a3 3 0 1 1 .142 5.993M12 5v14M5 12h14"/>
    </svg>
);

const TargetIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
    </svg>
);

const RocketIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.3.05-3.1S5.21 15.66 4.5 16.5z"/>
        <path d="M19 3c-1.5 1.5-3 4.5-3 9s1.5 7.5 3 9c1.5-1.5 3-4.5 3-9s-1.5-7.5-3-9zM9.5 14.5c1.26-1.5 5-2 5-2s-.5 3.74-2 5c-.84.71-2.3.7-3.1.05s-.9-2.35.05-3.1z"/>
        <path d="M15 3s-3 3-6 6"/>
    </svg>
);


export default function Home({ productSettings }) {
  return (
    <div className={styles.pageWrapper}>
      <Head>
        <title>KelasGPT - Kuasai AI Untuk Gandakan Produktiviti Anda</title>
        <meta
          name="description"
          content="Belajar & Kuasai Kecerdasan Buatan (AI) dan Large Language Models (LLM) untuk mempercepat kerja, menaik taraf kemahiran, dan menjimatkan masa. Sertai KelasGPT hari ini!"
        />
        <meta property="og:title" content="KelasGPT - Kuasai AI Untuk Gandakan Produktiviti Anda" />
        <meta
          property="og:description"
          content="Kursus video online non-teknikal yang direka untuk profesional, pelajar, dan pemilik bisnes kecil di Malaysia."
        />
        <meta property="og:image" content="/og-image.png" /> {/* Make sure you have a compelling OG image */}
        <meta property="og:url" content="https://kelasgpt.my" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* The SocialProof component is kept as requested */}
      <SocialProof />

      <main className={styles.main}>
        {/* --- Hero Section --- */}
        <section className={`${styles.section} ${styles.hero}`}>
          <div className="container">
            <h1 className={styles.heroTitle}>
              Belajar & Kuasai Kecerdasan Buatan untuk Gandakan Produktiviti Anda
            </h1>
            <p className={styles.heroSubtitle}>
              Tertanya-tanya bagaimana AI boleh mempercepat kerja harian? Mahu memahami LLM tanpa pening kepala teknikal? Ingin menaik taraf kemahiran, menjimatkan masa, dan menambah nilai kepada kerjaya atau bisnes anda?
            </p>
            <Link href="/checkout" legacyBehavior>
              <a className={styles.ctaButton}>
                Daftar Sekarang <ArrowRightIcon />
              </a>
            </Link>
            <p className={styles.ctaButtonSubtext}>Tempat terhad untuk sokongan berkualiti.</p>
          </div>
        </section>

        {/* --- Who is this for? (Pain Points) --- */}
        <section className={styles.section}>
            <div className="container">
                <div className={styles.sectionHeader}>
                    <h2>Adakah Ini Anda?</h2>
                </div>
                <div className={styles.painPointsGrid}>
                    <div className={styles.painPointCard}>
                        <RocketIcon />
                        <p>Profesional yang ingin 10x produktiviti.</p>
                    </div>
                    <div className={styles.painPointCard}>
                        <BrainCircuitIcon />
                        <p>Pelajar & penyelidik yang mahu menulis & menganalisis lebih pantas.</p>
                    </div>
                    <div className={styles.painPointCard}>
                        <TargetIcon />
                        <p>Pemilik bisnes kecil yang mahu menambah baik operasi & pemasaran.</p>
                    </div>
                </div>
            </div>
        </section>

        {/* --- Features Section ("Why KelasGPT") --- */}
        <section className={`${styles.section} ${styles.grey}`}>
          <div className="container">
            <div className={styles.sectionHeader}>
              <h2>Mengapa KelasGPT Lain Daripada Yang Lain?</h2>
              <p>Disampaikan oleh penganalisis perniagaan berpengalaman, setiap topik dihubungkan terus kepada situasi sebenar di tempat kerja dan perniagaan.</p>
            </div>
            <div className={styles.featuresGrid}>
              <div className={styles.featureCard}>
                <div className={styles.featureIcon}><CheckCircleIcon /></div>
                <div><h3>Fokus Non-Teknikal</h3><p>Dijelaskan dalam bahasa mudah, sesuai untuk latar belakang apa pun.</p></div>
              </div>
              <div className={styles.featureCard}>
                <div className={styles.featureIcon}><CheckCircleIcon /></div>
                <div><h3>Panduan Langkah Demi Langkah</h3><p>Daripada asas AI hingga strategi prompt lanjutan, semuanya tersusun.</p></div>
              </div>
              <div className={styles.featureCard}>
                <div className={styles.featureIcon}><CheckCircleIcon /></div>
                <div><h3>Kandungan Ringkas & Padat</h3><p>12 video sederhana panjang, mudah diulang tonton mengikut topik.</p></div>
              </div>
              <div className={styles.featureCard}>
                <div className={styles.featureIcon}><CheckCircleIcon /></div>
                <div><h3>Belajar Ikut Kadar Sendiri</h3><p>Akses 24/7; belajar di pejabat, rumah atau semasa dalam perjalanan.</p></div>
              </div>
            </div>
          </div>
        </section>

        {/* --- What You'll Learn Section --- */}
        <section className={styles.section}>
          <div className="container">
            <div className={styles.sectionHeader}>
              <h2>Apa Yang Anda Akan Pelajari?</h2>
              <p>Kurikulum komprehensif yang membawa anda dari zero ke hero dalam aplikasi AI praktikal.</p>
            </div>
            <div className={styles.learnGrid}>
                <div className={styles.learnItem}><CheckCircleIcon /><h3>Asas AI – Terma utama, sejarah ringkas, dan cara AI “berfikir”.</h3></div>
                <div className={styles.learnItem}><CheckCircleIcon /><h3>Cara LLM Berfungsi – Konteks tetingkap, benchmark model popular.</h3></div>
                <div className={styles.learnItem}><CheckCircleIcon /><h3>Teknik Prompt – Dari asas hingga lanjutan; rangka kerja, dan mental model.</h3></div>
                <div className={styles.learnItem}><CheckCircleIcon /><h3>Ciri Tambahan LLM – Cara memaksimumkan langganan berbayar anda.</h3></div>
                <div className={styles.learnItem}><CheckCircleIcon /><h3>How-to & Demo – Menyelesaikan tugasan harian, penulisan, analisis, dan automasi.</h3></div>
            </div>
          </div>
        </section>
        
        {/* --- Pricing Section --- */}
        <section className={`${styles.section} ${styles.grey}`}>
            <div className="container">
                <div className={styles.pricingBox}>
                    <h2>Pelaburan Anda</h2>
                    <p>Dapatkan akses seumur hidup kepada semua video, nota, dan kemas kini masa hadapan. Tiada yuran tersembunyi.</p>
                    <div className={styles.price}>{formatPrice(productSettings.productPrice, 'RM')} <span>sekali bayar</span></div>
                    <Link href="/checkout" legacyBehavior>
                      <a className={styles.ctaButton}>
                        Dapatkan Akses Sekarang
                      </a>
                    </Link>
                </div>
            </div>
        </section>

        {/* --- Imagine/Final CTA Section --- */}
        <section className={styles.section}>
            <div className="container">
                <div className={styles.imagineBox}>
                    <h2>Bayangkan…</h2>
                    <p>Menyiapkan laporan dalam minit, bukan jam. Menjana idea kempen pemasaran dengan beberapa baris prompt. Mengurangkan kos operasi sambil meningkatkan kualiti kerja. Inilah realiti baharu dengan AI apabila anda tahu caranya.</p>
                    <Link href="/checkout" legacyBehavior>
                      <a className={styles.ctaButton} style={{backgroundColor: 'var(--white)', color: 'var(--primary)'}}>
                        Mula Transformasi Produktiviti Anda
                      </a>
                    </Link>
                </div>
            </div>
        </section>

      </main>
    </div>
  );
}

export async function getServerSideProps() {
  try {
    const productSettings = await getProductSettings();
    
    return {
      props: {
        productSettings
      }
    };
  } catch (error) {
    console.error('Error fetching product settings for homepage:', error);
    
    // Return default settings if there's an error
    return {
      props: {
        productSettings: {
          productName: 'KelasGPT - Instant Access x1',
          productPrice: 197.00,
          productDescription: 'Complete GPT-4 learning course in Malay language'
        }
      }
    };
  }
}
