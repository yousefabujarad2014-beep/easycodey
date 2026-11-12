const STORAGE_KEY = "easycodey.v1";
const LEGACY_STORAGE_KEY = "easycode.v1";
const PROFILES_KEY = "easycodey.profiles.v1";
const ACTIVE_PROFILE_KEY = "easycodey.activeProfile.v1";

/* Het eigenaarsaccount. Alleen deze naam met dit wachtwoord krijgt beheer.
   Er staat bewust geen leesbaar wachtwoord in de code: alleen de hash. */
const OWNER_NAME = "Yousef Abujarad";
const OWNER_PASSWORD_HASH = "4rqs35"; // hashSecret("[verwijderd]")

const DEFAULT_STATE = {
  version: 1,
  theme: null,
  progress: {},
  settings: {
    apiKey: "",
    model: "",
    baseUrl: "",
    accessCode: ""
  },
  customIdeas: [],
  editor: {
    code: "",
    projectId: "",
    updatedAt: 0
  }
};

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

const CATEGORY_NAMES = [
  "Games",
  "Web",
  "GUI",
  "Data & AI",
  "Handige tools",
  "Automatisering",
  "Security",
  "Wetenschap",
  "Kunst & Creatief",
  "Onderwijs"
];
const LEVEL_NAMES = ["Beginner", "Gemiddeld", "Gevorderd"];

function cleanString(value, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function cleanStringList(value) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter((item) => typeof item === "string" && item.trim()).map((item) => item.trim()))];
}

function cleanSteps(value) {
  if (!Array.isArray(value)) return [];
  return value
    .filter((step) => step && typeof step === "object" && cleanString(step.title))
    .map((step) => ({
      title: cleanString(step.title),
      text: cleanString(step.text),
      code: cleanString(step.code)
    }));
}

// Eigen en geïmporteerde projecten komen uit localStorage of een JSON-bestand.
// Maak ze eerst schoon, zodat een kapot bestand de detailpagina niet kan breken.
function sanitizeCustomIdea(raw) {
  if (!raw || typeof raw !== "object") return null;
  const title = cleanString(raw.title);
  const steps = cleanSteps(raw.steps);
  if (!title || !steps.length) return null;

  const learn = cleanStringList(raw.learn);
  const tips = cleanStringList(raw.tips);
  const id = cleanString(raw.id);

  return {
    id,
    title: title.slice(0, 120),
    emoji: cleanString(raw.emoji).slice(0, 8) || "🧪",
    category: CATEGORY_NAMES.includes(raw.category) ? raw.category : "Handige tools",
    level: LEVEL_NAMES.includes(raw.level) ? raw.level : "Beginner",
    time: cleanString(raw.time, "45 min"),
    summary: cleanString(raw.summary, `Een eigen project rond ${title}.`),
    description: cleanString(raw.description, cleanString(raw.summary, `Een eigen project rond ${title}.`)),
    learn: learn.length ? learn : ["functies", "lijsten", "while"],
    steps,
    tips: tips.length ? tips : ["Test je code na elke stap."],
    next: cleanStringList(raw.next),
    custom: true,
    createdAt: Number(raw.createdAt) || Date.now()
  };
}

function normalizeCustomIdeas(value) {
  const seen = new Set();
  const result = [];

  for (const raw of Array.isArray(value) ? value : []) {
    const idea = sanitizeCustomIdea(raw);
    if (!idea) continue;

    let id = idea.id || `eigen-${result.length + 1}-${Date.now()}`;
    while (seen.has(id)) id = `${id}-kopie`;
    seen.add(id);
    idea.id = id;
    result.push(idea);
  }

  return result;
}

let migratedFromLegacy = false;

function stateKey(profileId = activeProfileId) {
  return profileId ? `${STORAGE_KEY}.profile.${profileId}` : STORAGE_KEY;
}

function normalizeState(parsed) {
  const source = parsed && typeof parsed === "object" ? parsed : {};
  return {
    ...clone(DEFAULT_STATE),
    ...source,
    settings: { ...DEFAULT_STATE.settings, ...(source.settings || {}) },
    progress: source.progress && typeof source.progress === "object" ? source.progress : {},
    customIdeas: normalizeCustomIdeas(source.customIdeas),
    editor: {
      code: typeof source.editor?.code === "string" ? source.editor.code : "",
      projectId: typeof source.editor?.projectId === "string" ? source.editor.projectId : "",
      updatedAt: Number(source.editor?.updatedAt) || 0
    }
  };
}

