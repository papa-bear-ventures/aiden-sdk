/**
 * Shared types for the Aiden external API client (`{ data, meta }` envelope).
 */

export interface AidenClientConfig {
  apiKey: string;
  baseUrl: string;
  userId?: string;
  timeout?: number;
  maxRetries?: number;
  fetch?: typeof fetch;
}

export interface ResponseMeta {
  requestId: string;
  timestamp: string;
  pagination?: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  data: T;
  meta: ResponseMeta;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: ResponseMeta;
}

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta: ResponseMeta;
}

export interface ApiVersionInfo {
  name: string;
  pathVersion: string;
  contractVersion: string;
  openApi?: { version: string; path: string };
  deprecationPolicy?: string;
}

/** `GET /api/v1` (authenticated index). */
export interface ApiV1Index {
  version: string;
  status: string;
  documentation: string;
  endpoints: Record<string, string>;
  openai_compatible: {
    chat_completions: string;
    models: string;
    audio_transcriptions: string;
    audio_speech: string;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  [key: string]: unknown;
}

export interface ListParams extends PaginationParams {
  search?: string;
}

export interface RequestOptions {
  timeout?: number;
  userId?: string;
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

export type PDCAPhase = 'plan' | 'do' | 'check' | 'act';
export type ThinkingEventVisibility = 'prominent' | 'detail' | 'hidden';

export type StreamEventType =
  | 'connected'
  | 'session_created'
  | 'thinking_start'
  | 'analysis_result'
  | 'decision_trace'
  | 'pdca_step'
  | 'thinking_complete'
  | 'execution_start'
  | 'generation_start'
  | 'delta'
  | 'fallback'
  | 'rag_search_start'
  | 'rag_search_result'
  | 'rag_citation'
  | 'proxy_search_start'
  | 'proxy_search_result'
  | 'citation'
  | 'tool_call_start'
  | 'tool_call_progress'
  | 'tool_call_result'
  | 'usage'
  | 'document_created'
  | 'complete'
  | 'error';

export interface StreamEvent<T = unknown> {
  type: StreamEventType;
  phase: PDCAPhase;
  data: T;
  timestamp: number;
  visibility: ThinkingEventVisibility;
  suggestedDelay?: number;
}

export interface DeltaEventData {
  content: string;
}

export interface CompleteEventData {
  sessionId?: string;
  messageId?: string;
  content?: string;
  sources?: unknown[];
}

export interface StreamCallbacks {
  onEvent?: (event: StreamEvent) => void;
  onDelta?: (content: string) => void;
  onComplete?: (data: CompleteEventData) => void;
  onError?: (error: Error) => void;
  onThinking?: (event: StreamEvent) => void;
}

/** Common shapes returned in `data` (narrow further in your app). */
export interface SkillExecution {
  _id: string;
  skillId?: string;
  status: string;
  inputs?: Record<string, unknown>;
  outputs?: Record<string, unknown>;
  error?: string;
  startedAt?: string;
  completedAt?: string;
  duration?: number;
}

/** Chat session document (IDs may also appear as `id` / `sessionId` depending on API version). */
export interface ChatSession {
  _id?: string;
  id?: string;
  sessionId?: string;
  title?: string;
  notebookId?: string;
  model?: string;
  messageCount?: number;
  lastMessageAt?: string;
  createdAt?: string;
  updatedAt?: string;
}
