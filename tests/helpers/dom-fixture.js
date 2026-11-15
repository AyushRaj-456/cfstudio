/**
 * Lightweight, zero-dependency DOM test fixture environment for Node.js test runner.
 * Simulates DOM tree and MutationObserver to verify style-engine, observer, and cleanup.
 */

export class MockElement {
  constructor(tagName, ownerDocument) {
    this.tagName = tagName.toUpperCase();
    this.ownerDocument = ownerDocument;
    this.id = '';
    this.className = '';
    this.textContent = '';
    this.style = { cssText: '' };
    this.attributes = new Map();
    this.children = [];
    this.parentElement = null;
    this.eventListeners = new Map();
  }

  attachShadow() {
    this.shadowRoot = new MockElement('shadow-root', this.ownerDocument);
    this.shadowRoot.parentElement = this;
    return this.shadowRoot;
  }

  getElementById(id) {
    function search(node) {
      if (node.id === id) return node;
      for (const child of node.children) {
        const found = search(child);
        if (found) return found;
      }
      return null;
    }
    return search(this);
  }

  get nodeType() {
    return 1;
  }

  get parentNode() {
    return this.parentElement;
  }

  setAttribute(name, value) {
    const oldValue = this.attributes.get(name);
    this.attributes.set(name, String(value));
    if (name === 'id') this.id = String(value);
    if (name === 'class') this.className = String(value);

    if (this.ownerDocument) {
      this.ownerDocument._notifyMutation({
        type: 'attributes',
        target: this,
        attributeName: name,
        oldValue,
      });
    }
  }

  getAttribute(name) {
    return this.attributes.has(name) ? this.attributes.get(name) : null;
  }

  hasAttribute(name) {
    return this.attributes.has(name);
  }

  removeAttribute(name) {
    const oldValue = this.attributes.get(name);
    this.attributes.delete(name);
    if (name === 'id') this.id = '';
    if (name === 'class') this.className = '';

    if (this.ownerDocument) {
      this.ownerDocument._notifyMutation({
        type: 'attributes',
        target: this,
        attributeName: name,
        oldValue,
      });
    }
  }

  appendChild(child) {
    if (child.parentElement) {
      child.parentElement.removeChild(child);
    }
    child.parentElement = this;
    child.ownerDocument = this.ownerDocument;
    this.children.push(child);

    if (this.ownerDocument) {
      this.ownerDocument._notifyMutation({
        type: 'childList',
        target: this,
        addedNodes: [child],
        removedNodes: [],
      });
    }
    return child;
  }

  removeChild(child) {
    const index = this.children.indexOf(child);
    if (index !== -1) {
      this.children.splice(index, 1);
      child.parentElement = null;

      if (this.ownerDocument) {
        this.ownerDocument._notifyMutation({
          type: 'childList',
          target: this,
          addedNodes: [],
          removedNodes: [child],
        });
      }
    }
    return child;
  }

  addEventListener(type, listener) {
    if (!this.eventListeners.has(type)) {
      this.eventListeners.set(type, new Set());
    }
    this.eventListeners.get(type).add(listener);
  }

  removeEventListener(type, listener) {
    if (this.eventListeners.has(type)) {
      this.eventListeners.get(type).delete(listener);
    }
  }

  matches(selector) {
    const matchFn = parseSimpleSelector(selector);
    return matchFn(this);
  }

  closest(selector) {
    let curr = this;
    while (curr) {
      if (curr.matches && curr.matches(selector)) {
        return curr;
      }
      curr = curr.parentElement;
    }
    return null;
  }

  querySelectorAll(selector) {
    const results = [];
    const matchFn = parseSimpleSelector(selector);

    function walk(node) {
      for (const child of node.children) {
        if (matchFn(child)) {
          results.push(child);
        }
        walk(child);
      }
    }

    walk(this);
    return results;
  }
}

function parseSimpleSelector(selector) {
  const parts = selector.split(',').map((s) => s.trim());

  return function matches(el) {
    for (const part of parts) {
      if (matchSingle(el, part)) return true;
    }
    return false;
  };
}

