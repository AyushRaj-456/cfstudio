import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');

test('minimal header: logo badge and Appearance Studio badge are completely removed', () => {
  const popupHtml = fs.readFileSync(path.join(rootDir, 'src/popup/popup.html'), 'utf8');

  // Verify no logo badge, no logo icon, no Appearance Studio badge
  assert.equal(popupHtml.includes('cfs-logo-badge'), false, 'popup.html must not contain cfs-logo-badge');
  assert.equal(popupHtml.includes('cfs-logo-icon'), false, 'popup.html must not contain cfs-logo-icon');
  assert.equal(popupHtml.includes('cfs-badge-studio'), false, 'popup.html must not contain cfs-badge-studio');
  assert.equal(popupHtml.includes('Appearance Studio</span>'), false, 'popup.html must not contain "Appearance Studio" badge');

  // Verify plain text CF Studio
  assert.ok(popupHtml.includes('class="cfs-brand-name">CF Studio</span>'), 'Header must contain plain text "CF Studio"');

  // Verify status indicator directly in header left
  assert.ok(popupHtml.includes('id="status-dot"'), 'status-dot must exist in header');
  assert.ok(popupHtml.includes('id="status-text"'), 'status-text must exist in header');
  assert.ok(popupHtml.includes('id="retry-btn"'), 'retry-btn must exist in header');

  // Verify master switch in header right
  assert.ok(popupHtml.includes('id="master-switch"'), 'master-switch must exist in header');
});

test('minimal ui: navigation tabs are text-only developer tools tabs without decorative icons', () => {
  const popupHtml = fs.readFileSync(path.join(rootDir, 'src/popup/popup.html'), 'utf8');

  // Ensure nav has the 3 tabs
  assert.ok(popupHtml.includes('id="tab-themes"'), 'tab-themes must exist');
  assert.ok(popupHtml.includes('id="tab-backgrounds"'), 'tab-backgrounds must exist');
  assert.ok(popupHtml.includes('id="tab-fonts"'), 'tab-fonts must exist');

  // Ensure tabs have no decorative cfs-tab-icon SVGs
  assert.equal(popupHtml.includes('cfs-tab-icon'), false, 'popup.html must not contain decorative cfs-tab-icon SVGs');
});

test('minimal ui: CSS avoids SaaS gradients, glowing shadows, and excessive rounded rectangles', () => {
  const popupCss = fs.readFileSync(path.join(rootDir, 'src/popup/popup.css'), 'utf8');

  // Custom palette button should not use gradient or glowing box-shadow
  const customPaletteSection = popupCss.slice(popupCss.indexOf('.cfs-custom-palette-btn'));
  const customPaletteBlock = customPaletteSection.slice(0, customPaletteSection.indexOf('/*') > 0 ? customPaletteSection.indexOf('/*') : 500);

  assert.equal(customPaletteBlock.includes('linear-gradient'), false, 'cfs-custom-palette-btn must not use linear-gradient');
  assert.equal(customPaletteBlock.includes('box-shadow: 0 2px 6px'), false, 'cfs-custom-palette-btn must not have glowing box-shadow');

  // Theme cards should not have translateY float or excessive box-shadow
  assert.equal(popupCss.includes('transform: translateY(-1px)'), false, 'Theme cards must not have 3D translateY hover float');
  assert.equal(popupCss.includes('box-shadow: 0 1px 6px rgba(147, 51, 234'), false, 'Impressive cards must not have purple glowing box-shadow');

  // Status dot active should be a clean dot without glowing box-shadow
  const statusDotActive = popupCss.slice(popupCss.indexOf('.cfs-status-dot.is-active'));
  const dotBlock = statusDotActive.slice(0, statusDotActive.indexOf('}') + 1);
  assert.equal(dotBlock.includes('box-shadow'), false, 'status-dot active must not have glowing box-shadow');
});

test('preserved functionality: all key feature controls and IDs remain intact', () => {
  const popupHtml = fs.readFileSync(path.join(rootDir, 'src/popup/popup.html'), 'utf8');

  // Master switch & Status
  assert.ok(popupHtml.includes('id="master-switch"'));
  assert.ok(popupHtml.includes('id="status-dot"'));
  assert.ok(popupHtml.includes('id="status-text"'));
  assert.ok(popupHtml.includes('id="retry-btn"'));
  assert.ok(popupHtml.includes('id="error-banner"'));

  // Tabs
  assert.ok(popupHtml.includes('id="tab-themes"'));
  assert.ok(popupHtml.includes('id="tab-backgrounds"'));
  assert.ok(popupHtml.includes('id="tab-fonts"'));

  // Theme filters & Custom Palette
  assert.ok(popupHtml.includes('id="filter-light"'));
  assert.ok(popupHtml.includes('id="filter-dark"'));
  assert.ok(popupHtml.includes('id="filter-impressive"'));
  assert.ok(popupHtml.includes('id="btn-toggle-custom-palette"'));
  assert.ok(popupHtml.includes('id="custom-theme-editor"'));
  assert.ok(popupHtml.includes('id="toggle-impressive-animations"'));

  // Backgrounds & Surface Treatments
  assert.ok(popupHtml.includes('id="bg-card-none"'));
  assert.ok(popupHtml.includes('id="bg-card-upload"'));
  assert.ok(popupHtml.includes('id="btn-paste-bg"'));
  assert.ok(popupHtml.includes('id="btn-colors-from-img"'));
  assert.ok(popupHtml.includes('id="header-surface-treatment"'));
  assert.ok(popupHtml.includes('id="header-image-adjustments"'));
  assert.ok(popupHtml.includes('id="slider-block-transparency"'));
  assert.ok(popupHtml.includes('id="slider-frosted-blur"'));

  // Fonts
  assert.ok(popupHtml.includes('id="font-family-input"'));
  assert.ok(popupHtml.includes('id="btn-apply-font"'));
  assert.ok(popupHtml.includes('id="btn-reset-font"'));

  // Backup & Reset
  assert.ok(popupHtml.includes('id="export-btn"'));
  assert.ok(popupHtml.includes('id="import-btn"'));
  assert.ok(popupHtml.includes('id="global-reset-btn"'));
});
