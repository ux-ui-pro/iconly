# Changelog

All notable changes to this project will be documented in this file.

## 3.0.0

### Breaking changes

- **API changed**: `new Iconly()` was replaced by `createIconly()`.
- **Init contract changed**: `init()` no longer throws and no longer returns `void`. It now returns a `Result<void>` that must be checked via `result.ok`.
- **DOM anchor changed**: the injected sprite wrapper is now a `<div data-iconly="iconset" aria-hidden="true">...</div>` inside the configured `container` (previously `id="iconset"`).
- **Storage is configurable**: caching can use `'indexeddb' | 'memory' | 'session'` or a custom storage implementation.

### Migration guide

#### 1) Constructor → factory

Before:

```js
import Iconly from 'iconly';
const iconly = new Iconly({ file: './sprite.svg' });
await iconly.init();
```

After:

```js
import { createIconly } from 'iconly';
const iconly = createIconly({ file: './sprite.svg' });
const result = await iconly.init();
if (!result.ok) console.error(result.error);
```

#### 2) DOM anchor

Before:
```html
#iconset
```

After (created inside `container`):
```html
[data-iconly="iconset"]
```
