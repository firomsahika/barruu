import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { Writable } from 'node:stream';
import pino from 'pino';
import { Logger } from '../lib/logger';

describe('Structured Logger Unit Tests', () => {
  test('emits structured JSON with ISO timestamp and level', async () => {
    const logs: any[] = [];
    const stream = new Writable({
      write(chunk, _encoding, callback) {
        logs.push(JSON.parse(chunk.toString()));
        callback();
      },
    });

    const pinoTestInstance = pino(
      {
        level: 'debug',
        timestamp: pino.stdTimeFunctions.isoTime,
        formatters: {
          level(label) {
            return { level: label };
          },
        },
      },
      stream
    );

    const testLogger = new Logger(pinoTestInstance);
    testLogger.info('Test info message', { route: '/api/test', userId: 'user-123' });

    assert.equal(logs.length, 1);
    assert.equal(logs[0].msg, 'Test info message');
    assert.equal(logs[0].level, 'info');
    assert.equal(logs[0].route, '/api/test');
    assert.equal(logs[0].userId, 'user-123');
    assert(logs[0].time);
  });

  test('formats error objects cleanly with stack and metadata', async () => {
    const logs: any[] = [];
    const stream = new Writable({
      write(chunk, _encoding, callback) {
        logs.push(JSON.parse(chunk.toString()));
        callback();
      },
    });

    const pinoTestInstance = pino(
      {
        level: 'debug',
        timestamp: pino.stdTimeFunctions.isoTime,
        formatters: {
          level(label) {
            return { level: label };
          },
        },
      },
      stream
    );

    const testLogger = new Logger(pinoTestInstance);
    const testError = new Error('Database connection failed');
    testLogger.error({ err: testError, route: '/api/articles' }, 'Controller failed');

    assert.equal(logs.length, 1);
    assert.equal(logs[0].msg, 'Controller failed');
    assert.equal(logs[0].level, 'error');
    assert.equal(logs[0].route, '/api/articles');
    assert.equal(logs[0].err.message, 'Database connection failed');
    assert(logs[0].err.stack);
  });

  test('respects LOG_LEVEL threshold configuration', async () => {
    const logs: any[] = [];
    const stream = new Writable({
      write(chunk, _encoding, callback) {
        logs.push(JSON.parse(chunk.toString()));
        callback();
      },
    });

    const pinoTestInstance = pino(
      {
        level: 'warn', // Only warn and error should be logged
        timestamp: pino.stdTimeFunctions.isoTime,
        formatters: {
          level(label) {
            return { level: label };
          },
        },
      },
      stream
    );

    const testLogger = new Logger(pinoTestInstance);
    testLogger.debug('Debug log should be ignored');
    testLogger.info('Info log should be ignored');
    testLogger.warn('Warning log should be captured');
    testLogger.error('Error log should be captured');

    assert.equal(logs.length, 2);
    assert.equal(logs[0].msg, 'Warning log should be captured');
    assert.equal(logs[0].level, 'warn');
    assert.equal(logs[1].msg, 'Error log should be captured');
    assert.equal(logs[1].level, 'error');
  });
});
