/**
 * Agents Resource
 *
 * Agent builder sessions and MicroApps.
 */

import { BaseResource } from './base';
import type {
  ApiResponse,
  PaginatedResponse,
  ListParams,
  RequestOptions,
  MicroApp,
} from '../types';

export interface CreateBuilderSessionParams {
  title?: string;
  template?: string;
}

export interface BuilderSession {
  _id: string;
  title?: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BuilderMessage {
  _id: string;
  role: string;
  content: string;
  createdAt?: string;
}

export interface CreateMicroAppParams {
  name: string;
  description?: string;
  slug?: string;
  config?: Record<string, unknown>;
}

export interface UpdateMicroAppParams {
  name?: string;
  description?: string;
  config?: Record<string, unknown>;
}

export class AgentsResource extends BaseResource {
  protected readonly basePath = '/api/v1/agents';

  // ==========================================================================
  // Agent Builder
  // ==========================================================================

  async createBuilderSession(params?: CreateBuilderSessionParams, options?: RequestOptions): Promise<ApiResponse<BuilderSession>> {
    return this._create<BuilderSession>(`${this.basePath}/builder/sessions`, params ?? {}, options);
  }

  async listBuilderSessions(params?: ListParams, options?: RequestOptions): Promise<PaginatedResponse<BuilderSession>> {
    return this._list<BuilderSession>(`${this.basePath}/builder/sessions`, params, options);
  }

  async getBuilderSession(sessionId: string, options?: RequestOptions): Promise<ApiResponse<BuilderSession>> {
    return this._get<BuilderSession>(`${this.basePath}/builder/sessions/${sessionId}`, options);
  }

  async deleteBuilderSession(sessionId: string, options?: RequestOptions): Promise<void> {
    return this._delete(`${this.basePath}/builder/sessions/${sessionId}`, options);
  }

  async sendBuilderMessage(
    sessionId: string,
    params: { message: string },
    options?: RequestOptions,
  ): Promise<ApiResponse<BuilderMessage>> {
    return this._create<BuilderMessage>(`${this.basePath}/builder/sessions/${sessionId}/messages`, params, options);
  }

  async resetBuilderSession(sessionId: string, options?: RequestOptions): Promise<ApiResponse<BuilderSession>> {
    return this._create<BuilderSession>(`${this.basePath}/builder/sessions/${sessionId}/reset`, {}, options);
  }

  // ==========================================================================
  // MicroApps
  // ==========================================================================

  async listMicroApps(params?: ListParams, options?: RequestOptions): Promise<PaginatedResponse<MicroApp>> {
    return this._list<MicroApp>(`${this.basePath}/microapps`, params, options);
  }

  async createMicroApp(params: CreateMicroAppParams, options?: RequestOptions): Promise<ApiResponse<MicroApp>> {
    return this._create<MicroApp>(`${this.basePath}/microapps`, params, options);
  }

  /** Get a MicroApp by slug or ID. */
  async getMicroApp(identifier: string, options?: RequestOptions): Promise<ApiResponse<MicroApp>> {
    return this._get<MicroApp>(`${this.basePath}/microapps/${identifier}`, options);
  }

  async updateMicroApp(slug: string, params: UpdateMicroAppParams, options?: RequestOptions): Promise<ApiResponse<MicroApp>> {
    return this._update<MicroApp>(`${this.basePath}/microapps/${slug}`, params, options);
  }

  async deleteMicroApp(slug: string, options?: RequestOptions): Promise<void> {
    return this._delete(`${this.basePath}/microapps/${slug}`, options);
  }
}
