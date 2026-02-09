/**
 * Skills Resource
 *
 * Manage and execute AI skills/workflows.
 */

import { BaseResource } from './base';
import type {
  ApiResponse,
  PaginatedResponse,
  ListParams,
  RequestOptions,
  Skill,
  SkillExecution,
} from '../types';

// ============================================================================
// Request Types
// ============================================================================

export interface CreateSkillParams {
  name: string;
  description?: string;
  definition?: Record<string, unknown>;
}

export interface UpdateSkillParams {
  name?: string;
  description?: string;
  definition?: Record<string, unknown>;
}

export interface RunSkillParams {
  inputs?: Record<string, unknown>;
  userId?: string;
}

export interface ListSkillsParams extends ListParams {
  status?: string;
  type?: string;
}

// ============================================================================
// Response Types
// ============================================================================

export interface SkillTemplate {
  _id: string;
  name: string;
  description?: string;
  category?: string;
}

export interface SkillNode {
  type: string;
  name: string;
  description?: string;
  category?: string;
  inputs?: Record<string, unknown>;
  outputs?: Record<string, unknown>;
}

export interface SkillExecutionLog {
  _id: string;
  executionId: string;
  nodeId?: string;
  level: string;
  message: string;
  data?: unknown;
  timestamp: string;
}

// ============================================================================
// Skills Resource
// ============================================================================

export class SkillsResource extends BaseResource {
  protected readonly basePath = '/api/v1/skills';

  // ==========================================================================
  // CRUD
  // ==========================================================================

  /** Create a new skill/workflow. */
  async create(params: CreateSkillParams, options?: RequestOptions): Promise<ApiResponse<Skill>> {
    return this._create<Skill>(this.basePath, params, options);
  }

  /** List skills with pagination. */
  async list(params?: ListSkillsParams, options?: RequestOptions): Promise<PaginatedResponse<Skill>> {
    return this._list<Skill>(this.basePath, params, options);
  }

  /** Auto-paginate through all skills. */
  listAll(params?: Omit<ListSkillsParams, 'page'>, options?: RequestOptions): AsyncIterableIterator<Skill> {
    return this._listAll<Skill>(this.basePath, params, options);
  }

  /** Get a skill by ID with its definition. */
  async get(id: string, options?: RequestOptions): Promise<ApiResponse<Skill>> {
    return this._get<Skill>(`${this.basePath}/${id}`, options);
  }

  /** Update a skill. */
  async update(id: string, params: UpdateSkillParams, options?: RequestOptions): Promise<ApiResponse<Skill>> {
    return this._update<Skill>(`${this.basePath}/${id}`, params, options);
  }

  /** Archive a skill. */
  async delete(id: string, options?: RequestOptions): Promise<void> {
    return this._delete(`${this.basePath}/${id}`, options);
  }

  /** Bulk delete skills. */
  async bulkDelete(ids: string[], options?: RequestOptions): Promise<void> {
    return this._bulkDelete(`${this.basePath}/bulk-delete`, ids, options);
  }

  /** Duplicate a skill. */
  async duplicate(id: string, options?: RequestOptions): Promise<ApiResponse<Skill>> {
    return this._create<Skill>(`${this.basePath}/${id}/duplicate`, {}, options);
  }

  // ==========================================================================
  // Activation
  // ==========================================================================

  /** Activate a skill. */
  async activate(id: string, options?: RequestOptions): Promise<ApiResponse<Skill>> {
    return this._create<Skill>(`${this.basePath}/${id}/activate`, {}, options);
  }

  /** Deactivate a skill. */
  async deactivate(id: string, options?: RequestOptions): Promise<ApiResponse<Skill>> {
    return this._create<Skill>(`${this.basePath}/${id}/deactivate`, {}, options);
  }

  // ==========================================================================
  // Execution
  // ==========================================================================

