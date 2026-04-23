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

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface HttpRequestOptions extends RequestOptions {
  method: HttpMethod;
  path: string;
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined>;
  bodyMode?: 'json' | 'raw';
}

export class HttpClient {
  readonly config: Required<Pick<AidenClientConfig, 'apiKey' | 'baseUrl'>> & AidenClientConfig;
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
        'No fetch implementation found. Use Node.js 18+ or pass `fetch` in config.',
      );
    }
  }

  async request<T>(options: HttpRequestOptions): Promise<ApiResponse<T>> {
    const response = await this.requestRaw(options);
    return response.json() as Promise<ApiResponse<T>>;
  }

  async requestPaginated<T>(options: HttpRequestOptions): Promise<PaginatedResponse<T>> {
    const response = await this.requestRaw(options);
    return response.json() as Promise<PaginatedResponse<T>>;
  }

  /** JSON body without `{ data, meta }` (e.g. some admin or legacy endpoints). */
  async requestPlain<T>(options: HttpRequestOptions): Promise<T> {
    const response = await this.requestRaw(options);
    return response.json() as Promise<T>;
  }

  async requestRaw(options: HttpRequestOptions): Promise<Response> {
    const { method, path, body, query, signal, bodyMode, ...rest } = options;
    const url = this.buildUrl(path, query);
    const mode = bodyMode ?? 'json';
    const headers = this.buildHeaders(rest, mode);
    const timeout = rest.timeout ?? this.defaultTimeout;

    const fetchBody =
      body === undefined ? undefined : mode === 'raw' ? (body as BodyInit) : JSON.stringify(body);

    let lastError: Error | undefined;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const response = await this.fetchWithTimeout(
          url,
          { method, headers, body: fetchBody, signal },
          timeout,
        );

        if (response.ok) {
          return response;
        }

        if (response.status === 204) {
          return response;
        }

        const errorBody = await this.safeParseJson(response);

        if (response.status === 429 && attempt < this.maxRetries) {
          const retryAfterMs = this.parseRetryAfter(response);
          const backoff = Math.min(retryAfterMs, this.calculateBackoff(attempt));
          await this.sleep(backoff);
          lastError = createErrorFromResponse(response.status, errorBody as unknown, retryAfterMs);
          continue;
        }

        if (response.status >= 500 && attempt < this.maxRetries) {
          const backoff = this.calculateBackoff(attempt);
          await this.sleep(backoff);
          lastError = createErrorFromResponse(response.status, errorBody as unknown);
          continue;
        }

        throw createErrorFromResponse(
          response.status,
          errorBody as unknown,
          response.status === 429 ? this.parseRetryAfter(response) : undefined,
        );
      } catch (error) {
        if (error instanceof AidenError) {
          throw error;
        }

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

  private buildHeaders(options: RequestOptions, bodyMode: 'json' | 'raw' = 'json'): Record<string, string> {
    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.config.apiKey}`,
    };

    if (bodyMode === 'json') {
      headers['Content-Type'] = 'application/json';
      headers['Accept'] = 'application/json';
    } else {
      headers['Accept'] = '*/*';
    }

    const userId = options.userId ?? this.config.userId;
    if (userId) {
      headers['X-User-ID'] = userId;
    }

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
      return (await response.json()) as ApiErrorResponse;
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
    if (!retryAfter) return 60_000;

    const seconds = parseInt(retryAfter, 10);
    if (!isNaN(seconds)) return seconds * 1000;

    const date = new Date(retryAfter);
    if (!isNaN(date.getTime())) {
      return Math.max(0, date.getTime() - Date.now());
    }

    return 60_000;
  }

  private calculateBackoff(attempt: number): number {
    const base = Math.pow(2, attempt) * 1000;
    const jitter = Math.random() * 500;
    return Math.min(base + jitter, 30_000);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
