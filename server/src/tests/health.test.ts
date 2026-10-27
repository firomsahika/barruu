import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../index';

describe('Health Endpoint Integration Test', () => {
  test('GET /api/health returns 200 with status ok and service message', async () => {
    const res = await request(app).get('/api/health');
    assert.equal(res.status, 200);
    assert.equal(res.body.status, 'ok');
    assert.equal(res.body.message, 'Siidaa Barruu API is running');
  });
});
