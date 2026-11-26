#!/usr/bin/env node
/**
 * DOM check for the consultation card.
 * The page script is loaded as-is. setTimeout is observed so the test can
 * confirm the delay is 10000ms, then run that callback and inspect the card.
 */

const { spawn } = require('child_process');
const fs = require('fs');
const http = require('http');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SCRIPT = fs.readFileSync(path.join(ROOT, 'frontend/assets/js/consult-popup.js'), 'utf8');
const PORT = 9333;

function pageHtml(lang) {
  return `<!DOCTYPE html><html lang="${lang}"><head><meta charset="utf-8"><title>popup test</title></head>
<body><main style="min-height:120vh">Article</main>
<script>
window.__scheduled = [];
window.setTimeout = function (fn, ms) {
  window.__scheduled.push({ fn: fn, ms: ms });
  return window.__scheduled.length;
};
</script>
<script>${SCRIPT}</script>
</body></html>`;
}

function startServer() {
  const pages = {
    '/blog/sample': pageHtml('ja'),
    '/en/blog/sample': pageHtml('en'),
    '/cn/blog/sample': pageHtml('zh-CN'),
    '/travel/zh-tw/itinerary/sample': pageHtml('zh-Hant'),
    '/contact': pageHtml('ja'),
    '/en/contact': pageHtml('en'),
    '/cn/contact': pageHtml('zh-CN'),
    '/admin': pageHtml('ja'),
    '/blog-post': pageHtml('ja'),
    '/': pageHtml('ja')
  };
  const server = http.createServer((req, res) => {
    const html = pages[req.url.split('?')[0]];
    if (!html) {
      res.writeHead(404);
      res.end('missing');
      return;
    }
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(html);
  });
  return new Promise((resolve) => server.listen(PORT, '127.0.0.1', () => resolve(server)));
}

function getJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => resolve(JSON.parse(body)));
    }).on('error', reject);
  });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function debuggerUrl() {
  for (let i = 0; i < 40; i++) {
    try {
      const tabs = await getJson('http://127.0.0.1:9222/json');
      const page = tabs.find((tab) => tab.type === 'page');
      if (page) return page.webSocketDebuggerUrl;
    } catch (err) {
      await sleep(150);
    }
  }
  throw new Error('Chrome DevTools endpoint did not come up');
}

function cdp(wsUrl) {
  const ws = new WebSocket(wsUrl);
  let seq = 0;
  const pending = new Map();
  const waits = [];
  ws.addEventListener('message', (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && pending.has(msg.id)) {
      const job = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) job.reject(new Error(JSON.stringify(msg.error)));
      else job.resolve(msg.result);
    } else {
      waits.slice().forEach((waiter) => waiter(msg));
    }
  });
  return new Promise((resolve, reject) => {
    ws.addEventListener('open', () => {
      resolve({
        send(method, params = {}) {
          const id = ++seq;
          return new Promise((res, rej) => {
            pending.set(id, { resolve: res, reject: rej });
            ws.send(JSON.stringify({ id, method, params }));
          });
        },
        waitEvent(name) {
          return new Promise((res) => {
            const waiter = (msg) => {
              if (msg.method === name) {
                waits.splice(waits.indexOf(waiter), 1);
                res(msg.params);
              }
            };
            waits.push(waiter);
          });
        },
        close() { ws.close(); }
      });
    });
    ws.addEventListener('error', reject);
  });
}

async function evaluate(client, expression) {
  const result = await client.send('Runtime.evaluate', { expression, returnByValue: true });
  if (result.exceptionDetails) {
    throw new Error(result.exceptionDetails.text || JSON.stringify(result.exceptionDetails));
  }
  return result.result.value;
}

async function openPage(client, urlPath) {
  const loaded = client.waitEvent('Page.loadEventFired');
  await client.send('Page.navigate', { url: `http://127.0.0.1:${PORT}${urlPath}` });
  await loaded;
}

async function state(client) {
  return evaluate(client, `(() => {
    const el = document.getElementById('protech-consult');
    const cta = el && el.querySelector('a');
    const close = el && el.querySelector('button');
    const rect = el ? el.getBoundingClientRect() : null;
    return {
      scheduled: (window.__scheduled || []).map((item) => item.ms),
      present: Boolean(el),
      text: el ? el.innerText : '',
      href: cta ? cta.getAttribute('href') : '',
      close: close ? close.innerText : '',
      role: el ? el.getAttribute('role') : '',
      width: rect ? rect.width : 0,
      height: rect ? rect.height : 0,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      position: el ? getComputedStyle(el).position : ''
    };
  })()`);
}

