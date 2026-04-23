import type { ResponseMeta } from './types';

export class AidenError extends Error {
  readonly code: string;
  readonly status: number;
  readonly requestId: string;
  readonly meta?: ResponseMeta;
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
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export class ValidationError extends AidenError {
  readonly fieldErrors?: Array<{ field: string; message: string; code?: string }>;

  constructor(message: string, code: string, requestId: string, meta?: ResponseMeta, details?: unknown) {
    super(message, code, 400, requestId, meta, details);
    this.name = 'ValidationError';
    if (Array.isArray(details)) {
      this.fieldErrors = details as Array<{ field: string; message: string; code?: string }>;
    }
  }
}

export class AuthenticationError extends AidenError {
  constructor(message: string, code: string, requestId: string, meta?: ResponseMeta, details?: unknown) {
    super(message, code, 401, requestId, meta, details);
    this.name = 'AuthenticationError';
  }
}

export class ForbiddenError extends AidenError {
  constructor(message: string, code: string, requestId: string, meta?: ResponseMeta, details?: unknown) {
    super(message, code, 403, requestId, meta, details);
    this.name = 'ForbiddenError';
  }
}

export class NotFoundError extends AidenError {
  constructor(message: string, code: string, requestId: string, meta?: ResponseMeta, details?: unknown) {
    super(message, code, 404, requestId, meta, details);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends AidenError {
  constructor(message: string, code: string, requestId: string, meta?: ResponseMeta, details?: unknown) {
    super(message, code, 409, requestId, meta, details);
    this.name = 'ConflictError';
  }
}

export class UnprocessableEntityError extends AidenError {
  constructor(message: string, code: string, requestId: string, meta?: ResponseMeta, details?: unknown) {
    super(message, code, 422, requestId, meta, details);
    this.name = 'UnprocessableEntityError';
  }
}

export class RateLimitError extends AidenError {
  readonly retryAfter: number;

  constructor(message: string, requestId: string, retryAfter: number, meta?: ResponseMeta, details?: unknown) {
    super(message, 'RATE_LIMITED', 429, requestId, meta, details);
    this.name = 'RateLimitError';
    this.retryAfter = retryAfter;
  }
}

export class InternalError extends AidenError {
  constructor(message: string, requestId: string, meta?: ResponseMeta, details?: unknown) {
    super(message, 'INTERNAL_ERROR', 500, requestId, meta, details);
    this.name = 'InternalError';
  }
}

export class BadGatewayError extends AidenError {
  constructor(message: string, requestId: string, meta?: ResponseMeta, details?: unknown) {
    super(message, 'BAD_GATEWAY', 502, requestId, meta, details);
    this.name = 'BadGatewayError';
  }
}

export class ServiceUnavailableError extends AidenError {
  constructor(message: string, requestId: string, meta?: ResponseMeta, details?: unknown) {
    super(message, 'SERVICE_UNAVAILABLE', 503, requestId, meta, details);
    this.name = 'ServiceUnavailableError';
  }
}

export class GatewayTimeoutError extends AidenError {
  constructor(message: string, requestId: string, meta?: ResponseMeta, details?: unknown) {
    super(message, 'GATEWAY_TIMEOUT', 504, requestId, meta, details);
    this.name = 'GatewayTimeoutError';
  }
}

export class ConnectionError extends AidenError {
  constructor(message: string, cause?: Error) {
    super(message, 'CONNECTION_ERROR', 0, 'unknown');
    this.name = 'ConnectionError';
    if (cause) {
      this.cause = cause;
    }
  }
}

export class TimeoutError extends AidenError {
  readonly timeoutMs: number;

  constructor(message: string, timeoutMs: number) {
    super(message, 'TIMEOUT', 0, 'unknown', undefined, { timeoutMs });
    this.name = 'TimeoutError';
    this.timeoutMs = timeoutMs;
  }
}

function normalizeErrorPayload(body: unknown): {
  error: { code: string; message: string; details?: unknown };
  meta: ResponseMeta;
} {
  const fallbackMeta = (): ResponseMeta => ({
    requestId: 'unknown',
    timestamp: new Date().toISOString(),
  });

  if (!body || typeof body !== 'object') {
    return {
      error: { code: 'UNKNOWN_ERROR', message: 'Request failed' },
      meta: fallbackMeta(),
    };
  }

  const b = body as Record<string, unknown>;

  if (b.error && typeof b.error === 'object') {
    const errObj = b.error as Record<string, unknown>;

    if (typeof errObj.code === 'string' && typeof errObj.message === 'string') {
      const meta =
        b.meta && typeof b.meta === 'object' ? (b.meta as ResponseMeta) : fallbackMeta();
      return {
        error: {
          code: errObj.code,
          message: errObj.message,
          details: errObj.details,
        },
        meta,
      };
    }

    if (typeof errObj.message === 'string') {
      const code =
        typeof errObj.code === 'string'
          ? errObj.code
          : typeof errObj.type === 'string'
            ? errObj.type
            : 'API_ERROR';
      return {
        error: { code, message: errObj.message, details: errObj },
        meta: fallbackMeta(),
      };
    }
  }

  return {
    error: {
      code: 'UNKNOWN_ERROR',
      message: typeof b.message === 'string' ? b.message : JSON.stringify(body),
    },
    meta: fallbackMeta(),
  };
}

export function createErrorFromResponse(status: number, body: unknown, retryAfterMs?: number): AidenError {
  const normalized = normalizeErrorPayload(body);
  const { code, message, details } = normalized.error;
  const { meta } = normalized;
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
