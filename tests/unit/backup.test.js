import test from 'node:test';
import assert from 'node:assert/strict';
import {
  exportSettings,
  validateAndImportSettings,
  MAX_IMPORT_SIZE_BYTES,
} from '../../src/shared/backup.js';
import { getDefaultSettings } from '../../src/shared/defaults.js';

test('backup export: excludes uploaded image and formats valid JSON', () => {
  const settings = getDefaultSettings();
  settings.global.background.mode = 'my-image';
  settings.global.background.hasImage = true;
  settings.customThemes = [
    {
      id: 'custom_1',
      name: 'Custom Slate',
      tokens: { 'page-bg': '#121212', 'text': '#eeeeee' },
    },
  ];

  const exportedStr = exportSettings(settings);
  assert.equal(typeof exportedStr, 'string');

  const parsed = JSON.parse(exportedStr);
  assert.equal(parsed.schemaVersion, 1);
  assert.equal(parsed.global.background.mode, 'none');
  assert.equal(parsed.global.background.hasImage, false);
  assert.equal(parsed.customThemes.length, 1);
});

test('backup import: successfully imports valid settings', () => {
  const settings = getDefaultSettings();
  settings.global.themeId = 'purple';
  settings.customThemes = [
    {
      id: 'custom_1',
      name: 'Custom Slate',
      tokens: { 'page-bg': '#121212', 'text': '#eeeeee' },
    },
  ];

  const jsonStr = JSON.stringify(settings);
  const result = validateAndImportSettings(jsonStr);

  assert.equal(result.valid, true);
  assert.equal(result.settings.global.themeId, 'purple');
  assert.equal(result.settings.customThemes.length, 1);
});

test('backup import: rejects oversized files (> 1 MB)', () => {
  const hugeString = ' '.repeat(MAX_IMPORT_SIZE_BYTES + 10);
  const result = validateAndImportSettings(hugeString);
  assert.equal(result.valid, false);
  assert.ok(result.error.includes('File too large'));
});

test('backup import: rejects invalid JSON syntax', () => {
  const result = validateAndImportSettings('{ bad json: true');
  assert.equal(result.valid, false);
  assert.ok(result.error.includes('valid JSON'));
});

test('backup import: rejects unauthorized extra top-level keys', () => {
  const settings = getDefaultSettings();
  settings.injectedMaliciousKey = 'hack';

  const result = validateAndImportSettings(JSON.stringify(settings));
  assert.equal(result.valid, false);
  assert.ok(result.error.includes('Unauthorized extra setting: injectedMaliciousKey'));
});

test('backup import: rejects newer or unsupported schemaVersion', () => {
  const settings = getDefaultSettings();
  settings.schemaVersion = 2;

  const result = validateAndImportSettings(JSON.stringify(settings));
  assert.equal(result.valid, false);
  assert.ok(result.error.includes('Unsupported settings version: 2'));
});

test('backup import: rejects bad color values in customThemes', () => {
  const settings = getDefaultSettings();
  settings.customThemes = [
    {
      id: 'custom_1',
      name: 'Bad Theme',
      tokens: {
        'page-bg': 'not-a-hex-color',
        'text': '#ffffff',
      },
    },
  ];

  const result = validateAndImportSettings(JSON.stringify(settings));
  assert.equal(result.valid, false);
  assert.ok(result.error.includes('Invalid color value'));
});

test('backup import: rejects unauthorized token names in customThemes', () => {
  const settings = getDefaultSettings();
  settings.customThemes = [
    {
      id: 'custom_1',
      name: 'Bad Theme',
      tokens: {
        'page-bg': '#000000',
        'unauthorized-token-name': '#ffffff',
      },
    },
  ];

  const result = validateAndImportSettings(JSON.stringify(settings));
  assert.equal(result.valid, false);
  assert.ok(result.error.includes('Unauthorized token name'));
});

test('backup import: rejects invalid custom theme names', () => {
  const settings = getDefaultSettings();
  settings.customThemes = [
    {
      id: 'custom_1',
      name: '<script>alert(1)</script>',
      tokens: {
        'page-bg': '#000000',
      },
    },
  ];

  const result = validateAndImportSettings(JSON.stringify(settings));
  assert.equal(result.valid, false);
  assert.ok(result.error.includes('Invalid theme name'));
});
