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

/* Donatiegegevens komen uit site-config.json, zodat er maar één bron van
   waarheid is. Ontbreekt een waarde, dan blijft de bekende standaard gelden. */
const siteConfig = (() => {
  try {
    return JSON.parse(fs.readFileSync(path.join(root, "site-config.json"), "utf8"));
  } catch {
    return {};
  }
})();
const configValue = (value, fallback) => String(value || "").trim() || fallback;
const DONATE_IBAN = configValue(siteConfig.donateIban, "BE69 0638 3621 2278");
const DONATE_NAME = configValue(siteConfig.donateName, "Yousef Abujarad (EasyCodey)");
const DONATE_BANK = configValue(siteConfig.donateBank, "Belfius");
const DONATE_BIC = "GKCCBEBB";
const BUILD_DATE = new Date().toISOString().slice(0, 10);
const IDEAS_DIR = path.join(root, "idee");
const OVERVIEW_DIR = path.join(root, "projecten");
const INSTALL_DIR = path.join(root, "installeren");
const CONTACT_DIR = path.join(root, "contact");
const DONATE_DIR = path.join(root, "doneren");
const PRIVACY_DIR = path.join(root, "privacy");
const DOWNLOAD_DIR = path.join(root, "download");
const APK_FILE = "EasyCodey-1.0.0.apk";
const APK_VERSION = "1.0.0";
const APK_VERSION_CODE = 1;
const APK_SHA256 = "9F11E9E0D4F9CC68ADC088103A89B99BDD79DB804CA6E8A6CE1C88386B2F872F";
const APK_PATH = path.join(DOWNLOAD_DIR, APK_FILE);
const APK_BYTES = fs.existsSync(APK_PATH) ? fs.statSync(APK_PATH).size : 0;
const APK_SIZE = APK_BYTES
  ? `${(APK_BYTES / (1024 * 1024)).toFixed(2).replace(".", ",")} MB`
  : "onbekend";

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
      <p><strong>EasyCodey</strong> — leren door te bouwen. Optioneel account, geen reclame.</p>
      <p class="muted">Je voortgang en eigen projecten worden lokaal in je browser opgeslagen.</p>
      <p class="footer-trust">
        <span class="trust-dot" aria-hidden="true"></span>
        <span id="footer-security">Beveiligde verbinding</span>
        <span aria-hidden="true">·</span>
        <span>Geen advertenties of trackers</span>
        <span aria-hidden="true">·</span>
        <span>Je gegevens blijven op dit apparaat</span>
      </p>
      <p class="footer-actions">
        <a class="link-btn" href="${prefix}">🏠 Startpagina</a>
        <span aria-hidden="true">·</span>
        <a class="link-btn" href="${prefix}projecten/">📚 Alle projecten</a>
        <span aria-hidden="true">·</span>
        <a class="link-btn" href="${prefix}installeren/">📲 Installeren</a>
        <span aria-hidden="true">·</span>
        <a class="link-btn" href="${prefix}download/">⬇ Android-app</a>
        <span aria-hidden="true">·</span>
        <a class="link-btn" href="${prefix}#/profiel">👤 Mijn profiel</a>
        <span aria-hidden="true">·</span>
        <a class="link-btn" href="${prefix}doneren/">♥ Doneren</a>
        <span aria-hidden="true">·</span>
        <a class="link-btn" href="${prefix}contact/">✉ Contact</a>
        <span aria-hidden="true">·</span>
        <a class="link-btn" href="${prefix}privacy/">🔒 Privacy</a>
        <span aria-hidden="true">·</span>
        <a class="link-btn" href="${prefix}#/eigenaar">🔑 Beheer</a>
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

      var security = document.getElementById("footer-security");
      if (security) {
        var secure = location.protocol === "https:";
        security.textContent = secure ? "Beveiligde HTTPS-verbinding" : "Lokale ontwikkelversie";
        security.title = secure
          ? "Je verbinding met EasyCodey is versleuteld."
          : "Je bekijkt de lokale versie. De live app gebruikt HTTPS.";
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

      // Vangnet: als de preview-module niet laadt, tonen we de volledige code
      // en zorgen we dat de App/Code-tabs toch blijven werken.
      var projectView = document.querySelector("[data-project-view]");
      if (projectView) {
        var setProjectView = function (mode) {
          var isCode = mode === "code";
          projectView.classList.toggle("is-app", !isCode);
          projectView.classList.toggle("is-code", isCode);
          projectView.querySelectorAll("[data-view-tab]").forEach(function (tab) {
            var active = tab.getAttribute("data-view-tab") === mode;
            tab.classList.toggle("is-active", active);
            tab.setAttribute("aria-selected", String(active));
            tab.tabIndex = active ? 0 : -1;
          });
        };
        window.setTimeout(function () {
          var stage = projectView.querySelector("[data-preview-stage]");
          if (stage && stage.getAttribute("data-mounted") === "1") return;
          setProjectView("code");
          var hint = projectView.querySelector("[data-view-hint]");
          if (hint) hint.textContent = "De demo kon niet laden. Je ziet nu de volledige code.";
          projectView.addEventListener("click", function (event) {
            var tab = event.target.closest("[data-view-tab]");
            if (!tab) return;
            setProjectView(tab.getAttribute("data-view-tab") === "code" ? "code" : "app");
          });
        }, 4000);
      }
    })();
  </script>`;

function renderCode(code) {
  if (!code) return "";
  return `<div class="code-block project-code-only">
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
            <a class="btn brand" href="#project-view">▶ Speel dit idee</a>
            <a class="btn ghost" href="${prefix}#/idee/${idea.id}">Open in EasyCodey</a>
          </div>
          <p class="static-note">
            <strong>Speel dit idee</strong> opent de speelbare app hieronder.
            <strong>Gebruik dit idee</strong> toont alle code.
            Je voortgang wordt lokaal in je browser bewaard.
            <br />
            <strong>Moet je iets typen?</strong> Vraagt dit project om invoer, dan verschijnt bovenaan je
            scherm een venster met de vraag en een tekstvak. Typ daar je antwoord en druk op
            <kbd>Enter</kbd>.
          </p>
        </div>
      </header>

      <section class="project-view is-app" id="project-view" data-project-view data-idea-id="${esc(idea.id)}">
        <div class="project-view-bar">
          <div class="view-tabs" role="tablist" aria-label="Weergave">
            <button type="button" class="view-tab is-active" role="tab" aria-selected="true" data-view-tab="app">▶ Speel dit idee</button>
            <button type="button" class="view-tab" role="tab" aria-selected="false" tabindex="-1" data-view-tab="code">⌨ Gebruik dit idee</button>
          </div>
          <div class="view-extras">
            <a class="btn brand" href="${prefix}#/programmeren?project=${idea.id}">⌨ Programmeer zelf</a>
            <a class="btn ghost" href="${prefix}#/idee/${idea.id}?play=1">▶ Voer de echte code uit</a>
          </div>
        </div>
        <p class="view-hint" data-view-hint>Kies <strong>▶ Speel dit idee</strong> voor de app, of <strong>⌨ Gebruik dit idee</strong> voor alle code.</p>
        <div class="preview-panel" data-view-panel="app">
          <div class="preview-stage" data-preview-stage>
            <div class="preview-fallback">
              <span class="preview-fallback-emoji" aria-hidden="true">${esc(idea.emoji)}</span>
              <strong>${esc(idea.title)}</strong>
              <p>${esc(idea.summary)}</p>
            </div>
          </div>
          <p class="preview-caption"><strong>Dit is de app-weergave.</strong> Speel de demo of kies <em>⌨ Gebruik dit idee</em> voor alle code en uitleg.</p>
        </div>

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
      </section>
    </article>
  </main>

  ${footer(prefix)}
  <noscript><style>.project-view.is-app .project-code-only{display:block}.project-view .preview-panel{display:none}</style></noscript>
  <script type="module" src="${prefix}js/previews.js"></script>
  ${SITE_TRACKING(prefix)}
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
  ${SITE_TRACKING(prefix)}
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

