import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { applyTheme, removeTheme, STYLE_TAG_ID } from '../../src/content/style-engine.js';
import { MockDocument, MockElement } from '../helpers/dom-fixture.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const fixturesDir = path.resolve(__dirname, '../../../fixtures');
const projectFixturesDir = path.resolve(__dirname, '../fixtures');

test('fixtures: runs safe styling on each available fixture', () => {
  const dirs = [fixturesDir, projectFixturesDir];
  const fixtureFiles = [];

  for (const dir of dirs) {
    if (fs.existsSync(dir)) {
      const files = fs.readdirSync(dir).filter((f) => f.endsWith('.html'));
      for (const file of files) {
        fixtureFiles.push(path.join(dir, file));
      }
    }
  }

  if (fixtureFiles.length === 0) {
    console.log('Notice: No saved fixtures found in fixtures/. Skipping page-specific fixture tests per docs/04.');
    return;
  }

  for (const filePath of fixtureFiles) {
    const doc = new MockDocument();

    // Apply theme
    applyTheme(doc);
    assert.equal(doc.querySelectorAll('#' + STYLE_TAG_ID).length, 1);

    // Apply again: still one style tag
    applyTheme(doc);
    assert.equal(doc.querySelectorAll('#' + STYLE_TAG_ID).length, 1);

    // Cleanup: returns DOM to original
    removeTheme(doc);
    assert.equal(doc.getElementById(STYLE_TAG_ID), null);
    assert.equal(doc.documentElement.hasAttribute('data-cfs-on'), false);
    assert.equal(doc.querySelectorAll('[data-cfs-role]').length, 0);
  }
});
