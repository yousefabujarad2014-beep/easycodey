# EasyCodey

Leer Python door echte projecten te bouwen. EasyCodey is een Nederlandstalige website met **161 projecten**, stap-voor-stap uitleg, codeblokken, voortgang per project en een AI-coach die je helpt als je vastloopt.

**161 projecten · 711 stappen · 10 categorieën · 3 niveaus**

## Live website

De site staat online op **GitHub Pages**:

**https://yousefabujarad2014-beep.github.io/easycodey/**

Op GitHub Pages werkt alles behalve de online AI-coach (daar is de Node-server voor nodig). De site valt daar automatisch terug op de offline coach. Het Python-speelveld, de programmeer-editor en alle 161 projecten werken volledig.

## Snel starten

Je hebt [Node.js](https://nodejs.org) nodig (versie 18 of nieuwer). Er zijn geen pakketten om te installeren en er is geen build-stap.

```bash
npm start
```

Open daarna **http://localhost:4173** in je browser.

> Open de site via de server, niet via `file://`. De site gebruikt ES-modules en die werken niet als je `index.html` direct opent.

Op Windows kun je ook dubbelklikken op `start-easycodey.bat`.

## Wat zit erin?

- **161 projecten** van Beginner tot Gevorderd, verdeeld over Games, Web, GUI, Data & AI, Handige tools, Automatisering, Security, Wetenschap, Kunst & Creatief en Onderwijs.
- Elke opdracht heeft een omslagafbeelding, uitleg, een stappenplan met code per stap, tips en vervolgprojecten.
- **Voortgang bijhouden**: vink stappen af. Je voortgang wordt lokaal in je browser opgeslagen (`localStorage`).
- **Zoeken en filteren** op trefwoord, categorie, niveau, tijdsduur, meerdere vaardigheden, alleen niet-afgeronde projecten en sorteren.
- **Filters in de URL**, bijvoorbeeld `#/?q=weer&categorie=Web&niveau=Gemiddeld&duur=kort`. Handig om een selectie te bewaren of te delen.
- **Leerpad** met alle projecten per niveau en een categorie-filter.
- **Mijn ideeën**: eigen AI-projecten bewaren, verwijderen en exporteren/importeren als JSON.
- **AI-coach EasyCoach** in een zijpaneel, met context van het project en de stap die je bekijkt.
- **Offline coach**: werkt direct zonder API-sleutel. Herkent je onderwerp en geeft een stappenplan plus passende projecten.
- **AI-generator**: beschrijf een idee en krijg een compleet project met titel, niveau, duur, stappen, code en tips.
- **Python-speelveld**: typ Python en voer het direct in de browser uit via Pyodide (WebAssembly). Zonder server, zonder account.
- **Programmeer-editor** (`#/programmeren`): een volledige editor met uitvoerpaneel, voorbeelden, automatisch bewaren, downloaden als `.py` en kopiëren.
- **Projectcode in de editor**: elk project heeft **Speel dit idee**, **Programmeer dit idee**, **Download .py** en **Kopieer alle code**. **Speel dit idee** voert het hele project direct uit; de editor laadt alle stappen als één programma met commentaar per stap.
- **Installeerbare app (PWA)**: zet EasyCodey met een eigen icoon op je computer of telefoon. De app opent in een eigen venster en werkt na de eerste keer ook offline.
- **Doneren**: optionele doneerknop die je koppelt aan Ko-fi, Buy Me a Coffee, PayPal.me, Stripe of een eigen link.
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
│   └── store.js            Opslag van voortgang, instellingen, thema, editor en eigen projecten
├── data/
│   ├── index.js            Centrale datalaag: normaliseren, covers en metadata
│   ├── helper.js           Compacte helpers voor projecten en stappen
│   └── ideas-01.js t/m ideas-07.js
├── assets/covers/          Tien lokale SVG-omslagen
├── assets/icons/           App-iconen (192, 512, maskable en Apple)
├── assets/easycodey.ico     Icoon voor de Windows-snelkoppeling
├── scripts/check-data.mjs  Controle van de projectdata en de app-bestanden
├── scripts/make-icons.mjs  App-iconen opnieuw maken met headless Chrome
├── server.js               Statische server + AI-proxy (geen dependencies)
├── render.yaml             Render Blueprint
├── .env.example            Voorbeeldconfiguratie
├── APP.md                  EasyCodey als app installeren en offline gebruiken
├── EINDRAPPORT.md          Overzicht van de oplevering en testresultaten
├── PUBLICATIE.md           Stap-voor-stap publicatie op GitHub en Render
├── GOOGLE.md               Site openbaar maken en laten indexeren door Google
└── start-easycodey.bat     Windows-startscript
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
- Op een projectpagina staan **Programmeer dit idee**, **Download .py** en **Kopieer alle code**. De editor laadt dan alle stappen als één programma, met een commentaarregel per stap.

### Zo werkt het

- Python draait via **Pyodide** (WebAssembly) in de browser.
- De eerste keer wordt ongeveer 10 MB gedownload; daarna is het snel.
- Code wordt niet naar de server gestuurd.
- `input()` opent een invoer-pop-up. Een oneindige loop kun je alleen stoppen door het tabblad of venster te sluiten.
- Na de eerste keer bewaart de service worker de Python-runtime, zodat de editor en het speelveld ook offline werken.
- Op een projectpagina voert **▶ Speel dit idee** meteen het volledige project uit; **⌨ Programmeer dit idee** opent dezelfde code in de editor.

Er zijn voorbeelden ingebouwd: hallo wereld, rekenen, loops, lijsten, functies en een variant van "Raad het getal" zonder `input()`.

## Als app installeren (PWA)

EasyCodey is een installeerbare webapp. Je gebruikt dezelfde site en dezelfde voortgang, maar met een eigen icoon en een eigen venster.

1. Open de live site in **Chrome** of **Edge**.
2. Klik in de header op het **installatie-icoon** of gebruik het menu ⋮ → **App installeren**.
3. Op Android: menu ⋮ → **App installeren** of **Toevoegen aan startscherm**.
4. Op iPhone/iPad: **Deel** → **Zet op beginscherm**.

Er is ook een aparte pagina **`/installeren/`** met een QR-code en uitleg per platform. Scan de QR-code met je Android-telefoon om de site meteen te openen.

Daarna start je EasyCodey als een gewoon programma. De app werkt offline: alle projecten, je voortgang en de editor staan lokaal. Python werkt offline zodra je het één keer online hebt gebruikt. De online AI-coach blijft internet nodig hebben; de offline coach werkt altijd.

Meer uitleg over installeren, bijwerken en de iconen staat in `APP.md`.

## Donaties instellen

De doneerknop blijft verborgen tot je een doneerlink instelt. Dat voorkomt een dode knop voor bezoekers.

1. Maak een doneerlink bij bijvoorbeeld [Ko-fi](https://ko-fi.com), [Buy Me a Coffee](https://buymeacoffee.com), [PayPal.me](https://www.paypal.me) of een Stripe Payment Link.
2. Zet de link in `.env`:

```env
DONATE_URL=https://ko-fi.com/jouw-naam
DONATE_LABEL=Doneer via Ko-fi
DONATE_NOTE=Elke bijdrage helpt om nieuwe projecten toe te voegen.
```

3. Herstart de server.

Zodra `DONATE_URL` is ingesteld, verschijnen het hartje in de header en de link in de footer. De site verwerkt zelf geen betalingen en bewaart geen betaalgegevens.

Op **GitHub Pages** is er geen server. Zet dezelfde gegevens dan in `site-config.json`:

```json
{
  "donateUrl": "https://ko-fi.com/jouw-naam",
  "donateLabel": "Doneer via Ko-fi",
  "donateNote": "Elke bijdrage helpt om nieuwe projecten toe te voegen.",
  "donateIban": "BE69 0638 3621 2278",
  "donateName": "Naam van de rekeninghouder",
  "donateBank": "Belfius"
}
```

Commit en push daarna. De site gebruikt `site-config.json` automatisch als `/api/config` niet beschikbaar is.

### Doneren per bankoverschrijving

Een persoonlijke bankrekening heeft geen openbare betaallink. Daarom ondersteunt EasyCodey ook een **IBAN**: de bezoeker ziet de rekening, kan het IBAN kopiëren en maakt zelf een overschrijving via de bankapp.

- `donateIban`: het rekeningnummer, bijvoorbeeld `BE69 0638 3621 2278`.
- `donateName`: optioneel, de naam van de rekeninghouder.
- `donateBank`: optioneel, bijvoorbeeld `Belfius`.
- Het IBAN wordt gevalideerd met de officiële mod-97-controle. Ongeldige nummers worden niet getoond.

> Let op: een IBAN op een openbare website is voor iedereen zichtbaar. Gebruik bij voorkeur een aparte rekening of een doneerplatform als je je privérekening niet wilt delen.

## Vindbaar op Google

De site heeft alles wat Google nodig heeft om hem te indexeren:

- `/robots.txt` staat indexering toe en verwijst naar de sitemap.
- `/sitemap.xml` bevat **165 URL's**: de startpagina, het projectoverzicht, de installatiepagina, de contactpagina en alle **161 projectpagina's**.
- Elk project heeft een echte pagina op `/idee/<id>/` met een eigen titel, meta-description, canonical, Open Graph en JSON-LD (`LearningResource` + `BreadcrumbList`).
- `/projecten/` is een indexeerbaar overzicht van alle projecten, gegroepeerd per categorie en met een zoekveld.
- `/installeren/` en `/contact/` zijn vaste pagina's met eigen titel, description, canonical en JSON-LD.
- `index.html` heeft een titel, description, canonical, Open Graph, Twitter-kaarten en JSON-LD.
- De server blokkeert documentatie, scripts en configuratiebestanden.

De interactieve app blijft de hash-SPA. De vaste pagina's linken met `?play=1` terug naar de app, zodat een bezoeker vanuit Google direct het project kan spelen.

Publiceren en aanmelden bij Google staat stap voor stap in **[GOOGLE.md](GOOGLE.md)**.

## Opslag en privacy

- Voortgang, thema, AI-instellingen, eigen projecten en je editor-code staan in `localStorage` onder de sleutel `easycodey.v1`.
- Bestaande voortgang van vóór de naamswijziging (`easycode.v1`) wordt automatisch overgezet.
- Er is geen account en geen database.
- **Voortgang is per apparaat en per browser.** Op een ander apparaat begin je leeg.
- Gebruik exporteren/importeren op **Mijn ideeën** om eigen projecten mee te nemen. Voortgang zelf wordt niet geëxporteerd.

## Lokaal testen

1. `npm run check` — controleert alle projectdata, het manifest, de offline-cache, de 161 vaste pagina's, het overzicht en de sitemap.
2. `npm start` en open http://localhost:4173.
3. Test de routes `#/`, `#/leerpad`, `#/programmeren`, `#/mijn-ideeen` en een projectpagina.
4. Test de vaste pagina's: `/projecten/`, `/installeren/`, `/contact/`, `/idee/raad-het-getal/` en `/idee/raad-het-getal` (zonder slash, moet doorsturen).
5. Test zoeken, categorie, niveau, duur, vaardigheden, verbergen en sorteren.
6. Herlaad de pagina: de filters moeten in de URL staan en je voortgang moet bewaard blijven.
7. Vink alle stappen af en controleer de confetti en de afgeronde status.
8. Open de AI-coach zonder sleutel: je krijgt de offline coach.
9. Stel eventueel een sleutel in via ⚙ en stel een vraag.
10. Open **Programmeren**, voer `print("Hallo")` uit en herlaad: je code moet bewaard blijven.
11. Open een project en test **Speel dit idee**, **Programmeer dit idee**, **Download .py** en **Kopieer alle code**.
12. Open **📲 Installeer als app** en controleer de uitleg. In DevTools → Application moet de service worker actief zijn.
13. Test offline: DevTools → Network → Offline, herlaad de pagina en voer Python uit.
14. Test op een smal scherm en wissel tussen licht en donker thema.

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
- AI via de OpenAI-compatibele Chat Completions API met streaming.
- Nederlandse systeemprompt staat server-side in `server.js`.

## Licentie

Dit project is bedoeld als leerproject. Gebruik de code gerust als basis voor je eigen oefeningen.
