// next.config.mjs

/** @type {import('next').NextConfig} */
const nextConfig = {
    // Disable Cloudflare Web Analytics beacon injection
    headers: async () => [
        {
            source: '/:path*',
            headers: [
                {
                    key: 'X-DNS-Prefetch-Control',
                    value: 'on'
                },
                {
                    key: 'Strict-Transport-Security',
                    value: 'max-age=63072000; includeSubDomains; preload'
                },
                {
                    key: 'X-Frame-Options',
                    value: 'SAMEORIGIN'
                },
                {
                    key: 'X-Content-Type-Options',
                    value: 'nosniff'
                },
                {
                    key: 'Referrer-Policy',
                    value: 'origin-when-cross-origin'
                }
            ]
        }
    ],

    // Production optimization
    reactStrictMode: true,
    poweredByHeader: false,
    compress: true,

    // Environment variables
    env: {
        NEXTAUTH_URL: process.env.NEXTAUTH_URL || process.env.AUTH_URL,
        AUTH_URL: process.env.AUTH_URL || process.env.NEXTAUTH_URL,
    },

    // Image optimization
    images: {
        domains: ['www.mywealthwise.tech', 'mywealthwise.tech', 'lh3.googleusercontent.com'],
        formats: ['image/avif', 'image/webp'],
    },

  // Experimental features for better performance
  experimental: {
    // optimizeCss: true, // Disabled - requires critters package
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
};export default nextConfig;
