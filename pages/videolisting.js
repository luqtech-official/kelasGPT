import Head from 'next/head';
import { useState, useEffect } from 'react';
import styles from '../styles/VideoListing.module.css';

export default function VideoListing() {
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = (video) => {
    setSelectedVideo(video);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedVideo(null);
  };

  // Handle keyboard events for modal
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && isModalOpen) {
        closeModal();
      }
    };

    if (isModalOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen]);
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

  const aiExperts = [
    {
      name: "Irfan",
      title: "The VEO 3 Creative Director",
      description: "Expert in video creation and creative direction using advanced AI tools",
      accessExpert: "https://chatgpt.com/g/g-68966a15f7b881918f42c38dec8a6b59-irfan-the-veo-3-creative-director",
      sourceFile: "https://drive.google.com/drive/folders/1wOuAalb80YbyPD9P8S2gxBFFG6GP6WGO?usp=sharing"
    },
    {
      name: "Zaki",
      title: "The Mini vibe Coder Consultant",
      description: "Specialized in coding solutions and development consultancy with AI assistance",
      accessExpert: "https://chatgpt.com/g/g-68969d33bab48191b4672b5bf127583b-zaki-the-mini-vibe-coder-consultant",
      sourceFile: "https://drive.google.com/drive/folders/1ePIiV2J6jX53qwWztpqrY4QweJST47Bh?usp=sharing"
    },
    {
      name: "Sarah",
      title: "The Intuitive Marketing Angle Expert",
      description: "Intuitive marketing strategies and angle discovery for effective campaigns",
      accessExpert: "https://chatgpt.com/g/g-6896b621f6f4819193e00ef02189ef42-sarah-the-intuitive-marketing-angle-expert",
      sourceFile: "https://drive.google.com/drive/folders/1wt4qaX20wlL4EDfKu2xSLoAL1Qg2td14?usp=sharing"
    },
    {
      name: "Balqis",
      title: "The Friendly Productivity Coach",
      description: "Personal productivity coaching and workflow optimization strategies",
      accessExpert: "https://chatgpt.com/g/g-68965d41ae6c81918f2a7102ca495a79-balqis-the-friendly-productivity-coach",
      sourceFile: "https://drive.google.com/drive/folders/19bzmLXPqpVfV5viC-WvQdgDgAEzZf2nZ?usp=sharing"
    },
    {
      name: "Chaeha",
      title: "The Engaging Hook Specialist",
      description: "Creating compelling hooks and attention-grabbing content strategies",
      accessExpert: "https://chatgpt.com/g/g-6896b91ac184819192b48db211378ec5-chae-ha-the-engaging-hook-specialist",
      sourceFile: "https://drive.google.com/drive/folders/16-e27QF23MG5rO4V0X081Qx1WNvWKrKX?usp=sharing"
    },
    {
      name: "Ikram",
      title: "The Sophisticated Data Storyteller",
      description: "Transform data into compelling narratives and actionable insights",
      accessExpert: "https://chatgpt.com/g/g-6896bb7cab8c81918c28a7d3358619b7-ikram-the-sophisticated-data-storyteller",
      sourceFile: "https://drive.google.com/drive/folders/1wLOL2VMEtx5r3SXnJQp7JwtFJZFcctAk?usp=sharing"
    }
  ];

  return (
    <>
      <Head>
        <title>KelasGPT - Kandungan Kursus Video</title>
        <meta name="description" content="Akses eksklusif kepada kandungan video lengkap KelasGPT" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>KelasGPT</h1>
          <p className={styles.subtitle}>Kandungan Kursus Video Lengkap</p>
          <div className={styles.divider}></div>
        </header>

        <main className={styles.main}>
          <div className={styles.intro}>
            <h2>Selamat Datang ke Kursus KelasGPT</h2>
            <p>
              Terima kasih kerana menyertai KelasGPT. Di bawah adalah kandungan lengkap kursus yang telah anda beli. 
              Setiap video direka untuk memberikan anda pemahaman mendalam tentang penggunaan AI dan LLM dalam kehidupan 
              dan perniagaan harian. Klik pada mana-mana video untuk menontonnya.
            </p>
          </div>

          <div className={styles.courseContent}>
            {courseModules.map((module, moduleIndex) => (
              <section key={moduleIndex} className={styles.module}>
                <div className={styles.moduleHeader}>
                  <h3 className={styles.moduleTitle}>{module.title}</h3>
                  <p className={styles.moduleDescription}>{module.description}</p>
                </div>

                <div className={styles.videoGrid}>
                  {module.videos.map((video, videoIndex) => (
                    <div key={videoIndex} className={styles.videoCard}>
                      <div className={styles.videoInfo}>
                        <h4 className={styles.videoTitle}>{video.title}</h4>
                        <p className={styles.videoDescription}>{video.description}</p>
                        <div className={styles.videoMeta}>
                          <span className={styles.duration}>{video.duration}</span>
                          <span className={styles.separator}>•</span>
                          <span className={styles.moduleNumber}>
                            Modul {moduleIndex + 1}.{videoIndex + 1}
                          </span>
                        </div>
                      </div>
                      <div className={styles.videoActions}>
                        <button 
                          onClick={() => openModal(video)}
                          className={styles.watchButton}
                        >
                          <svg className={styles.playIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <polygon points="5,3 19,12 5,21" fill="currentColor" />
                          </svg>
                          Tonton Video
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <div className={styles.footer}>
            <div className={styles.footerContent}>
              <h3>Sokongan & Bantuan</h3>
              <p>
                Jika anda menghadapi sebarang masalah dengan video atau mempunyai soalan tentang kursus, 
                sila hubungi kami untuk mendapatkan sokongan.
              </p>
              <div className={styles.contactInfo}>
                <p>📧 Email: support@kelasgpt.com</p>
                <p>💬 WhatsApp: +60 12-345-6789</p>
              </div>
            </div>
          </div>
        </main>

        {/* Video Modal */}
        {isModalOpen && selectedVideo && (
          <div className={styles.modalOverlay} onClick={closeModal}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h3 className={styles.modalTitle}>{selectedVideo.title}</h3>
                <button 
                  className={styles.closeButton}
                  onClick={closeModal}
                  aria-label="Close modal"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
              <div className={styles.modalBody}>
                <div className={styles.videoContainer}>
                  <iframe
                    src={selectedVideo.url.includes('youtube.com/embed') ? 
                      `${selectedVideo.url}&enablejsapi=1&origin=${typeof window !== 'undefined' ? window.location.origin : ''}` : 
                      selectedVideo.url
                    }
                    title={selectedVideo.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerpolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                    className={styles.videoIframe}
                  ></iframe>
                </div>
                <div className={styles.videoDetails}>
                  <p className={styles.modalDescription}>{selectedVideo.description}</p>
                  <div className={styles.modalMeta}>
                    <span className={styles.modalDuration}>Durasi: {selectedVideo.duration}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}