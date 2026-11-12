/* EasyCodey — privacyvriendelijke gebruiksstatistieken.
   We gebruiken GoatCounter: cookieloos, geen persoonsgegevens, geen advertenties.
   De sitecode stelt de eigenaar in via het beheerscherm; zonder sitecode wordt
   er niets geladen en niets verstuurd. Bezoekers kunnen zich altijd afmelden. */

const SITE_KEY = "easycodey.analytics.site.v1";
const OPTOUT_KEY = "easycodey.analytics.optout.v1";
const UPDATE_KEY = "easycodey.lastUpdate.v1";
const SCRIPT_SRC = "https://gc.zgo.at/count.js";
const MAX_QUEUE = 60;

let loadedSite = "";
let publicSite = "";
let configLoaded = false;
let queue = [];

function read(key, fallback = "") {
  try {
    const value = localStorage.getItem(key);
    return value === null ? fallback : value;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Zonder opslag meten we niet; de app blijft gewoon werken.
  }
}

function remove(key) {
  try {
    localStorage.removeItem(key);
  } catch {
    // Negeer.
  }
}

export function normalizeSite(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/\/.*$/, "")
    .replace(/\.goatcounter\.com$/, "")
    .replace(/[^a-z0-9-]/g, "")
    .slice(0, 40);
}

export function getAnalyticsSite() {
  return normalizeSite(read(SITE_KEY)) || publicSite;
}

/* De sitecode voor álle bezoekers staat in site-config.json. Zo telt de app
   niet alleen op het toestel van de eigenaar, maar bij iedereen die EasyCodey
   gebruikt. De eigenaar kan lokaal een andere code instellen om te testen. */
export async function loadAnalyticsConfig() {
  try {
    const response = await fetch("site-config.json", { cache: "no-store" });
    const config = await response.json();
    publicSite = normalizeSite(config?.analyticsSite);
  } catch {
    publicSite = "";
  }
  configLoaded = true;
  return publicSite;
}

export function setAnalyticsSite(value) {
  const site = normalizeSite(value);
  if (site) write(SITE_KEY, site);
  else {
    remove(SITE_KEY);
    stopAnalytics();
  }
  return site;
}

export function isAnalyticsOptOut() {
  return read(OPTOUT_KEY) === "1";
}

export function setAnalyticsOptOut(value) {
  if (value) {
    write(OPTOUT_KEY, "1");
    // Wie zich afmeldt, laadt het meetscript niet meer en stuurt niets meer.
    stopAnalytics();
  } else {
    remove(OPTOUT_KEY);
  }
  return isAnalyticsOptOut();
}

/* Stop met meten: script verwijderen, wachtrij leegmaken en niets meer sturen.
   De keuze zelf blijft staan, zodat de app later weer kan starten. */
export function stopAnalytics() {
  queue = [];
  loadedSite = "";
  try {
    document.querySelectorAll("script[data-goatcounter]").forEach((script) => script.remove());
  } catch {
    // Negeer.
  }
  try {
    if (window.goatcounter) delete window.goatcounter;
  } catch {
    window.goatcounter = undefined;
  }
}

export function analyticsInfo() {
  const localSite = normalizeSite(read(SITE_KEY));
  const site = localSite || publicSite;
  const optOut = isAnalyticsOptOut();
  return {
    site,
    localSite,
    publicSite,
    source: localSite ? "local" : publicSite ? "public" : "",
    optOut,
    enabled: Boolean(site) && !optOut,
    dashboard: site ? `https://${site}.goatcounter.com` : "",
    scriptLoaded: Boolean(loadedSite) && typeof window.goatcounter?.count === "function"
  };
}

export function markUpdate(version) {
  write(UPDATE_KEY, JSON.stringify({ version: String(version || ""), at: Date.now() }));
}

export function getLastUpdate() {
  try {
    const parsed = JSON.parse(read(UPDATE_KEY, ""));
    return { version: String(parsed?.version || ""), at: Number(parsed?.at) || 0 };
  } catch {
    return { version: "", at: 0 };
  }
}

function flush() {
  const api = window.goatcounter;
  if (!api || typeof api.count !== "function") return;
  const pending = queue;
  queue = [];
  for (const item of pending) {
    try {
      api.count(item);
    } catch {
      // Eén mislukte meting mag de app nooit blokkeren.
    }
  }
}

export function initAnalytics() {
  const info = analyticsInfo();
  if (!info.enabled) return false;
  if (loadedSite === info.site) {
    flush();
    return true;
  }

  loadedSite = info.site;

  // GoatCounter configureren vóór het script laadt: wij bepalen zelf wanneer
  // een paginaweergave telt (belangrijk in een app met hash-navigatie).
  window.goatcounter = { no_onload: true, allow_local: false };

  const old = document.querySelector("script[data-goatcounter]");
  if (old) old.remove();

  const script = document.createElement("script");
  script.async = true;
  script.src = SCRIPT_SRC;
  script.dataset.goatcounter = `https://${info.site}.goatcounter.com/count`;
  script.addEventListener("load", () => {
    flush();
    window.setTimeout(flush, 600);
  });
  script.addEventListener("error", () => {
    // Offline of geblokkeerd: stil doorgaan, niets kapot maken.
    loadedSite = "";
  });
  document.head.appendChild(script);
  return true;
}

function send(payload) {
  if (isAnalyticsOptOut()) return;
  if (!getAnalyticsSite()) {
    // De openbare sitecode wordt nog geladen: bewaar het event en stuur het
    // zodra de configuratie binnen is. Zonder sitecode versturen we niets.
    if (!configLoaded && queue.length < MAX_QUEUE) queue.push(payload);
    return;
  }
  const api = window.goatcounter;
  if (!api || typeof api.count !== "function") {
    if (queue.length < MAX_QUEUE) queue.push(payload);
    return;
  }
  try {
    api.count(payload);
  } catch {
    // Negeer meetfouten.
  }
}

export function trackView(path, title) {
  const clean = String(path || "home").replace(/^\/+/, "");
  send({
    path: `/${clean}`,
    title: String(title || document.title || "EasyCodey").slice(0, 120),
    event: false
  });
}

export function trackEvent(name) {
  const clean = String(name || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
  if (!clean) return;
  send({ path: `event/${clean}`, event: true });
}

const onceSeen = new Set();

export function trackOnce(name) {
  if (!name || onceSeen.has(name)) return;
  onceSeen.add(name);
  trackEvent(name);
}
