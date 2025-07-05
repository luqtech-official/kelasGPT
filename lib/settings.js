



// Default product settings as fallback
const DEFAULT_SETTINGS = {
  productName: 'KelasGPT - Instant Access x1',
  productPrice: 2.00,
  productDescription: 'Complete GPT-4 learning course in Malay language',
  productDownloadLink: 'https://your-download-link.com'
};

/**
 * Get product settings from database with caching
 * Falls back to default values if database fails (edit: removed supabase call, always use default product settings.)
 */
export async function getProductSettings() {
  return DEFAULT_SETTINGS;
}

/**
 * Get formatted price string for display
 */
export function formatPrice(price, currency = 'RM') {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  return `${currency}${numPrice.toFixed(2)}`;
}

/**
 * Get product settings for payment processing
 * Returns price as string (required for SecurePay)
 */
export async function getPaymentSettings() {
  const settings = await getProductSettings();
  return {
    ...settings,
    productPrice: settings.productPrice.toFixed(2) // Convert to string for payments
  };
}