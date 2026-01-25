import type { IconStorage, StorageStrategy } from '../types';
import { createIndexedDbStorage } from './indexeddb';
import { createMemoryStorage } from './memory';
import { createSessionStorage } from './session';

export interface StorageFactoryOptions {
  dbName?: string;
  storeName?: string;
  sessionKeyPrefix?: string;
}

export const resolveStorage = (
  strategy: StorageStrategy | undefined,
  options: StorageFactoryOptions,
): IconStorage => {
  if (!strategy || strategy === 'indexeddb') {
    return createIndexedDbStorage({
      dbName: options.dbName,
      storeName: options.storeName,
    });
  }

  if (strategy === 'memory') {
    return createMemoryStorage();
  }

  if (strategy === 'session') {
    return createSessionStorage({ keyPrefix: options.sessionKeyPrefix });
  }

  return strategy;
};
