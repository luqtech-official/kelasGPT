import { useEffect, useState } from 'react';
import { trackPageView, getOrCreateVisitorId } from '../lib/simpleTracking';
import Head from "next/head";
import Link from "next/link";
import NextImage from "next/image";
import styles from "@/styles/IndexHuly.module.css";
import SocialProof from "@/components/SocialProof"; // Assuming this component exists and works
import { getProductSettings, formatPrice } from "../lib/settings";
import { getBlurDataURL, getImageSizes } from "../lib/imagekit";
import imagekitLoader from "../lib/imagekit-loader";
import { trackViewContent } from "../lib/facebook-pixel";
// import { ResponsiveImage } from '../components/ResponsiveImage';

const Image = (props) => <NextImage loader={imagekitLoader} {...props} />;

// Swiper components removed - not used in this component

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
    // Critical operations first (no delay)
    const id = getOrCreateVisitorId();
    setVisitorId(id);
    
    // Only append visitor ID if it exists
    if (id) {
      setCheckoutUrl(`/checkout?vid=${id}`);
    }
    
    // Defer non-critical tracking to not block FCP
    setTimeout(() => {
      trackPageView('/', id);
      
      // Track ViewContent event for Facebook Pixel - Simple and reliable
      if (productSettings) {
        trackViewContent({
          productName: productSettings.productName,
          productPrice: productSettings.productPrice,
          productId: 'kelasgpt-course',
          category: 'education'
        });
      }
    }, 100); // Small delay to allow FCP
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

        <meta name="theme-color" content="#000000"/>
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent"/>
  
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* The SocialProof component is kept as requested */}
      <SocialProof />


      <main className={styles.main}>
        
        {/* --- Hero Section --- */}
        <section className={`${styles.section} ${styles.hero}`}>
          {/* Navigation Bar */}
          <nav className={styles.navbar}>
            <div className={styles.navContainer}>
              <div className={styles.navBrand}>
                <span className={styles.navBrandText}>KelasGPT</span>
              </div>
            </div>
          </nav>

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
            {/* <div className={styles.heroVisualWrapper}> */}
              <div className={styles.heroVisualContent}>
              <Image 
                src="hero-main"
                alt="KelasGPT 3 Experts profile Card Visual" 
                width={600} 
                height={400}
                quality={85} 
                style={{width: '100%', height: 'auto'}} 
                loading="eager"
                priority
                placeholder="blur"
                blurDataURL={getBlurDataURL('hero-main')}
                sizes={getImageSizes('hero')}
                className={styles.heroImage}
              />
            </div>
            {/* </div> */}
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



        {/* --- Base Pricing Section (Main Template) --- */}  
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
                                loading="lazy"
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
                                loading="lazy"
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

// Convert to Static Generation for 600-800ms performance improvement
// Since getProductSettings() returns static data, we can pre-generate this page
export async function getStaticProps() {
  try {
    const productSettings = await getProductSettings();
    
    return {
      props: {
        productSettings
      },
      // Revalidate every 24 hours (86400 seconds) - adjust as needed
      revalidate: 86400
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
      },
      revalidate: 86400
    };
  }
}