function renderDownloadPage() {
  const prefix = "../";
  const canonical = `${SITE}/download/`;
  const apkUrl = `${SITE}/download/${APK_FILE}`;
  const title = "Download EasyCodey voor Android (APK) — gratis";
  const description = trim(
    `Download de gratis Android-app van EasyCodey als APK. Versie ${APK_VERSION}, ${APK_SIZE}, geen Google Play-account nodig. Controleer de SHA-256 en installeer veilig.`,
    155
  );

  const ld = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        name: "EasyCodey",
        operatingSystem: "Android 7.0 of nieuwer",
        applicationCategory: "EducationalApplication",
        softwareVersion: APK_VERSION,
        fileSize: String(APK_BYTES || ""),
        downloadUrl: apkUrl,
        installUrl: canonical,
        inLanguage: "nl",
        offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
        publisher: { "@type": "Person", name: "Yousef Abujarad" },
        description:
          "Leer Python met 161 projecten, een editor en een coach. Gratis, privé en offline na de eerste keer laden."
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "EasyCodey", item: `${SITE}/` },
          { "@type": "ListItem", position: 2, name: "Download", item: canonical }
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
      <a href="${prefix}">EasyCodey</a>
      <span aria-hidden="true">›</span>
      <span aria-current="page">Download</span>
    </nav>

    <header class="static-page-head">
      <p class="eyebrow">Android-app</p>
      <h1>Download EasyCodey voor Android</h1>
      <p class="static-lead">
        De echte Android-app, zonder Google Play en zonder account. Gratis, ${esc(
          APK_SIZE
        )}, versie ${esc(APK_VERSION)}. Je krijgt een eigen icoon, een eigen venster en al je
        voortgang blijft lokaal bewaard.
      </p>
    </header>

    <div class="install-hero">
      <section class="panel install-qr download-card">
        <span class="download-emoji" aria-hidden="true">🤖</span>
        <h2>EasyCodey ${esc(APK_VERSION)}</h2>
        <p>Android 7.0 of nieuwer · ${esc(APK_SIZE)}</p>
        <a class="btn brand btn-block" href="${prefix}download/${esc(APK_FILE)}" download>⬇ Download de APK</a>
        <p class="static-note">
          Alleen van deze officiële pagina downloaden. Controleer hieronder de SHA-256.
        </p>
        <div class="download-qr">
          <img
            src="${prefix}assets/qr/easycodey-download.svg"
            width="150"
            height="150"
            alt="QR-code die naar deze downloadpagina wijst"
            loading="lazy"
          />
          <p>
            <strong>Op je telefoon?</strong> Scan de code met je camera en download daar. Op dit
            toestel kun je gewoon de knop hierboven gebruiken.
          </p>
        </div>
      </section>
      <section class="panel install-highlights">
        <h2>Waarom deze download?</h2>
        <ul class="tips">
          <li>Werkt zonder Google Play-account en zonder betaling.</li>
          <li>Eigen icoon en volledig scherm, net als een store-app.</li>
          <li>De inhoud en projecten blijven automatisch actueel via de website.</li>
          <li>Je voortgang, profielen en editor-code blijven op je toestel.</li>
          <li>Geen advertenties, geen trackers en geen verplicht account.</li>
        </ul>
        <div class="static-actions">
          <a class="btn ghost" href="${prefix}installeren/">📲 Liever als webapp</a>
          <a class="btn ghost" href="${prefix}projecten/">📚 Alle projecten</a>
        </div>
      </section>
    </div>

    <section class="panel install-section">
      <h2><span class="h2-num">1</span> Bestandsgegevens</h2>
      <dl class="download-meta">
        <div><dt>Versie</dt><dd>${esc(APK_VERSION)} (versionCode ${APK_VERSION_CODE})</dd></div>
        <div><dt>Grootte</dt><dd>${esc(APK_SIZE)}</dd></div>
        <div><dt>Pakketnaam</dt><dd><code>be.easycodey.app</code></dd></div>
        <div><dt>Android</dt><dd>7.0 of nieuwer</dd></div>
        <div class="download-meta-wide">
          <dt>SHA-256</dt>
          <dd><code class="download-hash">${esc(APK_SHA256)}</code></dd>
        </div>
      </dl>
    </section>

    <section class="panel install-section">
      <h2><span class="h2-num">2</span> Zo installeer je de app</h2>
      <ol class="install-steps">
        <li>
          <strong>Tik op de downloadknop</strong>
          De APK komt in de map <em>Downloads</em> van je telefoon. Chrome kan één keer vragen of je
          het bestand wilt bewaren: kies <em>Downloaden</em>.
        </li>
        <li>
          <strong>Open het gedownloade bestand</strong>
          Tik op de melding of open <em>Downloads</em> in je browser en tik op
          <code>${esc(APK_FILE)}</code>.
        </li>
        <li>
          <strong>Sta installatie toe</strong>
          Android vraagt om toestemming: <em>Instellingen → Toestaan vanuit deze bron</em>. Daarna kun
          je terug en op <em>Installeren</em> tikken.
        </li>
        <li>
          <strong>Bevestig bij Play Protect</strong>
          Zie je “App geblokkeerd” of een waarschuwing? Tik op <em>Meer details</em> en daarna op
          <em>Toch installeren</em>. De app is ondertekend en bevat geen advertenties.
        </li>
        <li>
          <strong>Open EasyCodey</strong>
          Het icoon staat nu op je startscherm. De eerste keer heb je internet nodig; daarna werkt de
          app ook offline.
        </li>
      </ol>
    </section>

    <section class="panel install-section">
      <h2><span class="h2-num">3</span> Controleer de download</h2>
      <p class="static-lead">
        Wil je zeker weten dat het bestand klopt? Vergelijk de SHA-256 met de waarde hierboven.
      </p>
      <p><strong>Windows (PowerShell):</strong></p>
      <pre class="code-block"><code>Get-FileHash .\\${esc(APK_FILE)} -Algorithm SHA256</code></pre>
      <p><strong>macOS of Linux:</strong></p>
      <pre class="code-block"><code>shasum -a 256 ${esc(APK_FILE)}</code></pre>
      <p class="static-note">
        Komt de hash niet overeen? Verwijder het bestand en download opnieuw vanaf deze pagina.
      </p>
    </section>

    <section class="panel install-section donate-faq">
      <h2><span class="h2-num">?</span> Veelgestelde vragen</h2>
      <details class="faq-item">
        <summary>Android waarschuwt of blokkeert de installatie. Wat nu?</summary>
        <p>
          Een APK die je niet via Google Play installeert, krijgt soms een waarschuwing van
          <em>Play Protect</em>. Dat is normaal. Tik op <em>Meer details</em> → <em>Toch installeren</em>.
          Zet daarna <em>Onbekende apps installeren</em> aan voor Chrome of je browser.
          Zie je ergens “Beveiligd en privé”? Dat gaat over de beveiligde website (HTTPS) en
          blokkeert de installatie niet.
        </p>
      </details>
      <details class="faq-item">
        <summary>Ik zie “App niet geïnstalleerd”. Wat nu?</summary>
        <p>
          Meestal staat er nog een oude EasyCodey of snelkoppeling op je toestel, of is er te weinig
          vrije ruimte. Verwijder de oude versie, controleer je opslag en probeer opnieuw. Zet ook
          <em>Onbekende apps installeren</em> aan voor Chrome of je browser. Lukt het daarna nog niet?
          Gebruik de webapp: open de site in Chrome en kies <em>Menu ⋮ → App installeren</em>.
          Je voortgang blijft bewaard.
        </p>
      </details>
      <details class="faq-item">
        <summary>Kan ik de APK ook op iPhone of iPad installeren?</summary>
        <p>
          Nee, een APK is alleen voor Android. Op iPhone en iPad zet je EasyCodey via Safari op je
          beginscherm: tik op <em>Deel</em> → <em>Zet op beginscherm</em>. Dat werkt hetzelfde,
          is gratis en je krijgt ook een eigen icoon.
        </p>
      </details>
      <details class="faq-item">
        <summary>Is dit veilig?</summary>
        <p>
          Ja. De APK is ondertekend met de eigen uploadsleutel van EasyCodey en opent alleen
          <strong>https://yousefabujarad2014-beep.github.io/easycodey/</strong>. Er zit geen reclame,
          geen tracker en geen verborgen code in. Je kunt de hash controleren.
        </p>
      </details>
      <details class="faq-item">
        <summary>Waarom staat de app niet in Google Play?</summary>
        <p>
          Google vraagt een eenmalige registratievergoeding van $25 voor de Play Store. EasyCodey is
          gratis en blijft gratis; daarom bieden we de APK rechtstreeks aan. Later kan de app alsnog
          naar Play, zonder dat je iets opnieuw hoeft te bouwen.
        </p>
      </details>
      <details class="faq-item">
        <summary>Krijg ik automatisch updates?</summary>
        <p>
          De <strong>inhoud</strong> — projecten, editor, eigenaarslogin en verbeteringen — wordt
          automatisch bijgewerkt zodra je online bent. Alleen als de Android-schil zelf verandert,
          verschijnt hier een nieuwe APK. Download die dan opnieuw.
        </p>
      </details>
      <details class="faq-item">
        <summary>Moet ik een account maken?</summary>
        <p>
          Nee. Alles werkt als gast. Een optioneel account houdt alleen profielen op hetzelfde
          toestel uit elkaar. De eigenaar kan inloggen voor het beheerscherm.
        </p>
      </details>
      <details class="faq-item">
        <summary>Werkt de app ook offline?</summary>
        <p>
          Ja, na de eerste keer online gebruiken. Python wordt één keer geladen en daarna uit de cache
          gebruikt. Je voortgang staat lokaal in je browser.
        </p>
      </details>
    </section>

    <section class="panel install-section">
      <h2><span class="h2-num">✓</span> Liever geen APK?</h2>
      <p class="static-lead">
        Je kunt EasyCodey ook als webapp installeren. Dat werkt op Android, iPhone, iPad, computer en
        Chromebook, zonder download en met automatische updates.
      </p>
      <div class="static-actions">
        <a class="btn brand" href="${prefix}installeren/">📲 Installeren als webapp</a>
        <a class="btn ghost" href="${prefix}">▶ Open EasyCodey</a>
      </div>
    </section>
  </main>

  ${footer(prefix)}
  ${DOWNLOAD_TRACKING}
  ${THEME_SCRIPT}
