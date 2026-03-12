const nextConfig = {
  i18n: {
    locales: ['en'],
    defaultLocale: 'en',
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pub-e13b23f611944371985db7aa97d5341c.r2.dev',
        pathname: '/**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ]
  },

  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = { fs: false, path: false }
    }
    return config
  },
}

module.exports = nextConfig