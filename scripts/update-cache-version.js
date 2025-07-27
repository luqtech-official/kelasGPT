#!/usr/bin/env node
/**
 * Update Cache Bust Version Script
 * Updates the CACHE_BUST_VERSION in imagekit.js to force fresh images
 */

const fs = require('fs');
const path = require('path');

const IMAGEKIT_FILE = path.join(__dirname, '../lib/imagekit.js');

function updateCacheBustVersion() {
  console.log('🔄 Updating cache bust version...\n');

  try {
    // Read the current file
    let content = fs.readFileSync(IMAGEKIT_FILE, 'utf8');
    
    // Generate new version (YYYYMMDD format)
    const now = new Date();
    const newVersion = now.getFullYear() + 
                      String(now.getMonth() + 1).padStart(2, '0') + 
                      String(now.getDate()).padStart(2, '0') +
                      String(now.getHours()).padStart(2, '0') +
                      String(now.getMinutes()).padStart(2, '0');
    
    // Extract current version
    const currentMatch = content.match(/const CACHE_BUST_VERSION = '([^']+)'/);
    const currentVersion = currentMatch ? currentMatch[1] : 'unknown';
    
    // Replace the version
    const updatedContent = content.replace(
      /const CACHE_BUST_VERSION = '[^']+'/,
      `const CACHE_BUST_VERSION = '${newVersion}'`
    );
    
    // Write back to file
    fs.writeFileSync(IMAGEKIT_FILE, updatedContent, 'utf8');
    
    console.log(`✅ Cache bust version updated:`);
    console.log(`   From: ${currentVersion}`);
    console.log(`   To:   ${newVersion}`);
    console.log(`\n🚀 Next steps:`);
    console.log(`   1. Restart your dev server: npm run dev`);
    console.log(`   2. All images will now load fresh versions!`);
    
  } catch (error) {
    console.error('❌ Error updating cache bust version:', error.message);
    process.exit(1);
  }
}

// Check if imagekit.js exists
if (!fs.existsSync(IMAGEKIT_FILE)) {
  console.error('❌ imagekit.js not found at:', IMAGEKIT_FILE);
  process.exit(1);
}

updateCacheBustVersion();