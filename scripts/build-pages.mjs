/* Genereert echte, indexeerbare pagina's per project.
   Gebruik: npm run pages

   Resultaat:
   - idee/<id>/index.html   (161 projectpagina's met eigen titel, description en canonical)
   - projecten/index.html   (overzicht met alle projecten)
   - sitemap.xml            (startpagina, overzicht en alle projecten)

   De app zelf blijft een hash-SPA. Deze pagina's zijn de vaste, door Google
   indexeerbare versie en linken terug naar de interactieve app. */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { IDEAS, CATEGORY_META, coverFor, minutesOf } from "../data/index.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SITE = "https://yousefabujarad2014-beep.github.io/easycodey";
const CONTACT_PHONE_DISPLAY = "+32 466 47 66 52";
const CONTACT_PHONE_TEL = "+32466476652";
const CONTACT_WHATSAPP = "https://wa.me/32466476652";
const CONTACT_EMAIL = "yousefabujarad2014@gmail.com";
const DONATE_IBAN = "BE69 0638 3621 2278";
const DONATE_NAME = "Yousef Abujarad (EasyCodey)";
const DONATE_BANK = "Belfius";
const DONATE_BIC = "GKCCBEBB";
const BUILD_DATE = new Date().toISOString().slice(0, 10);
const IDEAS_DIR = path.join(root, "idee");
const OVERVIEW_DIR = path.join(root, "projecten");
const INSTALL_DIR = path.join(root, "installeren");
const CONTACT_DIR = path.join(root, "contact");
const DONATE_DIR = path.join(root, "doneren");

const SUN_MOON = `<svg class="icon-sun" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"></path></svg>
        <svg class="icon-moon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"></path></svg>`;

