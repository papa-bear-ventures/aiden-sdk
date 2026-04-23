import type { HttpClient } from '../core/http-client';
import type { ApiResponse, RequestOptions } from '../core/types';

const P = '/api/v1/monitoring';

export class MonitoringApi {
  constructor(private readonly http: HttpClient) {}

  async usage(options?: RequestOptions): Promise<ApiResponse<unknown>> {
    return this.http.request({ method: 'GET', path: `${P}/usage`, ...options });
  }

  async tools(options?: RequestOptions): Promise<ApiResponse<unknown>> {
    return this.http.request({ method: 'GET', path: `${P}/tools`, ...options });
  }
}
