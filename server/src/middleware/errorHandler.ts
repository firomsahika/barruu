import { Request, Response, NextFunction } from 'express';
import { AppError } from '../lib/errors';
import { logger } from '../lib/logger';
import { ZodError } from 'zod';
import { captureException } from '../lib/errorTracking';

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const reqId = (req.headers['x-request-id'] as string) || undefined;
  const path = req.originalUrl || req.url;
  const method = req.method;

  // 1. Handled AppError
  if (err instanceof AppError) {
    logger.warn(`Operational error [${err.errorCode}]: ${err.message}`, {
      reqId,
      path,
      method,
      statusCode: err.statusCode,
      errorCode: err.errorCode,
    });

    res.status(err.statusCode).json({
      error: err.message,
      errorCode: err.errorCode,
    });
    return;
  }

  // 2. Zod Validation Error
  if (err instanceof ZodError) {
    const formattedErrors = err.flatten();
    logger.warn('Request validation failed', {
      reqId,
      path,
      method,
      statusCode: 400,
      validationErrors: formattedErrors,
    });

    res.status(400).json({
      error: 'Odeeffannoo dogoggoraa galchitan',
      errorCode: 'VALIDATION_ERROR',
      details: formattedErrors.fieldErrors,
    });
    return;
  }

  // 3. Unhandled Server Error
  captureException(err, { reqId, path, method });

  logger.error('Unhandled internal server error', err, {
    reqId,
    path,
    method,
    statusCode: 500,
  });

  res.status(500).json({
    error: 'Dogoggora serverii keessaa',
    errorCode: 'INTERNAL_SERVER_ERROR',
  });
}
