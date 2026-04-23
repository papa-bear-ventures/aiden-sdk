import type { HttpClient } from '../core/http-client';
import type { ApiResponse, RequestOptions } from '../core/types';

const P = '/api/v1/context';

export class ContextApi {
  constructor(private readonly http: HttpClient) {}

  async getSettings(options?: RequestOptions): Promise<ApiResponse<unknown>> {
    return this.http.request({ method: 'GET', path: `${P}/settings`, ...options });
  }

  async updateSettings(body: Record<string, unknown>, options?: RequestOptions): Promise<ApiResponse<unknown>> {
    return this.http.request({ method: 'POST', path: `${P}/settings`, body, ...options });
  }

  async completeOnboarding(options?: RequestOptions): Promise<ApiResponse<unknown>> {
    return this.http.request({ method: 'PUT', path: `${P}/settings/complete`, body: {}, ...options });
  }
}
