import { describe, it, expect, vi } from 'vitest';
import { OpenAIClient } from '../src/openai/client';
import { HttpClient } from '../src/core/http-client';
import { OpenAIChatStream } from '../src/stream/openai-stream';

describe('OpenAIClient', () => {
  it('listModels -> GET /v1/models', async () => {
    const payload = { object: 'list' as const, data: [] };
    const fetchFn = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: () => Promise.resolve(payload),
      body: null,
    } as unknown as Response);

    const http = new HttpClient({
      apiKey: 'k',
      baseUrl: 'https://ext.example.com',
      fetch: fetchFn as typeof fetch,
      maxRetries: 0,
    });
    const openai = new OpenAIClient(http);
    const res = await openai.listModels();
    expect(res).toEqual(payload);
    expect(fetchFn.mock.calls[0][0]).toBe('https://ext.example.com/v1/models');
  });

  it('chatCompletions stream returns OpenAIChatStream', async () => {
    const streamBody = new ReadableStream({
      start(controller) {
        controller.enqueue(
          new TextEncoder().encode(
            'data: {"id":"1","object":"chat.completion.chunk","created":0,"model":"m","choices":[]}\n\n',
          ),
        );
        controller.close();
      },
    });
    const fetchFn = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'text/event-stream' }),
      body: streamBody,
    } as Response);

    const http = new HttpClient({
      apiKey: 'k',
      baseUrl: 'https://ext.example.com',
      fetch: fetchFn as typeof fetch,
      maxRetries: 0,
    });
    const openai = new OpenAIClient(http);
    const out = await openai.chatCompletions({
      model: 'openai/gpt-4o-mini',
      messages: [{ role: 'user', content: 'hi' }],
      stream: true,
    });
    expect(out).toBeInstanceOf(OpenAIChatStream);
  });
});
