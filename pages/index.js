import { useEffect, useState } from 'react';
import { trackPageView, getOrCreateVisitorId } from '../lib/simpleTracking';
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import styles from "@/styles/Home.module.css";
import SocialProof from "@/components/SocialProof"; // Assuming this component exists and works
import { getProductSettings, formatPrice } from "../lib/settings";
import { imagePresets, getBlurDataURL, getImageSizes } from "../lib/imagekit";
import { trackViewContent } from "../lib/facebook-pixel";
// import { ResponsiveImage } from '../components/ResponsiveImage';

// Swiper components and modules
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';

// Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

// --- SVG Icon Components ----
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

const FileTextIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
        <polyline points="14,2 14,8 20,8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
        <polyline points="10,9 9,9 8,9"/>
    </svg>
);

const DatabaseIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <ellipse cx="12" cy="5" rx="9" ry="3"/>
        <path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5"/>
        <path d="M3 12c0 1.66 4.03 3 9 3s9-1.34 9-3"/>
    </svg>
);

const ZapIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
);

const InfinityIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M17 12c0-1.76-1.24-3-3-3s-3 1.24-3 3 1.24 3 3 3 3-1.24 3-3zM7 12c0-1.76-1.24-3-3-3s-3 1.24-3 3 1.24 3 3 3 3-1.24 3-3z"/>
        <path d="M7 12h10"/>
    </svg>
);