function matchSingle(el, sel) {
  if (!el || !sel) return false;
  sel = sel.trim();

  // Handle :not(...)
  if (sel.includes(':not(')) {
    const [mainSel, notPart] = sel.split(':not(');
    const notSel = notPart.replace(/\).*$/, '');
    const mainMatches = !mainSel || matchSingle(el, mainSel);
    const notMatches = matchSingle(el, notSel);
    return mainMatches && !notMatches;
  }

  // Descendant / child selector (e.g. #pageContent > div)
  if (sel.includes('>')) {
    const parts = sel.split('>').map((s) => s.trim());
    const last = parts[parts.length - 1];
    return matchSingle(el, last);
  }

  // Multiple classes (e.g. .roundbox.sidebox or .roundbox.topic)
  if (sel.startsWith('.') && sel.slice(1).includes('.')) {
    const classes = sel.slice(1).split('.');
    return classes.every((c) => el.className && el.className.split(/\s+/).includes(c));
  }

  // Simple attribute selectors: [data-cfs-role], [data-cfs-confidence]
  if (sel.startsWith('[') && sel.endsWith(']')) {
    const inside = sel.slice(1, -1);
    if (inside.includes('=')) {
      const [attr, val] = inside.split('=').map((s) => s.replace(/["']/g, '').trim());
      return el.getAttribute(attr) === val;
    }
    return el.hasAttribute(inside);
  }

  // ID selector
  if (sel.startsWith('#')) {
    return el.id === sel.slice(1);
  }

  // Class selector
  if (sel.startsWith('.')) {
    const cls = sel.slice(1);
    return el.className && el.className.split(/\s+/).includes(cls);
  }

  // Tag.class
  if (sel.includes('.')) {
    const [tag, cls] = sel.split('.');
    const tagMatch = !tag || el.tagName.toLowerCase() === tag.toLowerCase();
    const classMatch = el.className && el.className.split(/\s+/).includes(cls);
    return tagMatch && classMatch;
  }

  // Tag selector
  if (/^[a-zA-Z0-9]+$/.test(sel)) {
    return el.tagName.toLowerCase() === sel.toLowerCase();
  }

  return false;
}

export class MockDocument {
  constructor() {
    this.observers = new Set();
    this.eventListeners = new Map();
    this.documentElement = new MockElement('html', this);
    this.head = new MockElement('head', this);
    this.body = new MockElement('body', this);
    this.documentElement.appendChild(this.head);
    this.documentElement.appendChild(this.body);
  }

  addEventListener(type, listener) {
    if (!this.eventListeners.has(type)) {
      this.eventListeners.set(type, new Set());
    }
    this.eventListeners.get(type).add(listener);
  }

  removeEventListener(type, listener) {
    if (this.eventListeners.has(type)) {
      this.eventListeners.get(type).delete(listener);
    }
  }

  createElement(tagName) {
    return new MockElement(tagName, this);
  }

  getElementById(id) {
    function search(node) {
      if (node.id === id) return node;
      for (const child of node.children) {
        const found = search(child);
        if (found) return found;
      }
      return null;
    }
    return search(this.documentElement);
  }

  matches(selector) {
    const matchFn = parseSimpleSelector(selector);
    return matchFn(this);
  }

  closest(selector) {
    let curr = this;
    while (curr) {
      if (curr.matches && curr.matches(selector)) {
        return curr;
      }
      curr = curr.parentElement;
    }
    return null;
  }

  querySelectorAll(selector) {
    const results = [];
    const matchFn = parseSimpleSelector(selector);

    function walk(node) {
      if (matchFn(node)) {
        results.push(node);
      }
      for (const child of node.children) {
        walk(child);
      }
    }

    walk(this.documentElement);
    return results;
  }

  contains(node) {
    if (!node) return false;
    let curr = node;
    while (curr) {
      if (curr === this.documentElement || curr === this) return true;
      curr = curr.parentElement;
    }
    return false;
  }

  _notifyMutation(mutation) {
    for (const obs of this.observers) {
      obs._pushMutation(mutation);
    }
  }
}

export class MockMutationObserver {
  constructor(callback) {
    this.callback = callback;
    this.target = null;
    this.queue = [];
  }

  observe(target) {
    this.target = target;
    const doc = target.ownerDocument || target;
    if (doc.observers) {
      doc.observers.add(this);
    }
  }

  disconnect() {
    if (this.target) {
      const doc = this.target.ownerDocument || this.target;
      if (doc.observers) {
        doc.observers.delete(this);
      }
      this.target = null;
    }
    this.queue = [];
  }

  _pushMutation(mutation) {
    this.queue.push(mutation);
    this.callback(this.queue.splice(0));
  }
}
