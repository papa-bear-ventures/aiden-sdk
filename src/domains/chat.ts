/**
 * `/api/v1/chat` — embeddable widget + feedback (see OpenAPI for auth: widget routes are often public).
 */

import type { HttpClient } from '../core/http-client';
import type { ApiResponse, RequestOptions } from '../core/types';

const P = '/api/v1/chat';

export class ChatApi {
  constructor(private readonly http: HttpClient) {}

  async createWidgetSession(widgetId: string, body: Record<string, unknown> = {}, options?: RequestOptions): Promise<ApiResponse<unknown>> {
    return this.http.request({ method: 'POST', path: `${P}/${widgetId}/session`, body, ...options });
  }

  async sendWidgetMessage(widgetId: string, body: Record<string, unknown>, options?: RequestOptions): Promise<ApiResponse<unknown>> {
    return this.http.request({ method: 'POST', path: `${P}/${widgetId}/message`, body, ...options });
  }

  async getWidgetSession(widgetId: string, sessionId: string, options?: RequestOptions): Promise<ApiResponse<unknown>> {
    return this.http.request({ method: 'GET', path: `${P}/${widgetId}/session/${sessionId}`, ...options });
  }

  async deleteWidgetSession(widgetId: string, sessionId: string, options?: RequestOptions): Promise<void> {
    await this.http.requestRaw({ method: 'DELETE', path: `${P}/${widgetId}/session/${sessionId}`, ...options });
  }

  async submitFeedback(body: Record<string, unknown>, options?: RequestOptions): Promise<ApiResponse<unknown>> {
    return this.http.request({ method: 'POST', path: `${P}/feedback`, body, ...options });
  }

  async getFeedback(messageId: string, options?: RequestOptions): Promise<ApiResponse<unknown>> {
    return this.http.request({ method: 'GET', path: `${P}/feedback/${messageId}`, ...options });
  }
}
