/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Enable compression for better performance
  compress: true,
  compiler: {
    removeConsole: true,
  },
  // Optimize package imports to reduce Edge requests
  experimental: {
    optimizePackageImports: [
      'next/image', 
      'next/head', 
      'next/link'
    ]
  },
  // Environment variables are no longer exposed to the browser for security
  // Server-side code can still access process.env directly
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.novalnet.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'ik.imagekit.io',
        port: '',
        pathname: '/**',
      },
    ],
    // Optimize image loading and caching
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ['image/webp'],
    minimumCacheTTL: 31536000, // 1 year cache for images
    dangerouslyAllowSVG: false,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  // Custom headers for proper caching - FIXED VERSION
  async headers() {
    return [
      {
        // Cache static assets (JS, CSS, images) for 1 year
        source: '/(_next/static|favicon.ico|robots.txt|sitemap.xml)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Strictly disable caching for admin and tracker pages to ensure UI and data freshness
        source: '/(admin|agenttracker):path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate, proxy-revalidate' },
          { key: 'Pragma', value: 'no-cache' },
          { key: 'Expires', value: '0' },
        ],
      },
      {
        // Strictly disable caching for API routes to ensure data freshness
        source: '/api/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store' },
        ],
      },
      // Public pages will fall back to default Next.js caching (usually SSG/ISR or default headers)
      // We removed the blanket 'max-age=0' rule so public pages can be cached properly.
    ];
  },
};

export default nextConfig;
