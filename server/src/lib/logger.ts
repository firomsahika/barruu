import pino from 'pino';

const isProduction = process.env.NODE_ENV === 'production';

export const pinoInstance = pino({
  level: process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug'),
  timestamp: pino.stdTimeFunctions.isoTime,
  formatters: {
    level(label) {
      return { level: label };
    },
  },
});

export interface LogContext {
  reqId?: string;
  userId?: string;
  statusCode?: number;
  durationMs?: number;
  path?: string;
  method?: string;
  [key: string]: unknown;
}

class Logger {
  info(message: string, context?: LogContext): void {
    if (context) {
      pinoInstance.info(context, message);
    } else {
      pinoInstance.info(message);
    }
  }

  warn(message: string, context?: LogContext): void {
    if (context) {
      pinoInstance.warn(context, message);
    } else {
      pinoInstance.warn(message);
    }
  }

  error(message: string, error?: unknown, context?: LogContext): void {
    const errorDetails =
      error instanceof Error
        ? {
            err: {
              message: error.message,
              name: error.name,
              stack: error.stack,
            },
          }
        : { rawError: error };

    pinoInstance.error({ ...context, ...errorDetails }, message);
  }

  debug(message: string, context?: LogContext): void {
    if (context) {
      pinoInstance.debug(context, message);
    } else {
      pinoInstance.debug(message);
    }
  }
}

export const logger = new Logger();
