import type { HttpClient } from '../core/http-client';
import type { ApiResponse, PaginatedResponse, ListParams, RequestOptions } from '../core/types';
import { listQuery } from './helpers';

const P = '/api/v1/notebooks';

export class NotebooksApi {
  constructor(private readonly http: HttpClient) {}

  async create(body: Record<string, unknown>, options?: RequestOptions): Promise<ApiResponse<unknown>> {
    return this.http.request({ method: 'POST', path: P, body, ...options });
  }

  async list(params?: ListParams, options?: RequestOptions): Promise<PaginatedResponse<unknown>> {
    return this.http.requestPaginated({ method: 'GET', path: P, query: listQuery(params), ...options });
  }

  async get(id: string, options?: RequestOptions): Promise<ApiResponse<unknown>> {
    return this.http.request({ method: 'GET', path: `${P}/${id}`, ...options });
  }

  async update(id: string, body: Record<string, unknown>, options?: RequestOptions): Promise<ApiResponse<unknown>> {
    return this.http.request({ method: 'PUT', path: `${P}/${id}`, body, ...options });
  }

  async delete(id: string, options?: RequestOptions): Promise<void> {
    await this.http.requestRaw({ method: 'DELETE', path: `${P}/${id}`, ...options });
  }

  async bulkDelete(ids: string[], options?: RequestOptions): Promise<void> {
    await this.http.requestRaw({ method: 'POST', path: `${P}/bulk-delete`, body: { ids }, ...options });
  }

  async duplicate(id: string, options?: RequestOptions): Promise<ApiResponse<unknown>> {
    return this.http.request({ method: 'POST', path: `${P}/${id}/duplicate`, body: {}, ...options });
  }

  async createKnowledgeAsset(
    notebookId: string,
    body: Record<string, unknown>,
    options?: RequestOptions,
  ): Promise<ApiResponse<unknown>> {
    return this.http.request({
      method: 'POST',
      path: `${P}/${notebookId}/knowledge-assets`,
      body,
      ...options,
    });
  }

  async listKnowledgeAssets(
    notebookId: string,
    params?: ListParams,
    options?: RequestOptions,
  ): Promise<PaginatedResponse<unknown>> {
    return this.http.requestPaginated({
      method: 'GET',
      path: `${P}/${notebookId}/knowledge-assets`,
      query: listQuery(params),
      ...options,
    });
  }

  async getKnowledgeAsset(notebookId: string, assetId: string, options?: RequestOptions): Promise<ApiResponse<unknown>> {
    return this.http.request({
      method: 'GET',
      path: `${P}/${notebookId}/knowledge-assets/${assetId}`,
      ...options,
    });
  }

  async patchKnowledgeAsset(
    notebookId: string,
    assetId: string,
    body: Record<string, unknown>,
    options?: RequestOptions,
  ): Promise<ApiResponse<unknown>> {
    return this.http.request({
      method: 'PATCH',
      path: `${P}/${notebookId}/knowledge-assets/${assetId}`,
      body,
      ...options,
    });
  }

  async deleteKnowledgeAsset(notebookId: string, assetId: string, options?: RequestOptions): Promise<void> {
    await this.http.requestRaw({
      method: 'DELETE',
      path: `${P}/${notebookId}/knowledge-assets/${assetId}`,
      ...options,
    });
  }

  async reindexKnowledgeAsset(notebookId: string, assetId: string, options?: RequestOptions): Promise<ApiResponse<unknown>> {
    return this.http.request({
      method: 'POST',
      path: `${P}/${notebookId}/knowledge-assets/${assetId}/reindex`,
      body: {},
      ...options,
    });
  }

  async listArtifacts(notebookId: string, params?: ListParams, options?: RequestOptions): Promise<PaginatedResponse<unknown>> {
    return this.http.requestPaginated({
      method: 'GET',
      path: `${P}/${notebookId}/artifacts`,
      query: listQuery(params),
      ...options,
    });
  }

  async addCell(
    notebookId: string,
    cell: Record<string, unknown>,
    options?: RequestOptions,
  ): Promise<ApiResponse<unknown>> {
    return this.http.request({ method: 'POST', path: `${P}/${notebookId}/cells`, body: cell, ...options });
  }

  async updateCell(
    notebookId: string,
    cellId: string,
    cell: Record<string, unknown>,
    options?: RequestOptions,
  ): Promise<ApiResponse<unknown>> {
    return this.http.request({
      method: 'PUT',
      path: `${P}/${notebookId}/cells/${cellId}`,
      body: cell,
      ...options,
    });
  }

  async deleteCell(notebookId: string, cellId: string, options?: RequestOptions): Promise<void> {
    await this.http.requestRaw({
      method: 'DELETE',
      path: `${P}/${notebookId}/cells/${cellId}`,
      ...options,
    });
  }
}
