import test from 'node:test';
import assert from 'node:assert/strict';
import { getSettings, saveSettings, updateSettings, resetSettings } from '../../src/shared/storage.js';
import { browserApi } from '../../src/shared/browser-api.js';

test('storage: getSettings returns default settings initially', async () => {
  await browserApi.storage.clear();
  const settings = await getSettings();
  assert.equal(settings.schemaVersion, 1);
  assert.equal(settings.enabled, true);
});

test('storage: saveSettings validates and stores settings', async () => {
  await browserApi.storage.clear();
  const initial = await getSettings();
  initial.enabled = false;
  initial.contestMode.enabled = true;

  await saveSettings(initial);
  const loaded = await getSettings();
  assert.equal(loaded.enabled, false);
  assert.equal(loaded.contestMode.enabled, true);
});

test('storage: updateSettings updates and returns fresh settings', async () => {
  await browserApi.storage.clear();
  const updated = await updateSettings({ enabled: false });
  assert.equal(updated.enabled, false);

  const loaded = await getSettings();
  assert.equal(loaded.enabled, false);
});

test('storage: resetSettings restores all defaults', async () => {
  await updateSettings({ enabled: false });
  const reset = await resetSettings();
  assert.equal(reset.enabled, true);

  const loaded = await getSettings();
  assert.equal(loaded.enabled, true);
});

