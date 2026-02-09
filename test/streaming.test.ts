import { describe, it, expect } from 'vitest';
import { AidenStream } from '../src/streaming';

/**
 * Helper to create a mock Response with SSE data.
 */
function createSSEResponse(events: string[]): Response {
  const text = events.join('\n\n') + '\n\n';
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(text));
      controller.close();
    },
  });

  return new Response(stream, {
    headers: { 'Content-Type': 'text/event-stream' },
  });
}

describe('AidenStream', () => {
  it('should parse ThinkingEvent format', async () => {
    const response = createSSEResponse([
      `data: ${JSON.stringify({ type: 'connected', phase: 'plan', data: {}, timestamp: 1000, visibility: 'prominent' })}`,
      `data: ${JSON.stringify({ type: 'delta', phase: 'do', data: { content: 'Hello' }, timestamp: 1001, visibility: 'prominent' })}`,
      `data: ${JSON.stringify({ type: 'delta', phase: 'do', data: { content: ' World' }, timestamp: 1002, visibility: 'prominent' })}`,
      `data: ${JSON.stringify({ type: 'complete', phase: 'act', data: { sessionId: 's-1' }, timestamp: 1003, visibility: 'prominent' })}`,
    ]);

    const stream = new AidenStream(response);
    const events = [];

    for await (const event of stream) {
      events.push(event);
    }

    expect(events).toHaveLength(4);
    expect(events[0].type).toBe('connected');
    expect(events[1].type).toBe('delta');
    expect(events[1].data).toEqual({ content: 'Hello' });
    expect(events[2].data).toEqual({ content: ' World' });
    expect(events[3].type).toBe('complete');
  });

  it('should collect text via .text()', async () => {
    const response = createSSEResponse([
      `data: ${JSON.stringify({ type: 'delta', phase: 'do', data: { content: 'Hello' }, timestamp: 1, visibility: 'prominent' })}`,
      `data: ${JSON.stringify({ type: 'delta', phase: 'do', data: { content: ' ' }, timestamp: 2, visibility: 'prominent' })}`,
      `data: ${JSON.stringify({ type: 'delta', phase: 'do', data: { content: 'World' }, timestamp: 3, visibility: 'prominent' })}`,
    ]);

    const stream = new AidenStream(response);
    const text = await stream.text();

    expect(text).toBe('Hello World');
  });

  it('should work with callbacks via .subscribe()', async () => {
    const response = createSSEResponse([
      `data: ${JSON.stringify({ type: 'thinking_start', phase: 'plan', data: {}, timestamp: 1, visibility: 'prominent' })}`,
      `data: ${JSON.stringify({ type: 'delta', phase: 'do', data: { content: 'Hi' }, timestamp: 2, visibility: 'prominent' })}`,
      `data: ${JSON.stringify({ type: 'complete', phase: 'act', data: { sessionId: 's-1' }, timestamp: 3, visibility: 'prominent' })}`,
    ]);

    const stream = new AidenStream(response);

    const deltas: string[] = [];
    let thinkingCount = 0;
    let completeData: unknown = null;

    await stream.subscribe({
      onDelta: (content) => deltas.push(content),
      onThinking: () => thinkingCount++,
      onComplete: (data) => { completeData = data; },
    });

    expect(deltas).toEqual(['Hi']);
    expect(thinkingCount).toBe(1);
    expect(completeData).toEqual({ sessionId: 's-1' });
  });

  it('should throw if consumed twice', async () => {
    const response = createSSEResponse([
      `data: ${JSON.stringify({ type: 'delta', phase: 'do', data: { content: 'x' }, timestamp: 1, visibility: 'prominent' })}`,
    ]);

    const stream = new AidenStream(response);
    await stream.text(); // First consumption

    await expect(async () => {
      await stream.text(); // Second consumption
    }).rejects.toThrow('already been consumed');
  });

  it('should handle empty events gracefully', async () => {
    const response = createSSEResponse(['', '  ']);
    const stream = new AidenStream(response);
    const events = [];

    for await (const event of stream) {
      events.push(event);
    }

    expect(events).toHaveLength(0);
  });
});
