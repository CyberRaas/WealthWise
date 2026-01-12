// next.config.mjs
import { withSentryConfig } from '@sentry/nextjs'

/** @type {import('next').NextConfig} */
const nextConfig = {
    // Security and PWA headers
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
        },
        {
            source: '/sw.js',
            headers: [
                {
                    key: 'Cache-Control',
                    value: 'public, max-age=0, must-revalidate'
                },
                {
                    key: 'Service-Worker-Allowed',
                    value: '/'
                }
            ]
        },
        {
            source: '/manifest.json',
            headers: [
                {
                    key: 'Content-Type',
                    value: 'application/manifest+json'
                },
                {
                    key: 'Cache-Control',
                    value: 'public, max-age=31536000, immutable'
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
        domains: ['www.mywealthwise.in', 'mywealthwise.in', 'lh3.googleusercontent.com'],
        formats: ['image/avif', 'image/webp'],
    },

    // Experimental features for better performance
    experimental: {
        // optimizeCss: true, // Disabled - requires critters package
        optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
    },
};

// Sentry configuration options
const sentryWebpackPluginOptions = {
    // For all available options, see:
    // https://github.com/getsentry/sentry-webpack-plugin#options

    org: process.env.SENTRY_ORG,
    project: process.env.SENTRY_PROJECT,

    // Only print logs for uploading source maps in CI
    silent: !process.env.CI,

    // Upload source maps for better error tracking
    widenClientFileUpload: true,

    // Automatically tree-shake Sentry logger statements to reduce bundle size
    disableLogger: true,

    // Hides source maps from generated client bundles
    hideSourceMaps: true,

    // Automatically instrument React components
    reactComponentAnnotation: {
        enabled: true,
    },

    // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers
    tunnelRoute: "/monitoring",
};

// Wrap config with Sentry only if DSN is configured
const finalConfig = process.env.NEXT_PUBLIC_SENTRY_DSN
    ? withSentryConfig(nextConfig, sentryWebpackPluginOptions)
    : nextConfig;

export default finalConfig;
