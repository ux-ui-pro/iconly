import { createIconlyError } from '../errors';
import { err, ok } from '../result';
import type { IconlyError, IconRecord, IconStorage, Result } from '../types';

interface IndexedDbOptions {
  dbName?: string;
  storeName?: string;
}

export const createIndexedDbStorage = (options: IndexedDbOptions = {}): IconStorage => {
  const dbName = options.dbName ?? 'iconlyDB';
  const storeName = options.storeName ?? 'icons';

  let dbPromise: Promise<IDBDatabase> | null = null;

  const openDb = async (): Promise<IDBDatabase> => {
    if (dbPromise) {
      return dbPromise;
    }

    if (typeof indexedDB === 'undefined') {
      throw createIconlyError('indexeddb_not_supported', 'IndexedDB is not supported.');
    }

    dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open(dbName, 1);

      request.onerror = (): void => {
        reject(
          createIconlyError(
            'indexeddb_open_failed',
            'Failed to open IndexedDB connection.',
            request.error,
          ),
        );
      };

      request.onupgradeneeded = (event): void => {
        const db = (event.target as IDBOpenDBRequest).result;

        if (!db.objectStoreNames.contains(storeName)) {
          db.createObjectStore(storeName, { keyPath: 'version' });
        }
      };

      request.onsuccess = (): void => resolve(request.result);
    });

    return dbPromise;
  };

  const getStore = (db: IDBDatabase, mode: IDBTransactionMode): IDBObjectStore =>
    db.transaction(storeName, mode).objectStore(storeName);

  const toIconlyError = (
    error: unknown,
    fallbackCode: IconlyError['code'],
    message: string,
  ): IconlyError => {
    if (error && typeof error === 'object' && 'code' in error && 'message' in error) {
      return error as IconlyError;
    }

    return createIconlyError(fallbackCode, message, error);
  };

  const get = async (version: string): Promise<Result<IconRecord | undefined>> => {
    try {
      const db = await openDb();
      const store = getStore(db, 'readonly');

      return await new Promise<Result<IconRecord | undefined>>((resolve) => {
        const request = store.get(version);

        request.onsuccess = (): void => resolve(ok(request.result as IconRecord | undefined));
        request.onerror = (): void =>
          resolve(
            err(
              createIconlyError(
                'indexeddb_request_failed',
                'Failed to read from IndexedDB.',
                request.error,
              ),
            ),
          );
      });
    } catch (error: unknown) {
      return err(toIconlyError(error, 'indexeddb_open_failed', 'Failed to open IndexedDB.'));
    }
  };

  const set = async (record: IconRecord): Promise<Result<void>> => {
    try {
      const db = await openDb();
      const store = getStore(db, 'readwrite');

      return await new Promise<Result<void>>((resolve) => {
        const request = store.put(record);

        request.onsuccess = (): void => resolve(ok(undefined));
        request.onerror = (): void =>
          resolve(
            err(
              createIconlyError(
                'indexeddb_request_failed',
                'Failed to write to IndexedDB.',
                request.error,
              ),
            ),
          );
      });
    } catch (error: unknown) {
      return err(createIconlyError('indexeddb_open_failed', 'Failed to open IndexedDB.', error));
    }
  };

  return { get, set };
};
