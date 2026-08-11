import { createIconlyError } from './errors';
import { err, ok } from './result';
import { prepareSvgData, sanitizeSvgElement } from './sanitize';
import type { InsertSvgOptions, Result } from './types';

export const resolveContainer = (container?: string | HTMLElement): Result<HTMLElement> => {
  if (typeof document === 'undefined') {
    return err(
      createIconlyError('container_invalid', 'Document is not available in this environment.'),
    );
  }

  try {
    if (typeof container === 'string') {
      const found = document.querySelector(container);

      if (!found || !(found instanceof HTMLElement)) {
        return err(
          createIconlyError('container_invalid', `Invalid container selector: "${container}".`),
        );
      }

      return ok(found);
    }

    if (container) {
      return ok(container);
    }

    const fallback = document.body ?? document.documentElement;

    if (!fallback) {
      return err(createIconlyError('container_invalid', 'No valid container element found.'));
    }

    return ok(fallback);
  } catch (error: unknown) {
    return err(createIconlyError('container_invalid', 'Failed to resolve container.', error));
  }
};

export const insertSvg = (
  container: HTMLElement,
  data: string,
  options?: InsertSvgOptions,
): Result<void> => {
  try {
    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(prepareSvgData(data, options?.sanitize), 'image/svg+xml');
    const parserError = svgDoc.querySelector('parsererror');

    if (parserError) {
      return err(
        createIconlyError(
          'parse_error',
          `SVG parsing error: ${parserError.textContent ?? 'Unknown error'}`,
        ),
      );
    }

    const svgEl = svgDoc.documentElement;

    if (svgEl.localName !== 'svg' || svgEl.namespaceURI !== 'http://www.w3.org/2000/svg') {
      return err(createIconlyError('parse_error', 'The document root must be an SVG element.'));
    }

    sanitizeSvgElement(svgEl);

    const ownerDocument = container.ownerDocument;
    const imported = ownerDocument.importNode(svgEl, true);
    const found = container.querySelector('[data-iconly="iconset"]');
    let iconSetDiv: HTMLElement | null =
      found?.namespaceURI === 'http://www.w3.org/1999/xhtml' ? (found as HTMLElement) : null;

    if (!iconSetDiv) {
      iconSetDiv = ownerDocument.createElement('div');
      iconSetDiv.setAttribute('data-iconly', 'iconset');
      iconSetDiv.setAttribute('aria-hidden', 'true');
      iconSetDiv.style.cssText = 'width: 0; height: 0; position: absolute; left: -9999px;';
      container.appendChild(iconSetDiv);
    }

    iconSetDiv.replaceChildren(imported);

    return ok(undefined);
  } catch (error: unknown) {
    return err(createIconlyError('parse_error', 'Failed to parse or insert SVG.', error));
  }
};
