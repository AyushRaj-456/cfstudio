import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { MockDocument } from '../helpers/dom-fixture.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');

test('floating theme popup: obsolete first-run card is completely removed and never injected', () => {
  // Verify first-run-card.js file does not exist
  const firstRunCardPath = path.join(rootDir, 'src/content/first-run-card.js');
  assert.equal(fs.existsSync(firstRunCardPath), false, 'src/content/first-run-card.js must be removed');

  // Verify content.js does not import or invoke first-run card
  const contentJsSource = fs.readFileSync(path.join(rootDir, 'src/content/content.js'), 'utf8');
  assert.equal(contentJsSource.includes('first-run-card'), false, 'content.js must not reference first-run-card');
  assert.equal(contentJsSource.includes('triggerIntroCard'), false, 'content.js must not call triggerIntroCard');
  assert.equal(contentJsSource.includes('showIntroCard'), false, 'content.js must not call showIntroCard');

  // Verify no floating host is injected into DOM
  const doc = new MockDocument();
  assert.equal(doc.getElementById('cfs-intro-host'), null);
});