function assertCard(info, href, label, closeWord) {
  if (!info.scheduled.includes(10000)) throw new Error('timer was not 10000ms: ' + JSON.stringify(info.scheduled));
  if (info.scheduled.some((ms) => ms !== 10000)) throw new Error('unexpected timer ' + JSON.stringify(info.scheduled));
  if (!info.present) throw new Error('card missing for ' + label);
  if (info.href !== href) throw new Error(label + ' href ' + info.href);
  if (!info.text.includes(label)) throw new Error(label + ' copy ' + info.text);
  if (!info.close.includes('×') || !info.close.includes(closeWord)) throw new Error(label + ' close ' + info.close);
  if (info.role !== 'complementary') throw new Error('card role ' + info.role);
  if (info.position !== 'fixed') throw new Error('card position ' + info.position);
  if (info.height > info.viewportHeight * 0.45) throw new Error(label + ' card is too tall ' + info.height);
  if (info.width > info.viewportWidth - 8) throw new Error(label + ' card spans the viewport');
}

(async () => {
  const server = await startServer();
  const chrome = spawn('google-chrome', [
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--remote-debugging-port=9222',
    '--user-data-dir=/tmp/chrome-consult-popup',
    'about:blank'
  ], { stdio: 'ignore' });
  try {
    const client = await cdp(await debuggerUrl());
    await client.send('Page.enable');
    await client.send('Runtime.enable');
    await client.send('Emulation.setDeviceMetricsOverride', {
      width: 1280, height: 800, deviceScaleFactor: 1, mobile: false
    });

    await openPage(client, '/blog/sample');
    const before = await state(client);
    if (before.present) throw new Error('card rendered before the timer callback');
    if (!before.scheduled.includes(10000)) throw new Error('JA page did not schedule 10000ms');
    await evaluate(client, 'window.__scheduled.find((item) => item.ms === 10000).fn()');
    assertCard(await state(client), '/contact', '無料相談する', '閉じる');

    await evaluate(client, `document.querySelector('#protech-consult button').click()`);
    const dismissed = await evaluate(client, `({
      gone: document.getElementById('protech-consult') === null,
      stored: sessionStorage.getItem('protechConsultDismissed')
    })`);
    if (!dismissed.gone || dismissed.stored !== '1') throw new Error('dismiss failed ' + JSON.stringify(dismissed));

    await openPage(client, '/blog/sample');
    const again = await state(client);
    if (again.present || again.scheduled.length) throw new Error('card was scheduled again after dismiss ' + JSON.stringify(again));

    await evaluate(client, `sessionStorage.removeItem('protechConsultDismissed')`);
    await client.send('Emulation.setDeviceMetricsOverride', {
      width: 390, height: 844, deviceScaleFactor: 2, mobile: true
    });

    await openPage(client, '/en/blog/sample');
    await evaluate(client, 'window.__scheduled.find((item) => item.ms === 10000).fn()');
    assertCard(await state(client), '/en/contact', 'Free Consultation', 'Close');

    await openPage(client, '/cn/blog/sample');
    await evaluate(client, 'window.__scheduled.find((item) => item.ms === 10000).fn()');
    assertCard(await state(client), '/cn/contact', '免费咨询', '关闭');

    await openPage(client, '/travel/zh-tw/itinerary/sample');
    await evaluate(client, 'window.__scheduled.find((item) => item.ms === 10000).fn()');
    assertCard(await state(client), '/cn/contact', '免費諮詢', '關閉');

    for (const blocked of ['/contact', '/en/contact', '/cn/contact', '/admin', '/blog-post', '/']) {
      await openPage(client, blocked);
      const hidden = await state(client);
      if (hidden.present || hidden.scheduled.length) {
        throw new Error('popup armed on excluded path ' + blocked + ' ' + JSON.stringify(hidden));
      }
    }

    const homeFile = fs.readFileSync(path.join(ROOT, 'frontend/index.html'), 'utf8');
    const headEnd = homeFile.indexOf('</head>');
    if (homeFile.slice(headEnd).includes('consult-popup')) {
      throw new Error('locked homepage body references the popup');
    }

    client.close();
    console.log('consult popup checks passed');
  } finally {
    chrome.kill('SIGKILL');
    server.close();
  }
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
