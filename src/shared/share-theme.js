/**
 * CF Studio - Share Theme (CFS1. format)
 * Handles compression, decompression, and strict whitelist validation of share codes.
 * Conforms to:
 * - docs/02_FEATURES.md (Share theme)
 * - docs/03_ARCHITECTURE.md (Share code)
 * - docs/07_PRIVACY_AND_SAFETY.md (Imports)
 * - docs/10_UI_TEXT.md ("This code is not valid.")
 */

export const THEME_TOKEN_NAMES = Object.freeze([
  'page-bg',
  'header-bg',
  'content-bg',
  'surface-1',
  'surface-2',
  'table-header-bg',
  'table-row-bg',
  'table-row-alt-bg',
  'text',
  'text-muted',
  'link',
  'link-hover',
  'border',
  'input-bg',
  'input-text',
  'input-border',
  'button-bg',
  'button-text',
  'button-hover-bg',
  'focus',
  'code-bg',
  'accent',
  'nav-bg',
  'nav-text',
  'nav-hover-bg',
  'nav-hover-text',
  'nav-active-bg',
  'nav-active-text',
  'nav-active-hover-bg',
  'nav-border',
  'subnav-bg',
  'subnav-text',
  'subnav-hover-bg',
  'subnav-hover-text',
  'subnav-active-bg',
  'subnav-active-text',
  'subnav-active-hover-bg',
]);

export const THEME_COLOR_GROUPS = Object.freeze([
  {
    name: 'Page',
    tokens: [
      { key: 'page-bg', label: 'Page' },
      { key: 'accent', label: 'Accent' },
    ],
  },
  {
    name: 'Header',
    tokens: [
      { key: 'header-bg', label: 'Header' },
    ],
  },
  {
    name: 'Panels',
    tokens: [
      { key: 'content-bg', label: 'Content' },
      { key: 'surface-1', label: 'Surface 1' },
      { key: 'surface-2', label: 'Surface 2' },
      { key: 'border', label: 'Border' },
    ],
  },
  {
    name: 'Tables',
    tokens: [
      { key: 'table-header-bg', label: 'Table header' },
      { key: 'table-row-bg', label: 'Table row' },
      { key: 'table-row-alt-bg', label: 'Alternate row' },
    ],
  },
  {
    name: 'Text',
    tokens: [
      { key: 'text', label: 'Text' },
      { key: 'text-muted', label: 'Muted text' },
    ],
  },
  {
    name: 'Links',
    tokens: [
      { key: 'link', label: 'Link' },
      { key: 'link-hover', label: 'Link hover' },
    ],
  },
  {
    name: 'Inputs',
    tokens: [
      { key: 'input-bg', label: 'Input' },
      { key: 'input-text', label: 'Input text' },
      { key: 'input-border', label: 'Input border' },
      { key: 'focus', label: 'Focus' },
    ],
  },
  {
    name: 'Buttons',
    tokens: [
      { key: 'button-bg', label: 'Button' },
      { key: 'button-text', label: 'Button text' },
      { key: 'button-hover-bg', label: 'Button hover' },
    ],
  },
  {
    name: 'Code',
    tokens: [
      { key: 'code-bg', label: 'Code' },
    ],
  },
]);

