/**
 * Validation helpers for settings, inputs, and payloads.
 */

export function isObject(val) {
  return val !== null && typeof val === 'object' && !Array.isArray(val);
}

export function isBoolean(val) {
  return typeof val === 'boolean';
}

export function isString(val) {
  return typeof val === 'string';
}

export function isNumber(val) {
  return typeof val === 'number' && Number.isFinite(val);
}

export function isInteger(val) {
  return Number.isInteger(val);
}

export function isHexColor(val) {
  if (typeof val !== 'string') return false;
  return /^#[0-9a-fA-F]{6}$/.test(val) || /^#[0-9a-fA-F]{3}$/.test(val);
}

export function isValidTime(val) {
  if (typeof val !== 'string') return false;
  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(val);
}

export function isOneOf(val, list) {
  return list.includes(val);
}

/**
 * Validates font name according to docs/03_ARCHITECTURE.md:
 * Allowed: letters, digits, spaces, hyphens, commas, quotes around names.
 * Reject: ; { } ( ) \ @ < > url( @import. Max 100 chars.
 */
export function isValidFontFamily(val) {
  if (val === undefined || val === null || val === '') return true;
  if (typeof val !== 'string') return false;
  if (val.length > 100) return false;

  const forbidden = /[;{}()\\@<>]|url\s*\(|@import/i;
  if (forbidden.test(val)) return false;

  const allowed = /^[a-zA-Z0-9\s,'"-]+$/;
  return allowed.test(val);
}

/**
 * Sanitizes font family by trimming and validating.
 */
export function sanitizeFontFamily(val) {
  if (!isValidFontFamily(val)) return '';
  return val.trim();
}

