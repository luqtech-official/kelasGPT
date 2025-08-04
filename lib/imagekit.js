/**
 * ImageKit.io Image Optimization Utilities
 * Optimizes bandwidth usage and loading performance with advanced caching
 */

const IMAGEKIT_BASE_URL = 'https://ik.imagekit.io/kelasgptcdnid';

// URL cache to prevent redundant URL generation and optimize bandwidth
const URL_CACHE = new Map();
const CACHE_MAX_SIZE = 100; // Limit cache size to prevent memory leaks

// Cache busting version - use fixed timestamp to avoid SSR hydration mismatch
// Change this value manually when you need to bust caches globally
const CACHE_BUST_VERSION = '20250127'; // Fixed version for deterministic SSR

// Cache key generator for consistent caching
function getCacheKey(publicId, options) {
  return `${publicId}:${JSON.stringify(options || {})}:${CACHE_BUST_VERSION}`;
}

// Image URL mapping from Cloudinary public IDs to ImageKit.io file paths
const IMAGE_URL_MAPPING = {
  // Hero
  'v1753562149/Untitled_design_rhwya0': 'kelasgpt/Hero-image-kelasgpt-Expert-Advisor-SampleCollection.png',
  
  // Use Cases
  'v1753332727/Writing_Style_Sample_y7vmrr': 'kelasgpt/Writing%20Style%20Sample-Kelasgpt-Usecase.png',
  'v1753332727/Sales_Report_Sample_om3mlm': 'kelasgpt/Sales%20Report%20Sample-Kelasgpt-Usecase.png',
  'v1753332728/Infografik_Sample_amkqdu': 'kelasgpt/Infografik%20Sample-Kelasgpt-Usecase.png',
  
  // Profile & Authority
  'v1753332746/Professional_Photo_mdtnaf': 'kelasgpt/Author-image-kelasgpt%20Author%20image.png',
  'v1753332276/Bland_Terlalu_AI_2_nhqtrc': 'kelasgpt/TradingView-EditorsPick-kelasgpt-authority.png',
  
  // Expert Avatars
  'expert-placeholder': 'kelasgpt/Park%20Sae%20Jin.png'
};

// Optimization presets for different image types - optimized for ImageKit.io
const OPTIMIZATION_PRESETS = {
  // High quality for hero/featured images
  hero: {
    quality: 'q-85',
    format: 'f-auto',
    width: 1200,
    sizes: '(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px'
  },
  
  // Medium quality for content images  
  content: {
    quality: 'q-80',
    format: 'f-auto',
    width: 800,
    sizes: '(max-width: 768px) 100vw, (max-width: 1024px) 75vw, 800px'
  },
  
  // Optimized for profile/author images
  profile: {
    quality: 'q-80',
    format: 'f-auto',
    crop: 'c-maintain_ratio',
    focus: 'fo-face',
    width: 400,
    sizes: '(max-width: 768px) 200px, 300px'
  },
  
  // High compression for thumbnails
  thumbnail: {
    quality: 'q-70',
    format: 'f-auto',
    crop: 'c-maintain_ratio',
    width: 200,
    sizes: '200px'
  },
  
  // Optimized for expert avatar images
  expert: {
    quality: 'q-85',
    format: 'f-auto',
    crop: 'c-maintain_ratio',
    width: 300,
    sizes: '(max-width: 768px) 200px, 240px'
  }
};

/**
 * Map Cloudinary public ID to ImageKit.io file path
 * @param {string} publicId - Cloudinary public ID
 * @returns {string} ImageKit.io file path
 */
function mapToImageKitPath(publicId) {
  return IMAGE_URL_MAPPING[publicId] || publicId;
}

/**
 * Clear URL cache when it gets too large to prevent memory leaks
 */
function manageCacheSize() {
  if (URL_CACHE.size >= CACHE_MAX_SIZE) {
    // Remove oldest entries (FIFO)
    const entriesToRemove = Math.floor(CACHE_MAX_SIZE * 0.3); // Remove 30%
    const keysToRemove = Array.from(URL_CACHE.keys()).slice(0, entriesToRemove);
    keysToRemove.forEach(key => URL_CACHE.delete(key));
  }
}

