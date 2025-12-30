import { supabase } from './supabase';

/**
 * Retrieves the full details for a discount code (Agent) from the database
 * @param {string} code - The discount code (Agent ID)
 * @returns {Promise<Object|null>} - { amount, agentId, ... } or null if invalid
 */
export async function getDiscountDetails(code) {
  if (!code || typeof code !== 'string') return null;
  
  const normalizedCode = code.toUpperCase().trim();
  
  try {
    const { data, error } = await supabase
      .from('agents')
      .select('*')
      .eq('agent_id', normalizedCode)
      .eq('is_active', true)
      .single();

    if (error) {
      if (error.code !== 'PGRST116') { // Ignore "Row not found" errors
        console.error(`Error fetching agent ${normalizedCode}:`, error.message);
      }
      return null;
    }

    if (!data) return null;

    // Return structure compatible with previous hardcoded version + new fields
    return {
      amount: Number(data.discount_amount),
      agentId: data.agent_id,
      commPerSale: Number(data.comm_per_sale),
      ...data
    };
  } catch (err) {
    console.error(`Unexpected error in getDiscountDetails for ${code}:`, err);
    return null;
  }
}

/**
 * Validates a discount code and returns the discount amount
 * @param {string} code - The discount code to validate
 * @returns {Promise<number>} - The discount amount (0 if invalid)
 */
export async function getDiscountAmount(code) {
  const details = await getDiscountDetails(code);
  return details ? details.amount : 0;
}
