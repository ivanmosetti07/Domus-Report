import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring
  // Adjust this value in production
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

  // Environment detection
  environment: process.env.NODE_ENV || "development",

  // Filter sensitive data
  beforeSend(event) {
    // Don't send auth tokens
    if (event.request?.headers) {
      delete event.request.headers.Authorization
      delete event.request.headers.Cookie
    }
    return event
  },
})
