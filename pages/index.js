import { useEffect } from 'react';
import { trackPageView, initializeLinkModification } from '../lib/simpleTracking';
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import styles from "@/styles/Home.module.css";
import SocialProof from "@/components/SocialProof"; // Assuming this component exists and works
import { getProductSettings, formatPrice } from "../lib/settings";

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


export default function Home({ productSettings }) {
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
              Satu-satunya Kelas &lsquo;Deep Dive&rsquo; AI Untuk Professional dan Small Business Owner yang <span className={styles.emphasis}>Kosong Ilmu Teknikal</span>
            </h1>
            <p className={styles.heroSubtitle}>
              <span className={styles.highlight}>&lsquo;Context Design Framework&rsquo;</span> Yang Pakar AI Gunakan Untuk Menaikan Kualiti Output AI Dan <strong>10-20x Produktiviti</strong> Mereka..
            </p>
            <p className={styles.heroSecondary}>
              <strong>Modul Bonus:</strong> Jangan Terlepas! Saya tunjuk step-by-step cara saya guna AI untuk create bisnes guna AI dari kosong.. Cara buat research, tulis high-converting copywriting, vibe-code salespage.. semuanya guna framework yang sama
            </p>
          </div>
        </section>

        {/* --- Problem Awareness Section --- */}
        <section className={`${styles.section} ${styles.notJustPrompts}`}>
            <div className="container">
                <h2 className={styles.notJustPrompts}>Ini Bukan Kelas Prompt Semata-mata!</h2>
                <div className={styles.salesContent}>
                    <p>Assalamualaikum,</p>
                    
                    <p>Kalau anda sedang mencari peluang untuk belajar skill AI dengan <strong>Betul dan Mendalam..</strong></p>
                    
                    <p>Khususnya LLM seperti ChatGPT..</p>
                    
                    <p>Teruskan membaca..</p>
                    
                    <p>Sebab saya ada selitkan beberapa <span className={styles.emphasis}>&lsquo;ilmu mahal&rsquo;</span> dalam artikel ini..</p>
                    
                    <p>Dalam keadaan sekarang, yang mana masih ramai orang yang pertikaikan AI..</p>
                    
                    <p>Dah ada sekumpulan orang yang betul-betul faham cara nak gunakan AI sebagai tools dengan betul..</p>
                    
                    <p>Cara nak leverage kekuatan AI, dan teknik untuk work-around kelemahan dia..</p>
                    
                    <p>Dan bila anda faham macam mana AI ni berfikir dan berfungsi..</p>
                    
                    <p>Macam mana nak gunakan <span className={styles.highlight}>Framework betul..</span></p>
                    
                    <p>Cara susun <span className={styles.highlight}>Context dengan tepat..</span></p>
                    
                    <p>Tak ada orang yang akan complaint anda ni <em>&lsquo;sikit-sikit tanya chatgpt, bukan boleh pakai pun&rsquo;..</em></p>
                    
                    <p>And tak kisahlah apa saja jenis atau nature kerja anda..</p>
                    
                    <p><strong>Framework yang anda akan belajar ni sentiasa terpakai.</strong></p>
                </div>
            </div>
        </section>

        {/* --- Use Cases with Visual Proof --- */}
        <section className={styles.section}>
            <div className="container">
                <div className={styles.sectionHeader}>
                    <h2>Lihat Bagaimana Framework Ni Berfungsi</h2>
                    <p>Semua yang saya tunjuk ni, hanyalah basic use case.. Anda akan belajar lebih banyak use case yang lebih advance..</p>
                </div>
                <div className={styles.useCasesGrid}>
                    <div className={styles.useCaseCard}>
                        <div className={styles.useCaseImage}>
                            <Image src="https://res.cloudinary.com/dtvvaed5i/image/upload/v1753332727/Writing_Style_Sample_y7vmrr.webp" alt="AI Writing Style Sample" width={600} height={400} style={{width: '100%', height: 'auto'}} />
                        </div>
                        <div className={styles.useCaseContent}>
                            <div className={styles.useCaseTitle}>Use Case 1</div>
                            <h4>Content Penulisan</h4>
                            <p>Nak buat content penulisan, apply Context Design Framework ni, anda akan dapat hasil yang sesuai dengan gaya penulisan anda, content yang anda sendiri faham, bukan sekadar copy-paste macam orang lain.</p>
                        </div>
                    </div>
                    
                    <div className={styles.useCaseCard}>
                        <div className={styles.useCaseImage}>
                            <Image src="https://res.cloudinary.com/dtvvaed5i/image/upload/v1753332727/Sales_Report_Sample_om3mlm.webp" alt="AI Sales Report Sample" width={600} height={400} style={{width: '100%', height: 'auto'}} />
                        </div>
                        <div className={styles.useCaseContent}>
                            <div className={styles.useCaseTitle}>Use Case 2</div>
                            <h4>Analisis Data Dan Reporting</h4>
                            <p>Kalau anda nak analisis data, buat report atau dapatkan business insight yang actually grounded dan bukan halusinasi? apply je framework yang sama.</p>
                        </div>
                    </div>
                    
                    <div className={styles.useCaseCard}>
                        <div className={styles.useCaseImage}>
                            <Image src="https://res.cloudinary.com/dtvvaed5i/image/upload/v1753332728/Infografik_Sample_amkqdu.webp" alt="AI Infographic Sample" width={600} height={400} style={{width: '100%', height: 'auto'}} />
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
              <h2>Sebelum Saya Tunjuk Cara Framework Berfungsi, Mungkin Saya Patut Perkenalkan Diri Saya Dulu</h2>
            </div>
            <div className={styles.authorProfile}>
              <div className={styles.authorImage}>
                <Image src="https://res.cloudinary.com/dtvvaed5i/image/upload/v1753332746/Professional_Photo_mdtnaf.png" alt="Fareid - KelasGPT Instructor" width={300} height={300} style={{width: '100%', height: 'auto'}} />
              </div>
              <div className={styles.authorContent}>
                <h3>Hi, Saya Fareid</h3>
                <div className={styles.salesContent}>
                  <p>Kalau nama saya kedengaran familiar..</p>
                  
                  <p>Mungkin sebab anda pernah nampak atau menggunakan hasil kerja saya sebelum ini.</p>
                  
                  <p>Sebab sejak tahun 2020..</p>
                  
                  <p>saya pernah publish beberapa open-source financial indicator di <strong>TradingView</strong>, platform analisis kewangan global paling popular</p>
                  
                  <p>Yang mana <span className={styles.emphasis}>dua hasil saya dipilih sebagai Editor&rsquo;s Pick</span> oleh platform itu sendiri,</p>
                  
                  <div className={styles.tradingViewProof}>
                    <Image src="https://res.cloudinary.com/dtvvaed5i/image/upload/v1753332276/Bland_Terlalu_AI_2_nhqtrc.png" alt="TradingView Editor&rsquo;s Pick Screenshot" className={styles.tradingViewImage} width={800} height={600} style={{width: '100%', height: 'auto'}} />
                  </div>
                  
                  <p>Tetapi involvement saya dalam dunia technology as a service bukan sekadar menulis script untuk Tradingview..</p>
                  
                  <p>Dengan hampir <strong>8 tahun pengalaman sebagai Lead Business Analyst</strong> dalam beberapa company IT..</p>
                  
                  <p>Kepakaran utama saya as a bridging role, ialah menerangkan dan memberi konsultansi kepada business user tentang selok belok perkara teknikal berkaitan <span className={styles.highlight}>Teknologi dan AI dalam konteks bisnes mereka..</span></p>
                  
                  <p>Dan tujuan saya ceritakan semua ni ialah supaya anda faham..</p>
                </div>
              </div>
            </div>
            
            <div className={styles.salesContent} style={{marginTop: '3rem', textAlign: 'center'}}>
              <h3 style={{color: 'var(--terra-dark)', fontSize: '2rem', marginBottom: '1.5rem'}}>Ini BUKAN Kelas Buat Duit Dengan AI</h3>
              
              <p>Saya bukanlah sifu content creator atau marketing expert yang join trend AI..</p>
              
              <p>Saya tak janjikan cara buat duit dengan AI..</p>
              
              <p>Kalau itu yang anda cari, <strong>this class is not for u..</strong></p>
              
              <p><strong>Tapi..</strong></p>
              
              <p>Kalau anda mahukan someone yang berpengalaman dalam industri..</p>
              
              <p>Tolong breakdown konsep cara AI &lsquo;berfikir&rsquo; yang kompleks menjadi lebih mudah difahami..</p>
              
              <p>Sesuai untuk anda..</p>
              
              <p>Atau sesiapa yang langsung tak ada background teknikal..</p>
              
              <p>Cara nak leverage AI dalam kerja, study atau bisnes anda dengan <span className={styles.emphasis}>proper understanding..</span></p>
              
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
              <p><strong>Bayangkan..</strong></p>
              
              <p>Anda duduk dalam bilik anda, menghadap laptop dengan penuh fokus..</p>
              
              <p>Anda kerja keras sebab nak better future, Better income, Nak hidup selesa..</p>
              
              <p>Sama ada nak start side bisnes sendiri,</p>
              
              <p>Nak scale up bisnes sekarang,</p>
              
              <p>Improve kualiti kerja office..</p>
              
              <p>Apa saja yang anda nak buat..</p>
              
              <p><strong>Instead of serabut tak tahu nak mula dari mana, anda ada personal consultant, specially custom made untuk anda.</strong></p>
              
              <p>Kalau sebelum ni anda selalu blur, tak yakin atau tak pasti nak cari mana jawapan anda..</p>
              
              <p>Sekarang anda ada several <span style={{color: 'var(--terra-light)', fontWeight: '700'}}>&lsquo;expert employee&rsquo;</span> yang buat research dan manage task untuk anda.</p>
              
              <p>Bayangkan clarity of mind yang anda dapat..</p>
              
              <p>Sejauh mana fokus anda boleh pergi..</p>
              
              <p>Bila dah tak ada mental block remeh.. <em>(sebab utama orang ramai procrastinate)</em></p>
              
              <p>Bila anda tak payah buat kerja seorang diri..</p>
              
              <p><strong>Anda dah boleh bagi tumpuan dekat actual problem solving..</strong></p>
              
              <p><strong>Kerja-kerja yang high impact..</strong></p>
              
              <p><strong>Yang bagi anda kepuasan..</strong></p>
              
              <p>Biarkan kerja-kerja remeh, makan masa, tapi low impact diselesaikan oleh personal AI anda.</p>
              
              <p style={{fontSize: '1.5rem', fontWeight: '700', margin: '2rem 0'}}>Best part? Projek yang ambil masa sebulan, anda siapkan dalam masa 4-5 hari sahaja.</p>
              
              <p>Ada masa extra, anda fokus dekat benda lain, pasangan, anak2, kawan-kawan, side hustle lain..</p>
              
              <p>Buat macam ni untuk 3-4 bulan, orang keliling akan nampak perubahan kualiti kerja anda, start jadikan anda sebagai tempat rujukan.</p>
              
              <p><strong>Itu yang teknologi AI janjikan dari dulu..</strong></p>
              
              <p><strong>dan mampu berikan sekarang..</strong></p>
              
              <p>Kalau anda faham cara yang tepat dan betul untuk bina Personal Expert Consultant, custom made special untuk anda.</p>
              
              <p>Semua ni tak mustahil..</p>
              
              <p>Tak payah langgan Apps AI banyak2, ChatGPT pun cukup..</p>
              
              <p>Kalau tak suka ChatGPT.. Gemini ada, Claude, Grok..</p>
              
              <p>Tak kira platform apa yang anda guna</p>
              
              <p><strong>Anda akan belajar cara setup AI dengan betul..</strong></p>
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
        
        {/* --- Pricing Section --- */}
        <section className={`${styles.section} ${styles.grey}`}>
            <div className="container">
                <div className={styles.pricingBox}>
                    <h2>Pelaburan Anda</h2>
                    <p>Dapatkan akses seumur hidup kepada semua video, nota, dan kemas kini masa hadapan. Tiada yuran tersembunyi.</p>
                    <div className={styles.price}>{formatPrice(productSettings.productPrice, 'RM')} <span>sekali bayar</span></div>
                    <Link href="/checkout" className={styles.ctaButton}>
                      Dapatkan Akses Sekarang
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
