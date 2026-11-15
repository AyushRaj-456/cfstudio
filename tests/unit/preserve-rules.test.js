import test from 'node:test';
import assert from 'node:assert/strict';
import { shouldPreserve, isExtensionElement } from '../../src/content/preserve-rules.js';
import { MockElement } from '../helpers/dom-fixture.js';

test('preserve rules: verdict elements are untouched', () => {
  const el = new MockElement('span');
  el.setAttribute('class', 'verdict-accepted');
  assert.equal(shouldPreserve(el), true);

  const elRejected = new MockElement('span');
  elRejected.setAttribute('class', 'verdict-rejected');
  assert.equal(shouldPreserve(elRejected), true);
});

test('preserve rules: user rank and rating elements are untouched', () => {
  const redUser = new MockElement('a');
  redUser.setAttribute('class', 'rated-user user-red');
  assert.equal(shouldPreserve(redUser), true);

  const legendary = new MockElement('span');
  legendary.setAttribute('class', 'user-legendary');
  assert.equal(shouldPreserve(legendary), true);
});

test('preserve rules: tags and notices are untouched', () => {
  const tag = new MockElement('span');
  tag.setAttribute('class', 'tag-box');
  assert.equal(shouldPreserve(tag), true);

  const notice = new MockElement('div');
  notice.setAttribute('class', 'notice');
  assert.equal(shouldPreserve(notice), true);
});

test('preserve rules: syntax highlighting tokens are untouched', () => {
  for (const token of ['pln', 'kwd', 'str', 'pun', 'typ', 'lit', 'com']) {
    const el = new MockElement('span');
    el.setAttribute('class', token);
    assert.equal(shouldPreserve(el), true, `Token ${token} should be preserved`);
  }
});

test('preserve rules: SVG, canvas, and media are untouched', () => {
  assert.equal(shouldPreserve(new MockElement('svg')), true);
  assert.equal(shouldPreserve(new MockElement('path')), true);
  assert.equal(shouldPreserve(new MockElement('canvas')), true);
  assert.equal(shouldPreserve(new MockElement('img')), true);
  assert.equal(shouldPreserve(new MockElement('picture')), true);
});

test('preserve rules: avatar and logo elements are untouched', () => {
  const avatar = new MockElement('div');
  avatar.setAttribute('class', 'user-avatar');
  assert.equal(shouldPreserve(avatar), true);

  const logo = new MockElement('a');
  logo.setAttribute('class', 'logo');
  assert.equal(shouldPreserve(logo), true);
});

test('preserve rules: extension own elements are identified', () => {
  const styleEl = new MockElement('style');
  styleEl.setAttribute('id', 'cfs-style');
  assert.equal(isExtensionElement(styleEl), true);

  const hostEl = new MockElement('div');
  hostEl.setAttribute('data-cfs-host', 'true');
  assert.equal(isExtensionElement(hostEl), true);
});
