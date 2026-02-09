/**
 * Slides Resource
 *
 * AI presentation designer sessions.
 */

import { BaseResource } from './base';
import type {
  ApiResponse,
  PaginatedResponse,
  ListParams,
  RequestOptions,
  SlideSession,
} from '../types';

export interface CreateSlideSessionParams {
  title?: string;
  theme?: string;
}

export interface SlideTheme {
  id: string;
  name: string;
  preview?: string;
}

export class SlidesResource extends BaseResource {
  protected readonly basePath = '/api/v1/slides';

  /** Get available presentation themes. */
  async themes(options?: RequestOptions): Promise<ApiResponse<SlideTheme[]>> {
    return this._get<SlideTheme[]>(`${this.basePath}/themes`, options);
  }

  async createSession(params?: CreateSlideSessionParams, options?: RequestOptions): Promise<ApiResponse<SlideSession>> {
    return this._create<SlideSession>(`${this.basePath}/sessions`, params ?? {}, options);
  }

  async listSessions(params?: ListParams, options?: RequestOptions): Promise<PaginatedResponse<SlideSession>> {
    return this._list<SlideSession>(`${this.basePath}/sessions`, params, options);
  }

  async getSession(sessionId: string, options?: RequestOptions): Promise<ApiResponse<SlideSession>> {
    return this._get<SlideSession>(`${this.basePath}/sessions/${sessionId}`, options);
  }

  async deleteSession(sessionId: string, options?: RequestOptions): Promise<void> {
    return this._delete(`${this.basePath}/sessions/${sessionId}`, options);
  }

  async sendMessage(
    sessionId: string,
    params: { message: string },
    options?: RequestOptions,
  ): Promise<ApiResponse<unknown>> {
    return this._create(`${this.basePath}/sessions/${sessionId}/messages`, params, options);
  }

  async selectDesign(
    sessionId: string,
    params: { themeId: string },
    options?: RequestOptions,
  ): Promise<ApiResponse<unknown>> {
    return this._create(`${this.basePath}/sessions/${sessionId}/design`, params, options);
  }

  async generateImages(sessionId: string, options?: RequestOptions): Promise<ApiResponse<unknown>> {
    return this._create(`${this.basePath}/sessions/${sessionId}/generate-images`, {}, options);
  }

  /** Export presentation as HTML. */
  async exportHtml(sessionId: string, options?: RequestOptions): Promise<Response> {
    return this.http.requestRaw({
      method: 'GET',
      path: `${this.basePath}/sessions/${sessionId}/export/html`,
      raw: true,
      ...options,
    });
  }
}
