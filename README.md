<div align="center">
<br>

<h1>iconly</h1>

<p><sup>A lightweight utility to load and cache SVG icons in the browser, using IndexedDB to store the data. It retrieves icons from a given SVG file, stores them in IndexedDB, and inserts them into the DOM for easy access and use.</sup></p>

[![npm](https://img.shields.io/npm/v/iconly.svg?colorB=brightgreen)](https://www.npmjs.com/package/iconly)
[![GitHub package version](https://img.shields.io/github/package-json/v/ux-ui-pro/iconly.svg)](https://github.com/ux-ui-pro/iconly)
[![NPM Downloads](https://img.shields.io/npm/dm/iconly.svg?style=flat)](https://www.npmjs.org/package/iconly)

<sup>~2kB gzipped</sup>

<a href="https://codepen.io/ux-ui/pen/zYmyqWR">Demo</a>

</div>
<br>

# Install
```console
$ npm install iconly
```
<br>

# Import
```javascript
import { createIconly } from 'iconly';
```
<br>

# Upgrading to v3
- The API is now factory-based: use `createIconly()` instead of `new Iconly()`.
- `init()` returns a `Result<void>` and never throws.
- The injected sprite wrapper is now `[data-iconly="iconset"]` inside `container` (instead of `#iconset`).

See `CHANGELOG.md` for details.
<br>

# Usage
```javascript
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

```HTML
<svg>
  <use href="#icon-name"></use>
</svg>
```
<sub>File with icons</sub>
```HTML
<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" fill="none">
  <symbol id="icon-name" viewBox="0 0 300 300">
    <path ... />
  </symbol>
  ...
</svg>
```
<br>

# Options
|       Option       |                  Type                   |     Default     | Description                                                     |
|:------------------:|:---------------------------------------:|:---------------:|:----------------------------------------------------------------|
|       `file`       |                `string`                 | `'./icons.svg'` | The URL of the SVG file containing the icons.                   |
|     `version`      |                `string`                 |     `'1.0'`     | The version of the icon set.                                    |
|      `debug`       |                `boolean`                |     `false`     | If `true`, debug callbacks and logger debug output are enabled. |
|    `container`     |         `string \| HTMLElement`         | `document.body` | The container element where the icons will be injected.         |
|     `storage`      | `'indexeddb' \| 'memory' \| 'session'`  |  `'indexeddb'`  | Storage strategy used for caching icon data.                    |
|      `dbName`      |                `string`                 |  `'iconlyDB'`   | IndexedDB database name (only for `indexeddb`).                 |
|    `storeName`     |                `string`                 |    `'icons'`    | IndexedDB store name (only for `indexeddb`).                    |
| `sessionKeyPrefix` |                `string`                 |   `'iconly'`    | Prefix for SessionStorage keys (only for `session`).            |
|      `logger`      |          `{ debug?, error? }`           |   `undefined`   | Optional logger implementation for debug/error output.          |
|     `onError`      |            `(error) => void`            |   `undefined`   | Optional callback invoked on errors.                            |
|     `onDebug`      |           `(...args) => void`           |   `undefined`   | Optional callback invoked for debug messages.                   |
<br>

# Error handling
- `init()` never throws; it returns a `Result` with `ok: false` and `error` details.
- When `debug` is `false`, debug messages are suppressed (no `onDebug` calls and no `logger.debug`).
- Errors still trigger `onError` and `logger.error` (if provided), even when `debug` is `false`.
- You can cancel a fetch by calling `iconLoader.abort()`, which results in a `fetch_aborted` error code.

# License
MIT
