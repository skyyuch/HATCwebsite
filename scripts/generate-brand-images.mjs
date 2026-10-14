/**
 * Regenerate the browser/app icons and the social share card from the real
 * HATC wordmark (`public/brand/hatc-logo.png`).
 *
 *   node scripts/generate-brand-images.mjs
 *
 * Everything it writes is committed, so you only need to run this when the
 * logo file or the card design changes. Outputs:
 *
 *   src/app/favicon.ico            16/32/48, browser tabs
 *   src/app/icon.png               512, Android home screen
 *   src/app/apple-icon.png         180, iOS home screen
 *   public/brand/share-card.jpg    1200×630 Open Graph / Twitter card
 *
 * Design decisions (owner 2026-10-14, 第六十六輪):
 *
 * - The icon is the **"A" glyph with the green triangle**, white on brand navy.
 *   The full HATC wordmark is 3.4:1 — scaled into a 16px tab it is an
 *   unreadable smudge, so the icon uses the one part of the mark that stays
 *   legible. The glyph is lifted out of the real logo by connected-component
 *   labelling, not redrawn: a plain rectangular crop cannot avoid the left tip
 *   of the neighbouring "T" crossbar, which overlaps the A horizontally.
 * - `icon.png` is rounded, `apple-icon.png` is **full-bleed square**: iOS
 *   applies its own squircle mask, so a pre-rounded apple icon ends up double
 *   rounded with navy corners poking out.
 * - The share card is the dark trading-desk variant, matching the homepage
 *   people land on. Its copy is two approved facts only — the legal name and
 *   `home.heroV2.badge` (香港黃金交易所 AA類行員 008號). Do not add trading
 *   conditions, client numbers or award claims to it (docs/HATC_FACTS.md).
 * - JPEG, not PNG: the gradient costs ~350 KB as PNG, and some messaging
 *   clients skip preview images that large. Keep the card under ~200 KB.
 * - The card lives in `public/`, not in a `opengraph-image.jpg` route file,
 *   and is referenced through `SHARE_CARD` in `src/lib/seo.ts` — see the
 *   comment there for why the file convention is the wrong tool here.
 *
 * ⚠ The card is rendered by headless Chrome so the Chinese text uses real
 * system typography (Sora has no CJK glyphs). That makes the step
 * macOS + network dependent — the committed JPEGs are the artifact, and
 * regenerating on another OS will pick different CJK fonts. Icons need neither
 * Chrome nor network.
 */
