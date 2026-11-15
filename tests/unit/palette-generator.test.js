import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeHex,
  hexToRgb,
  rgbToHex,
  rgbToHsl,
  hslToRgb,
  hslToHex,
  getLuminance,
  getContrastRatio,
  generateTokensFromPalette,
  generateThemeFromPalette,
} from '../../src/themes/palette-generator.js';

test('palette-generator: normalizeHex handles 3-digit, 6-digit, case, and fallback', () => {
  assert.equal(normalizeHex('#fff'), '#ffffff');
  assert.equal(normalizeHex('#1A73E8'), '#1a73e8');
  assert.equal(normalizeHex('1a73e8'), '#1a73e8');
  assert.equal(normalizeHex('abc'), '#aabbcc');
  assert.equal(normalizeHex('invalid', '#123456'), '#123456');
  assert.equal(normalizeHex(null, '#abcdef'), '#abcdef');
});

test('palette-generator: color conversions round-trip accurately', () => {
  const hex = '#1a73e8';
  const rgb = hexToRgb(hex);
  assert.deepEqual(rgb, [26, 115, 232]);
  assert.equal(rgbToHex(...rgb), hex);

  const [h, s, l] = rgbToHsl(...rgb);
  const rgbFromHsl = hslToRgb(h, s, l);
  // within 1 unit due to rounding
  assert.ok(Math.abs(rgbFromHsl[0] - rgb[0]) <= 2);
  assert.ok(Math.abs(rgbFromHsl[1] - rgb[1]) <= 2);
  assert.ok(Math.abs(rgbFromHsl[2] - rgb[2]) <= 2);
});

test('palette-generator: WCAG calculations match specification', () => {
  assert.equal(getContrastRatio('#000000', '#ffffff'), 21);
  assert.equal(getContrastRatio('#ffffff', '#ffffff'), 1);
  assert.ok(getLuminance('#ffffff') >= 0.99);
  assert.ok(getLuminance('#000000') <= 0.01);
});

test('palette-generator: generateTokensFromPalette produces complete design tokens', () => {
  const tokens = generateTokensFromPalette('#1a73e8', '#dbe4ee', '#0d65d9');
  const expectedKeys = [
    'page-bg', 'header-bg', 'content-bg', 'surface-1', 'surface-2',
    'table-header-bg', 'table-row-bg', 'table-row-alt-bg', 'text',
    'text-muted', 'link', 'link-hover', 'border', 'input-bg',
    'input-text', 'input-border', 'button-bg', 'button-text',
    'button-hover-bg', 'focus', 'code-bg', 'accent',
    'nav-bg', 'nav-text', 'nav-hover-bg', 'nav-hover-text',
    'nav-active-bg', 'nav-active-text', 'nav-active-hover-bg', 'nav-border',
    'subnav-bg', 'subnav-text', 'subnav-hover-bg', 'subnav-hover-text',
    'subnav-active-bg', 'subnav-active-text', 'subnav-active-hover-bg',
  ];

  assert.equal(Object.keys(tokens).length, 37);
  for (const k of expectedKeys) {
    assert.ok(tokens[k], `Missing token ${k}`);
    assert.match(tokens[k], /^#[0-9a-f]{6}$/);
  }
});

test('palette-generator: light palettes generate accessible light themes', () => {
  const lightInputs = [
    { p: '#1a73e8', s: '#dbe4ee', t: '#0d65d9' },
    { p: '#ffffff', s: '#ffffff', t: '#ffffff' }, // extreme light input
    { p: '#ff0000', s: '#dbe4ee', t: '#0000ff' },
    { p: '#ffff00', s: '#e0f2fe', t: '#ff00ff' },
  ];

  for (const inp of lightInputs) {
    const tokens = generateTokensFromPalette(inp.p, inp.s, inp.t);
    const pageLum = getLuminance(tokens['page-bg']);
    assert.ok(
      pageLum >= 0.5,
      `page-bg luminance ${pageLum} failed >= 0.5 for light input ${JSON.stringify(inp)}`
    );

    // Button contrast >= 4.5:1
    const btnRatio = getContrastRatio(tokens['button-text'], tokens['button-bg']);
    assert.ok(
      btnRatio >= 4.5,
      `button ratio ${btnRatio} failed for input ${JSON.stringify(inp)}`
    );

    // Text contrast >= 4.5:1
    const textRatio = getContrastRatio(tokens['text'], tokens['page-bg']);
    assert.ok(
      textRatio >= 4.5,
      `text ratio ${textRatio} failed for input ${JSON.stringify(inp)}`
    );

    // Link contrast >= 4.5:1
    const linkRatio = getContrastRatio(tokens['link'], tokens['page-bg']);
    assert.ok(
      linkRatio >= 4.5,
      `link ratio ${linkRatio} failed for input ${JSON.stringify(inp)}`
    );
  }
});

test('palette-generator: dark palettes generate balanced accessible dark themes', () => {
  const darkInputs = [
    { p: '#11151D', s: '#202630', t: '#35C6B0' }, // Obsidian palette
    { p: '#0f172a', s: '#1e293b', t: '#38bdf8' }, // Dark slate
    { p: '#000000', s: '#000000', t: '#000000' }, // Extreme dark
  ];

  for (const inp of darkInputs) {
    const tokens = generateTokensFromPalette(inp.p, inp.s, inp.t);
    const pageLum = getLuminance(tokens['page-bg']);
    assert.ok(
      pageLum < 0.25,
      `page-bg luminance ${pageLum} expected dark (< 0.25) for input ${JSON.stringify(inp)}`
    );

    // Button contrast >= 4.5:1
    const btnRatio = getContrastRatio(tokens['button-text'], tokens['button-bg']);
    assert.ok(
      btnRatio >= 4.5,
      `button ratio ${btnRatio} failed for dark input ${JSON.stringify(inp)}`
    );

    // Text contrast >= 4.5:1 on dark surfaces
    const textRatio = getContrastRatio(tokens['text'], tokens['page-bg']);
    assert.ok(
      textRatio >= 4.5,
      `text ratio ${textRatio} failed for dark input ${JSON.stringify(inp)}`
    );

    const contentRatio = getContrastRatio(tokens['text'], tokens['content-bg']);
    assert.ok(
      contentRatio >= 4.5,
      `content text ratio ${contentRatio} failed for dark input ${JSON.stringify(inp)}`
    );

    // Link contrast >= 4.5:1 on dark surfaces
    const linkRatio = getContrastRatio(tokens['link'], tokens['page-bg']);
    assert.ok(
      linkRatio >= 4.5,
      `link ratio ${linkRatio} failed for dark input ${JSON.stringify(inp)}`
    );
  }
});

test('palette-generator: generateThemeFromPalette returns valid frozen theme', () => {
  const theme = generateThemeFromPalette({
    id: 'test-custom',
    name: 'Test Custom',
    category: 'standard',
    description: 'Custom test palette',
    primary: '#1a73e8',
    secondary: '#dbe4ee',
    tertiary: '#0d65d9',
    builtin: true,
  });

  assert.equal(theme.id, 'test-custom');
  assert.equal(theme.name, 'Test Custom');
  assert.equal(theme.builtin, true);
  assert.ok(theme.palette);
  assert.equal(theme.palette.primary, '#1a73e8');
  assert.equal(theme.palette.secondary, '#dbe4ee');
  assert.equal(theme.palette.tertiary, '#0d65d9');
  assert.ok(Object.isFrozen(theme));
  assert.ok(Object.isFrozen(theme.tokens));
  assert.ok(Object.isFrozen(theme.palette));
});
