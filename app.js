import {
  IDEAS,
  CATEGORIES,
  CATEGORY_META,
  LEVELS,
  DURATION_FILTERS,
  durationBucket,
  minutesOf,
  haystackOf,
  uniqueSkills,
  coverFor
} from "./data/index.js";

import * as store from "./js/store.js";
import {
  escapeHtml as e,
  renderMarkdown,
  fetchConfig,
  isAIConfigured,
  streamChat,
  offlineReply,
  buildProjectRequest,
  offlineGenerateIdea,
  parseGeneratedIdea,
  guessCategory
} from "./js/ai.js";

const LIVE_URL = "https://yousefabujarad2014-beep.github.io/easycodey/";
const OWNER_CODE_HASH = "j0qwup";
const OWNER_SESSION_KEY = "easycodey.owner.unlocked.v1";

const app = document.querySelector("#app");
const aiPanel = document.querySelector("#ai-panel");
const aiBackdrop = document.querySelector(".ai-backdrop");
const aiMessagesEl = document.querySelector("#ai-messages");
const aiForm = document.querySelector("#ai-form");
const aiInput = document.querySelector("#ai-input");
const aiSend = document.querySelector("#ai-send");
const aiContextEl = document.querySelector("#ai-context");
const aiSetupEl = document.querySelector("#ai-setup");
const aiStatusEl = document.querySelector("#ai-status");
const settingsModal = document.querySelector("#settings-modal");
const generatorModal = document.querySelector("#generator-modal");
const donateModal = document.querySelector("#donate-modal");
const playgroundModal = document.querySelector("#playground-modal");
const playgroundCode = document.querySelector("#playground-code");
const playgroundOutput = document.querySelector("#playground-output");
const playgroundStatus = document.querySelector("#playground-status");
const playgroundRun = document.querySelector("#playground-run");
const installModal = document.querySelector("#install-modal");
const installHeader = document.querySelector("#install-header");
const installFooter = document.querySelector("#install-footer");
const installNowBtn = document.querySelector("#install-now");
const toastEl = document.querySelector("#toast");

let serverConfig = {
  hasServerKey: false,
  model: "",
  accessCodeRequired: false,
  donateUrl: "",
  donateLabel: "",
  donateNote: "",
  donateIban: "",
  donateName: "",
  donateBank: ""
};
let aiMessages = [];
let aiStreaming = false;
let deferredInstallPrompt = null;
let greetingShown = false;
let currentContext = null;
let homeBound = false;
let toastTimer = null;
let roadCategory = "Alle";

const homeState = {
  q: "",
  category: "Alle",
  level: "Alle",
  duration: "alle",
  skills: new Set(),
  hideDone: false,
  sort: "aanbevolen",
  visible: 30
};

const DEFAULT_SORT = ["aanbevolen", "kort", "moeilijk", "az"];

/* ------------------------------ hulpjes ------------------------------ */

function allIdeas() {
  return [...IDEAS, ...store.getCustomIdeas()];
}

function findIdea(id) {
  return allIdeas().find((idea) => idea.id === id) || null;
}

function ideaProgress(idea) {
  const total = idea.steps?.length || 0;
  const done = store.getProgress(idea.id).steps.filter((index) => index < total);
  return {
    total,
    done: done.length,
    pct: total ? Math.round((done.length / total) * 100) : 0,
    isDone: total > 0 && done.length === total
  };
}

function codeBlock(code, language = "python") {
  return `<div class="code-block">
    <div class="code-head">
      <span class="code-lang">${e(language)}</span>
      <div class="code-tools">
        <button class="code-play" type="button" data-action="play-code">▶ Speel</button>
        <button class="code-copy" type="button" data-action="copy-code">Kopieer</button>
      </div>
    </div>
    <pre><code>${e(code)}</code></pre>
  </div>`;
}

function combinedIdeaCode(idea) {
  if (!idea) return "";
  const header = [
    `# ${idea.title} — EasyCodey`,
    `# ${idea.summary}`,
    `# ${idea.steps.length} stappen · ${idea.level} · ${idea.time}`,
    ""
  ].join("\n");

  const steps = idea.steps.map((step, index) => {
    const title = `# --- Stap ${index + 1}: ${step.title} ---`;
    return `${title}\n${(step.code || "# (geen code bij deze stap)").trim()}`;
  });

  return `${header}\n${steps.join("\n\n")}\n`;
}

