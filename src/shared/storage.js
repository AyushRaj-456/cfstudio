/**
 * Storage wrapper for CF Studio settings in chrome.storage.local.
 */

import { browserApi } from './browser-api.js';
import { getDefaultSettings } from './defaults.js';
import { migrateSettings } from './migrations.js';
import { validateSettings } from './schema.js';

export const STORAGE_KEY = 'cfs.settings';

/**
 * Loads settings from storage. Migrates and validates as needed.
 * @returns {Promise<object>}
 */
export async function getSettings() {
  const result = await browserApi.storage.get(STORAGE_KEY);
  const raw = result[STORAGE_KEY];

  if (!raw) {
    const defaults = getDefaultSettings();
    await browserApi.storage.set({ [STORAGE_KEY]: defaults });
    return defaults;
  }

  const migrated = migrateSettings(raw);
  const validation = validateSettings(migrated);

  if (!validation.valid) {
    console.warn('CF Studio: Settings validation warnings:', validation.errors);
  }

  // If migration changed the schemaVersion or structure, persist it back
  if (raw.schemaVersion !== migrated.schemaVersion) {
    await browserApi.storage.set({ [STORAGE_KEY]: migrated });
  }

  return migrated;
}

/**
 * Saves validated settings to storage.
 * @param {object} settings
 * @returns {Promise<object>}
 */
export async function saveSettings(settings) {
  const validation = validateSettings(settings);
  if (!validation.valid) {
    throw new Error(`Invalid settings: ${validation.errors.join('; ')}`);
  }

  await browserApi.storage.set({ [STORAGE_KEY]: settings });
  return settings;
}

/**
 * Partially updates settings and saves.
 * @param {object|((current: object) => object)} updater
 * @returns {Promise<object>}
 */
export async function updateSettings(updater) {
  const current = await getSettings();
  let updated;
  if (typeof updater === 'function') {
    updated = updater(current);
  } else {
    updated = {
      ...current,
      ...updater,
    };
  }

  return saveSettings(updated);
}

/**
 * Resets all settings to default values.
 * @returns {Promise<object>}
 */
export async function resetSettings() {
  const defaults = getDefaultSettings();
  await browserApi.storage.set({ [STORAGE_KEY]: defaults });
  return defaults;
}

/**
 * Listens for settings changes in storage.
 * @param {(newSettings: object, oldSettings: object) => void} callback
 * @returns {() => void} Unsubscribe function
 */
export function onSettingsChanged(callback) {
  return browserApi.storage.onChanged((changes, area) => {
    if (area === 'local' && changes[STORAGE_KEY]) {
      const { newValue, oldValue } = changes[STORAGE_KEY];
      callback(newValue, oldValue);
    }
  });
}

