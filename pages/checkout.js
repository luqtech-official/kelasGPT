import Head from "next/head";
import { useState, useMemo, useCallback, useEffect } from "react";
import { useRouter } from "next/router";
import styles from "@/styles/Checkout.module.css";
import { getProductSettings, formatPrice } from "../lib/settings";
import { UserIcon, MailIcon, PhoneIcon, SecureShieldIcon } from "../components/icons";
import { trackPageView } from '../lib/simpleTracking';


export default function Checkout({ productSettings }) {
  useEffect(() => {
    // 🔥 ENHANCED: Multi-source visitor ID resolution
    trackPageView('/checkout');  // NOW: Checks URL params first, then localStorage
    // This handles both same-browser navigation AND cross-browser transitions!
  }, []);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const router = useRouter();

  // Memoize formatted price to prevent unnecessary recalculations
  const formattedPrice = useMemo(() => 
    formatPrice(productSettings.productPrice), 
    [productSettings.productPrice]
  );

  // Input sanitization function
  const sanitizeInput = useCallback((input) => {
    if (!input) return '';
    // Only remove dangerous HTML characters, preserve spaces
    return input.replace(/[<>"']/g, '');
  }, []);

  // No phone formatting - keep as user types
  const formatPhone = useCallback((value) => {
    // Only allow digits, no formatting
    return value.replace(/\D/g, '');
  }, []);

  // Client-side validation (updated to match server-side regex)
  const validateForm = useCallback((data) => {
    const errors = {};
    
    if (!data.name?.trim()) {
      errors.name = 'Name is required';
    } else if (data.name.length > 30) {
      errors.name = 'Name must be 30 characters or less';
    }
    
    if (!data.email?.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(data.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!data.phone?.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!/^01[0-9]{8,9}$/.test(data.phone)) {
      errors.phone = 'Please enter a valid Malaysian phone number';
    }
    
    return errors;
  }, []);

  // Handle input changes
  const handleInputChange = useCallback((field, value) => {
    let sanitizedValue = sanitizeInput(value);
    
    // Apply phone formatting
    if (field === 'phone') {
      sanitizedValue = formatPhone(sanitizedValue);
    }
    
    setFormData(prev => ({
      ...prev,
      [field]: sanitizedValue
    }));
    
    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }, [sanitizeInput, formatPhone, validationErrors]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    // Prevent double submission
    if (loading) return;
    
    setLoading(true);
    setError(null);
    setValidationErrors({});

    // Use controlled form data instead of FormData
    const data = {
      name: sanitizeInput(formData.name),
      email: sanitizeInput(formData.email),
      phone: sanitizeInput(formData.phone), // No formatting to remove
      honeypot: '' // Honeypot is always empty for real users
    };

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
        
        // Enhanced error handling for structured API responses
        let errorMessage = errorData.message || "Failed to create payment session";
        
        if (errorData.code === 'ORDER_PENDING' && errorData.waitTime) {
          errorMessage = `${errorData.message} (${errorData.waitTime} minute(s) remaining)`;
        } else if (errorData.code === 'ORDER_COMPLETED') {
          errorMessage = `${errorData.message} Contact: ${errorData.supportEmail || 'support@kelasgpt.com'}`;
        } else if (errorData.action && errorData.supportEmail) {
          errorMessage = `${errorData.message} ${errorData.action} Contact: ${errorData.supportEmail}`;
        }
        
        throw new Error(errorMessage);
      }

      const result = await response.json();
      if (result.payment_url) {
        router.push(result.payment_url);
      } else {
        router.push("/thankyou");
      }
    } catch (err) {
      clearTimeout(timeout);
      
      // Enhanced error handling
      if (err.name === 'AbortError') {
        setError('Request timed out. Please check your connection and try again.');
      } else if (!navigator.onLine) {
        setError('No internet connection. Please check your network and try again.');
      } else if (err.message.includes('fetch') || err.message.includes('NetworkError')) {
        setError('Network error. Please try again.');
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
        <meta name="description" content="Complete your KelasGPT course purchase securely with FPX bank transfer" />
        <meta name="robots" content="noindex, nofollow" />
        <link rel="canonical" href="/checkout" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <noscript>
        <div style={{padding: '20px', background: '#f8d7da', color: '#721c24', textAlign: 'center'}}>
          <p>JavaScript is required for secure checkout. Please enable JavaScript in your browser.</p>
        </div>
      </noscript>

      <div className={styles.checkoutContainer}>
        <div className={styles.checkoutGrid}>
          
          {/* Left Column: Form */}
          <div className={styles.formWrapper}>
            <h1 className={styles.title}>Secure Checkout</h1>
            <p className={styles.subtitle}>Complete your purchase in just a few steps.</p>

            <form onSubmit={handleSubmit}>
              <fieldset disabled={loading} style={{ border: 'none', padding: 0, margin: 0 }}>
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
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={`${styles.formInput} ${validationErrors.name ? styles.inputError : ''}`}
                    placeholder="John Doe"
                    aria-describedby={validationErrors.name ? "name-error" : undefined}
                    aria-invalid={validationErrors.name ? "true" : "false"}
                  />
                  {validationErrors.name && (
                    <p 
                      className={styles.fieldError}
                      id="name-error"
                      role="alert"
                    >
                      {validationErrors.name}
                    </p>
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
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`${styles.formInput} ${validationErrors.email ? styles.inputError : ''}`}
                    placeholder="you@example.com"
                    aria-describedby={validationErrors.email ? "email-error" : undefined}
                    aria-invalid={validationErrors.email ? "true" : "false"}
                  />
                  {validationErrors.email && (
                    <p 
                      className={styles.fieldError}
                      id="email-error"
                      role="alert"
                    >
                      {validationErrors.email}
                    </p>
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
                        title="Please enter a valid Malaysian phone number (10-11 digits starting with 01)"
                        required
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className={`${styles.formInput} ${validationErrors.phone ? styles.inputError : ''}`}
                        placeholder="01123456789"
                        aria-describedby={validationErrors.phone ? "phone-error" : undefined}
                        aria-invalid={validationErrors.phone ? "true" : "false"}
                    />
                    {validationErrors.phone && (
                      <p 
                        className={styles.fieldError}
                        id="phone-error"
                        role="alert"
                      >
                        {validationErrors.phone}
                      </p>
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
              
              {error && (
                <p 
                  className={styles.errorMessage}
                  role="alert"
                  aria-live="polite"
                >
                  {error}
                </p>
              )}
              </fieldset>
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