function esc(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function slug(value) {
  return String(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function trim(text, max = 155) {
  const clean = String(text || "").replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  const space = cut.lastIndexOf(" ");
  return `${(space > 60 ? cut.slice(0, space) : cut).replace(/[,.;:]$/, "")}…`;
}

function jsonLd(data) {
  return JSON.stringify(data, null, 2).replace(/</g, "\\u003c");
}

function head({ title, description, canonical, image, prefix, extraLd }) {
  return `<meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <script>
    if (location.protocol === "http:" && !/^(localhost|127\\.0\\.0\\.1)$/.test(location.hostname)) {
      location.replace("https://" + location.host + location.pathname + location.search + location.hash);
    }
  </script>
  <meta name="theme-color" content="#f7f5ef" />
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}" />
  <meta name="robots" content="index, follow, max-image-preview:large" />
  <meta name="author" content="EasyCodey" />
  <link rel="canonical" href="${esc(canonical)}" />
  <link rel="manifest" href="${prefix}manifest.webmanifest" />
  <link rel="apple-touch-icon" href="${prefix}assets/icons/apple-touch-icon.png" />
  <link rel="icon" type="image/svg+xml" href="${prefix}assets/icons/logo.svg" />
  <link rel="icon" type="image/png" sizes="192x192" href="${prefix}assets/icons/icon-192.png" />
  <meta property="og:title" content="${esc(title)}" />
  <meta property="og:description" content="${esc(description)}" />
  <meta property="og:type" content="article" />
  <meta property="og:url" content="${esc(canonical)}" />
  <meta property="og:site_name" content="EasyCodey" />
  <meta property="og:locale" content="nl_NL" />
  <meta property="og:image" content="${esc(image)}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${esc(title)}" />
  <meta name="twitter:description" content="${esc(description)}" />
  <meta name="twitter:image" content="${esc(image)}" />
  <script type="application/ld+json">
${jsonLd(extraLd)}
  </script>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="${prefix}styles.css" />
  <script>
    (function () {
      try {
        var raw = localStorage.getItem("easycodey.v1") || localStorage.getItem("easycode.v1");
        var stored = raw ? JSON.parse(raw).theme : null;
        var dark = stored === "dark" || (!stored && window.matchMedia("(prefers-color-scheme: dark)").matches);
        document.documentElement.dataset.theme = dark ? "dark" : "light";
        var meta = document.querySelector('meta[name="theme-color"]');
        if (meta) meta.setAttribute("content", dark ? "#12110f" : "#f7f5ef");
      } catch (error) {}
    })();
  </script>`;
}

function header(prefix) {
  return `<a class="skip-link" href="#main">Naar de inhoud</a>
  <header class="site-header">
    <div class="header-inner">
      <a class="logo" href="${prefix}" aria-label="EasyCodey home">
        <span class="logo-mark" aria-hidden="true">
          <svg viewBox="0 0 44 44" width="24" height="24" fill="none">
            <text x="20" y="31" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="27" font-weight="500" fill="currentColor">E</text>
            <circle cx="33.5" cy="11.5" r="2.3" fill="#e3bd6a"></circle>
          </svg>
        </span>
        <span class="logo-text">Easy<strong>Codey</strong></span>
      </a>
      <nav class="main-nav" aria-label="Hoofdnavigatie">
        <a href="${prefix}">Home</a>
        <a href="${prefix}projecten/">Projecten</a>
        <a href="${prefix}#/leerpad">Leerpad</a>
        <a href="${prefix}#/programmeren">Programmeren</a>
        <a href="${prefix}#/mijn-ideeen">Mijn ideeën</a>
        <a href="${prefix}contact/">Contact</a>
      </nav>
      <div class="header-tools">
        <a class="icon-btn" href="${prefix}#/profiel" aria-label="Mijn profiel" title="Mijn profiel">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <circle cx="12" cy="8" r="4"></circle>
            <path d="M4 21a8 8 0 0 1 16 0"></path>
          </svg>
        </a>
        <a class="icon-btn" href="${prefix}installeren/" aria-label="Installeer EasyCodey als app" title="Installeer als app">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <rect x="3" y="3" width="18" height="18" rx="4"></rect>
            <path d="M12 7v7"></path>
            <path d="m9 11 3 3 3-3"></path>
            <path d="M8 17h8"></path>
          </svg>
        </a>
        <button class="icon-btn" type="button" id="static-theme" aria-label="Wissel licht/donker thema" title="Wissel thema">
          ${SUN_MOON}
        </button>
      </div>
    </div>
  </header>`;
}

function footer(prefix) {
  return `<footer class="site-footer">
    <div class="footer-inner">
      <p><strong>EasyCodey</strong> — leren door te bouwen. Geen account, geen reclame.</p>
      <p class="muted">Je voortgang en eigen projecten worden lokaal in je browser opgeslagen.</p>
      <p class="footer-actions">
        <a class="link-btn" href="${prefix}">🏠 Startpagina</a>
        <span aria-hidden="true">·</span>
        <a class="link-btn" href="${prefix}projecten/">📚 Alle projecten</a>
        <span aria-hidden="true">·</span>
        <a class="link-btn" href="${prefix}installeren/">📲 Installeren</a>
        <span aria-hidden="true">·</span>
        <a class="link-btn" href="${prefix}#/profiel">👤 Mijn profiel</a>
        <span aria-hidden="true">·</span>
        <a class="link-btn" href="${prefix}doneren/">♥ Doneren</a>
        <span aria-hidden="true">·</span>
        <a class="link-btn" href="${prefix}contact/">✉ Contact</a>
        <span aria-hidden="true">·</span>
        <a class="link-btn" href="${prefix}#/programmeren">⌨ Programmeer zelf</a>
      </p>
    </div>
  </footer>`;
}

const THEME_SCRIPT = `<script>
    (function () {
      var button = document.getElementById("static-theme");
      if (button) {
        button.addEventListener("click", function () {
          var root = document.documentElement;
          var next = root.dataset.theme === "dark" ? "light" : "dark";
          root.dataset.theme = next;
          var meta = document.querySelector('meta[name="theme-color"]');
          if (meta) meta.setAttribute("content", next === "dark" ? "#12110f" : "#f7f5ef");
          try {
            var raw = localStorage.getItem("easycodey.v1") || localStorage.getItem("easycode.v1");
            var state = raw ? JSON.parse(raw) : {};
            state.theme = next;
            localStorage.setItem("easycodey.v1", JSON.stringify(state));
          } catch (error) {}
        });
      }

      document.querySelectorAll("[data-copy-iban]").forEach(function (copyButton) {
        copyButton.addEventListener("click", function () {
          var value = copyButton.getAttribute("data-copy-iban") || "";
          var original = copyButton.textContent;
          var done = function () {
            copyButton.textContent = "Gekopieerd!";
            setTimeout(function () { copyButton.textContent = original; }, 1800);
          };
          var fallback = function () {
            var area = document.createElement("textarea");
            area.value = value;
            document.body.append(area);
            area.select();
            try { document.execCommand("copy"); } catch (error) {}
            area.remove();
            done();
          };
          if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(value).then(done, fallback);
          } else {
            fallback();
          }
        });
      });
    })();
  </script>`;

function renderCode(code) {
  if (!code) return "";
  return `<div class="code-block">
            <div class="code-head"><span class="code-lang">python</span></div>
            <pre><code>${esc(code)}</code></pre>
          </div>`;
}

function renderProjectPage(idea) {
  const prefix = "../../";
  const canonical = `${SITE}/idee/${idea.id}/`;
  const cover = `${SITE}/${coverFor(idea)}`;
  const meta = CATEGORY_META[idea.category] || { emoji: "🧰" };
  const categorySlug = slug(idea.category);
  const description = trim(
    `${idea.summary} ${idea.description} Leer het stap voor stap in EasyCodey met uitleg, code en tips.`,
    155
  );
  const title = `${idea.title} — Python-project — EasyCodey`;

  const steps = idea.steps
    .map(
      (step, index) => `<article class="static-step" id="stap-${index + 1}">
            <div class="static-step-head">
              <span class="step-num">Stap ${index + 1}</span>
              <h3 class="step-title">${esc(step.title)}</h3>
            </div>
            <p>${esc(step.text)}</p>
            ${renderCode(step.code)}
          </article>`
    )
    .join("\n          ");

  const next = idea.next
    .map((id) => IDEAS.find((item) => item.id === id))
    .filter(Boolean)
    .map(
      (item) => `<a class="next-item" href="../${item.id}/">
              <span class="next-emoji" aria-hidden="true">${esc(item.emoji)}</span>
              <span>${esc(item.title)}</span>
            </a>`
    )
    .join("\n            ");

  const learn = (idea.learn || [])
    .map((item) => `<span class="learn-item">${esc(item)}</span>`)
    .join("");

  const tips = idea.tips?.length
    ? `<section class="panel">
          <h2><span class="h2-num">4</span> Tips</h2>
          <ul class="tips">${idea.tips.map((tip) => `<li>${esc(tip)}</li>`).join("")}</ul>
        </section>`
    : "";

  const ld = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "LearningResource",
        name: idea.title,
        description: idea.summary,
        url: canonical,
        image: cover,
        inLanguage: "nl-NL",
        learningResourceType: "Project",
        educationalLevel: idea.level,
        teaches: idea.learn,
        timeRequired: `PT${minutesOf(idea)}M`,
        isAccessibleForFree: true,
        isPartOf: { "@type": "WebSite", name: "EasyCodey", url: `${SITE}/` },
        author: { "@type": "Organization", name: "EasyCodey", url: `${SITE}/` },
        offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" }
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "EasyCodey", item: `${SITE}/` },
          { "@type": "ListItem", position: 2, name: "Alle projecten", item: `${SITE}/projecten/` },
          { "@type": "ListItem", position: 3, name: idea.title, item: canonical }
        ]
      }
    ]
  };

  return `<!DOCTYPE html>
<html lang="nl">
<head>
  ${head({ title, description, canonical, image: cover, prefix, extraLd: ld })}
</head>
<body>
  <div class="page-glow" aria-hidden="true"></div>
  ${header(prefix)}

  <main id="main" class="static-main">
    <nav class="breadcrumb" aria-label="Kruimelpad">
      <a href="${prefix}">EasyCodey</a>
      <span aria-hidden="true">›</span>
      <a href="${prefix}projecten/">Alle projecten</a>
      <span aria-hidden="true">›</span>
      <a href="${prefix}projecten/#categorie-${categorySlug}">${esc(idea.category)}</a>
      <span aria-hidden="true">›</span>
      <span aria-current="page">${esc(idea.title)}</span>
    </nav>

    <article class="static-project">
      <header class="detail-hero static-hero">
        <div class="detail-cover">
          <img src="${prefix}${esc(coverFor(idea))}" alt="Omslagillustratie voor ${esc(idea.title)}" width="800" height="450" />
          <span class="detail-cover-emoji" aria-hidden="true">${esc(idea.emoji)}</span>
          <span class="detail-cover-cat">${esc(meta.emoji)} ${esc(idea.category)}</span>
        </div>
        <div class="detail-hero-body">
          <h1>${esc(idea.title)}</h1>
          <div class="detail-meta">
            <span class="meta-pill">${esc(meta.emoji)} ${esc(idea.category)}</span>
            <span class="meta-pill">🎚 ${esc(idea.level)}</span>
            <span class="meta-pill">⏱ ${esc(idea.time)}</span>
            <span class="meta-pill">${idea.steps.length} stappen</span>
          </div>
          <p class="detail-summary">${esc(idea.summary)}</p>
          <div class="static-actions">
            <a class="btn brand" href="${prefix}#/idee/${idea.id}?play=1">▶ Speel dit idee</a>
            <a class="btn ghost" href="${prefix}#/idee/${idea.id}">Open in EasyCodey</a>
            <a class="btn ghost" href="${prefix}#/programmeren?project=${idea.id}">⌨ Programmeer dit idee</a>
          </div>
          <p class="static-note">
            <strong>Speel dit idee</strong> opent de app en voert het volledige programma meteen uit.
            Je voortgang wordt lokaal in je browser bewaard.
            <br />
            <strong>Moet je iets typen?</strong> Vraagt dit project om invoer, dan verschijnt bovenaan je
            scherm een venster met een tekstvak (drie puntjes). Typ daar je antwoord en druk op
            <kbd>Enter</kbd>.
          </p>
        </div>
      </header>

      <div class="detail-grid">
        <div class="detail-main">
          <section class="panel">
            <h2><span class="h2-num">1</span> Waar gaat dit over?</h2>
            <p>${esc(idea.description)}</p>
          </section>

          <section class="panel">
            <h2><span class="h2-num">2</span> Wat leer je?</h2>
            <div class="learn-grid">${learn}</div>
          </section>

          <section class="panel">
            <h2><span class="h2-num">3</span> Stap voor stap</h2>
            <div class="steps static-steps">
          ${steps}
            </div>
          </section>

          ${tips}
        </div>

        <aside class="detail-side">
          <div class="side-card">
            <h3>Over dit project</h3>
            <div class="side-fact"><span>Categorie</span><strong>${esc(idea.category)}</strong></div>
            <div class="side-fact"><span>Niveau</span><strong>${esc(idea.level)}</strong></div>
            <div class="side-fact"><span>Tijdsduur</span><strong>${esc(idea.time)}</strong></div>
            <div class="side-fact"><span>Stappen</span><strong>${idea.steps.length}</strong></div>
          </div>

          ${
            next
              ? `<div class="side-card">
            <h3>Hierna doen</h3>
            <div class="next-list">
            ${next}
            </div>
          </div>`
              : ""
          }

          <div class="side-card static-side-cta">
            <h3>Zelf proberen</h3>
            <p>Open het project in de app, speel de code en vink je stappen af.</p>
            <a class="btn brand" href="${prefix}#/idee/${idea.id}?play=1">▶ Start dit project</a>
          </div>
        </aside>
      </div>
    </article>
  </main>

  ${footer(prefix)}
  ${THEME_SCRIPT}
</body>
</html>
`;
}

