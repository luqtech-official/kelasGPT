/**
 * Atomic Payment Status Management
 * Single source of truth for all payment status operations
 */

import { supabase } from './supabase';
import { logTransaction } from './logger';

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
 * @param {string} orderNumber - Order number to update
 * @param {string} newStatus - New payment status
 * @param {string} transactionId - Gateway transaction ID (optional)
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
export async function updatePaymentStatus(orderNumber, newStatus, transactionId = null) {
  try {
    await logTransaction('INFO', `Updating payment status: ${orderNumber} → ${newStatus}`, {
      orderNumber,
      newStatus,
      transactionId
    });

    const { data, error } = await supabase.rpc('update_payment_status_atomic', {
      p_order_number: orderNumber,
      p_new_status: newStatus,
      p_transaction_id: transactionId
    });

    if (error) {
      await logTransaction('ERROR', `Payment status update failed: ${orderNumber}`, error);
      throw error;
    }

    if (data && data.length > 0 && data[0].success) {
      await logTransaction('INFO', `Payment status updated successfully: ${orderNumber}`, {
        previousStatus: data[0].previous_status,
        newStatus: data[0].new_status,
        customerId: data[0].customer_id
      });
      
      return { 
        success: true, 
        data: data[0],
        previousStatus: data[0].previous_status,
        newStatus: data[0].new_status
      };
    } else {
      await logTransaction('ERROR', `Payment status update returned no data: ${orderNumber}`, { data });
      return { success: false, error: 'Order not found or update failed' };
    }

  } catch (error) {
    await logTransaction('ERROR', `Payment status update exception: ${orderNumber}`, {
      message: error.message,
      stack: error.stack
    });
    return { success: false, error: error.message };
  }
}

/**
 * Update payment status with state validation
 * @param {string} orderNumber - Order number to update
 * @param {string} newStatus - New payment status
 * @param {string} transactionId - Gateway transaction ID (optional)
 * @param {boolean} adminOverride - Skip state validation (for admin/cleanup)
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
export async function updatePaymentStatusValidated(orderNumber, newStatus, transactionId = null, adminOverride = false) {
  try {
    await logTransaction('INFO', `Updating payment status with validation: ${orderNumber} → ${newStatus}`, {
      orderNumber,
      newStatus,
      transactionId,
      adminOverride
    });

    const { data, error } = await supabase.rpc('update_payment_status_validated', {
      p_order_number: orderNumber,
      p_new_status: newStatus,
      p_transaction_id: transactionId,
      p_admin_override: adminOverride
    });

    if (error) {
      await logTransaction('ERROR', `Validated payment status update failed: ${orderNumber}`, error);
      throw error;
    }

    if (data && data.length > 0) {
      const result = data[0];
      
      if (result.success) {
        await logTransaction('INFO', `Validated payment status updated: ${orderNumber}`, {
          previousStatus: result.previous_status,
          newStatus: result.new_status,
          customerId: result.customer_id
        });
        
        return { 
          success: true, 
          data: result,
          message: result.message
        };
      } else {
        await logTransaction('WARN', `Payment status validation failed: ${orderNumber}`, {
          message: result.message,
          previousStatus: result.previous_status,
          attemptedStatus: result.new_status
        });
        
        return { 
          success: false, 
          error: result.message,
          validationError: true
        };
      }
    } else {
      await logTransaction('ERROR', `Validated payment status update returned no data: ${orderNumber}`, { data });
      return { success: false, error: 'Unexpected response format' };
    }

  } catch (error) {
    await logTransaction('ERROR', `Validated payment status update exception: ${orderNumber}`, {
      message: error.message,
      stack: error.stack
    });
    return { success: false, error: error.message };
  }
}

/**
 * Bulk update payment status for multiple customers (used by cleanup)
 * @param {string[]} customerIds - Array of customer IDs
 * @param {string} newStatus - New payment status
 * @returns {Promise<{success: boolean, count?: number, error?: string}>}
 */
export async function updatePaymentStatusBulk(customerIds, newStatus) {
  try {
    await logTransaction('INFO', `Bulk updating payment status to ${newStatus}`, {
      customerCount: customerIds.length,
      newStatus
    });

    const { data: count, error } = await supabase.rpc('update_payment_status_bulk', {
      p_customer_ids: customerIds,
      p_new_status: newStatus
    });

    if (error) {
      await logTransaction('ERROR', 'Bulk payment status update failed', error);
      throw error;
    }

    await logTransaction('INFO', `Bulk payment status update completed`, {
      updatedCount: count,
      newStatus
    });

    return { success: true, count };

  } catch (error) {
    await logTransaction('ERROR', 'Bulk payment status update exception', {
      message: error.message,
      stack: error.stack
    });
    return { success: false, error: error.message };
  }
}

/**
 * Get customer with computed payment status
 * @param {string} customerId - Customer ID
 * @returns {Promise<{data?: any, error?: any}>}
 */
export async function getCustomerWithPaymentStatus(customerId) {
  try {
    const { data, error } = await supabase
      .from('customer_with_payment_status')
      .select('*')
      .eq('customer_id', customerId)
      .single();
      
    return { data, error };
  } catch (error) {
    await logTransaction('ERROR', 'Error fetching customer with payment status', {
      customerId,
      error: error.message
    });
    return { data: null, error };
  }
}

/**
 * Get all customers with computed payment status
 * @returns {Promise<{data?: any[], error?: any}>}
 */
export async function getCustomersWithPaymentStatus() {
  try {
    const { data, error } = await supabase
      .from('customer_with_payment_status')
      .select('*')
      .order('created_at', { ascending: false });
      
    return { data, error };
  } catch (error) {
    await logTransaction('ERROR', 'Error fetching customers with payment status', {
      error: error.message
    });
    return { data: null, error };
  }
}

/**
 * Validate payment data consistency
 * @returns {Promise<{data?: any[], error?: any}>}
 */
export async function validatePaymentConsistency() {
  try {
    const { data, error } = await supabase.rpc('validate_payment_consistency');
    
    if (error) throw error;
    
    if (data && data.length > 0) {
      await logTransaction('WARN', `Found ${data.length} inconsistent payment records`, { 
        inconsistencies: data 
      });
    } else {
      await logTransaction('INFO', 'Payment data consistency validation passed');
    }
    
    return { data, error };
  } catch (error) {
    await logTransaction('ERROR', 'Payment consistency validation failed', {
      error: error.message
    });
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