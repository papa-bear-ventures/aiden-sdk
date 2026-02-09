/**
 * Core types for the Aiden SDK
 *
 * These mirror the standardized response envelopes from the Aiden External API.
 */

// ============================================================================
// Configuration
// ============================================================================

export interface AidenClientConfig {
  /** Your Aiden API key (Bearer token) */
  apiKey: string;

  /** Base URL of the Aiden API (e.g., 'https://api.aiden.ai') */
  baseUrl: string;

  /**
   * Optional user ID sent as X-User-ID header.
   * Required for user-scoped operations (notebooks, chat, documents).
   * The consuming service is responsible for authenticating their users.
   */
  userId?: string;

  /**
   * Request timeout in milliseconds.
   * @default 30000
   */
  timeout?: number;

  /**
   * Maximum number of retries for failed requests (429, 5xx).
   * @default 3
   */
  maxRetries?: number;

  /**
   * Custom fetch implementation (for testing or environments without global fetch).
   */
  fetch?: typeof fetch;
}

// ============================================================================
// API Response Envelopes
// ============================================================================

/** Metadata included in every API response */
export interface ResponseMeta {
  requestId: string;
  timestamp: string;
  pagination?: PaginationMeta;
}

/** Pagination metadata for list endpoints */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/** Successful single-resource response */
export interface ApiResponse<T> {
  data: T;
  meta: ResponseMeta;
}

/** Successful paginated collection response */
export interface PaginatedResponse<T> {
  data: T[];
  meta: ResponseMeta;
}

/** Error response from the API */
export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta: ResponseMeta;
}

// ============================================================================
// Request Types
// ============================================================================

/** Standard pagination query parameters */
export interface PaginationParams {
  page?: number;
  limit?: number;
  [key: string]: unknown;
}

/** Standard search + pagination parameters */
export interface ListParams extends PaginationParams {
  search?: string;
}

/** Request options that can be passed to any SDK method */
export interface RequestOptions {
  /** Override the default timeout for this request */
  timeout?: number;
  /** Override the user ID for this request */
  userId?: string;
  /** Custom headers to include */
  headers?: Record<string, string>;
  /** AbortController signal for cancellation */
  signal?: AbortSignal;
}

// ============================================================================
// SSE Streaming Types
// ============================================================================

/** Phases in the PDCA thinking cycle */
export type PDCAPhase = 'plan' | 'do' | 'check' | 'act';

/** Visibility levels for thinking events */
export type ThinkingEventVisibility = 'prominent' | 'detail' | 'hidden';

/** All possible SSE event types from the API */
export type StreamEventType =
  // Connection & session
  | 'connected'
  | 'session_created'
  // Thinking / analysis
  | 'thinking_start'
  | 'analysis_result'
  | 'decision_trace'
  | 'pdca_step'
  | 'thinking_complete'
  // Execution
  | 'execution_start'
  | 'generation_start'
  | 'delta'
  | 'fallback'
  // RAG
  | 'rag_search_start'
  | 'rag_search_result'
  | 'rag_citation'
  // Web search
  | 'proxy_search_start'
  | 'proxy_search_result'
  | 'citation'
  // Tool calls
  | 'tool_call_start'
  | 'tool_call_progress'
  | 'tool_call_result'
  // Completion
  | 'usage'
  | 'document_created'
  | 'complete'
  | 'error';

/** A single SSE event from the Aiden API */
export interface StreamEvent<T = unknown> {
  type: StreamEventType;
  phase: PDCAPhase;
  data: T;
  timestamp: number;
  visibility: ThinkingEventVisibility;
  suggestedDelay?: number;
}

/** Delta event data (streaming text chunks) */
export interface DeltaEventData {
  content: string;
}

/** Usage event data (token consumption) */
export interface UsageEventData {
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
  model?: string;
}

/** Error event data */
export interface ErrorEventData {
  code?: string;
  message: string;
}

/** Complete event data (final response summary) */
export interface CompleteEventData {
  sessionId?: string;
  messageId?: string;
  content?: string;
  sources?: unknown[];
}

/** Callbacks for stream consumption */
export interface StreamCallbacks {
  onEvent?: (event: StreamEvent) => void;
  onDelta?: (content: string) => void;
  onComplete?: (data: CompleteEventData) => void;
  onError?: (error: Error) => void;
  onThinking?: (event: StreamEvent) => void;
}

// ============================================================================
// Entity Types (Domain Models)
// ============================================================================

