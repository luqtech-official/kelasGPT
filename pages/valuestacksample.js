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


      </main>

   

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
