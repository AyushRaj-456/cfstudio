import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { applyTheme, removeTheme, STYLE_TAG_ID, BG_LAYER_ID } from '../../src/content/style-engine.js';
import { classifyElement } from '../../src/content/classifier.js';
import { RouteObserver } from '../../src/content/route-observer.js';
import { MockDocument, MockElement, MockMutationObserver } from '../helpers/dom-fixture.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');
const distDir = path.join(rootDir, 'dist');

test('QA: permissions match docs/07 strictly', () => {
  const manifestPath = path.join(rootDir, 'manifest.json');
  assert.ok(fs.existsSync(manifestPath), 'manifest.json exists');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

  assert.equal(manifest.manifest_version, 3, 'Manifest V3 required');
  assert.deepEqual(manifest.permissions, ['storage'], 'Permissions must only be storage');
  assert.deepEqual(
    manifest.host_permissions,
    ['https://codeforces.com/*', 'https://*.codeforces.com/*'],
    'Host permissions must match docs/07 exactly'
  );
  assert.equal(manifest.options_page, undefined, 'No options_page allowed');
  assert.equal(manifest.options_ui, undefined, 'No options_ui allowed');
});

test('QA: clean install loads all required bundle files in dist/', () => {
  const requiredFiles = [
    'manifest.json',
    'background/service-worker.js',
    'content/content.js',
    'popup/popup.html',
    'popup/popup.css',
    'popup/popup.js',
    'icons/16.png',
    'icons/32.png',
    'icons/48.png',
    'icons/128.png',
  ];

  for (const rel of requiredFiles) {
    const full = path.join(distDir, rel);
    assert.ok(fs.existsSync(full), `Required file dist/${rel} must exist`);
    const stat = fs.statSync(full);
    assert.ok(stat.size > 0, `File dist/${rel} must not be empty`);
  }

  // Verify icons have PNG magic bytes
  const iconFiles = ['16.png', '32.png', '48.png', '128.png'];
  for (const icon of iconFiles) {
    const iconBuf = fs.readFileSync(path.join(distDir, 'icons', icon));
    assert.equal(iconBuf[0], 0x89);
    assert.equal(iconBuf[1], 0x50); // P
    assert.equal(iconBuf[2], 0x4e); // N
    assert.equal(iconBuf[3], 0x47); // G
  }
});

test('QA: style engine and route observer prevent duplicate stylesheets and observers', () => {
  const doc = new MockDocument();

  // Repeated applyTheme
  applyTheme(doc);
  applyTheme(doc);
  applyTheme(doc);
  assert.equal(doc.querySelectorAll('#' + STYLE_TAG_ID).length, 1, 'Only one style tag created');

  // Repeated route observer connect
  const observer = new RouteObserver({
    MutationObserver: MockMutationObserver,
    onMutations: () => {},
  });
  observer.connect(doc.body);
  assert.equal(observer.isConnected, true);
  observer.connect(doc.body);
  assert.equal(observer.isConnected, true);
  observer.disconnect();
  assert.equal(observer.isConnected, false);
});

test('QA: route observer prevents mutation loops from extension own changes', async () => {
  const doc = new MockDocument();
  let mutationCallbacks = 0;

  const observer = new RouteObserver({
    debounceMs: 10,
    MutationObserver: MockMutationObserver,
    onMutations: () => {
      mutationCallbacks++;
    },
  });

  observer.connect(doc.body);

  // Simulate internal mutations on extension markers and elements
  const extStyle = new MockElement('style', doc);
  extStyle.id = 'cfs-style';

  const extBg = new MockElement('div', doc);
  extBg.id = 'cfs-bg-layer';

  const host = new MockElement('div', doc);
  host.setAttribute('data-cfs-host', 'true');

  // Dispatch mutations for these extension elements
  observer.handleMutationBatch([
    { target: extStyle, type: 'attributes', attributeName: 'id' },
    { target: extBg, type: 'attributes', attributeName: 'data-cfs-bg' },
    { target: host, type: 'childList', addedNodes: [extBg] },
  ]);

  await new Promise((resolve) => setTimeout(resolve, 50));
  assert.equal(mutationCallbacks, 0, 'No callbacks triggered by extension elements');

  observer.disconnect();
});

