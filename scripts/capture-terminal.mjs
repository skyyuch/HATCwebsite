/**
 * Recapture the platform screenshots in `public/platforms/`.
 *
 * These are real screens of HATC's own trading terminal (the uni-app x H5
 * build, same codebase as the mobile app). The capture rules live next to the
 * assets in `src/components/platforms/platformVisuals.ts` — read them before
 * changing anything here. In short:
 *
 * - phone jobs are one whole phone screen (430×932 CSS @2x) and desktop jobs
 *   are one browser viewport (1000×820), so the phone and browser frames on the
 *   site both get believable proportions. The H5 build is capped at 500px, so a
 *   desktop capture is the app column centred on the page — that is genuinely
 *   what the web terminal looks like, and it is the only honest way to tell the
 *   web terminal and the app apart in a picture;
 * - the buy/sell action bar is clipped away, because the terminal's guest
 *   spread contradicts the approved per-tier spreads in docs/HATC_FACTS.md;
 * - the daily-candle (日K) tab is selected first: the default 分时 view often
 *   has no chart data and reports an open/high/low that contradicts the last
 *   price;
 * - only the three approved CFD products are captured. The gateway's guest
 *   whitelist also carries forex and index symbols, which must never appear.
 *
 * Usage (the terminal host is not committed — pass the environment you are
 * allowed to capture; production is preferred once its guest group has
 * products configured):
 *
 *   TERMINAL_URL=https://h5.example.com node scripts/capture-terminal.mjs
 *
 * It needs a Chrome with remote debugging on port 9333, e.g.
 *
 *   chrome-headless-shell --headless --no-sandbox --disable-gpu \
 *     --hide-scrollbars --remote-debugging-port=9333 \
 *     --user-data-dir=/tmp/cr-capture about:blank
 */
import {writeFileSync} from 'node:fs';

const TERMINAL_URL = process.env.TERMINAL_URL;
const PORT = process.env.CDP_PORT || '9333';
const OUT_DIR = process.env.OUT_DIR || 'public/platforms';

const PHONE = {width: 430, height: 932, mobile: true};
const DESKTOP = {width: 1000, height: 820, mobile: false};

if (!TERMINAL_URL) {
  console.error('TERMINAL_URL is required (host of the terminal H5 build).');
  process.exit(1);
}

/** Only the approved CFD products — see the file header. */
const JOBS = [
  {symbol: 'XAUUSD', name: '现货黄金', out: 'terminal-gold-chart.png', view: PHONE},
  {
    symbol: 'RKGCNH',
    name: '人民币公斤条',
    out: 'terminal-kilobar-chart.png',
    view: PHONE
  },
  {symbol: 'XAUUSD', name: '现货黄金', out: 'terminal-web-gold.png', view: DESKTOP},
  {
    symbol: 'XAGUSD',
    name: '现货白银',
    out: 'terminal-web-silver.png',
    view: DESKTOP
  }
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function debuggerUrl() {
  for (let i = 0; i < 40; i++) {
    try {
      const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
      const page = list.find((t) => t.type === 'page');
      if (page?.webSocketDebuggerUrl) return page.webSocketDebuggerUrl;
    } catch {
      // Chrome not up yet.
    }
    await sleep(500);
  }
  throw new Error(`no debuggable page on port ${PORT}`);
}

function connect(url) {
  const ws = new WebSocket(url);
  const pending = new Map();
  let id = 0;

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (!msg.id || !pending.has(msg.id)) return;
    const {resolve, reject} = pending.get(msg.id);
    pending.delete(msg.id);
    if (msg.error) reject(new Error(JSON.stringify(msg.error)));
    else resolve(msg.result);
  };

  return {
    ready: new Promise((resolve) => (ws.onopen = resolve)),
    send(method, params = {}) {
      const n = ++id;
      return new Promise((resolve, reject) => {
        pending.set(n, {resolve, reject});
        ws.send(JSON.stringify({id: n, method, params}));
      });
    },
    close: () => ws.close()
  };
}

const evaluate = (cdp, expression) =>
  cdp
    .send('Runtime.evaluate', {expression, returnByValue: true, awaitPromise: true})
    .then((r) => r.result?.value);

async function capture(cdp, {symbol, name, out, view}) {
  await cdp.send('Emulation.setDeviceMetricsOverride', {
    width: view.width,
    height: view.height,
    deviceScaleFactor: 2,
    mobile: view.mobile
  });

  const url = `${TERMINAL_URL.replace(/\/$/, '')}/#/pages/market/detail/index?symbolCode=${symbol}&symbolName=${encodeURIComponent(name)}`;

  // Hash-only navigation does not remount the uni-app router, so force a full
  // document load between symbols — otherwise every file shows the first one.
  await cdp.send('Page.navigate', {url: 'about:blank'});
  await sleep(1000);
  await cdp.send('Page.navigate', {url});
  await sleep(10000);

  const onScreen = await evaluate(
    cdp,
    `document.body.innerText.includes(${JSON.stringify(symbol)})`
  );
  if (!onScreen) throw new Error(`${out}: ${symbol} never appeared (wrong route param?)`);

  const switched = await evaluate(
    cdp,
    `(() => {
      const tab = [...document.querySelectorAll('*')].filter(
        (e) => e.children.length === 0 && e.textContent.trim() === '日K'
      );
      if (!tab.length) return false;
      tab[tab.length - 1].click();
      return true;
    })()`
  );
  if (!switched) throw new Error(`${out}: could not select the 日K tab`);
  await sleep(9000);

  // Clip above the buy/sell bar; its guest spread must never be legible.
  const barTop = await evaluate(
    cdp,
    `(() => {
      const leaves = [...document.querySelectorAll('*')].filter(
        (e) => e.children.length === 0 && /卖出|賣出/.test(e.textContent || '')
      );
      if (!leaves.length) return 0;
      return Math.floor(Math.min(...leaves.map((e) => e.getBoundingClientRect().top)));
    })()`
  );
  if (barTop <= 200) throw new Error(`${out}: action bar not found — refusing to ship an uncropped capture`);

  const {data} = await cdp.send('Page.captureScreenshot', {
    format: 'png',
    captureBeyondViewport: false,
    clip: {x: 0, y: 0, width: view.width, height: barTop - 8, scale: 1}
  });

  const path = `${OUT_DIR}/${out}`;
  writeFileSync(path, Buffer.from(data, 'base64'));
  console.log(
    `${path}: ${view.width}×${barTop - 8} CSS @2x (bar clipped at ${barTop})`
  );
}

const cdp = connect(await debuggerUrl());
await cdp.ready;
await cdp.send('Page.enable');
await cdp.send('Runtime.enable');

for (const job of JOBS) await capture(cdp, job);

cdp.close();
console.log('done — review every file by eye before committing.');