function downloadText(filename, text, type = "text/plain") {
  const blob = new Blob([text], { type: `${type};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function writeClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const area = document.createElement("textarea");
      area.value = text;
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.append(area);
      area.select();
      const copied = document.execCommand("copy");
      area.remove();
      return copied;
    } catch {
      return false;
    }
  }
}

function toast(message) {
  toastEl.textContent = message;
  toastEl.classList.add("show");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toastEl.classList.remove("show"), 2600);
}

function progressRing(percent, size = 62) {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - Math.max(0, Math.min(100, percent)) / 100);
  const center = size / 2;
  return `<svg class="progress-ring" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" aria-hidden="true">
    <circle cx="${center}" cy="${center}" r="${radius}" fill="none" stroke="var(--line)" stroke-width="6" />
    <circle cx="${center}" cy="${center}" r="${radius}" fill="none" stroke="var(--green)" stroke-width="6"
      stroke-linecap="round" stroke-dasharray="${circumference.toFixed(2)}"
      stroke-dashoffset="${offset.toFixed(2)}"
      transform="rotate(-90 ${center} ${center})" />
  </svg>`;
}

function celebrate() {
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
  const colors = ["#1f5eff", "#ff6b4a", "#ffd43b", "#0f9d58", "#a21caf", "#0ea5a4"];
  for (let index = 0; index < 30; index += 1) {
    const piece = document.createElement("i");
    piece.className = "confetti";
    piece.style.left = `${45 + Math.random() * 10}%`;
    piece.style.background = colors[index % colors.length];
    piece.style.setProperty("--dx", `${(Math.random() - 0.5) * 460}px`);
    piece.style.setProperty("--dy", `${-80 - Math.random() * 260}px`);
    piece.style.setProperty("--rot", `${Math.random() * 720 - 360}deg`);
    piece.style.animationDelay = `${Math.random() * 0.12}s`;
    document.body.append(piece);
    window.setTimeout(() => piece.remove(), 1900);
  }
}

function slugify(value) {
  return String(value || "project")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48) || "project";
}

function uniqueIdeaId(title) {
  const base = `eigen-${slugify(title)}`;
  const used = new Set(allIdeas().map((idea) => idea.id));
  if (!used.has(base)) return base;
  let counter = 2;
  while (used.has(`${base}-${counter}`)) counter += 1;
  return `${base}-${counter}`;
}

function nextIdeasFor(idea, limit = 3) {
  const all = allIdeas();
  const valid = (idea.next || [])
    .map((id) => all.find((item) => item.id === id))
    .filter((item) => item && item.id !== idea.id);
  if (valid.length >= limit) return valid.slice(0, limit);

  const sameCategory = all.filter(
    (item) => item.id !== idea.id && item.category === idea.category && !valid.some((v) => v.id === item.id)
  );
  return [...valid, ...sameCategory].slice(0, limit);
}

function emptyState(title, text, actions = "") {
  return `<div class="empty-state">
    <div class="big">🐍</div>
    <h3>${e(title)}</h3>
    <p>${e(text)}</p>
    ${actions}
  </div>`;
}

function setNav(routeName) {
  document.querySelectorAll("[data-nav]").forEach((link) => {
    const active = link.dataset.nav === routeName;
    link.classList.toggle("active", active);
    if (active) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });
}

function applyTheme(theme) {
  const finalTheme = theme === "dark" ? "dark" : "light";
  document.documentElement.dataset.theme = finalTheme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute(
    "content",
    finalTheme === "dark" ? "#12110f" : "#f7f5ef"
  );
}

function initTheme() {
  const stored = store.getTheme();
  const preferred = window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  applyTheme(stored || preferred);
}

function toggleTheme() {
  const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  applyTheme(next);
  store.setTheme(next);
}

/* ------------------------------ router ------------------------------ */

function parseRoute() {
  const raw = location.hash.replace(/^#\/?/, "");
  const [pathPart, queryPart = ""] = raw.split("?");
  return {
    segments: pathPart.split("/").filter(Boolean),
    params: new URLSearchParams(queryPart)
  };
}

function navigate(hash) {
  if (location.hash === hash) return;
  location.hash = hash;
}

function route() {
  syncProfileChatUI();
  syncSecurityBadge();
  showOwnerNotice();
  const { segments, params } = parseRoute();
  currentContext = null;
  renderAIContext();
  window.scrollTo({ top: 0 });

  if (!segments.length) {
    setNav("home");
    renderHome(params);
    return;
  }

  if (segments[0] === "idee" && segments[1]) {
    const ideaId = decodeURIComponent(segments[1]);
    setNav("home");
    renderDetail(ideaId);
    if (params.get("play") === "1" && findIdea(ideaId)) {
      window.setTimeout(() => playIdea(ideaId), 0);
    }
    return;
  }

  if (segments[0] === "leerpad") {
    setNav("leerpad");
    renderRoadmap(params);
    return;
  }

  if (segments[0] === "programmeren") {
    setNav("programmeren");
    renderEditor(params);
    return;
  }

  if (segments[0] === "mijn-ideeen") {
    setNav("mijn-ideeen");
    renderMyIdeas();
    return;
  }

  if (segments[0] === "profiel") {
    setNav("");
    renderProfile();
    return;
  }

  if (segments[0] === "eigenaar") {
    setNav("");
    renderOwner();
    return;
  }

  setNav("");
  app.innerHTML = emptyState(
    "Deze pagina bestaat niet",
    "Ga terug naar de projectbibliotheek en kies een project.",
    '<a class="btn" href="#/">Naar alle projecten</a>'
  );
  document.title = "Niet gevonden — EasyCodey";
}

/* ------------------------------ profiel ------------------------------ */

function profileDate(value) {
  try {
    return new Date(value).toLocaleDateString("nl-BE", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  } catch {
    return "";
  }
}

function renderProfile() {
  const active = store.getActiveProfile();
  const profiles = store.getProfiles();
  const stats = store.getStats(allIdeas());
  const initial = active ? active.name.trim().charAt(0).toUpperCase() : "?";

  const profileOptions = profiles
    .map((profile) => `<option value="${e(profile.name)}"></option>`)
    .join("");

  const profileChips = profiles.length
    ? `<div class="profile-quick" aria-label="Kies je account">
        ${profiles
          .map((profile) => {
            const letter = profile.name.trim().charAt(0).toUpperCase();
            return `<button class="profile-chip" type="button" data-action="profile-pick" data-profile-name="${e(profile.name)}">
              <span class="profile-chip-avatar" aria-hidden="true">${e(letter)}</span>
              <span>${e(profile.name)}</span>
            </button>`;
          })
          .join("")}
      </div>`
    : "";

  const activePanel = active
    ? `<section class="panel profile-card profile-player">
        <div class="profile-identity">
          <span class="profile-avatar" aria-hidden="true">${e(initial)}</span>
          <div>
            <p class="profile-kicker">Ingelogd op dit apparaat</p>
            <h2>${e(active.name)}</h2>
            <p class="muted">Account gemaakt op ${e(profileDate(active.createdAt))}</p>
          </div>
        </div>
        <div class="profile-stats">
          <div class="stat"><strong>${stats.completed}</strong><span>projecten afgerond</span></div>
          <div class="stat"><strong>${stats.percent}%</strong><span>totale voortgang</span></div>
        </div>
        <div class="profile-actions">
          <button class="btn ghost" type="button" data-action="profile-logout">Uitloggen</button>
          <button class="btn ghost" type="button" data-action="profile-delete">Account verwijderen</button>
        </div>
        <p class="static-note">
          Je account staat op dit apparaat. Gebruik hieronder een back-up om je voortgang
          naar een ander apparaat te verplaatsen.
        </p>
      </section>
      <section class="panel profile-card profile-chat-card">
        <div class="profile-chat-head">
          <span class="profile-chat-avatar" aria-hidden="true">✦</span>
          <div>
            <p class="profile-kicker">Jouw coach</p>
            <h2>Chat met EasyCoach</h2>
          </div>
        </div>
        <p class="profile-text">
          Stel een vraag over Python, je project of een foutmelding. Je kunt chatten op je
          laptop en op je telefoon, gewoon vanuit de app.
        </p>
        <button class="btn brand profile-chat-button" type="button" data-action="open-ai">
          <span aria-hidden="true">💬</span> Chat met EasyCoach
        </button>
        <p class="profile-chat-hint">Je vindt de chat ook rechtsboven in de app.</p>
      </section>`
    : `<section class="panel profile-card profile-join">
        <div class="profile-card-head">
          <span class="profile-step" aria-hidden="true">1</span>
          <div>
            <h2>Doe mee</h2>
            <p class="profile-text">Al een account? Log snel in.</p>
          </div>
        </div>
        ${profileChips}
        ${
          profiles.length
            ? `<form class="profile-form" id="profile-login-form">
                <label class="field">
                  <span>Naam</span>
                  <input id="profile-login-name" type="text" maxlength="40" autocomplete="username" list="profile-names" placeholder="Jouw naam" />
                  <datalist id="profile-names">${profileOptions}</datalist>
                </label>
                <label class="field">
                  <span>Wachtwoord</span>
                  <span class="password-field">
                    <input id="profile-login-password" type="password" autocomplete="current-password" placeholder="Jouw wachtwoord" />
                    <button class="password-toggle" type="button" data-action="toggle-password" data-target="profile-login-password" aria-label="Toon wachtwoord">Toon</button>
                  </span>
                </label>
                <p class="form-error" id="profile-login-error" role="alert" hidden></p>
                <button class="btn brand btn-block" type="submit">Doe mee →</button>
              </form>`
            : `<p class="profile-text">Nog geen account. Maak er hiernaast eentje aan — je bent in 10 seconden klaar.</p>`
        }
      </section>
      <section class="panel profile-card profile-join profile-join-new">
        <div class="profile-card-head">
          <span class="profile-step gold" aria-hidden="true">2</span>
          <div>
            <h2>Nieuw account</h2>
            <p class="profile-text">Kies een naam en wachtwoord. Klaar.</p>
          </div>
        </div>
        <form class="profile-form" id="profile-register-form">
          <label class="field">
            <span>Naam</span>
            <input id="profile-register-name" type="text" maxlength="40" autocomplete="nickname" placeholder="Bijv. Yousef" />
          </label>
          <label class="field">
            <span>Wachtwoord</span>
            <span class="password-field">
              <input id="profile-register-password" type="password" autocomplete="new-password" placeholder="Minstens 4 tekens" />
              <button class="password-toggle" type="button" data-action="toggle-password" data-target="profile-register-password" aria-label="Toon wachtwoord">Toon</button>
            </span>
          </label>
          <label class="field">
            <span>Contact <span class="field-optional">optioneel</span></span>
            <input id="profile-register-contact" type="text" maxlength="120" autocomplete="email" placeholder="E-mail of telefoonnummer" />
          </label>
          <p class="field-hint">Cijfers, letters of een mix. Je contact blijft lokaal op dit apparaat en wordt nooit verstuurd.</p>
          <label class="profile-check">
            <input id="profile-register-copy" type="checkbox" checked />
            <span>Neem mijn huidige voortgang mee</span>
          </label>
          <p class="form-error" id="profile-register-error" role="alert" hidden></p>
          <button class="btn brand btn-block" type="submit">Maak mijn account</button>
        </form>
      </section>`;

  app.innerHTML = `
    <section class="profile-hero ${active ? "profile-hero-in" : ""}">
      <div class="profile-hero-copy">
        <p class="eyebrow">${active ? "Welkom terug" : "Doe mee"}</p>
        <h1>${active ? `Hoi, ${e(active.name)}.` : "Doe mee met EasyCodey."}</h1>
        <p class="static-lead">
          ${
            active
              ? "Je voortgang, eigen projecten en editor-code staan klaar. Je coach is één tik weg."
              : "Kies een naam en wachtwoord. Geen e-mail, geen gedoe. Je voortgang blijft op dit apparaat."
          }
        </p>
        <div class="profile-hero-points">
          <span>✓ Geen e-mail nodig</span>
          <span>✓ Eigen voortgang</span>
          <span>✓ Chat met je coach</span>
        </div>
      </div>
      <div class="profile-hero-badge" aria-hidden="true">
        <span class="profile-hero-avatar">${active ? e(initial) : "E"}</span>
        <span class="profile-hero-spark">✦</span>
      </div>
    </section>

    <div class="profile-grid">
      ${activePanel}
    </div>

    <section class="panel profile-backup">
      <h2>Back-up en verhuizen</h2>
      <p class="profile-text">
        Download je voortgang als bestand en zet hem op een ander apparaat weer terug.
        Zo verhuis je je account zonder server of e-mail.
      </p>
      <div class="profile-actions">
        <button class="btn ghost" type="button" data-action="profile-backup">⤓ Back-up downloaden</button>
        <button class="btn ghost" type="button" data-action="profile-restore">⤒ Back-up herstellen</button>
        <input id="profile-restore-file" type="file" accept="application/json,.json" hidden />
      </div>
      <p class="static-note">
        Je gegevens worden alleen in deze browser opgeslagen. Je wachtwoord houdt accounts uit elkaar,
        maar is geen sterke beveiliging tegen iemand die toegang heeft tot dit apparaat.
      </p>
    </section>
  `;

  document.title = "Mijn profiel — EasyCodey";
}

/* ------------------------------ eigenaar / beheer ------------------------------ */

function ownerHash(value) {
  const text = `easycodey-owner:${value}`;
  let hash = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
}

function isOwnerUnlocked() {
  try {
    return sessionStorage.getItem(OWNER_SESSION_KEY) === "1";
  } catch {
    return false;
  }
}

function setOwnerUnlocked(value) {
  try {
    if (value) sessionStorage.setItem(OWNER_SESSION_KEY, "1");
    else sessionStorage.removeItem(OWNER_SESSION_KEY);
  } catch {
    // Zonder sessieopslag blijft het paneel tot de volgende klik ontgrendeld.
  }
}

function ownerDate(value) {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString("nl-BE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  } catch {
    return "—";
  }
}

function renderOwner() {
  if (!isOwnerUnlocked()) {
    app.innerHTML = `
      <section class="owner-gate">
        <p class="eyebrow">Beheer</p>
        <h1>Alleen voor de eigenaar</h1>
        <p class="static-lead">
          Dit paneel toont de lokale profielen van dit apparaat. Vul de eigenaarscode in om verder te gaan.
        </p>
        <form class="owner-unlock" id="owner-unlock-form">
          <label class="field">
            <span>Eigenaarscode</span>
            <input id="owner-code" type="password" autocomplete="off" placeholder="Voer je code in" />
          </label>
          <p class="form-error" id="owner-unlock-error" role="alert" hidden></p>
          <button class="btn brand btn-block" type="submit">Ontgrendel beheer</button>
        </form>
        <p class="static-note">
          Let op: dit is een lokale toegangspoort, geen serverbeveiliging. Deel je code niet.
        </p>
      </section>
    `;
    document.title = "Beheer — EasyCodey";
    return;
  }

  const profiles = store.getOwnerProfiles();
  const notice = store.getOwnerNotice();
  const totals = profiles.reduce(
    (sum, profile) => ({
      started: sum.started + profile.projectsStarted,
      completed: sum.completed + profile.projectsCompleted,
      steps: sum.steps + profile.stepsDone,
      ideas: sum.ideas + profile.customIdeas
    }),
    { started: 0, completed: 0, steps: 0, ideas: 0 }
  );

  const rows = profiles.length
    ? profiles
        .map(
          (profile) => `<tr>
            <td>
              <strong>${e(profile.name)}</strong>
              <span class="owner-sub">${profile.contact ? e(profile.contact) : "Geen contact opgegeven"}</span>
            </td>
            <td>${e(ownerDate(profile.createdAt))}</td>
            <td>${e(ownerDate(profile.lastLoginAt))}</td>
            <td>${profile.projectsStarted} gestart · ${profile.projectsCompleted} af</td>
            <td class="owner-row-actions">
              <button class="btn ghost tiny" type="button" data-action="owner-reset" data-profile-id="${e(profile.id)}">Voortgang wissen</button>
              <button class="btn ghost tiny owner-danger" type="button" data-action="owner-delete" data-profile-id="${e(profile.id)}">Verwijderen</button>
            </td>
          </tr>`
        )
        .join("")
    : `<tr><td colspan="5" class="owner-empty">Nog geen profielen op dit apparaat.</td></tr>`;

  app.innerHTML = `
    <section class="owner-hero">
      <div>
        <p class="eyebrow">Beheer</p>
        <h1>Eigenaarsoverzicht</h1>
        <p class="static-lead">
          Je ziet hier de profielen die op <strong>dit apparaat</strong> zijn gemaakt. Er is geen server:
          andere telefoons en computers hebben hun eigen lokale opslag.
        </p>
      </div>
      <button class="btn ghost" type="button" data-action="owner-lock">Vergrendelen</button>
    </section>

    <div class="owner-stats">
      <div class="owner-stat"><strong>${profiles.length}</strong><span>profielen op dit apparaat</span></div>
      <div class="owner-stat"><strong>${totals.started}</strong><span>projecten gestart</span></div>
      <div class="owner-stat"><strong>${totals.completed}</strong><span>projecten afgerond</span></div>
      <div class="owner-stat"><strong>${totals.steps}</strong><span>stappen gedaan</span></div>
      <div class="owner-stat"><strong>${totals.ideas}</strong><span>eigen ideeën</span></div>
    </div>

    <section class="panel owner-panel">
      <h2>Profielen</h2>
      <div class="owner-table-wrap">
        <table class="owner-table">
          <thead>
            <tr><th>Naam en contact</th><th>Gemaakt</th><th>Laatst actief</th><th>Voortgang</th><th>Acties</th></tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
      <p class="static-note">
        Wachtwoorden zijn nooit zichtbaar. Contactgegevens worden alleen lokaal bewaard en niet verstuurd.
      </p>
    </section>

    <section class="panel owner-panel">
      <h2>Mededeling voor gebruikers</h2>
      <p class="profile-text">
        Deze tekst verschijnt bovenaan de app op dit apparaat. Handig voor een korte uitleg, een
        pauzemelding of een mededeling over onderhoud.
      </p>
      <form class="owner-notice-form" id="owner-notice-form">
        <label class="field">
          <span>Bericht</span>
          <textarea id="owner-notice-text" rows="3" maxlength="280" placeholder="Bijv. Vandaag werken we aan de nieuwe projecten.">${e(notice.text)}</textarea>
        </label>
        <div class="profile-actions">
          <button class="btn brand" type="submit">Mededeling opslaan</button>
          <button class="btn ghost" type="button" data-action="owner-notice-clear">Wissen</button>
        </div>
      </form>
    </section>

    <section class="panel owner-panel">
      <h2>Gegevens van dit apparaat</h2>
      <p class="profile-text">
        Download een bestand met alle lokale profielen en hun voortgang. Bewaar het veilig; het bevat
        dezelfde gegevens als de back-up per profiel.
      </p>
      <div class="profile-actions">
        <button class="btn ghost" type="button" data-action="owner-export">⤓ Alles downloaden</button>
      </div>
      <p class="static-note">
        Wil je álle klanten van álle toestellen zien? Dat kan alleen met een echte server en database.
        EasyCodey is bewust offline en privé: er wordt niets naar een server gestuurd.
      </p>
    </section>
  `;

  document.title = "Beheer — EasyCodey";
}

function handleOwnerUnlock() {
  const code = document.querySelector("#owner-code")?.value || "";
  if (ownerHash(code) !== OWNER_CODE_HASH) {
    showProfileError("owner-unlock-error", "Die code klopt niet.");
    return;
  }
  setOwnerUnlocked(true);
  renderOwner();
}

function showOwnerNotice() {
  const notice = store.getOwnerNotice();
  const existing = document.querySelector("#owner-notice-banner");
  if (existing) existing.remove();
  if (!notice.text.trim()) return;

  let dismissed = "";
  try {
    dismissed = localStorage.getItem("easycodey.owner.notice.dismissed.v1") || "";
  } catch {
    dismissed = "";
  }
  if (dismissed === String(notice.updatedAt)) return;

  const banner = document.createElement("div");
  banner.id = "owner-notice-banner";
  banner.className = "owner-notice-banner";
  banner.setAttribute("role", "status");
  banner.innerHTML = `<span>${e(notice.text)}</span><button type="button" aria-label="Mededeling sluiten" data-action="owner-notice-dismiss">✕</button>`;
  app.before(banner);
}

function ownerExportAll() {
  const payload = store.exportAllLocalData();
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `easycodey-lokaal-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  toast("Lokale gegevens gedownload.");
}

function showProfileError(id, message) {
  const element = document.getElementById(id);
  if (!element) return;
  element.textContent = message;
  element.hidden = false;
}

function syncProfileChatUI() {
  const active = store.getActiveProfile();
  const name = active ? active.name : "";
  const show = Boolean(active);
  const fab = document.querySelector("#chat-fab");
  const footerChat = document.querySelector("#chat-footer");
  const footerSep = document.querySelector("#chat-footer-sep");
  const dot = document.querySelector("#profile-dot");

  [fab, footerChat, footerSep, dot].forEach((element) => {
    if (element) element.hidden = !show;
  });

  if (fab) {
    fab.setAttribute("aria-label", show ? `Chat met EasyCoach — ${name}` : "Chat met EasyCoach");
  }

  const profileLink = document.querySelector('.header-tools a[href$="#/profiel"]');
  if (profileLink) {
    profileLink.setAttribute("title", show ? `Mijn profiel — ${name}` : "Mijn profiel");
  }
}

function syncSecurityBadge() {
  const secure = window.location.protocol === "https:";
  document.body.dataset.secure = secure ? "true" : "false";

  const footer = document.querySelector("#footer-security");
  if (footer) {
    footer.textContent = secure ? "Beveiligde HTTPS-verbinding" : "Lokale ontwikkelversie";
    footer.title = secure
      ? "Je verbinding met EasyCodey is versleuteld."
      : "Je bekijkt de lokale versie. De live app gebruikt HTTPS.";
  }
}

function handleProfileLogin() {
  const name = document.querySelector("#profile-login-name")?.value || "";
  const password = document.querySelector("#profile-login-password")?.value || "";
  const result = store.loginProfileByName(name, password);
  if (!result.ok) {
    showProfileError("profile-login-error", result.error);
    return;
  }
  location.reload();
}

function handleProfileRegister() {
  const name = document.querySelector("#profile-register-name")?.value || "";
  const password = document.querySelector("#profile-register-password")?.value || "";
  const contact = document.querySelector("#profile-register-contact")?.value || "";
  const copyGuest = Boolean(document.querySelector("#profile-register-copy")?.checked);
  const result = store.registerProfile(name, password, { copyGuest, contact });
  if (!result.ok) {
    showProfileError("profile-register-error", result.error);
    return;
  }
  location.reload();
}

function downloadBackup() {
  const backup = store.exportBackup();
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `easycodey-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  toast("Back-up gedownload.");
}

function restoreBackupFile(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const result = store.importBackup(JSON.parse(String(reader.result)));
      if (!result.ok) {
        toast(result.error);
        return;
      }
      toast(`Back-up hersteld: ${result.progress} projecten en ${result.ideas} eigen ideeën.`);
      renderProfile();
    } catch {
      toast("Dit bestand is geen geldige JSON.");
    }
  };
  reader.readAsText(file);
}

/* ------------------------------ home ------------------------------ */

function resetHomeState(params) {
  homeState.q = params.get("q") || "";
  homeState.category = CATEGORIES.includes(params.get("categorie")) ? params.get("categorie") : "Alle";
  homeState.level = LEVELS.includes(params.get("niveau")) ? params.get("niveau") : "Alle";
  homeState.duration = DURATION_FILTERS.some((item) => item.id === params.get("duur"))
    ? params.get("duur")
    : "alle";
  homeState.skills = new Set(params.getAll("skill").filter(Boolean));
  homeState.hideDone = params.get("verberg") === "1";
  homeState.sort = DEFAULT_SORT.includes(params.get("sort")) ? params.get("sort") : "aanbevolen";
  homeState.visible = 30;
}

function renderHome(params) {
  resetHomeState(params);
  const ideas = allIdeas();
  const stats = store.getStats(ideas);
  const skills = uniqueSkills(ideas).slice(0, 30);
  const counts = new Map();
  for (const idea of ideas) counts.set(idea.category, (counts.get(idea.category) || 0) + 1);

  const categoryChips = [
    `<button class="chip" type="button" data-category="Alle">Alles <span class="count">${ideas.length}</span></button>`,
    ...CATEGORIES.map(
      (category) =>
        `<button class="chip" type="button" data-category="${e(category)}">${CATEGORY_META[category].emoji} ${e(
          category
        )} <span class="count">${counts.get(category) || 0}</span></button>`
    )
  ].join("");

  const levelChips = [
    `<button class="chip" type="button" data-level="Alle">Alles</button>`,
    ...LEVELS.map((level) => `<button class="chip" type="button" data-level="${e(level)}">${e(level)}</button>`)
  ].join("");

  const durationOptions = DURATION_FILTERS.map(
    (item) => `<option value="${item.id}">${item.label}</option>`
  ).join("");

  const skillChecks = skills
    .map(
      (skill) => `<label class="filter-check">
        <input type="checkbox" data-skill="${e(skill.name)}" />
        <span>${e(skill.name)}</span>
        <em>${skill.count}</em>
      </label>`
    )
    .join("");

  app.innerHTML = `
    <section class="hero">
      <div class="hero-copy">
        <p class="eyebrow">EasyCodey · leren door te bouwen</p>
        <h1>Kies een project.<br /><span class="grad">Bouw het echt.</span></h1>
        <p class="hero-sub">
          ${ideas.length} Python-projecten met uitleg, code en een stappenplan.
          Bewaar je voortgang, programmeer zelf in de browser en vraag de AI-coach om hulp.
        </p>
        <div class="hero-actions">
          <a class="btn brand" href="#/programmeren">⌨ Programmeer zelf</a>
          <button class="btn ghost" type="button" data-action="open-playground">▶ Snel proberen</button>
          <label class="search-box">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <circle cx="11" cy="11" r="7"></circle><path d="m20 20-3.5-3.5"></path>
            </svg>
            <input id="home-search" type="search" placeholder="Zoek op titel, vaardigheid of onderwerp…" autocomplete="off" />
          </label>
          <button class="btn ghost" type="button" data-action="random-idea">🎲 Verras me</button>
        </div>
        <p class="search-hint">Snel zoeken met <kbd>/</kbd> · filters staan in de URL, dus je kunt een selectie bewaren.</p>
      </div>
      <div class="hero-side">
        <div class="hero-aside">
          <div class="hero-aside-head"><i></i><i></i><i></i></div>
          <pre><span class="cm"># easycodey.py</span>
<span class="kw">def</span> <span class="fn">kies_project</span>():
    <span class="kw">return</span> <span class="st">"raad-het-getal"</span>

<span class="cm"># Jij kiest, wij leggen uit.</span>
<span class="fn">print</span>(kies_project())</pre>
          <span class="hero-aside-tag">✦ AI-coach inbegrepen</span>
        </div>
        <div class="hero-stats">
          <div class="stat"><strong>${ideas.length}</strong><span>projecten</span></div>
          <div class="stat"><strong>${CATEGORIES.length}</strong><span>categorieën</span></div>
          <div class="stat"><strong>${stats.completed}</strong><span>afgerond</span></div>
          <div class="stat"><strong>${stats.percent}%</strong><span>totale voortgang</span></div>
        </div>
      </div>
    </section>

    <section class="app-entry" id="app-entry" aria-label="EasyCodey als app">
      <div class="app-entry-copy">
        <p class="app-entry-kicker">EasyCodey als app</p>
        <h2>Neem je leerpad overal mee.</h2>
        <p>
          Installeer EasyCodey op je telefoon of laptop, of open de website in je browser.
          Je voortgang en eigen projecten blijven gewoon bewaard.
        </p>
      </div>
      <div class="app-entry-actions">
        <button class="btn brand" type="button" id="app-entry-install" data-action="install-app">Installeer de app</button>
        <a class="btn ghost" id="app-entry-web" href="${LIVE_URL}" target="_blank" rel="noopener">Open de website ↗</a>
      </div>
    </section>

    <div class="toolbar">
      <div class="chips" id="category-chips">${categoryChips}</div>
      <div class="toolbar-spacer"></div>
      <span class="result-count" id="result-count"></span>
    </div>

    <div class="level-row">
      <span class="filter-label">Niveau</span>
      <div class="chips" id="level-chips">${levelChips}</div>
      <span class="filter-label">Duur</span>
      <select class="filter-select" id="duration-filter" aria-label="Filter op tijdsduur">${durationOptions}</select>
      <details class="filter-menu" id="skills-menu">
        <summary>Vaardigheden <span id="skill-count"></span></summary>
        <div class="filter-menu-panel">${skillChecks || '<p class="muted">Nog geen vaardigheden.</p>'}</div>
      </details>
      <select class="filter-select" id="sort-filter" aria-label="Sorteer projecten">
        <option value="aanbevolen">Aanbevolen</option>
        <option value="kort">Kortste duur</option>
        <option value="moeilijk">Moeilijkheid</option>
        <option value="az">A-Z</option>
      </select>
      <button class="chip" type="button" data-action="toggle-hide-done">Alleen niet afgerond</button>
      <button class="chip" type="button" data-action="clear-filters">Filters wissen</button>
    </div>

    <div class="idea-grid" id="idea-grid"></div>
    <div class="load-more-wrap" id="load-more-wrap"></div>
  `;

  document.title = "EasyCodey — Leer Python door te bouwen";
  document.querySelector("#home-search").value = homeState.q;
  homeBound = true;
  updateInstallUI();
  applyHomeFilters();
}

function filteredIdeas() {
  const query = homeState.q.trim().toLowerCase();
  const selectedSkills = [...homeState.skills].map((skill) => skill.toLowerCase());
  let list = allIdeas();

  if (homeState.category !== "Alle") {
    list = list.filter((idea) => idea.category === homeState.category);
  }
  if (homeState.level !== "Alle") {
    list = list.filter((idea) => idea.level === homeState.level);
  }
  if (homeState.duration !== "alle") {
    list = list.filter((idea) => durationBucket(idea) === homeState.duration);
  }
  if (homeState.hideDone) {
    list = list.filter((idea) => !ideaProgress(idea).isDone);
  }
  if (query) {
    list = list.filter((idea) => haystackOf(idea).includes(query));
  }
  if (selectedSkills.length) {
    list = list.filter((idea) =>
      selectedSkills.every((skill) => idea.learn.some((item) => item.toLowerCase() === skill))
    );
  }

  const levelOrder = new Map(LEVELS.map((level, index) => [level, index]));
  return [...list].sort((a, b) => {
    if (homeState.sort === "kort") return minutesOf(a) - minutesOf(b) || a.title.localeCompare(b.title, "nl");
    if (homeState.sort === "moeilijk") {
      return (levelOrder.get(a.level) || 0) - (levelOrder.get(b.level) || 0) || a.title.localeCompare(b.title, "nl");
    }
    if (homeState.sort === "az") return a.title.localeCompare(b.title, "nl");
    return 0;
  });
}

function updateHomeURL() {
  const params = new URLSearchParams();
  if (homeState.q.trim()) params.set("q", homeState.q.trim());
  if (homeState.category !== "Alle") params.set("categorie", homeState.category);
  if (homeState.level !== "Alle") params.set("niveau", homeState.level);
  if (homeState.duration !== "alle") params.set("duur", homeState.duration);
  for (const skill of homeState.skills) params.append("skill", skill);
  if (homeState.hideDone) params.set("verberg", "1");
  if (homeState.sort !== "aanbevolen") params.set("sort", homeState.sort);

  const query = params.toString();
  const hash = query ? `#/?${query}` : "#/";
  if (location.hash !== hash) history.replaceState(null, "", hash);
}

function applyHomeFilters() {
  if (!homeBound) return;
  const list = filteredIdeas();
  const shown = list.slice(0, homeState.visible);

  const grid = document.querySelector("#idea-grid");
  grid.innerHTML = shown.length
    ? shown.map(renderCard).join("")
    : emptyState(
        "Geen projecten gevonden",
        "Pas je filters aan of vraag de AI om een project op maat.",
        `<div class="empty-actions">
          <button class="btn" type="button" data-action="clear-filters">Filters wissen</button>
          <button class="btn ghost" type="button" data-action="open-generator">✦ AI-idee maken</button>
        </div>`
      );

  document.querySelector("#result-count").textContent =
    list.length === allIdeas().length ? `${list.length} projecten` : `${list.length} van ${allIdeas().length} projecten`;

  document.querySelectorAll(".chip[data-category]").forEach((chip) => {
    chip.classList.toggle("active", chip.dataset.category === homeState.category);
  });
  document.querySelectorAll(".chip[data-level]").forEach((chip) => {
    chip.classList.toggle("active", chip.dataset.level === homeState.level);
  });
  document.querySelector("#duration-filter").value = homeState.duration;
  document.querySelector("#sort-filter").value = homeState.sort;
  document
    .querySelector('[data-action="toggle-hide-done"]')
    ?.classList.toggle("active", homeState.hideDone);

  const skillCount = document.querySelector("#skill-count");
  if (skillCount) skillCount.textContent = homeState.skills.size ? `(${homeState.skills.size})` : "";
  document.querySelectorAll("input[data-skill]").forEach((input) => {
    input.checked = homeState.skills.has(input.dataset.skill);
  });

  const loadWrap = document.querySelector("#load-more-wrap");
  if (list.length > homeState.visible) {
    loadWrap.innerHTML = `<button class="btn ghost" type="button" data-action="load-more">Meer laden (${Math.min(
      homeState.visible,
      list.length
    )} van ${list.length})</button>`;
  } else {
    loadWrap.innerHTML = "";
  }

  updateHomeURL();
}

function renderCard(idea) {
  const progress = ideaProgress(idea);
  const meta = CATEGORY_META[idea.category] || { color: "#1f5eff" };
  const accent = idea.custom ? "#7a3cff" : meta.color;
  return `<a class="idea-card${progress.isDone ? " is-done" : ""}" href="#/idee/${encodeURIComponent(
    idea.id
  )}" style="--card-accent:${accent}">
    <div class="card-cover">
      <img src="${e(coverFor(idea))}" alt="Omslagillustratie voor ${e(idea.category)}" loading="lazy" width="800" height="450" />
      <span class="card-cover-emoji" aria-hidden="true">${e(idea.emoji)}</span>
      <span class="card-cover-cat">${e(idea.category)}</span>
      <div class="card-badges">
        ${idea.custom ? '<span class="custom-flag">Eigen</span>' : ""}
        <span class="badge-level" data-level="${e(idea.level)}">${e(idea.level)}</span>
      </div>
    </div>
    <div class="card-body">
      <h3>${e(idea.title)}</h3>
      <p>${e(idea.summary)}</p>
      <div class="tag-row">${(idea.learn || [])
        .slice(0, 4)
        .map((tag) => `<span class="tag">${e(tag)}</span>`)
        .join("")}</div>
      <div class="card-foot">
        <div class="card-meta">
          <span>⏱ ${e(idea.time)}</span><span class="sep">·</span><span>${idea.steps.length} stappen</span>
        </div>
        <div class="card-progress">
          <span class="mini-bar" aria-hidden="true"><i style="width:${progress.pct}%"></i></span>
          <span class="card-arrow" aria-hidden="true">${progress.isDone ? "✓" : "→"}</span>
        </div>
      </div>
    </div>
  </a>`;
}

/* ------------------------------ detail ------------------------------ */

function renderDetail(id) {
  const idea = findIdea(id);
  if (!idea) {
    app.innerHTML = emptyState(
      "Project niet gevonden",
      "Dit project bestaat niet meer of de link is oud.",
      '<a class="btn" href="#/">Naar alle projecten</a>'
    );
    return;
  }

  const progress = ideaProgress(idea);
  const doneSet = new Set(store.getProgress(idea.id).steps);
  document.title = `${idea.title} — EasyCodey`;
  const backHref = idea.custom ? "#/mijn-ideeen" : "#/";
  const backLabel = idea.custom ? "Mijn ideeën" : "Alle projecten";

  const stepsHtml = idea.steps
    .map((step, index) => {
      const done = doneSet.has(index);
      return `<div class="step${done ? " done" : ""}">
        <div class="step-head">
          <button class="step-check" type="button" data-action="toggle-step" data-idea-id="${e(
            idea.id
          )}" data-step-index="${index}" aria-pressed="${done}" aria-label="Stap ${index + 1} ${
        done ? "nog niet afgerond" : "afronden"
      }">✓</button>
          <div class="step-title-wrap">
            <span class="step-num">Stap ${index + 1}</span>
            <h3 class="step-title">${e(step.title)}</h3>
          </div>
        </div>
        <div class="step-body">
          <p>${e(step.text)}</p>
          ${step.code ? codeBlock(step.code) : ""}
          <div class="step-actions">
            <button class="ask-ai" type="button" data-action="ask-step" data-idea-id="${e(
              idea.id
            )}" data-step-index="${index}">✦ Vraag AI over deze stap</button>
          </div>
        </div>
      </div>`;
    })
    .join("");

  const next = nextIdeasFor(idea)
    .map(
      (item) => `<a class="next-item" href="#/idee/${encodeURIComponent(item.id)}">
        <span class="next-emoji" aria-hidden="true">${e(item.emoji)}</span>
        <span>${e(item.title)}</span>
      </a>`
    )
    .join("");

  app.innerHTML = `<div class="detail" data-idea-id="${e(idea.id)}">
    <a class="back-link" href="${backHref}">← ${backLabel}</a>

    <header class="detail-hero">
      <div class="detail-cover">
        <img src="${e(coverFor(idea))}" alt="Omslagillustratie voor ${e(idea.title)}" width="800" height="450" />
        <span class="detail-cover-emoji" aria-hidden="true">${e(idea.emoji)}</span>
        <span class="detail-cover-cat">${CATEGORY_META[idea.category]?.emoji || "🧰"} ${e(idea.category)}</span>
      </div>
      <div class="detail-hero-body">
        <div class="detail-title-row">
          <h1>${e(idea.title)}</h1>
        </div>
        <div class="detail-meta">
          <span class="meta-pill">${CATEGORY_META[idea.category]?.emoji || "🧰"} ${e(idea.category)}</span>
          <span class="meta-pill">🎚 ${e(idea.level)}</span>
          <span class="meta-pill">⏱ ${e(idea.time)}</span>
          <span class="meta-pill">${idea.steps.length} stappen</span>
          ${idea.custom ? '<span class="meta-pill">✦ Eigen project</span>' : ""}
        </div>
        <p class="detail-summary">${e(idea.summary)}</p>
      </div>
    </header>

    <div class="idea-actions" aria-label="Projectcode gebruiken">
      <button class="btn brand" type="button" data-action="play-idea" data-idea-id="${e(
        idea.id
      )}">▶ Speel dit idee</button>
      <button class="btn ghost" type="button" data-action="program-idea" data-idea-id="${e(
        idea.id
      )}">⌨ Programmeer dit idee</button>
      <button class="btn ghost" type="button" data-action="download-idea" data-idea-id="${e(
        idea.id
      )}">⤓ Download .py</button>
      <button class="btn ghost" type="button" data-action="copy-idea-code" data-idea-id="${e(
        idea.id
      )}">Kopieer alle code</button>
      <span class="idea-actions-note">Speel het hele programma of open alle stappen in de editor. <a href="idee/${encodeURIComponent(
        idea.id
      )}/">Vaste projectpagina</a></span>
    </div>
    <p class="input-help input-help-inline" role="note">
      <span class="input-help-icon" aria-hidden="true">⌨</span>
      <span><strong>Moet je iets typen?</strong> Vraagt dit project om invoer, dan verschijnt bovenaan je scherm een venster met de vraag en een tekstvak. Typ daar je antwoord en druk op <kbd>Enter</kbd>.</span>
    </p>

    <div class="detail-grid">
      <div class="detail-main">
        <section class="panel">
          <h2><span class="h2-num">1</span> Waar gaat dit over?</h2>
          <p>${e(idea.description)}</p>
        </section>

        <section class="panel">
          <h2><span class="h2-num">2</span> Wat leer je?</h2>
          <div class="learn-grid">${(idea.learn || [])
            .map((item) => `<span class="learn-item">${e(item)}</span>`)
            .join("")}</div>
        </section>

        <section class="panel">
          <h2><span class="h2-num">3</span> Stap voor stap</h2>
          <div class="steps">${stepsHtml}</div>
        </section>

        ${
          idea.tips?.length
            ? `<section class="panel">
                <h2><span class="h2-num">4</span> Tips</h2>
                <ul class="tips">${idea.tips.map((tip) => `<li>${e(tip)}</li>`).join("")}</ul>
              </section>`
            : ""
        }
      </div>

      <aside class="detail-side">
        <div class="side-card progress-card">
          <h3>Jouw voortgang</h3>
          <div class="progress-big">
            ${progressRing(progress.pct)}
            <div class="progress-copy"><strong>${progress.pct}%</strong><span>${progress.done}/${progress.total} stappen</span></div>
          </div>
          <div class="progress-bar"><i style="width:${progress.pct}%"></i></div>
          <p class="progress-note">${progress.isDone ? "Project afgerond. Goed bezig!" : "Vink een stap af zodra je code werkt."}</p>
          <div class="side-actions">
            <button class="btn brand" type="button" data-action="complete-idea" data-idea-id="${e(
              idea.id
            )}" data-total="${idea.steps.length}" ${progress.isDone ? "disabled" : ""}>${
        progress.isDone ? "✓ Afgerond" : "Markeer als afgerond"
      }</button>
            <button class="btn ghost" type="button" data-action="ask-current" data-idea-id="${e(
              idea.id
            )}">✦ Vraag AI om hulp</button>
          </div>
          <button class="reset-link" type="button" data-action="reset-idea" data-idea-id="${e(
            idea.id
          )}">Voortgang resetten</button>
        </div>

        <div class="side-card">
          <h3>Over dit project</h3>
          <div class="side-fact"><span>Categorie</span><strong>${e(idea.category)}</strong></div>
          <div class="side-fact"><span>Niveau</span><strong>${e(idea.level)}</strong></div>
          <div class="side-fact"><span>Tijdsduur</span><strong>${e(idea.time)}</strong></div>
          <div class="side-fact"><span>Stappen</span><strong>${idea.steps.length}</strong></div>
        </div>

        ${
          next
            ? `<div class="side-card"><h3>Hierna doen</h3><div class="next-list">${next}</div></div>`
            : ""
        }

        ${
          idea.custom
            ? `<div class="side-card"><h3>Eigen project</h3><button class="btn ghost" type="button" data-action="delete-custom" data-idea-id="${e(
                idea.id
              )}">Verwijder dit project</button></div>`
            : ""
        }
      </aside>
    </div>
  </div>`;
}

/* ------------------------------ leerpad ------------------------------ */

function renderRoadmap(params = new URLSearchParams()) {
  if (params.get("categorie") && CATEGORIES.includes(params.get("categorie"))) {
    roadCategory = params.get("categorie");
  }

  const ideas = allIdeas();
  const stats = store.getStats(ideas);
  const categoryChips = [
    `<button class="chip" type="button" data-road-category="Alle">Alles</button>`,
    ...CATEGORIES.map(
      (category) =>
        `<button class="chip" type="button" data-road-category="${e(category)}">${
          CATEGORY_META[category].emoji
        } ${e(category)}</button>`
    )
  ].join("");

  const sections = LEVELS.map((level) => {
    const levelIdeas = ideas.filter(
      (idea) => idea.level === level && (roadCategory === "Alle" || idea.category === roadCategory)
    );
    if (!levelIdeas.length) return "";
    return `<section class="level-section" data-level="${e(level)}">
      <div class="level-head">
        <span class="level-dot" aria-hidden="true"></span>
        <h2>${e(level)}</h2>
        <span class="badge-level" data-level="${e(level)}">${levelIdeas.length} projecten</span>
      </div>
      <p>${
        level === "Beginner"
          ? "Bouw eerst een stevige basis met invoer, keuzes en herhaling."
          : level === "Gemiddeld"
            ? "Combineer functies, bestanden en externe bibliotheken."
            : "Werk aan grotere projecten met architectuur, data en foutafhandeling."
      }</p>
      <div class="road-list">
        ${levelIdeas
          .map((idea, index) => {
            const progress = ideaProgress(idea);
            return `<a class="road-item${progress.isDone ? " done" : ""}" href="#/idee/${encodeURIComponent(
              idea.id
            )}" title="${e(idea.title)}">
              <span class="road-num">${progress.isDone ? "✓" : index + 1}</span>
              <span class="road-label">${e(idea.title)}</span>
            </a>`;
          })
          .join("")}
      </div>
    </section>`;
  }).join("");

  app.innerHTML = `<div class="road-hero">
    <p class="eyebrow">EasyCodey · leerpad</p>
    <h1>Van eerste regel naar echt project.</h1>
    <p>Volg de niveaus op je eigen tempo. Je voortgang wordt per project bewaard.</p>
    <div class="hero-actions">
      <button class="btn ghost" type="button" data-action="random-idea">🎲 Verras me</button>
      <button class="btn" type="button" data-action="open-generator">✦ AI-idee maken</button>
    </div>
  </div>

  <div class="side-card road-progress">
    <div class="progress-big"><strong>${stats.percent}%</strong><span>${stats.stepsDone}/${stats.stepsTotal} stappen</span></div>
    <div class="progress-bar"><i style="width:${stats.percent}%"></i></div>
    <p>${stats.completed} van ${ideas.length} projecten afgerond.</p>
  </div>

  <div class="chips roadmap-chips">${categoryChips}</div>
  <div class="roadmap">${sections || emptyState("Geen projecten in deze categorie", "Kies een andere categorie.")}</div>`;

  document.querySelectorAll("[data-road-category]").forEach((chip) => {
    chip.classList.toggle("active", chip.dataset.roadCategory === roadCategory);
  });
  document.title = "Leerpad — EasyCodey";
}

/* ------------------------------ mijn ideeën ------------------------------ */

function renderMyIdeas() {
  const ideas = store.getCustomIdeas().sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  app.innerHTML = `<div class="road-hero">
    <p class="eyebrow">EasyCodey · eigen projecten</p>
    <h1>Mijn ideeën</h1>
    <p>Projecten die je met de AI-generator hebt gemaakt. Ze worden alleen in deze browser opgeslagen.</p>
    <div class="hero-actions">
      <button class="btn" type="button" data-action="open-generator">✦ AI-idee maken</button>
      <button class="btn ghost" type="button" data-action="export-ideas" ${ideas.length ? "" : "disabled"}>Exporteren</button>
      <button class="btn ghost" type="button" data-action="import-ideas">Importeren</button>
      <input type="file" id="import-file" accept="application/json,.json" hidden />
    </div>
  </div>

  <div class="notice-card">
    <strong>Let op:</strong> je voortgang en eigen projecten staan in localStorage. Op een ander apparaat begin je dus leeg.
    Gebruik exporteren/importeren om ze mee te nemen.
  </div>

  <div class="idea-grid">${
    ideas.length
      ? ideas.map(renderCard).join("")
      : emptyState(
          "Nog geen eigen projecten",
          "Beschrijf je idee en laat EasyCoach er een compleet stappenplan van maken.",
          '<button class="btn" type="button" data-action="open-generator">✦ Maak mijn eerste project</button>'
        )
  }</div>`;

  document.title = "Mijn ideeën — EasyCodey";
}

/* ------------------------------ AI-paneel ------------------------------ */

function updateAIStatus() {
  const configured = isAIConfigured(store.getSettings(), serverConfig);
  aiStatusEl.classList.toggle("offline", !configured);
  aiStatusEl.innerHTML = `<span class="dot"></span> ${configured ? "AI-coach online" : "offline coach"}`;
  aiSetupEl.hidden = configured;

  if (!configured) {
    const settings = store.getSettings();
    const needsCode = serverConfig.accessCodeRequired && !settings.accessCode;
    aiSetupEl.innerHTML = needsCode
      ? `<p>Deze site vraagt een <strong>toegangscode</strong> voor de AI-coach.</p><button class="btn tiny" type="button" data-action="settings">Toegangscode instellen</button>`
      : `<p>De <strong>offline coach</strong> staat aan. Die geeft je een stappenplan op basis van je woorden.</p>
         <p>Wil je echte AI-antwoorden? Voeg een OpenAI-sleutel toe.</p>
         <button class="btn tiny" type="button" data-action="settings">Sleutel instellen</button>`;
  }
}

function renderAIContext() {
  if (!currentContext) {
    aiContextEl.hidden = true;
    aiContextEl.innerHTML = "";
    return;
  }

  const idea = findIdea(currentContext.ideaId);
  if (!idea) {
    currentContext = null;
    aiContextEl.hidden = true;
    return;
  }

  const step = Number.isInteger(currentContext.stepIndex) ? idea.steps[currentContext.stepIndex] : null;
  aiContextEl.hidden = false;
  aiContextEl.innerHTML = `<span>📌 <strong>${e(idea.title)}</strong>${
    step ? ` · stap ${currentContext.stepIndex + 1}: ${e(step.title)}` : ""
  }</span><button type="button" data-action="clear-context" aria-label="Context wissen">✕</button>`;
}

function openAI(context = null) {
  currentContext = context;
  renderAIContext();
  document.body.classList.add("ai-open");
  aiPanel.classList.add("open");
  aiBackdrop.classList.add("open");
  aiPanel.setAttribute("aria-hidden", "false");
  aiBackdrop.setAttribute("aria-hidden", "false");
  ensureGreeting();
  window.setTimeout(() => aiInput.focus(), 120);
}

function closeAI() {
  document.body.classList.remove("ai-open");
  aiPanel.classList.remove("open");
  aiBackdrop.classList.remove("open");
  aiPanel.setAttribute("aria-hidden", "true");
  aiBackdrop.setAttribute("aria-hidden", "true");
}

function appendAIMessage(role, content, { typing = false, keep = true } = {}) {
  const wrapper = document.createElement("div");
  wrapper.className = `msg ${role}`;
  const avatar = document.createElement("div");
  avatar.className = "msg-avatar";
  const active = store.getActiveProfile();
  const userInitial = active ? active.name.trim().charAt(0).toUpperCase() : "J";
  avatar.textContent = role === "user" ? userInitial : "✦";
  const body = document.createElement("div");
  body.className = "msg-body";
  body.innerHTML = typing
    ? '<span class="typing"><i></i><i></i><i></i></span>'
    : renderMarkdown(content);
  wrapper.append(avatar, body);
  aiMessagesEl.append(wrapper);
  if (keep) aiMessages.push({ role, content });
  scrollAIMessages();
  return body;
}

function ensureGreeting() {
  if (greetingShown) return;
  greetingShown = true;
  const active = store.getActiveProfile();
  const hello = active ? `Hoi ${active.name}` : "Hoi";
  appendAIMessage(
    "assistant",
    `## ${hello}, ik ben EasyCoach