</body>
</html>
`;
}

/* Meet APK-downloads op de downloadpagina. De ingebouwde teller werkt altijd
   als publicCounter in site-config.json staat. De uitgebreide GoatCounter-
   meting komt daar bovenop als er een analyticsSite is ingesteld. Cookieloos
   en zonder persoonsgegevens; de opt-out stopt allebei. */
const DOWNLOAD_TRACKING = `<script>
  (async () => {
    try {
      if (localStorage.getItem("easycodey.analytics.optout.v1") === "1") return;
      const response = await fetch("../site-config.json", { cache: "no-store" });
      const config = await response.json();

      const counter = String((config && config.publicCounter) || "")
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9._-]/g, "");
      if (counter) {
        let seen = false;
        try {
          seen = sessionStorage.getItem("easycodey.counter.session.v1") === "1";
        } catch (error) {}
        if (!seen) {
          try {
            sessionStorage.setItem("easycodey.counter.session.v1", "1");
          } catch (error) {}
          fetch(
            "https://abacus.jasoncameron.dev/hit/" +
              encodeURIComponent(counter) +
              "/bezoeken-v1",
            { cache: "no-store", keepalive: true }
          ).catch(() => {});
        }
        let unique = false;
        try {
          unique = localStorage.getItem("easycodey.uniqueVisitor.v1") === "1";
        } catch (error) {}
        if (!unique) {
          fetch(
            "https://abacus.jasoncameron.dev/hit/" +
              encodeURIComponent(counter) +
              "/unieke-bezoekers-v1",
            { cache: "no-store", keepalive: true }
          )
            .then((response) => {
              if (!response.ok) return;
              try {
                localStorage.setItem("easycodey.uniqueVisitor.v1", "1");
              } catch (error) {}
            })
            .catch(() => {});
        }
        document.addEventListener(
          "click",
          (event) => {
            if (!event.target.closest || !event.target.closest("a[download]")) return;
            fetch(
              "https://abacus.jasoncameron.dev/hit/" +
                encodeURIComponent(counter) +
                "/apk-downloads-v1",
              { cache: "no-store", keepalive: true }
            ).catch(() => {});
          },
          true
        );
      }

      const site = String((config && config.analyticsSite) || "")
        .trim()
        .toLowerCase()
        .replace(/^https?:\\/\\//, "")
        .replace(/\\/.*$/, "")
        .replace(/\\.goatcounter\\.com$/, "")
        .replace(/[^a-z0-9-]/g, "");
      if (!site) return;
      window.goatcounter = { no_onload: true, allow_local: false };
      const script = document.createElement("script");
      script.async = true;
      script.src = "https://gc.zgo.at/count.js";
      script.dataset.goatcounter = "https://" + site + ".goatcounter.com/count";
      script.addEventListener("load", () => {
        try {
          window.goatcounter.count({ path: "/download", title: document.title, event: false });
          document.addEventListener(
            "click",
            (event) => {
              if (event.target.closest && event.target.closest("a[download]")) {
                window.goatcounter.count({ path: "/event/apk-download", event: true });
              }
            },
            true
          );
        } catch (error) {}
      });
      document.head.appendChild(script);
    } catch (error) {}
  })();
