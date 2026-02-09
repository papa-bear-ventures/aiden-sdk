/**
 * SSE Streaming Client
 *
 * Lightweight Server-Sent Events parser for POST-based streaming endpoints.
 * The Aiden API uses POST for SSE (not GET), so we can't use the browser's
 * native EventSource. Instead, we parse the SSE wire format from a fetch
 * ReadableStream.
 *
 * Provides two consumption patterns:
 * 1. AsyncIterable -- `for await (const event of stream) { ... }`
 * 2. Callbacks -- `stream.on('delta', (content) => { ... })`
 */

import type { StreamEvent, StreamCallbacks, DeltaEventData, CompleteEventData } from './types';
import { ConnectionError } from './errors';

// ============================================================================
// SSE Stream
// ============================================================================

/**
 * A parsed SSE stream from the Aiden API.
 * Implements AsyncIterable for `for await...of` consumption.
 */
export class AidenStream implements AsyncIterable<StreamEvent> {
  private readonly response: Response;
  private consumed = false;

  constructor(response: Response) {
    this.response = response;
  }

  /**
   * Consume the stream using `for await...of`.
   *
   * @example
   * ```typescript
   * for await (const event of stream) {
   *   if (event.type === 'delta') {
   *     process.stdout.write(event.data.content);
   *   }
   * }
   * ```
   */
  async *[Symbol.asyncIterator](): AsyncIterableIterator<StreamEvent> {
    if (this.consumed) {
      throw new Error('Stream has already been consumed. SSE streams can only be read once.');
    }
    this.consumed = true;

    const body = this.response.body;
    if (!body) {
      throw new ConnectionError('Response body is null -- no stream available');
    }

    const reader = body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Parse complete SSE events from buffer
        const events = this.parseEvents(buffer);
        buffer = events.remaining;

        for (const event of events.parsed) {
          yield event;
        }
      }

      // Process any remaining data in buffer
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

  /**
   * Consume the stream with callbacks. Returns a promise that resolves
   * when the stream completes.
   *
   * @example
   * ```typescript
   * await stream.subscribe({
   *   onDelta: (content) => process.stdout.write(content),
   *   onComplete: (data) => console.log('Done:', data.sessionId),
   *   onError: (err) => console.error(err),
   * });
   * ```
   */
  async subscribe(callbacks: StreamCallbacks): Promise<CompleteEventData | undefined> {
    let completeData: CompleteEventData | undefined;

    try {
      for await (const event of this) {
        // Fire generic event callback
        callbacks.onEvent?.(event);

        // Fire specific callbacks based on event type
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
            // Thinking events
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

  /**
   * Collect all text deltas into a single string.
   * Convenience method for simple use cases.
   *
   * @example
   * ```typescript
   * const fullText = await stream.text();
   * ```
   */
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

  /**
   * Abort the stream.
   */
  abort(): void {
    try {
      this.response.body?.cancel();
    } catch {
      // Ignore cancel errors
    }
  }

  // ==========================================================================
  // SSE Parser
  // ==========================================================================

  private parseEvents(buffer: string): {
    parsed: StreamEvent[];
    remaining: string;
  } {
    const parsed: StreamEvent[] = [];
    const blocks = buffer.split('\n\n');

    // The last block may be incomplete -- keep it as remaining
    const remaining = blocks.pop() ?? '';

    for (const block of blocks) {
      const trimmed = block.trim();
      if (!trimmed) continue;

      const event = this.parseSingleEvent(trimmed);
      if (event) {
        parsed.push(event);
      }
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
      // Ignore id:, retry:, and comment lines (starting with :)
    }

    if (!data) return null;

    try {
      const parsed = JSON.parse(data);

      // The Aiden API sends ThinkingEvent objects as the data payload
      // which already contain { type, phase, data, timestamp, visibility }
      if (parsed.type && parsed.timestamp !== undefined) {
        return parsed as StreamEvent;
      }

      // Fallback: wrap raw data in a generic event
      return {
        type: (eventType || 'message') as StreamEvent['type'],
        phase: 'do',
        data: parsed,
        timestamp: Date.now(),
        visibility: 'prominent',
      };
    } catch {
      // Non-JSON data -- wrap as delta content
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
