import { useState } from 'react';
import Head from 'next/head';
import styles from '../../styles/PromptLib.module.css';

export default function Prompt345345() {
  const [copied, setCopied] = useState(false);

  // Placeholder prompt - minimalist yet complex enough to test the view
  const promptContent = `Create an educational infographic poster for elementary school children with the theme "Basic Human Anatomy"
 
The main character should be a cute 3D papercraft-style Malay boy positioned at the center of the poster. He should have a bright smile and a welcoming, friendly pose. The character should look like a premium handmade paper doll.
 
At the top of the poster, place a large headline in a playful, child-friendly font reading: "TUBUH BADAN KITA."

The layout should feature the main character at the center. Around this character, include multiple floating paper-cut bubble charts that explain different anatomy parts.

Each anatomy part should be connected to the character using crayon-drawn arrows and hand-drawn dotted lines. Text blocks must be clearly readable and placed on both the left and right sides of the  central figure, maintaining a balanced, center-focused composition.

Then depict simplified anatomy parts using playful paper shapes:
* The brain should appear as a pink, cloud-shaped paper cutout labeled "Otak."
* The heart should be a red paper heart labeled "Jantung."
* The lungs should look like bluish, lung-like paper forms labeled "Paru-Paru."
* The stomach should be a cute, bean-shaped paper form labeled "Perut."

All labels should use a rounded sans-serif font that is clear and easy to read. The text should only include:
* OTAK: Untuk Berfikir
* JANTUNG: Untuk Pam Darah
* PARU PARU: Untuk Bernafas
* PERUT: Untuk Cerna Makanan

Use washi tape to secure labels.
Add colorful sewn-on buttons as decorative details.
All connections between elements should be drawn with hand-drawn dotted lines and crayon-style arrows.

The poster should use a vertical portrait aspect ratio of 9:16.
Render the image in good quality at 2K resolution.
Apply an Octane-rendered style finish look with realistic paper textures.
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
          <h1 className={styles.title}>Child Anatomy Poster Sample</h1>
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
