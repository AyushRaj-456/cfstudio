/**
 * Schema definition and validation for CF Studio settings.
 */

import {
  isObject,
  isBoolean,
  isString,
  isNumber,
  isInteger,
  isHexColor,
  isValidTime,
  isOneOf,
  isValidFontFamily,
} from './validators.js';
import { CURRENT_SCHEMA_VERSION, PAGE_TYPES } from './defaults.js';

export const ALLOWED_BG_MODES = ['none', 'builtin', 'my-image'];
export const ALLOWED_BG_POSITIONS = ['center', 'top', 'bottom', 'left', 'right'];
export const ALLOWED_BG_SIZES = ['cover', 'contain', 'repeat', 'original'];
export const ALLOWED_FONT_PRESETS = ['default', 'reading', 'coding'];
export const ALLOWED_AUTODARK_MODES = ['off', 'system', 'time'];

function inRange(val, min, max) {
  return isNumber(val) && val >= min && val <= max;
}

/**
 * Validates a background settings object.
 */
export function validateBackground(bg, path = 'background') {
  const errors = [];
  if (!isObject(bg)) {
    return [`${path} must be an object`];
  }

  if (!isOneOf(bg.mode, ALLOWED_BG_MODES)) {
    errors.push(`${path}.mode must be one of: ${ALLOWED_BG_MODES.join(', ')}`);
  }
  if (!isOneOf(bg.position, ALLOWED_BG_POSITIONS)) {
    errors.push(`${path}.position must be one of: ${ALLOWED_BG_POSITIONS.join(', ')}`);
  }
  if (!isOneOf(bg.size, ALLOWED_BG_SIZES)) {
    errors.push(`${path}.size must be one of: ${ALLOWED_BG_SIZES.join(', ')}`);
  }
  if (!inRange(bg.strength, 0, 100)) errors.push(`${path}.strength must be 0-100`);
  if (!inRange(bg.blur, 0, 100)) errors.push(`${path}.blur must be 0-100`);
  if (!inRange(bg.brightness, 0, 300)) errors.push(`${path}.brightness must be 0-300`);
  if (!inRange(bg.contrast, 0, 300)) errors.push(`${path}.contrast must be 0-300`);
  if (!inRange(bg.saturation, 0, 300)) errors.push(`${path}.saturation must be 0-300`);
  if (!isHexColor(bg.coverColor)) errors.push(`${path}.coverColor must be a valid hex color`);
  if (!inRange(bg.coverStrength, 0, 100)) errors.push(`${path}.coverStrength must be 0-100`);
  if (bg.builtinId !== null && !isString(bg.builtinId)) {
    errors.push(`${path}.builtinId must be string or null`);
  }
  if (!isBoolean(bg.hasImage)) errors.push(`${path}.hasImage must be a boolean`);

  return errors;
}

/**
 * Validates a font settings object.
 */
export function validateFont(font, path = 'font') {
  const errors = [];
  if (!isObject(font)) {
    return [`${path} must be an object`];
  }

  if (!isOneOf(font.preset, ALLOWED_FONT_PRESETS)) {
    errors.push(`${path}.preset must be one of: ${ALLOWED_FONT_PRESETS.join(', ')}`);
  }
  if (font.family !== undefined && !isValidFontFamily(font.family)) {
    errors.push(`${path}.family contains invalid characters`);
  }
  if (!isValidFontFamily(font.page)) errors.push(`${path}.page contains invalid characters`);
  if (!isValidFontFamily(font.headings)) errors.push(`${path}.headings contains invalid characters`);
  if (!isValidFontFamily(font.statement)) errors.push(`${path}.statement contains invalid characters`);
  if (!isValidFontFamily(font.code)) errors.push(`${path}.code contains invalid characters`);
  if (!isValidFontFamily(font.interface)) errors.push(`${path}.interface contains invalid characters`);
  if (!isValidFontFamily(font.reading)) errors.push(`${path}.reading contains invalid characters`);

  if (font.size !== null && font.size !== undefined && !inRange(font.size, 8, 36)) {
    errors.push(`${path}.size must be null or 8-36`);
  }
  if (font.weight !== null && font.weight !== undefined && !inRange(font.weight, 100, 900)) {
    errors.push(`${path}.weight must be null or 100-900`);
  }
  if (font.lineHeight !== null && font.lineHeight !== undefined && !inRange(font.lineHeight, 0.8, 3.0)) {
    errors.push(`${path}.lineHeight must be null or 0.8-3.0`);
  }
  if (font.letterSpacing !== null && font.letterSpacing !== undefined && !inRange(font.letterSpacing, -2, 10)) {
    errors.push(`${path}.letterSpacing must be null or -2 to 10`);
  }

  return errors;
}