Ik help je met Python, je project en je fouten. Je kunt mij vragen:
- "Leg stap 2 van dit project uit."
- "Mijn code geeft een foutmelding, help me debuggen."
- "Ik wil een eigen idee maken, maar weet niet waar ik moet beginnen."

Kies links een project of open **AI-idee maken** voor een compleet nieuw stappenplan.`,
    { keep: false }
  );
}

function scrollAIMessages() {
  aiMessagesEl.scrollTop = aiMessagesEl.scrollHeight;
}

function buildContextPayload() {
  if (!currentContext) return null;
  const idea = findIdea(currentContext.ideaId);
  if (!idea) return null;
  const step = Number.isInteger(currentContext.stepIndex) ? idea.steps[currentContext.stepIndex] : null;
  return {
    idea: {
      title: idea.title,
      category: idea.category,
      level: idea.level,
      summary: idea.summary
    },
    step: step
      ? {
          index: currentContext.stepIndex,
          total: idea.steps.length,
          title: step.title,
          text: step.text,
          code: step.code
        }
      : null
  };
}

function setAIBusy(busy) {
  aiStreaming = busy;
  aiSend.disabled = busy;
  aiInput.disabled = busy;
}

async function sendAIMessage(text) {
  const message = String(text || "").trim();
  if (!message || aiStreaming) return;

  ensureGreeting();
  appendAIMessage("user", message);
  aiInput.value = "";
  aiInput.style.height = "auto";

  const body = appendAIMessage("assistant", "", { typing: true, keep: false });
  const contextPayload = buildContextPayload();
  const settings = store.getSettings();
  const configured = isAIConfigured(settings, serverConfig);
  setAIBusy(true);

  if (!configured) {
    await new Promise((resolve) => window.setTimeout(resolve, 250));
    const reply = offlineReply({ text: message, context: contextPayload });
    body.innerHTML = renderMarkdown(reply);
    aiMessages.push({ role: "assistant", content: reply });
    setAIBusy(false);
    scrollAIMessages();
    return;
  }

  let full = "";
  try {
    await streamChat({
      messages: aiMessages.slice(-22),
      context: contextPayload,
      settings,
      onDelta: (delta) => {
        full += delta;
        body.innerHTML = renderMarkdown(full);
        scrollAIMessages();
      }
    });

    if (!full.trim()) throw new Error("Leeg antwoord van de AI.");
    aiMessages.push({ role: "assistant", content: full });
    body.innerHTML = renderMarkdown(full);
  } catch (error) {
    if (error.status === 401 || error.code === "no-key") {
      aiSetupEl.hidden = false;
    }
    const fallback = offlineReply({ text: message, context: contextPayload });
    const note =
      error.status === 429
        ? "**Even te veel AI-verzoeken.** Ik help je tijdelijk met de offline coach.\n\n"
        : "**De AI is even niet bereikbaar.** Ik help je met de offline coach.\n\n";
    const reply = note + fallback;
    body.innerHTML = renderMarkdown(reply);
    aiMessages.push({ role: "assistant", content: reply });
  } finally {
    setAIBusy(false);
    scrollAIMessages();
  }
}

function clearChat() {
  aiMessages = [];
  greetingShown = false;
  aiMessagesEl.innerHTML = "";
  ensureGreeting();
  toast("Gesprek gewist.");
}

/* ------------------------------ instellingen ------------------------------ */

function openSettings() {
  const settings = store.getSettings();
  document.querySelector("#cfg-key").value = settings.apiKey;
  document.querySelector("#cfg-model").value = settings.model;
  document.querySelector("#cfg-base").value = settings.baseUrl;
  document.querySelector("#cfg-access").value = settings.accessCode;
  document.querySelector("#cfg-key-hint").textContent = serverConfig.hasServerKey
    ? "Op de server staat al een sleutel. Laat dit leeg om die te gebruiken."
    : "Leeg laten = offline coach gebruiken.";
  settingsModal.hidden = false;
  window.setTimeout(() => document.querySelector("#cfg-key").focus(), 80);
}

function closeSettings() {
  settingsModal.hidden = true;
}

function saveSettings() {
  store.saveSettings({
    apiKey: document.querySelector("#cfg-key").value,
    model: document.querySelector("#cfg-model").value,
    baseUrl: document.querySelector("#cfg-base").value,
    accessCode: document.querySelector("#cfg-access").value
  });
  closeSettings();
  updateAIStatus();
  toast("AI-instellingen opgeslagen.");
}

/* ------------------------------ generator ------------------------------ */

function openGenerator() {
  const form = document.querySelector("#generator-form");
  form.reset();
  document.querySelector("#gen-topic").value = "";
  document.querySelector("#gen-level").value = "Beginner";
  document.querySelector("#gen-time").value = "45 min";
  document.querySelector("#gen-category").value = "";
  document.querySelector("#gen-status").textContent = "";
  document.querySelector("#gen-submit").disabled = false;
  generatorModal.hidden = false;
  window.setTimeout(() => document.querySelector("#gen-topic").focus(), 80);
}

function closeGenerator() {
  generatorModal.hidden = true;
}

/* ------------------------------ doneren ------------------------------ */

function cleanIban(value) {
  return String(value || "").replace(/[^a-z0-9]/gi, "").toUpperCase();
}

function isValidIban(value) {
  const iban = cleanIban(value);
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/.test(iban)) return false;
  const rearranged = iban.slice(4) + iban.slice(0, 4);
  const digits = rearranged.replace(/[A-Z]/g, (letter) => String(letter.charCodeAt(0) - 55));
  let remainder = 0;
  for (const digit of digits) remainder = (remainder * 10 + Number(digit)) % 97;
  return remainder === 1;
}

function formatIban(value) {
  return cleanIban(value).replace(/(.{4})/g, "$1 ").trim();
}

async function copyIban() {
  const text = formatIban(serverConfig.donateIban);
  if (!text) return;
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const area = document.createElement("textarea");
    area.value = text;
    document.body.append(area);
    area.select();
    document.execCommand("copy");
    area.remove();
  }
  toast("IBAN gekopieerd.");
}

function applyDonateConfig() {
  const url = String(serverConfig.donateUrl || "").trim();
  const label = String(serverConfig.donateLabel || "").trim() || "Doneer";
  const noteText = String(serverConfig.donateNote || "").trim();
  const hasUrl = /^https?:\/\//i.test(url);
  const hasIban = isValidIban(serverConfig.donateIban);
  const configured = hasUrl || hasIban;

  const header = document.querySelector("#donate-header");
  const footer = document.querySelector("#donate-footer");
  const separator = document.querySelector("#donate-footer-sep");
  const options = document.querySelector("#donate-options");
  const ibanBlock = document.querySelector("#donate-iban");
  const ibanValue = document.querySelector("#donate-iban-value");
  const bank = document.querySelector("#donate-bank");
  const empty = document.querySelector("#donate-empty");
  const main = document.querySelector("#donate-main");
  const note = document.querySelector("#donate-note");

  if (header) header.hidden = !configured;
  if (footer) footer.hidden = !configured;
  if (separator) separator.hidden = !configured;

  if (hasUrl) {
    main.href = url;
    main.textContent = `♥ ${label}`;
    note.textContent = noteText;
    note.hidden = !noteText;
    options.hidden = false;
  } else {
    options.hidden = true;
  }

  if (hasIban) {
    ibanValue.textContent = formatIban(serverConfig.donateIban);
    const bankName = String(serverConfig.donateBank || "").trim();
    const holder = String(serverConfig.donateName || "").trim();
    bank.textContent = [bankName, holder].filter(Boolean).join(" · ");
    bank.hidden = !bank.textContent;
    ibanBlock.hidden = false;
  } else {
    ibanBlock.hidden = true;
  }

  empty.hidden = configured;
}

function openDonate() {
  if (donateModal.hidden) {
    applyDonateConfig();
    donateModal.hidden = false;
  }
}

function closeDonate() {
  donateModal.hidden = true;
}

/* ------------------------------ python-speelveld ------------------------------ */

const PYODIDE_VERSION = "0.28.3";
const PYODIDE_BASE = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;

const PLAYGROUND_EXAMPLES = {
  hallo: 'print("Hallo EasyCodey!")',
  rekenen: 'naam = "EasyCodey"\nleeftijd = 1\nprint(f"{naam} is {leeftijd} jaar.")\nprint("2 + 3 =", 2 + 3)',
  loop: 'for i in range(1, 6):\n    print("Stap", i)\n\nprint("Klaar!")',
  lijst: 'projecten = ["Raad het getal", "Weer-app", "Pingpong"]\nprojecten.sort()\n\nfor project in projecten:\n    print("-", project)',
  functie: 'def begroet(naam):\n    return f"Hallo, {naam}!"\n\nprint(begroet("Python"))\nprint(begroet("EasyCodey"))',
  raad: 'geheim = 7\n\nfor gok in [3, 7, 9]:\n    if gok < geheim:\n        print(gok, "is te laag")\n    elif gok > geheim:\n        print(gok, "is te hoog")\n    else:\n        print(gok, "is goed!")'
};

let pyodidePromise = null;
let pyodideLoaded = false;

function loadPyodideRuntime() {
  if (!pyodidePromise) {
    pyodidePromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = `${PYODIDE_BASE}pyodide.js`;
      script.onload = () => {
        if (typeof window.loadPyodide !== "function") {
          reject(new Error("Pyodide kon niet worden geladen."));
          return;
        }
        window.loadPyodide({ indexURL: PYODIDE_BASE }).then(resolve, reject);
      };
      script.onerror = () => reject(new Error("Pyodide kon niet worden geladen. Controleer je internetverbinding."));
      document.head.appendChild(script);
    }).catch((error) => {
      pyodidePromise = null;
      throw error;
    });
  }
  return pyodidePromise;
}

function loadPlaygroundExample() {
  const key = document.querySelector("#playground-example").value;
  playgroundCode.value = PLAYGROUND_EXAMPLES[key] || PLAYGROUND_EXAMPLES.hallo;
}

function openPlayground(initialCode = "") {
  if (typeof initialCode === "string" && initialCode.trim()) {
    playgroundCode.value = initialCode;
  } else if (!playgroundCode.value.trim()) {
    loadPlaygroundExample();
  }
  playgroundModal.hidden = false;
  window.setTimeout(() => {
    playgroundCode.focus();
    playgroundCode.setSelectionRange(playgroundCode.value.length, playgroundCode.value.length);
  }, 80);
}

function closePlayground() {
  playgroundModal.hidden = true;
}

function clearPlayground() {
  playgroundCode.value = "";
  playgroundOutput.textContent = "Uitvoer verschijnt hier.";
  playgroundOutput.classList.remove("error");
  playgroundStatus.textContent = "";
  playgroundStatus.className = "playground-status";
  playgroundCode.focus();
}

function askInBrowser(question) {
  const text = String(question || "").trim();
  const message = text
    ? `${text}\n\nTyp je antwoord en druk op Enter:`
    : "Het programma vraagt om invoer.\n\nTyp je antwoord en druk op Enter:";
  const value = window.prompt(message, "");
  return value === null ? "" : value;
}

window.easyCodeyAsk = askInBrowser;

const INPUT_OVERRIDE_PY = `
import builtins as _builtins
from js import window as _window

