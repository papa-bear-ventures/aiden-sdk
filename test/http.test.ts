import { describe, it, expect, vi } from 'vitest';
import { HttpClient } from '../src/core/http-client';

function mockFetch(response: {
  ok?: boolean;
  status?: number;
  statusText?: string;
  headers?: Record<string, string>;
  body?: unknown;
}) {
  return vi.fn().mockResolvedValue({
    ok: response.ok ?? true,
    status: response.status ?? 200,
    statusText: response.statusText ?? 'OK',
    headers: new Headers(response.headers ?? {}),
    json: () => Promise.resolve(response.body ?? {}),
    body: null,
  } as unknown as Response);
}

describe('HttpClient', () => {
  const baseConfig = {
    apiKey: 'test-key',
    baseUrl: 'https://api.test.com',
  };

  it('sends Authorization header', async () => {
    const fetchFn = mockFetch({ body: { data: {}, meta: {} } });
    const http = new HttpClient({ ...baseConfig, fetch: fetchFn as typeof fetch });

    await http.request({ method: 'GET', path: '/api/v1/test' });

    expect(fetchFn).toHaveBeenCalledTimes(1);
    const [url, init] = fetchFn.mock.calls[0];
    expect(url).toBe('https://api.test.com/api/v1/test');
    expect((init!.headers as Record<string, string>)['Authorization']).toBe('Bearer test-key');
  });

  it('sends X-User-ID when configured', async () => {
    const fetchFn = mockFetch({ body: { data: {}, meta: {} } });
    const http = new HttpClient({ ...baseConfig, userId: 'user-1', fetch: fetchFn as typeof fetch });

    await http.request({ method: 'GET', path: '/test' });

    const [, init] = fetchFn.mock.calls[0];
    expect((init!.headers as Record<string, string>)['X-User-ID']).toBe('user-1');
  });

  it('builds query string', async () => {
    const fetchFn = mockFetch({ body: { data: [], meta: {} } });
    const http = new HttpClient({ ...baseConfig, fetch: fetchFn as typeof fetch });

    await http.requestPaginated({
      method: 'GET',
      path: '/api/v1/notebooks',
      query: { page: 1, limit: 10, search: 'test' },
    });

    const [url] = fetchFn.mock.calls[0];
    expect(url).toContain('page=1');
    expect(url).toContain('limit=10');
    expect(url).toContain('search=test');
  });

  it('throws NotFoundError for 404', async () => {
    const fetchFn = mockFetch({
      ok: false,
      status: 404,
      body: {
        error: { code: 'NOT_FOUND', message: 'Missing' },
        meta: { requestId: 'req-1', timestamp: '2026-01-01' },
      },
    });
    const http = new HttpClient({ ...baseConfig, maxRetries: 0, fetch: fetchFn as typeof fetch });

    await expect(http.request({ method: 'GET', path: '/x' })).rejects.toMatchObject({
      name: 'NotFoundError',
      code: 'NOT_FOUND',
      status: 404,
    });
  });

  it('retries 429 then throws RateLimitError', async () => {
    const fetchFn = vi.fn().mockResolvedValue({
      ok: false,
      status: 429,
      statusText: 'Too Many Requests',
      headers: new Headers({ 'retry-after': '1' }),
      json: () =>
        Promise.resolve({
          error: { code: 'RATE_LIMITED', message: 'Slow down' },
          meta: { requestId: 'req-1', timestamp: '2026-01-01' },
        }),
      body: null,
    } as unknown as Response);

    const http = new HttpClient({ ...baseConfig, maxRetries: 1, fetch: fetchFn as typeof fetch });

    await expect(http.request({ method: 'GET', path: '/x' })).rejects.toMatchObject({
      name: 'RateLimitError',
    });

    expect(fetchFn).toHaveBeenCalledTimes(2);
  });
});
