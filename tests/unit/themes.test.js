import test from 'node:test';
import assert from 'node:assert/strict';
import { BUILTIN_THEMES, getBuiltinTheme, isBuiltinTheme } from '../../src/themes/builtin.js';
import { getLuminance } from '../../src/shared/contrast.js';

test('themes: all 16 built-in themes (5 light + 1 obsidian dark + 10 impressive light) exist with correct properties', () => {
  const lightThemeIds = ['pure-light', 'paper', 'nord-light', 'rose', 'botanical'];
  const impressiveThemeIds = [
    'anime-studio', 'sakura-dreams', 'vintage-paper', 'orchid', 'forest-escape',
    'ocean-adventure', 'rainy-day', 'aurora-sky', 'autumn-breeze', 'snowfall',
  ];

  assert.equal(BUILTIN_THEMES.length, 16);

  const tokenKeys = [
    'page-bg', 'header-bg', 'content-bg', 'surface-1', 'surface-2',
    'table-header-bg', 'table-row-bg', 'table-row-alt-bg', 'text',
    'text-muted', 'link', 'link-hover', 'border', 'input-bg',
    'input-text', 'input-border', 'button-bg', 'button-text',
    'button-hover-bg', 'focus', 'code-bg', 'accent',
  ];

  // 1. Verify 5 light themes
  for (const id of lightThemeIds) {
    const theme = getBuiltinTheme(id);
    assert.ok(theme, `Theme ${id} must exist`);
    assert.equal(theme.id, id);
    assert.equal(theme.builtin, true);
    assert.equal(theme.kind, 'light');
    assert.ok(isBuiltinTheme(id));

    // Light-Theme: page-bg luminance >= 0.5
    const pageLuminance = getLuminance(theme.tokens['page-bg']);
    assert.ok(pageLuminance >= 0.5, `Theme ${id} has dark page-bg luminance ${pageLuminance}`);

    for (const key of tokenKeys) {
      assert.ok(theme.tokens[key], `Missing token "${key}" in theme "${id}"`);
      assert.match(theme.tokens[key], /^#[0-9a-fA-F]{6}$/);
    }
  }

  // 2. Verify Obsidian dark theme
  const obsidian = getBuiltinTheme('obsidian');
  assert.ok(obsidian, 'Obsidian theme must exist');
  assert.equal(obsidian.id, 'obsidian');
  assert.equal(obsidian.name, 'Obsidian');
  assert.equal(obsidian.builtin, true);
  assert.equal(obsidian.kind, 'dark');
  assert.equal(obsidian.category, 'dark');
  assert.equal(obsidian.palette.primary, '#11151d');
  assert.equal(obsidian.palette.secondary, '#202630');
  assert.equal(obsidian.palette.tertiary, '#35c6b0');

  const obsidianPageLum = getLuminance(obsidian.tokens['page-bg']);
  assert.ok(obsidianPageLum < 0.1, `Obsidian must have deep dark page-bg luminance < 0.1, got ${obsidianPageLum}`);

  for (const key of tokenKeys) {
    assert.ok(obsidian.tokens[key], `Missing token "${key}" in Obsidian`);
    assert.match(obsidian.tokens[key], /^#[0-9a-fA-F]{6}$/);
  }

  // 3. Verify all 10 Impressive themes (All strictly Light themes with artwork and animations)
  for (const id of impressiveThemeIds) {
    const theme = getBuiltinTheme(id);
    assert.ok(theme, `Impressive theme ${id} must exist`);
    assert.equal(theme.id, id);
    assert.equal(theme.builtin, true);
    assert.equal(theme.category, 'impressive');
    assert.equal(theme.kind, 'light', `Impressive theme ${id} must have kind="light"`);
    assert.ok(isBuiltinTheme(id));
    assert.equal(theme.animated, true);
    assert.ok(theme.artwork, `Impressive theme ${id} must have artwork`);
    assert.ok(theme.artwork.startsWith('data:image/svg+xml'), `Impressive theme ${id} artwork must be SVG data URI`);
    assert.ok(theme.animationEffect, `Impressive theme ${id} must specify animationEffect`);

    // Verify all Impressive themes have light surfaces and readable dark text
    const pageLum = getLuminance(theme.tokens['page-bg']);
    const contentLum = getLuminance(theme.tokens['content-bg']);
    assert.ok(pageLum >= 0.5, `Impressive theme ${id} page-bg must be light (lum >= 0.5), got ${pageLum}`);
    assert.ok(contentLum >= 0.5, `Impressive theme ${id} content-bg must be light (lum >= 0.5), got ${contentLum}`);

    for (const key of tokenKeys) {
      assert.ok(theme.tokens[key], `Missing token "${key}" in theme "${id}"`);
      assert.match(theme.tokens[key], /^#[0-9a-fA-F]{6}$/);
    }
  }
});

test('themes: built-in themes array and objects are deeply frozen', () => {
  assert.ok(Object.isFrozen(BUILTIN_THEMES));
  for (const theme of BUILTIN_THEMES) {
    assert.ok(Object.isFrozen(theme));
    assert.ok(Object.isFrozen(theme.tokens));
  }
});
