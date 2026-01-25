import type { IconlyError, IconlyErrorCode } from './types';

export const createIconlyError = (
  code: IconlyErrorCode,
  message: string,
  cause?: unknown,
): IconlyError => ({
  code,
  message,
  cause,
});
