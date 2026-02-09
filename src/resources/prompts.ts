/**
 * Prompts Resource
 *
 * Manage prompt templates.
 */

import { BaseResource } from './base';
import type {
  ApiResponse,
  PaginatedResponse,
  ListParams,
  RequestOptions,
  Prompt,
} from '../types';

export interface CreatePromptParams {
  name: string;
  content: string;
  description?: string;
  category?: string;
  tags?: string[];
}

export interface UpdatePromptParams {
  name?: string;
  content?: string;
  description?: string;
  category?: string;
  tags?: string[];
}

export class PromptsResource extends BaseResource {
  protected readonly basePath = '/api/v1/prompts';

  async create(params: CreatePromptParams, options?: RequestOptions): Promise<ApiResponse<Prompt>> {
    return this._create<Prompt>(this.basePath, params, options);
  }

  async list(params?: ListParams, options?: RequestOptions): Promise<PaginatedResponse<Prompt>> {
    return this._list<Prompt>(this.basePath, params, options);
  }

  listAll(params?: Omit<ListParams, 'page'>, options?: RequestOptions): AsyncIterableIterator<Prompt> {
    return this._listAll<Prompt>(this.basePath, params, options);
  }

  async get(id: string, options?: RequestOptions): Promise<ApiResponse<Prompt>> {
    return this._get<Prompt>(`${this.basePath}/${id}`, options);
  }

  async update(id: string, params: UpdatePromptParams, options?: RequestOptions): Promise<ApiResponse<Prompt>> {
    return this._update<Prompt>(`${this.basePath}/${id}`, params, options);
  }

  async delete(id: string, options?: RequestOptions): Promise<void> {
    return this._delete(`${this.basePath}/${id}`, options);
  }

  async bulkDelete(ids: string[], options?: RequestOptions): Promise<void> {
    return this._bulkDelete(`${this.basePath}/bulk-delete`, ids, options);
  }
}
