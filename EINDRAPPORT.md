# EasyCodey — eindrapport

**Datum:** 8 november 2026
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
- `input()` opent een invoer-pop-up.
- Geen code of uitvoer gaat naar de server.
- Bij een netwerkfout verschijnt een duidelijke melding; de rest van de site blijft werken.

### Programmeer-editor (`#/programmeren`)
- Volledige editor met een groot codeveld en een apart uitvoerpaneel.
- **▶ Uitvoeren** en **Ctrl + Enter** voeren de code uit via dezelfde Pyodide-runtime.
- **Download .py** bewaart het programma als Python-bestand.
- **Kopieer** zet de code op het klembord.
- Automatisch bewaren in `localStorage`; de code staat na herladen nog in de editor.
- Voorbeelden laden, uitvoer wissen, **Tab** invoegen als vier spaties en de editor leegmaken.
- **Projectcode opnieuw laden** en **Terug naar project** in de projectbalk.
- Op mobiel staat de navigatie op een eigen scrollbare rij en wordt de editor één kolom.

### Installeerbare app (PWA)
- `manifest.webmanifest` met naam, korte naam, beschrijving, start-URL, kleuren en snelkoppelingen naar **Programmeren**, **Leerpad** en **Mijn ideeën**.
- Vier PNG-app-iconen (192 en 512 px, gewoon en maskable) plus een Apple-touch-icoon.
- `sw.js` bewaart de app-shell (33 bestanden) bij de eerste installatie.
- **Network-first** voor navigatie, **stale-while-revalidate** voor statische bestanden en **cache-first** voor de CDN.
- De Python-runtime en lettertypen komen in een aparte runtime-cache, zodat Python na de eerste keer offline werkt.
- `offline.html` verschijnt als een pagina niet in de cache staat.
- **📲 Installeer als app** in de header en footer, met uitleg per platform en een **Installeer nu**-knop zodra de browser dat ondersteunt.
- In een geïnstalleerde app verdwijnt de installeerknop en opent de site in een eigen venster.
- Werkt op GitHub Pages zonder server; de service worker draait alleen via `https://` of `localhost`.

### Donaties
- Optionele doneerknop in de header en footer.
- De knop blijft verborgen tot `DONATE_URL` is ingesteld.
- Link, label en toelichting komen via `/api/config` uit omgevingsvariabelen.
- Ondersteunt elke https-link, bijvoorbeeld Ko-fi, Buy Me a Coffee, PayPal.me of Stripe.
- De site verwerkt zelf geen betalingen en bewaart geen betaalgegevens.

### Vindbaarheid
- `/robots.txt` staat indexering toe en verwijst naar de sitemap.
- `/sitemap.xml` wordt dynamisch opgebouwd met `SITE_URL`.
- Titel, description, canonical, Open Graph, Twitter-kaarten en JSON-LD staan in `index.html`.
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
├── assets/icons/              App-iconen: 192, 512, maskable en Apple
├── assets/easycodey.ico       Icoon voor de Windows-snelkoppeling
├── scripts/check-data.mjs     Controle van projectdata, manifest en offline-cache
├── scripts/make-icons.mjs     App-iconen opnieuw maken met headless Chrome
├── server.js                  Statische server + AI-proxy (geen dependencies)
├── package.json               Scripts: start, dev, check, icons
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
| `npm run check` | ✅ 161 projecten, 711 stappen, 0 fouten |
| Datacontrole op dubbele id's, verplichte velden, stappen, tips, `next`-links en covers | ✅ |
| Syntaxcontrole `node --check` op `app.js`, `server.js`, `js/ai.js`, `js/store.js` | ✅ |
| Startpagina `/` | ✅ 200, `text/html` |
| `app.js`, `styles.css`, `data/index.js`, `data/ideas-07.js`, `js/ai.js`, `js/store.js` | ✅ 200 met juist `Content-Type` |
| Alle 10 categorie-covers | ✅ 200, `image/svg+xml` |
| `/api/config` | ✅ 200, `application/json`, inclusief doneervelden |
| `/robots.txt` | ✅ 200, `text/plain`, verwijst naar de sitemap |
| `/sitemap.xml` | ✅ 200, geldige XML met `SITE_URL` |
| Doneerknop zonder `DONATE_URL` | ✅ verborgen |
| Doneerknop met `DONATE_URL` | ✅ zichtbaar, link en label kloppen |
| Python-speelveld (headless Chrome, Pyodide) | ✅ `print("Test", 2 + 3)` geeft `Test 5` |
| Speelveld sluiten en heropenen | ✅ werkt, runtime blijft geladen |
| Programmeer-editor `#/programmeren` | ✅ editor, actieve nav, juiste titel |
| Editor-uitvoer (headless Chrome, Pyodide) | ✅ `print("Editor test", 2 + 3)` geeft `Editor test 5` |
| Editor automatisch bewaren | ✅ code staat direct in `localStorage` |
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
| Offline-cache gevuld | ✅ 33 bestanden |
| Installatie-uitleg in de app | ✅ 3 platformstappen, sluit correct |
| **Speel dit idee** op een projectpagina | ✅ volledige code (24 regels) en directe Pyodide-uitvoer |
| Site herladen zonder internet | ✅ laadt uit de cache |
| Python uitvoeren zonder internet | ✅ werkt na eenmalig laden |
| PWA-testsuite lokaal | ✅ 19/19 checks geslaagd |
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

