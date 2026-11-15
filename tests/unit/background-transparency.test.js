import test from 'node:test';
import assert from 'node:assert/strict';
import { generateStylesheet, applyTheme, removeTheme, BG_LAYER_ID } from '../../src/content/style-engine.js';
import { BUILTIN_THEMES } from '../../src/themes/builtin.js';
import { MockDocument } from '../helpers/dom-fixture.js';

test('background-transparency: transparency uses color-mix and never opacity on site elements', () => {
  const theme = BUILTIN_THEMES[0];
  const transparency = {
    all: 20,
    page: 10,
    panels: 30,
    tables: 40,
    inputs: 15,
  };

  const css = generateStylesheet(theme, transparency);
  assert.ok(css.includes('color-mix('));

  // Confirm opacity is never written in site element CSS
  const opacityRegex = /(^|[{;\s])opacity\s*:/i;
  assert.equal(css.match(opacityRegex), null);
});

test('background-transparency: blurBehindPanels injects backdrop-filter', () => {
  const theme = BUILTIN_THEMES[0];
  const withBlur = generateStylesheet(theme, { blurBehindPanels: true });
  assert.ok(withBlur.includes('backdrop-filter: blur(8px)'));

  const withoutBlur = generateStylesheet(theme, { blurBehindPanels: false });
  assert.equal(withoutBlur.includes('backdrop-filter: blur(8px)'), false);
});

test('background-transparency: background layer attaches at z-index -999999 and pointer-events none', () => {
  const doc = new MockDocument();
  const theme = BUILTIN_THEMES[0];
  const bgSettings = {
    mode: 'builtin',
    builtinId: 'soft-grid',
    strength: 80,
    blur: 2,
    brightness: 110,
    contrast: 100,
    saturation: 100,
    coverColor: '#000000',
    coverStrength: 20,
  };

  applyTheme(doc, theme, { background: bgSettings });

  const layer = doc.getElementById(BG_LAYER_ID);
  assert.ok(layer, 'Background layer must exist');
  assert.equal(layer.getAttribute('data-cfs-host'), 'true');
  assert.ok(layer.style.cssText.includes('position: fixed'));
  assert.ok(layer.style.cssText.includes('z-index: -999999'));
  assert.ok(layer.style.cssText.includes('pointer-events: none'));

  const imgDiv = doc.getElementById('cfs-bg-image');
  assert.ok(imgDiv);
  assert.ok(imgDiv.style.filter.includes('blur(2px)'));

  const coverDiv = doc.getElementById('cfs-bg-cover');
  assert.ok(coverDiv);
  assert.equal(coverDiv.style.backgroundColor, '#000000');
});

test('background-transparency: removeTheme completely cleans up background layer', () => {
  const doc = new MockDocument();
  const theme = BUILTIN_THEMES[0];
  const bgSettings = { mode: 'builtin', builtinId: 'dots' };

  applyTheme(doc, theme, { background: bgSettings });
  assert.ok(doc.getElementById(BG_LAYER_ID));

  removeTheme(doc);
  assert.equal(doc.getElementById(BG_LAYER_ID), null, 'Background layer must be removed on Off/cleanup');
});

test('background-transparency: surface hierarchy enforces proper opacity levels and frosted glass', () => {
  const theme = BUILTIN_THEMES[0];
  const bgSettings = { mode: 'builtin', builtinId: 'soft-grid' };

  const css = generateStylesheet(theme, { all: 20 }, {}, bgSettings);

  // 1. Content panels ~80%
  assert.ok(css.includes('var(--cfs-content-bg) 80%, transparent)'));
  // 2. Sidebar panels ~70%
  assert.ok(css.includes('var(--cfs-surface-1) 70%, transparent)'));
  // 3. Table headers ~88%
  assert.ok(css.includes('var(--cfs-table-header-bg) 88%, transparent)'));
  // 4. Table rows ~70%
  assert.ok(css.includes('var(--cfs-table-row-alt-bg) 70%, transparent)'));
  // 5. Code blocks kept high opacity (92%) for syntax readability
  assert.ok(css.includes('var(--cfs-code-bg) 92%, transparent)'));

  // 6. Frosted glass backdrop-filter
  assert.ok(css.includes('backdrop-filter: blur('));
  assert.ok(css.includes('-webkit-backdrop-filter: blur('));

  // 7. Subtle borders and shadows
  assert.ok(css.includes('color-mix(in srgb, var(--cfs-border)'));
  assert.ok(css.includes('box-shadow:'));

  // 8. Strict text readability: opacity never applied to element containers
  assert.equal(css.match(/(^|[{;\s])opacity\s*:/i), null);
});

test('background-transparency: custom blur radius is respected', () => {
  const theme = BUILTIN_THEMES[0];
  const css = generateStylesheet(theme, { blurRadius: 16 }, {}, { mode: 'builtin', builtinId: 'soft-grid' });
  assert.ok(css.includes('backdrop-filter: blur(16px)'));
  assert.ok(css.includes('-webkit-backdrop-filter: blur(16px)'));
});
