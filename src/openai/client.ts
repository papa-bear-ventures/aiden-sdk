import type { HttpClient } from '../core/http-client';
import type { RequestOptions } from '../core/types';
import { OpenAIChatStream } from '../stream/openai-stream';
import type {
  OpenAIChatCompletionRequest,
  OpenAIChatCompletionResponse,
  OpenAIModelObject,
  OpenAIModelsResponse,
  OpenAISpeechRequest,
  OpenAITranscriptionResponse,
} from './types';

export interface OpenAITranscribeParams {
  file: Blob | ArrayBuffer | Uint8Array;
  filename?: string;
  model?: string;
  language?: string;
  response_format?: 'json' | 'verbose_json' | 'text' | 'srt' | 'vtt';
  temperature?: number;
}

function modelPathSegments(modelId: string): string {
  const trimmed = modelId.replace(/^\/+/, '');
  return trimmed
    .split('/')
    .filter(Boolean)
    .map((s) => encodeURIComponent(s))
    .join('/');
}

function toBlobPart(file: Blob | ArrayBuffer | Uint8Array): Blob {
  if (typeof Blob !== 'undefined' && file instanceof Blob) {
    return file;
  }
  if (file instanceof ArrayBuffer) {
    return new Blob([file]);
  }
  return new Blob([file as BlobPart]);
}

const V1 = '/v1';

export class OpenAIClient {
  constructor(private readonly http: HttpClient) {}

  async chatCompletions(
    params: OpenAIChatCompletionRequest,
    options?: RequestOptions,
  ): Promise<OpenAIChatCompletionResponse | OpenAIChatStream> {
    if (params.stream) {
      const response = await this.http.requestRaw({
        method: 'POST',
        path: `${V1}/chat/completions`,
        body: params,
        headers: { Accept: 'text/event-stream', ...options?.headers },
        ...options,
      });
      return new OpenAIChatStream(response);
    }

    return this.http.requestPlain<OpenAIChatCompletionResponse>({
      method: 'POST',
      path: `${V1}/chat/completions`,
      body: params,
      ...options,
    });
  }

  async listModels(options?: RequestOptions): Promise<OpenAIModelsResponse> {
    return this.http.requestPlain<OpenAIModelsResponse>({
      method: 'GET',
      path: `${V1}/models`,
      ...options,
    });
  }

  async retrieveModel(modelId: string, options?: RequestOptions): Promise<OpenAIModelObject> {
    return this.http.requestPlain<OpenAIModelObject>({
      method: 'GET',
      path: `${V1}/models/${modelPathSegments(modelId)}`,
      ...options,
    });
  }

  async transcribe(params: OpenAITranscribeParams, options?: RequestOptions): Promise<OpenAITranscriptionResponse> {
    const form = new FormData();
    const blob = toBlobPart(params.file);
    form.append('file', blob, params.filename ?? 'audio.m4a');
    if (params.model !== undefined) form.append('model', params.model);
    if (params.language !== undefined) form.append('language', params.language);
    if (params.response_format !== undefined) {
      form.append('response_format', params.response_format);
    }
    if (params.temperature !== undefined) {
      form.append('temperature', String(params.temperature));
    }

    return this.http.requestPlain<OpenAITranscriptionResponse>({
      method: 'POST',
      path: `${V1}/audio/transcriptions`,
      body: form,
      bodyMode: 'raw',
      ...options,
    });
  }

  async speech(
    params: OpenAISpeechRequest,
    options?: RequestOptions,
  ): Promise<{ body: ArrayBuffer; contentType: string | null }> {
    const response = await this.http.requestRaw({
      method: 'POST',
      path: `${V1}/audio/speech`,
      body: params,
      ...options,
    });
    return {
      body: await response.arrayBuffer(),
      contentType: response.headers.get('content-type'),
    };
  }
}
