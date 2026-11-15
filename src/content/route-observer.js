/**
 * CF Studio - Route and Mutation Observer
 * Batched, debounced MutationObserver (150ms).
 * Ignores its own changes (style tag, data-cfs-* markers).
 * Detects route changes via popstate and location check.
 * Strictly no polling. Idempotent: no duplicate observers.
 */

import { isExtensionElement } from './preserve-rules.js';

export class RouteObserver {
  constructor(options = {}) {
    this.options = options;
    this.debounceMs = options.debounceMs || 150;
    this.observer = null;
    this.timeoutId = null;
    this.pendingNodes = new Set();
    this.currentHref = typeof window !== 'undefined' ? window.location?.href || '' : '';
    this.isConnected = false;

    this.handlePopState = this.handlePopState.bind(this);
    this.handleMutationBatch = this.handleMutationBatch.bind(this);
  }

  handlePopState() {
    this.checkUrlChange();
  }

  checkUrlChange() {
    if (typeof window === 'undefined' || !window.location) return;
    const newHref = window.location.href;
    if (newHref !== this.currentHref) {
      const oldHref = this.currentHref;
      this.currentHref = newHref;
      if (typeof this.options.onUrlChange === 'function') {
        this.options.onUrlChange(newHref, oldHref);
      }
    }
  }

  handleMutationBatch(mutations) {
    let hasRelevantMutations = false;

    for (const mutation of mutations) {
      // Ignore extension-owned nodes or attribute mutations on extension markers
      if (mutation.target && isExtensionElement(mutation.target)) {
        continue;
      }
      if (mutation.type === 'attributes') {
        const attr = mutation.attributeName || '';
        if (attr.startsWith('data-cfs-') || attr === 'id' && mutation.target.id === 'cfs-style') {
          continue;
        }
      }

      if (mutation.addedNodes && mutation.addedNodes.length > 0) {
        for (const node of mutation.addedNodes) {
          if (node.nodeType === 1 && !isExtensionElement(node)) {
            this.pendingNodes.add(node);
            hasRelevantMutations = true;
          }
        }
      }
    }

    if (!hasRelevantMutations) return;

    if (this.timeoutId !== null) {
      clearTimeout(this.timeoutId);
    }

    this.timeoutId = setTimeout(() => {
      this.timeoutId = null;
      this.checkUrlChange();

      if (this.pendingNodes.size > 0) {
        const nodesToProcess = Array.from(this.pendingNodes);
        this.pendingNodes.clear();
        if (typeof this.options.onMutations === 'function') {
          this.options.onMutations(nodesToProcess);
        }
      }
    }, this.debounceMs);
  }

  connect(targetNode) {
    if (this.isConnected) return; // Prevent duplicate observers
    const MutationObserverClass =
      this.options.MutationObserver ||
      (typeof MutationObserver !== 'undefined' ? MutationObserver : globalThis.MutationObserver);
    if (!MutationObserverClass) return;

    const target =
      targetNode ||
      (typeof document !== 'undefined'
        ? document.getElementById('pageContent') || document.body || document.documentElement
        : null);
    if (!target) return;

    this.observer = new MutationObserverClass(this.handleMutationBatch);
    this.observer.observe(target, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'id'],
    });

    const win = this.options.window || (typeof window !== 'undefined' ? window : globalThis.window);
    if (win && win.addEventListener) {
      win.addEventListener('popstate', this.handlePopState);
      this.currentHref = win.location?.href || '';
    }
    this.isConnected = true;
  }

  disconnect() {
    if (!this.isConnected) return;

    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }

    const win = this.options.window || (typeof window !== 'undefined' ? window : globalThis.window);
    if (win && win.removeEventListener) {
      win.removeEventListener('popstate', this.handlePopState);
    }

    if (this.timeoutId !== null) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }

    this.pendingNodes.clear();
    this.isConnected = false;
  }
}
