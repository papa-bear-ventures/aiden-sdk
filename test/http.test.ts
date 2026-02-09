import { describe, it, expect, vi } from 'vitest';
import { HttpClient } from '../src/http';

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

  it('should send Authorization header', async () => {
    const fetchFn = mockFetch({ body: { data: {}, meta: {} } });
    const http = new HttpClient({ ...baseConfig, fetch: fetchFn as any });

    await http.request({ method: 'GET', path: '/api/v1/test' });

    expect(fetchFn).toHaveBeenCalledTimes(1);
    const [url, init] = fetchFn.mock.calls[0];
    expect(url).toBe('https://api.test.com/api/v1/test');
    expect(init.headers['Authorization']).toBe('Bearer test-key');
  });

  it('should send X-User-ID header when configured', async () => {
    const fetchFn = mockFetch({ body: { data: {}, meta: {} } });
    const http = new HttpClient({ ...baseConfig, userId: 'user-1', fetch: fetchFn as any });

    await http.request({ method: 'GET', path: '/test' });

    const [, init] = fetchFn.mock.calls[0];
    expect(init.headers['X-User-ID']).toBe('user-1');
  });

  it('should build URL with query parameters', async () => {
    const fetchFn = mockFetch({ body: { data: [], meta: {} } });
    const http = new HttpClient({ ...baseConfig, fetch: fetchFn as any });

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

  it('should skip undefined query parameters', async () => {
    const fetchFn = mockFetch({ body: { data: [], meta: {} } });
    const http = new HttpClient({ ...baseConfig, fetch: fetchFn as any });

    await http.requestPaginated({
      method: 'GET',
      path: '/test',
      query: { page: 1, search: undefined },
    });

    const [url] = fetchFn.mock.calls[0];
    expect(url).toContain('page=1');
    expect(url).not.toContain('search');
  });

  it('should throw typed error for 404', async () => {
    const fetchFn = mockFetch({
      ok: false,
      status: 404,
      body: {
        error: { code: 'NOT_FOUND', message: 'Notebook not found' },
        meta: { requestId: 'req-1', timestamp: '2026-01-01' },
      },
    });
    const http = new HttpClient({ ...baseConfig, maxRetries: 0, fetch: fetchFn as any });

    await expect(
      http.request({ method: 'GET', path: '/test' }),
    ).rejects.toMatchObject({
      name: 'NotFoundError',
      code: 'NOT_FOUND',
      status: 404,
      requestId: 'req-1',
    });
  });

  it('should retry on 429 and eventually throw RateLimitError', async () => {
    const fetchFn = vi.fn().mockResolvedValue({
      ok: false,
      status: 429,
      statusText: 'Too Many Requests',
      headers: new Headers({ 'retry-after': '1' }),
      json: () => Promise.resolve({
        error: { code: 'RATE_LIMITED', message: 'Slow down' },
        meta: { requestId: 'req-1', timestamp: '2026-01-01' },
      }),
      body: null,
    } as unknown as Response);

    const http = new HttpClient({
      ...baseConfig,
      maxRetries: 1, // Only 1 retry
      fetch: fetchFn as any,
    });

    await expect(
      http.request({ method: 'GET', path: '/test' }),
    ).rejects.toMatchObject({
      name: 'RateLimitError',
      code: 'RATE_LIMITED',
    });

    // Initial request + 1 retry = 2 calls
    expect(fetchFn).toHaveBeenCalledTimes(2);
  });

  it('should send JSON body for POST requests', async () => {
    const fetchFn = mockFetch({ body: { data: { _id: '1' }, meta: {} } });
    const http = new HttpClient({ ...baseConfig, fetch: fetchFn as any });

    await http.request({
      method: 'POST',
      path: '/api/v1/notebooks',
      body: { name: 'Test' },
    });

    const [, init] = fetchFn.mock.calls[0];
    expect(init.method).toBe('POST');
    expect(init.body).toBe(JSON.stringify({ name: 'Test' }));
    expect(init.headers['Content-Type']).toBe('application/json');
  });

  it('should throw if no fetch is available', () => {
    const originalFetch = globalThis.fetch;
    // @ts-ignore
    globalThis.fetch = undefined;

    expect(() => new HttpClient({
      ...baseConfig,
      fetch: undefined as any,
    })).toThrow('No fetch implementation');

    globalThis.fetch = originalFetch;
  });
});
