/**
 * Notebooks Resource
 *
 * Manage notebooks and their knowledge assets.
 */

import { BaseResource } from './base';
import type {
  ApiResponse,
  PaginatedResponse,
  ListParams,
  RequestOptions,
  Notebook,
  KnowledgeAsset,
  Artifact,
} from '../types';

// ============================================================================
// Request Types
// ============================================================================

export interface CreateNotebookParams {
  name: string;
  description?: string;
  emoji?: string;
  color?: string;
}

export interface UpdateNotebookParams {
  name?: string;
  description?: string;
  emoji?: string;
  color?: string;
}

export interface CreateKnowledgeAssetParams {
  name?: string;
  content?: string;
  url?: string;
  type?: string;
  metadata?: Record<string, unknown>;
}

export interface UpdateKnowledgeAssetParams {
  name?: string;
  metadata?: Record<string, unknown>;
}

export interface ListKnowledgeAssetsParams extends ListParams {
  type?: string;
  status?: string;
}

// ============================================================================
// Notebooks Resource
// ============================================================================

export class NotebooksResource extends BaseResource {
  protected readonly basePath = '/api/v1/notebooks';

  /**
   * Create a new notebook.
   */
  async create(params: CreateNotebookParams, options?: RequestOptions): Promise<ApiResponse<Notebook>> {
    return this._create<Notebook>(this.basePath, params, options);
  }

  /**
   * List notebooks with pagination.
   */
  async list(params?: ListParams, options?: RequestOptions): Promise<PaginatedResponse<Notebook>> {
    return this._list<Notebook>(this.basePath, params, options);
  }

  /**
   * Auto-paginate through all notebooks.
   */
  listAll(params?: Omit<ListParams, 'page'>, options?: RequestOptions): AsyncIterableIterator<Notebook> {
    return this._listAll<Notebook>(this.basePath, params, options);
  }

  /**
   * Get a notebook by ID.
   */
  async get(id: string, options?: RequestOptions): Promise<ApiResponse<Notebook>> {
    return this._get<Notebook>(`${this.basePath}/${id}`, options);
  }

  /**
   * Update a notebook.
   */
  async update(id: string, params: UpdateNotebookParams, options?: RequestOptions): Promise<ApiResponse<Notebook>> {
    return this._update<Notebook>(`${this.basePath}/${id}`, params, options);
  }

  /**
   * Delete a notebook.
   */
  async delete(id: string, options?: RequestOptions): Promise<void> {
    return this._delete(`${this.basePath}/${id}`, options);
  }

  /**
   * Bulk delete notebooks.
   */
  async bulkDelete(ids: string[], options?: RequestOptions): Promise<void> {
    return this._bulkDelete(`${this.basePath}/bulk-delete`, ids, options);
  }

  /**
   * Duplicate a notebook.
   */
  async duplicate(id: string, options?: RequestOptions): Promise<ApiResponse<Notebook>> {
    return this._create<Notebook>(`${this.basePath}/${id}/duplicate`, {}, options);
  }

  // ==========================================================================
  // Knowledge Assets
  // ==========================================================================

  /**
   * Create a knowledge asset in a notebook (text content or URL).
   * For file uploads, use `client.documents.upload()` then link to notebook.
   */
  async createAsset(
    notebookId: string,
    params: CreateKnowledgeAssetParams,
    options?: RequestOptions,
  ): Promise<ApiResponse<KnowledgeAsset>> {
    return this._create<KnowledgeAsset>(`${this.basePath}/${notebookId}/knowledge-assets`, params, options);
  }

  /**
   * List knowledge assets in a notebook.
   */
  async listAssets(
    notebookId: string,
    params?: ListKnowledgeAssetsParams,
    options?: RequestOptions,
  ): Promise<PaginatedResponse<KnowledgeAsset>> {
    return this._list<KnowledgeAsset>(`${this.basePath}/${notebookId}/knowledge-assets`, params, options);
  }

  /**
   * Get a knowledge asset by ID.
   */
  async getAsset(
    notebookId: string,
    assetId: string,
    options?: RequestOptions,
  ): Promise<ApiResponse<KnowledgeAsset>> {
    return this._get<KnowledgeAsset>(`${this.basePath}/${notebookId}/knowledge-assets/${assetId}`, options);
  }

  /**
   * Update a knowledge asset's metadata.
   */
  async updateAsset(
    notebookId: string,
    assetId: string,
    params: UpdateKnowledgeAssetParams,
    options?: RequestOptions,
  ): Promise<ApiResponse<KnowledgeAsset>> {
    return this._patch<KnowledgeAsset>(`${this.basePath}/${notebookId}/knowledge-assets/${assetId}`, params, options);
  }

  /**
   * Delete a knowledge asset.
   */
  async deleteAsset(
    notebookId: string,
    assetId: string,
    options?: RequestOptions,
  ): Promise<void> {
    return this._delete(`${this.basePath}/${notebookId}/knowledge-assets/${assetId}`, options);
  }

  /**
   * Reindex a knowledge asset.
   */
  async reindexAsset(
    notebookId: string,
    assetId: string,
    options?: RequestOptions,
  ): Promise<ApiResponse<KnowledgeAsset>> {
    return this._create<KnowledgeAsset>(`${this.basePath}/${notebookId}/knowledge-assets/${assetId}/reindex`, {}, options);
  }

  // ==========================================================================
  // Artifacts
  // ==========================================================================

  /**
   * List artifacts in a notebook.
   */
  async listArtifacts(
    notebookId: string,
    params?: ListParams,
    options?: RequestOptions,
  ): Promise<PaginatedResponse<Artifact>> {
    return this._list<Artifact>(`${this.basePath}/${notebookId}/artifacts`, params, options);
  }

  // ==========================================================================
  // Cells
  // ==========================================================================

  /**
   * Add a cell to a notebook.
   */
  async addCell(
    notebookId: string,
    cell: { type: string; content: string; metadata?: Record<string, unknown> },
    options?: RequestOptions,
  ): Promise<ApiResponse<unknown>> {
    return this._create(`${this.basePath}/${notebookId}/cells`, cell, options);
  }

  /**
   * Update a cell in a notebook.
   */
  async updateCell(
    notebookId: string,
    cellId: string,
    cell: { content?: string; metadata?: Record<string, unknown> },
    options?: RequestOptions,
  ): Promise<ApiResponse<unknown>> {
    return this._update(`${this.basePath}/${notebookId}/cells/${cellId}`, cell, options);
  }

  /**
   * Delete a cell from a notebook.
   */
  async deleteCell(
    notebookId: string,
    cellId: string,
    options?: RequestOptions,
  ): Promise<void> {
    return this._delete(`${this.basePath}/${notebookId}/cells/${cellId}`, options);
  }
}
