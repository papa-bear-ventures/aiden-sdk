/**
 * Experts Resource
 *
 * Discover and find experts.
 */

import { BaseResource } from './base';
import type {
  ApiResponse,
  PaginatedResponse,
  ListParams,
  RequestOptions,
  Expert,
} from '../types';

export class ExpertsResource extends BaseResource {
  protected readonly basePath = '/api/v1/experts';

  /** List all experts. */
  async list(params?: ListParams, options?: RequestOptions): Promise<PaginatedResponse<Expert>> {
    return this._list<Expert>(this.basePath, params, options);
  }

  /** Get an expert by ID. */
  async get(id: string, options?: RequestOptions): Promise<ApiResponse<Expert>> {
    return this._get<Expert>(`${this.basePath}/${id}`, options);
  }

  /** Find an expert by name or keyword. */
  async find(
    params: { query: string },
    options?: RequestOptions,
  ): Promise<ApiResponse<Expert[]>> {
    return this._get<Expert[]>(`${this.basePath}/find`, {
      ...options,
      headers: { ...options?.headers },
    });
  }
}
