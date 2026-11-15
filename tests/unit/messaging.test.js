import test from 'node:test';
import assert from 'node:assert/strict';
import { MESSAGE_TYPES, validateMessage } from '../../src/shared/messaging.js';

test('messaging: validates valid message types', () => {
  for (const type of Object.values(MESSAGE_TYPES)) {
    if (type === MESSAGE_TYPES.PREVIEW_THEME) {
      assert.equal(validateMessage({ type, payload: { themeId: 'test' } }).valid, true);
    } else if (type === MESSAGE_TYPES.SAVE_IMAGE) {
      assert.equal(validateMessage({ type, payload: { dataUrl: 'data:image/png;base64,test' } }).valid, true);
    } else {
      assert.equal(validateMessage({ type }).valid, true);
    }
  }
});

test('messaging: rejects unknown message types', () => {
  const result = validateMessage({ type: 'UNKNOWN_TYPE' });
  assert.equal(result.valid, false);
  assert.ok(result.error.includes('Unknown message type'));
});

test('messaging: rejects non-object message', () => {
  assert.equal(validateMessage(null).valid, false);
  assert.equal(validateMessage('GET_SETTINGS').valid, false);
});

test('messaging: validates PREVIEW_THEME payload requirements', () => {
  assert.equal(validateMessage({ type: MESSAGE_TYPES.PREVIEW_THEME, payload: null }).valid, false);
  assert.equal(validateMessage({ type: MESSAGE_TYPES.PREVIEW_THEME, payload: {} }).valid, false);
  assert.equal(validateMessage({ type: MESSAGE_TYPES.PREVIEW_THEME, payload: { themeId: 'slate' } }).valid, true);
  assert.equal(validateMessage({ type: MESSAGE_TYPES.PREVIEW_THEME, payload: { theme: { name: 'custom' } } }).valid, true);
});

test('messaging: validates SAVE_IMAGE payload requirements', () => {
  assert.equal(validateMessage({ type: MESSAGE_TYPES.SAVE_IMAGE, payload: null }).valid, false);
  assert.equal(validateMessage({ type: MESSAGE_TYPES.SAVE_IMAGE, payload: {} }).valid, false);
  assert.equal(validateMessage({ type: MESSAGE_TYPES.SAVE_IMAGE, payload: { dataUrl: 'data:image/png;base64,...' } }).valid, true);
});

