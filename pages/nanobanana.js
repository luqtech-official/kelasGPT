import { useEffect, useState } from 'react';
import { trackPageView, getOrCreateVisitorId } from '../lib/simpleTracking';
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import styles from "@/styles/nanobanana-dark.module.css";
import SocialProof from "@/components/SocialProof";
import { getProductSettings } from "../lib/settings";
import { getBlurDataURL } from "../lib/imagekit";
import { trackViewContent } from "../lib/facebook-pixel";

// --- Icons ---
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

export default function Home({ productSettings }) {
  const [visitorId, setVisitorId] = useState(null);
  const [checkoutUrl, setCheckoutUrl] = useState('/checkout');

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
        <title>Teknik Prompting Gambar AI - Panduan Nano Banana Pro</title>
        <meta name="description" content="Kuasai teknik Prompt Keyword untuk hasilkan gambar AI yang tepat, tajam, dan memukau. Panduan lengkap dari Zero ke Pro." />
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
                <span className={styles.heroPillText}>EDISI DIKEMASKINI 2026 • NANO BANANA PRO</span>
              </div>
              
              <h1 className={styles.heroTitle}>
                Belajar Hasilkan Gambar AI<br />
                <span className={styles.heroEmphasis}>Yang Memukau</span>
              </h1>
              
              <p className={styles.heroSubTitle}>
                Jangan biarkan AI mengagak apa yang anda mahu. Kuasai <span className={styles.highlight}>&apos;Prompt Keyword&apos;</span> yang tepat untuk hasilkan visual gred professional, konsisten, dan menuruti arahan.
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
                    />
                 </div>
                 <div className={styles.heroCaption}>
                    👆 Bukan sekadar gambar cantik. Ini adalah hasil kawalan penuh ke atas AI.
                 </div>
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
                        <h2>Kenapa Prompt Panjang Berjela Pun Hasilnya Masih &apos;Ke Laut&apos;?</h2>
                    </div>
                    
                    <div className={styles.noiseText}>
                        <p>Pernah tak anda tulis prompt panjang-panjang, detail gila, tapi bila tekan &quot;Generate&quot;...</p>
                        <p>Gambar yang keluar: Jari ada 6, muka macam hantu, atau objek yang anda minta langsung tak wujud.</p>
                        <div className={styles.noiseHighlight}>
                            Masalahnya bukan imaginasi anda. Masalahnya ialah AI tu ibarat &apos;Pelukis Buta&apos;.
                        </div>
                        <p>Dia tak faham bahasa bunga-bunga. Dia faham <strong>KEYWORD</strong>. Dia perlukan arahan teknikal yang spesifik tentang lighting, sudut kamera, dan gaya visual.</p>
                        <p>Buku <strong>Nano Banana Pro</strong> ini bukan koleksi prompt untuk dihafal. Ia adalah manual teknikal untuk anda bercakap dalam bahasa yang AI faham sepenuhnya.</p>
                    </div>
                </div>
            </div>
        </section>

        {/* --- The Solution: Use Case Grid (Proof) --- */}
        <section className={styles.gallerySection}>
            <div className={styles.container}>
                <div className={styles.sectionHeader}>
                    <span className={styles.monoLabel}>POSSIBILITIES</span>
                    <h2>Apa Yang Bakal Anda Kuasai?</h2>
                    <p>Dari muka surat 34 hingga 85, kita akan bedah siasat teknik-teknik ini:</p>
                </div>

                <div className={styles.bentoGrid}>
                    {/* Item: Product Photography */}
                    <div className={`${styles.bentoCard} ${styles.span6}`}>
                        <div className={styles.bentoImageArea}>
                            <Image src="nanobanana-food" alt="Food Photography" width={600} height={400} style={{objectFit: 'cover', width: '100%', height: '100%'}} />
                            <div className={styles.imageOverlay}>Showcase No.24 & No.26</div>
                        </div>
                        <div className={styles.bentoContent}>
                            <h4>Commercial Food Photography</h4>
                            <p>Tak payah upah photographer mahal. Belajar keyword untuk lighting <em>&quot;Gourmet&quot;</em> dan texture makanan yang nampak menyelerakan.</p>
                        </div>
                    </div>

                    {/* Item: Cinematic Portrait */}
                    <div className={`${styles.bentoCard} ${styles.span6}`}>
                        <div className={styles.bentoImageArea}>
                            <Image src="nanobanana-woman-after" alt="Cinematic Portrait" width={600} height={400} style={{objectFit: 'cover', width: '100%', height: '100%'}} />
                            <div className={styles.imageOverlay}>Showcase No.10 & Case Study 1</div>
                        </div>
                        <div className={styles.bentoContent}>
                            <h4>Cinematic Portraits</h4>
                            <p>Kuasai teknik <em>Emotionally Charged Portrait</em>. Belajar control mata, ekspresi mikro, dan lighting dramatik untuk potret yang &apos;hidup&apos;.</p>
                        </div>
                    </div>

                    {/* Item: Infographic (Large) */}
                    <div className={`${styles.bentoCard} ${styles.span12}`}>
                        <div className={styles.bentoImageArea}>
                            <Image src="nanobanana-infographic" alt="Educational Infographic" width={1000} height={500} style={{objectFit: 'cover', width: '100%', height: '100%'}} />
                            <div className={styles.imageOverlay}>Showcase No.20 & Case Study 2</div>
                        </div>
                        <div className={styles.bentoContent}>
                            <h4>Educational Infographics & Posters</h4>
                            <p>Bukan sekadar gambar cantik. Belajar cara susun maklumat (Information Architecture) menggunakan AI untuk hasilkan poster yang informatif, tepat, dan nampak professional.</p>
                        </div>
                    </div>

                    {/* Item: Consistent Characters */}
                    <div className={`${styles.bentoCard} ${styles.span4}`}>
                        <div className={styles.bentoIcon}><TargetIcon /></div>
                        <h4>Face & Pose Transfer</h4>
                        <p>Nak kekalkan muka sama dalam scene berbeza? Teknik Module 2 & 3 akan ajar caranya.</p>
                    </div>

                    {/* Item: Quick Fixes */}
                    <div className={`${styles.bentoCard} ${styles.span4}`}>
                        <div className={styles.bentoIcon}><RefreshIcon /></div>
                        <h4>Quick Object Removal</h4>
                        <p>Guna AI untuk buang orang kat background atau betulkan cacat cela dalam masa 5 saat.</p>
                    </div>

                    {/* Item: Style Transfer */}
                    <div className={`${styles.bentoCard} ${styles.span4}`}>
                        <div className={styles.bentoIcon}><CameraIcon /></div>
                        <h4>Style Transfer</h4>
                        <p>Tukar gambar selfie biasa jadi Anime, 3D style, atau lukisan tanpa hilang rupa asal anda.</p>
                    </div>
                </div>

                {/* --- Deep Dive Transition --- */}
                <div style={{margin: '6rem 0 4rem', textAlign: 'center', borderTop: '1px solid #222', paddingTop: '4rem'}}>
                    <span className={styles.monoLabel}>DEEP DIVE EVIDENCE</span>
                    <h2 style={{fontSize: '2rem', fontWeight: '800', marginBottom: '1rem'}}>Lihat Beza &apos;Sebelum&apos; &amp; &apos;Selepas&apos;</h2>
                    <p style={{color: '#888', maxWidth: '600px', margin: '0 auto'}}>
                        Teknik dalam buku ini bukan tentang &apos;edit&apos; gambar. Ia tentang &apos;re-imagine&apos; potential gambar anda menggunakan keyword yang tepat.
                    </p>
                </div>

                <div className={styles.comparisonGrid}>
                    {/* Case Study 1: Food */}
                    <div className={styles.comparisonCard}>
                        <div className={styles.comparisonHeader}>
                            <h3>Case Study 1: Food Photography</h3>
                            <p>&quot;AI tak tukar makanan. AI cuma ubah &apos;Presentation&apos;. Dari gambar kedai makan biasa ke iklan komersial bernilai ribuan ringgit.&quot;</p>
                        </div>
                        <div className={styles.comparisonImages}>
                            <div className={styles.imageContainer}>
                                <div className={`${styles.imageLabel} ${styles.labelBefore}`}>BEFORE: ORIGINAL PHOTO</div>
                                <Image 
                                    src="nanobanana-maggi-before" 
                                    alt="Original Maggi Goreng" 
                                    width={500} 
                                    height={500} 
                                    style={{width: '100%', height: 'auto', display: 'block'}} 
                                />
                            </div>
                            <div className={styles.arrowDivider}>
                                <ArrowRightIcon width={40} height={40} />
                            </div>
                            <div className={styles.imageContainer}>
                                <div className={`${styles.imageLabel} ${styles.labelAfter}`}>AFTER: AI ENHANCED</div>
                                <Image 
                                    src="nanobanana-food" 
                                    alt="AI Enhanced Food Photography" 
                                    width={500} 
                                    height={500} 
                                    style={{width: '100%', height: 'auto', display: 'block'}} 
                                />
                            </div>
                        </div>
                    </div>

                    {/* Case Study 2: Portrait */}
                    <div className={styles.comparisonCard}>
                        <div className={styles.comparisonHeader}>
                            <h3>Case Study 2: Cinematic Portrait</h3>
                            <p>&quot;Dari &apos;flat&apos; photo ke &apos;Cinematic Masterpiece&apos;. Kawal lighting, depth of field, dan mood dengan keyword yang betul.&quot;</p>
                        </div>
                        <div className={styles.comparisonImages}>
                            <div className={styles.imageContainer}>
                                <div className={`${styles.imageLabel} ${styles.labelBefore}`}>BEFORE: FLAT LIGHTING</div>
                                <Image 
                                    src="nanobanana-woman-before" 
                                    alt="Original Woman Portrait" 
                                    width={500} 
                                    height={500} 
                                    style={{width: '100%', height: 'auto', display: 'block'}} 
                                />
                            </div>
                            <div className={styles.arrowDivider}>
                                <ArrowRightIcon width={40} height={40} />
                            </div>
                            <div className={styles.imageContainer}>
                                <div className={`${styles.imageLabel} ${styles.labelAfter}`}>AFTER: CINEMATIC LIGHTING</div>
                                <Image 
                                    src="nanobanana-woman-after" 
                                    alt="AI Cinematic Portrait" 
                                    width={500} 
                                    height={500} 
                                    style={{width: '100%', height: 'auto', display: 'block'}} 
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        {/* --- The Core Philosophy: Mastery vs Copy-Paste --- */}
        <section className={styles.coreSkillsSection}>
            <div className={styles.container}>
                <div style={{textAlign: 'center', marginBottom: '4rem'}}>
                    <span className={styles.monoLabel}>THE ARCHITECT MINDSET</span>
                    <h2 style={{fontSize: '2.5rem', fontWeight: '800', color: '#fff', marginBottom: '1.5rem'}}>Henti Jadi &quot;Copy-Paster&quot;.<br />Mula Jadi &quot;The Creator&quot;.</h2>
                    <p style={{color: '#888', maxWidth: '700px', margin: '0 auto', fontSize: '1.1rem'}}>
                        Kebanyakan &apos;Prompt Pack&apos; di luar sana akan buat anda stuck bila anda nak tukar sikit rupa gambar. Buku ini ajar anda <strong>DNA</strong> di sebalik setiap gambar.
                    </p>
                </div>

                <div className={styles.skillsGrid}>
                    {/* Skill 1 */}
                    <div className={styles.skillCard}>
                        <div className={styles.skillIcon}><TargetIcon /></div>
                        <h3>The Descriptive Shortcut</h3>
                        <p>Belajar cara paling mudah untuk tulis prompt yang sangat descriptive dan padat tanpa perlu pening kepala fikir grammar. AI akan faham tepat apa yang ada dalam kepala anda.</p>
                    </div>

                    {/* Skill 2 */}
                    <div className={styles.skillCard}>
                        <div className={styles.skillIcon}><RefreshIcon /></div>
                        <h3>Custom Template Engine</h3>
                        <p>Jangan bazir masa tulis prompt baru setiap kali. Saya ajar cara bina <strong>Prompt Template</strong> anda sendiri. Tukar satu keyword, dapat hasil berbeza yang tetap konsisten dengan style anda.</p>
                    </div>

                    {/* Skill 3 */}
                    <div className={styles.skillCard}>
                        <div className={styles.skillIcon}><CameraIcon /></div>
                        <h3>The Style Decoder</h3>
                        <p>Nampak gambar gempak kat Pinterest atau Instagram? Guna teknik <strong>Reverse Engineering</strong> yang saya ajar untuk &quot;bedah&quot; gambar tu dan hasilkan prompt rahsia untuk recreate style yang sama.</p>
                    </div>
                </div>
            </div>
        </section>

        {/* --- Curriculum Breakdown (Fascinations) --- */}
        <section className={styles.curriculumSection}>
            <div className={styles.container}>
                <div className={styles.sectionHeader}>
                    <span className={styles.monoLabel}>ISI KANDUNGAN</span>
                    <h2>Toolkit Lengkap: Dari Zero ke Pro</h2>
                </div>

                <div className={styles.chapterList}>
                    {/* Beginner Phase */}
                    <div className={styles.chapterGroup}>
                        <h3 className={styles.groupTitle}>PHASE 1: THE FOUNDATION</h3>
                        <ul className={styles.benefitList}>
                            <li><strong>Asas Prompt Gambar AI:</strong> Faham struktur ayat yang AI tak boleh tolak.</li>
                            <li><strong>3 Prinsip &apos;Image Prompt Engineering&apos;:</strong> Rahsia untuk dapat result konsisten setiap kali generate.</li>
                            <li><strong>Generate Gambar Pertama:</strong> Step-by-step walkthrough untuk yang baru nak mula.</li>
                        </ul>
                    </div>

                    {/* Technical Phase */}
                    <div className={styles.chapterGroup}>
                        <h3 className={styles.groupTitle} style={{color: 'var(--accent-color)'}}>PHASE 2: TECHNICAL MASTERY (Muka Surat 86-117)</h3>
                        <p className={styles.groupDesc}>Inilah beza &apos;User Biasa&apos; dengan &apos;Prompt Engineer&apos;. Anda akan belajar bahasa teknikal fotografi:</p>
                        <ul className={styles.benefitList}>
                            <li><strong>Camera Angle Vocabulary:</strong> Low angle, wide shot, macro lens. Tahu bila nak guna untuk impak maksima.</li>
                            <li><strong>Lighting Mastery:</strong> Cara &apos;set up&apos; lampu dalam AI (Rim lighting, Volumetric fog, Softbox lighting).</li>
                            <li><strong>Depth of Field (DoF):</strong> Kawal background blur (bokeh) macam pro photographer.</li>
                            <li><strong>Aspect Ratio:</strong> Setting saiz gambar yang betul untuk Instagram, YouTube, atau Print.</li>
                        </ul>
                    </div>

                    {/* Advanced Phase */}
                    <div className={styles.chapterGroup}>
                        <h3 className={styles.groupTitle}>PHASE 3: ADVANCED WORKFLOW</h3>
                        <ul className={styles.benefitList}>
                            <li><strong>Teknik Editing &amp; Debugging:</strong> Apa nak buat bila AI degil? Teknik &apos;Inpainting&apos; dan &apos;Outpainting&apos; untuk betulkan gambar rosak.</li>
                            <li><strong>Meta Prompting:</strong> Cara suruh AI tulis prompt untuk anda (Jimat masa!).</li>
                            <li><strong>JSON Prompting vs Natural Language:</strong> Bila nak guna kod, bila nak guna ayat biasa.</li>
                            <li><strong>Case Study Bedah Siasat:</strong> Kita bedah prompt untuk Infographic Poster dan Nature Photography satu per satu.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </section>

        {/* --- Pricing Ticket & Offer --- */}
        <section className={styles.pricingSection}>
            <div className={styles.container}>
                <div className={styles.pricingTicket}>
                    <div className={styles.ticketHeader}>
                        <span className={styles.monoLabel} style={{color: '#000'}}>ACCESS PASS</span>
                        <h2>NANO BANANA PRO</h2>
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
                    </div>

                    <div className={styles.valueStack}>
                        <div className={styles.stackItem}>
                            <div className={styles.stackIcon}><BookIcon /></div>
                            <div className={styles.stackText}>
                                <strong>Ebook Nano Banana Pro (PDF)</strong>
                                <span>189 Muka Surat. Padat dengan contoh visual & keyword.</span>
                            </div>
                        </div>
                        <div className={styles.stackItem}>
                            <div className={styles.stackIcon}><RefreshIcon /></div>
                            <div className={styles.stackText}>
                                <strong>LIFETIME UPDATES <span className={styles.badge}>BERNILAI</span></strong>
                                <span>Teknologi AI berubah cepat. Beli sekali, anda akan dapat update untuk versi v2, v3, dan seterusnya secara PERCUMA. Kami update content bila AI update feature.</span>
                            </div>
                        </div>
                        <div className={styles.stackItem}>
                            <div className={styles.stackIcon}><TargetIcon /></div>
                            <div className={styles.stackText}>
                                <strong>BONUS: Prompt Library</strong>
                                <span>Koleksi &apos;Copy-Paste&apos; prompt yang dah proven untuk pelbagai style.</span>
                            </div>
                        </div>
                    </div>

                    <div className={styles.reasonBox}>
                        <h4>Kenapa Murah Sangat? (Jujur Cakap)</h4>
                        <p>
                            &quot;Sebab saya tak nak spend duit untuk Marketing/Ads - saya nak guna word-of-mouth je. Dengan cara ni, saya jimat beribu ringgit, jadi saya boleh pass &apos;penjimatan&apos; tu terus pada anda. Impian saya? Nak ramai orang bercakap pasal ebook ni. So saya minta, bila anda dah nampak result, tolong share dengan kawan yang anda rasa boleh dapat benefit dari ebook ni. Simple - kita sama-sama untung.&quot;
                        </p>
                    </div>

                    <Link href={checkoutUrl} className={styles.buyButton}>
                        DAPATKAN AKSES SEKARANG
                    </Link>
                    
                    <p style={{textAlign: 'center', fontSize: '0.8rem', marginTop: '1rem', color: '#666'}}>
                        Instant Digital Download (PDF) • Secure Payment
                    </p>
                </div>
            </div>
        </section>

        {/* --- New Section: Partner Program --- */}
        <section className={styles.partnerSection} style={{padding: '6rem 0', background: 'linear-gradient(180deg, #0a0a0a 0%, #111 100%)', borderTop: '1px solid #222'}}>
            <div className={styles.container}>
                <div style={{maxWidth: '800px', margin: '0 auto', textAlign: 'center'}}>
                    <div style={{display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '60px', height: '60px', background: 'rgba(255, 107, 53, 0.1)', color: '#ff6b35', borderRadius: '50%', marginBottom: '1.5rem'}}>
                        <DollarIcon width={30} height={30} />
                    </div>
                    <h2 style={{fontSize: '2.2rem', fontWeight: 800, marginBottom: '1rem', color: '#fff'}}>
                        <span style={{display: 'block', marginBottom: '1rem', color: 'var(--accent-color)'}}>Oopps, Sekejap!</span>
                        Anda Juga Akan Dapat Peluang Belajar AI Sambil Jana Pendapatan!!
                    </h2>
                    <p style={{fontSize: '1.2rem', color: '#ccc', marginBottom: '3rem'}}>
                        Kami tak nak anda &apos;menjual&apos;. Kami nak anda &apos;membantu&apos;. Sebab itu setiap pembeli akan dibekalkan dengan <strong>&apos;Senjata Rahsia&apos;</strong>:
                    </p>

                    <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', textAlign: 'left'}}>
                         <div style={{background: '#050505', padding: '2rem', borderRadius: '12px', border: '1px solid #333'}}>
                            <h4 style={{fontSize: '3rem', fontWeight: 900, color: 'var(--accent-color)', marginBottom: '0.5rem', lineHeight: 1}}>20%</h4>
                            <p style={{color: '#fff', fontWeight: 600, fontSize: '1.1rem'}}>Promo code unik setiap affiliate</p>
                            <p style={{color: '#888', fontSize: '0.95rem'}}>Kawan anda tak perlu bayar harga penuh. Dengan code unik anda, mereka dapat <strong>Potongan 20%</strong> serta merta. Senang untuk mereka cakap &quot;YES!&quot; kepada recommendation anda.</p>
                         </div>
                         <div style={{background: '#050505', padding: '2rem', borderRadius: '12px', border: '1px solid #333'}}>
                            <h4 style={{fontSize: '3rem', fontWeight: 900, color: '#fff', marginBottom: '0.5rem', lineHeight: 1}}>33%</h4>
                            <p style={{color: '#fff', fontWeight: 600, fontSize: '1.1rem'}}>Commission Rate Yang Tinggi!!</p>
                            <p style={{color: '#888', fontSize: '0.95rem'}}>Walaupun kawan anda dapat diskaun, anda tetap layak mendapat komisen tinggi <strong>33%</strong> untuk setiap jualan. Cukup 4 orang kawan guna code anda, pelaburan buku anda bukan sahaja balik modal, malah anda sudah pun mula menjana untung bersih!</p>
                         </div>
                    </div>
                </div>
            </div>
        </section>


      </main>
      
      {/* --- Contact Support Section --- */}
      <section className={styles.contactSection}>
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
      <footer className={styles.legalFooter}>
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
          productName: 'KelasGPT - Nano Banana Pro',
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
