import type { HttpClient } from '../core/http-client';
import type { ApiResponse, PaginatedResponse, ListParams, RequestOptions } from '../core/types';
import { listQuery } from './helpers';

const P = '/api/v1/slides';

export class SlidesApi {
  constructor(private readonly http: HttpClient) {}

  async themes(options?: RequestOptions): Promise<ApiResponse<unknown>> {
    return this.http.request({ method: 'GET', path: `${P}/themes`, ...options });
  }

  async createSession(body: Record<string, unknown> = {}, options?: RequestOptions): Promise<ApiResponse<unknown>> {
    return this.http.request({ method: 'POST', path: `${P}/sessions`, body, ...options });
  }

  async listSessions(params?: ListParams, options?: RequestOptions): Promise<PaginatedResponse<unknown>> {
    return this.http.requestPaginated({
      method: 'GET',
      path: `${P}/sessions`,
      query: listQuery(params),
      ...options,
    });
  }

  async getSession(sessionId: string, options?: RequestOptions): Promise<ApiResponse<unknown>> {
    return this.http.request({ method: 'GET', path: `${P}/sessions/${sessionId}`, ...options });
  }

  async deleteSession(sessionId: string, options?: RequestOptions): Promise<void> {
    await this.http.requestRaw({ method: 'DELETE', path: `${P}/sessions/${sessionId}`, ...options });
  }

  async sendMessage(sessionId: string, body: Record<string, unknown>, options?: RequestOptions): Promise<ApiResponse<unknown>> {
    return this.http.request({
      method: 'POST',
      path: `${P}/sessions/${sessionId}/messages`,
      body,
      ...options,
    });
  }

  async sendMessageStream(sessionId: string, body: Record<string, unknown>, options?: RequestOptions): Promise<Response> {
    return this.http.requestRaw({
      method: 'POST',
      path: `${P}/sessions/${sessionId}/messages/stream`,
      body,
      headers: { Accept: 'text/event-stream', ...options?.headers },
      ...options,
    });
  }

  async selectDesign(sessionId: string, body: Record<string, unknown>, options?: RequestOptions): Promise<ApiResponse<unknown>> {
    return this.http.request({
      method: 'POST',
      path: `${P}/sessions/${sessionId}/design`,
      body,
      ...options,
    });
  }

  async generateImages(sessionId: string, options?: RequestOptions): Promise<ApiResponse<unknown>> {
    return this.http.request({
      method: 'POST',
      path: `${P}/sessions/${sessionId}/generate-images`,
      body: {},
      ...options,
    });
  }

  /** HTML preview for the session (not a legacy `export/html` path). */
  async htmlPreview(sessionId: string, options?: RequestOptions): Promise<ApiResponse<unknown>> {
    return this.http.request({ method: 'GET', path: `${P}/sessions/${sessionId}/html-preview`, ...options });
  }
}
