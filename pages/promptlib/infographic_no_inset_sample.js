import { useState } from 'react';
import Head from 'next/head';
import styles from '../../styles/PromptLib.module.css';

export default function Prompt345345() {
  const [copied, setCopied] = useState(false);

  // Placeholder prompt - minimalist yet complex enough to test the view
  const promptContent = `[PRIMARY SUBJECT & IDENTITY]
A highly detailed scientific infographic illustration of <NEW SUBJECT>, presented as the central focal figure. The subject is shown in a semi-dynamic, natural pose appropriate to its environment, occupying the majority of the vertical canvas. The subject’s anatomy is partially revealed using transparent cutaway visualization, showing internal skeletal structure and major organ systems while preserving realistic external textures.

---
[POSE, FRAMING & COMPOSITION]
Vertical poster layout, portrait orientation. The subject is centered slightly right of frame, interacting with a natural element such as a branch, rock, tool, or environmental structure. One limb is engaged with the environment to imply function and behavior. Camera angle is eye-level or slightly low, creating a documentary yet authoritative feel. The body fills roughly 70–75% of the canvas, leaving margins for text annotations.

---
[ANATOMICAL VISUALIZATION STYLE]
Semi-transparent anatomical cutaway revealing bones, rib cage, spine, and internal organs. Bones rendered in off-white with subtle shading, organs rendered in muted biological tones (soft pinks, reds, beige). Cutaway edges are clean and illustrative rather than gory. Internal structures are anatomically organized, clearly readable, and layered beneath realistic external surfaces such as fur, skin, feathers, or armor depending on the subject.

---
[INFOGRAPHIC ANNOTATIONS & CALLOUTS]
Multiple labeled callouts placed around the subject with thin, clean leader lines pointing to specific anatomical or functional features. Callout points are marked with small circular dots in yellow or gold. Text blocks are concise, educational, and grouped logically. Include sections such as:
- Anatomical specialization
- Morphological uniqueness
- Sound or communication structures (if applicable)
- Digestive or internal systems
- Functional limbs or movement adaptations

---
[TYPOGRAPHY & LANGUAGE HIERARCHY]
Large bold uppercase title at the top, scientific naming style. Subtitle directly below in smaller, clean sans-serif font describing classification and uniqueness. Annotation text uses modern sans-serif, medium weight, black or dark gray. Section headers are bolded. Body text is short, factual, and infographic-style. Language appears educational and museum-grade.

---
[COLOR PALETTE & LIGHTING]
Neutral light background, off-white or pale beige. Subject colors are naturalistic and saturated but controlled. Accent color for annotations and highlights is yellow/gold. Lighting is soft, even, studio-style with subtle shadows for depth. No dramatic contrast or cinematic lighting.

---
[RENDERING & DETAIL LEVEL]
Ultra-high detail digital illustration, realistic textures, fine hair or surface detail visible. Anatomical accuracy prioritized. Style blends scientific textbook illustration with modern digital painting. Clean edges, sharp focus, no motion blur, no painterly abstraction.

---
[ADDITIONAL INFOGRAPHIC ELEMENTS]
Bottom section contains small informational panels or icons:
- Diet or input sources illustrated with small icons
- Habitat or distribution map simplified and minimal
- Behavioral or lifecycle facts presented with pictograms
All secondary elements are neatly aligned and do not overpower the main subject.

---
[OVERALL STYLE & INTENT]
Educational natural science infographic suitable for a museum exhibit, biology textbook, or high-end documentary poster. Clean, authoritative, visually engaging, and precise. No cartoon style, no fantasy exaggeration, no decorative clutter.

---
[NEGATIVE PROMPT]
No photorealistic photography, no cinematic color grading, no sketch lines, no comic style, no exaggerated proportions, no chaotic layout, no handwritten text, no watermark, no logo, no background scenery competing with the subject.
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
          <h1 className={styles.title}>Infographic Sample</h1>
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
