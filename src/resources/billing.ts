/**
 * Billing Resource
 *
 * Usage tracking, billing status, invoices, and spending limits.
 */

import { BaseResource } from './base';
import type {
  ApiResponse,
  PaginatedResponse,
  ListParams,
  RequestOptions,
  BillingOverview,
  CreditTransaction,
  Invoice,
} from '../types';

// ============================================================================
// Request Types
// ============================================================================

export interface UpdateLimitsParams {
  dailyLimit?: number;
  warningThreshold?: number;
}

export interface UsageParams {
  startDate?: string;
  endDate?: string;
  granularity?: 'hourly' | 'daily' | 'weekly' | 'monthly';
}

// ============================================================================
// Response Types
// ============================================================================

export interface BillingStatus {
  isActive: boolean;
  hasCredits: boolean;
  isOverLimit: boolean;
  plan?: string;
}

export interface BillingConfig {
  dailyLimit: number;
  warningThreshold: number;
  plan: string;
}

export interface UsageBreakdown {
  date: string;
  totalTokens: number;
  totalCost: number;
  requests: number;
  byModel?: Record<string, unknown>;
}

// ============================================================================
// Billing Resource
// ============================================================================

export class BillingResource extends BaseResource {
  protected readonly basePath = '/api/v1/billing';

  /** Get billing dashboard overview. */
  async overview(options?: RequestOptions): Promise<ApiResponse<BillingOverview>> {
    return this._get<BillingOverview>(`${this.basePath}/overview`, options);
  }

  /** Quick billing status check. */
  async status(options?: RequestOptions): Promise<ApiResponse<BillingStatus>> {
    return this._get<BillingStatus>(`${this.basePath}/status`, options);
  }

  /** Get billing configuration. */
  async config(options?: RequestOptions): Promise<ApiResponse<BillingConfig>> {
    return this._get<BillingConfig>(`${this.basePath}/config`, options);
  }

  /** Update daily spending limits. */
  async updateLimits(params: UpdateLimitsParams, options?: RequestOptions): Promise<ApiResponse<BillingConfig>> {
    return this._update<BillingConfig>(`${this.basePath}/limits`, params, options);
  }

  /** Get daily usage breakdown. */
  async usageDaily(params?: UsageParams, options?: RequestOptions): Promise<ApiResponse<UsageBreakdown[]>> {
    return this._get<UsageBreakdown[]>(`${this.basePath}/usage/daily`, options);
  }

  /** Get per-user usage breakdown. */
  async usageByUser(params?: UsageParams, options?: RequestOptions): Promise<ApiResponse<unknown>> {
    return this._get(`${this.basePath}/usage/users`, options);
  }

  /** Get model usage breakdown. */
  async usageByModel(params?: UsageParams, options?: RequestOptions): Promise<ApiResponse<unknown>> {
    return this._get(`${this.basePath}/usage/models`, options);
  }

  /** Get credit transaction history. */
  async transactions(params?: ListParams, options?: RequestOptions): Promise<PaginatedResponse<CreditTransaction>> {
    return this._list<CreditTransaction>(`${this.basePath}/transactions`, params, options);
  }

  /** List invoices. */
  async invoices(params?: ListParams, options?: RequestOptions): Promise<PaginatedResponse<Invoice>> {
    return this._list<Invoice>(`${this.basePath}/invoices`, params, options);
  }

  /** Get invoice details. */
  async getInvoice(id: string, options?: RequestOptions): Promise<ApiResponse<Invoice>> {
    return this._get<Invoice>(`${this.basePath}/invoices/${id}`, options);
  }
}
