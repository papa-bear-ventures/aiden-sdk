import type { ListParams, RequestOptions } from '../core/types';

export function toQuery(params?: Record<string, unknown>): Record<string, string | number | boolean | undefined> {
  const q: Record<string, string | number | boolean | undefined> = {};
  if (!params) return q;
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null) {
      q[k] = v as string | number | boolean;
    }
  }
  return q;
}

export function listQuery(params?: ListParams): Record<string, string | number | boolean | undefined> {
  return toQuery(params as Record<string, unknown>);
}

export type Opt = RequestOptions | undefined;
