import { insertSvg } from './dom';
import { createIconlyError } from './errors';
import { fetchSvg } from './fetcher';
import { err, ok } from './result';
import { resolveStorage } from './storage';
import type { IconlyConfig, IconlyError, IconlyInstance, IconStorage, Result } from './types';

interface ResolvedIconlyConfig {
  file: string;
  version: string;
  debug: boolean;
  container?: string | HTMLElement;
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

  const resolveContainer = (): Result<HTMLElement> => {
    if (typeof document === 'undefined') {
      return err(
        createIconlyError('container_invalid', 'Document is not available in this environment.'),
      );
    }

    if (typeof resolved.container === 'string') {
      const found = document.querySelector(resolved.container);

      if (!found || !(found instanceof HTMLElement)) {
        return err(
          createIconlyError(
            'container_invalid',
            `Invalid container selector: "${resolved.container}".`,
          ),
        );
      }

      return ok(found);
    }

    if (resolved.container instanceof HTMLElement) {
      return ok(resolved.container);
    }

    const fallback = document.body ?? document.documentElement;

    if (!fallback) {
      return err(createIconlyError('container_invalid', 'No valid container element found.'));
    }

    return ok(fallback);
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
    const containerResult = resolveContainer();

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

    const insertResult = insertSvg(containerResult.value, data);

    if (!insertResult.ok) {
      return fail(insertResult.error);
    }

    logDebug('Iconly has successfully initialized.');

    return ok(undefined);
  };

  return { init, abort };
};
