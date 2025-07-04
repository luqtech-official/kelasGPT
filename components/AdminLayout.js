import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import styles from '@/styles/Home.module.css';

export default function AdminLayout({ children, title = 'Admin Dashboard' }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const validateSession = async () => {
      try {
        const response = await fetch('/api/admin/validate-session');
        
        if (!response.ok) {
          router.push('/admin/login');
          return;
        }

        const data = await response.json();
        setAdmin(data.admin);
        setLoading(false);
      } catch (error) {
        console.error('Session validation error:', error);
        router.push('/admin/login');
      }
    };

    // Skip validation for login page
    if (router.pathname === '/admin/login') {
      setLoading(false);
      return;
    }

    validateSession();
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', {
        method: 'POST'
      });
      router.push('/admin/login');
    } catch (error) {
      console.error('Logout error:', error);
      router.push('/admin/login');
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <main className={styles.main}>
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <p>Loading...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>{title} - KelasGPT</title>
        <meta name="robots" content="noindex, nofollow" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {admin && (
        <header style={{ 
          background: '#f5f5f5', 
          padding: '10px 20px', 
          borderBottom: '1px solid #ddd',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <nav>
            <Link href="/admin" style={{ marginRight: '20px', textDecoration: 'none', color: '#0070f3' }}>
              Dashboard
            </Link>
            <Link href="/admin/customers" style={{ marginRight: '20px', textDecoration: 'none', color: '#0070f3' }}>
              Customers
            </Link>
            <Link href="/admin/settings" style={{ marginRight: '20px', textDecoration: 'none', color: '#0070f3' }}>
              Settings
            </Link>
          </nav>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <span style={{ color: '#666' }}>
              Welcome, {admin.username} ({admin.role})
            </span>
            <button 
              onClick={handleLogout}
              style={{ 
                background: '#dc3545', 
                color: 'white', 
                border: 'none', 
                padding: '5px 10px', 
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Logout
            </button>
          </div>
        </header>
      )}

      <main className={styles.main}>
        {children}
      </main>

      {admin && (
        <footer style={{ 
          textAlign: 'center', 
          padding: '20px', 
          borderTop: '1px solid #ddd',
          marginTop: '40px',
          color: '#666'
        }}>
          <link href="/" style={{ color: '#0070f3', textDecoration: 'none' }}>
            ← Back to Main Site
          </link>
        </footer>
      )}
    </div>
  );
}