import type { AidenClientConfig, ApiResponse, ApiVersionInfo, ApiV1Index } from './core/types';
import { HttpClient } from './core/http-client';
import { OpenAIClient } from './openai/client';
import { KnowledgeApi } from './domains/knowledge';
import { NotebooksApi } from './domains/notebooks';
import { ChatApi } from './domains/chat';
import { SkillsApi } from './domains/skills';
import { ModelsApi } from './domains/models';
import { DocumentsApi } from './domains/documents';
import { FlowsApi } from './domains/flows';
import { BillingApi } from './domains/billing';
import { UsersApi } from './domains/users';
import { AgentsApi } from './domains/agents';
import { SlidesApi } from './domains/slides';
import { CredentialsApi } from './domains/credentials';
import { ExpertsApi } from './domains/experts';
import { TasksApi } from './domains/tasks';
import { ArtifactsApi } from './domains/artifacts';
import { PromptsApi } from './domains/prompts';
import { MonitoringApi } from './domains/monitoring';
import { VoiceApi } from './domains/voice';
import { ContextApi } from './domains/context';
import { TenantAdminApi } from './domains/tenant-admin';

/**
 * Official client for the Aiden **external API** (`/api/v1`, `/v1` OpenAI-compat).
 */
export class AidenClient {
  private readonly http: HttpClient;

  readonly openai: OpenAIClient;
  readonly knowledge: KnowledgeApi;
  readonly notebooks: NotebooksApi;
  readonly chat: ChatApi;
  readonly skills: SkillsApi;
  readonly models: ModelsApi;
  readonly documents: DocumentsApi;
  readonly flows: FlowsApi;
  readonly billing: BillingApi;
  readonly users: UsersApi;
  readonly agents: AgentsApi;
  readonly slides: SlidesApi;
  readonly credentials: CredentialsApi;
  readonly experts: ExpertsApi;
  readonly tasks: TasksApi;
  readonly artifacts: ArtifactsApi;
  readonly prompts: PromptsApi;
  readonly monitoring: MonitoringApi;
  readonly voice: VoiceApi;
  readonly context: ContextApi;
  readonly tenantAdmin: TenantAdminApi;

  constructor(config: AidenClientConfig) {
    if (!config.apiKey) {
      throw new Error('AidenClient requires apiKey (Bearer token).');
    }
    if (!config.baseUrl) {
      throw new Error('AidenClient requires baseUrl (external API origin, e.g. https://ext-api.example.com).');
    }

    this.http = new HttpClient(config);

    this.openai = new OpenAIClient(this.http);
    this.knowledge = new KnowledgeApi(this.http);
    this.notebooks = new NotebooksApi(this.http);
    this.chat = new ChatApi(this.http);
    this.skills = new SkillsApi(this.http);
    this.models = new ModelsApi(this.http);
    this.documents = new DocumentsApi(this.http);
    this.flows = new FlowsApi(this.http);
    this.billing = new BillingApi(this.http);
    this.users = new UsersApi(this.http);
    this.agents = new AgentsApi(this.http);
    this.slides = new SlidesApi(this.http);
    this.credentials = new CredentialsApi(this.http);
    this.experts = new ExpertsApi(this.http);
    this.tasks = new TasksApi(this.http);
    this.artifacts = new ArtifactsApi(this.http);
    this.prompts = new PromptsApi(this.http);
    this.monitoring = new MonitoringApi(this.http);
    this.voice = new VoiceApi(this.http);
    this.context = new ContextApi(this.http);
    this.tenantAdmin = new TenantAdminApi(this.http);
  }

  /** Public metadata — `GET /api/version` */
  async version(): Promise<ApiResponse<ApiVersionInfo>> {
    return this.http.request<ApiVersionInfo>({ method: 'GET', path: '/api/version' });
  }

  /** Authenticated route index — `GET /api/v1` */
  async apiV1Index(): Promise<ApiResponse<ApiV1Index>> {
    return this.http.request<ApiV1Index>({ method: 'GET', path: '/api/v1' });
  }
}
