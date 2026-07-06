import { beforeEach, describe, expect, it } from 'vitest';

import { buildSpriteString, createSprite } from './sprite';
import type { IconlyIcon } from './types';

const search: IconlyIcon = {
  name: 'search',
  viewBox: '0 0 24 24',
  body: '<path d="M0 0"/>',
};

const user: IconlyIcon = {
  name: 'user',
  viewBox: '0 0 24 24',
  body: '<circle cx="12" cy="12" r="10"/>',
};

const trash: IconlyIcon = {
  name: 'trash',
  viewBox: '0 0 24 24',
  body: '<rect width="10" height="10"/>',
};

beforeEach(() => {
  document.body.innerHTML = '';
});

describe('buildSpriteString', () => {
  it('includes a symbol for each icon and nothing extra', () => {
    const svg = buildSpriteString([search, user, trash]);

    expect(svg).toContain('<symbol id="search" viewBox="0 0 24 24">');
    expect(svg).toContain('<symbol id="user" viewBox="0 0 24 24">');
    expect(svg).toContain('<symbol id="trash" viewBox="0 0 24 24">');
    expect(svg.match(/<symbol /g)).toHaveLength(3);
  });

  it('returns a valid empty svg for an empty icon list', () => {
    expect(buildSpriteString([])).toBe('<svg xmlns="http://www.w3.org/2000/svg"></svg>');
  });

  it('escapes special characters in name and viewBox attributes', () => {
    const icon: IconlyIcon = {
      name: 'icon"with&ampersand',
      viewBox: '0 0 24"24',
      body: '<path d="M0 0"/>',
    };

    const svg = buildSpriteString([icon]);

    expect(svg).toContain('id="icon&quot;with&amp;ampersand"');
    expect(svg).toContain('viewBox="0 0 24&quot;24"');
  });
});

describe('createSprite', () => {
  it('renders symbols into the container via insertSvg', () => {
    const container = document.createElement('div');

    document.body.appendChild(container);

    const result = createSprite({ icons: [search, user], container }).render();

    expect(result.ok).toBe(true);

    const iconset = container.querySelector('[data-iconly="iconset"] svg');

    expect(iconset).not.toBeNull();
    expect(iconset?.querySelector('#search')).not.toBeNull();
    expect(iconset?.querySelector('#user')).not.toBeNull();
    expect(iconset?.querySelector('#trash')).toBeNull();
  });

  it('returns ok for an empty icon list', () => {
    const container = document.createElement('div');

    document.body.appendChild(container);

    const result = createSprite({ icons: [], container }).render();

    expect(result.ok).toBe(true);
    expect(container.querySelector('[data-iconly="iconset"] svg')).not.toBeNull();
  });

  it('renders icons whose name contains quotes and ampersands', () => {
    const icon: IconlyIcon = {
      name: 'icon"with&ampersand',
      viewBox: '0 0 24 24',
      body: '<path d="M0 0"/>',
    };
    const container = document.createElement('div');

    document.body.appendChild(container);

    const result = createSprite({ icons: [icon], container }).render();

    expect(result.ok).toBe(true);

    const symbol = container.querySelector('[data-iconly="iconset"] svg symbol');

    expect(symbol?.getAttribute('id')).toBe('icon"with&ampersand');
  });
});
