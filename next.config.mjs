/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configure custom port if needed
  // By default Next.js uses port 3000
  // You can override this by setting the PORT environment variable
  // or by running: npm run dev -- -p 3001
  
  experimental: {
    // Enable experimental features if needed
  },
  
  // Configure custom server options
  serverRuntimeConfig: {
    // Will only be available on the server side
  },
  
  publicRuntimeConfig: {
    // Will be available on both server and client
  },
  
  // Configure environment variables
  env: {
    // Custom environment variables
  },
  
  // Configure redirects if needed
  async redirects() {
    return []
  },
  
  // Configure rewrites if needed
  async rewrites() {
    return []
  }
}

export default nextConfig