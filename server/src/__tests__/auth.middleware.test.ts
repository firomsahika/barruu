import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import { authenticate, requireAdmin, optionalAuth, AuthRequest } from '../middleware/auth';

const TEST_SECRET = 'test_jwt_secret_for_unit_tests_123456';
process.env.JWT_SECRET = TEST_SECRET;

function createMockReqRes(options: {
  authorization?: string;
  user?: { id: string; email: string; role: string };
} = {}) {
  const req = {
    headers: {
      ...(options.authorization ? { authorization: options.authorization } : {}),
    },
    user: options.user,
  } as unknown as AuthRequest;

  let statusCode = 200;
  let jsonResponse: unknown = null;

  const res = {
    status(code: number) {
      statusCode = code;
      return this;
    },
    json(payload: unknown) {
      jsonResponse = payload;
      return this;
    },
  };

  let nextCalled = false;
  const next = () => {
    nextCalled = true;
  };

  return {
    req,
    res,
    next,
    getStatusCode: () => statusCode,
    getJsonResponse: () => jsonResponse,
    isNextCalled: () => nextCalled,
  };
}

describe('Auth Middleware', () => {
  describe('authenticate', () => {
    it('returns 401 when Authorization header is missing', () => {
      const { req, res, next, getStatusCode, isNextCalled } = createMockReqRes();
      authenticate(req, res as any, next);

      assert.equal(getStatusCode(), 401);
      assert.equal(isNextCalled(), false);
    });

    it('returns 401 when token is invalid', () => {
      const { req, res, next, getStatusCode, isNextCalled } = createMockReqRes({
        authorization: 'Bearer invalid.token.payload',
      });
      authenticate(req, res as any, next);

      assert.equal(getStatusCode(), 401);
      assert.equal(isNextCalled(), false);
    });

    it('successfully decodes valid token and attaches user to request', () => {
      const payload = { id: 'u123', email: 'user@barruu.org', role: 'USER' };
      const validToken = jwt.sign(payload, TEST_SECRET);

      const { req, res, next, isNextCalled } = createMockReqRes({
        authorization: `Bearer ${validToken}`,
      });
      authenticate(req, res as any, next);

      assert.equal(isNextCalled(), true);
      assert.equal(req.user?.id, 'u123');
      assert.equal(req.user?.email, 'user@barruu.org');
    });
  });

  describe('requireAdmin', () => {
    it('returns 403 when user is not admin', () => {
      const { req, res, next, getStatusCode, isNextCalled } = createMockReqRes({
        user: { id: 'u123', email: 'user@barruu.org', role: 'USER' },
      });
      requireAdmin(req, res as any, next);

      assert.equal(getStatusCode(), 403);
      assert.equal(isNextCalled(), false);
    });

    it('passes when user has ADMIN role', () => {
      const { req, res, next, isNextCalled } = createMockReqRes({
        user: { id: 'admin1', email: 'admin@barruu.org', role: 'ADMIN' },
      });
      requireAdmin(req, res as any, next);

      assert.equal(isNextCalled(), true);
    });
  });

  describe('optionalAuth', () => {
    it('calls next without attaching user when header is missing', () => {
      const { req, res, next, isNextCalled } = createMockReqRes();
      optionalAuth(req, res as any, next);

      assert.equal(isNextCalled(), true);
      assert.equal(req.user, undefined);
    });

    it('calls next and attaches user when valid token is provided', () => {
      const payload = { id: 'opt_u', email: 'opt@barruu.org', role: 'USER' };
      const validToken = jwt.sign(payload, TEST_SECRET);

      const { req, res, next, isNextCalled } = createMockReqRes({
        authorization: `Bearer ${validToken}`,
      });
      optionalAuth(req, res as any, next);

      assert.equal(isNextCalled(), true);
      assert.equal(req.user?.id, 'opt_u');
    });

    it('calls next gracefully without error when token is invalid', () => {
      const { req, res, next, isNextCalled } = createMockReqRes({
        authorization: 'Bearer bad_token',
      });
      optionalAuth(req, res as any, next);

      assert.equal(isNextCalled(), true);
      assert.equal(req.user, undefined);
    });
  });
});