function readStateFromKey(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? normalizeState(JSON.parse(raw)) : clone(DEFAULT_STATE);
  } catch {
    return clone(DEFAULT_STATE);
  }
}

function writeStateToKey(profileId, value) {
  try {
    localStorage.setItem(stateKey(profileId), JSON.stringify(value));
  } catch {
    // Opslag kan geblokkeerd zijn (privémodus). De site blijft dan werken.
  }
}

function readState() {
  try {
    let raw = localStorage.getItem(stateKey());
    if (!raw && !activeProfileId) {
      raw = localStorage.getItem(LEGACY_STORAGE_KEY);
      migratedFromLegacy = Boolean(raw);
    }
    if (!raw) return clone(DEFAULT_STATE);
    return normalizeState(JSON.parse(raw));
  } catch {
    return clone(DEFAULT_STATE);
  }
}

function readProfiles() {
  try {
    const raw = localStorage.getItem(PROFILES_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((profile) => profile && typeof profile.id === "string" && typeof profile.name === "string")
      .map((profile) => ({
        id: profile.id,
        name: String(profile.name).slice(0, 40),
        password:
          typeof profile.password === "string"
            ? profile.password
            : typeof profile.pin === "string"
              ? profile.pin
              : "",
        createdAt: Number(profile.createdAt) || Date.now(),
        lastLoginAt: Number(profile.lastLoginAt) || 0,
        contact: typeof profile.contact === "string" ? profile.contact.slice(0, 120) : ""
      }));
  } catch {
    return [];
  }
}

function saveProfiles() {
  try {
    localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
  } catch {
    // Zonder opslag werkt het gastprofiel gewoon verder.
  }
}

function readActiveProfileId() {
  try {
    const id = localStorage.getItem(ACTIVE_PROFILE_KEY) || "";
    return profiles.some((profile) => profile.id === id) ? id : "";
  } catch {
    return "";
  }
}

function hashSecret(secret) {
  const text = `easycodey:${secret}`;
  let hash = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
}

function safeProfile(profile) {
  if (!profile) return null;
  return {
    id: profile.id,
    name: profile.name,
    createdAt: profile.createdAt,
    lastLoginAt: profile.lastLoginAt,
    isOwner: isOwnerAccount(profile)
  };
}

function ownerProfile(profile) {
  if (!profile) return null;
  return {
    id: profile.id,
    name: profile.name,
    createdAt: profile.createdAt,
    lastLoginAt: profile.lastLoginAt,
    contact: profile.contact || "",
    isOwner: isOwnerAccount(profile)
  };
}

/* ------------------------------ eigenaarsaccount ------------------------------
   Inloggen met de eigenaarsnaam en het eigenaars-wachtwoord maakt dit profiel
   eigenaar. Dat werkt op elk toestel: het account wordt bij de eerste login
   lokaal aangemaakt. Zonder die login blijft het beheerscherm vergrendeld. */

function isOwnerAccount(profile) {
  if (!profile || typeof profile.name !== "string") return false;
  return (
    profile.name.trim().toLowerCase() === OWNER_NAME.toLowerCase() &&
    profile.password === OWNER_PASSWORD_HASH
  );
}

export function isOwnerPassword(password) {
  return hashSecret(String(password || "").trim()) === OWNER_PASSWORD_HASH;
}

export function isOwnerCredentials(name, password) {
  const cleanName = String(name || "").trim().toLowerCase();
  if (cleanName !== OWNER_NAME.toLowerCase()) return false;
  return isOwnerPassword(password);
}

export function isActiveProfileOwner() {
  return isOwnerAccount(profiles.find((profile) => profile.id === activeProfileId));
}

let profiles = readProfiles();
let activeProfileId = readActiveProfileId();
let state = readState();

// Oude opslag (van vóór de naamswijziging) direct kopiëren naar de nieuwe sleutel.
if (migratedFromLegacy) persist();

function persist() {
  writeStateToKey(activeProfileId, state);
}

/* ------------------------------ optionele profielen ------------------------------
   Profielen leven bewust op dit apparaat. Zo blijven voortgang en eigen projecten
   gescheiden per gebruiker, zonder dat er een account op een server nodig is.
   Met de back-up kun je alles naar een ander apparaat verplaatsen. */

export function getProfiles() {
  return profiles
    .map(safeProfile)
    .sort((a, b) => (b.lastLoginAt || b.createdAt) - (a.lastLoginAt || a.createdAt));
}

export function getActiveProfile() {
  return safeProfile(profiles.find((profile) => profile.id === activeProfileId));
}

export function registerProfile(name, password, options = {}) {
  const cleanName = String(name || "").trim().replace(/\s+/g, " ").slice(0, 40);
  const cleanPassword = String(password || "").trim();

  if (cleanName.length < 2) {
    return { ok: false, error: "Kies een naam van minstens 2 tekens." };
  }
  if (cleanPassword.length < 4) {
    return { ok: false, error: "Kies een wachtwoord van minstens 4 tekens." };
  }
  if (cleanPassword.length > 64) {
    return { ok: false, error: "Kies een wachtwoord van maximaal 64 tekens." };
  }
  if (profiles.some((profile) => profile.name.toLowerCase() === cleanName.toLowerCase())) {
    return { ok: false, error: "Er bestaat al een account met deze naam." };
  }
  if (cleanName.toLowerCase() === OWNER_NAME.toLowerCase() && !isOwnerCredentials(cleanName, cleanPassword)) {
    return { ok: false, error: "Deze naam is voorbehouden voor de eigenaar van EasyCodey." };
  }

  const guestData = options.copyGuest === false ? clone(DEFAULT_STATE) : readStateFromKey(STORAGE_KEY);
  const contact = String(options.contact || "").trim().slice(0, 120);
  const profile = {
    id: `p-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    name: cleanName,
    password: hashSecret(cleanPassword),
    contact,
    createdAt: Date.now(),
    lastLoginAt: Date.now()
  };

  profiles = [profile, ...profiles];
  saveProfiles();
  writeStateToKey(profile.id, guestData);
  activeProfileId = profile.id;
  try {
    localStorage.setItem(ACTIVE_PROFILE_KEY, profile.id);
  } catch {
    // Geen opslag: het profiel werkt dan alleen in deze sessie.
  }
  state = readState();
  persist();

  return { ok: true, profile: safeProfile(profile), copiedGuestData: options.copyGuest !== false };
}

export function loginProfile(id, password) {
  const profile = profiles.find((item) => item.id === id);
  if (!profile) {
    return { ok: false, error: "Account niet gevonden." };
  }
  if (profile.password !== hashSecret(String(password || "").trim())) {
    return { ok: false, error: "Dat wachtwoord klopt niet. Probeer opnieuw." };
  }

  activeProfileId = profile.id;
  profile.lastLoginAt = Date.now();
  saveProfiles();
  try {
    localStorage.setItem(ACTIVE_PROFILE_KEY, profile.id);
  } catch {
    // Zonder opslag blijft het profiel actief tot je de pagina sluit.
  }
  state = readState();

  return { ok: true, profile: safeProfile(profile) };
}

export function loginProfileByName(name, password) {
  const cleanName = String(name || "").trim().toLowerCase();
  if (!cleanName) {
    return { ok: false, error: "Vul je naam in." };
  }

  // Het eigenaarsaccount werkt op elk toestel, ook als het hier nog niet bestaat.
  if (isOwnerCredentials(name, password)) {
    let profile = profiles.find((item) => item.name.toLowerCase() === cleanName);
    if (!profile) {
      profile = {
        id: `p-owner-${Date.now().toString(36)}`,
        name: OWNER_NAME,
        password: OWNER_PASSWORD_HASH,
        contact: "",
        createdAt: Date.now(),
        lastLoginAt: 0
      };
      profiles = [profile, ...profiles];
    } else {
      // De eigenaar bewijst met het juiste wachtwoord toegang; herstel het account.
      profile.name = OWNER_NAME;
      profile.password = OWNER_PASSWORD_HASH;
    }
    profile.lastLoginAt = Date.now();
    saveProfiles();
    activeProfileId = profile.id;
    try {
      localStorage.setItem(ACTIVE_PROFILE_KEY, profile.id);
    } catch {
      // Zonder opslag blijft het profiel actief tot je de pagina sluit.
    }
    state = readState();
    return { ok: true, profile: safeProfile(profile), owner: true };
  }

  const profile = profiles.find((item) => item.name.toLowerCase() === cleanName);
  if (!profile) {
    return { ok: false, error: "Geen account met deze naam. Maak er eerst een aan." };
  }
  return loginProfile(profile.id, password);
}

export function logoutProfile() {
  activeProfileId = "";
  try {
    localStorage.removeItem(ACTIVE_PROFILE_KEY);
  } catch {
    // Negeer: er is dan niets om op te ruimen.
  }
  state = readState();
  return { ok: true };
}

export function deleteProfile(id, password) {
  const profile = profiles.find((item) => item.id === id);
  if (!profile) {
    return { ok: false, error: "Account niet gevonden." };
  }
  if (profile.password !== hashSecret(String(password || "").trim())) {
    return { ok: false, error: "Dat wachtwoord klopt niet." };
  }

  profiles = profiles.filter((item) => item.id !== id);
  saveProfiles();
  try {
    localStorage.removeItem(stateKey(id));
  } catch {
    // Negeer: het profiel is al uit de lijst verwijderd.
  }

  if (activeProfileId === id) {
    activeProfileId = "";
    try {
      localStorage.removeItem(ACTIVE_PROFILE_KEY);
    } catch {
      // Negeer.
    }
  }
  state = readState();
  return { ok: true };
}

export function exportBackup() {
  const profile = getActiveProfile();
  return {
    app: "EasyCodey",
    version: 1,
    exportedAt: new Date().toISOString(),
    profile: profile?.name || "Gast",
    data: clone(state)
  };
}

export function importBackup(value) {
  const source = value && typeof value === "object" && value.data && typeof value.data === "object" ? value.data : value;
  if (!source || typeof source !== "object") {
    return { ok: false, error: "Dit bestand lijkt geen EasyCodey-back-up." };
  }

  const normalized = normalizeState(source);
  state = {
    ...state,
    progress: normalized.progress,
    customIdeas: normalized.customIdeas,
    editor: normalized.editor
  };
  persist();

  return {
    ok: true,
    progress: Object.keys(state.progress).length,
    ideas: state.customIdeas.length
  };
}

export function getTheme() {
  return state.theme;
}

export function setTheme(theme) {
  state.theme = theme === "dark" ? "dark" : "light";
  persist();
}

export function getSettings() {
  return { ...state.settings };
}

export function saveSettings(settings) {
  state.settings = {
    apiKey: String(settings.apiKey || "").trim(),
    model: String(settings.model || "").trim(),
    baseUrl: String(settings.baseUrl || "").trim(),
    accessCode: String(settings.accessCode || "").trim()
  };
  persist();
}

export function getProgress(ideaId) {
  const entry = state.progress[ideaId];
  return {
    steps: Array.isArray(entry?.steps) ? [...new Set(entry.steps.filter(Number.isInteger))].sort((a, b) => a - b) : [],
    updatedAt: Number(entry?.updatedAt) || 0
  };
}

export function toggleStep(ideaId, index) {
  const current = getProgress(ideaId);
  const steps = current.steps.includes(index)
    ? current.steps.filter((step) => step !== index)
    : [...current.steps, index].sort((a, b) => a - b);

  state.progress[ideaId] = { steps, updatedAt: Date.now() };
  persist();
  return state.progress[ideaId];
}

export function clearProgress(ideaId) {
  delete state.progress[ideaId];
  persist();
}

export function markAllSteps(ideaId, totalSteps) {
  state.progress[ideaId] = {
    steps: Array.from({ length: totalSteps }, (_, index) => index),
    updatedAt: Date.now()
  };
  persist();
}

export function getStats(ideas) {
  let completed = 0;
  let stepsDone = 0;
  let stepsTotal = 0;

  for (const idea of ideas) {
    const total = idea.steps?.length || 0;
    const done = getProgress(idea.id).steps.filter((index) => index < total).length;
    stepsDone += done;
    stepsTotal += total;
    if (total > 0 && done === total) completed += 1;
  }

  return {
    total: ideas.length,
    completed,
    stepsDone,
    stepsTotal,
    percent: stepsTotal ? Math.round((stepsDone / stepsTotal) * 100) : 0
  };
}

export function getEditorDraft() {
  return {
    code: typeof state.editor?.code === "string" ? state.editor.code : "",
    projectId: typeof state.editor?.projectId === "string" ? state.editor.projectId : "",
    updatedAt: Number(state.editor?.updatedAt) || 0
  };
}

export function saveEditorDraft(code, projectId) {
  state.editor = {
    code: String(code ?? ""),
    projectId: projectId === undefined ? getEditorDraft().projectId : String(projectId || ""),
    updatedAt: Date.now()
  };
  persist();
  return getEditorDraft();
}

export function clearEditorDraft() {
  state.editor = { code: "", projectId: "", updatedAt: 0 };
  persist();
}

export function getCustomIdeas() {
  return state.customIdeas.map((idea) => ({ ...idea }));
}

export function addCustomIdea(idea) {
  state.customIdeas = [idea, ...state.customIdeas.filter((item) => item.id !== idea.id)];
  persist();
}

export function removeCustomIdea(ideaId) {
  state.customIdeas = state.customIdeas.filter((idea) => idea.id !== ideaId);
  delete state.progress[ideaId];
  persist();
}

export function importCustomIdeas(ideas) {
  const incoming = normalizeCustomIdeas(ideas).filter((idea) => idea.steps.length >= 3);
  const existing = new Set(state.customIdeas.map((idea) => idea.id));
  let added = 0;

  for (const idea of incoming) {
    let id = idea.id;
    while (existing.has(id)) id = `${id}-kopie`;
    existing.add(id);

    state.customIdeas.unshift({ ...idea, id });
    added += 1;
  }

  if (added) persist();
  return added;
}

export function exportCustomIdeas() {
  return {
    app: "EasyCodey",
    version: 1,
    exportedAt: new Date().toISOString(),
    ideas: getCustomIdeas()
  };
}

/* ------------------------------ eigenaar / beheer ------------------------------
   Deze functies werken alleen op dit apparaat. Er is geen server: de eigenaar
   ziet dus uitsluitend de lokale profielen van deze browser. */

export function getProfileCount() {
  return profiles.length;
}

export function getOwnerProfiles() {
  return profiles
    .map((profile) => {
      const data = readStateFromKey(stateKey(profile.id));
      const progress = data.progress && typeof data.progress === "object" ? data.progress : {};
      let stepsDone = 0;
      let completed = 0;
      for (const entry of Object.values(progress)) {
        const steps = Array.isArray(entry?.steps) ? entry.steps.length : 0;
        stepsDone += steps;
        if (steps > 0) completed += 1;
      }
      return {
        ...ownerProfile(profile),
        projectsStarted: Object.keys(progress).length,
        projectsCompleted: completed,
        stepsDone,
        customIdeas: Array.isArray(data.customIdeas) ? data.customIdeas.length : 0,
        editorUpdatedAt: Number(data.editor?.updatedAt) || 0
      };
    })
    .sort((a, b) => (b.lastLoginAt || b.createdAt) - (a.lastLoginAt || a.createdAt));
}

export function resetProfileProgress(id) {
  const profile = profiles.find((item) => item.id === id);
  if (!profile) return { ok: false, error: "Profiel niet gevonden." };
  const data = readStateFromKey(stateKey(id));
  data.progress = {};
  data.editor = { code: "", projectId: "", updatedAt: 0 };
  writeStateToKey(id, data);
  if (id === activeProfileId) state = readState();
  return { ok: true };
}

export function deleteProfileAsOwner(id) {
  const profile = profiles.find((item) => item.id === id);
  if (!profile) return { ok: false, error: "Profiel niet gevonden." };
  if (isOwnerAccount(profile)) {
    return { ok: false, error: "Het eigenaarsaccount kan niet verwijderd worden." };
  }

  profiles = profiles.filter((item) => item.id !== id);
  saveProfiles();
  try {
    localStorage.removeItem(stateKey(id));
  } catch {
    // Negeer: het profiel is al uit de lijst verwijderd.
  }
  if (activeProfileId === id) {
    activeProfileId = "";
    try {
      localStorage.removeItem(ACTIVE_PROFILE_KEY);
    } catch {
      // Negeer.
    }
  }
  state = readState();
  return { ok: true };
}

export function exportAllLocalData() {
  return {
    app: "EasyCodey",
    version: 1,
    exportedAt: new Date().toISOString(),
    scope: "local-device",
    profiles: profiles.map((profile) => ({
      ...ownerProfile(profile),
      data: readStateFromKey(stateKey(profile.id))
    }))
  };
}

const NOTICE_KEY = "easycodey.owner.notice.v1";

export function getOwnerNotice() {
  try {
    const raw = localStorage.getItem(NOTICE_KEY);
    if (!raw) return { text: "", updatedAt: 0 };
    const parsed = JSON.parse(raw);
    return {
      text: typeof parsed.text === "string" ? parsed.text.slice(0, 280) : "",
      updatedAt: Number(parsed.updatedAt) || 0
    };
  } catch {
    return { text: "", updatedAt: 0 };
  }
}

export function setOwnerNotice(text) {
  const value = { text: String(text || "").slice(0, 280), updatedAt: Date.now() };
  try {
    if (value.text.trim()) localStorage.setItem(NOTICE_KEY, JSON.stringify(value));
    else localStorage.removeItem(NOTICE_KEY);
  } catch {
    // Negeer: zonder opslag werkt de rest gewoon.
  }
  return value;
}
