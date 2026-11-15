import test from 'node:test';
import assert from 'node:assert/strict';
import {
  FONT_PRESETS,
  FALLBACK_STACKS,
  sanitizeFontInput,
  buildFontStack,
  generateFontStyles,
} from '../../src/shared/fonts.js';
import { BUILTIN_THEMES } from '../../src/themes/builtin.js';
import { generateStylesheet, applyTheme, removeTheme } from '../../src/content/style-engine.js';
import { MockDocument } from '../helpers/dom-fixture.js';

test('font sanitizer: accepts valid font names', () => {
  const validInputs = [
    'Inter',
    'Roboto',
    'Consolas',
    'Fira Code',
    'JetBrains Mono',
    '"Fira Code"',
    "'Consolas'",
    'SF-Pro-Text-1',
    'Inter, Roboto, Arial',
    '"Fira Code", Consolas',
    '',
  ];

  for (const input of validInputs) {
    const res = sanitizeFontInput(input);
    assert.equal(res.valid, true, `Expected "${input}" to be valid`);
  }
});

test('font sanitizer: quotes family names and strips duplicate quotes', () => {
  assert.equal(sanitizeFontInput('Inter').cleaned, '"Inter"');
  assert.equal(sanitizeFontInput('"Fira Code"').cleaned, '"Fira Code"');
  assert.equal(sanitizeFontInput("'Consolas'").cleaned, '"Consolas"');
  assert.equal(sanitizeFontInput('Fira Code, Consolas').cleaned, '"Fira Code", "Consolas"');
  assert.equal(sanitizeFontInput('').cleaned, '');
});

test('font sanitizer: rejects forbidden characters and tokens', () => {
  const forbiddenInputs = [
    'Arial; color: red',
    'font}body{display:none}',
    '{font-family: serif}',
    'calc(10px)',
    'font\\family',
    '@import "evil.css"',
    '@font-face',
    '<script>',
    'url(https://evil.com/font.woff)',
    'url ("https://evil.com")',
    'font!',
    'font$name',
    'font*name',
    'font+name',
    'font=name',
    'font~name',
  ];

  for (const input of forbiddenInputs) {
    const res = sanitizeFontInput(input);
    assert.equal(res.valid, false, `Expected "${input}" to be rejected`);
  }
});

test('font sanitizer: rejects input exceeding 100 characters', () => {
  const longFont = 'A'.repeat(101);
  const res = sanitizeFontInput(longFont);
  assert.equal(res.valid, false);
  assert.ok(res.error.includes('100'));
});

test('font sanitizer: rejects non-string inputs', () => {
  assert.equal(sanitizeFontInput(null).valid, false);
  assert.equal(sanitizeFontInput(123).valid, false);
  assert.equal(sanitizeFontInput({}).valid, false);
});

test('font stack: appends fallback stack and handles missing fonts', () => {
  // Empty font falls back to fallback stack
  const emptyPage = buildFontStack('page', '');
  assert.equal(emptyPage, FALLBACK_STACKS.page);

  const emptyCode = buildFontStack('code', '');
  assert.equal(emptyCode, FALLBACK_STACKS.code);

  // Custom font has fallback stack appended
  const customPage = buildFontStack('page', 'Inter');
  assert.equal(customPage, `"Inter", ${FALLBACK_STACKS.page}`);

  const customCode = buildFontStack('code', 'Fira Code');
  assert.equal(customCode, `"Fira Code", ${FALLBACK_STACKS.code}`);

  // Invalid font safely falls back to default fallback stack
  const invalidFont = buildFontStack('code', 'evil; color: red');
  assert.equal(invalidFont, FALLBACK_STACKS.code);
});

test('font presets: Reading preset uses serif statement and taller line-height', () => {
  const css = generateFontStyles({
    preset: FONT_PRESETS.READING,
  });

  assert.ok(css.includes('Georgia, Cambria, "Times New Roman", Times, serif'));
  assert.ok(css.includes('line-height: 1.65;'));
});

test('font presets: Coding preset uses monospace code stack', () => {
  const css = generateFontStyles({
    preset: FONT_PRESETS.CODING,
  });

  assert.ok(css.includes('ui-monospace, "Cascadia Code"'));
});

