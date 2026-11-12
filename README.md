# EasyCodey

Leer Python door echte projecten te bouwen. EasyCodey is een Nederlandstalige website met **161 projecten**, stap-voor-stap uitleg, codeblokken, voortgang per project en een AI-coach die je helpt als je vastloopt.

**161 projecten · 711 stappen · 10 categorieën · 3 niveaus**

## Live website

De site staat online op **GitHub Pages**:

**https://yousefabujarad2014-beep.github.io/easycodey/**

Op GitHub Pages werkt alles behalve de online AI-coach (daar is de Node-server voor nodig). De site valt daar automatisch terug op de offline coach. Het Python-speelveld, de programmeer-editor en alle 161 projecten werken volledig.

## Snel starten

De makkelijkste en veiligste manier is de live app:

```
https://yousefabujarad2014-beep.github.io/easycodey/
```

Op Windows kun je dubbelklikken op **`start-easycodey.bat`** of **`EasyCodey.url`**. Die openen de beveiligde HTTPS-versie in je browser.

Wil je lokaal ontwikkelen? Je hebt [Node.js](https://nodejs.org) nodig (versie 18 of nieuwer). Er zijn geen pakketten om te installeren en er is geen build-stap.

```bash
npm start
```

Open daarna **http://localhost:4173** in je browser. Op Windows kan dat ook met `start-easycodey.bat local` of `start-easycodey-local.bat`.

> Open de site via de server, niet via `file://`. De site gebruikt ES-modules en die werken niet als je `index.html` direct opent. Gebruik voor de echte app altijd de HTTPS-link hierboven; dan zie je het slotje in de adresbalk.

## Wat zit erin?

- **161 projecten** van Beginner tot Gevorderd, verdeeld over Games, Web, GUI, Data & AI, Handige tools, Automatisering, Security, Wetenschap, Kunst & Creatief en Onderwijs.
- Elke opdracht heeft een omslagafbeelding, uitleg, een stappenplan met code per stap, tips en vervolgprojecten.
- **Voortgang bijhouden**: vink stappen af. Je voortgang wordt lokaal in je browser opgeslagen (`localStorage`).
- **Optioneel account** (`#/profiel`): meld je snel aan zoals bij Kahoot, met alleen een naam en een wachtwoord. Elk account heeft eigen voortgang, eigen projecten en eigen editor-code. Zonder account werkt alles gewoon als gast. Je kunt optioneel een e-mailadres of telefoonnummer toevoegen; dat blijft lokaal en wordt nooit verstuurd.
- **Chat met je coach**: zodra je bent ingelogd verschijnt er een chatknop in de footer en als zwevende knop rechtsonder. Op Android en laptop opent die direct EasyCoach. Je profielpagina heeft daarnaast een grote chatkaart.
- **Back-up**: download je profieldata als JSON en zet die op een ander apparaat weer terug.
- **Eigenaarspaneel** (`#/eigenaar`): log in als eigenaar op **Mijn profiel** (naam + wachtwoord) en het beheer opent zonder code; met de eigenaarscode kan het ook. Je ziet hoeveel profielen er op dit apparaat zijn, wat hun voortgang is, de app-status en optioneel anonieme bezoekcijfers via GoatCounter. Er is geen server: je ziet alleen dit apparaat.
- **Gratis Android-app**: download de APK op `/download/` (versie 1.0.0, 1,89 MB) en installeer zonder Google Play. De app opent de website, werkt offline en houdt de inhoud automatisch actueel.
- **Zoeken en filteren** op trefwoord, categorie, niveau, tijdsduur, meerdere vaardigheden, alleen niet-afgeronde projecten en sorteren.
- **Filters in de URL**, bijvoorbeeld `#/?q=weer&categorie=Web&niveau=Gemiddeld&duur=kort`. Handig om een selectie te bewaren of te delen.
- **Leerpad** met alle projecten per niveau en een categorie-filter.
- **Mijn ideeën**: eigen AI-projecten bewaren, verwijderen en exporteren/importeren als JSON.
- **AI-coach EasyCoach** in een zijpaneel, met context van het project en de stap die je bekijkt.
- **Offline coach**: werkt direct zonder API-sleutel. Herkent je onderwerp en geeft een stappenplan plus passende projecten.
- **AI-generator**: beschrijf een idee en krijg een compleet project met titel, niveau, duur, stappen, code en tips.
- **Python-speelveld**: typ Python en voer het direct in de browser uit via Pyodide (WebAssembly). Zonder server, zonder account.
- **Duidelijke invoerhulp**: vraagt een project om invoer, dan legt EasyCodey uit dat je je antwoord typt in het venster bovenaan je scherm. Dat venster toont de **vraag van het programma** en een tekstvak. Die uitleg staat bij het speelveld, op de projectpagina en op elke vaste projectpagina.
- **Programmeer-editor** (`#/programmeren`): een volledige editor met uitvoerpaneel, voorbeelden, automatisch bewaren, downloaden als `.py` en kopiëren.
- **Projectcode in de editor**: elk project heeft **▶ Speel dit idee**, **⌨ Gebruik dit idee**, **⌨ Programmeer zelf**, **Download .py** en **Kopieer alle code**. **Speel dit idee** toont de speelbare app, **Gebruik dit idee** toont alle code en **Programmeer zelf** opent het hele project als één programma in de editor, met commentaar per stap.
- **App-weergave per project**: elke projectpagina opent standaard in een schone, app-achtige preview zonder code. Met de knoppen **▶ Speel dit idee** en **⌨ Gebruik dit idee** schakel je tussen spelen en leren; de app en de code zitten dus samen in dezelfde twee acties. De previews zijn echte, interactieve demo's (Snake, Tetris, Pong, rekenmachine, weer, portscanner, simulaties enz.) en hebben voor alle 161 projecten een passende weergave.
- **Installeerbare app (PWA)**: zet EasyCodey met een eigen icoon op je computer of telefoon. De app opent in een eigen venster en werkt na de eerste keer ook offline. De app controleert **automatisch** op updates (bij de start, elke 15 minuten, bij terugkeer naar de app en zodra je weer online bent) en werkt zichzelf bij. Je hoeft zelf niets te doen.
- **Chique huisstijl**: warm ivoor, diepgroen en goud, met Fraunces voor koppen, verfijnde kaarten en donkere code- en footerblokken. Het logo is een eigen monogram (diepgroen vierkant, gouden rand en ivoren **E**).
- **Doneren**: vaste pagina `/doneren/` met IBAN, naam van de rekeninghouder, bank, BIC, uitleg en transparantie. Optioneel koppel je daarnaast een externe doneerlink.
- **Vindbaar op Google**: robots.txt, sitemap.xml, canonical, Open Graph en gestructureerde data zijn ingebouwd. Elk project heeft daarnaast een eigen vaste pagina op `/idee/<id>/` met eigen titel, description en JSON-LD.
- Licht/donker thema, skeleton-loading, toetsenbordnavigatie, confetti bij het afronden en een volledig responsieve layout.
- Lokale SVG-omslagen per categorie. Geen externe afbeeldingsdiensten.

## Projectstructuur

```
FLL/
├── index.html              Basislayout, header, AI-paneel, instellingen en generator
├── styles.css              Alle styling, thema's, covers en responsive regels
├── app.js                  Routing, filters, voortgang, editor, events en AI-paneel
├── manifest.webmanifest    App-manifest: naam, iconen, snelkoppelingen en venster
├── sw.js                   Service worker: offline-cache en app-shell
├── offline.html            Pagina die verschijnt als je offline bent
├── js/
│   ├── ai.js               Streaming, markdown, offline coach en generator
│   ├── previews.js         Interactieve app-previews en de schakelaar tussen app en code
│   └── store.js            Opslag van voortgang, instellingen, thema, editor en eigen projecten
├── data/
│   ├── index.js            Centrale datalaag: normaliseren, covers en metadata
│   ├── helper.js           Compacte helpers voor projecten en stappen
│   └── ideas-01.js t/m ideas-07.js
├── assets/covers/          Tien lokale SVG-omslagen
├── assets/icons/           Logo en app-iconen (SVG, 192, 512, maskable en Apple)
├── assets/easycodey.ico     Icoon voor de Windows-snelkoppeling
├── scripts/check-data.mjs  Controle van de projectdata en de app-bestanden
├── scripts/build-pages.mjs Genereert de vaste pagina's, het overzicht en de sitemap
├── scripts/make-icons.mjs  App-iconen opnieuw maken met headless Chrome
├── idee/<id>/index.html    161 vaste, indexeerbare projectpagina's
├── projecten/index.html    Overzicht van alle projecten
├── installeren/index.html  Installatie-uitleg met QR-code
├── contact/index.html      Contactpagina met telefoon, WhatsApp en e-mail
├── doneren/index.html      Doneerpagina met IBAN, bank en transparantie
├── sitemap.xml             Alle vaste pagina's en projecten
├── server.js               Statische server + AI-proxy (geen dependencies)
├── render.yaml             Render Blueprint
├── .env.example            Voorbeeldconfiguratie
├── APP.md                  EasyCodey als app installeren en offline gebruiken
├── PLAYSTORE.md            EasyCodey in Google Play: TWA, keystore, assets en checklist
├── EINDRAPPORT.md          Overzicht van de oplevering en testresultaten
├── PUBLICATIE.md           Stap-voor-stap publicatie op GitHub en Render
├── GOOGLE.md               Site openbaar maken en laten indexeren door Google
├── EasyCodey.url           Snelkoppeling naar de beveiligde live-app
├── start-easycodey.bat     Opent de beveiligde live-app (of lokaal met `local`)
└── start-easycodey-local.bat  Start de lokale ontwikkelserver
```

## Een project toevoegen

Voeg een project toe aan een van de bestanden in `data/`. Gebruik bij voorkeur de helpers:

```js
import { idea, step } from "./helper.js";

idea(
  "mijn-project",                    // uniek id, kleine letters en streepjes
  "Mijn project",                    // titel
  "🚀",                              // emoji
  "Games",                           // categorie
  "Beginner",                        // Beginner | Gemiddeld | Gevorderd
  "45 min",                          // tijdsduur
  "Eén zin voor op de kaart.",
  "Langere uitleg voor de detailpagina.",
  ["lists", "loops", "functies"],    // minimaal 3 leerdoelen
  [
    step("Titel van de stap", "Wat je doet en waarom.", 'print("Hallo")'),
    step("Tweede stap", "Uitleg.", "for i in range(3):\n    print(i)"),
    step("Derde stap", "Uitleg.", "print('Klaar')")
  ],
  ["Tip 1", "Tip 2"],                // minimaal 1 tip
  ["bestaand-project-id"]            // optioneel; de datalaag vult dit aan
)
```

Wil je een eigen afbeelding gebruiken? Voeg een `image`-veld toe met een lokaal pad, bijvoorbeeld `assets/covers/mijn-project.svg`. Zonder `image` gebruikt EasyCodey automatisch de cover van de categorie.

Na het toevoegen:

```bash
npm run build
```

`npm run build` doet twee dingen:

1. `npm run pages` — genereert `idee/<id>/index.html` voor elk project, `projecten/index.html` en `sitemap.xml`.
2. `npm run check` — controleert alle projectdata, het manifest, de offline-cache, de vaste pagina's, het overzicht en de sitemap.

De controle kijkt op dubbele id's, ontbrekende velden, kapotte tekencodering, te weinig stappen, ongeldige `next`-links, ontbrekende covers, ontbrekende projectpagina's en URL's die niet in de sitemap staan.

> Voer `npm run pages` (of `npm run build`) opnieuw uit na **elke** wijziging in `data/`. Anders verouderen de vaste pagina's en de sitemap.

## AI-coach instellen

De site werkt meteen met de offline coach. Voor echte AI-antwoorden heb je een OpenAI-sleutel (of een andere OpenAI-compatibele API) nodig.

### Optie 1: via `.env` (aanbevolen)

1. Kopieer `.env.example` naar `.env`.
2. Vul je sleutel in:

```env
OPENAI_API_KEY=sk-jouw-sleutel
OPENAI_MODEL=gpt-4o-mini
OPENAI_BASE_URL=https://api.openai.com/v1
```

3. Herstart de server met `npm start`.

De sleutel blijft op de server en komt niet in je browser terecht.

### Optie 2: via de instellingen in de site

Klik in het AI-paneel op het tandwiel (⚙) en plak je sleutel. Die wordt alleen lokaal in je browser opgeslagen en via de lokale server doorgestuurd. Gebruik dit niet op een gedeelde computer.

> **Let op:** deel je API-sleutel nooit, zet hem niet in je code en commit `.env` niet. AI-antwoorden kunnen fouten bevatten; test je code altijd zelf.

### Toegangscode en rate limiting

Op een publieke deploy kun je de AI-coach beschermen:

- `ACCESS_CODE`: bezoekers moeten deze code in de instellingen invoeren.
- `RATE_LIMIT`: maximaal aantal AI-verzoeken per uur per IP-adres (standaard 30).

Beide zijn optioneel. Zonder `ACCESS_CODE` is de AI-coach openbaar bereikbaar zodra er een server-sleutel is ingesteld.

## Python uitproberen in de browser

In de hero staat **⌨ Programmeer zelf** (naar de editor) en **▶ Snel proberen** (speelveld). In de footer staan **Programmeer zelf** en **Probeer Python**. Voor echt werk is er de volledige editor op **`#/programmeren`**, ook bereikbaar via de navigatie.

### Programmeer-editor

- Grote code-editor met een apart uitvoerpaneel.
- **▶ Uitvoeren** of **Ctrl + Enter** voert je code uit.
- **Download .py** bewaart je programma als Python-bestand.
- **Kopieer** zet de volledige code op je klembord.
- Je code wordt automatisch lokaal bewaard (`localStorage`) en staat er na een herlaadbeurt nog.
- Voorbeelden laden, uitvoer wissen en met **Tab** vier spaties invoegen.
- Op een projectpagina staan **Programmeer zelf**, **Download .py** en **Kopieer alle code**. De editor laadt dan alle stappen als één programma, met een commentaarregel per stap.

### Zo werkt het

- Python draait via **Pyodide** (WebAssembly) in de browser.
- De eerste keer wordt ongeveer 10 MB gedownload; daarna is het snel.
- Code wordt niet naar de server gestuurd.
- `input()` opent bovenaan je scherm een venster met de **vraag van het programma** en een tekstvak. Typ je antwoord daar en druk op **Enter**. EasyCodey toont die uitleg ook bij het speelveld en op de projectpagina's. Een oneindige loop kun je alleen stoppen door het tabblad of venster te sluiten.
- Na de eerste keer bewaart de service worker de Python-runtime, zodat de editor en het speelveld ook offline werken.
- Op een projectpagina toont **▶ Speel dit idee** de speelbare app; **⌨ Gebruik dit idee** toont alle code en **⌨ Programmeer zelf** opent dezelfde code in de editor. De vaste projectpagina's hebben dezelfde twee knoppen, plus **Programmeer zelf** voor de echte Python-uitvoer.

Er zijn voorbeelden ingebouwd: hallo wereld, rekenen, loops, lijsten, functies en een variant van "Raad het getal" zonder `input()`.

## Als app installeren (PWA)

EasyCodey is een installeerbare webapp. Je gebruikt dezelfde site en dezelfde voortgang, maar met een eigen icoon en een eigen venster.

1. Open de live site in **Chrome** of **Edge**.
2. Klik in de header op het **installatie-icoon** of gebruik het menu ⋮ → **App installeren**.
3. Op Android: menu ⋮ → **App installeren** of **Toevoegen aan startscherm**.
4. Op iPhone/iPad: **Deel** → **Zet op beginscherm**.

Er is ook een aparte pagina **`/installeren/`** met een QR-code en uitleg per platform. Scan de QR-code met je Android-telefoon om de site meteen te openen.

Daarna start je EasyCodey als een gewoon programma. De app werkt offline: alle projecten, je voortgang en de editor staan lokaal. Python werkt offline zodra je het één keer online hebt gebruikt. De online AI-coach blijft internet nodig hebben; de offline coach werkt altijd.

EasyCodey haalt code en styles altijd eerst van het netwerk, zodat je nooit achter een oude versie blijft hangen. Een nieuwe service worker neemt automatisch over. Je hoeft zelf niets te doen. HTTP wordt automatisch naar HTTPS omgeleid (behalve op localhost). De live app gebruikt HTTPS met een geldig certificaat en HSTS.

Valt het netwerk weg of laadt een bestand niet? Dan start de app uit de bewaarde cache in plaats van te blijven wachten. De grote preview-module wordt pas bij een project geladen; lukt dat niet, dan schakelt de pagina automatisch naar de volledige code. Start de app helemaal niet, dan verschijnt een herstelscherm met **Opnieuw proberen** en **App-cache wissen en herladen** — je voortgang blijft daarbij bewaard.

Meer uitleg over installeren, bijwerken en de iconen staat in `APP.md`. Wil je EasyCodey ook via
Google Play installeren, lees dan `PLAYSTORE.md`.

## Donaties instellen

De doneerknop verschijnt zodra er een **geldig IBAN** of een doneerlink is ingesteld. Met de meegeleverde `site-config.json` staat de knop dus aan. Bezoekers zien het IBAN, kunnen het kopiëren en maken zelf een overschrijving via hun bankapp.

De volledige uitleg staat op de vaste pagina **`/doneren/`**: IBAN, naam van de rekeninghouder, bank, BIC, stappen, besteding en transparantie. De pagina wordt gegenereerd door `scripts/build-pages.mjs`.

1. (Optioneel) Maak een doneerlink bij bijvoorbeeld [Ko-fi](https://ko-fi.com), [Buy Me a Coffee](https://buymeacoffee.com), [PayPal.me](https://www.paypal.me) of een Stripe Payment Link.
2. Zet de link in `.env`:

```env
DONATE_URL=https://ko-fi.com/jouw-naam
DONATE_LABEL=Doneer via Ko-fi
DONATE_NOTE=Elke bijdrage helpt om nieuwe projecten toe te voegen.
```

3. Herstart de server.

Zodra een doneerlink of geldig IBAN is ingesteld, verschijnen het hartje in de header en de link in de footer. De site verwerkt zelf geen betalingen en bewaart geen betaalgegevens.

Op **GitHub Pages** is er geen server. Zet dezelfde gegevens dan in `site-config.json`:

```json
{
  "analyticsSite": "",
  "publicCounter": "easycodey-yousef",
  "donateUrl": "",
  "donateLabel": "",
  "donateNote": "Elke bijdrage helpt om EasyCodey online te houden en nieuwe projecten toe te voegen.",
  "donateIban": "BE69 0638 3621 2278",
  "donateName": "Yousef Abujarad (EasyCodey)",
  "donateBank": "Belfius"
}
```

- `publicCounter` is de naam van de ingebouwde anonieme teller. Laat je hem leeg, dan worden bezoeken, installaties en APK-downloads niet geteld.
- `analyticsSite` is optioneel. Vul hier je gratis GoatCounter-sitecode in voor uitgebreidere inzichten (populaire projecten, versies, regio). Zonder code wordt er niets naar GoatCounter verstuurd.

Commit en push daarna. De site gebruikt `site-config.json` automatisch als `/api/config` niet beschikbaar is.

### Doneren per bankoverschrijving

Een persoonlijke bankrekening heeft geen openbare betaallink. Daarom ondersteunt EasyCodey ook een **IBAN**: de bezoeker ziet de rekening, kan het IBAN kopiëren en maakt zelf een overschrijving via de bankapp.

- `donateIban`: het rekeningnummer, bijvoorbeeld `BE69 0638 3621 2278`.
- `donateName`: de naam van de rekeninghouder, bijvoorbeeld `Yousef Abujarad (EasyCodey)`.
- `donateBank`: de bank, bijvoorbeeld `Belfius`.
- De vaste pagina `/doneren/` toont daarnaast de BIC `GKCCBEBB` en de mededeling **EasyCodey donatie**.
- Het IBAN wordt gevalideerd met de officiële mod-97-controle. Ongeldige nummers worden niet getoond.

> Let op: een IBAN op een openbare website is voor iedereen zichtbaar. Gebruik bij voorkeur een aparte rekening of een doneerplatform als je je privérekening niet wilt delen.

## Vindbaar op Google

De site heeft alles wat Google nodig heeft om hem te indexeren:

- `/robots.txt` staat indexering toe en verwijst naar de sitemap.
- `/sitemap.xml` bevat **168 URL's**: de startpagina, het projectoverzicht, de installatiepagina, de downloadpagina, de contactpagina, de doneerpagina en alle **161 projectpagina's**.
- Elk project heeft een echte pagina op `/idee/<id>/` met een eigen titel, meta-description, canonical, Open Graph en JSON-LD (`LearningResource` + `BreadcrumbList`).
- `/projecten/` is een indexeerbaar overzicht van alle projecten, gegroepeerd per categorie en met een zoekveld.
- `/installeren/`, `/contact/` en `/doneren/` zijn vaste pagina's met eigen titel, description, canonical en JSON-LD.
- `index.html` heeft een titel, description, canonical, Open Graph, Twitter-kaarten en JSON-LD.
- De server blokkeert documentatie, scripts en configuratiebestanden.

De interactieve app blijft de hash-SPA. De vaste pagina's linken met `?play=1` terug naar de app, zodat een bezoeker vanuit Google direct het project kan spelen.

Publiceren en aanmelden bij Google staat stap voor stap in **[GOOGLE.md](GOOGLE.md)**.

## Opslag, profielen en privacy

- Voortgang, thema, AI-instellingen, eigen projecten en je editor-code staan in `localStorage`.
- Zonder profiel gebruik je de gastsleutel `easycodey.v1`.
- Met een account gebruikt elk account een eigen sleutel: `easycodey.v1.profile.<id>`. De accounts zelf staan onder `easycodey.profiles.v1`; het actieve account onder `easycodey.activeProfile.v1`.
- Bestaande voortgang van vóór de naamswijziging (`easycode.v1`) wordt automatisch overgezet.
- Er is **geen account op een server en geen database**. Accounts leven alleen op dit apparaat.
- Een account is bedoeld om gebruikers op hetzelfde apparaat te scheiden, niet als beveiliging. Het wachtwoord houdt accounts uit elkaar, maar is geen sterke beveiliging tegen iemand met toegang tot het apparaat.
- Oude accounts met een PIN blijven werken: de PIN wordt bij het inlezen automatisch als wachtwoord gelezen.
- Het contactveld bij registratie is **optioneel**. Het staat alleen in `easycodey.profiles.v1` op dit apparaat en wordt nooit verstuurd.
- Het **eigenaarspaneel** op `#/eigenaar` is lokaal beveiligd met de eigenaarscode. De eigenaar kan ook inloggen met het eigenaarsaccount op **Mijn profiel**; dan opent het paneel zonder code en werkt dat op elk toestel. Na **Vergrendelen** opent zowel de eigenaarscode als het eigenaars-wachtwoord het paneel opnieuw. Het toont het aantal profielen op dit apparaat, hun voortgang en contactgegevens. Wachtwoorden zijn nooit zichtbaar.
- **Anonieme bezoekcijfers** zijn standaard cookieloos en anoniem (ingebouwde teller via Abacus): bezoeken op de app én de vaste pagina's, installaties en APK-downloads. Geen account nodig. Voor uitgebreidere inzichten (populaire projecten, versies, regio) kan de eigenaar daarnaast een gratis GoatCounter-sitecode instellen; die code voor álle bezoekers staat in `site-config.json` (`analyticsSite`). Een code in het paneel geldt alleen voor dat toestel. Zonder GoatCounter-code wordt er niets naar GoatCounter verstuurd. Iedereen kan alle meting uitzetten via **Mijn profiel → Privacy en statistieken**.
- **Voortgang is per apparaat en per browser.** Op een ander apparaat begin je leeg, tenzij je een back-up herstelt.
- Gebruik **Back-up downloaden** en **Back-up herstellen** op `#/profiel` om voortgang, eigen projecten en editor-code mee te nemen. Op **Mijn ideeën** kun je daarnaast alleen je eigen projecten exporteren/importeren.

## Lokaal testen

1. `npm run check` — controleert alle projectdata, het manifest, de offline-cache, de 161 vaste pagina's, het overzicht en de sitemap.
2. `npm start` en open http://localhost:4173.
3. Test de routes `#/`, `#/leerpad`, `#/programmeren`, `#/mijn-ideeen`, `#/profiel` en een projectpagina.
4. Test de vaste pagina's: `/projecten/`, `/installeren/`, `/contact/`, `/doneren/`, `/idee/raad-het-getal/` en `/idee/raad-het-getal` (zonder slash, moet doorsturen).
5. Test zoeken, categorie, niveau, duur, vaardigheden, verbergen en sorteren.
6. Herlaad de pagina: de filters moeten in de URL staan en je voortgang moet bewaard blijven.
7. Vink alle stappen af en controleer de confetti en de afgeronde status.
8. Open de AI-coach zonder sleutel: je krijgt de offline coach.
9. Stel eventueel een sleutel in via ⚙ en stel een vraag.
10. Open **Programmeren**, voer `print("Hallo")` uit en herlaad: je code moet bewaard blijven.
11. Open een project en test **▶ Speel dit idee**, **⌨ Gebruik dit idee**, **⌨ Programmeer zelf**, **Download .py** en **Kopieer alle code**. Controleer dat de invoerhulp bij `input()` zichtbaar is.
12. Maak op `#/profiel` een account met naam en wachtwoord, log uit en weer in, en test **Back-up downloaden** en **Back-up herstellen**. Controleer dat de chatknop verschijnt zodra je ingelogd bent.
13. Open `#/eigenaar`, ontgrendel met de eigenaarscode en controleer het aantal profielen, de mededeling en **Alles downloaden**.
14. Open **📲 Installeer als app** en controleer de uitleg. In DevTools → Application moet de service worker actief zijn. Bij een nieuwe versie moet de app zichzelf automatisch bijwerken.
15. Test offline: DevTools → Network → Offline, herlaad de pagina en voer Python uit.
16. Test op een smal scherm en wissel tussen licht en donker thema. Controleer dat er geen horizontale scrollbalk is.

## Deployen naar Render

EasyCodey heeft **geen build-stap**. De juiste instellingen zijn:

- **Build Command:** `npm install`
- **Start Command:** `npm start`

`npm install` is veilig: er zijn geen dependencies, maar Render verwacht een build-stap. `npm run build` bestaat wel, maar is **niet** nodig op Render: het genereert de vaste pagina's en sitemap, die al in de repository staan. Gebruik op Render dus `npm install` als build-stap.

### Via GitHub (aanbevolen)

1. Maak een GitHub-repository en upload deze map. Gebruik GitHub Desktop als je geen `git` hebt geïnstalleerd.
2. Ga naar [render.com](https://render.com) en kies **New → Web Service**.
3. Koppel je repository.
4. Kies runtime **Node**.
5. Vul in:
   - Build Command: `npm install`
   - Start Command: `npm start`
6. Voeg eventueel omgevingsvariabelen toe:
   - `OPENAI_API_KEY`
   - `OPENAI_BASE_URL`
   - `OPENAI_MODEL`
   - `ACCESS_CODE`
   - `RATE_LIMIT`
   - `DONATE_URL`, `DONATE_LABEL`, `DONATE_NOTE`
   - `SITE_URL` (je live-URL, voor robots.txt en sitemap.xml)
7. Deploy. Render zet `PORT` automatisch; `server.js` gebruikt `process.env.PORT` en luistert op `0.0.0.0`.
8. Meld de site daarna aan bij Google Search Console, zoals beschreven in `GOOGLE.md`.

### Via render.yaml (Blueprint)

Het bestand `render.yaml` staat klaar. Kies **New → Blueprint**, koppel je repository en Render leest de configuratie. Vul daarna de geheime variabelen in het dashboard in.

### Gratis Render-limieten

- De gratis web service gaat na ongeveer 15 minuten zonder verkeer in slaapstand.
- De eerste aanvraag daarna kan 30–60 seconden duren.
- Gratis services hebben een beperkt aantal uren per maand.
- Er is geen permanente schijf. Gebruik dus geen server-side bestandsopslag voor gebruikersdata.
- `localStorage` in de browser blijft gewoon werken.

## Techniek

- Vanilla JavaScript (ES-modules), geen framework en geen build-stap.
- Node.js `http`-server zonder externe dependencies.
- Data lokaal in `data/`; voortgang in `localStorage`.
- Lokale SVG-covers in `assets/covers/`.
- Huisstijl met CSS-variabelen (ivoor, diepgroen, goud) en Fraunces/Plus Jakarta Sans via Google Fonts.
- AI via de OpenAI-compatibele Chat Completions API met streaming.
- Nederlandse systeemprompt staat server-side in `server.js`.

## Licentie

Dit project is bedoeld als leerproject. Gebruik de code gerust als basis voor je eigen oefeningen.
