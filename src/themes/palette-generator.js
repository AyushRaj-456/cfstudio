/**
 * CF Studio - Three-Colour Palette Theme Generator
 * Generates an entire cohesive, accessible light theme from three foundational colours:
 * 1. Primary: Identity, main buttons, active nav, accents, focus indicator
 * 2. Secondary: Ambient page background, header background, surfaces, table headers, alternating rows, code blocks, borders
 * 3. Tertiary: Links, link hover, secondary accents, highlights
 *
 * Absolute Light-Theme Policy:
 * - Page background luminance is mathematically >= 0.5 (always light pastel).
 * - All text/background and button-text/button-bg pairs pass WCAG AA >= 4.5:1.
 * - Strict Safe Styling: appearance properties only, zero layout properties, zero opacity on site elements.
 */

/**
 * Normalizes a hex color string to #rrggbb format.
 * @param {string} hex
 * @param {string} [fallback='#1a73e8']
 * @returns {string}
 */
export function normalizeHex(hex, fallback = '#1a73e8') {
  if (typeof hex !== 'string') return fallback;
  let c = hex.trim().toLowerCase();
  if (c.startsWith('#')) c = c.slice(1);
  if (c.length === 3 && /^[0-9a-f]{3}$/.test(c)) {
    c = c.split('').map((ch) => ch + ch).join('');
  }
  if (c.length === 6 && /^[0-9a-f]{6}$/.test(c)) {
    return `#${c}`;
  }
  return fallback;
}

/**
 * Converts a hex color to an [r, g, b] tuple (0-255).
 * @param {string} hex
 * @returns {[number, number, number]}
 */
