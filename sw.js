/* EasyCodey service worker — installeerbare app en offline modus.
   Bij een grote wijziging: verhoog VERSION, dan wordt de oude cache opgeruimd. */

const VERSION = "easycodey-v3";
const SHELL_CACHE = `${VERSION}-shell`;
const RUNTIME_CACHE = `${VERSION}-runtime`;

const SHELL = [
  "./",
  "./index.html",
  "./offline.html",
  "./manifest.webmanifest",
  "./styles.css",
  "./app.js",
  "./js/ai.js",
  "./js/store.js",
  "./data/index.js",
  "./data/helper.js",
  "./data/ideas-01.js",
  "./data/ideas-02.js",
  "./data/ideas-03.js",
  "./data/ideas-04.js",
  "./data/ideas-05.js",
  "./data/ideas-06.js",
  "./data/ideas-07.js",
  "./assets/icons/icon.svg",
  "./assets/icons/icon-192.png",
  "./assets/icons/icon-512.png",
  "./assets/icons/icon-maskable-192.png",
  "./assets/icons/icon-maskable-512.png",
  "./assets/icons/apple-touch-icon.png",
  "./assets/covers/games.svg",
  "./assets/covers/web.svg",
  "./assets/covers/gui.svg",
  "./assets/covers/data-ai.svg",
  "./assets/covers/tools.svg",
  "./assets/covers/automatisering.svg",
  "./assets/covers/security.svg",
  "./assets/covers/wetenschap.svg",
  "./assets/covers/kunst.svg",
  "./assets/covers/onderwijs.svg"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(SHELL_CACHE);
      // Eén ontbrekend bestand mag de installatie niet blokkeren.
      await Promise.allSettled(
        SHELL.map((url) =>
          cache.add(new Request(new URL(url, self.location.href).href, { cache: "reload" }))
        )
      );
      await self.skipWaiting();
    })()
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((key) => !key.startsWith(VERSION)).map((key) => caches.delete(key)));
      await self.clients.claim();
    })()
  );
});

self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") self.skipWaiting();
});

function isCacheable(response) {
  if (!response) return false;
  if (response.status === 200) return true;
  return response.type === "opaque";
}

async function networkFirstNavigation(request) {
  const cache = await caches.open(SHELL_CACHE);
  try {
    const response = await fetch(request);
    if (isCacheable(response)) cache.put(request, response.clone());
    return response;
  } catch {
    return (
      (await cache.match(request)) ||
      (await cache.match("./index.html")) ||
      (await cache.match("./")) ||
      (await caches.match("./offline.html")) ||
      new Response("<h1>Je bent offline</h1>", {
        status: 503,
        headers: { "Content-Type": "text/html; charset=utf-8" }
      })
    );
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const network = fetch(request)
    .then((response) => {
      if (isCacheable(response)) cache.put(request, response.clone());
      return response;
    })
    .catch(() => null);
  return cached || network || new Response("", { status: 504 });
}

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (isCacheable(response)) cache.put(request, response.clone());
    return response;
  } catch {
    return new Response("", { status: 504 });
  }
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.protocol !== "http:" && url.protocol !== "https:") return;
  if (url.pathname.includes("/api/")) return;

  if (request.mode === "navigate") {
    event.respondWith(networkFirstNavigation(request));
    return;
  }

  if (url.origin === self.location.origin) {
    event.respondWith(staleWhileRevalidate(request, SHELL_CACHE));
    return;
  }

  // Lettertypen en de Python-runtime (Pyodide) worden pas bij gebruik bewaard,
  // zodat de app daarna ook zonder internet werkt.
  const cdnHosts = ["cdn.jsdelivr.net", "fonts.googleapis.com", "fonts.gstatic.com"];
  if (cdnHosts.includes(url.hostname)) {
    event.respondWith(cacheFirst(request, RUNTIME_CACHE));
  }
});
