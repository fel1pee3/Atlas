import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..', 'assets');
const out = path.join(root, 'brand', 'splash.png');

const W = 1284;
const H = 2778;
const bg = '#EEF2F4';

const markBuf = await sharp(path.join(root, 'logo-mark.png'))
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const { data, info } = markBuf;
for (let i = 0; i < data.length; i += 4) {
  const r = data[i];
  const g = data[i + 1];
  const b = data[i + 2];
  if (r < 28 && g < 28 && b < 28) data[i + 3] = 0;
}

const trimmed = await sharp(Buffer.from(data), {
  raw: { width: info.width, height: info.height, channels: 4 },
})
  .trim()
  .png()
  .toBuffer();

const markResized = await sharp(trimmed)
  .resize({ width: 280 })
  .png()
  .toBuffer();
const markMeta = await sharp(markResized).metadata();
const mw = markMeta.width ?? 280;
const mh = markMeta.height ?? 280;

const titleSvg = Buffer.from(`<svg width="${W}" height="160" xmlns="http://www.w3.org/2000/svg">
  <text x="50%" y="90" text-anchor="middle" font-family="Georgia, Times New Roman, serif" font-size="110" font-weight="700" fill="#15202B">Atlas</text>
</svg>`);
const tagSvg = Buffer.from(`<svg width="${W}" height="80" xmlns="http://www.w3.org/2000/svg">
  <text x="50%" y="40" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="40" fill="#5A6B7A">Sua vida, compreendida</text>
</svg>`);

const titlePng = await sharp(titleSvg).png().toBuffer();
const tagPng = await sharp(tagSvg).png().toBuffer();

const blockH = mh + 28 + 120 + 18 + 50;
const top = Math.round((H - blockH) / 2);
const markX = Math.round((W - mw) / 2);

const glowSvg = Buffer.from(`<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="g1" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#D9EBE7" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="#D9EBE7" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="g2" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#2A6B63" stop-opacity="0.10"/>
      <stop offset="100%" stop-color="#2A6B63" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <circle cx="${W - 80}" cy="80" r="280" fill="url(#g1)"/>
  <circle cx="80" cy="${H - 100}" r="260" fill="url(#g2)"/>
</svg>`);

await sharp({
  create: { width: W, height: H, channels: 3, background: bg },
})
  .composite([
    { input: await sharp(glowSvg).png().toBuffer(), top: 0, left: 0 },
    { input: markResized, top, left: markX },
    { input: titlePng, top: top + mh + 28, left: 0 },
    { input: tagPng, top: top + mh + 28 + 120 + 8, left: 0 },
  ])
  .png()
  .toFile(out);

console.log('wrote', out);
