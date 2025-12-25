// Library of valid discount codes
// Format: "CODE": { amount: number, agentId: string }
// Codes are case-insensitive in logic, but stored uppercase here for consistency

export const DISCOUNT_CODES = {
  "NANOBANANA": { amount: 50, agentId: "OFFICIAL" },
  "NBPRO": { amount: 50, agentId: "OFFICIAL" },
  "LAUNCH": { amount: 20, agentId: "PROMO" },
  "EARLYBIRD": { amount: 30, agentId: "PROMO" },
  "KELASGPT": { amount: 10, agentId: "PARTNER" },
  "LYDIA": { amount: 7, agentId: "LYDIA" }
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
    return DISCOUNT_CODES[normalizedCode].amount;
  }
  
  return 0;
}

/**
 * Retrieves the full details for a discount code
 * @param {string} code - The discount code
 * @returns {Object|null} - { amount, agentId } or null if invalid
 */
export function getDiscountDetails(code) {
  if (!code || typeof code !== 'string') return null;
  
  const normalizedCode = code.toUpperCase().trim();
  
  if (Object.prototype.hasOwnProperty.call(DISCOUNT_CODES, normalizedCode)) {
    return DISCOUNT_CODES[normalizedCode];
  }
  
  return null;
}