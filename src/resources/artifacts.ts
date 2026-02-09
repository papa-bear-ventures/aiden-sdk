/**
 * Artifacts Resource
 *
 * Manage user-created documents and their versions.
 */

import { BaseResource } from './base';
import type {
  ApiResponse,
  PaginatedResponse,
  ListParams,
  RequestOptions,
  Artifact,
} from '../types';

export interface CreateArtifactParams {
  title: string;
  content: string;
  type?: string;
  format?: string;
  metadata?: Record<string, unknown>;
}

export interface UpdateArtifactParams {
  title?: string;
  metadata?: Record<string, unknown>;
}

export interface SaveVersionParams {
  content: string;
  message?: string;
}

export interface ArtifactVersion {
  _id: string;
  version: number;
  content: string;
  message?: string;
  createdAt?: string;
}

export class ArtifactsResource extends BaseResource {
  protected readonly basePath = '/api/v1/artifacts';

  async create(params: CreateArtifactParams, options?: RequestOptions): Promise<ApiResponse<Artifact>> {
    return this._create<Artifact>(this.basePath, params, options);
  }

  async list(params?: ListParams, options?: RequestOptions): Promise<PaginatedResponse<Artifact>> {
    return this._list<Artifact>(this.basePath, params, options);
  }

  listAll(params?: Omit<ListParams, 'page'>, options?: RequestOptions): AsyncIterableIterator<Artifact> {
    return this._listAll<Artifact>(this.basePath, params, options);
  }

  async get(id: string, options?: RequestOptions): Promise<ApiResponse<Artifact>> {
    return this._get<Artifact>(`${this.basePath}/${id}`, options);
  }

  async update(id: string, params: UpdateArtifactParams, options?: RequestOptions): Promise<ApiResponse<Artifact>> {
    return this._patch<Artifact>(`${this.basePath}/${id}`, params, options);
  }

  async delete(id: string, options?: RequestOptions): Promise<void> {
    return this._delete(`${this.basePath}/${id}`, options);
  }

  async bulkDelete(ids: string[], options?: RequestOptions): Promise<void> {
    return this._bulkDelete(`${this.basePath}/bulk-delete`, ids, options);
  }

  /** Save a new version of an artifact. */
  async saveVersion(id: string, params: SaveVersionParams, options?: RequestOptions): Promise<ApiResponse<ArtifactVersion>> {
    return this._create<ArtifactVersion>(`${this.basePath}/${id}/versions`, params, options);
  }

  /** Get version history for an artifact. */
  async listVersions(id: string, options?: RequestOptions): Promise<PaginatedResponse<ArtifactVersion>> {
    return this._list<ArtifactVersion>(`${this.basePath}/${id}/versions`, undefined, options);
  }

  /** Get export capabilities. */
  async exportCapabilities(options?: RequestOptions): Promise<ApiResponse<unknown>> {
    return this._get(`${this.basePath}/export/capabilities`, options);
  }
}