</script>`;

/* Telt op de vaste pagina's één bezoek per sessie met de ingebouwde teller.
   Staat er een GoatCounter-code in site-config.json, dan telt GoatCounter ook
   de paginaweergave. Cookieloos, zonder persoonsgegevens en met dezelfde
   opt-out als de app. */
function SITE_TRACKING(prefix) {
  return `<script>
  (async () => {
    try {
      if (localStorage.getItem("easycodey.analytics.optout.v1") === "1") return;
      const response = await fetch("${prefix}site-config.json", { cache: "no-store" });
      const config = await response.json();

      const counter = String((config && config.publicCounter) || "")
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9._-]/g, "");
      if (counter) {
        let seen = false;
        try {
          seen = sessionStorage.getItem("easycodey.counter.session.v1") === "1";
        } catch (error) {}
        if (!seen) {
          try {
            sessionStorage.setItem("easycodey.counter.session.v1", "1");
          } catch (error) {}
          fetch(
            "https://abacus.jasoncameron.dev/hit/" +
              encodeURIComponent(counter) +
              "/bezoeken-v1",
            { cache: "no-store", keepalive: true }
          ).catch(() => {});
        }
        let unique = false;
        try {
          unique = localStorage.getItem("easycodey.uniqueVisitor.v1") === "1";
        } catch (error) {}
        if (!unique) {
          fetch(
            "https://abacus.jasoncameron.dev/hit/" +
              encodeURIComponent(counter) +
              "/unieke-bezoekers-v1",
            { cache: "no-store", keepalive: true }
          )
            .then((response) => {
              if (!response.ok) return;
              try {
                localStorage.setItem("easycodey.uniqueVisitor.v1", "1");
              } catch (error) {}
            })
            .catch(() => {});
        }
      }

      const site = String((config && config.analyticsSite) || "")
        .trim()
        .toLowerCase()
        .replace(/^https?:\\/\\//, "")
        .replace(/\\/.*$/, "")
        .replace(/\\.goatcounter\\.com$/, "")
        .replace(/[^a-z0-9-]/g, "");
      if (!site) return;
      const script = document.createElement("script");
      script.async = true;
      script.src = "https://gc.zgo.at/count.js";
      script.dataset.goatcounter = "https://" + site + ".goatcounter.com/count";
      document.head.appendChild(script);
    } catch (error) {}
  })();
