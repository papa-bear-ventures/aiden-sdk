import type { OpenAIChatCompletionChunk } from '../openai/types';
import { ConnectionError } from '../core/errors';

export class OpenAIChatStream implements AsyncIterable<OpenAIChatCompletionChunk> {
  private readonly response: Response;
  private consumed = false;

  constructor(response: Response) {
    this.response = response;
  }

  async *[Symbol.asyncIterator](): AsyncIterableIterator<OpenAIChatCompletionChunk> {
    if (this.consumed) {
      throw new Error('OpenAI chat stream can only be consumed once.');
    }
    this.consumed = true;

    const body = this.response.body;
    if (!body) {
      throw new ConnectionError('Response body is null — no stream available');
    }

    const reader = body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split('\n');
        buffer = parts.pop() ?? '';

        for (const line of parts) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith(':')) continue;
          if (!trimmed.startsWith('data:')) continue;

          const payload = trimmed.slice('data:'.length).trim();
          if (payload === '[DONE]') {
            return;
          }

          yield JSON.parse(payload) as OpenAIChatCompletionChunk;
        }
      }

      if (buffer.trim()) {
        const trimmed = buffer.trim();
        if (trimmed.startsWith('data:')) {
          const payload = trimmed.slice('data:'.length).trim();
          if (payload && payload !== '[DONE]') {
            yield JSON.parse(payload) as OpenAIChatCompletionChunk;
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  async text(): Promise<string> {
    let out = '';
    for await (const chunk of this) {
      for (const choice of chunk.choices) {
        const c = choice.delta.content;
        if (typeof c === 'string') out += c;
      }
    }
    return out;
  }
}