import {execFileSync} from 'node:child_process';
import {mkdtempSync, readFileSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';

import sharp from 'sharp';

const LOGO = 'public/brand/hatc-logo.png';
const SHARE_CARD = 'public/brand/share-card.jpg';
const NAVY = '#09395f';
const APP = 'src/app';
const CHROME =
  process.env.CHROME_BIN ||
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const tmp = mkdtempSync(join(tmpdir(), 'hatc-brand-'));
const isGreen = (r, g, b) => g > 100 && g > r + 40 && g > b + 40;

/** Repaint every non-green pixel white, keeping the alpha channel. */
async function whiteInk(input) {
  const {data, info} = await sharp(input)
    .ensureAlpha()
    .raw()
    .toBuffer({resolveWithObject: true});
  for (let i = 0; i < data.length; i += info.channels) {
    if (data[i + 3] > 0 && !isGreen(data[i], data[i + 1], data[i + 2])) {
      data[i] = 255;
      data[i + 1] = 255;
      data[i + 2] = 255;
    }
  }
  return sharp(data, {
    raw: {width: info.width, height: info.height, channels: info.channels}
  })
    .png()
    .toBuffer();
}

/**
 * Lift the "A" out of the wordmark: label every blob of ink, then keep the one
 * spanning the green triangle plus the triangle itself. Neighbouring letters
 * are separate blobs, so the T crossbar that overlaps the A's bounding box is
 * dropped.
 */
async function extractMark() {
  const {data, info} = await sharp(LOGO)
    .ensureAlpha()
    .raw()
    .toBuffer({resolveWithObject: true});
  const {width, height, channels} = info;
  const pixels = width * height;
  const label = new Int32Array(pixels).fill(-1);
  const stack = new Int32Array(pixels);
  const blobs = [];

  for (let seed = 0; seed < pixels; seed++) {
    if (data[seed * channels + 3] <= 40 || label[seed] >= 0) continue;
    const id = blobs.length;
    const blob = {id, size: 0, minX: width, maxX: 0, minY: height, maxY: 0};
    label[seed] = id;
    let top = 0;
    stack[top++] = seed;
    while (top > 0) {
      const p = stack[--top];
      const x = p % width;
      const y = (p - x) / width;
      blob.size++;
      if (x < blob.minX) blob.minX = x;
      if (x > blob.maxX) blob.maxX = x;
      if (y < blob.minY) blob.minY = y;
      if (y > blob.maxY) blob.maxY = y;
      const neighbours = [
        x > 0 ? p - 1 : -1,
        x < width - 1 ? p + 1 : -1,
        y > 0 ? p - width : -1,
        y < height - 1 ? p + width : -1
      ];
      for (const q of neighbours) {
        if (q < 0 || label[q] >= 0 || data[q * channels + 3] <= 40) continue;
        label[q] = id;
        stack[top++] = q;
      }
    }
    blobs.push(blob);
  }

  let greenId = -1;
  for (let p = 0; p < pixels && greenId < 0; p++) {
    const i = p * channels;
    if (data[i + 3] > 40 && isGreen(data[i], data[i + 1], data[i + 2])) {
      greenId = label[p];
    }
  }
  if (greenId < 0) throw new Error('green triangle not found in ' + LOGO);
  const triangle = blobs[greenId];
  const centreX = (triangle.minX + triangle.maxX) / 2;
  const letter = blobs
    .filter((b) => b.id !== greenId && b.minX < centreX && b.maxX > centreX)
    .sort((a, b) => b.size - a.size)[0];
  if (!letter) throw new Error('"A" glyph not found in ' + LOGO);

  const out = Buffer.alloc(pixels * 4);
  for (let p = 0; p < pixels; p++) {
    if (label[p] !== letter.id && label[p] !== greenId) continue;
    const i = p * channels;
    out[p * 4] = data[i];
    out[p * 4 + 1] = data[i + 1];
    out[p * 4 + 2] = data[i + 2];
    out[p * 4 + 3] = data[i + 3];
  }
  return sharp(out, {raw: {width, height, channels: 4}})
    .extract({
      left: letter.minX,
      top: letter.minY,
      width: letter.maxX - letter.minX + 1,
      height: letter.maxY - letter.minY + 1
    })
    .png()
    .toBuffer();
}

/** Navy tile with the white mark centred. `radius` 0 = full bleed. */
async function tile(mark, size, radius) {
  const inner = Math.round(size * 0.72);
  const art = await sharp(mark)
    .resize({
      width: inner,
      height: inner,
      fit: 'contain',
      background: {r: 0, g: 0, b: 0, alpha: 0}
    })
    .toBuffer();
  const base = radius
    ? sharp(
        Buffer.from(
          `<svg width="${size}" height="${size}"><rect width="${size}" height="${size}" rx="${radius}" fill="${NAVY}"/></svg>`
        )
      )
    : sharp({
        create: {width: size, height: size, channels: 4, background: NAVY}
      });
  return base.composite([{input: art, gravity: 'centre'}]).png().toBuffer();
}

/**
 * Minimal ICO container around PNG payloads (supported since Windows Vista).
 * sharp cannot write .ico, and `favicon.ico` is the only icon old crawlers and
 * `/favicon.ico` requests will look for.
 */
function ico(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  let offset = 6 + images.length * 16;
  const entries = images.map(({size, png}) => {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size >= 256 ? 0 : size, 0);
    entry.writeUInt8(size >= 256 ? 0 : size, 1);
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(png.length, 8);
    entry.writeUInt32LE(offset, 12);
    offset += png.length;
    return entry;
  });
  return Buffer.concat([header, ...entries, ...images.map((i) => i.png)]);
}

