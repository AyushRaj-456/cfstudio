import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const assetsDir = path.join(rootDir, 'assets');
const iconsDir = path.join(assetsDir, 'icons');
const masterLogoPath = path.join(assetsDir, 'logo.png');

if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

if (fs.existsSync(masterLogoPath)) {
  console.log('CF Studio: Generating icons from master logo assets/logo.png...');
  const psScript = `
Add-Type -TypeDefinition @"
using System;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
using System.Collections.Generic;

public class IconGenerator
{
    public static void ProcessLogo(string srcPath, string outDir, string storeDir)
    {
        using (Bitmap source = new Bitmap(srcPath))
        {
            int w = source.Width;
            int h = source.Height;

            int minX = w, minY = h, maxX = 0, maxY = 0;
            BitmapData srcData = source.LockBits(
                new Rectangle(0, 0, w, h),
                ImageLockMode.ReadOnly,
                PixelFormat.Format32bppArgb);

            int stride = srcData.Stride;
            IntPtr scan0 = srcData.Scan0;
            byte[] pixels = new byte[stride * h];
            System.Runtime.InteropServices.Marshal.Copy(scan0, pixels, 0, pixels.Length);

            bool[] isBg = new bool[w * h];
            Queue<int> queue = new Queue<int>();

            for (int y = 0; y < h; y++)
            {
                for (int x = 0; x < w; x++)
                {
                    int idx = y * stride + x * 4;
                    byte b = pixels[idx];
                    byte g = pixels[idx + 1];
                    byte r = pixels[idx + 2];

                    if (r < 245 || g < 245 || b < 245)
                    {
                        if (x < minX) minX = x;
                        if (x > maxX) maxX = x;
                        if (y < minY) minY = y;
                        if (y > maxY) maxY = y;
                    }

                    if (x == 0 || x == w - 1 || y == 0 || y == h - 1)
                    {
                        if (r > 240 && g > 240 && b > 240)
                        {
                            isBg[y * w + x] = true;
                            queue.Enqueue(y * w + x);
                        }
                    }
                }
            }

            int[] dx = { 1, -1, 0, 0 };
            int[] dy = { 0, 0, 1, -1 };

            while (queue.Count > 0)
            {
                int curr = queue.Dequeue();
                int cx = curr % w;
                int cy = curr / w;

                for (int d = 0; d < 4; d++)
                {
                    int nx = cx + dx[d];
                    int ny = cy + dy[d];

                    if (nx >= 0 && nx < w && ny >= 0 && ny < h)
                    {
                        int nIdx = ny * w + nx;
                        if (!isBg[nIdx])
                        {
                            int pIdx = ny * stride + nx * 4;
                            byte b = pixels[pIdx];
                            byte g = pixels[pIdx + 1];
                            byte r = pixels[pIdx + 2];

                            if (r > 248 && g > 248 && b > 248)
                            {
                                isBg[nIdx] = true;
                                queue.Enqueue(nIdx);
                            }
                        }
                    }
                }
            }

            int contentW = maxX - minX;
            int contentH = maxY - minY;
            int contentSize = Math.Max(contentW, contentH);
            double centerX = (minX + maxX) / 2.0;
            double centerY = (minY + maxY) / 2.0;

            int cropSize = (int)(contentSize * 1.14);
            int startX = (int)(centerX - cropSize / 2.0);
            int startY = (int)(centerY - cropSize / 2.0);

            using (Bitmap cropped = new Bitmap(cropSize, cropSize, PixelFormat.Format32bppArgb))
            {
                BitmapData cropData = cropped.LockBits(
                    new Rectangle(0, 0, cropSize, cropSize),
                    ImageLockMode.WriteOnly,
                    PixelFormat.Format32bppArgb);

                int cStride = cropData.Stride;
                byte[] cPixels = new byte[cStride * cropSize];

                for (int y = 0; y < cropSize; y++)
                {
                    int srcY = startY + y;
                    for (int x = 0; x < cropSize; x++)
                    {
                        int srcX = startX + x;
                        int cIdx = y * cStride + x * 4;

                        if (srcX >= 0 && srcX < w && srcY >= 0 && srcY < h)
                        {
                            if (isBg[srcY * w + srcX])
                            {
                                cPixels[cIdx] = 0;
                                cPixels[cIdx + 1] = 0;
                                cPixels[cIdx + 2] = 0;
                                cPixels[cIdx + 3] = 0;
                            }
                            else
                            {
                                int sIdx = srcY * stride + srcX * 4;
                                byte b = pixels[sIdx];
                                byte g = pixels[sIdx + 1];
                                byte r = pixels[sIdx + 2];

                                int minChannel = Math.Min(r, Math.Min(g, b));
                                byte alpha = 255;
                                if (minChannel > 240)
                                {
                                    double factor = (255.0 - minChannel) / 15.0;
                                    alpha = (byte)(Math.Max(0.0, Math.Min(1.0, factor)) * 255.0);
                                }

                                cPixels[cIdx] = b;
                                cPixels[cIdx + 1] = g;
                                cPixels[cIdx + 2] = r;
                                cPixels[cIdx + 3] = alpha;
                            }
                        }
                        else
                        {
                            cPixels[cIdx] = 0;
                            cPixels[cIdx + 1] = 0;
                            cPixels[cIdx + 2] = 0;
                            cPixels[cIdx + 3] = 0;
                        }
                    }
                }

                System.Runtime.InteropServices.Marshal.Copy(cPixels, 0, cropData.Scan0, cPixels.Length);
                cropped.UnlockBits(cropData);
                source.UnlockBits(srcData);

                ResizeAndSave(cropped, 128, System.IO.Path.Combine(outDir, "128.png"));
                ResizeAndSave(cropped, 48,  System.IO.Path.Combine(outDir, "48.png"));
                ResizeAndSave(cropped, 32,  System.IO.Path.Combine(outDir, "32.png"));
                ResizeAndSave(cropped, 16,  System.IO.Path.Combine(outDir, "16.png"));

                ResizeAndSave(cropped, 256, System.IO.Path.Combine(storeDir, "icon-256.png"));
                ResizeAndSave(cropped, 512, System.IO.Path.Combine(storeDir, "icon-512.png"));
            }
        }
    }

    private static void ResizeAndSave(Bitmap src, int size, string destPath)
    {
        using (Bitmap target = new Bitmap(size, size, PixelFormat.Format32bppArgb))
        using (Graphics g = Graphics.FromImage(target))
        {
            g.CompositingQuality = CompositingQuality.HighQuality;
            g.InterpolationMode = InterpolationMode.HighQualityBicubic;
            g.SmoothingMode = SmoothingMode.HighQuality;
            g.PixelOffsetMode = PixelOffsetMode.HighQuality;
            g.Clear(Color.Transparent);

            g.DrawImage(src, new Rectangle(0, 0, size, size));
            target.Save(destPath, ImageFormat.Png);
        }
        Console.WriteLine("Saved: " + destPath + " (" + size + "x" + size + ")");
    }
}
"@;
[IconGenerator]::ProcessLogo('${masterLogoPath.replace(/\\/g, '\\\\')}', '${iconsDir.replace(/\\/g, '\\\\')}', '${assetsDir.replace(/\\/g, '\\\\')}');
`;
  try {
    execSync(`powershell -NoProfile -Command "${psScript.replace(/"/g, '\\"')}"`, { stdio: 'inherit' });
    console.log('CF Studio: Successfully generated icons from master logo.');
  } catch (err) {
    console.warn('CF Studio: Failed to run icon generator script via PowerShell:', err.message);
  }
} else {
  console.log('CF Studio: assets/logo.png not found, preserving existing icons.');
}
