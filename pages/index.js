import { useEffect, useState } from 'react';
import { trackPageView, getOrCreateVisitorId } from '../lib/simpleTracking';
import Head from "next/head";
import Link from "next/link";
import NextImage from "next/image";
import styles from "@/styles/nanobanana-dark.module.css";
import SocialProof from "@/components/SocialProof";
import { getProductSettings } from "../lib/settings";
import { getBlurDataURL, getGitImageUrl } from "../lib/gitimage";
import { trackViewContent } from "../lib/facebook-pixel";

const Image = ({src, ...props}) => <NextImage src={getGitImageUrl(src)} {...props} />;

// --- Swiper Imports ---
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

// --- Icons ---
const CheckCircleIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
);
const RocketIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.3.05-3.1S5.21 15.66 4.5 16.5z"/>
        <path d="M19 3c-1.5 1.5-3 4.5-3 9s1.5 7.5 3 9c1.5-1.5 3-4.5 3-9s-1.5-7.5-3-9zM9.5 14.5c1.26-1.5 5-2 5-2s-.5 3.74-2 5c-.84.71-2.3.7-3.1.05s-.9-2.35.05-3.1z"/>
        <path d="M15 3s-3 3-6 6"/>
    </svg>
);

const CheckIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="20 6 9 17 4 12"></polyline></svg>
);
const ArrowRightIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
);
const BookIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
  </svg>
);
const RefreshIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <polyline points="23 4 23 10 17 10"></polyline>
    <polyline points="1 20 1 14 7 14"></polyline>
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
  </svg>
);
const TargetIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="10"></circle>
    <circle cx="12" cy="12" r="6"></circle>
    <circle cx="12" cy="12" r="2"></circle>
  </svg>
);
const CameraIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
        <circle cx="12" cy="13" r="4"></circle>
    </svg>
);
const DollarIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <line x1="12" y1="1" x2="12" y2="23"></line>
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
    </svg>
);
const LinkIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
  </svg>
);
const ChevronDownIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="6 9 12 15 18 9"></polyline></svg>
);

