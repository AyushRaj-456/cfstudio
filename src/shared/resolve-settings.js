/**
 * CF Studio - Settings Resolution Engine
 * Resolves effective styling settings for any Codeforces URL.
 *
 * PRIORITY RULES (per docs/02_FEATURES.md and docs/03_ARCHITECTURE.md):
 *
 * 1. Per page override (HIGHEST PRIORITY):
 *    If the user has specified a setting for the specific page category
 *    (Home, Problems, Problem, Contest, Standings, Submissions, Profile, Blog, Groups, Login),
 *    that specific page setting always wins over contest mode, auto dark, and global settings.
 *
 * 2. Contest mode (SECOND PRIORITY):
 *    Applies only on contest pages (pathname starting with /contest/ or /contests).
 *    When contestMode.enabled is true:
 *    - Theme: contestMode.themeId (default 'contrast'), unless overridden by Per-page.
 *    - Background: mode forced to 'none' if contestMode.hideBackground is true,
 *      unless overridden by Per-page.
 *
 * 3. Auto dark (THIRD PRIORITY):
 *    Applies to theme when not overridden by Per-page or Contest mode.
 *    - Mode 'system': selects darkThemeId if system prefers dark, else lightThemeId.
 *    - Mode 'time': checks whether local time (HH:MM) falls between 'from' and 'to'
 *      (accurately handling spans that cross midnight, e.g. 19:00 to 07:00).
 *      Selects darkThemeId during dark hours, lightThemeId during light hours.
 *
 * 4. Everywhere / Global settings (FOURTH PRIORITY):
 *    Standard user settings from `settings.global` (themeId, background, font, transparency).
 *
 * 5. Built-in defaults (FALLBACK):
 *    Standard defaults from `DEFAULT_SETTINGS` if any property is null or unset.
 */

import { detectPageCategory } from '../content/codeforces-adapter.js';
import { getBuiltinTheme } from '../themes/builtin.js';
import { getCustomTheme } from '../themes/palette-generator.js';
import { DEFAULT_SETTINGS } from './defaults.js';

/**
 * Checks if a location corresponds to a contest URL (/contest/...).
 * @param {string|Location|URL} loc
 * @returns {boolean}
 */
export function isContestUrl(loc) {
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
  pathname = pathname.toLowerCase();
  return pathname.startsWith('/contest/') || pathname === '/contest' || pathname.startsWith('/contests');
}

/**
 * Parses time string (HH:MM) into minutes since midnight (0..1439).
 * @param {string} timeStr
 * @returns {number}
 */
export function parseTimeToMinutes(timeStr) {
  if (typeof timeStr !== 'string') return 0;
  const match = timeStr.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return 0;
  const h = parseInt(match[1], 10);
  const m = parseInt(match[2], 10);
  return Math.min(23, Math.max(0, h)) * 60 + Math.min(59, Math.max(0, m));
}

/**
 * Checks if currentTime falls within the [from, to) time window.
 * Handles ranges crossing midnight (e.g. from 19:00 to 07:00).
 * @param {string|Date} [currentTime]
 * @param {string} [from]
 * @param {string} [to]
 * @returns {boolean}
 */
export function isTimeInRange(currentTime = new Date(), from = '19:00', to = '07:00') {
  let currentMinutes = 0;
  if (currentTime instanceof Date) {
    currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
  } else if (typeof currentTime === 'string') {
    currentMinutes = parseTimeToMinutes(currentTime);
  } else {
    const now = new Date();
    currentMinutes = now.getHours() * 60 + now.getMinutes();
  }

  const fromMin = parseTimeToMinutes(from);
  const toMin = parseTimeToMinutes(to);

  if (fromMin <= toMin) {
    // Normal window within same day (e.g. 08:00 to 18:00)
    return currentMinutes >= fromMin && currentMinutes < toMin;
  } else {
    // Window crosses midnight (e.g. 19:00 to 07:00)
    return currentMinutes >= fromMin || currentMinutes < toMin;
  }
}

/**
 * Reads system color scheme preference.
 * @returns {boolean}
 */
export function getSystemPrefersDark() {
  if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
    try {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  }
  return false;
}

/**
 * Resolves a theme object by ID (custom themes first, then built-in).
 * @param {string} themeId
 * @param {Array<object>} [customThemes]
 * @returns {object}
 */
export function resolveThemeObject(themeId, customThemes = []) {
  if (Array.isArray(customThemes)) {
    const custom = customThemes.find((t) => t && t.id === themeId);
    if (custom) return custom;
  }
  if (themeId === 'custom') {
    return getCustomTheme(customThemes);
  }
  try {
    return getBuiltinTheme(themeId);
  } catch {
    return getBuiltinTheme('pure-light');
  }
}

