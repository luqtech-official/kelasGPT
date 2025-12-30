import { useState } from 'react';
import Head from 'next/head';
import styles from '../../styles/PromptLib.module.css';

export default function Prompt345345() {
  const [copied, setCopied] = useState(false);

  // Placeholder prompt - minimalist yet complex enough to test the view
  const promptContent = `# Core Transformation Objective
Transform the provided reference image into a refined portrait photograph. Preserve the subject’s identity and facial structure while elevating the overall visual quality into a professional studio-style portrait.

---
## Composition & Framing
Portrait orientation, chest-up or head-and-shoulders framing. The subject is centered or slightly off-center using a classic studio composition. Clean background with gentle depth separation to draw full attention to the subject.

---
## Lighting & Mood
Soft studio lighting with a cinematic touch. Use a key light to sculpt the face and enhance confidence, complemented by subtle fill light to maintain smooth skin tones. Add a gentle rim or hair light for separation from the background. Overall mood should feel confident, intimate, and subtly romantic, with warm highlights and soft shadows.

---
## Facial Expression & Pose
The subject appears calm, self-assured, and emotionally present. Expression should convey quiet confidence with a hint of romantic warmth. Relaxed posture, natural head tilt, and soft eye contact with the camera.

---
## Color Palette & Atmosphere
Warm and muted color tones, with soft highlights and smooth gradients. Romantic ambience achieved through gentle contrast, creamy skin tones, and slightly desaturated backgrounds. Avoid harsh or overly vibrant colors.

---
## Texture & Detail
High-detail skin texture with natural retouching. Smooth but realistic complexion, sharp eyes, and softly defined facial features. Avoid over-sharpening or artificial beauty effects.

---
## Photographic Style
Professional studio portrait photography. Shallow depth of field, high-resolution clarity, realistic lens behavior. Inspired by editorial and fine-art portrait photography rather than casual or social media styles.

---
## Quality & Realism Constraints
Photorealistic output, natural proportions, accurate anatomy. No distortion, no exaggerated features, no cartoon or illustration style. Maintain a polished yet authentic photographic look.
`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(promptContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Prompt Library</title>
        <meta name="description" content="A curated prompt AI image Generation." />
      </Head>

      <div className={styles.card}>
        <header className={styles.header}>
          <h1 className={styles.title}>Refined Portrait Photograph Sample</h1>
        </header>

        <main className={styles.content}>
          <div className={styles.actionBar}>
            <button 
              onClick={handleCopy} 
              className={`${styles.copyButton} ${copied ? styles.copied : ''}`}
              aria-label="Copy prompt to clipboard"
            >
              {copied ? (
                <>
                  <CheckIcon />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <CopyIcon />
                  <span>Copy Prompt</span>
                </>
              )}
            </button>
          </div>

          <div className={styles.promptContainer}>
            <pre className={styles.promptText}>
              {promptContent}
            </pre>
          </div>
        </main>
      </div>
    </div>
  );
}

// Simple SVG Icons components for this file
function CopyIcon() {
  return (
    <svg className={styles.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className={styles.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}
