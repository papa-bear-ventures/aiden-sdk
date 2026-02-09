/**
 * Models Resource
 *
 * List and configure available AI models.
 */

import { BaseResource } from './base';
import type {
  ApiResponse,
  RequestOptions,
  AIModel,
} from '../types';

export interface ServiceModelConfig {
  [service: string]: string;
}

export interface ModelPriority {
  category: string;
  models: string[];
}

export interface ModelAllowlist {
  disabledModels: string[];
}

export class ModelsResource extends BaseResource {
  protected readonly basePath = '/api/v1/models';

  /** List all available AI models. */
  async list(options?: RequestOptions): Promise<ApiResponse<AIModel[]>> {
    return this._get<AIModel[]>(this.basePath, options);
  }

  /** Get service-to-model mapping. */
  async services(options?: RequestOptions): Promise<ApiResponse<ServiceModelConfig>> {
    return this._get<ServiceModelConfig>(`${this.basePath}/services`, options);
  }

  /** Update service model configuration (Admin only). */
  async updateServices(config: ServiceModelConfig, options?: RequestOptions): Promise<ApiResponse<ServiceModelConfig>> {
    return this._update<ServiceModelConfig>(`${this.basePath}/services`, config, options);
  }

  /** Get fallback priority order. */
  async priorities(options?: RequestOptions): Promise<ApiResponse<ModelPriority[]>> {
    return this._get<ModelPriority[]>(`${this.basePath}/priorities`, options);
  }

  /** Set fallback priority order for a category (Admin only). */
  async updatePriority(
    category: string,
    models: string[],
    options?: RequestOptions,
  ): Promise<ApiResponse<ModelPriority>> {
    return this._update<ModelPriority>(`${this.basePath}/priorities/${category}`, { models }, options);
  }

  /** Get model allowlist (disabled models). */
  async allowlist(options?: RequestOptions): Promise<ApiResponse<ModelAllowlist>> {
    return this._get<ModelAllowlist>(`${this.basePath}/allowlist`, options);
  }

  /** Set disabled models (Admin only). */
  async updateAllowlist(disabledModels: string[], options?: RequestOptions): Promise<ApiResponse<ModelAllowlist>> {
    return this._update<ModelAllowlist>(`${this.basePath}/allowlist`, { disabledModels }, options);
  }
}
