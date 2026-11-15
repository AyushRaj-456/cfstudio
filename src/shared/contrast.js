/**
 * CF Studio - Contrast Calculations (WCAG 2.1)
 * Computes relative luminance and contrast ratios.
 */

/**
 * Parses a hex color string into [r, g, b] in range 0-255.
 * @param {string} hex
 * @returns {[number, number, number]}
 */
export function hexToRgb(hex) {
  if (typeof hex !== 'string') return [0, 0, 0];
  let h = hex.trim().replace(/^#/, '');

  if (h.length === 3) {
    h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  }

  if (h.length !== 6) return [0, 0, 0];

  const num = parseInt(h, 16);
  if (Number.isNaN(num)) return [0, 0, 0];

  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

/**
 * Calculates WCAG 2.1 relative luminance for an sRGB component.
 * @param {number} c 0-255
 * @returns {number}
 */
function sRgbToLinear(c) {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}

/**
 * Returns relative luminance of an [r, g, b] color (0.0 to 1.0).
 * @param {number} r
 * @param {number} g
 * @param {number} b
 * @returns {number}
 */
export function getLuminance(r, g, b) {
  if (typeof r === 'string') {
    [r, g, b] = hexToRgb(r);
  } else if (Array.isArray(r)) {
    [r, g, b] = r;
  }
  return (
    0.2126 * sRgbToLinear(r) +
    0.7152 * sRgbToLinear(g) +
    0.0722 * sRgbToLinear(b)
  );
}

/**
 * Calculates WCAG contrast ratio between two hex colors.
 * Result is in range 1.0 to 21.0.
 * @param {string} hex1
 * @param {string} hex2
 * @returns {number}
 */
export function getContrastRatio(hex1, hex2) {
  const [r1, g1, b1] = hexToRgb(hex1);
  const [r2, g2, b2] = hexToRgb(hex2);

  const lum1 = getLuminance(r1, g1, b1);
  const lum2 = getLuminance(r2, g2, b2);

  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);

  const ratio = (lighter + 0.05) / (darker + 0.05);
  return Math.round(ratio * 100) / 100;
}

/**
 * Checks if text color on background color meets minimum contrast ratio.
 * @param {string} textHex
 * @param {string} bgHex
 * @param {number} [minRatio=4.5]
 * @returns {boolean}
 */
export function passesContrast(textHex, bgHex, minRatio = 4.5) {
  return getContrastRatio(textHex, bgHex) >= minRatio;
}
