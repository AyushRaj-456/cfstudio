import test from 'node:test';
import assert from 'node:assert/strict';
import { validateSettings, validateBackground, validateFont, validateTransparency } from '../../src/shared/schema.js';
import { getDefaultSettings } from '../../src/shared/defaults.js';

test('schema: default settings pass validation', () => {
  const defaults = getDefaultSettings();
  const result = validateSettings(defaults);
  assert.equal(result.valid, true, `Validation failed: ${result.errors.join(', ')}`);
  assert.equal(result.errors.length, 0);
});

test('schema: non-object settings fail validation', () => {
  assert.equal(validateSettings(null).valid, false);
  assert.equal(validateSettings('string').valid, false);
  assert.equal(validateSettings(123).valid, false);
});

test('schema: wrong schemaVersion fails validation', () => {
  const settings = getDefaultSettings();
  settings.schemaVersion = 2;
  const result = validateSettings(settings);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some(e => e.includes('schemaVersion')));
});

test('schema: non-boolean enabled fails validation', () => {
  const settings = getDefaultSettings();
  settings.enabled = 'yes';
  const result = validateSettings(settings);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some(e => e.includes('enabled')));
});

test('schema: background validation detects invalid mode and values', () => {
  const bg = getDefaultSettings().global.background;
  
  // Valid bg passes
  assert.equal(validateBackground(bg).length, 0);

  // Invalid mode
  assert.ok(validateBackground({ ...bg, mode: 'invalid' }).length > 0);

  // Invalid strength (> 100)
  assert.ok(validateBackground({ ...bg, strength: 150 }).length > 0);

  // Invalid coverColor
  assert.ok(validateBackground({ ...bg, coverColor: 'not-a-color' }).length > 0);
});

test('schema: font validation rejects invalid characters', () => {
  const font = getDefaultSettings().global.font;
  assert.equal(validateFont(font).length, 0);

  // Forbidden CSS injection characters
  assert.ok(validateFont({ ...font, page: 'font; color: red' }).length > 0);
  assert.ok(validateFont({ ...font, page: 'font { display: none }' }).length > 0);
  assert.ok(validateFont({ ...font, page: 'url("http://evil.com")' }).length > 0);
  assert.ok(validateFont({ ...font, page: '@import "evil.css"' }).length > 0);

  // Valid font names pass
  assert.equal(validateFont({ ...font, page: 'Consolas, "Fira Code", monospace' }).length, 0);
});

test('schema: transparency validation verifies bounds', () => {
  const t = getDefaultSettings().global.transparency;
  assert.equal(validateTransparency(t).length, 0);

  assert.equal(validateTransparency({ ...t, treatment: 'solid' }).length, 0);
  assert.equal(validateTransparency({ ...t, treatment: 'translucent' }).length, 0);
  assert.equal(validateTransparency({ ...t, treatment: 'frosted' }).length, 0);
  assert.ok(validateTransparency({ ...t, treatment: 'invalid-treatment' }).length > 0);

  assert.ok(validateTransparency({ ...t, all: -5 }).length > 0);
  assert.ok(validateTransparency({ ...t, all: 150 }).length > 0);
  assert.ok(validateTransparency({ ...t, blurBehindPanels: 'true' }).length > 0);
});

test('schema: autoDark validation verifies mode and times', () => {
  const settings = getDefaultSettings();
  
  settings.autoDark.from = '99:99';
  assert.equal(validateSettings(settings).valid, false);

  settings.autoDark.from = '19:00';
  settings.autoDark.mode = 'invalid-mode';
  assert.equal(validateSettings(settings).valid, false);
});

