import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

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
      .eq('id', emailLogId);

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

export async function getEmailStatusForCustomers(customerIds) {
  try {
    const { data, error } = await supabase
      .from('email_logs')
      .select(`
        id,
        email_type,
        recipient_email,
        order_number,
        status,
        created_at,
        delivered_at,
        error_message
      `)
      .in('recipient_email', customerIds.map(c => c.email_address))
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    // Group by recipient email and get the latest email for each
    const emailStatusMap = {};
    data?.forEach(email => {
      if (!emailStatusMap[email.recipient_email]) {
        emailStatusMap[email.recipient_email] = email;
      }
    });

    return emailStatusMap;
  } catch (error) {
    console.error('Error fetching email statuses:', error.message);
    return {};
  }
}
