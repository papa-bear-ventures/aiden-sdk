import type { HttpClient } from '../core/http-client';
import type { ApiResponse, PaginatedResponse, ListParams, RequestOptions } from '../core/types';
import { AidenStream } from '../stream/aiden-stream';
import { listQuery } from './helpers';

const P = '/api/v1/flows';

export class FlowsApi {
  constructor(private readonly http: HttpClient) {}

  async createInstance(body: Record<string, unknown>, options?: RequestOptions): Promise<ApiResponse<unknown>> {
    return this.http.request({ method: 'POST', path: `${P}/instances`, body, ...options });
  }

  async listInstances(params?: ListParams, options?: RequestOptions): Promise<PaginatedResponse<unknown>> {
    return this.http.requestPaginated({
      method: 'GET',
      path: `${P}/instances`,
      query: listQuery(params),
      ...options,
    });
  }

  async createFlow(body: Record<string, unknown>, options?: RequestOptions): Promise<ApiResponse<unknown>> {
    return this.http.request({ method: 'POST', path: P, body, ...options });
  }

  async listFlows(params?: ListParams, options?: RequestOptions): Promise<PaginatedResponse<unknown>> {
    return this.http.requestPaginated({ method: 'GET', path: P, query: listQuery(params), ...options });
  }

  async runFlow(id: string, body: Record<string, unknown> = {}, options?: RequestOptions): Promise<ApiResponse<unknown>> {
    return this.http.request({ method: 'POST', path: `${P}/${id}/run`, body, ...options });
  }

  async listRuns(params?: ListParams, options?: RequestOptions): Promise<PaginatedResponse<unknown>> {
    return this.http.requestPaginated({ method: 'GET', path: `${P}/runs`, query: listQuery(params), ...options });
  }

  async getRun(id: string, options?: RequestOptions): Promise<ApiResponse<unknown>> {
    return this.http.request({ method: 'GET', path: `${P}/runs/${id}`, ...options });
  }

  async streamRun(id: string, options?: RequestOptions): Promise<AidenStream> {
    const res = await this.http.requestRaw({
      method: 'GET',
      path: `${P}/runs/${id}/stream`,
      headers: { Accept: 'text/event-stream', ...options?.headers },
      ...options,
    });
    return new AidenStream(res);
  }

  async runLogs(id: string, params?: ListParams, options?: RequestOptions): Promise<PaginatedResponse<unknown>> {
    return this.http.requestPaginated({
      method: 'GET',
      path: `${P}/runs/${id}/logs`,
      query: listQuery(params),
      ...options,
    });
  }

  async listExecutions(params?: ListParams, options?: RequestOptions): Promise<PaginatedResponse<unknown>> {
    return this.http.requestPaginated({
      method: 'GET',
      path: `${P}/executions`,
      query: listQuery(params),
      ...options,
    });
  }

  async getExecution(id: string, options?: RequestOptions): Promise<ApiResponse<unknown>> {
    return this.http.request({ method: 'GET', path: `${P}/executions/${id}`, ...options });
  }
}