def _easycodey_input(prompt=""):
    answer = _window.easyCodeyAsk("" if prompt is None else str(prompt))
    if answer is None:
        return ""
    return str(answer)

_builtins.input = _easycodey_input
`;

let inputOverrideInstalled = false;

async function executePython(code, append) {
  const pyodide = await loadPyodideRuntime();
  pyodideLoaded = true;
  pyodide.setStdout({ batched: append });
  pyodide.setStderr({ batched: append });
  pyodide.setStdin({
    stdin: () => {
      playgroundStatus.className = "playground-status busy";
      playgroundStatus.textContent = "Typ je antwoord in het venster bovenaan…";
      const value = window.prompt("Het programma vraagt om invoer.\n\nTyp je antwoord en druk op Enter:");
      playgroundStatus.className = "playground-status busy";
      playgroundStatus.textContent = "Bezig.";
      return value === null ? "" : value;
    }
  });
  if (!inputOverrideInstalled) {
    await pyodide.runPythonAsync(INPUT_OVERRIDE_PY);
    inputOverrideInstalled = true;
  }
  await pyodide.runPythonAsync(code);
}

async function runPlayground() {
  if (!playgroundCode.value.trim()) {
    playgroundStatus.className = "playground-status error";
    playgroundStatus.textContent = "Typ eerst wat code.";
    return;
  }

  playgroundRun.disabled = true;
  playgroundOutput.textContent = "";
  playgroundOutput.classList.remove("error");
  playgroundStatus.className = "playground-status busy";
  playgroundStatus.textContent = pyodideLoaded ? "Bezig…" : "Python laden (eenmalig, ±10 MB)…";

  let output = "";
  const append = (text) => {
    output += text + "\n";
    playgroundOutput.textContent = output;
  };

  try {
    await executePython(playgroundCode.value, append);
    if (!output.trim()) output = "(geen uitvoer)";
    playgroundOutput.textContent = output;
    playgroundStatus.className = "playground-status";
    playgroundStatus.textContent = "Klaar.";
  } catch (error) {
    playgroundOutput.classList.add("error");
    playgroundOutput.textContent = output + (output ? "\n" : "") + "Fout: " + (error?.message || String(error));
    playgroundStatus.className = "playground-status error";
    playgroundStatus.textContent = "Er ging iets mis.";
  } finally {
    playgroundRun.disabled = false;
  }
}

/* ------------------------------ programmeer-editor ------------------------------ */

const EDITOR_EXAMPLES = [
  { key: "hallo", label: "Hallo wereld" },
  { key: "rekenen", label: "Rekenen en variabelen" },
  { key: "loop", label: "Herhalen met een loop" },
  { key: "lijst", label: "Lijsten en sorteren" },
  { key: "functie", label: "Een functie maken" },
  { key: "raad", label: "Raad het getal (zonder input)" }
];

function editorExampleOptions(selected = "hallo") {
  return EDITOR_EXAMPLES.map(
    (item) =>
      `<option value="${e(item.key)}"${item.key === selected ? " selected" : ""}>${e(item.label)}</option>`
  ).join("");
}

function renderEditor(params) {
  const projectId = params.get("project");
  const project = projectId ? findIdea(projectId) : null;
  const exampleKey = params.get("voorbeeld");
  const hasExample = Boolean(exampleKey && PLAYGROUND_EXAMPLES[exampleKey]);
  const editorProjectId = project ? project.id : "";

  let code;
  if (project) {
    const draft = store.getEditorDraft();
    if (draft.projectId === project.id && draft.code) {
      code = draft.code;
    } else {
      code = combinedIdeaCode(project);
      store.saveEditorDraft(code, project.id);
    }
  } else if (hasExample) {
    code = PLAYGROUND_EXAMPLES[exampleKey];
    store.saveEditorDraft(code, "");
  } else {
    const draft = store.getEditorDraft();
    code = draft.code || PLAYGROUND_EXAMPLES.hallo;
  }

  document.title = project ? `${project.title} programmeren — EasyCodey` : "Programmeren — EasyCodey";

  app.innerHTML = `<div class="editor-page">
    <header class="editor-hero">
      <div>
        <p class="eyebrow">Jouw speelveld</p>
        <h1>Programmeer op EasyCodey</h1>
        <p>Schrijf Python, voer het meteen uit en bewaar je code in deze browser. Geen account nodig.</p>
      </div>
      <div class="editor-hero-actions">
        <button class="btn brand" type="button" data-action="editor-run">▶ Uitvoeren</button>
        <button class="btn ghost" type="button" data-action="editor-download">⤓ Download .py</button>
        <button class="btn ghost" type="button" data-action="editor-copy">Kopieer</button>
      </div>
    </header>

    ${
      project
        ? `<div class="editor-project">
            <span class="editor-project-emoji" aria-hidden="true">${e(project.emoji)}</span>
            <div>
              <strong>${e(project.title)}</strong>
              <span>Alle stappen staan als commentaar in de editor. Pas de code gerust aan.</span>
            </div>
            <button class="link-btn" type="button" data-action="editor-reload-project" data-idea-id="${e(
              project.id
            )}">Projectcode opnieuw laden</button>
            <a class="btn ghost tiny" href="#/idee/${encodeURIComponent(project.id)}">Terug naar project</a>
          </div>`
        : ""
    }

    <div class="editor-layout">
      <section class="editor-pane">
        <div class="editor-toolbar">
          <label class="field editor-example-field">
            <span>Voorbeeld</span>
            <select id="editor-example" class="field-select">${editorExampleOptions(
              hasExample ? exampleKey : "hallo"
            )}</select>
          </label>
          <button class="btn ghost tiny" type="button" data-action="editor-load-example">Voorbeeld laden</button>
          <span class="editor-save-status" id="editor-save-status" role="status" aria-live="polite">Opgeslagen</span>
        </div>
        <label class="editor-code-label" for="editor-code">Python-code</label>
        <textarea id="editor-code" class="editor-code" spellcheck="false" autocomplete="off" autocapitalize="off" aria-label="Python-code"></textarea>
        <div class="editor-hint-row">
          <span><kbd>Ctrl</kbd> + <kbd>Enter</kbd> om uit te voeren</span>
          <button class="link-btn" type="button" data-action="editor-reset">Leegmaken</button>
        </div>
      </section>

      <section class="editor-pane editor-output-pane">
        <div class="editor-output-head">
          <h2>Uitvoer</h2>
          <div class="editor-output-tools">
            <span class="playground-status" id="editor-status" role="status" aria-live="polite"></span>
            <button class="btn ghost tiny" type="button" data-action="editor-clear-output">Wissen</button>
          </div>
        </div>
        <pre class="editor-output" id="editor-output" aria-live="polite">Uitvoer verschijnt hier.</pre>
        <div class="editor-note">
          <p>Python draait via <strong>Pyodide</strong> in je browser. De eerste keer wordt ongeveer 10 MB geladen.</p>
          <p><code>input()</code> opent een pop-up met de vraag van je programma. Typ je antwoord in dat venster en druk op Enter. Een oneindige loop stopt pas als je het tabblad sluit.</p>
        </div>
      </section>
    </div>
  </div>`;

  const textarea = document.querySelector("#editor-code");
  const output = document.querySelector("#editor-output");
  const saveStatus = document.querySelector("#editor-save-status");
  if (!textarea) return;

  textarea.value = code;
  output.textContent = "Uitvoer verschijnt hier.";

  textarea.addEventListener("input", () => {
    store.saveEditorDraft(textarea.value, editorProjectId);
    saveStatus.textContent = "Opgeslagen";
    saveStatus.className = "editor-save-status";
  });

  textarea.addEventListener("keydown", (event) => {
    if (event.key === "Tab") {
      event.preventDefault();
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      textarea.setRangeText("    ", start, end, "end");
      textarea.dispatchEvent(new Event("input", { bubbles: true }));
    }
    if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
      event.preventDefault();
      runEditorCode();
    }
  });

  if (project) toast(`Code van “${project.title}” staat in de editor.`);
}

async function runEditorCode() {
  const textarea = document.querySelector("#editor-code");
  const output = document.querySelector("#editor-output");
  const status = document.querySelector("#editor-status");
  const runButton = document.querySelector('[data-action="editor-run"]');
  if (!textarea || !output || !status) return;

  if (!textarea.value.trim()) {
    status.className = "playground-status error";
    status.textContent = "Typ eerst wat code.";
    return;
  }

  const projectId = new URLSearchParams(location.hash.split("?")[1] || "").get("project") || "";
  store.saveEditorDraft(textarea.value, projectId);
  if (runButton) runButton.disabled = true;
  output.textContent = "";
  output.classList.remove("error");
  status.className = "playground-status busy";
  status.textContent = pyodideLoaded ? "Bezig…" : "Python laden (eenmalig, ±10 MB)…";

  let result = "";
  const append = (text) => {
    result += text + "\n";
    output.textContent = result;
  };

  try {
    await executePython(textarea.value, append);
    if (!result.trim()) result = "(geen uitvoer)";
    output.textContent = result;
    status.className = "playground-status";
    status.textContent = "Klaar.";
  } catch (error) {
    output.classList.add("error");
    output.textContent = result + (result ? "\n" : "") + "Fout: " + (error?.message || String(error));
    status.className = "playground-status error";
    status.textContent = "Er ging iets mis.";
  } finally {
    if (runButton) runButton.disabled = false;
  }
}

function loadEditorExample() {
  const select = document.querySelector("#editor-example");
  const textarea = document.querySelector("#editor-code");
  if (!select || !textarea) return;
  textarea.value = PLAYGROUND_EXAMPLES[select.value] || PLAYGROUND_EXAMPLES.hallo;
  store.saveEditorDraft(textarea.value, "");

  const banner = document.querySelector(".editor-project");
  if (banner) {
    banner.remove();
    history.replaceState(null, "", "#/programmeren");
    document.title = "Programmeren — EasyCodey";
  }

  textarea.dispatchEvent(new Event("input", { bubbles: true }));
  textarea.focus();
}

function clearEditorOutput() {
  const output = document.querySelector("#editor-output");
  const status = document.querySelector("#editor-status");
  if (output) {
    output.textContent = "Uitvoer verschijnt hier.";
    output.classList.remove("error");
  }
  if (status) {
    status.textContent = "";
    status.className = "playground-status";
  }
}

function resetEditor() {
  const textarea = document.querySelector("#editor-code");
  if (!textarea) return;
  if (textarea.value.trim() && !window.confirm("Weet je zeker dat je je code wilt wissen?")) return;
  textarea.value = "";
  store.clearEditorDraft();
  textarea.dispatchEvent(new Event("input", { bubbles: true }));
  textarea.focus();
}

function downloadEditorCode() {
  const textarea = document.querySelector("#editor-code");
  if (!textarea) return;
  if (!textarea.value.trim()) {
    toast("Er is nog geen code om te downloaden.");
    return;
  }

  const projectId = new URLSearchParams(location.hash.split("?")[1] || "").get("project");
  const idea = projectId ? findIdea(projectId) : null;
  downloadText(idea ? `${slugify(idea.title)}.py` : "easycodey-programma.py", textarea.value, "text/x-python");
  toast("Je code is gedownload.");
}

async function copyEditorCode(button) {
  const textarea = document.querySelector("#editor-code");
  if (!textarea?.value.trim()) return;
  const copied = await writeClipboard(textarea.value);
  if (!copied) {
    toast("Kopiëren lukte niet.");
    return;
  }
  if (button) {
    const old = button.textContent;
    button.textContent = "Gekopieerd!";
    window.setTimeout(() => {
      button.textContent = old;
    }, 1500);
  }
  toast("Code gekopieerd.");
}

function programIdea(ideaId) {
  const idea = findIdea(ideaId);
  if (!idea) return;
  const draft = store.getEditorDraft();
  const looksLikeProjectCode = draft.code.startsWith(`# ${idea.title} — EasyCodey`);
  if (draft.projectId !== idea.id || !draft.code || !looksLikeProjectCode) {
    store.saveEditorDraft(combinedIdeaCode(idea), idea.id);
  }
  navigate(`#/programmeren?project=${encodeURIComponent(idea.id)}`);
}

