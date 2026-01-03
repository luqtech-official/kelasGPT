import { useState } from 'react';
import Head from 'next/head';
import styles from '../../styles/PromptLib.module.css';

export default function Prompt345345() {
  const [copied, setCopied] = useState(false);

  // Placeholder prompt - minimalist yet complex enough to test the view
  const promptContent = `# Create a practical educational infographic poster

## Overall Style & Format:
Studygram aesthetic with a clean white background layout. The design should mimic authentic handwritten, creative study notes on lined A4 paper, combining educational illustration with practical revision techniques. Aspect ratio: 3:4 (portrait).
Subject Matter: ["How Cell's Nucleus Works"]
Language: [English]

## Character Illustrations:
Include pixar-style educational characters (teacher and student figures) positioned strategically throughout the layout. Add topic-appropriate icons and symbols that visually represent key concepts.

## Typography & Handwriting:
Use a natural student handwriting font on realistic lined paper texture. The writing should feel authentic and approachable, mimicking genuine study notes.

## Two-Tier Highlighting System:
Highlight Color 1 - Core Concepts/Main Ideas/Important Keywords:
Color: Bright pastel yellow
Visual weight: Primary, Should grab attention first without overpowering the text

Highlight Color 2 - Examples/Tips/Notes:
Color: Pastel Blue
Visual weight: Secondary, emphasis—helpful but not the primary focus

## Additional Annotations:
Draw red circles or boxes around important dates, deadlines, or critical numbers
Add arrows, underlines, and connector lines to show relationships between concepts

## Visual Learning Elements:
Include small hand-drawn doodles, diagrams, and sketches that explain concepts visually
Add flowcharts, mind maps, or step-by-step illustrations ONLY if necessary and appropriate
Use simple icons and symbols to break down complex information
It should be a quick study notes that serve as refresher (important and critical points only), NOT a full blown information text heavy notes.

## Layout & Composition:
Maintain clean white background with organized sections
Balance handwritten text with visual elements
Create clear visual hierarchy using the three-highlight system
For any image within the notes, use vibrant colors
Leave appropriate white space for readability
No borders outside the authentic paper background

## Overall Aesthetic:
The final design should feel like an authentic color-coded studygram notes that's both visually appealing for social media (studygram) and functionally useful for actual revision and learning.
High Definition Image Quality

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
          <h1 className={styles.title}>System Architect Prompt</h1>
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