function renderOverviewPage() {
  const prefix = "../";
  const canonical = `${SITE}/projecten/`;
  const title = `Alle ${IDEAS.length} Python-projecten — EasyCodey`;
  const description = trim(
    `Blader door alle ${IDEAS.length} Nederlandstalige Python-projecten van EasyCodey: games, web, GUI, data, tools, security, wetenschap en meer. Met uitleg, code en een stappenplan.`,
    155
  );

  const groups = new Map();
  for (const idea of IDEAS) {
    if (!groups.has(idea.category)) groups.set(idea.category, []);
    groups.get(idea.category).push(idea);
  }

  const sections = [...groups.entries()]
    .map(([category, items]) => {
      const meta = CATEGORY_META[category] || { emoji: "🧰" };
      const list = items
        .map((idea) => {
          const search = [idea.title, idea.summary, idea.category, idea.level, ...(idea.learn || [])]
            .join(" ")
            .toLowerCase();
          return `<li data-search="${esc(search)}">
              <a href="../idee/${idea.id}/">
                <span class="sp-title"><span aria-hidden="true">${esc(idea.emoji)}</span>${esc(idea.title)}</span>
                <span class="sp-meta">${esc(idea.level)} · ${esc(idea.time)} · ${idea.steps.length} stappen</span>
                <span class="sp-summary">${esc(idea.summary)}</span>
              </a>
            </li>`;
        })
        .join("\n            ");

      return `<section class="static-category" id="categorie-${slug(category)}" data-category="${esc(category)}">
          <h2>${esc(meta.emoji)} ${esc(category)} <span class="count">${items.length}</span></h2>
          <ul class="static-project-list">
            ${list}
          </ul>
        </section>`;
    })
    .join("\n        ");

  const ld = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: title,
    description,
    url: canonical,
    inLanguage: "nl-NL",
    isPartOf: { "@type": "WebSite", name: "EasyCodey", url: `${SITE}/` },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: IDEAS.length,
      itemListElement: IDEAS.map((idea, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: idea.title,
        url: `${SITE}/idee/${idea.id}/`
      }))
    }
  };

  return `<!DOCTYPE html>
<html lang="nl">
<head>
  ${head({ title, description, canonical, image: `${SITE}/assets/covers/games.svg`, prefix, extraLd: ld })}
</head>
<body>
  <div class="page-glow" aria-hidden="true"></div>
  ${header(prefix)}

  <main id="main" class="static-main">
    <nav class="breadcrumb" aria-label="Kruimelpad">
      <a href="${prefix}">EasyCodey</a>
      <span aria-hidden="true">›</span>
      <span aria-current="page">Alle projecten</span>
    </nav>

    <header class="static-page-head">
      <p class="eyebrow">Projectbibliotheek</p>
      <h1>Alle ${IDEAS.length} Python-projecten</h1>
      <p class="static-lead">
        Elk project heeft uitleg, code, een stappenplan en tips. Kies een project en open het in de app
        om de code te spelen, je voortgang bij te houden of zelf verder te programmeren.
      </p>
      <div class="static-filter">
        <label for="project-filter">Zoek een project</label>
        <input id="project-filter" type="search" placeholder="Bijvoorbeeld: snake, webscraper, beginner" autocomplete="off" />
      </div>
    </header>

    <div id="project-list">
        ${sections}
    </div>
    <p id="no-results" class="static-empty" hidden>Geen projecten gevonden. Probeer een ander woord.</p>
  </main>

  ${footer(prefix)}
  ${THEME_SCRIPT}
  <script>
    (function () {
      var input = document.getElementById("project-filter");
      var empty = document.getElementById("no-results");
      var sections = [].slice.call(document.querySelectorAll(".static-category"));
      if (!input) return;
      function apply() {
        var query = (input.value || "").trim().toLowerCase();
        var total = 0;
        sections.forEach(function (section) {
          var items = [].slice.call(section.querySelectorAll("li"));
          var shown = 0;
          items.forEach(function (item) {
            var hit = !query || (item.getAttribute("data-search") || "").indexOf(query) !== -1;
            item.hidden = !hit;
            if (hit) shown += 1;
          });
          section.hidden = shown === 0;
          total += shown;
        });
        empty.hidden = total !== 0;
      }
      input.addEventListener("input", apply);
      input.addEventListener("search", apply);
    })();
  </script>
</body>
</html>
`;
}

