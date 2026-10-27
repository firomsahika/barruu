import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { errorHandler } from '../middleware/errorHandler';
import { AppError } from '../lib/errors';
import { z, ZodError } from 'zod';

describe('Centralized ErrorHandler Middleware Tests', () => {
  const createMockReqRes = (headers: Record<string, string> = {}) => {
    const req: any = {
      headers,
      originalUrl: '/api/test-route',
      method: 'GET',
    };
    const res: any = {
      statusCode: 200,
      jsonBody: null,
      status(code: number) {
        this.statusCode = code;
        return this;
      },
      json(body: any) {
        this.jsonBody = body;
        return this;
      },
    };
    return { req, res };
  };

  test('handles AppError with operational status and error code', () => {
    const { req, res } = createMockReqRes({ 'x-request-id': 'req-abc-123' });
    const appError = AppError.notFound('Barruu hin argamne', 'ARTICLE_NOT_FOUND');

    errorHandler(appError, req, res, () => {});

    assert.equal(res.statusCode, 404);
    assert.equal(res.jsonBody.error, 'Barruu hin argamne');
    assert.equal(res.jsonBody.errorCode, 'ARTICLE_NOT_FOUND');
  });

  test('handles ZodError with 400 validation error formatting', () => {
    const { req, res } = createMockReqRes();
    const schema = z.object({ title: z.string().min(5) });
    let zodError: ZodError | null = null;
    try {
      schema.parse({ title: 'abc' });
    } catch (e: any) {
      zodError = e;
    }

    assert(zodError);
    errorHandler(zodError, req, res, () => {});

    assert.equal(res.statusCode, 400);
    assert.equal(res.jsonBody.errorCode, 'VALIDATION_ERROR');
    assert(res.jsonBody.details.title);
  });

  test('handles unhandled native errors with 500 INTERNAL_SERVER_ERROR', () => {
    const { req, res } = createMockReqRes();
    const genericError = new Error('Unexpected database fault');

    errorHandler(genericError, req, res, () => {});

    assert.equal(res.statusCode, 500);
    assert.equal(res.jsonBody.errorCode, 'INTERNAL_SERVER_ERROR');
    assert.equal(res.jsonBody.error, 'Dogoggora serverii keessaa');
  });
});
