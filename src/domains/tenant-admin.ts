/**
 * `/api/v1/tenant-admin/*` — many handlers return **raw core JSON** (not `{ data, meta }`).
 * Use `requestPlain` results typed as `unknown` or narrow in your app.
 */

import type { HttpClient } from '../core/http-client';
import type { RequestOptions } from '../core/types';

const P = '/api/v1/tenant-admin';

export class TenantAdminApi {
  constructor(private readonly http: HttpClient) {}

  async listModels(params?: Record<string, string | number | boolean | undefined>, options?: RequestOptions): Promise<unknown> {
    return this.http.requestPlain({
      method: 'GET',
      path: `${P}/models`,
      query: params,
      ...options,
    });
  }

  async getAllowlist(options?: RequestOptions): Promise<unknown> {
    return this.http.requestPlain({ method: 'GET', path: `${P}/models/allowlist`, ...options });
  }

  async setAllowlist(body: Record<string, unknown>, options?: RequestOptions): Promise<unknown> {
    return this.http.requestPlain({
      method: 'PUT',
      path: `${P}/models/allowlist`,
      body,
      ...options,
    });
  }
}
