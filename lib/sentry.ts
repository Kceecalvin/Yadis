/**
 * Sentry Error Monitoring Configuration
 * Centralized error tracking and logging
 */

import * as Sentry from "@sentry/nextjs";

export const initSentry = () => {
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      environment: process.env.NODE_ENV,
      tracesSampleRate: 1.0,
      debug: process.env.NODE_ENV === 'development',
      
      // Performance monitoring
      integrations: [
        new Sentry.Replay({
          maskAllText: true,
          blockAllMedia: true,
        }),
      ],
      
      // Session replay settings
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
      
      // Ignore certain errors
      ignoreErrors: [
        // Browser extensions
        'top.GLOBALS',
        // Random plugins/extensions
        'chrome-extension://',
        'moz-extension://',
      ],
      
      // Denylist URLs for errors
      denyUrls: [
        /extensions\//i,
        /^chrome:\/\//i,
        /^moz-extension:\/\//i,
      ],
    });
  }
};

/**
 * Capture exception with additional context
 */
export const captureException = (
  error: Error | string,
  context?: Record<string, any>
) => {
  if (typeof error === 'string') {
    Sentry.captureException(new Error(error), { extra: context });
  } else {
    Sentry.captureException(error, { extra: context });
  }
};

/**
 * Capture message event
 */
export const captureMessage = (
  message: string,
  level: Sentry.SeverityLevel = 'info',
  context?: Record<string, any>
) => {
  Sentry.captureMessage(message, level);
  if (context) {
    Sentry.setContext('message', context);
  }
};

/**
 * Set user context for error tracking
 */
export const setUserContext = (userId: string, email?: string, username?: string) => {
  Sentry.setUser({
    id: userId,
    email,
    username,
  });
};

/**
 * Clear user context on logout
 */
export const clearUserContext = () => {
  Sentry.setUser(null);
};

/**
 * Add breadcrumb for tracking user actions
 */
export const addBreadcrumb = (
  message: string,
  category: string = 'user-action',
  level: Sentry.SeverityLevel = 'info',
  data?: Record<string, any>
) => {
  Sentry.addBreadcrumb({
    message,
    category,
    level,
    data,
    timestamp: Date.now() / 1000,
  });
};

/**
 * Track API requests
 */
export const trackApiRequest = (
  method: string,
  endpoint: string,
  status: number,
  duration: number
) => {
  addBreadcrumb(
    `${method} ${endpoint}`,
    'api-request',
    status >= 400 ? 'warning' : 'info',
    { status, duration }
  );
};

/**
 * Track payment events
 */
export const trackPaymentEvent = (
  event: 'initiated' | 'processing' | 'success' | 'failed',
  paymentMethod: string,
  amount: number,
  metadata?: Record<string, any>
) => {
  addBreadcrumb(
    `Payment ${event}`,
    'payment',
    event === 'failed' ? 'error' : 'info',
    { paymentMethod, amount, ...metadata }
  );
};

/**
 * Track order events
 */
export const trackOrderEvent = (
  event: 'created' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled',
  orderId: string,
  metadata?: Record<string, any>
) => {
  addBreadcrumb(
    `Order ${event}`,
    'order',
    'info',
    { orderId, ...metadata }
  );
};

/**
 * Track authentication events
 */
export const trackAuthEvent = (
  event: 'login' | 'logout' | 'register' | 'password_reset',
  status: 'success' | 'failed',
  metadata?: Record<string, any>
) => {
  addBreadcrumb(
    `Auth ${event} ${status}`,
    'authentication',
    status === 'failed' ? 'warning' : 'info',
    metadata
  );
};

/**
 * Wrap async function with error handling
 */
export const withErrorHandling = async <T>(
  fn: () => Promise<T>,
  context: string
): Promise<T | null> => {
  try {
    return await fn();
  } catch (error) {
    captureException(error as Error, { context });
    return null;
  }
};

/**
 * Error logger for development
 */
export const logError = (
  error: Error | string,
  context?: string
) => {
  if (typeof error === 'string') {
    console.error(`[${context || 'Error'}]`, error);
  } else {
    console.error(`[${context || 'Error'}]`, error.message, error.stack);
  }
};

/**
 * Performance monitoring wrapper
 */
export const measurePerformance = async <T>(
  fn: () => Promise<T>,
  label: string
): Promise<T> => {
  const start = performance.now();
  try {
    const result = await fn();
    const duration = performance.now() - start;
    
    if (duration > 1000) {
      captureMessage(`Slow operation: ${label} took ${duration.toFixed(2)}ms`, 'warning', {
        label,
        duration,
      });
    }
    
    return result;
  } catch (error) {
    const duration = performance.now() - start;
    captureException(error as Error, {
      label,
      duration,
    });
    throw error;
  }
};
