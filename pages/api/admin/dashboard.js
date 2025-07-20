import { supabase, getPageViewStats, getDailyRevenueStats, getMonthlyRevenueComparison, getRecentOrdersAllStatuses } from "../../../lib/supabase";
import { requireAuth } from "../../../lib/adminAuth";
import { getProductSettings } from "../../../lib/settings";

async function handler(req, res) {
  
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    // Get product settings for accurate pricing
    const productSettings = await getProductSettings();
    const PRODUCT_PRICE = productSettings.productPrice;

    // Get page view stats from the new function
    const pageViewStats = await getPageViewStats();

    // Get new dashboard data for redesigned interface
    const [dailyRevenueStats, monthlyRevenue, recentOrdersAll] = await Promise.all([
      getDailyRevenueStats(7),
      getMonthlyRevenueComparison(),
      getRecentOrdersAllStatuses(10)
    ]);

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

    // Get paid orders for confirmed revenue calculation
    const { data: paidOrders, error: paidOrdersError } = await supabase
      .from('orders')
      .select('total_amount, created_at')
      .eq('order_status', 'paid');

    if (paidOrdersError) {
      console.error('Error fetching paid orders:', paidOrdersError);
      throw paidOrdersError;
    }

    // Calculate total confirmed revenue from paid orders
    const totalRevenue = paidOrders?.reduce((sum, order) => 
      sum + (parseFloat(order.total_amount) || 0), 0) || 0;

    // Calculate today's confirmed revenue from paid orders
    const todayPaidOrders = paidOrders?.filter(order => {
      const orderDate = new Date(order.created_at);
      return orderDate >= todayStart && orderDate < todayEnd;
    }) || [];
    
    const todayRevenue = todayPaidOrders.reduce((sum, order) => 
      sum + (parseFloat(order.total_amount) || 0), 0);

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

    // Get paid customers count for conversion rate calculation
    const { data: paidCustomers, error: paidCustomersError } = await supabase
      .from('customers')
      .select('created_at')
      .eq('payment_status', 'paid');

    if (paidCustomersError) {
      console.error('Error fetching paid customers for conversion:', paidCustomersError);
    }

    // Get conversion rate
    const conversionRate = totalCustomers > 0 ? (((paidCustomers?.length || 0) / totalCustomers) * 100).toFixed(2) : 0;

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
      averageOrderValue: PRODUCT_PRICE,
      pageViews: pageViewStats,
      // New data for redesigned dashboard
      dailyRevenueChart: dailyRevenueStats,
      monthlyRevenueComparison: monthlyRevenue,
      recentOrdersAllStatuses: recentOrdersAll
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

// Helper function to get detailed time with relative info
function getRelativeTime(dateString) {
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

export default requireAuth(handler);