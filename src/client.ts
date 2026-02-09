/**
 * AidenClient -- Main Entry Point
 *
 * The primary class for interacting with the Aiden API.
 * Provides access to all API resources through typed sub-clients.
 *
 * @example
 * ```typescript
 * import { AidenClient } from '@aiden-ai/sdk';
 *
 * const client = new AidenClient({
 *   apiKey: 'your-api-key',
 *   baseUrl: 'https://api.aiden.ai',
 *   userId: 'user-123', // optional
 * });
 *
 * // Access resources
 * const notebooks = await client.notebooks.list();
 * const stream = await client.knowledge.think({ message: 'Hello' });
 * const execution = await client.skills.run('skill-id', { inputs: {} });
 * ```
 */

import type { AidenClientConfig } from './types';
import { HttpClient } from './http';

// Resource imports
import { NotebooksResource } from './resources/notebooks';
import { KnowledgeResource } from './resources/knowledge';
import { ChatResource } from './resources/chat';
import { SkillsResource } from './resources/skills';
import { BillingResource } from './resources/billing';
import { PromptsResource } from './resources/prompts';
import { ArtifactsResource } from './resources/artifacts';
import { ModelsResource } from './resources/models';
import { UsersResource } from './resources/users';
import { AgentsResource } from './resources/agents';
import { DocumentsResource } from './resources/documents';
import { FlowsResource } from './resources/flows';
import { SlidesResource } from './resources/slides';
import { CredentialsResource } from './resources/credentials';
import { ExpertsResource } from './resources/experts';
import { TasksResource } from './resources/tasks';
import { MonitoringResource } from './resources/monitoring';

export class AidenClient {
  private readonly http: HttpClient;

  // ========================================================================
  // Resource Sub-Clients
  // ========================================================================

  /**
   * Manage notebooks and knowledge assets.
   *
   * @example
   * ```typescript
   * const nb = await client.notebooks.create({ name: 'Research' });
   * const assets = await client.notebooks.listAssets(nb.data._id);
   * ```
   */
  readonly notebooks: NotebooksResource;

  /**
   * RAG search, AI chat with knowledge, research sessions.
   * This is the core intelligence layer.
   *
   * @example
   * ```typescript
   * // Thinking chat with full decision layer (SSE stream)
   * const stream = await client.knowledge.think({
   *   message: 'Summarize our research findings',
   *   notebookId: 'nb-123',
   * });
   * for await (const event of stream) {
   *   if (event.type === 'delta') process.stdout.write(event.data.content);
   * }
   *
   * // RAG question answering
   * const answer = await client.knowledge.ragAsk('nb-123', {
   *   question: 'What are the key findings?',
   * });
   * ```
   */
  readonly knowledge: KnowledgeResource;

  /**
   * Public chat widget sessions and feedback.
   * For knowledge-powered chat, use `client.knowledge` instead.
   */
  readonly chat: ChatResource;

  /**
   * Manage and execute AI skills/workflows.
   *
   * @example
   * ```typescript
   * const exec = await client.skills.run('skill-id', {
   *   inputs: { text: 'Classify this ticket' },
   * });
   * // Poll for completion
   * const result = await client.skills.getExecution('skill-id', exec.data._id);
   * ```
   */
  readonly skills: SkillsResource;

  /** Billing, usage tracking, invoices, and spending limits. */
  readonly billing: BillingResource;

  /** Manage prompt templates. */
  readonly prompts: PromptsResource;

  /** Manage user-created documents/artifacts and versions. */
  readonly artifacts: ArtifactsResource;

  /** List and configure available AI models. */
  readonly models: ModelsResource;

  /** Manage tenant users and user groups. */
  readonly users: UsersResource;

  /** Agent builder sessions and MicroApps. */
  readonly agents: AgentsResource;

  /**
   * Upload, download, and manage documents.
   *
   * @example
   * ```typescript
   * const doc = await client.documents.upload({
   *   file: buffer,
   *   filename: 'report.pdf',
   * });
   * ```
   */
  readonly documents: DocumentsResource;

  /** Workflow instances, runs, and executions. */
  readonly flows: FlowsResource;

  /** AI presentation designer. */
  readonly slides: SlidesResource;

  /** Manage integration credentials. */
  readonly credentials: CredentialsResource;

  /** Discover and find experts. */
  readonly experts: ExpertsResource;

  /** Human-in-the-loop tasks. */
  readonly tasks: TasksResource;

  /** Usage statistics and monitoring. */
  readonly monitoring: MonitoringResource;

  // ========================================================================
  // Constructor
  // ========================================================================

  constructor(config: AidenClientConfig) {
    if (!config.apiKey) {
      throw new Error('AidenClient requires an apiKey. Get one from your Aiden dashboard.');
    }
    if (!config.baseUrl) {
      throw new Error('AidenClient requires a baseUrl (e.g., "https://api.aiden.ai").');
    }

    this.http = new HttpClient(config);

    // Initialize all resource sub-clients
    this.notebooks = new NotebooksResource(this.http);
    this.knowledge = new KnowledgeResource(this.http);
    this.chat = new ChatResource(this.http);
    this.skills = new SkillsResource(this.http);
    this.billing = new BillingResource(this.http);
    this.prompts = new PromptsResource(this.http);
    this.artifacts = new ArtifactsResource(this.http);
    this.models = new ModelsResource(this.http);
    this.users = new UsersResource(this.http);
    this.agents = new AgentsResource(this.http);
    this.documents = new DocumentsResource(this.http);
    this.flows = new FlowsResource(this.http);
    this.slides = new SlidesResource(this.http);
    this.credentials = new CredentialsResource(this.http);
    this.experts = new ExpertsResource(this.http);
    this.tasks = new TasksResource(this.http);
    this.monitoring = new MonitoringResource(this.http);
  }
}
