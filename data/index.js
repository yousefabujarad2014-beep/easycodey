import { IDEAS_PART_1 } from "./ideas-01.js";
import { IDEAS_PART_2 } from "./ideas-02.js";
import { IDEAS_PART_3 } from "./ideas-03.js";
import { IDEAS_PART_4 } from "./ideas-04.js";
import { IDEAS_PART_5 } from "./ideas-05.js";
import { IDEAS_PART_6 } from "./ideas-06.js";
import { IDEAS_PART_7 } from "./ideas-07.js";

export const LEVELS = ["Beginner", "Gemiddeld", "Gevorderd"];

export const CATEGORIES = [
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

export const CATEGORY_META = {
  Games: { emoji: "🎮", color: "#ff6b4a" },
  Web: { emoji: "🌐", color: "#1f5eff" },
  GUI: { emoji: "🪟", color: "#7a3cff" },
  "Data & AI": { emoji: "🤖", color: "#0f9d58" },
  "Handige tools": { emoji: "🧰", color: "#b7791f" },
  Automatisering: { emoji: "⚙️", color: "#0ea5a4" },
  Security: { emoji: "🔐", color: "#e11d48" },
  Wetenschap: { emoji: "🔬", color: "#0891b2" },
  "Kunst & Creatief": { emoji: "🎨", color: "#d946ef" },
  Onderwijs: { emoji: "🎓", color: "#f59e0b" }
};

export const CATEGORY_COVERS = {
  Games: "assets/covers/games.svg",
  Web: "assets/covers/web.svg",
  GUI: "assets/covers/gui.svg",
  "Data & AI": "assets/covers/data-ai.svg",
  "Handige tools": "assets/covers/tools.svg",
  Automatisering: "assets/covers/automatisering.svg",
  Security: "assets/covers/security.svg",
  Wetenschap: "assets/covers/wetenschap.svg",
  "Kunst & Creatief": "assets/covers/kunst.svg",
  Onderwijs: "assets/covers/onderwijs.svg"
};

export function coverFor(idea) {
  const own = typeof idea?.image === "string" ? idea.image.trim() : "";
  if (own) return own;
  return CATEGORY_COVERS[idea?.category] || CATEGORY_COVERS["Handige tools"];
}

export const DURATION_FILTERS = [
  { id: "alle", label: "Alle duur" },
  { id: "kort", label: "15–30 min" },
  { id: "middel", label: "30–60 min" },
  { id: "lang", label: "1–2 uur" },
  { id: "project", label: "2+ uur" }
];

const GENERIC_TIPS = {
  Games: [
    "Test eerst met een klein level of een korte ronde.",
    "Laat de speler na afloop opnieuw beginnen."
  ],
  Web: [
    "Test je routes met een browser en met curl of fetch.",
    "Valideer invoer altijd op de server, niet alleen in de browser."
  ],
  GUI: [
    "Houd je venster klein tijdens het testen.",
    "Gebruik after() of een achtergrondthread voor langzame taken."
  ],
  "Data & AI": [
    "Bekijk je data eerst met head() en describe().",
    "Splits data in een trainings- en testset voordat je gaat meten."
  ],
  "Handige tools": [
    "Maak eerst een back-up voordat je bestanden aanpast.",
    "Test je script op een tijdelijke map met nepbestanden."
  ],
  Automatisering: [
    "Log elke stap, zodat je weet waar iets misgaat.",
    "Gebruik een dry-run modus die niets echt verandert."
  ],
  Security: [
    "Gebruik dit alleen op systemen die je zelf bezit of waarvoor je toestemming hebt.",
    "Sla wachtwoorden nooit leesbaar op; gebruik hashing."
  ],
  Wetenschap: [
    "Noteer je aannames voordat je gaat rekenen.",
    "Controleer een uitkomst met een handmatig voorbeeld."
  ],
  "Kunst & Creatief": [
    "Bewaar tussenversies, dan kun je blijven experimenteren.",
    "Begin met een klein canvas en schaal later op."
  ],
  Onderwijs: [
    "Maak de uitleg kort en test met iemand anders.",
    "Voeg meteen een herkansing toe na een fout antwoord."
  ]
};

function cleanList(value) {
  return Array.isArray(value)
    ? [...new Set(value.filter((item) => typeof item === "string" && item.trim()))]
    : [];
}

function normalizeIdeaList(raw) {
  const seen = new Set();
  const list = [];

  for (const rawIdea of raw) {
    if (!rawIdea || typeof rawIdea !== "object") continue;
    const id = typeof rawIdea.id === "string" ? rawIdea.id.trim() : "";
    if (!id || seen.has(id)) continue;
    seen.add(id);

    const steps = Array.isArray(rawIdea.steps)
      ? rawIdea.steps
          .filter((s) => s && typeof s.title === "string" && typeof s.text === "string")
          .map((s) => ({
            title: s.title,
            text: s.text,
            code: typeof s.code === "string" ? s.code : ""
          }))
      : [];

    list.push({
      ...rawIdea,
      id,
      title: String(rawIdea.title || id),
      emoji: String(rawIdea.emoji || "🐍"),
      category: CATEGORIES.includes(rawIdea.category) ? rawIdea.category : "Handige tools",
      level: LEVELS.includes(rawIdea.level) ? rawIdea.level : "Beginner",
      time: String(rawIdea.time || "30 min"),
      summary: String(rawIdea.summary || ""),
      description: String(rawIdea.description || rawIdea.summary || ""),
      learn: cleanList(rawIdea.learn).length ? cleanList(rawIdea.learn) : ["python"],
      steps,
      tips: cleanList(rawIdea.tips).length
        ? cleanList(rawIdea.tips)
        : GENERIC_TIPS[rawIdea.category] || ["Test je code na elke stap.", "Begin klein en breid daarna uit."],
      next: cleanList(rawIdea.next),
      image: typeof rawIdea.image === "string" ? rawIdea.image.trim() : "",
      custom: Boolean(rawIdea.custom)
    });
  }

  const ids = new Set(list.map((item) => item.id));

  for (const item of list) {
    item.next = item.next.filter((id) => id !== item.id && ids.has(id));

    if (item.next.length < 2) {
      const sameCategory = list
        .filter((other) => other.id !== item.id && other.category === item.category)
        .map((other) => other.id);
      const fallback = list.filter((other) => other.id !== item.id).map((other) => other.id);
      for (const id of [...sameCategory, ...fallback]) {
        if (item.next.length >= 2) break;
        if (!item.next.includes(id)) item.next.push(id);
      }
    }

    item.next = item.next.slice(0, 3);
  }

  return list;
}

export const IDEAS = normalizeIdeaList([
  ...IDEAS_PART_1,
  ...IDEAS_PART_2,
  ...IDEAS_PART_3,
  ...IDEAS_PART_4,
  ...IDEAS_PART_5,
  ...IDEAS_PART_6,
  ...IDEAS_PART_7
]);

const BY_ID = new Map(IDEAS.map((idea) => [idea.id, idea]));

export function getBuiltinIdea(id) {
  return BY_ID.get(id) || null;
}

export function minutesOf(idea) {
  const text = String(idea.time || "").toLowerCase();
  const number = Number.parseFloat(text.replace(",", ".")) || 30;
  return text.includes("uur") ? Math.round(number * 60) : Math.round(number);
}

export function durationBucket(idea) {
  const minutes = minutesOf(idea);
  if (minutes <= 30) return "kort";
  if (minutes <= 60) return "middel";
  if (minutes <= 120) return "lang";
  return "project";
}

export function haystackOf(idea) {
  return [
    idea.title,
    idea.summary,
    idea.description,
    idea.category,
    idea.level,
    ...(idea.learn || []),
    ...(idea.steps || []).flatMap((s) => [s.title, s.text])
  ]
    .join(" ")
    .toLowerCase();
}

export function uniqueSkills(ideas) {
  const counts = new Map();
  for (const idea of ideas) {
    for (const skill of idea.learn || []) {
      counts.set(skill, (counts.get(skill) || 0) + 1);
    }
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "nl"))
    .map(([name, count]) => ({ name, count }));
}
