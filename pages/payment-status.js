import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Head from "next/head";
import Link from "next/link";
import styles from "@/styles/PaymentStatus.module.css";

export default function PaymentStatusPage() {
  const router = useRouter();
  const { query } = router;
  const [status, setStatus] = useState('processing');
  const [message, setMessage] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (router.isReady) {
      const timer = setTimeout(() => {
        setIsLoading(false);
        
        if (query.payment_status) {
          if (query.payment_status === 'True' || query.payment_status === 'true' || query.payment_status === true) {
            setStatus('success');
            setMessage('Your payment has been successfully processed!');
            setOrderNumber(query.order_number || '');
          } else {
            setStatus('failed');
            setMessage('Your payment could not be completed.');
            setOrderNumber(query.order_number || '');
          }
        } else if (Object.keys(query).length > 0) {
          setStatus('processing');
          setMessage('We are confirming your payment status with the bank.');
          setOrderNumber(query.order_number || '');
        } else {
          setStatus('processing');
          setMessage('We are verifying your payment details.');
        }
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [router.isReady, query]);

  const getStatusIcon = () => {
    switch (status) {
      case 'success': return '✅';
      case 'failed': return '❌';
      case 'processing': return '⏳';
      default: return '⏳';
    }
  };

  const getStatusTitle = () => {
    switch (status) {
      case 'success': return 'Payment Successful';
      case 'failed': return 'Payment Failed';
      case 'processing': return 'Processing Payment';
      default: return 'Processing Payment';
    }
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>{getStatusTitle()} - KelasGPT</title>
        <meta name="description" content="Your payment status for KelasGPT course" />
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
            <h1 className={styles.title}>Processing...</h1>
            <p className={styles.description}>Please wait while we verify your payment</p>
          </>
        ) : (
          <>
            <div className={`${styles.statusIcon} ${styles[status]}`}>
              {getStatusIcon()}
            </div>
            
            <h1 className={styles.title}>{getStatusTitle()}</h1>
            <p className={styles.description}>{message}</p>
            
            {orderNumber && (
              <div className={styles.orderNumber}>
                Order: {orderNumber}
              </div>
            )}

            <div className={styles.infoGrid}>
              {status === 'success' && (
                <>
                  <div className={`${styles.infoCard} ${styles.success}`}>
                    <h3>🎉 What&apos;s Next?</h3>
                    <p>Check your email for the course access link. It should arrive within 2-3 minutes.</p>
                  </div>
                  <div className={`${styles.infoCard} ${styles.info}`}>
                    <h3>📧 Didn&apos;t receive the email?</h3>
                    <p>Check your spam folder or contact our support team for immediate assistance.</p>
                  </div>
                </>
              )}

              {status === 'failed' && (
                <>
                  <div className={`${styles.infoCard} ${styles.warning}`}>
                    <h3>💳 No charges made</h3>
                    <p>Your payment method was not charged. You can safely try again.</p>
                  </div>
                  <div className={`${styles.infoCard} ${styles.info}`}>
                    <h3>🔄 Common solutions</h3>
                    <p>Try a different payment method or contact your bank if the issue persists.</p>
                  </div>
                </>
              )}

              {status === 'processing' && (
                <div className={`${styles.infoCard} ${styles.info}`}>
                  <h3>⏱️ Banking verification in progress</h3>
                  <p>This usually takes 1-2 minutes. You&apos;ll receive confirmation via email once complete.</p>
                </div>
              )}
            </div>

            <div className={styles.buttonGroup}>
              {status === 'success' && (
                <Link href="/videolisting" className={`${styles.button} ${styles.primaryButton}`}>
                  Access Course
                </Link>
              )}
              
              {status === 'failed' && (
                <Link href="/checkout" className={`${styles.button} ${styles.primaryButton}`}>
                  Try Again
                </Link>
              )}
              
              <Link href="/" className={`${styles.button} ${styles.secondaryButton}`}>
                Back to Home
              </Link>
            </div>

            <div className={styles.supportInfo}>
              <p>Need help? We&apos;re here for you!</p>
              <p>
                Email: <a href="mailto:support@kelasgpt.com">support@kelasgpt.com</a>
              </p>
              <p>
                WhatsApp: <a href="https://wa.me/60123456789">+60 12-345 6789</a>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
