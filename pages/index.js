import { useEffect, useState } from 'react';
import { trackPageView, initializeLinkModification } from '../lib/simpleTracking';
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import styles from "@/styles/Home.module.css";
import SocialProof from "@/components/SocialProof"; // Assuming this component exists and works
import { getProductSettings, formatPrice } from "../lib/settings";
import { cloudinaryPresets, getCloudinaryBlurDataURL, getCloudinarySizes } from "../lib/cloudinary";

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

  useEffect(() => {
    // 🔥 PHASE 1: Multi-source visitor ID resolution
    trackPageView('/');  // NOW: Checks URL params first, then localStorage, then creates new
    
    // 🚀 PHASE 2: Initialize link modification for social browsers
    initializeLinkModification(); // Modifies checkout links when FB/social browser detected
  }, []);

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
              <span className={styles.heroHook}>Finally!</span>
              
              {/* Mobile Line Breaks (4 lines) */}
              <span className={styles.mobileBreak}>
                Satu-satunya<br />
                Kelas &lsquo;<span className={styles.brushStroke}>Deep Dive</span>&rsquo; AI<br />
                Untuk Orang Yang<br />
                <span className={styles.emphasis}>Kosong Ilmu Teknikal</span>
              </span>
              
              {/* Desktop Line Breaks (3 lines) */}
              <span className={styles.desktopBreak}>
                Satu-satunya Kelas<br />
                &lsquo;<span className={styles.brushStroke}>Deep Dive</span>&rsquo; AI Untuk Orang Yang<br />
                <span className={styles.emphasis}>Kosong Ilmu Teknikal</span>
              </span>
            </h1>
            
            {/* Elegant Line Separator */}
            <div className={styles.heroSeparator}></div>
            
            <div className={styles.heroContent}>
              <p className={styles.heroLead}>
                Belajar <strong>Step-by-Step Exactly</strong> Cara AI Berfikir, Cara Training AI Expert Sendiri, Berdasarkan <strong>Battle-Tested Framework</strong> Dari Real Industry Implementations <strong>10-20x Produktiviti</strong> Mereka..
              </p>
              
              <div className={styles.heroTeaser}>
                <h3>Sedikit Teaser untuk Apa Yang Anda Dapat:</h3>
                
                <ul className={styles.heroList}>
                  <li>Bina dan Latih &lsquo;Pekerja AI&rsquo; sebagai Expert Consultant Dengan Betul, bukan sekadar &ldquo;Act like world-class expert..&rdquo;.</li>
                  <li>Kuasai Proper Context Engineering, Tak ada lagi Ungrounded Hallucination..</li>
                  <li>Best Approach Nak AI Tiru Writing Style Anda.. Tanpa Nampak &lsquo;AI-Generated Content&lsquo;.</li>
                  <li>Belajar &lsquo;Behind-The-Scene&rsquo; AI Algorithm supaya boleh apply dalam semua jenis task atau niche, dengan tepat.</li>
                  <li>Teknik Prompt Ringkas, Tapi Maximum Output.. Tak perlu guna mega-prompt yang terlalu rigid dengan constraint sampai degrade performance AI</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* --- Problem Awareness Section --- */}
        <section className={`${styles.section} ${styles.notJustPrompts}`}>
            <div className="container">
                <h2 className={styles.notJustPrompts}>Ini Bukan Kelas Prompt Semata-mata!</h2>
                <div className={styles.salesContent}>
                    <p>Assalamualaikum,</p>
                    
                    <p>Kalau anda sedang mencari cara untuk <strong>betul-betul belajar AI</strong> untuk kerja dan bisnes..</p>
                    
                    <p>Bukan sekadar copy-paste prompt over-hyped generic dari internet..</p>
                    
                    <p><strong>Teruskan membaca.</strong></p>
                    
                    <p>Sebab dalam masa 3 minit ni, anda akan faham kenapa ramai orang, termasuk Professionals.. masih struggle guna AI dengan berkesan..</p>
                    
                    <p>Dan bagaimana <span className={styles.highlight}>Context Design Framework</span> yang saya akan ajar boleh transformasi cara anda bekerja sepenuhnya.</p>
                    
                    <p>Tak kira anda kerja corporate, run bisnes sendiri, atau student..</p>
                    
                    <p><strong>Framework ni akan jadi game-changer untuk productivity anda.</strong></p>
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
                                src={cloudinaryPresets.content('v1753332727/Writing_Style_Sample_y7vmrr')} 
                                alt="AI Writing Style Sample" 
                                width={800} 
                                height={500} 
                                style={{width: '100%', height: 'auto'}} 
                                loading="lazy"
                                placeholder="blur"
                                blurDataURL={getCloudinaryBlurDataURL('v1753332727/Writing_Style_Sample_y7vmrr')}
                                sizes={getCloudinarySizes('content')}
                            />
                        </div>
                        <div className={styles.useCaseContent}>
                            <div className={styles.useCaseTitle}>Use Case 1</div>
                            <h4>Content Penulisan</h4>
                            <p>Nak buat content penulisan seperti social media, copywriting, article? Apply je Context Design Framework ni, anda akan dapat hasil yang sesuai dengan gaya penulisan anda, content yang anda sendiri faham, bukan sekadar copy-paste macam orang lain.</p>
                        </div>
                    </div>
                    
                    <div className={styles.useCaseCard}>
                        <div className={styles.useCaseImage}>
                            <Image 
                                src={cloudinaryPresets.content('v1753332727/Sales_Report_Sample_om3mlm')} 
                                alt="AI Sales Report Sample" 
                                width={800} 
                                height={500} 
                                style={{width: '100%', height: 'auto'}} 
                                loading="lazy"
                                placeholder="blur"
                                blurDataURL={getCloudinaryBlurDataURL('v1753332727/Sales_Report_Sample_om3mlm')}
                                sizes={getCloudinarySizes('content')}
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
                                src={cloudinaryPresets.content('v1753332728/Infografik_Sample_amkqdu')} 
                                alt="AI Infographic Sample" 
                                width={800} 
                                height={500} 
                                style={{width: '100%', height: 'auto'}} 
                                loading="lazy"
                                placeholder="blur"
                                blurDataURL={getCloudinaryBlurDataURL('v1753332728/Infografik_Sample_amkqdu')}
                                sizes={getCloudinarySizes('content')}
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

        {/* --- Authority Building Section --- */}
        <section className={`${styles.section} ${styles.authoritySection}`}>
          <div className="container">
            <div className={styles.sectionHeader}>
              <h2>Sebelum saya dedahkan RAHSIA framework ni..</h2>
              <p className={styles.sectionSubtitle}>Mungkin Saya Patut Perkenalkan Diri Saya Dulu..</p>
            </div>
            <div className={styles.authorProfile}>
              <div className={styles.authorImage}>
                <Image 
                    src={cloudinaryPresets.profile('v1753332746/Professional_Photo_mdtnaf')} 
                    alt="Fareid - KelasGPT Instructor" 
                    width={300} 
                    height={300} 
                    style={{width: '100%', height: 'auto'}} 
                    loading="lazy"
                    placeholder="blur"
                    blurDataURL={getCloudinaryBlurDataURL('v1753332746/Professional_Photo_mdtnaf')}
                    sizes={getCloudinarySizes('profile')}
                />
              </div>
              <div className={styles.authorContent}>
                <h3>Hi, Saya Fareid Zulkifli</h3>
                <div className={styles.salesContent}>
                  <p>Kalau nama saya kedengaran familiar..</p>
                  
                  <p>Mungkin sebab anda pernah nampak atau menggunakan hasil kerja saya sebelum ini.</p>
                  
                  <p>Sebab sejak tahun 2020..</p>
                  
                  <p>Saya pernah publish beberapa open-source financial indicator di <strong>TradingView</strong>, platform analisis kewangan global paling popular</p>
                  
                  <p>Yang mana <span className={styles.emphasis}>dua hasil saya dipilih sebagai Editor&rsquo;s Pick</span> oleh platform itu sendiri,</p>
                  
                  <div className={styles.tradingViewProof}>
                    <Image 
                        src={cloudinaryPresets.content('v1753332276/Bland_Terlalu_AI_2_nhqtrc')} 
                        alt="TradingView Editor&rsquo;s Pick Screenshot" 
                        className={styles.tradingViewImage} 
                        width={800} 
                        height={600} 
                        style={{width: '100%', height: 'auto'}} 
                        loading="lazy"
                        placeholder="blur"
                        blurDataURL={getCloudinaryBlurDataURL('v1753332276/Bland_Terlalu_AI_2_nhqtrc')}
                        sizes={getCloudinarySizes('content')}
                    />
                  </div>
                  
                  <p>Tetapi involvement saya dalam dunia Technology As A Service bukan sekadar menulis script untuk Tradingview..</p>

                  <p>Itu cuma satu dari &lsquo;hobby project&rsquo; saya..</p>
                  
                  <p>Kerja hakiki saya, dengan lebih <strong>8 tahun pengalaman sebagai Lead Business Consultant</strong> dalam beberapa company IT..</p>
                  
                  <p>Ialah memberi <strong>konsultansi kepada Real Business User</strong> cara nak intergrate <span className={styles.highlight}>Teknologi dan AI dalam konteks bisnes mereka..</span></p>

                  <div style={{ textAlign: 'center', margin: '2rem 0', padding: '1rem 0', borderTop: '1px solid rgba(0,0,0,0.08)', borderBottom: '1px solid rgba(0,0,0,0.08)', lineHeight: '1.9', color: 'var(--text-secondary)', fontSize: '0.9rem', fontStyle: 'italic' }}>
                    Trading Algorithm<br />
                    Loan Evaluation Engine untuk Banking<br />
                    AI Chatbot untuk SME<br />
                    AI Intergration untuk Sales Platform<br />
                    HR Policy Management System
                  </div>

                  <p>Almost any niche yang perlukan teknologi ni, saya pernah sentuh..</p>

                  <p><strong>So trust me bila saya cakap..</strong></p>

                  <p>Kebanyakan business user atau owner, selalu sangat overestimate kebolehan teknologi dalam unrealistic ways,</p>
                  
                  <p>Tapi underestimate macam mana <strong>creative use of teknologi ni</strong> boleh bantu kerja atau bisnes mereka..</p>

                  <p>Sebab mereka cuma nampak the end results teknologi tersebut..<br />Apps.. Platform.. Software..</p>

                  <p>Tapi once mereka faham teknologi, sistem yang mereka nak guna tu..</p>
                  
                  <p><span className={styles.highlight}>Tak perlu faham coding pun..</span></p>
                  
                  <p>Simply faham <strong>actual logic dan algorithm disebalik sistem</strong> yang mereka guna,<br />Cara mereka bekerja terus berubah.</p>

                  <p>Dan tujuan saya ceritakan semua ni ialah supaya anda faham..</p>
                </div>
              </div>
            </div>
            
            <div className={styles.salesContent} style={{marginTop: '3rem', textAlign: 'center'}}>
              <h3 style={{color: 'var(--terra-dark)', fontSize: '2rem', marginBottom: '1.5rem'}}>Ini BUKAN Kelas Buat Duit Dengan AI</h3>
              
              <p>Saya bukanlah sifu content creator atau marketing expert yang join trend AI..</p>
              
              <p>Saya tak janjikan cara buat duit dengan AI..</p>
              
              <p>Kalau itu yang anda cari..</p>

              <p><strong>Mungkin ini bukan kelas yang sesuai..</strong></p>
              
              <p><strong>TETAPI..</strong></p>
              
              <p>Kalau anda mahukan someone yang <span className={styles.highlight}>berpengalaman dalam industri..</span></p>
              
              <p>Tolong breakdown konsep cara AI &lsquo;berfikir&rsquo; yang kompleks menjadi lebih mudah difahami..</p>
              
              <p>Nak belajar <span className={styles.highlight}>framework, workflow untuk bina context dalam AI dengan maximum accuracy..</span></p>

              <p>Walaupun anda langsung tak ada background teknikal..</p>
              
              <p><strong>Bukan sekadar copy paste prompt orang lain</strong></p>
              
              <p><em>Teruskan baca..</em></p>
            </div>
          </div>
        </section>

        {/* --- Personal Consultant Vision --- */}
        <section className={`${styles.section} ${styles.consultantVision}`}>
          <div className="container">
            <h2>Personal Expert Consultant Yang Dijanjikan</h2>
            <div className={styles.consultantContent}>
              <p><strong>Bayangkan anda seorang yang ambitious, yang tak pernah lepaskan peluang untuk level up..</strong></p>
              
              <p>Anda tengah duduk dalam bilik, planning next big move untuk career atau side business..</p>
              
              <p>Tapi instead of groping in the dark macam most people..</p>
              
              <p><strong>Anda ada unfair advantage yang 99% professionals kat Malaysia tak ada..</strong></p>
              
              <p>Anda tahu cara transform AI jadi personal expert consultants yang specifically designed untuk YOUR goals, YOUR industry, YOUR style of working..</p>
              
              <p>Sedangkan colleagues anda masih guna AI macam Google search..</p>
              
              <p><strong>Anda dah master the framework untuk create custom AI workforce yang kerja 24/7 untuk accelerate whatever hustle anda ada.</strong></p>
              
              <p style={{fontSize: '1.4rem', fontWeight: '700', margin: '2rem 0'}}>Projek yang orang lain ambil masa sebulan, anda siapkan dalam 4-5 hari.</p>
              
              <p>Dalam masa 6 bulan, anda dah jadi go-to person dalam company untuk complex projects.. side business anda scale exponentially.. passive income streams multiply..</p>
              
              <p>Family anda nampak perubahan. More time with them, less stress, better financial security..</p>
              
              <p><strong>Peers start asking: &quot;&quot;Macam mana dia boleh perform at this level?&quot;&quot;</strong></p>
              
              <p>The secret? You&rsquo;ve mastered something yang most Malaysian professionals tak tahu exist..</p>
              
              <p><strong>Dan sebenarnya, untuk setup semua ni.. cuma ambil satu malam sahaja.</strong></p>
            </div>
          </div>
        </section>

        {/* --- 5 AI Experts Story --- */}
        <section className={`${styles.section} ${styles.aiExpertsSection}`}>
          <div className="container">
            <div className={styles.sectionHeader}>
              <h2>Satu Malam je Untuk Dapat 5 AI Expert</h2>
              <p>Dan anda boleh setup kurang.. atau lebih.., bergantung pada keperluan anda..</p>
              
              <p>Cara nak setup expert consultant guna ChatGPT ni senang.</p>
              
              <p>Saya sendiri setup 5 Expert dalam ChatGPT untuk bantu kerja saya, yang saya guna sampai sekarang..</p>
              
              <p><strong>Dalam 1 malam je, sekali setup, guna sampai bila-bila..</strong></p>
            </div>
            
            <div className={styles.expertsGrid}>
              <div className={styles.expertCard}>
                <div className={styles.expertTitle}>AI EXPERT #1</div>
                <h4>Project Management Expert</h4>
                <p>Personal manager yang handle dan manage tasklist saya. Kalau banyak task, dia siap-siap prioritise task mana penting, yang mana nak delegate to AI, yang mana nak buat dulu. Dia buat satu report plan, saya review, kalau setuju, saya follow je plan dia.</p>
              </div>
              
              <div className={styles.expertCard}>
                <div className={styles.expertTitle}>AI EXPERT #2</div>
                <h4>Copy Writing Expert</h4>
                <p>Tolong buat ayat untuk online business (My main side hustle). Dia lah yang design semua copywriting untuk paid ads yang saya buat. Ads fatigue? dia tolong buat baru. Nak Split test? dia bagi recommendation.</p>
              </div>
              
              <div className={styles.expertCard}>
                <div className={styles.expertTitle}>AI EXPERT #3</div>
                <h4>Stock Trading Expert</h4>
                <p>Tolong review fundamental analysis saham, cari data financial, bagi tau area yang saya patut consider (My other side hustle)</p>
              </div>
              
              <div className={styles.expertCard}>
                <div className={styles.expertTitle}>AI EXPERT #4</div>
                <h4>Data Storytelling Expert</h4>
                <p>Analysis Expert, yang tolong bagi insight, monitor risk based on data bisnes yang saya provide.</p>
              </div>
              
              <div className={styles.expertCard}>
                <div className={styles.expertTitle}>AI EXPERT #5</div>
                <h4>Coding Expert</h4>
                <p>This very page, kelasgpt.com, <span className={styles.emphasis}>100% coded oleh AI</span>, lengkap dengan salespage, checkout, payment integration, customer management system, emel. Saya start from scratch, dalam masa 5 hari, ada fully functioning sales system, yang 100% percuma, tak payah bayar onpay/shopify/shopeegram untuk host dah..</p>
              </div>
            </div>
            
            <div className={styles.salesContent} style={{textAlign: 'center', marginTop: '3rem'}}>
              <p><strong>Ini semua personalised untuk saya, dan anda akan belajar step by step untuk bina expert personalised untuk anda..</strong></p>
              
              <p>Semua ni possible bila faham AI.</p>
              
              <p>Dan sangat mudah..</p>
              
              <p><strong>Selagi mana anda faham cara AI berfikir..</strong></p>
              
              <div className={styles.learnGrid} style={{marginTop: '2rem'}}>
                <div className={styles.learnItem}>
                  <CheckCircleIcon />
                  <h3>Context Window management - Supaya AI tak jadi bengap tiba</h3>
                </div>
                <div className={styles.learnItem}>
                  <CheckCircleIcon />
                  <h3>Regression Architecture dan impak terhadap cara anda prompt</h3>
                </div>
                <div className={styles.learnItem}>
                  <CheckCircleIcon />
                  <h3>Memory Manipulation technique</h3>
                </div>
                <div className={styles.learnItem}>
                  <CheckCircleIcon />
                  <h3>Embedding & Vector Space - Teknik control context priority dengan prompt</h3>
                </div>
              </div>
              
              <p style={{marginTop: '2rem', fontSize: '1.2rem'}}>Ini semua anda belajar dalam <span className={styles.emphasis}>Module 2: Deep Dive to AI Foundation.</span></p>
              
              <p>Rasa susah?</p>
              
              <p>Bunyi terlalu teknikal?</p>
              
              <p><strong>Jangan takut.</strong></p>
              
              <p>Cara pembelajaran kelasGPT sememangnya fokus untuk orang yang tak ada background IT.</p>
              
              <p><em>Jom tengok preview kelas dibawah..</em></p>
              
              <p><em>Sesuai tak untuk anda?</em></p>
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
                    <h3>Introduction to AI & Its Ecosystem</h3>
                  </div>
                  <div className={`${styles.expandIcon} ${expandedModules.module1 ? styles.expanded : ''}`}>
                    <ArrowRightIcon />
                  </div>
                </div>
                {expandedModules.module1 && (
                  <div className={styles.moduleContent}>
                    <div className={styles.subModule}>
                      <strong>1.1 - Apa Itu AI & ChatGPT</strong>
                      <p>Pengenalan kepada AI dan ChatGPT untuk mereka yang tak pernah guna ChatGPT</p>
                    </div>
                    <div className={styles.subModule}>
                      <strong>1.2 - AI Ecosystem & Basic Terminology</strong>
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
                    <h3>Underlying Principle: Macam Mana AI Think & Reasons</h3>
                  </div>
                  <div className={`${styles.expandIcon} ${expandedModules.module2 ? styles.expanded : ''}`}>
                    <ArrowRightIcon />
                  </div>
                </div>
                {expandedModules.module2 && (
                  <div className={styles.moduleContent}>
                    <div className={styles.subModule}>
                      <strong>2.1 - Memory Management dalam ChatGPT & LLM Lain</strong>
                      <p>Anda tak boleh train AI, tapi anda boleh train memory app untuk buat AI kenal anda. Belajar cara manipulasi memori AI supaya dia ingat apa yang ANDA NAK DIA INGAT SAHAJA.</p>
                    </div>
                    <div className={styles.subModule}>
                      <strong>2.2 - Context Window Management</strong>
                      <p>Faham kenapa AI lupa tiba-tiba dan macam mana nak work around dengan context limitations dia.</p>
                    </div>
                    <div className={styles.subModule}>
                      <strong>2.3 - Embedding & Vector Space</strong>
                      <p>Belajar macam mana semua data yang AI trained sebelum ni disimpan, dan macam mana cara prompt anda shape cara AI keluarkan balik ilmu dia.</p>
                    </div>
                    <div className={styles.subModule}>
                      <strong>2.4 - Token Prediction Engine & Hallucination</strong>
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
                      <strong>3.5 - Project & Workspace Features</strong>
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
                    <h3>Context Design Framework: Gabungkan Semua Dalam Satu Framework</h3>
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
                    <h3>Image dan Video Generation</h3>
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
              </div>
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
                      <h4>Lifetime Access & Updates</h4>
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

        {/* --- Testimonials Section --- */}
        <section className={styles.testimonialsSection}>
          <div className="container">
            <div className={styles.testimonialsHeader}>
              <h2>Apa Kata Mereka Yang Dah Apply Framework Ni</h2>
              <p className={styles.testimonialsSubtitle}>
                Real results dari professionals yang dah transform cara kerja mereka dengan Context Design Framework
              </p>
            </div>
            
            <div className={styles.testimonialsGrid}>
              {/* Testimonial 1: Corporate Manager */}
              <div className={`${styles.testimonialCard} ${styles.featured}`}>
                <div className={styles.testimonialQuotes}>&quot;&quot;</div>
                <div className={styles.testimonialQuote}>
                  Honestly, masa mula-mula dengar pasal Context Design Framework ni, saya skeptical jugak. Dah terlalu banyak kali tertipu dengan &lsquo;revolutionary AI techniques&rsquo; yang end up jadi hype kosong sahaja. Tapi dalam 2 minggu after applying Module 2 & 4, <strong>cara saya handle reporting dan analysis kerja completely berubah</strong>. Yang biasanya ambil masa 3-4 jam untuk prepare monthly reports, sekarang 30 minit dah siap, dan quality lagi detailed from berbagai angles yang saya tak pernah consider before. <strong>Boss saya sampai tanya &lsquo;Ravi, you ambil course apa? Your reports lately very impressive.&rsquo;</strong> Last month dapat promotion jadi Senior Operations Manager. Seriously, kalau saya tau pasal ni earlier, mesti career path saya lagi accelerated.
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
                  Job market sangat competitive for fresh graduates right now. Masa interview, when I demonstrated how I use AI to solve complex problems step-by-step using Context Design Framework, <strong>interviewer terus impressed</strong>. &ldquo;Wah, you understand AI at this level?&rdquo; Dalam 2 weeks dapat offer from 3 companies, and I negotiated salary 40% higher than standard fresh grad package. <strong>Now colleagues datang tanya for advice, which is surreal because 6 months ago I was just another struggling graduate.</strong>
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
                  As a working mother dengan 2 young kids, time management is my biggest challenge. Every day rush from meetings to school pickup, then lagi kena prepare presentations and reports at night. After mastering the Context Design Framework, <strong>my work efficiency improved so much that I actually have time for family dinner every night now.</strong> Hospital board presentations yang dulu take 2-3 days to prepare, now I can create comprehensive analysis dalam 4-5 jam with better insights. <strong>Last month dapat offer for Hospital Director position</strong> - something I never thought possible while balancing family commitments. My husband cakap, &ldquo;You seem so much calmer and happier now.&rdquo; The framework didn&rsquo;t just change my career, it gave me back my family time.
                </div>
                <div className={styles.testimonialAuthor}>
                  <div className={styles.authorAvatar}>PS</div>
                  <div className={styles.authorInfo}>
                    <h4>Dr. Priya Sharma</h4>
                    <p>Hospital Administrator & Mother of 2</p>
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
                  In startup environment, you need to move fast and deliver results immediately. The Context Design Framework helped me create AI-powered product development workflows yang <strong>reduced our feature development cycle from 6 weeks to 2 weeks.</strong> CEO noticed and promoted me to Lead Product Manager within 4 months. <strong>Now other startups headhunt me specifically for my AI integration expertise.</strong> Best investment I ever made for my career.
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

        {/* --- Value Stack Section --- */}
        <section className={`${styles.section} ${styles.valueStackSection}`}>
          <div className="container">
            <div className={styles.sectionHeader}>
              <h2>Berapa harga KelasGPT ni?</h2>
              <p>Jika anda pernah tengok kelas atau kursus AI yang lain, anda mesti tahu mahalnya kualiti kelas AI yang komprehensif macam ni.</p>
              <p><br />Dan untuk konteks,<br />Nilai setiap modul yang anda akan dapat ni, boleh dianggarkan dengan harga berikut:</p>
            </div>
            
            <div className={styles.valueStack}>
              <div className={styles.valueItem}>
                <div className={styles.valueContent}>
                  <h4>Modul 1: Intro & Beginner Module</h4>
                  <p>Asas AI dan ChatGPT untuk pemula</p>
                </div>
                <div className={styles.valuePrice}>RM 67</div>
              </div>
              
              <div className={`${styles.valueItem} ${styles.premiumValue}`}>
                <div className={styles.valueContent}>
                  <h4>Modul 2: Foundation - Deep Dive AI Berfikir</h4>
                  <div className={styles.exclusiveLabel}>ADVANCED</div>
                  <p>6 bahagian mendalam tentang cara AI berfungsi</p>
                </div>
                <div className={styles.valuePrice}>RM 1,499</div>
              </div>
              
              <div className={styles.valueItem}>
                <div className={styles.valueContent}>
                  <h4>Modul 3: Advanced Features Masterclass</h4>
                  <p>6 teknik advanced untuk kuasai semua platform AI</p>
                </div>
                <div className={styles.valuePrice}>RM 147</div>
              </div>
              
              <div className={`${styles.valueItem} ${styles.premiumValue}`}>
                <div className={styles.valueContent}>
                  <h4>Modul 4: Context Design Framework</h4>
                  <div className={styles.exclusiveLabel}>SIGNATURE</div>
                  <p>Formula rahsia untuk building expert consultant</p>
                </div>
                <div className={styles.valuePrice}>RM 799</div>
              </div>
              
              <div className={styles.valueItem}>
                <div className={styles.valueContent}>
                  <h4>Modul 5: Image & Video Generation</h4>
                  <p>Complete workflow untuk visual content creation</p>
                </div>
                <div className={styles.valuePrice}>RM 129</div>
              </div>
              
              <div className={`${styles.valueItem} ${styles.bonusValue} ${styles.premiumValue}`}>
                <div className={styles.valueContent}>
                  <h4>BONUS: Use Case dalam Action + Vibe Coding Framework</h4>
                  <div className={styles.exclusiveLabel}>ADVANCED</div>
                  <p>Live demonstration (Stock analysis, Task management, Business setup) + 6 bahagian build website & app tanpa coding background</p>
                </div>
                <div className={styles.valuePrice}>RM 497</div>
              </div>
              
              <div className={styles.valueTotal}>
                <div className={styles.totalLine}></div>
                <div className={styles.totalContent}>
                  <h3>Jumlah Nilai Sebenar:</h3>
                  <div className={styles.totalPrice}>RM 3,138</div>
                </div>
              </div>
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
                            <Link href="/checkout" className={styles.mainCTA}>
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

        {/* --- Professional Discount Offer (Only when allowdiscount is true) --- */}
        {productSettings.allowdiscount && (
            <section className={`${styles.section} ${styles.professionalOfferSection}`}>
                <div className="container">
                    <div className={styles.professionalOfferCard}>
                        <div className={styles.offerHeader}>
                            <h2>Tunggu Sekejap !!</h2>
                            <p className={styles.offerSubtext}>There&apos;s always a reward untuk early action taker.</p>
                        </div>

                        <div className={styles.earlyBirdAccess}>
                            <div className={styles.accessInfo}>
                                <h3>Early Bird Pricing - {Number(productSettings.discountunittotal) || 0} Students Terawal Sahaja</h3>
                                <p><strong>Limited Early Bird access</strong> untuk introduce KelasGPT dengan special pricing. Terhad untuk {Number(productSettings.discountunittotal) || 0} students terawal sahaja - lepas habis, harga naik ke standard rate secara automatik.</p>
                                
                                <div className={styles.earlyBirdStatus}>
                                    <div className={styles.statusBar}>
                                        <div 
                                            className={styles.statusFill} 
                                            style={{width: `${calculateProgress(productSettings.discountunittotal, productSettings.discountunitleft)}%`}}
                                        ></div>
                                    </div>
                                    <div className={styles.statusText}>
                                        <span><strong>{(Number(productSettings.discountunittotal) || 0) - (Number(productSettings.discountunitleft) || 0)} students grabbed</strong><br />Early Bird pricing in last 24 hours</span>
                                        <span className={styles.urgentText}>CRITICAL: Only {Number(productSettings.discountunitleft) || 0}<br />Early Bird slots left before price increase</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className={styles.earlyBirdPricing}>
                            <div className={styles.pricingHeader}>
                                <h3>Early Bird Pricing</h3>
                                <p>Only {Number(productSettings.discountunitleft) || 0} student slots remaining</p>
                            </div>
                            
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
                                    Early Bird Savings: RM{productSettings.baseproductprice - productSettings.productPrice}
                                </div>
                            </div>
                        </div>

                        <div className={styles.primaryCTASection}>
                            <Link href="/checkout" className={styles.primaryCTA}>
                                Secure Early Bird Access + RM{productSettings.baseproductprice - productSettings.productPrice} Savings
                            </Link>
                            <p className={styles.primaryCTASubtext}>Instant Access • {Number(productSettings.discountunitleft) || 0} Early Bird slots left • Lifetime Access</p>
                        </div>

                        <div className={styles.membershipNote}>
                            <p><strong>250 Early Bird spots untuk students sahaja</strong> - introduce KelasGPT dengan special pricing. Early Bird students dapat priority support + course feedback input. Selepas Early Bird habis: automatic price increase ke RM{productSettings.baseproductprice}.</p>
                        </div>
                    </div>
                </div>
            </section>
        )}

        {/* --- Guarantee Section --- */}
        <section className={`${styles.section} ${styles.guaranteeSection}`}>
          <div className="container">
            <div className={styles.sectionHeader}>
              <h2>Jaminan Kejayaan Pembelajaran Anda</h2>
              <p>Selepas 8 tahun dalam industri, saya tahu apa yang berfungsi. Dan saya komited untuk pastikan ini berfungsi untuk anda juga.</p>
            </div>
            
            <div className={styles.guaranteeGrid}>
              <div className={styles.guaranteeCard}>
                <div className={styles.guaranteeIcon}>
                  <CheckCircleIcon />
                </div>
                <h4>Framework Mastery Support</h4>
                <p>Selepas mengikuti Modul 2 & 4, jika anda masih tidak faham bagaimana Context Design Framework berfungsi, saya akan personally guide anda melalui konsep tersebut sehingga anda betul-betul master.</p>
              </div>
              
              <div className={styles.guaranteeCard}>
                <div className={styles.guaranteeIcon}>
                  <CheckCircleIcon />
                </div>
                <h4>Real Results Commitment</h4>
                <p>Dalam 30 hari, anda akan dapat apply sekurang-kurangnya 5 teknik dari kursus ini dalam kerja atau bisnes anda. Saya komited untuk pastikan anda capai hasil ni.</p>
              </div>
              
              <div className={styles.guaranteeCard}>
                <div className={styles.guaranteeIcon}>
                  <CheckCircleIcon />
                </div>
                <h4>Non-Technical Promise</h4>
                <p>Saya janjikan kursus ini direka khas untuk orang tanpa background IT. Setiap konsep dijelaskan dalam bahasa yang mudah, step-by-step, tanpa jargon technical yang mengelirukan.</p>
              </div>
            </div>
            
            <div className={styles.guaranteeFooter}>
              <div className={styles.guaranteeBadge}>
                <h3>Komitmen Saya Kepada Kejayaan Anda</h3>
                <p>Saya tidak sekadar jual kursus dan hilang. Saya komited untuk pastikan anda betul-betul faham dan boleh apply semua yang anda belajar. Kerana kejayaan anda adalah kejayaan saya juga.</p>
              </div>
              
              <div className={styles.guaranteeStatement}>
                <p><strong>Kenapa saya begitu yakin dengan kepuasan anda?</strong></p>
                <p>Sebab modul yang disusun bukan sekadar theory kosong. Ia datang dari 8 tahun hands-on experience memberi konsultansi teknikal kepada Real Business User, termasuklah integrasi AI dalam pelbagai aspek bisnes yang menjadi fokus sejak 2-3 tahun lepas. </p>
              </div>
            </div>
          </div>
        </section>

        {/* --- Imagine/Final CTA Section --- */}
        <section className={styles.section}>
            <div className="container">
                <div className={styles.imagineBox}>
                    <h2>Bayangkan…</h2>
                    <p>Menyiapkan laporan dalam minit, bukan jam. Menjana idea kempen pemasaran dengan beberapa baris prompt. Mengurangkan kos operasi sambil meningkatkan kualiti kerja. Inilah realiti baharu dengan AI apabila anda tahu caranya.</p>
                    <Link href="/checkout" className={styles.ctaButton} style={{backgroundColor: 'var(--white)', color: 'var(--primary)'}}>
                      Mula Transformasi Produktiviti Anda
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
