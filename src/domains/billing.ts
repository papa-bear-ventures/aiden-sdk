import type { HttpClient } from '../core/http-client';
import type { ApiResponse, PaginatedResponse, ListParams, RequestOptions } from '../core/types';
import { listQuery } from './helpers';

const P = '/api/v1/billing';

export class BillingApi {
  constructor(private readonly http: HttpClient) {}

  async status(options?: RequestOptions): Promise<ApiResponse<unknown>> {
    return this.http.request({ method: 'GET', path: `${P}/status`, ...options });
  }

  async overview(options?: RequestOptions): Promise<ApiResponse<unknown>> {
    return this.http.request({ method: 'GET', path: `${P}/overview`, ...options });
  }

  async config(options?: RequestOptions): Promise<ApiResponse<unknown>> {
    return this.http.request({ method: 'GET', path: `${P}/config`, ...options });
  }

  async updateLimits(body: Record<string, unknown>, options?: RequestOptions): Promise<ApiResponse<unknown>> {
    return this.http.request({ method: 'PUT', path: `${P}/limits`, body, ...options });
  }

  async updateInvoiceSettings(body: Record<string, unknown>, options?: RequestOptions): Promise<ApiResponse<unknown>> {
    return this.http.request({ method: 'PUT', path: `${P}/invoice-settings`, body, ...options });
  }

  async usageDaily(options?: RequestOptions): Promise<ApiResponse<unknown>> {
    return this.http.request({ method: 'GET', path: `${P}/usage/daily`, ...options });
  }

  async usageUsers(options?: RequestOptions): Promise<ApiResponse<unknown>> {
    return this.http.request({ method: 'GET', path: `${P}/usage/users`, ...options });
  }

  async usageModels(options?: RequestOptions): Promise<ApiResponse<unknown>> {
    return this.http.request({ method: 'GET', path: `${P}/usage/models`, ...options });
  }

  async transactions(params?: ListParams, options?: RequestOptions): Promise<PaginatedResponse<unknown>> {
    return this.http.requestPaginated({
      method: 'GET',
      path: `${P}/transactions`,
      query: listQuery(params),
      ...options,
    });
  }

  async audit(options?: RequestOptions): Promise<ApiResponse<unknown>> {
    return this.http.request({ method: 'GET', path: `${P}/audit`, ...options });
  }

  async invoices(params?: ListParams, options?: RequestOptions): Promise<PaginatedResponse<unknown>> {
    return this.http.requestPaginated({
      method: 'GET',
      path: `${P}/invoices`,
      query: listQuery(params),
      ...options,
    });
  }

  async getInvoice(id: string, options?: RequestOptions): Promise<ApiResponse<unknown>> {
    return this.http.request({ method: 'GET', path: `${P}/invoices/${id}`, ...options });
  }

  async downloadInvoicePdf(id: string, options?: RequestOptions): Promise<Response> {
    return this.http.requestRaw({ method: 'GET', path: `${P}/invoices/${id}/pdf`, ...options });
  }

  async downloadInvoiceXml(id: string, options?: RequestOptions): Promise<Response> {
    return this.http.requestRaw({ method: 'GET', path: `${P}/invoices/${id}/xml`, ...options });
  }
}
