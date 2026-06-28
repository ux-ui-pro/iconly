# iconly

A lightweight utility to load and cache SVG icons in the browser, using IndexedDB to store the data.

[![npm](https://img.shields.io/npm/v/iconly.svg?colorB=brightgreen)](https://www.npmjs.com/package/iconly)
[![NPM Downloads](https://img.shields.io/npm/dm/iconly.svg?style=flat)](https://www.npmjs.com/package/iconly)

[Demo](https://codepen.io/ux-ui/pen/zYmyqWR)

---

## Features

- Factory-based API with `createIconly()`.
- IndexedDB, memory, or session storage strategies.
- `init()` returns a `Result` and never throws.
- ~2kB gzipped.

---

## Installation

```bash
npm install iconly
```

---

## Quick Start

```ts
import { createIconly } from 'iconly';

const iconLoader = createIconly({
  file: './sprite.svg',
  version: '1.0',
  debug: true,
  storage: 'indexeddb',
});

const result = await iconLoader.init();

if (!result.ok) {
  console.error(result.error);
}
```

After `init()`, the SVG sprite is injected into the `container` inside `<div data-iconly="iconset" aria-hidden="true">...</div>`.

```html
<svg>
  <use href="#icon-name"></use>
</svg>
```

Sprite file format:

```html
<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" fill="none">
  <symbol id="icon-name" viewBox="0 0 300 300">
    <path />
  </symbol>
</svg>
```

---

## API

- `createIconly(config?)` — creates an icon loader instance.
- `iconLoader.init()` — fetches (or loads from cache) the sprite and injects it into the DOM; returns `Result<void>`.
- `iconLoader.abort()` — cancels an in-flight fetch.

---

## Options

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `file` | `string` | `'./icons.svg'` | URL of the SVG file containing the icons. |
| `version` | `string` | `'1.0'` | Version of the icon set. |
| `debug` | `boolean` | `false` | Enables debug callbacks and logger debug output. |
| `container` | `string \| HTMLElement` | `document.body` | Container where icons are injected. |
| `storage` | `'indexeddb' \| 'memory' \| 'session'` | `'indexeddb'` | Storage strategy for caching icon data. |
| `dbName` | `string` | `'iconlyDB'` | IndexedDB database name (for `indexeddb`). |
| `storeName` | `string` | `'icons'` | IndexedDB store name (for `indexeddb`). |
| `sessionKeyPrefix` | `string` | `'iconly'` | SessionStorage key prefix (for `session`). |
| `logger` | `{ debug?, error? }` | `undefined` | Optional logger for debug/error output. |
| `onError` | `(error) => void` | `undefined` | Callback invoked on errors. |
| `onDebug` | `(...args) => void` | `undefined` | Callback invoked for debug messages. |

---

## Error handling

- `init()` never throws; it returns a `Result` with `ok: false` and `error` details.
- When `debug` is `false`, debug messages are suppressed.
- Errors still trigger `onError` and `logger.error` (if provided), even when `debug` is `false`.
- Call `iconLoader.abort()` to cancel a fetch (`fetch_aborted` error code).

---

## License

MIT
