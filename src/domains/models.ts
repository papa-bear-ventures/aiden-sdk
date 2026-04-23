/**
 * `/api/v1/models` — tenant model catalog (see routes: no tenant PUT /services or /priorities).
 */

import type { HttpClient } from '../core/http-client';
import type { ApiResponse, RequestOptions } from '../core/types';

const P = '/api/v1/models';

export class ModelsApi {
  constructor(private readonly http: HttpClient) {}

  async list(options?: RequestOptions): Promise<ApiResponse<unknown>> {
    return this.http.request({ method: 'GET', path: P, ...options });
  }

  async orchestratorOptions(options?: RequestOptions): Promise<ApiResponse<unknown>> {
    return this.http.request({ method: 'GET', path: `${P}/orchestrator-options`, ...options });
  }

  async services(options?: RequestOptions): Promise<ApiResponse<unknown>> {
    return this.http.request({ method: 'GET', path: `${P}/services`, ...options });
  }

  async getAllowlist(options?: RequestOptions): Promise<ApiResponse<unknown>> {
    return this.http.request({ method: 'GET', path: `${P}/allowlist`, ...options });
  }

  async setAllowlist(body: Record<string, unknown>, options?: RequestOptions): Promise<ApiResponse<unknown>> {
    return this.http.request({ method: 'PUT', path: `${P}/allowlist`, body, ...options });
  }

  async validateMappings(options?: RequestOptions): Promise<ApiResponse<unknown>> {
    return this.http.request({ method: 'GET', path: `${P}/validate`, ...options });
  }
}