/**
 * Generate optimized ImageKit.io URL with caching
 * @param {string} publicId - Cloudinary public ID (will be mapped to ImageKit path)
 * @param {Object} options - Optimization options
 * @param {string} options.preset - Preset name (hero, content, profile, thumbnail)
 * @param {number} options.width - Custom width override
 * @param {number} options.height - Custom height override
 * @param {string} options.quality - Custom quality override
 * @param {boolean} options.blur - Generate blurred placeholder (for LQIP)
 * @param {boolean} options.noCache - Skip cache for this URL generation
 * @returns {string} Optimized ImageKit.io URL
 */
export function getOptimizedImageKitUrl(publicId, options = {}) {
  const {
    preset = 'content',
    width,
    height,
    quality,
    blur = false,
    crop,
    focus,
    noCache = false
  } = options;

  // Check cache first (unless noCache is true)
  if (!noCache) {
    const cacheKey = getCacheKey(publicId, options);
    if (URL_CACHE.has(cacheKey)) {
      return URL_CACHE.get(cacheKey);
    }
  }

  // Map Cloudinary ID to ImageKit path
  const imagePath = mapToImageKitPath(publicId);
  
  // Get preset configuration
  const config = OPTIMIZATION_PRESETS[preset] || OPTIMIZATION_PRESETS.content;
  
  // Build transformation parameters array
  const transformations = [];
  
  // Format and quality (ImageKit auto-optimizes format)
  if (quality) {
    transformations.push(quality);
  } else if (config.quality) {
    transformations.push(config.quality);
  }
  
  // Dimensions
  if (width) {
    transformations.push(`w-${width}`);
  } else if (config.width) {
    transformations.push(`w-${config.width}`);
  }
  
  if (height) {
    transformations.push(`h-${height}`);
  }
  
  // Cropping and focus
  if (crop || config.crop) {
    transformations.push(crop || config.crop);
  }
  
  if (focus || config.focus) {
    transformations.push(focus || config.focus);
  }
  
  // Blur for LQIP (Low Quality Image Placeholder)
  if (blur) {
    transformations.push('bl-8', 'q-50', 'w-150');
  }
  
  // Build final URL with cache busting
  const transformationString = transformations.length > 0 ? `tr:${transformations.join(',')}` : '';
  const baseUrl = transformationString 
    ? `${IMAGEKIT_BASE_URL}/${transformationString}/${imagePath}`
    : `${IMAGEKIT_BASE_URL}/${imagePath}`;
  
  // Add cache-busting parameter to force fresh images
  const finalUrl = `${baseUrl}?v=${CACHE_BUST_VERSION}`;

  // Cache the URL for future use (unless noCache is true)
  if (!noCache) {
    manageCacheSize(); // Ensure cache doesn't grow too large
    const cacheKey = getCacheKey(publicId, options);
    URL_CACHE.set(cacheKey, finalUrl);
  }

  return finalUrl;
}

/**
 * Generate LQIP (Low Quality Image Placeholder) URL
 * @param {string} publicId - Cloudinary public ID
 * @returns {string} Blurred placeholder URL for instant loading
 */
export function getImageKitBlurPlaceholder(publicId) {
  return getOptimizedImageKitUrl(publicId, { blur: true });
}

/**
 * Generate base64 data URL for blur placeholder
 * This creates a tiny, optimized blur placeholder
 * @param {string} publicId - Cloudinary public ID
 * @returns {string} Base64 data URL for blur placeholder
 */
export function getImageKitBlurDataURL(publicId) {
  // For Next.js Image component, we'll use a generic blur data URL
  // This avoids additional ImageKit requests and potential issues
  return "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAGAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfa";
}

/**
 * Generate responsive image sizes attribute
 * @param {string} preset - Preset name to get sizes configuration
 * @returns {string} Sizes attribute for responsive images
 */
export function getImageKitSizes(preset = 'content') {
  const config = OPTIMIZATION_PRESETS[preset];
  return config?.sizes || '100vw';
}

/**
 * Extract public ID from existing Cloudinary URL (for backward compatibility)
 * @param {string} cloudinaryUrl - Full Cloudinary URL
 * @returns {string} Public ID extracted from URL
 */
export function extractPublicId(cloudinaryUrl) {
  // Match pattern: /image/upload/[transformations]/publicId.extension
  const match = cloudinaryUrl.match(/\/image\/upload\/(?:v\d+\/)?(.+)$/);
  if (match) {
    // Remove file extension if present
    return match[1].replace(/\.[^/.]+$/, '');
  }
  
  // Fallback: try to extract from path
  const pathMatch = cloudinaryUrl.match(/\/([^/]+)\.(?:jpg|jpeg|png|webp|gif)$/i);
  return pathMatch ? pathMatch[1] : cloudinaryUrl;
}

