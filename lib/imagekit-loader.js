/**
 * Custom ImageKit Loader for Next.js Image Optimization
 * Bypasses Vercel edge functions by serving images directly from ImageKit CDN
 */

import { getOptimizedImageUrl } from './imagekit';

/**
 * Custom loader function for Next.js Image component
 * @param {Object} params - Parameters from Next.js Image component
 * @param {string} params.src - Image source (image ID for ImageKit, full URL for external)
 * @param {number} params.width - Requested width
 * @param {number} params.quality - Requested quality (1-100)
 * @returns {string} Direct ImageKit URL or passthrough for external URLs
 */
export default function imagekitLoader({ src, width, quality }) {
  // Handle external URLs (like FPX payment logo) - pass through unchanged
  if (src.startsWith('http://') || src.startsWith('https://')) {
    return src;
  }
  
  // Handle relative paths (like favicon.ico) - pass through unchanged
  if (src.startsWith('/')) {
    return src;
  }
  
  // Handle ImageKit image IDs - use existing optimization logic
  return getOptimizedImageUrl(src, {
    width,
    quality: quality ? `q-${quality}` : undefined,
    preset: 'content' // Default preset, can be overridden via URL params if needed
  });
}