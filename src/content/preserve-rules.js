/**
 * CF Studio - Preserve Rules
 * Defines elements, classes, and areas that must NEVER have their colors or appearances modified.
 * Conforms to AGENTS.md rule 8 & docs/04_CODEFORCES_PAGES.md.
 */

export const PRESERVE_CLASSES = [
  // Verdict colors (accepted, wrong answer, compilation error, etc.)
  'verdict-accepted',
  'verdict-rejected',
  'verdict-waiting',
  'verdict-successful-challenge',
  'verdict-unsuccessful-challenge',
  'verdict-challenged',

  // Rating and rank colors (user handles)
  'user-admin',
  'user-legendary',
  'user-red',
  'user-orange',
  'user-violet',
  'user-blue',
  'user-cyan',
  'user-green',
  'user-gray',
  'user-black',
  'rated-user',

  // Problem tags, difficulty, notices
  'tag-box',
  'notice',
  'problem-tag',

  // Code syntax highlighting tokens
  'pln',
  'kwd',
  'str',
  'pun',
  'typ',
  'lit',
  'com',

  // Media, charts, avatars, logos
  'avatar',
  'user-avatar',
  'logo',
  'user-activity-chart',
];

export const PRESERVE_TAGS = new Set([
  'svg',
  'path',
  'circle',
  'rect',
  'line',
  'polygon',
  'polyline',
  'g',
  'canvas',
  'img',
  'picture',
  'video',
  'audio',
  'iframe',
]);

/**
 * Returns true if an element or any of its classes/tags/attributes are protected
 * and must not be touched or recolored by CF Studio.
 * @param {Element} el
 * @returns {boolean}
 */
export function shouldPreserve(el) {
  if (!el || el.nodeType !== 1) return true;

  // Extension's own elements
  if (isExtensionElement(el)) return true;

  // Media and SVG tags
  const tagName = el.tagName ? el.tagName.toLowerCase() : '';
  if (PRESERVE_TAGS.has(tagName)) return true;

  // Inside SVG
  if (el.ownerSVGElement || (typeof SVGElement !== 'undefined' && el instanceof SVGElement)) {
    return true;
  }

  // Check class list
  const classAttr = el.getAttribute ? (el.getAttribute('class') || '') : (el.className || '');
  if (typeof classAttr === 'string' && classAttr) {
    const classes = classAttr.split(/\s+/);
    for (const cls of classes) {
      if (!cls) continue;
      if (PRESERVE_CLASSES.includes(cls)) return true;
      if (cls.startsWith('user-') || cls.startsWith('verdict-') || cls.startsWith('hljs-')) {
        return true;
      }
    }
  }

  // Check parent context (e.g. inside an avatar link, logo, or rating span)
  let parent = el.parentElement;
  let depth = 0;
  while (parent && depth < 3) {
    const pClass = parent.getAttribute ? (parent.getAttribute('class') || '') : '';
    if (typeof pClass === 'string' && pClass) {
      if (pClass.includes('rated-user') || pClass.includes('verdict') || pClass.includes('tag-box') || pClass.includes('avatar') || pClass.includes('logo')) {
        return true;
      }
    }
    const pTag = parent.tagName ? parent.tagName.toLowerCase() : '';
    if (PRESERVE_TAGS.has(pTag)) return true;
    parent = parent.parentElement;
    depth++;
  }

  return false;
}

/**
 * Checks if element belongs to the extension.
 * @param {Element} el
 * @returns {boolean}
 */
export function isExtensionElement(el) {
  if (!el || el.nodeType !== 1) return false;
  const id = el.id || '';
  if (id === 'cfs-style' || id.startsWith('cfs-')) return true;
  if (el.hasAttribute && (el.hasAttribute('data-cfs-host') || el.hasAttribute('data-cfs-card'))) return true;
  return false;
}
