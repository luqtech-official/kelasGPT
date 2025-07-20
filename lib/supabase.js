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

// --- Analytics Functions ---

/**
 * Fetches page view statistics for the dashboard.
 * Queries the analytics_current view for unified data.
 * @returns {Promise<object>} Dashboard-ready metrics.
 */
export async function getPageViewStats() {
  
  try {
    const { data, error } = await supabase
      .from('analytics_current')
      .select('*')
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching page view stats:', error);
      throw error;
    }

    const todayISO = new Date().toISOString().slice(0, 10);

    // data.forEach(d => {
    //   console.log(`Comparing d.date: '${d.date}' to todayISO: '${todayISO}'`);
    //   console.log('Is equal?', d.date === todayISO);
    // });

    const todayStats = data.find(d => d.date === todayISO) || {
      landing_total_visits: 0,
      landing_unique_visitors: 0,
      checkout_total_visits: 0,
      checkout_unique_visitors: 0,
      conversion_rate: 0
    };

    return {
      today: {
        landingVisits: todayStats.landing_total_visits,
        landingUniqueVisitors: todayStats.landing_unique_visitors,
        checkoutVisits: todayStats.checkout_total_visits,
        checkoutUniqueVisitors: todayStats.checkout_unique_visitors,
        conversionRate: todayStats.conversion_rate
      },
      trends: data
    };
  } catch (error) {
    return { today: {}, trends: [] };
  }
}

/**
 * Fetches daily page view data for trends.
 * @param {number} days - The number of days to fetch.
 * @returns {Promise<Array>} An array of daily page view data.
 */
export async function getDailyPageViews(days = 7) {
  try {
    const { data, error } = await supabase
      .from('analytics_current')
      .select('*')
      .order('date', { ascending: false })
      .limit(days);

    if (error) {
      console.error('Error fetching daily page views:', error);
      throw error;
    }
    return data;
  } catch (error) {
    return [];
  }
}

// --- NEW DASHBOARD ANALYTICS FUNCTIONS ---

/**
 * Fetches daily revenue data for the past N days for chart visualization.
 * @param {number} days - Number of days to fetch (default 7)
 * @returns {Promise<Array>} Array of daily revenue data
 */
export async function getDailyRevenueStats(days = 7) {
  try {
    // Calculate date range - include today (using Malaysia timezone)
    const today = new Date();
    console.log(`Today's date: ${today.toLocaleDateString('en-MY')} (${today.toLocaleDateString('en-MY', { weekday: 'long' })})`);
    console.log(`Today's ISO: ${today.toISOString()}`);
    
    const endDate = new Date(today);
    endDate.setDate(endDate.getDate() + 1); // Tomorrow to include today
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - (days - 1)); // Include today in count

    // Get paid customers within date range
    const { data: paidCustomers, error } = await supabase
      .from('customers')
      .select('created_at')
      .eq('payment_status', 'paid')
      .gte('created_at', startDate.toISOString())
      .lt('created_at', endDate.toISOString())
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching daily revenue stats:', error);
      return [];
    }

    // Get orders for amount data - only paid orders for confirmed revenue
    const { data: orders, error: orderError } = await supabase
      .from('orders')
      .select('total_amount, created_at, order_status')
      .eq('order_status', 'paid')
      .gte('created_at', startDate.toISOString())
      .lt('created_at', endDate.toISOString());

    if (orderError) {
      console.error('Error fetching orders for revenue:', orderError);
    }

    // Create daily revenue map
    const dailyRevenue = {};
    
    // Initialize all days with 0 (including today)
    // Create dates from oldest to newest to ensure proper order
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today); // Use consistent base date
      date.setDate(date.getDate() - i);
      
      // Use local date format to avoid timezone issues
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dateKey = `${year}-${month}-${day}`;
      
      dailyRevenue[dateKey] = 0;
      
      // Debug: Log the dates being created
      const dayName = date.toLocaleDateString('en-MY', { weekday: 'long' });
      const isToday = i === 0 ? ' (TODAY)' : '';
      console.log(`Day ${days - 1 - i}: ${dateKey} (${dayName}${isToday})`);
      console.log(`  - Date calculation: today minus ${i} days = ${date.toLocaleDateString('en-MY')}`);
    }

    // Sum revenue by day from orders (more accurate)
    orders?.forEach(order => {
      const dateKey = order.created_at.slice(0, 10);
      if (dailyRevenue.hasOwnProperty(dateKey)) {
        dailyRevenue[dateKey] += parseFloat(order.total_amount) || 0;
      }
    });

    // Convert to array format for chart (chronological order)
    const result = Object.entries(dailyRevenue)
      .map(([date, revenue]) => {
        const dateObj = new Date(date + 'T00:00:00'); // Force local timezone
        const dayShort = dateObj.toLocaleDateString('en-US', { weekday: 'short' }); // Use en-US for consistent day names
        return {
          date,
          revenue: parseFloat(revenue.toFixed(2)),
          day: dayShort
        };
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    // Debug: Log the final result order
    console.log('Final chart data order:');
    result.forEach((item, index) => {
      console.log(`${index}: ${item.date} (${item.day}) - RM${item.revenue}`);
    });

    return result;
  } catch (error) {
    console.error('Error in getDailyRevenueStats:', error);
    return [];
  }
}

