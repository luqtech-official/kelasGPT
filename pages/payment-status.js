import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Head from "next/head";
import Link from "next/link";
import styles from "@/styles/Checkout.module.css";
import { SuccessIcon, FailedIcon, ProcessingIcon } from "../components/icons";
import { trackPurchase } from "../lib/facebook-pixel";
import { getProductSettings } from "../lib/settings";

export default function PaymentStatusPage() {
  const router = useRouter();
  const { query } = router;
  const [status, setStatus] = useState('processing');
  const [message, setMessage] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [productSettings, setProductSettings] = useState(null);
  const [customerData, setCustomerData] = useState(null);

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

  // Load product settings for tracking
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await getProductSettings();
        setProductSettings(settings);
      } catch (error) {
        console.error('Error loading product settings for tracking:', error);
      }
    };

    loadSettings();
  }, []);

  // Fetch customer data when we have an order number
  useEffect(() => {
    const fetchCustomerData = async () => {
      if (orderNumber && status === 'success') {
        try {
          const response = await fetch(`/api/get-customer-by-order?order_number=${encodeURIComponent(orderNumber)}`);
          if (response.ok) {
            const result = await response.json();
            if (result.success && result.customer) {
              setCustomerData(result.customer);
            }
          }
        } catch (error) {
          console.error('Error fetching customer data:', error);
        }
      }
    };

    fetchCustomerData();
  }, [orderNumber, status]);

  // Track Purchase event when payment is successful - With customer data for Advanced Matching
  useEffect(() => {
    if (productSettings && status === 'success' && orderNumber) {
      // Add a small delay to ensure the success state is fully set
      const trackingTimer = setTimeout(() => {
        // Prepare customer data for Advanced Matching if available
        const fbCustomerData = {};
        if (customerData) {
          fbCustomerData.email = customerData.email;
          fbCustomerData.phone = customerData.phone;
          fbCustomerData.customerId = customerData.customerId;
          
          // Split full name into first and last name
          const nameParts = customerData.fullName.split(' ');
          fbCustomerData.firstName = nameParts[0] || '';
          fbCustomerData.lastName = nameParts.slice(1).join(' ') || '';
        }
        
        trackPurchase({
          productName: productSettings.productName,
          productPrice: productSettings.productPrice,
          productId: 'kelasgpt-course',
          category: 'education',
          orderNumber: orderNumber,
          value: productSettings.productPrice
        }, fbCustomerData);
      }, 500);

      return () => clearTimeout(trackingTimer);
    }
  }, [productSettings, status, orderNumber, customerData]);

  const getStatusIcon = () => {
    switch (status) {
      case 'success': return <SuccessIcon />;
      case 'failed': return <FailedIcon />;
      case 'processing': return <ProcessingIcon />;
      default: return <ProcessingIcon />;
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
    <div className={styles.checkoutContainer}>
      <Head>
        <title>{getStatusTitle()} - KelasGPT</title>
        <meta name="description" content="Your payment status for KelasGPT course" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={styles.formWrapper} style={{maxWidth: '600px', textAlign: 'center'}}>
        {isLoading ? (
          <>
            <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '1rem'}}>
              <div className={styles.spinner}></div>
            </div>
            <h1 className={styles.title}>Processing...</h1>
            <p className={styles.subtitle}>Please wait while we verify your payment</p>
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
                backgroundColor: status === 'success' ? '#dcfce7' : status === 'failed' ? '#fee2e2' : '#dbeafe',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                color: status === 'success' ? '#16a34a' : status === 'failed' ? '#dc2626' : '#2563eb'
              }}>
                {status === 'success' ? '✓' : status === 'failed' ? '✕' : '○'}
              </div>
              
              <h1 style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                color: '#111827',
                margin: '0 0 0.5rem 0',
                letterSpacing: '-0.025em'
              }}>
                {getStatusTitle()}
              </h1>
              
              <p style={{
                fontSize: '0.875rem',
                color: '#6b7280',
                margin: '0 0 1rem 0',
                lineHeight: '1.5'
              }}>
                {message}
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
                  Order {orderNumber}
                </div>
              )}
            </div>

            {/* Information Section */}
            <div style={{marginBottom: '2.5rem'}}>
              {status === 'success' && (
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
                      Next Steps
                    </h3>
                    <div style={{space: '1rem'}}>
                      <div style={{marginBottom: '1rem'}}>
                        <p style={{
                          fontSize: '0.875rem',
                          color: '#111827',
                          margin: '0 0 0.25rem 0',
                          fontWeight: '500'
                        }}>
                          Check your email for course access
                        </p>
                        <p style={{
                          fontSize: '0.8rem',
                          color: '#6b7280',
                          margin: '0',
                          lineHeight: '1.4'
                        }}>
                          Delivery typically takes 2-3 minutes
                        </p>
                      </div>
                      <div>
                        <p style={{
                          fontSize: '0.875rem',
                          color: '#111827',
                          margin: '0 0 0.25rem 0',
                          fontWeight: '500'
                        }}>
                          Email not received?
                        </p>
                        <p style={{
                          fontSize: '0.8rem',
                          color: '#6b7280',
                          margin: '0',
                          lineHeight: '1.4'
                        }}>
                          Check spam folder or contact support
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {status === 'failed' && (
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
                      Transaction Information
                    </h3>
                    <div style={{space: '1rem'}}>
                      <div style={{marginBottom: '1rem'}}>
                        <p style={{
                          fontSize: '0.875rem',
                          color: '#111827',
                          margin: '0 0 0.25rem 0',
                          fontWeight: '500'
                        }}>
                          No charges applied
                        </p>
                        <p style={{
                          fontSize: '0.8rem',
                          color: '#6b7280',
                          margin: '0',
                          lineHeight: '1.4'
                        }}>
                          Your payment method remains secure
                        </p>
                      </div>
                      <div>
                        <p style={{
                          fontSize: '0.875rem',
                          color: '#111827',
                          margin: '0 0 0.25rem 0',
                          fontWeight: '500'
                        }}>
                          Retry with different method
                        </p>
                        <p style={{
                          fontSize: '0.8rem',
                          color: '#6b7280',
                          margin: '0',
                          lineHeight: '1.4'
                        }}>
                          Contact your bank if issues persist
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {status === 'processing' && (
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
                      Verification in Progress
                    </h3>
                    <p style={{
                      fontSize: '0.875rem',
                      color: '#6b7280',
                      margin: '0',
                      lineHeight: '1.5'
                    }}>
                      Processing with your financial institution. Typically takes 1-2 minutes. Email confirmation will follow.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div style={{marginBottom: '2.5rem'}}>
              {status === 'success' && (
                <div style={{textAlign: 'center', marginBottom: '1.5rem'}}>
                  <p style={{
                    fontSize: '0.875rem',
                    color: '#6b7280',
                    margin: '0 0 0.25rem 0',
                    fontWeight: '500'
                  }}>
                    OR
                  </p>
                  <p style={{
                    fontSize: '0.875rem',
                    color: '#6b7280',
                    margin: '0 0 0.5rem 0',
                    lineHeight: '1.4'
                  }}>
                    If You Want to Jump into the course Right Away..
                  </p>
                  <p style={{
                    fontSize: '0.875rem',
                    color: '#6b7280',
                    margin: '0'
                  }}>
                    Click <strong style={{color: '#374151'}}>Access Course</strong> Below
                  </p>
                </div>
              )}
              
              <div style={{display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap'}}>
                {status === 'success' && (
                  <Link href="/videolisting" style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0.75rem 1.5rem',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    borderRadius: '6px',
                    textDecoration: 'none',
                    backgroundColor: '#111827',
                    color: 'white',
                    border: '1px solid #111827',
                    transition: 'all 0.15s ease',
                    minWidth: '160px',
                    height: '44px',
                    boxSizing: 'border-box'
                  }}>
                    Access Course
                  </Link>
                )}
                
                {status === 'failed' && (
                  <div style={{textAlign: 'center'}}>
                    <Link href="/checkout" style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '0.75rem 1.5rem',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      borderRadius: '6px',
                      textDecoration: 'none',
                      backgroundColor: '#111827',
                      color: 'white',
                      border: '1px solid #111827',
                      transition: 'all 0.15s ease',
                      minWidth: '160px',
                      height: '44px',
                      boxSizing: 'border-box'
                    }}>
                      Try Again
                    </Link>
                    <p style={{
                      fontSize: '0.75rem',
                      color: '#9ca3af',
                      margin: '0.5rem 0 0 0'
                    }}>
                      (Go to Checkout Page)
                    </p>
                  </div>
                )}
                
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
