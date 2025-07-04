import { supabase } from "../../../lib/supabase";
import { requireAuth } from "../../../lib/adminAuth";

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    // Get today's date range
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const todayEnd = new Date(todayStart);
    todayEnd.setDate(todayEnd.getDate() + 1);

    // Get total customers count
    const { count: totalCustomers, error: totalCustomersError } = await supabase
      .from('customers')
      .select('*', { count: 'exact', head: true });

    if (totalCustomersError) {
      console.error('Error fetching total customers:', totalCustomersError);
      throw totalCustomersError;
    }

    // Get today's customers count
    const { count: todayCustomers, error: todayCustomersError } = await supabase
      .from('customers')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', todayStart.toISOString())
      .lt('created_at', todayEnd.toISOString());

    if (todayCustomersError) {
      console.error('Error fetching today customers:', todayCustomersError);
      throw todayCustomersError;
    }

    // Get paid customers for revenue calculation
    const { data: paidCustomers, error: paidCustomersError } = await supabase
      .from('customers')
      .select('created_at')
      .eq('payment_status', 'paid');

    if (paidCustomersError) {
      console.error('Error fetching paid customers:', paidCustomersError);
      throw paidCustomersError;
    }

    // Calculate total revenue (assuming fixed price of RM 99.00)
    const PRODUCT_PRICE = 99.00;
    const totalRevenue = paidCustomers.length * PRODUCT_PRICE;

    // Calculate today's revenue
    const todayPaidCustomers = paidCustomers.filter(customer => {
      const customerDate = new Date(customer.created_at);
      return customerDate >= todayStart && customerDate < todayEnd;
    });
    const todayRevenue = todayPaidCustomers.length * PRODUCT_PRICE;

    // Get recent customers (last 10 paid customers)
    const { data: recentCustomers, error: recentCustomersError } = await supabase
      .from('customers')
      .select('full_name, email_address, created_at, payment_status')
      .eq('payment_status', 'paid')
      .order('created_at', { ascending: false })
      .limit(10);

    if (recentCustomersError) {
      console.error('Error fetching recent customers:', recentCustomersError);
      throw recentCustomersError;
    }

    // Get payment status breakdown
    const { data: statusBreakdown, error: statusBreakdownError } = await supabase
      .from('customers')
      .select('payment_status')
      .not('payment_status', 'is', null);

    if (statusBreakdownError) {
      console.error('Error fetching status breakdown:', statusBreakdownError);
      throw statusBreakdownError;
    }

    // Count by status
    const statusCounts = statusBreakdown.reduce((acc, customer) => {
      acc[customer.payment_status] = (acc[customer.payment_status] || 0) + 1;
      return acc;
    }, {});

    // Get conversion rate
    const conversionRate = totalCustomers > 0 ? ((paidCustomers.length / totalCustomers) * 100).toFixed(2) : 0;

    // Format recent customers for display
    const formattedRecentCustomers = recentCustomers.map(customer => ({
      name: customer.full_name,
      email: customer.email_address,
      amount: PRODUCT_PRICE,
      time: getRelativeTime(customer.created_at)
    }));

    // Calculate week-over-week growth
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const { count: lastWeekCustomers, error: lastWeekError } = await supabase
      .from('customers')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', weekAgo.toISOString())
      .lt('created_at', todayStart.toISOString());

    if (lastWeekError) {
      console.error('Error fetching last week customers:', lastWeekError);
    }

    const weeklyGrowth = lastWeekCustomers > 0 ? 
      (((todayCustomers - lastWeekCustomers) / lastWeekCustomers) * 100).toFixed(1) : 0;

    const dashboardData = {
      totalCustomers: totalCustomers || 0,
      todayCustomers: todayCustomers || 0,
      totalRevenue: parseFloat(totalRevenue.toFixed(2)),
      todayRevenue: parseFloat(todayRevenue.toFixed(2)),
      conversionRate: parseFloat(conversionRate),
      weeklyGrowth: parseFloat(weeklyGrowth),
      recentCustomers: formattedRecentCustomers,
      statusBreakdown: {
        paid: statusCounts.paid || 0,
        pending: statusCounts.pending || 0,
        failed: statusCounts.failed || 0
      },
      averageOrderValue: PRODUCT_PRICE
    };

    res.status(200).json({
      success: true,
      data: dashboardData
    });

  } catch (error) {
    console.error('Dashboard API error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal Server Error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// Helper function to get relative time
function getRelativeTime(dateString) {
  const now = new Date();
  const date = new Date(dateString);
  const diffInMinutes = Math.floor((now - date) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hours ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays} days ago`;
  
  return date.toLocaleDateString('en-MY');
}

export default requireAuth(handler);