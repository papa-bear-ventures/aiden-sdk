/**
 * `/api/v1/knowledge` — RAG, unified thinking chat, research.
 *
 * Session chat streaming uses `think` / `thinkInNotebook` (legacy `/chat/sessions/.../stream` was removed server-side).
 */

import type { HttpClient } from '../core/http-client';
import type { ApiResponse, PaginatedResponse, ListParams, RequestOptions } from '../core/types';
import { AidenStream } from '../stream/aiden-stream';
import { listQuery } from './helpers';

const P = '/api/v1/knowledge';

export interface ThinkParams {
  message: string;
  sessionId?: string;
  widgetId?: string;
  notebookId?: string;
  model?: string;
  context?: string;
  confidentialMode?: boolean;
}

export class KnowledgeApi {
  constructor(private readonly http: HttpClient) {}

  async think(params: ThinkParams, options?: RequestOptions): Promise<AidenStream> {
    const res = await this.http.requestRaw({
      method: 'POST',
      path: `${P}/chat/think`,
      body: params,
      headers: { Accept: 'text/event-stream', ...options?.headers },
      ...options,
    });
    return new AidenStream(res);
  }

  async thinkInNotebook(notebookId: string, params: Omit<ThinkParams, 'notebookId'>, options?: RequestOptions): Promise<AidenStream> {
    const res = await this.http.requestRaw({
      method: 'POST',
      path: `${P}/notebooks/${notebookId}/chat/think`,
      body: params,
      headers: { Accept: 'text/event-stream', ...options?.headers },
      ...options,
    });
    return new AidenStream(res);
  }

  async createSession<T = unknown>(body: Record<string, unknown> = {}, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.http.request<T>({ method: 'POST', path: `${P}/chat/sessions`, body, ...options });
  }

  async listSessions(params?: ListParams, options?: RequestOptions): Promise<PaginatedResponse<unknown>> {
    return this.http.requestPaginated({ method: 'GET', path: `${P}/chat/sessions`, query: listQuery(params), ...options });
  }

  async getSession(sessionId: string, options?: RequestOptions): Promise<ApiResponse<unknown>> {
    return this.http.request({ method: 'GET', path: `${P}/chat/sessions/${sessionId}`, ...options });
  }

  async deleteSession(sessionId: string, options?: RequestOptions): Promise<void> {
    await this.http.requestRaw({ method: 'DELETE', path: `${P}/chat/sessions/${sessionId}`, ...options });
  }

  async createNotebookSession<T = unknown>(
    notebookId: string,
    body: Record<string, unknown> = {},
    options?: RequestOptions,
  ): Promise<ApiResponse<T>> {
    return this.http.request<T>({
      method: 'POST',
      path: `${P}/notebooks/${notebookId}/chat/sessions`,
      body,
      ...options,
    });
  }

  async listNotebookSessions(
    notebookId: string,
    params?: ListParams,
    options?: RequestOptions,
  ): Promise<PaginatedResponse<unknown>> {
    return this.http.requestPaginated({
      method: 'GET',
      path: `${P}/notebooks/${notebookId}/chat/sessions`,
      query: listQuery(params),
      ...options,
    });
  }

  async getNotebookSession(notebookId: string, sessionId: string, options?: RequestOptions): Promise<ApiResponse<unknown>> {
    return this.http.request({
      method: 'GET',
      path: `${P}/notebooks/${notebookId}/chat/sessions/${sessionId}`,
      ...options,
    });
  }

  async deleteNotebookSession(notebookId: string, sessionId: string, options?: RequestOptions): Promise<void> {
    await this.http.requestRaw({
      method: 'DELETE',
      path: `${P}/notebooks/${notebookId}/chat/sessions/${sessionId}`,
      ...options,
    });
  }

  async ragAsk(notebookId: string, body: Record<string, unknown>, options?: RequestOptions): Promise<ApiResponse<unknown>> {
    return this.http.request({
      method: 'POST',
      path: `${P}/notebooks/${notebookId}/rag/ask`,
      body,
      ...options,
    });
  }

