/**
 * CF Studio - Backup Module (Export and Import)
 * Handles JSON serialization, schema validation, size limits, and security whitelisting.
 * Conforms to:
 * - docs/02_FEATURES.md (Backup)
 * - docs/07_PRIVACY_AND_SAFETY.md (Imports: untrusted input validation)
 */

import { validateSettings } from './schema.js';
import { THEME_TOKEN_NAMES, isValidThemeName } from './share-theme.js';
import { CURRENT_SCHEMA_VERSION } from './defaults.js';

export const MAX_IMPORT_SIZE_BYTES = 1024 * 1024; // 1 MB limit

export const ALLOWED_TOP_LEVEL_KEYS = Object.freeze([
  'schemaVersion',
  'enabled',
  'animationsEnabled',
  'global',
  'perPage',
  'contestMode',
  'autoDark',
  'customThemes',
  'favorites',
  'introShown',
]);

/**
 * Prepares clean settings JSON for export.
 * Note: Uploaded images in IndexedDB are NOT included in v1 backup.
 * @param {object} settings
 * @returns {string} Formatted JSON string
 */
export function exportSettings(settings) {
  if (!settings || typeof settings !== 'object') {
    throw new Error('Invalid settings object for export');
  }

  const exportCopy = JSON.parse(JSON.stringify(settings));

  // The uploaded image is not included in export
  if (exportCopy.global?.background) {
    if (exportCopy.global.background.mode === 'my-image') {
      exportCopy.global.background.mode = 'none';
    }
    exportCopy.global.background.hasImage = false;
  }

  return JSON.stringify(exportCopy, null, 2);
}

/**
 * Validates untrusted imported JSON string against schema, size limit, and whitelists.
 * Every import is treated as untrusted.
 * @param {string} jsonString
 * @returns {{ valid: boolean, settings?: object, error?: string }}
 */
export function validateAndImportSettings(jsonString) {
  if (typeof jsonString !== 'string') {
    return { valid: false, error: 'Import data must be a string' };
  }

  // Size limit check (max 1 MB)
  if (jsonString.length > MAX_IMPORT_SIZE_BYTES) {
    return { valid: false, error: 'File too large (max 1 MB).' };
  }

  let parsed;
  try {
    parsed = JSON.parse(jsonString);
  } catch {
    return { valid: false, error: 'This file is not valid JSON.' };
  }

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return { valid: false, error: 'Imported settings must be a JSON object.' };
  }

  // Whitelist top-level keys (reject extra / unexpected keys)
  for (const key of Object.keys(parsed)) {
    if (!ALLOWED_TOP_LEVEL_KEYS.includes(key)) {
      return { valid: false, error: `Unauthorized extra setting: ${key}` };
    }
  }

  // Version check: reject newer or unsupported schema
  if (parsed.schemaVersion !== CURRENT_SCHEMA_VERSION) {
    return { valid: false, error: `Unsupported settings version: ${parsed.schemaVersion}` };
  }

  // Validate full schema
  const schemaResult = validateSettings(parsed);
  if (!schemaResult.valid) {
    return { valid: false, error: `Invalid settings format: ${schemaResult.errors.join('; ')}` };
  }

  // Whitelist validate custom themes
  if (Array.isArray(parsed.customThemes)) {
    for (const theme of parsed.customThemes) {
      if (!theme || typeof theme !== 'object') {
        return { valid: false, error: 'Custom theme must be an object' };
      }
      if (!isValidThemeName(theme.name)) {
        return { valid: false, error: `Invalid theme name: ${theme.name}` };
      }
      if (!theme.tokens || typeof theme.tokens !== 'object') {
        return { valid: false, error: `Invalid theme tokens in: ${theme.name}` };
      }

      for (const [tokenKey, tokenVal] of Object.entries(theme.tokens)) {
        if (!THEME_TOKEN_NAMES.includes(tokenKey)) {
          return { valid: false, error: `Unauthorized token name: ${tokenKey}` };
        }
        if (typeof tokenVal !== 'string' || !/^#[0-9a-fA-F]{6}$/i.test(tokenVal) && !/^#[0-9a-fA-F]{3}$/i.test(tokenVal)) {
          return { valid: false, error: `Invalid color value for token: ${tokenKey}` };
        }
      }
    }
  }

  // Ensure uploaded image flag is safe (image is local to IndexedDB)
  if (parsed.global?.background?.mode === 'my-image') {
    parsed.global.background.mode = 'none';
    parsed.global.background.hasImage = false;
  }

  return {
    valid: true,
    settings: parsed,
  };
}
