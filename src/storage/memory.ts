import { ok } from '../result';
import type { IconRecord, IconStorage, Result } from '../types';

export const createMemoryStorage = (): IconStorage => {
  const store = new Map<string, string>();

  const get = async (version: string): Promise<Result<IconRecord | undefined>> => {
    if (!store.has(version)) {
      return ok(undefined);
    }

    return ok({ version, data: store.get(version) ?? '' });
  };

  const set = async (record: IconRecord): Promise<Result<void>> => {
    store.set(record.version, record.data);

    return ok(undefined);
  };

  return { get, set };
};
