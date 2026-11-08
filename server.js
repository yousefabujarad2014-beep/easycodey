import http from "node:http";
import { readFile, stat } from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// ---------- .env laden (zonder extra pakketjes) ----------
const root = path.dirname(fileURLToPath(import.meta.url));
const envFile = path.join(root, ".env");
if (existsSync(envFile)) {
  for (const line of readFileSync(envFile, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!match) continue;
    const key = match[1];
    const value = match[2].replace(/^["']|["']$/g, "");
    if (!(key in process.env)) process.env[key] = value;
  }
}

const PORT = Number(process.env.PORT) || 4173;
const HOST = process.env.HOST || "0.0.0.0";
const MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";
const BASE_URL = (process.env.OPENAI_BASE_URL || "https://api.openai.com/v1").replace(/\/+$/, "");
const ACCESS_CODE = String(process.env.ACCESS_CODE || "");
const RATE_LIMIT = Number(process.env.RATE_LIMIT) || 30;
const RATE_WINDOW = 60 * 60 * 1000;

// Optionele doneergegevens. site-config.json is de gedeelde bron voor
// GitHub Pages; omgevingsvariabelen hebben voorrang op de server.
let siteConfig = {};
try {
  siteConfig = JSON.parse(readFileSync(path.join(root, "site-config.json"), "utf8"));
} catch {
  siteConfig = {};
}

const DONATE_URL = String(process.env.DONATE_URL || siteConfig.donateUrl || "").trim();
const DONATE_LABEL = String(process.env.DONATE_LABEL || siteConfig.donateLabel || "").trim();
const DONATE_NOTE = String(process.env.DONATE_NOTE || siteConfig.donateNote || "").trim();
const DONATE_IBAN = String(process.env.DONATE_IBAN || siteConfig.donateIban || "").trim();
const DONATE_NAME = String(process.env.DONATE_NAME || siteConfig.donateName || "").trim();
const DONATE_BANK = String(process.env.DONATE_BANK || siteConfig.donateBank || "").trim();
const SITE_URL = String(process.env.SITE_URL || "https://yousefabujarad2014-beep.github.io/easycodey").replace(/\/+$/, "");

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".txt": "text/plain; charset=utf-8",
  ".md": "text/plain; charset=utf-8"
};

const SYSTEM_PROMPT = `Je bent EasyCoach, de Nederlandstalige AI-coach van EasyCodey.
EasyCodey is een leerwebsite met Python-projecten en stap-voor-stap uitleg.

Werkwijze:
- Antwoord altijd in het Nederlands.
- Wees vriendelijk, concreet en moedig de gebruiker aan.
- Leg uit waarom iets werkt, niet alleen wat de gebruiker moet typen.
- Geef korte, uitvoerbare codevoorbeelden in Python.
- Verwijs naar de context als de gebruiker een project of stap bekijkt.
- Als code niet werkt: vraag naar de foutmelding en help stap voor stap debuggen.
- Verzin geen bibliotheken, functies of API's die niet bestaan.
- Houd antwoorden overzichtelijk met kopjes, korte lijsten en codeblokken.
- Bij een eigen idee: help het kleiner en haalbaarder maken voordat je code geeft.`;

const GENERATOR_PROMPT = `Je bent EasyCoach, de Nederlandstalige projectgenerator van EasyCodey.
Maak een compleet, haalbaar Python-projectidee voor een lerende gebruiker.

Antwoord met ALLEEN geldige JSON, zonder markdown, uitleg of code fences. Gebruik exact deze structuur:
{
  "title": "korte pakkende titel",
  "emoji": "één emoji",
  "category": "Games|Web|GUI|Data & AI|Handige tools|Automatisering|Security|Wetenschap|Kunst & Creatief|Onderwijs",
  "level": "Beginner|Gemiddeld|Gevorderd",
  "time": "bijv. 45 min",
  "summary": "één zin",
  "description": "twee of drie zinnen uitleg",
  "learn": ["vaardigheid1", "vaardigheid2", "vaardigheid3"],
  "steps": [
    {
      "title": "titel van de stap",
      "text": "uitleg in 1-3 zinnen",
      "code": "werkende Python-code met \\n voor nieuwe regels"
    }
  ],
  "tips": ["tip 1", "tip 2"]
}

Regels:
- Minimaal 3 en maximaal 5 stappen.
- Elke stap bevat echte, uitvoerbare Python-code.
- Geen betaalde diensten of verplichte API-sleutels.
- Geen externe bestanden die de gebruiker niet heeft.
- Houd het project haalbaar binnen de opgegeven tijd.`;

const rateBuckets = new Map();

function isRateLimited(ip) {
  const now = Date.now();
  const bucket = (rateBuckets.get(ip) || []).filter((time) => now - time < RATE_WINDOW);
  if (bucket.length >= RATE_LIMIT) {
    rateBuckets.set(ip, bucket);
    return true;
  }
  bucket.push(now);
  rateBuckets.set(ip, bucket);
  return false;
}

function sendJson(res, status, data) {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body),
    "Cache-Control": "no-store"
  });
  res.end(body);
}

