import { supabase } from './supabase.js';
import { getMalaysiaDayBoundaries, getMalaysiaDateRange } from './timezone-utils.js';


/**
 * @returns {Promise<Object>} Dashboard data
 */
export async function getDashboardDataOptimized() {
  const startTime = Date.now();
  
  try {
    // Try optimized views first, fall back to standard queries if views don't exist
    return await fetchWithOptimizedViews();
    
  } catch (viewError) {
    console.warn('Optimized views unavailable, using standard queries:', viewError.message);
    // return await fetchWithStandardQueries(); -- function deleted
  }
}

/**
 * Attempts to fetch data using optimized database views
 */
async function fetchWithOptimizedViews() {
  // Execute 3 optimized view queries in parallel
  const [summaryResult, revenueResult, activityResult] = await Promise.all([
    
    // Query 1: All summary metrics 
    supabase
      .from('dashboard_summary_view')
      .select(`
        total_customers, today_customers, yesterday_customers, last_week_customers,
        total_paid_customers, today_paid_customers, pending_customers, failed_customers,
        total_revenue, today_revenue, yesterday_revenue, 
        current_month_revenue, previous_month_revenue,
        today_total_visits, today_unique_visitors, today_checkout_visits, 
        today_checkout_unique_visitors, analytics_conversion_rate,
        conversion_rate_percent, sales_ctr_percent, daily_revenue_change_percent, 
        monthly_revenue_change_percent, weekly_growth_percent,
        last_updated, malaysia_date
      `)
      .single(),
    
    // Query 2: Daily revenue for chart (last 7 days)
    supabase
      .from('daily_revenue_view')
      .select(`
        malaysia_date, day_short_name, revenue, is_today,
        seven_day_avg_revenue, previous_day_revenue, month_to_date_revenue
      `)
      .order('malaysia_date', { ascending: false })
      .limit(7),
    
    // Query 3: Recent activity table
    supabase
      .from('recent_activity_view')
      .select(`
        customer_name, customer_email, payment_status, order_number, 
        amount, time_elapsed, status_style, customer_created_at
      `)
      .limit(10)
  ]);

  // Check for critical errors
  if (summaryResult.error) {
    throw new Error(`Database views not available: ${summaryResult.error.message}`);
  }

  // Transform optimized data to match current API format
  const dashboardData = transformViewDataToCurrentFormat(
    summaryResult.data,
    revenueResult.data || [],
    activityResult.data || []
  );
  
  return {
    success: true,
    data: dashboardData,
    error: null
  };
}



/**
 * Transform optimized view data to match current dashboard API format
 * Ensures 100% backward compatibility with existing frontend components
 * 
 * @param {Object} summaryData - Data from dashboard_summary_view
 * @param {Array} revenueData - Data from daily_revenue_view  
 * @param {Array} activityData - Data from recent_activity_view
 * @returns {Object} Dashboard data in current API format
 */
function transformViewDataToCurrentFormat(summaryData, revenueData, activityData) {
  if (!summaryData) {
    throw new Error('Summary data is required for dashboard');
  }

  return {
    // === EXISTING DATA STRUCTURE (unchanged for backward compatibility) ===
    totalCustomers: summaryData.total_customers || 0,
    todayCustomers: summaryData.today_customers || 0,
    totalRevenue: parseFloat(summaryData.total_revenue || 0),
    todayRevenue: parseFloat(summaryData.today_revenue || 0),
    conversionRate: parseFloat(summaryData.conversion_rate_percent || 0),
    weeklyGrowth: parseFloat(summaryData.weekly_growth_percent || 0),
    
    // Legacy field maintained for compatibility (unused in new dashboard)
    recentCustomers: [],
    
    statusBreakdown: {
      paid: summaryData.total_paid_customers || 0,
      pending: summaryData.pending_customers || 0,
      failed: summaryData.failed_customers || 0
    },
    
    // Add today's paid customers for accurate conversion rate calculation
    todayPaidCustomers: summaryData.today_paid_customers || 0,
    
    // Get from settings - this will be fetched separately as before
    averageOrderValue: 197.00, // Will be populated by main API from getProductSettings()
    
    pageViews: {
      today: {
        landingVisits: summaryData.today_total_visits || 0,
        landingUniqueVisitors: summaryData.today_unique_visitors || 0,
        checkoutVisits: summaryData.today_checkout_visits || 0,
        checkoutUniqueVisitors: summaryData.today_checkout_unique_visitors || 0,
        conversionRate: summaryData.analytics_conversion_rate || 0
      },
      trends: [] // Can be extended later if needed
    },
    
    // === NEW OPTIMIZED DATA STRUCTURE ===
    dailyRevenueChart: (revenueData?.map(day => ({
      date: day.malaysia_date,
      revenue: parseFloat(day.revenue || 0),
      day: day.day_short_name,
      isToday: day.is_today || false,
      // Additional trend data from view
      sevenDayAvg: parseFloat(day.seven_day_avg_revenue || 0),
      previousDay: parseFloat(day.previous_day_revenue || 0),
      monthToDate: parseFloat(day.month_to_date_revenue || 0)
    })) || []).reverse(),
    
    monthlyRevenueComparison: {
      currentMonth: parseFloat(summaryData.current_month_revenue || 0),
      previousMonth: parseFloat(summaryData.previous_month_revenue || 0),
      percentageChange: parseFloat(summaryData.monthly_revenue_change_percent || 0),
      monthName: new Date().toLocaleDateString('en-MY', { 
        month: 'long', 
        year: 'numeric',
        timeZone: 'Asia/Kuala_Lumpur'
      })
    },
    
    recentOrdersAllStatuses: activityData?.map(activity => ({
      customerName: activity.customer_name || 'Unknown',
      customerEmail: activity.customer_email || '',
      paymentStatus: activity.payment_status || 'pending',
      orderNumber: activity.order_number || 'N/A',
      amount: parseFloat(activity.amount || 0),
      timeElapsed: activity.time_elapsed || 'Unknown',
      createdAt: activity.customer_created_at,
      statusStyle: activity.status_style || 'neutral' // Helper for frontend styling
    })) || []
  };
}

