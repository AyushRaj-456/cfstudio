/**
 * CF Studio - Content Script
 * Runs at document_start on Codeforces.
 * Applies safe styling and background layer before paint with no white flash.
 * Manages live hover preview, background images, and first-run card.
 */

import { MESSAGE_TYPES, registerMessageHandler, sendRuntimeMessage } from '../shared/messaging.js';
import { getSettings, updateSettings } from '../shared/storage.js';
import { getBuiltinTheme } from '../themes/builtin.js';
import { resolveSettings } from '../shared/resolve-settings.js';
import { applyTheme, removeTheme } from './style-engine.js';
import { findAreas } from './codeforces-adapter.js';
import { classifyElement } from './classifier.js';
import { RouteObserver } from './route-observer.js';
import { SafeModeController, evaluateStatus } from './status.js';

function isCodeforcesPage() {
  if (typeof window === 'undefined' || !window.location) return false;
  const host = window.location.hostname;
  return host === 'codeforces.com' || host.endsWith('.codeforces.com');
}

let currentSettings = null;
let routeObserver = null;
let safeMode = null;
let isPreviewing = false;
let activeBlobUrl = null;
let backgroundBlocked = false;

function scanAndClassify(root = document) {
  try {
    const areas = findAreas(root);
    for (const { element, role } of areas) {
      classifyElement(element, role);
    }
  } catch (err) {
    if (safeMode) safeMode.recordError(err);
  }
}

function handleSafeModeTrip(err) {
  console.warn('CF Studio: Safe mode triggered due to repeated errors. Turning off styling.', err);
  removeTheme(document);
  if (routeObserver) {
    routeObserver.disconnect();
  }
}

async function resolveImageUrl(bgSettings) {
  if (!bgSettings || bgSettings.mode !== 'my-image') {
    if (activeBlobUrl) {
      URL.revokeObjectURL(activeBlobUrl);
      activeBlobUrl = null;
    }
    backgroundBlocked = false;
    return null;
  }

  try {
    const res = await sendRuntimeMessage(MESSAGE_TYPES.GET_IMAGE);
    if (!res || !res.image || !res.image.dataUrl) {
      return null;
    }

    const { dataUrl } = res.image;
    // Base64 data URL avoids Codeforces CSP 'blob:' blocking
    backgroundBlocked = false;
    return dataUrl;
  } catch {
    backgroundBlocked = true;
    return null;
  }
}

async function renderStyles() {
  if (!currentSettings || !currentSettings.enabled || safeMode.isTriggered) {
    removeTheme(document);
    return;
  }

  const loc = typeof window !== 'undefined' ? window.location : '';
  const resolved = resolveSettings(currentSettings, loc);
  const theme = resolved.theme;
  const imageUrl = await resolveImageUrl(resolved.background);

  applyTheme(document, theme, {
    background: resolved.background,
    transparency: resolved.transparency,
    font: resolved.font,
    imageUrl,
    animationsEnabled: currentSettings.animationsEnabled !== false,
  });
}

async function init() {
  if (!isCodeforcesPage()) return;

  safeMode = new SafeModeController({
    onSafeModeTriggered: handleSafeModeTrip,
  });

  try {
    currentSettings = await getSettings();

    // Run at document_start: apply theme immediately to eliminate white flash
    if (currentSettings && currentSettings.enabled && currentSettings.global?.themeId) {
      await renderStyles();
    }
  } catch (err) {
    safeMode.recordError(err);
  }

  // Set up DOM scanner, observer, and first-run card when DOM is ready
  function setupDom() {
    if (currentSettings && currentSettings.enabled && !safeMode.isTriggered && currentSettings.global?.themeId) {
      scanAndClassify(document);

      routeObserver = new RouteObserver({
        onUrlChange: () => {
          renderStyles();
          scanAndClassify(document);
        },
        onMutations: (addedNodes) => {
          for (const node of addedNodes) {
            scanAndClassify(node);
          }
        },
      });
      routeObserver.connect();
    }

    // Auto dark: re-evaluate when tab becomes visible without timers/polling
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && currentSettings?.enabled && !safeMode?.isTriggered) {
        renderStyles();
      }
    });

    // Auto dark: re-evaluate when system theme changes
    if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
      try {
        const mql = window.matchMedia('(prefers-color-scheme: dark)');
        mql.addEventListener('change', () => {
          if (currentSettings?.autoDark?.mode === 'system' && currentSettings?.enabled && !safeMode?.isTriggered) {
            renderStyles();
          }
        });
      } catch {}
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupDom, { once: true });
  } else {
    setupDom();
  }

  // Register message listeners
  registerMessageHandler({
    [MESSAGE_TYPES.GET_STATUS]: () => {
      const isEnabled = currentSettings ? Boolean(currentSettings.enabled) : true;
      const statusRes = evaluateStatus(document, isEnabled, safeMode);
      if (backgroundBlocked && statusRes.status === 'on') {
        return {
          status: 'partly',
          label: 'Partly on',
          message: 'Background blocked on this page.',
        };
      }
      return statusRes;
    },

    [MESSAGE_TYPES.PREVIEW_THEME]: (payload) => {
      let theme = payload?.theme;
      if (!theme && payload?.themeId) {
        theme = getBuiltinTheme(payload.themeId);
      }
      if (theme) {
        isPreviewing = true;
        applyTheme(document, theme, {
          background: currentSettings?.global?.background,
          transparency: currentSettings?.global?.transparency,
          font: currentSettings?.global?.font,
          animationsEnabled: currentSettings?.animationsEnabled !== false,
        });
      }
      return { acknowledged: true };
    },

    [MESSAGE_TYPES.END_PREVIEW]: () => {
      isPreviewing = false;
      renderStyles();
      return { acknowledged: true };
    },

    [MESSAGE_TYPES.SHOW_INTRO]: () => {
      // Intro card obsolete: no floating popup on Codeforces
      return { acknowledged: true };
    },

    [MESSAGE_TYPES.SETTINGS_CHANGED]: async () => {
      try {
        currentSettings = await getSettings();
        if (currentSettings.enabled && !safeMode.isTriggered && currentSettings.global?.themeId) {
          await renderStyles();
          scanAndClassify(document);
          if (routeObserver && !routeObserver.isConnected) {
            routeObserver.connect();
          }
        } else {
          removeTheme(document);
          if (routeObserver) {
            routeObserver.disconnect();
          }
        }
        return { acknowledged: true };
      } catch (err) {
        safeMode.recordError(err);
        return { error: err.message };
      }
    },

    [MESSAGE_TYPES.RETRY]: async () => {
      if (safeMode) {
        safeMode.reset();
      }
      if (currentSettings && currentSettings.enabled && currentSettings.global?.themeId) {
        await renderStyles();
        scanAndClassify(document);
        if (routeObserver) {
          routeObserver.connect();
        }
      }
      return evaluateStatus(document, currentSettings ? currentSettings.enabled : true, safeMode);
    },
  });
}

init().catch((err) => {
  if (safeMode) safeMode.recordError(err);
  console.error('CF Studio: Initialization error:', err);
});
