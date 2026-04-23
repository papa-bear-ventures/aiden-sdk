import { describe, it, expect, vi } from 'vitest';
import { AidenClient } from '../src/client';

function mockFetch(body: unknown) {
  return vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    statusText: 'OK',
    headers: new Headers({ 'content-type': 'application/json' }),
    json: () => Promise.resolve(body),
    body: null,
  } as unknown as Response);
}

describe('AidenClient', () => {
  it('version() -> GET /api/version', async () => {
    const envelope = {
      data: {
        name: 'AIHub External API',
        pathVersion: 'v1',
        contractVersion: '1.0.0',
        openApi: { version: '1.0.0', path: '/api-docs.json' },
      },
      meta: { requestId: 'r1', timestamp: new Date().toISOString() },
    };
    const fetchFn = mockFetch(envelope);
    const client = new AidenClient({
      apiKey: 'k'.repeat(40),
      baseUrl: 'https://ext.example.com',
      fetch: fetchFn as typeof fetch,
    });

    const res = await client.version();
    expect(res.data.pathVersion).toBe('v1');
    expect(fetchFn.mock.calls[0][0]).toBe('https://ext.example.com/api/version');
  });

  it('apiV1Index() -> GET /api/v1', async () => {
    const envelope = {
      data: {
        version: 'v1',
        status: 'operational',
        documentation: '/api-docs',
        endpoints: {},
        openai_compatible: {
          chat_completions: '/v1/chat/completions',
          models: '/v1/models',
          audio_transcriptions: '/v1/audio/transcriptions',
          audio_speech: '/v1/audio/speech',
        },
      },
      meta: { requestId: 'r2', timestamp: new Date().toISOString() },
    };
    const fetchFn = mockFetch(envelope);
    const client = new AidenClient({
      apiKey: 'k'.repeat(40),
      baseUrl: 'https://ext.example.com',
      fetch: fetchFn as typeof fetch,
    });

    const res = await client.apiV1Index();
    expect(res.data.openai_compatible.models).toBe('/v1/models');
    expect(fetchFn.mock.calls[0][0]).toBe('https://ext.example.com/api/v1');
  });
});
