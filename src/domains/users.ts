import type { HttpClient } from '../core/http-client';
import type { ApiResponse, PaginatedResponse, ListParams, RequestOptions } from '../core/types';
import { listQuery } from './helpers';

const P = '/api/v1/users';

export class UsersApi {
  constructor(private readonly http: HttpClient) {}

  async list(params?: ListParams, options?: RequestOptions): Promise<PaginatedResponse<unknown>> {
    return this.http.requestPaginated({ method: 'GET', path: P, query: listQuery(params), ...options });
  }

  async invite(body: Record<string, unknown>, options?: RequestOptions): Promise<ApiResponse<unknown>> {
    return this.http.request({ method: 'POST', path: `${P}/invite`, body, ...options });
  }

  async update(userId: string, body: Record<string, unknown>, options?: RequestOptions): Promise<ApiResponse<unknown>> {
    return this.http.request({ method: 'PATCH', path: `${P}/${userId}`, body, ...options });
  }

  async remove(userId: string, options?: RequestOptions): Promise<void> {
    await this.http.requestRaw({ method: 'DELETE', path: `${P}/${userId}`, ...options });
  }

  readonly groups = {
    list: (params?: ListParams, options?: RequestOptions) =>
      this.http.requestPaginated({
        method: 'GET',
        path: `${P}/groups`,
        query: listQuery(params),
        ...options,
      }),

    create: (body: Record<string, unknown>, options?: RequestOptions) =>
      this.http.request({ method: 'POST', path: `${P}/groups`, body, ...options }),

    get: (id: string, options?: RequestOptions) =>
      this.http.request({ method: 'GET', path: `${P}/groups/${id}`, ...options }),

    update: (id: string, body: Record<string, unknown>, options?: RequestOptions) =>
      this.http.request({ method: 'PUT', path: `${P}/groups/${id}`, body, ...options }),

    delete: async (id: string, options?: RequestOptions) => {
      await this.http.requestRaw({ method: 'DELETE', path: `${P}/groups/${id}`, ...options });
    },
  };
}
