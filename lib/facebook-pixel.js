// Simple, reliable Facebook Pixel helper functions
// Zero dependencies, bulletproof implementation

/**
 * Safely track any Facebook Pixel event with optional customer data
 * @param {string} eventName - Facebook event name (e.g., 'Purchase', 'ViewContent')
 * @param {object} eventData - Event data object
 * @param {object} customerData - Customer data for Advanced Matching (optional)
 */
export function trackEvent(eventName, eventData = {}, customerData = {}) {
  // Simple safety check - no throwing, no crashing
  if (typeof window !== 'undefined' && window.fbq && typeof window.fbq === 'function') {
    try {
      // Prepare Advanced Matching parameters (Facebook auto-hashes these)
      const advancedMatching = {};
      
      if (customerData.email) {
        advancedMatching.em = customerData.email.toLowerCase().trim();
      }
      
      if (customerData.phone) {
        // Clean phone number (remove spaces, dashes, but keep + for country code)
        advancedMatching.ph = customerData.phone.replace(/[\s\-\(\)]/g, '');
      }
      
      if (customerData.firstName) {
        advancedMatching.fn = customerData.firstName.toLowerCase().trim();
      }
      
      if (customerData.lastName) {
        advancedMatching.ln = customerData.lastName.toLowerCase().trim();
      }
      
      if (customerData.customerId) {
        advancedMatching.external_id = String(customerData.customerId);
      }

      // Send event with Advanced Matching if customer data exists
      if (Object.keys(advancedMatching).length > 0) {
        window.fbq('track', eventName, eventData, advancedMatching);
      } else {
        window.fbq('track', eventName, eventData);
      }
      
      // Optional debug logging for development
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Facebook Pixel] ${eventName}:`, {
          eventData,
          advancedMatching: Object.keys(advancedMatching).length > 0 ? 
            Object.keys(advancedMatching) : 'none'
        });
      }
    } catch (error) {
      // Silent failure - tracking shouldn't break the app
      console.warn('Facebook Pixel tracking failed:', error);
    }
  }
}

/**
 * Track ViewContent event for product pages
 * @param {object} productData - Product information
 * @param {object} customerData - Customer data for Advanced Matching (optional)
 */
export function trackViewContent(productData = {}, customerData = {}) {
  trackEvent('ViewContent', {
    content_type: 'product',
    content_ids: [productData.productId || 'kelasgpt-course'],
    content_name: productData.productName || 'KelasGPT Course',
    value: parseFloat(productData.productPrice || 0),
    currency: 'MYR',
    content_category: productData.category || 'education'
  }, customerData);
}

/**
 * Track InitiateCheckout event for checkout page
 * @param {object} productData - Product information
 * @param {object} customerData - Customer data for Advanced Matching (optional)
 */
export function trackInitiateCheckout(productData = {}, customerData = {}) {
  trackEvent('InitiateCheckout', {
    content_type: 'product',
    content_ids: [productData.productId || 'kelasgpt-course'],
    content_name: productData.productName || 'KelasGPT Course',
    value: parseFloat(productData.productPrice || 0),
    currency: 'MYR',
    content_category: productData.category || 'education',
    num_items: 1
  }, customerData);
}

/**
 * Track Purchase event for successful payments
 * @param {object} purchaseData - Purchase information
 * @param {object} customerData - Customer data for Advanced Matching (optional)
 */
export function trackPurchase(purchaseData = {}, customerData = {}) {
  trackEvent('Purchase', {
    content_type: 'product',
    content_ids: [purchaseData.productId || 'kelasgpt-course'],
    content_name: purchaseData.productName || 'KelasGPT Course',
    value: parseFloat(purchaseData.value || purchaseData.productPrice || 0),
    currency: 'MYR',
    content_category: purchaseData.category || 'education',
    order_id: purchaseData.orderNumber || purchaseData.order_id,
    num_items: 1
  }, customerData);
}

/**
 * Check if Facebook Pixel is loaded and ready
 * @returns {boolean} True if pixel is available
 */
export function isPixelReady() {
  return typeof window !== 'undefined' && 
         window.fbq && 
         typeof window.fbq === 'function';
}

/**
 * Get Facebook Pixel status for debugging
 * @returns {object} Status information
 */
export function getPixelStatus() {
  return {
    isLoaded: isPixelReady(),
    pixelId: process.env.NEXT_PUBLIC_META_PIXEL_ID || 'not configured',
    environment: process.env.NODE_ENV
  };
}