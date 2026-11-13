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

let namespace = "";
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

export function isCounterOptedOut() {
  return read(OPTOUT_KEY) === "1";
}

export function counterInfo() {
  return {
    namespace,
    enabled: Boolean(namespace) && !isCounterOptedOut(),
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
    } catch {
      namespace = "";
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

/* Lezen mag altijd: de eigenaar bekijkt alleen een getal. Een teller die nog
   niet bestaat, telt als 0. */
export async function getCount(key) {
  if (!configLoaded) await loadCounterConfig();
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
  if (!namespace || isCounterOptedOut()) return null;
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
