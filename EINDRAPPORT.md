# EasyCodey — eindrapport

**Datum:** 9 november 2026
**Map:** `C:\Users\Home\Desktop\FLL`
**Status:** inhoudelijk klaar, live op GitHub Pages

---

## 1. Wat is EasyCodey?

EasyCodey is een Nederlandstalige website waarmee je Python leert door echte projecten te bouwen. Je kiest een project, volgt een stappenplan met uitleg en code, vinkt stappen af en vraagt de AI-coach om hulp als je vastloopt.

De site is gebouwd zonder framework en zonder build-stap: vanilla JavaScript (ES-modules), één Node.js-server zonder externe dependencies en alle projectdata lokaal in `data/`.

---

## 2. Wat er gebouwd is

### Projectbibliotheek
- **161 projecten** met **711 stappen**.
- Verdeling over 10 categorieën:

| Categorie | Projecten |
|---|---:|
| 🎮 Games | 36 |
| 🌐 Web | 22 |
| 🪟 GUI | 15 |
| 🤖 Data & AI | 12 |
| 🧰 Handige tools | 14 |
| ⚙️ Automatisering | 10 |
| 🔐 Security | 14 |
| 🔬 Wetenschap | 18 |
| 🎨 Kunst & Creatief | 10 |
| 🎓 Onderwijs | 10 |
| **Totaal** | **161** |

- Elk project heeft: `id`, `title`, `emoji`, `category`, `level` (Beginner/Gemiddeld/Gevorderd), `time`, `summary`, `description`, minimaal 3 leerdoelen, minimaal 3 stappen met titel/uitleg/code, tips en geldige `next`-links.
- Alle `next`-links worden bij het laden gecontroleerd en aangevuld door `data/index.js`.

### Afbeeldingen
- 10 lokale SVG-omslagen in `assets/covers/` (één per categorie).
- Projecten kunnen optioneel een eigen `image`-veld hebben.
- Zonder eigen afbeelding gebruikt de site automatisch de categorie-cover.
- AI-projecten krijgen dus altijd een passende cover.
- Alle afbeeldingen hebben duidelijke alt-tekst en `loading="lazy"` op de kaarten.
- Geen externe afbeeldingsdiensten.

