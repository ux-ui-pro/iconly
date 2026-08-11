import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createIconly } from './index';
import type { IconStorage } from './types';

const svgPayload = '<svg xmlns="http://www.w3.org/2000/svg"><symbol id="icon-name"></symbol></svg>';

const mockFetch = () =>
  vi.fn().mockResolvedValue({
    ok: true,
    text: async () => svgPayload,
  });

const deleteDatabase = async (name: string): Promise<void> => {
  await new Promise<void>((resolve) => {
    const request = indexedDB.deleteDatabase(name);

    request.onsuccess = (): void => resolve();
    request.onerror = (): void => resolve();
    request.onblocked = (): void => resolve();
  });
};

beforeEach(() => {
  document.body.innerHTML = '';
  sessionStorage.clear();
});

describe('Iconly', () => {
  it('inserts svg into the DOM', async () => {
    const fetchMock = mockFetch();

    (globalThis as typeof globalThis & { fetch: typeof fetch }).fetch =
      fetchMock as unknown as typeof fetch;

    const container = document.createElement('div');

    document.body.appendChild(container);

    const iconly = createIconly({
      storage: 'memory',
      file: '/sprite.svg',
      version: '1.0',
      container,
    });

    const result = await iconly.init();

    expect(result.ok).toBe(true);

    const iconset = container.querySelector('[data-iconly="iconset"]');

    expect(iconset).not.toBeNull();
    expect(iconset?.querySelector('svg')).not.toBeNull();
  });

  it('uses IndexedDB cache on subsequent init', async () => {
    const dbName = 'iconly-test-db';

    await deleteDatabase(dbName);

    const fetchMock = mockFetch();

    (globalThis as typeof globalThis & { fetch: typeof fetch }).fetch =
      fetchMock as unknown as typeof fetch;

    const container = document.createElement('div');

    document.body.appendChild(container);

    const first = createIconly({
      storage: 'indexeddb',
      dbName,
      file: '/sprite.svg',
      version: '1.0',
      container,
    });

    const firstResult = await first.init();

    expect(firstResult.ok).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const second = createIconly({
      storage: 'indexeddb',
      dbName,
      file: '/sprite.svg',
      version: '1.0',
      container,
    });

    const secondResult = await second.init();

    expect(secondResult.ok).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('keeps different files with the same version in separate cache entries', async () => {
    const fetchMock = vi.fn(async (file: string) => ({
      ok: true,
      text: async () =>
        `<svg xmlns="http://www.w3.org/2000/svg"><symbol id="${file.includes('first') ? 'first' : 'second'}"></symbol></svg>`,
    }));

    (globalThis as typeof globalThis & { fetch: typeof fetch }).fetch =
      fetchMock as unknown as typeof fetch;

    const firstContainer = document.createElement('div');
    const secondContainer = document.createElement('div');

    document.body.append(firstContainer, secondContainer);

    const first = createIconly({
      storage: 'session',
      file: '/first.svg',
      version: '1.0',
      container: firstContainer,
    });
    const second = createIconly({
      storage: 'session',
      file: '/second.svg',
      version: '1.0',
      container: secondContainer,
    });

    expect((await first.init()).ok).toBe(true);
    expect((await second.init()).ok).toBe(true);
    expect(firstContainer.querySelector('#first')).not.toBeNull();
    expect(secondContainer.querySelector('#second')).not.toBeNull();

    const cachedContainer = document.createElement('div');

    document.body.appendChild(cachedContainer);

    expect(
      (
        await createIconly({
          storage: 'session',
          file: '/first.svg',
          version: '1.0',
          container: cachedContainer,
        }).init()
      ).ok,
    ).toBe(true);
    expect(cachedContainer.querySelector('symbol[id="first"]')).not.toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('renders without caching when storage read fails', async () => {
    const fetchMock = mockFetch();
    const onError = vi.fn();
    const set = vi.fn<IconStorage['set']>();
    const storage: IconStorage = {
      get: async () => ({
        ok: false,
        error: { code: 'storage_read_failed', message: 'Unavailable cache.' },
      }),
      set,
    };

    (globalThis as typeof globalThis & { fetch: typeof fetch }).fetch =
      fetchMock as unknown as typeof fetch;

    const result = await createIconly({ storage, onError }).init();

    expect(result.ok).toBe(true);
    expect(document.querySelector('#icon-name')).not.toBeNull();
    expect(set).not.toHaveBeenCalled();
    expect(onError).toHaveBeenCalledWith(expect.objectContaining({ code: 'storage_read_failed' }));
  });

  it('renders when storage write fails', async () => {
    const fetchMock = mockFetch();
    const onError = vi.fn();
    const storage: IconStorage = {
      get: async () => ({ ok: true, value: undefined }),
      set: async () => ({
        ok: false,
        error: { code: 'storage_write_failed', message: 'Full cache.' },
      }),
    };

    (globalThis as typeof globalThis & { fetch: typeof fetch }).fetch =
      fetchMock as unknown as typeof fetch;

    const result = await createIconly({ storage, onError }).init();

    expect(result.ok).toBe(true);
    expect(document.querySelector('#icon-name')).not.toBeNull();
    expect(onError).toHaveBeenCalledWith(expect.objectContaining({ code: 'storage_write_failed' }));
  });

  it('replaces an invalid cached document with a fetched SVG', async () => {
    const fetchMock = mockFetch();
    const set = vi.fn<IconStorage['set']>().mockResolvedValue({ ok: true, value: undefined });
    const storage: IconStorage = {
      get: async (version) => ({
        ok: true,
        value: { version, data: '<not-svg />' },
      }),
      set,
    };

    (globalThis as typeof globalThis & { fetch: typeof fetch }).fetch =
      fetchMock as unknown as typeof fetch;

    const result = await createIconly({ storage }).init();

    expect(result.ok).toBe(true);
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(set).toHaveBeenCalledWith(expect.objectContaining({ data: svgPayload }));
    expect(document.querySelector('#icon-name')).not.toBeNull();
  });

  it('returns a Result for an invalid container selector', async () => {
    const result = await createIconly({ storage: 'memory', container: '[' }).init();

    expect(result).toEqual({
      ok: false,
      error: expect.objectContaining({ code: 'container_invalid' }),
    });
  });

  it('does not let error callbacks reject init', async () => {
    const result = await createIconly({
      storage: 'memory',
      container: '#missing',
      onError: () => {
        throw new Error('callback failed');
      },
      logger: {
        error: () => {
          throw new Error('logger failed');
        },
      },
    }).init();

    expect(result).toEqual({
      ok: false,
      error: expect.objectContaining({ code: 'container_invalid' }),
    });
  });

  it('deduplicates concurrent init calls and aborts their fetch', async () => {
    const fetchMock = vi.fn(
      (_file: string, init?: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () => {
            reject(new DOMException('Aborted', 'AbortError'));
          });
        }),
    );

    (globalThis as typeof globalThis & { fetch: typeof fetch }).fetch =
      fetchMock as unknown as typeof fetch;

    const iconly = createIconly({ storage: 'memory' });
    const first = iconly.init();
    const second = iconly.init();

    expect(first).toBe(second);

    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());
    iconly.abort();

    await expect(first).resolves.toEqual({
      ok: false,
      error: expect.objectContaining({ code: 'fetch_aborted' }),
    });
  });

  it('creates a custom object store in an existing IndexedDB database', async () => {
    const dbName = 'iconly-custom-store-test-db';

    await deleteDatabase(dbName);

    const fetchMock = mockFetch();

    (globalThis as typeof globalThis & { fetch: typeof fetch }).fetch =
      fetchMock as unknown as typeof fetch;

    const defaultStore = createIconly({ storage: 'indexeddb', dbName });

    expect((await defaultStore.init()).ok).toBe(true);
    expect(
      (
        await createIconly({
          storage: 'indexeddb',
          dbName,
          storeName: 'custom-icons',
          version: '2.0',
        }).init()
      ).ok,
    ).toBe(true);
    expect((await defaultStore.init()).ok).toBe(true);
  });
});
