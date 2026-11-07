const STORAGE_KEY = "easycodey.v1";
const LEGACY_STORAGE_KEY = "easycode.v1";

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
  customIdeas: []
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

function readState() {
  try {
    let raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      raw = localStorage.getItem(LEGACY_STORAGE_KEY);
      migratedFromLegacy = Boolean(raw);
    }
    if (!raw) return clone(DEFAULT_STATE);
    const parsed = JSON.parse(raw);
    return {
      ...clone(DEFAULT_STATE),
      ...parsed,
      settings: { ...DEFAULT_STATE.settings, ...(parsed.settings || {}) },
      progress: parsed.progress && typeof parsed.progress === "object" ? parsed.progress : {},
      customIdeas: normalizeCustomIdeas(parsed.customIdeas)
    };
  } catch {
    return clone(DEFAULT_STATE);
  }
}

let state = readState();

// Oude opslag (van vóór de naamswijziging) direct kopiëren naar de nieuwe sleutel.
if (migratedFromLegacy) persist();

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Opslag kan geblokkeerd zijn (privémodus). De site blijft dan werken.
  }
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
