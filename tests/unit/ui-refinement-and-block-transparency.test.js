import test from 'node:test';
import assert from 'node:assert/strict';
import { generateStylesheet, applyTheme, removeTheme, STYLE_TAG_ID } from '../../src/content/style-engine.js';
import { BUILTIN_THEMES, getBuiltinTheme } from '../../src/themes/builtin.js';
import { MockDocument, MockElement } from '../helpers/dom-fixture.js';

test('block transparency: single global control affects all surfaces together', () => {
  const theme = BUILTIN_THEMES[0];
  const transparency = {
    treatment: 'frosted',
    all: 30, // 30% transparent -> 70% solid
    blurBehindPanels: true,
    blurRadius: 12,
  };

  const css = generateStylesheet(theme, transparency, {}, { mode: 'my-image' });

  // Main content panels
  assert.ok(css.includes('color-mix(in srgb, var(--cfs-content-bg) 70%, transparent)'), 'Main content adopts 70% solidness');
  // Sidebar
  assert.ok(css.includes('color-mix(in srgb, var(--cfs-surface-1) 60%, transparent)'), 'Sidebar adopts 60% solidness');
  // Tables
  assert.ok(css.includes('color-mix(in srgb, var(--cfs-table-row-bg) 70%, transparent)'), 'Table rows adopt 70% solidness');
  // Table headers
  assert.ok(css.includes('color-mix(in srgb, var(--cfs-table-header-bg) 82%, transparent)'), 'Table headers adopt 82% solidness');
  // Blur
  assert.ok(css.includes('backdrop-filter: blur(12px)'), 'Backdrop blur radius matches 12px');
  // Opacity on elements must NOT exist
  assert.equal(css.match(/(^|[{;\s])opacity\s*:/i), null, 'Zero opacity on elements');
});

test('surface treatments: Solid renders 100% solid theme backgrounds with zero blur', () => {
  const theme = BUILTIN_THEMES[0];
  const transparency = {
    treatment: 'solid',
    all: 40, // Even if slider has a value, Solid renders 100% solid theme surfaces
    blurRadius: 10,
  };

  const css = generateStylesheet(theme, transparency);

  // Surfaces render fully solid using theme tokens
  assert.ok(css.includes('background-color: var(--cfs-content-bg);'), 'Content uses solid theme token');
  assert.ok(css.includes('background-color: var(--cfs-surface-1);'), 'Sidebar uses solid surface-1 token');
  assert.ok(css.includes('background-color: var(--cfs-table-header-bg);'), 'Table header uses solid table-header-bg');
  assert.ok(css.includes('background-color: var(--cfs-table-row-bg);'), 'Table row uses solid table-row-bg');

  // Must not have backdrop-filter blur in solid mode
  assert.equal(css.includes('backdrop-filter: blur('), false, 'Solid mode does not inject backdrop blur');
});

test('surface treatments: Translucent renders adjustable translucency without blur', () => {
  const theme = BUILTIN_THEMES[0];
  const transparency = {
    treatment: 'translucent',
    all: 25, // 75% solid
    blurRadius: 15,
  };

  const css = generateStylesheet(theme, transparency, {}, { mode: 'my-image' });

  // Translucent uses color-mix
  assert.ok(css.includes('color-mix(in srgb, var(--cfs-content-bg) 75%, transparent)'), 'Content uses 75% solid mix');
  assert.ok(css.includes('color-mix(in srgb, var(--cfs-table-row-bg) 75%, transparent)'), 'Table rows use 75% solid mix');

  // Must not have backdrop-filter blur in translucent mode
  assert.equal(css.includes('backdrop-filter: blur('), false, 'Translucent mode does not inject backdrop blur');
});

test('surface treatments: Frosted renders adjustable translucency with backdrop-filter blur', () => {
  const theme = BUILTIN_THEMES[0];
  const transparency = {
    treatment: 'frosted',
    all: 20, // 80% solid
    blurRadius: 14,
  };

  const css = generateStylesheet(theme, transparency, {}, { mode: 'my-image' });

  assert.ok(css.includes('color-mix(in srgb, var(--cfs-content-bg) 80%, transparent)'), 'Content uses 80% solid mix');
  assert.ok(css.includes('backdrop-filter: blur(14px)'), 'Frosted mode injects backdrop blur 14px');
  assert.ok(css.includes('-webkit-backdrop-filter: blur(14px)'), 'Frosted mode injects webkit blur 14px');
});

test('theme surfaces: Botanical, Rose, Paper, Nord Light generate distinct theme-tinted surfaces (no hardcoded white)', () => {
  const botanical = getBuiltinTheme('botanical');
  const rose = getBuiltinTheme('rose');
  const paper = getBuiltinTheme('paper');
  const nord = getBuiltinTheme('nord-light');

  // None of these should have hardcoded #ffffff for content-bg or table-row-bg
  assert.notEqual(botanical.tokens['content-bg'], '#ffffff', 'Botanical content-bg is pale sage, not white');
  assert.notEqual(botanical.tokens['table-row-bg'], '#ffffff', 'Botanical table-row-bg is tinted, not white');
  assert.notEqual(rose.tokens['content-bg'], '#ffffff', 'Rose content-bg is pale rose, not white');
  assert.notEqual(paper.tokens['content-bg'], '#ffffff', 'Paper content-bg is warm parchment, not white');
  assert.notEqual(nord.tokens['content-bg'], '#ffffff', 'Nord content-bg is cool slate, not white');

  // Verify they generate distinct colors
  assert.notEqual(botanical.tokens['content-bg'], rose.tokens['content-bg']);
  assert.notEqual(rose.tokens['content-bg'], paper.tokens['content-bg']);
  assert.notEqual(paper.tokens['content-bg'], nord.tokens['content-bg']);
});

test('simple fonts: applies Google Font or custom font and creates link tag', () => {
  const doc = new MockDocument();
  const theme = BUILTIN_THEMES[0];
  const font = {
    family: 'Inter',
  };

  applyTheme(doc, theme, { font });

  const fontLink = doc.getElementById('cfs-google-font');
  assert.ok(fontLink, 'cfs-google-font link element was created in document');
  assert.ok(fontLink.getAttribute('href').includes('family=Inter'), 'Link href targets Google Fonts Inter family');

  const styleEl = doc.getElementById(STYLE_TAG_ID);
  assert.ok(styleEl.textContent.includes('"Inter"'), 'Style tag includes Inter in font-family stack');

  // Remove theme cleans up the font link tag completely
  removeTheme(doc);
  assert.equal(doc.getElementById('cfs-google-font'), null, 'cfs-google-font link tag removed on removeTheme');
});

test('obsidian compatibility: surface treatments, block transparency, and fonts apply seamlessly', () => {
  const obsidian = getBuiltinTheme('obsidian');
  assert.ok(obsidian, 'Obsidian exists');
  assert.equal(obsidian.kind, 'dark');

  const transparency = {
    treatment: 'frosted',
    all: 20,
    blurRadius: 10,
    blurBehindPanels: true,
  };
  const font = { family: 'Fira Code' };

  const css = generateStylesheet(obsidian, transparency, font, { mode: 'my-image' });

  // Variables injected
  assert.ok(css.includes('--cfs-page-bg: #11151d;'), 'Includes Obsidian page-bg');
  assert.ok(css.includes('--cfs-accent: #35c6b0;'), 'Includes Obsidian accent');

  // Surface treatment & transparency works seamlessly with dark surfaces
  assert.ok(css.includes('color-mix(in srgb, var(--cfs-content-bg) 80%, transparent)'), 'Frosted 80% content mix applied');
  assert.ok(css.includes('backdrop-filter: blur(10px)'), 'Frosted blur 10px applied');

  // Custom font applied
  assert.ok(css.includes('"Fira Code"'), 'Font applied to typography variables');
});