</script>`;
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
          <a class="btn ghost" href="${prefix}download/">⬇ Android-app (APK)</a>
        </div>
      </section>
    </div>

    <section class="panel install-section install-security" id="veiligheid">
      <h2><span class="h2-num">✓</span> Veilig en privé</h2>
      <p class="static-lead">
        EasyCodey is gemaakt om veilig te voelen: een beveiligde verbinding, geen advertenties,
        geen trackers en geen account op een server.
      </p>
      <div class="trust-grid">
        <div class="trust-card">
          <span class="trust-card-icon" aria-hidden="true">🔒</span>
          <strong>HTTPS-versleuteling</strong>
          <p>De live app werkt via een beveiligde HTTPS-verbinding. Je browser toont het slotje in de adresbalk.</p>
        </div>
        <div class="trust-card">
          <span class="trust-card-icon" aria-hidden="true">📱</span>
          <strong>Je gegevens blijven bij jou</strong>
          <p>Voortgang, accounts en eigen projecten staan alleen in de opslag van je eigen browser. Er is geen database.</p>
        </div>
        <div class="trust-card">
          <span class="trust-card-icon" aria-hidden="true">🚫</span>
          <strong>Geen advertenties of trackers</strong>
          <p>EasyCodey verkoopt niets en volgt je niet. Er zijn geen advertentienetwerken. Alleen anonieme, cookieloze bezoekcijfers als de eigenaar dat instelt — en die kun je zelf uitzetten.</p>
        </div>
        <div class="trust-card">
          <span class="trust-card-icon" aria-hidden="true">🔄</span>
          <strong>Automatische veilige updates</strong>
          <p>De app controleert zelf op een nieuwe versie en werkt zich bij zodra je online bent.</p>
        </div>
      </div>
      <p class="static-note">
        Je wachtwoord houdt accounts op hetzelfde apparaat uit elkaar, maar is geen sterke beveiliging
        tegen iemand die toegang heeft tot je toestel. Gebruik geen belangrijk wachtwoord.
      </p>
    </section>

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
          Het staat rechts in de adresbalk (een klein scherm met een pijl). Zie je het niet? Klik op
          <strong>⋮</strong> → <em>Cast, opslaan en delen</em> → <em>App installeren</em>. In Edge:
          <strong>⋯</strong> → <em>Apps</em> → <em>Deze site als app installeren</em>.
        </li>
        <li>
          <strong>Bevestig</strong>
          EasyCodey komt in het startmenu of in Launchpad en opent in een eigen venster.
        </li>
      </ol>
      <p class="static-note">
        De APK op de downloadpagina is alleen voor Android. Op Windows of macOS gebruik je de webapp;
        je hoeft dan niets te installeren. Een melding “Beveiligd en privé” of een slotje gaat over de
        beveiligde HTTPS-verbinding en blokkeert de installatie niet.
      </p>
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
        <li>Gebruik Chrome, Edge of Safari. Firefox en Safari op de computer kunnen geen webapp installeren; in-app browsers zoals WhatsApp ook niet.</li>
        <li>Sluit incognito en open de site in een normaal tabblad.</li>
        <li>Installeer altijd via de beveiligde link <strong>https://yousefabujarad2014-beep.github.io/easycodey/</strong>, niet via een lokaal bestand of een oude snelkoppeling.</li>
        <li>EasyCodey controleert zelf op updates en werkt zich automatisch bij zodra je online bent. Je hoeft niets te doen.</li>
        <li>Bezoek de site één keer online en wacht een paar seconden, zodat de service worker klaar is.</li>
        <li>Werk je browser bij via de Play Store of App Store en herstart hem.</li>
        <li>Je voortgang staat per apparaat en per browser. Maak een optioneel profiel voor meerdere gebruikers op hetzelfde apparaat, of gebruik een back-up om je voortgang te verhuizen.</li>
      </ul>
      <div class="static-actions">
        <a class="btn brand" href="${prefix}">▶ Open EasyCodey</a>
        <a class="btn ghost" href="${prefix}projecten/">📚 Alle projecten</a>
      </div>
    </section>

    <section class="panel install-section" id="oude-app">
      <h2><span class="h2-num">!</span> Oude app of oude melding</h2>
      <p class="static-lead">
        Krijg je nog een waarschuwing over een oude versie? Dan wijst je oude snelkoppeling
        of geïnstalleerde app nog naar een verouderd adres. Verwijder die en installeer opnieuw via de
        beveiligde link.
      </p>
      <ol class="install-steps">
        <li>
          <strong>Verwijder de oude app</strong>
          Houd het EasyCodey-icoon ingedrukt en kies <em>Verwijderen</em> (Android/iPhone) of ga op de
          computer naar <em>Instellingen → Apps → EasyCodey → Verwijderen</em>.
        </li>
        <li>
          <strong>Wis de oude sitegegevens</strong>
          Chrome: <em>Instellingen → Privacy en beveiliging → Site-instellingen → Alle sites → EasyCodey
          → Gegevens wissen</em>. Safari: <em>Instellingen → Safari → Geavanceerd → Websitegegevens</em>.
        </li>
        <li>
          <strong>Open de beveiligde link</strong>
          Ga naar <strong>https://yousefabujarad2014-beep.github.io/easycodey/</strong> en controleer dat
          je een slotje ziet.
        </li>
        <li>
          <strong>Installeer opnieuw</strong>
          Chrome/Edge: menu ⋮ → <em>App installeren</em>. iPhone: <em>Deel → Zet op beginscherm</em>.
        </li>
      </ol>
      <p class="static-note">
        Gebruik altijd <strong>https</strong> en de slash aan het einde. Open EasyCodey niet als los
        bestand en gebruik geen oude bladwijzer met <code>http://</code>.
      </p>
    </section>
  </main>

  ${footer(prefix)}
  ${SITE_TRACKING(prefix)}
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
  ${SITE_TRACKING(prefix)}
  ${THEME_SCRIPT}
</body>
</html>
`;
}