  async ragAskStream(notebookId: string, body: Record<string, unknown>, options?: RequestOptions): Promise<AidenStream> {
    const res = await this.http.requestRaw({
      method: 'POST',
      path: `${P}/notebooks/${notebookId}/rag/ask/stream`,
      body,
      headers: { Accept: 'text/event-stream', ...options?.headers },
      ...options,
    });
    return new AidenStream(res);
  }

  async ragSearch(notebookId: string, body: Record<string, unknown>, options?: RequestOptions): Promise<ApiResponse<unknown>> {
    return this.http.request({
      method: 'POST',
      path: `${P}/notebooks/${notebookId}/rag/search`,
      body,
      ...options,
    });
  }

  async search(body: Record<string, unknown>, options?: RequestOptions): Promise<ApiResponse<unknown>> {
    return this.http.request({ method: 'POST', path: `${P}/search`, body, ...options });
  }

  async getAsset(assetId: string, options?: RequestOptions): Promise<ApiResponse<unknown>> {
    return this.http.request({ method: 'GET', path: `${P}/assets/${assetId}`, ...options });
  }

  async ragStats(options?: RequestOptions): Promise<ApiResponse<unknown>> {
    return this.http.request({ method: 'GET', path: `${P}/rag/stats`, ...options });
  }

  async reindexNotebook(notebookId: string, options?: RequestOptions): Promise<ApiResponse<unknown>> {
    return this.http.request({
      method: 'POST',
      path: `${P}/notebooks/${notebookId}/rag/reindex`,
      body: {},
      ...options,
    });
  }

  async capabilities(options?: RequestOptions): Promise<ApiResponse<unknown>> {
    return this.http.request({ method: 'GET', path: `${P}/chat/capabilities`, ...options });
  }

  async researchGenerate(notebookId: string, body: Record<string, unknown>, options?: RequestOptions): Promise<ApiResponse<unknown>> {
    return this.http.request({
      method: 'POST',
      path: `${P}/notebooks/${notebookId}/research/generate`,
      body,
      ...options,
    });
  }

  async researchPreview(body: Record<string, unknown>, options?: RequestOptions): Promise<ApiResponse<unknown>> {
    return this.http.request({ method: 'POST', path: `${P}/research/preview`, body, ...options });
  }

  async researchCapabilities(options?: RequestOptions): Promise<ApiResponse<unknown>> {
    return this.http.request({ method: 'GET', path: `${P}/research/capabilities`, ...options });
  }

  async createResearchSession(
    notebookId: string,
    body: Record<string, unknown> = {},
    options?: RequestOptions,
  ): Promise<ApiResponse<unknown>> {
    return this.http.request({
      method: 'POST',
      path: `${P}/notebooks/${notebookId}/research/sessions`,
      body,
      ...options,
    });
  }

  async listResearchSessions(
    notebookId: string,
    params?: ListParams,
    options?: RequestOptions,
  ): Promise<PaginatedResponse<unknown>> {
    return this.http.requestPaginated({
      method: 'GET',
      path: `${P}/notebooks/${notebookId}/research/sessions`,
      query: listQuery(params),
      ...options,
    });
  }

  async getResearchSession(notebookId: string, sessionId: string, options?: RequestOptions): Promise<ApiResponse<unknown>> {
    return this.http.request({
      method: 'GET',
      path: `${P}/notebooks/${notebookId}/research/sessions/${sessionId}`,
      ...options,
    });
  }

  async streamResearch(
    notebookId: string,
    sessionId: string,
    body: Record<string, unknown>,
    options?: RequestOptions,
  ): Promise<AidenStream> {
    const res = await this.http.requestRaw({
      method: 'POST',
      path: `${P}/notebooks/${notebookId}/research/sessions/${sessionId}/stream`,
      body,
      headers: { Accept: 'text/event-stream', ...options?.headers },
      ...options,
    });
    return new AidenStream(res);
  }
}
