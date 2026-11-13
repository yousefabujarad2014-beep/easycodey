/* EasyCodey service worker — installeerbare app en offline modus.
   Bij een grote wijziging: verhoog VERSION, dan wordt de oude cache opgeruimd. */

const VERSION = "easycodey-v14";
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
  "./js/analytics.js",
  "./js/counter.js",
  "./js/previews.js",
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
  "./assets/icons/logo.svg",
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

/* Bewaar nooit iets stil kapot: een volle cache of een mislukte put mag
   nooit verhinderen dat de pagina zelf geladen wordt. */
function putSafe(cache, request, response) {
  try {
    return cache.put(request, response.clone()).catch(() => {});
  } catch {
    return Promise.resolve();
  }
}

/* Als het netwerk traag of weg is, tonen we liever meteen de bewaarde versie
   dan de bezoeker een leeg scherm te geven. */
function withTimeout(promise, ms) {
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(null), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      () => {
        clearTimeout(timer);
        resolve(null);
      }
    );
  });
}

const NAV_TIMEOUT = 3500;
const ASSET_TIMEOUT = 2500;

async function networkFirstNavigation(request) {
  const cache = await caches.open(SHELL_CACHE);
  const network = fetch(request)
    .then((response) => {
      if (isCacheable(response)) putSafe(cache, request, response);
      return response;
    })
    .catch(() => null);
  const cached =
    (await cache.match(request)) ||
    (await cache.match("./index.html")) ||
    (await cache.match("./"));
  const fresh = cached ? await withTimeout(network, NAV_TIMEOUT) : await network;
  return (
    fresh ||
    cached ||
    (await caches.match("./offline.html")) ||
    new Response("<h1>Je bent offline</h1>", {
      status: 503,
      headers: { "Content-Type": "text/html; charset=utf-8" }
    })
  );
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const network = fetch(request)
    .then((response) => {
      if (isCacheable(response)) putSafe(cache, request, response);
      return response;
    })
    .catch(() => null);
  return cached || network || new Response("", { status: 504 });
}

async function networkFirstAsset(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const network = fetch(request)
    .then((response) => {
      if (isCacheable(response)) putSafe(cache, request, response);
      return response;
    })
    .catch(() => null);
  // Zonder bewaarde kopie wachten we op het netwerk; met kopie krijgt het
  // netwerk heel even de tijd en anders start de app uit de cache.
  const fresh = cached ? await withTimeout(network, ASSET_TIMEOUT) : await network;
  return fresh || cached || new Response("", { status: 504 });
}

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (isCacheable(response)) putSafe(cache, request, response);
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
    // Code en styles altijd eerst van het netwerk halen, zodat een nieuwe versie
    // nooit achter een oude cache blijft hangen. Afbeeldingen mogen uit de cache.
    if (request.destination === "image" || request.destination === "font") {
      event.respondWith(cacheFirst(request, SHELL_CACHE));
    } else {
      event.respondWith(networkFirstAsset(request, SHELL_CACHE));
    }
    return;
  }

  // Lettertypen en de Python-runtime (Pyodide) worden pas bij gebruik bewaard,
  // zodat de app daarna ook zonder internet werkt.
  const cdnHosts = ["cdn.jsdelivr.net", "fonts.googleapis.com", "fonts.gstatic.com"];
  if (cdnHosts.includes(url.hostname)) {
    event.respondWith(cacheFirst(request, RUNTIME_CACHE));
  }
});
