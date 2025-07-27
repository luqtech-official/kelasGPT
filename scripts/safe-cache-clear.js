#!/usr/bin/env node
/**
 * Safe Cache Clearing Script
 * Clears only image caches without breaking Next.js static assets
 */

const fs = require('fs');
const path = require('path');

console.log('🧹 Safe Cache Clearing for Image Migration\n');

// Safe cache directories to clear
const SAFE_TO_CLEAR = [
  '.next/cache/images',          // Next.js image optimization cache only
  '.next/cache/webpack',         // Webpack cache (will regenerate)
  'node_modules/.cache',         // Node modules cache
];

// NEVER clear these (essential for Next.js)
const NEVER_CLEAR = [
  '.next/static',               // Static assets (fonts, JS chunks)
  '.next/server',               // Server-side chunks
  '.next/build-manifest.json',  // Build manifest
];

function clearDirectory(dirPath) {
  try {
    if (fs.existsSync(dirPath)) {
      fs.rmSync(dirPath, { recursive: true, force: true });
      console.log(`✅ Cleared: ${dirPath}`);
      return true;
    } else {
      console.log(`ℹ️  Not found: ${dirPath}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Error clearing ${dirPath}:`, error.message);
    return false;
  }
}

console.log('Clearing safe cache directories:\n');

let clearedCount = 0;
SAFE_TO_CLEAR.forEach(dir => {
  if (clearDirectory(dir)) {
    clearedCount++;
  }
});

console.log(`\n📊 Results:`);
console.log(`   - Cleared ${clearedCount} cache directories`);
console.log(`   - Preserved Next.js static assets`);
console.log(`   - Image URLs will use cache-busting parameters`);

console.log(`\n🚀 Next steps:`);
console.log(`   1. Restart your dev server: npm run dev`);
console.log(`   2. Hard refresh browser: Ctrl+Shift+R`);
console.log(`   3. Fresh images should now load!`);

console.log(`\n💡 Future cache clearing:`);
console.log(`   Use: node scripts/safe-cache-clear.js`);
console.log(`   Instead of manually deleting .next/ folders`);