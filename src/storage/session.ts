import { createIconlyError } from '../errors';
import { err, ok } from '../result';
import type { IconRecord, IconStorage, Result } from '../types';

interface SessionStorageOptions {
  keyPrefix?: string;
}

export const createSessionStorage = (options: SessionStorageOptions = {}): IconStorage => {
  const keyPrefix = options.keyPrefix ?? 'iconly';

  const resolveStorage = (): Result<Storage> => {
    try {
      if (typeof window === 'undefined' || !window.sessionStorage) {
        return err(createIconlyError('storage_unavailable', 'SessionStorage is not available.'));
      }

      return ok(window.sessionStorage);
    } catch (error: unknown) {
      return err(
        createIconlyError('storage_unavailable', 'SessionStorage is not available.', error),
      );
    }
  };

  const get = async (version: string): Promise<Result<IconRecord | undefined>> => {
    const storageResult = resolveStorage();

    if (!storageResult.ok) {
      return storageResult;
    }

    try {
      const raw = storageResult.value.getItem(`${keyPrefix}:${version}`);

      if (!raw) {
        return ok(undefined);
      }

      const parsed = JSON.parse(raw) as IconRecord;

      return ok(parsed);
    } catch (error: unknown) {
      return err(
        createIconlyError('storage_read_failed', 'Failed to read from SessionStorage.', error),
      );
    }
  };

  const set = async (record: IconRecord): Promise<Result<void>> => {
    const storageResult = resolveStorage();

    if (!storageResult.ok) {
      return storageResult;
    }

    try {
      storageResult.value.setItem(`${keyPrefix}:${record.version}`, JSON.stringify(record));

      return ok(undefined);
    } catch (error: unknown) {
      return err(
        createIconlyError('storage_write_failed', 'Failed to write to SessionStorage.', error),
      );
    }
  };

  return { get, set };
};
