import { describe, it, expect } from 'vitest';
import {
  AidenError,
  ValidationError,
  AuthenticationError,
  RateLimitError,
  createErrorFromResponse,
} from '../src/core/errors';

describe('Error classes', () => {
  it('AidenError', () => {
    const err = new AidenError('test', 'TEST', 400, 'r1');
    expect(err.message).toBe('test');
    expect(err.code).toBe('TEST');
    expect(err.requestId).toBe('r1');
  });

  it('RateLimitError', () => {
    const err = new RateLimitError('x', 'r', 5000);
    expect(err.retryAfter).toBe(5000);
    expect(err.status).toBe(429);
  });
});

describe('createErrorFromResponse', () => {
  const meta = { requestId: 'req-123', timestamp: '2026-01-01T00:00:00Z' };

  it('400 -> ValidationError', () => {
    const err = createErrorFromResponse(400, { error: { code: 'V', message: 'Bad' }, meta });
    expect(err).toBeInstanceOf(ValidationError);
  });

  it('401 -> AuthenticationError', () => {
    const err = createErrorFromResponse(401, { error: { code: 'AUTH', message: 'nope' }, meta });
    expect(err).toBeInstanceOf(AuthenticationError);
  });

  it('OpenAI-style body without meta', () => {
    const err = createErrorFromResponse(400, {
      error: { message: 'Invalid', type: 'invalid_request_error', code: 'x' },
    });
    expect(err).toBeInstanceOf(ValidationError);
    expect(err.message).toBe('Invalid');
  });
});
