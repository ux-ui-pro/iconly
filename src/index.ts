class Iconly {
  private static dbInstance: Promise<IDBDatabase> | null = null;

  private readonly options: {
    file: string;
    version: string;
    debug: boolean;
    container: HTMLElement;
  };

  constructor(options: { file?: string; version?: string; debug?: boolean; container?: string | HTMLElement } = {}) {
    const defaultOptions = {
      file: './icons.svg',
      version: '1.0',
      debug: false,
      container: document.body ?? document.documentElement,
    };

    this.options = {
      ...defaultOptions,
      ...options,
      container: typeof options.container === 'string'
        ? document.querySelector(options.container) ?? defaultOptions.container
        : options.container ?? defaultOptions.container,
    };

    if (!this.options.container) {
      throw new Error('Invalid container element');
    }

    if (!Iconly.dbInstance) {
      Iconly.dbInstance = this.openDB('iconlyDB', 1);
    }
  }

  private async openDB(name: string, version: number): Promise<IDBDatabase> {
    if (!('indexedDB' in window)) {
      this.logError('This browser doesn\'t support IndexedDB');
      throw new Error('IndexedDB not supported');
    }

    return new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open(name, version);

      request.onerror = () => reject(new Error(`IndexedDB error: ${request.error}`));
      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('icons')) {
          db.createObjectStore('icons', { keyPath: 'version' });
        }
      };
      request.onsuccess = () => resolve(request.result);
    });
  }

  private static async fetchData(file: string): Promise<string> {
    const response = await fetch(file);
    if (!response.ok) throw new Error('Network response was not ok');
    return response.text();
  }

  private insert(data: string): void {
    let iconSetDiv = document.getElementById('iconset');

    if (!iconSetDiv) {
      iconSetDiv = document.createElement('div');
      iconSetDiv.id = 'iconset';
      iconSetDiv.setAttribute('aria-hidden', 'true');
      iconSetDiv.style.cssText = 'width: 0; height: 0; position: absolute; left: -9999px;';
      this.options.container.appendChild(iconSetDiv);
    }

    iconSetDiv.innerHTML = data;
  }

  async init(): Promise<void> {
    const { file, version } = this.options;

    try {
      let data = await Iconly.fetchData(file);

      const db = await Iconly.dbInstance;
      const store = db.transaction('icons', 'readwrite').objectStore('icons');

      const dbVersion = await new Promise<{ version: string; data: string } | undefined>((resolve, reject) => {
        const request = store.get(version);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });

      if (!dbVersion) {
        await new Promise<void>((resolve, reject) => {
          const request = store.put({ version, data });
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        });
      } else {
        data = dbVersion.data;
      }

      await new Promise<void>((resolve, reject) => {
        const tx = store.transaction;
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
        tx.onabort = () => reject(tx.error);
      });

      this.insert(data);
    } catch (error) {
      this.logError('Error initializing Iconly:', error);
    }
  }

  private logError(...messages: unknown[]): void {
    if (this.options.debug) {
      // eslint-disable-next-line no-console
      console.error(...messages);
    }
  }
}

export default Iconly;
