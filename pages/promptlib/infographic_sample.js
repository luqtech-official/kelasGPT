import { useState } from 'react';
import Head from 'next/head';
import styles from '../../styles/PromptLib.module.css';

export default function Prompt345345() {
  const [copied, setCopied] = useState(false);

  // Placeholder prompt - minimalist yet complex enough to test the view
  const promptContent = `**PROMPT TYPE:** Scientific Infographic Illustration
**SUBJECT:** \`[COMMON NAME] ([SCIENTIFIC NAME])\`
---

### 1. Main Subject Description

A highly detailed scientific illustration of **[ANIMAL SPECIES]**, presented in a semi-realistic anatomical cutaway style. The animal is shown in a natural, species-appropriate pose that highlights its defining physical traits and typical behavior, illustrated on a PURE WHITE, #FFFFFF for the background

The subject’s body orientation is **[POSE ORIENTATION]** (for example: side view, three-quarter view, perched, standing, swimming). Facial expression and posture are neutral and calm, suitable for an educational and scientific context.

External features such as fur, feathers, scales, skin texture, coloration, and distinctive markings are rendered accurately according to real-world biology.
---

### 2. Anatomical Cutaway & Internal Details

The illustration includes transparent overlays and clean cutaway sections revealing internal anatomy:

* Skeletal structure relevant to the species (skull, spine, ribs, limb bones, joints).
* Major internal organs appropriate to the species (digestive system, respiratory organs, circulatory features).
* One or more magnified inset diagrams highlighting key internal systems (e.g. digestion, respiration, vocalization, venom glands, swim bladder).
* Anatomical adaptations that support the animal’s lifestyle (e.g. flight, climbing, swimming, burrowing).

All anatomy is scientifically accurate, proportionally correct, and integrated smoothly beneath the outer body layer.
---

### 3. Educational Labels & Callouts

Clear infographic callouts using thin lines and circular markers pointing to anatomical features. Text is written in **[LANGUAGE]**, using a clean, readable sans-serif font.

Label categories may include:

* Locomotion or movement anatomy
* Unique morphological traits
* Specialized organs or adaptations
* Feeding or digestive system
* Sensory or communication structures
* Key biological facts

Text blocks are neatly arranged around the subject for maximum readability without obstructing the main figure.
---

### 4. Composition & Layout

* Format: **[VERTICAL / HORIZONTAL] poster layout**
* Centralized main subject occupying most of the canvas
* Educational panels distributed evenly on left and right sides
* Optional inset diagrams or magnifications
* Bottom section reserved for icons or fact summaries

Top title:
**\`[SCIENTIFIC NAME]\`** (large, bold)
Subtitle:
\`[Brief descriptive subtitle about the species]\`
---

### 5. Color Palette & Lighting

* Naturalistic, species-accurate coloration
* Internal organs shown in realistic anatomical colors
* **Use PURE WHITE, #FFFFFF for the background**
* Soft, even lighting designed for clarity and depth

Accent colors used sparingly for:

* Titles
* Highlighted anatomical sections
* Callout markers and outlines
---

### 6. Style & Rendering Quality

* Ultra-high resolution
* Scientific and educational illustration style
* Clean, precise line work combined with realistic shading
* **Use PURE WHITE, #FFFFFF for the background**
* Professional, museum-quality presentation

The visual style should resemble natural history textbooks, museum displays, or conservation infographics.
---

### 7. Background & Environment

* Minimal or neutral background
* Optional simple habitat element (branch, ground, water, rock) if relevant
* No distracting scenery or clutter
* Strong use of negative space for readability
* **Use PURE WHITE, #FFFFFF for the background**
---

### 8. Mood & Purpose

Educational, authoritative, and informative. Designed for learning, conservation awareness, and scientific communication.
---

### 9. Negative Prompt

Avoid:

* Cartoon or anime styles
* Stylized or fantasy anatomy
* Incorrect proportions or organs
* Dramatic lighting or heavy shadows
* Decorative or playful typography
* Visual clutter or unreadable labels
---

### 10. Final Quality Keywords

Scientific accuracy, educational infographic, anatomical illustration, wildlife biology, museum-grade, professional layout, high clarity, clean typography

---
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
        <meta name="description" content="A Curated Prompt AI Image Generation." />
      </Head>

      <div className={styles.card}>
        <header className={styles.header}>
          <h1 className={styles.title}>Scientific Infographic Prompt Sample</h1>
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
