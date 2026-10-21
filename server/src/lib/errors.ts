export class AppError extends Error {
  public readonly statusCode: number;
  public readonly errorCode: string;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode = 500, errorCode = 'INTERNAL_ERROR', isOperational = true) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message: string, errorCode = 'BAD_REQUEST'): AppError {
    return new AppError(message, 400, errorCode);
  }

  static unauthorized(message = 'Seena - mirkaneessa barbaachisa', errorCode = 'UNAUTHORIZED'): AppError {
    return new AppError(message, 401, errorCode);
  }

  static forbidden(message = 'Hayyama hin qabdu', errorCode = 'FORBIDDEN'): AppError {
    return new AppError(message, 403, errorCode);
  }

  static notFound(message = 'Wanti barbaaddan hin argamne', errorCode = 'NOT_FOUND'): AppError {
    return new AppError(message, 404, errorCode);
  }

  static conflict(message: string, errorCode = 'CONFLICT'): AppError {
    return new AppError(message, 409, errorCode);
  }

  static internal(message = 'Dogoggora serverii keessaa', errorCode = 'INTERNAL_ERROR'): AppError {
    return new AppError(message, 500, errorCode);
  }
}
