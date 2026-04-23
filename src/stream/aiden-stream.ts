import type {
  StreamEvent,
  StreamCallbacks,
  DeltaEventData,
  CompleteEventData,
} from '../core/types';
import { ConnectionError } from '../core/errors';

export class AidenStream implements AsyncIterable<StreamEvent> {
  private readonly response: Response;
  private consumed = false;

  constructor(response: Response) {
    this.response = response;
  }

  async *[Symbol.asyncIterator](): AsyncIterableIterator<StreamEvent> {
    if (this.consumed) {
      throw new Error('SSE stream has already been consumed.');
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
        const events = this.parseEvents(buffer);
        buffer = events.remaining;

        for (const event of events.parsed) {
          yield event;
        }
      }

      if (buffer.trim()) {
        const events = this.parseEvents(buffer + '\n\n');
        for (const event of events.parsed) {
          yield event;
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  async subscribe(callbacks: StreamCallbacks): Promise<CompleteEventData | undefined> {
    let completeData: CompleteEventData | undefined;

    try {
      for await (const event of this) {
        callbacks.onEvent?.(event);

        switch (event.type) {
          case 'delta': {
            const deltaData = event.data as DeltaEventData;
            callbacks.onDelta?.(deltaData.content);
            break;
          }
          case 'complete': {
            completeData = event.data as CompleteEventData;
            callbacks.onComplete?.(completeData);
            break;
          }
          case 'error': {
            const errorData = event.data as { code?: string; message: string };
            callbacks.onError?.(new Error(errorData.message));
            break;
          }
          default: {
            if (
              event.type === 'thinking_start' ||
              event.type === 'analysis_result' ||
              event.type === 'decision_trace' ||
              event.type === 'pdca_step' ||
              event.type === 'thinking_complete'
            ) {
              callbacks.onThinking?.(event);
            }
          }
        }
      }
    } catch (error) {
      if (callbacks.onError) {
        callbacks.onError(error instanceof Error ? error : new Error(String(error)));
      } else {
        throw error;
      }
    }

    return completeData;
  }

  async text(): Promise<string> {
    let result = '';
    for await (const event of this) {
      if (event.type === 'delta') {
        const deltaData = event.data as DeltaEventData;
        result += deltaData.content;
      }
    }
    return result;
  }

  abort(): void {
    try {
      this.response.body?.cancel();
    } catch {
      /* ignore */
    }
  }

  private parseEvents(buffer: string): { parsed: StreamEvent[]; remaining: string } {
    const parsed: StreamEvent[] = [];
    const blocks = buffer.split('\n\n');
    const remaining = blocks.pop() ?? '';

    for (const block of blocks) {
      const trimmed = block.trim();
      if (!trimmed) continue;
      const event = this.parseSingleEvent(trimmed);
      if (event) parsed.push(event);
    }

    return { parsed, remaining };
  }

  private parseSingleEvent(block: string): StreamEvent | null {
    let data = '';
    let eventType = '';

    for (const line of block.split('\n')) {
      if (line.startsWith('data: ')) {
        data += line.slice(6);
      } else if (line.startsWith('data:')) {
        data += line.slice(5);
      } else if (line.startsWith('event: ')) {
        eventType = line.slice(7).trim();
      } else if (line.startsWith('event:')) {
        eventType = line.slice(6).trim();
      }
    }

    if (!data) return null;

    try {
      const parsed = JSON.parse(data);

      if (parsed.type && parsed.timestamp !== undefined) {
        return parsed as StreamEvent;
      }

      return {
        type: (eventType || 'message') as StreamEvent['type'],
        phase: 'do',
        data: parsed,
        timestamp: Date.now(),
        visibility: 'prominent',
      };
    } catch {
      return {
        type: 'delta',
        phase: 'do',
        data: { content: data },
        timestamp: Date.now(),
        visibility: 'prominent',
      };
    }
  }
}
