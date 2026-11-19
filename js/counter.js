/* EasyCodey — eenvoudige, anonieme teller.
   Telt bezoeken, unieke bezoekers, installaties en APK-downloads zonder
   account en zonder cookie. Er gaat alleen een getal heen en weer; geen
   namen, geen e-mail, geen profielen en geen apparaat-id. De eigenaar kan
   dit uitzetten met dezelfde opt-out als de statistieken. */

const API = "https://abacus.jasoncameron.dev";
const CONFIG_FILE = "site-config.json";
const OPTOUT_KEY = "easycodey.analytics.optout.v1";
/* v2 sinds de tellerreset: bestaande toestellen tellen opnieuw mee vanaf nul.
   De opt-out- en eigenaarstoestel-vlaggen blijven op v1, zodat die keuzes
   bewaard blijven. */
const SESSION_KEY = "easycodey.counter.session.v2";
const INSTALLED_KEY = "easycodey.installed.v2";
const UNIQUE_KEY = "easycodey.uniqueVisitor.v2";
const DEVICE_KEY = "easycodey.device.v1";
const OWNER_DEVICE_KEY = "easycodey.owner.device.v1";
const ACTIVE_DAY_KEY = "easycodey.activeAppDay.v2";
const ACTIVE_PREFIX = "actieve-apps-";

const LAST_TOTALS_KEY = "easycodey.counter.last.v2";
const REQUEST_TIMEOUT = 10000;
const RETRY_DELAYS = [400, 1200];

let namespace = "";
let counterApi = "";
let configLoaded = false;
let loadPromise = null;
let baseline = {};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/* Op mijn eigen testcomputer en tijdens het bouwen mag niets meetellen. Zo
   blijven de cijfers van echte bezoekers zuiver. */
export function isDevHost() {
  try {
    const host = String(location.hostname || "").toLowerCase();
    if (location.protocol === "file:") return true;
    return (
      host === "localhost" ||
      host === "127.0.0.1" ||
      host === "0.0.0.0" ||
      host === "::1" ||
      host === "[::1]"
    );
  } catch {
    return false;
  }
}

/* Eén plek die bepaalt of dit toestel mag meetellen. */
export function countsHere() {
  return !isDevHost() && !isOwnerDevice() && !isCounterOptedOut();
}

/* Een trage teller mag het paneel nooit laten hangen. Na 7 seconden stoppen
   we het verzoek; de app werkt gewoon verder zonder cijfer. */
async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

function read(key) {
  try {
    return localStorage.getItem(key) || "";
  } catch {
    return "";
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Zonder opslag telt de app niet dubbel; alles blijft werken.
  }
}

/* Een willekeurig nummer dat alleen op dit toestel bestaat. Het zegt niets
   over wie je bent en verandert nooit. De server bewaart er alleen een
   onleesbare hash van, om te voorkomen dat één toestel dubbel telt. */
