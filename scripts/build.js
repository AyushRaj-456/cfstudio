/**
 * CF Studio - Build script
 * Bundles source files with esbuild into dist/ for Chrome MV3.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import esbuild from 'esbuild';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');

async function build() {
  console.log('CF Studio: Building extension into dist/...');

  // Clean / prepare dist directory
  if (fs.existsSync(distDir)) {
    fs.rmSync(distDir, { recursive: true, force: true });
  }
  fs.mkdirSync(distDir, { recursive: true });
  fs.mkdirSync(path.join(distDir, 'icons'), { recursive: true });
  fs.mkdirSync(path.join(distDir, 'popup'), { recursive: true });
  fs.mkdirSync(path.join(distDir, 'background'), { recursive: true });
  fs.mkdirSync(path.join(distDir, 'content'), { recursive: true });

  // 1. Copy manifest.json
  fs.copyFileSync(
    path.join(rootDir, 'manifest.json'),
    path.join(distDir, 'manifest.json')
  );

  // 2. Copy icons
  const iconFiles = ['16.png', '32.png', '48.png', '128.png'];
  for (const icon of iconFiles) {
    const srcIcon = path.join(rootDir, 'assets/icons', icon);
    const destIcon = path.join(distDir, 'icons', icon);
    if (fs.existsSync(srcIcon)) {
      fs.copyFileSync(srcIcon, destIcon);
    } else {
      console.warn(`Warning: Icon file missing: ${srcIcon}`);
    }
  }

  // 3. Copy popup HTML and CSS
  fs.copyFileSync(
    path.join(rootDir, 'src/popup/popup.html'),
    path.join(distDir, 'popup/popup.html')
  );
  fs.copyFileSync(
    path.join(rootDir, 'src/popup/popup.css'),
    path.join(distDir, 'popup/popup.css')
  );

  // 4. Bundle JavaScript entry points with esbuild
  // Content scripts must be classic scripts (iife)
  // Popup and background are bundled as iife for broad compatibility
  const entryPoints = [
    {
      in: path.join(rootDir, 'src/background/service-worker.js'),
      out: 'background/service-worker',
    },
    {
      in: path.join(rootDir, 'src/content/content.js'),
      out: 'content/content',
    },
    {
      in: path.join(rootDir, 'src/popup/popup.js'),
      out: 'popup/popup',
    },
  ];

  await esbuild.build({
    entryPoints,
    outdir: distDir,
    bundle: true,
    format: 'iife',
    target: ['chrome100'],
    platform: 'browser',
    sourcemap: false,
    minify: false,
  });

  console.log('CF Studio: Build complete! Output located at dist/');
}

build().catch((err) => {
  console.error('CF Studio: Build failed:', err);
  process.exit(1);
});

