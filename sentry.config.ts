import * as Sentry from "@sentry/nextjs";

const SENTRY_AUTH_TOKEN = process.env.SENTRY_AUTH_TOKEN;

export function initSentry() {
  if (!process.env.NEXT_PUBLIC_SENTRY_DSN) {
    console.warn("Sentry not configured. Set NEXT_PUBLIC_SENTRY_DSN to enable error tracking.");
    return;
  }

  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    environment: process.env.NODE_ENV,
    enabled: process.env.NODE_ENV === "production",

    // Performance Monitoring
    tracesSampleRate: 0.1,

    // Release tracking
    release: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 8) || "unknown",
  });
}

export { Sentry };
