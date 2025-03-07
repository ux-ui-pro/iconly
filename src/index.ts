export interface IconlyOptions {
  file?: string;
  version?: string;
  debug?: boolean;
  container?: string | HTMLElement;
}

export interface IconRecord {
  version: string;
  data: string;
}

interface ResolvedIconlyOptions {
  file: string;
  version: string;
  debug: boolean;
  container: HTMLElement;
}

class Iconly {
  private static dbInstance: Promise<IDBDatabase> | null = null;
  private readonly options: Omit<ResolvedIconlyOptions, 'container'>;
  private readonly container: HTMLElement;

  public constructor(options: IconlyOptions = {}) {
    const merged: Required<IconlyOptions> = {
      file: './icons.svg',
      version: '1.0',
      debug: false,
      container: document.body ?? document.documentElement,
      ...options,
    };

    let containerEl: HTMLElement;

    if (typeof merged.container === 'string') {
      const found = document.querySelector(merged.container);

      if (!found || !(found instanceof HTMLElement)) {
        throw new Error(`Invalid container selector: "${merged.container}"`);
      }

      containerEl = found;
    } else {
      containerEl = merged.container;
    }

    this.container = containerEl;

    this.options = {
      file: merged.file,
      version: merged.version,
      debug: merged.debug,
    };

    if (!Iconly.dbInstance) {
      Iconly.dbInstance = this.openDB('iconlyDB', 1);
    }
  }

  private async openDB(name: string, version: number): Promise<IDBDatabase> {
    if (!('indexedDB' in window)) {
      this.logError('This browser does not support IndexedDB');

      throw new Error('IndexedDB not supported');
    }

    return await new Promise<IDBDatabase>((resolve, reject): void => {
      const request = indexedDB.open(name, version);

      request.onerror = (): void => {
        const msg = this.createErrorMessage(request.error, 'IndexedDB error');

        reject(new Error(msg));
      };

      request.onupgradeneeded = (event): void => {
        const db = (event.target as IDBOpenDBRequest).result;

        if (!db.objectStoreNames.contains('icons')) {
          db.createObjectStore('icons', { keyPath: 'version' });
        }
      };

      request.onsuccess = (): void => {
        resolve(request.result);
      };
    });
  }

  private getIconStore(db: IDBDatabase, mode: IDBTransactionMode): IDBObjectStore {
    return db.transaction('icons', mode).objectStore('icons');
  }

  private static async fetchData(file: string): Promise<string> {
    const response = await fetch(file);

    if (!response.ok) {
      throw new Error(`Failed to fetch icons from "${file}"`);
    }

    return response.text();
  }

  private insert(data: string): void {
    let iconSetDiv = document.getElementById('iconset');

    if (!iconSetDiv) {
      iconSetDiv = document.createElement('div');

      iconSetDiv.id = 'iconset';
      iconSetDiv.setAttribute('aria-hidden', 'true');
      iconSetDiv.style.cssText = 'width: 0; height: 0; position: absolute; left: -9999px;';

      this.container.appendChild(iconSetDiv);
    }

    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(data, 'image/svg+xml');
    const parserError = svgDoc.querySelector('parsererror');

    if (parserError) {
      this.logError('SVG parsing error:', parserError.textContent ?? '');

      return;
    }

    iconSetDiv.innerHTML = '';

    const svgEl = svgDoc.documentElement;

    if (svgEl) {
      const imported = document.importNode(svgEl, true);

      iconSetDiv.appendChild(imported);
    } else {
      this.logError('No valid SVG content found to insert.');
    }
  }

  public async init(): Promise<void> {
    try {
      let data = await Iconly.fetchData(this.options.file);

      const db = await Iconly.dbInstance;

      if (!db) {
        throw new Error('Failed to open IndexedDB');
      }

      const store = this.getIconStore(db, 'readwrite');

      const dbVersion = await new Promise<IconRecord | undefined>((resolve, reject): void => {
        const getReq = store.get(this.options.version);

        getReq.onsuccess = (): void => {
          resolve(getReq.result as IconRecord | undefined);
        };

        getReq.onerror = (): void => {
          const msg = this.createErrorMessage(getReq.error, 'Error getting record from store');

          reject(new Error(msg));
        };
      });

      if (!dbVersion) {
        await new Promise<void>((resolve, reject): void => {
          const putReq = store.put({
            version: this.options.version,
            data,
          } as IconRecord);

          putReq.onsuccess = (): void => resolve();

          putReq.onerror = (): void => {
            const msg = this.createErrorMessage(putReq.error, 'Error putting record into store');

            reject(new Error(msg));
          };
        });
      } else {
        data = dbVersion.data;
      }

      await new Promise<void>((resolve, reject): void => {
        const tx = store.transaction;

        tx.oncomplete = (): void => resolve();

        tx.onerror = (): void => {
          const msg = this.createErrorMessage(tx.error, 'Transaction error');

          reject(new Error(msg));
        };

        tx.onabort = (): void => {
          const msg = this.createErrorMessage(tx.error, 'Transaction aborted');

          reject(new Error(msg));
        };
      });

      this.insert(data);
      this.logDebug('Iconly has successfully initialized.');
    } catch (err: unknown) {
      const e = err instanceof Error ? err : new Error(String(err));

      this.logError('Error initializing Iconly:', e.message);
    }
  }

  private createErrorMessage(err: unknown, fallback: string): string {
    if (!err) {
      return fallback;
    }

    if (err instanceof DOMException || err instanceof Error) {
      return err.message || fallback;
    }

    return fallback;
  }

  private logDebug(...messages: unknown[]): void {
    if (this.options.debug) {
      console.log('[Iconly debug]', ...messages);
    }
  }

  private logError(...messages: unknown[]): void {
    console.error('[Iconly error]', ...messages);
  }
}

export default Iconly;
