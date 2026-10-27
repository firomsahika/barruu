import pino, { LoggerOptions } from 'pino';

const isProduction = process.env.NODE_ENV === 'production';

export function createPinoInstance(options?: LoggerOptions) {
  return pino({
    level: process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug'),
    timestamp: pino.stdTimeFunctions.isoTime,
    formatters: {
      level(label) {
        return { level: label };
      },
    },
    ...options,
  });
}

export const pinoInstance = createPinoInstance();

export interface LogContext {
  reqId?: string;
  userId?: string;
  statusCode?: number;
  durationMs?: number;
  path?: string;
  route?: string;
  method?: string;
  err?: unknown;
  [key: string]: unknown;
}

export class Logger {
  private instance: pino.Logger;

  constructor(customInstance?: pino.Logger) {
    this.instance = customInstance || pinoInstance;
  }

  get level(): string {
    return this.instance.level;
  }

  set level(newLevel: string) {
    this.instance.level = newLevel;
  }

  info(messageOrContext: string | LogContext, messageOrContext2?: string | LogContext): void {
    if (typeof messageOrContext === 'object' && typeof messageOrContext2 === 'string') {
      this.instance.info(messageOrContext, messageOrContext2);
    } else if (typeof messageOrContext === 'string' && typeof messageOrContext2 === 'object') {
      this.instance.info(messageOrContext2, messageOrContext);
    } else if (typeof messageOrContext === 'string') {
      this.instance.info(messageOrContext);
    } else {
      this.instance.info(messageOrContext);
    }
  }

  warn(messageOrContext: string | LogContext, messageOrContext2?: string | LogContext): void {
    if (typeof messageOrContext === 'object' && typeof messageOrContext2 === 'string') {
      this.instance.warn(messageOrContext, messageOrContext2);
    } else if (typeof messageOrContext === 'string' && typeof messageOrContext2 === 'object') {
      this.instance.warn(messageOrContext2, messageOrContext);
    } else if (typeof messageOrContext === 'string') {
      this.instance.warn(messageOrContext);
    } else {
      this.instance.warn(messageOrContext);
    }
  }

  error(
    messageOrContext: string | LogContext,
    errorOrMessage?: unknown,
    context?: LogContext
  ): void {
    // Case 1: logger.error({ err: error, route: req.path }, 'Get articles error')
    if (typeof messageOrContext === 'object' && typeof errorOrMessage === 'string') {
      const ctx = { ...messageOrContext };
      if (ctx.err instanceof Error) {
        ctx.err = {
          message: ctx.err.message,
          name: ctx.err.name,
          stack: ctx.err.stack,
        };
      }
      this.instance.error(ctx, errorOrMessage);
      return;
    }

    // Case 2: logger.error('Get articles error', error, { route: req.path })
    const message = typeof messageOrContext === 'string' ? messageOrContext : 'An error occurred';
    const error = errorOrMessage;
    const errorDetails =
      error instanceof Error
        ? {
            err: {
              message: error.message,
              name: error.name,
              stack: error.stack,
            },
          }
        : error !== undefined
        ? { rawError: error }
        : {};

    const mergedContext = { ...context, ...errorDetails };
    if (Object.keys(mergedContext).length > 0) {
      this.instance.error(mergedContext, message);
    } else {
      this.instance.error(message);
    }
  }

  debug(messageOrContext: string | LogContext, messageOrContext2?: string | LogContext): void {
    if (typeof messageOrContext === 'object' && typeof messageOrContext2 === 'string') {
      this.instance.debug(messageOrContext, messageOrContext2);
    } else if (typeof messageOrContext === 'string' && typeof messageOrContext2 === 'object') {
      this.instance.debug(messageOrContext2, messageOrContext);
    } else if (typeof messageOrContext === 'string') {
      this.instance.debug(messageOrContext);
    } else {
      this.instance.debug(messageOrContext);
    }
  }
}

export const logger = new Logger();
