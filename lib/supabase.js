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
