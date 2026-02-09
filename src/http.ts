/**
 * HTTP Client Layer
 *
 * Low-level fetch wrapper handling:
 * - Authorization header injection
 * - X-User-ID header
 * - Request timeouts
 * - Automatic retry with exponential backoff (429, 5xx)
 * - Rate-limit header parsing
 * - Response envelope unwrapping
 * - Error classification
 */

import type {
  AidenClientConfig,
  ApiResponse,
  PaginatedResponse,
  ApiErrorResponse,
  RequestOptions,
} from './types';
import {
  AidenError,
  ConnectionError,
  TimeoutError,
  createErrorFromResponse,
} from './errors';

// ============================================================================
// Types
// ============================================================================

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface HttpRequestOptions extends RequestOptions {
  method: HttpMethod;
  path: string;
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined>;
  /** If true, returns the raw Response (for streaming, file downloads) */
  raw?: boolean;
}

// ============================================================================
// HTTP Client
// ============================================================================

export class HttpClient {
  private readonly config: Required<Pick<AidenClientConfig, 'apiKey' | 'baseUrl'>> &
    AidenClientConfig;
  private readonly fetchFn: typeof fetch;
  private readonly defaultTimeout: number;
  private readonly maxRetries: number;

  constructor(config: AidenClientConfig) {
    this.config = config;
    this.fetchFn = config.fetch ?? globalThis.fetch;
    this.defaultTimeout = config.timeout ?? 30_000;
    this.maxRetries = config.maxRetries ?? 3;

    if (!this.fetchFn) {
      throw new Error(
        'No fetch implementation found. Please provide one via the `fetch` config option or use Node.js 18+.',
      );
    }
  }

  /**
   * Make an API request and return the unwrapped data.
   */
  async request<T>(options: HttpRequestOptions): Promise<ApiResponse<T>> {
    const response = await this.requestRaw(options);
    const body = await response.json();

    return body as ApiResponse<T>;
  }

  /**
   * Make an API request for a paginated list endpoint.
   */
  async requestPaginated<T>(options: HttpRequestOptions): Promise<PaginatedResponse<T>> {
    const response = await this.requestRaw(options);
    const body = await response.json();

    return body as PaginatedResponse<T>;
  }

  /**
   * Make a raw API request, returning the fetch Response directly.
   * Used for streaming (SSE) and file downloads.
   */
  async requestRaw(options: HttpRequestOptions): Promise<Response> {
    const { method, path, body, query, raw, signal, ...rest } = options;
    const url = this.buildUrl(path, query);
    const headers = this.buildHeaders(rest);
    const timeout = rest.timeout ?? this.defaultTimeout;

    let lastError: Error | undefined;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const response = await this.fetchWithTimeout(url, {
          method,
          headers,
          body: body !== undefined ? JSON.stringify(body) : undefined,
          signal,
        }, timeout);

        // Success -- return response
        if (response.ok) {
          return response;
        }

        // 204 No Content
        if (response.status === 204) {
          return response;
        }

        // Parse error body
        const errorBody = await this.safeParseJson(response);

        // Rate limited -- retry with backoff
        if (response.status === 429 && attempt < this.maxRetries) {
          const retryAfterMs = this.parseRetryAfter(response);
          const backoff = Math.min(retryAfterMs, this.calculateBackoff(attempt));
          await this.sleep(backoff);
          lastError = createErrorFromResponse(response.status, errorBody, retryAfterMs);
          continue;
        }

        // Server errors -- retry with backoff
        if (response.status >= 500 && attempt < this.maxRetries) {
          const backoff = this.calculateBackoff(attempt);
          await this.sleep(backoff);
          lastError = createErrorFromResponse(response.status, errorBody);
          continue;
        }

        // Non-retryable error -- throw immediately
        throw createErrorFromResponse(
          response.status,
          errorBody,
          response.status === 429 ? this.parseRetryAfter(response) : undefined,
        );
      } catch (error) {
        if (error instanceof AidenError) {
          throw error;
        }

        // Network / connection errors
        if (error instanceof TypeError && error.message.includes('fetch')) {
          lastError = new ConnectionError(`Failed to connect to ${url}`, error);
        } else if (error instanceof DOMException && error.name === 'AbortError') {
          throw new TimeoutError(`Request timed out after ${timeout}ms`, timeout);
        } else {
          lastError = new ConnectionError(
            `Request failed: ${error instanceof Error ? error.message : String(error)}`,
            error instanceof Error ? error : undefined,
          );
        }

        if (attempt < this.maxRetries) {
          await this.sleep(this.calculateBackoff(attempt));
          continue;
        }
      }
    }

    throw lastError ?? new ConnectionError('Request failed after all retries');
  }

  // ==========================================================================
  // Helpers
  // ==========================================================================

  private buildUrl(path: string, query?: Record<string, string | number | boolean | undefined>): string {
    const base = this.config.baseUrl.replace(/\/+$/, '');
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    const url = new URL(`${base}${cleanPath}`);

    if (query) {
      for (const [key, value] of Object.entries(query)) {
        if (value !== undefined && value !== null) {
          url.searchParams.set(key, String(value));
        }
      }
    }

    return url.toString();
  }

  private buildHeaders(options: RequestOptions): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${this.config.apiKey}`,
    };

    // User ID header
    const userId = options.userId ?? this.config.userId;
    if (userId) {
      headers['X-User-ID'] = userId;
    }

    // Merge custom headers
    if (options.headers) {
      Object.assign(headers, options.headers);
    }

    return headers;
  }

  private async fetchWithTimeout(
    url: string,
    init: RequestInit,
    timeoutMs: number,
  ): Promise<Response> {
    // If caller already provided an AbortSignal, combine with timeout
    if (init.signal) {
      return this.fetchFn(url, init);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      return await this.fetchFn(url, { ...init, signal: controller.signal });
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private async safeParseJson(response: Response): Promise<ApiErrorResponse> {
    try {
      return await response.json() as ApiErrorResponse;
    } catch {
      return {
        error: {
          code: 'UNKNOWN_ERROR',
          message: response.statusText || `HTTP ${response.status}`,
        },
        meta: {
          requestId: response.headers.get('x-request-id') ?? 'unknown',
          timestamp: new Date().toISOString(),
        },
      };
    }
  }

  private parseRetryAfter(response: Response): number {
    const retryAfter = response.headers.get('retry-after');
    if (!retryAfter) return 60_000; // Default 60s

    const seconds = parseInt(retryAfter, 10);
    if (!isNaN(seconds)) return seconds * 1000;

    // Try parsing as date
    const date = new Date(retryAfter);
    if (!isNaN(date.getTime())) {
      return Math.max(0, date.getTime() - Date.now());
    }

    return 60_000;
  }

  private calculateBackoff(attempt: number): number {
    // Exponential backoff: 1s, 2s, 4s, 8s... with jitter
    const base = Math.pow(2, attempt) * 1000;
    const jitter = Math.random() * 500;
    return Math.min(base + jitter, 30_000); // Cap at 30s
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