/**
 * Resolves effective settings for a given Codeforces URL.
 *
 * @param {object} settings Full settings object
 * @param {string|Location|URL} [location] Page location
 * @param {object} [context] Optional environment overrides for testing
 * @param {boolean} [context.systemPrefersDark] Override system dark preference
 * @param {string|Date} [context.currentTime] Override current clock time
 * @param {string} [context.pageCategory] Override detected page category
 * @param {boolean} [context.isContestPage] Override contest URL flag
 * @returns {object} Resolved effective configuration
 */
export function resolveSettings(settings, location = '', context = {}) {
  const currentLoc = location || (typeof window !== 'undefined' ? window.location : '');
  const pageCategory = context.pageCategory || detectPageCategory(currentLoc);
  const isContest = context.isContestPage !== undefined ? context.isContestPage : isContestUrl(currentLoc);

  const globalSettings = settings?.global || DEFAULT_SETTINGS.global;
  const perPageConfig = settings?.perPage?.[pageCategory] || {};
  const contestMode = settings?.contestMode || DEFAULT_SETTINGS.contestMode;
  const autoDark = settings?.autoDark || DEFAULT_SETTINGS.autoDark;
  const customThemes = settings?.customThemes || [];

  // System dark preference
  const sysDark = context.systemPrefersDark !== undefined
    ? context.systemPrefersDark
    : getSystemPrefersDark();

  // Current time
  const currTime = context.currentTime !== undefined ? context.currentTime : new Date();

  // 1. Resolve Theme
  let resolvedThemeId = null;
  let themeSource = 'global';

  // Check Per-page
  if (perPageConfig.themeId) {
    resolvedThemeId = perPageConfig.themeId;
    themeSource = 'per-page';
  }
  // Check Contest mode (only on /contest/... pages)
  else if (isContest && contestMode.enabled && contestMode.themeId) {
    resolvedThemeId = contestMode.themeId;
    themeSource = 'contest-mode';
  }
  // Check Auto dark
  else if (autoDark.mode === 'system') {
    resolvedThemeId = sysDark ? autoDark.darkThemeId : autoDark.lightThemeId;
    themeSource = 'auto-dark-system';
  } else if (autoDark.mode === 'time') {
    const isDarkHours = isTimeInRange(currTime, autoDark.from, autoDark.to);
    resolvedThemeId = isDarkHours ? autoDark.darkThemeId : autoDark.lightThemeId;
    themeSource = 'auto-dark-time';
  }
  // Check Global
  else if (globalSettings.themeId) {
    resolvedThemeId = globalSettings.themeId;
    themeSource = 'global';
  } else {
    resolvedThemeId = 'midnight';
    themeSource = 'default';
  }

  const resolvedTheme = resolveThemeObject(resolvedThemeId, customThemes);

  // 2. Resolve Background
  const resolvedBackground = { ...(globalSettings.background || DEFAULT_SETTINGS.global.background) };

  // Per-page background toggle (explicit boolean)
  if (perPageConfig.backgroundEnabled === false) {
    resolvedBackground.mode = 'none';
  } else if (perPageConfig.backgroundEnabled === true) {
    // Keeps global background mode
  }
  // Contest mode hide background (if not overridden by per-page)
  else if (isContest && contestMode.enabled && contestMode.hideBackground) {
    resolvedBackground.mode = 'none';
  }

  // 3. Resolve Font
  const resolvedFont = { ...(globalSettings.font || DEFAULT_SETTINGS.global.font) };
  if (perPageConfig.fontPreset) {
    resolvedFont.preset = perPageConfig.fontPreset;
  }
  if (perPageConfig.fontPage !== undefined && perPageConfig.fontPage !== null) {
    resolvedFont.page = perPageConfig.fontPage;
  }
  if (perPageConfig.fontHeadings !== undefined && perPageConfig.fontHeadings !== null) {
    resolvedFont.headings = perPageConfig.fontHeadings;
  }
  if (perPageConfig.fontStatement !== undefined && perPageConfig.fontStatement !== null) {
    resolvedFont.statement = perPageConfig.fontStatement;
  }
  if (perPageConfig.fontCode !== undefined && perPageConfig.fontCode !== null) {
    resolvedFont.code = perPageConfig.fontCode;
  }

  // 4. Resolve Transparency
  let resolvedTransparency = { ...(globalSettings.transparency || DEFAULT_SETTINGS.global.transparency) };
  if (perPageConfig.transparency && typeof perPageConfig.transparency === 'object') {
    resolvedTransparency = {
      ...resolvedTransparency,
      ...perPageConfig.transparency,
    };
  }

  return {
    themeId: resolvedThemeId,
    theme: resolvedTheme,
    background: resolvedBackground,
    font: resolvedFont,
    transparency: resolvedTransparency,
    pageCategory,
    isContestPage: isContest,
    themeSource,
  };
}
