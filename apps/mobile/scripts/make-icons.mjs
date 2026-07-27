/**
 * Gera icon.png + adaptive-foreground.png com safe zone Android (~66% centro).
 * Uso: node scripts/make-icons.mjs
 */
import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..', 'assets');
const SIZE = 1024;
/** Marca ocupa ~52% do canvas → fica dentro da safe zone (~66%). */
const MARK_RATIO = 0.52;
const BG = { r: 238, g: 242, b: 244, alpha: 1 }; // #EEF2F4

async function loadMarkTransparent() {
  const markBuf = await sharp(path.join(root, 'logo-mark.png'))
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { data, info } = markBuf;
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    // Remove fundo preto do asset original.
    if (r < 28 && g < 28 && b < 28) data[i + 3] = 0;
  }

  return sharp(Buffer.from(data), {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .trim()
    .png()
    .toBuffer();
}

async function placeMarkCentered(markPng, { opaqueBackground }) {
  const markSize = Math.round(SIZE * MARK_RATIO);
  const resized = await sharp(markPng)
    .resize({
      width: markSize,
      height: markSize,
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();

  const meta = await sharp(resized).metadata();
  const mw = meta.width ?? markSize;
  const mh = meta.height ?? markSize;
  const left = Math.round((SIZE - mw) / 2);
  const top = Math.round((SIZE - mh) / 2);

  const base = opaqueBackground
    ? sharp({
        create: { width: SIZE, height: SIZE, channels: 3, background: BG },
      })
    : sharp({
        create: {
          width: SIZE,
          height: SIZE,
          channels: 4,
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        },
      });

  return base
    .composite([{ input: resized, left, top }])
    .png()
    .toBuffer();
}

const mark = await loadMarkTransparent();

const iconBuf = await placeMarkCentered(mark, { opaqueBackground: true });
const fgBuf = await placeMarkCentered(mark, { opaqueBackground: false });

const bgBuf = await sharp({
  create: { width: SIZE, height: SIZE, channels: 3, background: BG },
})
  .png()
  .toBuffer();

const brand = path.join(root, 'brand');
await sharp(iconBuf).toFile(path.join(brand, 'icon.png'));
await sharp(fgBuf).toFile(path.join(brand, 'adaptive-foreground.png'));
await sharp(bgBuf).toFile(path.join(brand, 'adaptive-background.png'));

console.log('wrote icon.png, adaptive-foreground.png, adaptive-background.png');
console.log(`mark ~${Math.round(MARK_RATIO * 100)}% of ${SIZE}px (safe zone ok)`);