- Voortgang, thema, AI-instellingen, eigen projecten en de editor-code staan in `localStorage` onder de sleutel `easycodey.v1`.
- Er is geen account, geen database en geen server-side opslag van gebruikersdata.
- **Voortgang is per apparaat en per browser.** Op een ander apparaat begin je leeg.
- Eigen projecten verplaats je met exporteren/importeren op **Mijn ideeën**.
- Voortgang zelf wordt niet geëxporteerd.
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

Datacontrole:

```bash
npm run check
```

---

## 7. Deployen naar Render

EasyCodey heeft **geen build-stap**.

- **Build Command:** `npm install`
- **Start Command:** `npm start`

Gebruik niet `npm run build`; dat script bestaat bewust niet. `npm install` is veilig omdat er geen dependencies zijn.

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
| `DONATE_URL` | Nee | Doneerlink. Zonder deze waarde blijft de doneerknop verborgen. |
| `DONATE_LABEL` | Nee | Tekst op de doneerknop, standaard "Doneer". |
| `DONATE_NOTE` | Nee | Extra toelichting in het doneervenster. |
| `DONATE_IBAN` | Nee | IBAN voor donaties per bankoverschrijving. |
| `DONATE_NAME` | Nee | Naam van de rekeninghouder. |
| `DONATE_BANK` | Nee | Banknaam, bijvoorbeeld `Belfius`. |
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
npm run check
```

De controle kijkt op dubbele id's, ontbrekende velden, kapotte tekencodering, te weinig stappen, ongeldige `next`-links en ontbrekende covers.

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
| Installeerbare app (PWA) | ✅ manifest, service worker en offline-cache |
| Online AI-coach | ⏳ alleen op Render; Pages gebruikt de offline coach |
| Doneerlink | ✅ Belfius IBAN via `site-config.json` |

Wat optioneel nog kan:

1. Render Web Service of Blueprint koppelen voor de online AI-coach (`npm install`, `npm start`).
2. `OPENAI_API_KEY`, `SITE_URL` en eventueel `DONATE_URL` in Render instellen.
3. Site aanmelden bij Google Search Console en de sitemap insturen; zie `GOOGLE.md`.
4. Optioneel: eigen domein koppelen.

---

## 10. Bekende beperkingen

- Geen accounts en geen synchronisatie tussen apparaten; alles is lokaal.
- De gratis Render-tier heeft een slaapstand en beperkte uren.
- AI-antwoorden kunnen fouten bevatten; de site vraagt gebruikers code altijd zelf te testen.
- De offline coach is bewust algemeen en kan niet meedenken over willekeurige eigen code.
- De rate limiter houdt tellers in het geheugen; na een herstart begint de telling opnieuw.
- Er is geen automatische testrunner; `npm run check` controleert de data en de app-bestanden, niet de UI.
- Het Python-speelveld en de editor hebben een eenmalige download van ongeveer 10 MB nodig.
- `input()` opent een pop-up. Een oneindige loop stopt pas als je het tabblad of venster sluit.
- Editor-code staat per browser/apparaat in `localStorage`; er is geen account of synchronisatie.
- De geïnstalleerde app deelt de opslag met de website in dezelfde browser, maar niet met andere apparaten.
- Offline werkt alles behalve de online AI-coach en doneren; de offline coach blijft beschikbaar.
- De service worker werkt alleen via `https://` of `localhost`, niet als los bestand (`file://`).
- Door de hash-routes indexeert Google alleen de startpagina, niet de losse projectpagina's.
- Donaties lopen via een bankoverschrijving of externe aanbieder; de site verwerkt zelf geen betalingen.