async function playIdea(ideaId) {
  const idea = findIdea(ideaId);
  if (!idea) return;
  openPlayground(combinedIdeaCode(idea));
  await runPlayground();
}

function reloadEditorProject(ideaId) {
  const idea = findIdea(ideaId);
  const textarea = document.querySelector("#editor-code");
  if (!idea || !textarea) return;
  if (
    textarea.value.trim() &&
    !window.confirm("Projectcode opnieuw laden? Je aanpassingen in de editor worden vervangen.")
  ) {
    return;
  }
  textarea.value = combinedIdeaCode(idea);
  store.saveEditorDraft(textarea.value, idea.id);
  textarea.dispatchEvent(new Event("input", { bubbles: true }));
  toast("Projectcode opnieuw geladen.");
}

function downloadIdeaCode(ideaId) {
  const idea = findIdea(ideaId);
  if (!idea) return;
  downloadText(`${slugify(idea.title)}.py`, combinedIdeaCode(idea), "text/x-python");
  toast("Projectcode gedownload.");
}

async function copyIdeaCode(button, ideaId) {
  const idea = findIdea(ideaId);
  if (!idea) return;
  const copied = await writeClipboard(combinedIdeaCode(idea));
  if (!copied) {
    toast("Kopiëren lukte niet.");
    return;
  }
  if (button) {
    const old = button.textContent;
    button.textContent = "Gekopieerd!";
    window.setTimeout(() => {
      button.textContent = old;
    }, 1500);
  }
  toast("Alle projectcode gekopieerd.");
}

