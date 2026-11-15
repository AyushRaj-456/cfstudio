import test from 'node:test';
import assert from 'node:assert/strict';
import { applyTheme, removeTheme, STYLE_TAG_ID } from '../../src/content/style-engine.js';
import { classifyElement, removeMarkers } from '../../src/content/classifier.js';
import { RouteObserver } from '../../src/content/route-observer.js';
import { MockDocument, MockElement, MockMutationObserver } from '../helpers/dom-fixture.js';

test('style engine: injects exactly ONE <style id="cfs-style">', () => {
  const doc = new MockDocument();
  assert.equal(doc.getElementById(STYLE_TAG_ID), null);

  const styleEl = applyTheme(doc);
  assert.ok(styleEl);
  assert.equal(doc.getElementById(STYLE_TAG_ID), styleEl);
  assert.equal(doc.querySelectorAll('#' + STYLE_TAG_ID).length, 1);
});

test('style engine: repeated calls are idempotent and do not duplicate style tag', () => {
  const doc = new MockDocument();
  applyTheme(doc);
  applyTheme(doc);
  applyTheme(doc);

  assert.equal(doc.querySelectorAll('#' + STYLE_TAG_ID).length, 1);
  assert.equal(doc.documentElement.getAttribute('data-cfs-on'), 'true');
});

test('style engine: removeTheme removes style tag, root attribute, and all data-cfs-* markers', () => {
  const doc = new MockDocument();

  // Create some simulated page elements
  const header = new MockElement('div', doc);
  header.setAttribute('id', 'header');
  doc.body.appendChild(header);

  const content = new MockElement('div', doc);
  content.setAttribute('class', 'roundbox');
  doc.body.appendChild(content);

  // Apply theme and classify
  applyTheme(doc);
  classifyElement(header, 'header');
  classifyElement(content, 'content');

  assert.ok(doc.getElementById(STYLE_TAG_ID));
  assert.equal(doc.documentElement.getAttribute('data-cfs-on'), 'true');
  assert.equal(header.getAttribute('data-cfs-role'), 'header');
  assert.equal(content.getAttribute('data-cfs-role'), 'content');

  // Now call removeTheme
  removeTheme(doc);

  // Style tag gone
  assert.equal(doc.getElementById(STYLE_TAG_ID), null);
  // Root attribute gone
  assert.equal(doc.documentElement.hasAttribute('data-cfs-on'), false);
  // All data-cfs-* attributes gone
  assert.equal(header.hasAttribute('data-cfs-role'), false);
  assert.equal(header.hasAttribute('data-cfs-confidence'), false);
  assert.equal(content.hasAttribute('data-cfs-role'), false);
  assert.equal(content.hasAttribute('data-cfs-confidence'), false);
  assert.equal(doc.querySelectorAll('[data-cfs-role]').length, 0);
});

test('route observer: prevents duplicate observers on multiple connect() calls', () => {
  const doc = new MockDocument();
  let mutationCount = 0;

  const observer = new RouteObserver({
    MutationObserver: MockMutationObserver,
    onMutations: () => {
      mutationCount++;
    },
  });

  assert.equal(observer.isConnected, false);
  observer.connect(doc.body);
  assert.equal(observer.isConnected, true);

  // Second call should be a no-op
  observer.connect(doc.body);
  assert.equal(observer.isConnected, true);

  observer.disconnect();
  assert.equal(observer.isConnected, false);
});
