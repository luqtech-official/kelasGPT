import { useState } from 'react';
import Head from 'next/head';
import styles from '../../styles/PromptLib.module.css';

export default function Prompt345345() {
  const [copied, setCopied] = useState(false);

  // Placeholder prompt - minimalist yet complex enough to test the view
  const promptContent = `You are an expert system architect and code strategist.
  
Your task is to analyze the following codebase structure and suggest a refactoring plan that improves modularity without breaking existing dependencies.

Please focus on:
1. Identifying circular dependencies.
2. Suggesting a cleaner separation of concerns for the API layer.
3. Proposing a modern error handling strategy.

Output your response in Markdown format, prioritizing actionable steps.`;

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
