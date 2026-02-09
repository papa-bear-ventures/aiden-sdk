/**
 * Base Resource Class
 *
 * Provides common CRUD patterns and pagination helpers for all resource classes.
 * Each resource extends this base and adds domain-specific methods.
 */

import type { HttpClient, HttpMethod } from '../http';
import type {
  ApiResponse,
  PaginatedResponse,
  ListParams,
  RequestOptions,
} from '../types';
import { AidenStream } from '../streaming';

export abstract class BaseResource {
  protected readonly http: HttpClient;
  protected abstract readonly basePath: string;

  constructor(http: HttpClient) {
    this.http = http;
  }

  // ==========================================================================
  // CRUD Helpers
  // ==========================================================================

  /**
   * GET a single resource by ID.
   */
  protected async _get<T>(
    path: string,
    options?: RequestOptions,
  ): Promise<ApiResponse<T>> {
    return this.http.request<T>({
      method: 'GET',
      path,
      ...options,
    });
  }

  /**
   * GET a paginated list of resources.
   */
  protected async _list<T>(
    path: string,
    params?: Record<string, unknown>,
    options?: RequestOptions,
  ): Promise<PaginatedResponse<T>> {
    const query: Record<string, string | number | boolean | undefined> = {};
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null) {
          query[key] = value as string | number | boolean;
        }
      }
    }

    return this.http.requestPaginated<T>({
      method: 'GET',
      path,
      query,
      ...options,
    });
  }

  /**
   * POST to create a resource.
   */
  protected async _create<T>(
    path: string,
    body: unknown,
    options?: RequestOptions,
  ): Promise<ApiResponse<T>> {
    return this.http.request<T>({
      method: 'POST',
      path,
      body,
      ...options,
    });
  }

  /**
   * PUT to fully update a resource.
   */
  protected async _update<T>(
    path: string,
    body: unknown,
    options?: RequestOptions,
  ): Promise<ApiResponse<T>> {
    return this.http.request<T>({
      method: 'PUT',
      path,
      body,
      ...options,
    });
  }

  /**
   * PATCH to partially update a resource.
   */
  protected async _patch<T>(
    path: string,
    body: unknown,
    options?: RequestOptions,
  ): Promise<ApiResponse<T>> {
    return this.http.request<T>({
      method: 'PATCH',
      path,
      body,
      ...options,
    });
  }

  /**
   * DELETE a resource. Returns void (204 No Content).
   */
  protected async _delete(
    path: string,
    options?: RequestOptions,
  ): Promise<void> {
    await this.http.requestRaw({
      method: 'DELETE',
      path,
      ...options,
    });
  }

  /**
   * POST to bulk-delete resources.
   */
  protected async _bulkDelete(
    path: string,
    ids: string[],
    options?: RequestOptions,
  ): Promise<void> {
    await this.http.requestRaw({
      method: 'POST',
      path,
      body: { ids },
      ...options,
    });
  }

  /**
   * Make a streaming POST request, returning an AidenStream.
   */
  protected async _stream(
    path: string,
    body: unknown,
    options?: RequestOptions,
  ): Promise<AidenStream> {
    const response = await this.http.requestRaw({
      method: 'POST',
      path,
      body,
      raw: true,
      headers: {
        ...options?.headers,
        'Accept': 'text/event-stream',
      },
      ...options,
    });

    return new AidenStream(response);
  }

  /**
   * Make a streaming GET request, returning an AidenStream.
   */
  protected async _streamGet(
    path: string,
    options?: RequestOptions,
  ): Promise<AidenStream> {
    const response = await this.http.requestRaw({
      method: 'GET',
      path,
      raw: true,
      headers: {
        ...options?.headers,
        'Accept': 'text/event-stream',
      },
      ...options,
    });

    return new AidenStream(response);
  }

  // ==========================================================================
  // Auto-pagination Helper
  // ==========================================================================

  /**
   * Create an async iterator that automatically pages through all results.
   *
   * @example
   * ```typescript
   * for await (const notebook of client.notebooks.listAll()) {
   *   console.log(notebook.name);
   * }
   * ```
   */
  protected async *_listAll<T>(
    path: string,
    params?: Record<string, unknown>,
    options?: RequestOptions,
  ): AsyncIterableIterator<T> {
    let page = 1;
    const limit = params?.limit ?? 50;

    while (true) {
      const response = await this._list<T>(
        path,
        { ...params, page, limit },
        options,
      );

      for (const item of response.data) {
        yield item;
      }

      const pagination = response.meta.pagination;
      if (!pagination || page >= pagination.totalPages) {
        break;
      }

      page++;
    }
  }
}
