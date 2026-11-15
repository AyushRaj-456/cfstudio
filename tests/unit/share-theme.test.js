import test from 'node:test';
import assert from 'node:assert/strict';
import {
  encodeShareCode,
  decodeShareCode,
  isValidThemeName,
  THEME_TOKEN_NAMES,
} from '../../src/shared/share-theme.js';
import { BUILTIN_THEMES } from '../../src/themes/builtin.js';

test('theme name validation: accepts valid names and rejects invalid names', () => {
  assert.equal(isValidThemeName('My Theme'), true);
  assert.equal(isValidThemeName('Dark-Mode-1'), true);
  assert.equal(isValidThemeName('A'), true);
  assert.equal(isValidThemeName('A'.repeat(30)), true);

  // Rejected
  assert.equal(isValidThemeName(''), false);
  assert.equal(isValidThemeName('   '), false);
  assert.equal(isValidThemeName('A'.repeat(31)), false);
  assert.equal(isValidThemeName('Theme <script>'), false);
  assert.equal(isValidThemeName('Theme; color: red'), false);
  assert.equal(isValidThemeName('Theme@name'), false);
});

test('share code: round trip encodes and decodes theme accurately', async () => {
  const originalTheme = {
    name: 'Linen Studio',
    tokens: { ...BUILTIN_THEMES[0].tokens, 'page-bg': '#fbfaf8', 'accent': '#1a73e8' },
  };

  const code = await encodeShareCode(originalTheme);
  assert.ok(code.startsWith('CFS1.'));
  assert.ok(code.length < 4000);

  const decoded = await decodeShareCode(code);
  assert.equal(decoded.valid, true);
  assert.equal(decoded.theme.name, 'Linen Studio');
  assert.equal(decoded.theme.tokens['page-bg'], '#fbfaf8');
  assert.equal(decoded.theme.tokens['accent'], '#1a73e8');
  assert.equal(decoded.theme.builtin, false);
});

test('share code: rejects dark themes under Absolute Light-Theme Policy', async () => {
  const darkTheme = {
    name: 'Dark Midnight',
    tokens: { ...BUILTIN_THEMES[0].tokens, 'page-bg': '#0f172a', 'accent': '#38bdf8' },
  };
  const code = await encodeShareCode(darkTheme);
  const res = await decodeShareCode(code);
  assert.equal(res.valid, false);
  assert.equal(res.error, 'CF Studio supports light themes only.');
});

test('share code: rejects non-string and empty inputs', async () => {
  const resNull = await decodeShareCode(null);
  assert.equal(resNull.valid, false);
  assert.equal(resNull.error, 'This code is not valid.');

  const resEmpty = await decodeShareCode('');
  assert.equal(resEmpty.valid, false);
  assert.equal(resEmpty.error, 'This code is not valid.');
});

test('share code: rejects missing or wrong prefix', async () => {
  const resBadPrefix = await decodeShareCode('CFS2.eJyL...');
  assert.equal(resBadPrefix.valid, false);
  assert.equal(resBadPrefix.error, 'This code is not valid.');

  const resNoPrefix = await decodeShareCode('eJyL...');
  assert.equal(resNoPrefix.valid, false);
  assert.equal(resNoPrefix.error, 'This code is not valid.');
});

test('share code: rejects oversized codes (> 4000 characters)', async () => {
  const longCode = `CFS1.${'A'.repeat(4001)}`;
  const res = await decodeShareCode(longCode);
  assert.equal(res.valid, false);
  assert.equal(res.error, 'This code is not valid.');
});

test('share code: rejects tampered or corrupted base64 payloads', async () => {
  const res = await decodeShareCode('CFS1.ThisIsClearlyNotValidCompressedBase64==');
  assert.equal(res.valid, false);
  assert.equal(res.error, 'This code is not valid.');
});

test('share code: rejects wrong version payload', async () => {
  // Manually construct compressed payload with v: 2
  const jsonStr = JSON.stringify({
    v: 2,
    n: 'Future Theme',
    t: { 'page-bg': '#000000', 'text': '#ffffff' },
  });

  const encoder = new TextEncoder();
  const cs = new CompressionStream('deflate');
  const writer = cs.writable.getWriter();
  writer.write(encoder.encode(jsonStr));
  writer.close();

  const buffer = await new Response(cs.readable).arrayBuffer();
  let binary = '';
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  const b64url = Buffer.from(binary, 'binary').toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

  const code = `CFS1.${b64url}`;
  const res = await decodeShareCode(code);
  assert.equal(res.valid, false);
  assert.equal(res.error, 'This code is not valid.');
});

test('share code: rejects extra keys in payload', async () => {
  const jsonStr = JSON.stringify({
    v: 1,
    n: 'Injected Theme',
    t: { 'page-bg': '#000000', 'text': '#ffffff' },
    extraKey: 'malicious',
  });

  const encoder = new TextEncoder();
  const cs = new CompressionStream('deflate');
  const writer = cs.writable.getWriter();
  writer.write(encoder.encode(jsonStr));
  writer.close();

  const buffer = await new Response(cs.readable).arrayBuffer();
  let binary = '';
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  const b64url = Buffer.from(binary, 'binary').toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

  const code = `CFS1.${b64url}`;
  const res = await decodeShareCode(code);
  assert.equal(res.valid, false);
  assert.equal(res.error, 'This code is not valid.');
});

test('share code: rejects bad colors and unauthorized tokens', async () => {
  // Bad color value: 'not-a-color'
  const jsonBadColor = JSON.stringify({
    v: 1,
    n: 'Bad Color',
    t: { 'page-bg': 'not-a-color', 'text': '#ffffff' },
  });

  const encoder = new TextEncoder();
  const cs1 = new CompressionStream('deflate');
  const writer1 = cs1.writable.getWriter();
  writer1.write(encoder.encode(jsonBadColor));
  writer1.close();

  const buf1 = await new Response(cs1.readable).arrayBuffer();
  let bin1 = '';
  const bytes1 = new Uint8Array(buf1);
  for (let i = 0; i < bytes1.length; i++) bin1 += String.fromCharCode(bytes1[i]);
  const code1 = `CFS1.${Buffer.from(bin1, 'binary').toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')}`;

  const res1 = await decodeShareCode(code1);
  assert.equal(res1.valid, false);
  assert.equal(res1.error, 'This code is not valid.');

  // Unauthorized token key
  const jsonBadToken = JSON.stringify({
    v: 1,
    n: 'Bad Token',
    t: { 'unauthorized-token': '#123456', 'page-bg': '#000000', 'text': '#ffffff' },
  });

  const cs2 = new CompressionStream('deflate');
  const writer2 = cs2.writable.getWriter();
  writer2.write(encoder.encode(jsonBadToken));
  writer2.close();

  const buf2 = await new Response(cs2.readable).arrayBuffer();
  let bin2 = '';
  const bytes2 = new Uint8Array(buf2);
  for (let i = 0; i < bytes2.length; i++) bin2 += String.fromCharCode(bytes2[i]);
  const code2 = `CFS1.${Buffer.from(bin2, 'binary').toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')}`;

  const res2 = await decodeShareCode(code2);
  assert.equal(res2.valid, false);
  assert.equal(res2.error, 'This code is not valid.');
});
