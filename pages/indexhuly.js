import { useEffect, useState } from 'react';
import { trackPageView, getOrCreateVisitorId } from '../lib/simpleTracking';
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import styles from "@/styles/IndexHuly.module.css";
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
        <title>KelasGPT - Belajar Bina Custom AI Expert Anda</title>
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
        {/* Navigation Bar */}
        <nav className={styles.navbar}>
          <div className={styles.navContainer}>
            <div className={styles.navBrand}>
              <span className={styles.navBrandText}>KelasGPT</span>
            </div>
          </div>
        </nav>
        
        {/* --- Hero Section --- */}
        <section className={`${styles.section} ${styles.hero}`}>
          <div className="container">

            {/* Pill Element */}
            <div className={styles.heroPill}>
              <span className={styles.heroPillText}>Tanpa Coding. Tanpa Technical Background.</span>
            </div>

            {/* notes:
            &#8209; : none breaking hyphen  '-'
            &nbsp;  : none breaking space, ' '
            */}

            {/* Main Headline */}
            <h1 className={styles.heroTitle}>
              <span>

                Belajar AI&nbsp;Untuk&nbsp;Bisnes: <span className={styles.heroEmphasis}>3&#8209;Step&nbsp;Formula Melatih Team&nbsp;AI&nbsp;Assistant</span> Anda&nbsp;Sendiri..
                
              </span>
            </h1>

            {/* Main Sub Headline */}
            <h2 className={styles.heroSubTitle}>
              <span>
                <br />
                Dapatkan sekali <span className={styles.subHeroEmphasis}>Done&#8209;For&#8209;You </span>
                <br />Team&nbsp;AI&nbsp;Assistant untuk bantu lancar&nbsp;&&nbsp;urus
                <br /><span className={styles.subHeroEmphasis}>Digital&nbsp;Business Anda!</span>
              </span>
            </h2>

            {/* Hero Visual Element with Animated Glowing Border */}
            {/* <div className={styles.heroVisualContainer}> */}
              {/* <div className={styles.heroVisualAnimated}> */}
                <div className={styles.heroVisualContent}>
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
                </div>
              {/* </div>
            </div> */}
          </div>
        </section>

        {/* --- Whats In It For Me Section --- */}
        <section className={`${styles.wiifm}`}>
          <div className="container">
            <div className={styles.heroContent}>
              <div className={styles.heroTeaser}>
                <h3>Apa Yang Anda Akan Dapat:</h3>
                
                <ul className={styles.heroList}>
                  <li><span className={styles.highlight2}>Video AI Masterclass</span> Video kelas <em>Deep&#8209;Dive</em> <strong>cara AI berfikir <bold>+</bold>&nbsp;Teknik Prompt Advanced</strong> untuk dapatkan maximum output dengan minimal prompt</li>
                  <li><span className={styles.highlight2}>3-Step Formula Rahsia</span> untuk latih AI jadi Consultant&#8209;Level Assistant<br/><strong>(Bina Team&nbsp;AI&nbsp;Consultant Anda Sendiri!)</strong></li>
                  <li><span className={styles.highlight2}>5 Done-For-You AI Assistant</span> Team Consultant Lengkap Dari Idea Generation sampai siap Salespage & Marketing Material.. <strong>Anda ready untuk terus menjual!</strong></li>
                  <li><span className={styles.highlight2}>Source Files</span> Setiap AI Assistant yang anda dapat, boleh <strong>digunakan dengan mana-mana AI platform</strong> (supaya anda tidak terikat dengan ChatGPT sahaja)</li>
                  <li><span className={styles.highlight2}>Step-by-Step Demo Video Tutorial</span> <strong>Tiru&nbsp;Proven&nbsp;Workflow -</strong> Kaedah cari idea, bina produk dan creative&apos;s sampai launch profitable digital business <strong>kurang 48 jam!</strong></li>
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

        {/* --- The 3-Step Formula Revealed --- */}
        <section className={`${styles.section} ${styles.mechanismSection}`}>
          <div className="container">
            <div className={styles.sectionHeader}>
              <h2>Sekarang Biar Saya Explain Kenapa Framework Ni Berfungsi</h2>
              <p>Dan Kenapa 90% Orang Yang Guna AI Tak Dapat Results Yang Expert-Level</p>
            </div>
            
            <div className={styles.salesContent}>
              <p>Okay, anda dah nampak apa yang possible bila AI dilatih dengan betul..</p>
              
              <p>Tapi mungkin anda tertanya-tanya..</p>
              
              <p><strong>Macam mana exactly AI boleh jadi expert-level macam ni?</strong></p>
              
              <p>Fair question.</p>
              
              <p>Sebab kalau anda pernah try guna ChatGPT atau Claude untuk kerja professional..</p>
              
              <p>Kadang-kadang hasil dia okay, kadang-kadang mediocre, kadang-kadang terus off-topic.</p>
              
              <p><strong>Kenapa inconsistent macam ni?</strong></p>
              
              <p>Simple.</p>
              
              <p>Kebanyakan orang treat AI macam search engine yang pandai cakap.</p>
              
              <p>Mereka hantar prompt, harap dapat jawapan yang bagus, lepas tu frustrated bila result tak meet expectation.</p>
              
              <p><strong>Tapi itu bukan macam mana expert consultant bekerja dalam real life.</strong></p>
              
              <p>Bayangkan anda hire consultant untuk bisnes anda..</p>
              
              <p>Consultant yang professional akan:</p>
              
              <div className={styles.consultantProcess}>
                <p><strong>1. Faham context kerja anda dengan detail</strong><br />
                Bukan sekadar tahu apa yang anda nak, tapi faham background, constraints, dan objectives anda.</p>
                
                <p><strong>2. Tahu exactly resources mana nak refer untuk situation anda</strong><br />
                Dia ada structured knowledge base dan tahu bila nak guna framework mana untuk problem apa.</p>
                
                <p><strong>3. Apply domain expertise yang specific</strong><br />
                Bukan generic advice yang anda boleh google, tapi insights yang datang dari years of specialized experience.</p>
              </div>
              
              <p><strong>Nah, itulah exactly 3-Step Formula yang KelasGPT ajar.</strong></p>
              
              <p>Instead of treating AI macam smart search engine..</p>
              
              <p>You transform dia jadi professional consultant yang:</p>
              
              <ul className={styles.mechanismBenefits}>
                <li><span className={styles.ulStrong}>Faham workflow anda</span> - Context dia build properly untuk every interaction</li>
                <li><span className={styles.ulStrong}>Navigate knowledge dengan systematic</span> - Dia tahu exactly bila nak refer apa untuk situation yang berbeza</li>
                <li><span className={styles.ulStrong}>Deliver specialized expertise</span> - Results yang datang dari proven frameworks, bukan generic advice</li>
              </ul>
              
              <p>Bila 3 elements ni combine together dengan proper structure..</p>
              
              <p><strong>You get consistent, expert-level output every single time.</strong></p>
              
              <p>Macam GPS system - dia tak main agak-agak, dia ada systematic way untuk guide anda dari point A ke point B using the best available information.</p>
              
              <p>Yang paling powerful..</p>
              
              <p>Formula ni boleh apply untuk <em>any domain</em> yang anda nak.</p>
              
              <p>Copywriting, product development, business strategy, financial analysis, content creation.. <strong>anything</strong>.</p>
              
              <p>Sebab pada dasarnya..</p>
              
              <p>Anda belajar macam mana nak <em>structure knowledge and context</em> untuk AI consume dan apply dengan betul.</p>
              
              <p><strong>Dan 5 Expert Consultant yang anda akan dapat tu?</strong></p>
              
              <p>Mereka semua di-create guna exact formula yang sama.</p>
              
              <p>Setiap satu dah di-optimize untuk domain mereka, structured untuk deliver results yang anda perlukan, dan tested untuk ensure consistency.</p>
              
              <p>Tapi yang paling valuable..</p>
              
              <p><strong>Anda akan belajar macam mana nak create Expert Consultant sendiri untuk any niche atau industry yang anda nak.</strong></p>
              
              <p>Itulah kuasa sebenar 3-Step Formula ni.</p>
            </div>
          </div>
        </section>

        {/* --- KelasGPT Main Benefits Section --- */}
        <section className={`${styles.section} ${styles.customExpertSection}`}>
          <div className="container">
            <div className={styles.sectionHeader}>
              <h2>Kenali Team Expert AI Consultant Anda</h2>
              <p><br />Selain dari belajar bina Expert Consultant anda sendiri...<br /><br /></p>
              
              <p>Anda juga akan dapat <strong>5 Powerful, Done-For-You</strong> Custom Experts Consultant!<br /><br /></p>
              
              <p><strong>Lifetime Access</strong> untuk mana-mana kerja atau business anda ada.</p>
              <p><em>Tinggal click link dan terus guna sahaja</em>.</p>
            </div>

            {/* Expert 1: Balqis - Digital Product Ideation Expert */}
            <div className={styles.customExpertShowcase}>
              <div className={styles.customExpertDescription}>
                
                <div className={styles.customExpertHeader}>
                  <div className={styles.customExpertNumber}>EXPERT #1</div>
                  <h3>Balqis - Digital Product Ideation Expert</h3>
                </div>
                                
                <Image 
                  src={imagePresets.benefit('balqis-photo')}
                  alt="Balqis - Digital Product Ideation Expert" 
                  width={120} 
                  height={120} 
                  style={{width: '100%', height: '100%'}} 
                  loading="lazy"
                  placeholder="blur"
                  blurDataURL={getBlurDataURL('balqis-photo')}
                  sizes={getImageSizes('benefit')}
                  className={styles.customExpertImages}
                />
                
                <div className={styles.customExpertBadge}>IDEA SPOTTER</div>
                <h4>The Digital Product Ideation Expert</h4>
                <p><strong>Business Stage: Ideation & Opportunity Discovery</strong></p>
                <p>Specialist dalam generate profitable digital product ideas dari zero. Balqis analyze market trends, identify gaps, dan provide step-by-step ideation process untuk discover untapped opportunities dalam any industry.</p>
                
                <div className={styles.customExpertFeatures}>
                  <div className={styles.customExpertFeature}>Market research & trend analysis</div>
                  <div className={styles.customExpertFeature}>Profitable product idea generation</div>
                  <div className={styles.customExpertFeature}>Competitive analysis & positioning</div>
                  <div className={styles.customExpertFeature}>Opportunity validation framework</div>
                </div>
                
                <p className={styles.customExpertResult}><em>Tak pernah kehabisan idea untuk new products atau services lagi.</em></p>
              </div>
            </div>

            {/* Expert 2: Sarah - Product & Branding Expert */}
            <div className={styles.customExpertShowcase}>
              <div className={styles.customExpertDescription}>
                
                <div className={styles.customExpertHeader}>
                  <div className={styles.customExpertNumber}>EXPERT #2</div>
                  <h3>Sarah - Product & Branding Expert</h3>
                </div>
                
                <Image 
                    src={imagePresets.benefit('sarah-photo')}
                    alt="Sarah - Product & Branding Expert" 
                    width={120} 
                    height={120} 
                    style={{width: '100%', height: '100%'}} 
                    loading="lazy"
                    placeholder="blur"
                    blurDataURL={getBlurDataURL('sarah-photo')}
                    sizes={getImageSizes('benefit')}
                    className={styles.customExpertImages}
                  />
                <div className={styles.customExpertBadge}>BRAND ARCHITECT</div>
                <h4>The Intuitive Marketing Angle Expert</h4>
                <p><strong>Business Stage: Strategy & Planning</strong></p>
                <p>Master dalam manage product dan branding documents. Sarah create comprehensive product briefs, creative briefs, brand guidelines, dan ensure consistent brand identity across all touchpoints untuk maximum market impact.</p>
                
                <div className={styles.customExpertFeatures}>
                  <div className={styles.customExpertFeature}>Product brief & documentation</div>
                  <div className={styles.customExpertFeature}>Brand guidelines & identity</div>
                  <div className={styles.customExpertFeature}>Creative direction & strategy</div>
                  <div className={styles.customExpertFeature}>Brand consistency framework</div>
                </div>
                
                <p className={styles.customExpertResult}><em>Brand anda selalu consistent dan professional across all platforms.</em></p>
              </div>
            </div>

            {/* Expert 3: Chae Ha - Copywriting Expert */}
            <div className={styles.customExpertShowcase}>
              <div className={styles.customExpertDescription}>

                <div className={styles.customExpertHeader}>
                  <div className={styles.customExpertNumber}>EXPERT #3</div>
                  <h3>Chae Ha - Copywriting Expert</h3>
                </div>

                <Image 
                    src={imagePresets.benefit('chaeha-photo')}
                    alt="Chae Ha - Copywriting Expert" 
                    width={120} 
                    height={120} 
                    style={{width: '100%', height: '100%'}} 
                    loading="lazy"
                    placeholder="blur"
                    blurDataURL={getBlurDataURL('chaeha-photo')}
                    sizes={getImageSizes('benefit')}
                    className={styles.customExpertImages}
                  />
                <div className={styles.customExpertBadge}>CONVERSION EXPERT</div>
                <h4>The Engaging Hook Specialist</h4>
                <p><strong>Business Stage: Marketing & Sales</strong></p>
                <p>High-conversion copywriting specialist untuk sales pages, email campaigns, ads, dan content marketing. Chae Ha craft compelling headlines, analyze target audience psychology, dan ensure setiap piece of copy converts maksimum.</p>
                
                <div className={styles.customExpertFeatures}>
                  <div className={styles.customExpertFeature}>High-converting sales copy</div>
                  <div className={styles.customExpertFeature}>Email marketing campaigns</div>
                  <div className={styles.customExpertFeature}>Ad copy & social content</div>
                  <div className={styles.customExpertFeature}>Conversion optimization</div>
                </div>
                
                <p className={styles.customExpertResult}><em>Copy anda selalu engage dan convert - audience tak boleh ignore.</em></p>
              </div>
            </div>

            {/* Expert 4: Irfan - Creative Director for Video Generation */}
            <div className={styles.customExpertShowcase}>
              <div className={styles.customExpertDescription}>

                <div className={styles.customExpertHeader}>
                  <div className={styles.customExpertNumber}>EXPERT #4</div>
                  <h3>Irfan - Creative Director for Video Generation</h3>
                </div>

                <Image 
                    src={imagePresets.benefit('irfan-photo')}
                    alt="Irfan - Creative Director for Video Generation" 
                    width={120} 
                    height={120} 
                    style={{width: '100%', height: '100%'}} 
                    loading="lazy"
                    placeholder="blur"
                    blurDataURL={getBlurDataURL('irfan-photo')}
                    sizes={getImageSizes('benefit')}
                    className={styles.customExpertImages}
                  />
                <div className={styles.customExpertBadge}>VIRAL CONTENT</div>
                <h4>The VEO 3 Creative Director</h4>
                <p><strong>Business Stage: Content Creation</strong></p>
                <p>Creative director yang specialized dalam generate optimized VEO 3 prompts untuk video generation. Irfan create professional video concepts, storyboards, marketing materials, dan social content yang engaging.</p>
                
                <div className={styles.customExpertFeatures}>
                  <div className={styles.customExpertFeature}>VEO 3 optimized prompts</div>
                  <div className={styles.customExpertFeature}>Video concept development</div>
                  <div className={styles.customExpertFeature}>Marketing video storyboards</div>
                  <div className={styles.customExpertFeature}>Social media video content</div>
                </div>
                
                <p className={styles.customExpertResult}><em>Video content anda selalu professional dan viral-worthy.</em></p>
              </div>
            </div>

            {/* Expert 5: Zaki - Vibe Coding Expert */}
            <div className={styles.customExpertShowcase}>
              <div className={styles.customExpertDescription}>

                <div className={styles.customExpertHeader}>
                  <div className={styles.customExpertNumber}>EXPERT #5</div>
                  <h3>Zaki - Vibe Coding Expert</h3>
                </div>

                <Image 
                    src={imagePresets.benefit('zaki-photo')}
                    alt="Zaki - Vibe Coding Expert" 
                    width={120} 
                    height={120} 
                    style={{width: '100%', height: '100%'}} 
                    loading="lazy"
                    placeholder="blur"
                    blurDataURL={getBlurDataURL('zaki-photo')}
                    sizes={getImageSizes('benefit')}
                    className={styles.customExpertImages}
                  />
                <div className={styles.customExpertBadge}>LAUNCH READY</div>
                <h4>The Mini Vibe-Coder Consultant</h4>
                <p><strong>Business Stage: Implementation & Launch</strong></p>
                <p>Build web apps dan sales pages through step-by-step process. Zaki handle PRD setup, generate optimized prompts, dan deliver ready-to-use code untuk launch your digital business without technical background.</p>
                
                <div className={styles.customExpertFeatures}>
                  <div className={styles.customExpertFeature}>No-code web development</div>
                  <div className={styles.customExpertFeature}>Sales page creation</div>
                  <div className={styles.customExpertFeature}>PRD & technical documentation</div>
                  <div className={styles.customExpertFeature}>Launch-ready implementations</div>
                </div>
                
                <p className={styles.customExpertResult}><em>Technical implementation made simple - launch tanpa coding skills.</em></p>
              </div>
            </div>
            
            <div className={styles.salesContent} style={{textAlign: 'center', marginTop: '4rem'}}>
              <h3><strong>Inilah Team AI Yang Akan Transform Business Anda</strong></h3>
              
              <p>Bayangkan ada <strong>5 specialist consultants</strong> yang bekerja 24/7 untuk anda... setiap satu expert dalam bidang mereka, ready to deliver professional-grade results dalam minit.</p>
              
              <p>Yang paling powerful - <span className={styles.emphasis}>mereka direka untuk bekerja dalam sequence</span>. Balqis discover profitable ideas → Sarah build your brand → Chae Ha craft converting copy → Irfan create viral content → Zaki launch your business.</p>
              
              <p><strong>Complete end-to-end system untuk launch profitable digital business dalam 24 jam.</strong></p>
              
              <p>Tapi apa yang bezakan Student KelasGPT dari orang yang sekadar beli ready-made AI tools...</p>
              
              <p>Anda akan dapat belajar:</p>
              
              <div className={styles.customExpertFeatures}>
                <div className={styles.customExpertFeature}>Macam mana setiap Expert Consultant ni dilatih (3-Step Formula)</div>
                <div className={styles.customExpertFeature}>Custom Instruction dan Source Files setiap expert</div>
                <div className={styles.customExpertFeature}>Complete Demo macam mana gunakan Experts ni dalam workflow kerja anda</div>
              </div>
              
              <p><strong>Instead of just using them... anda boleh:</strong></p>
              
              <ul className={styles.capabilityList}>
                <li><span className={styles.ulStrong}>Customize mereka</span> untuk specific industry atau niche anda</li>
                <li><span className={styles.ulStrong}>Troubleshoot dan optimize</span> bila results tak perfect</li>
                <li><span className={styles.ulStrong}>Create unlimited new experts</span> untuk scale business anda</li>
                <li><span className={styles.ulStrong}>Scale across multiple businesses</span> atau career changes</li>
                <li><span className={styles.ulStrong}>Train them dengan your unique knowledge</span> untuk competitive advantage</li>
                <li><span className={styles.ulStrong}>Combine multiple experts</span> untuk solve complex business problems</li>
              </ul>
              
              <p>Itulah kuasa sebenar apabila anda <em>truly understand</em> macam mana AI berfikir.</p>
              
              <p><strong>Dan success stories ni membuktikan exactly apa yang possible...</strong></p>
            </div>
          </div>
        </section>

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
