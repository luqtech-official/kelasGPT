/**
 * Atomic Payment Status Management
 * Single source of truth for all payment status operations
 */

import { supabase } from './supabase';

// Payment status constants
export const PAYMENT_STATES = {
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
  ABANDONED: 'abandoned',
  EXPIRED: 'expired',
  REFUNDED: 'refunded'
};

/**
 * Update payment status atomically (orders table is source of truth)
 * @param {object} logger - Pino logger instance
 * @param {string} orderNumber - Order number to update
 * @param {string} newStatus - New payment status
 * @param {string} transactionId - Gateway transaction ID (optional)
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
export async function updatePaymentStatus(logger, orderNumber, newStatus, transactionId = null) {
  try {
    logger.info({ orderNumber, newStatus, transactionId }, `Updating payment status: ${orderNumber} → ${newStatus}`);

    const { data, error } = await supabase.rpc('update_payment_status_atomic', {
      p_order_number: orderNumber,
      p_new_status: newStatus,
      p_transaction_id: transactionId
    });

    if (error) {
      logger.error({ error }, `Payment status update failed: ${orderNumber}`);
      throw error;
    }

    if (data && data.length > 0 && data[0].success) {
      logger.info({
        previousStatus: data[0].previous_status,
        newStatus: data[0].new_status,
        customerId: data[0].customer_id
      }, `Payment status updated successfully: ${orderNumber}`);
      
      return { 
        success: true, 
        data: data[0],
        previousStatus: data[0].previous_status,
        newStatus: data[0].new_status
      };
    } else {
      logger.error({ data }, `Payment status update returned no data: ${orderNumber}`);
      return { success: false, error: 'Order not found or update failed' };
    }

  } catch (error) {
    logger.error({ message: error.message, stack: error.stack }, `Payment status update exception: ${orderNumber}`);
    return { success: false, error: error.message };
  }
}

/**
 * Update payment status with state validation
 * @param {object} logger - Pino logger instance
 * @param {string} orderNumber - Order number to update
 * @param {string} newStatus - New payment status
 * @param {string} transactionId - Gateway transaction ID (optional)
 * @param {boolean} adminOverride - Skip state validation (for admin/cleanup)
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
export async function updatePaymentStatusValidated(logger, orderNumber, newStatus, transactionId = null, adminOverride = false) {
  try {
    logger.info({ orderNumber, newStatus, transactionId, adminOverride }, `Updating payment status with validation: ${orderNumber} → ${newStatus}`);

    const { data, error } = await supabase.rpc('update_payment_status_validated', {
      p_order_number: orderNumber,
      p_new_status: newStatus,
      p_transaction_id: transactionId,
      p_admin_override: adminOverride
    });

    if (error) {
      logger.error({ error }, `Validated payment status update failed: ${orderNumber}`);
      throw error;
    }

    if (data && data.length > 0) {
      const result = data[0];
      
      if (result.success) {
        logger.info({
          previousStatus: result.previous_status,
          newStatus: result.new_status,
          customerId: result.customer_id
        }, `Validated payment status updated: ${orderNumber}`);
        
        return { 
          success: true, 
          data: result,
          message: result.message
        };
      } else {
        logger.warn({
          message: result.message,
          previousStatus: result.previous_status,
          attemptedStatus: result.new_status
        }, `Payment status validation failed: ${orderNumber}`);
        
        return { 
          success: false, 
          error: result.message,
          validationError: true
        };
      }
    } else {
      logger.error({ data }, `Validated payment status update returned no data: ${orderNumber}`);
      return { success: false, error: 'Unexpected response format' };
    }

  } catch (error) {
    logger.error({ message: error.message, stack: error.stack }, `Validated payment status update exception: ${orderNumber}`);
    return { success: false, error: error.message };
  }
}

/**
 * Bulk update payment status for multiple customers (used by cleanup)
 * @param {object} logger - Pino logger instance
 * @param {string[]} customerIds - Array of customer IDs
 * @param {string} newStatus - New payment status
 * @returns {Promise<{success: boolean, count?: number, error?: string}>}
 */
