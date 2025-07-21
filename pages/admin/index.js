import { useState, useEffect, useRef } from 'react';
import AdminLayout from '@/components/AdminLayout';
import styles from '@/styles/Admin.module.css';

// Swiper imports
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

// Chart.js imports
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    // Existing data structure maintained for compatibility
    totalCustomers: 0,
    todayCustomers: 0,
    totalRevenue: 0,
    todayRevenue: 0,
    recentCustomers: [],
    pageViews: { today: {} },
    // New data for redesigned dashboard
    dailyRevenueChart: [],
    monthlyRevenueComparison: {},
    recentOrdersAllStatuses: []
  });
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/dashboard');
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setStats(result.data);
      } else {
        throw new Error(result.message || 'Failed to fetch dashboard data');
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  // Calculate metrics for the new cards
  const calculateMetrics = () => {
    const todayPageViews = stats.pageViews?.today?.landingUniqueVisitors || 0;
    const todayTotalVisitors = stats.pageViews?.today?.landingVisits || 0;
    const todayCheckoutViews = stats.pageViews?.today?.checkoutUniqueVisitors || 0;
    
    // Sales CTR = (checkout page unique visitor / sales page unique visitor) * 100
    const salesCTR = todayPageViews > 0 ? ((todayCheckoutViews / todayPageViews) * 100).toFixed(1) : 0;
    
    // Conversion Rate = (Successful Purchased Customer / sales page unique visitor) * 100
    const conversionRate = todayPageViews > 0 ? ((stats.todayCustomers / todayPageViews) * 100).toFixed(1) : 0;
    
    // Yesterday revenue comparison
    const yesterdayRevenue = stats.dailyRevenueChart?.length >= 2 ? stats.dailyRevenueChart[stats.dailyRevenueChart.length - 2]?.revenue || 0 : 0;
    const todayRevenueChange = yesterdayRevenue > 0 ? (((stats.todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100).toFixed(1) : 0;

    return {
      todayPageViews,
      todayTotalVisitors,
      todayCheckoutViews,
      todayRevenue: stats.todayRevenue,
      yesterdayRevenue,
      todayRevenueChange,
      conversionRate,
      salesCTR,
      monthlyRevenue: stats.monthlyRevenueComparison?.currentMonth || 0,
      monthlyRevenueChange: stats.monthlyRevenueComparison?.percentageChange || 0,
      previousMonthRevenue: stats.monthlyRevenueComparison?.previousMonth || 0
    };
  };

  const metrics = calculateMetrics();

  // Format current date and time
  const formatDateTime = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const day = days[currentTime.getDay()];
    const date = currentTime.getDate().toString().padStart(2, '0');
    const month = months[currentTime.getMonth()];
    const year = currentTime.getFullYear();
    
    let hours = currentTime.getHours();
    const minutes = currentTime.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    const hoursStr = hours.toString().padStart(2, '0');
    
    return `${day}, ${date} ${month} ${year} - ${hoursStr}:${minutes} ${ampm}`;
  };

  // Chart configuration
  const chartData = {
    labels: stats.dailyRevenueChart?.map(day => day.day) || [],
    datasets: [
      {
        label: 'Daily Revenue (RM)',
        data: stats.dailyRevenueChart?.map(day => day.revenue) || [],
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 3,
        pointBackgroundColor: '#3b82f6',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
        fill: true,
        tension: 0.4
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        titleColor: '#f9fafb',
        bodyColor: '#f9fafb',
        borderColor: '#374151',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          label: function(context) {
            return `RM ${context.parsed.y.toFixed(2)}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 11,
            weight: '500'
          }
        }
      },
      y: {
        grid: {
          color: 'rgba(107, 114, 128, 0.1)',
          borderDash: [5, 5]
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 11,
            weight: '500'
          },
          callback: function(value) {
            return `RM ${value}`;
          }
        }
      }
    },
    elements: {
      point: {
        hoverBackgroundColor: '#3b82f6'
      }
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Admin Dashboard">
        <div className={styles.loading}>
          <div className={styles.loadingSpinner}></div>
          Loading dashboard analytics...
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Admin Dashboard">
      <div className={styles.newDashboardContainer}>
        
        {/* Header */}
        <div className={styles.newDashboardHeader}>
          <h1 className={styles.newTitle}>Today&apos;s Analytics</h1>
          <p className={styles.newSubtitle}>Real-time Business Insights</p>
          <p className={styles.newTimeDisplay}>{formatDateTime()}</p>
        </div>

        {/* Part 1: Main Cards Grid */}
        <div className={styles.cardsSection}>
          <div className={styles.cardsGrid}>
            <div className={styles.newMetricCard}>
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>Page Views</h3>
                <div className={styles.cardIcon}>👁️</div>
              </div>
              <div className={styles.cardValue}>{metrics.todayPageViews.toLocaleString()}</div>
              <div className={styles.cardSubtext}>
                <div>Today&apos;s unique visitors</div>
                <div>({metrics.todayTotalVisitors.toLocaleString()} total visits)</div>
              </div>
            </div>

            <div className={styles.newMetricCard}>
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>Conversion Rate</h3>
                <div className={styles.cardIcon}>📈</div>
              </div>
              <div className={styles.cardValue}>{metrics.conversionRate}%</div>
              <div className={styles.cardSubtext}>
                <div>CTR: {metrics.salesCTR}%</div>
                <div>({metrics.todayCheckoutViews} unique checkouts)</div>
              </div>
            </div>

            <div className={styles.newMetricCard}>
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>Revenue</h3>
                <div className={styles.cardIcon}>💰</div>
              </div>
              <div className={styles.cardValue}>RM {metrics.todayRevenue.toFixed(2)}</div>
              <div className={styles.cardSubtext}>
                <div>
                  <span className={metrics.todayRevenueChange >= 0 ? styles.positiveChange : styles.negativeChange}>
                    {metrics.todayRevenueChange >= 0 ? '↗' : '↘'} {Math.abs(metrics.todayRevenueChange)}%
                  </span>
                  {' '}vs yesterday
                </div>
                <div>(Yesterday: RM {metrics.yesterdayRevenue.toFixed(2)})</div>
              </div>
            </div>

            <div className={styles.newMetricCard}>
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>Monthly Revenue</h3>
                <div className={styles.cardIcon}>📊</div>
              </div>
              <div className={styles.cardValue}>RM {metrics.monthlyRevenue.toFixed(2)}</div>
              <div className={styles.cardSubtext}>
                <div>
                  <span className={metrics.monthlyRevenueChange >= 0 ? styles.positiveChange : styles.negativeChange}>
                    {metrics.monthlyRevenueChange >= 0 ? '↗' : '↘'} {Math.abs(metrics.monthlyRevenueChange)}%
                  </span>
                  {' '}vs last month
                </div>
                <div>(Last month: RM {metrics.previousMonthRevenue.toFixed(2)})</div>
              </div>
            </div>
          </div>
        </div>

        {/* Part 2: Revenue Performance Graph */}
        <div className={styles.chartSection}>
          <div className={styles.chartContainer}>
            <div className={styles.chartHeader}>
              <h2 className={styles.chartTitle}>Revenue Performance</h2>
              <p className={styles.chartSubtitle}>Past 7 days confirmed revenue</p>
            </div>
            <div className={styles.chartWrapper}>
              <Line data={chartData} options={chartOptions} />
            </div>
            
            {/* 7 Days Revenue Summary */}
            <div className={styles.chartSummary}>
              <div className={styles.summaryCard}>
                <div className={styles.summaryLabel}>7 Days Revenue</div>
                <div className={styles.summaryValue}>
                  RM {(stats.dailyRevenueChart?.reduce((sum, day) => sum + (day.revenue || 0), 0) || 0).toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Part 3: Recent Orders Table */}
        <div className={styles.tableSection}>
          <div className={styles.tableContainer}>
            <div className={styles.tableHeader}>
              <h2 className={styles.tableTitle}>Recent Orders</h2>
              <p className={styles.tableSubtitle}>Latest 10 order activities</p>
            </div>
            
            <div className={styles.tableWrapper}>
              <table className={styles.newTable}>
                <thead>
                  <tr className={styles.tableHeadRow}>
                    <th className={styles.tableHeadCell}>Customer</th>
                    <th className={styles.tableHeadCell}>Status</th>
                    <th className={styles.tableHeadCell}>Time Created</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentOrdersAllStatuses?.length > 0 ? (
                    stats.recentOrdersAllStatuses.map((order, index) => (
                      <tr key={index} className={styles.tableBodyRow}>
                        <td className={styles.tableBodyCell}>
                          <div className={styles.customerInfo}>
                            <div className={styles.customerName}>{order.customerName}</div>
                            <div className={styles.customerEmail}>{order.customerEmail}</div>
                          </div>
                        </td>
                        <td className={styles.tableBodyCell}>
                          <div className={styles.statusInfo}>
                            <span className={`${styles.statusBadge} ${styles[order.paymentStatus]}`}>
                              {order.paymentStatus}
                            </span>
                            <div className={styles.orderNumber}>#{order.orderNumber}</div>
                          </div>
                        </td>
                        <td className={styles.tableBodyCell}>
                          <div className={styles.timeInfo}>
                            {order.timeElapsed.includes('•') ? (
                              <>
                                <div>{order.timeElapsed.split(' • ')[0]}</div>
                                <div>{order.timeElapsed.split(' • ')[1]}</div>
                              </>
                            ) : (
                              <div>{order.timeElapsed}</div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className={styles.emptyState}>
                        No recent orders to display
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Refresh Button */}
        <div className={styles.refreshSection}>
          <button 
            onClick={fetchDashboardData}
            className={styles.newRefreshButton}
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh Analytics
          </button>
        </div>

      </div>
    </AdminLayout>
  );
}