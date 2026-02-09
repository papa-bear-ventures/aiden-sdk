/**
 * Aiden SDK Error Hierarchy
 *
 * Maps all API error codes to typed SDK exceptions for precise error handling.
 * Consumers can catch specific error types:
 *
 * @example
 * ```typescript
 * try {
 *   await client.notebooks.create({ name: 'Test' });
 * } catch (err) {
 *   if (err instanceof RateLimitError) {
 *     console.log(`Rate limited, retry after ${err.retryAfter}ms`);
 *   } else if (err instanceof AuthenticationError) {
 *     console.log('Invalid API key');
 *   }
 * }
 * ```
 */

import type { ResponseMeta } from './types';

// ============================================================================
// Base Error
// ============================================================================

/**
 * Base error class for all Aiden SDK errors.
 * Contains the API error code, HTTP status, and request metadata.
 */
export class AidenError extends Error {
  /** API error code (e.g., 'VALIDATION_ERROR', 'RATE_LIMITED') */
  readonly code: string;

  /** HTTP status code */
  readonly status: number;

  /** Request ID for debugging/support */
  readonly requestId: string;

  /** Response metadata */
  readonly meta?: ResponseMeta;

  /** Additional error details (validation errors, etc.) */
  readonly details?: unknown;

  constructor(
    message: string,
    code: string,
    status: number,
    requestId: string,
    meta?: ResponseMeta,
    details?: unknown,
  ) {
    super(message);
    this.name = 'AidenError';
    this.code = code;
    this.status = status;
    this.requestId = requestId;
    this.meta = meta;
    this.details = details;

    // Maintain proper stack trace in V8
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

// ============================================================================
// 4xx Client Errors
// ============================================================================

/**
 * 400 - Validation or invalid request error.
 * The request body or parameters failed validation.
 */
export class ValidationError extends AidenError {
  /** Structured field-level validation errors */
  readonly fieldErrors?: Array<{
    field: string;
    message: string;
    code?: string;
  }>;

  constructor(
    message: string,
    code: string,
    requestId: string,
    meta?: ResponseMeta,
    details?: unknown,
  ) {
    super(message, code, 400, requestId, meta, details);
    this.name = 'ValidationError';
    if (Array.isArray(details)) {
      this.fieldErrors = details as Array<{ field: string; message: string; code?: string }>;
    }
  }
}

/**
 * 401 - Authentication error.
 * The API key is missing, invalid, or expired.
 */
export class AuthenticationError extends AidenError {
  constructor(
    message: string,
    code: string,
    requestId: string,
    meta?: ResponseMeta,
    details?: unknown,
  ) {
    super(message, code, 401, requestId, meta, details);
    this.name = 'AuthenticationError';
  }
}

/**
 * 403 - Authorization error.
 * The API key doesn't have sufficient scope or the license is required.
 */
export class ForbiddenError extends AidenError {
  constructor(
    message: string,
    code: string,
    requestId: string,
    meta?: ResponseMeta,
    details?: unknown,
  ) {
    super(message, code, 403, requestId, meta, details);
    this.name = 'ForbiddenError';
  }
}

/**
 * 404 - Resource not found.
 */
export class NotFoundError extends AidenError {
  constructor(
    message: string,
    code: string,
    requestId: string,
    meta?: ResponseMeta,
    details?: unknown,
  ) {
    super(message, code, 404, requestId, meta, details);
    this.name = 'NotFoundError';
  }
}

/**
 * 409 - Conflict error.
 * A resource already exists or there's a duplicate.
 */
export class ConflictError extends AidenError {
  constructor(
    message: string,
    code: string,
    requestId: string,
    meta?: ResponseMeta,
    details?: unknown,
  ) {
    super(message, code, 409, requestId, meta, details);
    this.name = 'ConflictError';
  }
}

/**
 * 422 - Unprocessable entity.
 * The request was well-formed but semantically invalid.
 */
export class UnprocessableEntityError extends AidenError {
  constructor(
    message: string,
    code: string,
    requestId: string,
    meta?: ResponseMeta,
    details?: unknown,
  ) {
    super(message, code, 422, requestId, meta, details);
    this.name = 'UnprocessableEntityError';
  }
}

/**
 * 429 - Rate limit exceeded.
 * Contains the retry-after duration.
 */
export class RateLimitError extends AidenError {
  /** Time in milliseconds until the rate limit resets */
  readonly retryAfter: number;

  constructor(
    message: string,
    requestId: string,
    retryAfter: number,
    meta?: ResponseMeta,
    details?: unknown,
  ) {
    super(message, 'RATE_LIMITED', 429, requestId, meta, details);
    this.name = 'RateLimitError';
    this.retryAfter = retryAfter;
  }
}

// ============================================================================
// 5xx Server Errors
// ============================================================================

/**
 * 500 - Internal server error.
 */
export class InternalError extends AidenError {
  constructor(
    message: string,
    requestId: string,
    meta?: ResponseMeta,
    details?: unknown,
  ) {
    super(message, 'INTERNAL_ERROR', 500, requestId, meta, details);
    this.name = 'InternalError';
  }
}

/**
 * 502 - Bad gateway (upstream LLM or service failure).
 */
export class BadGatewayError extends AidenError {
  constructor(
    message: string,
    requestId: string,
    meta?: ResponseMeta,
    details?: unknown,
  ) {
    super(message, 'BAD_GATEWAY', 502, requestId, meta, details);
    this.name = 'BadGatewayError';
  }
}

/**
 * 503 - Service unavailable.
 */
export class ServiceUnavailableError extends AidenError {
  constructor(
    message: string,
    requestId: string,
    meta?: ResponseMeta,
    details?: unknown,
  ) {
    super(message, 'SERVICE_UNAVAILABLE', 503, requestId, meta, details);
    this.name = 'ServiceUnavailableError';
  }
}

/**
 * 504 - Gateway timeout (upstream LLM timeout).
 */
export class GatewayTimeoutError extends AidenError {
  constructor(
    message: string,
    requestId: string,
    meta?: ResponseMeta,
    details?: unknown,
  ) {
    super(message, 'GATEWAY_TIMEOUT', 504, requestId, meta, details);
    this.name = 'GatewayTimeoutError';
  }
}

// ============================================================================
// Connection / SDK Errors
// ============================================================================

/**
 * Network or connection error (no response received from server).
 */
export class ConnectionError extends AidenError {
  constructor(message: string, cause?: Error) {
    super(message, 'CONNECTION_ERROR', 0, 'unknown');
    this.name = 'ConnectionError';
    if (cause) {
      this.cause = cause;
    }
  }
}

/**
 * Request timed out.
 */
export class TimeoutError extends AidenError {
  readonly timeoutMs: number;

  constructor(message: string, timeoutMs: number) {
    super(message, 'TIMEOUT', 0, 'unknown', undefined, { timeoutMs });
    this.name = 'TimeoutError';
    this.timeoutMs = timeoutMs;
  }
}

// ============================================================================
// Error Factory
// ============================================================================

/**
 * Create the appropriate typed error from an API error response.
 *
 * @internal
 */
export function createErrorFromResponse(
  status: number,
  body: {
    error: { code: string; message: string; details?: unknown };
    meta: ResponseMeta;
  },
  retryAfterMs?: number,
): AidenError {
  const { code, message, details } = body.error;
  const { meta } = body;
  const requestId = meta?.requestId ?? 'unknown';

  switch (status) {
    case 400:
      return new ValidationError(message, code, requestId, meta, details);

    case 401:
      return new AuthenticationError(message, code, requestId, meta, details);

    case 403:
      return new ForbiddenError(message, code, requestId, meta, details);

    case 404:
      return new NotFoundError(message, code, requestId, meta, details);

    case 409:
      return new ConflictError(message, code, requestId, meta, details);

    case 422:
      return new UnprocessableEntityError(message, code, requestId, meta, details);

    case 429:
      return new RateLimitError(message, requestId, retryAfterMs ?? 60000, meta, details);

    case 500:
      return new InternalError(message, requestId, meta, details);

    case 502:
      return new BadGatewayError(message, requestId, meta, details);

    case 503:
      return new ServiceUnavailableError(message, requestId, meta, details);

    case 504:
      return new GatewayTimeoutError(message, requestId, meta, details);

    default:
      return new AidenError(message, code, status, requestId, meta, details);
  }
}