/** The share card, rendered by Chrome so the Chinese text has real typography. */
function cardHtml(logoWhitePath) {
  return `<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700&display=swap" rel="stylesheet">
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  html,body{width:1200px;height:630px;overflow:hidden}
  body{font-family:'Sora','PingFang TC','Noto Sans TC',-apple-system,sans-serif;color:#fff}
  .card{width:1200px;height:630px;position:relative;display:flex;flex-direction:column;
        justify-content:center;padding:0 100px;
        background:radial-gradient(130% 150% at 88% 6%,#1d2748 0%,#121728 40%,#070a14 100%)}
  .grid{position:absolute;inset:0;background-size:64px 64px;
        background-image:linear-gradient(#ffffff0d 1px,transparent 1px),
                         linear-gradient(90deg,#ffffff0d 1px,transparent 1px);
        mask-image:linear-gradient(90deg,transparent,#000 60%)}
  .glow{position:absolute;width:620px;height:620px;right:-160px;top:-200px;
        background:radial-gradient(circle,#d4af3736 0%,transparent 68%)}
  .stack{position:relative;display:flex;flex-direction:column;align-items:flex-start;gap:38px}
  .logo{height:74px;width:252px;display:block}
  .rule{height:3px;width:104px;background:#d4af37;margin-bottom:26px}
  .name{font-size:58px;font-weight:700;letter-spacing:.02em;line-height:1.1}
  .en{font-size:27px;font-weight:600;letter-spacing:.12em;color:#9fb0cc;margin-top:12px}
  .badge{font-size:25px;font-weight:600;padding:15px 26px;border-radius:6px;
         background:#d4af3720;border:1px solid #d4af3759;color:#e9d08a}
</style></head><body>
  <div class="card">
    <div class="grid"></div><div class="glow"></div>
    <div class="stack">
      <img class="logo" src="${logoWhitePath}">
      <div>
        <div class="rule"></div>
        <div class="name">華安泰昌有限公司</div>
        <div class="en">HATC GROUP LIMITED</div>
      </div>
      <div class="badge">香港黃金交易所 AA類行員 008號</div>
    </div>
  </div>
</body></html>`;
}

async function main() {
  const mark = await extractMark();
  const white = await whiteInk(mark);

  // Tabs, bookmarks and Android: rounded tile. iOS: full bleed (own mask).
  const sizes = [16, 32, 48];
  const pngs = [];
  for (const size of sizes) {
    pngs.push({
      size,
      png: await tile(white, size, Math.round(size * 0.21))
    });
  }
  writeFileSync(join(APP, 'favicon.ico'), ico(pngs));
  writeFileSync(join(APP, 'icon.png'), await tile(white, 512, 110));
  writeFileSync(join(APP, 'apple-icon.png'), await tile(white, 180, 0));

  const logoWhite = join(tmp, 'logo-white.png');
  writeFileSync(logoWhite, await whiteInk(LOGO));
  const html = join(tmp, 'card.html');
  writeFileSync(html, cardHtml(logoWhite));
  const shot = join(tmp, 'card.png');
  execFileSync(
    CHROME,
    [
      '--headless',
      '--disable-gpu',
      '--no-sandbox',
      '--hide-scrollbars',
      '--allow-file-access-from-files',
      '--window-size=1200,630',
      `--screenshot=${shot}`,
      `file://${html}`
    ],
    {stdio: 'ignore'}
  );
  const card = await sharp(readFileSync(shot))
    .jpeg({quality: 92, mozjpeg: true, chromaSubsampling: '4:4:4'})
    .toBuffer();
  writeFileSync(SHARE_CARD, card);
  console.log(
    `icons written; share card ${(card.length / 1024).toFixed(0)} KB`
  );
}

await main();
