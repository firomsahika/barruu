process.env.NODE_ENV = 'test';
import { describe, it } from 'node:test';
import assert from 'node:assert';
import supertest from 'supertest';
import app from '../index';

describe('Prometheus Metrics & Observability Endpoint', () => {
  it('GET /api/metrics returns 200 with Prometheus text format', async () => {
    const res = await supertest(app).get('/api/metrics');
    assert.strictEqual(res.status, 200);
    assert.match(res.headers['content-type'], /text\/plain/);
    assert.match(res.text, /# HELP barruu_http_requests_total/);
    assert.match(res.text, /# TYPE barruu_http_requests_total counter/);
    assert.match(res.text, /# HELP barruu_http_request_duration_seconds/);
  });
});
