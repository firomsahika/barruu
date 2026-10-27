import { Registry, collectDefaultMetrics, Counter, Histogram } from 'prom-client';

export const register = new Registry();

// Collect Node.js process / runtime metrics
collectDefaultMetrics({ register, prefix: 'barruu_' });

// HTTP request counter
export const httpRequestCounter = new Counter({
  name: 'barruu_http_requests_total',
  help: 'Total number of HTTP requests processed by Barruu server',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register],
});

// HTTP latency histogram
export const httpRequestDurationHistogram = new Histogram({
  name: 'barruu_http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
  registers: [register],
});
