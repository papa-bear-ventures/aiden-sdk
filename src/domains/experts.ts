import type { HttpClient } from '../core/http-client';
import type { ApiResponse, PaginatedResponse, ListParams, RequestOptions } from '../core/types';
import { listQuery } from './helpers';

const P = '/api/v1/experts';

export class ExpertsApi {
  constructor(private readonly http: HttpClient) {}

  async list(params?: ListParams, options?: RequestOptions): Promise<PaginatedResponse<unknown>> {
    return this.http.requestPaginated({ method: 'GET', path: P, query: listQuery(params), ...options });
  }

  async get(id: string, options?: RequestOptions): Promise<ApiResponse<unknown>> {
    return this.http.request({ method: 'GET', path: `${P}/${id}`, ...options });
  }

  async find(query: Record<string, string | number | boolean | undefined>, options?: RequestOptions): Promise<ApiResponse<unknown>> {
    return this.http.request({ method: 'GET', path: `${P}/find`, query, ...options });
  }
}
