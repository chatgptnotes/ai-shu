/**
 * Sentry Server-Side Configuration
 * Captures errors and performance metrics from the Next.js server
 */

import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;
const SENTRY_ENVIRONMENT = process.env.NEXT_PUBLIC_VERCEL_ENV || process.env.NODE_ENV;

Sentry.init({
  dsn: SENTRY_DSN,
  environment: SENTRY_ENVIRONMENT,

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: SENTRY_ENVIRONMENT === 'production' ? 0.1 : 1.0,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  // Ignore common errors
  ignoreErrors: [
    // Database connection errors (these are handled separately)
    'ECONNREFUSED',
    'ETIMEDOUT',
    // Expected authentication errors
    'Unauthorized',
    'Invalid token',
  ],

  beforeSend(event) {
    // Filter out non-error events in development
    if (SENTRY_ENVIRONMENT === 'development' && event.level !== 'error') {
      return null;
    }

    // Don't send events if Sentry is not configured
    if (!SENTRY_DSN) {
      return null;
    }

    // Add user context if available
    if (event.user) {
      // Remove sensitive data
      delete event.user.email;
      delete event.user.ip_address;
    }

    return event;
  },
});
