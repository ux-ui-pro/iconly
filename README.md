# iconly

A lightweight utility for SVG icon sprites in the browser. Load and cache an external sprite file (`iconly`), or build one from your own icon objects with tree-shaking (`iconly/sprite`).

[![npm](https://img.shields.io/npm/v/iconly.svg?colorB=brightgreen)](https://www.npmjs.com/package/iconly)
[![NPM Downloads](https://img.shields.io/npm/dm/iconly.svg?style=flat)](https://www.npmjs.com/package/iconly)

[Demo](https://codepen.io/ux-ui/pen/zYmyqWR)

---

## Features

- Factory-based API with `createIconly()` — fetch and cache an external sprite file.
- IndexedDB, memory, or session storage strategies.
- `iconly/sprite` — build a sprite from icon objects; no fetch, no storage, zero extra runtime deps.
- `init()` and `render()` return a `Result` and never throw.

---

## Installation

```bash
npm install iconly
```

---

## Quick Start: external sprite file

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

## Quick Start: icon objects

Import icons as ESM modules — your bundler tree-shakes unused ones. iconly only assembles the sprite string and injects it into the DOM.

```ts
import { createSprite } from 'iconly/sprite';
import { search, user, trash } from './icons';

const sprite = createSprite({
  icons: [search, user, trash],
  container: '#app', // string | HTMLElement, defaults to document.body
});

const result = sprite.render();

if (!result.ok) {
  console.error(result.error);
}
```

Icon object format (bring your own):

```ts
export const search = {
  name: 'search',       // id for <use href="#search">
  viewBox: '0 0 24 24',
  body: '<path d="..."/>',
};
```

For SSR or tests — build the string without touching the DOM:

```ts
import { buildSpriteString } from 'iconly/sprite';

const svg = buildSpriteString([search, user, trash]);
```

---

## API

### `iconly`

- `createIconly(config?)` — creates an icon loader instance.
- `iconLoader.init()` — fetches (or loads from cache) the sprite and injects it into the DOM; returns `Result<void>`.
- `iconLoader.abort()` — cancels an in-flight fetch.

### `iconly/sprite`

- `createSprite(config)` — creates a sprite builder instance.
- `sprite.render()` — builds the sprite from `icons` and injects it into the DOM; returns `Result<void>` synchronously.
- `buildSpriteString(icons)` — returns the SVG sprite string without DOM access.

---

## Options

### `createIconly`

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

### `createSprite`

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `icons` | `IconlyIcon[]` | — | Icon objects to include in the sprite. |
| `container` | `string \| HTMLElement` | `document.body` | Container where the sprite is injected. |

---

## Error handling

- `init()` and `render()` never throw; they return a `Result` with `ok: false` and `error` details.
- When `debug` is `false`, debug messages are suppressed.
- Errors still trigger `onError` and `logger.error` (if provided), even when `debug` is `false`.
- Call `iconLoader.abort()` to cancel a fetch (`fetch_aborted` error code).

---

## License

MIT
