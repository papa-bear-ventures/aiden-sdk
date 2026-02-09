/**
 * Chat Resource
 *
 * Public chat widget endpoints and feedback.
 * For knowledge-powered chat (RAG, thinking), use `client.knowledge`.
 */

import { BaseResource } from './base';
import type {
  ApiResponse,
  RequestOptions,
  ChatSession,
  ChatMessage,
} from '../types';

// ============================================================================
// Request Types
// ============================================================================

export interface CreateWidgetSessionParams {
  userId?: string;
  metadata?: Record<string, unknown>;
}

export interface SendWidgetMessageParams {
  message: string;
  sessionId: string;
}

export interface SubmitFeedbackParams {
  messageId: string;
  rating: 'positive' | 'negative';
  comment?: string;
}

// ============================================================================
// Response Types
// ============================================================================

export interface ChatFeedback {
  _id: string;
  messageId: string;
  rating: string;
  comment?: string;
  createdAt?: string;
}

// ============================================================================
// Chat Resource
// ============================================================================

export class ChatResource extends BaseResource {
  protected readonly basePath = '/api/v1/chat';

  // ==========================================================================
  // Widget Sessions (Public chat)
  // ==========================================================================

  /**
   * Create a public chat session for a widget.
   */
  async createWidgetSession(
    widgetId: string,
    params?: CreateWidgetSessionParams,
    options?: RequestOptions,
  ): Promise<ApiResponse<ChatSession>> {
    return this._create<ChatSession>(`${this.basePath}/${widgetId}/session`, params ?? {}, options);
  }

  /**
   * Send a message to a public chat widget.
   */
  async sendWidgetMessage(
    widgetId: string,
    params: SendWidgetMessageParams,
    options?: RequestOptions,
  ): Promise<ApiResponse<ChatMessage>> {
    return this._create<ChatMessage>(`${this.basePath}/${widgetId}/message`, params, options);
  }

  /**
   * Get a public chat session's history.
   */
  async getWidgetSession(
    widgetId: string,
    sessionId: string,
    options?: RequestOptions,
  ): Promise<ApiResponse<ChatSession>> {
    return this._get<ChatSession>(`${this.basePath}/${widgetId}/session/${sessionId}`, options);
  }

  /**
   * Delete a public chat session.
   */
  async deleteWidgetSession(
    widgetId: string,
    sessionId: string,
    options?: RequestOptions,
  ): Promise<void> {
    return this._delete(`${this.basePath}/${widgetId}/session/${sessionId}`, options);
  }

  // ==========================================================================
  // Feedback
  // ==========================================================================

  /**
   * Submit feedback for a chat message.
   */
  async submitFeedback(params: SubmitFeedbackParams, options?: RequestOptions): Promise<ApiResponse<ChatFeedback>> {
    return this._create<ChatFeedback>(`${this.basePath}/feedback`, params, options);
  }

  /**
   * Get feedback for a specific message.
   */
  async getFeedback(messageId: string, options?: RequestOptions): Promise<ApiResponse<ChatFeedback>> {
    return this._get<ChatFeedback>(`${this.basePath}/feedback/${messageId}`, options);
  }
}
