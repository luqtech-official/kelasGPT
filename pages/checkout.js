import Head from "next/head";
import { useState } from "react";
import { useRouter } from "next/router";
import styles from "@/styles/Checkout.module.css"; // Use the new CSS module
import { getProductSettings, formatPrice } from "../lib/settings";

// --- SVG Icons ---
// Using inline SVGs for icons to avoid extra dependencies and allow easy styling.
const UserIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

const MailIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="20" height="16" x="2" y="4" rx="2"></rect>
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
  </svg>
);

const PhoneIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
    </svg>
);

const SecureShieldIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
        <path d="m9 12 2 2 4-4"></path>
    </svg>
);


export default function Checkout({ productSettings }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());

    try {
      // This is a mock API call. Replace with your actual API endpoint.
      const response = await fetch("/api/create-payment-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create payment session");
      }

      const result = await response.json();
      if (result.payment_url) {
        // Redirect to the actual payment gateway
        router.push(result.payment_url);
      } else {
        // Fallback for simulated success if payment_url is not present
        router.push("/thankyou");
      }
    } catch (err) {
      setError(err.message);
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
                    className={styles.formInput}
                    placeholder="John Doe"
                  />
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
                    className={styles.formInput}
                    placeholder="you@example.com"
                  />
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
                        className={styles.formInput}
                        placeholder="0123456789"
                    />
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
                <p className={styles.itemPrice}>{formatPrice(productSettings.productPrice)}</p>
            </div>

            <div className={styles.divider}></div>

            <div className={styles.priceRow}>
                <p>Subtotal</p>
                <p>{formatPrice(productSettings.productPrice)}</p>
            </div>
            <div className={styles.priceRow}>
                <p>Discount</p>
                <p>-RM0.00</p>
            </div>

            <div className={styles.divider}></div>

            <div className={styles.totalRow}>
                <p className={styles.totalLabel}>Total</p>
                <p className={styles.totalPrice}>{formatPrice(productSettings.productPrice)}</p>
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