function renderInstallPage() {
  const prefix = "../";
  const canonical = `${SITE}/installeren/`;
  const title = "EasyCodey installeren als app — Android, iPhone en computer";
  const description = trim(
    "Installeer EasyCodey gratis als app op je Android-telefoon, iPhone, iPad, computer of Chromebook. Eigen icoon, eigen venster en offline Python. Geen winkel of account nodig.",
    155
  );
  const qr = `${SITE}/assets/qr/easycodey-install.svg`;

  const ld = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "HowTo",
        name: "EasyCodey als app installeren",
        description,
        inLanguage: "nl-NL",
        totalTime: "PT2M",
        step: [
          {
            "@type": "HowToStep",
            position: 1,
            name: "Open EasyCodey",
            text: "Open https://yousefabujarad2014-beep.github.io/easycodey/ in Chrome of Safari."
          },
          {
            "@type": "HowToStep",
            position: 2,
            name: "Kies installeren",
            text: "Op Android: menu ⋮ → App installeren. Op iPhone: Deel → Zet op beginscherm. Op de computer: het installatie-icoon in de adresbalk."
          },
          {
            "@type": "HowToStep",
            position: 3,
            name: "Bevestig",
            text: "EasyCodey krijgt een eigen icoon en opent daarna in een eigen venster."
          }
        ]
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "EasyCodey", item: `${SITE}/` },
          { "@type": "ListItem", position: 2, name: "Installeren", item: canonical }
        ]
      }
    ]
  };

  return `<!DOCTYPE html>
<html lang="nl">
<head>
  ${head({ title, description, canonical, image: qr, prefix, extraLd: ld })}
</head>
<body>
  <div class="page-glow" aria-hidden="true"></div>
  ${header(prefix)}

  <main id="main" class="static-main">
    <nav class="breadcrumb" aria-label="Kruimelpad">
      <a href="${prefix}">EasyCodey</a>
      <span aria-hidden="true">›</span>
      <span aria-current="page">Installeren</span>
    </nav>

    <header class="static-page-head">
      <p class="eyebrow">Installeren</p>
      <h1>Zet EasyCodey op je apparaat</h1>
      <p class="static-lead">
        EasyCodey is een installeerbare webapp. Je krijgt een eigen icoon en een eigen venster,
        en na de eerste keer werkt de site ook offline. Geen app-store, account of download nodig.
      </p>
    </header>

    <div class="install-hero">
      <section class="panel install-qr">
        <h2>Scan met je telefoon</h2>
        <img src="${prefix}assets/qr/easycodey-install.svg" width="220" height="220" alt="QR-code die naar EasyCodey wijst" />
        <p>Open de camera of Google Lens, scan de code en open de link in Chrome of Safari.</p>
        <code>yousefabujarad2014-beep.github.io/easycodey</code>
      </section>
      <section class="panel install-highlights">
        <h2>Waarom als app?</h2>
        <ul class="tips">
          <li>Je eigen icoon op het startscherm of bureaublad.</li>
          <li>Een eigen venster zonder adresbalk.</li>
          <li>Werkt offline na één keer online gebruiken.</li>
          <li>Je voortgang en eigen projecten blijven bewaard.</li>
          <li>Gratis, zonder account en zonder reclame.</li>
        </ul>
        <div class="static-actions">
          <a class="btn brand" href="${prefix}">▶ Open EasyCodey</a>
          <a class="btn ghost" href="${prefix}projecten/">📚 Alle projecten</a>
        </div>
      </section>
    </div>

    <section class="panel install-section">
      <h2><span class="h2-num">1</span> Android (Chrome)</h2>
      <ol class="install-steps">
        <li>
          <strong>Open de site in Chrome</strong>
          Scan de QR-code of typ het adres in de adresbalk.
        </li>
        <li>
          <strong>Tik op het menu ⋮</strong>
          Kies <em>App installeren</em> of <em>Toevoegen aan startscherm</em>.
        </li>
        <li>
          <strong>Bevestig</strong>
          EasyCodey staat nu tussen je apps en opent in een eigen venster.
        </li>
      </ol>
      <p class="install-note">
        Verschijnt <strong>App installeren</strong> niet? Gebruik Chrome of Edge, geen in-app browser,
        en bezoek de site één keer online. Als laatste redmiddel werkt <em>Toevoegen aan startscherm</em> ook.
      </p>
    </section>

    <section class="panel install-section">
      <h2><span class="h2-num">2</span> iPhone of iPad (Safari)</h2>
      <ol class="install-steps">
        <li>
          <strong>Open de site in Safari</strong>
          Scan de QR-code of typ het adres in de adresbalk.
        </li>
        <li>
          <strong>Tik op Deel</strong>
          Dat is het vierkantje met het pijltje omhoog.
        </li>
        <li>
          <strong>Kies Zet op beginscherm</strong>
          Tik op <em>Voeg toe</em>. EasyCodey verschijnt op je beginscherm.
        </li>
      </ol>
      <p class="install-note">iOS toont geen installatieprompt; <em>Zet op beginscherm</em> is de juiste manier.</p>
    </section>

    <section class="panel install-section">
      <h2><span class="h2-num">3</span> Windows of macOS (Chrome of Edge)</h2>
      <ol class="install-steps">
        <li>
          <strong>Open de site</strong>
          Ga naar de live-URL in Chrome of Edge.
        </li>
        <li>
          <strong>Klik op het installatie-icoon</strong>
          Het staat rechts in de adresbalk, of gebruik het menu ⋮ → <em>App installeren</em>.
        </li>
        <li>
          <strong>Bevestig</strong>
          EasyCodey komt in het startmenu of in Launchpad en opent in een eigen venster.
        </li>
      </ol>
    </section>

    <section class="panel install-section">
      <h2><span class="h2-num">4</span> Chromebook (Chrome)</h2>
      <ol class="install-steps">
        <li>
          <strong>Open de site in Chrome</strong>
          Ga naar de live-URL.
        </li>
        <li>
          <strong>Kies Installeren</strong>
          Gebruik het installatie-icoon in de adresbalk of het menu ⋮ → <em>App installeren</em>.
        </li>
        <li>
          <strong>Open de app</strong>
          EasyCodey staat in het launcher-menu en werkt daarna ook offline.
        </li>
      </ol>
    </section>

    <section class="panel install-section">
      <h2><span class="h2-num">5</span> Wat werkt offline?</h2>
      <table class="offline-table">
        <thead>
          <tr><th>Onderdeel</th><th>Offline</th></tr>
        </thead>
        <tbody>
          <tr><td>Alle 161 projecten, uitleg, stappen en tips</td><td>✅</td></tr>
          <tr><td>Vaste projectpagina's en het overzicht</td><td>✅ na één keer online bezoek</td></tr>
          <tr><td>Voortgang, thema en eigen projecten</td><td>✅</td></tr>
          <tr><td>Python-speelveld en editor</td><td>✅ na de eerste keer online</td></tr>
          <tr><td>Offline AI-coach</td><td>✅</td></tr>
          <tr><td>Online AI-coach (OpenAI)</td><td>❌ internet nodig</td></tr>
          <tr><td>Doneren per bank</td><td>❌ internet nodig</td></tr>
        </tbody>
      </table>
      <p class="static-note">
        De service worker bewaart de app bij de eerste installatie. De Python-runtime (ongeveer 10 MB)
        wordt bewaard zodra je hem één keer gebruikt. Daarna werken <strong>▶ Speel</strong>,
        <strong>▶ Speel dit idee</strong> en de editor ook zonder internet.
      </p>
    </section>

    <section class="panel install-section">
      <h2><span class="h2-num">6</span> Hulp nodig?</h2>
      <ul class="tips">
        <li>Gebruik Chrome, Edge of Safari. Firefox en in-app browsers ondersteunen installeren minder goed.</li>
        <li>Sluit incognito en open de site in een normaal tabblad.</li>
        <li>Installeer altijd via de beveiligde link <strong>https://yousefabujarad2014-beep.github.io/easycodey/</strong>, niet via een lokaal bestand of een oude snelkoppeling.</li>
        <li>Zie je een melding over een onveilige of oude versie? Open de site online en gebruik <strong>App bijwerken</strong> in het installatievenster. De nieuwste versie wordt dan opnieuw opgehaald.</li>
        <li>Bezoek de site één keer online en wacht een paar seconden, zodat de service worker klaar is.</li>
        <li>Werk je browser bij via de Play Store of App Store en herstart hem.</li>
        <li>Je voortgang staat per apparaat en per browser. Maak een optioneel profiel voor meerdere gebruikers op hetzelfde apparaat, of gebruik een back-up om je voortgang te verhuizen.</li>
      </ul>
      <div class="static-actions">
        <a class="btn brand" href="${prefix}">▶ Open EasyCodey</a>
        <a class="btn ghost" href="${prefix}projecten/">📚 Alle projecten</a>
      </div>
    </section>
  </main>

  ${footer(prefix)}
  ${THEME_SCRIPT}
</body>
</html>
`;
}

