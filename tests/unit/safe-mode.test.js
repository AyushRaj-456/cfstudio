import test from 'node:test';
import assert from 'node:assert/strict';
import { SafeModeController } from '../../src/content/status.js';

test('safe mode: triggers after 3 errors within 30s', () => {
  let triggered = false;
  let receivedError = null;

  const controller = new SafeModeController({
    maxErrors: 3,
    timeWindowMs: 30000,
    onSafeModeTriggered: (err) => {
      triggered = true;
      receivedError = err;
    },
  });

  assert.equal(controller.isTriggered, false);

  controller.recordError(new Error('err 1'));
  assert.equal(controller.isTriggered, false);
  assert.equal(triggered, false);

  controller.recordError(new Error('err 2'));
  assert.equal(controller.isTriggered, false);
  assert.equal(triggered, false);

  const thirdError = new Error('err 3');
  controller.recordError(thirdError);
  assert.equal(controller.isTriggered, true);
  assert.equal(triggered, true);
  assert.equal(receivedError, thirdError);
});

test('safe mode: resetting restores normal operation', () => {
  const controller = new SafeModeController({ maxErrors: 2 });
  controller.recordError(new Error('1'));
  controller.recordError(new Error('2'));
  assert.equal(controller.isTriggered, true);

  controller.reset();
  assert.equal(controller.isTriggered, false);
  assert.equal(controller.errors.length, 0);
});