function renderPrivacyPage() {
  const prefix = "../";
  const canonical = `${SITE}/privacy/`;
  const title = "Privacybeleid — EasyCodey";
  const description = trim(
    "Lees hoe EasyCodey met je gegevens omgaat: alles blijft lokaal op je apparaat, zonder advertenties, trackers of verkoop van gegevens.",
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
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "EasyCodey", item: `${SITE}/` },
          { "@type": "ListItem", position: 2, name: "Privacy", item: canonical }
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
      <span aria-current="page">Privacy</span>
    </nav>

    <header class="static-page-head">
      <p class="eyebrow">Privacy</p>
      <h1>Privacybeleid</h1>
      <p class="static-lead">
        EasyCodey is gemaakt om veilig en privé te voelen. Je voortgang, profielen en eigen projecten
        blijven op je eigen apparaat. Er is geen server die je gegevens bewaart.
      </p>
      <p class="static-note">Laatst bijgewerkt: 12 november 2026</p>
    </header>

    <section class="panel">
      <h2>Wie is verantwoordelijk?</h2>
      <p class="profile-text">
        EasyCodey is een project van <strong>Yousef Abujarad (EasyCodey)</strong>.
        Je kunt contact opnemen via <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a>,
        telefoon of WhatsApp <a href="tel:${CONTACT_PHONE_TEL}">${CONTACT_PHONE_DISPLAY}</a>.
      </p>
    </section>

    <section class="panel">
      <h2>Welke gegevens worden bewaard?</h2>
      <p class="profile-text">
        EasyCodey bewaart alleen wat nodig is om de app te laten werken. Dit staat in de opslag
        van je eigen browser (<code>localStorage</code>) en wordt niet naar een server gestuurd:
      </p>
      <ul class="tips">
        <li>Je voortgang: welke stappen je hebt afgevinkt en welke projecten je hebt afgerond.</li>
        <li>Je thema, AI-instellingen en de code in de programmeer-editor.</li>
        <li>Je eigen projecten en ideeën die je zelf hebt gemaakt.</li>
        <li>Als je een optioneel account maakt: je naam, een hash van je wachtwoord en eventueel een e-mailadres of telefoonnummer.</li>
        <li>De datum waarop je account is gemaakt en je laatste activiteit.</li>
      </ul>
      <p class="static-note">
        Een wachtwoord wordt nooit als platte tekst bewaard. Het is een eenvoudige hash die accounts
        op hetzelfde apparaat uit elkaar houdt, geen sterke beveiliging tegen iemand met toegang tot je toestel.
      </p>
    </section>

    <section class="panel">
      <h2>Waarom bewaren we dit?</h2>
      <ul class="tips">
        <li>Om je voortgang te onthouden als je terugkomt.</li>
        <li>Om meerdere gebruikers op hetzelfde apparaat eigen voortgang te geven.</li>
        <li>Om je eigen projecten en editor-code te bewaren.</li>
        <li>Om je de app te laten gebruiken zonder verplicht account.</li>
      </ul>
    </section>

    <section class="panel">
      <h2>Geen server, geen verkoop</h2>
      <p class="profile-text">
        EasyCodey heeft geen database en geen account op een server. Je gegevens worden niet verkocht,
        niet verhuurd en niet gebruikt voor advertenties. Er zijn geen advertentienetwerken en geen
        trackers.
      </p>
      <p class="profile-text">
        EasyCodey telt <strong>anoniem</strong> hoe vaak de app wordt geopend, hoeveel unieke
        toestellen of browsers de site bezoeken, hoe vaak de app als app start (installatie) en hoe
        vaak de APK wordt gedownload. Dat gebeurt met een eigen teller zonder cookies, zonder
        vingerafdruk en zonder persoonsgegevens. Alleen een getal per onderwerp gaat heen en weer;
        er is geen account nodig. Een “unieke bezoeker” is dus één toestel of browser, geen echte
        persoon: iemand met twee toestellen of gewiste opslag telt opnieuw.
      </p>
      <p class="profile-text">
        De eigenaar kan daarnaast <strong>uitgebreidere bezoekcijfers</strong> laten meten met
        GoatCounter: welke pagina en welk project zijn bekeken, met een grove regio en het
        browsertype. Ook dat is cookieloos. Je kunt alle meting altijd uitzetten via
        <strong>Mijn profiel → Privacy en statistieken</strong>. Staat er geen meetcode in de app,
        dan wordt er niets naar GoatCounter verstuurd.
      </p>
      <p class="static-note">
        De eigenaar ziet alleen de profielen die op hetzelfde apparaat zijn gemaakt, via het lokale
        beheerscherm. Andere telefoons en computers hebben hun eigen opslag.
      </p>
    </section>

    <section class="panel">
      <h2>Externe diensten</h2>
      <p class="profile-text">
        De website wordt gehost via GitHub Pages. Lettertypen komen van Google Fonts en Python wordt
        geladen via jsDelivr (Pyodide). Daarbij kunnen technische gegevens zoals je IP-adres en
        browsergegevens bij die aanbieders terechtkomen. EasyCodey verstuurt zelf geen inhoud van
        je projecten of profielen naar deze diensten. De ingebouwde teller (Abacus) ontvangt alleen
        een anoniem getal voor bezoeken, unieke bezoekers, installaties en APK-downloads. Alleen als
        er een meetcode
        in de app staat, wordt het GoatCounter-script geladen; dat telt anonieme bezoeken zonder
        cookies.
      </p>
      <p class="profile-text">
        <strong>AI-coach.</strong> De online AI-coach staat standaard aan en gebruikt een gratis
        AI-dienst (Pollinations). Alleen wanneer je een bericht stuurt, gaan je vraag, het gesprek en
        de context van het project dat je bekijkt naar die dienst. Je voortgang, je account en je
        contactgegevens worden nooit meegestuurd. Zet je de online coach uit in de instellingen, dan
        gebruikt EasyCodey alleen de offline coach en gaat er niets naar een AI-dienst.
      </p>
      <p class="static-note">
        De eigenaar kan ook een eigen server of OpenAI-sleutel koppelen. In dat geval gaan je
        chatberichten naar die server in plaats van naar de gratis AI-dienst.
      </p>
    </section>

    <section class="panel">
      <h2>Bewaartermijn</h2>
      <p class="profile-text">
        Je gegevens blijven staan tot je ze zelf verwijdert: via je profiel, via het beheerscherm of
        door de sitegegevens van je browser te wissen. Een back-upbestand dat je downloadt, bewaar
        je zelf; EasyCodey heeft daar geen kopie van.
      </p>
    </section>

    <section class="panel">
      <h2>Jouw rechten</h2>
      <ul class="tips">
        <li>Je kunt je gegevens bekijken en downloaden via <strong>Mijn profiel</strong> en <strong>Back-up downloaden</strong>.</li>
        <li>Je kunt je account en voortgang verwijderen via <strong>Mijn profiel</strong> of het lokale beheerscherm.</li>
        <li>Je kunt een fout in je gegevens zelf herstellen of ons contacteren via ${CONTACT_EMAIL}.</li>
        <li>Je hebt recht op inzage, correctie, verwijdering en overdraagbaarheid van je gegevens.</li>
      </ul>
    </section>

    <section class="panel">
      <h2>Kinderen en jongeren</h2>
      <p class="profile-text">
        EasyCodey is bedoeld om te leren programmeren en vraagt niet om een account. Een e-mailadres
        of telefoonnummer is optioneel en wordt niet verplicht. Omdat er geen gegevens naar een server
        gaan, blijft de drempel laag. Ouders of begeleiders kunnen de lokale gegevens via het
        beheerscherm bekijken en verwijderen.
      </p>
    </section>

    <section class="panel">
      <h2>Beveiliging</h2>
      <p class="profile-text">
        De live site gebruikt HTTPS met een geldig certificaat en HSTS. Omdat alle gegevens lokaal
        staan, is de beveiliging van je toestel en browser belangrijk. Gebruik geen belangrijk
        wachtwoord en deel je toestel niet met mensen die je niet vertrouwt.
      </p>
    </section>

    <section class="panel">
      <h2>Wijzigingen</h2>
      <p class="profile-text">
        Als dit beleid verandert, passen we de datum bovenaan aan. Belangrijke wijzigingen
        communiceren we via de app of de website.
      </p>
    </section>

    <section class="panel">
      <h2>Contact</h2>
      <p class="profile-text">
        Vragen over privacy? Mail <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a> of stuur een
        WhatsApp naar <a href="${CONTACT_WHATSAPP}">${CONTACT_PHONE_DISPLAY}</a>.
      </p>
    </section>
  </main>

  ${footer(prefix)}
  ${SITE_TRACKING(prefix)}
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
  ${SITE_TRACKING(prefix)}
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
writeFile(path.join(PRIVACY_DIR, "index.html"), renderPrivacyPage());
writeFile(path.join(DOWNLOAD_DIR, "index.html"), renderDownloadPage());

const urls = [
  { loc: `${SITE}/`, priority: "1.0", changefreq: "weekly" },
  { loc: `${SITE}/projecten/`, priority: "0.9", changefreq: "weekly" },
  { loc: `${SITE}/installeren/`, priority: "0.7", changefreq: "monthly" },
  { loc: `${SITE}/download/`, priority: "0.7", changefreq: "monthly" },
  { loc: `${SITE}/contact/`, priority: "0.6", changefreq: "yearly" },
  { loc: `${SITE}/doneren/`, priority: "0.6", changefreq: "yearly" },
  { loc: `${SITE}/privacy/`, priority: "0.4", changefreq: "yearly" },
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
console.log(`Download:        download/index.html (${APK_FILE})`);
console.log(`Contact:         contact/index.html`);
console.log(`Doneren:         doneren/index.html`);
console.log(`Privacy:         privacy/index.html`);
console.log(`Sitemap:         ${urls.length} URL's`);
if (removed) console.log(`Opgeruimd:       ${removed} verouderde projectmap(pen)`);
