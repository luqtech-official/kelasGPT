/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Environment variables are no longer exposed to the browser for security
  // Server-side code can still access process.env directly
};

export default nextConfig;
