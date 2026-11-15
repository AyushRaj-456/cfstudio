import test from 'node:test';
import assert from 'node:assert/strict';
import { generateThemeFromPixels } from '../../src/shared/colors-from-image.js';
import { getContrastRatio } from '../../src/shared/contrast.js';

test('colors from image: flat monochrome image returns clear error message', () => {
  // 64x64 flat grey image
  const size = 64 * 64 * 4;
  const pixels = new Uint8ClampedArray(size);
  for (let i = 0; i < size; i += 4) {
    pixels[i] = 100;
    pixels[i + 1] = 100;
    pixels[i + 2] = 100;
    pixels[i + 3] = 255;
  }

  const res = generateThemeFromPixels(pixels, 64, 64, 'dark');
  assert.equal(res.success, false);
  assert.equal(res.error, 'Image is too plain to create a theme.');
});

test('colors from image: empty or invalid pixels returns image error', () => {
  const res = generateThemeFromPixels([], 0, 0);
  assert.equal(res.success, false);
  assert.equal(res.error, 'This file is not an image.');
});

test('colors from image: sample image generates valid dark theme with text contrast >= 4.5:1', () => {
  const width = 64;
  const height = 64;
  const pixels = new Uint8ClampedArray(width * height * 4);

  // Synthesize sample image with varied colors (deep blue, vibrant amber, teal)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      if (y < 32) {
        pixels[idx] = 25;
        pixels[idx + 1] = 60;
        pixels[idx + 2] = 180;
      } else {
        pixels[idx] = 230;
        pixels[idx + 1] = 140;
        pixels[idx + 2] = 30;
      }
      pixels[idx + 3] = 255;
    }
  }

  const res = generateThemeFromPixels(pixels, width, height, 'dark');
  assert.equal(res.success, true);
  assert.ok(res.theme);
  assert.equal(res.theme.id, 'from-image');
  assert.equal(res.theme.name, 'From image');
  assert.equal(res.theme.kind, 'dark');

  const tokens = res.theme.tokens;
  assert.ok(getContrastRatio(tokens['text'], tokens['content-bg']) >= 4.5);
  assert.ok(getContrastRatio(tokens['text'], tokens['page-bg']) >= 4.5);
  assert.ok(getContrastRatio(tokens['input-text'], tokens['input-bg']) >= 4.5);
  assert.ok(getContrastRatio(tokens['button-text'], tokens['button-bg']) >= 4.5);
});

test('colors from image: sample image generates valid light theme with text contrast >= 4.5:1', () => {
  const width = 64;
  const height = 64;
  const pixels = new Uint8ClampedArray(width * height * 4);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      pixels[idx] = (x * 4) % 256;
      pixels[idx + 1] = (y * 4) % 256;
      pixels[idx + 2] = ((x + y) * 2) % 256;
      pixels[idx + 3] = 255;
    }
  }

  const res = generateThemeFromPixels(pixels, width, height, 'light');
  assert.equal(res.success, true);
  assert.equal(res.theme.kind, 'light');

  const tokens = res.theme.tokens;
  assert.ok(getContrastRatio(tokens['text'], tokens['content-bg']) >= 4.5);
  assert.ok(getContrastRatio(tokens['text'], tokens['page-bg']) >= 4.5);
  assert.ok(getContrastRatio(tokens['input-text'], tokens['input-bg']) >= 4.5);
  assert.ok(getContrastRatio(tokens['button-text'], tokens['button-bg']) >= 4.5);
});
