/**
 * Flows Resource
 *
 * Workflow instances, executions, and run management.
 */

import { BaseResource } from './base';
import type {
  ApiResponse,
  PaginatedResponse,
  ListParams,
  RequestOptions,
  Flow,
  FlowRun,
} from '../types';
import type { AidenStream } from '../streaming';

export interface CreateFlowParams {
  name: string;
  description?: string;
  definition?: Record<string, unknown>;
}

export interface CreateFlowInstanceParams {
  flowId: string;
  name?: string;
  config?: Record<string, unknown>;
}

export interface TriggerFlowParams {
  inputs?: Record<string, unknown>;
}

export interface FlowInstance {
  _id: string;
  flowId: string;
  name?: string;
  status: string;
  config?: Record<string, unknown>;
  createdAt?: string;
}

export interface FlowExecutionLog {
  _id: string;
  runId: string;
  nodeId?: string;
  level: string;
  message: string;
  data?: unknown;
  timestamp: string;
}

export class FlowsResource extends BaseResource {
  protected readonly basePath = '/api/v1/flows';

  // ==========================================================================
  // Flows
  // ==========================================================================

  async create(params: CreateFlowParams, options?: RequestOptions): Promise<ApiResponse<Flow>> {
    return this._create<Flow>(this.basePath, params, options);
  }

  async list(params?: ListParams, options?: RequestOptions): Promise<PaginatedResponse<Flow>> {
    return this._list<Flow>(this.basePath, params, options);
  }

  // ==========================================================================
  // Instances
  // ==========================================================================

  async createInstance(params: CreateFlowInstanceParams, options?: RequestOptions): Promise<ApiResponse<FlowInstance>> {
    return this._create<FlowInstance>(`${this.basePath}/instances`, params, options);
  }

  async listInstances(params?: ListParams, options?: RequestOptions): Promise<PaginatedResponse<FlowInstance>> {
    return this._list<FlowInstance>(`${this.basePath}/instances`, params, options);
  }

  // ==========================================================================
  // Runs
  // ==========================================================================

  /** Trigger a flow run. */
  async run(flowId: string, params?: TriggerFlowParams, options?: RequestOptions): Promise<ApiResponse<FlowRun>> {
    return this._create<FlowRun>(`${this.basePath}/${flowId}/run`, params ?? {}, options);
  }

  /** List flow runs. */
  async listRuns(params?: ListParams, options?: RequestOptions): Promise<PaginatedResponse<FlowRun>> {
    return this._list<FlowRun>(`${this.basePath}/runs`, params, options);
  }

  /** Get run details. */
  async getRun(runId: string, options?: RequestOptions): Promise<ApiResponse<FlowRun>> {
    return this._get<FlowRun>(`${this.basePath}/runs/${runId}`, options);
  }

  /** Get run execution logs. */
  async getRunLogs(runId: string, params?: ListParams, options?: RequestOptions): Promise<PaginatedResponse<FlowExecutionLog>> {
    return this._list<FlowExecutionLog>(`${this.basePath}/runs/${runId}/logs`, params, options);
  }

  /**
   * Stream run progress (SSE).
   */
  async streamRun(runId: string, options?: RequestOptions): Promise<AidenStream> {
    return this._streamGet(`${this.basePath}/runs/${runId}/stream`, options);
  }

  // ==========================================================================
  // Executions
  // ==========================================================================

  /** List all executions. */
  async listExecutions(params?: ListParams, options?: RequestOptions): Promise<PaginatedResponse<unknown>> {
    return this._list(`${this.basePath}/executions`, params, options);
  }

  /** Get execution details. */
  async getExecution(id: string, options?: RequestOptions): Promise<ApiResponse<unknown>> {
    return this._get(`${this.basePath}/executions/${id}`, options);
  }
}
