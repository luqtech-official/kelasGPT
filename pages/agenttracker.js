import { useState } from 'react';
import Head from 'next/head';
import styles from '@/styles/AgentTracker.module.css';

export default function AgentTracker() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!search.trim()) return;

    setLoading(true);
    setSearched(true);
    
    try {
      const res = await fetch(`/api/agent-stats?agentId=${encodeURIComponent(search)}`);
      const json = await res.json();
      
      if (json.success && json.data.length > 0) {
        setData(json.data[0]); // Should be only one record for specific ID
      } else {
        setData(null);
      }
    } catch (error) {
      console.error('Failed to fetch data', error);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Agent Sales Tracker</title>
      </Head>

      <div className={styles.header}>
        <h1 className={styles.title}>Agent Portal</h1>
        <p className={styles.subtitle}>Enter your Agent ID to view your sales performance.</p>
      </div>

      <form className={styles.searchWrapper} onSubmit={handleSearch}>
        <input 
          type="text" 
          placeholder="Enter Agent ID (e.g. PROMO)" 
          className={styles.searchInput}
          value={search}
          onChange={(e) => setSearch(e.target.value.toUpperCase())}
        />
      </form>

      {loading ? (
        <div className={styles.loader}>Searching database...</div>
      ) : !searched ? (
        <div className={styles.emptyState}>Please enter your ID to begin.</div>
      ) : !data ? (
        <div className={styles.emptyState}>No records found for Agent ID: {search.toUpperCase()}</div>
      ) : (
        <div>
          <div style={{textAlign: 'center', marginBottom: '2rem'}}>
            <span className={styles.agentBadge} style={{fontSize: '1.2rem', padding: '0.5rem 1.5rem'}}>
              {data.agentId}
            </span>
          </div>

          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={`${styles.statValue} ${styles.statPaid}`}>{data.paid}</div>
              <div className={styles.statLabel}>Successful Orders</div>
            </div>
            
            <div className={styles.statCard}>
              <div className={`${styles.statValue} ${styles.statPending}`}>{data.pending}</div>
              <div className={styles.statLabel}>Pending Payment</div>
            </div>
            
            <div className={styles.statCard}>
              <div className={`${styles.statValue} ${styles.statFailed}`}>{data.failed}</div>
              <div className={styles.statLabel}>Failed / Cancelled</div>
            </div>

            <div className={styles.statCard} style={{borderColor: '#3b82f6'}}>
              <div className={styles.statValue} style={{color: '#2563eb'}}>
                <span style={{fontSize: '1.5rem', verticalAlign: 'top', marginRight: '4px'}}>RM</span>
                {data.totalRevenue.toLocaleString('en-MY')}
              </div>
              <div className={styles.statLabel}>Total Revenue Generated</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
