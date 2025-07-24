/**
 * Cloudinary Image Optimization Utilities
 * Optimizes bandwidth usage and loading performance
 */

const CLOUDINARY_BASE_URL = 'https://res.cloudinary.com/dtvvaed5i';

// Optimization presets for different image types
const OPTIMIZATION_PRESETS = {
  // High quality for hero/featured images
  hero: {
    quality: 'q_auto:good',
    format: 'f_auto',
    progressive: 'fl_progressive',
    dpr: 'dpr_auto',
    maxWidth: 1200,
    sizes: '(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px'
  },
  
  // Medium quality for content images  
  content: {
    quality: 'q_auto:eco',
    format: 'f_auto',
    progressive: 'fl_progressive', 
    dpr: 'dpr_auto',
    maxWidth: 800,
    sizes: '(max-width: 768px) 100vw, (max-width: 1024px) 75vw, 800px'
  },
  
  // Optimized for profile/author images
  profile: {
    quality: 'q_auto:good',
    format: 'f_auto',
    progressive: 'fl_progressive',
    crop: 'c_fill',
    gravity: 'face',
    maxWidth: 400,
    sizes: '(max-width: 768px) 200px, 300px'
  },
  
  // High compression for thumbnails
  thumbnail: {
    quality: 'q_auto:low',
    format: 'f_auto',
    crop: 'c_fill',
    maxWidth: 200,
    sizes: '200px'
  }
};

/**
 * Generate optimized Cloudinary URL
 * @param {string} publicId - Cloudinary public ID (path after /image/upload/)
 * @param {Object} options - Optimization options
 * @param {string} options.preset - Preset name (hero, content, profile, thumbnail)
 * @param {number} options.width - Custom width override
 * @param {number} options.height - Custom height override
 * @param {string} options.quality - Custom quality override
 * @param {boolean} options.blur - Generate blurred placeholder (for LQIP)
 * @returns {string} Optimized Cloudinary URL
 */
export function getOptimizedCloudinaryUrl(publicId, options = {}) {
  const {
    preset = 'content',
    width,
    height,
    quality,
    blur = false,
    crop,
    gravity
  } = options;

  // Get preset configuration
  const config = OPTIMIZATION_PRESETS[preset] || OPTIMIZATION_PRESETS.content;
  
  // Build transformation parameters array
  const transformations = [];
  
  // Format and quality (always first for best optimization)
  transformations.push(config.format);
  transformations.push(quality || config.quality);
  
  // Progressive loading
  if (config.progressive) {
    transformations.push(config.progressive);
  }
  
  // Device pixel ratio
  if (config.dpr) {
    transformations.push(config.dpr);
  }
  
  // Dimensions
  if (width) {
    transformations.push(`w_${width}`);
  } else if (config.maxWidth) {
    transformations.push(`w_auto:breakpoints_${config.maxWidth}`);
  }
  
  if (height) {
    transformations.push(`h_${height}`);
  }
  
  // Cropping and gravity
  if (crop || config.crop) {
    transformations.push(crop || config.crop);
  }
  
  if (gravity || config.gravity) {
    transformations.push(`g_${gravity || config.gravity}`);
  }
  
  // Blur for LQIP (Low Quality Image Placeholder)
  if (blur) {
    transformations.push('e_blur:300', 'q_auto:low', 'w_100');
  }
  
  // Build final URL
  const transformationString = transformations.join(',');
  return `${CLOUDINARY_BASE_URL}/image/upload/${transformationString}/${publicId}`;
}

/**
 * Generate LQIP (Low Quality Image Placeholder) URL
 * @param {string} publicId - Cloudinary public ID
 * @returns {string} Blurred placeholder URL for instant loading
 */
export function getCloudinaryBlurPlaceholder(publicId) {
  return getOptimizedCloudinaryUrl(publicId, { blur: true });
}

/**
 * Generate base64 data URL for blur placeholder
 * This creates a tiny, optimized blur placeholder
 * @param {string} publicId - Cloudinary public ID
 * @returns {string} Base64 data URL for blur placeholder
 */
export function getCloudinaryBlurDataURL(publicId) {
  // Generate extremely small blurred version for base64 encoding
  const blurUrl = `${CLOUDINARY_BASE_URL}/image/upload/f_auto,q_auto:low,w_10,h_6,e_blur:300,c_fill/${publicId}`;
  
  // For Next.js Image component, we'll use a generic blur data URL
  // In production, you might want to generate actual base64 from the tiny image
  return "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAGAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfa";
}

/**
 * Generate responsive image sizes attribute
 * @param {string} preset - Preset name to get sizes configuration
 * @returns {string} Sizes attribute for responsive images
 */
export function getCloudinarySizes(preset = 'content') {
  const config = OPTIMIZATION_PRESETS[preset];
  return config?.sizes || '100vw';
}

/**
 * Extract public ID from existing Cloudinary URL
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
 * Batch optimize multiple Cloudinary URLs
 * @param {Array} images - Array of {url, preset, options} objects
 * @returns {Array} Array of optimized URLs
 */
export function batchOptimizeCloudinaryUrls(images) {
  return images.map(({ url, preset, options }) => {
    const publicId = extractPublicId(url);
    return getOptimizedCloudinaryUrl(publicId, { preset, ...options });
  });
}

// Preset-specific helper functions for common use cases
export const cloudinaryPresets = {
  hero: (publicId, options = {}) => getOptimizedCloudinaryUrl(publicId, { preset: 'hero', ...options }),
  content: (publicId, options = {}) => getOptimizedCloudinaryUrl(publicId, { preset: 'content', ...options }),
  profile: (publicId, options = {}) => getOptimizedCloudinaryUrl(publicId, { preset: 'profile', ...options }),
  thumbnail: (publicId, options = {}) => getOptimizedCloudinaryUrl(publicId, { preset: 'thumbnail', ...options })
};