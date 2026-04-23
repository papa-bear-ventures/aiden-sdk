import { describe, it, expect } from 'vitest';
import { AidenStream } from '../src/stream/aiden-stream';
import type { StreamEvent } from '../src/core/types';

function sseResponse(chunks: string[]): Response {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      for (const c of chunks) {
        controller.enqueue(encoder.encode(c));
      }
      controller.close();
    },
  });
  return new Response(stream, { status: 200, headers: { 'Content-Type': 'text/event-stream' } });
}

describe('AidenStream', () => {
  it('parses thinking events', async () => {
    const payload: StreamEvent = {
      type: 'delta',
      phase: 'do',
      data: { content: 'hi' },
      timestamp: 1,
      visibility: 'prominent',
    };
    const res = sseResponse([`data: ${JSON.stringify(payload)}\n\n`]);
    const stream = new AidenStream(res);
    const events: StreamEvent[] = [];
    for await (const e of stream) {
      events.push(e);
    }
    expect(events).toHaveLength(1);
    expect(events[0]!.type).toBe('delta');
    expect((events[0]!.data as { content: string }).content).toBe('hi');
  });

  it('text() aggregates deltas', async () => {
    const d1: StreamEvent = {
      type: 'delta',
      phase: 'do',
      data: { content: 'a' },
      timestamp: 1,
      visibility: 'prominent',
    };
    const d2: StreamEvent = {
      type: 'delta',
      phase: 'do',
      data: { content: 'b' },
      timestamp: 2,
      visibility: 'prominent',
    };
    const res = sseResponse([`data: ${JSON.stringify(d1)}\n\n`, `data: ${JSON.stringify(d2)}\n\n`]);
    const stream = new AidenStream(res);
    expect(await stream.text()).toBe('ab');
  });
});
