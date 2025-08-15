/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable experimental features for better performance
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client'],
  },

  // Optimize for Vercel
  output: 'standalone',

  // Handle dynamic routes properly
  trailingSlash: false,

  // Environment variables for Vercel
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },

  // Image optimization
  images: {
    domains: ['localhost'],
    unoptimized: false,
  },

  // Webpack configuration for Prisma
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push('@prisma/client')
    }
    return config
  },

  // Disable ESLint during build for Vercel
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Disable TypeScript checking during build for Vercel
  typescript: {
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig
