import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { BUILTIN_THEMES, getBuiltinTheme } from '../../src/themes/builtin.js';
import { IMPRESSIVE_ARTWORK } from '../../src/themes/impressive-art.js';
import { applyBackgroundLayer, BG_LAYER_ID } from '../../src/content/style-engine.js';
import { MockDocument } from '../helpers/dom-fixture.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');

test('impressive themes: all 10 impressive themes exist, are registered in BUILTIN_THEMES, and are light', () => {
  const impressiveThemes = BUILTIN_THEMES.filter((t) => t.category === 'impressive');
  assert.equal(impressiveThemes.length, 10, 'Exactly 10 Impressive themes must exist');

  const expectedIds = [
    'anime-studio',
    'sakura-dreams',
    'vintage-paper',
    'orchid',
    'forest-escape',
    'ocean-adventure',
    'rainy-day',
    'aurora-sky',
    'autumn-breeze',
    'snowfall',
  ];

  for (const id of expectedIds) {
    const theme = getBuiltinTheme(id);
    assert.ok(theme, `Theme "${id}" must exist`);
    assert.equal(theme.category, 'impressive');
    assert.equal(theme.kind, 'light', `Theme "${id}" must have kind="light" (All Impressive themes must be light)`);
    assert.equal(theme.animated, true);
    assert.ok(theme.artwork, `Theme "${id}" must have artwork`);
    assert.ok(theme.artwork.startsWith('data:image/svg+xml'), `Theme "${id}" artwork must be SVG data URI`);
    assert.ok(theme.animationEffect, `Theme "${id}" must have animationEffect defined`);
    assert.ok(IMPRESSIVE_ARTWORK[id], `IMPRESSIVE_ARTWORK must contain artwork for "${id}"`);
  }
});

test('curated light collection: exactly 5 light themes exist in BUILTIN_THEMES', () => {
  const lightThemes = BUILTIN_THEMES.filter((t) => t.category === 'standard' && t.kind === 'light');
  assert.equal(lightThemes.length, 5, 'Exactly 5 standard light themes must exist');

  const expectedIds = ['pure-light', 'paper', 'nord-light', 'rose', 'botanical'];
  for (const id of expectedIds) {
    const theme = getBuiltinTheme(id);
    assert.ok(theme, `Light theme "${id}" must exist`);
    assert.equal(theme.kind, 'light');
  }

  // Confirm obsolete light themes are removed
  const obsoleteIds = [
    'solarized-light',
    'lavender',
    'coastal',
    'editorial',
    'minimal-light',
    'cloudscape-light',
    'sakura-light',
  ];
  for (const id of obsoleteIds) {
    const found = BUILTIN_THEMES.find((t) => t.id === id);
    assert.equal(found, undefined, `Obsolete theme "${id}" must not exist in BUILTIN_THEMES`);
  }
});

test('popup ui: Live Preview box is completely removed from popup.html', () => {
  const popupHtml = fs.readFileSync(path.join(rootDir, 'src/popup/popup.html'), 'utf8');
  assert.equal(popupHtml.includes('top-preview-box'), false, 'popup.html must not contain top-preview-box');
  assert.equal(popupHtml.includes('mini-cf-window'), false, 'popup.html must not contain mini-cf-window');
  assert.equal(popupHtml.includes('Live Preview:'), false, 'popup.html must not contain "Live Preview:" header');

  // Verify filter pills have exactly Light, Dark, Impressive, and Custom Palette
  assert.equal(popupHtml.includes('data-filter="all"'), false, 'All filter pill must be removed');
  assert.ok(popupHtml.includes('data-filter="light"'), 'Light filter pill must exist');
  assert.ok(popupHtml.includes('data-filter="dark"'), 'Dark filter pill must exist');
  assert.ok(popupHtml.includes('data-filter="impressive"'), 'Impressive filter pill must exist');
  assert.ok(popupHtml.includes('btn-toggle-custom-palette'), 'Custom Palette toggle button must exist');
});

test('popup ui: Custom Palette editor is hidden by default and button has emphasized styling', () => {
  const popupHtml = fs.readFileSync(path.join(rootDir, 'src/popup/popup.html'), 'utf8');
  assert.ok(
    popupHtml.includes('id="custom-theme-editor" hidden'),
    'custom-theme-editor must have hidden attribute by default in popup.html'
  );

  const popupCss = fs.readFileSync(path.join(rootDir, 'src/popup/popup.css'), 'utf8');
  assert.ok(popupCss.includes('.cfs-custom-palette-btn'), 'CSS must define .cfs-custom-palette-btn');
  assert.ok(popupCss.includes('.cfs-card-art-preview'), 'CSS must define .cfs-card-art-preview for impressive theme cards');
});

test('popup ui: Atmospheric animations option toggle exists in popup.html', () => {
  const popupHtml = fs.readFileSync(path.join(rootDir, 'src/popup/popup.html'), 'utf8');
  assert.ok(popupHtml.includes('id="toggle-impressive-animations"'), 'toggle-impressive-animations must exist');
  assert.ok(popupHtml.includes('Atmospheric animations'), 'Atmospheric animations label must exist');
});

test('impressive theme artwork & canvas: renders in background layer when mode is none', () => {
  const doc = new MockDocument();
  const theme = getBuiltinTheme('rainy-day');
  assert.equal(theme.category, 'impressive');
  assert.equal(theme.kind, 'light');

  // When mode is 'none', Impressive theme artwork should still render in background layer
  const layer = applyBackgroundLayer(doc, { mode: 'none' }, null, { theme, animated: true, animationsEnabled: true });
  assert.ok(layer, 'Background layer should exist for Impressive theme even when mode is none');
  assert.equal(layer.id, BG_LAYER_ID);

  const imgDiv = doc.getElementById('cfs-bg-image');
  assert.ok(imgDiv, 'cfs-bg-image must exist in layer');
  assert.ok(imgDiv.style.backgroundImage.includes('data:image/svg+xml'), 'Background image must contain SVG data URI');

  const canvas = doc.getElementById('cfs-bg-canvas');
  assert.ok(canvas, 'cfs-bg-canvas must exist in layer for animated Impressive theme');
});
