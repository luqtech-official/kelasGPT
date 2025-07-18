import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import styles from '@/styles/Admin.module.css';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalCustomers: 0,
    todayCustomers: 0,
    totalRevenue: 0,
    todayRevenue: 0,
    recentCustomers: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
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
      setStats({
        totalCustomers: 0,
        todayCustomers: 0,
        totalRevenue: 0,
        todayRevenue: 0,
        recentCustomers: []
      });
      setLoading(false);
    }
  };

  return (
    <AdminLayout title="Admin Dashboard">
      <div className={styles.dashboardHeader}>
        <h1 className={styles.title}>KelasGPT Dashboard</h1>
        <p className={styles.subtitle}>
          Real-time insights and analytics for your digital course platform
        </p>
      </div>

      {loading ? (
        <div className={styles.loading}>
          <div className={styles.loadingSpinner}></div>
          Loading comprehensive analytics...
        </div>
      ) : (
        <>
          {/* Key Metrics Grid */}
          <div className={styles.metricsGrid}>
            <div className={`${styles.metricCard} ${styles.customers}`}>
              <div className={styles.metricHeader}>
                <h3 className={styles.metricTitle}>Total Customers</h3>
                <svg className={styles.metricIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className={styles.metricValue}>{stats.totalCustomers.toLocaleString()}</div>
              <div className={styles.metricSubtext}>
                {stats.conversionRate}% conversion rate
                {stats.weeklyGrowth !== undefined && (
                  <span className={`${styles.metricGrowth} ${stats.weeklyGrowth >= 0 ? styles.positive : styles.negative}`}>
                    {stats.weeklyGrowth >= 0 ? '↗' : '↘'} {Math.abs(stats.weeklyGrowth)}%
                  </span>
                )}
              </div>
            </div>

            <div className={`${styles.metricCard} ${styles.revenue}`}>
              <div className={styles.metricHeader}>
                <h3 className={styles.metricTitle}>Total Revenue</h3>
                <svg className={styles.metricIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className={styles.metricValue}>RM {stats.totalRevenue ? stats.totalRevenue.toLocaleString() : '0'}</div>
              <div className={styles.metricSubtext}>
                RM {stats.averageOrderValue ? stats.averageOrderValue.toFixed(2) : '0.00'} average order value
              </div>
            </div>

            <div className={`${styles.metricCard}`}>
              <div className={styles.metricHeader}>
                <h3 className={styles.metricTitle}>Today&apos;s Performance</h3>
                <svg className={styles.metricIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div className={styles.metricValue}>{stats.todayCustomers}</div>
              <div className={styles.metricSubtext}>
                RM {stats.todayRevenue ? stats.todayRevenue.toFixed(2) : '0.00'} revenue today
              </div>
            </div>

            <div className={`${styles.metricCard} ${styles.conversion}`}>
              <div className={styles.metricHeader}>
                <h3 className={styles.metricTitle}>Success Rate</h3>
                <svg className={styles.metricIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className={styles.metricValue}>{stats.conversionRate}%</div>
              <div className={styles.metricSubtext}>
                Payment success rate
              </div>
            </div>
          </div>

          {/* Detailed Sections */}
          <div className={styles.sectionsGrid}>
            {/* Recent Customers Table */}
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Recent Purchases</h2>
                <span className={styles.metricSubtext}>Last 10 successful payments</span>
              </div>
              
              <table className={styles.table}>
                <thead className={styles.tableHeader}>
                  <tr>
                    <th className={styles.tableHeaderCell}>Customer</th>
                    <th className={styles.tableHeaderCell}>Amount</th>
                    <th className={styles.tableHeaderCell}>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentCustomers.length > 0 ? (
                    stats.recentCustomers.map((customer, index) => (
                      <tr key={index} className={styles.tableRow}>
                        <td className={styles.tableCell}>
                          <div className={styles.customerName}>{customer.name}</div>
                          <div className={styles.customerEmail}>{customer.email}</div>
                        </td>
                        <td className={`${styles.tableCell} ${styles.amount}`}>
                          RM {customer.amount.toFixed(2)}
                        </td>
                        <td className={`${styles.tableCell} ${styles.time}`}>
                          {customer.time}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr className={styles.tableRow}>
                      <td className={styles.tableCell} colSpan={3} style={{ textAlign: 'center', color: '#9ca3af' }}>
                        No recent purchases to display
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Status Breakdown */}
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Payment Status</h2>
                <span className={styles.metricSubtext}>Current breakdown</span>
              </div>
              
              <div className={styles.statusBreakdown}>
                <div className={styles.statusItem}>
                  <span className={styles.statusLabel}>Successful Payments</span>
                  <span className={`${styles.statusValue} ${styles.paid}`}>
                    {stats.statusBreakdown?.paid || 0}
                  </span>
                </div>
                
                <div className={styles.statusItem}>
                  <span className={styles.statusLabel}>Pending Payments</span>
                  <span className={`${styles.statusValue} ${styles.pending}`}>
                    {stats.statusBreakdown?.pending || 0}
                  </span>
                </div>
                
                <div className={styles.statusItem}>
                  <span className={styles.statusLabel}>Failed Payments</span>
                  <span className={`${styles.statusValue} ${styles.failed}`}>
                    {stats.statusBreakdown?.failed || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Refresh Button */}
          <div style={{ textAlign: 'center', marginTop: '32px' }}>
            <button 
              onClick={fetchDashboardData}
              className={styles.refreshButton}
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh Analytics
            </button>
          </div>
        </>
      )}
    </AdminLayout>
  );
}