export default function Home({ productSettings }) {
  const [expandedModules, setExpandedModules] = useState({});
  const [visitorId, setVisitorId] = useState(null);

  const toggleModule = (moduleId) => {
    setExpandedModules(prev => {
      const isCurrentlyExpanded = prev[moduleId];
      if (isCurrentlyExpanded) {
        // If clicking on an expanded module, just collapse it
        return {
          ...prev,
          [moduleId]: false
        };
      } else {
        // If clicking on a collapsed module, collapse all others and expand this one
        return {
          [moduleId]: true
        };
      }
    });
  };

  const formatSavings = (amount) => {
    return `RM${amount.toLocaleString('en-MY')}`;
  };

  const calculateProgress = (total, left) => {
    const numTotal = Number(total) || 0;
    const numLeft = Number(left) || 0;
    const claimed = numTotal - numLeft;
    const percentage = numTotal > 0 ? (claimed / numTotal * 100) : 0;
    return Math.max(0, Math.min(100, percentage));
  };

  const [checkoutUrl, setCheckoutUrl] = useState('/checkout');

  useEffect(() => {
    const id = getOrCreateVisitorId();
    setVisitorId(id);
    trackPageView('/', id);

    // Only append visitor ID if it exists
    if (id) {
      setCheckoutUrl(`/checkout?vid=${id}`);
    }
    
    // Track ViewContent event for Facebook Pixel - Simple and reliable
    if (productSettings) {
      trackViewContent({
        productName: productSettings.productName,
        productPrice: productSettings.productPrice,
        productId: 'kelasgpt-course',
        category: 'education'
      });
    }
  }, [productSettings]);


  return (
    <div className={styles.pageWrapper}>
      <Head>
        <title>KelasGPT - Kuasai AI Untuk Gandakan Produktiviti Anda</title>
        <meta
          name="description"
          content="Belajar &amp; Kuasai Kecerdasan Buatan (AI) dan Large Language Models (LLM) untuk mempercepat kerja, menaik taraf kemahiran, dan menjimatkan masa. Sertai KelasGPT hari ini!"
        />
        <meta property="og:title" content="KelasGPT - Kuasai AI Untuk Gandakan Produktiviti Anda" />
        <meta
          property="og:description"
          content="Kursus video online non-teknikal yang direka untuk profesional, pelajar, dan pemilik bisnes kecil di Malaysia."
        />
        <meta property="og:image" content="/og-image.png" /> {/* Make sure you have a compelling OG image */}
        <meta property="og:url" content="https://kelasgpt.com" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* The SocialProof component is kept as requested */}
      {/* <SocialProof /> */}


      <main className={styles.main}>
        {/* --- Hero Section --- */}
        <section className={`${styles.section} ${styles.hero}`}>
          <div className="container">

            {/* Pill Element */}
            <div className={styles.heroPill}>
              <span className={styles.heroPillText}>Belajar AI Tanpa Technical Background..</span>
            </div>

            {/* Main Headline */}
            <h1 className={styles.heroTitle}>
              <span>
                &lsquo;Open Secret&rsquo; Yang<br />
                Hanya AI Engineers Tahu..<br />
                <span className={styles.emphasis}>3-Step Formula,</span> Khusus Untuk <span className={styles.emphasis}>Melatih</span> AI Expert Anda
                <div className={styles.heroSeparator}></div>
              </span>
            </h1>

            {/* Main Sub Headline */}
            <h2 className={styles.heroSubTitle}>
              <span>
                Formula Yang Sama AI Experts Ini <span className={styles.emphasis}>Dilatih </span>
                Untuk Anda Build & Launch Profitable Digital Business...<br />
                <span className={styles.emphasis}>Kurang Dari 24 Jam!</span>
              </span>
            </h2>

            {/* Hero Visual Element */}
            <div className={styles.heroVisual}>
              <Image 
                src={imagePresets.hero('hero-main', { quality: 'q_85' })}
                alt="KelasGPT 3 Experts profile Card Visual" 
                width={600} 
                height={400} 
                style={{width: '100%', height: 'auto'}} 
                loading="eager"
                priority
                placeholder="blur"
                blurDataURL={getBlurDataURL('hero-main')}
                sizes={getImageSizes('hero')}
              />
              <p className={styles.heroVisualCaption}>
                <em style={{fontSize: '0.9em'}}>(Antara Expert AI Yang Disediakan)</em>
              </p>
            </div>

            {/* Enhanced Subtext (As Hero Image Caption) */}
            <div className={styles.heroContent}>
              <div className={styles.heroTeaser}>
                <h3>Apa Yang Anda Akan Dapat:</h3>
                
                <ul className={styles.heroList}>
                  <li><span className={styles.emphasis}>Video AI Masterclass</span> Fahamkan cara AI Berfikir, Teknik Prompt Advanced untuk Maximum Output</li>
                  <li><span className={styles.emphasis}>3-Step Formula Rahsia</span> untuk latih AI jadi Personal Expert Consultant (Bina Expert Consultant Anda Sendiri!)</li>
                  <li><span className={styles.emphasis}>5 Done-For-You Expert Consultant</span> - Product Ideation, Branding, Copywriting, VEO 3 Prompt Director & Web Development (No-Code) specialist</li>
                  <li><span className={styles.emphasis}>Source Files</span> Setiap Expert Consultant yang anda boleh guna dengan mana-mana AI platform (supaya anda tidak terikat dengan ChatGPT sahaja)</li>
                  <li><span className={styles.emphasis}>Step-by-Step Demo Video Tutorial</span> - Complete Workflow dari cari idea sampai launch profitable digital business dalam 24 jam</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* --- Body Lead Section --- */}
        <section className={`${styles.section} ${styles.notJustPrompts}`}>
            <div className="container">
                <h2 className={styles.notJustPrompts}>Ini Bukan Sekadar Kelas AI Biasa!</h2>
                <div className={styles.salesContent}>
                    <p>Assalamualaikum,</p>
                    
                    <p>Kalau anda sedang mencari cara untuk <strong>betul-betul belajar AI untuk Bisnes</strong>..</p>
                    
                    <p>Bukan sekadar beli ready-made GPTs atau Prompt Pack yang generic, tapi tak tahu cara optimize..</p>
                    
                    <p><strong>Teruskan membaca.</strong></p>
                    
                    <p>Sebab dalam masa 3 minit ni, anda akan faham kenapa 90% orang yang guna AI tools masih tak dapat results yang diharapkan..</p>
                    
                    <p>Dan macam mana <span className={styles.highlight}>3-Step Formula</span> yang anda akan belajar untuk latih ChatGPT yang biasa dan generic.. <em>(atau Gemini/Claude/Grok - mana-mana platform pilihan anda)</em></p>
                    
                    <p>Untuk jadi <strong>Team Expert Consultant</strong> personal anda, bernilai lebih RM200K+ setahun.</p>
                    
                    <p>Tak kira anda complete beginner atau dah ada experience dengan AI..</p>
                    
                    <p><strong>3-Step Formula yang simple ni akan unlock true potential AI untuk anda.</strong></p>
                    
                </div>
            </div>
        </section>

        {/* --- Deep Dive Reality Check Section --- */}
        <section className={`${styles.section} ${styles.grey}`}>
            <div className="container">
                <div className={styles.sectionHeader}>
                    <h2>Kenapa Kena Belajar Secara Deep Dive?</h2>
                    <p>Belajar Cara Prompt Dengan Betul Tak Cukup Ke?</p>
                </div>
                
                <div className={styles.lessonPill}>
                    <span className={styles.lessonNumber}>01</span>
                    <span className={styles.lessonDivider}></span>
                    <span className={styles.lessonText}>Lesson Dari Tiktok Creator</span>
                </div>
                
                <div className={styles.salesContent}>
                    <p>Ramai je creator kita boleh hasilkan video yang menarik dan engaging.</p>
                    
                    <p>And ramai juga yang ada moment viral mereka tersendiri..</p>
                    
                    <p><strong>Cuba fikir..</strong></p>

                    <p>Kalau anda content creator.. dan anda tahu algo tiktok akan check kalau engagement rate sama..</p>

                    <p>Dia akan prioritise content yang durasi lebih lama dulu..</p>

                    <p style={{fontSize: '1.2rem', fontWeight: '700', color: 'var(--urgent-red)', margin: '1.5rem 0'}}><strong>Adakah strategy anda akan berubah?</strong></p>
                </div>

                <br />
                <br />

                <div className={styles.lessonPill}>
                    <span className={styles.lessonNumber}>02</span>
                    <span className={styles.lessonDivider}></span>
                    <span className={styles.lessonText}>Perangkap AI Yang Confident</span>
                </div>
                
                <div className={styles.salesContent}>
                    <p><strong>AI pun exactly sama.</strong></p>

                    <p>Cuma, situasi AI ni lebih rumit..</p>
                    
                    <p>Ada orang, tak pandai prompt.. sebab tak pernah belajar.</p>
                    
                    <p><strong>Exactly macam TikTok creator yang tak faham algorithm.</strong></p>
                    
                    <p>Mereka akan stuck dalam cycle trial-and-error forever.</p>
                    
                    <p>Sedangkan your competitor, yang faham the essentials...</p>
                    
                    <p><span className={styles.highlight}>Dapat predictable, high-quality results every single time.</span></p>
                </div>
            
            </div>
        </section>

        {/* --- Authority Building Section --- */}
        <section className={`${styles.section} ${styles.authoritySection}`}>
          <div className="container">
            <div className={styles.sectionHeader}>
              <h2>Sebelum Saya Terangkan Dengan Detail Tentang KelasGPT Ni..</h2>
              <p className={styles.sectionSubtitle}><br />Mungkin Saya Patut Perkenalkan Diri Saya Dulu..</p>
            </div>
            <div className={styles.authorProfile}>
              <div className={styles.authorImage}>
                <Image 
                    src={imagePresets.profile('author-photo')} 
                    alt="Fareid - KelasGPT Instructor" 
                    width={500} 
                    height={500} 
                    style={{width: '100%', height: 'auto'}} 
                    loading="lazy"
                    placeholder="blur"
                    blurDataURL={getBlurDataURL('author-photo')}
                    sizes={getImageSizes('profile')}
                />
              </div>
              <div className={styles.authorContent}>
                <h3>Hi, Saya Fareid Zulkifli</h3>
                <div className={styles.salesContent}>
                  <p>Kalau nama saya kedengaran familiar..</p>
                  
                  <p>Mungkin sebab anda pernah nampak atau menggunakan hasil kerja saya sebelum ini.</p>
                  
                  <p>Sebab sejak tahun 2020..</p>
                  
                  <p>Saya pernah publish beberapa open-source financial indicator di <strong>TradingView</strong>, platform analisis kewangan <strong>global</strong> paling popular</p>
                  
                  <p>Yang mana <span className={styles.emphasis}>dua hasil saya dipilih sebagai Editor&rsquo;s Pick</span> oleh platform itu sendiri,</p>
                  
                  <div className={styles.tradingViewProof}>
                    <Image 
                        src={imagePresets.content('tradingview-proof')} 
                        alt="TradingView Editor&rsquo;s Pick Screenshot" 
                        className={styles.tradingViewImage} 
                        width={800} 
                        height={600} 
                        style={{width: '100%', height: 'auto'}} 
                        loading="lazy"
                        placeholder="blur"
                        blurDataURL={getBlurDataURL('tradingview-proof')}
                        sizes={getImageSizes('content')}
                    />
                  </div>
                  
                  <p>Tapi ini cuma satu dari &lsquo;hobby project&rsquo; saya..</p>
                  
                  <p>Kerja hakiki saya, dengan lebih <strong>8 tahun pengalaman sebagai Lead Business Consultant</strong> dalam beberapa company IT..</p>
                  
                  <p>Banyak niche yang perlukan Teknologi Atau AI implementation ni, saya pernah sentuh..</p>

                  <p><strong>Antaranya:</strong></p>

                  <div className={styles.projectsList}>
                    <div className={styles.projectItem}>
                      <CheckCircleIcon className={styles.projectIcon} />
                      Trading Algorithm
                    </div>
                    <div className={styles.projectItem}>
                      <CheckCircleIcon className={styles.projectIcon} />
                      Loan Evaluation Engine untuk Banking
                    </div>
                    <div className={styles.projectItem}>
                      <CheckCircleIcon className={styles.projectIcon} />
                      AI Chatbot untuk SME
                    </div>
                    <div className={styles.projectItem}>
                      <CheckCircleIcon className={styles.projectIcon} />
                      AI Intergration untuk Sales Platform
                    </div>
                    <div className={styles.projectItem}>
                      <CheckCircleIcon className={styles.projectIcon} />
                      HR Policy Management System
                    </div>
                  </div>

                  <p>Dan tujuan saya ceritakan semua ni ialah supaya anda faham..</p>

                  <p>Dari Traders Atau Real Businesses</p>

                  <p><strong>Problem yang mereka semua alami sama je..</strong></p>

                  <p>Mereka selalu overestimate kebolehan AI ni dalam unrealistic ways..</p>
                  
                  <p>Tapi underestimate macam mana creative use of teknologi ni boleh bantu kerja atau bisnes mereka..</p>

                  <p><strong>Tapi bila mereka faham</strong> apa yang berlaku &lsquo;behind the scene&rsquo; sistem yang mereka nak guna tu..</p>
                  
                  <p><strong>Tak perlu faham coding pun..</strong></p>
                  
                  <p><span className={styles.highlight}>Simply faham actual logic dan algorithm disebalik sistem</span> yang mereka guna,<br />Cara mereka bekerja terus berubah.</p>
                  
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- Use Cases with Visual Proof --- */}
        <section className={styles.section}>
            <div className="container">
                <div className={styles.sectionHeader}>
                    <h2>Apa Anda Boleh Buat Bila Faham Cara AI Berfikir</h2>
                    <p>Semua yang saya tunjuk ni, hanyalah basic use case.. Anda akan belajar lebih banyak use case yang lebih advance..</p>
                </div>
                <div className={styles.useCasesGrid}>
                    <div className={styles.useCaseCard}>
                        <div className={styles.useCaseImage}>
                            <Image 
                                src={imagePresets.content('writing-sample')} 
                                alt="AI Writing Style Sample" 
                                width={800} 
                                height={500} 
                                style={{width: '100%', height: 'auto'}} 
                                loading="lazy"
                                placeholder="blur"
                                blurDataURL={getBlurDataURL('writing-sample')}
                                sizes={getImageSizes('content')}
                            />
                        </div>
                        <div className={styles.useCaseContent}>
                            <div className={styles.useCaseTitle}>Use Case 1</div>
                            <h4>Content Penulisan</h4>
                            <p>Nak buat content penulisan seperti social media, copywriting, article? Apply je guna framework yang diajar, anda akan dapat hasil yang sesuai dengan gaya penulisan anda, content yang anda sendiri faham, bukan sekadar copy-paste macam orang lain.</p>
                        </div>
                    </div>
                    
                    <div className={styles.useCaseCard}>
                        <div className={styles.useCaseImage}>
                            <Image 
                                src={imagePresets.content('sales-report-sample')} 
                                alt="AI Sales Report Sample" 
                                width={800} 
                                height={500} 
                                style={{width: '100%', height: 'auto'}} 
                                loading="lazy"
                                placeholder="blur"
                                blurDataURL={getBlurDataURL('sales-report-sample')}
                                sizes={getImageSizes('content')}
                            />
                        </div>
                        <div className={styles.useCaseContent}>
                            <div className={styles.useCaseTitle}>Use Case 2</div>
                            <h4>Analisis Data Dan Reporting</h4>
                            <p>Guna framework yang sama, anda boleh ubah raw data dari file excel atau csv, dapatkan analisis data penuh, buat full report atau dapatkan business insight yang actually grounded dan bukan halusinasi. Semua dalam 5-7 minit sahaja!</p>
                        </div>
                    </div>
                    
                    <div className={styles.useCaseCard}>
                        <div className={styles.useCaseImage}>
                            <Image 
                                src={imagePresets.content('infographic-sample')} 
                                alt="AI Infographic Sample" 
                                width={800} 
                                height={500} 
                                style={{width: '100%', height: 'auto'}} 
                                loading="lazy"
                                placeholder="blur"
                                blurDataURL={getBlurDataURL('infographic-sample')}
                                sizes={getImageSizes('content')}
                            />
                        </div>
                        <div className={styles.useCaseContent}>
                            <div className={styles.useCaseTitle}>Use Case 3</div>
                            <h4>Infographic dan Presentation</h4>
                            <p>Sedang orang lain masih mengharapkan prompt orang lain, yang selalunya generic.. Anda sudah few steps ahead dan boleh hasilkan &lsquo;well-thought&rsquo; material yang anda perlukan.</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        {/* --- KelasGPT Main Benefits Section --- */}
        <section className={`${styles.section} ${styles.benefitKelasSection}`}>
          <div className="container">
            <div className={styles.sectionHeader}>
              <h2>BONUS: 3 Ready-Made Custom AI Experts</h2>
              <p><strong>Not only that... anda juga akan dapat 3 powerful ready-made custom AI experts!</strong></p>
              
              <p>Untuk achieve semua benefit di atas, anda perlukan tools yang tepat.</p>
              
              <p>Dan saya dah setup untuk anda - <em>tinggal copy & paste sahaja</em>.</p>
              
              <p><strong>Sekali setup, guna seumur hidup untuk mana-mana kerja atau business anda ada.</strong></p>
            </div>

            {/* Benefit 1: Copywriter (Images Left + Description Right) */}
            <div className={styles.benefitKelasShowcase}>
              <div className={styles.benefitKelasDescription}>
                
                <div className={styles.benefitKelasHeader}>
                  <div className={styles.benefitKelasNumber}>Benefit #1</div>
                  <h3>AI Copywriter Expert</h3>
                </div>
                                
                <Image 
                  src={imagePresets.benefit('parksaejin')}
                  alt="Instant Professional Analysis" 
                  width={120} 
                  height={120} 
                  style={{width: '100%', height: '100%'}} 
                  loading="lazy"
                  placeholder="blur"
                  blurDataURL={getBlurDataURL('parksaejin')}
                  sizes={getImageSizes('benefit')}
                  className={styles.benefitKelasImages}
                />
                
                <div className={styles.benefitKelasBadge}>COPY & PASTE TEMPLATE</div>
                <h4>Professional Copywriter & Content Strategist</h4>
                <p><strong>Achieve Benefit #3: Consistent Quality Output</strong></p>
                <p>Master copywriter untuk sales pages, email campaigns, social media content, proposals, dan presentations. Dia analyze target audience, craft compelling headlines, dan ensure setiap piece of content convert.</p>
                
                <div className={styles.benefitKelasFeatures}>
                  <div className={styles.feature}>Sales copy yang convert tinggi</div>
                  <div className={styles.feature}>Professional presentations & reports</div>
                  <div className={styles.feature}>Email marketing campaigns</div>
                  <div className={styles.feature}>Social media content strategy</div>
                </div>
                
                <p className={styles.benefitKelasResult}><em>Boss tak pernah minta revise lagi sebab output anda selalu spot-on.</em></p>
              </div>
            </div>

            {/* Benefit 2: Personal Manager (Description Left + Images Right) */}
            <div className={styles.benefitKelasShowcase}>
              <div className={styles.benefitKelasDescription}>
                
                <div className={styles.benefitKelasHeader}>
                  <div className={styles.benefitKelasNumber}>EXPERT #2</div>
                  <h3>AI Personal Manager Expert</h3>
                </div>
                
                <Image 
                    src={imagePresets.benefit('parksaejin')}
                    alt="Instant Professional Analysis" 
                    width={120} 
                    height={120} 
                    style={{width: '100%', height: '100%'}} 
                    loading="lazy"
                    placeholder="blur"
                    blurDataURL={getBlurDataURL('parksaejin')}
                    sizes={getImageSizes('benefit')}
                    className={styles.benefitKelasImages}
                  />
                <div className={styles.benefitKelasBadge}>READY-TO-USE TEMPLATE</div>
                <h4>Project Management & Productivity Specialist</h4>
                <p><strong>Achieve Benefit #2: Effortless Task Management</strong></p>
                <p>Personal manager yang handle task prioritization, project planning, deadline management, dan resource allocation. Dia analyze workload anda, identify bottlenecks, dan bagi step-by-step action plan untuk maximize productivity.</p>
                
                <div className={styles.benefitKelasFeatures}>
                  <div className={styles.feature}>Smart task prioritization matrix</div>
                  <div className={styles.feature}>Project timeline & milestone tracking</div>
                  <div className={styles.feature}>Team delegation recommendations</div>
                  <div className={styles.feature}>Productivity optimization insights</div>
                </div>
                
                <p className={styles.benefitKelasResult}><em>Tak pernah overwhelmed lagi - AI handle semua planning untuk anda.</em></p>
              </div>
            </div>

            {/* Benefit 3: Content Creator (Images Left + Description Right) */}
            <div className={styles.benefitKelasShowcase}>
              <div className={styles.benefitKelasDescription}>

                <div className={styles.benefitKelasHeader}>
                  <div className={styles.benefitKelasNumber}>EXPERT #3</div>
                  <h3>AI Content Creator Expert</h3>
                </div>

                <Image 
                    src={imagePresets.benefit('parksaejin')}
                    alt="Instant Professional Analysis" 
                    width={120} 
                    height={120} 
                    style={{width: '100%', height: '100%'}} 
                    loading="lazy"
                    placeholder="blur"
                    blurDataURL={getBlurDataURL('parksaejin')}
                    sizes={getImageSizes('benefit')}
                    className={styles.benefitKelasImages}
                  />
                <div className={styles.benefitKelasBadge}>PROFESSIONAL-GRADE TEMPLATE</div>
                <h4>Universal Content Creator & Strategy Expert</h4>
                <p><strong>Achieve Benefit #1 & #4: Professional Analysis + Universal Problem Solving</strong></p>
                <p>Master content strategist untuk any industry - finance, marketing, operations, HR. Dia create engaging content, analyze performance metrics, optimize untuk different platforms, dan ensure brand consistency across all channels.</p>
                
                <div className={styles.benefitKelasFeatures}>
                  <div className={styles.feature}>Multi-platform content strategy</div>
                  <div className={styles.feature}>Brand voice consistency</div>
                  <div className={styles.feature}>Performance analytics & optimization</div>
                  <div className={styles.feature}>Cross-industry adaptability</div>
                </div>
                
                <p className={styles.benefitKelasResult}><em>One expert untuk solve any professional content challenge.</em></p>
              </div>
            </div>
            
            <div className={styles.salesContent} style={{textAlign: 'center', marginTop: '4rem'}}>
              <h3><strong>Semua Experts ni Done-For-You!</strong></h3>
              <p>Zero technical setup required.</p>
              
              <p>Each expert direka specifically untuk achieve the exact benefits yang saya mention dalam section atas.</p>
              
              <p>And the best part?</p>
              
              <p><strong>Sekali anda dapat sekali fail-fail yang saya gunakan untuk setup semua expert ni.</strong></p>
              
              <p>TAPI kalau anda betul-betul nak maximize these experts, anda kena faham <span className={styles.emphasis}>cara AI berfikir (Module 2)</span> dan <span className={styles.emphasis}>advanced prompting techniques (Module 4)</span>.</p>
              
              <p>Sebab bila faham foundation...</p>
              
              <p><strong>Anda boleh:</strong></p>
              
              <ul style={{textAlign: 'left', maxWidth: '600px', margin: '1rem auto'}}>
                <li>Customize each expert untuk specific needs industry anda</li>
                <li>Troubleshoot bila AI bagi unexpected results</li>
                <li>Create your own specialized experts untuk niche applications</li>
                <li>Scale the benefits across any career change atau business pivot</li>
                <li>Combine multiple experts untuk complex professional challenges</li>
              </ul>
              
              <p><br />Dan sebelum saya tunjuk silibus terperinci setiap modul yang KelasGPT ajar...</p>
            </div>
          </div>
        </section>

        {/* --- Bonus CustomGPT Expert Section --- */}
        {/* <section className={`${styles.section} ${styles.customExpertsSection}`}>
          <div className="container">
            <div className={styles.sectionHeader}>
              <h2>6 Custom Expert Yang Akan Buat Competitors Anda Tertanya-tanya</h2>
              <p><strong>Sementara colleagues anda masih struggle dengan basic ChatGPT...</strong></p>
              
              <p>Anda dah ada personal team of specialists yang kerja 24/7 untuk multiply your professional output.</p>
              
              <p><strong>Bayangkan tengah deadline pressure, tapi instead of panic...</strong></p>
              
              <p>Anda chill sebab tahu dalam 15 minit, anda boleh produce quality work yang biasanya ambil masa 3-4 hari.</p>
              
              <p>Video campaigns yang viral. Web applications yang sophisticated. Marketing angles yang competitors tak terfikir. Data insights yang impress management.</p>
              
              <p><strong>Yang best part? Setup sekali je. Guna forever.</strong></p>
              
              <p>Mana-mana industry anda pindah, mana-mana business anda start - these 6 experts ikut anda. <em>Macam ada unfair advantage yang orang lain tak tahu.</em></p>
            </div>
            
            <div className={styles.customExpertsGrid}>
              <div className={styles.customExpertCard}>
                <div className={styles.customExpertImage}>
                  <Swiper
                  autoHeight={true}
                  modules={[Navigation, Pagination, Autoplay]}
                  spaceBetween={10}
                  navigation={true}
                  pagination={{ clickable: true }}
                  autoplay={{ delay: 3500, disableOnInteraction: true }}
                  loop={true}
                  className={styles.customExpertImageSwiper}
                  >
                    <SwiperSlide>
                      <div className={styles.customExpertImageContainer}>
                        <Image 
                          src={imagePresets.benefit('irfan-photo')}
                          alt="Irfan - VEO 3 Creative Director Expert" 
                          fill
                          style={{objectFit: 'contain'}} 
                          loading="lazy"
                        />
                      </div>
                    </SwiperSlide>
                    <SwiperSlide>
                      <div className={styles.customExpertImageContainer}>
                        <Image 
                          src={imagePresets.benefit('irfan-profile')}
                          alt="Professional Video Creation Expert" 
                          fill
                          style={{objectFit: 'contain'}} 
                          loading="lazy"
                        />
                      </div>
                    </SwiperSlide>
                  </Swiper>             
                </div>
                <div className={styles.customExpertContent}>
                  <div className={styles.customExpertTitle}>EXPERT #1 - IRFAN</div>
                  <h4>Master Video Creation dengan VEO 3</h4>
                  <p><strong>Bayangkan kalau anda boleh:</strong> Cipta video professional-grade dalam minit je guna Google&quot;s VEO 3. Tak perlu equipment mahal, tak perlu skill video editing - cuma prompt yang tepat. Irfan akan ajar exact prompts untuk viral content, product videos, dan marketing materials yang convert tinggi. <em>Revolutionary video prompting techniques.</em></p>
                </div>
              </div>
              
              <div className={styles.customExpertCard}>
                <div className={styles.customExpertImage}>
                  <Swiper
                  modules={[Navigation, Pagination, Autoplay]}
                  spaceBetween={10}
                  navigation={true}
                  pagination={{ clickable: true }}
                  autoplay={{ delay: 3500, disableOnInteraction: true }}
                  loop={true}
                  className={styles.customExpertImageSwiper}
                  >
                    <SwiperSlide>
                      <div className={styles.customExpertImageContainer}>
                        <Image 
                          src={imagePresets.benefit('zaki-photo')}
                          alt="Zaki - Mini vibe Coder Consultant Expert" 
                          fill
                          style={{objectFit: 'contain'}} 
                          loading="lazy"
                        />
                      </div>
                    </SwiperSlide>
                    <SwiperSlide>
                      <div className={styles.customExpertImageContainer}>
                        <Image 
                          src={imagePresets.benefit('zaki-profile')}
                          alt="Web Application Development Expert" 
                          fill
                          style={{objectFit: 'contain'}} 
                          loading="lazy"
                        />
                      </div>
                    </SwiperSlide>
                  </Swiper>
                </div>
                <div className={styles.customExpertContent}>
                  <div className={styles.customExpertTitle}>EXPERT #2 - ZAKI</div>
                  <h4>Build Web Apps Tanpa Coding Skills</h4>
                  <p><strong>Tak pernah takut technology lagi:</strong> Zaki ajar non-technical people macam mana nak build professional web applications guna LLM from scratch. Landing pages, e-commerce sites, booking systems - semua boleh buat sendiri tanpa hire expensive developers. Save RM20,000++. <em>No-code development mastery dengan AI assistance.</em></p>
                </div>
              </div>
              
              <div className={styles.customExpertCard}>
                <div className={styles.customExpertImage}>
                  <Swiper
                  modules={[Navigation, Pagination, Autoplay]}
                  spaceBetween={10}
                  navigation={true}
                  pagination={{ clickable: true }}
                  autoplay={{ delay: 3500, disableOnInteraction: true }}
                  loop={true}
                  className={styles.customExpertImageSwiper}
                  >
                    <SwiperSlide>
                      <div className={styles.customExpertImageContainer}>
                        <Image 
                          src={imagePresets.benefit('sarah-photo')}
                          alt="Sarah - Intuitive Marketing Angle Expert" 
                          fill
                          style={{objectFit: 'contain'}} 
                          loading="lazy"
                        />
                      </div>
                    </SwiperSlide>
                    <SwiperSlide>
                      <div className={styles.customExpertImageContainer}>
                        <Image 
                          src={imagePresets.benefit('sarah-profile')}
                          alt="Marketing Angle Discovery Expert" 
                          fill
                          style={{objectFit: 'contain'}} 
                          loading="lazy"
                        />
                      </div>
                    </SwiperSlide>
                  </Swiper>
                </div>
                <div className={styles.customExpertContent}>
                  <div className={styles.customExpertTitle}>EXPERT #3 - SARAH</div>
                  <h4>Discover Winning Marketing Angles</h4>
                  <p><strong>Tak pernah confuse tentang messaging lagi:</strong> Sarah uncover hidden marketing angles yang your competitors tak nampak. Dia analyze market psychology, identify emotional triggers, dan craft messaging yang resonate dengan your target audience. Campaign anda convert 300% better. <em>Intuitive angle discovery frameworks.</em></p>
                </div>
              </div>
              
              <div className={styles.customExpertCard}>
                <div className={styles.customExpertImage}>
                  <Swiper
                  modules={[Navigation, Pagination, Autoplay]}
                  spaceBetween={10}
                  navigation={true}
                  pagination={{ clickable: true }}
                  autoplay={{ delay: 3500, disableOnInteraction: true }}
                  loop={true}
                  className={styles.customExpertImageSwiper}
                  >
                    <SwiperSlide>
                      <div className={styles.customExpertImageContainer}>
                        <Image 
                          src={imagePresets.benefit('balqis-photo')}
                          alt="Balqis - Friendly Productivity Coach Expert" 
                          fill
                          style={{objectFit: 'contain'}} 
                          loading="lazy"
                        />
                      </div>
                    </SwiperSlide>
                    <SwiperSlide>
                      <div className={styles.customExpertImageContainer}>
                        <Image 
                          src={imagePresets.benefit('balqis-profile')}
                          alt="Productivity Coach Expert" 
                          fill
                          style={{objectFit: 'contain'}} 
                          loading="lazy"
                        />
                      </div>
                    </SwiperSlide>
                  </Swiper>
                </div>
                <div className={styles.customExpertContent}>
                  <div className={styles.customExpertTitle}>EXPERT #4 - BALQIS</div>
                  <h4>Conquer Procrastination Forever</h4>
                  <p><strong>Tak pernah procrastinate lagi:</strong> Balqis bukan just bagi motivational quotes. Dia identify ROOT CAUSE kenapa anda delay tasks, design personalized productivity systems, dan bagi step-by-step action plans yang actually work. Morning routine, focus techniques, energy management - semua custom untuk your lifestyle. <em>Psychology-based productivity mastery.</em></p>
                </div>
              </div>
              
              <div className={styles.customExpertCard}>
                <div className={styles.customExpertImage}>
                  <Swiper
                  modules={[Navigation, Pagination, Autoplay]}
                  spaceBetween={10}
                  navigation={true}
                  pagination={{ clickable: true }}
                  autoplay={{ delay: 3500, disableOnInteraction: true }}
                  loop={true}
                  className={styles.customExpertImageSwiper}
                  >
                    <SwiperSlide>
                      <div className={styles.customExpertImageContainer}>
                        <Image 
                          src={imagePresets.benefit('chaeha-photo')}
                          alt="Chaeha - Engaging Hook Specialist Expert" 
                          fill
                          style={{objectFit: 'contain'}} 
                          loading="lazy"
                        />
                      </div>
                    </SwiperSlide>
                    <SwiperSlide>
                      <div className={styles.customExpertImageContainer}>
                        <Image 
                          src={imagePresets.benefit('chaeha-profile')}
                          alt="Hook Specialist Expert" 
                          fill
                          style={{objectFit: 'contain'}} 
                          loading="lazy"
                        />
                      </div>
                    </SwiperSlide>
                  </Swiper>
                </div>
                <div className={styles.customExpertContent}>
                  <div className={styles.customExpertTitle}>EXPERT #5 - CHAEHA</div>
                  <h4>Craft Scroll-Stopping Hooks</h4>
                  <p><strong>Audience anda tak boleh scroll past content anda:</strong> Chaeha master art of attention-grabbing. Dia study psychology behind viral content, analyze trending patterns, dan teach exact formulas untuk hooks yang make people STOP and ENGAGE. Facebook ads, LinkedIn posts, email subject lines - semua convert 10x better. <em>Proven hook psychology frameworks.</em></p>
                </div>
              </div>

              <div className={styles.customExpertCard}>
                <div className={styles.customExpertImage}>
                  <Swiper
                  modules={[Navigation, Pagination, Autoplay]}
                  spaceBetween={10}
                  navigation={true}
                  pagination={{ clickable: true }}
                  autoplay={{ delay: 3500, disableOnInteraction: true }}
                  loop={true}
                  className={styles.customExpertImageSwiper}
                  >
                    <SwiperSlide>
                      <div className={styles.customExpertImageContainer}>
                        <Image 
                          src={imagePresets.benefit('ikram-photo')}
                          alt="Ikram - Sophisticated Data Storyteller Expert" 
                          fill
                          style={{objectFit: 'contain'}} 
                          loading="lazy"
                        />
                      </div>
                    </SwiperSlide>
                    <SwiperSlide>
                      <div className={styles.customExpertImageContainer}>
                        <Image 
                          src={imagePresets.benefit('ikram-profile')}
                          alt="Data Storyteller Expert" 
                          fill
                          style={{objectFit: 'contain'}} 
                          loading="lazy"
                        />
                      </div>
                    </SwiperSlide>
                  </Swiper>
                </div>
                <div className={styles.customExpertContent}>
                  <div className={styles.customExpertTitle}>EXPERT #6 - IKRAM</div>
                  <h4>Transform Data Into Compelling Stories</h4>
                  <p><strong>Data tak boring lagi:</strong> Ikram ambil raw numbers, spreadsheets, atau complex analytics dan transform jadi insightful stories yang management faham. Boardroom presentations, quarterly reports, business proposals - semua data-driven tapi engaging. Boss anda akan impressed dengan your analytical depth. <em>Executive-level data storytelling mastery.</em></p>
                </div>
              </div>
            </div>
            
            <div className={styles.salesContent} style={{textAlign: 'center', marginTop: '3rem'}}>
              <p><strong>Tapi ini semua impossible kalau anda still stuck dengan generic AI prompts...</strong></p>
              
              <p>Sementara anda tengah Google &ldquo;how to use ChatGPT for work&rdquo;, your competitors dah master private AI workforce yang most people tak tahu wujud.</p>
              
              <p><strong>Here&quot;s what separates winners from wannabes:</strong></p>
              
              <p>Winners understand AI psychology. They know exactly how to architect prompts yang produce consistent professional results. Every single time.</p>
              
              <p>Wannabes copy-paste random prompts from Facebook groups dan wonder kenapa results tak consistent.</p>
              
              <p style={{fontSize: '1.2rem', fontWeight: '700', margin: '2rem 0', color: 'var(--terra-primary)'}}>The gap is widening every month.</p>
              
              <p><strong>6 bulan dari sekarang, ada dua jenis professionals:</strong></p>
              
              <p>Those yang mastered AI workforce systems (getting promoted, launching successful businesses, working less stress) dan those yang still struggling dengan basic AI tools (falling behind, working weekends, feeling overwhelmed).</p>
              
              <p><strong>Which one anda mahu jadi?</strong></p>
              
              <p><strong>The difference? They master the 3 psychological foundations yang 99% people ignore:</strong></p>
              
              <div className={styles.learnGrid} style={{marginTop: '2rem'}}>
                <div className={styles.learnItem}>
                  <CheckCircleIcon />
                  <h3>AI Psychology Mastery - Predict exactly how AI akan respond sebelum you even send the prompt</h3>
                </div>
                <div className={styles.learnItem}>
                  <CheckCircleIcon />
                  <h3>Context Control - Make AI remember your preferences, style, dan requirements automatically</h3>
                </div>
                <div className={styles.learnItem}>
                  <CheckCircleIcon />
                  <h3>Professional Prompt Architecture - Build prompts yang deliver executive-level results every time</h3>
                </div>
                <div className={styles.learnItem}>
                  <CheckCircleIcon />
                  <h3>Context Design Workflow - Universal problem-solving framework</h3>
                </div>
              </div>
              
              <p style={{marginTop: '2rem', fontSize: '1.2rem'}}>These are the EXACT foundations yang separate professionals making RM80K dari those making RM200K+. <span className={styles.emphasis}>Anda master semua ni dalam Module 2 & Module 4.</span></p>
              
              <p><strong>Tapi here&quot;s the thing...</strong></p>
              
              <p>Even kalau anda faham psychology behind AI, you still need the TOOLS.</p>
              
              <p>You need the exact prompts. The templates. The step-by-step systems.</p>
              
              <p><strong>That&quot;s where these 6 experts come in.</strong></p>
              
              <p>They&quot;re not just concepts. They&quot;re ready-to-use, copy-paste professional tools yang you can deploy TODAY.</p>
              
              <p style={{fontSize: '1.3rem', fontWeight: '700', margin: '2rem 0', color: 'var(--terra-primary)'}}>While your competitors are still figuring out basic prompts...</p>
              
              <p><strong>You&quot;ll have a complete AI workforce that makes you look like a genius.</strong></p>
              
              <p><em>And the best part? Setup takes 30 minutes. Results last forever.</em></p>
            </div>
          </div>
        </section> */}

        {/* --- Testimonials Section --- */}
        <section className={styles.testimonialsSection}>
          <div className="container">
            <div className={styles.testimonialsHeader}>
              <h2>Apa Kata Mereka Yang Dah Apply Framework Ni</h2>
              <p className={styles.testimonialsSubtitle}>
                Real results dari professionals yang dah transform cara kerja mereka dengan Framework KelasGPT
              </p>
              {/* Simple Line Separator */}
              <div className={styles.heroSeparator}></div>
              <p className={styles.testimonialsNote}>Nota:<br />KelasGPT masih di fasa awal launching.<br /><br />Kebanyakan Testimonials ini ialah dari existing client yang belajar secara direct coaching dengan saya melalui AI implementation dalam bisnes mereka.</p>
            </div>
            
            <div className={styles.testimonialsGrid}>
              {/* Testimonial 1: Corporate Manager */}
              <div className={`${styles.testimonialCard} ${styles.featured}`}>
                <div className={styles.testimonialQuotes}>&quot;&quot;</div>
                <div className={styles.testimonialQuote}>
                  Honestly, masa mula-mula dengar pasal KelasGPT ni, saya skeptical jugak. Dah terlalu banyak kali tertipu dengan &lsquo;revolutionary AI techniques&rsquo; yang end up jadi hype kosong sahaja. Tapi dalam 2 minggu after applying Module 2 &amp; 4, <strong>cara saya handle reporting dan analysis kerja completely berubah</strong>. Yang biasanya ambil masa 3-4 jam untuk prepare monthly reports, sekarang 30 minit dah siap, dan quality lagi detailed from berbagai angles yang saya tak pernah consider before. <strong>Boss saya sampai tanya &lsquo;Ravi, you ambil course apa? Your reports lately very impressive.&rsquo;</strong> Last month dapat promotion jadi Senior Operations Manager. Seriously, kalau saya tau pasal ni earlier, mesti career path saya lagi accelerated.
                </div>
                <div className={styles.testimonialAuthor}>
                  <div className={styles.authorAvatar}>RK</div>
                  <div className={styles.authorInfo}>
                    <h4>Ravi Kumar</h4>
                    <p>Senior Operations Manager, CIMB Bank</p>
                  </div>
                </div>
              </div>

              {/* Testimonial 2: Small Business Owner */}
              <div className={styles.testimonialCard}>
                <div className={styles.testimonialQuotes}>&quot;&quot;</div>
                <div className={styles.testimonialQuote}>
                  My digital marketing agency tengah struggle nak compete dengan bigger players yang ada more resources. After KelasGPT, I setup 5 AI consultants following the exact framework - Content Strategist, Data Analyst, Campaign Designer, Client Relations Expert, dan Business Development Assistant. <strong>Within 3 months, productivity naik 300% and client satisfaction improved dramatically.</strong> Yang paling impressive, satu client yang always complain about campaign performance, suddenly puji our insights and strategic recommendations. <strong>Revenue jumped from RM12k to RM35k monthly</strong> sebab boleh handle more clients dengan same team size. The templates dan knowledge base files in the toolkit memang game changer. Sekarang competitors tanya macam mana we can deliver such high-quality work so consistently.
                </div>
                <div className={styles.testimonialAuthor}>
                  <div className={styles.authorAvatar}>SW</div>
                  <div className={styles.authorInfo}>
                    <h4>Sarah Wong</h4>
                    <p>Founder, Nexus Digital Marketing</p>
                  </div>
                </div>
              </div>

              {/* Testimonial 3: Fresh Graduate */}
              <div className={styles.testimonialCard}>
                <div className={styles.testimonialQuotes}>&quot;&quot;</div>
                <div className={styles.testimonialQuote}>
                  Job market sangat competitive for fresh graduates right now. Masa interview, when I demonstrated how I use AI to solve complex problems step-by-step using Framework KelasGPT, <strong>interviewer terus impressed</strong>. &ldquo;Wah, you understand AI at this level?&rdquo; Dalam 2 weeks dapat offer from 3 companies, and I negotiated salary 40% higher than standard fresh grad package. <strong>Now colleagues datang tanya for advice, which is surreal because 6 months ago I was just another struggling graduate.</strong>
                </div>
                <div className={styles.testimonialAuthor}>
                  <div className={styles.authorAvatar}>AH</div>
                  <div className={styles.authorInfo}>
                    <h4>Aiman Haziq</h4>
                    <p>Software Engineer, TechTitan Solutions</p>
                  </div>
                </div>
              </div>

              {/* Testimonial 4: Government Officer */}
              <div className={styles.testimonialCard}>
                <div className={styles.testimonialQuotes}>&quot;&quot;</div>
                <div className={styles.testimonialQuote}>
                  Sebagai government officer, kita always kena ikut standard procedures yang sometimes very time-consuming. But after learning the framework, I created AI assistants for policy analysis, report writing, dan stakeholder communication. <strong>Department productivity improved so significantly that I kena present our new processes to other ministries.</strong> Yang best, I can maintain quality standards while dramatically reducing processing time. Director puji, &ldquo;Siti, your innovation mindset exactly what public service needs.&rdquo; Even got selected for leadership development program sebab demonstrate how technology can transform government operations.
                </div>
                <div className={styles.testimonialAuthor}>
                  <div className={styles.authorAvatar}>SN</div>
                  <div className={styles.authorInfo}>
                    <h4>Puan Siti Nurhaliza</h4>
                    <p>Senior Assistant Director, Ministry of Health</p>
                  </div>
                </div>
              </div>

              {/* Testimonial 5: Working Mother */}
              <div className={styles.testimonialCard}>
                <div className={styles.testimonialQuotes}>&quot;&quot;</div>
                <div className={styles.testimonialQuote}>
                  As a working mother dengan 2 young kids, time management is my biggest challenge. Every day rush from meetings to school pickup, then lagi kena prepare presentations and reports at night. After mastering the right AI Foundation, <strong>my work efficiency improved so much that I actually have time for family dinner every night now.</strong> Hospital board presentations yang dulu take 2-3 days to prepare, now I can create comprehensive analysis dalam 4-5 jam with better insights. <strong>Last month dapat offer for Hospital Director position</strong> - something I never thought possible while balancing family commitments. My husband cakap, &ldquo;You seem so much calmer and happier now.&rdquo; The framework didn&rsquo;t just change my career, it gave me back my family time.
                </div>
                <div className={styles.testimonialAuthor}>
                  <div className={styles.authorAvatar}>PS</div>
                  <div className={styles.authorInfo}>
                    <h4>Dr. Priya Sharma</h4>
                    <p>Hospital Administrator &amp; Mother of 2</p>
                  </div>
                </div>
              </div>

              {/* Testimonial 6: Consultant */}
              <div className={styles.testimonialCard}>
                <div className={styles.testimonialQuotes}>&quot;&quot;</div>
                <div className={styles.testimonialQuote}>
                  Sebagai business consultant, clients expect deep insights and strategic recommendations. With the professional prompt library dan expert knowledge base, <strong>I can deliver analysis yang normally require team of specialists.</strong> One manufacturing client said, &ldquo;Ahmad, your strategic assessment is more comprehensive than Big 4 consulting firms, but fraction of the cost.&rdquo; <strong>Increased my consultation rates from RM300 to RM800 per hour</strong> sebab clients value the quality and speed of deliverables. The framework transformed me from generic consultant to AI-powered strategic advisor.
                </div>
                <div className={styles.testimonialAuthor}>
                  <div className={styles.authorAvatar}>AF</div>
                  <div className={styles.authorInfo}>
                    <h4>Ahmad Fariz</h4>
                    <p>Senior Business Consultant</p>
                  </div>
                </div>
              </div>

              {/* Testimonial 7: Second Career */}
              <div className={styles.testimonialCard}>
                <div className={styles.testimonialQuotes}>&quot;&quot;</div>
                <div className={styles.testimonialQuote}>
                  At 52, after 25 years in banking, I was worried about staying relevant in this AI era. Many colleagues my age struggle to adapt. But KelasGPT showed me that understanding AI principles is more important than technical skills. <strong>Now I&rsquo;m running corporate AI literacy workshops for major companies, earning more than my previous banking salary.</strong> Last week, a CEO half my age asked for advice on AI strategy implementation. The irony is beautiful - experience plus AI knowledge is actually a powerful combination that younger folks don&rsquo;t have yet.
                </div>
                <div className={styles.testimonialAuthor}>
                  <div className={styles.authorAvatar}>LC</div>
                  <div className={styles.authorInfo}>
                    <h4>Encik Lim Cheng Hai</h4>
                    <p>Corporate AI Trainer, Former Bank Manager</p>
                  </div>
                </div>
              </div>

              {/* Testimonial 8: Startup Employee */}
              <div className={styles.testimonialCard}>
                <div className={styles.testimonialQuotes}>&quot;&quot;</div>
                <div className={styles.testimonialQuote}>
                  In startup environment, you need to move fast and deliver results immediately. The KelasGPT helped me create AI-powered product development workflows yang <strong>reduced our feature development cycle from 6 weeks to 2 weeks.</strong> CEO noticed and promoted me to Lead Product Manager within 4 months. <strong>Now other startups headhunt me specifically for my AI integration expertise.</strong> Best investment I ever made for my career.
                </div>
                <div className={styles.testimonialAuthor}>
                  <div className={styles.authorAvatar}>NA</div>
                  <div className={styles.authorInfo}>
                    <h4>Nurul Aina</h4>
                    <p>Lead Product Manager, InnovateTech</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- Course Outline Section --- */}
        <section className={`${styles.section} ${styles.courseOutlineSection}`}>
          <div className="container">
            <div className={styles.sectionHeader}>
              <h2>Apa Yang Anda Akan Belajar</h2>
              <p>Sistem pembelajaran bertahap dari asas hingga mahir - direka khas untuk orang yang tiada background teknikal</p>
            </div>
            
            <div className={styles.courseOutline}>
              {/* Module 1 */}
              <div className={styles.moduleCard}>
                <div className={`${styles.moduleHeader} ${expandedModules.module1 ? styles.expanded : ''}`} onClick={() => toggleModule('module1')}>
                  <div className={styles.moduleTitle}>
                    <span className={styles.moduleNumber}>MODUL 1 | BEGINNER</span>
                    <h3>Introduction to AI &amp; Its Ecosystem</h3>
                    <div className={styles.modulePrice}>Nilai: RM 67</div>
                  </div>
                  <div className={`${styles.expandIcon} ${expandedModules.module1 ? styles.expanded : ''}`}>
                    <ArrowRightIcon />
                  </div>
                </div>
                {expandedModules.module1 && (
                  <div className={styles.moduleContent}>
                    <div className={styles.subModule}>
                      <strong>1.1 - Apa Itu AI &amp; ChatGPT</strong>
                      <p>Pengenalan kepada AI dan ChatGPT untuk mereka yang tak pernah guna ChatGPT</p>
                    </div>
                    <div className={styles.subModule}>
                      <strong>1.2 - AI Ecosystem &amp; Basic Terminology</strong>
                      <p>Kuasai terminology penting, apa beza company, platform apps, dan model. Bezakan foundation AI app dan AI wrappers.</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Module 2 */}
              <div className={styles.moduleCard}>
                <div className={`${styles.moduleHeader} ${expandedModules.module2 ? styles.expanded : ''}`} onClick={() => toggleModule('module2')}>
                  <div className={styles.moduleTitle}>
                    <span className={styles.moduleNumber}>MODUL 2 | FOUNDATION</span>
                    <h3>Underlying Principle: Macam Mana AI Think &amp; Reasons</h3>
                    <div className={styles.exclusiveLabel}>ADVANCED</div>
                    <div className={styles.modulePrice}>Nilai: RM 1,499</div>
                  </div>
                  <div className={`${styles.expandIcon} ${expandedModules.module2 ? styles.expanded : ''}`}>
                    <ArrowRightIcon />
                  </div>
                </div>
                {expandedModules.module2 && (
                  <div className={styles.moduleContent}>
                    <div className={styles.subModule}>
                      <strong>2.1 - Memory Management dalam ChatGPT &amp; LLM Lain</strong>
                      <p>Anda tak boleh train AI, tapi anda boleh train memory app untuk buat AI kenal anda. Belajar cara manipulasi memori AI supaya dia ingat apa yang ANDA NAK DIA INGAT SAHAJA.</p>
                    </div>
                    <div className={styles.subModule}>
                      <strong>2.2 - Context Window Management</strong>
                      <p>Faham kenapa AI lupa tiba-tiba dan macam mana nak work around dengan context limitations dia.</p>
                    </div>
                    <div className={styles.subModule}>
                      <strong>2.3 - Embedding &amp; Vector Space</strong>
                      <p>Belajar macam mana semua data yang AI trained sebelum ni disimpan, dan macam mana cara prompt anda shape cara AI keluarkan balik ilmu dia.</p>
                    </div>
                    <div className={styles.subModule}>
                      <strong>2.4 - Token Prediction Engine &amp; Hallucination</strong>
                      <p>Masuk dalam otak AI untuk faham macam mana dia generate responses. Belajar kenapa AI hallucinate dan macam mana nak minimize false information.</p>
                    </div>
                    <div className={styles.subModule}>
                      <strong>2.5 - Regression Architecture dan Impak Terhadap Cara Anda Prompt</strong>
                      <p>Faham transformer architecture punya impact pada prompting strategy anda. Optimize communication style anda untuk maximum AI effectiveness.</p>
                    </div>
                    <div className={styles.subModule}>
                      <strong>2.6 - Fahami Setiap Features Yang Ada Dalam ChatGPT</strong>
                      <p>Custom Instruction, Projects, WorkSpaces, CustomGPT, DeepResearch, Analytic Tools.</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Module 3 */}
              <div className={styles.moduleCard}>
                <div className={`${styles.moduleHeader} ${expandedModules.module3 ? styles.expanded : ''}`} onClick={() => toggleModule('module3')}>
                  <div className={styles.moduleTitle}>
                    <span className={styles.moduleNumber}>MODUL 3 | ADVANCE</span>
                    <h3>Multi Platform And Features Mastery</h3>
                    <div className={styles.modulePrice}>Nilai: RM 147</div>
                  </div>
                  <div className={`${styles.expandIcon} ${expandedModules.module3 ? styles.expanded : ''}`}>
                    <ArrowRightIcon />
                  </div>
                </div>
                {expandedModules.module3 && (
                  <div className={styles.moduleContent}>
                    <div className={styles.subModule}>
                      <strong>3.1 - Model Comparison (Normal, Mini, Flash, Reasoning)</strong>
                      <p>ChatGPT o-series, Standard series, mini series.. Gemini model series, Claude model Series.</p>
                    </div>
                    <div className={styles.subModule}>
                      <strong>3.2 - Platform Comparison (Style, Best Practice, Situational)</strong>
                      <p>Platform mastery guide antara ChatGPT vs Claude vs Gemini vs Grok. Faham setiap platform punya strengths and weakness.</p>
                    </div>
                    <div className={styles.subModule}>
                      <strong>3.3 - System Instruction Dan Custom Instruction</strong>
                      <p>Create persistent AI behavior yang match dengan work style anda. Set up custom instructions yang buat AI faham preferences anda.</p>
                    </div>
                    <div className={styles.subModule}>
                      <strong>3.4 - Tool Calling Functions</strong>
                      <p>Leverage AI punya ability untuk guna external tools dan APIs. Expand AI capabilities beyond text generation.</p>
                    </div>
                    <div className={styles.subModule}>
                      <strong>3.5 - Project &amp; Workspace Features</strong>
                      <p>Master collaborative AI environments dalam ChatGPT Projects dan Claude Projects. Organize complex work, maintain context across multiple sessions.</p>
                    </div>
                    <div className={styles.subModule}>
                      <strong>3.6 - Custom GPT</strong>
                      <p>Bina specialized AI assistants yang tailored untuk specific professional needs anda. Turn AI jadi personalized professional tool.</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Module 4 */}
              <div className={styles.moduleCard}>
                <div className={`${styles.moduleHeader} ${expandedModules.module4 ? styles.expanded : ''}`} onClick={() => toggleModule('module4')}>
                  <div className={styles.moduleTitle}>
                    <span className={styles.moduleNumber}>MODUL 4 | MASTERY</span>
                    <h3>Context Design Workflow: Gabungkan Semua Dalam Satu Framework</h3>
                    <div className={styles.exclusiveLabel}>SIGNATURE</div>
                    <div className={styles.modulePrice}>Nilai: RM 799</div>
                  </div>
                  <div className={`${styles.expandIcon} ${expandedModules.module4 ? styles.expanded : ''}`}>
                    <ArrowRightIcon />
                  </div>
                </div>
                {expandedModules.module4 && (
                  <div className={styles.moduleContent}>
                    <div className={styles.subModule}>
                      <strong>4.1 - Prompt Engineering Masterclass</strong>
                      <p>Master art dan science of AI communication. Develop personal prompting style anda untuk consistent results.</p>
                    </div>
                    <div className={styles.subModule}>
                      <strong>4.2 - JSON vs YAML vs Markdown vs Natural Language</strong>
                      <p>Pilih optimal communication format untuk different AI tasks. Faham bila structured data formats produce better results.</p>
                    </div>
                    <div className={styles.subModule}>
                      <strong>4.3 - Lean Prompting Framework</strong>
                      <p>Systematic approach untuk efficient AI communication. Achieve maximum results dengan minimal instruction complexity.</p>
                    </div>
                    <div className={styles.subModule}>
                      <strong>4.4 - Context Design Workflow</strong>
                      <p>Strategic context management untuk complex professional projects. Structure information dan prioritize context elements.</p>
                    </div>
                    <div className={styles.subModule}>
                      <strong>4.5 - Learning Workflow dengan AI</strong>
                      <p>Transform AI jadi personal learning accelerator anda. Master techniques untuk rapid skill acquisition dan knowledge synthesis.</p>
                    </div>
                    <div className={styles.subModule}>
                      <strong>4.6 - Building Expert Consultant guna ChatGPT/Gemini/Claude</strong>
                      <p>Create AI consultants yang rival human experts dalam field anda. Advanced prompt architecture untuk high-level professional advice.</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Module 5 */}
              <div className={styles.moduleCard}>
                <div className={`${styles.moduleHeader} ${expandedModules.module5 ? styles.expanded : ''}`} onClick={() => toggleModule('module5')}>
                  <div className={styles.moduleTitle}>
                    <span className={styles.moduleNumber}>MODUL 5 | ADVANCE</span>
                    <h3>Image &amp; Video Generation</h3>
                    <div className={styles.modulePrice}>Nilai: RM 129</div>
                  </div>
                  <div className={`${styles.expandIcon} ${expandedModules.module5 ? styles.expanded : ''}`}>
                    <ArrowRightIcon />
                  </div>
                </div>
                {expandedModules.module5 && (
                  <div className={styles.moduleContent}>
                    <div className={styles.subModule}>
                      <strong>5.1 - Image Generation Prompt Technique</strong>
                      <p>Professional visual content creation guna AI. Master prompt engineering untuk DALL-E, Midjourney, dan image generators lain.</p>
                    </div>
                    <div className={styles.subModule}>
                      <strong>5.2 - Video Generation Step by Step</strong>
                      <p>Complete workflow untuk AI-powered video creation. Dari concept sampai final output guna tools macam Runway, Pika Labs.</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Bonus Modules */}
              <div className={styles.bonusModules}>
                <h3 className={styles.bonusTitle}>Modul Bonus Yang Anda Dapat PERCUMA</h3>
                
                {/* Bonus Module 1 */}
                <div className={`${styles.moduleCard} ${styles.bonusCard}`}>
                  <div className={`${styles.moduleHeader} ${expandedModules.bonus1 ? styles.expanded : ''}`} onClick={() => toggleModule('bonus1')}>
                    <div className={styles.moduleTitle}>
                      <span className={styles.moduleNumber}>BONUS 1</span>
                      <h3>Use Case dalam Action</h3>
                    </div>
                    <div className={`${styles.expandIcon} ${expandedModules.bonus1 ? styles.expanded : ''}`}>
                      <ArrowRightIcon />
                    </div>
                  </div>
                  {expandedModules.bonus1 && (
                    <div className={styles.moduleContent}>
                      <div className={styles.subModule}>
                        <strong>6.1 - Macam Mana Saya Guna AI untuk Stock Analysis</strong>
                        <p>Live demonstration of AI-powered investment research specific untuk Malaysian market conditions.</p>
                      </div>
                      <div className={styles.subModule}>
                        <strong>6.2 - AI untuk Task Management, Reporting dan Insight</strong>
                        <p>Complete productivity system guna AI untuk Malaysian business environment. Task optimization dan strategic insights.</p>
                      </div>
                      <div className={styles.subModule}>
                        <strong>6.3 - Setup Business Dari Scratch</strong>
                        <p>End-to-end business launch guna AI assistance. Market research, business planning, content creation untuk Malaysian entrepreneurs.</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Bonus Module 2 */}
                <div className={`${styles.moduleCard} ${styles.bonusCard}`}>
                  <div className={`${styles.moduleHeader} ${expandedModules.bonus2 ? styles.expanded : ''}`} onClick={() => toggleModule('bonus2')}>
                    <div className={styles.moduleTitle}>
                      <span className={styles.moduleNumber}>BONUS 2</span>
                      <h3>Vibe Coding Framework</h3>
                    </div>
                    <div className={`${styles.expandIcon} ${expandedModules.bonus2 ? styles.expanded : ''}`}>
                      <ArrowRightIcon />
                    </div>
                  </div>
                  {expandedModules.bonus2 && (
                    <div className={styles.moduleContent}>
                      <div className={styles.subModule}>
                        <strong>7.1 - The Very Basic untuk Non-Technical Person</strong>
                        <p>Gentle introduction kepada coding concepts yang enhance AI collaboration. Tak perlu programming background.</p>
                      </div>
                      <div className={styles.subModule}>
                        <strong>7.2 - Vibe Coding Workflow</strong>
                        <p>Systematic approach untuk AI-assisted code creation untuk business automation.</p>
                      </div>
                      <div className={styles.subModule}>
                        <strong>7.3 - Things to Consider</strong>
                        <p>Quality control, security considerations, dan limitations bila guna AI untuk code generation.</p>
                      </div>
                      <div className={styles.subModule}>
                        <strong>7.4 - Build Together: Simple, yet Beautiful Salespage</strong>
                        <p>Complete project: Create professional landing page guna AI assistance. Dari concept sampai live website.</p>
                      </div>
                      <div className={styles.subModule}>
                        <strong>7.5 - Build Together: Simple WebApp</strong>
                        <p>Hands-on project bina personal professional website. Perfect untuk Malaysian professionals.</p>
                      </div>
                      <div className={styles.subModule}>
                        <strong>7.6 - Exploring Further: Suggested Roadmap</strong>
                        <p>Progression path untuk continued learning. Advanced AI integration dan career development opportunities.</p>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className={styles.bonusValueSummary}>
                  <div className={styles.bonusValueContent}>
                    <div className={styles.exclusiveLabel}>ADVANCED</div>
                    <div className={styles.bonusValueText}>Gabungan Nilai Bonus: <span className={styles.bonusValueAmount}>RM 497</span></div>
                  </div>
                </div>
              </div>
              
              <div className={styles.courseOutlineTotal}>
                <div className={styles.totalLine}></div>
                <div className={styles.totalContent}>
                  <h3>Jumlah Nilai Sebenar:</h3>
                  <div className={styles.totalPrice}>RM 3,138</div>
                </div>
              </div>
            </div>
            
            <div className={styles.courseOutlineCTA}>
              <p><strong>Ini adalah modul pembelajaran yang sangat komprehensif untuk kuasai AI tanpa sebarang background teknikal.</strong></p>
            </div>

            {/* --- Professional Toolkit Section --- */}
            <div className={styles.professionalToolkit}>
              <div className="container">
                <div className={styles.toolkitHeader}>
                  <h3>Bonus Extra!<br /><br />Professional Implementation Toolkit</h3>
                  <p className={styles.toolkitSubtitle}>Ready-to-use resources yang direka untuk percepatkan implementation anda</p>
                  <div className={styles.toolkitBadge}>Exclusive Materials</div>
                </div>
                
                <div className={styles.toolkitGrid}>
                  <div className={styles.toolkitItem}>
                    <div className={styles.toolkitIcon}>
                      <FileTextIcon />
                    </div>
                    <div className={styles.toolkitContent}>
                      <h4>Custom Instruction Templates</h4>
                      <p>Battle-tested templates untuk setup AI expert consultants. Copy-paste dan customize mengikut panduan video untuk keperluan anda.</p>
                    </div>
                  </div>
                  
                  <div className={styles.toolkitItem}>
                    <div className={styles.toolkitIcon}>
                      <DatabaseIcon />
                    </div>
                    <div className={styles.toolkitContent}>
                      <h4>Expert Knowledge Base Files</h4>
                      <p>Specially crafted knowledge base seed files untuk different expert roles yang anda perlukan - siap untuk upload ke mana-mana AI platform pilihan anda.</p>
                    </div>
                  </div>
                  
                  <div className={styles.toolkitItem}>
                    <div className={styles.toolkitIcon}>
                      <ZapIcon />
                    </div>
                    <div className={styles.toolkitContent}>
                      <h4>Professional Prompt Library</h4>
                      <p>Koleksi high-performance prompts yang digunakan dalam video-video modul utama KelasGPT, khusus common business use cases and workflows.</p>
                    </div>
                  </div>
                  
                  <div className={styles.toolkitItem}>
                    <div className={styles.toolkitIcon}>
                      <InfinityIcon />
                    </div>
                    <div className={styles.toolkitContent}>
                      <h4>Lifetime Access &amp; Updates</h4>
                      <p>Sekali bayar untuk Lifetime Access. Semua future updates, new materials, dan enhancements - PERCUMA.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.courseOutlineCTA}>
              <p><strong>Ini adalah modul pembelajaran yang sangat komprehensif untuk kuasai AI tanpa sebarang background teknikal.</strong></p>
            </div>
          </div>
        </section>

        
        {/* --- Base Pricing Section (First Reveal) --- */}  
        <section className={`${styles.section} ${styles.pricingSection}`}>
            <div className="container">
                <div className={styles.pricingCard}>
                    <div className={styles.pricingHeader}>
                        <h2>Tetapi Hari Ini, Anda Hanya Perlu Bayar...</h2>
                    </div>
                    
                    <div className={styles.priceDisplay}>
                        <div className={styles.originalPrice}>RM 3,138</div>
                        <div className={styles.currentPrice}>
                            <span className={styles.currency}>RM</span>
                            <span className={styles.amount}>{productSettings.allowdiscount ? productSettings.baseproductprice : productSettings.productPrice}</span>
                            <span className={styles.period}>SAHAJA</span>
                        </div>
                        <div className={styles.period}></div>
                        <div className={styles.savings}>
                            <br />Dengan Penjimatan Sebanyak<br />
                            {formatSavings(3138 - (productSettings.allowdiscount ? productSettings.baseproductprice : productSettings.productPrice))}!
                        </div>
                    </div>
                    
                    <div className={styles.priceIncludes}>
                        <h3>Ini Yang Anda Akan Dapat:</h3>
                        <ul>
                            <li><CheckCircleIcon className={styles.checkIcon} />Instant Access selepas pembayaran</li>
                            <li><CheckCircleIcon className={styles.checkIcon} />Lifetime Access kepada semua modul</li>
                            <li><CheckCircleIcon className={styles.checkIcon} />Semua kemas kini masa hadapan PERCUMA</li>
                            <li><CheckCircleIcon className={styles.checkIcon} />Boleh belajar ikut pace sendiri</li>
                        </ul>
                    </div>
                    
                    {!productSettings.allowdiscount && (
                        <div className={styles.ctaSection}>
                            <Link href={checkoutUrl} className={styles.mainCTA}>
                                <RocketIcon className={styles.ctaIcon} />
                                YA! Saya Nak Access Sekarang
                            </Link>
                            <p className={styles.ctaSubtext}>Instant Access • Sekali Bayar • Tiada yuran tersembunyi</p>
                        </div>
                    )}
                    
                    {!productSettings.allowdiscount && (
                        <div className={styles.urgencyNote}>
                            <p><strong>Pelaburan terbaik untuk masa depan anda.</strong> Mula transform productivity anda hari ini.</p>
                        </div>
                    )}
                </div>
            </div>
        </section>

        {/* --- Discount Offer Section (Only when allowdiscount is true) --- */}
        {productSettings.allowdiscount && (
            <section className={`${styles.section} ${styles.professionalOfferSection}`}>
                <div className="container">
                    <div className={styles.professionalOfferCard}>
                        <div className={styles.offerHeader}>
                            <h2>Tunggu Sekejap !!</h2>
                            <p className={styles.offerSubtext}>Ada Tawaran Istimewa Untuk Student Terawal</p>
                        </div>

                        <div className={`${styles.earlyBirdAccess} earlyBirdAccess`}>
                            <div className={styles.accessInfo}>
                                <h3>Untuk {Number(productSettings.discountunittotal) || 0} Students<br />Pertama</h3>
                                <p><strong>Early Bird Offer</strong> untuk introduce KelasGPT pada harga special.<br /><br />Tetapi hanya terhad untuk {Number(productSettings.discountunittotal) || 0} students terawal sahaja - Selepas slot habis, harga naik ke standard rate secara automatik.</p>
                                
                                {/* --- FOMO Progress Bar for Early Bird --- */}
                                <div className={styles.earlyBirdStatus}>
                                    <div className={styles.statusBar}>
                                        <div 
                                            className={styles.statusFill} 
                                            style={{width: `${calculateProgress(productSettings.discountunittotal, productSettings.discountunitleft)}%`}}
                                        ></div>
                                    </div>
                                    <div className={styles.statusText}>
                                        <span className={styles.urgentText}>AMARAN: </span>
                                        <span className={styles.urgentText}>Hanya <span style={{fontWeight: '900', fontSize: '1.1em'}}>{Number(productSettings.discountunitleft) || 0}</span><br />Early Bird slots yang tinggal</span>
                                        <span><strong>{(Number(productSettings.discountunittotal) || 0) - (Number(productSettings.discountunitleft) || 0)}/{(Number(productSettings.discountunittotal) || 0)} students sudah pun grabbed</strong><br />Early Bird pricing ni</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className={styles.earlyBirdPricing}>
                            <div className={styles.priceReveal}>
                                <div className={styles.originalMemberPrice}>
                                    <span className={styles.priceStrike}>RM{productSettings.baseproductprice}</span>
                                    <span className={styles.memberLabel}>Standard Price</span>
                                </div>
                                <div className={styles.currentMemberPrice}>
                                    <span className={styles.currency}>RM</span>
                                    <span className={styles.amount}>{productSettings.productPrice}</span>
                                    <span className={styles.memberBadge}>Early Bird Price</span>
                                </div>
                                <div className={styles.savingsAmount}>
                                    JIMAT RM{productSettings.baseproductprice - productSettings.productPrice} !! 
                                </div>
                            </div>
                        </div>

                        <div className={styles.primaryCTASection}>
                            <Link href={checkoutUrl} className={styles.primaryCTA}>
                                Saya Nak Join KelasGPT <br />(Early Bird Pricing)
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
                                className={styles.securePaymentLogo}
                                />
                          </div>
                            <p className={styles.primaryCTASubtext}>Tinggal <span style={{fontWeight: '700', color: 'var(--urgent-red)'}}>{Number(productSettings.discountunitleft) || 0}</span> Early Bird slot sahaja<br />• Instant Access<br />• 100% Tiada Upsell</p>
                        </div>

                        {/* --- Author's Note Section --- */}
                        <div className={styles.authorNote}>
                            <h4 style={{color: 'var(--terra-dark)', marginBottom: '1.5rem', fontWeight: '700', fontSize: '1.1rem'}}>Nota Penulis:</h4>
                            <p style={{marginBottom: '1rem'}}>The reason anda dah baca sampai sini..</p>
                            <p style={{marginBottom: '1rem'}}>Sebab anda tahu ini <strong>apa yang anda mahu</strong>.</p>
                            <p style={{marginBottom: '1rem'}}>Kalau anda baca setiap perkataan yang saya tulis...</p>
                            <p style={{marginBottom: '1rem'}}>Anda tahu setiap apa yang saya cakap <strong>makes perfect sense</strong>.</p>
                            <p style={{marginBottom: '2rem'}}>And this is <strong>exactly</strong> apa yang anda perlukan.</p>
                            
                            <p style={{fontSize: '1.1rem', lineHeight: '1.6', fontWeight: '600', color: 'var(--terra-dark)'}}>
                                <strong>Persoalan yang tinggal:</strong><br /><br />Adakah anda cukup decisive untuk <em>trust your judgment</em>... 
                                <br />atau overthink something yang anda dah tahu <strong>jawapannya</strong>?
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        )}

        {/* --- Guarantee Section --- */}
        <section className={`${styles.section} ${styles.guaranteeSection}`}>
          <div className="container">
            <div className={styles.sectionHeader}>
              <h2>Kepuasan Anda 100% Dijamin</h2>
              <p>Anda akan dapat apa yang anda perlu, dan dengan lifetime access, setiap update terkini, untuk setiap modul, anda akan dapat secara percuma!</p>
            </div>
            
            <div className={styles.guaranteeHeader}>
              <div className={styles.guaranteeBadge}>
                <h3><strong>Kenapa saya begitu yakin dengan kepuasan anda?</strong></h3>
                <p>Sebab modul yang disusun bukan sekadar teori kosong, tapi disusun dengan cermat, step-by-step untuk memastikan anda belajar dalam cara yang sangat mudah difahami.</p>
                <br />
                <p>Ia datang dari 8 tahun hands-on experience memberi konsultansi teknikal kepada actual business user dalam pelbagai industri, termasuklah integrasi AI dalam pelbagai aspek bisnes yang menjadi fokus sejak 2-3 tahun lepas. </p>
              </div>
            </div>

            <div className={styles.guaranteeGrid}>
              <div className={styles.guaranteeCard}>
                <div className={styles.guaranteeIcon}>
                  <CheckCircleIcon />
                </div>
                <h4>Personal Support Provided</h4>
                <p>Selepas mengikuti Modul 2 &amp; 4, jika anda masih tidak faham bagaimana Framework dalam KelasGPT berfungsi, saya akan personally guide anda melalui konsep tersebut sehingga anda betul-betul faham.</p>
              </div>
              
              <div className={styles.guaranteeCard}>
                <div className={styles.guaranteeIcon}>
                  <CheckCircleIcon />
                </div>
                <h4>Complete Learning Material</h4>
                <p>Untuk memastikan kepuasan anda sebagai pelanggan KelasGPT, Anda akan mendapat Video Penjelasan, Video Framework, Video Hands-on Project, Ready-Made Custom GPT, Template Custom Instruction, Puluhan File Untuk Train Expert Advisor.</p>
              </div>
              
              <div className={styles.guaranteeCard}>
                <div className={styles.guaranteeIcon}>
                  <CheckCircleIcon />
                </div>
                <h4>Non-Technical Promise</h4>
                <p>Saya janjikan kursus ini direka khas untuk orang tanpa background IT. Setiap konsep dijelaskan dalam bahasa yang mudah, analogi yang sesuai, step-by-step, tanpa jargon technical yang mengelirukan.</p>
              </div>
            </div>
            
            {/* --- Disabling Guarantee Footer Until I Have The Right Copy for this --- */}
            {/* <div className={styles.guaranteeFooter}>
              <div className={styles.guaranteeStatement}>
                <h3>Komitmen Saya Kepada Kejayaan Anda</h3>
                <p>Saya tidak sekadar jual kursus dan hilang. Saya komited untuk pastikan anda betul-betul faham dan boleh apply semua yang anda belajar. Kerana kejayaan anda adalah kejayaan saya juga.</p>
              </div>
            </div> */}
          </div>
        </section>

        {/* --- Final CTA Section --- */}
        <section className={`${styles.section} ${styles.finalCTASection}`}>
            <div className="container">
                <div className={styles.finalCTAContainer}>
                    <div className={styles.finalMessage}>
                        <p>Anda dah baca sampai sini sebab anda tahu ini exactly apa yang anda perlukan untuk move forward. Yang tinggal sekarang: <strong>Will you act on what you know is right?</strong></p>
                        
                        <p>Lupakan 6 bulan, jika anda rasa anda mampu commit untuk serap apa yang KelasGPT ajar, cuma 1-2 minggu dengan frequent AI use..</p>
                          
                        <p>Semua akan jadi natural untuk anda, an elite AI User dan enjoy the real unfair advantage.<br /><br /></p>
                        
                        <p>{productSettings.allowdiscount && <span>Final Reminder:<br />Cuma <strong style={{color: 'var(--urgent-red)'}}>{Number(productSettings.discountunitleft) || 0}</strong> Early Bird slots yang tinggal!</span>}</p>
                    </div>
                    
                    <div className={styles.primaryCTASection}>
                            <Link href={checkoutUrl} className={styles.primaryCTA}>
                                Saya Nak Join KelasGPT <br />(Early Bird Pricing)
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
                                className={styles.securePaymentLogo}
                                />
                          </div>
                            <p className={styles.primaryCTASubtext}>• Instant Access<br />• 100% Tiada Upsell</p>
                    </div>
                </div>
            </div>
        </section>

      </main>

      {/* --- Contact Support Section --- */}
      <section className={styles.contactSection}>
        <div className="container">
          <div className={styles.contactContent}>
            <h3 className={styles.contactTitle}>Sokongan & Bantuan</h3>
            
            <div className={styles.contactMethods}>
              {/* Primary Support - WhatsApp */}
              <div className={`${styles.contactMethod} ${styles.primarySupport}`}>
                <span className={styles.contactLabel}>WhatsApp:</span>
                <a 
                  href={`https://wa.me/60${productSettings.productSupportPhone.replace(/\D/g, '').replace(/^0/, '')}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={styles.whatsappButton}
                >
                  Chat on WhatsApp
                </a>
                <span className={styles.contactContext}>Fastest response</span>
              </div>
              
              {/* Secondary Support - AI Chatbot */}
              <div className={`${styles.contactMethod} ${styles.secondarySupport}`}>
                <span className={styles.contactLabel}>Expert AI:</span>
                <a 
                  href={productSettings.productSupportChatbot}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={styles.chatbotButton}
                >
                  Ask Expert AI
                </a>
                <span className={styles.contactContext}>24/7 available</span>
              </div>
              
              {/* Tertiary Support - Email */}
              <div className={`${styles.contactMethod} ${styles.tertiarySupport}`}>
                <span className={styles.contactLabel}>Email:</span>
                <a 
                  href={`mailto:${productSettings.productSupportEmail}`}
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
      <footer className={styles.legalFooter}>
        <div className="container">
          <div className={styles.disclaimerContent}>
            <div className={styles.footerMeta}>
              <p>&copy; 2025 KelasGPT. All rights reserved.</p>
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
