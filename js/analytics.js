/* EasyCodey — privacy-instellingen.
   Er is geen externe meetdienst meer: alle cijfers komen van de ingebouwde,
   anonieme teller (js/counter.js). Dit bestand bewaart alleen de keuze van de
   bezoeker om mee te tellen of niet, plus de datum van de laatste update.
   Er wordt hier dus nooit iets naar buiten verstuurd. */

const OPTOUT_KEY = "easycodey.analytics.optout.v1";
const OWNER_DEVICE_KEY = "easycodey.owner.device.v1";
const UPDATE_KEY = "easycodey.lastUpdate.v1";
const OLD_SITE_KEY = "easycodey.analytics.site.v1";

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
    // Zonder opslag telt de app niet mee; alles blijft werken.
  }
}

function remove(key) {
  try {
    localStorage.removeItem(key);
  } catch {
    // Negeer.
  }
}

// Oude, externe meetcodes zijn niet meer nodig. We ruimen ze op, zodat er
// nooit per ongeluk nog iets naar een meetdienst gaat.
remove(OLD_SITE_KEY);

export function isAnalyticsOptOut() {
  return read(OPTOUT_KEY) === "1";
}

/* Op het toestel van de eigenaar tellen we niet mee. Zo blijven de cijfers
   van echte bezoekers zuiver. */
export function isOwnerDevice() {
  return read(OWNER_DEVICE_KEY) === "1";
}

export function setAnalyticsOptOut(value) {
  if (value) write(OPTOUT_KEY, "1");
  else remove(OPTOUT_KEY);
  return isAnalyticsOptOut();
}

export function analyticsInfo() {
  const optOut = isAnalyticsOptOut();
  return {
    optOut,
    ownerDevice: isOwnerDevice(),
    // Er is geen externe meetdienst meer; deze velden blijven bestaan zodat
    // oudere schermen niet stukgaan.
    site: "",
    source: "",
    dashboard: "",
    scriptLoaded: false,
    enabled: false
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

/* Deze functies blijven bestaan voor de rest van de app, maar doen niets:
   er gaat geen enkel gegeven naar een externe dienst. */
export function initAnalytics() {
  return false;
}

export function loadAnalyticsConfig() {
  return Promise.resolve("");
}

export function stopAnalytics() {
  // Niets te stoppen: er is geen meetscript.
}

export function trackView() {}

export function trackEvent() {}

export function trackOnce() {}
