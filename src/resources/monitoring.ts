/**
 * Monitoring Resource
 *
 * Usage statistics and monitoring.
 */

import { BaseResource } from './base';
import type {
  ApiResponse,
  RequestOptions,
  UsageStats,
} from '../types';

export class MonitoringResource extends BaseResource {
  protected readonly basePath = '/api/v1/monitoring';

  /** Get tenant usage statistics. */
  async usage(options?: RequestOptions): Promise<ApiResponse<UsageStats>> {
    return this._get<UsageStats>(`${this.basePath}/usage`, options);
  }

  /** Get tool usage statistics. */
  async tools(options?: RequestOptions): Promise<ApiResponse<unknown>> {
    return this._get(`${this.basePath}/tools`, options);
  }
}
