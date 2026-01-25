import { createIconlyError } from './errors';
import { err, ok } from './result';
import type { Result } from './types';

export const fetchSvg = async (file: string, signal?: AbortSignal): Promise<Result<string>> => {
  try {
    const response = await fetch(file, { signal });

    if (!response.ok) {
      return err(createIconlyError('fetch_failed', `Failed to fetch icons from "${file}".`));
    }

    const data = await response.text();

    return ok(data);
  } catch (error: unknown) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      return err(createIconlyError('fetch_aborted', 'Fetch request was aborted.', error));
    }

    return err(createIconlyError('fetch_failed', 'Failed to fetch icons.', error));
  }
};
