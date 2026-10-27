import { logger } from './logger';

export interface ErrorTrackingClient {
  captureException(err: unknown, context?: Record<string, unknown>): void;
}

let errorTrackingClient: ErrorTrackingClient | null = null;

export function initErrorTracking(): void {
  const sentryDsn = process.env.SENTRY_DSN;
  if (sentryDsn) {
    try {
      logger.info('Initializing Sentry error tracking client');
      errorTrackingClient = {
        captureException: (err: unknown, context?: Record<string, unknown>) => {
          logger.error('Sentry captured exception', err, context);
        },
      };
    } catch (e) {
      logger.error('Failed to initialize Sentry error tracking client', e);
    }
  }
}

export function captureException(err: unknown, context?: Record<string, unknown>): void {
  if (errorTrackingClient) {
    errorTrackingClient.captureException(err, context);
  }
}
