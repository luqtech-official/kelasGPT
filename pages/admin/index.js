import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import styles from '@/styles/Home.module.css';

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
      <h1 className={styles.title}>Dashboard Overview</h1>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p>Loading dashboard data...</p>
        </div>
      ) : (
        <>
          <div className={styles.grid}>
            <div className={styles.card}>
              <h2>Total Customers</h2>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#0070f3' }}>
                {stats.totalCustomers}
              </p>
              {stats.weeklyGrowth !== undefined && (
                <small style={{ color: stats.weeklyGrowth >= 0 ? '#28a745' : '#dc3545' }}>
                  {stats.weeklyGrowth >= 0 ? '↗' : '↘'} {Math.abs(stats.weeklyGrowth)}% vs last week
                </small>
              )}
            </div>

            <div className={styles.card}>
              <h2>Today's Customers</h2>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#28a745' }}>
                {stats.todayCustomers}
              </p>
              {stats.conversionRate !== undefined && (
                <small style={{ color: '#666' }}>
                  {stats.conversionRate}% conversion rate
                </small>
              )}
            </div>

            <div className={styles.card}>
              <h2>Total Revenue</h2>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#0070f3' }}>
                RM {stats.totalRevenue ? stats.totalRevenue.toFixed(2) : '0.00'}
              </p>
              {stats.averageOrderValue && (
                <small style={{ color: '#666' }}>
                  RM {stats.averageOrderValue.toFixed(2)} avg. order value
                </small>
              )}
            </div>

            <div className={styles.card}>
              <h2>Today's Revenue</h2>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#28a745' }}>
                RM {stats.todayRevenue ? stats.todayRevenue.toFixed(2) : '0.00'}
              </p>
              {stats.statusBreakdown && (
                <small style={{ color: '#666' }}>
                  {stats.statusBreakdown.paid} paid, {stats.statusBreakdown.pending} pending
                </small>
              )}
            </div>
          </div>

          <div style={{ marginTop: '40px' }}>
            <h2>Recent Purchases</h2>
            <div style={{ 
              background: 'white', 
              border: '1px solid #ddd', 
              borderRadius: '8px',
              overflow: 'hidden'
            }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ background: '#f8f9fa' }}>
                  <tr>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Customer</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Email</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Amount</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentCustomers.map((customer, index) => (
                    <tr key={index} style={{ borderBottom: index < stats.recentCustomers.length - 1 ? '1px solid #eee' : 'none' }}>
                      <td style={{ padding: '12px' }}>{customer.name}</td>
                      <td style={{ padding: '12px', color: '#666' }}>{customer.email}</td>
                      <td style={{ padding: '12px', fontWeight: 'bold' }}>RM {customer.amount.toFixed(2)}</td>
                      <td style={{ padding: '12px', color: '#666' }}>{customer.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div style={{ marginTop: '30px', textAlign: 'center' }}>
            <button 
              onClick={fetchDashboardData}
              style={{ 
                background: '#0070f3', 
                color: 'white', 
                border: 'none', 
                padding: '10px 20px', 
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Refresh Data
            </button>
          </div>
        </>
      )}
    </AdminLayout>
  );
}
