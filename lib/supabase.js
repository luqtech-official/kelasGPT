import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with service role
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Service role for admin operations

// Use the service_role key for backend operations to bypass RLS
export const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

export async function addCustomer(customerData) {
  try {
    const { data, error } = await supabase
      .from('customers')
      .insert([customerData])
      .select();

    if (error) {
      throw error;
    }
    return { data, error: null };
  } catch (error) {
    console.error('Error adding customer:', error.message);
    return { data: null, error };
  }
}

export async function getCustomer(customerId) {
  try {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('customer_id', customerId)
      .single();

    if (error) {
      throw error;
    }
    return data;
  } catch (error) {
    console.error('Error fetching customer:', error.message);
    throw error;
  }
}

export async function getCustomers() {
  try {
    const { data, error } = await supabase
      .from('customers')
      .select('*');

    if (error) {
      throw error;
    }
    return data;
  } catch (error) {
    console.error('Error fetching customers:', error.message);
    throw error;
  }
}

export async function updateCustomer(customerId, updates) {
  try {
    const { data, error } = await supabase
      .from('customers')
      .update(updates)
      .eq('customer_id', customerId);

    if (error) {
      throw error;
    }
    return data;
  } catch (error) {
    console.error('Error updating customer:', error.message);
    throw error;
  }
}

export async function deleteCustomer(customerId) {
  try {
    const { data, error } = await supabase
      .from('customers')
      .delete()
      .eq('customer_id', customerId);

    if (error) {
      throw error;
    }
    return data;
  } catch (error) {
    console.error('Error deleting customer:', error.message);
    throw error;
  }
}

export async function addOrder(orderData) {
  try {
    const { data, error } = await supabase
      .from('orders')
      .insert([orderData])
      .select();

    if (error) {
      throw error;
    }
    return { data, error: null };
  } catch (error) {
    console.error('Error adding order:', error.message);
    return { data: null, error };
  }
}

// Email logging functions
export async function logEmail(emailData) {
  try {
    const { data, error } = await supabase
      .from('email_logs')
      .insert([emailData])
      .select();

    if (error) {
      throw error;
    }
    return { data, error: null };
  } catch (error) {
    console.error('Error logging email:', error.message);
    return { data: null, error };
  }
}

export async function updateEmailStatus(emailLogId, status, errorMessage = null) {
  try {
    const updateData = {
      status: status,
      delivered_at: status === 'delivered' ? new Date().toISOString() : null,
      error_message: errorMessage
    };

    const { data, error } = await supabase
      .from('email_logs')
      .update(updateData)
      .eq('log_id', emailLogId);

    if (error) {
      throw error;
    }
    return { data, error: null };
  } catch (error) {
    console.error('Error updating email status:', error.message);
    return { data: null, error };
  }
}

export async function getEmailStatusByOrder(orderNumber) {
  try {
    const { data, error } = await supabase
      .from('email_logs')
      .select('*')
      .eq('order_number', orderNumber)
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      throw error;
    }
    return data?.[0] || null;
  } catch (error) {
    console.error('Error fetching email status:', error.message);
    return null;
  }
}


// ✅ OPTIMIZED: Efficient function to get customers with orders (fixes N+1 query)
export async function getCustomersWithOrders() {
  try {
    // Get all customers with computed payment status (1 query)
    // Using direct table query as fallback for missing RPC function
    const { data: customers, error: customerError } = await supabase
      .from('customers')
      .select('customer_id, full_name, email_address, phone_number, payment_status, created_at, updated_at, ip_address, user_agent, notes')
      .order('created_at', { ascending: false });

    if (customerError) {
      throw customerError;
    }

    if (!customers || customers.length === 0) {
      return { data: [], error: null };
    }

    // Extract customer IDs for batch query
    const customerIds = customers.map(c => c.customer_id);

    // ✅ OPTIMIZED: Single batch query for ALL orders (1 query instead of N)
    const { data: orders, error: orderError } = await supabase
      .from('orders')
      .select('customer_id, order_number, total_amount, created_at, order_status')  // Correct column names
      .in('customer_id', customerIds)
      .order('customer_id, created_at', { ascending: false });  // Efficient ordering

    if (orderError) {
      throw orderError;
    }

    // ✅ OPTIMIZED: Use Map for better performance on large datasets
    const ordersByCustomer = new Map();
    orders?.forEach(order => {
      if (!ordersByCustomer.has(order.customer_id)) {
        ordersByCustomer.set(order.customer_id, []);
      }
      ordersByCustomer.get(order.customer_id).push(order);
    });

    // Enhance customers with their orders and computed fields
    const enhancedCustomers = customers.map(customer => {
      const customerOrders = ordersByCustomer.get(customer.customer_id) || [];
      const totalAmount = customerOrders.reduce((sum, order) => sum + (parseFloat(order.total_amount) || 0), 0);
      
      // Use the latest order's amount (first in array due to desc ordering)
      const finalAmount = customer.payment_status === 'paid' && customerOrders.length > 0 
        ? parseFloat(customerOrders[0].total_amount) || 197.00 
        : 0;

      return {
        ...customer,
        latest_order_number: customerOrders.length > 0 ? customerOrders[0].order_number : null,
        latest_order_total: finalAmount,
        order_count: customerOrders.length,
        orders: customerOrders
      };
    });

    return { data: enhancedCustomers, error: null };
  } catch (error) {
    console.error('Error fetching customers with orders:', error.message);
    return { data: null, error };
  }
}

// ✅ ATOMIC: Transaction-safe customer update with payment status and notes
export async function updateCustomerAtomic(logger, customerId, updates) {
  try {
    // Use Supabase RPC function for atomic update
    const { data, error } = await supabase.rpc('update_customer_atomic', {
      p_customer_id: customerId,
      p_notes: updates.notes || null,
      p_payment_status: updates.payment_status || null,
      p_order_number: updates.order_number || null,
      p_admin_override: updates.admin_override || false
    });

    if (error) {
      console.error('Atomic customer update failed:', { 
        customerId, 
        error: error.message,
        updateFields: Object.keys(updates)
      });
      throw error;
    }

    if (logger) {
      logger.info({ customerId, updatedFields: Object.keys(updates) }, 'Atomic customer update successful');
    }

    return { data, error: null };

  } catch (error) {
    console.error('Error in updateCustomerAtomic:', error);
    return { data: null, error };
  }
}

// Get email status for multiple customers efficiently
export async function getEmailStatusForCustomers(customerIds) {
  if (!customerIds || customerIds.length === 0) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('email_logs')
      .select('customer_id, status, sent_at')
      .in('customer_id', customerIds)
      .order('sent_at', { ascending: false });

    if (error) {
      console.error('Error fetching email statuses:', error);
      return [];
    }

    // Group by customer_id and get the latest status for each
    const statusMap = new Map();
    data?.forEach(log => {
      if (!statusMap.has(log.customer_id)) {
        statusMap.set(log.customer_id, {
          customer_id: log.customer_id,
          delivery_status: log.status,
          last_sent_at: log.sent_at,
          delivery_count: 1
        });
      } else {
        statusMap.get(log.customer_id).delivery_count++;
      }
    });

    return Array.from(statusMap.values());
  } catch (error) {
    console.error('Error in getEmailStatusForCustomers:', error);
    return [];
  }
}