/**
 * Batch optimize multiple ImageKit URLs
 * @param {Array} images - Array of {url, preset, options} objects
 * @returns {Array} Array of optimized URLs
 */
export function batchOptimizeImageKitUrls(images) {
  return images.map(({ url, preset, options }) => {
    const publicId = extractPublicId(url);
    return getOptimizedImageKitUrl(publicId, { preset, ...options });
  });
}

// Preset-specific helper functions for common use cases - EXACT API COMPATIBILITY
export const imagekitPresets = {
  hero: (publicId, options = {}) => getOptimizedImageKitUrl(publicId, { preset: 'hero', ...options }),
  content: (publicId, options = {}) => getOptimizedImageKitUrl(publicId, { preset: 'content', ...options }),
  profile: (publicId, options = {}) => getOptimizedImageKitUrl(publicId, { preset: 'profile', ...options }),
  thumbnail: (publicId, options = {}) => getOptimizedImageKitUrl(publicId, { preset: 'thumbnail', ...options }),
  expert: (publicId, options = {}) => getOptimizedImageKitUrl(publicId, { preset: 'expert', ...options })
};

/**
 * Cache management utilities for bandwidth optimization
 */
export const cacheUtils = {
  /**
   * Get current cache statistics
   * @returns {Object} Cache statistics
   */
  getStats() {
    return {
      size: URL_CACHE.size,
      maxSize: CACHE_MAX_SIZE,
      utilization: `${((URL_CACHE.size / CACHE_MAX_SIZE) * 100).toFixed(1)}%`
    };
  },

  /**
   * Clear all cached URLs (useful for debugging or memory management)
   */
  clearCache() {
    URL_CACHE.clear();
    console.log('🗑️ Application URL cache cleared');
  },

  /**
   * Force cache busting for all new URLs (useful when images are updated)
   * This will make all new URL generations include fresh cache-busting parameters
   */
  bustCache() {
    URL_CACHE.clear();
    console.log('💥 Cache busted - all URLs will be fresh');
    console.log('💡 To globally bust cache, update CACHE_BUST_VERSION in lib/imagekit.js');
  },

  /**
   * Get current cache bust version
   * @returns {string} Current cache busting version
   */
  getCacheBustVersion() {
    return CACHE_BUST_VERSION;
  },

  /**
   * Pre-cache frequently used images to optimize performance
   * @param {Array} images - Array of {publicId, preset, options} objects
   */
  preCache(images) {
    images.forEach(({ publicId, preset, options }) => {
      getOptimizedImageKitUrl(publicId, { preset, ...options });
    });
  }
};

/**
 * ImageKit.io specific optimizations for bandwidth saving
 */
export const bandwidthOptimization = {
  /**
   * Generate progressive quality URLs for network-aware loading
   * @param {string} publicId - Image public ID
   * @param {string} preset - Preset name
   * @returns {Object} URLs for different quality levels
   */
  getProgressiveUrls(publicId, preset = 'content') {
    return {
      low: getOptimizedImageKitUrl(publicId, { preset, quality: 'q-50' }),
      medium: getOptimizedImageKitUrl(publicId, { preset, quality: 'q-75' }),
      high: getOptimizedImageKitUrl(publicId, { preset })
    };
  },

  /**
   * Generate responsive breakpoint URLs
   * @param {string} publicId - Image public ID
   * @param {string} preset - Preset name
   * @returns {Object} URLs for different screen sizes
   */
  getResponsiveUrls(publicId, preset = 'content') {
    const baseConfig = OPTIMIZATION_PRESETS[preset];
    return {
      mobile: getOptimizedImageKitUrl(publicId, { preset, width: 400 }),
      tablet: getOptimizedImageKitUrl(publicId, { preset, width: 768 }),
      desktop: getOptimizedImageKitUrl(publicId, { preset, width: baseConfig.width || 1200 })
    };
  }
};

// Backward compatibility aliases
export const getCloudinaryBlurDataURL = getImageKitBlurDataURL;
export const getCloudinarySizes = getImageKitSizes;
export const cloudinaryPresets = imagekitPresets;