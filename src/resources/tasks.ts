/**
 * Tasks Resource
 *
 * Human-in-the-loop tasks.
 */

import { BaseResource } from './base';
import type {
  ApiResponse,
  PaginatedResponse,
  ListParams,
  RequestOptions,
  HumanTask,
} from '../types';

export class TasksResource extends BaseResource {
  protected readonly basePath = '/api/v1/tasks';

  /** List human tasks. */
  async list(params?: ListParams, options?: RequestOptions): Promise<PaginatedResponse<HumanTask>> {
    return this._list<HumanTask>(this.basePath, params, options);
  }

  /** Get a task by ID. */
  async get(taskId: string, options?: RequestOptions): Promise<ApiResponse<HumanTask>> {
    return this._get<HumanTask>(`${this.basePath}/${taskId}`, options);
  }

  /** Submit a task response. */
  async submit(
    taskId: string,
    response: Record<string, unknown>,
    options?: RequestOptions,
  ): Promise<ApiResponse<HumanTask>> {
    return this._create<HumanTask>(`${this.basePath}/${taskId}`, response, options);
  }

  /** Get task status. */
  async status(taskId: string, options?: RequestOptions): Promise<ApiResponse<{ status: string }>> {
    return this._get<{ status: string }>(`${this.basePath}/${taskId}/status`, options);
  }

  /** Cancel a pending task. */
  async cancel(taskId: string, options?: RequestOptions): Promise<ApiResponse<HumanTask>> {
    return this._create<HumanTask>(`${this.basePath}/${taskId}/cancel`, {}, options);
  }
}
