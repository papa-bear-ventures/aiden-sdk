/**
 * Users Resource
 *
 * Manage tenant users and user groups.
 */

import { BaseResource } from './base';
import type {
  ApiResponse,
  PaginatedResponse,
  ListParams,
  RequestOptions,
  User,
  UserGroup,
} from '../types';

export interface InviteUserParams {
  email: string;
  role?: string;
  groups?: string[];
}

export interface UpdateUserParams {
  tenantRole?: string;
  status?: string;
}

export interface CreateGroupParams {
  name: string;
  description?: string;
  members?: string[];
}

export interface UpdateGroupParams {
  name?: string;
  description?: string;
  members?: string[];
}

export class UsersResource extends BaseResource {
  protected readonly basePath = '/api/v1/users';

  /** List tenant users. */
  async list(params?: ListParams, options?: RequestOptions): Promise<PaginatedResponse<User>> {
    return this._list<User>(this.basePath, params, options);
  }

  /** Invite a user (Admin only). */
  async invite(params: InviteUserParams, options?: RequestOptions): Promise<ApiResponse<User>> {
    return this._create<User>(`${this.basePath}/invite`, params, options);
  }

  /** Update a user's role or status (Admin only). */
  async update(userId: string, params: UpdateUserParams, options?: RequestOptions): Promise<ApiResponse<User>> {
    return this._patch<User>(`${this.basePath}/${userId}`, params, options);
  }

  // ==========================================================================
  // User Groups
  // ==========================================================================

  /** List user groups. */
  async listGroups(params?: ListParams, options?: RequestOptions): Promise<PaginatedResponse<UserGroup>> {
    return this._list<UserGroup>(`${this.basePath}/groups`, params, options);
  }

  /** Create a user group. */
  async createGroup(params: CreateGroupParams, options?: RequestOptions): Promise<ApiResponse<UserGroup>> {
    return this._create<UserGroup>(`${this.basePath}/groups`, params, options);
  }

  /** Get a user group. */
  async getGroup(id: string, options?: RequestOptions): Promise<ApiResponse<UserGroup>> {
    return this._get<UserGroup>(`${this.basePath}/groups/${id}`, options);
  }

  /** Update a user group. */
  async updateGroup(id: string, params: UpdateGroupParams, options?: RequestOptions): Promise<ApiResponse<UserGroup>> {
    return this._update<UserGroup>(`${this.basePath}/groups/${id}`, params, options);
  }

  /** Delete a user group. */
  async deleteGroup(id: string, options?: RequestOptions): Promise<void> {
    return this._delete(`${this.basePath}/groups/${id}`, options);
  }
}
