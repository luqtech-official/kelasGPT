import Head from 'next/head';
import { useState, useEffect } from 'react';
import styles from '../styles/VideoListing2.module.css';

export default function VideoListing() {
  const [selectedVideo, setSelectedVideo] = useState(null);

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

  useEffect(() => {
    if (courseModules.length > 0 && courseModules[0].videos.length > 0) {
      setSelectedVideo(courseModules[0].videos[0]);
    }
  }, []);

  return (
    <>
      <Head>
        <title>KelasGPT - Kandungan Kursus Video</title>
        <meta name="description" content="Akses eksklusif kepada kandungan video lengkap KelasGPT" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;700&display=swap" rel="stylesheet" />
      </Head>

      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>KelasGPT</h1>
          <p className={styles.subtitle}>AI-Powered Learning Hub</p>
        </header>

        <div className={styles.mainLayout}>
          {/* Left Column */}
          <div className={styles.leftColumn}>
            <section className={styles.currentlyWatching}>
              <h2>Currently Watching</h2>
              {selectedVideo ? (
                <div className={styles.videoPlayer}>
                  <iframe
                    src={selectedVideo.url}
                    title={selectedVideo.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  ></iframe>
                </div>
              ) : (
                <p>Select a video to start watching.</p>
              )}
            </section>

            <section className={styles.courseContent}>
              <h2>Course Content</h2>
              {courseModules.map((module, moduleIndex) => (
                <div key={moduleIndex} className={styles.module}>
                  <div className={styles.moduleHeader}>
                    <h3 className={styles.moduleTitle}>{module.title}</h3>
                    <p className={styles.moduleDescription}>{module.description}</p>
                  </div>
                  <div className={styles.videoList}>
                    {module.videos.map((video, videoIndex) => (
                      <div
                        key={videoIndex}
                        className={`${styles.videoCard} ${selectedVideo && selectedVideo.url === video.url ? styles.selected : ''}`}
                        onClick={() => setSelectedVideo(video)}
                      >
                        <div className={styles.videoInfo}>
                          <h4>{video.title}</h4>
                          <div className={styles.videoMeta}>
                            <span>{video.duration}</span>
                            <span>•</span>
                            <span>Modul {moduleIndex + 1}.{videoIndex + 1}</span>
                          </div>
                        </div>
                        <button className={styles.watchButton}>
                          <svg className={styles.playIcon} viewBox="0 0 24 24" fill="currentColor">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </section>
          </div>

          {/* Right Column */}
          <div className={styles.rightColumn}>
            <section className={styles.expertSection}>
              <h2>AI Experts</h2>
              <div className={styles.expertGrid}>
                {aiExperts.map((expert, index) => (
                  <div key={index} className={styles.expertCard}>
                    <div className={styles.expertInfo}>
                      <h3>{expert.name}</h3>
                      <h4>{expert.title}</h4>
                      <p>{expert.description}</p>
                    </div>
                    <div className={styles.expertActions}>
                      <a href={expert.accessExpert} target="_blank" rel="noopener noreferrer" className={styles.expertButton}>
                        <svg className={styles.chatIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                        </svg>
                        Access Expert
                      </a>
                      <a href={expert.sourceFile} target="_blank" rel="noopener noreferrer" className={styles.sourceButton}>
                        <svg className={styles.fileIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                           <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline>
                        </svg>
                        Source Files
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className={styles.supportSection}>
              <h3>Support & Help</h3>
              <div className={styles.contactInfo}>
                <p>📧 Email: support@kelasgpt.com</p>
                <p>💬 WhatsApp: +60 12-345-6789</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
