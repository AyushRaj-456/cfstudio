/**
 * Browser API wrapper around chrome.* APIs.
 * Provides promise-based access and safe fallbacks for test environments.
 */

const isChromeAvailable = typeof chrome !== 'undefined' && Boolean(chrome.runtime);

// In-memory fallback for test or non-extension environments
const memoryStorage = new Map();
const storageListeners = new Set();
const messageListeners = new Set();

export const browserApi = {
  isExtension: isChromeAvailable,

  storage: {
    /**
     * Get items from local storage.
     * @param {string|string[]|object|null} keys
     * @returns {Promise<Record<string, any>>}
     */
    async get(keys) {
      if (isChromeAvailable && chrome.storage?.local) {
        return new Promise((resolve, reject) => {
          chrome.storage.local.get(keys, (items) => {
            if (chrome.runtime.lastError) {
              reject(new Error(chrome.runtime.lastError.message));
            } else {
              resolve(items);
            }
          });
        });
      }

      // Memory storage fallback
      const result = {};
      if (keys === null || keys === undefined) {
        for (const [k, v] of memoryStorage.entries()) {
          result[k] = JSON.parse(JSON.stringify(v));
        }
      } else if (typeof keys === 'string') {
        if (memoryStorage.has(keys)) {
          result[keys] = JSON.parse(JSON.stringify(memoryStorage.get(keys)));
        }
      } else if (Array.isArray(keys)) {
        for (const k of keys) {
          if (memoryStorage.has(k)) {
            result[k] = JSON.parse(JSON.stringify(memoryStorage.get(k)));
          }
        }
      } else if (typeof keys === 'object') {
        for (const [k, defaultVal] of Object.entries(keys)) {
          result[k] = memoryStorage.has(k)
            ? JSON.parse(JSON.stringify(memoryStorage.get(k)))
            : defaultVal;
        }
      }
      return result;
    },

    /**
     * Set items in local storage.
     * @param {Record<string, any>} items
     * @returns {Promise<void>}
     */
    async set(items) {
      if (isChromeAvailable && chrome.storage?.local) {
        return new Promise((resolve, reject) => {
          chrome.storage.local.set(items, () => {
            if (chrome.runtime.lastError) {
              reject(new Error(chrome.runtime.lastError.message));
            } else {
              resolve();
            }
          });
        });
      }

      // Memory storage fallback
      const changes = {};
      for (const [k, v] of Object.entries(items)) {
        const oldValue = memoryStorage.get(k);
        memoryStorage.set(k, JSON.parse(JSON.stringify(v)));
        changes[k] = { oldValue, newValue: v };
      }
      for (const listener of storageListeners) {
        try {
          listener(changes, 'local');
        } catch (e) {
          console.error('Storage listener error:', e);
        }
      }
    },

    /**
     * Remove items from local storage.
     * @param {string|string[]} keys
     * @returns {Promise<void>}
     */
    async remove(keys) {
      if (isChromeAvailable && chrome.storage?.local) {
        return new Promise((resolve, reject) => {
          chrome.storage.local.remove(keys, () => {
            if (chrome.runtime.lastError) {
              reject(new Error(chrome.runtime.lastError.message));
            } else {
              resolve();
            }
          });
        });
      }

      const keyList = Array.isArray(keys) ? keys : [keys];
      for (const k of keyList) {
        memoryStorage.delete(k);
      }
    },

    /**
     * Clear all storage.
     * @returns {Promise<void>}
     */
    async clear() {
      if (isChromeAvailable && chrome.storage?.local) {
        return new Promise((resolve, reject) => {
          chrome.storage.local.clear(() => {
            if (chrome.runtime.lastError) {
              reject(new Error(chrome.runtime.lastError.message));
            } else {
              resolve();
            }
          });
        });
      }
      memoryStorage.clear();
    },

    /**
     * Listen for storage changes.
     * @param {(changes: Record<string, { oldValue: any, newValue: any }>, areaName: string) => void} callback
     */
    onChanged(callback) {
      if (isChromeAvailable && chrome.storage?.onChanged) {
        chrome.storage.onChanged.addListener(callback);
        return () => chrome.storage.onChanged.removeListener(callback);
      }
      storageListeners.add(callback);
      return () => storageListeners.delete(callback);
    },
  },

  runtime: {
    /**
     * Send message to background / active components.
     * @param {any} message
     * @returns {Promise<any>}
     */
    async sendMessage(message) {
      if (isChromeAvailable && chrome.runtime?.sendMessage) {
        return new Promise((resolve, reject) => {
          chrome.runtime.sendMessage(message, (response) => {
            const err = chrome.runtime.lastError;
            if (err) {
              // Ignore expected "receiving end does not exist" without throwing unhandled
              resolve(null);
            } else {
              resolve(response);
            }
          });
        });
      }
      return null;
    },

    /**
     * Listen for runtime messages.
     * @param {(message: any, sender: any, sendResponse: (res?: any) => void) => boolean | void} callback
     */
    onMessage(callback) {
      if (isChromeAvailable && chrome.runtime?.onMessage) {
        chrome.runtime.onMessage.addListener(callback);
        return () => chrome.runtime.onMessage.removeListener(callback);
      }
      messageListeners.add(callback);
      return () => messageListeners.delete(callback);
    },
  },

  tabs: {
    /**
     * Query tabs matching queryInfo.
     * @param {object} queryInfo
     * @returns {Promise<any[]>}
     */
    async query(queryInfo) {
      if (isChromeAvailable && chrome.tabs?.query) {
        return new Promise((resolve, reject) => {
          chrome.tabs.query(queryInfo, (tabs) => {
            if (chrome.runtime.lastError) {
              reject(new Error(chrome.runtime.lastError.message));
            } else {
              resolve(tabs || []);
            }
          });
        });
      }
      return [];
    },

    /**
     * Send message to a specific tab.
     * @param {number} tabId
     * @param {any} message
     * @returns {Promise<any>}
     */
    async sendMessage(tabId, message) {
      if (isChromeAvailable && chrome.tabs?.sendMessage) {
        return new Promise((resolve) => {
          chrome.tabs.sendMessage(tabId, message, (response) => {
            if (chrome.runtime.lastError) {
              resolve(null);
            } else {
              resolve(response);
            }
          });
        });
      }
      return null;
    },
  },
};

