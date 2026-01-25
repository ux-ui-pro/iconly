import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createIconly } from '../src/index';

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
});
