import { useEffect, useState } from 'react';
import { trackPageView, getOrCreateVisitorId } from '../lib/simpleTracking';
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import styles from "@/styles/nanobanana-dark.module.css"; 
import SocialProof from "@/components/SocialProof";
import { getProductSettings, formatPrice } from "../lib/settings";
import { getBlurDataURL, getImageSizes } from "../lib/imagekit";
import { trackViewContent } from "../lib/facebook-pixel";

// --- Icons ---
const CheckIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="20 6 9 17 4 12"></polyline></svg>
);
const ArrowRightIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
);
const FolderIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
    </svg>
);
const CameraIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
        <circle cx="12" cy="13" r="4"></circle>
    </svg>
);
const EditIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4L18.5 2.5z"></path>
    </svg>
);
const SunIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <circle cx="12" cy="12" r="5"></circle>
        <line x1="12" y1="1" x2="12" y2="3"></line>
        <line x1="12" y1="21" x2="12" y2="23"></line>
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
        <line x1="1" y1="12" x2="3" y2="12"></line>
        <line x1="21" y1="12" x2="23" y2="12"></line>
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
    </svg>
);
const UsersIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
        <circle cx="9" cy="7" r="4"></circle>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
    </svg>
);

export default function Home({ productSettings }) {
  const [expandedModules, setExpandedModules] = useState({});
  const [visitorId, setVisitorId] = useState(null);
  const [checkoutUrl, setCheckoutUrl] = useState('/checkout');

  const toggleModule = (moduleId) => {
    setExpandedModules(prev => {
      const isCurrentlyExpanded = prev[moduleId];
      return isCurrentlyExpanded ? { ...prev, [moduleId]: false } : { [moduleId]: true };
    });
  };

  const formatSavings = (amount) => `RM${amount.toLocaleString('en-MY')}`;
  
  const calculateProgress = (total, left) => {
    const numTotal = Number(total) || 0;
    const numLeft = Number(left) || 0;
    const claimed = numTotal - numLeft;
    const percentage = numTotal > 0 ? (claimed / numTotal * 100) : 0;
    return Math.max(0, Math.min(100, percentage));
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
        <meta name="description" content="Belajar cara hasilkan gambar AI memukau guna Nano Banana Pro. Panduan langkah-demi-langkah dari zero hingga mastery dalam Bahasa Melayu yang santai." />
        <meta property="og:title" content="Teknik Prompting Gambar AI - Zero to Mastery" />
        <meta property="og:description" content="Ebook panduan praktikal untuk hasilkan visual AI professional. Sesuai untuk beginner, marketer, dan content creator." />
        <meta property="og:image" content="/og-image-nanobanana.png" />
        <meta property="og:url" content="https://kelasgpt.com/nanobanana" />
        <meta property="og:type" content="book" />
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
                <span className={styles.heroPillText}>REC 00:00:00 • NANO BANANA PRO</span>
              </div>
              
              <h1 className={styles.heroTitle}>
                <span>Hasilkan Gambar AI</span>
                <span className={styles.heroEmphasis}>Yang Memukau</span>
              </h1>
              
              <p className={styles.heroSubTitle}>
                Panduan Lengkap <strong>Zero To Mastery</strong>. Kuasai teknik &apos;Natural Language&apos; prompting untuk hasilkan visual level professional tanpa pening kepala.
              </p>

              <div className={styles.heroVisualWrapper}>
                 <div className={styles.heroVisualContent}>
                    <div className={styles.heroVisualOverlay}></div>
                    <Image 
                        src="hero-main"
                        alt="Teknik Prompting Gambar AI Book Cover Visual" 
                        width={800} 
                        height={500}
                        quality={90} 
                        style={{width: '100%', height: 'auto', display: 'block'}} 
                        priority
                        placeholder="blur"
                        blurDataURL={getBlurDataURL('hero-main')}
                    />
                 </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- WIIFM Bento Grid --- */}
        <section className={styles.wiifm}>
          <div className={styles.container}>
            <div className={styles.sectionHeader}>
                <span className={styles.monoLabel}>APA YANG ANDA DAPAT</span>
                <h2>Toolkit Visual Anda</h2>
            </div>

            <div className={styles.bentoGrid}>
                {/* Item 1 */}
                <div className={`${styles.bentoCard} ${styles.span6}`}>
                    <div className={styles.bentoIcon}><CameraIcon /></div>
                    <h4>Panduan Langkah-Demi-Langkah</h4>
                    <p>Dari zero knowledge pasal AI, sampai boleh generate gambar pertama yang nampak macam pro photographer ambil. Bahasa santai, senang faham.</p>
                </div>

                {/* Item 2 */}
                <div className={`${styles.bentoCard} ${styles.span6}`}>
                    <div className={styles.bentoIcon}><FolderIcon /></div>
                    <h4>Teknik &apos;Natural Language&apos;</h4>
                    <p>Lupakan kod pelik-pelik. Belajar cara &apos;berbual&apos; dengan AI guna ayat manusia biasa untuk dapat result yang tepat.</p>
                </div>

                {/* Item 3 */}
                <div className={`${styles.bentoCard} ${styles.span4}`}>
                    <div className={styles.bentoIcon}><EditIcon /></div>
                    <h4>Koleksi Prompt</h4>
                    <p>Template &apos;Copy-Paste&apos; untuk 50+ gaya visual popular. Jimat masa!</p>
                </div>

                {/* Item 4 */}
                <div className={`${styles.bentoCard} ${styles.span4}`}>
                    <div className={styles.bentoIcon}><SunIcon /></div>
                    <h4>Lighting Cheat Sheet</h4>
                    <p>Keyword rahsia untuk effect &apos;Cinematic Lighting&apos; tanpa perlu jadi pakar fotografi.</p>
                </div>

                {/* Item 5 */}
                <div className={`${styles.bentoCard} ${styles.span4}`}>
                    <div className={styles.bentoIcon}><UsersIcon /></div>
                    <h4>Character Consistency</h4>
                    <p>Teknik advanced untuk kekalkan rupa watak yang sama dalam scene berbeza.</p>
                </div>
            </div>
          </div>
        </section>

        {/* --- Pain Points / Noise Section --- */}
        <section className={styles.noiseSection}>
            <div className={styles.container}>
                <div className={styles.noiseContainer}>
                    <div className={styles.sectionHeader} style={{textAlign: 'left', margin: 0}}>
                        <span className={styles.monoLabel}>REALITY CHECK</span>
                        <h2>Kenapa Gambar AI Anda Nampak &apos;Pelik&apos;?</h2>
                    </div>
                    
                    <div className={styles.noiseText}>
                        <p>Anda pernah taip prompt: <em>&quot;A beautiful cat in space&quot;</em>..</p>
                        <p>Tapi yang keluar? Kucing mata juling, jari ada 6, atau background yang nampak &apos;fake&apos; sangat.</p>
                        <div className={styles.noiseHighlight}>
                            &quot;Sebenarnya, AI tu ibarat &apos;Pelukis Buta&apos;. Dia power melukis, tapi dia tak nampak dunia. Dia cuma melukis apa yang dia &apos;dengar&apos; dari prompt anda.&quot;
                        </div>
                        <p>Masalahnya bukan pada AI tu. Masalahnya pada <strong>cara kita bercakap dengan dia</strong>.</p>
                        <p>Dalam ebook ini, saya tak ajar anda menghafal prompt.</p>
                        <p><strong className={styles.highlight}>Saya ajar anda &apos;vocabulary&apos; visual untuk jadi Creative Director kepada AI anda.</strong></p>
                    </div>
                </div>
            </div>
        </section>

        {/* --- Visual Styles Gallery --- */}
        <section className={styles.gallerySection}>
            <div className={styles.container}>
                <div className={styles.sectionHeader}>
                    <span className={styles.monoLabel}>GALLERY MODE</span>
                    <h2>5 Gaya Visual Utama</h2>
                    <p>Satu prompt, pelbagai kemungkinan. Ini yang anda akan master.</p>
                </div>

                <div className={styles.galleryGrid}>
                    {/* Style 1 */}
                    <div className={`${styles.galleryItem} ${styles.viewfinder}`}>
                        <div className={styles.galleryImageWrapper}>
                            <Image src="hero-main" alt="Photorealistic" width={400} height={500} style={{objectFit: 'cover', width: '100%', height: '100%'}} />
                            <div className={styles.galleryOverlay}>
                                <span className={styles.galleryTag}>REALISM</span>
                                <div className={styles.galleryTitle}>Photorealistic</div>
                                <div className={styles.galleryDesc}>Potret manusia & produk yang nampak hidup.</div>
                            </div>
                        </div>
                    </div>

                    {/* Style 2 */}
                    <div className={`${styles.galleryItem} ${styles.viewfinder}`}>
                        <div className={styles.galleryImageWrapper}>
                            <Image src="hero-main" alt="Cinematic" width={400} height={500} style={{objectFit: 'cover', width: '100%', height: '100%'}} />
                            <div className={styles.galleryOverlay}>
                                <span className={styles.galleryTag}>CINEMATIC</span>
                                <div className={styles.galleryTitle}>Movie Concept</div>
                                <div className={styles.galleryDesc}>Lighting dramatik & komposisi epik.</div>
                            </div>
                        </div>
                    </div>

                    {/* Style 3 */}
                    <div className={`${styles.galleryItem} ${styles.viewfinder}`}>
                        <div className={styles.galleryImageWrapper}>
                            <Image src="hero-main" alt="Anime" width={400} height={500} style={{objectFit: 'cover', width: '100%', height: '100%'}} />
                            <div className={styles.galleryOverlay}>
                                <span className={styles.galleryTag}>2D ART</span>
                                <div className={styles.galleryTitle}>Anime & Manga</div>
                                <div className={styles.galleryDesc}>Gaya lukisan Jepun dari retro ke modern.</div>
                            </div>
                        </div>
                    </div>

                    {/* Style 4 */}
                    <div className={`${styles.galleryItem} ${styles.viewfinder}`}>
                        <div className={styles.galleryImageWrapper}>
                            <Image src="hero-main" alt="3D Render" width={400} height={500} style={{objectFit: 'cover', width: '100%', height: '100%'}} />
                            <div className={styles.galleryOverlay}>
                                <span className={styles.galleryTag}>3D DESIGN</span>
                                <div className={styles.galleryTitle}>3D Render</div>
                                <div className={styles.galleryDesc}>Watak comel & mockup produk clean.</div>
                            </div>
                        </div>
                    </div>

                    {/* Style 5 */}
                    <div className={`${styles.galleryItem} ${styles.viewfinder}`}>
                        <div className={styles.galleryImageWrapper}>
                            <Image src="hero-main" alt="Logo" width={400} height={500} style={{objectFit: 'cover', width: '100%', height: '100%'}} />
                            <div className={styles.galleryOverlay}>
                                <span className={styles.galleryTag}>VECTOR</span>
                                <div className={styles.galleryTitle}>Logo & Icon</div>
                                <div className={styles.galleryDesc}>Design minimalis untuk branding.</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        {/* --- Curriculum Directory --- */}
        <section className={styles.curriculumSection}>
            <div className={styles.container}>
                <div className={styles.sectionHeader}>
                    <span className={styles.monoLabel}>DIRECTORY / ROOT</span>
                    <h2>Isi Kandungan</h2>
                </div>

                <div className={styles.directoryList}>
                    {/* Chapter 1 */}
                    <div className={styles.directoryItem}>
                        <div className={styles.directoryHeader} onClick={() => toggleModule('m1')}>
                            <FolderIcon className={styles.directoryFolderIcon} />
                            <div className={styles.directoryInfo}>
                                <span className={styles.chapterTitle}>BAB 1_PENGENALAN</span>
                                <ArrowRightIcon style={{transform: expandedModules['m1'] ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s'}} />
                            </div>
                        </div>
                        {expandedModules['m1'] && (
                            <div className={styles.directoryContent}>
                                <p>1.1 - Setup Nano Banana Pro & Interface Walkthrough</p>
                                <p>1.2 - Memahami &apos;Otak&apos; AI Image Generator</p>
                            </div>
                        )}
                    </div>

                    {/* Chapter 2 */}
                    <div className={styles.directoryItem}>
                        <div className={styles.directoryHeader} onClick={() => toggleModule('m2')}>
                            <FolderIcon className={styles.directoryFolderIcon} />
                            <div className={styles.directoryInfo}>
                                <span className={styles.chapterTitle}>BAB 2_FOUNDATION_PROMPTING</span>
                                <ArrowRightIcon style={{transform: expandedModules['m2'] ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s'}} />
                            </div>
                        </div>
                        {expandedModules['m2'] && (
                            <div className={styles.directoryContent}>
                                <p>2.1 - The 4-Part Structure (Subject, Environment, Lighting, Style)</p>
                                <p>2.2 - Natural Language vs Robot Speak</p>
                            </div>
                        )}
                    </div>

                    {/* Chapter 3 */}
                    <div className={styles.directoryItem}>
                        <div className={styles.directoryHeader} onClick={() => toggleModule('m3')}>
                            <FolderIcon className={styles.directoryFolderIcon} />
                            <div className={styles.directoryInfo}>
                                <span className={styles.chapterTitle}>BAB 3_LIGHTING_&_CAMERA</span>
                                <ArrowRightIcon style={{transform: expandedModules['m3'] ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s'}} />
                            </div>
                        </div>
                        {expandedModules['m3'] && (
                            <div className={styles.directoryContent}>
                                <p>3.1 - Cinematic Lighting Secrets (Golden Hour, Neon, Volumetric)</p>
                                <p>3.2 - Camera Angles (Low, Wide, Macro) & Lens Effects</p>
                            </div>
                        )}
                    </div>

                    {/* Chapter 4 */}
                    <div className={styles.directoryItem}>
                        <div className={styles.directoryHeader} onClick={() => toggleModule('m4')}>
                            <FolderIcon className={styles.directoryFolderIcon} />
                            <div className={styles.directoryInfo}>
                                <span className={styles.chapterTitle}>BAB 4_ART_STYLES</span>
                                <ArrowRightIcon style={{transform: expandedModules['m4'] ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s'}} />
                            </div>
                        </div>
                        {expandedModules['m4'] && (
                            <div className={styles.directoryContent}>
                                <p>4.1 - Photorealistic Portraits Mastery</p>
                                <p>4.2 - Anime, 3D Render & Vector Art Deep Dive</p>
                            </div>
                        )}
                    </div>

                    {/* Bonus */}
                    <div className={`${styles.directoryItem} ${styles.bonusCard}`}>
                        <div className={styles.directoryHeader} onClick={() => toggleModule('bonus')}>
                            <FolderIcon className={styles.directoryFolderIcon} style={{color: 'var(--accent-color)'}} />
                            <div className={styles.directoryInfo}>
                                <span className={styles.chapterTitle} style={{color: 'var(--accent-color)'}}>BONUS_MATERIALS</span>
                                <ArrowRightIcon style={{color: 'var(--accent-color)', transform: expandedModules['bonus'] ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s'}} />
                            </div>
                        </div>
                        {expandedModules['bonus'] && (
                            <div className={styles.directoryContent}>
                                <p>• Library Prompt &apos;Copy-Paste&apos;</p>
                                <p>• Cheat Sheet Komposisi & Lighting (PDF)</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>

        {/* --- Pricing Ticket --- */}
        <section className={styles.pricingSection}>
            <div className={styles.container}>
                <div className={styles.pricingTicket}>
                    <div className={styles.ticketHeader}>
                        <span className={styles.monoLabel} style={{color: '#000'}}>ADMIT ONE</span>
                        <h2>ACCESS PASS</h2>
                    </div>
                    
                    <div style={{textAlign: 'center', marginBottom: '2rem'}}>
                        <div className={styles.priceTag}>
                            <span style={{fontSize: '2rem', verticalAlign: 'top'}}>RM</span>
                            {productSettings.allowdiscount ? productSettings.baseproductprice : productSettings.productPrice}
                        </div>
                        {productSettings.allowdiscount && (
                            <div className={styles.priceSub} style={{textDecoration: 'line-through'}}>
                                Normal: RM {productSettings.baseproductprice}
                            </div>
                        )}
                         <div className={styles.priceSub}>
                            Total Value: RM 832
                        </div>
                    </div>

                    <ul className={styles.ticketIncludes}>
                        <li><CheckIcon className={styles.checkIcon} /> Ebook Panduan Lengkap (PDF)</li>
                        <li><CheckIcon className={styles.checkIcon} /> Video Walkthrough</li>
                        <li><CheckIcon className={styles.checkIcon} /> Prompt Library Access</li>
                        <li><CheckIcon className={styles.checkIcon} /> Lifetime Updates</li>
                    </ul>

                    <Link href={checkoutUrl} className={styles.buyButton}>
                        SECURE MY COPY
                    </Link>
                    
                    <p style={{textAlign: 'center', fontSize: '0.8rem', marginTop: '1rem', color: '#666'}}>
                        100% Money Back Guarantee • Instant Download
                    </p>
                </div>
                
                {productSettings.allowdiscount && (
                    <div style={{textAlign: 'center', marginTop: '2rem', color: 'var(--text-muted)'}}>
                        <p>⚠️ Early Bird Offer: Hanya <strong>{productSettings.discountunitleft}</strong> unit tinggal.</p>
                        <div style={{width: '200px', height: '4px', background: '#333', margin: '1rem auto', borderRadius: '2px'}}>
                             <div style={{width: `${calculateProgress(productSettings.discountunittotal, productSettings.discountunitleft)}%`, height: '100%', background: 'var(--accent-color)'}}></div>
                        </div>
                    </div>
                )}
            </div>
        </section>

      </main>
      
      {/* Footer Simplified */}
      <footer style={{padding: '2rem 0', textAlign: 'center', borderTop: '1px solid #333', fontSize: '0.8rem', color: '#666'}}>
        <p>&copy; 2025 KelasGPT. All rights reserved.</p>
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
          productName: 'KelasGPT - Instant Access x1',
          productPrice: 197.00,
          productDescription: 'Complete GPT-4 learning course in Malay language'
        }
      },
      revalidate: 86400
    };
  }
}
