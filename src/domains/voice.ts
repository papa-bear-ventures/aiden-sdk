import type { HttpClient } from '../core/http-client';
import type { ApiResponse, RequestOptions } from '../core/types';

const P = '/api/v1';

export class VoiceApi {
  constructor(private readonly http: HttpClient) {}

  async tts(body: Record<string, unknown>, options?: RequestOptions): Promise<{ body: ArrayBuffer; contentType: string | null }> {
    const response = await this.http.requestRaw({
      method: 'POST',
      path: `${P}/tts`,
      body,
      ...options,
    });
    return {
      body: await response.arrayBuffer(),
      contentType: response.headers.get('content-type'),
    };
  }

  async stt(
    params: { audio: Blob | ArrayBuffer | Uint8Array; filename?: string; language?: string; sessionId?: string; response_format?: string },
    options?: RequestOptions,
  ): Promise<ApiResponse<unknown>> {
    const form = new FormData();
    const blob =
      typeof Blob !== 'undefined' && params.audio instanceof Blob
        ? params.audio
        : params.audio instanceof ArrayBuffer
          ? new Blob([params.audio])
          : new Blob([params.audio as BlobPart]);

    form.append('audio', blob, params.filename ?? 'audio.m4a');
    if (params.language) form.append('language', params.language);
    if (params.sessionId) form.append('sessionId', params.sessionId);
    if (params.response_format) form.append('response_format', params.response_format);

    return this.http.request({
      method: 'POST',
      path: `${P}/stt`,
      body: form,
      bodyMode: 'raw',
      ...options,
    });
  }
}
