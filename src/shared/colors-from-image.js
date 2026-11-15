/**
 * CF Studio - Colors from Image
 * Extracts a palette from image pixel data and generates an accessible theme.
 * All text colors are adjusted to WCAG contrast ratio >= 4.5:1.
 */

import { getContrastRatio, hexToRgb } from './contrast.js';

function rgbToHex(r, g, b) {
  const clamp = (val) => Math.max(0, Math.min(255, Math.round(val)));
  return '#' + [clamp(r), clamp(g), clamp(b)].map((c) => c.toString(16).padStart(2, '0')).join('');
}

function rgbToHsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  return [h * 360, s, l];
}

function hslToRgb(h, s, l) {
  h /= 360;
  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

function hslToHex(h, s, l) {
  const [r, g, b] = hslToRgb(h, s, l);
  return rgbToHex(r, g, b);
}

/**
 * Adjusts text lightness until it meets target contrast against background.
 */
function ensureContrast(textHex, bgHex, targetRatio = 4.5, preferLight = true) {
  if (getContrastRatio(textHex, bgHex) >= targetRatio) {
    return textHex;
  }

  const [r, g, b] = hexToRgb(textHex);
  let [h, s, l] = rgbToHsl(r, g, b);

  // Try tinting in preferred direction first
  const step = preferLight ? 0.04 : -0.04;
  for (let i = 0; i < 25; i++) {
    l = Math.max(0.02, Math.min(0.98, l + step));
    const testHex = hslToHex(h, s, l);
    if (getContrastRatio(testHex, bgHex) >= targetRatio) {
      return testHex;
    }
  }

  // If preferred direction didn't meet target, check white and black
  const whiteRatio = getContrastRatio('#ffffff', bgHex);
  const blackRatio = getContrastRatio('#000000', bgHex);

  if (preferLight && whiteRatio >= targetRatio) return '#ffffff';
  if (!preferLight && blackRatio >= targetRatio) return '#000000';

  if (whiteRatio >= targetRatio) return '#ffffff';
  if (blackRatio >= targetRatio) return '#000000';

  return whiteRatio >= blackRatio ? '#ffffff' : '#000000';
}

/**
 * Extracts a palette and builds a theme from RGBA pixel array.
 * @param {Uint8ClampedArray|number[]} pixels RGBA format
 * @param {number} width
 * @param {number} height
 * @param {'dark'|'light'} [mode='dark']
 * @returns {{ success: boolean, theme?: object, error?: string }}
 */
export function generateThemeFromPixels(pixels, width, height, mode = 'dark') {
  if (!pixels || pixels.length < 16) {
    return { success: false, error: 'This file is not an image.' };
  }

  const totalPixels = Math.floor(pixels.length / 4);
  let sumL = 0;
  let sumSqL = 0;
  const samples = [];
  const step = Math.max(1, Math.floor(totalPixels / 256));

  for (let i = 0; i < totalPixels; i += step) {
    const idx = i * 4;
    const r = pixels[idx];
    const g = pixels[idx + 1];
    const b = pixels[idx + 2];
    const a = pixels[idx + 3];

    if (a < 128) continue; // Skip mostly transparent pixels

    const [h, s, l] = rgbToHsl(r, g, b);
    sumL += l;
    sumSqL += l * l;
    samples.push({ r, g, b, h, s, l });
  }

  if (samples.length === 0) {
    return { success: false, error: 'This file is not an image.' };
  }

  // Variance check: detects completely flat/monochrome images
  const meanL = sumL / samples.length;
  const varianceL = sumSqL / samples.length - meanL * meanL;
  if (varianceL < 0.0005 && samples.length > 50) {
    return { success: false, error: 'Image is too plain to create a theme.' };
  }

  // Find most saturated color for accent
  samples.sort((a, b) => b.s - a.s);
  const vibrantSample = samples[0] || { h: 220, s: 0.7, l: 0.5 };
  const baseHue = vibrantSample.h;

  let pageBg, headerBg, contentBg, surface1, surface2;
  let tableHeaderBg, tableRowBg, tableRowAltBg, border;
  let inputBg, inputBorder, buttonBg, buttonHoverBg, focus, codeBg, accent;
  let text, textMuted, link, linkHover, buttonText, inputText;

  if (mode === 'dark') {
    pageBg = hslToHex(baseHue, 0.25, 0.08);
    headerBg = hslToHex(baseHue, 0.22, 0.12);
    contentBg = hslToHex(baseHue, 0.20, 0.14);
    surface1 = hslToHex(baseHue, 0.18, 0.18);
    surface2 = hslToHex(baseHue, 0.18, 0.22);
    tableHeaderBg = hslToHex(baseHue, 0.20, 0.24);
    tableRowBg = contentBg;
    tableRowAltBg = hslToHex(baseHue, 0.18, 0.16);
    border = hslToHex(baseHue, 0.20, 0.28);
    inputBg = hslToHex(baseHue, 0.25, 0.09);
    inputBorder = hslToHex(baseHue, 0.22, 0.32);
    accent = hslToHex(baseHue, Math.max(0.6, vibrantSample.s), 0.55);
    buttonBg = accent;
    buttonHoverBg = hslToHex(baseHue, Math.max(0.6, vibrantSample.s), 0.45);
    focus = hslToHex(baseHue, 0.9, 0.65);
    codeBg = inputBg;

    text = '#e6e9f2';
    textMuted = '#9aa3bd';
    link = hslToHex(baseHue, 0.8, 0.72);
    linkHover = hslToHex(baseHue, 0.85, 0.82);
    buttonText = '#ffffff';
    inputText = '#e6e9f2';

    // Ensure contrast
    text = ensureContrast(text, contentBg, 4.5, true);
    text = ensureContrast(text, pageBg, 4.5, true);
    inputText = ensureContrast(inputText, inputBg, 4.5, true);
    buttonText = ensureContrast(buttonText, buttonBg, 4.5, true);
    link = ensureContrast(link, contentBg, 4.5, true);
  } else {
    pageBg = hslToHex(baseHue, 0.15, 0.94);
    headerBg = hslToHex(baseHue, 0.15, 0.88);
    contentBg = '#ffffff';
    surface1 = hslToHex(baseHue, 0.12, 0.96);
    surface2 = hslToHex(baseHue, 0.15, 0.90);
    tableHeaderBg = hslToHex(baseHue, 0.15, 0.88);
    tableRowBg = '#ffffff';
    tableRowAltBg = hslToHex(baseHue, 0.10, 0.96);
    border = hslToHex(baseHue, 0.15, 0.78);
    inputBg = '#ffffff';
    inputBorder = hslToHex(baseHue, 0.15, 0.72);
    accent = hslToHex(baseHue, Math.max(0.6, vibrantSample.s), 0.38);
    buttonBg = accent;
    buttonHoverBg = hslToHex(baseHue, Math.max(0.6, vibrantSample.s), 0.30);
    focus = accent;
    codeBg = hslToHex(baseHue, 0.10, 0.94);

    text = '#1d232b';
    textMuted = '#5c6773';
    link = hslToHex(baseHue, 0.8, 0.34);
    linkHover = hslToHex(baseHue, 0.85, 0.24);
    buttonText = '#ffffff';
    inputText = '#1d232b';

    text = ensureContrast(text, contentBg, 4.5, false);
    text = ensureContrast(text, pageBg, 4.5, false);
    inputText = ensureContrast(inputText, inputBg, 4.5, false);
    buttonText = ensureContrast(buttonText, buttonBg, 4.5, true);
    link = ensureContrast(link, contentBg, 4.5, false);
  }

  const theme = {
    id: 'from-image',
    name: 'From image',
    kind: mode,
    builtin: false,
    tokens: {
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
    },
  };

  return { success: true, theme };
}