function deviceToken() {
  const existing = read(DEVICE_KEY);
  if (existing) return existing;
  let token = "";
  try {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    token = [...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join("");
  } catch {
    token = `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`;
  }
  write(DEVICE_KEY, token);
  return token;
}

export function isCounterOptedOut() {
  return read(OPTOUT_KEY) === "1";
}

/* Op het toestel van de eigenaar tellen we niets mee. Zo blijven de cijfers
   van echte bezoekers zuiver. De vlag staat alleen op dat toestel. */
export function isOwnerDevice() {
  return read(OWNER_DEVICE_KEY) === "1";
}

export function markOwnerDevice() {
  write(OWNER_DEVICE_KEY, "1");
}

/* De sleutel van vandaag, bijvoorbeeld actieve-apps-2026-11-15. Eén keer per
   dag per toestel. Zo weten we hoeveel apps vandaag echt open waren. */
function activeAppsKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${ACTIVE_PREFIX}${year}-${month}-${day}`;
}

export function counterInfo() {
  return {
    namespace,
    api: counterApi,
    enabled: Boolean(namespace || counterApi) && !isCounterOptedOut(),
    optedOut: isCounterOptedOut()
  };
}

/* De teller staat standaard aan via site-config.json. Zo ziet de eigenaar
   meteen cijfers, zonder eerst een account aan te maken. */
export async function loadCounterConfig() {
  if (loadPromise) return loadPromise;
  loadPromise = (async () => {
    try {
      const response = await fetchWithTimeout(`${CONFIG_FILE}?v=${Date.now()}`, { cache: "no-store" });
      const config = await response.json();
      namespace = String(config?.publicCounter || "")
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9._-]/g, "");
      const api = String(config?.counterApi || "").trim().replace(/\/+$/, "");
      counterApi = /^https:\/\/[^\s]+$/i.test(api) ? api : "";
      // Een paar bekende cijfers uit site-config.json. Die gebruiken we alleen
      // als de teller even niet antwoordt en dit toestel nog nooit een cijfer
      // zag. Zo staat er nooit een leeg streepje in het beheerscherm.
      const raw = config?.counterBaseline;
      baseline = {};
      if (raw && typeof raw === "object") {
        for (const field of ["visits", "unique", "installs", "downloads"]) {
          const value = Number(raw[field]);
          if (Number.isFinite(value) && value >= 0) baseline[field] = value;
        }
      }
    } catch {
      namespace = "";
      counterApi = "";
      baseline = {};
    }
    configLoaded = true;
    return namespace;
  })();
  return loadPromise;
}

/* Een trage of drukke teller krijgt een paar extra kansen. Zo zie je niet
   meteen een streepje als Abacus heel even niet antwoordt. */
async function request(path, tries = 3) {
  let lastError = null;
  for (let attempt = 0; attempt < tries; attempt += 1) {
    try {
      // Abacus antwoordt soms met een oude, gecachte fout (bijv. een 500)
      // terwijl de sleutel gewoon bestaat. Een unieke parameter per poging
      // dwingt een verse lezing af; dat mag geen tellingen beïnvloeden.
      const separator = path.includes("?") ? "&" : "?";
      const response = await fetchWithTimeout(
        `${API}${path}${separator}t=${Date.now()}-${attempt}`,
        {
          cache: "no-store",
          headers: { Accept: "application/json" }
        }
      );
      if (response.status === 404) return { status: 404, ok: false, data: null };
      if (response.ok) {
        return { status: response.status, ok: true, data: await response.json() };
      }
      lastError = new Error(`teller gaf ${response.status}`);
    } catch (error) {
      lastError = error;
    }
    if (attempt < tries - 1) await sleep(RETRY_DELAYS[attempt] || 1200);
  }
  throw lastError || new Error("teller niet bereikbaar");
}

/* Lezen uit de eigen Cloudflare-teller. Lukt dat niet, dan proberen we de
   eenvoudige Abacus-teller. */
async function readFromWorker(key) {
  if (!counterApi) return null;
  try {
    const response = await fetchWithTimeout(
      `${counterApi}/counts?keys=${encodeURIComponent(key)}`,
      { cache: "no-store", headers: { Accept: "application/json" } }
    );
    if (!response.ok) return null;
    const data = await response.json();
    const value = Number(data?.counts?.[key]);
    return Number.isFinite(value) ? value : null;
  } catch {
    return null;
  }
}

async function hitWorker(key) {
  if (!counterApi) return null;
  try {
    const response = await fetchWithTimeout(`${counterApi}/hit`, {
      method: "POST",
      cache: "no-store",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ key, device: deviceToken() })
    });
    if (!response.ok) return null;
    const data = await response.json();
    const value = Number(data?.value);
    return Number.isFinite(value) ? value : null;
  } catch {
    return null;
  }
}

/* Lezen mag altijd: de eigenaar bekijkt alleen een getal. Een teller die nog
   niet bestaat, telt als 0. */
export async function getCount(key) {
  if (!configLoaded) await loadCounterConfig();
  if (!namespace && !counterApi) return null;

  const fromWorker = await readFromWorker(key);
  if (fromWorker !== null) return fromWorker;
  if (!namespace) return null;

  try {
    const result = await request(
      `/get/${encodeURIComponent(namespace)}/${encodeURIComponent(key)}`,
      2
    );
    if (result.status === 404) return 0;
    const value = Number(result.data?.value);
    return Number.isFinite(value) ? value : null;
  } catch {
    return null;
  }
}

/* Ophogen gebeurt nooit als de bezoeker zich heeft afgemeld, op een
   ontwikkelcomputer of op het toestel van de eigenaar. */
export async function hitCount(key) {
  if (!configLoaded) await loadCounterConfig();
  if (!countsHere()) return null;

  const fromWorker = await hitWorker(key);
  if (fromWorker !== null) return fromWorker;
  if (!namespace) return null;

  try {
    const result = await request(
      `/hit/${encodeURIComponent(namespace)}/${encodeURIComponent(key)}`,
      2
    );
    const value = Number(result.data?.value);
    return Number.isFinite(value) ? value : null;
  } catch {
    return null;
  }
}

/* De laatst bekende cijfers bewaren we lokaal. Als de teller heel even niet
   antwoordt, zie je toch een echt getal in plaats van een streepje. */
function readLastTotals() {
  try {
    const parsed = JSON.parse(read(LAST_TOTALS_KEY) || "{}");
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeLastTotals(values) {
  write(
    LAST_TOTALS_KEY,
    JSON.stringify({
      at: Date.now(),
      day: activeAppsKey(),
      visits: values.visits,
      unique: values.unique,
      installs: values.installs,
      downloads: values.downloads,
      active: Number.isFinite(values.active) ? values.active : 0
    })
  );
}

function knownTotals() {
  const last = readLastTotals();
  const merged = { ...baseline };
  for (const field of ["visits", "unique", "installs", "downloads", "active", "at", "day"]) {
    if (last[field] !== undefined && last[field] !== null) merged[field] = last[field];
  }
  return merged;
}

function cachedTotalsFrom(last) {
  const sameDay = last.day === activeAppsKey();
  const value = (cached) => (Number.isFinite(cached) ? cached : null);
  const totals = {
    visits: value(last.visits),
    unique: value(last.unique),
    installs: value(last.installs),
    downloads: value(last.downloads),
    // Voor "vandaag" tonen we 0 als we het nog niet weten, nooit een streepje.
    active: sameDay && Number.isFinite(last.active) ? last.active : 0,
    live: false,
    at: Number(last.at) || 0
  };
  totals.available =
    totals.visits !== null ||
    totals.unique !== null ||
    totals.installs !== null ||
    totals.downloads !== null ||
    totals.active !== null;
  return totals;
}

/* De cijfers die we de vorige keer zagen. Het paneel toont die meteen, zodat
   er nooit een leeg streepje staat terwijl de teller antwoordt. */
export function getCachedTotals() {
  return cachedTotalsFrom(knownTotals());
}

export async function getTotals() {
  const fresh = await Promise.all([
    getCount("bezoeken-v1"),
    getCount("unieke-bezoekers-v1"),
    getCount("installaties-v1"),
    getCount("apk-downloads-v1"),
    getCount(activeAppsKey())
  ]);
  const [visits, unique, installs, downloads, active] = fresh;
  const known = knownTotals();
  const sameDay = known.day === activeAppsKey();
  const fallback = (value, cached) => (value === null && Number.isFinite(cached) ? cached : value);
  // "Actieve apps" gaat over vandaag. Na middernacht mag het cijfer van
  // gisteren nooit als vandaag doorgaan: dan beginnen we weer bij 0.
  const activeToday =
    active !== null ? active : sameDay && Number.isFinite(known.active) ? known.active : 0;

  const totals = {
    visits: fallback(visits, known.visits),
    unique: fallback(unique, known.unique),
    installs: fallback(installs, known.installs),
    downloads: fallback(downloads, known.downloads),
    active: activeToday,
    live: fresh.every((value) => value !== null),
    // Soms antwoordt één van de vijf tellers even niet. Dat mag het hele
    // paneel niet meteen "geen antwoord" laten zeggen: de andere cijfers
    // zijn dan wél net opgehaald.
    answered: fresh.filter((value) => value !== null).length,
    total: fresh.length,
    at: Number(known.at) || 0
  };
  totals.partial = totals.answered > 0 && !totals.live;
  totals.available =
    totals.visits !== null ||
    totals.unique !== null ||
    totals.installs !== null ||
    totals.downloads !== null ||
    totals.active !== null;

  if (totals.available && fresh.some((value) => value !== null)) {
    writeLastTotals({
      visits: totals.visits,
      unique: totals.unique,
      installs: totals.installs,
      downloads: totals.downloads,
      active: activeToday
    });
  }

  return totals;
}

/* Eén unieke bezoeker per toestel/browser. De vlag gaat pas aan als de teller
   antwoordt, zodat een offline bezoek het later alsnog kan tellen. Dit is een
   benadering: iemand met twee toestellen of gewiste opslag telt opnieuw. */
export async function countUniqueVisitor() {
  if (!countsHere()) return null;
  if (read(UNIQUE_KEY) === "1") return null;
  const value = await hitCount("unieke-bezoekers-v1");
  if (value !== null) write(UNIQUE_KEY, "1");
  return value;
}

/* Eén bezoek per browsersessie, zodat herladen niet dubbel telt. De vlag gaat
   pas aan als de teller echt antwoordt; lukt het niet, dan mag het bij een
   volgende pagina-opening opnieuw. */
export async function countVisit() {
  if (!countsHere()) return null;
  try {
    if (sessionStorage.getItem(SESSION_KEY) === "1") return null;
  } catch {
    // Zonder sessieopslag telt elk bezoek; dat is niet erg.
  }
  const value = await hitCount("bezoeken-v1");
  if (value !== null) {
    try {
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
      // Zonder sessieopslag telt elk bezoek; dat is niet erg.
    }
  }
  return value;
}

/* Eén installatie per toestel. Dit werkt ook zonder account: zodra de app
   als app opent of de installatie bevestigd wordt, telt het toestel mee.
   De vlag gaat pas aan als de teller antwoordt, zodat een offline eerste
   start het later alsnog kan tellen. */
export async function countInstall() {
  if (!countsHere()) return null;
  if (read(INSTALLED_KEY) === "1") return null;
  const value = await hitCount("installaties-v1");
  if (value !== null) write(INSTALLED_KEY, "1");
  return value;
}

/* Een toestel dat de app vandaag gebruikte, telt één keer mee voor "actieve
   apps". Zo zie je hoeveel apps er echt in gebruik zijn, niet hoeveel er ooit
   zijn geïnstalleerd. */
export async function countActiveApp() {
  if (!countsHere()) return null;
  const key = activeAppsKey();
  if (read(ACTIVE_DAY_KEY) === key) return null;
  const value = await hitCount(key);
  if (value !== null) write(ACTIVE_DAY_KEY, key);
  return value;
}

export async function getActiveApps() {
  return getCount(activeAppsKey());
}

export async function countDownload() {
  return hitCount("apk-downloads-v1");
}
