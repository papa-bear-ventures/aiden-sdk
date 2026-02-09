/**
 * @aiden-ai/sdk -- Official TypeScript SDK for the Aiden AI API
 *
 * @example
 * ```typescript
 * import { AidenClient } from '@aiden-ai/sdk';
 *
 * const client = new AidenClient({
 *   apiKey: 'your-api-key',
 *   baseUrl: 'https://api.aiden.ai',
 * });
 *
 * // List notebooks
 * const notebooks = await client.notebooks.list();
 *
 * // Streaming chat with knowledge
 * const stream = await client.knowledge.think({
 *   message: 'What do you know about our products?',
 *   notebookId: 'nb-123',
 * });
 * for await (const event of stream) {
 *   if (event.type === 'delta') process.stdout.write(event.data.content);
 * }
 * ```
 *
 * @packageDocumentation
 */

// Main client
export { AidenClient } from './client';

// Types
export type {
  // Configuration
  AidenClientConfig,
  // Response envelopes
  ApiResponse,
  PaginatedResponse,
  ApiErrorResponse,
  ResponseMeta,
  PaginationMeta,
  // Request types
  PaginationParams,
  ListParams,
  RequestOptions,
  // SSE Streaming
  StreamEvent,
  StreamEventType,
  StreamCallbacks,
  DeltaEventData,
  UsageEventData,
  ErrorEventData,
  CompleteEventData,
  PDCAPhase,
  ThinkingEventVisibility,
  // Entities
  Notebook,
  KnowledgeAsset,
  ChatSession,
  ChatMessage,
  Skill,
  SkillExecution,
  Prompt,
  Artifact,
  AIModel,
  User,
  UserGroup,
  Document,
  BillingOverview,
  CreditTransaction,
  Invoice,
  Expert,
  Flow,
  FlowRun,
  HumanTask,
  MicroApp,
  Credential,
  SlideSession,
  UsageStats,
} from './types';

// Streaming
export { AidenStream } from './streaming';

// Errors
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
} from './errors';

// Resource types (for consumers who want to type function parameters)
export type {
  CreateNotebookParams,
  UpdateNotebookParams,
  CreateKnowledgeAssetParams,
  UpdateKnowledgeAssetParams,
} from './resources/notebooks';

export type {
  ThinkingChatParams,
  CreateChatSessionParams,
  StreamChatParams,
  RagAskParams,
  RagSearchParams,
  RagSearchResult,
  RagAskResponse,
  ChatCapabilities,
} from './resources/knowledge';

export type {
  CreateSkillParams,
  UpdateSkillParams,
  RunSkillParams,
} from './resources/skills';

export type {
  SubmitFeedbackParams,
} from './resources/chat';

export type {
  CreatePromptParams,
  UpdatePromptParams,
} from './resources/prompts';

export type {
  CreateArtifactParams,
  UpdateArtifactParams,
  SaveVersionParams,
} from './resources/artifacts';

export type {
  UploadDocumentParams,
} from './resources/documents';

export type {
  CreateFlowParams,
  TriggerFlowParams,
} from './resources/flows';

export type {
  InviteUserParams,
  UpdateUserParams,
  CreateGroupParams,
} from './resources/users';

export type {
  CreateCredentialParams,
} from './resources/credentials';
