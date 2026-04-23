import type { HttpClient } from '../core/http-client';
import type { ApiResponse, PaginatedResponse, ListParams, RequestOptions } from '../core/types';
import { listQuery } from './helpers';

const B = '/api/v1/agents/builder';
const M = '/api/v1/agents/microapps';

export class AgentsApi {
  constructor(private readonly http: HttpClient) {}

  async createBuilderSession(body: Record<string, unknown> = {}, options?: RequestOptions): Promise<ApiResponse<unknown>> {
    return this.http.request({ method: 'POST', path: `${B}/sessions`, body, ...options });
  }

  async listBuilderSessions(params?: ListParams, options?: RequestOptions): Promise<PaginatedResponse<unknown>> {
    return this.http.requestPaginated({
      method: 'GET',
      path: `${B}/sessions`,
      query: listQuery(params),
      ...options,
    });
  }

  async getBuilderSession(sessionId: string, options?: RequestOptions): Promise<ApiResponse<unknown>> {
    return this.http.request({ method: 'GET', path: `${B}/sessions/${sessionId}`, ...options });
  }

  async deleteBuilderSession(sessionId: string, options?: RequestOptions): Promise<void> {
    await this.http.requestRaw({ method: 'DELETE', path: `${B}/sessions/${sessionId}`, ...options });
  }

  async resetBuilderSession(sessionId: string, options?: RequestOptions): Promise<ApiResponse<unknown>> {
    return this.http.request({ method: 'POST', path: `${B}/sessions/${sessionId}/reset`, body: {}, ...options });
  }

  async sendBuilderMessage(sessionId: string, body: Record<string, unknown>, options?: RequestOptions): Promise<ApiResponse<unknown>> {
    return this.http.request({
      method: 'POST',
      path: `${B}/sessions/${sessionId}/messages`,
      body,
      ...options,
    });
  }

  async sendBuilderMessageStream(sessionId: string, body: Record<string, unknown>, options?: RequestOptions): Promise<Response> {
    return this.http.requestRaw({
      method: 'POST',
      path: `${B}/sessions/${sessionId}/messages/stream`,
      body,
      headers: { Accept: 'text/event-stream', ...options?.headers },
      ...options,
    });
  }

  async listMicroApps(params?: ListParams, options?: RequestOptions): Promise<PaginatedResponse<unknown>> {
    return this.http.requestPaginated({ method: 'GET', path: M, query: listQuery(params), ...options });
  }

  async createMicroApp(body: Record<string, unknown>, options?: RequestOptions): Promise<ApiResponse<unknown>> {
    return this.http.request({ method: 'POST', path: M, body, ...options });
  }

  async getMicroApp(identifier: string, options?: RequestOptions): Promise<ApiResponse<unknown>> {
    return this.http.request({ method: 'GET', path: `${M}/${identifier}`, ...options });
  }

  async updateMicroApp(slug: string, body: Record<string, unknown>, options?: RequestOptions): Promise<ApiResponse<unknown>> {
    return this.http.request({ method: 'PUT', path: `${M}/${slug}`, body, ...options });
  }

  async deleteMicroApp(slug: string, options?: RequestOptions): Promise<void> {
    await this.http.requestRaw({ method: 'DELETE', path: `${M}/${slug}`, ...options });
  }
}
