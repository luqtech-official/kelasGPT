import Head from "next/head";
import styles from "@/styles/Home.module.css";

export default function ThankYou() {
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
