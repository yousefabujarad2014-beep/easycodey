import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  IDEAS,
  CATEGORIES,
  LEVELS,
  CATEGORY_COVERS,
  CATEGORY_META
} from "../data/index.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const errors = [];
const warnings = [];

const requiredStrings = ["id", "title", "emoji", "category", "level", "time", "summary", "description"];
const validLevels = new Set(LEVELS);
const validCategories = new Set(CATEGORIES);
const ids = new Set();
const duplicateIds = new Set();
const MOJIBAKE = /Ã[\u0080-\u00bf]|Â[\u0080-\u00bf]|â€|ðŸ|ï¿½|\uFFFD/;

function fail(message) {
  errors.push(message);
}

function hasText(value) {
  return typeof value === "string" && value.trim().length > 0;
}

for (const idea of IDEAS) {
  const label = idea?.id ? `Project "${idea.id}"` : "Project zonder id";

  if (!idea || typeof idea !== "object") {
    fail("Er staat een ongeldig project in de lijst.");
    continue;
  }

  for (const field of requiredStrings) {
    if (!hasText(idea[field])) fail(`${label}: veld "${field}" ontbreekt of is leeg.`);
  }

  if (ids.has(idea.id)) duplicateIds.add(idea.id);
  ids.add(idea.id);

  if (!/^[a-z0-9-]+$/.test(String(idea.id || ""))) {
    fail(`${label}: id mag alleen kleine letters, cijfers en streepjes bevatten.`);
  }

  if (!validCategories.has(idea.category)) {
    fail(`${label}: onbekende categorie "${idea.category}".`);
  }

  if (!validLevels.has(idea.level)) {
    fail(`${label}: onbekend niveau "${idea.level}".`);
  }

  if (!Array.isArray(idea.learn) || idea.learn.filter(hasText).length < 3) {
    fail(`${label}: minimaal 3 geldige leerdoelen nodig.`);
  }

  if (!Array.isArray(idea.steps) || idea.steps.length < 3) {
    fail(`${label}: minimaal 3 stappen nodig (nu ${idea.steps?.length || 0}).`);
  } else {
    idea.steps.forEach((step, index) => {
      if (!step || !hasText(step.title)) fail(`${label}: stap ${index + 1} heeft geen titel.`);
      if (!step || !hasText(step.text)) fail(`${label}: stap ${index + 1} heeft geen uitleg.`);
      if (!step || !hasText(step.code)) fail(`${label}: stap ${index + 1} heeft geen code.`);
    });
  }

  if (!Array.isArray(idea.tips) || idea.tips.filter(hasText).length < 1) {
    fail(`${label}: minimaal 1 tip nodig.`);
  }

  if (!Array.isArray(idea.next) || idea.next.length < 1) {
    fail(`${label}: minimaal 1 next-link nodig.`);
  } else {
    for (const nextId of idea.next) {
      if (!IDEAS.some((other) => other.id === nextId)) {
        fail(`${label}: next-link "${nextId}" verwijst naar een onbekend project.`);
      }
      if (nextId === idea.id) fail(`${label}: next-link verwijst naar zichzelf.`);
    }
  }

  if (idea.image && typeof idea.image !== "string") {
    fail(`${label}: image moet een pad als tekst zijn.`);
  }

  if (hasText(idea.image) && !existsSync(path.join(root, idea.image))) {
    fail(`${label}: afbeelding "${idea.image}" bestaat niet.`);
  }

  const searchable = JSON.stringify(idea);
  if (MOJIBAKE.test(searchable)) {
    fail(`${label}: kapotte tekencodering gevonden (mojibake).`);
  }
}

for (const id of duplicateIds) fail(`Dubbel id: "${id}".`);

for (const category of CATEGORIES) {
  const cover = CATEGORY_COVERS[category];
  if (!cover) fail(`Categorie "${category}" heeft geen cover-afbeelding.`);
  else if (!existsSync(path.join(root, cover))) fail(`Cover ontbreekt: ${cover}`);
  if (!CATEGORY_META[category]?.emoji) warnings.push(`Categorie "${category}" heeft geen emoji.`);
}

/* PWA: manifest, service worker en offline-cache. */

const manifestPath = path.join(root, "manifest.webmanifest");
if (!existsSync(manifestPath)) {
  fail("manifest.webmanifest ontbreekt.");
} else {
  try {
    const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
    if (manifest.display !== "standalone") fail("Het manifest moet display \"standalone\" gebruiken.");
    if (manifest.start_url !== "./") fail("Het manifest moet start_url \"./\" gebruiken.");
    if (!Array.isArray(manifest.icons) || manifest.icons.length < 2) {
      fail("Het manifest heeft minimaal twee app-iconen nodig.");
    } else {
      for (const icon of manifest.icons) {
        const iconPath = path.join(root, String(icon.src || "").replace(/^\.\//, ""));
        if (!existsSync(iconPath)) fail(`App-icoon ontbreekt: ${icon.src}`);
      }
      if (!manifest.icons.some((icon) => String(icon.purpose || "").includes("maskable"))) {
        fail("Het manifest mist een maskable icoon.");
      }
    }
  } catch (error) {
    fail(`manifest.webmanifest is geen geldige JSON: ${error.message}`);
  }
}

if (!existsSync(path.join(root, "sw.js"))) fail("sw.js ontbreekt.");
if (!existsSync(path.join(root, "offline.html"))) fail("offline.html ontbreekt.");

const indexHtml = readFileSync(path.join(root, "index.html"), "utf8");
if (!indexHtml.includes('rel="manifest"')) fail("index.html linkt niet naar het manifest.");
if (!indexHtml.includes("apple-touch-icon")) fail("index.html mist het apple-touch-icoon.");

const swSource = readFileSync(path.join(root, "sw.js"), "utf8");
let offlineFileCount = 0;
const shellBlock = swSource.match(/const SHELL = \[([\s\S]*?)\];/);
if (!shellBlock) {
  fail("sw.js heeft geen SHELL-lijst.");
} else {
  const shellFiles = [...shellBlock[1].matchAll(/"([^"]+)"/g)].map((match) => match[1]);
  offlineFileCount = shellFiles.length;
  if (shellFiles.length < 20) fail(`De offline-cache is te klein (${shellFiles.length} bestanden).`);
  for (const file of shellFiles) {
    if (!existsSync(path.join(root, file.replace(/^\.\//, "")))) {
      fail(`Offline-cache verwijst naar een onbekend bestand: ${file}`);
    }
  }
}

const counts = {};
for (const idea of IDEAS) counts[idea.category] = (counts[idea.category] || 0) + 1;

if (IDEAS.length < 150) {
  warnings.push(`Er staan ${IDEAS.length} projecten in; het doel is 150+.`);
}

console.log("");
console.log("EasyCodey datacontrole");
console.log("=====================");
console.log(`Projecten: ${IDEAS.length}`);
console.log(`Stappen:   ${IDEAS.reduce((sum, idea) => sum + (idea.steps?.length || 0), 0)}`);
console.log(`App:       manifest + service worker (${offlineFileCount} offline-bestanden)`);
console.log("");
for (const category of CATEGORIES) {
  console.log(`  ${String(counts[category] || 0).padStart(3)}  ${CATEGORY_META[category].emoji} ${category}`);
}
console.log("");

for (const warning of warnings) console.log(`WAARSCHUWING: ${warning}`);

if (errors.length) {
  console.error(`Gevonden problemen (${errors.length}):`);
  for (const error of errors) console.error(`  - ${error}`);
  process.exitCode = 1;
} else {
  console.log("Alles is in orde.");
}