function renderContactPage() {
  const prefix = "../";
  const canonical = `${SITE}/contact/`;
  const title = "Contact — EasyCodey";
  const description = trim(
    `Vragen, feedback of een idee voor EasyCodey? Mail ${CONTACT_EMAIL}, stuur een WhatsApp of bel ${CONTACT_PHONE_DISPLAY}.`,
    155
  );
  const whatsappHref = `${CONTACT_WHATSAPP}?text=${encodeURIComponent("Hallo EasyCodey, ik heb een vraag.")}`;
  const mailHref = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("EasyCodey")}`;

  const ld = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ContactPage",
        name: title,
        description,
        url: canonical,
        inLanguage: "nl-NL",
        isPartOf: { "@type": "WebSite", name: "EasyCodey", url: `${SITE}/` }
      },
      {
        "@type": "Organization",
        name: "EasyCodey",
        url: `${SITE}/`,
        email: CONTACT_EMAIL,
        contactPoint: [
          {
            "@type": "ContactPoint",
            contactType: "customer support",
            telephone: CONTACT_PHONE_TEL,
            email: CONTACT_EMAIL,
            availableLanguage: ["nl", "en"]
          }
        ]
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "EasyCodey", item: `${SITE}/` },
          { "@type": "ListItem", position: 2, name: "Contact", item: canonical }
        ]
      }
    ]
  };

  return `<!DOCTYPE html>
