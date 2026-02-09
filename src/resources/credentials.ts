/**
 * Credentials Resource
 *
 * Manage integration credentials (API keys for external services).
 */

import { BaseResource } from './base';
import type {
  ApiResponse,
  PaginatedResponse,
  ListParams,
  RequestOptions,
  Credential,
} from '../types';

export interface CreateCredentialParams {
  name: string;
  type: string;
  config: Record<string, unknown>;
}

export interface CredentialType {
  type: string;
  name: string;
  description?: string;
  fields: Array<{
    name: string;
    type: string;
    required: boolean;
    description?: string;
  }>;
}

export interface CredentialTestResult {
  success: boolean;
  message?: string;
  latency?: number;
}

export class CredentialsResource extends BaseResource {
  protected readonly basePath = '/api/v1/credentials';

  async create(params: CreateCredentialParams, options?: RequestOptions): Promise<ApiResponse<Credential>> {
    return this._create<Credential>(this.basePath, params, options);
  }

  async list(params?: ListParams, options?: RequestOptions): Promise<PaginatedResponse<Credential>> {
    return this._list<Credential>(this.basePath, params, options);
  }

  async get(id: string, options?: RequestOptions): Promise<ApiResponse<Credential>> {
    return this._get<Credential>(`${this.basePath}/${id}`, options);
  }

  /** Rotate a credential's secret. */
  async rotate(id: string, options?: RequestOptions): Promise<ApiResponse<Credential>> {
    return this._create<Credential>(`${this.basePath}/${id}/rotate`, {}, options);
  }

  /** Test credential connectivity. */
  async test(id: string, options?: RequestOptions): Promise<ApiResponse<CredentialTestResult>> {
    return this._create<CredentialTestResult>(`${this.basePath}/${id}/test`, {}, options);
  }

  /** Get available credential types. */
  async types(options?: RequestOptions): Promise<ApiResponse<CredentialType[]>> {
    return this._get<CredentialType[]>(`${this.basePath}/meta/types`, options);
  }

  /** Get compatible credentials for a node type. */
  async forNode(nodeType: string, options?: RequestOptions): Promise<ApiResponse<Credential[]>> {
    return this._get<Credential[]>(`${this.basePath}/meta/for-node/${nodeType}`, options);
  }
}
