import Head from "next/head";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import styles from "@/styles/Home.module.css";
import Link from "next/link";

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const router = useRouter();

  // Check if already logged in
  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch('/api/admin/validate-session');
        if (response.ok) {
          router.push('/admin');
        }
      } catch (error) {
        // Not logged in, stay on login page
      }
    };
    
    checkSession();
  }, [router]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    // Client-side validation
    if (!formData.username || !formData.password) {
      setError('Username and password are required');
      setLoading(false);
      return;
    }

    if (formData.username.length < 3) {
      setError('Username must be at least 3 characters');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Login successful, redirect to admin dashboard
      router.push('/admin');

    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Admin Login - KelasGPT</title>
        <meta name="robots" content="noindex, nofollow" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Admin Login</h1>
        <p className={styles.description}>
          Access the KelasGPT administrative dashboard
        </p>

        <form onSubmit={handleSubmit} style={{ maxWidth: '400px', margin: '0 auto' }}>
          <div style={{ marginBottom: '20px' }}>
            <label htmlFor="username" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Username
            </label>
            <input 
              type="text" 
              id="username" 
              name="username" 
              value={formData.username}
              onChange={handleInputChange}
              required 
              disabled={loading}
              style={{ 
                width: '100%', 
                padding: '10px', 
                border: '1px solid #ddd', 
                borderRadius: '4px',
                fontSize: '16px'
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label htmlFor="password" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Password
            </label>
            <input 
              type="password" 
              id="password" 
              name="password" 
              value={formData.password}
              onChange={handleInputChange}
              required 
              disabled={loading}
              style={{ 
                width: '100%', 
                padding: '10px', 
                border: '1px solid #ddd', 
                borderRadius: '4px',
                fontSize: '16px'
              }}
            />
          </div>

          {error && (
            <div style={{ 
              color: 'red', 
              marginBottom: '20px', 
              padding: '10px', 
              border: '1px solid red', 
              borderRadius: '4px',
              backgroundColor: '#ffebee'
            }}>
              {error}
            </div>
          )}

          <button 
            type="submit" 
            className={styles.primary}
            disabled={loading}
            style={{ 
              width: '100%', 
              padding: '12px',
              fontSize: '16px',
              opacity: loading ? 0.6 : 1
            }}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div style={{ marginTop: '40px', textAlign: 'center' }}>
          <Link href="/" style={{ color: '#0070f3', textDecoration: 'none' }}>
            ← Back to Main Site
          </Link>
        </div>
      </main>
    </div>
  );
}
