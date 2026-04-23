import type { HttpClient } from '../core/http-client';
import type { ApiResponse, PaginatedResponse, ListParams, RequestOptions } from '../core/types';
import { listQuery } from './helpers';

const P = '/api/v1/tasks';

export class TasksApi {
  constructor(private readonly http: HttpClient) {}

  async list(params?: ListParams, options?: RequestOptions): Promise<PaginatedResponse<unknown>> {
    return this.http.requestPaginated({ method: 'GET', path: P, query: listQuery(params), ...options });
  }

  async get(taskId: string, options?: RequestOptions): Promise<ApiResponse<unknown>> {
    return this.http.request({ method: 'GET', path: `${P}/${taskId}`, ...options });
  }

  async submit(taskId: string, body: Record<string, unknown>, options?: RequestOptions): Promise<ApiResponse<unknown>> {
    return this.http.request({ method: 'POST', path: `${P}/${taskId}`, body, ...options });
  }

  async status(taskId: string, options?: RequestOptions): Promise<ApiResponse<unknown>> {
    return this.http.request({ method: 'GET', path: `${P}/${taskId}/status`, ...options });
  }

  async cancel(taskId: string, options?: RequestOptions): Promise<ApiResponse<unknown>> {
    return this.http.request({ method: 'POST', path: `${P}/${taskId}/cancel`, body: {}, ...options });
  }
}