<html lang="nl">
<head>
  ${head({ title, description, canonical, image: `${SITE}/assets/icons/icon-512.png`, prefix, extraLd: ld })}
</head>
<body>
  <div class="page-glow" aria-hidden="true"></div>
  ${header(prefix)}

  <main id="main" class="static-main">
    <nav class="breadcrumb" aria-label="Kruimelpad">
      <a href="${prefix}">Home</a>
      <span aria-hidden="true">›</span>
      <span aria-current="page">Contact</span>
    </nav>

    <header class="static-page-head">
      <p class="eyebrow">Contact</p>
      <h1>Neem contact op</h1>
      <p class="static-lead">
        Heb je een vraag, vond je een fout of heb je een idee voor een nieuw project?
        Ik hoor het graag. Kies hieronder hoe je me wilt bereiken.
      </p>
    </header>

    <div class="contact-grid">
      <a class="panel contact-card contact-whatsapp" href="${esc(whatsappHref)}" target="_blank" rel="noopener">
        <span class="contact-icon" aria-hidden="true">💬</span>
        <h2>WhatsApp</h2>
        <p>Snel een berichtje sturen. Het liefst met je vraag of een link naar het project.</p>
        <span class="contact-value">${esc(CONTACT_PHONE_DISPLAY)}</span>
      </a>

      <a class="panel contact-card" href="tel:${esc(CONTACT_PHONE_TEL)}">
        <span class="contact-icon" aria-hidden="true">📞</span>
        <h2>Bellen of sms'en</h2>
        <p>Liever even praten? Je kunt bellen of een sms sturen tijdens normale uren.</p>
        <span class="contact-value">${esc(CONTACT_PHONE_DISPLAY)}</span>
      </a>

      <a class="panel contact-card" href="${esc(mailHref)}">
        <span class="contact-icon" aria-hidden="true">✉️</span>
        <h2>E-mail</h2>
        <p>Voor langere vragen, feedback of samenwerkingen. Je krijgt zo snel mogelijk antwoord.</p>
        <span class="contact-value">${esc(CONTACT_EMAIL)}</span>
      </a>
    </div>

    <section class="panel install-section">
      <h2><span class="h2-num">1</span> Waar kan ik mee helpen?</h2>
      <ul class="tips">
        <li>Een fout of iets dat niet werkt op de website of in de app.</li>
        <li>Een idee voor een nieuw Python-project of een betere uitleg.</li>
        <li>Een vraag over een project, de editor of het installeren van de app.</li>
        <li>Een samenwerking, gastles of vraag over donaties.</li>
      </ul>
    </section>

    <section class="panel install-section">
      <h2><span class="h2-num">2</span> Goed om te weten</h2>
      <ul class="tips">
        <li>Ik antwoord meestal binnen één tot twee werkdagen.</li>
        <li>Vermeld bij een fout je browser, je apparaat en het project waar het om gaat.</li>
        <li>Je gegevens worden alleen gebruikt om je bericht te beantwoorden.</li>
        <li>EasyCodey is gratis en heeft geen account nodig.</li>
      </ul>
      <div class="static-actions">
        <a class="btn brand" href="${prefix}">▶ Open EasyCodey</a>
        <a class="btn ghost" href="${prefix}projecten/">📚 Alle projecten</a>
        <a class="btn ghost" href="${prefix}installeren/">📲 Installeren</a>
      </div>
    </section>
  </main>

  ${footer(prefix)}
  ${THEME_SCRIPT}
