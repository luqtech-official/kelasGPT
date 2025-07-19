import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Head from "next/head";
import Link from "next/link";
import styles from "@/styles/PaymentStatus.module.css";

export default function PaymentCancelledPage() {
  const router = useRouter();
  const { query } = router;
  const [orderNumber, setOrderNumber] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (router.isReady) {
      const timer = setTimeout(() => {
        setIsLoading(false);
        setOrderNumber(query.order_number || '');
      }, 800);

      return () => clearTimeout(timer);
    }
  }, [router.isReady, query]);

  const handleRetryPayment = () => {
    router.push('/checkout');
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Payment Cancelled - KelasGPT</title>
        <meta name="description" content="Your payment has been cancelled. No charges have been made to your account." />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={styles.card}>
        {isLoading ? (
          <>
            <div className={styles.progressBar}>
              <div className={styles.progressFill}></div>
            </div>
            <div className={`${styles.statusIcon} ${styles.processing}`}>
              <div className={styles.loadingSpinner}></div>
            </div>
            <h1 className={styles.title}>Loading...</h1>
            <p className={styles.description}>Please wait a moment</p>
          </>
        ) : (
          <>
            <div className={`${styles.statusIcon} ${styles.cancelled}`}>
              🛑
            </div>
            
            <h1 className={styles.title}>Payment Cancelled</h1>
            <p className={styles.description}>
              No worries! Your payment has been cancelled and no charges have been made to your account.
            </p>
            
            {orderNumber && (
              <div className={styles.orderNumber}>
                Order: {orderNumber}
              </div>
            )}

            <div className={styles.infoGrid}>
              <div className={`${styles.infoCard} ${styles.success}`}>
                <h3>💳 Your money is safe</h3>
                <p>No charges were made to your payment method. You can safely try again whenever you&apos;re ready.</p>
              </div>
              
              <div className={`${styles.infoCard} ${styles.info}`}>
                <h3>🤔 Changed your mind?</h3>
                <p>That&apos;s totally fine! You can return to complete your purchase anytime. Your spot is reserved.</p>
              </div>
              
              <div className={`${styles.infoCard} ${styles.warning}`}>
                <h3>❓ Need help deciding?</h3>
                <p>Our support team can answer any questions about the course content or payment process.</p>
              </div>
            </div>

            <div className={styles.buttonGroup}>
              <button 
                onClick={handleRetryPayment}
                className={`${styles.button} ${styles.primaryButton}`}
              >
                🔄 Try Again
              </button>
              
              <Link href="/" className={`${styles.button} ${styles.secondaryButton}`}>
                🏠 Back to Home
              </Link>
            </div>

            <div className={styles.supportInfo}>
              <p>Questions? We&apos;re here to help! 😊</p>
              <p>
                Email: <a href="mailto:support@kelasgpt.com">support@kelasgpt.com</a>
              </p>
              <p>
                WhatsApp: <a href="https://wa.me/60123456789">+60 12-345 6789</a>
              </p>
              <p style={{ fontSize: '0.8rem', marginTop: '1rem', color: '#9ca3af' }}>
                💡 Tip: Most payment issues can be resolved by trying a different payment method or contacting your bank
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}