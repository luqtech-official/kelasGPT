import { useState } from 'react';
import Head from 'next/head';
import styles from '../../styles/PromptLib.module.css';

export default function Prompt345345() {
  const [copied, setCopied] = useState(false);

  // Placeholder prompt - minimalist yet complex enough to test the view
  const promptContent = `
Based on the product images I provide, first outline the product's selling points and key parameters, then output a unified flagship store minimalist KV system (9:16). Finally, generate 10 complete prompt words for detail pages (bilingual in English and Malay, clean and atmospheric, with at least 5 detail close-ups). First, generate the Logo separately for use in the upper left corner of each subsequent poster, where the text layout style needs to be consistent, such as glass effect, 3D embossed effect, or other effects. Prompt reference as follows:
00. LOGO Generation
Prompt (English): Minimalist high-end fashion brand logo, vector style, clean geometric shapes. Brand name: ["SERI ANGGUN"]. Icon: Thin-line circular badge containing a single delicate leaf branch (negative space, modern, elegant). Color scheme: Deep moss gray-green (#2F3A33) paired with warm cream-white background (#F3EFE6) or transparent background. Font: High-end serif "SERI ANGGUN", with loose letter spacing. No gradients, no shadows, no 3D, no mockups, no watermarks.
01. Poster 01 | [Product · Silk Slip Dress] Main KV (Hero)
Prompt (English): 9:16 vertical high-end minimalist fashion poster. Soft studio daylight, warm cream-white gradient background (creamy/oatmeal tones), ultra-clean. Refined Asian female model (25-30 years old), delicate features, natural bare makeup, long hair lazily casual, relaxed elegant pose, full-body shot, one hand gently stroking the hem.
Clothing must match the uploaded product reference image: Champagne/cream-colored satin short slip dress, thin straps, V-neck, hem length to mid-thigh, silky glossy fabric, maintain exact clothing design consistency with the reference image.
Layout: Place SERI ANGGUN logo (small size) in upper left corner. Centered large serif title at top (2 lines): "SILK SLIP DRESS" / "Gaun Sutera Premium" (stacked bilingual, clean). Mid-left glass-mimetic info card (3 key points, bilingual): Silk-like touch / Sentuhan lembut seperti sutera; Flattering fit / Potongan sempurna dan selesa; Elegant at home / Keanggunan untuk di rumah. Bottom right [rounded pill CTA]: "SHOP NOW → / Beli Sekarang →".
Negative prompts: cluttered, busy, multiple patterns, gradients, shadows, watermark, logo repeated, messy text, low quality, blurry, plain face, unattractive
02. Poster 02 | Product Scene Display
Prompt (English): 9:16 vertical, cinematic texture clean fashion photography. Background: Soft morning light through white sheer curtains in a bedroom, off-white bedding, minimalist Nordic style, warm atmosphere. Refined Asian female model in full side-standing pose, long hair over shoulders, looking back with a smile, one hand lifting hair strands. Use uploaded product reference image to maintain exact shape, length, and fabric sheen of the champagne-colored short slip dress.
Text: Small SERI ANGGUN logo in upper left. Small elegant font upper left: "Morning Whisper / Suasana Pagi". Large title bottom left: "Lazily Just Right". Subtitle below title (bilingual): "Silky touch, beautiful day begins / Sentuhan sutera yang memulakan hari indah anda". Bottom right CTA pill: "LEARN MORE → / Ketahui Lebih Lanjut →".
Negative prompts: cluttered, busy, dark, messy room, shadows, watermark, messy text, low quality, blurry, plain face
03. Poster 03 | Multi-Scene Collage
Prompt (English): 9:16 vertical minimalist collage poster, rounded photo blocks with ample negative space. Background: Warm creamy color, clean. Create 4 rounded frames showing the same refined Asian female model wearing the identical champagne-colored short slip dress from the uploaded reference image, in different home scenes: Morning bedroom by window, lazy sofa pose in living room, in front of bathroom mirror, coffee on balcony rattan chair. Maintain complete consistency in clothing and model across all frames.
Upper left SERI ANGGUN logo. Bottom large serif title: "One Dress, Multiple Scenes". Bottom subtitle (bilingual): "Home, date, vacation ready / Sesuai untuk di rumah, acara istimewa dan percutian". Near bottom right, add small 3-point list: Versatile style / Gaya serba guna; Instant chic / Tampil bergaya serta-merta; Cozy yet alluring / Selesa namun menawan.
Negative prompts: cluttered, busy, multiple patterns, shadows, watermark, messy text, low quality, blurry, plain face.
04. Poster 04 | Detail 01 · Fabric Sheen
Prompt (English): 9:16 vertical high-end macro detail poster. Background: Creamy gradient, ample clean negative space. Extreme close-up shot of satin fabric sheen texture from uploaded reference image, showcasing silky reflective effect and soft drape, fabric flowing naturally along body curves. Upper left SERI ANGGUN logo.
Right side large title (bilingual): "Silk-like Sheen / Kilauan Sutera Tulen". Small copy (bilingual, 2 lines): "Delicate touch, like second skin / Sentuhan halus bagai lapisan kulit kedua." "Natural luster, premium feel / Kilauan semula jadi dengan kualiti premium.". Bottom right CTA pill: "LEARN MORE → / Ketahui Lebih Lanjut →".
Negative prompts: cluttered, busy, multiple patterns, shadows, watermark, messy text, low quality, blurry
05. Poster 05 | Detail 02 · Thin Straps & Collarbone
Prompt (English): 9:16 vertical minimalist detail poster. Background: Warm off-white, ultra-clean. Close-up shot of refined Asian female model's collarbone, shoulder-neck lines, and thin straps from uploaded reference (refined and elegant), soft side lighting outlining contours, premium texture. Add a small rounded inset image showing full outfit silhouette (very small, low opacity).
Upper left SERI ANGGUN logo. Centered large serif title: "Thin Strap Design". 3 micro key points (bilingual): Flatters shoulders / Menonjolkan garis bahu yang cantik; Delicate refined / Rekaan halus dan anggun; Sexy yet elegant / Seksi namun penuh keanggunan. CTA pill: "SHOP NOW → / Beli Sekarang →".
Negative prompts: cluttered, busy, multiple patterns, shadows, watermark, messy text, low quality, blurry, plain face
06. Poster 06 | Detail 03 · V-Neckline Cut
Prompt (English): 9:16 vertical fashion detail poster, clean studio lighting. Background: Faint oatmeal to creamy gradient, no textures. Close-up shot of V-neckline cut details (from uploaded reference), showcasing smooth neckline lines and perfectly balanced depth, sexy yet elegant. Upper left SERI ANGGUN logo.
Left side large title: "V-Neck Cut". Subtitle (bilingual): "Face-flattering, neck-elongating / Menonjolkan bentuk wajah dan memanjangkan garis leher.". Add small tag line: "DETAIL 03" (small size). CTA pill: "LEARN MORE → / Ketahui Lebih Lanjut →".
Negative prompts: cluttered, busy, multiple patterns, shadows, watermark, messy text, low quality, blurry.
07. Poster 07 | Detail 04 · Hemline Drape
Prompt (English): 9:16 vertical high-end detail poster. Background: Very light champagne gold haze, low contrast. Shot of refined Asian female model's side lower body, showcasing the short skirt hem's natural drape to mid-thigh curves (from uploaded reference), fabric flowing with body movement, flattering leg lines.
Upper left SERI ANGGUN logo. Right side title (bilingual): "Short Length Accentuates Legs / Panjang Sempurna Menonjolkan Bentuk Kaki". Small copy (bilingual): "Perfect length, flattering proportion / Panjang yang sesuai untuk perkadaran badan yang sempurna.".
Negative prompts: cluttered, busy, multiple patterns, shadows, watermark, messy text, low quality, blurry, plain face
08. Poster 08 | Product Colors/Models
Prompt (English): 9:16 vertical minimalist fashion mood board. Background: Warm creamy color. Left side: Full-body refined Asian female model wearing the champagne-colored short slip dress from uploaded reference image (clean studio, natural standing pose). Right side: Neatly arranged color/material swatches inspired by the slip dress (champagne gold, cream, pearl white, soft beige) + minimalist line icons (moon, feather, silk, morning dew). Keep everything flat, high-end, not busy.
Upper left SERI ANGGUN logo. Top large serif: "COLOR INSPIRATION / Inspirasi Warna Eksklusif". 3 key points (bilingual): Champagne exudes elegance / Warna champagne memancarkan keanggunan; Soft tones flatter skin / Ton lembut yang menonjolkan warna kulit; Subtle luxury / Kemewahan yang halus dan berkelas. CTA: "LEARN MORE → / Ketahui Lebih Lanjut →".
Negative prompts: cluttered, busy, multiple patterns, shadows, watermark, messy text, low quality, blurry, plain face.
09. Poster 09 | Product Sizes/Parameters
Prompt (English): 9:16 vertical minimalist size guide poster. Background: Warm off-white, clean. Place size chart (S/M/L) as neat grid cards (glass-mimetic, rounded). Content (bilingual title): "SIZE GUIDE / Panduan Pemilihan Saiz". Table columns: Size｜Length｜Bust｜Waist｜Hip. Rows: S｜90cm｜80-84cm｜64-68cm｜88-92cm; M｜92cm｜84-88cm｜68-72cm｜92-96cm; L｜94cm｜88-92cm｜72-76cm｜96-100cm. Upper left SERI ANGGUN logo. Bottom small note (bilingual): "Hand-measured, ±2cm variance normal / Diukur secara manual, varians ±2cm adalah perkara biasa.". Bottom caring tip: "Suggest sizing by bust measurement / Disyorkan pemilihan saiz berdasarkan ukuran dada."
Negative prompts: no extra patterns, no clutter, no watermark
10. Poster 10 | Ending Trust Page Warranty/After-Sales/Instructions
Prompt (English): 9:16 vertical high-end care poster. Background: Creamy gradient, very clean.
Upper left SERI ANGGUN logo. Large title: "CARE GUIDE / Panduan Penjagaan Produk". Use 5 minimalist icons + short bilingual lines (clean, not crowded): Hand wash or use laundry bag / Basuh dengan tangan atau gunakan beg dobi; Cold or below 30°C water / Gunakan air sejuk atau suhu di bawah 30°C; No bleach or wringing / Jangan gunakan peluntur atau memulas kain; Hang dry, avoid direct sun / Sidai untuk mengeringkan, elakkan cahaya matahari terus; Low heat iron, use cloth / Seterika dengan suhu rendah dan gunakan kain pelapik. Bottom small text (bilingual): "Care well, silkiness lasts longer / Penjagaan yang baik memastikan kelembutan tahan lebih lama.".
Negative prompts: no clutter, no heavy texture, no watermark`;

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
          <h1 className={styles.title}>Meta Prompting Template</h1>
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
