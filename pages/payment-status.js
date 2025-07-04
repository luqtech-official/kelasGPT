import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Head from "next/head";
import Link from "next/link";
import styles from "@/styles/Home.module.css";

export default function PaymentStatusPage() {
  const router = useRouter();
  const { query } = router;
  const [message, setMessage] = useState('Processing your payment status...');

  useEffect(() => {
    if (query.payment_status) {
      if (query.payment_status === 'true') {
        setMessage(`Payment successful! Thank you for your order #${query.order_number}. We are processing it now.`);
      } else {
        setMessage(`Payment failed or was cancelled for order #${query.order_number}. Please try again.`);
      }
    } else if (Object.keys(query).length > 0) {
      setMessage('Thank you for your payment attempt. We are confirming the final status with the bank.');
    }
  }, [query]);

  return (
    <div className={styles.container}>
      <Head>
        <title>Payment Status - KelasGPT</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Payment Status</h1>
        <p className={styles.description}>{message}</p>
        <Link href="/" legacyBehavior>
          <a className={styles.primary}>Go back to Home</a>
        </Link>
      </main>
    </div>
  );
}
