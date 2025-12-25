// Library of valid discount codes
// Format: "CODE": amount_in_MYR
// Codes are case-insensitive in logic, but stored uppercase here for consistency

export const DISCOUNT_CODES = {
  "NANOBANANA": 50,
  "NBPRO": 50,
  "LAUNCH": 20,
  "EARLYBIRD": 30,
  "KELASGPT": 10,
  "LYDIA": 7
};

/**
 * Validates a discount code and returns the discount amount
 * @param {string} code - The discount code to validate
 * @returns {number} - The discount amount (0 if invalid)
 */
export function getDiscountAmount(code) {
  if (!code || typeof code !== 'string') return 0;
  
  const normalizedCode = code.toUpperCase().trim();
  
  if (Object.prototype.hasOwnProperty.call(DISCOUNT_CODES, normalizedCode)) {
    return DISCOUNT_CODES[normalizedCode];
  }
  
  return 0;
}
