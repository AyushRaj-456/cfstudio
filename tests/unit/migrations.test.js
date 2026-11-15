import test from 'node:test';
import assert from 'node:assert/strict';
import { migrateSettings } from '../../src/shared/migrations.js';
import { getDefaultSettings } from '../../src/shared/defaults.js';
import { validateSettings } from '../../src/shared/schema.js';

test('migrations: returns defaults on empty or null input', () => {
  const result1 = migrateSettings(null);
  assert.equal(result1.schemaVersion, 1);
  assert.equal(validateSettings(result1).valid, true);

  const result2 = migrateSettings({});
  assert.equal(result2.schemaVersion, 1);
  assert.equal(validateSettings(result2).valid, true);
});

test('migrations: rejects unknown newer versions', () => {
  assert.throws(() => {
    migrateSettings({ schemaVersion: 2 });
  }, /Unknown settings schema version: 2/);

  assert.throws(() => {
    migrateSettings({ schemaVersion: 99 });
  }, /Unknown settings schema version: 99/);
});

test('migrations: migrates unversioned partial settings to v1 and preserves custom fields', () => {
  const legacy = {
    enabled: false,
    global: {
      background: {
        blur: 10,
      },
    },
    favorites: ['theme-midnight'],
  };

  const migrated = migrateSettings(legacy);
  assert.equal(migrated.schemaVersion, 1);
  assert.equal(migrated.enabled, false);
  assert.equal(migrated.global.background.blur, 10);
  assert.equal(migrated.global.background.strength, 100); // filled by default
  assert.deepEqual(migrated.favorites, ['theme-midnight']);
  
  const validation = validateSettings(migrated);
  assert.equal(validation.valid, true, `Errors: ${validation.errors.join(', ')}`);
});

