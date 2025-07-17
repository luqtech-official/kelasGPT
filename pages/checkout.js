import Head from "next/head";
import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/router";
import styles from "@/styles/Checkout.module.css";
import { getProductSettings, formatPrice } from "../lib/settings";
import { UserIcon, MailIcon, PhoneIcon, SecureShieldIcon } from "../components/icons";


export default function Checkout({ productSettings }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const router = useRouter();

  // Memoize formatted price to prevent unnecessary recalculations
  const formattedPrice = useMemo(() => 
    formatPrice(productSettings.productPrice), 
    [productSettings.productPrice]
  );

  // Client-side validation
  const validateForm = useCallback((data) => {
    const errors = {};
    
    if (!data.name?.trim()) {
      errors.name = 'Name is required';
    } else if (data.name.length > 30) {
      errors.name = 'Name must be 30 characters or less';
    }
    
    if (!data.email?.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!data.phone?.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!/^01[0-9]{8,9}$/.test(data.phone)) {
      errors.phone = 'Please enter a valid Malaysian phone number';
    }
    
    return errors;
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    // Prevent double submission
    if (loading) return;
    
    setLoading(true);
    setError(null);
    setValidationErrors({});

    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());

    // Client-side validation
    const errors = validateForm(data);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setLoading(false);
      return;
    }

    // Request timeout and abort controller
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    try {
      const response = await fetch("/api/create-payment-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        signal: controller.signal
      });

      clearTimeout(timeout);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create payment session");
      }

      const result = await response.json();
      if (result.payment_url) {
        router.push(result.payment_url);
      } else {
        router.push("/thankyou");
      }
    } catch (err) {
      clearTimeout(timeout);
      if (err.name === 'AbortError') {
        setError('Request timed out. Please try again.');
      } else {
        setError(err.message);
      }
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Secure Checkout - KelasGPT</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={styles.checkoutContainer}>
        <div className={styles.checkoutGrid}>
          
          {/* Left Column: Form */}
          <div className={styles.formWrapper}>
            <h1 className={styles.title}>Secure Checkout</h1>
            <p className={styles.subtitle}>Complete your purchase in just a few steps.</p>

            <form onSubmit={handleSubmit}>
              {/* This is a honeypot field to prevent spam. It's hidden from users. */}
              <div style={{ position: 'absolute', left: '-5000px' }} aria-hidden="true">
                <label htmlFor="honeypot">Dont fill this out if youre human:</label>
                <input type="text" id="honeypot" name="honeypot" tabIndex="-1" />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="name" className={styles.formLabel}>
                  Name
                </label>
                <div className={styles.inputWrapper}>
                  <UserIcon className={styles.inputIcon} />
                  <input 
                    type="text" 
                    id="name" 
                    name="name" 
                    maxLength="30" 
                    required 
                    className={`${styles.formInput} ${validationErrors.name ? styles.inputError : ''}`}
                    placeholder="John Doe"
                  />
                  {validationErrors.name && (
                    <p className={styles.fieldError}>{validationErrors.name}</p>
                  )}
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="email" className={styles.formLabel}>
                  Email
                </label>
                <div className={styles.inputWrapper}>
                   <MailIcon className={styles.inputIcon} />
                  <input 
                    type="email" 
                    id="email" 
                    name="email" 
                    required 
                    className={`${styles.formInput} ${validationErrors.email ? styles.inputError : ''}`}
                    placeholder="you@example.com"
                  />
                  {validationErrors.email && (
                    <p className={styles.fieldError}>{validationErrors.email}</p>
                  )}
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="phone" className={styles.formLabel}>
                  Phone Number
                </label>
                <div className={styles.inputWrapper}>
                    <PhoneIcon className={styles.inputIcon} />
                    <input
                        type="tel"
                        id="phone"
                        name="phone"
                        pattern="^01[0-9]{8,9}$"
                        title="Please enter a valid Malaysian phone number, without the Country Code"
                        required
                        className={`${styles.formInput} ${validationErrors.phone ? styles.inputError : ''}`}
                        placeholder="0123456789"
                    />
                    {validationErrors.phone && (
                      <p className={styles.fieldError}>{validationErrors.phone}</p>
                    )}
                </div>
              </div>

              <button 
                type="submit" 
                className={styles.submitButton}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className={styles.spinner}></div>
                    Processing...
                  </>
                ) : (
                  "Proceed"
                )}
              </button>
              
              {error && <p className={styles.errorMessage}>{error}</p>}
            </form>
          </div>

          {/* Right Column: Order Summary */}
          <div className={styles.summaryWrapper}>
            <h2 className={styles.summaryTitle}>Order Details</h2>
            
            <div className={styles.orderItem}>
                <div className={styles.itemDetails}>
                    <h3>{productSettings.productName}</h3>
                    <br></br>
                    <p>{productSettings.productDescription}</p>
                    <p>Lifetime access to all modules.</p>
                </div>
                <p className={styles.itemPrice}>{formattedPrice}</p>
            </div>

            <div className={styles.divider}></div>

            <div className={styles.priceRow}>
                <p>Subtotal</p>
                <p>{formattedPrice}</p>
            </div>
            <div className={styles.priceRow}>
                <p>Discount</p>
                <p>-RM0.00</p>
            </div>

            <div className={styles.divider}></div>

            <div className={styles.totalRow}>
                <p className={styles.totalLabel}>Total</p>
                <p className={styles.totalPrice}>{formattedPrice}</p>
            </div>
            
            <div className={styles.securityBadge}>
                <SecureShieldIcon />
                <p>
                    <strong>Secure Payment.</strong> All transactions are encrypted and protected.
                </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export async function getServerSideProps() {
  try {
    const productSettings = await getProductSettings();
    
    return {
      props: {
        productSettings
      }
    };
  } catch (error) {
    console.error('Error fetching product settings for checkout:', error);
    
    // Return default settings if there's an error
    return {
      props: {
        productSettings: {
          productName: 'KelasGPT - Instant Access x1',
          productPrice: 197.00,
          productDescription: 'Complete GPT-4 learning course in Malay language'
        }
      }
    };
  }
}
