import Head from 'next/head';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import styles from '../styles/VideoListing.module.css';
import { getBlurDataURL, getImageSizes } from '../lib/imagekit';

export default function VideoListing() {
  const [selectedVideoForModal, setSelectedVideoForModal] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const courseModules = [
    {
      title: "Pengenalan Asas AI dan LLM",
      description: "Memahami asas-asas AI dan LLM dan cara ia berfungsi dalam kehidupan harian",
      videos: [
        {
          title: "Apa itu AI dan LLM dan Mengapa Ia Penting",
          description: "Pelajari tentang teknologi AI terkini dan bagaimana ia boleh mengubah cara anda bekerja",
          duration: "12 minit",
          url: "https://www.youtube.com/embed/1jn_RpbPbEc?si=YFJtwcqrzIVJdzFQ"
        },
        {
          title: "Persediaan Pertama: Menyediakan Persekitaran GPT",
          description: "Panduan langkah demi langkah untuk memulakan penggunaan AI dan LLM dengan betul",
          duration: "15 minit",
          url: "https://www.youtube.com/embed/8rABwKRsec4?si=PQkr3QUcMmovXIjQ"
        },
        {
          title: "Navigasi Antara Muka dan Ciri-ciri Asas",
          description: "Mengenali semua fungsi penting dan cara menggunakannya dengan efektif",
          duration: "18 minit",
          url: "https://www.youtube.com/embed/1jn_RpbPbEc?si=YFJtwcqrzIVJdzFQ"
        }
      ]
    },
    {
      title: "Teknik Prompt Engineering",
      description: "Menguasai seni menulis prompt yang berkesan untuk hasil yang optimum",
      videos: [
        {
          title: "Asas-asas Prompt yang Berkesan",
          description: "Pelajari struktur dan format prompt yang menghasilkan jawapan berkualiti tinggi",
          duration: "20 minit",
          url: "https://www.youtube.com/embed/1jn_RpbPbEc?si=YFJtwcqrzIVJdzFQ"
        },
        {
          title: "Teknik Prompt Lanjutan untuk Hasil Spesifik",
          description: "Strategi mendalam untuk mendapatkan output yang tepat mengikut keperluan anda",
          duration: "25 minit",
          url: "https://www.youtube.com/embed/1jn_RpbPbEc?si=YFJtwcqrzIVJdzFQ"
        },
        {
          title: "Prompt Templates untuk Pelbagai Kegunaan",
          description: "Template siap pakai untuk penulisan, analisis, pemecahan masalah dan banyak lagi",
          duration: "22 minit",
          url: "https://www.youtube.com/embed/1jn_RpbPbEc?si=YFJtwcqrzIVJdzFQ"
        }
      ]
    },
    {
      title: "Aplikasi Praktis dalam Perniagaan",
      description: "Melaksanakan AI dan LLM dalam operasi harian perniagaan untuk meningkatkan produktiviti",
      videos: [
        {
          title: "Automasi Penulisan Email dan Komunikasi",
          description: "Cara menggunakan AI dan LLM untuk menulis email profesional dan komunikasi yang berkesan",
          duration: "16 minit",
          url: "https://www.youtube.com/embed/1jn_RpbPbEc?si=YFJtwcqrzIVJdzFQ"
        },
        {
          title: "Analisis Data dan Laporan dengan AI dan LLM",
          description: "Menggunakan AI untuk menganalisis data dan menghasilkan laporan yang bermakna",
          duration: "28 minit",
          url: "https://www.youtube.com/embed/1jn_RpbPbEc?si=YFJtwcqrzIVJdzFQ"
        },
        {
          title: "Strategi Pemasaran dan Kandungan Kreatif",
          description: "Menghasilkan idea kreatif dan strategi pemasaran yang menarik dengan bantuan AI",
          duration: "24 minit",
          url: "https://www.youtube.com/embed/1jn_RpbPbEc?si=YFJtwcqrzIVJdzFQ"
        }
      ]
    },
    {
      title: "Workflow dan Integrasi",
      description: "Mengintegrasikan AI dan LLM ke dalam alir kerja sedia ada dengan berkesan",
      videos: [
        {
          title: "Menyepadukan AI dan LLM dengan Tool Sedia Ada",
          description: "Panduan praktikal untuk menggabungkan AI dan LLM dengan perisian dan platform yang anda gunakan",
          duration: "19 minit",
          url: "https://www.youtube.com/embed/1jn_RpbPbEc?si=YFJtwcqrzIVJdzFQ"
        },
        {
          title: "Mencipta Workflow Automatik",
          description: "Membina sistem automatik yang menggunakan AI dan LLM untuk tugas-tugas berulang",
          duration: "26 minit",
          url: "https://www.youtube.com/embed/1jn_RpbPbEc?si=YFJtwcqrzIVJdzFQ"
        },
        {
          title: "Pengurusan Masa dan Produktiviti dengan AI",
          description: "Strategi menggunakan AI untuk meningkatkan pengurusan masa dan produktiviti harian",
          duration: "21 minit",
          url: "https://www.youtube.com/embed/1jn_RpbPbEc?si=YFJtwcqrzIVJdzFQ"
        }
      ]
    },
    {
      title: "Teknik Lanjutan dan Trend Terkini",
      description: "Menguasai teknik-teknik canggih dan mengikuti perkembangan terbaru dalam AI",
      videos: [
        {
          title: "Multi-modal AI dan Penggunaan Gambar",
          description: "Menggunakan AI dan LLM untuk menganalisis dan menghasilkan kandungan berdasarkan gambar",
          duration: "23 minit",
          url: "https://www.youtube.com/embed/1jn_RpbPbEc?si=YFJtwcqrzIVJdzFQ"
        },
        {
          title: "API Integration dan Pengaturcaraan Asas",
          description: "Cara menggunakan API AI dan LLM untuk aplikasi yang lebih kompleks dan tersuai",
          duration: "30 minit",
          url: "https://www.youtube.com/embed/1jn_RpbPbEc?si=YFJtwcqrzIVJdzFQ"
        },
        {
          title: "Etika AI dan Penggunaan Bertanggungjawab",
          description: "Memahami limitasi AI dan cara menggunakannya secara etika dan bertanggungjawab",
          duration: "17 minit",
          url: "https://www.youtube.com/embed/1jn_RpbPbEc?si=YFJtwcqrzIVJdzFQ"
        }
      ]
    }
  ];

  const aiAssistants = [
    {
      name: "Balqis",
      title: "Digital Product Ideation Expert",
      description: "Generate profitable digital product ideas from zero",
      photo: "balqis-photo",
      accessAssistant: "https://chatgpt.com/g/g-68965d41ae6c81918f2a7102ca495a79-balqis-the-friendly-productivity-coach",
      sourceFile: "https://drive.google.com/drive/folders/19bzmLXPqpVfV5viC-WvQdgDgAEzZf2nZ?usp=sharing"
    },
    {
      name: "Sarah",
      title: "Product & Branding Expert",
      description: "Create comprehensive product briefs and brand guidelines",
      photo: "sarah-photo",
      accessAssistant: "https://chatgpt.com/g/g-6896b621f6f4819193e00ef02189ef42-sarah-the-intuitive-marketing-angle-expert",
      sourceFile: "https://drive.google.com/drive/folders/1wt4qaX20wlL4EDfKu2xSLoAL1Qg2td14?usp=sharing"
    },
    {
      name: "Chae Ha",
      title: "Copywriting Expert",
      description: "High-conversion copywriting for sales and marketing campaigns",
      photo: "chaeha-photo",
      accessAssistant: "https://chatgpt.com/g/g-6896b91ac184819192b48db211378ec5-chae-ha-the-engaging-hook-specialist",
      sourceFile: "https://drive.google.com/drive/folders/16-e27QF23MG5rO4V0X081Qx1WNvWKrKX?usp=sharing"
    },
    {
      name: "Irfan",
      title: "Creative Director for Video Generation",
      description: "Expert in AI-powered video creation and direction",
      photo: "irfan-photo",
      accessAssistant: "https://chatgpt.com/g/g-68966a15f7b881918f42c38dec8a6b59-irfan-the-veo-3-creative-director",
      sourceFile: "https://drive.google.com/drive/folders/1wOuAalb80YbyPD9P8S2gxBFFG6GP6WGO?usp=sharing"
    },
    {
      name: "Zaki",
      title: "Vibe Coding Expert",
      description: "Coding solutions and development consultancy specialist",
      photo: "zaki-photo",
      accessAssistant: "https://chatgpt.com/g/g-68969d33bab48191b4672b5bf127583b-zaki-the-mini-vibe-coder-consultant",
      sourceFile: "https://drive.google.com/drive/folders/1ePIiV2J6jX53qwWztpqrY4QweJST47Bh?usp=sharing"
    }
  ];

  const openVideoModal = (video) => {
    setSelectedVideoForModal(video);
    setIsModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeVideoModal = () => {
    setIsModalOpen(false);
    setSelectedVideoForModal(null);
    document.body.style.overflow = 'unset';
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const scrollToSection = (sectionClass) => {
    const element = document.querySelector(`.${sectionClass}`);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
        inline: 'nearest'
      });
      setIsMobileMenuOpen(false); // Close menu after navigation
    }
  };

  useEffect(() => {
    const handleEsc = (event) => {
      if (event.keyCode === 27) {
        closeVideoModal();
        setIsMobileMenuOpen(false);
      }
    };

    const handleClickOutside = (event) => {
      // Close mobile menu when clicking outside
      if (isMobileMenuOpen && !event.target.closest(`.${styles.mobileNav}`) && !event.target.closest(`.${styles.hamburgerIcon}`)) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleEsc, false);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('keydown', handleEsc, false);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      <Head>
        <title>KelasGPT - Kandungan Kursus Video</title>
        <meta name="description" content="Akses eksklusif kepada kandungan video lengkap KelasGPT" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
      </Head>

      <div className={styles.siteContainer}>        
        <header className={styles.header}>
          <div className={styles.logo}>
            <Image 
              src="/favicon.ico" 
              alt="KelasGPT Logo" 
              width={32} 
              height={32}
              className={styles.logoIcon}
            />
            <div className={styles.brandInfo}>
              <span className={styles.logoText}>KelasGPT</span>
              <span className={styles.subtitle}>Belajar AI Untuk Bisnes</span>
            </div>
          </div>
          <div className={styles.courseStats}>
            <span className={styles.statItem}>
              <svg className={styles.videoIcon} viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
              18 Videos
            </span>
            <span className={styles.statDivider}>•</span>
            <span className={styles.statItem}>
              <svg className={styles.clockIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              6+ Hours
            </span>
            <span className={styles.statDivider}>•</span>
            <span className={styles.statItem}>
              <svg className={styles.certIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
              Certificate
            </span>
          </div>
          
          {/* Mobile Hamburger Menu */}
          <button 
            className={styles.hamburgerIcon} 
            onClick={toggleMobileMenu}
            aria-label="Toggle navigation menu"
          >
            <div className={`${styles.hamburgerLine} ${isMobileMenuOpen ? styles.hamburgerLineActive : ''}`}></div>
            <div className={`${styles.hamburgerLine} ${isMobileMenuOpen ? styles.hamburgerLineActive : ''}`}></div>
            <div className={`${styles.hamburgerLine} ${isMobileMenuOpen ? styles.hamburgerLineActive : ''}`}></div>
          </button>
        </header>

        {/* Mobile Navigation Menu */}
        <div className={`${styles.mobileNav} ${isMobileMenuOpen ? styles.mobileNavOpen : ''}`}>
          <nav className={styles.mobileNavContent}>
            <button 
              className={styles.mobileNavItem}
              onClick={() => scrollToSection(styles.courseSection)}
            >
              <svg className={styles.mobileNavIcon} viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
              <span>Course Videos</span>
            </button>
            
            <button 
              className={styles.mobileNavItem}
              onClick={() => scrollToSection(styles.assistantsSection)}
            >
              <svg className={styles.mobileNavIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
              </svg>
              <span>AI Assistants</span>
            </button>
            
            <button 
              className={styles.mobileNavItem}
              onClick={() => scrollToSection(styles.toolsSection)}
            >
              <svg className={styles.mobileNavIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
              </svg>
              <span>Tools & Resources</span>
            </button>
            
            <button 
              className={styles.mobileNavItem}
              onClick={() => scrollToSection(styles.supportSection)}
            >
              <svg className={styles.mobileNavIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M12 1v6M12 17v6M4.22 4.22l4.24 4.24M15.54 15.54l4.24 4.24M1 12h6M17 12h6M4.22 19.78l4.24-4.24M15.54 8.46l4.24-4.24"></path>
              </svg>
              <span>Support & Help</span>
            </button>
          </nav>
        </div>

        <main className={styles.mainContent}>
          {/* Left Column - Course Content */}
          <div className={styles.leftContent}>
            <section className={styles.courseSection}>
              <div className={styles.sectionHeader}>
                <h2>AI Masterclass Untuk Business</h2>
                <p>Master AI and LLM through structured video lessons</p>
              </div>
              {courseModules.map((module, moduleIndex) => (
                <div key={moduleIndex} className={styles.module}>
                  <div className={styles.moduleHeader}>
                    {/* <h3 className={styles.moduleTitle}>{module.title}</h3> */}
                    <p className={styles.moduleDescription}>{module.title}</p>
                  </div>
                  <div className={styles.videoGrid}>
                    {module.videos.map((video, videoIndex) => (
                      <div
                        key={videoIndex}
                        className={styles.videoCard}
                        onClick={() => openVideoModal(video)}
                      >
                        <div className={styles.videoThumbnail}>
                          <div className={styles.playOverlay}>
                            <svg className={styles.playIcon} viewBox="0 0 24 24" fill="currentColor">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </div>
                        </div>
                        <div className={styles.videoInfo}>
                          <div className={styles.videoTitle}>{video.title}</div>
                          <div className={styles.videoMeta}>
                            <span className={styles.duration}>{video.duration}</span>
                            <span className={styles.separator}>•</span>
                            <span className={styles.moduleNumber}>Modul {moduleIndex + 1}.{videoIndex + 1}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </section>
          </div>

          {/* Right Sidebar - AI Assistants */}
          <div className={styles.rightSidebar}>
            <section className={styles.assistantsSection}>
              <div className={styles.sidebarHeader}>
                <h2>Your AI Assistants</h2>
                <p>Expert AI assistants for your needs</p>
              </div>
              <div className={styles.assistantsGrid}>
                {aiAssistants.map((assistant, index) => (
                  <div key={index} className={styles.assistantCard}>
                    <div className={styles.assistantPhoto}>
                      <Image 
                        src={assistant.photo}
                        alt={assistant.name}
                        width={40}
                        height={40}
                        loading="lazy"
                        placeholder="blur"
                        blurDataURL={getBlurDataURL(assistant.photo)}
                        sizes={getImageSizes('benefit')}
                        className={styles.assistantAvatar}
                      />
                    </div>
                    <div className={styles.assistantContent}>
                      <div className={styles.assistantInfo}>
                        <h3 className={styles.assistantName}>{assistant.name}</h3>
                        <h4 className={styles.assistantTitle}>{assistant.title}</h4>
                        <p className={styles.assistantDescription}>{assistant.description}</p>
                      </div>
                      <div className={styles.assistantActions}>
                        <a 
                          href={assistant.accessAssistant} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className={styles.compactButton}
                          title="Access Assistant"
                        >
                          <svg className={styles.chatIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                          </svg>
                          Open
                        </a>
                        <a 
                          href={assistant.sourceFile} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className={styles.compactButtonSecondary}
                          title="Source Files"
                        >
                          <svg className={styles.fileIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                             <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline>
                          </svg>
                          Files
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Tools & Resources Section */}
            <section className={styles.toolsSection}>
              <h3>Tools & Resources</h3>
              <p>Useful web tools to enhance your workflow</p>
              <div className={styles.toolsList}>
                <a 
                  href="https://youtubetotranscript.com/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className={styles.toolLink}
                >
                  <svg className={styles.toolIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                  </svg>
                  <div className={styles.toolInfo}>
                    <span className={styles.toolName}>YouTube Transcript</span>
                    <span className={styles.toolDesc}>Convert YouTube videos to text</span>
                  </div>
                </a>
                <a 
                  href="https://markdownlivepreview.com/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className={styles.toolLink}
                >
                  <svg className={styles.toolIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                  <div className={styles.toolInfo}>
                    <span className={styles.toolName}>Markdown Preview</span>
                    <span className={styles.toolDesc}>Live markdown editor and preview</span>
                  </div>
                </a>
                <a 
                  href="https://platform.openai.com/chat/edit?models=gpt-5&optimize=true" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className={styles.toolLink}
                >
                  <svg className={styles.toolIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                  </svg>
                  <div className={styles.toolInfo}>
                    <span className={styles.toolName}>OpenAI Chat Editor</span>
                    <span className={styles.toolDesc}>Advanced AI conversation interface</span>
                  </div>
                </a>
              </div>
            </section>

            {/* Support Section */}
            <section className={styles.supportSection}>
              <h3>Support & Help</h3>
              <div className={styles.contactInfo}>
                <p>📧 Email: support@kelasgpt.com</p>
                <p>💬 WhatsApp: +60 12-345-6789</p>
              </div>
            </section>
          </div>
        </main>
      </div>

      {/* Video Modal */}
      {isModalOpen && selectedVideoForModal && (
        <VideoModal video={selectedVideoForModal} onClose={closeVideoModal} />
      )}
    </>
  );
}


// Video Modal Component
function VideoModal({ video, onClose }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const modalContent = (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3>{video.title}</h3>
          <button className={styles.closeButton} onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div className={styles.videoPlayerModal}>
          <iframe
            src={video.url}
            title={video.title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          ></iframe>
        </div>
        <div className={styles.modalFooter}>
          <p className={styles.videoDescription}>{video.description}</p>
          <div className={styles.videoDuration}>
            <svg className={styles.clockIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            <span>{video.duration}</span>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

