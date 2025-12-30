import { useState, useEffect } from "react";
import AdminLayout from '@/components/AdminLayout';
import styles from "@/styles/Admin.module.css";

export default function Settings() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [analyticsStats, setAnalyticsStats] = useState({
    currentRecords: 0,
    oldestRecord: null,
    canCleanup: false,
    recordsToCleanup: 0
  });

  useEffect(() => {
    fetchAnalyticsStats();
  }, []);

  const fetchAnalyticsStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/analytics-stats?t=' + Date.now());
      const data = await response.json();
      setAnalyticsStats(data);
    } catch (error) {
      console.error('Error fetching analytics stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyticsCleanup = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/cleanup-analytics', { method: 'POST' });
      const result = await response.json();
      
      // Show cleanup results and refresh stats
      await fetchAnalyticsStats();
      setMessage(result.message || 'Cleanup process completed.');
      
      // Clear message after 5 seconds
      setTimeout(() => setMessage(''), 5000);
    } catch (error) {
      console.error('Error executing cleanup:', error);
      setMessage('Failed to execute cleanup.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout title="System Settings">
      {/* Command Bar */}
      <div className={styles.commandBar}>
        <div className={styles.commandBarHeader}>
          <div className={styles.titleSection}>
            <h1 className={styles.customersTitle}>System Settings</h1>
            <p className={styles.newSubtitle}>Manage system performance and data retention.</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      {message && (
        <div style={{
          padding: '12px 16px',
          borderRadius: '8px',
          marginBottom: '24px',
          background: message.includes('Failed') || message.includes('Error') ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
          color: message.includes('Failed') || message.includes('Error') ? '#ef4444' : '#10b981',
          border: `1px solid ${message.includes('Failed') || message.includes('Error') ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)'}`,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '14px',
          fontWeight: '500'
        }}>
          <span>{message.includes('Failed') || message.includes('Error') ? '⚠️' : '✅'}</span>
          {message}
        </div>
      )}

      {/* Settings Grid */}
      <div className={styles.cardsGrid} style={{ gridTemplateColumns: '1fr', gap: '24px' }}>
        
        {/* Analytics Data Management Card */}
        <div className={styles.statCard} style={{ cursor: 'default', height: 'auto', display: 'block' }}>
          <div className={styles.statHeader} style={{ marginBottom: '16px' }}>
            <div className={styles.statTitle} style={{ fontSize: '16px', fontWeight: '600', color: '#f8fafc' }}>
              Analytics Data Management
            </div>
            <div className={styles.statIcon} style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
              📊
            </div>
          </div>
          
          <div style={{ color: '#94a3b8', fontSize: '14px', lineHeight: '1.6', marginBottom: '24px' }}>
            <p style={{ marginBottom: '12px' }}>
              <strong>What does this do?</strong><br/>
              This tool helps maintain system performance by archiving old raw traffic data.
            </p>
            <ul style={{ paddingLeft: '20px', margin: 0 }}>
              <li>Monitors the <code>page_views</code> table size.</li>
              <li>Identifies raw traffic records older than <strong>3 days</strong>.</li>
              <li>Summarizes detailed data into daily totals (saved to <code>analytics_daily</code>).</li>
              <li>Permanently removes the old raw data to save storage space.</li>
            </ul>
          </div>

          <div style={{ 
            background: 'rgba(15, 23, 42, 0.4)', 
            borderRadius: '12px', 
            padding: '20px', 
            border: '1px solid rgba(148, 163, 184, 0.1)'
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '20px' }}>
              <div>
                <div style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                  Current Total Records
                </div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#f8fafc' }}>
                  {loading ? '...' : analyticsStats.currentRecords.toLocaleString()}
                </div>
              </div>
              
              <div>
                <div style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                  Oldest Record Date
                </div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#f8fafc' }}>
                  {loading ? '...' : (analyticsStats.oldestRecord || 'N/A')}
                </div>
              </div>
            </div>

            <div style={{ 
              paddingTop: '20px', 
              borderTop: '1px solid rgba(148, 163, 184, 0.1)', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '16px'
            }}>
              <div>
                {analyticsStats.canCleanup ? (
                  <span style={{ color: '#fbbf24', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>⚠️</span>
                    Found {analyticsStats.recordsToCleanup.toLocaleString()} records ready for archival.
                  </span>
                ) : (
                  <span style={{ color: '#10b981', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>✓</span>
                    Database is optimized. No cleanup needed.
                  </span>
                )}
              </div>

              <button 
                onClick={handleAnalyticsCleanup}
                disabled={!analyticsStats.canCleanup || loading}
                className={styles.refreshBtn}
                style={{
                  background: analyticsStats.canCleanup 
                    ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' 
                    : 'rgba(148, 163, 184, 0.1)',
                  cursor: analyticsStats.canCleanup ? 'pointer' : 'not-allowed',
                  opacity: loading ? 0.7 : 1,
                  border: 'none',
                  color: analyticsStats.canCleanup ? 'white' : '#64748b',
                  boxShadow: analyticsStats.canCleanup ? '0 4px 12px rgba(245, 158, 11, 0.3)' : 'none'
                }}
              >
                {loading ? 'Processing...' : (
                  <>
                    <span>📦</span> Archive & Cleanup Data
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

      </div>
    </AdminLayout>
  );
}