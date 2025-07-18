import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Head from "next/head";
import Link from "next/link";
import styles from "@/styles/Home.module.css";

export default function PaymentCancelledPage() {
  const router = useRouter();
  const { query } = router;
  const [orderNumber, setOrderNumber] = useState('');
  const [message, setMessage] = useState('Loading...');

  useEffect(() => {
    if (router.isReady) {
      const orderNum = query.order_number || '';
      setOrderNumber(orderNum);
      
      if (orderNum) {
        setMessage(`Your payment for order #${orderNum} has been cancelled. No charges have been made to your account.`);
      } else {
        setMessage('Your payment has been cancelled. No charges have been made to your account.');
      }
    }
  }, [router.isReady, query]);

  const handleRetryPayment = () => {
    // Redirect to checkout page to start fresh
    router.push('/checkout');
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Payment Cancelled - KelasGPT</title>
        <meta name="description" content="Your payment has been cancelled. No charges have been made." />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Payment Cancelled</h1>
        <p className={styles.description}>{message}</p>
        
        <div className={styles.grid}>
          <div className={styles.card}>
            <h3>What happened?</h3>
            <p>You cancelled the payment process before completing the transaction with your bank.</p>
          </div>
          
          <div className={styles.card}>
            <h3>Next steps</h3>
            <p>You can try again anytime or contact our support team if you need assistance.</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button 
            onClick={handleRetryPayment}
            className={styles.primary}
            style={{ textDecoration: 'none', border: 'none', padding: '0.75rem 1.5rem', cursor: 'pointer' }}
          >
            Try Payment Again
          </button>
          
          <Link href="/" legacyBehavior>
            <a className={styles.secondary}>Back to Home</a>
          </Link>
        </div>

        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <p style={{ fontSize: '0.9rem', color: '#666' }}>
            Need help? Contact us at{' '}
            <a href="mailto:support@kelasgpt.com" style={{ color: '#0070f3' }}>
              support@kelasgpt.com
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}