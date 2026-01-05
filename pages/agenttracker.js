import { useState, useEffect } from 'react';
import Head from 'next/head';
import styles from '@/styles/AgentTracker.module.css';

export default function AgentTracker() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [searched, setSearched] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const [lastFetchStatus, setLastFetchStatus] = useState(null); // 'success' or 'error'

  const getStorageKey = (id, type) => `agent_${type}_${id.toUpperCase()}`;
  const GLOBAL_FAIL_KEY = 'agent_global_search_fails';
  const GLOBAL_COOLDOWN_KEY = 'agent_global_cooldown_end';

  // Load persisted cooldown on mount
  useEffect(() => {
    // 1. Check for global search block
    const globalCooldownEnd = localStorage.getItem(GLOBAL_COOLDOWN_KEY);
    if (globalCooldownEnd) {
        const remaining = Math.ceil((parseInt(globalCooldownEnd) - Date.now()) / 1000);
        if (remaining > 0) {
            setCooldown(remaining);
            setErrorMsg(`Too many invalid searches. Please wait ${remaining}s.`);
        }
    }

    // 2. Check for specific ID session
    const savedId = sessionStorage.getItem('agentId');
    if (savedId) {
      setSearch(savedId);
      
      const cooldownEnd = localStorage.getItem(getStorageKey(savedId, 'cooldown_end'));
      if (cooldownEnd) {
          const remaining = Math.ceil((parseInt(cooldownEnd) - Date.now()) / 1000);
          if (remaining > 0) setCooldown(remaining);
      }

      fetchData(savedId, false); 
    }
  }, []);

  // Timer Effect
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown(prev => {
        if (prev <= 1) return 0;
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleGlobalSearchFailure = () => {
      let fails = JSON.parse(localStorage.getItem(GLOBAL_FAIL_KEY) || '[]');
      const now = Date.now();
      fails = fails.filter(t => now - t < 60000);
      fails.push(now);
      localStorage.setItem(GLOBAL_FAIL_KEY, JSON.stringify(fails));

      if (fails.length >= 3) {
          const blockTime = 60; 
          setCooldown(blockTime);
          localStorage.setItem(GLOBAL_COOLDOWN_KEY, now + (blockTime * 1000));
          setErrorMsg("Too many invalid IDs entered. Search blocked for 1 minute.");
      }
  };

  const handleRateLimitFailure = (id) => {
      setLastFetchStatus('error');
      
      // If no data was found, it counts towards the global search failure limit
      handleGlobalSearchFailure();

      const key = getStorageKey(id, 'fail_timestamps');
      let fails = JSON.parse(localStorage.getItem(key) || '[]');
      const now = Date.now();
      fails = fails.filter(t => now - t < 60000);
      fails.push(now);
      localStorage.setItem(key, JSON.stringify(fails));

      if (fails.length >= 3) {
          const blockTime = 60; 
          setCooldown(blockTime);
          localStorage.setItem(getStorageKey(id, 'cooldown_end'), now + (blockTime * 1000));
      }
  };

  const handleRateLimitSuccess = (id) => {
      setLastFetchStatus('success');
      const blockTime = 180; // 3 minutes
      setCooldown(blockTime);
      localStorage.setItem(getStorageKey(id, 'cooldown_end'), Date.now() + (blockTime * 1000));
      localStorage.removeItem(getStorageKey(id, 'fail_timestamps'));
      localStorage.removeItem(GLOBAL_FAIL_KEY); // Reset global fails on success
  };

  const fetchData = async (agentId, applyRateLimit = true) => {
    // Check global block first
    const globalCooldownEnd = localStorage.getItem(GLOBAL_COOLDOWN_KEY);
    if (globalCooldownEnd && applyRateLimit) {
        const remaining = Math.ceil((parseInt(globalCooldownEnd) - Date.now()) / 1000);
        if (remaining > 0) {
            setCooldown(remaining);
            setErrorMsg(`Search is currently blocked. Please wait ${remaining}s.`);
            return;
        }
    }

    // Check if this specific ID is currently blocked
    if (applyRateLimit) {
        const cooldownEnd = localStorage.getItem(getStorageKey(agentId, 'cooldown_end'));
        if (cooldownEnd) {
            const remaining = Math.ceil((parseInt(cooldownEnd) - Date.now()) / 1000);
            if (remaining > 0) {
                setCooldown(remaining);
                setErrorMsg(`Please wait ${remaining}s before checking this ID again.`);
                return; 
            }
        }
    }

    setLoading(true);
    setErrorMsg('');
    
    try {
      const res = await fetch(`/api/agent-stats?agentId=${encodeURIComponent(agentId)}&_t=${Date.now()}`);
      
      if (res.status === 429) {
        setErrorMsg("You're searching too fast! Please take a break and wait a minute.");
        setLoading(false);
        return;
      }

      const json = await res.json();
      
      if (json.success && json.data.length > 0) {
        setData(json.data[0]);
        setSearched(true);
        sessionStorage.setItem('agentId', agentId);
        if (applyRateLimit) handleRateLimitSuccess(agentId);
      } else {
        setData(null);
        setSearched(true);
        if (applyRateLimit) handleRateLimitFailure(agentId);
      }
    } catch (error) {
      console.error('Failed to fetch data', error);
      setErrorMsg("Connection error. Please try again later.");
      if (applyRateLimit) handleRateLimitFailure(agentId);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
      if (cooldown > 0 || loading) return;
      fetchData(data.agentId, true);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!search.trim()) return;
    fetchData(search, true);
  };

  const handleLogout = () => {
    setData(null);
    setSearched(false);
    setSearch('');
    setCooldown(0);
    setLastFetchStatus(null);
    sessionStorage.removeItem('agentId');
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Agent Portal | KelasGPT</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#0f172a" />
      </Head>

      {/* --- LOGIN VIEW --- */}
      {!data && (
        <div style={{maxWidth: '600px', margin: '0 auto', paddingTop: '4rem'}}>
            <div className={styles.header}>
                <h1 className={styles.title}>Agent Portal</h1>
                <p className={styles.subtitle}>Welcome back, Agent. Enter your unique ID to access your real-time performance dashboard.</p>
            </div>

            <div className={styles.searchContainer}>
                <form onSubmit={handleSearch}>
                    <label className={styles.searchLabel}>Secret Agent ID</label>
                    <div className={styles.inputGroup}>
                        <input 
                            type="text" 
                            placeholder="e.g. AGENT_007" 
                            className={styles.searchInput}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            autoFocus
                        />
                        <button type="submit" className={styles.searchButton} disabled={loading || !search}>
                            {loading ? 'Accessing...' : 'View Dashboard'}
                        </button>
                    </div>
                </form>
            </div>

            {loading && (
                <div className={styles.loader}>
                    <div className={styles.spinner}></div>
                    <p>Verifying Agent Identity...</p>
                </div>
            )}

            {errorMsg && (
                <div className={styles.errorMessage}>{errorMsg}</div>
            )}

            {searched && !loading && !data && !errorMsg && (
                <div className={styles.errorMessage} style={{background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#fca5a5'}}>
                    <p style={{fontWeight: '700', color: '#fecaca', marginBottom: '0.5rem'}}>Agent Not Found</p>
                    We couldn&apos;t find any records for ID: <strong>{search}</strong>.
                    <br/>Please check your ID and try again.
                </div>
            )}
        </div>
      )}


      {/* --- DASHBOARD VIEW --- */}
      {data && (
        <div className={styles.dashboard}>
            {/* Header Banner */}
            <div className={styles.welcomeBanner}>
                <div className={styles.agentInfo}>
                    <h2>Dashboard Overview</h2>
                    <div className={styles.agentIdBadge}>
                        <span style={{opacity: 0.7}}>ID:</span> {data.agentId}
                    </div>
                </div>
                <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem'}}>
                    {lastFetchStatus === 'success' && cooldown > 0 && (
                        <div style={{color: '#34d399', fontSize: '0.875rem', fontWeight: '600', marginBottom: '4px'}}>
                            Data Refreshed Successfully!
                        </div>
                    )}
                    <div style={{display: 'flex', gap: '1rem'}}>
                        <button 
                            onClick={handleRefresh} 
                            className={styles.refreshButton}
                            disabled={cooldown > 0 || loading}
                            style={{opacity: (cooldown > 0 || loading) ? 0.6 : 1, cursor: (cooldown > 0 || loading) ? 'not-allowed' : 'pointer'}}
                        >
                            {loading ? (
                                <>
                                    <span className={styles.spinner} style={{width:'14px', height:'14px', borderWidth:'2px', marginRight:'8px', marginBottom:0, display:'inline-block', verticalAlign:'middle'}}></span>
                                    Refreshing...
                                </>
                            ) : (
                                <>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 4v6h-6"></path><path d="M1 20v-6h6"></path><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
                                    Refresh Data
                                </>
                            )}
                        </button>
                        <button onClick={handleLogout} className={styles.refreshButton}>
                            Back
                        </button>
                    </div>
                    {cooldown > 0 && (
                        <div style={{fontSize: '0.75rem', color: '#94a3b8', fontStyle: 'italic'}}>
                            please wait for another {cooldown}s to refresh again.
                        </div>
                    )}
                </div>
            </div>

            {/* Main Stats Grid */}
            <div className={styles.statsGrid}>
                {/* Successful Sales */}
                <div className={styles.statCard}>
                    <div className={styles.cardHeader}>
                        <h3 className={styles.cardTitle}>Successful Sales</h3>
                        <span className={styles.cardIcon}>📦</span>
                    </div>
                    <div className={styles.cardValue}>{data.paid}</div>
                    <div className={styles.cardSubtext}>Orders Completed</div>
                </div>

                {/* Pending Orders */}
                <div className={styles.statCard}>
                    <div className={styles.cardHeader}>
                        <h3 className={styles.cardTitle}>Pending Orders</h3>
                        <span className={styles.cardIcon}>⏱️</span>
                    </div>
                    <div className={styles.cardValue}>{data.pending}</div>
                    <div className={styles.cardSubtext}>Awaiting Payment</div>
                </div>

                {/* Failed Orders */}
                <div className={styles.statCard}>
                    <div className={styles.cardHeader}>
                        <h3 className={styles.cardTitle}>Failed Orders</h3>
                        <span className={styles.cardIcon}>❌</span>
                    </div>
                    <div className={styles.cardValue}>{data.failed}</div>
                    <div className={styles.cardSubtext}>Cancelled / Failed</div>
                </div>

                {/* Total Commission */}
                <div className={`${styles.statCard} ${styles.cardCommission}`}>
                    <div className={styles.cardHeader}>
                        <h3 className={styles.cardTitle}>Total Commission</h3>
                        <span className={styles.cardIcon}>💰</span>
                    </div>
                    <div className={styles.cardValue}>
                        <span style={{fontSize: '1rem', verticalAlign: 'top', color: '#94a3b8', marginRight: '4px'}}>RM</span>
                        {(data.totalCommission || 0).toLocaleString('en-MY', {minimumFractionDigits: 2})}
                    </div>
                    <div className={styles.cardSubtext}>Lifetime Earnings (All Time)</div>
                </div>

                {/* Settled Commission */}
                <div className={`${styles.statCard} ${styles.cardPaid}`}>
                    <div className={styles.cardHeader}>
                        <h3 className={styles.cardTitle}>Commission Paid</h3>
                        <span className={styles.cardIcon}>✅</span>
                    </div>
                    <div className={styles.cardValue}>
                         <span style={{fontSize: '1rem', verticalAlign: 'top', color: '#94a3b8', marginRight: '4px'}}>RM</span>
                        {(data.commissionSettled || 0).toLocaleString('en-MY', {minimumFractionDigits: 2})}
                    </div>
                    <div className={styles.cardSubtext}>Already Transferred to You</div>
                </div>

                {/* Pending Settlement */}
                <div className={`${styles.statCard} ${styles.cardPending}`}>
                    <div className={styles.cardHeader}>
                        <h3 className={styles.cardTitle}>Pending Payout</h3>
                        <span className={styles.cardIcon}>⏳</span>
                    </div>
                    <div className={styles.cardValue}>
                        <span style={{fontSize: '1rem', verticalAlign: 'top', color: '#94a3b8', marginRight: '4px'}}>RM</span>
                        {(data.commissionPending || 0).toLocaleString('en-MY', {minimumFractionDigits: 2})}
                    </div>
                    <div className={styles.cardSubtext}>Waiting for Settlement</div>
                </div>
            </div>

            {/* Support Actions */}
            <div className={styles.analyticsGrid}>
                <div className={styles.analyticsCard}>
                    <h3 className={styles.analyticsTitle}>Quick Actions & Support</h3>
                    <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                         
                         <div style={{display:'flex', gap:'1rem', alignItems:'center'}}>
                             <div style={{flex:1, padding: '1rem', background: '#0f172a', borderRadius: '8px', border: '1px solid #334155'}}>
                                <p style={{fontSize: '0.875rem', color: '#94a3b8', marginBottom: '0.5rem'}}>Have questions about your pending payout?</p>
                                <a href="https://wa.me/601139303649" target="_blank" rel="noreferrer" style={{display: 'block', textAlign: 'center', background: '#3b82f6', color: 'white', padding: '0.75rem', borderRadius: '6px', border: 'none', fontWeight: '600', textDecoration: 'none', fontSize: '0.875rem', transition:'background 0.2s'}}>
                                    Chat with Admin on WhatsApp
                                </a>
                             </div>
                             
                             <div style={{flex:1, padding: '1rem', background: 'rgba(5, 150, 105, 0.1)', borderRadius: '8px', border: '1px solid rgba(5, 150, 105, 0.2)'}}>
                                <p style={{fontSize: '0.875rem', color: '#34d399', marginBottom: '0.5rem'}}>Status: <strong>Active</strong></p>
                                <p style={{fontSize: '0.75rem', color: '#6ee7b7'}}>Your agent code is currently active and tracking sales perfectly.</p>
                                <p style={{fontSize: '0.75rem', color: '#6ee7b7', marginTop:'0.5rem'}}>Total Successful Sales: <strong>{data.paid}</strong></p>
                             </div>
                         </div>
                    </div>
                </div>
            </div>

            <div style={{marginTop: '3rem', textAlign: 'center', fontSize: '0.75rem', color: '#475569'}}>
                Last updated: {new Date().toLocaleString()}
            </div>
        </div>
      )}
    </div>
  );
}
