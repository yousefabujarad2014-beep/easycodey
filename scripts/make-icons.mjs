/* Maakt de app-iconen (PNG) uit de SVG-bronnen met headless Chrome.
   Gebruik: npm run icons

   Nodig: Google Chrome op de standaard Windows-locatie, of zet CHROME_PATH.
   Het script start zelf een tijdelijke headless Chrome op poort 9222. */

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const iconDir = path.join(root, "assets", "icons");
const PORT = 9222;
const CHROME = process.env.CHROME_PATH || "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

const jobs = [
  { svg: "icon.svg", size: 192, out: "icon-192.png", transparent: true },
  { svg: "icon.svg", size: 512, out: "icon-512.png", transparent: true },
  { svg: "maskable.svg", size: 192, out: "icon-maskable-192.png", transparent: false },
  { svg: "maskable.svg", size: 512, out: "icon-maskable-512.png", transparent: false },
  { svg: "maskable.svg", size: 180, out: "apple-touch-icon.png", transparent: false }
];

const workDir = fs.mkdtempSync(path.join(os.tmpdir(), "easycodey-icons-"));
const renderPage = path.join(workDir, "render.html");
const profileDir = path.join(workDir, "chrome-profile");

fs.writeFileSync(
  renderPage,
  `<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;padding:0;background:transparent;overflow:hidden}img{display:block;width:100vw;height:100vh}</style></head><body><img id="icon" alt=""></body></html>`
);

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function probe() {
  try {
    const response = await fetch(`http://127.0.0.1:${PORT}/json/version`);
    return response.ok;
  } catch {
    return false;
  }
}

let chrome = null;

async function ensureChrome() {
  if (await probe()) return;
  if (!fs.existsSync(CHROME)) {
    throw new Error(`Chrome niet gevonden op ${CHROME}. Zet CHROME_PATH of start Chrome met --remote-debugging-port=${PORT}.`);
  }
  chrome = spawn(
    CHROME,
    [
      "--headless=new",
      `--remote-debugging-port=${PORT}`,
      `--user-data-dir=${profileDir}`,
      "--no-first-run",
      "--no-default-browser-check",
      "--disable-gpu",
      "--window-size=512,512",
      "about:blank"
    ],
    { stdio: "ignore" }
  );
  for (let attempt = 0; attempt < 80; attempt += 1) {
    if (await probe()) return;
    await sleep(250);
  }
  throw new Error("Chrome startte niet op tijd.");
}

async function getTarget() {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      const response = await fetch(`http://127.0.0.1:${PORT}/json`);
      const targets = await response.json();
      const page = targets.find((item) => item.type === "page");
      if (page?.webSocketDebuggerUrl) return page;
    } catch {
      // Chrome is nog niet klaar.
    }
    await sleep(250);
  }
  throw new Error("Geen Chrome-debugtarget gevonden.");
}

await ensureChrome();

const target = await getTarget();
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  ws.onopen = resolve;
  ws.onerror = reject;
});

let nextId = 0;
const pending = new Map();
ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  if (!message.id || !pending.has(message.id)) return;
  const { resolve, reject } = pending.get(message.id);
  pending.delete(message.id);
  if (message.error) reject(new Error(message.error.message));
  else resolve(message.result);
};

function send(method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = ++nextId;
    pending.set(id, { resolve, reject });
    ws.send(JSON.stringify({ id, method, params }));
  });
}

async function evaluate(expression) {
  const result = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text);
  return result.result.value;
}

await send("Page.enable");
await send("Runtime.enable");
await send("Page.navigate", { url: `file:///${renderPage.replace(/\\/g, "/")}` });
await sleep(600);

for (const job of jobs) {
  await send("Emulation.setDeviceMetricsOverride", {
    width: job.size,
    height: job.size,
    deviceScaleFactor: 1,
    mobile: false
  });
  const svgUrl = `file:///${path.join(iconDir, job.svg).replace(/\\/g, "/")}`;
  await evaluate(`(async () => {
    const img = document.querySelector("#icon");
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = ${JSON.stringify(svgUrl)};
    });
    await img.decode();
    return true;
  })()`);
  await sleep(150);
  await send("Emulation.setDefaultBackgroundColorOverride", {
    color: job.transparent ? { r: 0, g: 0, b: 0, a: 0 } : { r: 255, g: 255, b: 255, a: 255 }
  });
  const { data } = await send("Page.captureScreenshot", {
    format: "png",
    fromSurface: true,
    captureBeyondViewport: false,
    omitBackground: job.transparent,
    clip: { x: 0, y: 0, width: job.size, height: job.size, scale: 1 }
  });
  const outPath = path.join(iconDir, job.out);
  fs.writeFileSync(outPath, Buffer.from(data, "base64"));
  console.log(`${job.out} — ${job.size}x${job.size} — ${fs.statSync(outPath).size} bytes`);
}

ws.close();
if (chrome) chrome.kill();
try {
  fs.rmSync(workDir, { recursive: true, force: true });
} catch {
  // Chrome houdt het profiel soms nog even vast; de tijdelijke map wordt later opgeruimd.
}