/**
 * Fetches monthly revenue comparison (current month vs previous month).
 * @returns {Promise<Object>} Monthly revenue comparison data
 */
export async function getMonthlyRevenueComparison() {
  try {
    const now = new Date();
    
    // Current month dates
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    
    // Previous month dates
    const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 1);

    // Get current month revenue - only paid orders for confirmed revenue
    const { data: currentMonthOrders, error: currentError } = await supabase
      .from('orders')
      .select('total_amount, order_status')
      .eq('order_status', 'paid')
      .gte('created_at', currentMonthStart.toISOString())
      .lt('created_at', currentMonthEnd.toISOString());

    if (currentError) {
      console.error('Error fetching current month revenue:', currentError);
    }

    // Get previous month revenue - only paid orders for confirmed revenue
    const { data: previousMonthOrders, error: previousError } = await supabase
      .from('orders')
      .select('total_amount, order_status')
      .eq('order_status', 'paid')
      .gte('created_at', previousMonthStart.toISOString())
      .lt('created_at', previousMonthEnd.toISOString());

    if (previousError) {
      console.error('Error fetching previous month revenue:', previousError);
    }

    // Calculate totals
    const currentMonthRevenue = currentMonthOrders?.reduce((sum, order) => 
      sum + (parseFloat(order.total_amount) || 0), 0) || 0;
    
    const previousMonthRevenue = previousMonthOrders?.reduce((sum, order) => 
      sum + (parseFloat(order.total_amount) || 0), 0) || 0;

    // Calculate percentage change
    let percentageChange = 0;
    if (previousMonthRevenue > 0) {
      percentageChange = ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100;
    } else if (currentMonthRevenue > 0) {
      percentageChange = 100; // First month with revenue
    }

    return {
      currentMonth: parseFloat(currentMonthRevenue.toFixed(2)),
      previousMonth: parseFloat(previousMonthRevenue.toFixed(2)),
      percentageChange: parseFloat(percentageChange.toFixed(1)),
      monthName: now.toLocaleDateString('en-MY', { month: 'long', year: 'numeric' })
    };
  } catch (error) {
    console.error('Error in getMonthlyRevenueComparison:', error);
    return {
      currentMonth: 0,
      previousMonth: 0,
      percentageChange: 0,
      monthName: ''
    };
  }
}

/**
 * Fetches recent orders with all payment statuses for dashboard table.
 * @param {number} limit - Number of recent orders to fetch (default 10)
 * @returns {Promise<Array>} Array of recent orders with customer details
 */
export async function getRecentOrdersAllStatuses(limit = 10) {
  try {
    // Get recent customers with their orders, regardless of payment status
    const { data: customers, error } = await supabase
      .from('customers')
      .select(`
        customer_id,
        full_name,
        email_address,
        payment_status,
        created_at,
        orders (
          order_number,
          total_amount,
          created_at
        )
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching recent orders:', error);
      return [];
    }

    // Format for dashboard display
    const formattedOrders = customers?.map(customer => {
      const latestOrder = customer.orders?.[0];
      
      return {
        customerName: customer.full_name,
        customerEmail: customer.email_address,
        paymentStatus: customer.payment_status,
        orderNumber: latestOrder?.order_number || 'N/A',
        amount: latestOrder?.total_amount || 0,
        timeElapsed: getRelativeTimeForOrder(customer.created_at),
        createdAt: customer.created_at
      };
    }) || [];

    return formattedOrders;
  } catch (error) {
    console.error('Error in getRecentOrdersAllStatuses:', error);
    return [];
  }
}

/**
 * Helper function to get relative time for orders display.
 * @param {string} dateString - ISO date string
 * @returns {string} Human-readable relative time
 */
function getRelativeTimeForOrder(dateString) {
  const now = new Date();
  const date = new Date(dateString);
  const diffInMinutes = Math.floor((now - date) / (1000 * 60));
  
  // Format detailed time (12-hour format with AM/PM)
  const timeOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Kuala_Lumpur'
  };
  
  const detailedTime = date.toLocaleString('en-MY', timeOptions);
  
  // Get relative time
  let relativeTime;
  if (diffInMinutes < 1) relativeTime = 'Just now';
  else if (diffInMinutes < 60) relativeTime = `${diffInMinutes}m ago`;
  else if (diffInMinutes < 1440) relativeTime = `${Math.floor(diffInMinutes / 60)}h ago`;
  else relativeTime = `${Math.floor(diffInMinutes / 1440)}d ago`;
  
  return `${relativeTime} • ${detailedTime}`;
}