export function hexToRgb(hex) {
  const norm = normalizeHex(hex, '#000000').slice(1);
  const num = parseInt(norm, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

/**
 * Converts an [r, g, b] tuple to #rrggbb hex.
 * @param {number} r
 * @param {number} g
 * @param {number} b
 * @returns {string}
 */
export function rgbToHex(r, g, b) {
  const clamp = (v) => Math.round(Math.max(0, Math.min(255, Number(v) || 0)));
  const toHex = (v) => {
    const s = clamp(v).toString(16);
    return s.length === 1 ? `0${s}` : s;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Converts an [r, g, b] tuple to [h (0-360), s (0-100), l (0-100)].
 * @param {number} r
 * @param {number} g
 * @param {number} b
 * @returns {[number, number, number]}
 */
export function rgbToHsl(r, g, b) {
  const rn = Math.max(0, Math.min(255, r)) / 255;
  const gn = Math.max(0, Math.min(255, g)) / 255;
  const bn = Math.max(0, Math.min(255, b)) / 255;

  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rn:
        h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6;
        break;
      case gn:
        h = ((bn - rn) / d + 2) / 6;
        break;
      case bn:
        h = ((rn - gn) / d + 4) / 6;
        break;
    }
  }

  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

/**
 * Converts [h (0-360), s (0-100), l (0-100)] to [r, g, b].
 * @param {number} h
 * @param {number} s
 * @param {number} l
 * @returns {[number, number, number]}
 */
export function hslToRgb(h, s, l) {
  const hn = ((h % 360) + 360) % 360;
  const sn = Math.max(0, Math.min(100, s)) / 100;
  const ln = Math.max(0, Math.min(100, l)) / 100;

  const c = (1 - Math.abs(2 * ln - 1)) * sn;
  const x = c * (1 - Math.abs(((hn / 60) % 2) - 1));
  const m = ln - c / 2;

  let r = 0;
  let g = 0;
  let b = 0;

  if (hn < 60) {
    r = c; g = x;
  } else if (hn < 120) {
    r = x; g = c;
  } else if (hn < 180) {
    g = c; b = x;
  } else if (hn < 240) {
    g = x; b = c;
  } else if (hn < 300) {
    r = x; b = c;
  } else {
    r = c; b = x;
  }

  return [
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((b + m) * 255),
  ];
}

/**
 * Converts [h, s, l] directly to #rrggbb hex.
 * @param {number} h
 * @param {number} s
 * @param {number} l
 * @returns {string}
 */
export function hslToHex(h, s, l) {
  const [r, g, b] = hslToRgb(h, s, l);
  return rgbToHex(r, g, b);
}

/**
 * Computes WCAG relative luminance (0.0 - 1.0).
 * @param {string} hex
 * @returns {number}
 */
export function getLuminance(hex) {
  const [r, g, b] = hexToRgb(hex).map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Computes WCAG contrast ratio between two colors (1.0 to 21.0).
 * @param {string} fg
 * @param {string} bg
 * @returns {number}
 */
export function getContrastRatio(fg, bg) {
  const l1 = getLuminance(fg);
  const l2 = getLuminance(bg);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return Number(((lighter + 0.05) / (darker + 0.05)).toFixed(2));
}

/**
 * Adjusts lightness until a minimum contrast ratio is achieved against all backgrounds.
 * For dark text on light backgrounds (moves lightness downwards).
 * @param {number} h
 * @param {number} s
 * @param {number} initialL
 * @param {number} minRatio
 * @param {...string} bgHexes
 * @returns {string}
 */
export function ensureDarkContrastRatio(h, s, initialL, minRatio, ...bgHexes) {
  let l = initialL;
  let hex = hslToHex(h, s, l);
  const passes = (color) => bgHexes.every((bg) => getContrastRatio(color, bg) >= minRatio);
  while (!passes(hex) && l > 5) {
    l -= 1;
    hex = hslToHex(h, s, l);
  }
  return hex;
}

/**
 * Adjusts lightness until a minimum contrast ratio is achieved against all backgrounds.
 * For light text/accents on dark backgrounds (moves lightness upwards).
 * @param {number} h
 * @param {number} s
 * @param {number} initialL
 * @param {number} minRatio
 * @param {...string} bgHexes
 * @returns {string}
 */
export function ensureLightContrastRatio(h, s, initialL, minRatio, ...bgHexes) {
  let l = initialL;
  let hex = hslToHex(h, s, l);
  const passes = (color) => bgHexes.every((bg) => getContrastRatio(color, bg) >= minRatio);
  while (!passes(hex) && l < 98) {
    l += 1;
    hex = hslToHex(h, s, l);
  }
  return hex;
}

/**
 * Backwards compatible helper.
 */
function ensureContrastRatio(h, s, initialL, minRatio, ...bgHexes) {
  return ensureDarkContrastRatio(h, s, initialL, minRatio, ...bgHexes);
}

/**
 * Generates complete design tokens from a 3-colour palette.
 * Supports both Light and Dark themes based on palette luminance or explicit options.
 * Includes base palette, ambient surfaces, typography, actions, inputs, and dedicated high-contrast navigation tokens.
 * @param {string|object} primaryOrPalette
 * @param {string} [secondaryArg]
 * @param {string} [tertiaryArg]
 * @param {object} [options]
 * @returns {object} Object with theme design tokens
 */
export function generateTokensFromPalette(primaryOrPalette, secondaryArg, tertiaryArg, options = {}) {
  let primary;
  let secondary;
  let tertiary;
  let explicitKind = null;

  if (primaryOrPalette && typeof primaryOrPalette === 'object') {
    primary = primaryOrPalette.primary || primaryOrPalette.p;
    secondary = primaryOrPalette.secondary || primaryOrPalette.s;
    tertiary = primaryOrPalette.tertiary || primaryOrPalette.t;
    explicitKind = primaryOrPalette.kind || primaryOrPalette.category;
  } else {
    primary = primaryOrPalette;
    secondary = secondaryArg;
    tertiary = tertiaryArg;
    explicitKind = options?.kind || options?.category;
  }

  const p = normalizeHex(primary, '#1a73e8');
  const s = normalizeHex(secondary, '#dbe4ee');
  const t = normalizeHex(tertiary, '#0d65d9');

  const [hp, sp, lp] = rgbToHsl(...hexToRgb(p));
  const [hs, ss, ls] = rgbToHsl(...hexToRgb(s));
  const [ht, st, lt] = rgbToHsl(...hexToRgb(t));

  // Determine if this palette should generate a Dark Theme:
  // Explicit kind takes priority, otherwise if secondary luminance is dark (< 0.35)
  const isDark = explicitKind === 'dark' || (explicitKind !== 'light' && getLuminance(s) < 0.35);

  if (isDark) {
    // ========================================================
    // DARK THEME GENERATION (Obsidian & Dark Custom Palettes)
    // Deep charcoal backgrounds, dark graphite surfaces, muted teal/cyan accents,
    // subtle borders, clear typography with comfortable WCAG AAA contrast.
    // ========================================================

    // 1. Ambient Backgrounds and Surfaces
    // If primary is deep charcoal (like Obsidian #11151D), use p, otherwise derive deep charcoal from secondary hue
    const pageBg = getLuminance(p) < 0.05 ? p : hslToHex(hs, Math.min(ss, 25), 8.8);
    const headerBg = hslToHex(hs, Math.min(ss, 22), 11.5);
    const contentBg = hslToHex(hs, Math.min(ss, 20), 14.0);
    const surface1 = hslToHex(hs, Math.min(ss, 22), 17.5);
    const surface2 = hslToHex(hs, Math.min(ss, 24), 21.0);
    const tableHeaderBg = hslToHex(hs, Math.min(ss, 22), 16.5);
    const tableRowBg = contentBg;
    const tableRowAltBg = hslToHex(hs, Math.min(ss, 20), 11.5);
    const codeBg = hslToHex(hs, Math.min(ss, 20), 10.5);
    const border = hslToHex(hs, Math.min(ss, 18), 24.0);

    // 2. Typography (Clear, readable off-white, contrast >= 12:1 against page and content)
    const text = hslToHex(hs, Math.min(ss, 15), 93.0);
    const textMuted = hslToHex(hs, Math.min(ss, 15), 60.0);

    // 3. Buttons & Actions
    // In dark themes, buttons use high-contrast accent (tertiary or bright primary)
    let buttonBg;
    let buttonText;
    const canUseTertiary = getContrastRatio(t, pageBg) >= 4.0;
    const canUsePrimary = getContrastRatio(p, pageBg) >= 4.0;

    if (canUseTertiary) {
      buttonBg = t;
      buttonText = getContrastRatio('#0d1e1a', buttonBg) >= 4.5 ? '#0d1e1a' : '#ffffff';
    } else if (canUsePrimary) {
      buttonBg = p;
      buttonText = getContrastRatio('#0d1e1a', buttonBg) >= 4.5 ? '#0d1e1a' : '#ffffff';
    } else {
      buttonBg = ensureLightContrastRatio(ht, Math.max(st, 50), 50, 4.5, pageBg, contentBg);
      buttonText = getContrastRatio('#0d1e1a', buttonBg) >= 4.5 ? '#0d1e1a' : '#ffffff';
    }

    const [bH, bS, bL] = rgbToHsl(...hexToRgb(buttonBg));
    const buttonHoverBg = bL > 50
      ? hslToHex(bH, bS, Math.max(10, bL - 8))
      : hslToHex(bH, bS, Math.min(90, bL + 8));

    // 4. Links & Accents (Derived from Tertiary or lightened to guarantee >= 4.5:1 against dark surfaces)
    const link = (canUseTertiary && getContrastRatio(t, contentBg) >= 4.5 && getContrastRatio(t, surface1) >= 4.5)
      ? t
      : ensureLightContrastRatio(ht, Math.max(st, 40), Math.max(lt, 45), 4.5, pageBg, contentBg, surface1);
    const [lH, lS, lL] = rgbToHsl(...hexToRgb(link));
    const linkHover = hslToHex(lH, lS, Math.min(92, lL + 12));

    // 5. Inputs & Focus
    const accent = link;
    const focus = link;
    const inputBg = hslToHex(hs, Math.min(ss, 20), 10.0);
    const inputText = text;
    const inputBorder = hslToHex(hs, Math.min(ss, 20), 25.0);

    // 6. Navigation & Header Tokens
    const navBg = headerBg;
    const navText = ensureLightContrastRatio(hs, Math.min(ss, 15), 92.0, 7.0, navBg);
    const navHoverBg = surface1;
    const navHoverText = ensureLightContrastRatio(ht, Math.max(st, 40), 55.0, 4.5, navHoverBg);

    const navActiveBg = buttonBg;
    const navActiveText = buttonText;
    const [naH, naS, naL] = rgbToHsl(...hexToRgb(navActiveBg));
    const navActiveHoverBg = naL > 50
      ? hslToHex(naH, naS, Math.max(10, naL - 6))
      : hslToHex(naH, naS, Math.min(90, naL + 6));
    const navBorder = border;

    // Secondary Navigation Tokens
    const subnavBg = surface1;
    const subnavText = ensureLightContrastRatio(hs, Math.min(ss, 15), 92.0, 7.0, subnavBg);
    const subnavHoverBg = surface2;
    const subnavHoverText = getContrastRatio(navHoverText, subnavHoverBg) >= 4.5
      ? navHoverText
      : ensureLightContrastRatio(ht, Math.max(st, 40), 65.0, 4.5, subnavHoverBg);
    const subnavActiveBg = navActiveBg;
    const subnavActiveText = navActiveText;
    const subnavActiveHoverBg = navActiveHoverBg;

    return {
      'page-bg': pageBg,
      'header-bg': headerBg,
      'content-bg': contentBg,
      'surface-1': surface1,
      'surface-2': surface2,
      'table-header-bg': tableHeaderBg,
      'table-row-bg': tableRowBg,
      'table-row-alt-bg': tableRowAltBg,
      'text': text,
      'text-muted': textMuted,
      'link': link,
      'link-hover': linkHover,
      'border': border,
      'input-bg': inputBg,
      'input-text': inputText,
      'input-border': inputBorder,
      'button-bg': buttonBg,
      'button-text': buttonText,
      'button-hover-bg': buttonHoverBg,
      'focus': focus,
      'code-bg': codeBg,
      'accent': accent,
      'nav-bg': navBg,
      'nav-text': navText,
      'nav-hover-bg': navHoverBg,
      'nav-hover-text': navHoverText,
      'nav-active-bg': navActiveBg,
      'nav-active-text': navActiveText,
      'nav-active-hover-bg': navActiveHoverBg,
      'nav-border': navBorder,
      'subnav-bg': subnavBg,
      'subnav-text': subnavText,
      'subnav-hover-bg': subnavHoverBg,
      'subnav-hover-text': subnavHoverText,
      'subnav-active-bg': subnavActiveBg,
      'subnav-active-text': subnavActiveText,
      'subnav-active-hover-bg': subnavActiveHoverBg,
    };
  }

  // 1. Ambient Background and Surfaces (derived from Secondary)
  // page-bg: Soft pastel tint, L: 95.8% guarantees luminance >= 0.85 (absolute light policy)
  const pageBg = hslToHex(hs, Math.min(ss, 45) * 0.75, 95.8);
  // header-bg: Elevated navbar tint
  const headerBg = hslToHex(hs, Math.min(ss, 35) * 0.6, 97.0);
  // content-bg: Theme-aware delicate surface tint (ivory-green for Botanical, pale rose for Rose, pale lavender for Lavender)
  const contentBg = hslToHex(hs, Math.min(ss, 35) * 0.55, 97.6);
  // surface-1: Distinct tinted panel surface (sideboxes, roundbox captions, contest panels, dialogs)
  const surface1 = hslToHex(hs, Math.min(ss, 45) * 0.8, 93.0);
  // surface-2: Secondary nested panels, active table filters, chip backgrounds
  const surface2 = hslToHex(hs, Math.min(ss, 45) * 0.85, 88.5);
  // table-header-bg: Clear tinted header for datatable, problems, and standings
  const tableHeaderBg = hslToHex(hs, Math.min(ss, 48) * 0.85, 91.5);
  // table-row-bg: Theme-aware light table row surface
  const tableRowBg = hslToHex(hs, Math.min(ss, 32) * 0.5, 98.0);
  // table-row-alt-bg: Subtle tinted alternate table rows
  const tableRowAltBg = hslToHex(hs, Math.min(ss, 40) * 0.7, 95.2);
  // code-bg: Dedicated calm code block surface
  const codeBg = hslToHex(hs, Math.min(ss, 35) * 0.65, 93.8);
  // border: Harmonious, defined border
  const border = hslToHex(hs, Math.min(ss, 40) * 0.8, 81.5);

  // 2. Typography (derived from Secondary hue family for harmony, deeply dark for AAA contrast)
  const text = hslToHex(hs, Math.min(ss, 20), 11.5);
  const textMuted = hslToHex(hs, Math.min(ss, 18), 38.0);

  // 3. Buttons & Actions (derived from Primary, guaranteed >= 4.5:1 against #ffffff)
  const buttonBg = ensureContrastRatio(hp, Math.max(sp, 35), Math.min(lp, 44), 4.5, '#ffffff');
  const [bH, bS, bL] = rgbToHsl(...hexToRgb(buttonBg));
  const buttonHoverBg = hslToHex(bH, bS, Math.max(8, bL - 6));
  const buttonText = '#ffffff';

  // 4. Links & Accents (derived from Tertiary, guaranteed >= 4.5:1 against light surfaces)
  const link = ensureContrastRatio(ht, Math.max(st, 40), Math.min(lt, 44), 4.5, pageBg, contentBg, surface1);
  const [lH, lS, lL] = rgbToHsl(...hexToRgb(link));
  const linkHover = hslToHex(lH, lS, Math.max(8, lL - 7));

  // 5. Inputs & Focus
  const accent = p;
  const focus = p;
  const inputBg = hslToHex(hs, Math.min(ss, 28) * 0.45, 98.4);
  const inputText = text;
  const inputBorder = hslToHex(hs, Math.min(ss, 40) * 0.8, 76.0);

  // 6. Navigation & Header Tokens (Theme-aware, WCAG AA/AAA contrast >= 4.5:1 guaranteed)
  const navBg = headerBg;
  const navText = ensureContrastRatio(hs, Math.min(ss, 20), 12.0, 7.0, navBg);
  const navHoverBg = hslToHex(hs, Math.min(ss, 35) * 0.7, 91.0);
  const navHoverText = ensureContrastRatio(hp, Math.max(sp, 30), 18.0, 4.5, navHoverBg);
  const navActiveBg = buttonBg;
  let activeText = '#ffffff';
  if (getContrastRatio(activeText, navActiveBg) < 4.5) {
    const darkCandidate = ensureContrastRatio(hp, 20, 10, 4.5, navActiveBg);
    if (getContrastRatio(darkCandidate, navActiveBg) >= 4.5) {
      activeText = darkCandidate;
    }
  }
  const navActiveText = activeText;
  const [naH, naS, naL] = rgbToHsl(...hexToRgb(navActiveBg));
  const navActiveHoverBg = hslToHex(naH, naS, Math.max(8, naL - 6));
  const navBorder = border;

  // Secondary Navigation Tokens
  const subnavBg = surface1;
  const subnavText = ensureContrastRatio(hs, Math.min(ss, 20), 12.0, 7.0, subnavBg);
  const subnavHoverBg = surface2;
  const subnavHoverText = getContrastRatio(navHoverText, subnavHoverBg) >= 4.5
    ? navHoverText
    : ensureContrastRatio(hp, Math.max(sp, 30), 18.0, 4.5, subnavHoverBg);
  const subnavActiveBg = navActiveBg;
  const subnavActiveText = navActiveText;
  const subnavActiveHoverBg = navActiveHoverBg;

  return {
    'page-bg': pageBg,
    'header-bg': headerBg,
    'content-bg': contentBg,
    'surface-1': surface1,
    'surface-2': surface2,
    'table-header-bg': tableHeaderBg,
    'table-row-bg': tableRowBg,
    'table-row-alt-bg': tableRowAltBg,
    'text': text,
    'text-muted': textMuted,
    'link': link,
    'link-hover': linkHover,
    'border': border,
    'input-bg': inputBg,
    'input-text': inputText,
    'input-border': inputBorder,
    'button-bg': buttonBg,
    'button-text': buttonText,
    'button-hover-bg': buttonHoverBg,
    'focus': focus,
    'code-bg': codeBg,
    'accent': accent,
    'nav-bg': navBg,
    'nav-text': navText,
    'nav-hover-bg': navHoverBg,
    'nav-hover-text': navHoverText,
    'nav-active-bg': navActiveBg,
    'nav-active-text': navActiveText,
    'nav-active-hover-bg': navActiveHoverBg,
    'nav-border': navBorder,
    'subnav-bg': subnavBg,
    'subnav-text': subnavText,
    'subnav-hover-bg': subnavHoverBg,
    'subnav-hover-text': subnavHoverText,
    'subnav-active-bg': subnavActiveBg,
    'subnav-active-text': subnavActiveText,
    'subnav-active-hover-bg': subnavActiveHoverBg,
  };
}

/**
 * Builds a complete Theme definition object from metadata and a 3-colour palette.
 * @param {object} options
 * @param {string} options.id
 * @param {string} options.name
 * @param {string} [options.category='standard']
 * @param {string} [options.description='']
 * @param {string} options.primary
 * @param {string} options.secondary
 * @param {string} options.tertiary
 * @param {boolean} [options.builtin=false]
 * @param {boolean} [options.animated=false]
 * @returns {object}
 */
export function generateThemeFromPalette({
  id,
  name,
  category,
  kind,
  description = '',
  primary,
  secondary,
  tertiary,
  builtin = false,
  animated = false,
  artwork = null,
  animationEffect = null,
}) {
  const p = normalizeHex(primary, '#1a73e8');
  const s = normalizeHex(secondary, '#dbe4ee');
  const t = normalizeHex(tertiary, '#0d65d9');

  const themeKind = kind || (getLuminance(s) < 0.35 ? 'dark' : 'light');
  const themeCategory = category || (themeKind === 'dark' ? 'dark' : 'standard');

  const tokens = generateTokensFromPalette(p, s, t, { kind: themeKind });

  const themeObj = {
    id: String(id),
    name: String(name),
    kind: themeKind,
    category: themeCategory,
    description: String(description),
    builtin: Boolean(builtin),
    ...(animated ? { animated: true } : {}),
    ...(artwork ? { artwork: String(artwork) } : {}),
    ...(animationEffect ? { animationEffect: String(animationEffect) } : {}),
    palette: Object.freeze({
      primary: p,
      secondary: s,
      tertiary: t,
    }),
    tokens: Object.freeze(tokens),
  };

  return builtin ? Object.freeze(themeObj) : themeObj;
}

export const DEFAULT_CUSTOM_PALETTE = Object.freeze({
  primary: '#1a73e8',
  secondary: '#dbe4ee',
  tertiary: '#0d65d9',
});

/**
 * Creates or retrieves the Custom Theme definition from customThemes array or fallback palette.
 * @param {Array<object>} [customThemes]
 * @param {object} [fallbackPalette]
 * @returns {object}
 */
export function getCustomTheme(customThemes = [], fallbackPalette = DEFAULT_CUSTOM_PALETTE) {
  if (Array.isArray(customThemes)) {
    const existing = customThemes.find((t) => t && t.id === 'custom');
    if (existing && existing.palette && existing.tokens) {
      return existing;
    }
  }
  return generateThemeFromPalette({
    id: 'custom',
    name: 'Custom Theme',
    category: 'standard',
    primary: fallbackPalette.primary || '#1a73e8',
    secondary: fallbackPalette.secondary || '#dbe4ee',
    tertiary: fallbackPalette.tertiary || '#0d65d9',
    builtin: false,
  });
}