export const ALLOWED_SURFACE_TREATMENTS = ['solid', 'translucent', 'frosted'];

/**
 * Validates a transparency settings object.
 */
export function validateTransparency(t, path = 'transparency') {
  const errors = [];
  if (!isObject(t)) {
    return [`${path} must be an object`];
  }

  if (t.treatment !== undefined && !isOneOf(t.treatment, ALLOWED_SURFACE_TREATMENTS)) {
    errors.push(`${path}.treatment must be one of: ${ALLOWED_SURFACE_TREATMENTS.join(', ')}`);
  }
  if (!inRange(t.all, 0, 100)) errors.push(`${path}.all must be 0-100`);
  if (!inRange(t.page, 0, 100)) errors.push(`${path}.page must be 0-100`);
  if (!inRange(t.panels, 0, 100)) errors.push(`${path}.panels must be 0-100`);
  if (!inRange(t.tables, 0, 100)) errors.push(`${path}.tables must be 0-100`);
  if (!inRange(t.inputs, 0, 100)) errors.push(`${path}.inputs must be 0-100`);
  if (t.blurBehindPanels !== undefined && !isBoolean(t.blurBehindPanels)) {
    errors.push(`${path}.blurBehindPanels must be a boolean`);
  }
  if (t.blurRadius !== undefined && t.blurRadius !== null && !inRange(t.blurRadius, 0, 50)) {
    errors.push(`${path}.blurRadius must be 0-50`);
  }

  return errors;
}

/**
 * Validates the full settings object.
 * @param {any} settings
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateSettings(settings) {
  const errors = [];

  if (!isObject(settings)) {
    return { valid: false, errors: ['Settings must be an object'] };
  }

  if (settings.schemaVersion !== CURRENT_SCHEMA_VERSION) {
    errors.push(`schemaVersion must be ${CURRENT_SCHEMA_VERSION}, received ${settings.schemaVersion}`);
  }

  if (!isBoolean(settings.enabled)) {
    errors.push('enabled must be a boolean');
  }

  if (settings.animationsEnabled !== undefined && !isBoolean(settings.animationsEnabled)) {
    errors.push('animationsEnabled must be a boolean');
  }

  // Global settings
  if (!isObject(settings.global)) {
    errors.push('global must be an object');
  } else {
    if (settings.global.themeId !== null && !isString(settings.global.themeId)) {
      errors.push('global.themeId must be string or null');
    }
    errors.push(...validateBackground(settings.global.background, 'global.background'));
    errors.push(...validateFont(settings.global.font, 'global.font'));
    errors.push(...validateTransparency(settings.global.transparency, 'global.transparency'));
  }

  // perPage settings
  if (!isObject(settings.perPage)) {
    errors.push('perPage must be an object');
  } else {
    for (const pageType of PAGE_TYPES) {
      if (settings.perPage[pageType] !== undefined && !isObject(settings.perPage[pageType])) {
        errors.push(`perPage.${pageType} must be an object`);
      }
    }
  }

  // contestMode
  if (!isObject(settings.contestMode)) {
    errors.push('contestMode must be an object');
  } else {
    if (!isBoolean(settings.contestMode.enabled)) {
      errors.push('contestMode.enabled must be a boolean');
    }
    if (!isString(settings.contestMode.themeId)) {
      errors.push('contestMode.themeId must be a string');
    }
    if (!isBoolean(settings.contestMode.hideBackground)) {
      errors.push('contestMode.hideBackground must be a boolean');
    }
  }

  // autoDark
  if (!isObject(settings.autoDark)) {
    errors.push('autoDark must be an object');
  } else {
    if (!isOneOf(settings.autoDark.mode, ALLOWED_AUTODARK_MODES)) {
      errors.push(`autoDark.mode must be one of: ${ALLOWED_AUTODARK_MODES.join(', ')}`);
    }
    if (!isString(settings.autoDark.lightThemeId)) {
      errors.push('autoDark.lightThemeId must be a string');
    }
    if (!isString(settings.autoDark.darkThemeId)) {
      errors.push('autoDark.darkThemeId must be a string');
    }
    if (!isValidTime(settings.autoDark.from)) {
      errors.push('autoDark.from must be a valid time in HH:MM format');
    }
    if (!isValidTime(settings.autoDark.to)) {
      errors.push('autoDark.to must be a valid time in HH:MM format');
    }
  }

  // customThemes
  if (!Array.isArray(settings.customThemes)) {
    errors.push('customThemes must be an array');
  }

  // favorites
  if (!Array.isArray(settings.favorites) || !settings.favorites.every(isString)) {
    errors.push('favorites must be an array of strings');
  }

  // introShown
  if (!isBoolean(settings.introShown)) {
    errors.push('introShown must be a boolean');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

