import { useState, useEffect } from 'react';
import Head from 'next/head';
import styles from '@/styles/AgentTracker.module.css';

export default function AgentTrackerSP() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchData = async (agentId = '') => {
    setLoading(true);
    setErrorMsg('');
    try {
      const url = agentId 
        ? `/api/agent-stats?agentId=${encodeURIComponent(agentId)}`
        : '/api/agent-stats';
      
      const res = await fetch(url);
      
      if (res.status === 429) {
        setErrorMsg("Too many requests. Please wait a minute before refreshing.");
        setLoading(false);
        return;
      }

      const json = await res.json();
      
      if (json.success) {
        setData(json.data);
      }
    } catch (error) {
      console.error('Failed to fetch data', error);
      setErrorMsg("Failed to load data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(); // Fetch all on mount
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchData(search);
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Agent Tracker SP (Admin)</title>
      </Head>

      <div className={styles.header}>
        <h1 className={styles.title}>Super Admin Tracker</h1>
        <p className={styles.subtitle}>Overview of all agent performance and sales.</p>
      </div>

      <form className={styles.searchWrapper} onSubmit={handleSearch}>
        <input 
          type="text" 
          placeholder="Filter by Agent ID..." 
          className={styles.searchInput}
          value={search}
          onChange={(e) => setSearch(e.target.value.toUpperCase())}
        />
      </form>

      {loading ? (
        <div className={styles.loader}>Loading records...</div>
      ) : errorMsg ? (
        <div className={styles.emptyState} style={{color: '#dc2626'}}>{errorMsg}</div>
      ) : data.length === 0 ? (
        <div className={styles.emptyState}>No records found.</div>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Agent ID</th>
                <th>Paid Orders</th>
                <th>Pending</th>
                <th>Failed/Cancelled</th>
                <th>Total Commission</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr key={row.agentId}>
                  <td>
                    <span className={styles.agentBadge}>{row.agentId}</span>
                  </td>
                  <td style={{color: '#059669', fontWeight: 'bold'}}>{row.paid}</td>
                  <td style={{color: '#d97706'}}>{row.pending}</td>
                  <td style={{color: '#dc2626'}}>{row.failed}</td>
                  <td>RM {(row.totalCommission || 0).toLocaleString('en-MY', { minimumFractionDigits: 2 })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