/** Notebook entity */
export interface Notebook {
  _id: string;
  name: string;
  description?: string;
  emoji?: string;
  color?: string;
  isDefault?: boolean;
  assetCount?: number;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

/** Knowledge asset entity */
export interface KnowledgeAsset {
  _id: string;
  notebookId: string;
  name: string;
  type: string;
  status: string;
  mimeType?: string;
  size?: number;
  chunkCount?: number;
  metadata?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
}

/** Chat session entity */
export interface ChatSession {
  _id: string;
  title?: string;
  notebookId?: string;
  model?: string;
  messageCount?: number;
  lastMessageAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

/** Chat message entity */
export interface ChatMessage {
  _id: string;
  sessionId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  model?: string;
  sources?: unknown[];
  usage?: UsageEventData;
  createdAt?: string;
}

/** Skill/workflow entity */
export interface Skill {
  _id: string;
  name: string;
  description?: string;
  status: 'active' | 'inactive' | 'draft' | 'archived';
  type?: string;
  version?: number;
  nodeCount?: number;
  executionCount?: number;
  lastExecutedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

/** Skill execution entity */
export interface SkillExecution {
  _id: string;
  skillId: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  inputs?: Record<string, unknown>;
  outputs?: Record<string, unknown>;
  error?: string;
  startedAt?: string;
  completedAt?: string;
  duration?: number;
}

/** Prompt entity */
export interface Prompt {
  _id: string;
  name: string;
  description?: string;
  content: string;
  category?: string;
  tags?: string[];
  isArchived?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/** Artifact entity */
export interface Artifact {
  _id: string;
  title: string;
  content: string;
  type?: string;
  format?: string;
  metadata?: Record<string, unknown>;
  versionCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

/** AI model entity */
export interface AIModel {
  id: string;
  name: string;
  provider: string;
  category?: string;
  contextWindow?: number;
  maxOutput?: number;
  capabilities?: string[];
  isDisabled?: boolean;
}

/** User entity */
export interface User {
  _id: string;
  email: string;
  displayName?: string;
  tenantRole: string;
  status?: string;
  lastLoginAt?: string;
  createdAt?: string;
}

/** User group entity */
export interface UserGroup {
  _id: string;
  name: string;
  description?: string;
  memberCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

/** Document (file) entity */
export interface Document {
  _id: string;
  filename: string;
  contentType: string;
  size: number;
  metadata?: Record<string, unknown>;
  uploadedBy?: string;
  createdAt?: string;
}

/** Billing overview */
export interface BillingOverview {
  currentPlan?: string;
  creditsRemaining?: number;
  creditsUsedToday?: number;
  dailyLimit?: number;
  billingPeriod?: {
    start: string;
    end: string;
  };
}

/** Credit transaction */
export interface CreditTransaction {
  _id: string;
  type: string;
  amount: number;
  description?: string;
  model?: string;
  createdAt?: string;
}

/** Invoice entity */
export interface Invoice {
  _id: string;
  number: string;
  status: string;
  amount: number;
  currency?: string;
  periodStart?: string;
  periodEnd?: string;
  createdAt?: string;
}

/** Expert entity */
export interface Expert {
  _id: string;
  name: string;
  description?: string;
  specialization?: string;
  capabilities?: string[];
}

/** Flow entity */
export interface Flow {
  _id: string;
  name: string;
  description?: string;
  status?: string;
  triggerType?: string;
  createdAt?: string;
  updatedAt?: string;
}

/** Flow run entity */
export interface FlowRun {
  _id: string;
  flowId: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  startedAt?: string;
  completedAt?: string;
  duration?: number;
  error?: string;
}

/** Human task entity */
export interface HumanTask {
  _id: string;
  title: string;
  description?: string;
  status: 'pending' | 'completed' | 'cancelled' | 'expired';
  formSchema?: unknown;
  response?: unknown;
  createdAt?: string;
  completedAt?: string;
}

/** MicroApp entity */
export interface MicroApp {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

/** Credential entity */
export interface Credential {
  _id: string;
  name: string;
  type: string;
  status?: string;
  lastTestedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

/** Slide designer session */
export interface SlideSession {
  _id: string;
  title?: string;
  theme?: string;
  slideCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

/** Monitoring usage data */
export interface UsageStats {
  totalRequests?: number;
  totalTokens?: number;
  totalCost?: number;
  byModel?: Record<string, unknown>;
  byUser?: Record<string, unknown>;
  period?: {
    start: string;
    end: string;
  };
}
