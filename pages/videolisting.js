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
      title: "Pengenalan Asas GPT-4",
      description: "Memahami asas-asas GPT-4 dan cara ia berfungsi dalam kehidupan harian",
      videos: [
        {
          title: "Apa itu GPT-4 dan Mengapa Ia Penting",
          description: "Pelajari tentang teknologi AI terkini dan bagaimana ia boleh mengubah cara anda bekerja",
          duration: "12 minit",
          url: "https://www.youtube.com/embed/1jn_RpbPbEc?si=YFJtwcqrzIVJdzFQ"
        },
        {
          title: "Persediaan Pertama: Menyediakan Persekitaran GPT",
          description: "Panduan langkah demi langkah untuk memulakan penggunaan GPT-4 dengan betul",
          duration: "15 minit",
          url: "https://youtube.com"
        },
        {
          title: "Navigasi Antara Muka dan Ciri-ciri Asas",
          description: "Mengenali semua fungsi penting dan cara menggunakannya dengan efektif",
          duration: "18 minit",
          url: "https://youtube.com"
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
          url: "https://youtube.com"
        },
        {
          title: "Teknik Prompt Lanjutan untuk Hasil Spesifik",
          description: "Strategi mendalam untuk mendapatkan output yang tepat mengikut keperluan anda",
          duration: "25 minit",
          url: "https://youtube.com"
        },
        {
          title: "Prompt Templates untuk Pelbagai Kegunaan",
          description: "Template siap pakai untuk penulisan, analisis, pemecahan masalah dan banyak lagi",
          duration: "22 minit",
          url: "https://youtube.com"
        }
      ]
    },
    {
      title: "Aplikasi Praktis dalam Perniagaan",
      description: "Melaksanakan GPT-4 dalam operasi harian perniagaan untuk meningkatkan produktiviti",
      videos: [
        {
          title: "Automasi Penulisan Email dan Komunikasi",
          description: "Cara menggunakan GPT-4 untuk menulis email profesional dan komunikasi yang berkesan",
          duration: "16 minit",
          url: "https://youtube.com"
        },
        {
          title: "Analisis Data dan Laporan dengan GPT-4",
          description: "Menggunakan AI untuk menganalisis data dan menghasilkan laporan yang bermakna",
          duration: "28 minit",
          url: "https://youtube.com"
        },
        {
          title: "Strategi Pemasaran dan Kandungan Kreatif",
          description: "Menghasilkan idea kreatif dan strategi pemasaran yang menarik dengan bantuan AI",
          duration: "24 minit",
          url: "https://youtube.com"
        }
      ]
    },
    {
      title: "Workflow dan Integrasi",
      description: "Mengintegrasikan GPT-4 ke dalam alir kerja sedia ada dengan berkesan",
      videos: [
        {
          title: "Menyepadukan GPT-4 dengan Tool Sedia Ada",
          description: "Panduan praktikal untuk menggabungkan GPT-4 dengan perisian dan platform yang anda gunakan",
          duration: "19 minit",
          url: "https://youtube.com"
        },
        {
          title: "Mencipta Workflow Automatik",
          description: "Membina sistem automatik yang menggunakan GPT-4 untuk tugas-tugas berulang",
          duration: "26 minit",
          url: "https://youtube.com"
        },
        {
          title: "Pengurusan Masa dan Produktiviti dengan AI",
          description: "Strategi menggunakan AI untuk meningkatkan pengurusan masa dan produktiviti harian",
          duration: "21 minit",
          url: "https://youtube.com"
        }
      ]
    },
    {
      title: "Teknik Lanjutan dan Trend Terkini",
      description: "Menguasai teknik-teknik canggih dan mengikuti perkembangan terbaru dalam AI",
      videos: [
        {
          title: "Multi-modal AI dan Penggunaan Gambar",
          description: "Menggunakan GPT-4 untuk menganalisis dan menghasilkan kandungan berdasarkan gambar",
          duration: "23 minit",
          url: "https://youtube.com"
        },
        {
          title: "API Integration dan Pengaturcaraan Asas",
          description: "Cara menggunakan API GPT-4 untuk aplikasi yang lebih kompleks dan tersuai",
          duration: "30 minit",
          url: "https://youtube.com"
        },
        {
          title: "Etika AI dan Penggunaan Bertanggungjawab",
          description: "Memahami limitasi AI dan cara menggunakannya secara etika dan bertanggungjawab",
          duration: "17 minit",
          url: "https://youtube.com"
        }
      ]
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
              Setiap video direka untuk memberikan anda pemahaman mendalam tentang penggunaan GPT-4 dalam kehidupan 
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
                    src={selectedVideo.url.replace('youtube.com', 'youtube.com/embed')}
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