function pickNextFor(category, limit = 3) {
  const pool = IDEAS.filter((idea) => idea.category === category);
  const chosen = pool.slice(0, limit).map((idea) => idea.id);
  if (chosen.length < limit) {
    for (const idea of IDEAS) {
      if (chosen.length >= limit) break;
      if (!chosen.includes(idea.id)) chosen.push(idea.id);
    }
  }
  return chosen;
}

function finalizeGeneratedIdea(raw, meta) {
  const title = String(raw.title || meta.topic || "Mijn project").trim();
  const category = CATEGORIES.includes(raw.category) ? raw.category : guessCategory(meta.topic);
  const level = LEVELS.includes(raw.level) ? raw.level : meta.level || "Beginner";
  const steps = (raw.steps || []).map((step, index) => ({
    title: String(step.title || `Stap ${index + 1}`),
    text: String(step.text || ""),
    code: String(step.code || "")
  }));

  return {
    id: uniqueIdeaId(title),
    title,
    emoji: raw.emoji || "🧪",
    category,
    level,
    time: raw.time || meta.time || "45 min",
    summary: raw.summary || `Een eigen project rond ${title}.`,
    description: raw.description || raw.summary || `Een eigen project rond ${title}.`,
    learn: raw.learn?.length ? raw.learn : ["functies", "lijsten", "while"],
    steps,
    tips: raw.tips?.length ? raw.tips : ["Test je code na elke stap.", "Bewaar een werkende versie voordat je verder bouwt."],
    next: pickNextFor(category),
    custom: true,
    createdAt: Date.now()
  };
}

