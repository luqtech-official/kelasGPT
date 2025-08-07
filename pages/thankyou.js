import Head from "next/head";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import styles from "@/styles/Home.module.css";
import { trackPurchase } from "../lib/facebook-pixel";
import { getProductSettings } from "../lib/settings";

export default function ThankYou() {
  const router = useRouter();
  const { query } = router;
  const [productSettings, setProductSettings] = useState(null);
  const [customerData, setCustomerData] = useState(null);

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
      const orderNumber = query.order_number || query.order_id;
      if (orderNumber) {
        try {
          const response = await fetch(`/api/get-customer-by-order?order_number=${encodeURIComponent(orderNumber)}`);
          if (response.ok) {
            const result = await response.json();
            if (result.success && result.customer) {
              setCustomerData(result.customer);
            }
          }
        } catch (error) {
          console.error('Error fetching customer data for thank you page:', error);
        }
      }
    };

    if (query.order_number || query.order_id) {
      fetchCustomerData();
    }
  }, [query.order_number, query.order_id]);

  // Track Purchase event as backup confirmation - With customer data for Advanced Matching
  useEffect(() => {
    if (productSettings) {
      // Extract order number from URL params if available
      const orderNumber = query.order_number || query.order_id || `backup-${Date.now()}`;
      
      // Add a delay to avoid duplicate events from payment-status page
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
      }, 2000); // Longer delay as this is backup tracking

      return () => clearTimeout(trackingTimer);
    }
  }, [productSettings, query, customerData]);

  return (
    <div className={styles.container}>
      <Head>
        <title>Terima Kasih - KelasGPT</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Terima Kasih!</h1>
        <p className={styles.description}>
          Pesanan anda telah diterima. Sila semak emel anda untuk butiran lanjut.
        </p>
      </main>
    </div>
  );
}
