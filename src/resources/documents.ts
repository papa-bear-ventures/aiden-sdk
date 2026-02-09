/**
 * Documents Resource
 *
 * Upload, download, and manage documents (GridFS).
 */

import { BaseResource } from './base';
import type {
  ApiResponse,
  PaginatedResponse,
  ListParams,
  RequestOptions,
  Document,
} from '../types';
import { AidenError, ConnectionError } from '../errors';

export interface UploadDocumentParams {
  /** File to upload (Node.js: Buffer/ReadableStream, Browser: File/Blob) */
  file: Blob | Buffer | NodeJS.ReadableStream;
  /** Filename */
  filename: string;
  /** Content type (auto-detected if not provided) */
  contentType?: string;
  /** Additional metadata */
  metadata?: Record<string, unknown>;
}

export class DocumentsResource extends BaseResource {
  protected readonly basePath = '/api/v1/documents';

  /**
   * Upload a document (multipart/form-data).
   *
   * @example
   * ```typescript
   * // Node.js - from file path
   * import { readFileSync } from 'fs';
   * const buffer = readFileSync('./report.pdf');
   * const doc = await client.documents.upload({
   *   file: buffer,
   *   filename: 'report.pdf',
   * });
   *
   * // Browser - from File input
   * const file = document.querySelector('input[type=file]').files[0];
   * const doc = await client.documents.upload({
   *   file: file,
   *   filename: file.name,
   * });
   * ```
   */
  async upload(params: UploadDocumentParams, options?: RequestOptions): Promise<ApiResponse<Document>> {
    const formData = new FormData();

    // Handle different file types
    if (params.file instanceof Blob) {
      formData.append('file', params.file, params.filename);
    } else if (Buffer.isBuffer(params.file)) {
      const blob = new Blob([params.file], { type: params.contentType ?? 'application/octet-stream' });
      formData.append('file', blob, params.filename);
    } else {
      throw new ConnectionError('Streaming uploads are not supported. Please provide a Buffer or Blob.');
    }

    if (params.metadata) {
      formData.append('metadata', JSON.stringify(params.metadata));
    }

    const response = await this.http.requestRaw({
      method: 'POST',
      path: `${this.basePath}/upload`,
      headers: {
        // Don't set Content-Type -- fetch will set it with the boundary
        ...options?.headers,
      },
      ...options,
    });

    // Need to handle form data manually since our HTTP client sets Content-Type: application/json
    // Override with a direct fetch call for multipart
    const baseUrl = (this.http as any).config.baseUrl.replace(/\/+$/, '');
    const apiKey = (this.http as any).config.apiKey;
    const userId = options?.userId ?? (this.http as any).config.userId;
    const fetchFn = (this.http as any).fetchFn ?? globalThis.fetch;

    const headers: Record<string, string> = {
      'Authorization': `Bearer ${apiKey}`,
    };
    if (userId) headers['X-User-ID'] = userId;

    const res = await fetchFn(`${baseUrl}${this.basePath}/upload`, {
      method: 'POST',
      headers,
      body: formData,
      signal: options?.signal,
    });

    if (!res.ok) {
      const errorBody = await res.json().catch(() => ({
        error: { code: 'UPLOAD_FAILED', message: `Upload failed: ${res.statusText}` },
        meta: { requestId: 'unknown', timestamp: new Date().toISOString() },
      }));
      throw new AidenError(
        errorBody.error?.message ?? 'Upload failed',
        errorBody.error?.code ?? 'UPLOAD_FAILED',
        res.status,
        errorBody.meta?.requestId ?? 'unknown',
      );
    }

    return await res.json() as ApiResponse<Document>;
  }

  /** List uploaded documents. */
  async list(params?: ListParams, options?: RequestOptions): Promise<PaginatedResponse<Document>> {
    return this._list<Document>(this.basePath, params, options);
  }

  /** Get document metadata. */
  async get(id: string, options?: RequestOptions): Promise<ApiResponse<Document>> {
    return this._get<Document>(`${this.basePath}/${id}`, options);
  }

  /**
   * Download a document file. Returns a Response with the file stream.
   */
  async download(id: string, options?: RequestOptions): Promise<Response> {
    return this.http.requestRaw({
      method: 'GET',
      path: `${this.basePath}/${id}/download`,
      raw: true,
      ...options,
    });
  }

  /** Delete a document. */
  async delete(id: string, options?: RequestOptions): Promise<void> {
    return this._delete(`${this.basePath}/${id}`, options);
  }
}
