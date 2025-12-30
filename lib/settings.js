



// Default product settings
// discountunittotal means that its the number of product units total available unit to be purchased at discounted price.
// discountunitleft means that its the number of product units left to be purchased at discounted price.
const DEFAULT_SETTINGS = {
  productName: 'KelasGPT - Instant Access x1',
  baseproductprice: 37.00,
  discountamount: 0.00,
  productPrice: 37.00,
  allowdiscount: true,
  discountunittotal: 100,
  discountunitleft: 42,
  productDescription: 'KelasGPT - Kelas Deep Dive AI',
  productDownloadLink: 'https://kelasgpt.com/videolisting',
  productSupportEmail: 'luqtech.official@gmail.com',
  productSupportPhone: '011-23919067',
  productSupportChatbot: 'https://chatgpt.com/g/g-689486088fd08191bb8a35c46471a578-kelasgpt',
  commisionPerUnitSold: 10
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