  /**
   * Execute a skill with the given inputs.
   *
   * @example
   * ```typescript
   * const execution = await client.skills.run('skill-id', {
   *   inputs: { text: 'Classify this support ticket' },
   * });
   * console.log(execution.data.status); // 'running' or 'completed'
   * ```
   */
  async run(id: string, params?: RunSkillParams, options?: RequestOptions): Promise<ApiResponse<SkillExecution>> {
    return this._create<SkillExecution>(`${this.basePath}/${id}/run`, params ?? {}, options);
  }

  /** List executions for a skill. */
  async listExecutions(
    id: string,
    params?: ListParams,
    options?: RequestOptions,
  ): Promise<PaginatedResponse<SkillExecution>> {
    return this._list<SkillExecution>(`${this.basePath}/${id}/executions`, params, options);
  }

  /** Get execution details. */
  async getExecution(
    id: string,
    executionId: string,
    options?: RequestOptions,
  ): Promise<ApiResponse<SkillExecution>> {
    return this._get<SkillExecution>(`${this.basePath}/${id}/executions/${executionId}`, options);
  }

  /** Get execution logs. */
  async getExecutionLogs(
    id: string,
    params?: ListParams,
    options?: RequestOptions,
  ): Promise<PaginatedResponse<SkillExecutionLog>> {
    return this._list<SkillExecutionLog>(`${this.basePath}/${id}/logs`, params, options);
  }

  // ==========================================================================
  // Schema Versions
  // ==========================================================================

  /** Create a new schema version. */
  async createSchema(
    id: string,
    schema: Record<string, unknown>,
    options?: RequestOptions,
  ): Promise<ApiResponse<unknown>> {
    return this._create(`${this.basePath}/${id}/schemas`, schema, options);
  }

  /** List schema versions. */
  async listSchemas(id: string, options?: RequestOptions): Promise<PaginatedResponse<unknown>> {
    return this._list(`${this.basePath}/${id}/schemas`, undefined, options);
  }

  // ==========================================================================
  // Skill Data
  // ==========================================================================

  /** List data records for a skill. */
  async listData(id: string, params?: ListParams, options?: RequestOptions): Promise<PaginatedResponse<unknown>> {
    return this._list(`${this.basePath}/${id}/data`, params, options);
  }

  /** Create a data record for a skill. */
  async createData(
    id: string,
    data: Record<string, unknown>,
    options?: RequestOptions,
  ): Promise<ApiResponse<unknown>> {
    return this._create(`${this.basePath}/${id}/data`, data, options);
  }

  // ==========================================================================
  // Templates & Nodes
  // ==========================================================================

  /** List available skill templates. */
  async listTemplates(options?: RequestOptions): Promise<PaginatedResponse<SkillTemplate>> {
    return this._list<SkillTemplate>(`${this.basePath}/templates`, undefined, options);
  }

  /** Copy a template to create a new skill. */
  async copyTemplate(
    templateId: string,
    params?: { name?: string },
    options?: RequestOptions,
  ): Promise<ApiResponse<Skill>> {
    return this._create<Skill>(`${this.basePath}/copy-template`, { templateId, ...params }, options);
  }

  /** List available node types. */
  async listNodes(options?: RequestOptions): Promise<ApiResponse<SkillNode[]>> {
    return this._get<SkillNode[]>(`${this.basePath}/nodes`, options);
  }

  /** Get a node type definition. */
  async getNode(type: string, options?: RequestOptions): Promise<ApiResponse<SkillNode>> {
    return this._get<SkillNode>(`${this.basePath}/nodes/${type}`, options);
  }

  /** Get node categories. */
  async getNodeCategories(options?: RequestOptions): Promise<ApiResponse<unknown>> {
    return this._get(`${this.basePath}/nodes/meta/categories`, options);
  }

  /** Get examples for a node type. */
  async getNodeExamples(type: string, options?: RequestOptions): Promise<ApiResponse<unknown>> {
    return this._get(`${this.basePath}/nodes/${type}/examples`, options);
  }
}
