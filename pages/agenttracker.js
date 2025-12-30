import { useState } from 'react';
import Head from 'next/head';
import styles from '@/styles/AgentTracker.module.css';

export default function AgentTracker() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [searched, setSearched] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!search.trim()) return;

    setLoading(true);
    setSearched(true);
    setErrorMsg('');
    
    try {
      const res = await fetch(`/api/agent-stats?agentId=${encodeURIComponent(search)}`);
      
      if (res.status === 429) {
        setErrorMsg("You're searching too fast! Please take a break and wait a minute.");
        setData(null);
        return;
      }

      const json = await res.json();
      
      if (json.success && json.data.length > 0) {
        setData(json.data[0]); // Should be only one record for specific ID
      } else {
        setData(null);
      }
    } catch (error) {
      console.error('Failed to fetch data', error);
      setData(null);
      setErrorMsg("Something went wrong. Please try again later.");
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
        <p className={styles.subtitle}>Enter your <strong>Secret Agent ID</strong> to view your sales performance.</p>
      </div>

      <form className={styles.searchWrapper} onSubmit={handleSearch}>
        <input 
          type="text" 
          placeholder="Enter Secret Agent ID" 
          className={styles.searchInput}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </form>

      {loading ? (
        <div className={styles.loader}>Searching database...</div>
      ) : errorMsg ? (
        <div className={styles.emptyState} style={{color: '#dc2626'}}>{errorMsg}</div>
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
                {(data.totalCommission || 0).toLocaleString('en-MY')}
              </div>
              <div className={styles.statLabel}>Total Commission Earned</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
