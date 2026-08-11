import { insertSvg, resolveContainer } from './dom';
import { createIconlyError } from './errors';
import { err } from './result';
import type { IconlyIcon, Result, SpriteConfig, SpriteInstance } from './types';

const escapeAttr = (value: string): string =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;').replace(/>/g, '&gt;');

export const buildSpriteString = (icons: IconlyIcon[]): string => {
  const symbols = icons
    .map(
      (icon) =>
        `<symbol id="${escapeAttr(icon.name)}" viewBox="${escapeAttr(icon.viewBox)}">${icon.body}</symbol>`,
    )
    .join('');

  return `<svg xmlns="http://www.w3.org/2000/svg">${symbols}</svg>`;
};

export const createSprite = (config: SpriteConfig): SpriteInstance => {
  const { icons, container, sanitize } = config;

  return {
    render: (): Result<void> => {
      try {
        const containerResult = resolveContainer(container);

        if (!containerResult.ok) {
          return containerResult;
        }

        return insertSvg(containerResult.value, buildSpriteString(icons), { sanitize });
      } catch (error: unknown) {
        return err(
          createIconlyError('unexpected_error', 'Unexpected error while rendering sprite.', error),
        );
      }
    },
  };
};

export type { IconlyIcon, SpriteConfig, SpriteInstance, SvgSanitizer } from './types';
