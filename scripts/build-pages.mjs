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
const BUILD_DATE = new Date().toISOString().slice(0, 10);
const IDEAS_DIR = path.join(root, "idee");
const OVERVIEW_DIR = path.join(root, "projecten");

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
  <meta name="theme-color" content="#f7f5ef" />
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}" />
  <meta name="robots" content="index, follow, max-image-preview:large" />
  <meta name="author" content="EasyCodey" />
  <link rel="canonical" href="${esc(canonical)}" />
  <link rel="manifest" href="${prefix}manifest.webmanifest" />
  <link rel="apple-touch-icon" href="${prefix}assets/icons/apple-touch-icon.png" />
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
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="${prefix}styles.css" />
  <script>
    (function () {
      try {
        var raw = localStorage.getItem("easycodey.v1") || localStorage.getItem("easycode.v1");
        var stored = raw ? JSON.parse(raw).theme : null;
        var dark = stored === "dark" || (!stored && window.matchMedia("(prefers-color-scheme: dark)").matches);
        document.documentElement.dataset.theme = dark ? "dark" : "light";
        var meta = document.querySelector('meta[name="theme-color"]');
        if (meta) meta.setAttribute("content", dark ? "#0c0c0e" : "#f7f5ef");
      } catch (error) {}
    })();
  </script>`;
}

function header(prefix) {
  return `<a class="skip-link" href="#main">Naar de inhoud</a>
  <header class="site-header">
    <div class="header-inner">
      <a class="logo" href="${prefix}" aria-label="EasyCodey home">
        <span class="logo-mark">🐍</span>
        <span class="logo-text">Easy<strong>Codey</strong></span>
      </a>
      <nav class="main-nav" aria-label="Hoofdnavigatie">
        <a href="${prefix}">Ideeën</a>
        <a href="${prefix}#/leerpad">Leerpad</a>
        <a href="${prefix}#/programmeren">Programmeren</a>
        <a href="${prefix}#/mijn-ideeen">Mijn ideeën</a>
      </nav>
      <div class="header-tools">
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
        <a class="link-btn" href="${prefix}#/programmeren">⌨ Programmeer zelf</a>
      </p>
    </div>
  </footer>`;
}

const THEME_SCRIPT = `<script>
    (function () {
      var button = document.getElementById("static-theme");
      if (!button) return;
      button.addEventListener("click", function () {
        var root = document.documentElement;
        var next = root.dataset.theme === "dark" ? "light" : "dark";
        root.dataset.theme = next;
        var meta = document.querySelector('meta[name="theme-color"]');
        if (meta) meta.setAttribute("content", next === "dark" ? "#0c0c0e" : "#f7f5ef");
        try {
          var raw = localStorage.getItem("easycodey.v1") || localStorage.getItem("easycode.v1");
          var state = raw ? JSON.parse(raw) : {};
          state.theme = next;
          localStorage.setItem("easycodey.v1", JSON.stringify(state));
        } catch (error) {}
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

const urls = [
  { loc: `${SITE}/`, priority: "1.0", changefreq: "weekly" },
  { loc: `${SITE}/projecten/`, priority: "0.9", changefreq: "weekly" },
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
console.log(`Sitemap:         ${urls.length} URL's`);
if (removed) console.log(`Opgeruimd:       ${removed} verouderde projectmap(pen)`);
