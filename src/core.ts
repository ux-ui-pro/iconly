import { insertSvg, resolveContainer } from './dom';
import { fetchSvg } from './fetcher';
import { err, ok } from './result';
import { resolveStorage } from './storage';
import type { IconlyConfig, IconlyError, IconlyInstance, IconStorage, Result } from './types';

interface ResolvedIconlyConfig {
  file: string;
  version: string;
  debug: boolean;
  container?: string | HTMLElement;
  sanitize?: IconlyConfig['sanitize'];
  logger?: IconlyConfig['logger'];
  onError?: IconlyConfig['onError'];
  onDebug?: IconlyConfig['onDebug'];
}

export const createIconly = (config: IconlyConfig = {}): IconlyInstance => {
  const resolved: ResolvedIconlyConfig = {
    file: config.file ?? './icons.svg',
    version: config.version ?? '1.0',
    debug: config.debug ?? false,
    container: config.container,
    sanitize: config.sanitize,
    logger: config.logger,
    onError: config.onError,
    onDebug: config.onDebug,
  };

  const storage: IconStorage = resolveStorage(config.storage, {
    dbName: config.dbName,
    storeName: config.storeName,
    sessionKeyPrefix: config.sessionKeyPrefix,
  });

  let controller: AbortController | null = null;

  const abort = (): void => {
    controller?.abort();
  };

  const logDebug = (...messages: unknown[]): void => {
    if (!resolved.debug) {
      return;
    }

    resolved.onDebug?.(...messages);
    resolved.logger?.debug?.('[Iconly debug]', ...messages);
  };

  const logError = (error: IconlyError): void => {
    resolved.onError?.(error);
    resolved.logger?.error?.('[Iconly error]', error);
  };

  const fail = (error: IconlyError): Result<void> => {
    logError(error);

    return err(error);
  };

  const init = async (): Promise<Result<void>> => {
    const containerResult = resolveContainer(resolved.container);

    if (!containerResult.ok) {
      return fail(containerResult.error);
    }

    const cacheResult = await storage.get(resolved.version);

    if (!cacheResult.ok) {
      return fail(cacheResult.error);
    }

    let data = cacheResult.value?.data;

    if (!data) {
      controller = new AbortController();

      const fetchResult = await fetchSvg(resolved.file, controller.signal);

      if (!fetchResult.ok) {
        return fail(fetchResult.error);
      }

      data = fetchResult.value;

      const storeResult = await storage.set({
        version: resolved.version,
        data,
      });

      if (!storeResult.ok) {
        return fail(storeResult.error);
      }
    } else {
      logDebug('Using cached icon set', resolved.version);
    }

    const insertResult = insertSvg(containerResult.value, data, {
      sanitize: resolved.sanitize,
    });

    if (!insertResult.ok) {
      return fail(insertResult.error);
    }

    logDebug('Iconly has successfully initialized.');

    return ok(undefined);
  };

  return { init, abort };
};
