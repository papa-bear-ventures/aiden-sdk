/**
 * Knowledge Resource
 *
 * RAG search, chat with knowledge, research sessions.
 * This is the core intelligence layer of the Aiden API.
 */

import { BaseResource } from './base';
import type {
  ApiResponse,
  PaginatedResponse,
  ListParams,
  RequestOptions,
  ChatSession,
  KnowledgeAsset,
  StreamCallbacks,
} from '../types';
import type { AidenStream } from '../streaming';

// ============================================================================
// Request Types
// ============================================================================

export interface ThinkingChatParams {
  message: string;
  sessionId?: string;
  widgetId?: string;
  notebookId?: string;
  model?: string;
  /** Additional context or system instructions */
  context?: string;
}

export interface CreateChatSessionParams {
  title?: string;
  model?: string;
  notebookId?: string;
}

export interface StreamChatParams {
  message: string;
  model?: string;
}

export interface RagAskParams {
  question: string;
  model?: string;
  maxSources?: number;
}

export interface RagSearchParams {
  query: string;
  limit?: number;
  threshold?: number;
}

export interface ResearchGenerateParams {
  topic: string;
  model?: string;
  depth?: string;
  format?: string;
}

export interface ResearchPreviewParams {
  topic: string;
  model?: string;
  depth?: string;
}

export interface CreateResearchSessionParams {
  title?: string;
  model?: string;
}

// ============================================================================
// Response Types
// ============================================================================

export interface RagSearchResult {
  content: string;
  source: string;
  score: number;
  metadata?: Record<string, unknown>;
}

export interface RagAskResponse {
  answer: string;
  sources: RagSearchResult[];
  model?: string;
}

export interface ChatCapabilities {
  models: string[];
  features: string[];
  maxMessageLength?: number;
}

export interface ResearchCapabilities {
  models: string[];
  depths: string[];
  formats: string[];
}

export interface ResearchPreview {
  estimatedCost: number;
  estimatedTokens: number;
  estimatedTime: string;
}

export interface ResearchSession {
  _id: string;
  title?: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

// ============================================================================
// Knowledge Resource
// ============================================================================

export class KnowledgeResource extends BaseResource {
  protected readonly basePath = '/api/v1/knowledge';

  // ==========================================================================
  // Unified Thinking Chat (Primary Chat Endpoint)
  // ==========================================================================

  /**
   * Send a message to the unified thinking chat (SSE stream).
   * This is the primary chat endpoint with the full decision layer.
   *
   * @returns An AidenStream that yields thinking events, deltas, and completion.
   *
   * @example
   * ```typescript
   * const stream = await client.knowledge.think({
   *   message: 'What are the key findings in our research?',
   *   notebookId: 'nb-123',
   * });
   *
   * for await (const event of stream) {
   *   if (event.type === 'delta') {
   *     process.stdout.write(event.data.content);
   *   }
   * }
   * ```
   */
  async think(params: ThinkingChatParams, options?: RequestOptions): Promise<AidenStream> {
    return this._stream(`${this.basePath}/chat/think`, params, options);
  }

  /**
   * Send a message to notebook-scoped thinking chat (SSE stream).
   */
  async thinkInNotebook(
    notebookId: string,
    params: Omit<ThinkingChatParams, 'notebookId'>,
    options?: RequestOptions,
  ): Promise<AidenStream> {
    return this._stream(`${this.basePath}/notebooks/${notebookId}/chat/think`, params, options);
  }

  // ==========================================================================
  // Chat Sessions
  // ==========================================================================

  /**
   * Create a new global chat session.
   */
  async createSession(params?: CreateChatSessionParams, options?: RequestOptions): Promise<ApiResponse<ChatSession>> {
    return this._create<ChatSession>(`${this.basePath}/chat/sessions`, params ?? {}, options);
  }

  /**
   * List all chat sessions.
   */
  async listSessions(params?: ListParams, options?: RequestOptions): Promise<PaginatedResponse<ChatSession>> {
    return this._list<ChatSession>(`${this.basePath}/chat/sessions`, params, options);
  }

  /**
   * Get a chat session with message history.
   */
  async getSession(sessionId: string, options?: RequestOptions): Promise<ApiResponse<ChatSession>> {
    return this._get<ChatSession>(`${this.basePath}/chat/sessions/${sessionId}`, options);
  }

  /**
   * Delete a chat session.
   */
  async deleteSession(sessionId: string, options?: RequestOptions): Promise<void> {
    return this._delete(`${this.basePath}/chat/sessions/${sessionId}`, options);
  }

  /**
   * Stream a message in an existing chat session (SSE).
   */
  async streamMessage(
    sessionId: string,
    params: StreamChatParams,
    options?: RequestOptions,
  ): Promise<AidenStream> {
    return this._stream(`${this.basePath}/chat/sessions/${sessionId}/stream`, params, options);
  }

  // ==========================================================================
  // Notebook Chat Sessions
  // ==========================================================================

  /**
   * Create a chat session scoped to a notebook.
   */
  async createNotebookSession(
    notebookId: string,
    params?: CreateChatSessionParams,
    options?: RequestOptions,
  ): Promise<ApiResponse<ChatSession>> {
    return this._create<ChatSession>(
      `${this.basePath}/notebooks/${notebookId}/chat/sessions`,
      params ?? {},
      options,
    );
  }

  /**
   * List chat sessions for a notebook.
   */
  async listNotebookSessions(
    notebookId: string,
    params?: ListParams,
    options?: RequestOptions,
  ): Promise<PaginatedResponse<ChatSession>> {
    return this._list<ChatSession>(
      `${this.basePath}/notebooks/${notebookId}/chat/sessions`,
      params,
      options,
    );
  }

