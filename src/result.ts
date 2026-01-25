import type { IconlyError, Result } from './types';

export const ok = <T>(value: T): Result<T> => ({ ok: true, value });

export const err = <T = never>(error: IconlyError): Result<T> => ({ ok: false, error });
