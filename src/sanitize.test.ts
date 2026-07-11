import { beforeEach, describe, expect, it, vi } from 'vitest';

import { insertSvg } from './dom';
import { createIconly } from './index';
import { prepareSvgData, sanitizeSvgElement } from './sanitize';
import { createSprite } from './sprite';

beforeEach(() => {
  document.body.innerHTML = '';
});

describe('sanitizeSvgElement', () => {
  it('removes event handler attributes', () => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(
      '<svg xmlns="http://www.w3.org/2000/svg"><image href="x" onerror="alert(1)"/></svg>',
      'image/svg+xml',
    );

    sanitizeSvgElement(doc.documentElement);

    const image = doc.querySelector('image');

    expect(image).not.toBeNull();
    expect(image?.getAttribute('onerror')).toBeNull();
    expect(image?.getAttribute('href')).toBe('x');
  });

  it('removes script and foreignObject elements', () => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(
      '<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script><foreignObject><div>x</div></foreignObject><path/></svg>',
      'image/svg+xml',
    );

    sanitizeSvgElement(doc.documentElement);

    expect(doc.querySelector('script')).toBeNull();
    expect(doc.querySelector('foreignObject')).toBeNull();
    expect(doc.querySelector('path')).not.toBeNull();
  });

  it('removes javascript: href values', () => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(
      '<svg xmlns="http://www.w3.org/2000/svg"><a href="javascript:alert(1)"><path/></a></svg>',
      'image/svg+xml',
    );

    sanitizeSvgElement(doc.documentElement);

    const link = doc.querySelector('a');

    expect(link).not.toBeNull();
    expect(link?.getAttribute('href')).toBeNull();
  });

  it('removes SMIL animation elements that target href', () => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(
      '<svg xmlns="http://www.w3.org/2000/svg"><a><set attributeName="href" to="javascript:alert(1)"/><animate attributeName="href" values="javascript:alert(1)"/><animate attributeName="opacity" values="0;1"/></a></svg>',
      'image/svg+xml',
    );

    sanitizeSvgElement(doc.documentElement);

    expect(doc.querySelector('set')).toBeNull();
    expect(doc.querySelector('animate[attributeName="href"]')).toBeNull();
    expect(doc.querySelector('animate[attributeName="opacity"]')).not.toBeNull();
  });
});

describe('insertSvg sanitization', () => {
  it('strips dangerous content before inserting into the DOM', () => {
    const container = document.createElement('div');

    document.body.appendChild(container);

    const malicious =
      '<svg xmlns="http://www.w3.org/2000/svg"><image href="x" onerror="window.__iconlyXss = true"/></svg>';

    const result = insertSvg(container, malicious);

    expect(result.ok).toBe(true);

    const image = container.querySelector('image');

    expect(image?.getAttribute('onerror')).toBeNull();
    expect((window as typeof window & { __iconlyXss?: boolean }).__iconlyXss).toBeUndefined();
  });

  it('applies a custom sanitize hook before parsing', () => {
    const container = document.createElement('div');
    const sanitize = vi.fn((svg: string) => svg.replace('REMOVE', ''));

    document.body.appendChild(container);

    const result = insertSvg(
      container,
      '<svg xmlns="http://www.w3.org/2000/svg"><symbol id="REMOVE-icon"></symbol></svg>',
      { sanitize },
    );

    expect(result.ok).toBe(true);
    expect(sanitize).toHaveBeenCalledOnce();
    expect(container.querySelector('[id="-icon"]')).not.toBeNull();
    expect(container.querySelector('#REMOVE-icon')).toBeNull();
  });
});

describe('createIconly sanitize option', () => {
  it('passes sanitize to insertSvg', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      text: async () =>
        '<svg xmlns="http://www.w3.org/2000/svg"><image href="x" onerror="window.__iconlyXss = true"/></svg>',
    });

    (globalThis as typeof globalThis & { fetch: typeof fetch }).fetch =
      fetchMock as unknown as typeof fetch;

    const container = document.createElement('div');
    const sanitize = vi.fn(prepareSvgData);

    document.body.appendChild(container);

    const iconly = createIconly({
      storage: 'memory',
      file: '/sprite.svg',
      version: '1.0',
      container,
      sanitize,
    });

    const result = await iconly.init();

    expect(result.ok).toBe(true);
    expect(sanitize).toHaveBeenCalledOnce();
    expect(container.querySelector('image')?.getAttribute('onerror')).toBeNull();
  });
});

describe('createSprite sanitize option', () => {
  it('sanitizes icon body content on render', () => {
    const container = document.createElement('div');

    document.body.appendChild(container);

    const result = createSprite({
      container,
      icons: [
        {
          name: 'unsafe',
          viewBox: '0 0 24 24',
          body: '<image href="x" onerror="window.__iconlyXss = true"/>',
        },
      ],
    }).render();

    expect(result.ok).toBe(true);
    expect(container.querySelector('image')?.getAttribute('onerror')).toBeNull();
    expect((window as typeof window & { __iconlyXss?: boolean }).__iconlyXss).toBeUndefined();
  });
});
