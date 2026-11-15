/**
 * CF Studio - Background Service Worker (Manifest V3)
 */

import { browserApi } from '../shared/browser-api.js';
import { getSettings, onSettingsChanged } from '../shared/storage.js';
import { MESSAGE_TYPES, registerMessageHandler, sendTabMessage } from '../shared/messaging.js';
import { imageStore } from '../shared/image-store.js';

// Initialize settings on install
chrome.runtime.onInstalled.addListener(async () => {
  try {
    const settings = await getSettings();
    console.log('CF Studio: Initialized settings schema v' + settings.schemaVersion);
  } catch (err) {
    console.error('CF Studio: Error initializing settings:', err);
  }
});

// Broadcast settings changes to all Codeforces tabs
onSettingsChanged(async (newSettings) => {
  try {
    const tabs = await browserApi.tabs.query({ url: ['https://codeforces.com/*', 'https://*.codeforces.com/*'] });
    for (const tab of tabs) {
      if (tab.id) {
        sendTabMessage(tab.id, MESSAGE_TYPES.SETTINGS_CHANGED, { settings: newSettings }).catch(() => {
          // Tab might not be ready or active; safe to ignore
        });
      }
    }
  } catch (err) {
    console.error('CF Studio: Error broadcasting settings change:', err);
  }
});

// Register message handlers
registerMessageHandler({
  [MESSAGE_TYPES.GET_SETTINGS]: async () => {
    const settings = await getSettings();
    return { settings };
  },

  [MESSAGE_TYPES.GET_IMAGE]: async () => {
    try {
      const image = await imageStore.getImage();
      return { image };
    } catch (err) {
      console.error('CF Studio: Error retrieving image:', err);
      return { image: null, error: err.message };
    }
  },

  [MESSAGE_TYPES.SAVE_IMAGE]: async (payload) => {
    try {
      await imageStore.saveImage(payload);
      return { success: true };
    } catch (err) {
      console.error('CF Studio: Error saving image:', err);
      return { success: false, error: err.message };
    }
  },

  [MESSAGE_TYPES.DELETE_IMAGE]: async () => {
    try {
      await imageStore.deleteImage();
      return { success: true };
    } catch (err) {
      console.error('CF Studio: Error deleting image:', err);
      return { success: false, error: err.message };
    }
  },

  [MESSAGE_TYPES.GET_STATUS]: async () => {
    const settings = await getSettings();
    return {
      status: settings.enabled ? 'on' : 'off',
      message: settings.enabled ? 'On' : 'Off',
    };
  },
});
