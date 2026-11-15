import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateStatus, SafeModeController, STATUS_STATES } from '../../src/content/status.js';
import { MockDocument, MockElement } from '../helpers/dom-fixture.js';

test('status: reports off when extension is disabled', () => {
  const doc = new MockDocument();
  const res = evaluateStatus(doc, false);
  assert.equal(res.status, STATUS_STATES.DISABLED);
  assert.equal(res.label, 'Disabled');
});

test('status: reports error when safe mode is triggered', () => {
  const doc = new MockDocument();
  const safeMode = new SafeModeController({ maxErrors: 1 });
  safeMode.recordError(new Error('fail'));

  const res = evaluateStatus(doc, true, safeMode);
  assert.equal(res.status, STATUS_STATES.ERROR);
  assert.equal(res.label, 'Error');
  assert.ok(res.message.includes('turned itself off'));
});

test('status: reports on when style tag exists and root is marked', () => {
  const doc = new MockDocument();
  doc.documentElement.setAttribute('data-cfs-on', 'true');

  const styleEl = new MockElement('style', doc);
  styleEl.setAttribute('id', 'cfs-style');
  doc.head.appendChild(styleEl);

  const res = evaluateStatus(doc, true);
  assert.equal(res.status, STATUS_STATES.ACTIVE);
  assert.equal(res.label, 'Active');
});

test('status: reports partly when style tag or marker is missing', () => {
  const doc = new MockDocument();
  const res = evaluateStatus(doc, true);
  assert.equal(res.status, STATUS_STATES.PARTLY);
  assert.equal(res.label, 'Partially applied');
});