  /**
   * Stream a message in a notebook chat session (SSE).
   */
  async streamNotebookMessage(
    notebookId: string,
    sessionId: string,
    params: StreamChatParams,
    options?: RequestOptions,
  ): Promise<AidenStream> {
    return this._stream(
      `${this.basePath}/notebooks/${notebookId}/chat/sessions/${sessionId}/stream`,
      params,
      options,
    );
  }

  // ==========================================================================
  // RAG (Retrieval-Augmented Generation)
  // ==========================================================================

  /**
   * Ask a question using RAG (returns structured answer with sources).
   */
  async ragAsk(
    notebookId: string,
    params: RagAskParams,
    options?: RequestOptions,
  ): Promise<ApiResponse<RagAskResponse>> {
    return this._create<RagAskResponse>(
      `${this.basePath}/notebooks/${notebookId}/rag/ask`,
      params,
      options,
    );
  }

  /**
   * Ask a question using RAG with streaming answer (SSE).
   */
  async ragAskStream(
    notebookId: string,
    params: RagAskParams,
    options?: RequestOptions,
  ): Promise<AidenStream> {
    return this._stream(
      `${this.basePath}/notebooks/${notebookId}/rag/ask/stream`,
      params,
      options,
    );
  }

  /**
   * Hybrid document search (vector + keyword).
   */
  async ragSearch(
    notebookId: string,
    params: RagSearchParams,
    options?: RequestOptions,
  ): Promise<ApiResponse<RagSearchResult[]>> {
    return this._create<RagSearchResult[]>(
      `${this.basePath}/notebooks/${notebookId}/rag/search`,
      params,
      options,
    );
  }

  /**
   * Global vector search across all notebooks.
   */
  async search(params: RagSearchParams, options?: RequestOptions): Promise<ApiResponse<RagSearchResult[]>> {
    return this._create<RagSearchResult[]>(`${this.basePath}/search`, params, options);
  }

  /**
   * Get a knowledge asset by ID (global, without notebook context).
   */
  async getAsset(assetId: string, options?: RequestOptions): Promise<ApiResponse<KnowledgeAsset>> {
    return this._get<KnowledgeAsset>(`${this.basePath}/assets/${assetId}`, options);
  }

  /**
   * Get RAG usage statistics.
   */
  async ragStats(options?: RequestOptions): Promise<ApiResponse<unknown>> {
    return this._get(`${this.basePath}/rag/stats`, options);
  }

  /**
   * Reindex all documents in a notebook.
   */
  async reindex(notebookId: string, options?: RequestOptions): Promise<ApiResponse<unknown>> {
    return this._create(`${this.basePath}/notebooks/${notebookId}/rag/reindex`, {}, options);
  }

  // ==========================================================================
  // Chat Capabilities
  // ==========================================================================

  /**
   * Get available chat capabilities (models, features, limits).
   */
  async capabilities(options?: RequestOptions): Promise<ApiResponse<ChatCapabilities>> {
    return this._get<ChatCapabilities>(`${this.basePath}/chat/capabilities`, options);
  }

  // ==========================================================================
  // Research
  // ==========================================================================

  /**
   * Generate a research document (synchronous).
   */
  async researchGenerate(
    notebookId: string,
    params: ResearchGenerateParams,
    options?: RequestOptions,
  ): Promise<ApiResponse<unknown>> {
    return this._create(`${this.basePath}/notebooks/${notebookId}/research/generate`, params, options);
  }

  /**
   * Preview research cost estimate.
   */
  async researchPreview(params: ResearchPreviewParams, options?: RequestOptions): Promise<ApiResponse<ResearchPreview>> {
    return this._create<ResearchPreview>(`${this.basePath}/research/preview`, params, options);
  }

  /**
   * Get research capabilities.
   */
  async researchCapabilities(options?: RequestOptions): Promise<ApiResponse<ResearchCapabilities>> {
    return this._get<ResearchCapabilities>(`${this.basePath}/research/capabilities`, options);
  }

  /**
   * Create a research session.
   */
  async createResearchSession(
    notebookId: string,
    params?: CreateResearchSessionParams,
    options?: RequestOptions,
  ): Promise<ApiResponse<ResearchSession>> {
    return this._create<ResearchSession>(
      `${this.basePath}/notebooks/${notebookId}/research/sessions`,
      params ?? {},
      options,
    );
  }

  /**
   * List research sessions for a notebook.
   */
  async listResearchSessions(
    notebookId: string,
    params?: ListParams,
    options?: RequestOptions,
  ): Promise<PaginatedResponse<ResearchSession>> {
    return this._list<ResearchSession>(
      `${this.basePath}/notebooks/${notebookId}/research/sessions`,
      params,
      options,
    );
  }

  /**
   * Get a research session.
   */
  async getResearchSession(
    notebookId: string,
    sessionId: string,
    options?: RequestOptions,
  ): Promise<ApiResponse<ResearchSession>> {
    return this._get<ResearchSession>(
      `${this.basePath}/notebooks/${notebookId}/research/sessions/${sessionId}`,
      options,
    );
  }

  /**
   * Stream a research session (SSE).
   */
  async streamResearch(
    notebookId: string,
    sessionId: string,
    params: { message: string },
    options?: RequestOptions,
  ): Promise<AidenStream> {
    return this._stream(
      `${this.basePath}/notebooks/${notebookId}/research/sessions/${sessionId}/stream`,
      params,
      options,
    );
  }
}
