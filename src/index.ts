/**
 * @aiden-ai/sdk — TypeScript client for the Aiden external API.
 *
 * @packageDocumentation
 */

export { AidenClient } from './client';

export type {
  AidenClientConfig,
  ApiResponse,
  PaginatedResponse,
  ApiErrorResponse,
  ApiVersionInfo,
  ApiV1Index,
  ResponseMeta,
  PaginationMeta,
  ListParams,
  PaginationParams,
  RequestOptions,
  StreamEvent,
  StreamEventType,
  StreamCallbacks,
  DeltaEventData,
  CompleteEventData,
  PDCAPhase,
  ThinkingEventVisibility,
  SkillExecution,
  ChatSession,
} from './core/types';

export {
  AidenError,
  ValidationError,
  AuthenticationError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  UnprocessableEntityError,
  RateLimitError,
  InternalError,
  BadGatewayError,
  ServiceUnavailableError,
  GatewayTimeoutError,
  ConnectionError,
  TimeoutError,
  createErrorFromResponse,
} from './core/errors';

export { HttpClient } from './core/http-client';
export type { HttpRequestOptions, HttpMethod } from './core/http-client';

export { AidenStream } from './stream/aiden-stream';
export { OpenAIChatStream } from './stream/openai-stream';

export { OpenAIClient } from './openai/client';
export type {
  OpenAIChatCompletionRequest,
  OpenAIChatCompletionResponse,
  OpenAIChatCompletionChunk,
  OpenAIChatMessage,
  OpenAIModelObject,
  OpenAIModelsResponse,
  OpenAISpeechRequest,
  OpenAITranscriptionResponse,
  OpenAIUsage,
} from './openai/types';
export type { OpenAITranscribeParams } from './openai/client';

export { KnowledgeApi } from './domains/knowledge';
export type { ThinkParams } from './domains/knowledge';

export { NotebooksApi } from './domains/notebooks';
export { ChatApi } from './domains/chat';
export { SkillsApi } from './domains/skills';
export { ModelsApi } from './domains/models';
export { DocumentsApi } from './domains/documents';
export { FlowsApi } from './domains/flows';
export { BillingApi } from './domains/billing';
export { UsersApi } from './domains/users';
export { AgentsApi } from './domains/agents';
export { SlidesApi } from './domains/slides';
export { CredentialsApi } from './domains/credentials';
export { ExpertsApi } from './domains/experts';
export { TasksApi } from './domains/tasks';
export { ArtifactsApi } from './domains/artifacts';
export { PromptsApi } from './domains/prompts';
export { MonitoringApi } from './domains/monitoring';
export { VoiceApi } from './domains/voice';
export { ContextApi } from './domains/context';
export { TenantAdminApi } from './domains/tenant-admin';