</body>
</html>
`;
}

function renderDonatePage() {
  const prefix = "../";
  const canonical = `${SITE}/doneren/`;
  const title = "Doneren — Steun EasyCodey";
  const description = trim(
    `Steun EasyCodey met een vrijwillige overschrijving naar IBAN ${DONATE_IBAN} op naam van ${DONATE_NAME} bij ${DONATE_BANK}. Zo blijft de site gratis en advertentievrij.`,
    155
  );

  const ld = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: title,
        description,
        url: canonical,
        inLanguage: "nl-NL",
        isPartOf: { "@type": "WebSite", name: "EasyCodey", url: `${SITE}/` }
      },
      {
        "@type": "DonateAction",
        name: "Doneer aan EasyCodey",
        description: "Vrijwillige donatie per bankoverschrijving.",
        url: canonical,
        recipient: {
          "@type": "Organization",
          name: "EasyCodey",
          url: `${SITE}/`
        }
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "EasyCodey", item: `${SITE}/` },
          { "@type": "ListItem", position: 2, name: "Doneren", item: canonical }
        ]
      }
    ]
  };

  return `<!DOCTYPE html>
<html lang="nl">
<head>
  ${head({ title, description, canonical, image: `${SITE}/assets/icons/icon-512.png`, prefix, extraLd: ld })}
</head>
<body>
  <div class="page-glow" aria-hidden="true"></div>
  ${header(prefix)}

  <main id="main" class="static-main">
    <nav class="breadcrumb" aria-label="Kruimelpad">
      <a href="${prefix}">Home</a>
      <span aria-hidden="true">›</span>
      <span aria-current="page">Doneren</span>
    </nav>

    <header class="static-page-head">
      <p class="eyebrow">Doneren</p>
      <h1>Steun EasyCodey</h1>
      <p class="static-lead">
        EasyCodey is gratis en blijft gratis: geen account, geen advertenties en geen verkoop van gegevens.
        Een vrijwillige donatie helpt om de site online te houden, het domein te betalen en nieuwe projecten te maken.
      </p>
    </header>

    <div class="donate-hero">
      <section class="panel">
        <h2>Waarom doneren?</h2>
        <p>
          Alle 161 projecten, de uitleg, de programmeer-editor en de app zijn voor iedereen toegankelijk.
          Er zit geen abonnement achter en je hoeft niets te kopen. Doneren is dus echt vrijwillig.
        </p>
        <ul class="tips">
          <li>De site blijft gratis voor iedereen, ook zonder donatie.</li>
          <li>Geen advertenties, geen tracking en geen verkoop van gegevens.</li>
          <li>Nieuwe projecten, uitleg en tests kosten tijd en soms een klein bedrag.</li>
          <li>Een donatie geeft geen extra functies of voorrang.</li>
        </ul>
        <div class="donate-amounts" aria-label="Voorbeelden van bedragen">
          <span class="donate-amount">€3</span>
          <span class="donate-amount">€5</span>
          <span class="donate-amount">€10</span>
          <span class="donate-amount">€25</span>
        </div>
        <p class="static-note">Kies zelf een bedrag. Ook €1 is welkom. Je kunt één keer of maandelijks overschrijven.</p>
      </section>

      <section class="panel">
        <h2>Rechtstreeks overschrijven</h2>
        <div class="donate-iban">
          <p class="donate-iban-label">IBAN</p>
          <div class="donate-iban-row">
            <code class="donate-iban-value">${esc(DONATE_IBAN)}</code>
            <button class="btn ghost tiny" type="button" data-copy-iban="${esc(DONATE_IBAN)}">Kopieer IBAN</button>
          </div>
          <p class="donate-bank"><strong>${esc(DONATE_BANK)}</strong> · ${esc(DONATE_NAME)}</p>
          <p class="donate-bank">BIC: <strong>${esc(DONATE_BIC)}</strong></p>
          <p class="donate-bank">Mededeling: <strong>EasyCodey donatie</strong></p>
        </div>
        <p class="static-note">
          Je overschrijving loopt rechtstreeks via jouw bank. EasyCodey verwerkt zelf geen betalingen
          en bewaart geen betaalgegevens.
        </p>
      </section>
    </div>

    <section class="panel install-section">
      <h2><span class="h2-num">1</span> Zo doneer je in 4 stappen</h2>
      <ol class="donate-steps">
        <li>Open de app van je bank en kies <strong>Overschrijven</strong> of <strong>Nieuwe betaling</strong>.</li>
        <li>Vul het IBAN <strong>${esc(DONATE_IBAN)}</strong> in. De naam van de rekeninghouder is <strong>${esc(DONATE_NAME)}</strong>.</li>
        <li>Vul zelf een bedrag in en zet eventueel <strong>EasyCodey donatie</strong> als mededeling.</li>
        <li>Controleer de gegevens en bevestig met je bankapp of kaartlezer.</li>
      </ol>
      <p class="static-note">Je bank bevestigt de overschrijving. Bewaar die bevestiging als bewijs voor jezelf.</p>
    </section>

    <section class="panel install-section">
      <h2><span class="h2-num">2</span> Waar gaat je geld naartoe?</h2>
      <table class="offline-table">
        <thead>
          <tr><th>Doel</th><th>Uitleg</th></tr>
        </thead>
        <tbody>
          <tr><td>Website online houden</td><td>GitHub Pages host de site gratis. Donaties betalen dus geen dure servers.</td></tr>
          <tr><td>Eigen domein</td><td>Optioneel: <strong>easycodey.com</strong>, zodat je alleen "EasyCodey" hoeft te typen.</td></tr>
          <tr><td>Ontwikkeling</td><td>Nieuwe projecten, uitleg, tests en onderhoud van de code.</td></tr>
          <tr><td>App en offline werking</td><td>Iconen, service worker en lokale opslag blijven gratis voor iedereen.</td></tr>
        </tbody>
      </table>
    </section>

    <section class="panel install-section">
      <h2><span class="h2-num">3</span> Transparantie</h2>
      <ul class="tips">
        <li>Donaties zijn vrijwillig. Je kunt EasyCodey gratis blijven gebruiken, met of zonder donatie.</li>
        <li>Er is geen automatische incasso en geen abonnement. Jij kiest zelf of en wanneer je overschrijft.</li>
        <li>De site verwerkt geen betalingen en bewaart geen IBAN-, kaart- of betaalgegevens van bezoekers.</li>
        <li>Er is geen tegenprestatie: je krijgt geen extra functies, geen reclame verwijderd en geen fiscaal attest.</li>
        <li>EasyCodey is geen vzw, stichting of erkend goed doel. Het is een persoonlijk project van ${esc(DONATE_NAME)}.</li>
        <li>De naam en het IBAN staan openbaar op deze pagina. Dat is nodig om te kunnen overschrijven.</li>
        <li>Een donatie wordt niet automatisch terugbetaald. Stuur een bericht als er iets misgaat.</li>
      </ul>
    </section>

    <section class="panel install-section">
      <h2><span class="h2-num">4</span> Veelgestelde vragen</h2>
      <div class="donate-faq">
        <details>
          <summary>Is EasyCodey echt gratis?</summary>
          <p>Ja. Alle projecten, de editor en de app zijn gratis. Er is geen account en geen betaalmuur.</p>
        </details>
        <details>
          <summary>Moet ik doneren?</summary>
          <p>Nee. Een donatie is volledig vrijwillig. De site blijft voor iedereen werken.</p>
        </details>
        <details>
          <summary>Kan ik maandelijks doneren?</summary>
          <p>Ja, via een doorlopende opdracht of periodieke overschrijving in je eigen bankapp. De site stelt dat niet automatisch in.</p>
        </details>
        <details>
          <summary>Krijg ik een bevestiging of factuur?</summary>
          <p>De bevestiging van je bank is je bewijs. EasyCodey stuurt geen aparte factuur.</p>
        </details>
        <details>
          <summary>Waarom staat er een persoonlijke naam?</summary>
          <p>EasyCodey is een persoonlijk project. De rekening staat op naam van ${esc(DONATE_NAME)}.</p>
        </details>
        <details>
          <summary>Is mijn donatie aftrekbaar?</summary>
          <p>Nee. EasyCodey is geen erkende vzw of goed doel, dus je krijgt geen fiscaal attest.</p>
        </details>
        <details>
          <summary>Wat als ik per ongeluk te veel heb gestuurd?</summary>
          <p>Stuur een bericht via de contactpagina. We bekijken samen wat er mogelijk is.</p>
        </details>
      </div>
    </section>

    <div class="static-actions">
      <a class="btn brand" href="${prefix}">▶ Open EasyCodey</a>
      <a class="btn ghost" href="${prefix}contact/">✉ Stel een vraag</a>
      <a class="btn ghost" href="${prefix}projecten/">📚 Alle projecten</a>
    </div>
  </main>

  ${footer(prefix)}
  ${THEME_SCRIPT}
