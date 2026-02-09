import { describe, it, expect } from 'vitest';
import {
  AidenError,
  ValidationError,
  AuthenticationError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  InternalError,
  ConnectionError,
  TimeoutError,
  createErrorFromResponse,
} from '../src/errors';

describe('Error Classes', () => {
  it('should create AidenError with all properties', () => {
    const err = new AidenError('test', 'TEST_CODE', 400, 'req-123');
    expect(err.message).toBe('test');
    expect(err.code).toBe('TEST_CODE');
    expect(err.status).toBe(400);
    expect(err.requestId).toBe('req-123');
    expect(err.name).toBe('AidenError');
    expect(err instanceof Error).toBe(true);
  });

  it('should create ValidationError with field errors', () => {
    const details = [{ field: 'name', message: 'required' }];
    const err = new ValidationError('Validation failed', 'VALIDATION_ERROR', 'req-1', undefined, details);
    expect(err.status).toBe(400);
    expect(err.fieldErrors).toHaveLength(1);
    expect(err.fieldErrors![0].field).toBe('name');
    expect(err instanceof AidenError).toBe(true);
  });

  it('should create RateLimitError with retryAfter', () => {
    const err = new RateLimitError('Too many requests', 'req-1', 30000);
    expect(err.status).toBe(429);
    expect(err.retryAfter).toBe(30000);
    expect(err.code).toBe('RATE_LIMITED');
  });

  it('should create TimeoutError with timeoutMs', () => {
    const err = new TimeoutError('Timed out', 5000);
    expect(err.timeoutMs).toBe(5000);
    expect(err.code).toBe('TIMEOUT');
  });

  it('should create ConnectionError', () => {
    const cause = new TypeError('fetch failed');
    const err = new ConnectionError('Connection failed', cause);
    expect(err.code).toBe('CONNECTION_ERROR');
    expect(err.status).toBe(0);
  });
});

describe('createErrorFromResponse', () => {
  const meta = { requestId: 'req-123', timestamp: '2026-01-01T00:00:00Z' };

  it('should create ValidationError for 400', () => {
    const err = createErrorFromResponse(400, {
      error: { code: 'VALIDATION_ERROR', message: 'Bad request' },
      meta,
    });
    expect(err).toBeInstanceOf(ValidationError);
    expect(err.status).toBe(400);
  });

  it('should create AuthenticationError for 401', () => {
    const err = createErrorFromResponse(401, {
      error: { code: 'INVALID_API_KEY', message: 'Invalid key' },
      meta,
    });
    expect(err).toBeInstanceOf(AuthenticationError);
    expect(err.code).toBe('INVALID_API_KEY');
  });

  it('should create ForbiddenError for 403', () => {
    const err = createErrorFromResponse(403, {
      error: { code: 'INSUFFICIENT_SCOPE', message: 'No access' },
      meta,
    });
    expect(err).toBeInstanceOf(ForbiddenError);
  });

  it('should create NotFoundError for 404', () => {
    const err = createErrorFromResponse(404, {
      error: { code: 'NOT_FOUND', message: 'Not found' },
      meta,
    });
    expect(err).toBeInstanceOf(NotFoundError);
  });

  it('should create ConflictError for 409', () => {
    const err = createErrorFromResponse(409, {
      error: { code: 'DUPLICATE_RESOURCE', message: 'Exists' },
      meta,
    });
    expect(err).toBeInstanceOf(ConflictError);
  });

  it('should create RateLimitError for 429', () => {
    const err = createErrorFromResponse(429, {
      error: { code: 'RATE_LIMITED', message: 'Slow down' },
      meta,
    }, 60000);
    expect(err).toBeInstanceOf(RateLimitError);
    expect((err as RateLimitError).retryAfter).toBe(60000);
  });

  it('should create InternalError for 500', () => {
    const err = createErrorFromResponse(500, {
      error: { code: 'INTERNAL_ERROR', message: 'Server error' },
      meta,
    });
    expect(err).toBeInstanceOf(InternalError);
  });

  it('should create generic AidenError for unknown status', () => {
    const err = createErrorFromResponse(418, {
      error: { code: 'TEAPOT', message: 'I am a teapot' },
      meta,
    });
    expect(err).toBeInstanceOf(AidenError);
    expect(err.status).toBe(418);
    expect(err.code).toBe('TEAPOT');
  });
});
