import { insertSvg, resolveContainer } from './dom';
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
  sanitize?: IconlyConfig['sanitize'];
  logger?: IconlyConfig['logger'];
  onError?: IconlyConfig['onError'];
  onDebug?: IconlyConfig['onDebug'];
}

const createCacheKey = (file: string, version: string, baseUrl: string): string => {
  try {
    return JSON.stringify([new URL(file, baseUrl).href, version]);
  } catch {
    return JSON.stringify([file, version]);
  }
};

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
  let inFlight: Promise<Result<void>> | null = null;

  const abort = (): void => {
    controller?.abort();
  };

  const logDebug = (...messages: unknown[]): void => {
    if (!resolved.debug) {
      return;
    }

    try {
      resolved.onDebug?.(...messages);
    } catch {
      // User callbacks must not break the Result contract.
    }

    try {
      resolved.logger?.debug?.('[Iconly debug]', ...messages);
    } catch {
      // User callbacks must not break the Result contract.
    }
  };

  const logError = (error: IconlyError): void => {
    try {
      resolved.onError?.(error);
    } catch {
      // User callbacks must not break the Result contract.
    }

    try {
      resolved.logger?.error?.('[Iconly error]', error);
    } catch {
      // User callbacks must not break the Result contract.
    }
  };

  const fail = (error: IconlyError): Result<void> => {
    logError(error);

    return err(error);
  };

  const runInit = async (): Promise<Result<void>> => {
    try {
      const containerResult = resolveContainer(resolved.container);

      if (!containerResult.ok) {
        return fail(containerResult.error);
      }

      const cacheKey = createCacheKey(
        resolved.file,
        resolved.version,
        containerResult.value.ownerDocument.baseURI,
      );
      let cacheAvailable = true;
      let data: string | undefined;

      try {
        const cacheResult = await storage.get(cacheKey);

        if (cacheResult.ok) {
          data = cacheResult.value?.data;
        } else {
          cacheAvailable = false;
          logError(cacheResult.error);
        }
      } catch (error: unknown) {
        cacheAvailable = false;
        logError(
          createIconlyError('storage_read_failed', 'Failed to read from icon storage.', error),
        );
      }

      if (data) {
        const insertResult = insertSvg(containerResult.value, data, {
          sanitize: resolved.sanitize,
        });

        if (insertResult.ok) {
          logDebug('Using cached icon set', resolved.version);
          logDebug('Iconly has successfully initialized.');

          return ok(undefined);
        }

        if (insertResult.error.cause) {
          return fail(insertResult.error);
        }

        logError(insertResult.error);
      }

      controller = new AbortController();

      const fetchResult = await fetchSvg(resolved.file, controller.signal);

      if (!fetchResult.ok) {
        return fail(fetchResult.error);
      }

      const insertResult = insertSvg(containerResult.value, fetchResult.value, {
        sanitize: resolved.sanitize,
      });

      if (!insertResult.ok) {
        return fail(insertResult.error);
      }

      if (cacheAvailable) {
        try {
          const storeResult = await storage.set({
            version: cacheKey,
            data: fetchResult.value,
          });

          if (!storeResult.ok) {
            logError(storeResult.error);
          }
        } catch (error: unknown) {
          logError(
            createIconlyError('storage_write_failed', 'Failed to write to icon storage.', error),
          );
        }
      }

      logDebug('Iconly has successfully initialized.');

      return ok(undefined);
    } catch (error: unknown) {
      return fail(
        createIconlyError('unexpected_error', 'Unexpected error while initializing Iconly.', error),
      );
    }
  };

  const init = (): Promise<Result<void>> => {
    if (!inFlight) {
      inFlight = runInit().finally(() => {
        controller = null;
        inFlight = null;
      });
    }

    return inFlight;
  };

  return { init, abort };
};