</body>
</html>
`;
}

function writeFile(file, content) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content, "utf8");
}

function cleanStaleProjects(validIds) {
  if (!fs.existsSync(IDEAS_DIR)) return 0;
  let removed = 0;
  for (const entry of fs.readdirSync(IDEAS_DIR, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    if (!validIds.has(entry.name)) {
      fs.rmSync(path.join(IDEAS_DIR, entry.name), { recursive: true, force: true });
      removed += 1;
    }
  }
  return removed;
}

const validIds = new Set(IDEAS.map((idea) => idea.id));
const removed = cleanStaleProjects(validIds);

for (const idea of IDEAS) {
  writeFile(path.join(IDEAS_DIR, idea.id, "index.html"), renderProjectPage(idea));
}

writeFile(path.join(OVERVIEW_DIR, "index.html"), renderOverviewPage());
writeFile(path.join(INSTALL_DIR, "index.html"), renderInstallPage());
writeFile(path.join(CONTACT_DIR, "index.html"), renderContactPage());
writeFile(path.join(DONATE_DIR, "index.html"), renderDonatePage());

const urls = [
  { loc: `${SITE}/`, priority: "1.0", changefreq: "weekly" },
  { loc: `${SITE}/projecten/`, priority: "0.9", changefreq: "weekly" },
  { loc: `${SITE}/installeren/`, priority: "0.7", changefreq: "monthly" },
  { loc: `${SITE}/contact/`, priority: "0.6", changefreq: "yearly" },
  { loc: `${SITE}/doneren/`, priority: "0.6", changefreq: "yearly" },
  ...IDEAS.map((idea) => ({
    loc: `${SITE}/idee/${idea.id}/`,
    priority: "0.8",
    changefreq: "monthly"
  }))
];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${BUILD_DATE}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>
`;

writeFile(path.join(root, "sitemap.xml"), sitemap);

console.log(`Projectpagina's: ${IDEAS.length}`);
console.log(`Overzicht:       projecten/index.html`);
console.log(`Installeren:     installeren/index.html`);
console.log(`Contact:         contact/index.html`);
console.log(`Doneren:         doneren/index.html`);
console.log(`Sitemap:         ${urls.length} URL's`);
if (removed) console.log(`Opgeruimd:       ${removed} verouderde projectmap(pen)`);
