// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs"

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN

Sentry.init({
  dsn: SENTRY_DSN,

  // Only enable in production
  enabled: process.env.NODE_ENV === 'production',

  // Performance Monitoring - keep low for free tier
  tracesSampleRate: 0.1,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  // Environment tag
  environment: process.env.NODE_ENV,

  // Filter sensitive data before sending
  beforeSend(event) {
    // Don't send in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[Sentry Server] Would send event:', event.exception?.values?.[0]?.value)
      return null
    }

    // Remove sensitive request data
    if (event.request) {
      // Remove authorization headers
      if (event.request.headers) {
        delete event.request.headers['authorization']
        delete event.request.headers['cookie']
        delete event.request.headers['x-auth-token']
      }

      // Remove sensitive body data
      if (event.request.data) {
        try {
          const data = typeof event.request.data === 'string'
            ? JSON.parse(event.request.data)
            : event.request.data

          if (data.password) data.password = '[FILTERED]'
          if (data.otp) data.otp = '[FILTERED]'
          if (data.token) data.token = '[FILTERED]'

          event.request.data = JSON.stringify(data)
        } catch (e) {
          // If parsing fails, clear the data
          event.request.data = '[FILTERED]'
        }
      }
    }

    return event
  },

  // Ignore known non-critical errors
  ignoreErrors: [
    'ECONNREFUSED',
    'ENOTFOUND',
    'ETIMEDOUT',
    'socket hang up',
  ],
})