### Chique huisstijl en logo
- Warm ivoor, diepgroen en goud als vaste kleurenpalet, met donkere code- en footerblokken.
- **Fraunces** voor koppen en **Plus Jakarta Sans** voor tekst; **JetBrains Mono** voor code.
- Verfijnde kaarten, ronde knoppen, zachte schaduwen, gouden randen en een subtiele korrel/gloed op de achtergrond.
- Nieuw logo: een diepgroen vierkant met dunne gouden rand, een ivoren serif **E** en een gouden punt. Het logo staat in de header, op de offlinepagina en als favicon (`assets/icons/logo.svg`).
- De app-iconen (`icon.svg`, `maskable.svg` en de PNG's) zijn opnieuw getekend in dezelfde stijl.
- De bestaande klassen, routes en functionaliteit zijn ongewijzigd gebleven; de nieuwe laag verfijnt alleen de weergave.
- `theme-color` blijft in het lichte thema **`#f7f5ef`**; donker gebruikt **`#12110f`**.

### Homepagina (`#/`)
- Zoeken op titel, samenvatting, beschrijving, categorie, vaardigheden en tips.
- Categorie-chips met aantallen per categorie.
- Filters op niveau, tijdsduur en meerdere vaardigheden tegelijk.
- "Alleen niet afgerond" en sorteren op aanbevolen, kortste duur, moeilijkheid en A-Z.
- Resultaatenteller, filters wissen, lege staat en "🎲 Verras me".
- Filters staan in de URL, bijvoorbeeld `#/?q=weer&categorie=Web&niveau=Gemiddeld&duur=kort`.
- Eerste 30 resultaten, daarna "Meer laden" in stappen van 30.
- Statistieken: aantal projecten, categorieën, afgeronde projecten en totale voortgang.
- Sneltoets `/` focust het zoekveld.
- **App-entry** bovenaan: een opvallend blok dat uitlegt dat je je leerpad overal mee naartoe kunt nemen, met knoppen naar de editor en het installeren van de app.
- De hero-knop **▶ Snel proberen** opent het Python-speelveld.

### Projectpagina (`#/idee/:id`)
- Omslagafbeelding, titel, categorie, niveau, duur en aantal stappen.
- Uitleg, leerdoelen en tips.
- Stappenplan met codeblokken en een kopieerknop per blok.
- Elke stap heeft een afvinkknop; de keuze wordt direct in `localStorage` opgeslagen.
- Voortgangsring en voortgangsbalk.
- "Markeer als afgerond" en "Voortgang resetten".
- Zijbalk met projectgegevens, vervolgprojecten en "Vraag AI om hulp".
- Per stap: "Vraag AI over deze stap", inclusief project- en stapcontext.
- Actiebalk met **Speel dit idee**, **Programmeer dit idee**, **Download .py** en **Kopieer alle code**.
- **Speel dit idee** voert het volledige project meteen uit in het Python-speelveld.
- **Programmeer dit idee** opent de editor met alle stappen als één programma, met commentaar per stap.
- **Invoerhulp** onder de actiebalk: legt uit dat je bij `input()` je antwoord typt in het venster bovenaan je scherm (het tekstvak met de drie puntjes) en daarna op **Enter** drukt.
- Dezelfde uitleg staat op elke vaste projectpagina en in het Python-speelveld.
- Confetti bij het afronden van een project (met respect voor `prefers-reduced-motion`).

### Leerpad (`#/leerpad`)
- Alle projecten gegroepeerd per niveau: Beginner, Gemiddeld, Gevorderd.
- Voortgang per project zichtbaar met een vinkje.
- Categorie-filter en totale voortgang.
- Filter staat in de URL (`#/leerpad?categorie=Games`).

### Mijn ideeën (`#/mijn-ideeen`)
- Overzicht van zelfgemaakte AI-projecten uit `localStorage`.
- Project openen, verwijderen en opnieuw bekijken.
- Exporteren als JSON-bestand (`easycodey-eigen-ideeen.json`).
- Importeren van een eerder geëxporteerd JSON-bestand.
- Geïmporteerde projecten worden gevalideerd en schoongemaakt: ongeldige velden, categorieën en niveaus worden hersteld en projecten met minder dan 3 geldige stappen worden geweigerd.
- Duidelijke waarschuwing dat projecten per browser/apparaat zijn opgeslagen.

### Optioneel account (`#/profiel`)
- Een account is **optioneel**; zonder account werkt EasyCodey gewoon als gast.
- Snel aanmelden zoals bij Kahoot: een naam en een wachtwoord van 4 tot 64 tekens, geen e-mail.
- Inloggen op naam + wachtwoord, met **Toon/Verberg** voor het wachtwoordveld; uitloggen en een account verwijderen.
- Elk account heeft eigen voortgang, eigen projecten en eigen editor-code via `easycodey.v1.profile.<id>`.
- Bij het aanmaken kun je de huidige gastvoortgang meenemen.
- Oude accounts met een PIN blijven werken: de PIN wordt automatisch als wachtwoord gelezen.
- **Back-up downloaden** bewaart voortgang, eigen projecten en editor-code als JSON; **Back-up herstellen** zet het bestand terug.
- De header heeft een **👤-icoon** en de footer een link **Mijn profiel**.
- Duidelijke uitleg dat accounts alleen op dit apparaat staan en dat het wachtwoord geen sterke beveiliging is.

### Chatknop na inloggen
- Zodra een account actief is, verschijnt een chatknop in de header, een link in de footer en een zwevende knop rechtsonder.
- Op `#/profiel` staat een grote **Chat met EasyCoach**-kaart.
- De knop werkt op Android en op de laptop en opent het bestaande AI-paneel.
- De begroeting en het gebruikersavatar gebruiken de naam en initiaal van het actieve account.
- Zonder actief account blijven alle chatknoppen verborgen.

### AI-coach EasyCoach
- Zijpaneel met streaming antwoorden.
- Nederlandse systeemprompt staat server-side in `server.js`.
- Project- en stapcontext wordt met elk verzoek meegestuurd.
- Offline coach werkt direct zonder API-sleutel:
  - legt een specifieke stap uit;
  - helpt met foutmeldingen;
  - helpt een project kiezen;
  - geeft een algemene aanpak.
- Bij een fout of rate limit valt de site terug op de offline coach.
- Instellingen in de browser voor API-sleutel, model, basis-URL en toegangscode.
- De sleutel wordt nooit in de code opgeslagen; server-side via `.env` of omgevingsvariabelen heeft de voorkeur.
- Optionele toegangscode (`ACCESS_CODE`) en rate limiting per IP (`RATE_LIMIT`, standaard 30 per uur).

### AI-ideeëngenerator
- Beschrijf een onderwerp, niveau, tijdsduur en optioneel een categorie.
- Met AI: streaming JSON-antwoord wordt geparsed naar een compleet project.
- Zonder AI: de offline generator maakt direct een bruikbaar project met 4 stappen.
- Het resultaat wordt opgeslagen in `localStorage` en geopend in de detailpagina.
- Ongeldige of onvolledige AI-antwoorden vallen terug op de offline generator.

### Python-speelveld
- Bereikbaar via **▶ Snel proberen** in de hero en **Probeer Python** in de footer.
- Python draait via Pyodide (WebAssembly) volledig in de browser.
- De runtime wordt pas geladen als iemand het speelveld opent en op **Uitvoeren** klikt.
- Zes voorbeelden: hallo wereld, rekenen, loops, lijsten, functies en "Raad het getal" zonder `input()`.
- Uitvoer en foutmeldingen verschijnen direct in het paneel.
- `input()` toont bovenaan je scherm een venster met een tekstvak (met de drie puntjes). De statusregel zegt **“Typ je antwoord in het venster bovenaan…”**.
- Bij het speelveld, op de SPA-projectpagina en op elke vaste projectpagina staat dezelfde invoerhulp.
- Geen code of uitvoer gaat naar de server.
- Bij een netwerkfout verschijnt een duidelijke melding; de rest van de site blijft werken.

### Programmeer-editor (`#/programmeren`)
- Volledige editor met een groot codeveld en een apart uitvoerpaneel.
- **▶ Uitvoeren** en **Ctrl + Enter** voeren de code uit via dezelfde Pyodide-runtime.
- **Download .py** bewaart het programma als Python-bestand.
- **Kopieer** zet de code op het klembord.
- Automatisch bewaren in `localStorage`; de code staat na herladen nog in de editor.
- Editor-code is gekoppeld aan het project waarvoor je hem opende. Typ je daarna in de algemene editor (`#/programmeren`), dan wordt die code niet per ongeluk aan het oude project gekoppeld; **Programmeer dit idee** laadt altijd de juiste projectcode.
- Voorbeelden laden, uitvoer wissen, **Tab** invoegen als vier spaties en de editor leegmaken.
- **Projectcode opnieuw laden** en **Terug naar project** in de projectbalk.
- Op mobiel staat de navigatie op een eigen scrollbare rij en wordt de editor één kolom.

### Installeerbare app (PWA)
- `manifest.webmanifest` met naam, korte naam, beschrijving, start-URL, kleuren en snelkoppelingen naar **Programmeren**, **Leerpad** en **Mijn ideeën**.
- Vier PNG-app-iconen (192 en 512 px, gewoon en maskable) plus een Apple-touch-icoon.
- `sw.js` bewaart de app-shell (34 bestanden) bij de eerste installatie.
- **Network-first** voor navigatie én same-origin code/styles, **cache-first** voor afbeeldingen, lettertypen en de CDN. Zo zie je nooit een oude versie.
- De service worker registreert met `updateViaCache: "none"` en controleert automatisch op een nieuwe versie: bij de start, elke 15 minuten, bij terugkeer naar de app (`visibilitychange`/`focus`) en zodra je weer online bent. Een nieuwe versie wordt automatisch overgenomen en de pagina herlaadt.
- **↻ App bijwerken** in het installatievenster verwijdert de oude service worker en caches en herlaadt de nieuwste versie.
- HTTP wordt automatisch naar HTTPS omgeleid (behalve op localhost). Het installatievenster en de installatiepagina leggen uit dat je altijd de beveiligde live-link moet gebruiken.
- De Python-runtime en lettertypen komen in een aparte runtime-cache, zodat Python na de eerste keer offline werkt.
- `offline.html` verschijnt als een pagina niet in de cache staat.
- **📲 Installeer als app** in de header en footer, met uitleg per platform en een **Installeer nu**-knop zodra de browser dat ondersteunt.
- In een geïnstalleerde app verdwijnt de installeerknop en opent de site in een eigen venster.
- Werkt op GitHub Pages zonder server; de service worker draait alleen via `https://` of `localhost`.

### Donaties
- Doneerknop in de header en footer, met een link naar de volledige pagina `/doneren/`.
- De knop verschijnt zodra er een geldig IBAN of een externe doneerlink is ingesteld.
- IBAN **BE69 0638 3621 2278**, houder **Yousef Abujarad (EasyCodey)**, bank **Belfius**, BIC **GKCCBEBB**.
- De pagina `/doneren/` legt uit hoe je overschrijft, waar het geld naartoe gaat en wat de transparantie is.
- Link, label en toelichting komen via `/api/config` uit omgevingsvariabelen; op GitHub Pages uit `site-config.json`.
- Ondersteunt daarnaast elke https-link, bijvoorbeeld Ko-fi, Buy Me a Coffee, PayPal.me of Stripe.
- De site verwerkt zelf geen betalingen en bewaart geen betaalgegevens.

### Vindbaarheid
- `/robots.txt` staat indexering toe en verwijst naar de sitemap.
- `/sitemap.xml` bevat **166 URL's**: startpagina, projectoverzicht, installatiepagina, contactpagina, doneerpagina en alle 161 projecten.
- Elk project heeft een vaste pagina op `/idee/<id>/` met eigen titel, meta-description, canonical, Open Graph en JSON-LD (`LearningResource` + `BreadcrumbList`).
- `/projecten/` is een indexeerbaar overzicht per categorie met zoekveld (`CollectionPage` + `ItemList`).
- `/contact/` is de Nederlandstalige contactpagina met telefoon/WhatsApp **+32 466 47 66 52** en e-mail **yousefabujarad2014@gmail.com** (`ContactPage` + `Organization`).
- Titel, description, canonical, Open Graph, Twitter-kaarten en JSON-LD staan ook in `index.html`.
- Het nieuwe logo (`assets/icons/logo.svg`) is het favicon en de app-iconen zijn opnieuw gegenereerd.
- Documentatie en scripts zijn niet publiek bereikbaar.
- Uitleg staat in `GOOGLE.md`.

### Overig
- Licht/donker thema met systeemvoorkeur als startwaarde.
- Skeleton-loading, toetsenbordnavigatie, focusstijlen en `aria`-attributen.
- Responsieve layout voor mobiel, tablet en desktop.
- SPA-routing met hash-routes, dus geen server-configuratie per route nodig.
- Nederlandse teksten en foutmeldingen.

---

## 3. Bestandsstructuur

```
FLL/
├── index.html                 Basislayout, header, AI-paneel, instellingen, generator
├── styles.css                 Alle styling, thema's, covers en responsive regels
├── app.js                     Routing, filters, detailpagina, editor, voortgang, events, AI-paneel
├── manifest.webmanifest       App-manifest: naam, iconen, snelkoppelingen, venster
├── sw.js                      Service worker: offline-cache en app-shell
├── offline.html               Offline-pagina
├── js/
│   ├── ai.js                  Streaming, markdown, offline coach en generator
│   └── store.js               localStorage: voortgang, instellingen, thema, editor, eigen projecten
├── data/
│   ├── index.js               Datalaag: normaliseren, categorieën, covers, next-links
│   ├── helper.js              Compacte helpers voor projecten en stappen
│   └── ideas-01.js t/m ideas-07.js
├── assets/covers/             10 lokale SVG-omslagen
├── assets/icons/              Logo (`logo.svg`) en app-iconen: 192, 512, maskable en Apple
├── assets/qr/                 QR-code naar de live site voor installatie op Android
├── assets/easycodey.ico       Icoon voor de Windows-snelkoppeling
├── scripts/check-data.mjs     Controle van projectdata, manifest, offline-cache, pagina's en sitemap
├── scripts/build-pages.mjs    Genereert 161 vaste projectpagina's, het overzicht, de installatie-, contact- en doneerpagina en de sitemap
├── scripts/make-icons.mjs     App-iconen opnieuw maken met headless Chrome
├── idee/<id>/index.html       161 vaste, indexeerbare projectpagina's
├── projecten/index.html       Overzicht van alle projecten per categorie
├── installeren/index.html     Installatie-uitleg per platform met QR-code
├── contact/index.html         Nederlandstalige contactpagina met telefoon, WhatsApp en e-mail
├── doneren/index.html         Doneerpagina met IBAN, rekeninghouder, bank, BIC en transparantie
├── sitemap.xml                Startpagina, overzicht, installeren, contact, doneren en 161 projectpagina's (166 URL's)
├── server.js                  Statische server + AI-proxy (geen dependencies)
├── package.json               Scripts: start, dev, check, pages, build, icons
├── render.yaml                Render Blueprint
├── .env.example               Voorbeeldconfiguratie
├── .gitignore                 Sluit .env, node_modules en logs uit
├── README.md                  Handleiding voor gebruik en deployment
├── APP.md                     EasyCodey als app installeren en offline gebruiken
├── EINDRAPPORT.md             Overzicht van de oplevering en testresultaten
├── PUBLICATIE.md              Stap-voor-stap publicatie op GitHub en Render
├── GOOGLE.md                  Openbaar maken en laten indexeren door Google
└── start-easycodey.bat        Windows-startscript
```

---

## 4. Uitgevoerde tests

| Test | Resultaat |
|---|---|
| `npm run check` | ✅ 161 projecten, 711 stappen, 161 pagina's, 166 sitemap-URL's, 0 fouten |
| Datacontrole op dubbele id's, verplichte velden, stappen, tips, `next`-links en covers | ✅ |
| Syntaxcontrole `node --check` op `app.js`, `server.js`, `js/ai.js`, `js/store.js` | ✅ |
| Startpagina `/` | ✅ 200, `text/html` |
| `app.js`, `styles.css`, `data/index.js`, `data/ideas-07.js`, `js/ai.js`, `js/store.js` | ✅ 200 met juist `Content-Type` |
| Alle 10 categorie-covers | ✅ 200, `image/svg+xml` |
| `/api/config` | ✅ 200, `application/json`, inclusief doneervelden |
| `/robots.txt` | ✅ 200, `text/plain`, verwijst naar de sitemap |
| `/sitemap.xml` | ✅ 200, geldige XML met 166 URL's en `SITE_URL` |
| Doneerknop zonder `DONATE_URL` | ✅ verborgen |
| Doneerknop met `DONATE_URL` | ✅ zichtbaar, link en label kloppen |
| Python-speelveld (headless Chrome, Pyodide) | ✅ `print("Test", 2 + 3)` geeft `Test 5` |
| Speelveld sluiten en heropenen | ✅ werkt, runtime blijft geladen |
| Programmeer-editor `#/programmeren` | ✅ editor, actieve nav, juiste titel |
| Editor-uitvoer (headless Chrome, Pyodide) | ✅ `print("Editor test", 2 + 3)` geeft `Editor test 5` |
| Editor automatisch bewaren | ✅ code staat direct in `localStorage` |
| Editor: projectcode na eigen code | ✅ algemene editorcode wordt niet aan het oude project gekoppeld |
| Editor na herladen | ✅ code blijft bewaard, ook bij een project |
| Editor Ctrl + Enter | ✅ `print("Sneltoets", 6 * 7)` geeft `Sneltoets 42` |
| Editor voorbeelden, uitvoer wissen en downloaden | ✅ |
| Projectacties op detailpagina | ✅ **Speel dit idee**, **Programmeer dit idee**, **Download .py**, **Kopieer alle code** |
| Projectcode in de editor | ✅ alle stappen met commentaar en projectbanner |
| Kopiëren naar klembord | ✅ volledige projectcode op het klembord |
| Download `.py` vanaf detail en editor | ✅ bestanden bevatten de juiste code |
| Mobiele navigatie en editorlayout | ✅ nav op eigen rij, editor één kolom |
| Live GitHub Pages: editor, hero-link en projectacties | ✅ 9/9 live checks geslaagd |
| Manifest, iconen en snelkoppelingen | ✅ 4 PNG-iconen (192/512, maskable) met juiste afmetingen |
| Service worker actief en pagina onder controle | ✅ scope `/`, app-shell uit cache |
| Offline-cache gevuld | ✅ 34 bestanden |
| Installatie-uitleg in de app | ✅ 3 platformstappen, sluit correct |
| **Speel dit idee** op een projectpagina | ✅ volledige code (24 regels) en directe Pyodide-uitvoer |
| Site herladen zonder internet | ✅ laadt uit de cache |
| Python uitvoeren zonder internet | ✅ werkt na eenmalig laden |
| PWA-testsuite lokaal | ✅ 20/20 checks geslaagd |
| Chrome-installeerbaarheid | ✅ geen installability errors |
| PWA-testsuite op de live site | ✅ 11/11 checks geslaagd |
| Live: manifest, iconen en service worker | ✅ `application/manifest+json`, scope `/easycodey/` |
| Live: offline-cache en offline Python | ✅ 34 bestanden, Pyodide werkt offline |
| Live: wachtwoordaccount en chatknop | ✅ 8/8 live checks: aanmaken, inloggen, chatknop en updatecontrole |
| Nieuwe flows lokaal | ✅ 27/27 checks: invoerhulp, app-entry, wachtwoordaccounts, chatknop, back-up, automatische updates en HTTPS |
| Chique huisstijl in headless Chrome | ✅ Fraunces/Plus Jakarta Sans geladen, groen-goud-palet, geen horizontale overflow |
| Nieuw logo en app-iconen | ✅ `logo.svg`, 4 PNG-iconen en Apple-touch-icoon opnieuw gegenereerd |
| Vaste pagina's lokaal | ✅ 70/70 checks geslaagd |
| Projectpagina `/idee/dobbelsteen-simulator/` | ✅ eigen titel, description, canonical, H1, 3 stappen en 3 codeblokken |
| Projectpagina zonder slash | ✅ 301 naar de map met slash |
| Overzicht `/projecten/` | ✅ 161 links, 10 categorieën, zoekfilter en `CollectionPage` |
| Sitemap lokaal | ✅ geldige XML, 166 URL's, productie-startpagina aanwezig |
| Speel dit idee vanaf vaste pagina | ✅ app opent met `?play=1`, volledige code en Pyodide-uitvoer |
| Thema op vaste pagina | ✅ wisselt en wordt bewaard in `localStorage` |
| Mobiel overzicht | ✅ geen horizontale overflow, één kolom |
| Installatiepagina `/installeren/` | ✅ 6 secties, 3 Android-stappen, eigen titel en canonical |
| QR-code op installatiepagina | ✅ laadt als SVG en is zichtbaar op mobiel |
| Installatiepagina mobiel | ✅ geen horizontale overflow, één kolom |
| Contactpagina `/contact/` | ✅ telefoon/WhatsApp, e-mail, eigen titel, canonical en JSON-LD |
| Contactpagina mobiel | ✅ drie kaarten in één kolom, geen overflow |
| Doneerpagina `/doneren/` | ✅ IBAN, rekeninghouder, bank, BIC, kopieerknop en JSON-LD (`DonateAction`) |
| Doneerpagina mobiel | ✅ twee blokken in één kolom, geen overflow |
| Doneermodal in de app | ✅ toont IBAN en houder en linkt naar `/doneren/` |
| SPA-fallback voor onbekend pad | ✅ 200, levert `index.html` |
| `/api/chat` zonder sleutel | ✅ 401 met `no-key` |
| Toegangscode zonder code | ✅ 401 met `access-code` |
| Toegangscode met juiste code | ✅ verzoek toegestaan |
| Rate limiting | ✅ 429 na het ingestelde maximum |
| `/server.js`, `/package.json`, `/render.yaml`, alle `*.md`, `/.env.example`, `/scripts/check-data.mjs`, `/.git/config` | ✅ 404 (geblokkeerd) |
| Path traversal (`/../server.js`, `/%2e%2e/server.js`) | ✅ 404 |
| Oude projectnaam en oude coachnaam | ✅ geen verwijzingen meer |
| Import van kapotte JSON (lege stappen, ongeldige categorie/duur, dubbele id's) | ✅ schoongemaakt of geweigerd |
| Startpagina in headless Chrome | ✅ 30 kaarten, 30 covers, geen `undefined` |
| Projectpagina `#/idee/raad-het-getal` | ✅ 5 stappen, 5 codeblokken, 1 cover, juiste titel |
| Leerpad `#/leerpad` | ✅ 161 projecten gegroepeerd per niveau |
| Mijn ideeën `#/mijn-ideeen` | ✅ lege staat zonder projecten, 1 kaart met testproject |
| Filters via URL (`q`, `categorie`, `niveau`) | ✅ 2 resultaten, zoekveld en actieve chips kloppen |
| Filters wissen | ✅ 161 projecten, 30 kaarten, URL terug naar `#/` |
| Categorie Games + meer laden | ✅ 36 resultaten, 30 → 36 kaarten |
| Verras me | ✅ navigeert naar een bestaande projectpagina |
| Voortgang: 2 van 5 stappen | ✅ 40% en 2 afgevinkte stappen |
| Stap afvinken | ✅ opgeslagen als `[0,1,2]`, weergave 60% |
| Project afronden | ✅ alle 5 stappen opgeslagen, knop uitgeschakeld, 30 confettistukjes |
| Voortgang resetten | ✅ opslag leeg en 0 afgevinkte stappen |
| Onbekende route | ✅ "Niet gevonden"-pagina |

### Handmatig te testen na deployment
- Zoeken en alle filters combinieren.
- URL verversen: filters en voortgang moeten bewaard blijven.
- Alle stappen afvinken en de confetti/afgeronde status controleren.
- AI-coach zonder sleutel (offline) en met sleutel (online).
- Eigen project genereren, exporteren en op een ander apparaat importeren.
- Smal scherm en donker thema.

---

## 5. Opslag en privacy

- Voortgang, thema, AI-instellingen, eigen projecten en de editor-code staan in `localStorage`.
- Zonder account gebruikt de site de gastsleutel `easycodey.v1`; met een account `easycodey.v1.profile.<id>`.
- Accounts staan onder `easycodey.profiles.v1`, het actieve account onder `easycodey.activeProfile.v1`.
- Er is **geen account op een server, geen database en geen server-side opslag** van gebruikersdata. Accounts leven alleen op het apparaat.
- Het wachtwoord houdt accounts op hetzelfde apparaat uit elkaar, maar is geen sterke beveiliging.
- **Voortgang is per apparaat en per browser.** Op een ander apparaat begin je leeg, tenzij je een back-up herstelt.
- Met **Back-up downloaden/herstellen** op `#/profiel` verplaats je voortgang, eigen projecten en editor-code.
- Eigen projecten kun je daarnaast exporteren/importeren op **Mijn ideeën**.
- De API-sleutel hoort bij voorkeur in `.env` of in de Render-omgevingsvariabelen, niet in de broncode.
- `.env` staat in `.gitignore` en wordt nooit gecommit.
- De server blokkeert publieke toegang tot `server.js`, `package.json`, `render.yaml`, `README.md`, `.env*`, `scripts/` en `.git/`.

---

## 6. Lokaal draaien

Vereist: Node.js 18 of nieuwer.

```bash
npm start
```

Open daarna **http://localhost:4173**.

> Open de site via de server, niet via `file://`. De site gebruikt ES-modules; die werken niet als je `index.html` direct opent.

Op Windows kan ook `start-easycodey.bat` worden gebruikt.

Datacontrole en pagina's genereren:

```bash
npm run build
```

`npm run build` = `npm run pages` (161 vaste pagina's, overzicht en sitemap) + `npm run check` (alle controles).

---

## 7. Deployen naar Render

EasyCodey heeft **geen build-stap**.

- **Build Command:** `npm install`
- **Start Command:** `npm start`

Gebruik op Render `npm install` als build-stap. `npm run build` bestaat wel, maar genereert alleen de vaste pagina's en sitemap; die staan al in de repository. `npm install` is veilig omdat er geen dependencies zijn.

### Via GitHub (aanbevolen)

1. Maak een GitHub-repository.
2. Upload de inhoud van deze map. Gebruik GitHub Desktop als `git` niet geïnstalleerd is.
3. Ga naar [render.com](https://render.com) en kies **New → Web Service**.
4. Koppel de repository.
5. Kies runtime **Node**.
6. Vul Build Command `npm install` en Start Command `npm start` in.
7. Voeg optioneel omgevingsvariabelen toe.
8. Deploy.

### Via render.yaml (Blueprint)

`render.yaml` staat klaar. Kies **New → Blueprint**, koppel de repository en vul daarna de geheime variabelen in het Render-dashboard in.

### Omgevingsvariabelen

| Variabele | Verplicht | Omschrijving |
|---|---|---|
| `OPENAI_API_KEY` | Nee | Sleutel voor de AI-coach. Zonder sleutel werkt de offline coach. |
| `OPENAI_MODEL` | Nee | Modelnaam, standaard `gpt-4o-mini`. |
| `OPENAI_BASE_URL` | Nee | OpenAI-compatibele basis-URL, standaard `https://api.openai.com/v1`. |
| `ACCESS_CODE` | Nee | Vraagt bezoekers om een toegangscode voor de AI-coach. |
| `RATE_LIMIT` | Nee | Maximaal aantal AI-verzoeken per uur per IP, standaard 30. |
| `DONATE_URL` | Nee | Optionele externe doneerlink. Zonder link blijft de doneerknop zichtbaar zolang er een geldig IBAN is. |
| `DONATE_LABEL` | Nee | Tekst op de externe doneerknop, standaard "Doneer". |
| `DONATE_NOTE` | Nee | Extra toelichting in het doneervenster. |
| `DONATE_IBAN` | Nee | IBAN voor donaties per bankoverschrijving, standaard `BE69 0638 3621 2278`. |
| `DONATE_NAME` | Nee | Naam van de rekeninghouder, standaard `Yousef Abujarad (EasyCodey)`. |
| `DONATE_BANK` | Nee | Banknaam, standaard `Belfius`. |
| `SITE_URL` | Nee | Publieke URL voor `robots.txt` en `sitemap.xml`, standaard `https://yousefabujarad2014-beep.github.io/easycodey`. |
| `PORT` | Automatisch | Render zet deze zelf; `server.js` gebruikt `process.env.PORT`. |
| `HOST` | Nee | Standaard `0.0.0.0`; niet op `127.0.0.1` zetten op Render. |

### Gratis Render-tier

- De service gaat na ongeveer 15 minuten zonder verkeer in slaapstand.
- De eerste aanvraag daarna kan 30–60 seconden duren.
- Er is een beperkt aantal gratis uren per maand.
- Er is geen permanente schijf; gebruik geen server-side bestandsopslag voor gebruikersdata.
- `localStorage` in de browser blijft gewoon werken.

---

## 8. Een project toevoegen

Voeg een project toe aan een van de bestanden in `data/`:

```js
import { idea, step } from "./helper.js";

idea(
  "mijn-project",
  "Mijn project",
  "🚀",
  "Games",
  "Beginner",
  "45 min",
  "Eén zin voor op de kaart.",
  "Langere uitleg voor de detailpagina.",
  ["lists", "loops", "functies"],
  [
    step("Titel van de stap", "Wat je doet en waarom.", 'print("Hallo")'),
    step("Tweede stap", "Uitleg.", "for i in range(3):\n    print(i)"),
    step("Derde stap", "Uitleg.", "print('Klaar')")
  ],
  ["Tip 1", "Tip 2"],
  ["bestaand-project-id"]
);
```

Daarna:

```bash
npm run build
```

`npm run build` genereert de vaste pagina's en de sitemap en controleert daarna op dubbele id's, ontbrekende velden, kapotte tekencodering, te weinig stappen, ongeldige `next`-links, ontbrekende covers, ontbrekende projectpagina's en URL's die niet in de sitemap staan.

Een eigen afbeelding toevoegen kan met een `image`-veld, bijvoorbeeld `assets/covers/mijn-project.svg`. Zonder `image` gebruikt EasyCodey de cover van de categorie.

---

## 9. Publicatie en wat nog moet gebeuren

De site staat live:

| Onderdeel | Status |
|---|---|
| GitHub-repository | ✅ https://github.com/yousefabujarad2014-beep/easycodey |
| GitHub Pages | ✅ https://yousefabujarad2014-beep.github.io/easycodey/ |
| Windows-snelkoppelingen | ✅ bureaublad + startmenu |
| Python-speelveld op de live site | ✅ |
| Programmeer-editor op de live site | ✅ |
| Installeerbare app (PWA) | ✅ manifest, service worker, offline-cache en **App bijwerken** |
| Chique huisstijl + logo | ✅ ivoor/diepgroen/goud en eigen monogram |
| Optionele profielen + back-up | ✅ `#/profiel`, lokale profielen en JSON-back-up |
| Invoerhulp bij `input()` | ✅ in speelveld en op projectpagina's |
| 161 vaste projectpagina's + overzicht | ✅ `/idee/<id>/` en `/projecten/` |
| Installatiepagina met QR-code | ✅ `/installeren/` |
| Contactpagina | ✅ `/contact/` met telefoon/WhatsApp en e-mail |
| Doneerpagina | ✅ `/doneren/` met IBAN, houder, bank, BIC en transparantie |
| Sitemap met 166 URL's | ✅ gegenereerd door `npm run pages` |
| Online AI-coach | ⏳ alleen op Render; Pages gebruikt de offline coach |
| Doneren | ✅ Belfius IBAN via `site-config.json` en de doneerpagina |

Wat optioneel nog kan:

1. Render Web Service of Blueprint koppelen voor de online AI-coach (`npm install`, `npm start`).
2. `OPENAI_API_KEY`, `SITE_URL` en eventueel `DONATE_URL` in Render instellen.
3. Site aanmelden bij Google Search Console en de sitemap met 166 URL's insturen; zie `GOOGLE.md`.
4. Optioneel: eigen domein koppelen.

---

## 10. Bekende beperkingen

- Optionele lokale profielen, maar geen accounts op een server en geen automatische synchronisatie tussen apparaten. Gebruik de back-up om te verhuizen.
- De gratis Render-tier heeft een slaapstand en beperkte uren.
- AI-antwoorden kunnen fouten bevatten; de site vraagt gebruikers code altijd zelf te testen.
- De offline coach is bewust algemeen en kan niet meedenken over willekeurige eigen code.
- De rate limiter houdt tellers in het geheugen; na een herstart begint de telling opnieuw.
- Er is geen automatische testrunner; `npm run check` controleert de data en de app-bestanden, niet de UI.
- Het Python-speelveld en de editor hebben een eenmalige download van ongeveer 10 MB nodig.
- `input()` opent een venster bovenaan het scherm met een tekstvak. Een oneindige loop stopt pas als je het tabblad of venster sluit.
- Editor-code en profielen staan per browser/apparaat in `localStorage`; er is geen account op een server of automatische synchronisatie.
- De geïnstalleerde app deelt de opslag met de website in dezelfde browser, maar niet met andere apparaten.
- Offline werkt alles behalve de online AI-coach en doneren; de offline coach blijft beschikbaar.
- De service worker werkt alleen via `https://` of `localhost`, niet als los bestand (`file://`).
- De vaste projectpagina's worden statisch gegenereerd. Na een datawijziging moet je `npm run pages` of `npm run build` opnieuw uitvoeren.
- De hash-routes van de interactieve app staan niet in de sitemap; Google indexeert de vaste pagina's op `/idee/<id>/`.
- Donaties lopen via een bankoverschrijving of externe aanbieder; de site verwerkt zelf geen betalingen.
