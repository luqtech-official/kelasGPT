import Head from 'next/head';

export default function Home() {
  return (
    <>
      <Head>
        <title>Kelas AI Untuk Business - Coming Soon</title>
        <meta name="description" content="Kelas AI Untuk Business - Coming Soon" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif'
      }}>
        <div style={{
          textAlign: 'center',
          color: 'white',
          maxWidth: '600px',
          padding: '2rem'
        }}>
          <h1 style={{
            fontSize: '3.5rem',
            fontWeight: 700,
            marginBottom: '1rem',
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
          }}>
            Kelas AI Untuk Business
          </h1>
          <p style={{
            fontSize: '1.5rem',
            marginBottom: '2rem',
            opacity: 0.9,
            fontWeight: 300
          }}>
            Coming Soon
          </p>
          <div style={{
            fontSize: '1.1rem',
            lineHeight: 1.6,
            opacity: 0.8
          }}>
            <p style={{ marginBottom: '1rem' }}>
              We're working on something amazing for Malaysian businesses.
            </p>
            <p style={{ marginBottom: '1rem' }}>
              Stay tuned for the future of AI-powered business solutions.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
