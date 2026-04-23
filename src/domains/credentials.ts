import type { HttpClient } from '../core/http-client';
import type { ApiResponse, PaginatedResponse, ListParams, RequestOptions } from '../core/types';
import { listQuery } from './helpers';

const P = '/api/v1/credentials';

export class CredentialsApi {
  constructor(private readonly http: HttpClient) {}

  async create(body: Record<string, unknown>, options?: RequestOptions): Promise<ApiResponse<unknown>> {
    return this.http.request({ method: 'POST', path: P, body, ...options });
  }

  async list(params?: ListParams, options?: RequestOptions): Promise<PaginatedResponse<unknown>> {
    return this.http.requestPaginated({ method: 'GET', path: P, query: listQuery(params), ...options });
  }

  async get(id: string, options?: RequestOptions): Promise<ApiResponse<unknown>> {
    return this.http.request({ method: 'GET', path: `${P}/${id}`, ...options });
  }

  async rotate(id: string, options?: RequestOptions): Promise<ApiResponse<unknown>> {
    return this.http.request({ method: 'POST', path: `${P}/${id}/rotate`, body: {}, ...options });
  }

  async test(id: string, options?: RequestOptions): Promise<ApiResponse<unknown>> {
    return this.http.request({ method: 'POST', path: `${P}/${id}/test`, body: {}, ...options });
  }

  async delete(id: string, options?: RequestOptions): Promise<void> {
    await this.http.requestRaw({ method: 'DELETE', path: `${P}/${id}`, ...options });
  }

  async metaTypes(options?: RequestOptions): Promise<ApiResponse<unknown>> {
    return this.http.request({ method: 'GET', path: `${P}/meta/types`, ...options });
  }

  async metaForNode(nodeType: string, options?: RequestOptions): Promise<ApiResponse<unknown>> {
    return this.http.request({
      method: 'GET',
      path: `${P}/meta/for-node/${encodeURIComponent(nodeType)}`,
      ...options,
    });
  }
}
