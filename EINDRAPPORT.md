# EasyCodey — eindrapport

**Datum:** 7 november 2026
**Map:** `C:\Users\Home\Desktop\FLL`
**Status:** inhoudelijk klaar, klaar voor deployment

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
- Bereikbaar via **▶ Probeer Python** in de hero en via de footer.
- Python draait via Pyodide (WebAssembly) volledig in de browser.
- De runtime wordt pas geladen als iemand het speelveld opent en op **Uitvoeren** klikt.
- Zes voorbeelden: hallo wereld, rekenen, loops, lijsten, functies en "Raad het getal" zonder `input()`.
- Uitvoer en foutmeldingen verschijnen direct in het paneel.
- Geen code of uitvoer gaat naar de server.
- Bij een netwerkfout verschijnt een duidelijke melding; de rest van de site blijft werken.

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
├── app.js                     Routing, filters, detailpagina, voortgang, events, AI-paneel
├── js/
│   ├── ai.js                  Streaming, markdown, offline coach en generator
│   └── store.js               localStorage: voortgang, instellingen, thema, eigen projecten
├── data/
│   ├── index.js               Datalaag: normaliseren, categorieën, covers, next-links
│   ├── helper.js              Compacte helpers voor projecten en stappen
│   └── ideas-01.js t/m ideas-07.js
├── assets/covers/             10 lokale SVG-omslagen
├── assets/easycodey.ico       Icoon voor de Windows-snelkoppeling
├── scripts/check-data.mjs     Controle van alle projectdata
├── server.js                  Statische server + AI-proxy (geen dependencies)
├── package.json               Scripts: start, dev, check
├── render.yaml                Render Blueprint
├── .env.example               Voorbeeldconfiguratie
├── .gitignore                 Sluit .env, node_modules en logs uit
├── README.md                  Handleiding voor gebruik en deployment
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

- Voortgang, thema, AI-instellingen en eigen projecten staan in `localStorage` onder de sleutel `easycodey.v1`.
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
| Online AI-coach | ⏳ alleen op Render; Pages gebruikt de offline coach |
| Doneerlink | ⏳ wacht op de link van de gebruiker |

Wat optioneel nog kan:

1. Render Web Service of Blueprint koppelen voor de online AI-coach (`npm install`, `npm start`).
2. `OPENAI_API_KEY`, `SITE_URL` en eventueel `DONATE_URL` in Render instellen.
3. Doneerlink invullen in `site-config.json` (Pages) en/of `DONATE_URL` (server).
4. Site aanmelden bij Google Search Console en de sitemap insturen; zie `GOOGLE.md`.
5. Optioneel: eigen domein koppelen.

---

## 10. Bekende beperkingen

- Geen accounts en geen synchronisatie tussen apparaten; alles is lokaal.
- De gratis Render-tier heeft een slaapstand en beperkte uren.
- AI-antwoorden kunnen fouten bevatten; de site vraagt gebruikers code altijd zelf te testen.
- De offline coach is bewust algemeen en kan niet meedenken over willekeurige eigen code.
- De rate limiter houdt tellers in het geheugen; na een herstart begint de telling opnieuw.
- Er is geen automatische testrunner; `npm run check` controleert de data, niet de UI.
- Het Python-speelveld heeft een eenmalige download van ongeveer 10 MB nodig en ondersteunt geen `input()`.
- Door de hash-routes indexeert Google alleen de startpagina, niet de losse projectpagina's.
- Donaties lopen via een externe aanbieder; de site verwerkt zelf geen betalingen.