async function handleGenerate(event) {
  event.preventDefault();
  const submit = document.querySelector("#gen-submit");
  const status = document.querySelector("#gen-status");
  const meta = {
    topic: document.querySelector("#gen-topic").value.trim(),
    level: document.querySelector("#gen-level").value,
    time: document.querySelector("#gen-time").value,
    category: document.querySelector("#gen-category").value
  };

  submit.disabled = true;
  status.textContent = "EasyCoach denkt na…";

  let result;
  try {
    if (isAIConfigured(store.getSettings(), serverConfig)) {
      let raw = "";
      await streamChat({
        messages: [{ role: "user", content: buildProjectRequest(meta) }],
        settings: store.getSettings(),
        mode: "generate",
        onDelta: (delta) => {
          raw += delta;
          status.textContent = "EasyCoach schrijft het stappenplan…";
        }
      });
      result = { idea: parseGeneratedIdea(raw), offline: false };
    } else {
      await new Promise((resolve) => window.setTimeout(resolve, 450));
      result = { idea: offlineGenerateIdea(meta), offline: true };
    }
  } catch {
    result = { idea: offlineGenerateIdea(meta), offline: true };
  }

  const idea = finalizeGeneratedIdea(result.idea, meta);
  store.addCustomIdea(idea);
  submit.disabled = false;
  closeGenerator();
  toast(result.offline ? "Project gemaakt met de offline coach." : "Project gemaakt met AI.");
  navigate(`#/idee/${encodeURIComponent(idea.id)}`);
}

/* ------------------------------ import/export ------------------------------ */

function downloadCustomIdeas() {
  const data = store.exportCustomIdeas();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "easycodey-eigen-ideeen.json";
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  toast("Je eigen projecten zijn geëxporteerd.");
}

async function importCustomIdeas(file) {
  if (!file) return;
  try {
    const text = await file.text();
    const parsed = JSON.parse(text);
    const ideas = Array.isArray(parsed) ? parsed : parsed.ideas;
    if (!Array.isArray(ideas)) throw new Error("Geen lijst met ideeën.");
    const added = store.importCustomIdeas(ideas);
    renderMyIdeas();
    toast(added ? `${added} project(en) geïmporteerd.` : "Geen geldige projecten gevonden.");
  } catch {
    toast("Dit bestand kon niet worden geïmporteerd.");
  }
}

/* ------------------------------ kopiëren ------------------------------ */

async function copyCode(button) {
  const block = button.closest(".code-block, .chat-code");
  const code = block?.querySelector("code")?.textContent || "";
  if (!code) return;
  try {
    await navigator.clipboard.writeText(code);
  } catch {
    const area = document.createElement("textarea");
    area.value = code;
    document.body.append(area);
    area.select();
    document.execCommand("copy");
    area.remove();
  }
  const old = button.textContent;
  button.textContent = "Gekopieerd!";
  window.setTimeout(() => {
    button.textContent = old;
  }, 1500);
}

/* ------------------------------ events ------------------------------ */

