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

// Image URL mapping for your assets
const IMAGE_URL_MAPPING = {
  // Hero
  'hero-main': 'kelasgpt/Hero-image-kelasgpt-Expert-Advisor-SampleCollection.png',
  
  // Use Cases
  'writing-sample': 'kelasgpt/Writing%20Style%20Sample-Kelasgpt-Usecase.png',
  'sales-report-sample': 'kelasgpt/Sales%20Report%20Sample-Kelasgpt-Usecase.png',
  'infographic-sample': 'kelasgpt/Infografik%20Sample-Kelasgpt-Usecase.png',
  
  // Profile & Authority
  'author-photo': 'kelasgpt/Author-image-kelasgpt%20Author%20image.png',
  'tradingview-proof': 'kelasgpt/TradingView-EditorsPick-kelasgpt-authority.png',
  
  // Expert Avatars (placeholder)
  'parksaejin': 'kelasgpt/Park%20Sae%20Jin.png',
  
  // Expert carousel images (from your Swiper components)
  'parkchaeha': 'kelasgpt/Gemini_Generated_Image_yvapo6yvapo6yvap.png',
  'hinata': 'kelasgpt/Gemini_Generated_Image_oxvesxoxvesxoxve.png?updatedAt=1754343935728',
  'parkminah': 'kelasgpt/Gemini_Generated_Image_lsqshqlsqshqlsqs.png?updatedAt=1754343871102',
  'EA-copywriter-sample': 'kelasgpt/EA-Copywriting-Sample-1.jpg',
  'parksaejin2': 'kelasgpt/Gemini_Generated_Image_qsekmwqsekmwqsek.png',
  'queeny': 'kelasgpt/Gemini_Generated_Image_ms02psms02psms02.png'
};

// Optimization presets for different image types
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
  
  // Optimized for benefit section images
  benefit: {
    quality: 'q-80',
    format: 'f-auto',
    // crop: 'c-maintain_ratio',
    width: 800,
    sizes: '(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px'
  }
};

/**
 * Map image ID to ImageKit.io file path
 * @param {string} imageId - Your image identifier
 * @returns {string} ImageKit.io file path
 */
function mapToImageKitPath(imageId) {
  return IMAGE_URL_MAPPING[imageId] || imageId;
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
 * @param {string} imageId - Your image identifier
 * @param {Object} options - Optimization options
 * @param {string} options.preset - Preset name (hero, content, profile, thumbnail)
 * @param {number} options.width - Custom width override
 * @param {number} options.height - Custom height override
 * @param {string} options.quality - Custom quality override
 * @param {boolean} options.blur - Generate blurred placeholder (for LQIP)
 * @param {boolean} options.noCache - Skip cache for this URL generation
 * @returns {string} Optimized ImageKit.io URL
 */
export function getOptimizedImageUrl(imageId, options = {}) {
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
    const cacheKey = getCacheKey(imageId, options);
    if (URL_CACHE.has(cacheKey)) {
      return URL_CACHE.get(cacheKey);
    }
  }

  // Map image ID to ImageKit path
  const imagePath = mapToImageKitPath(imageId);
  
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
    const cacheKey = getCacheKey(imageId, options);
    URL_CACHE.set(cacheKey, finalUrl);
  }

  return finalUrl;
}

/**
 * Generate LQIP (Low Quality Image Placeholder) URL
 * @param {string} imageId - Your image identifier
 * @returns {string} Blurred placeholder URL for instant loading
 */
export function getBlurPlaceholder(imageId) {
  return getOptimizedImageUrl(imageId, { blur: true });
}

/**
 * Generate base64 data URL for blur placeholder
 * This creates a tiny, optimized blur placeholder
 * @param {string} imageId - Your image identifier
 * @returns {string} Base64 data URL for blur placeholder
 */
export function getBlurDataURL(imageId) {
  // For Next.js Image component, we'll use a generic blur data URL
  // This avoids additional ImageKit requests and potential issues
  return "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAGAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfa";
}

/**
 * Generate responsive image sizes attribute
 * @param {string} preset - Preset name to get sizes configuration
 * @returns {string} Sizes attribute for responsive images
 */
export function getImageSizes(preset = 'content') {
  const config = OPTIMIZATION_PRESETS[preset];
  return config?.sizes || '100vw';
}

// Preset-specific helper functions for common use cases
export const imagePresets = {
  hero: (imageId, options = {}) => getOptimizedImageUrl(imageId, { preset: 'hero', ...options }),
  content: (imageId, options = {}) => getOptimizedImageUrl(imageId, { preset: 'content', ...options }),
  profile: (imageId, options = {}) => getOptimizedImageUrl(imageId, { preset: 'profile', ...options }),
  thumbnail: (imageId, options = {}) => getOptimizedImageUrl(imageId, { preset: 'thumbnail', ...options }),
  benefit: (imageId, options = {}) => getOptimizedImageUrl(imageId, { preset: 'benefit', ...options })
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
   * @param {Array} images - Array of {imageId, preset, options} objects
   */
  preCache(images) {
    images.forEach(({ imageId, preset, options }) => {
      getOptimizedImageUrl(imageId, { preset, ...options });
    });
  }
};

/**
 * ImageKit.io specific optimizations for bandwidth saving
 */
export const bandwidthOptimization = {
  /**
   * Generate progressive quality URLs for network-aware loading
   * @param {string} imageId - Image identifier
   * @param {string} preset - Preset name
   * @returns {Object} URLs for different quality levels
   */
  getProgressiveUrls(imageId, preset = 'content') {
    return {
      low: getOptimizedImageUrl(imageId, { preset, quality: 'q-50' }),
      medium: getOptimizedImageUrl(imageId, { preset, quality: 'q-75' }),
      high: getOptimizedImageUrl(imageId, { preset })
    };
  },

  /**
   * Generate responsive breakpoint URLs
   * @param {string} imageId - Image identifier
   * @param {string} preset - Preset name
   * @returns {Object} URLs for different screen sizes
   */
  getResponsiveUrls(imageId, preset = 'content') {
    const baseConfig = OPTIMIZATION_PRESETS[preset];
    return {
      mobile: getOptimizedImageUrl(imageId, { preset, width: 400 }),
      tablet: getOptimizedImageUrl(imageId, { preset, width: 768 }),
      desktop: getOptimizedImageUrl(imageId, { preset, width: baseConfig.width || 1200 })
    };
  }
};