function readBody(req, limit = 1_000_000) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > limit) {
        reject(new Error("Verzoek is te groot."));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

function contextPrompt(context) {
  if (!context || typeof context !== "object") return "";

  const lines = ["\n\nContext van de gebruiker:"];
  if (context.idea) {
    lines.push(
      `- Project: "${context.idea.title}" (${context.idea.category}, niveau ${context.idea.level}).`
    );
    if (context.idea.summary) lines.push(`- Samenvatting: ${context.idea.summary}`);
  }
  if (context.step) {
    lines.push(
      `- Huidige stap ${context.step.index + 1} van ${context.step.total}: "${context.step.title}".`
    );
    if (context.step.text) lines.push(`- Uitleg van de stap: ${context.step.text}`);
    if (context.step.code) {
      lines.push(`- Code van de stap:\n\`\`\`python\n${String(context.step.code).slice(0, 1600)}\n\`\`\``);
    }
  }
  return lines.join("\n");
}

// ---------- Chat proxy ----------
async function handleChat(req, res, ip) {
  let payload;
  try {
    const raw = await readBody(req);
    payload = JSON.parse(raw || "{}");
  } catch {
    return sendJson(res, 400, { error: "Ongeldig verzoek." });
  }

  if (ACCESS_CODE) {
    const provided = req.headers["x-access-code"] || payload.accessCode;
    if (provided !== ACCESS_CODE) {
      return sendJson(res, 401, {
        error: "access-code",
        message: "Deze site vraagt een toegangscode voor de AI-coach. Stel die in via de instellingen."
      });
    }
  }

  if (isRateLimited(ip)) {
    return sendJson(res, 429, {
      error: "rate-limit",
      message: "Je hebt te veel AI-verzoeken gedaan. Probeer het over een uur opnieuw."
    });
  }

  const messages = Array.isArray(payload.messages) ? payload.messages : [];
  if (!messages.length) {
    return sendJson(res, 400, { error: "Geen berichten meegestuurd." });
  }

  const apiKey = process.env.OPENAI_API_KEY || payload.apiKey;
  if (!apiKey) {
    return sendJson(res, 401, {
      error: "no-key",
      message: "Er is geen API-sleutel ingesteld. Open de instellingen om er een toe te voegen."
    });
  }

  const requestedBase = typeof payload.baseUrl === "string" ? payload.baseUrl.trim() : "";
  let baseUrl = BASE_URL;
  if (requestedBase && /^https:\/\//i.test(requestedBase) && !process.env.OPENAI_BASE_URL) {
    baseUrl = requestedBase.replace(/\/+$/, "");
  }

  const model = typeof payload.model === "string" && payload.model.trim()
    ? payload.model.trim()
    : MODEL;
  const mode = payload.mode === "generate" ? "generate" : "chat";
  const systemPrompt =
    mode === "generate" ? GENERATOR_PROMPT : SYSTEM_PROMPT + contextPrompt(payload.context);

  const upstreamBody = {
    model,
    messages: [
      { role: "system", content: systemPrompt },
      ...messages
        .filter((message) => message && ["user", "assistant"].includes(message.role) && typeof message.content === "string")
        .slice(-24)
    ],
    temperature: mode === "generate" ? 0.7 : 0.55,
    max_tokens: mode === "generate" ? 1800 : 1200,
    stream: true
  };

  let upstream;
  try {
    upstream = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify(upstreamBody)
    });
  } catch (error) {
    return sendJson(res, 502, {
      error: "upstream",
      message: `Kon de AI-dienst niet bereiken: ${error.message}`
    });
  }

  if (!upstream.ok) {
    let detail = "";
    try {
      const text = await upstream.text();
      const parsed = JSON.parse(text);
      detail = parsed?.error?.message || text;
    } catch {
      detail = "Onbekende fout bij de AI-dienst.";
    }
    return sendJson(res, upstream.status, {
      error: "upstream",
      message: String(detail).slice(0, 500)
    });
  }

  res.writeHead(200, {
    "Content-Type": "text/event-stream; charset=utf-8",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no"
  });

  try {
    for await (const chunk of upstream.body) {
      res.write(chunk);
    }
  } catch {
    // Verbinding weggevallen; de client toont wat er al binnen is.
  } finally {
    res.end();
  }
}