test('font adjustments: size, weight, line-height, letter-spacing apply only when set', () => {
  // Default (all null): no font-size, font-weight, letter-spacing declarations
  const defaultCss = generateFontStyles({
    preset: 'default',
    size: null,
    weight: null,
    lineHeight: null,
    letterSpacing: null,
  });
  assert.equal(defaultCss.includes('font-size:'), false);
  assert.equal(defaultCss.includes('font-weight:'), false);
  assert.equal(defaultCss.includes('letter-spacing:'), false);

  // Custom values set
  const customCss = generateFontStyles({
    preset: 'default',
    size: 16,
    weight: 600,
    lineHeight: 1.5,
    letterSpacing: 1,
  });
  assert.ok(customCss.includes('font-size: 16px;'));
  assert.ok(customCss.includes('font-weight: 600;'));
  assert.ok(customCss.includes('line-height: 1.5;'));
  assert.ok(customCss.includes('letter-spacing: 1px;'));
});

test('font protection: icon fonts and SVG text elements preserve native fonts', () => {
  const css = generateFontStyles();
  assert.ok(css.includes('i[class*="icon"]'));
  assert.ok(css.includes('[class*="fa-"]'));
  assert.ok(css.includes('.glyphicon'));
  assert.ok(css.includes('svg'));
  assert.ok(css.includes('font-family: inherit;'));
});

test('font reset: removeTheme completely restores DOM and removes font rules', () => {
  const doc = new MockDocument();
  const theme = BUILTIN_THEMES[0];
  const fontSettings = {
    preset: 'reading',
    page: 'Inter',
    code: 'Fira Code',
    size: 16,
  };

  applyTheme(doc, theme, { font: fontSettings });

  const styleEl = doc.getElementById('cfs-style');
  assert.ok(styleEl);
  assert.ok(styleEl.textContent.includes('"Inter"'));
  assert.ok(styleEl.textContent.includes('"Fira Code"'));
  assert.ok(styleEl.textContent.includes('font-size: 16px;'));

  // Reset/Remove
  removeTheme(doc);
  assert.equal(doc.getElementById('cfs-style'), null);
  assert.equal(doc.documentElement.getAttribute('data-cfs-on'), null);
});

test('font consistency: centrally managed font-family variables are defined and referenced', () => {
  const css = generateFontStyles({
    family: 'Poppins',
  });

  // Centrally managed CSS variable
  assert.ok(css.includes('--cf-studio-font-family: "Poppins",'));
  assert.ok(css.includes('--cfs-font-family: var(--cf-studio-font-family);'));
  assert.ok(css.includes('--cf-studio-font-code:'));
});

test('font consistency: custom font propagates across all Codeforces text surfaces', () => {
  const css = generateFontStyles({
    family: 'Inter',
  });

  // Blog content, discussions, comments
  assert.ok(css.includes('div.ttypography'));
  assert.ok(css.includes('.topic'));
  assert.ok(css.includes('.comment'));

  // Announcements & notices
  assert.ok(css.includes('.notice'));
  assert.ok(css.includes('.alert'));

  // Primary & secondary navigation
  assert.ok(css.includes('.main-menu-list'));
  assert.ok(css.includes('.second-level-menu'));
  assert.ok(css.includes('#header'));

  // Sidebars
  assert.ok(css.includes('.sidebox'));
  assert.ok(css.includes('.titled'));

  // Buttons, inputs, forms
  assert.ok(css.includes('button'));
  assert.ok(css.includes('input'));
  assert.ok(css.includes('select'));
  assert.ok(css.includes('textarea'));

  // Contest tables and standings
  assert.ok(css.includes('table.datatable'));
  assert.ok(css.includes('table.problems'));
  assert.ok(css.includes('table.standings'));

  // Verification that they use the central variable
  assert.ok(css.includes('font-family: var(--cf-studio-font-family) !important;'));
});

test('font consistency: monospace code blocks, inline code, and MathJax are strictly protected', () => {
  const css = generateFontStyles({
    family: 'Inter',
  });

  // Monospace code
  assert.ok(css.includes('pre'));
  assert.ok(css.includes('code'));
  assert.ok(css.includes('.source-code'));
  assert.ok(css.includes('.sample-test pre'));
  assert.ok(css.includes('font-family: var(--cf-studio-font-code) !important;'));

  // Math formulas
  assert.ok(css.includes('.MathJax'));
  assert.ok(css.includes('.katex'));
  assert.ok(css.includes('math'));
  assert.ok(css.includes('font-family: inherit !important;'));
});
