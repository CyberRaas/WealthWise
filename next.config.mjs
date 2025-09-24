// next.config.mjs

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Performance Optimizations
  experimental: {
    // Enable optimized CSS loading
    optimizeCss: true,
    // Enable partial pre-rendering
    ppr: false, // Enable when stable
  },

  // Server components optimization (moved from experimental)
  serverExternalPackages: ['mongoose', 'mongodb'],

  // Compiler optimizations
  compiler: {
    // Remove console logs in production
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn']
    } : false,
  },

  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    domains: ['mywealthwise.tech', 'localhost'],
    minimumCacheTTL: 60,
  },

  // Bundle optimization
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Optimize bundle splitting
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
          common: {
            name: 'common',
            minChunks: 2,
            priority: 10,
            reuseExistingChunk: true,
          },
        },
      }
    }

    // Add webpack plugins for production
    if (!dev) {
      config.plugins.push(
        new webpack.DefinePlugin({
          __DEV__: JSON.stringify(dev),
        })
      )
    }

    return config
  },

  // Headers for security and performance
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Security headers
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          // API-specific headers
          {
            key: 'Cache-Control',
            value: 'no-store, max-age=0',
          },
        ],
      },
      {
        source: '/(.*\\.(?:jpg|jpeg|gif|png|svg|ico|webp|avif))',
        headers: [
          // Image caching
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/(.*\\.(?:js|css))',
        headers: [
          // Static asset caching
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },

  // Environment variables
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },

  // Redirects
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ]
  },

  // Output configuration
  output: 'standalone',

  // PoweredByHeader
  poweredByHeader: false,

  // Compression
  compress: true,

  // Generate build ID
  generateBuildId: async () => {
    // Use git commit hash or timestamp
    return process.env.VERCEL_GIT_COMMIT_SHA || `build-${Date.now()}`
  },

  // Logging
  logging: {
    fetches: {
      fullUrl: process.env.NODE_ENV === 'development',
    },
  },
};

export default nextConfig;
