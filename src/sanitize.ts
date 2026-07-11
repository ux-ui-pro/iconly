const DANGEROUS_TAGS = new Set(['script', 'foreignobject']);
const HREF_ATTRS = new Set(['href', 'xlink:href']);
const ANIMATION_TAGS = new Set([
  'animate',
  'animatemotion',
  'animatetransform',
  'animatecolor',
  'set',
]);

const isUnsafeHref = (value: string): boolean => {
  const normalized = value.trim().replace(/\s+/g, '').toLowerCase();

  return /^javascript:/.test(normalized) || /^data:text\/html/.test(normalized);
};

const targetsHrefAttribute = (node: Element): boolean => {
  const target = node.getAttribute('attributeName')?.trim().toLowerCase();

  return target === 'href' || target === 'xlink:href';
};

export const prepareSvgData = (data: string, sanitize?: (svg: string) => string): string =>
  sanitize ? sanitize(data) : data;

export const sanitizeSvgElement = (root: Element): void => {
  const walk = (node: Element): void => {
    const tagName = node.tagName.toLowerCase();

    if (DANGEROUS_TAGS.has(tagName)) {
      node.remove();
      return;
    }

    if (ANIMATION_TAGS.has(tagName) && targetsHrefAttribute(node)) {
      node.remove();
      return;
    }

    for (const attr of [...node.attributes]) {
      const name = attr.name.toLowerCase();

      if (name.startsWith('on') || (HREF_ATTRS.has(name) && isUnsafeHref(attr.value))) {
        node.removeAttribute(attr.name);
      }
    }

    for (const child of [...node.children]) {
      walk(child);
    }
  };

  walk(root);
};
