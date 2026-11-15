import test from 'node:test';
import assert from 'node:assert/strict';
import { BUILTIN_THEMES } from '../../src/themes/builtin.js';
import { generateStylesheet } from '../../src/content/style-engine.js';

// Forbidden layout properties from AGENTS.md rule 3
const FORBIDDEN_LAYOUT_PROPERTIES = [
  'margin',
  'margin-top',
  'margin-bottom',
  'margin-left',
  'margin-right',
  'padding',
  'padding-top',
  'padding-bottom',
  'padding-left',
  'padding-right',
  'width',
  'min-width',
  'max-width',
  'height',
  'min-height',
  'max-height',
  'position',
  'top',
  'left',
  'right',
  'bottom',
  'display',
  'float',
  'clear',
  'flex',
  'flex-direction',
  'flex-wrap',
  'flex-flow',
  'flex-grow',
  'flex-shrink',
  'flex-basis',
  'justify-content',
  'align-items',
  'align-content',
  'align-self',
  'grid',
  'grid-template',
  'grid-template-rows',
  'grid-template-columns',
  'grid-template-areas',
  'grid-auto-rows',
  'grid-auto-columns',
  'grid-auto-flow',
  'grid-column',
  'grid-row',
  'grid-area',
  'gap',
  'row-gap',
  'column-gap',
  'transform',
  'z-index',
];

test('layout guard: generated CSS has no forbidden layout properties for any theme', () => {
  for (const theme of BUILTIN_THEMES) {
    const css = generateStylesheet(theme);

    // Strip comments to inspect rules only
    const cleanCss = css.replace(/\/\*[\s\S]*?\*\//g, '');

    for (const prop of FORBIDDEN_LAYOUT_PROPERTIES) {
      // Look for property declarations e.g. "margin:" or "padding :"
      const regex = new RegExp(`(^|[{;\\s])${prop}\\s*:`, 'i');
      const match = cleanCss.match(regex);
      assert.equal(
        match,
        null,
        `Theme "${theme.id}" violated layout guard with forbidden property "${prop}"`
      );
    }
  }
});

test('layout guard: generated CSS never sets opacity on elements', () => {
  for (const theme of BUILTIN_THEMES) {
    const css = generateStylesheet(theme);
    const regex = /(^|[{;\s])opacity\s*:/i;
    assert.equal(
      css.match(regex),
      null,
      `Theme "${theme.id}" violated AGENTS.md rule 5: opacity must never be set`
    );
  }
});

test('layout guard: generated CSS has no universal * selector with !important', () => {
  for (const theme of BUILTIN_THEMES) {
    const css = generateStylesheet(theme);
    const universalRegex = /\*\s*\{[^}]*!important[^}]*\}/i;
    assert.equal(
      css.match(universalRegex),
      null,
      `Theme "${theme.id}" violated AGENTS.md rule 4: universal !important found`
    );
  }
});

test('layout guard: generated CSS contains valid safe appearance properties only', () => {
  const css = generateStylesheet(BUILTIN_THEMES[0]);
  assert.ok(css.includes('background-color:'));
  assert.ok(css.includes('color:'));
  assert.ok(css.includes('border-color:'));
  assert.ok(css.includes('--cfs-page-bg:'));
  assert.ok(css.includes('--cfs-header-bg:'));
  assert.ok(css.includes('--cfs-content-bg:'));
});

test('layout guard: custom fonts and text adjustments still pass layout guard', () => {
  const fontOptions = {
    preset: 'reading',
    page: 'Inter',
    headings: 'Montserrat',
    statement: 'Georgia',
    code: 'Fira Code',
    size: 16,
    weight: 500,
    lineHeight: 1.6,
    letterSpacing: 0.5,
  };

  for (const theme of BUILTIN_THEMES) {
    const css = generateStylesheet(theme, { all: 20, blurBehindPanels: true }, fontOptions);
    const cleanCss = css.replace(/\/\*[\s\S]*?\*\//g, '');

    for (const prop of FORBIDDEN_LAYOUT_PROPERTIES) {
      const regex = new RegExp(`(^|[{;\\s])${prop}\\s*:`, 'i');
      const match = cleanCss.match(regex);
      assert.equal(
        match,
        null,
        `Theme "${theme.id}" with font options violated layout guard with "${prop}"`
      );
    }

    assert.equal(css.match(/(^|[{;\s])opacity\s*:/i), null);
    assert.equal(css.match(/\*\s*\{[^}]*!important[^}]*\}/i), null);
  }
});

test('layout guard: custom imported themes pass layout guard', () => {
  const customTheme = {
    id: 'theme_custom_test',
    name: 'Custom Rainbow',
    kind: 'custom',
    builtin: false,
    tokens: {
      'page-bg': '#123456',
      'header-bg': '#234567',
      'content-bg': '#345678',
      'surface-1': '#456789',
      'surface-2': '#56789a',
      'table-header-bg': '#6789ab',
      'table-row-bg': '#789abc',
      'table-row-alt-bg': '#89abcd',
      'text': '#ffffff',
      'text-muted': '#cccccc',
      'link': '#3399ff',
      'link-hover': '#66b2ff',
      'border': '#444444',
      'input-bg': '#222222',
      'input-text': '#ffffff',
      'input-border': '#555555',
      'button-bg': '#0066cc',
      'button-text': '#ffffff',
      'button-hover-bg': '#0052a3',
      'focus': '#ffcc00',
      'code-bg': '#1a1a1a',
      'accent': '#0066cc',
    },
  };

  const css = generateStylesheet(customTheme, { all: 15 });
  const cleanCss = css.replace(/\/\*[\s\S]*?\*\//g, '');

  for (const prop of FORBIDDEN_LAYOUT_PROPERTIES) {
    const regex = new RegExp(`(^|[{;\\s])${prop}\\s*:`, 'i');
    assert.equal(cleanCss.match(regex), null, `Custom theme violated layout guard with "${prop}"`);
  }

  assert.equal(css.match(/(^|[{;\s])opacity\s*:/i), null);
  assert.equal(css.match(/\*\s*\{[^}]*!important[^}]*\}/i), null);
});
