import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getCustomTheme,
  generateThemeFromPalette,
  DEFAULT_CUSTOM_PALETTE,
} from '../../src/themes/palette-generator.js';
import { resolveThemeObject } from '../../src/shared/resolve-settings.js';
import { generateStylesheet, applyTheme, removeTheme } from '../../src/content/style-engine.js';
import { getLuminance, getContrastRatio } from '../../src/shared/contrast.js';
import { MockDocument } from '../helpers/dom-fixture.js';

test('custom theme: getCustomTheme returns default custom theme with 3 foundational colours', () => {
  const theme = getCustomTheme([]);
  assert.equal(theme.id, 'custom');
  assert.equal(theme.name, 'Custom Theme');
  assert.equal(theme.builtin, false);
  assert.equal(theme.palette.primary, DEFAULT_CUSTOM_PALETTE.primary);
  assert.equal(theme.palette.secondary, DEFAULT_CUSTOM_PALETTE.secondary);
  assert.equal(theme.palette.tertiary, DEFAULT_CUSTOM_PALETTE.tertiary);

  // All 37 design tokens generated
  assert.ok(theme.tokens['page-bg']);
  assert.ok(theme.tokens['header-bg']);
  assert.ok(theme.tokens['nav-bg']);
  assert.ok(theme.tokens['content-bg']);
  assert.ok(theme.tokens['table-header-bg']);
  assert.ok(theme.tokens['table-row-bg']);
  assert.ok(theme.tokens['button-bg']);
  assert.ok(theme.tokens['link']);
  assert.ok(theme.tokens['text']);
});

test('custom theme: custom 3-colour palette auto-generates complete cohesive theme', () => {
  // Emerald / Mint / Forest palette
  const p = '#059669';
  const s = '#d1fae5';
  const t = '#047857';

  const customTheme = generateThemeFromPalette({
    id: 'custom',
    name: 'Custom Theme',
    primary: p,
    secondary: s,
    tertiary: t,
    builtin: false,
  });

  assert.equal(customTheme.id, 'custom');
  assert.equal(customTheme.palette.primary, p);
  assert.equal(customTheme.palette.secondary, s);
  assert.equal(customTheme.palette.tertiary, t);

  // Absolute Light-Theme Policy: page luminance >= 0.5
  const pageLum = getLuminance(customTheme.tokens['page-bg']);
  assert.ok(pageLum >= 0.5, `page-bg luminance ${pageLum} failed >= 0.5`);

  // Text contrast >= 4.5:1
  const textContrast = getContrastRatio(customTheme.tokens['text'], customTheme.tokens['page-bg']);
  assert.ok(textContrast >= 4.5, `Text contrast ${textContrast} failed >= 4.5`);

  // Navigation contrast >= 4.5:1
  const navContrast = getContrastRatio(customTheme.tokens['nav-text'], customTheme.tokens['nav-bg']);
  assert.ok(navContrast >= 4.5, `Nav text contrast ${navContrast} failed >= 4.5`);

  // Button contrast >= 4.5:1
  const btnContrast = getContrastRatio(customTheme.tokens['button-text'], customTheme.tokens['button-bg']);
  assert.ok(btnContrast >= 4.5, `Button contrast ${btnContrast} failed >= 4.5`);
});

test('custom theme: resolveThemeObject resolves themeId "custom" from customThemes array', () => {
  const customThemes = [
    generateThemeFromPalette({
      id: 'custom',
      name: 'Custom Theme',
      primary: '#7c3aed',
      secondary: '#ede9fe',
      tertiary: '#6d28d9',
      builtin: false,
    }),
  ];

  const resolved = resolveThemeObject('custom', customThemes);
  assert.equal(resolved.id, 'custom');
  assert.equal(resolved.palette.primary, '#7c3aed');
  assert.equal(resolved.palette.secondary, '#ede9fe');
  assert.equal(resolved.palette.tertiary, '#6d28d9');
});

test('custom theme: live application into Virtual Appearance Layer without layout disruption', () => {
  const doc = new MockDocument();
  const customTheme = generateThemeFromPalette({
    id: 'custom',
    name: 'Custom Theme',
    primary: '#e11d48',
    secondary: '#ffe4e6',
    tertiary: '#be123c',
    builtin: false,
  });

  applyTheme(doc, customTheme);

  const styleEl = doc.getElementById('cfs-style');
  assert.ok(styleEl, 'Style tag must be injected');
  assert.ok(styleEl.textContent.includes('--cfs-accent: #e11d48;'));
  assert.ok(styleEl.textContent.includes('--cfs-page-bg:'));
  assert.ok(styleEl.textContent.includes('--cfs-nav-bg:'));
  assert.ok(styleEl.textContent.includes('--cfs-button-bg:'));

  // Clean cleanup
  removeTheme(doc);
  assert.equal(doc.getElementById('cfs-style'), null);
});

test('custom theme: user can create dark custom theme without light-theme restriction', () => {
  // Midnight Cyberpunk Dark Palette
  const p = '#12131c';
  const s = '#1e202f';
  const t = '#00f5d4';

  const customDarkTheme = generateThemeFromPalette({
    id: 'custom',
    name: 'Custom Theme',
    primary: p,
    secondary: s,
    tertiary: t,
    builtin: false,
  });

  assert.equal(customDarkTheme.id, 'custom');
  assert.equal(customDarkTheme.kind, 'dark');
  assert.equal(customDarkTheme.palette.primary, p);
  assert.equal(customDarkTheme.palette.secondary, s);
  assert.equal(customDarkTheme.palette.tertiary, t);

  // Dark background (< 0.25)
  const pageLum = getLuminance(customDarkTheme.tokens['page-bg']);
  assert.ok(pageLum < 0.25, `page-bg luminance ${pageLum} expected dark (< 0.25)`);

  // Text contrast >= 4.5:1
  const textContrast = getContrastRatio(customDarkTheme.tokens['text'], customDarkTheme.tokens['page-bg']);
  assert.ok(textContrast >= 4.5, `Text contrast ${textContrast} failed >= 4.5`);

  // Navigation contrast >= 4.5:1
  const navContrast = getContrastRatio(customDarkTheme.tokens['nav-text'], customDarkTheme.tokens['nav-bg']);
  assert.ok(navContrast >= 4.5, `Nav text contrast ${navContrast} failed >= 4.5`);

  // Button contrast >= 4.5:1
  const btnContrast = getContrastRatio(customDarkTheme.tokens['button-text'], customDarkTheme.tokens['button-bg']);
  assert.ok(btnContrast >= 4.5, `Button contrast ${btnContrast} failed >= 4.5`);

  // Link contrast >= 4.5:1
  const linkContrast = getContrastRatio(customDarkTheme.tokens['link'], customDarkTheme.tokens['page-bg']);
  assert.ok(linkContrast >= 4.5, `Link contrast ${linkContrast} failed >= 4.5`);
});
