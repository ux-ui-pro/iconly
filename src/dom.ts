import { createIconlyError } from './errors';
import { err, ok } from './result';
import type { Result } from './types';

export const insertSvg = (container: HTMLElement, data: string): Result<void> => {
  const found = container.querySelector('[data-iconly="iconset"]');
  let iconSetDiv: HTMLElement | null = found instanceof HTMLElement ? found : null;

  if (!iconSetDiv) {
    iconSetDiv = document.createElement('div');
    iconSetDiv.setAttribute('data-iconly', 'iconset');
    iconSetDiv.setAttribute('aria-hidden', 'true');
    iconSetDiv.style.cssText = 'width: 0; height: 0; position: absolute; left: -9999px;';
    container.appendChild(iconSetDiv);
  }

  const parser = new DOMParser();
  const svgDoc = parser.parseFromString(data, 'image/svg+xml');
  const parserError = svgDoc.querySelector('parsererror');

  if (parserError) {
    return err(
      createIconlyError(
        'parse_error',
        `SVG parsing error: ${parserError.textContent ?? 'Unknown error'}`,
      ),
    );
  }

  iconSetDiv.innerHTML = '';

  const svgEl = svgDoc.documentElement;

  if (!svgEl) {
    return err(createIconlyError('parse_error', 'No valid SVG content found.'));
  }

  const imported = document.importNode(svgEl, true);

  iconSetDiv.appendChild(imported);

  return ok(undefined);
};