// ---------- Statische bestanden ----------
const BLOCKED_FILES = new Set([
  "server.js",
  "package.json",
  "package-lock.json",
  "render.yaml",
  "readme.md",
  "start-easycodey.bat"
]);
const BLOCKED_DIRS = new Set(["scripts", ".git"]);

async function serveStatic(req, res, pathname) {
  let rel = decodeURIComponent(pathname);
  if (rel === "/" || rel === "") rel = "/index.html";

  const safePath = path.normalize(path.join(root, rel));
  if (safePath !== root && !safePath.startsWith(root + path.sep)) {
    return sendJson(res, 403, { error: "Verboden pad." });
  }

  const relativePath = path.relative(root, safePath);
  const firstSegment = relativePath.split(path.sep)[0];
  if (
    path.basename(safePath).startsWith(".") ||
    path.extname(safePath).toLowerCase() === ".md" ||
    BLOCKED_FILES.has(relativePath.toLowerCase()) ||
    BLOCKED_DIRS.has(firstSegment)
  ) {
    return sendJson(res, 404, { error: "Niet gevonden." });
  }

  try {
    const info = await stat(safePath);
    if (info.isDirectory()) {
      return sendJson(res, 404, { error: "Niet gevonden." });
    }
    const data = await readFile(safePath);
    const type = MIME[path.extname(safePath).toLowerCase()] || "application/octet-stream";
    res.writeHead(200, {
      "Content-Type": type,
      "Content-Length": data.length,
      "Cache-Control": "no-cache"
    });
    res.end(data);
  } catch {
    // SPA-fallback: onbekende paden krijgen de app.
    try {
      const html = await readFile(path.join(root, "index.html"));
      res.writeHead(200, {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Length": html.length
      });
      res.end(html);
    } catch {
      sendJson(res, 404, { error: "Niet gevonden." });
    }
  }
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
  const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket.remoteAddress || "unknown";

  if (url.pathname === "/robots.txt") {
    res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
    return res.end(`User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: ${SITE_URL}/sitemap.xml\n`);
  }

  if (url.pathname === "/sitemap.xml") {
    res.writeHead(200, { "Content-Type": "application/xml; charset=utf-8" });
    return res.end(
      `<?xml version="1.0" encoding="UTF-8"?>\n` +
        `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
        `  <url>\n    <loc>${SITE_URL}/</loc>\n    <changefreq>weekly</changefreq>\n    <priority>1.0</priority>\n  </url>\n` +
        `</urlset>\n`
    );
  }

  if (url.pathname === "/api/config") {
    return sendJson(res, 200, {
      hasServerKey: Boolean(process.env.OPENAI_API_KEY),
      model: MODEL,
      accessCodeRequired: Boolean(ACCESS_CODE),
      donateUrl: DONATE_URL,
      donateLabel: DONATE_LABEL,
      donateNote: DONATE_NOTE,
      donateIban: DONATE_IBAN,
      donateName: DONATE_NAME,
      donateBank: DONATE_BANK
    });
  }

  if (url.pathname === "/api/chat") {
    if (req.method !== "POST") return sendJson(res, 405, { error: "Alleen POST." });
    return handleChat(req, res, ip);
  }

  if (req.method !== "GET" && req.method !== "HEAD") {
    return sendJson(res, 405, { error: "Alleen GET." });
  }

  return serveStatic(req, res, url.pathname);
});

server.listen(PORT, HOST, () => {
  console.log("");
  console.log("  EasyCodey draait op  http://localhost:" + PORT);
  console.log(
    "  AI-coach:           " +
      (process.env.OPENAI_API_KEY ? "server-sleutel gevonden" : "offline coach (voeg een sleutel toe in de site)")
  );
  console.log("  Toegangscode:       " + (ACCESS_CODE ? "aan" : "uit"));
  console.log("  Rate limit:         " + RATE_LIMIT + " AI-verzoeken per uur per IP");
  console.log("  Doneren:            " + (DONATE_URL ? "aan" : "uit (stel DONATE_URL in)"));
  console.log("");
});
