import type { HttpClient } from '../core/http-client';
import type { ApiResponse, PaginatedResponse, ListParams, RequestOptions } from '../core/types';
import { listQuery } from './helpers';

const P = '/api/v1/documents';

export class DocumentsApi {
  constructor(private readonly http: HttpClient) {}

  async upload(
    params: { file: Blob | Buffer; filename: string; metadata?: Record<string, unknown> },
    options?: RequestOptions,
  ): Promise<ApiResponse<unknown>> {
    const form = new FormData();
    const blob =
      typeof Buffer !== 'undefined' && Buffer.isBuffer(params.file)
        ? new Blob([params.file as BlobPart])
        : (params.file as Blob);

    form.append('file', blob, params.filename);
    if (params.metadata) {
      form.append('metadata', JSON.stringify(params.metadata));
    }

    const response = await this.http.requestRaw({
      method: 'POST',
      path: `${P}/upload`,
      body: form,
      bodyMode: 'raw',
      ...options,
    });
    return response.json() as Promise<ApiResponse<unknown>>;
  }

  async list(params?: ListParams, options?: RequestOptions): Promise<PaginatedResponse<unknown>> {
    return this.http.requestPaginated({ method: 'GET', path: P, query: listQuery(params), ...options });
  }

  async get(id: string, options?: RequestOptions): Promise<ApiResponse<unknown>> {
    return this.http.request({ method: 'GET', path: `${P}/${id}`, ...options });
  }

  async download(id: string, options?: RequestOptions): Promise<Response> {
    return this.http.requestRaw({ method: 'GET', path: `${P}/${id}/download`, ...options });
  }

  async delete(id: string, options?: RequestOptions): Promise<void> {
    await this.http.requestRaw({ method: 'DELETE', path: `${P}/${id}`, ...options });
  }
}
