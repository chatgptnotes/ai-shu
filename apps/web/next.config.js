const { withSentryConfig } = require('@sentry/nextjs');
const withNextIntl = require('./next-intl.plugin');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@ai-shu/ui', '@ai-shu/types'],
  images: {
    domains: ['d-id.com', 'api.d-id.com'],
  },
  env: {
    NEXT_PUBLIC_APP_VERSION: process.env.npm_package_version || '0.1.0',
  },
};

// Sentry configuration
const sentryWebpackPluginOptions = {
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options

  // Suppresses source map uploading logs during build
  silent: true,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
};

const sentryOptions = {
  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Transpiles SDK to be compatible with IE11 (increases bundle size)
  transpileClientSDK: false,

  // Routes browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers (increases server load)
  tunnelRoute: '/monitoring',

  // Hides source maps from generated client bundles
  hideSourceMaps: true,

  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,

  // Enables automatic instrumentation of Vercel Cron Monitors.
  automaticVercelMonitors: true,
};

// Apply next-intl plugin first, then Sentry if configured
const configWithIntl = withNextIntl(nextConfig);

// Make sure adding Sentry options is the last code to run before exporting
module.exports = process.env.NEXT_PUBLIC_SENTRY_DSN
  ? withSentryConfig(configWithIntl, sentryWebpackPluginOptions, sentryOptions)
  : configWithIntl;
