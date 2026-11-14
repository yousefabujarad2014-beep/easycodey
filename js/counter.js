/* EasyCodey — eenvoudige, anonieme teller.
   Telt bezoeken, unieke bezoekers, installaties en APK-downloads zonder
   account en zonder cookie. Er gaat alleen een getal heen en weer; geen
   namen, geen e-mail, geen profielen en geen apparaat-id. De eigenaar kan
   dit uitzetten met dezelfde opt-out als de statistieken. */

const API = "https://abacus.jasoncameron.dev";
const CONFIG_FILE = "site-config.json";
const OPTOUT_KEY = "easycodey.analytics.optout.v1";
const SESSION_KEY = "easycodey.counter.session.v1";
const INSTALLED_KEY = "easycodey.installed.v1";
const UNIQUE_KEY = "easycodey.uniqueVisitor.v1";
const DEVICE_KEY = "easycodey.device.v1";

let namespace = "";
let counterApi = "";
let configLoaded = false;
let loadPromise = null;

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
      const response = await fetch(`${CONFIG_FILE}?v=${Date.now()}`, { cache: "no-store" });
      const config = await response.json();
      namespace = String(config?.publicCounter || "")
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9._-]/g, "");
      const api = String(config?.counterApi || "").trim().replace(/\/+$/, "");
      counterApi = /^https:\/\/[^\s]+$/i.test(api) ? api : "";
    } catch {
      namespace = "";
      counterApi = "";
    }
    configLoaded = true;
    return namespace;
  })();
  return loadPromise;
}

async function request(path) {
  const response = await fetch(`${API}${path}`, {
    cache: "no-store",
    headers: { Accept: "application/json" }
  });
  if (!response.ok) throw new Error("teller niet bereikbaar");
  return response.json();
}

/* Lezen uit de eigen Cloudflare-teller. Lukt dat niet, dan proberen we de
   eenvoudige Abacus-teller. */
async function readFromWorker(key) {
  if (!counterApi) return null;
  try {
    const response = await fetch(
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
    const response = await fetch(`${counterApi}/hit`, {
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
    const response = await fetch(
      `${API}/get/${encodeURIComponent(namespace)}/${encodeURIComponent(key)}`,
      { cache: "no-store", headers: { Accept: "application/json" } }
    );
    if (response.status === 404) return 0;
    if (!response.ok) return null;
    const data = await response.json();
    const value = Number(data?.value);
    return Number.isFinite(value) ? value : null;
  } catch {
    return null;
  }
}

/* Ophogen gebeurt nooit als de bezoeker zich heeft afgemeld. */
export async function hitCount(key) {
  if (!configLoaded) await loadCounterConfig();
  if (isCounterOptedOut()) return null;

  const fromWorker = await hitWorker(key);
  if (fromWorker !== null) return fromWorker;
  if (!namespace) return null;

  try {
    const data = await request(`/hit/${encodeURIComponent(namespace)}/${encodeURIComponent(key)}`);
    const value = Number(data?.value);
    return Number.isFinite(value) ? value : null;
  } catch {
    return null;
  }
}

export async function getTotals() {
  const [visits, unique, installs, downloads] = await Promise.all([
    getCount("bezoeken-v1"),
    getCount("unieke-bezoekers-v1"),
    getCount("installaties-v1"),
    getCount("apk-downloads-v1")
  ]);
  return {
    visits,
    unique,
    installs,
    downloads,
    available:
      visits !== null || unique !== null || installs !== null || downloads !== null
  };
}

/* Eén unieke bezoeker per toestel/browser. De vlag gaat pas aan als de teller
   antwoordt, zodat een offline bezoek het later alsnog kan tellen. Dit is een
   benadering: iemand met twee toestellen of gewiste opslag telt opnieuw. */
export async function countUniqueVisitor() {
  if (isCounterOptedOut()) return null;
  if (read(UNIQUE_KEY) === "1") return null;
  const value = await hitCount("unieke-bezoekers-v1");
  if (value !== null) write(UNIQUE_KEY, "1");
  return value;
}

/* Eén bezoek per browsersessie, zodat herladen niet dubbel telt. */
export async function countVisit() {
  if (isCounterOptedOut()) return null;
  try {
    if (sessionStorage.getItem(SESSION_KEY) === "1") return null;
    sessionStorage.setItem(SESSION_KEY, "1");
  } catch {
    // Zonder sessieopslag telt elk bezoek; dat is niet erg.
  }
  return hitCount("bezoeken-v1");
}

/* Eén installatie per toestel. De vlag gaat pas aan als de teller antwoordt,
   zodat een offline eerste start het later alsnog kan tellen. */
export async function countInstall() {
  if (isCounterOptedOut()) return null;
  if (read(INSTALLED_KEY) === "1") return null;
  const value = await hitCount("installaties-v1");
  if (value !== null) write(INSTALLED_KEY, "1");
  return value;
}

export async function countDownload() {
  return hitCount("apk-downloads-v1");
}
