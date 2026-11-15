import test from 'node:test';
import assert from 'node:assert/strict';
import { hexToRgb, getLuminance, getContrastRatio, passesContrast } from '../../src/shared/contrast.js';
import { BUILTIN_THEMES } from '../../src/themes/builtin.js';

test('contrast: hexToRgb correctly parses 3 and 6 digit hex colors', () => {
  assert.deepEqual(hexToRgb('#ffffff'), [255, 255, 255]);
  assert.deepEqual(hexToRgb('#000000'), [0, 0, 0]);
  assert.deepEqual(hexToRgb('#fff'), [255, 255, 255]);
  assert.deepEqual(hexToRgb('#000'), [0, 0, 0]);
  assert.deepEqual(hexToRgb('#1a73e8'), [26, 115, 232]);
});

test('contrast: getContrastRatio calculates known WCAG ratios', () => {
  // Black and White = 21:1
  const bw = getContrastRatio('#000000', '#ffffff');
  assert.equal(bw, 21);

  // Same color = 1:1
  const same = getContrastRatio('#123456', '#123456');
  assert.equal(same, 1);
});

test('contrast: all 6 built-in themes pass 4.5:1 for text/background pairs', () => {
  for (const theme of BUILTIN_THEMES) {
    const tokens = theme.tokens;

    const pairs = [
      { text: tokens['text'], bg: tokens['page-bg'], name: 'text on page-bg' },
      { text: tokens['text'], bg: tokens['content-bg'], name: 'text on content-bg' },
      { text: tokens['text'], bg: tokens['header-bg'], name: 'text on header-bg' },
      { text: tokens['text'], bg: tokens['surface-1'], name: 'text on surface-1' },
      { text: tokens['text'], bg: tokens['table-header-bg'], name: 'text on table-header-bg' },
      { text: tokens['text'], bg: tokens['table-row-bg'], name: 'text on table-row-bg' },
      { text: tokens['text'], bg: tokens['table-row-alt-bg'], name: 'text on table-row-alt-bg' },
      { text: tokens['input-text'], bg: tokens['input-bg'], name: 'input-text on input-bg' },
      { text: tokens['button-text'], bg: tokens['button-bg'], name: 'button-text on button-bg' },
      { text: tokens['text'], bg: tokens['code-bg'], name: 'text on code-bg' },
    ];

    for (const { text: textColor, bg: bgColor, name } of pairs) {
      const ratio = getContrastRatio(textColor, bgColor);
      assert.ok(
        ratio >= 4.5,
        `Theme "${theme.id}" failed 4.5:1 contrast for ${name} (${textColor} on ${bgColor}): ratio = ${ratio}`
      );
    }
  }
});

test('contrast: all 16 built-in themes enforce accessible >= 4.5:1 contrast across all navigation states', () => {
  assert.equal(BUILTIN_THEMES.length, 16);

  for (const theme of BUILTIN_THEMES) {
    const tokens = theme.tokens;

    const navPairs = [
      { text: tokens['nav-text'], bg: tokens['nav-bg'], name: 'nav-text on nav-bg' },
      { text: tokens['nav-hover-text'], bg: tokens['nav-hover-bg'], name: 'nav-hover-text on nav-hover-bg' },
      { text: tokens['nav-active-text'], bg: tokens['nav-active-bg'], name: 'nav-active-text on nav-active-bg' },
      { text: tokens['subnav-text'], bg: tokens['subnav-bg'], name: 'subnav-text on subnav-bg' },
      { text: tokens['subnav-hover-text'], bg: tokens['subnav-hover-bg'], name: 'subnav-hover-text on subnav-hover-bg' },
      { text: tokens['subnav-active-text'], bg: tokens['subnav-active-bg'], name: 'subnav-active-text on subnav-active-bg' },
    ];

    for (const { text: textColor, bg: bgColor, name } of navPairs) {
      assert.ok(textColor, `Theme ${theme.id} missing color for ${name}`);
      assert.ok(bgColor, `Theme ${theme.id} missing background for ${name}`);
      const ratio = getContrastRatio(textColor, bgColor);
      assert.ok(
        ratio >= 4.5,
        `Theme "${theme.id}" failed accessible 4.5:1 contrast for ${name} (${textColor} on ${bgColor}): ratio = ${ratio}`
      );
    }
  }

  // Explicit Paper Theme Verification (eliminating brown-on-brown)
  const paperTheme = BUILTIN_THEMES.find((t) => t.id === 'paper');
  assert.ok(paperTheme, 'Paper theme must exist');
  const paperActiveRatio = getContrastRatio(paperTheme.tokens['nav-active-text'], paperTheme.tokens['nav-active-bg']);
  assert.ok(paperActiveRatio >= 4.5, `Paper theme active tab contrast was ${paperActiveRatio}, expected >= 4.5`);
  assert.equal(paperTheme.tokens['nav-active-text'], '#ffffff', 'Paper theme active tab uses white high-contrast text');

  const paperNavRatio = getContrastRatio(paperTheme.tokens['nav-text'], paperTheme.tokens['nav-bg']);
  assert.ok(paperNavRatio >= 7.0, `Paper theme nav text contrast was ${paperNavRatio}, expected >= 7.0`);

  // Explicit Obsidian Dark Theme Verification
  const obsidianTheme = BUILTIN_THEMES.find((t) => t.id === 'obsidian');
  assert.ok(obsidianTheme, 'Obsidian theme must exist');
  const obsidianActiveRatio = getContrastRatio(obsidianTheme.tokens['nav-active-text'], obsidianTheme.tokens['nav-active-bg']);
  assert.ok(obsidianActiveRatio >= 4.5, `Obsidian active tab contrast was ${obsidianActiveRatio}, expected >= 4.5`);
  const obsidianNavRatio = getContrastRatio(obsidianTheme.tokens['nav-text'], obsidianTheme.tokens['nav-bg']);
  assert.ok(obsidianNavRatio >= 7.0, `Obsidian nav text contrast was ${obsidianNavRatio}, expected >= 7.0`);
});
