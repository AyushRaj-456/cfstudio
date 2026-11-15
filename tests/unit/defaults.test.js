import test from 'node:test';
import assert from 'node:assert/strict';
import { getDefaultSettings, CURRENT_SCHEMA_VERSION, PAGE_TYPES } from '../../src/shared/defaults.js';

test('defaults: matches schemaVersion 1', () => {
  const defaults = getDefaultSettings();
  assert.equal(defaults.schemaVersion, CURRENT_SCHEMA_VERSION);
  assert.equal(defaults.schemaVersion, 1);
});

test('defaults: enabled is true by default', () => {
  const defaults = getDefaultSettings();
  assert.equal(defaults.enabled, true);
});

test('defaults: has all expected top-level sections', () => {
  const defaults = getDefaultSettings();
  assert.ok('global' in defaults);
  assert.ok('perPage' in defaults);
  assert.ok('contestMode' in defaults);
  assert.ok('autoDark' in defaults);
  assert.ok('customThemes' in defaults);
  assert.ok('favorites' in defaults);
  assert.ok('introShown' in defaults);
});

test('defaults: contains all expected perPage keys', () => {
  const defaults = getDefaultSettings();
  for (const pageType of PAGE_TYPES) {
    assert.ok(pageType in defaults.perPage, `Missing perPage key: ${pageType}`);
    assert.deepEqual(defaults.perPage[pageType], {});
  }
});

test('defaults: returns an isolated clone each time', () => {
  const first = getDefaultSettings();
  first.enabled = false;
  first.global.background.strength = 42;

  const second = getDefaultSettings();
  assert.equal(second.enabled, true);
  assert.equal(second.global.background.strength, 100);
});