// --- Components ---

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState(null);

    const faqs = [
    {
      question: "Perlu Subscribe apa-apa apps ke?",
      answer: (
        <>
          Tak perlu. ChatGPT, Gemini dan Grok memberikan daily free quota yang mencukupi.
          <br /><br />
          Anda boleh menggunakan Nano Banana untuk menghasilkan 30 gambar SEHARI,
          dengan free plan dari Gemini.
          <br /><br />
          Sekiranya itu tidak mencukupi, Plan ChatGPT-Go atau Google Workspace untuk Gemini
          pun lebih dari mencukupi dengan yuran di bawah RM50 sebulan.
        </>
      ),
    },
    {
      question: "Format eBook ni apa?",
      answer: (
        <>
          Ia adalah Digital Ebook dalam format PDF.
          <br /><br />
          Selepas pembayaran, anda akan dibawa kepada link download.
          <br /><br />
          Salinan link download juga akan terus ke email anda.
          <br /><br />
          Anda boleh baca di Smartphone, Tablet atau Laptop.
        </>
      ),
    },
    {
      question: "Kalau saya tak pandai IT boleh ke?",
      answer: (
        <>
          Boleh sangat!
          <br /><br />
          Panduan ini disusun khas untuk beginner (Zero),
          sampailah mahir teknik-teknik yang lebih advance.
          <br /><br />
          Bahasa yang digunakan adalah Bahasa Melayu santai
          dan step-by-step yang mudah diikuti.
        </>
      ),
    },
    {
      question: "Prompt ni untuk ChatGPT je ke?",
      answer: (
        <>
          Fokus utama case study dalam buku ini adalah menggunakan Gemini (Nano Banana).
          <br /><br />
          TAPI itu hanyalah atas dasar personal preference pengarang
          (plus Gemini ada daily free quota yang sangat banyak).
          <br /><br />
          Teknik, Workflow dan Prompt yang diberikan boleh digunakan bersama
          mana-mana platform AI utama seperti ChatGPT, Gemini dan Grok.
        </>
      ),
    },
    {
      question: "Tak Faham lah, Gemini tu apa? Nano Banana Apa Pula? Apa Beza Dengan ChatGPT?",
      answer: (
        <>
          Gemini ialah AI keluaran Google, sementara ChatGPT ialah AI keluaran syarikat OpenAI.
          <br /><br />
          Ianya ialah aplikasi yang sama, iaitu Aplikasi Generative AI, cuma mereka saling bersaing satu sama lain kerana dihasilkan oleh dua company yang berbeza.
          <br /><br />
          Nano banana pula cumalah nama model di dalam applikasi Gemini, sebagaimana ChatGPT mempunya pelbagai model seperti GPT-4o, GPT 4.1,  GPT-5.2 dan sebagainya.
          <br /><br />
          Penjelasan lebih jelas diberikan didalam buku, serta link untuk akses dan install setiap aplikasi ini.
        </>
      ),
    },
  ];

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  }

  return (
    <section className={`${styles.lightSection}`} style={{padding: '4rem 0', borderTop: '1px solid #e0e0e0'}}>
      <div className={styles.container}>
        <div style={{textAlign: 'center', marginBottom: '3rem'}}>
           <h2 style={{fontSize: '2rem', fontWeight: '800', color: '#111'}}>Soalan Lazim (FAQ)</h2>
        </div>
        <div style={{maxWidth: '800px', margin: '0 auto'}}>
          {faqs.map((faq, index) => (
             <div 
                key={index} 
                className={`${styles.accordionGroup} ${openIndex === index ? styles.accordionOpen : ''}`}
             >
                <div className={styles.accordionHeader} onClick={() => toggleFAQ(index)}>
                   <div className={styles.accordionTitle}>{faq.question}</div>
                   <div className={styles.accordionIcon}>
                      <ChevronDownIcon />
                   </div>
                </div>
                <div className={styles.accordionContent}>
                   <div className={styles.accordionContentInner}>
                      <p style={{color: '#555', lineHeight: '1.6'}}>{faq.answer}</p>
                   </div>
                </div>
             </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const ShowcaseTripod = () => {
  const images = [
    'KelasGPT_NanoBanana/Tripod_after_enhanced1.png',
    'KelasGPT_NanoBanana/Tripod_after_enhanced2.png',
    'KelasGPT_NanoBanana/Tripod_after_enhanced3.png',
    'KelasGPT_NanoBanana/Tripod_after_enhanced4.png',
  ];

  return (
    <div className={styles.comparisonCard} style={{marginBottom: '4rem'}}>
        <div className={styles.comparisonHeader}>
            <h3>Gambar produk yang <br/><span className={styles.highlight}>Highly Converting!</span><br/>5 Minit je bila guna workflow Key-Visual</h3>
            <p>&quot;Gunakan workflow KV system untuk tukar satu gambar produk anda yang &apos;biasa-biasa&apos; kepada pelbagai variasi Key-Visual bertaraf studio.&quot;</p>
        </div>
        <div className={styles.comparisonTwoCol}>
            {/* Before Image */}
            <div className={styles.imageContainer}>
                <div className={`${styles.imageLabel} ${styles.labelBefore}`}>BEFORE: ORIGINAL</div>
                <Image
                    src="KelasGPT_NanoBanana/Tripod_before_enhanced.webp"
                    alt="Original Tripod"
                    width={500}
                    height={500}
                    style={{width: '100%', height: 'auto', display: 'block'}}
                    sizes="(max-width: 768px) 100vw, 50vw"
                />
            </div>

            {/* Swiper Slider */}
            <div style={{ width: '100%', overflow: 'hidden', borderRadius: '12px', minHeight: '100%' }}>
                <Swiper
                    modules={[Navigation, Pagination, Autoplay]}
                    spaceBetween={20}
                    slidesPerView={1}
                    navigation
                    pagination={{ clickable: true }}
                    autoplay={{ delay: 3000, disableOnInteraction: false }}
                    style={{ 
                        '--swiper-theme-color': '#ff6b35', 
                        '--swiper-navigation-size': '20px',
                        paddingBottom: '30px',
                        height: '100%'
                    }}
                >
                    {images.map((img, index) => (
                         <SwiperSlide key={index}>
                            <div className={styles.imageContainer}>
                                <div className={`${styles.imageLabel} ${styles.labelAfter}`}>AFTER: VARIATION {index + 1}</div>
                                <Image
                                    src={img}
                                    alt={`Tripod Variation ${index + 1}`}
                                    width={500}
                                    height={500}
                                    style={{width: '100%', height: 'auto', display: 'block'}}
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                />
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>
        </div>
    </div>
  );
};

const ShowcaseCreative = () => {
  const creativeImages = [
    { src: 'KelasGPT_NanoBanana/meme_modified.png', alt: 'Meme Modification' },
    { src: 'KelasGPT_NanoBanana/Gadget_Exploding_view.png', alt: 'Product Exploded View' },
    { src: 'KelasGPT_NanoBanana/Posture_modified.png', alt: 'Posture Correction' },
    { src: 'KelasGPT_NanoBanana/woman_with_rifle_cinematic_shot.png', alt: 'Cinematic Composition' },
    { src: 'KelasGPT_NanoBanana/Kids_birthday.png', alt: 'Kids Event Photography' },
    { src: 'KelasGPT_NanoBanana/Fun_couple_image.png', alt: 'Lifestyle Photography' },
    { src: 'KelasGPT_NanoBanana/Knolling_image.png', alt: 'Knolling Photography' },
  ];

  return (
    <div className={styles.comparisonCard} style={{marginBottom: '4rem'}}>
        <div className={styles.comparisonHeader}>
            <h3>Idea anda bercambah dengan sendirinya,<br/>Bila ada<br/><span className={styles.highlight}>Prompting Workflow</span> yang betul.</h3>
            <p><br/>&quot;Edit meme sendiri just for fun. Product exploded view untuk pitch deck. Cinematic shots untuk hook social content. Knolling photography untuk feed aesthetic.&quot;<br/><br/><strong>Apa yang anda boleh bayang, anda boleh buat!</strong></p>
        </div>
        
        <div style={{ padding: '0 1rem' }}>
             <Swiper
                modules={[Navigation, Pagination, Autoplay]}
                spaceBetween={20}
                slidesPerView={1}
                navigation
                pagination={{ clickable: true }}
                autoplay={{ delay: 2500, disableOnInteraction: false }}
                breakpoints={{
                    640: {
                        slidesPerView: 2,
                    },
                    1024: {
                        slidesPerView: 3,
                    },
                }}
                style={{ 
                    '--swiper-theme-color': '#ff6b35', 
                    '--swiper-navigation-size': '25px',
                    paddingBottom: '40px',
                    paddingTop: '10px'
                }}
            >
                {creativeImages.map((item, index) => (
                        <SwiperSlide key={index} style={{height: 'auto'}}>
                        <div className={styles.imageContainer} style={{ height: '350px', position: 'relative' }}>
                            <Image
                                src={item.src}
                                alt={item.alt}
                                fill
                                style={{objectFit: 'cover'}}
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            />
                            <div className={styles.imageOverlay} style={{bottom: '10px', left: '10px', right: 'auto', background: 'rgba(0,0,0,0.6)'}}>
                                {item.alt}
                            </div>
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    </div>
  );
};

export default function Home({ productSettings }) {
  const [visitorId, setVisitorId] = useState(null);
  const [openAccordion, setOpenAccordion] = useState(0);
  const [checkoutUrl, setCheckoutUrl] = useState('/checkout');
  const [expandedModules, setExpandedModules] = useState({});

  const toggleModule = (moduleId) => {
    setExpandedModules(prev => {
      const isCurrentlyExpanded = prev[moduleId];
      if (isCurrentlyExpanded) {
        return { ...prev, [moduleId]: false };
      } else {
        return { [moduleId]: true };
      }
    });
  };

  useEffect(() => {
    const id = getOrCreateVisitorId();
    setVisitorId(id);
    if (id) setCheckoutUrl(`/checkout?vid=${id}`);
    
    setTimeout(() => {
      trackPageView('/', id);
      if (productSettings) {
        trackViewContent({
          productName: productSettings.productName,
          productPrice: productSettings.productPrice,
          productId: 'nanobanana-ebook',
          category: 'education'
        });
      }
    }, 100);
  }, [productSettings]);

  return (
    <div className={styles.pageWrapper}>
      <Head>
        <title>Teknik Prompting Gambar AI - Panduan Lengkap Zero to Mastery</title>
        <meta name="description" content="Kuasai teknik Prompt Keyword untuk hasilkan gambar AI yang tepat, tajam, dan memukau. Panduan lengkap dari Zero to Mastery." />
        <meta property="og:title" content="Teknik Prompting Gambar AI - Zero to Mastery" />
        <meta property="og:image" content="/og-image-nanobanana.png" />
        <meta name="theme-color" content="#050505"/>
      </Head>

      <SocialProof />

      <main>
        {/* --- Navbar --- */}
        <nav className={styles.navbar}>
            <div className={styles.container}>
                <div className={styles.navBrandText}>KelasGPT <span style={{color: 'var(--accent-color)'}}>.</span></div>
            </div>
        </nav>

        {/* --- Hero Section --- */}
        <section className={styles.hero}>
          <div className={styles.container}>
            <div className={styles.heroContent}>
              <div className={styles.heroPill}>
                <span className={styles.heroPillText}>• DARI ZERO KE MASTERY •</span>
              </div>
              
              <h1 className={styles.heroTitle}>
                Teknik Gambar AI<br />
                <span className={styles.heroEmphasis}>Yang Memukau,</span>
                <span className={styles.heroDivider}></span>
                Sekali Pandang, Nampak 
                <span className={styles.heroEmphasis}> Real!</span>
              </h1>
              
              <p className={styles.heroSubTitle}>
                Ramai ingat prompting AI senang.<br/>Taip je, dapat hasil. <br/>Tapi kenapa <strong>susah nak dapat result cantik, gempak,</strong> macam orang lain?
              </p>

              <div className={styles.heroVisualWrapper}>
                 <div className={styles.heroVisualContent}>
                    <Image 
                        src="nanobanana-hero"
                        alt="Teknik Prompting Gambar AI Book Cover Visual" 
                        width={1000} 
                        height={800}
                        quality={90} 
                        style={{width: '100%', height: 'auto', display: 'block'}} 
                        priority
                        placeholder="blur"
                        blurDataURL={getBlurDataURL('nanobanana-hero')}
                        sizes="(max-width: 768px) 100vw, 800px"
                    />
                 </div>
                 <div className={styles.heroCaption}>
                    👆 AI yang sama, Model yang sama, 1-Minit yang sama.<br/>Hasil yang sangat berbeza!<br/>Bezanya? Teknik Prompting.
                 </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- Pain Points / Noise Section --- */}
        <section className={`${styles.noiseSection} ${styles.lightSection}`}>
            <div className={styles.container}>
                <div className={styles.noiseContainer}>
                    <div className={styles.sectionHeader} style={{textAlign: 'left', margin: 0}}>
                        <span className={styles.monoLabel}>REALITY CHECK</span>
                        <h2>Kenapa Prompt Panjang Berjela Pun Hasilnya Masih &apos;Ke Laut&apos;?</h2>
                    </div>
                    
                    <div className={styles.noiseText}>
                        <p style={{ fontWeight: '800', fontSize: '1.2rem', color: '#D32F2F', marginBottom: '0.5rem' }}><br/>STOP WASTING YOUR TIME.</p>
                        {/* Disable this line below because i dont like it. It make the impression that the apps im teaching will need to be paid. */}
                        {/* <p style={{fontSize: '1.1rem', marginBottom: '1.5rem'}}>Setiap minit anda type prompt yang sia-sia = <strong>RM hilang dari poket anda.</strong></p>  */}
                        
                        <p>Bila anda tekan &quot;Generate&quot;, hasilnya bukan sekadar &quot;tak jadi&quot;, tapi:</p>
                        <ul style={{ listStyleType: 'disc', paddingLeft: '20px', marginBottom: '2rem', color: '#333' }}>
                            <li style={{ marginBottom: '8px' }}>Muka model lansung tak sama macam yang anda upload</li>
                            <li style={{ marginBottom: '8px' }}>Background yang anda nak sharp, jadi blur</li>
                            <li style={{ marginBottom: '8px' }}>Lighting nampak pelik, buat gambar nampak buruk</li>
                            <li style={{ marginBottom: '8px' }}>Paling teruk, tiba-tiba orang ada 3 tangan </li>
                        </ul>

                        <p><strong>Berapa kali dah anda:</strong></p>
                        <ul style={{ listStyleType: 'disc', paddingLeft: '20px', marginBottom: '2rem', color: '#333' }}>
                            <li style={{ marginBottom: '8px' }}>Buang 2 jam cuba pelbagai prompt tapi hasil tetap teruk?</li>
                            <li style={{ marginBottom: '8px' }}>Delete 50+ generated images sebab tak boleh pakai?</li>
                            <li style={{ marginBottom: '8px' }}>Tengok orang lain post gambar cantik, rasa jealous?</li>
                            <li style={{ marginBottom: '8px' }}>Fikir &apos;maybe AI ni bukan untuk saya&apos;?</li>
                        </ul>

                        <div className={styles.noiseHighlight}>
                            Kalau freelancer charge RM50/hour untuk design,<br/>anda dah <strong>RUGI RM100 setiap kali</strong> buang masa 2 jam trial & error.
                        </div>

                        <p style={{ marginTop: '1.5rem' }}>Masalahnya bukan imaginasi anda.<br/><br/>AI tak faham bahasa manusia macam kita faham bahasa manusia.<br/><br/>Dia faham <strong>Keyword dan Context</strong> menggunakan algorithm dan probabilities.</p>
                        <p>Selagi mana anda tahu teknik menulis supaya AI faham keyword apa yang dia patut utamakan, ada banyak benda yang anda boleh buat dan hasilkan.</p>
                    </div>
                </div>
            </div>
        </section>

        {/* --- SHOWCASES SECTION --- */}
        <section className={styles.gallerySection}>
            <div className={styles.container}>
                <div className={styles.sectionHeader}>
                    {/* <span className={styles.monoLabel}>POSSIBILITIES</span> */}
                    <h2>Apa Yang Boleh Anda Buat Bila Tahu Cara Prompt Yang Betul?</h2>
                    <p>Ini bukanlah sekadar prompt pack untuk anda Copy & Paste.<br/>Tapi <span className={styles.highlight}>Proven Teknik dan Workflow</span> untuk hasilkan prompt gambar berkualiti yang anda nak, dengan sangat mudah!</p>
                </div>

                {/* Showcase 1: Tripod / Product */}
                <ShowcaseTripod />

                {/* Showcase 2: Food Presentation */}
                <div className={styles.comparisonCard} style={{marginBottom: '4rem'}}>
                    <div className={styles.comparisonHeader}>
                        <h3>Tunjuk<br/><span className={styles.highlight}>GAMBAR REAL</span><br/>makanan anda,<br/>Tapi dengan <span className={styles.highlight}>Editorial Quality!</span></h3>
                    </div>
                    <div className={styles.comparisonGrid} style={{gap: '2rem'}}>
                        {/* Food Item 1 */}
                         <div className={styles.comparisonTwoCol}>
                             <div className={styles.imageContainer}>
                                <div className={`${styles.imageLabel} ${styles.labelBefore}`}>BEFORE</div>
                                <Image 
                                    src="KelasGPT_NanoBanana/Maggi%20Goreng.jpg" 
                                    alt="Maggi Goreng Before" 
                                    width={500} 
                                    height={500} 
                                    style={{width: '100%', height: 'auto', display: 'block'}} 
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                    placeholder="blur"
                                    blurDataURL={getBlurDataURL('maggi-before')}
                                />
                            </div>
                            <div className={styles.imageContainer}>
                                <div className={`${styles.imageLabel} ${styles.labelAfter}`}>AFTER</div>
                                <Image 
                                    src="KelasGPT_NanoBanana/Premium%20Food%20Image%20Analysis.png" 
                                    alt="Food Analysis After" 
                                    width={500} 
                                    height={500} 
                                    style={{width: '100%', height: 'auto', display: 'block'}} 
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                    placeholder="blur"
                                    blurDataURL={getBlurDataURL('food-analysis')}
                                />
                            </div>
                        </div>
                         {/* Food Item 2 */}
                         {/* <div className={styles.comparisonTwoCol}>
                             <div className={styles.imageContainer}>
                                <div className={`${styles.imageLabel} ${styles.labelBefore}`}>BEFORE</div>
                                <Image 
                                    src="KelasGPT_NanoBanana/Nasi%20Kandar%20Celebration%20Card_Before.jpg" 
                                    alt="Nasi Kandar Before" 
                                    width={500} 
                                    height={500} 
                                    style={{width: '100%', height: 'auto', display: 'block'}} 
                                    sizes="(max-width: 768px) 100vw, 400px"
                                    placeholder="blur"
                                    blurDataURL={getBlurDataURL('nasi-before')}
                                />
                            </div>
                            <div className={styles.imageContainer}>
                                <div className={`${styles.imageLabel} ${styles.labelAfter}`}>AFTER</div>
                                <Image 
                                    src="KelasGPT_NanoBanana/Nasi%20Kandar%20Celebration%20Card_After.png" 
                                    alt="Nasi Kandar After" 
                                    width={500} 
                                    height={500} 
                                    style={{width: '100%', height: 'auto', display: 'block'}} 
                                    sizes="(max-width: 768px) 100vw, 400px"
                                    placeholder="blur"
                                    blurDataURL={getBlurDataURL('nasi-after')}
                                />
                            </div>
                        </div> */}
                    </div>
                </div>

                {/* Showcase 3: Visual Aids / Infographics */}
                <div className={styles.comparisonCard} style={{marginBottom: '4rem'}}>
                    <div className={styles.comparisonHeader}>
                        <h3>Dari <span className={styles.highlight}>Magazine-Style</span> infographic untuk social media,<br/>Sampailah Study Notes Yang <span className={styles.highlight}>Buat Anak Semangat Nak Study.</span></h3>
                    </div>
                    <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem'}}>
                         <div className={styles.imageContainer}>
                             <Image 
                                src="KelasGPT_NanoBanana/Studygram%20Jantung.png" 
                                alt="Studygram Jantung" 
                                width={400} 
                                height={500} 
                                style={{width: '100%', height: 'auto', display: 'block'}} 
                                sizes="(max-width: 768px) 100vw, 33vw"
                                placeholder="blur"
                                blurDataURL={getBlurDataURL('studygram-jantung')}
                             />
                         </div>
                         <div className={styles.imageContainer}>
                             <Image 
                                src="KelasGPT_NanoBanana/Scientific%20Infographic%20Image.png" 
                                alt="Scientific Infographic" 
                                width={400} 
                                height={500} 
                                style={{width: '100%', height: 'auto', display: 'block'}} 
                                sizes="(max-width: 768px) 100vw, 33vw"
                                placeholder="blur"
                                blurDataURL={getBlurDataURL('scientific-info')}
                             />
                         </div>
                         <div className={styles.imageContainer}>
                             <Image 
                                src="KelasGPT_NanoBanana/Studygram%20Nucleus.png" 
                                alt="Studygram Nucleus" 
                                width={400} 
                                height={500} 
                                style={{width: '100%', height: 'auto', display: 'block'}} 
                                sizes="(max-width: 768px) 100vw, 33vw"
                                placeholder="blur"
                                blurDataURL={getBlurDataURL('studygram-nucleus')}
                             />
                         </div>
                    </div>
                </div>

                {/* Showcase 4: Beautiful Portraits */}
                <div className={styles.comparisonCard} style={{marginBottom: '4rem'}}>
                    <div className={styles.comparisonHeader}>
                        <h3>Tak perlu jadi photogenic untuk dapatkan gambar anda yang <span className={styles.highlight}>Insta-Worthy!</span></h3>
                    </div>
                    <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem'}}>
                         <div className={styles.imageContainer}>
                             <Image 
                                src="KelasGPT_NanoBanana/Woman_chiaschuro.png" 
                                alt="Woman Chiaroscuro" 
                                width={400} 
                                height={500} 
                                style={{width: '100%', height: 'auto', display: 'block'}} 
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                                placeholder="blur"
                                blurDataURL={getBlurDataURL('woman-chiaro')}
                             />
                         </div>
                         <div className={styles.imageContainer}>
                             <Image 
                                src="KelasGPT_NanoBanana/Woman_birthday.png" 
                                alt="Woman Birthday" 
                                width={400} 
                                height={500} 
                                style={{width: '100%', height: 'auto', display: 'block'}} 
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                                placeholder="blur"
                                blurDataURL={getBlurDataURL('woman-bday')}
                             />
                         </div>
                         <div className={styles.imageContainer}>
                             <Image 
                                src="KelasGPT_NanoBanana/Man_chiaschuro.png" 
                                alt="Man Chiaroscuro" 
                                width={400} 
                                height={500} 
                                style={{width: '100%', height: 'auto', display: 'block'}} 
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                                placeholder="blur"
                                blurDataURL={getBlurDataURL('man-chiaro')}
                             />
                         </div>
                         <div className={styles.imageContainer}>
                             <Image 
                                src="KelasGPT_NanoBanana/Man_cinematic.png" 
                                alt="Man Cinematic" 
                                width={400} 
                                height={500} 
                                style={{width: '100%', height: 'auto', display: 'block'}} 
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                                placeholder="blur"
                                blurDataURL={getBlurDataURL('man-cinematic')}
                             />
                         </div>
                    </div>
                </div>

                {/* Showcase 5: Creative Workflow Grid */}
                <ShowcaseCreative />

                {/* Bento Grid: Possibilities */}
                {/* This bento grid section has been removed by the user */}


                {/* --- Deep Dive Transition --- */}
                <div style={{margin: '6rem 0 4rem', textAlign: 'center', borderTop: '1px solid #222', paddingTop: '4rem'}}>
                    <span className={styles.monoLabel}>Special Case Studies</span>
                    <h2 style={{fontSize: '2rem', fontWeight: '800', marginBottom: '1rem'}}>Bukan Sekadar <br/>&apos;Tiru Prompt&apos;</h2>
                    <p style={{color: '#888', maxWidth: '600px', margin: '0 auto'}}>
                        Tapi tiru <span className={styles.highlight}> &apos;Workflow dan Thought Process&apos;</span> saya. Bagaimana saya membina satu prompt dari yang paling simple, layer detail demi detail, sehingga terhasilnya visual prompt yang lengkap.
                    </p>
                </div>

                <div className={styles.comparisonGrid}>
                    {/* Case Study 1: Portrait Layering */}
                    <div className={styles.comparisonCard}>
                        <div className={styles.comparisonHeader}>
                            <h3>Case Study 1: The AI Transformation</h3>
                            <p>&quot;Lihat bagaimana foto potret biasa yang &apos;flat&apos; diubah menjadi potret ala poster filem. Bedah siasat teknik &apos;layering&apos; keyword untuk mengawal lighting dan emosi tanpa perlu photoshoot mahal.&quot;</p>
                        </div>
                        <div className={styles.comparisonImages}>
                            <div className={styles.imageContainer}>
                                <div className={`${styles.imageLabel} ${styles.labelBefore}`}>BEFORE</div>
                                <Image 
                                    src="KelasGPT_NanoBanana/Woman%20Cinematic%20Bokeh%20Portrait_Before.png" 
                                    alt="Original Portrait Photo" 
                                    width={500} 
                                    height={500} 
                                    style={{width: '100%', height: 'auto', display: 'block'}} 
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                    placeholder="blur"
                                    blurDataURL={getBlurDataURL('woman-before')}
                                />
                            </div>
                            <div className={styles.arrowDivider}>
                                <ArrowRightIcon width={40} height={40} />
                            </div>
                            <div className={styles.imageContainer}>
                                <div className={`${styles.imageLabel} ${styles.labelAfter}`}>AFTER</div>
                                <Image 
                                    src="KelasGPT_NanoBanana/Woman%20Cinematic%20Bokeh%20Portrait_After.png" 
                                    alt="Final AI Enhanced Result" 
                                    width={500} 
                                    height={500} 
                                    style={{width: '100%', height: 'auto', display: 'block'}} 
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                    placeholder="blur"
                                    blurDataURL={getBlurDataURL('woman-after')}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Case Study 2: Infographic (Visual Style) */}
                    <div className={styles.comparisonCard}>
                        <div className={styles.comparisonHeader}>
                            <h3>Case Study 2: Visual Style Architecture</h3>
                            <p>&quot;Menghasilkan Infografik yang &apos;readable&apos; dan cantik bukan nasib. Ia memerlukan struktur prompt yang spesifik. Lihat bagaimana saya menyusun &apos;Information Architecture&apos; di dalam prompt.&quot;</p>
                        </div>
                        <div className={styles.imageContainer} style={{maxWidth: '800px', margin: '0 auto'}}>
                            <div className={`${styles.imageLabel} ${styles.labelAfter}`} style={{background: '#2980b9', borderColor: '#2980b9'}}>FINAL OUTPUT</div>
                            <Image 
                                src="KelasGPT_NanoBanana/Case%20Study%202_Infographic%20for%20Kids.png" 
                                alt="Detailed Infographic Result" 
                                width={1000} 
                                height={600} 
                                style={{width: '100%', height: 'auto', display: 'block'}} 
                                sizes="(max-width: 850px) 100vw, 800px"
                                placeholder="blur"
                                blurDataURL={getBlurDataURL('infographic-kids')}
                            />
                        </div>
                    </div>

                    {/* Case Study 3: Meta Prompting (Nasi Kandar) */}
                    <div className={styles.comparisonCard}>
                        <div className={styles.comparisonHeader}>
                            <h3>Case Study 3: Proses Meta-Prompting</h3>
                            <p><br/>&quot;Macam mana nak suruh AI jadi &apos;Prompt Editor&apos; anda?<br/><br/>Tiru je workflow meta-prompting yang saya guna untuk transform gambar simple jadi (original reference) kepada design Kad Digital New Year yang cantik dan professional.&quot;</p>
                        </div>
                        <div className={styles.comparisonImages}>
                            <div className={styles.imageContainer}>
                                <div className={`${styles.imageLabel} ${styles.labelBefore}`}>ORIGINAL REFERENCE</div>
                                <Image 
                                    src="KelasGPT_NanoBanana/Nasi%20Kandar%20Celebration%20Card_Before.jpg" 
                                    alt="Original Reference Image" 
                                    width={500} 
                                    height={500} 
                                    style={{width: '100%', height: 'auto', display: 'block'}} 
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                    placeholder="blur"
                                    blurDataURL={getBlurDataURL('nasi-before')}
                                />
                            </div>
                            <div className={styles.arrowDivider}>
                                <ArrowRightIcon width={40} height={40} />
                            </div>
                            <div className={styles.imageContainer}>
                                <div className={`${styles.imageLabel} ${styles.labelAfter}`}>FINAL BRANDED DESIGN</div>
                                <Image 
                                    src="KelasGPT_NanoBanana/Nasi%20Kandar%20Celebration%20Card_After.png" 
                                    alt="Final AI Enhanced Branded Design" 
                                    width={500} 
                                    height={500} 
                                    style={{width: '100%', height: 'auto', display: 'block'}} 
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                    placeholder="blur"
                                    blurDataURL={getBlurDataURL('nasi-after')}
                                />
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </section>

        {/* --- The Reality Check: Practicality vs Artistry --- */}
        <section className={`${styles.coreSkillsSection} ${styles.lightSection} ${styles.realitySection}`}>
            <div className={styles.container}>
                <div style={{textAlign: 'center', marginBottom: '2rem'}}>
                     <span className={`${styles.monoLabel} ${styles.realityLabel}`}>REALITI CHECK</span>
                     <h2 className={styles.realityHeading}>
                        Jom Kita Jujur Sekejap.
                     </h2>
                </div>

                <div className={styles.realityContent}>
                    <p className={styles.realityIntro}>
                        Buku ini <strong className={styles.textRed}>BUKAN</strong> mengajar anda menjadi artis untuk berkarya.
                        <br/><br/>
                        Tapi teknik praktikal untuk hasilkan gambar yang anda <strong className={styles.textUnderline}>BOLEH GUNA</strong>,<br/> dengan cepat.
                    </p>

                    <div className={styles.realityBox}>
                        <p className={styles.realityBoxHeader}>Sebab dalam realiti,<br/>anda cuma nak..</p>
                        <ul className={styles.realityList}>
                             <li className={styles.realityItem}>
                                <span className={styles.iconCheck}>✔</span> Profile picture yang lagi cantik.
                             </li>
                             <li className={styles.realityItem}>
                                <span className={styles.iconCheck}>✔</span> Worksheet untuk anak mewarna.
                             </li>
                             <li className={styles.realityItem}>
                                <span className={styles.iconCheck}>✔</span> Quick Content untuk post social media.
                             </li>
                             <li className={styles.realityItem}>
                                <span className={styles.iconCheck}>✔</span> Simple infographic untuk visual aid.
                             </li>
                        </ul>
                    </div>

                    <div className={styles.realityStatementWrapper}>
                        <h3 className={styles.realityStatementSmall}>
                            Anda tak perlukan <span className={styles.realityStatementGrey}>Masterpiece.</span>
                        </h3>
                        <div className={styles.realityDivider}></div>
                        <h3 className={styles.realityStatementBig}>
                            Anda perlukan <span className={styles.realityStatementUnderline}>HASIL.</span>
                        </h3>
                    </div>

                    <div className={styles.realityQuoteBox}>
                        <p style={{marginBottom: 0}}>
                            &quot;AI bukan untuk ganti artist yang melukis dengan jiwa.<br/><br/>
                            Tapi alat untuk tolong <strong>ANDA</strong> dapatkan visual yang anda perlukan, <strong>SEKARANG !!</strong> <br/>
                            <br/>Tanpa mahir Photoshop.<br/>Tanpa hire designer.<br/>Tanpa buang masa.&quot;
                        </p>
                    </div>

                    {/* --- Segue to Product --- */}
                    <div className={styles.segueContainer} style={{marginTop: '5rem'}}>
                        <h3 className={styles.segueTitle}>Dan sebab itulah buku ini ditulis..</h3>
                        <div className={styles.segueText}>
                            <p style={{marginBottom: '1.5rem'}}>Untuk bagi anda kebolehan untuk hasilkan gambar yang anda tak tahu nak buat macam mana sebelum ni.</p>
                            
                            <p style={{marginTop: '1.5rem', fontWeight: 800, color: 'var(--accent-color)', fontSize: '1.4rem'}}>
                                Cepat. Percuma. Buat Sendiri.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        {/* --- Book Content Preview (Gary Halbert Style) --- */}
        <section className={styles.gallerySection}>
             <div className={styles.container}>
                
                {/* --- BOOK REVEAL START --- */}
                <div style={{textAlign: 'center', marginBottom: '5rem', position: 'relative'}}>
                     <span className={styles.monoLabel} style={{color: 'var(--accent-color)', letterSpacing: '2px'}}>KelasGPT OFFICIAL GUIDEBOOK</span>
                     <h2 className={styles.bookRevealTitle}>
                        Teknik Prompting<br/>Gambar AI
                     </h2>
                     <h3 className={styles.realityStatementGrey}>
                        Dari Zero to Mastery<br/><br/><br/>
                     </h3>
                     <div style={{maxWidth: '850px', margin: '0 auto', position: 'relative'}}>
                        {/* Glow Effect */}
                        <div className={styles.bookRevealGlow}></div>
                        
                        <div className={styles.bookRevealImage}>
                             <Image 
                                src="001_eBook_Mockup.png"
                                alt="Buku Teknik Prompting Gambar AI"
                                width={1000}
                                height={800}
                                style={{
                                    width: '100%', 
                                    height: 'auto', 
                                    display: 'block',
                                    filter: 'drop-shadow(0 25px 50px rgba(0,0,0,0.5))'
                                }}
                                priority
                             />
                        </div>
                     </div>
                     
                     <p className={styles.bookRevealDisclaimer}>
                        &quot;Buku Digital ini adalah dalam format PDF dengan <strong style={{color: '#fff'}}>INSTANT ACCESS</strong>. Tiada hardcopy disediakan&quot;
                     </p>
                </div>
                {/* --- BOOK REVEAL END --- */}

                <div style={{textAlign: 'center', marginBottom: '3rem'}}>
                    <span className={styles.monoLabel}>NO SECRETS. NO GATEKEEPING.</span>
                    <h2 style={{fontSize: '2.5rem', fontWeight: '800', marginBottom: '1.5rem'}}>Bukan Sekadar &quot;Teori&quot;.<br/>Ini Adalah <span className={styles.highlight}>Visual Encyclopedia.</span></h2>
                    <p style={{maxWidth: '700px', margin: '0 auto', color: '#ccc', fontSize: '1.1rem', lineHeight: '1.6'}}>
                        
                        Dalam eBook ni, Tak ada apa pun yang saya simpan atau sorok daripada anda. 
                        <br/><br/>
                        208 mukasurat yang padat dengan visual, prompt, penjelasan, teknik dan workflow step-by-step.
                        Ini adalah snapshot content sebenar dari dalam buku ini.
                        <br/><br/>
                        <span style={{color: 'var(--accent-color)', fontWeight: 'bold'}}>Zero Fluff. 100% Actionable.</span>
                    </p>
                </div>

                {/* Snippets Grid */}
                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
                    gap: '1.5rem', 
                    marginTop: '2rem',
                    marginBottom: '4rem',
                    position: 'relative',
                    zIndex: '2'
                }}>
                    <div style={{ background: '#111', borderRadius: '12px', border: '1px solid #333', overflow: 'hidden' }}>
                        <Image 
                            src="nanobanana-snippet-1" 
                            alt="Case Studies Snippet" 
                            width={400} 
                            height={500} 
                            style={{width: '100%', height: 'auto', display: 'block'}}
                        />
                        <div style={{ padding: '1rem', fontSize: '0.85rem', color: '#888', borderTop: '1px solid #333' }}>
                            <strong style={{ color: 'var(--accent-color)', display: 'block', marginBottom: '4px' }}>Muka Surat 169-170</strong>
                            Dalam setiap case studies, saya tunjuk keyword apa saya tambah, dan kenapa saya tambah, step-by-step transformation.
                        </div>
                    </div>
                    <div style={{ background: '#111', borderRadius: '12px', border: '1px solid #333', overflow: 'hidden' }}>
                        <Image 
                            src="nanobanana-snippet-2" 
                            alt="Camera Angle Snippet" 
                            width={400} 
                            height={500} 
                            style={{width: '100%', height: 'auto', display: 'block'}}
                        />
                        <div style={{ padding: '1rem', fontSize: '0.85rem', color: '#888', borderTop: '1px solid #333' }}>
                            <strong style={{ color: 'var(--accent-color)', display: 'block', marginBottom: '4px' }}>Muka Surat 119-120</strong>
                            Bila ada keyword yang degil, AI taknak ikut, saya tunjuk macam mana nak detailkan dengan betul supaya AI dengar arahan prompt anda.
                        </div>
                    </div>
                    <div style={{ background: '#111', borderRadius: '12px', border: '1px solid #333', overflow: 'hidden' }}>
                        <Image 
                            src="nanobanana-snippet-3" 
                            alt="Use Case Snippet" 
                            width={400} 
                            height={500} 
                            style={{width: '100%', height: 'auto', display: 'block'}}
                        />
                        <div style={{ padding: '1rem', fontSize: '0.85rem', color: '#888', borderTop: '1px solid #333' }}>
                            <strong style={{ color: 'var(--accent-color)', display: 'block', marginBottom: '4px' }}>Muka Surat 59-60</strong>
                            Setiap gambar yang dihasilkan, saya kongsikan sekali prompt dan tips and tricks yang berkaitan.
                        </div>
                    </div>
                </div>

                <div style={{textAlign: 'center', marginBottom: '3rem'}}>
                    
                    <p style={{maxWidth: '700px', margin: '0 auto', color: '#ccc', fontSize: '1.1rem', lineHeight: '1.6'}}>
                        
                        Complete Overview 208 mukasurat yang <span style={{color: 'var(--accent-color)', fontWeight: 'bold'}}>anda akan dapat!</span>
                    </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', position: 'relative', zIndex: '2' }}>
                     <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid #333', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
                        <Image 
                            src="nanobanana-content-1" 
                            alt="Book Content Preview Part 1" 
                            width={1000} 
                            height={1000} 
                            style={{width: '100%', height: 'auto', display: 'block'}}
                            placeholder="blur"
                            blurDataURL={getBlurDataURL('content-1')}
                        />
                     </div>
                     <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid #333', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
                        <Image 
                            src="nanobanana-content-2" 
                            alt="Book Content Preview Part 2" 
                            width={1000} 
                            height={1000} 
                            style={{width: '100%', height: 'auto', display: 'block'}} 
                            placeholder="blur"
                            blurDataURL={getBlurDataURL('content-2')}
                        />
                     </div>
                </div>
             </div>
        </section>

        {/* --- Curriculum Breakdown (Fascinations) --- */}
        <section className={styles.courseOutlineSection}>
            <div className={styles.container}>
                <div className={styles.sectionHeader}>
                    <span className={styles.monoLabel}>ISI KANDUNGAN</span>
                    <h2>Berapa Nilai eBook Ni?</h2>
                    <p>Persoalan yang lebih baik, Berapa nilai investment yang anda sanggup laburkan untuk belajar semua ini?</p>
                </div>

                <div className={styles.courseOutline}>
                    {/* Phase 1 */}
                    <div className={styles.moduleCard}>
                        <div className={`${styles.moduleHeader} ${expandedModules.phase1 ? styles.expanded : ''}`} onClick={() => toggleModule('phase1')}>
                            <div className={styles.moduleTitle}>
                                <span className={styles.moduleNumber}>PART 1 | FOUNDATION</span>
                                <h3>Asas Prompting & Struktur</h3>
                                <div className={styles.modulePrice}>Nilai: RM 17</div>
                            </div>
                            <div className={`${styles.expandIcon} ${expandedModules.phase1 ? styles.expanded : ''}`}>
                                <ArrowRightIcon />
                            </div>
                        </div>
                        {expandedModules.phase1 && (
                            <div className={styles.moduleContent}>
                                <div className={styles.subModule}>
                                    <strong>Platform Familiarization:</strong>
                                    <p>Belajar cara akses platform Generative AI, dan kenali model-model AI utama untuk penghasilan gambar.</p>
                                </div>
                                <div className={styles.subModule}>
                                    <strong>Asas Prompt Gambar AI:</strong>
                                    <p>Faham struktur ayat yang AI tak boleh tolak. Belajar cara komunikasi dengan model AI.</p>
                                </div>
                                <div className={styles.subModule}>
                                    <strong>Generate Gambar Pertama:</strong>
                                    <p>Step-by-step walkthrough untuk yang baru nak mula, dari akaun kosong hingga gambar pertama.</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Phase 2 */}
                    <div className={styles.moduleCard}>
                        <div className={`${styles.moduleHeader} ${expandedModules.phase2 ? styles.expanded : ''}`} onClick={() => toggleModule('phase2')}>
                            <div className={styles.moduleTitle}>
                                <span className={styles.moduleNumber}>PART 2 | TECHNICAL</span>
                                <h3>Kawalan Kamera & Lighting</h3>
                                <div className={styles.modulePrice}>Nilai: RM 49</div>
                            </div>
                             <div className={`${styles.expandIcon} ${expandedModules.phase2 ? styles.expanded : ''}`}>
                                <ArrowRightIcon />
                            </div>
                        </div>
                        {expandedModules.phase2 && (
                            <div className={styles.moduleContent}>
                                <div className={styles.subModule}>
                                    <strong>3 Prinsip &apos;Image Prompt Engineering&apos;:</strong>
                                    <p>Rahsia untuk dapat result konsisten setiap kali generate.</p>
                                </div>
                                <div className={styles.subModule}>
                                    <strong>Cara menulis Prompt Details:</strong>
                                    <p>Belajar cara menulis dengan struktur prompt yang betul, Layer demi Layer.</p>
                                </div>
                                <div className={styles.subModule}>
                                    <strong>Cara Menulis Technical Section:</strong>
                                    <p>Belajar cara mengawal Aspect Ratio, Depth of Field, Lighting, Camera Angle, Dan apa nak buat bila AI tak dengar arahan</p>
                                </div>
                                <div className={styles.subModule}>
                                    <strong>Belajar Asas Meta Prompting</strong>
                                    <p>Teknik utama prompting gambar yang wajib anda kuasai. Biar AI buat kerja berat untuk anda, dengan workflow yang betul.</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Phase 3 */}
                    <div className={styles.moduleCard}>
                        <div className={`${styles.moduleHeader} ${expandedModules.phase3 ? styles.expanded : ''}`} onClick={() => toggleModule('phase3')}>
                            <div className={styles.moduleTitle}>
                                <span className={styles.moduleNumber}>PART 3 | Advance</span>
                                <h3>Teknik Advanced & Prompting Workflow</h3>
                                <div className={styles.modulePrice}>Nilai: RM 89</div>
                            </div>
                            <div className={`${styles.expandIcon} ${expandedModules.phase3 ? styles.expanded : ''}`}>
                                <ArrowRightIcon />
                            </div>
                        </div>
                        {expandedModules.phase3 && (
                            <div className={styles.moduleContent}>
                                <div className={styles.subModule}>
                                    <strong>Meta Prompting: Prompt Segmentation</strong>
                                    <p>Tips dan Tricks untuk Meta-prompting macam pro.</p>
                                </div>
                                <div className={styles.subModule}>
                                    <strong>Teknik Editing & Debugging:</strong>
                                    <p>Prompt Contradiction, Prompt Interpretation, Expanding Prompt Details. Belajar cara AI berfikir dan cara nak betulkan prompt yang tak menjadi dengan lebih berkesan.</p>
                                </div>
                                <div className={styles.subModule}>
                                    <strong>Prompt Template Workflow:</strong>
                                    <p>Berhenti menagih prompt dari orang lain, Belajar teknik untuk image prompt reversal, dan cara bina template anda sendiri untuk digunakan berulang kali.</p>
                                </div>
                                <div className={styles.subModule}>
                                    <strong>Case Study: Bedah Siasat Prompting Workflow </strong>
                                    <p>Kita bedah prompt untuk Infographic Poster dan Personal Portrait Photography, dan lihat dengan detail &apos;Thought-Process&apos; saya ketika merangka dan menulis prompt tersebut.</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Part 4 */}
                    <div className={styles.moduleCard}>
                        <div className={`${styles.moduleHeader} ${expandedModules.phase4 ? styles.expanded : ''}`} onClick={() => toggleModule('phase4')}>
                            <div className={styles.moduleTitle}>
                                <span className={styles.moduleNumber}>PART 4 | EXTRA</span>
                                <h3>Bonus & Extra Module</h3>
                                <div className={styles.modulePrice}>Nilai: RM 49</div>
                            </div>
                            <div className={`${styles.expandIcon} ${expandedModules.phase4 ? styles.expanded : ''}`}>
                                <ArrowRightIcon />
                            </div>
                        </div>
                        {expandedModules.phase4 && (
                            <div className={styles.moduleContent}>
                                <div className={styles.subModule}>
                                    <strong>Ecom Product Prompt Generator:</strong>
                                    <p>Template prompt siap guna untuk seller atau affiliate e-commerce. Tukar apa sahaja produk anda kepada &apos;Key Visual&apos; dengan background dan lighting studio tanpa sebarang kos.</p>
                                </div>
                                <div className={styles.subModule}>
                                    <strong>29 Different Use Cases:</strong>
                                    <p>Koleksi 29 &apos;Real-World Application&apos; yang berbeza untuk Inspirasi. Dari edit gambar buang objek, Outfit Try-on, Food Photography, sehinggalah ke Scientific Infographic dan Image Analysis.</p>
                                </div>
                                <div className={styles.subModule}>
                                    <strong>JSON Prompting VS Natural Language:</strong>
                                    <p>JSON tu apa? Perlu ke balajar kalau nak power AI prompting. Buku ini akan menjawab semua persoalan anda.</p>
                                </div>
                            </div>
                        )}
                    </div>
                    
                    <div className={styles.valueStackBoxNew}>
                        <div className={styles.vsHeader}>Jumlah Nilai Keseluruhan</div>
                        <div className={styles.vsRow}>
                            <span>Part 1: Foundation</span>
                            <span>RM17</span>
                        </div>
                        <div className={styles.vsRow}>
                            <span>Part 2: Technical</span>
                            <span>RM49</span>
                        </div>
                        <div className={styles.vsRow}>
                            <span>Part 3: Advanced</span>
                            <span>RM89</span>
                        </div>
                        <div className={styles.vsRow}>
                            <span>Part 4: Bonus & Extra</span>
                            <span>RM49</span>
                        </div>
                        <div className={styles.vsDivider}></div>
                         <div className={styles.vsTotalRow}>
                            <span>TOTAL</span>
                            <span>RM204</span>
                        </div>
                        <div className={styles.vsExplainer}>
                            Ini adalah cost sebenar kalau anda nak invest untuk skillset ini satu per satu dari sumber berbeza.
                        </div>
                    </div>
                </div>

                <div className={styles.courseOutlineCTA}>
                     <p>Ada sebab buku ini dipanggil Panduan Lengkap Zero to Mastery.</p>
                     <p>Untuk dapatkan AI Skillset macam ni,<br/><span className={styles.ctaEmphasis}>Investment</span> RM 204 untuk <span className={styles.ctaEmphasis}>SELF IMPROVEMENT</span>, seriously sangat <span className={styles.ctaEmphasis}>BERBALOI..</span></p>
                </div>
            </div>
        </section>

        {/* --- Pricing Ticket & Offer --- */}
        <section className={styles.pricingSection}>
            <div className={styles.container}>
                <div style={{textAlign: 'center', marginBottom: '3rem'}}>
                    <p style={{fontSize: '2.0rem', color: '#ccc', maxWidth: '600px', margin: '0 auto', lineHeight: '1.6'}}>
                        <strong>Tapi Saya Nak Bagi Offer Yang Lebih Baik..</strong>
                    </p>
                </div>
                
                <div className={styles.pricingCard}>
                    <div className={styles.pricingHeader}>
                        <h3>Hari Ini, Anda Cuma Perlu Bayar...</h3>
                    </div>
                    
                    <div className={styles.priceDisplay}>
                        <div className={styles.originalPrice}>RM 204</div>
                        <div className={styles.currentPrice}>
                            <span className={styles.currency}>RM</span>
                            <span className={styles.amount}>37</span>
                            <span className={styles.period}>SAHAJA</span>
                        </div>
                        <div className={styles.savings}>
                            <br/>Anda Dapat Jimat RM 167!
                        </div>
                    </div>
                    
                    <div className={styles.priceIncludes}>
                        <h3>Ini Yang Anda Akan Dapat:</h3>
                        <ul>
                            <li><CheckCircleIcon className={styles.checkIcon} />Prompt dan Visual Encyclopedia dengan 208 Mukasurat </li>
                            <li><CheckCircleIcon className={styles.checkIcon} />Master &quot;Bahasa AI&quot; - tahu exactly apa nak tulis untuk dapat result yang hebat</li>
                            <li><CheckCircleIcon className={styles.checkIcon} />Prompt, Teknik, Workflow, Templates untuk bantu anda kuasai buku ini sepenuhnya</li>
                            <li><CheckCircleIcon className={styles.checkIcon} />Free Lifetime update untuk setiap versi buku yang baru dikeluarkan.</li>
                        </ul>
                    </div>
                    
                    <div className={styles.ctaSection}>
                        <Link href={checkoutUrl} className={styles.mainCTA}>
                            Saya Nak Dapatkan Sekarang
                        </Link>
                        {/* The main container for the secure payment text and icons */}
                        <div className={styles.securePaymentText}>
                            {/* Checkmark icon indicating security */}
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className={styles.securePaymentIcon} viewBox="0 0 16 16">
                                <path d="M10.067.87a2.89 2.89 0 0 0-4.134 0l-.622.638-.89-.011a2.89 2.89 0 0 0-2.924 2.924l.01.89-.636.622a2.89 2.89 0 0 0 0 4.134l.637.622-.011.89a2.89 2.89 0 0 0 2.924 2.924l.89-.01.622.636a2.89 2.89 0 0 0 4.134 0l.622-.637.89.011a2.89 2.89 0 0 0 2.924-2.924l-.01-.89.636-.622a2.89 2.89 0 0 0 0-4.134l-.637-.622.011-.89a2.89 2.89 0 0 0-2.924-2.924l-.89.01zm.287 5.984-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7 8.793l2.646-2.647a.5.5 0 0 1 .708.708"></path>
                            </svg>
                            <span> Secure payment via  </span>
                            {/* FPX payment logo  */}
                                <Image 
                                src="https://www.novalnet.com/wp-content/uploads/2021/06/fpx-logo.svg"
                                alt="FPX Payment Logo"
                                width={600} 
                                height={12}
                                loading="lazy"
                                className={styles.securePaymentLogo}
                                />
                        </div>
                        <p className={styles.ctaSubtext}>Instant Donwload • Sekali Bayar • Tiada caj tersembunyi</p>
                    </div>
                    
                    <div className={styles.urgencyNote}>
                        <p><strong>Kenapa murah sangat?</strong>
                        <br/><br/>Jujur cakap? <br/><br/>Sebab saya taknak spend banyak untuk Ads (jimat ~RM5k/bulan). Penjimatan tu saya pass pada anda. <br/><br/>Syaratnya?<br/><br/>Kalau anda happy dengan result, tolong recommend dekat kawan. Deal?</p>
                    </div>
                </div>
            </div>
        </section>

        {/* --- New Section: Partner Program --- */}
        <section className={`${styles.partnerSection} ${styles.lightSection} ${styles.partnerSectionPadding}`}>
            <div className={styles.container}>
                <div style={{maxWidth: '800px', margin: '0 auto', textAlign: 'center'}}>
                    <div className={styles.partnerIconCircle}>
                        <DollarIcon width={30} height={30} />
                    </div>
                    <h2 className={styles.partnerTitle} style={{fontSize: '2.2rem', fontWeight: 800, marginBottom: '1rem'}}>
                        <span style={{display: 'block', marginBottom: '1rem', color: 'var(--trust-blue)'}}>Oopps, Sekejap!</span>
                        Belajar AI Sambil<br/>Jana Pendapatan!!
                    </h2>
                    <p className={styles.partnerDesc} style={{fontSize: '1.2rem', marginBottom: '3rem'}}>
                        <br/><br/>Setiap pembaca yang berminat, boleh daftar untuk menjadi ejen affiliate KelasGPT.com
                        <br/><br/>Dan saya tak nak anda &apos;menjual&apos;. Saya nak anda &apos;bantu dan berkongsi&apos;.<br/><br/>Sebab itu setiap pembeli yang nak jadi ejen affiliate KelasGPT akan dibekalkan dengan <strong>&apos;Senjata Rahsia&apos;</strong>:
                    </p>

                    <div className={styles.partnerGrid}>
                         <div className={`${styles.partnerCard} ${styles.partnerCardStyle}`}>
                            <h4 className={styles.partnerBigStat}>20%</h4>
                            <p className={styles.partnerStatTitle}>Promo code unik setiap affiliate</p>
                            <p className={styles.partnerStatDesc}><br/>Pelanggan yang disarankan anda tak perlu bayar harga penuh. Dengan code diskaun unik anda, mereka akan dapat <strong>Potongan 20%</strong> serta merta.<br/><br/>Senang untuk mereka cakap <strong>&quot;YES!&quot;</strong> kepada recommendation anda.</p>
                         </div>
                         <div className={`${styles.partnerCard} ${styles.partnerCardStyle}`}>
                            <h4 className={styles.partnerBigStat} style={{marginBottom: '0.5rem', lineHeight: 1}}>33%</h4>
                            <p className={styles.partnerStatTitle}>Commission Rate Yang Tinggi!!</p>
                            <p className={styles.partnerStatDesc}><br/>Walaupun pelanggan yang disarankan anda dapat diskaun, anda tetap layak mendapat komisen setinggi <strong>33%</strong> untuk setiap jualan. <br/><br/>Untuk low-ticket product, komisyen <strong>RM 10 per SALE</strong>, actually is a crazy offer! <br/><br/>Plus, setiap jualan yang anda dapat adalah <strong>EXTRA BONUS</strong>, on top of skill prompting gambar AI yang anda dah belajar!</p>
                         </div>
                         <div className={`${styles.partnerCard} ${styles.partnerCardStyle}`}>
                            <div className={styles.partnerBigStat} style={{ display: 'flex', alignItems: 'center', height: '3rem', marginBottom: '0.5rem' }}>
                                <LinkIcon width={48} height={48} />
                            </div>
                            <p className={styles.partnerStatTitle}>Sistem &lsquo;Auto-Pilot&rsquo;</p>
                            <p className={styles.partnerStatDesc}><br/><strong>Anda tak perlu website sendiri.</strong> Cukup sekadar kongsikan link <code>KelasGPT.com</code> BERSAMA kod diskaun anda.<br/><br/>Sistem kami akan uruskan jualan, bayaran, akses produk dan customer support sepenuhnya.</p>
                         </div>
                    </div>
                    <div className={styles.ctaSection}>
                        <Link href={checkoutUrl} className={styles.mainCTA}>
                            Saya Nak Dapatkan Sekarang
                        </Link>
                        {/* The main container for the secure payment text and icons */}
                        <div className={styles.securePaymentText}>
                            {/* Checkmark icon indicating security */}
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className={styles.securePaymentIcon} viewBox="0 0 16 16">
                                <path d="M10.067.87a2.89 2.89 0 0 0-4.134 0l-.622.638-.89-.011a2.89 2.89 0 0 0-2.924 2.924l.01.89-.636.622a2.89 2.89 0 0 0 0 4.134l.637.622-.011.89a2.89 2.89 0 0 0 2.924 2.924l.89-.01.622.636a2.89 2.89 0 0 0 4.134 0l.622-.637.89.011a2.89 2.89 0 0 0 2.924-2.924l-.01-.89.636-.622a2.89 2.89 0 0 0 0-4.134l-.637-.622.011-.89a2.89 2.89 0 0 0-2.924-2.924l-.89.01zm.287 5.984-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7 8.793l2.646-2.647a.5.5 0 0 1 .708.708"></path>
                            </svg>
                            <span> Secure payment via  </span>
                            {/* FPX payment logo  */}
                                <Image 
                                src="https://www.novalnet.com/wp-content/uploads/2021/06/fpx-logo.svg"
                                alt="FPX Payment Logo"
                                width={600} 
                                height={12}
                                loading="lazy"
                                className={styles.securePaymentLogo}
                                />
                        </div>
                        <p className={styles.ctaSubtext}>Instant Donwload • Sekali Bayar • Tiada caj tersembunyi</p>
                    </div>
                </div>
            </div>
        </section>


      </main>
      
      {/* --- FAQ Section --- */}
      <FAQSection />

      {/* --- Contact Support Section --- */}
      <section className={`${styles.contactSection} ${styles.lightSection}`}>
        <div className={styles.container}>
          <div className={styles.contactContent}>
            <h3 className={styles.contactTitle}>Sokongan & Bantuan</h3>
            
            <div className={styles.contactMethods}>
              {/* Primary Support - WhatsApp */}
              <div className={`${styles.contactMethod}`}>
                <span className={styles.contactLabel}>WhatsApp:</span>
                <a 
                  href={`https://wa.me/60${(productSettings.productSupportPhone || '01112345678').replace(/\D/g, '').replace(/^0/, '')}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={styles.whatsappButton}
                >
                  Chat on WhatsApp
                </a>
                <span className={styles.contactContext}>Fastest response</span>
              </div>
              
              {/* Tertiary Support - Email */}
              <div className={`${styles.contactMethod}`}>
                <span className={styles.contactLabel}>Email:</span>
                <a 
                  href={`mailto:${productSettings.productSupportEmail || 'support@kelasgpt.com'}`}
                  className={styles.emailButton}
                >
                  Send Email
                </a>
                <span className={styles.contactContext}>Detailed inquiries</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- Legal Footer --- */}
      <footer className={`${styles.legalFooter} ${styles.lightSection}`}>
        <div className={styles.container}>
          <div className={styles.disclaimerContent}>
            <div className={styles.footerMeta}>
              <p>&copy; 2026 KelasGPT. All rights reserved.</p>
              <p>Educational platform for AI literacy in Malaysia.</p>
              <p className={styles.legalLinks}><br />Go To:</p>
              <p className={styles.legalLinks}>
                <Link href="/privacypolicy" className={styles.legalLink}>Privacy Policy</Link>
                <span className={styles.linkSeparator}>|</span>
                <Link href="/termsofuse" className={styles.legalLink}>Terms of Use</Link>
              </p>
              <p className={styles.legalLinks}><br />Important Disclaimer:</p>
            </div>
            
            <div className={styles.disclaimerText}>
              <p>Individual results may vary. Success depends on individual effort, commitment, and application of the techniques taught. No specific results are guaranteed. KelasGPT provides educational content on AI usage and productivity techniques. This is not professional advice and should not replace professional consultation in your specific field. Testimonials and case studies are real experiences from actual users, but individual results will vary based on personal effort and circumstances. This website and its content comply with advertising standards. We make no unrealistic income claims or guaranteed outcomes. Access to internet and AI platforms (ChatGPT, Claude, etc.) required. Platform subscriptions sold separately. We collect minimal tracking data and cookies solely for website analytics and performance optimization purposes. We do not share, sell, or distribute any personal data with third parties, except for platform-specific tracking pixels (Meta Pixel, TikTok Pixel) which are collected directly by those advertising platforms in accordance with their respective privacy policies for advertising measurement and optimization purposes only. This website is not part of Facebook, Instagram, WhatsApp, Threads, or any Meta Platforms websites. Additionally, this website is not endorsed by Meta Platforms Inc. in any way. Facebook, Instagram, WhatsApp, Threads, and Meta are trademarks of Meta Platforms Inc. This website is also not part of TikTok or any ByteDance platforms. This website is not endorsed by ByteDance Ltd. or TikTok Pte. Ltd. in any way. TikTok is a trademark of ByteDance Ltd. Our only relationship with these platforms is through their advertising services to promote our educational content.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export async function getStaticProps() {
  try {
    const productSettings = await getProductSettings();
    return { props: { productSettings }, revalidate: 86400 };
  } catch (error) {
    return {
      props: {
        productSettings: {
          productName: 'KelasGPT - Teknik Prompting Gambar AI',
          productPrice: 37.00,
          baseproductprice: 99.00,
          allowdiscount: true,
          discountunitleft: 15,
          discountunittotal: 50
        }
      },
      revalidate: 86400
    };
  }
}