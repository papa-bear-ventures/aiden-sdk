import type { HttpClient } from '../core/http-client';
import type { ApiResponse, PaginatedResponse, ListParams, RequestOptions } from '../core/types';
import { listQuery } from './helpers';

const P = '/api/v1/skills';

export class SkillsApi {
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

  async patchDefinition(id: string, body: Record<string, unknown>, options?: RequestOptions): Promise<ApiResponse<unknown>> {
    return this.http.request({ method: 'PATCH', path: `${P}/${id}/definition`, body, ...options });
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

  async activate(id: string, options?: RequestOptions): Promise<ApiResponse<unknown>> {
    return this.http.request({ method: 'POST', path: `${P}/${id}/activate`, body: {}, ...options });
  }

  async deactivate(id: string, options?: RequestOptions): Promise<ApiResponse<unknown>> {
    return this.http.request({ method: 'POST', path: `${P}/${id}/deactivate`, body: {}, ...options });
  }

  async run<T = unknown>(id: string, body: Record<string, unknown> = {}, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.http.request<T>({ method: 'POST', path: `${P}/${id}/run`, body, ...options });
  }

  async listExecutions(id: string, params?: ListParams, options?: RequestOptions): Promise<PaginatedResponse<unknown>> {
    return this.http.requestPaginated({
      method: 'GET',
      path: `${P}/${id}/executions`,
      query: listQuery(params),
      ...options,
    });
  }

  async getExecution<T = unknown>(id: string, executionId: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.http.request<T>({ method: 'GET', path: `${P}/${id}/executions/${executionId}`, ...options });
  }

  async cancelExecution(id: string, executionId: string, options?: RequestOptions): Promise<ApiResponse<unknown>> {
    return this.http.request({
      method: 'POST',
      path: `${P}/${id}/executions/${executionId}/cancel`,
      body: {},
      ...options,
    });
  }

  async listLogs(id: string, params?: ListParams, options?: RequestOptions): Promise<PaginatedResponse<unknown>> {
    return this.http.requestPaginated({
      method: 'GET',
      path: `${P}/${id}/logs`,
      query: listQuery(params),
      ...options,
    });
  }

  async listTemplates(options?: RequestOptions): Promise<ApiResponse<unknown>> {
    return this.http.request({ method: 'GET', path: `${P}/templates`, ...options });
  }

  async copyTemplate(body: Record<string, unknown>, options?: RequestOptions): Promise<ApiResponse<unknown>> {
    return this.http.request({ method: 'POST', path: `${P}/copy-template`, body, ...options });
  }

  async listNodes(options?: RequestOptions): Promise<ApiResponse<unknown>> {
    return this.http.request({ method: 'GET', path: `${P}/nodes`, ...options });
  }

  async getNode(type: string, options?: RequestOptions): Promise<ApiResponse<unknown>> {
    return this.http.request({ method: 'GET', path: `${P}/nodes/${encodeURIComponent(type)}`, ...options });
  }

  async nodeCategories(options?: RequestOptions): Promise<ApiResponse<unknown>> {
    return this.http.request({ method: 'GET', path: `${P}/nodes/meta/categories`, ...options });
  }

  async nodeExamples(type: string, options?: RequestOptions): Promise<ApiResponse<unknown>> {
    return this.http.request({
      method: 'GET',
      path: `${P}/nodes/${encodeURIComponent(type)}/examples`,
      ...options,
    });
  }
}