document.addEventListener("click", (event) => {
  const actionEl = event.target.closest("[data-action]");
  if (actionEl) {
    const action = actionEl.dataset.action;

    if (action === "theme") toggleTheme();
    if (action === "open-ai") openAI();
    if (action === "close-ai") closeAI();
    if (action === "settings") openSettings();
    if (action === "close-settings") closeSettings();
    if (action === "save-settings") saveSettings();
    if (action === "clear-chat") clearChat();
    if (action === "quick-prompt") {
      openAI();
      sendAIMessage(actionEl.dataset.prompt || actionEl.textContent);
    }
    if (action === "open-generator") openGenerator();
    if (action === "close-generator") closeGenerator();
    if (action === "open-donate") openDonate();
    if (action === "close-donate") closeDonate();
    if (action === "copy-iban") copyIban();
    if (action === "open-playground") openPlayground();
    if (action === "close-playground") closePlayground();
    if (action === "install-app") openInstall();
    if (action === "close-install") closeInstall();
    if (action === "install-now") installApp();
    if (action === "profile-logout") {
      store.logoutProfile();
      location.reload();
    }
    if (action === "profile-pick") {
      const name = actionEl.dataset.profileName || "";
      const input = document.querySelector("#profile-login-name");
      if (input) {
        input.value = name;
        input.focus();
      }
      document.querySelector("#profile-login-password")?.focus();
    }
    if (action === "toggle-password") {
      const target = document.getElementById(actionEl.dataset.target || "");
      if (target) {
        const show = target.type === "password";
        target.type = show ? "text" : "password";
        actionEl.textContent = show ? "Verberg" : "Toon";
        actionEl.setAttribute("aria-label", show ? "Verberg wachtwoord" : "Toon wachtwoord");
        target.focus();
      }
    }
    if (action === "profile-delete") {
      const active = store.getActiveProfile();
      if (!active) return;
      const password = window.prompt(`Typ je wachtwoord om het account "${active.name}" te verwijderen:`);
      if (password === null) return;
      const result = store.deleteProfile(active.id, password);
      if (!result.ok) {
        toast(result.error);
        return;
      }
      location.reload();
    }
    if (action === "profile-backup") downloadBackup();
    if (action === "owner-lock") {
      setOwnerUnlocked(false);
      renderOwner();
    }
    if (action === "owner-reset") {
      const id = actionEl.dataset.profileId || "";
      const profile = store.getOwnerProfiles().find((item) => item.id === id);
      if (!profile) return;
      if (!window.confirm(`Voortgang van "${profile.name}" wissen? Het account blijft bestaan.`)) return;
      store.resetProfileProgress(id);
      renderOwner();
      toast("Voortgang gewist.");
    }
    if (action === "owner-delete") {
      const id = actionEl.dataset.profileId || "";
      const profile = store.getOwnerProfiles().find((item) => item.id === id);
      if (!profile) return;
      if (!window.confirm(`Account "${profile.name}" definitief verwijderen van dit apparaat?`)) return;
      store.deleteProfileAsOwner(id);
      renderOwner();
      toast("Account verwijderd.");
    }
    if (action === "owner-export") ownerExportAll();
    if (action === "owner-notice-clear") {
      store.setOwnerNotice("");
      renderOwner();
      showOwnerNotice();
      toast("Mededeling gewist.");
    }
    if (action === "owner-notice-dismiss") {
      const notice = store.getOwnerNotice();
      try {
        localStorage.setItem("easycodey.owner.notice.dismissed.v1", String(notice.updatedAt));
      } catch {
        // Negeer.
      }
      actionEl.closest("#owner-notice-banner")?.remove();
    }
    if (action === "profile-restore") {
      document.querySelector("#profile-restore-file")?.click();
    }
    if (action === "playground-example") loadPlaygroundExample();
    if (action === "run-playground") runPlayground();
    if (action === "clear-playground") clearPlayground();
    if (action === "play-code") {
      const block = actionEl.closest(".code-block");
      const code = block?.querySelector("pre code")?.textContent || "";
      openPlayground(code);
    }
    if (action === "copy-code") copyCode(actionEl);
    if (action === "editor-run") runEditorCode();
    if (action === "editor-load-example") loadEditorExample();
    if (action === "editor-clear-output") clearEditorOutput();
    if (action === "editor-reset") resetEditor();
    if (action === "editor-download") downloadEditorCode();
    if (action === "editor-copy") copyEditorCode(actionEl);
    if (action === "editor-reload-project") reloadEditorProject(actionEl.dataset.ideaId);
    if (action === "program-idea") programIdea(actionEl.dataset.ideaId);
    if (action === "play-idea") playIdea(actionEl.dataset.ideaId);
    if (action === "download-idea") downloadIdeaCode(actionEl.dataset.ideaId);
    if (action === "copy-idea-code") copyIdeaCode(actionEl, actionEl.dataset.ideaId);
    if (action === "toggle-step") {
      store.toggleStep(actionEl.dataset.ideaId, Number(actionEl.dataset.stepIndex));
      const idea = findIdea(actionEl.dataset.ideaId);
      const justCompleted = idea ? ideaProgress(idea).isDone : false;
      renderDetail(actionEl.dataset.ideaId);
      if (justCompleted) {
        celebrate();
        toast("Project afgerond! 🎉");
      }
    }
    if (action === "complete-idea") {
      store.markAllSteps(actionEl.dataset.ideaId, Number(actionEl.dataset.total));
      renderDetail(actionEl.dataset.ideaId);
      celebrate();
      toast("Project afgerond! 🎉");
    }
    if (action === "reset-idea") {
      store.clearProgress(actionEl.dataset.ideaId);
      renderDetail(actionEl.dataset.ideaId);
      toast("Voortgang gereset.");
    }
    if (action === "ask-step") {
      openAI({
        ideaId: actionEl.dataset.ideaId,
        stepIndex: Number(actionEl.dataset.stepIndex)
      });
      aiInput.value = `Leg stap ${Number(actionEl.dataset.stepIndex) + 1} stap voor stap uit en zeg welke fouten ik kan maken.`;
      aiInput.focus();
    }
    if (action === "ask-current") {
      openAI({ ideaId: actionEl.dataset.ideaId });
      aiInput.value = "Waar moet ik op letten bij dit project?";
      aiInput.focus();
    }
    if (action === "clear-context") {
      currentContext = null;
      renderAIContext();
    }
    if (action === "delete-custom") {
      if (window.confirm("Weet je zeker dat je dit eigen project wilt verwijderen?")) {
        store.removeCustomIdea(actionEl.dataset.ideaId);
        navigate("#/mijn-ideeen");
        toast("Project verwijderd.");
      }
    }
    if (action === "random-idea") {
      const pool = filteredIdeas();
      if (!pool.length) {
        toast("Geen projecten in deze selectie.");
      } else {
        const choice = pool[Math.floor(Math.random() * pool.length)];
        navigate(`#/idee/${encodeURIComponent(choice.id)}`);
      }
    }
    if (action === "toggle-hide-done") {
      homeState.hideDone = !homeState.hideDone;
      homeState.visible = 30;
      applyHomeFilters();
    }
    if (action === "clear-filters") {
      homeState.q = "";
      homeState.category = "Alle";
      homeState.level = "Alle";
      homeState.duration = "alle";
      homeState.skills = new Set();
      homeState.hideDone = false;
      homeState.sort = "aanbevolen";
      homeState.visible = 30;
      const search = document.querySelector("#home-search");
      if (search) search.value = "";
      applyHomeFilters();
    }
    if (action === "load-more") {
      homeState.visible += 30;
      applyHomeFilters();
    }
    if (action === "export-ideas") downloadCustomIdeas();
    if (action === "import-ideas") document.querySelector("#import-file")?.click();
    return;
  }

  const categoryChip = event.target.closest(".chip[data-category]");
  if (categoryChip) {
    homeState.category = categoryChip.dataset.category;
    homeState.visible = 30;
    applyHomeFilters();
    return;
  }

  const levelChip = event.target.closest(".chip[data-level]");
  if (levelChip) {
    homeState.level = levelChip.dataset.level;
    homeState.visible = 30;
    applyHomeFilters();
    return;
  }

  const roadChip = event.target.closest("[data-road-category]");
  if (roadChip) {
    roadCategory = roadChip.dataset.roadCategory;
    const params = new URLSearchParams();
    if (roadCategory !== "Alle") params.set("categorie", roadCategory);
    history.replaceState(null, "", params.toString() ? `#/leerpad?${params.toString()}` : "#/leerpad");
    renderRoadmap(params);
  }
});

document.addEventListener("input", (event) => {
  if (event.target.id === "home-search") {
    homeState.q = event.target.value;
    homeState.visible = 30;
    applyHomeFilters();
  }
  if (event.target.id === "ai-input") {
    event.target.style.height = "auto";
    event.target.style.height = `${Math.min(event.target.scrollHeight, 120)}px`;
  }
});

document.addEventListener("change", (event) => {
  if (event.target.id === "duration-filter") {
    homeState.duration = event.target.value;
    homeState.visible = 30;
    applyHomeFilters();
  }
  if (event.target.id === "sort-filter") {
    homeState.sort = event.target.value;
    applyHomeFilters();
  }
  if (event.target.matches("input[data-skill]")) {
    if (event.target.checked) homeState.skills.add(event.target.dataset.skill);
    else homeState.skills.delete(event.target.dataset.skill);
    homeState.visible = 30;
    applyHomeFilters();
  }
  if (event.target.id === "import-file") {
    importCustomIdeas(event.target.files?.[0]);
    event.target.value = "";
  }
  if (event.target.id === "profile-restore-file") {
    restoreBackupFile(event.target.files?.[0]);
    event.target.value = "";
  }
});

document.addEventListener("submit", (event) => {
  if (event.target === aiForm) {
    event.preventDefault();
    sendAIMessage(aiInput.value);
  }
  if (event.target.id === "generator-form") {
    handleGenerate(event);
  }
  if (event.target.id === "profile-login-form") {
    event.preventDefault();
    handleProfileLogin();
  }
  if (event.target.id === "profile-register-form") {
    event.preventDefault();
    handleProfileRegister();
  }
  if (event.target.id === "owner-unlock-form") {
    event.preventDefault();
    handleOwnerUnlock();
  }
  if (event.target.id === "owner-notice-form") {
    event.preventDefault();
    const text = document.querySelector("#owner-notice-text")?.value || "";
    store.setOwnerNotice(text);
    renderOwner();
    showOwnerNotice();
    toast("Mededeling opgeslagen.");
  }
});

document.addEventListener("keydown", (event) => {
  const typing = ["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement?.tagName);

  if (event.key === "/" && !typing) {
    event.preventDefault();
    document.querySelector("#home-search")?.focus();
  }

  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    openAI();
  }

  if (event.key === "Escape") {
    if (!settingsModal.hidden) closeSettings();
    else if (!generatorModal.hidden) closeGenerator();
    else if (!donateModal.hidden) closeDonate();
    else if (!playgroundModal.hidden) closePlayground();
    else if (!installModal.hidden) closeInstall();
    else if (aiPanel.classList.contains("open")) closeAI();
  }

  if (event.target === aiInput && event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    sendAIMessage(aiInput.value);
  }
});

window.addEventListener("hashchange", route);

/* ------------------------------ app / PWA ------------------------------ */

function isStandaloneApp() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: minimal-ui)").matches ||
    window.navigator.standalone === true
  );
}

function updateInstallUI() {
  const standalone = isStandaloneApp();
  if (installHeader) {
    installHeader.hidden = false;
    installHeader.setAttribute(
      "aria-label",
      standalone ? "App-info en website openen" : "Installeer EasyCodey als app"
    );
    installHeader.setAttribute("title", standalone ? "App-info en website" : "Installeer als app");
  }
  if (installFooter) installFooter.hidden = standalone;
  if (installNowBtn) installNowBtn.hidden = !deferredInstallPrompt;

  const entryInstall = document.querySelector("#app-entry-install");
  if (entryInstall) entryInstall.hidden = standalone;

  const entryWeb = document.querySelector("#app-entry-web");
  if (entryWeb) {
    entryWeb.textContent = standalone ? "Open de website ↗" : "Bekijk de website ↗";
    entryWeb.setAttribute("aria-label", standalone ? "Open EasyCodey in je browser" : "Bekijk de EasyCodey-website");
  }
}

function openInstall() {
  updateInstallUI();
  installModal.hidden = false;
}

function closeInstall() {
  installModal.hidden = true;
}

async function installApp() {
  if (!deferredInstallPrompt) {
    installModal.hidden = false;
    return;
  }
  const promptEvent = deferredInstallPrompt;
  deferredInstallPrompt = null;
  promptEvent.prompt();
  const choice = await promptEvent.userChoice.catch(() => null);
  updateInstallUI();
  if (choice?.outcome === "accepted") {
    installModal.hidden = true;
    toast("EasyCodey wordt geïnstalleerd.");
  } else {
    toast("Installatie geannuleerd. Je kunt het later opnieuw proberen.");
  }
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  const { protocol, hostname } = window.location;
  const allowed = protocol === "https:" || hostname === "localhost" || hostname === "127.0.0.1";
  if (!allowed) return;

  const hadController = Boolean(navigator.serviceWorker.controller);
  let reloading = false;

  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (!hadController || reloading) return;
    reloading = true;
    window.location.reload();
  });

  navigator.serviceWorker
    .register("./sw.js", { scope: "./", updateViaCache: "none" })
    .then((registration) => {
      const activateWaiting = () => {
        if (registration.waiting) registration.waiting.postMessage("SKIP_WAITING");
      };
      const checkForUpdate = () => {
        activateWaiting();
        registration.update().catch(() => {});
      };

      checkForUpdate();

      registration.addEventListener("updatefound", () => {
        const worker = registration.installing;
        if (!worker) return;
        worker.addEventListener("statechange", () => {
          if (worker.state === "installed" && navigator.serviceWorker.controller) {
            worker.postMessage("SKIP_WAITING");
            toast("Nieuwe versie gevonden. De app wordt bijgewerkt…");
          }
        });
      });

      // Automatisch bijwerken: bij de start, elke 15 minuten, bij terugkeer naar de app
      // en zodra het toestel weer online is. Zo blijft de app op Android en laptop actueel.
      window.setInterval(checkForUpdate, 15 * 60 * 1000);
      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") checkForUpdate();
      });
      window.addEventListener("focus", checkForUpdate);
      window.addEventListener("pageshow", checkForUpdate);
      window.addEventListener("online", checkForUpdate);
    })
    .catch(() => {
      // Zonder service worker blijft de site gewoon werken.
    });
}

function initPWA() {
  updateInstallUI();

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredInstallPrompt = event;
    updateInstallUI();
  });

  window.addEventListener("appinstalled", () => {
    deferredInstallPrompt = null;
    updateInstallUI();
    toast("EasyCodey staat als app op je apparaat.");
  });

  const standaloneQuery = window.matchMedia("(display-mode: standalone)");
  if (typeof standaloneQuery.addEventListener === "function") {
    standaloneQuery.addEventListener("change", updateInstallUI);
  }

  registerServiceWorker();
}

/* ------------------------------ start ------------------------------ */

async function init() {
  initTheme();
  initPWA();
  route();
  serverConfig = await fetchConfig();
  updateAIStatus();
  applyDonateConfig();

  document.querySelector("#cfg-key-hint").textContent = serverConfig.hasServerKey
    ? "Op de server staat al een sleutel. Laat dit leeg om die te gebruiken."
    : "Leeg laten = offline coach gebruiken.";
}

init();
