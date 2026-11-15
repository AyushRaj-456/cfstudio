/**
 * CF Studio - Package script
 * Bundles the extension and creates a zip file without external dependencies.
 */

import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const zipPath = path.join(rootDir, 'cf-studio.zip');

function makeCrcTable() {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      if (c & 1) c = 0xedb88320 ^ (c >>> 1);
      else c = c >>> 1;
    }
    table[n] = c;
  }
  return table;
}

const crcTable = makeCrcTable();

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function getDosDateTime(date) {
  const d = date || new Date();
  const time = (d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1);
  const dt = ((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate();
  return { time, date: dt };
}

function getAllFiles(dirPath, base = '') {
  let results = [];
  const list = fs.readdirSync(dirPath);
  for (const file of list) {
    const fullPath = path.join(dirPath, file);
    const relPath = base ? `${base}/${file}` : file;
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      results = results.concat(getAllFiles(fullPath, relPath));
    } else {
      results.push({ fullPath, relPath: relPath.replace(/\\/g, '/') });
    }
  }
  return results;
}

function createZip(files, outputFile) {
  const localHeaders = [];
  const centralRecords = [];
  let offset = 0;

  for (const f of files) {
    const data = fs.readFileSync(f.fullPath);
    const compressed = zlib.deflateRawSync(data);
    const useCompressed = compressed.length < data.length;
    const body = useCompressed ? compressed : data;
    const method = useCompressed ? 8 : 0;
    const crc = crc32(data);
    const nameBuf = Buffer.from(f.relPath, 'utf8');
    const { time, date } = getDosDateTime();

    // Local file header (30 bytes + name)
    const local = Buffer.alloc(30 + nameBuf.length);
    local.writeUInt32LE(0x04034b50, 0); // signature
    local.writeUInt16LE(20, 4); // version needed
    local.writeUInt16LE(0, 6); // flags
    local.writeUInt16LE(method, 8); // compression method
    local.writeUInt16LE(time, 10);
    local.writeUInt16LE(date, 12);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(body.length, 18); // compressed size
    local.writeUInt32LE(data.length, 22); // uncompressed size
    local.writeUInt16LE(nameBuf.length, 26);
    local.writeUInt16LE(0, 28); // extra length
    nameBuf.copy(local, 30);

    localHeaders.push(local, body);

    // Central directory header (46 bytes + name)
    const central = Buffer.alloc(46 + nameBuf.length);
    central.writeUInt32LE(0x02014b50, 0); // signature
    central.writeUInt16LE(20, 4); // version made by
    central.writeUInt16LE(20, 6); // version needed
    central.writeUInt16LE(0, 8); // flags
    central.writeUInt16LE(method, 10);
    central.writeUInt16LE(time, 12);
    central.writeUInt16LE(date, 14);
    central.writeUInt32LE(crc, 16);
    central.writeUInt32LE(body.length, 20);
    central.writeUInt32LE(data.length, 24);
    central.writeUInt16LE(nameBuf.length, 28);
    central.writeUInt16LE(0, 30); // extra length
    central.writeUInt16LE(0, 32); // comment length
    central.writeUInt16LE(0, 34); // disk start
    central.writeUInt16LE(0, 36); // internal attr
    central.writeUInt32LE(0, 38); // external attr
    central.writeUInt32LE(offset, 42); // local header offset
    nameBuf.copy(central, 46);

    centralRecords.push(central);
    offset += local.length + body.length;
  }

  const centralOffset = offset;
  let centralSize = 0;
  for (const c of centralRecords) {
    centralSize += c.length;
  }

  // End of central directory record (22 bytes)
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(0, 4); // disk number
  eocd.writeUInt16LE(0, 6); // central dir start disk
  eocd.writeUInt16LE(files.length, 8); // total records on this disk
  eocd.writeUInt16LE(files.length, 10); // total records
  eocd.writeUInt32LE(centralSize, 12);
  eocd.writeUInt32LE(centralOffset, 16);
  eocd.writeUInt16LE(0, 20); // comment length

  const finalBuf = Buffer.concat([...localHeaders, ...centralRecords, eocd]);
  fs.writeFileSync(outputFile, finalBuf);
}

// 1. Run build first
console.log('CF Studio: Running build before packaging...');
execFileSync('node', [path.join(rootDir, 'scripts/build.js')], { stdio: 'inherit' });

// 2. Package release archive (dist, src, tests/checklist, README, scripts, assets) into cf-studio.zip
console.log(`CF Studio: Creating full release package at ${zipPath}...`);
const releaseFiles = [
  ...getAllFiles(distDir, 'dist'),
  ...getAllFiles(path.join(rootDir, 'src'), 'src'),
  ...getAllFiles(path.join(rootDir, 'assets'), 'assets'),
  ...getAllFiles(path.join(rootDir, 'scripts'), 'scripts'),
  ...getAllFiles(path.join(rootDir, 'tests'), 'tests'),
];

const rootFiles = ['manifest.json', 'package.json', 'README.md', 'STATUS.md'];
for (const file of rootFiles) {
  const full = path.join(rootDir, file);
  if (fs.existsSync(full)) {
    releaseFiles.push({ fullPath: full, relPath: file });
  }
}

createZip(releaseFiles, zipPath);
console.log(`CF Studio: Release package created at ${zipPath} (${fs.statSync(zipPath).size} bytes)`);

// 3. Also package standalone dist/ into cf-studio-dist.zip for direct loading / upload
const distZipPath = path.join(rootDir, 'cf-studio-dist.zip');
console.log(`CF Studio: Creating standalone dist archive at ${distZipPath}...`);
createZip(getAllFiles(distDir, ''), distZipPath);
console.log(`CF Studio: Dist archive created at ${distZipPath} (${fs.statSync(distZipPath).size} bytes)`);

