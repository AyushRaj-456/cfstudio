/**
 * CF Studio - Status & Safe Mode Controller
 * Real status reporting: off, checking, on, partly, unsupported, error.
 * Safe mode: 3 errors within 30s removes styling and sets error status.
 */

import { STYLE_TAG_ID } from './style-engine.js';

export const STATUS_STATES = Object.freeze({
  DISABLED: 'disabled',
  INITIALISING: 'initialising',
  ACTIVE: 'active',
  PARTLY: 'partly',
  UNSUPPORTED: 'unsupported',
  ERROR: 'error',
  // Backward compatibility aliases
  OFF: 'disabled',
  CHECKING: 'initialising',
  ON: 'active',
});

export const STATUS_LABELS = Object.freeze({
  [STATUS_STATES.DISABLED]: 'Disabled',
  [STATUS_STATES.INITIALISING]: 'Initialising',
  [STATUS_STATES.ACTIVE]: 'Active',
  [STATUS_STATES.PARTLY]: 'Partially applied',
  [STATUS_STATES.UNSUPPORTED]: 'Unsupported page',
  [STATUS_STATES.ERROR]: 'Error',
  // Backward compatibility lookup keys
  off: 'Disabled',
  checking: 'Initialising',
  on: 'Active',
  disabled: 'Disabled',
  initialising: 'Initialising',
  active: 'Active',
  partly: 'Partially applied',
  unsupported: 'Unsupported page',
  error: 'Error',
});

export class SafeModeController {
  constructor(options = {}) {
    this.maxErrors = options.maxErrors || 3;
    this.timeWindowMs = options.timeWindowMs || 30000; // 30 seconds
    this.errors = [];
    this.isTriggered = false;
    this.onSafeModeTriggered = options.onSafeModeTriggered || null;
  }

  recordError(err) {
    const now = Date.now();
    this.errors.push(now);

    // Keep only errors within the time window
    this.errors = this.errors.filter((timestamp) => now - timestamp <= this.timeWindowMs);

    if (this.errors.length >= this.maxErrors && !this.isTriggered) {
      this.isTriggered = true;
      if (typeof this.onSafeModeTriggered === 'function') {
        this.onSafeModeTriggered(err);
      }
    }
  }

  reset() {
    this.errors = [];
    this.isTriggered = false;
  }
}

/**
 * Determines the true live status of CF Studio on the current document.
 * @param {Document} doc
 * @param {boolean} isEnabled
 * @param {SafeModeController} [safeMode]
 * @returns {{ status: string, label: string, message?: string }}
 */
export function evaluateStatus(doc = document, isEnabled = true, safeMode = null) {
  if (safeMode && safeMode.isTriggered) {
    return {
      status: STATUS_STATES.ERROR,
      label: STATUS_LABELS[STATUS_STATES.ERROR],
      message: 'Something went wrong. CF Studio turned itself off on this page.',
    };
  }

  if (!isEnabled) {
    return {
      status: STATUS_STATES.DISABLED,
      label: STATUS_LABELS[STATUS_STATES.DISABLED],
    };
  }

  if (typeof window !== 'undefined' && window.location) {
    const host = window.location.hostname;
    if (host !== 'codeforces.com' && !host.endsWith('.codeforces.com')) {
      return {
        status: STATUS_STATES.UNSUPPORTED,
        label: STATUS_LABELS[STATUS_STATES.UNSUPPORTED],
      };
    }
  }

  if (!doc) {
    return {
      status: STATUS_STATES.INITIALISING,
      label: STATUS_LABELS[STATUS_STATES.INITIALISING],
    };
  }

  const styleEl = doc.getElementById(STYLE_TAG_ID);
  const root = doc.documentElement;
  const isMarked = root && root.getAttribute('data-cfs-on') === 'true';

  if (styleEl && isMarked) {
    return {
      status: STATUS_STATES.ACTIVE,
      label: STATUS_LABELS[STATUS_STATES.ACTIVE],
    };
  }

  return {
    status: STATUS_STATES.PARTLY,
    label: STATUS_LABELS[STATUS_STATES.PARTLY],
  };
}
