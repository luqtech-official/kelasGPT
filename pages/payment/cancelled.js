import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Head from "next/head";
import Link from "next/link";
import styles from "@/styles/Checkout.module.css";
import { CancelledIcon } from "../../components/icons";

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
      }, 600);

      return () => clearTimeout(timer);
    }
  }, [router.isReady, query]);

  const handleRetryPayment = () => {
    router.push('/checkout');
  };

  return (
    <div className={styles.checkoutContainer}>
      <Head>
        <title>Payment Cancelled - KelasGPT</title>
        <meta name="description" content="Your payment has been cancelled. No charges have been made to your account." />
        <meta name="robots" content="noindex, nofollow" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={styles.formWrapper} style={{maxWidth: '600px', textAlign: 'center'}}>
        {isLoading ? (
          <>
            <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '1rem'}}>
              <div className={styles.spinner}></div>
            </div>
            <h1 className={styles.title}>Loading...</h1>
            <p className={styles.subtitle}>Please wait a moment</p>
          </>
        ) : (
          <>
            {/* Status Header */}
            <div style={{
              textAlign: 'center',
              marginBottom: '2.5rem',
              paddingBottom: '2rem',
              borderBottom: '1px solid #e5e7eb'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                margin: '0 auto 1rem',
                borderRadius: '50%',
                backgroundColor: '#fef3c7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                color: '#f59e0b'
              }}>
                ✕
              </div>
              
              <h1 style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                color: '#111827',
                margin: '0 0 0.5rem 0',
                letterSpacing: '-0.025em'
              }}>
                Payment Cancelled
              </h1>
              
              <p style={{
                fontSize: '0.875rem',
                color: '#6b7280',
                margin: '0 0 1rem 0',
                lineHeight: '1.5'
              }}>
                No problem at all! Your payment was successfully cancelled and no charges were made to your account.
              </p>
              
              {orderNumber && (
                <div style={{
                  fontSize: '0.75rem',
                  fontFamily: 'ui-monospace, SFMono-Regular, monospace',
                  color: '#9ca3af',
                  backgroundColor: '#f9fafb',
                  padding: '0.375rem 0.75rem',
                  borderRadius: '4px',
                  display: 'inline-block',
                  border: '1px solid #f3f4f6'
                }}>
                  Order #{orderNumber}
                </div>
              )}
            </div>

            {/* Information Section */}
            <div style={{marginBottom: '2.5rem'}}>
              <div style={{
                backgroundColor: '#fafafa',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                overflow: 'hidden'
              }}>
                <div style={{padding: '1.25rem 1.5rem'}}>
                  <h3 style={{
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#374151',
                    margin: '0 0 1rem 0',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    Cancellation Details
                  </h3>
                  <div style={{space: '1rem'}}>
                    <div style={{marginBottom: '1rem'}}>
                      <p style={{
                        fontSize: '0.875rem',
                        color: '#111827',
                        margin: '0 0 0.25rem 0',
                        fontWeight: '500'
                      }}>
                        Your account is secure
                      </p>
                      <p style={{
                        fontSize: '0.8rem',
                        color: '#6b7280',
                        margin: '0',
                        lineHeight: '1.4'
                      }}>
                        No charges were processed. Your payment method remains completely safe.
                      </p>
                    </div>
                    <div style={{marginBottom: '1rem'}}>
                      <p style={{
                        fontSize: '0.875rem',
                        color: '#111827',
                        margin: '0 0 0.25rem 0',
                        fontWeight: '500'
                      }}>
                        Course availability
                      </p>
                      <p style={{
                        fontSize: '0.8rem',
                        color: '#6b7280',
                        margin: '0',
                        lineHeight: '1.4'
                      }}>
                        The course will be here whenever you're ready to continue your learning journey.
                      </p>
                    </div>
                    <div>
                      <p style={{
                        fontSize: '0.875rem',
                        color: '#111827',
                        margin: '0 0 0.25rem 0',
                        fontWeight: '500'
                      }}>
                        Need assistance?
                      </p>
                      <p style={{
                        fontSize: '0.8rem',
                        color: '#6b7280',
                        margin: '0',
                        lineHeight: '1.4'
                      }}>
                        Our support team is standing by to help with any questions.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{marginBottom: '2.5rem'}}>
              <div style={{display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap'}}>
                <div style={{textAlign: 'center'}}>
                  <button 
                    onClick={handleRetryPayment}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '0.75rem 1.5rem',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      borderRadius: '6px',
                      border: '1px solid #111827',
                      backgroundColor: '#111827',
                      color: 'white',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      minWidth: '160px',
                      height: '44px',
                      boxSizing: 'border-box'
                    }}
                  >
                    Try Again
                  </button>
                  <p style={{
                    fontSize: '0.75rem',
                    color: '#9ca3af',
                    margin: '0.5rem 0 0 0'
                  }}>
                    (Go to Checkout Page)
                  </p>
                </div>
                
                <div style={{textAlign: 'center'}}>
                  <Link href="/" style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0.75rem 1.5rem',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    borderRadius: '6px',
                    textDecoration: 'none',
                    backgroundColor: 'white',
                    color: '#6b7280',
                    border: '1px solid #d1d5db',
                    transition: 'all 0.15s ease',
                    minWidth: '160px',
                    height: '44px',
                    boxSizing: 'border-box'
                  }}>
                    Return Home
                  </Link>
                  <p style={{
                    fontSize: '0.75rem',
                    color: '#9ca3af',
                    margin: '0.5rem 0 0 0'
                  }}>
                    (Back to Main Page)
                  </p>
                </div>
              </div>
            </div>

            {/* Support Section */}
            <div style={{
              paddingTop: '2rem',
              borderTop: '1px solid #f3f4f6',
              textAlign: 'center'
            }}>
              <h4 style={{
                fontSize: '0.8rem',
                fontWeight: '600',
                color: '#9ca3af',
                margin: '0 0 1rem 0',
                textTransform: 'uppercase',
                letterSpacing: '0.1em'
              }}>
                Support
              </h4>
              <div style={{display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap'}}>
                <div style={{textAlign: 'center'}}>
                  <div style={{
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '0.25rem'
                  }}>
                    Email:
                  </div>
                  <a href="mailto:support@kelasgpt.com" style={{
                    color: '#6b7280',
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    transition: 'color 0.15s ease'
                  }}>
                    support@kelasgpt.com
                  </a>
                </div>
                <div style={{textAlign: 'center'}}>
                  <div style={{
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '0.25rem'
                  }}>
                    WhatsApp:
                  </div>
                  <a href="https://wa.me/60123456789" style={{
                    color: '#059669',
                    textDecoration: 'underline',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    transition: 'color 0.15s ease'
                  }}>
                    +012-345 6789
                  </a>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}