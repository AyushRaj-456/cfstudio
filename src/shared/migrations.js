/**
 * Versioned settings migrations.
 * Rejects unknown newer versions, migrates older versions forward.
 * Enforces Absolute Light-Theme Policy by migrating legacy dark theme selections to 'pure-light'.
 */

import { CURRENT_SCHEMA_VERSION, getDefaultSettings, PAGE_TYPES } from './defaults.js';
import { isObject } from './validators.js';

const LEGACY_DARK_THEMES = new Set(['midnight', 'slate', 'purple', 'contrast', 'dracula']);

/**
 * Deep merge helper that keeps target defaults for any missing keys in source.
 */
function mergeWithDefaults(defaults, source) {
  if (!isObject(source)) return JSON.parse(JSON.stringify(defaults));
  const result = {};

  for (const key of Object.keys(defaults)) {
    const defaultVal = defaults[key];
    const sourceVal = source[key];

    if (sourceVal === undefined) {
      result[key] = JSON.parse(JSON.stringify(defaultVal));
    } else if (isObject(defaultVal)) {
      result[key] = mergeWithDefaults(defaultVal, sourceVal);
    } else if (Array.isArray(defaultVal)) {
      result[key] = Array.isArray(sourceVal) ? [...sourceVal] : [...defaultVal];
    } else {
      result[key] = sourceVal;
    }
  }

  return result;
}

/**
 * Migrates settings to CURRENT_SCHEMA_VERSION.
 * @param {any} rawSettings
 * @returns {object} Migrated settings object matching schema
 * @throws {Error} if schemaVersion is newer than CURRENT_SCHEMA_VERSION
 */
export function migrateSettings(rawSettings) {
  if (!rawSettings || typeof rawSettings !== 'object') {
    return getDefaultSettings();
  }

  const version = rawSettings.schemaVersion ?? 0;

  if (version > CURRENT_SCHEMA_VERSION) {
    throw new Error(`Unknown settings schema version: ${version}. Migration not supported.`);
  }

  const defaults = getDefaultSettings();
  let migrated = mergeWithDefaults(defaults, rawSettings);
  migrated.schemaVersion = 1;

  // Enforce Light-Theme Policy on global themeId
  if (!migrated.global.themeId || LEGACY_DARK_THEMES.has(migrated.global.themeId)) {
    migrated.global.themeId = 'pure-light';
  }

  // Enforce Light-Theme Policy on contestMode themeId
  if (LEGACY_DARK_THEMES.has(migrated.contestMode?.themeId)) {
    migrated.contestMode.themeId = 'editorial';
  }

  // Ensure perPage has all expected keys and clean any dark references
  if (!isObject(migrated.perPage)) {
    migrated.perPage = {};
  }
  for (const pageType of PAGE_TYPES) {
    if (!isObject(migrated.perPage[pageType])) {
      migrated.perPage[pageType] = {};
    } else if (LEGACY_DARK_THEMES.has(migrated.perPage[pageType].themeId)) {
      migrated.perPage[pageType].themeId = 'pure-light';
    }
  }

  // Clean favorites of any legacy dark themes
  if (Array.isArray(migrated.favorites)) {
    migrated.favorites = migrated.favorites.filter((id) => !LEGACY_DARK_THEMES.has(id));
  } else {
    migrated.favorites = [];
  }

  // Clean customThemes of any legacy dark custom themes
  if (Array.isArray(migrated.customThemes)) {
    migrated.customThemes = migrated.customThemes.filter((t) => {
      if (!t || !t.tokens) return false;
      const pageBg = t.tokens['page-bg'] || '';
      // Quick brightness check: ensure page-bg is not dark (< #777777)
      if (pageBg.startsWith('#') && pageBg.length === 7) {
        const r = parseInt(pageBg.slice(1, 3), 16);
        const g = parseInt(pageBg.slice(3, 5), 16);
        const b = parseInt(pageBg.slice(5, 7), 16);
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        if (luminance < 0.5) return false; // reject dark custom themes
      }
      return true;
    });
  } else {
    migrated.customThemes = [];
  }

  if (typeof migrated.introShown !== 'boolean') migrated.introShown = false;
  if (typeof migrated.enabled !== 'boolean') migrated.enabled = true;
  if (typeof migrated.animationsEnabled !== 'boolean') migrated.animationsEnabled = true;

  return migrated;
}
