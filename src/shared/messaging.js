/**
 * Typed messaging with payload validation for CF Studio.
 */

import { browserApi } from './browser-api.js';
import { isObject, isString } from './validators.js';

export const MESSAGE_TYPES = Object.freeze({
  GET_SETTINGS: 'GET_SETTINGS',
  SETTINGS_CHANGED: 'SETTINGS_CHANGED',
  GET_STATUS: 'GET_STATUS',
  GET_IMAGE: 'GET_IMAGE',
  SAVE_IMAGE: 'SAVE_IMAGE',
  DELETE_IMAGE: 'DELETE_IMAGE',
  PREVIEW_THEME: 'PREVIEW_THEME',
  END_PREVIEW: 'END_PREVIEW',
  RETRY: 'RETRY',
  SHOW_INTRO: 'SHOW_INTRO',
});

/**
 * Validates a message structure and payload.
 * @param {any} message
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateMessage(message) {
  if (!isObject(message)) {
    return { valid: false, error: 'Message must be an object' };
  }

  const { type, payload } = message;

  if (!isString(type) || !Object.values(MESSAGE_TYPES).includes(type)) {
    return { valid: false, error: `Unknown message type: ${type}` };
  }

  // Type-specific payload validation
  switch (type) {
    case MESSAGE_TYPES.GET_SETTINGS:
      if (payload !== undefined && payload !== null && !isObject(payload)) {
        return { valid: false, error: 'GET_SETTINGS payload must be an object or empty' };
      }
      break;

    case MESSAGE_TYPES.SETTINGS_CHANGED:
      if (payload !== undefined && payload !== null && !isObject(payload)) {
        return { valid: false, error: 'SETTINGS_CHANGED payload must be an object or empty' };
      }
      break;

    case MESSAGE_TYPES.GET_STATUS:
    case MESSAGE_TYPES.GET_IMAGE:
    case MESSAGE_TYPES.DELETE_IMAGE:
    case MESSAGE_TYPES.END_PREVIEW:
    case MESSAGE_TYPES.RETRY:
    case MESSAGE_TYPES.SHOW_INTRO:
      // No payload required
      break;

    case MESSAGE_TYPES.SAVE_IMAGE:
      if (!isObject(payload) || !payload.dataUrl) {
        return { valid: false, error: 'SAVE_IMAGE payload must contain dataUrl' };
      }
      break;

    case MESSAGE_TYPES.PREVIEW_THEME:
      if (!isObject(payload) || (!isObject(payload.theme) && !isString(payload.themeId))) {
        return { valid: false, error: 'PREVIEW_THEME payload must contain theme or themeId' };
      }
      break;

    default:
      return { valid: false, error: `Unhandled message type: ${type}` };
  }

  return { valid: true };
}

/**
 * Sends a typed, validated message via chrome.runtime.
 * @param {string} type
 * @param {any} [payload]
 * @returns {Promise<any>}
 */
export async function sendRuntimeMessage(type, payload = null) {
  const message = { type, payload };
  const validation = validateMessage(message);
  if (!validation.valid) {
    throw new Error(`Invalid message: ${validation.error}`);
  }
  return browserApi.runtime.sendMessage(message);
}

/**
 * Sends a typed, validated message to a specific tab.
 * @param {number} tabId
 * @param {string} type
 * @param {any} [payload]
 * @returns {Promise<any>}
 */
export async function sendTabMessage(tabId, type, payload = null) {
  const message = { type, payload };
  const validation = validateMessage(message);
  if (!validation.valid) {
    throw new Error(`Invalid message: ${validation.error}`);
  }
  return browserApi.tabs.sendMessage(tabId, message);
}

/**
 * Registers a dispatch handler for incoming typed messages.
 * @param {Record<string, (payload: any, sender: any) => Promise<any> | any>} handlers
 * @returns {() => void} Unsubscribe function
 */
export function registerMessageHandler(handlers) {
  return browserApi.runtime.onMessage((message, sender, sendResponse) => {
    const validation = validateMessage(message);
    if (!validation.valid) {
      console.warn('CF Studio: Ignored invalid message:', validation.error);
      return false;
    }

    const handler = handlers[message.type];
    if (typeof handler === 'function') {
      try {
        const result = handler(message.payload, sender);
        if (result && typeof result.then === 'function') {
          result
            .then((res) => sendResponse(res))
            .catch((err) => {
              console.error(`CF Studio: Error handling ${message.type}:`, err);
              sendResponse({ error: err.message });
            });
          return true; // Keep channel open for async response
        } else {
          sendResponse(result);
        }
      } catch (err) {
        console.error(`CF Studio: Error executing handler for ${message.type}:`, err);
        sendResponse({ error: err.message });
      }
    }
    return false;
  });
}
