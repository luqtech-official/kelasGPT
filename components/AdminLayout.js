import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import styles from '@/styles/Admin.module.css';

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
          <div className={styles.loading}>
            <div className={styles.loadingSpinner}></div>
            Loading admin dashboard...
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
        <header className={styles.header}>
          <div className={styles.headerContent}>
            <nav className={styles.nav}>
              <Link href="/admin" className={`${styles.navLink} ${router.pathname === '/admin' ? styles.navLinkActive : ''}`}>
                Dashboard
              </Link>
              <Link href="/admin/customers" className={`${styles.navLink} ${router.pathname === '/admin/customers' ? styles.navLinkActive : ''}`}>
                Customers
              </Link>
              <Link href="/admin/settings" className={`${styles.navLink} ${router.pathname === '/admin/settings' ? styles.navLinkActive : ''}`}>
                Settings
              </Link>
            </nav>
            
            <div className={styles.userSection}>
              <span className={styles.userInfo}>
                Welcome, {admin.username}
              </span>
              <button 
                onClick={handleLogout}
                className={styles.logoutButton}
              >
                Logout
              </button>
            </div>
          </div>
        </header>
      )}

      <main className={styles.main}>
        {children}
      </main>

      {admin && (
        <footer className={styles.footer}>
          <Link href="/" className={styles.backLink}>
            ← Back to Main Site
          </Link>
        </footer>
      )}
    </div>
  );
}