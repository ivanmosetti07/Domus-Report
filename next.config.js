const { withSentryConfig } = require("@sentry/nextjs")

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
}

// Sentry configuration options
const sentryWebpackPluginOptions = {
  // Suppress source map upload logs
  silent: true,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  // Only upload source maps in production
  dryRun: process.env.NODE_ENV !== "production",
}

// Export with Sentry wrapper
module.exports = withSentryConfig(nextConfig, sentryWebpackPluginOptions)