test('QA: Off and Reset clean up fully leaving zero DOM artifacts', () => {
  const doc = new MockDocument();

  // Create simulated site elements
  const header = new MockElement('div', doc);
  header.setAttribute('id', 'header');
  doc.body.appendChild(header);

  const content = new MockElement('div', doc);
  content.setAttribute('class', 'roundbox');
  doc.body.appendChild(content);

  // Apply theme and markers
  applyTheme(doc, undefined, {
    background: { mode: 'built-in', builtinId: 'gradient-dark' },
  });
  classifyElement(header, 'header');
  classifyElement(content, 'content');

  // Add intro host
  const introHost = new MockElement('div', doc);
  introHost.setAttribute('id', 'cfs-intro-host');
  doc.body.appendChild(introHost);

  // Assert elements exist before cleanup
  assert.ok(doc.getElementById(STYLE_TAG_ID), 'Style tag exists');
  assert.ok(doc.getElementById(BG_LAYER_ID), 'Background layer exists');
  assert.ok(doc.getElementById('cfs-intro-host'), 'Intro host exists');
  assert.equal(doc.documentElement.getAttribute('data-cfs-on'), 'true');
  assert.equal(header.getAttribute('data-cfs-role'), 'header');

  // Perform full cleanup (Off / Reset)
  removeTheme(doc);

  // Assert complete removal
  assert.equal(doc.getElementById(STYLE_TAG_ID), null, 'Style tag removed');
  assert.equal(doc.getElementById(BG_LAYER_ID), null, 'Background layer removed');
  assert.equal(doc.getElementById('cfs-intro-host'), null, 'Intro host removed');
  assert.equal(doc.documentElement.hasAttribute('data-cfs-on'), false, 'Root marker removed');
  assert.equal(header.hasAttribute('data-cfs-role'), false, 'Header marker removed');
  assert.equal(content.hasAttribute('data-cfs-role'), false, 'Content marker removed');
  assert.equal(doc.querySelectorAll('[data-cfs-role]').length, 0, 'Zero data-cfs-* markers remain');
});

test('QA: zero telemetry, analytics or unauthorized network calls in bundled code', () => {
  const checkFiles = [
    path.join(distDir, 'background/service-worker.js'),
    path.join(distDir, 'content/content.js'),
    path.join(distDir, 'popup/popup.js'),
    path.join(distDir, 'popup/popup.css'),
  ];

  const forbiddenTokens = [
    'google-analytics.com',
    'googletagmanager.com',
    'telemetry',
    'sendBeacon',
    'WebSocket',
  ];

  for (const file of checkFiles) {
    const content = fs.readFileSync(file, 'utf8');
    for (const forbidden of forbiddenTokens) {
      assert.ok(
        !content.includes(forbidden),
        `Bundle ${path.basename(file)} must not contain forbidden token: ${forbidden}`
      );
    }
  }
});

test('QA: release zip archive cf-studio.zip is valid and non-empty', () => {
  const zipPath = path.join(rootDir, 'cf-studio.zip');
  assert.ok(fs.existsSync(zipPath), 'cf-studio.zip must exist');
  const stat = fs.statSync(zipPath);
  assert.ok(stat.size > 10000, 'cf-studio.zip must be substantial size');

  // Verify PK zip header
  const buf = fs.readFileSync(zipPath);
  assert.equal(buf[0], 0x50); // 'P'
  assert.equal(buf[1], 0x4b); // 'K'
  assert.equal(buf[2], 0x03);
  assert.equal(buf[3], 0x04);
});
