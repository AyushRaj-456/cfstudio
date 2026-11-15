/**
 * CF Studio - Codeforces Adapter
 * ONLY place with Codeforces-specific selectors.
 * Selectors come from fixtures/ per docs/04_CODEFORCES_PAGES.md.
 * If a fixture is missing, that page's specific selectors are skipped.
 */

import { shouldPreserve } from './preserve-rules.js';

export const MISSING_FIXTURES = [
  'home',
  'problemset',
  'problem',
  'contest',
  'standings',
  'submissions',
  'profile',
  'blog',
  'login',
];

/**
 * Detects page category from URL pathname.
 * @param {string|Location|URL} loc
 * @returns {string} Page category
 */
export function detectPageCategory(loc) {
  let pathname = '';
  if (typeof loc === 'string') {
    try {
      pathname = new URL(loc, 'https://codeforces.com').pathname;
    } catch {
      pathname = loc;
    }
  } else if (loc && loc.pathname) {
    pathname = loc.pathname;
  }

  // Normalize
  pathname = pathname.toLowerCase();
  if (pathname.endsWith('/') && pathname.length > 1) {
    pathname = pathname.slice(0, -1);
  }

  if (pathname === '' || pathname === '/' || pathname === '/index') {
    return 'home';
  }
  if (pathname === '/enter' || pathname === '/register') {
    return 'login';
  }
  if (pathname.startsWith('/profile/')) {
    return 'profile';
  }
  if (pathname.startsWith('/blog/') || pathname.startsWith('/blog')) {
    return 'blog';
  }
  if (pathname.startsWith('/group/') || pathname.startsWith('/groups')) {
    return 'groups';
  }
  if (pathname.includes('/standings')) {
    return 'standings';
  }
  if (pathname.includes('/status') || pathname.startsWith('/submissions')) {
    return 'submissions';
  }
  if (pathname.includes('/problem/')) {
    return 'problem';
  }
  if (pathname.startsWith('/problemset')) {
    return 'problems';
  }
  if (pathname.startsWith('/contest/') || pathname.startsWith('/contests')) {
    return 'contest';
  }

  return 'other';
}

/**
 * Shared structural selectors for Codeforces common layout.
 * Page-specific selectors are skipped because fixtures are missing in fixtures/.
 */
export const CODEFORCES_SELECTORS = {
  header: [
    '#header',
    '.header',
    '.main-menu-list',
    '#main-menu',
    '.nav',
    'nav',
  ],
  content: [
    '#pageContent',
    '#content',
    '.content',
    '.roundbox',
  ],
  sidebox: [
    '.sidebox',
    '.rtable',
    '.titled',
  ],
  table: [
    'table.datatable',
    'table.tablesorter',
    '.datatable',
    'table',
  ],
  tableHeader: [
    'table.datatable th',
    'table.tablesorter th',
    'table th',
    'thead tr',
  ],
  tableRow: [
    'table.datatable tr',
    'table tr',
  ],
  input: [
    'input[type="text"]',
    'input[type="password"]',
    'input[type="search"]',
    'textarea',
    'select',
  ],
  button: [
    'input[type="submit"]',
    'input[type="button"]',
    'button',
    '.button',
    'a.button',
  ],
  code: [
    'pre',
    'code',
    '.source-code',
    '.sample-test pre',
  ],
};

/**
 * Scans a root element or document to locate layout elements.
 * @param {Document|Element} root
 * @returns {Array<{ element: Element, role: string, source: string }>}
 */
export function findAreas(root) {
  if (!root || !root.querySelectorAll) return [];
  const found = [];

  const roles = [
    { role: 'header', selectors: CODEFORCES_SELECTORS.header },
    { role: 'content', selectors: CODEFORCES_SELECTORS.content },
    { role: 'sidebox', selectors: CODEFORCES_SELECTORS.sidebox },
    { role: 'table', selectors: CODEFORCES_SELECTORS.table },
    { role: 'input', selectors: CODEFORCES_SELECTORS.input },
    { role: 'button', selectors: CODEFORCES_SELECTORS.button },
    { role: 'code', selectors: CODEFORCES_SELECTORS.code },
  ];

  for (const { role, selectors } of roles) {
    for (const selector of selectors) {
      try {
        const elements = root.querySelectorAll(selector);
        for (const el of elements) {
          if (!shouldPreserve(el)) {
            found.push({ element: el, role, source: selector });
          }
        }
      } catch (err) {
        // Safe query selector catch
      }
    }
  }

  return found;
}
