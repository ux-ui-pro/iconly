export type Result<T> = { ok: true; value: T } | { ok: false; error: IconlyError };

export type IconlyErrorCode =
  | 'container_invalid'
  | 'fetch_aborted'
  | 'fetch_failed'
  | 'indexeddb_not_supported'
  | 'indexeddb_open_failed'
  | 'indexeddb_request_failed'
  | 'parse_error'
  | 'storage_read_failed'
  | 'storage_unavailable'
  | 'storage_write_failed';

export interface IconlyError {
  code: IconlyErrorCode;
  message: string;
  cause?: unknown;
}

export interface Logger {
  debug?: (...messages: unknown[]) => void;
  error?: (...messages: unknown[]) => void;
}

export interface IconRecord {
  version: string;
  data: string;
}

export interface IconStorage {
  get(version: string): Promise<Result<IconRecord | undefined>>;
  set(record: IconRecord): Promise<Result<void>>;
}

export interface IconlyInstance {
  init: () => Promise<Result<void>>;
  abort: () => void;
}

export type StorageStrategy = 'indexeddb' | 'memory' | 'session' | IconStorage;

export interface IconlyIcon {
  name: string;
  viewBox: string;
  body: string;
}

export interface SpriteConfig {
  icons: IconlyIcon[];
  container?: string | HTMLElement;
}

export interface SpriteInstance {
  render: () => Result<void>;
}

export interface IconlyConfig {
  file?: string;
  version?: string;
  debug?: boolean;
  container?: string | HTMLElement;
  storage?: StorageStrategy;
  dbName?: string;
  storeName?: string;
  sessionKeyPrefix?: string;
  logger?: Logger;
  onError?: (error: IconlyError) => void;
  onDebug?: (...messages: unknown[]) => void;
}