export function generateCustomThemeId() {
  return `theme_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

/**
 * Validates theme name: 1-30 chars, letters, digits, spaces, and hyphens only.
 * @param {string} name
 * @returns {boolean}
 */
export function isValidThemeName(name) {
  if (typeof name !== 'string') return false;
  const trimmed = name.trim();
  if (trimmed.length < 1 || trimmed.length > 30) return false;
  return /^[a-zA-Z0-9 -]+$/.test(trimmed);
}

/**
 * Converts Uint8Array to base64url string.
 * @param {Uint8Array} bytes
 * @returns {string}
 */
function toBase64Url(bytes) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64 = typeof btoa === 'function' ? btoa(binary) : Buffer.from(binary, 'binary').toString('base64');
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * Converts base64url string to Uint8Array.
 * @param {string} base64url
 * @returns {Uint8Array}
 */
function fromBase64Url(base64url) {
  let base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4 !== 0) {
    base64 += '=';
  }
  const binary = typeof atob === 'function' ? atob(base64) : Buffer.from(base64, 'base64').toString('binary');
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Compresses a theme into a CFS1. share code.
 * Format: CFS1.<base64url(deflate(JSON))>
 * @param {object} theme
 * @returns {Promise<string>}
 */
export async function encodeShareCode(theme) {
  if (!theme || typeof theme !== 'object') {
    throw new Error('Theme must be an object');
  }

  const rawName = theme.name || 'Custom Theme';
  const name = rawName.trim();
  if (!isValidThemeName(name)) {
    throw new Error('Theme name must be 1-30 characters (letters, numbers, space, dash only)');
  }

  // Whitelist tokens
  const cleanTokens = {};
  const rawTokens = theme.tokens || {};
  for (const tokenName of THEME_TOKEN_NAMES) {
    const val = rawTokens[tokenName];
    if (typeof val === 'string' && /^#[0-9a-fA-F]{6}$/.test(val)) {
      cleanTokens[tokenName] = val.toLowerCase();
    }
  }

  const payload = {
    v: 1,
    n: name,
    t: cleanTokens,
  };

  const jsonStr = JSON.stringify(payload);

  if (typeof CompressionStream !== 'function') {
    throw new Error('CompressionStream is not supported in this browser environment');
  }

  const encoder = new TextEncoder();
  const inputBytes = encoder.encode(jsonStr);

  const cs = new CompressionStream('deflate');
  const writer = cs.writable.getWriter();
  writer.write(inputBytes);
  writer.close();

  const response = new Response(cs.readable);
  const compressedBuffer = await response.arrayBuffer();
  const base64url = toBase64Url(new Uint8Array(compressedBuffer));

  const code = `CFS1.${base64url}`;
  if (code.length > 4000) {
    throw new Error('Share code exceeds maximum allowed length of 4000 characters');
  }

  return code;
}

/**
 * Validates and decodes a CFS1. share code.
 * Strict whitelist verification. Returns plain error "This code is not valid." on failure.
 * @param {string} code
 * @returns {Promise<{ valid: boolean, theme?: object, error?: string }>}
 */
export async function decodeShareCode(code) {
  if (typeof code !== 'string') {
    return { valid: false, error: 'This code is not valid.' };
  }

  const trimmed = code.trim();
  if (!trimmed.startsWith('CFS1.') || trimmed.length > 4000 || trimmed.length <= 5) {
    return { valid: false, error: 'This code is not valid.' };
  }

  const payloadB64 = trimmed.slice(5);
  // Allowed base64url characters only
  if (!/^[a-zA-Z0-9_-]+$/.test(payloadB64)) {
    return { valid: false, error: 'This code is not valid.' };
  }

  try {
    const compressedBytes = fromBase64Url(payloadB64);

    if (typeof DecompressionStream !== 'function') {
      return { valid: false, error: 'DecompressionStream is not supported in this environment' };
    }

    const ds = new DecompressionStream('deflate');
    const writer = ds.writable.getWriter();
    writer.write(compressedBytes);
    writer.close();

    const response = new Response(ds.readable);
    const jsonStr = await response.text();

    const data = JSON.parse(jsonStr);

    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      return { valid: false, error: 'This code is not valid.' };
    }

    // Whitelist top-level keys: only v, n, t allowed
    const allowedKeys = new Set(['v', 'n', 't']);
    for (const key of Object.keys(data)) {
      if (!allowedKeys.has(key)) {
        return { valid: false, error: 'This code is not valid.' };
      }
    }

    // Check version
    if (data.v !== 1) {
      return { valid: false, error: 'This code is not valid.' };
    }

    // Check name
    if (!isValidThemeName(data.n)) {
      return { valid: false, error: 'This code is not valid.' };
    }

    // Check tokens
    if (!data.t || typeof data.t !== 'object' || Array.isArray(data.t)) {
      return { valid: false, error: 'This code is not valid.' };
    }

    const validTokens = {};
    for (const [key, val] of Object.entries(data.t)) {
      // Must be a whitelisted token name
      if (!THEME_TOKEN_NAMES.includes(key)) {
        return { valid: false, error: 'This code is not valid.' };
      }
      // Must be #rrggbb format
      if (typeof val !== 'string' || !/^#[0-9a-fA-F]{6}$/.test(val)) {
        return { valid: false, error: 'This code is not valid.' };
      }
      validTokens[key] = val.toLowerCase();
    }

    // At least page-bg and text must be present
    if (!validTokens['page-bg'] || !validTokens['text']) {
      return { valid: false, error: 'This code is not valid.' };
    }

    // Absolute Light-Theme Policy: reject dark themes
    const pageBg = validTokens['page-bg'];
    const r = parseInt(pageBg.slice(1, 3), 16);
    const g = parseInt(pageBg.slice(3, 5), 16);
    const b = parseInt(pageBg.slice(5, 7), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    if (luminance < 0.5) {
      return { valid: false, error: 'CF Studio supports light themes only.' };
    }

    const newTheme = {
      id: generateCustomThemeId(),
      name: data.n.trim(),
      kind: 'custom',
      builtin: false,
      tokens: validTokens,
    };

    return {
      valid: true,
      theme: newTheme,
    };
  } catch {
    return { valid: false, error: 'This code is not valid.' };
  }
}
