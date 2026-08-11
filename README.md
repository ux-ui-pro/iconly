# iconly

`iconly` gives you two ways to use SVG icon sprites in the browser: load and cache an external sprite file, or build one from your own icon objects without giving up tree-shaking.

[![npm](https://img.shields.io/npm/v/iconly.svg?colorB=brightgreen)](https://www.npmjs.com/package/iconly)
[![NPM Downloads](https://img.shields.io/npm/dm/iconly.svg?style=flat)](https://www.npmjs.com/package/iconly)

[Demo](https://codepen.io/ux-ui/pen/zYmyqWR)

---

## Features

- Load and cache external sprite files with `createIconly()`.
- Choose between IndexedDB, memory, and session storage.
- Keep cache entries separate for each sprite file and version.
- Build sprites from icon objects with `iconly/sprite` — no fetch, storage, or extra runtime dependencies.
- Handle failures through the `Result` returned by `init()` and `render()`; neither method throws.

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

When `init()` succeeds, iconly adds the SVG sprite to the configured `container`, wrapped in `<div data-iconly="iconset" aria-hidden="true">...</div>`.

```html
<svg>
  <use href="#icon-name"></use>
</svg>
```

The sprite file should look like this:

```html
<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" fill="none">
  <symbol id="icon-name" viewBox="0 0 300 300">
    <path />
  </symbol>
</svg>
```

---

## Quick Start: icon objects

Import icons as ESM modules and let your bundler remove the ones you do not use. iconly only assembles the sprite string and adds it to the DOM.

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

Icons are plain objects:

```ts
export const search = {
  name: 'search',       // id for <use href="#search">
  viewBox: '0 0 24 24',
  body: '<path d="..."/>',
};
```

For SSR or tests, you can build the sprite string without touching the DOM:

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
| `storage` | `'indexeddb' \| 'memory' \| 'session' \| IconStorage` | `'indexeddb'` | Storage strategy or custom storage implementation. |
| `dbName` | `string` | `'iconlyDB'` | IndexedDB database name (for `indexeddb`). |
| `storeName` | `string` | `'icons'` | IndexedDB store name (for `indexeddb`). |
| `sessionKeyPrefix` | `string` | `'iconly'` | SessionStorage key prefix (for `session`). |
| `sanitize` | `(svg: string) => string` | `undefined` | Optional hook to sanitize SVG before parsing. Runs before built-in hardening. |
| `logger` | `{ debug?, error? }` | `undefined` | Optional logger for debug/error output. |
| `onError` | `(error) => void` | `undefined` | Callback invoked on fatal and recoverable errors. |
| `onDebug` | `(...args) => void` | `undefined` | Callback invoked for debug messages. |

### `createSprite`

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `icons` | `IconlyIcon[]` | — | Icon objects to include in the sprite. |
| `container` | `string \| HTMLElement` | `document.body` | Container where the sprite is injected. |
| `sanitize` | `(svg: string) => string` | `undefined` | Optional hook to sanitize SVG before parsing. Runs before built-in hardening. |

---

## Cache behavior

- Each cache entry is keyed by the normalized `file` URL and `version`, so different sprites can safely share storage on the same origin.
- Caching is best-effort. If iconly cannot read or write storage, it reports the error through `onError` / `logger.error`, then fetches and renders the sprite anyway.
- If cached data is not a valid SVG document, iconly replaces it with a fresh copy from the network.
- A fetched sprite is cached only after it has been parsed, hardened, and inserted successfully.
- If you implement a custom `IconStorage`, treat both the key passed to `get()` and the value returned in `IconRecord.version` as opaque.

---

## Browser support

Supported browsers:

- Chrome and Edge 90+
- Firefox 90+
- Safari and iOS Safari 15+
- Current Chrome for Android

Internet Explorer and Legacy Edge are not supported. The external-sprite loader relies on native `fetch`, `AbortController`, `DOMParser`, and the selected Web Storage API. If IndexedDB or SessionStorage is unavailable, the sprite still loads, but without caching.

---

## Security

Because iconly injects SVG into the live DOM, you should treat sprite files and icon objects as **trusted content**.

- Do not use `file` URLs or `icon.body` values from untrusted user input without sanitizing them first.
- Before insertion, `createIconly` and `createSprite` strip event-handler attributes (`on*`), `<script>`, `<foreignObject>`, `javascript:` / `data:text/html` links, and SMIL animation elements targeting `href`.
- This built-in hardening adds a layer of protection, but it is not a full HTML sanitizer. It does not cover every vector, including CSS in `<style>` or external references in `<use>` / `<image>`. For untrusted SVG, provide a `sanitize` hook backed by a dedicated library such as [DOMPurify](https://github.com/cure53/DOMPurify):

```ts
import DOMPurify from 'dompurify';

const iconLoader = createIconly({
  file: userProvidedUrl, // only after your own URL allowlisting
  sanitize: (svg) =>
    DOMPurify.sanitize(svg, { USE_PROFILES: { svg: true, svgFilters: true } }),
});
```

`buildSpriteString` returns raw SVG without touching the DOM. If you use it directly for SSR or tests, sanitize the output yourself unless you fully trust the source icons.

In `iconly/sprite`, `name` and `viewBox` are escaped in attributes. The `body` value is inserted as-is and is sanitized only by `createSprite().render()` or by your own sanitizer.

---

## Error handling

- `init()` and `render()` never throw. On failure, they return a `Result` with `ok: false` and error details.
- Setting `debug` to `false` suppresses debug messages.
- Fatal and recoverable cache errors still trigger `onError` and `logger.error` (if provided), even when debugging is off. This means a recoverable cache error may be reported while `init()` returns `ok: true`.
- Use `iconLoader.abort()` to cancel a fetch. The resulting error code is `fetch_aborted`.

---

## License

MIT