export async function updatePaymentStatusBulk(logger, customerIds, newStatus) {
  try {
    logger.info({ customerCount: customerIds.length, newStatus }, `Bulk updating payment status to ${newStatus}`);

    const { data: count, error } = await supabase.rpc('update_payment_status_bulk', {
      p_customer_ids: customerIds,
      p_new_status: newStatus
    });

    if (error) {
      logger.error({ error }, 'Bulk payment status update failed');
      throw error;
    }

    logger.info({ updatedCount: count, newStatus }, `Bulk payment status update completed`);

    return { success: true, count };

  } catch (error) {
    logger.error({ message: error.message, stack: error.stack }, 'Bulk payment status update exception');
    return { success: false, error: error.message };
  }
}

/**
 * Get customer with computed payment status
 * @param {object} logger - Pino logger instance
 * @param {string} customerId - Customer ID
 * @returns {Promise<{data?: any, error?: any}>}
 */
export async function getCustomerWithPaymentStatus(logger, customerId) {
  try {
    const { data, error } = await supabase
      .from('customer_with_payment_status')
      .select('*')
      .eq('customer_id', customerId)
      .single();
      
    return { data, error };
  } catch (error) {
    logger.error({ customerId, error: error.message }, 'Error fetching customer with payment status');
    return { data: null, error };
  }
}

/**
 * Get all customers with computed payment status
 * @param {object} logger - Pino logger instance
 * @returns {Promise<{data?: any[], error?: any}>}
 */
export async function getCustomersWithPaymentStatus(logger) {
  try {
    const { data, error } = await supabase
      .from('customer_with_payment_status')
      .select('*')
      .order('created_at', { ascending: false });
      
    return { data, error };
  } catch (error) {
    logger.error({ error: error.message }, 'Error fetching customers with payment status');
    return { data: null, error };
  }
}

/**
 * Validate payment data consistency
 * @param {object} logger - Pino logger instance
 * @returns {Promise<{data?: any[], error?: any}>}
 */
export async function validatePaymentConsistency(logger) {
  try {
    const { data, error } = await supabase.rpc('validate_payment_consistency');
    
    if (error) throw error;
    
    if (data && data.length > 0) {
      logger.warn({ inconsistencies: data }, `Found ${data.length} inconsistent payment records`);
    } else {
      logger.info('Payment data consistency validation passed');
    }
    
    return { data, error };
  } catch (error) {
    logger.error({ error: error.message }, 'Payment consistency validation failed');
    return { data: null, error };
  }
}

/**
 * Get valid next states for a payment status
 * @param {string} currentStatus - Current payment status
 * @returns {string[]} - Array of valid next statuses
 */
export function getValidNextStates(currentStatus) {
  const validTransitions = {
    [PAYMENT_STATES.PENDING]: [PAYMENT_STATES.PAID, PAYMENT_STATES.FAILED, PAYMENT_STATES.CANCELLED, PAYMENT_STATES.ABANDONED],
    [PAYMENT_STATES.FAILED]: [PAYMENT_STATES.PENDING, PAYMENT_STATES.EXPIRED],
    [PAYMENT_STATES.CANCELLED]: [PAYMENT_STATES.PENDING, PAYMENT_STATES.EXPIRED],
    [PAYMENT_STATES.ABANDONED]: [PAYMENT_STATES.EXPIRED, PAYMENT_STATES.PENDING],
    [PAYMENT_STATES.PAID]: [PAYMENT_STATES.REFUNDED],
    [PAYMENT_STATES.EXPIRED]: [],
    [PAYMENT_STATES.REFUNDED]: []
  };
  
  return validTransitions[currentStatus] || [];
}

/**
 * Check if a state transition is valid
 * @param {string} fromStatus - Current status
 * @param {string} toStatus - Target status
 * @returns {boolean} - Whether transition is valid
 */
export function isValidTransition(fromStatus, toStatus) {
  const validNext = getValidNextStates(fromStatus);
  return validNext.includes(toStatus);
}
