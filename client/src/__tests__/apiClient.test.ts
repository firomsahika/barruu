import { describe, it } from 'node:test';
import assert from 'node:assert';
import { getApiErrorMessage } from '../lib/api';

describe('Client API Utilities and Error Handling', () => {
  it('returns fallback message when error is not an axios error', () => {
    const error = new Error('Generic failure');
    const msg = getApiErrorMessage(error, 'Default fallback');
    assert.strictEqual(msg, 'Default fallback');
  });

  it('returns network error message when response is missing', () => {
    const axiosError = {
      isAxiosError: true,
      response: undefined,
    };
    const msg = getApiErrorMessage(axiosError, 'Default fallback');
    assert.strictEqual(msg, 'Serverii bira gahuu hin dandeenye. Internet kee mirkaneessi.');
  });

  it('returns server 500 error message on 5xx status', () => {
    const axios500 = {
      isAxiosError: true,
      response: {
        status: 500,
        data: { error: 'Internal failure' },
      },
    };
    const msg = getApiErrorMessage(axios500, 'Default fallback');
    assert.strictEqual(msg, 'Rakkoon serverii uumame. Mee yeroo muraasa booda yaali.');
  });

  it('returns custom server error message on 4xx status when present', () => {
    const axios400 = {
      isAxiosError: true,
      response: {
        status: 400,
        data: { error: 'Barruun hin argamne' },
      },
    };
    const msg = getApiErrorMessage(axios400, 'Default fallback');
    assert.strictEqual(msg, 'Barruun hin argamne');
  });
});
