# EasyCodey â€” eindrapport

**Datum:** 9 november 2026
**Map:** `C:\Users\Home\Desktop\FLL`
**Status:** inhoudelijk klaar, live op GitHub Pages

---

## 1. Wat is EasyCodey?

EasyCodey is een Nederlandstalige website waarmee je Python leert door echte projecten te bouwen. Je kiest een project, volgt een stappenplan met uitleg en code, vinkt stappen af en vraagt de AI-coach om hulp als je vastloopt.

De site is gebouwd zonder framework en zonder build-stap: vanilla JavaScript (ES-modules), Ã©Ã©n Node.js-server zonder externe dependencies en alle projectdata lokaal in `data/`.

---

## 2. Wat er gebouwd is

### Projectbibliotheek
- **161 projecten** met **711 stappen**.
- Verdeling over 10 categorieÃ«n:

| Categorie | Projecten |
|---|---:|
| ðŸŽ® Games | 36 |
| ðŸŒ Web | 22 |
| ðŸªŸ GUI | 15 |
| ðŸ¤– Data & AI | 12 |
| ðŸ§° Handige tools | 14 |
| âš™ï¸ Automatisering | 10 |
| ðŸ” Security | 14 |
| ðŸ”¬ Wetenschap | 18 |
| ðŸŽ¨ Kunst & Creatief | 10 |
| ðŸŽ“ Onderwijs | 10 |
| **Totaal** | **161** |

- Elk project heeft: `id`, `title`, `emoji`, `category`, `level` (Beginner/Gemiddeld/Gevorderd), `time`, `summary`, `description`, minimaal 3 leerdoelen, minimaal 3 stappen met titel/uitleg/code, tips en geldige `next`-links.
- Alle `next`-links worden bij het laden gecontroleerd en aangevuld door `data/index.js`.

### Afbeeldingen
- 10 lokale SVG-omslagen in `assets/covers/` (Ã©Ã©n per categorie).
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
- Resultaatenteller, filters wissen, lege staat en "ðŸŽ² Verras me".
- Filters staan in de URL, bijvoorbeeld `#/?q=weer&categorie=Web&niveau=Gemiddeld&duur=kort`.
- Eerste 30 resultaten, daarna "Meer laden" in stappen van 30.
- Statistieken: aantal projecten, categorieÃ«n, afgeronde projecten en totale voortgang.
- Sneltoets `/` focust het zoekveld.
- **App-entry** bovenaan: een opvallend blok dat uitlegt dat je je leerpad overal mee naartoe kunt nemen, met knoppen naar de editor en het installeren van de app.
- De hero-knop **â–¶ Snel proberen** opent het Python-speelveld.

### Projectpagina (`#/idee/:id`)
- Omslagafbeelding, titel, categorie, niveau, duur en aantal stappen.
- Uitleg, leerdoelen en tips.
- Stappenplan met codeblokken en een kopieerknop per blok.
- Elke stap heeft een afvinkknop; de keuze wordt direct in `localStorage` opgeslagen.
- Voortgangsring en voortgangsbalk.
- "Markeer als afgerond" en "Voortgang resetten".
- Zijbalk met projectgegevens, vervolgprojecten en "Vraag AI om hulp".
- Per stap: "Vraag AI over deze stap", inclusief project- en stapcontext.
- Actiebalk met **▶ Speel dit idee**, **⌨ Gebruik dit idee**, **⌨ Programmeer zelf**, **Download .py** en **Kopieer alle code**.
- **Speel dit idee** toont de speelbare app-weergave van het project, meteen in de pagina.
- **Gebruik dit idee** toont in dezelfde plek alle code, stap voor stap.
- **Programmeer zelf** opent de editor met alle stappen als Ã©Ã©n programma, met commentaar per stap.
- **Invoerhulp** onder de actiebalk: legt uit dat je bij `input()` je antwoord typt in het venster bovenaan je scherm, waarin ook de **vraag van het programma** staat, en daarna op **Enter** drukt.
- **App-weergave**: de pagina opent standaard in een schone preview zonder code. De knoppen **▶ Speel dit idee** en **⌨ Gebruik dit idee** zijn samen de schakelaar: app en code zitten dus in dezelfde twee acties. In de app-stand speel je meteen mee; in de code-stand zie je alle stappen en uitleg. De code blijft altijd in de HTML staan voor SEO en tests.
- Elke preview is een echte, offline demo die bij het onderwerp past: Snake, Tetris, Pong, Galgje, rekenmachine, weer, portscanner, molecuulmassa, warmteverspreiding enz. Alle 161 projecten hebben een preview; waar nodig via een passende categorie-fallback.
- Dezelfde uitleg staat op elke vaste projectpagina en in het Python-speelveld.
- Confetti bij het afronden van een project (met respect voor `prefers-reduced-motion`).

### Leerpad (`#/leerpad`)
- Alle projecten gegroepeerd per niveau: Beginner, Gemiddeld, Gevorderd.
- Voortgang per project zichtbaar met een vinkje.
- Categorie-filter en totale voortgang.
- Filter staat in de URL (`#/leerpad?categorie=Games`).

### Mijn ideeÃ«n (`#/mijn-ideeen`)
- Overzicht van zelfgemaakte AI-projecten uit `localStorage`.
- Project openen, verwijderen en opnieuw bekijken.
- Exporteren als JSON-bestand (`easycodey-eigen-ideeen.json`).
- Importeren van een eerder geÃ«xporteerd JSON-bestand.
- GeÃ¯mporteerde projecten worden gevalideerd en schoongemaakt: ongeldige velden, categorieÃ«n en niveaus worden hersteld en projecten met minder dan 3 geldige stappen worden geweigerd.
- Duidelijke waarschuwing dat projecten per browser/apparaat zijn opgeslagen.

### Optioneel account (`#/profiel`)
- Een account is **optioneel**; zonder account werkt EasyCodey gewoon als gast.
- Snel aanmelden zoals bij Kahoot: een naam en een wachtwoord van 4 tot 64 tekens.
- Een e-mailadres of telefoonnummer is **optioneel**; het blijft lokaal en wordt nooit verstuurd.
- Inloggen op naam + wachtwoord, met **Toon/Verberg** voor het wachtwoordveld; uitloggen en een account verwijderen.
- Elk account heeft eigen voortgang, eigen projecten en eigen editor-code via `easycodey.v1.profile.<id>`.
- Bij het aanmaken kun je de huidige gastvoortgang meenemen.
- Oude accounts met een PIN blijven werken: de PIN wordt automatisch als wachtwoord gelezen.
- **Back-up downloaden** bewaart voortgang, eigen projecten en editor-code als JSON; **Back-up herstellen** zet het bestand terug.
- De header heeft een **ðŸ‘¤-icoon** en de footer een link **Mijn profiel**.
- Duidelijke uitleg dat accounts alleen op dit apparaat staan en dat het wachtwoord geen sterke beveiliging is.

### Eigenaarspaneel (`#/eigenaar`)
- De eigenaar logt in op **Mijn profiel** met de eigenaarsnaam en het eigenaars-wachtwoord. Dat account wordt bij de eerste login lokaal aangemaakt, dus het werkt op elk toestel. Het profiel krijgt het label **Eigenaar** en het beheer opent zonder code.
- Alternatief: de eigenaarscode **of** het eigenaars-wachtwoord op `#/eigenaar`; de ontgrendeling geldt voor de sessie. Na **Vergrendelen** werkt het wachtwoord opnieuw.
- **Inzicht en updates:** app-versie, actieve service worker, aantal offline bestanden, opslaggebruik en de laatste automatische update.
- **Bezoekcijfers:** de ingebouwde anonieme teller toont meteen unieke bezoekers (één per toestel/browser), bezoeken, unieke installaties en APK-downloads. Geen account nodig en cookieloos.
- **Bezoekers meten (optioneel):** daarnaast een gratis GoatCounter-sitecode instellen voor uitgebreidere inzichten: populairste projecten, versies en regio. De sitecode voor alle bezoekers staat in `site-config.json` (`analyticsSite`). Zonder sitecode wordt niets naar GoatCounter verstuurd; gebruikers kunnen alle meting uitzetten via **Mijn profiel → Privacy en statistieken**.
- Toont het aantal lokale profielen en totalen voor gestarte/afgeronde projecten, stappen en eigen ideeÃ«n.
- Profielentabel met naam, optioneel contact, aanmaakdatum, laatste activiteit en voortgang.
- **Voortgang wissen** en **Verwijderen** per profiel, met bevestiging.
- Mededeling opslaan/wissen; gebruikers zien die bovenaan de app en kunnen hem sluiten.
- **Alles downloaden** exporteert alle lokale profielen en hun data als JSON.
- Wachtwoorden zijn nooit zichtbaar. Er is geen server: alleen dit apparaat.

### Chatknop na inloggen
- Zodra een account actief is, verschijnt een link in de footer en een zwevende knop rechtsonder.
- Op `#/profiel` staat een grote **Chat met EasyCoach**-kaart.
- De knop werkt op Android en op de laptop en opent het bestaande AI-paneel.
- De begroeting en het gebruikersavatar gebruiken de naam en initiaal van het actieve account.
- Zonder actief account blijven alle chatknoppen verborgen.
- De header heeft **geen** tweede chatknop: dat voorkomt dubbele knoppen en houdt de navigatie rustig.

### AI-coach EasyCoach
- Zijpaneel met streaming antwoorden, zoals een chatgesprek.
- **Standaard gratis online AI** via Pollinations (`text.pollinations.ai`, model `openai`). Geen account en geen sleutel nodig; werkt ook op GitHub Pages.
- **Eerst begrijpen, dan doen:** de coach vat in één zin samen wat je bedoelt. Ontbreekt het doel, de code of de foutmelding, dan stelt hij maximaal 2 korte vragen en geeft hij nog geen volledige oplossing. Is de vraag duidelijk, dan bevestigt hij dat en komt pas daarna de uitleg of code.
- Nederlandse systeemprompt met een vaste antwoordstijl: eerst het directe antwoord, korte alinea's, code in een `python`-blok, geen tabellen, en altijd één concrete volgende stap.
- Project- en stapcontext wordt met elk verzoek meegestuurd.
- Na elk antwoord verschijnen **vervolgvragen** als knoppen, bijvoorbeeld “Leg dit simpeler uit”.
- Bij een netwerkfout of als de gratis dienst te druk is: duidelijke melding, offline antwoord en een knop **Opnieuw proberen met AI**.
- Offline coach werkt zonder internet of met de online AI uitgezet:
  - legt een specifieke stap uit;
  - herkent 11 veelvoorkomende foutmeldingen (NameError, SyntaxError, TypeError enz.);
  - legt 14 Python-begrippen uit met codevoorbeeld;
  - helpt een project kiezen en geeft een algemene aanpak.
- Instellingen in de browser: online AI aan/uit, eigen API-sleutel, model, basis-URL en toegangscode.
- De sleutel wordt nooit in de code opgeslagen; server-side via `.env` of omgevingsvariabelen heeft de voorkeur.
- Optionele toegangscode (`ACCESS_CODE`) en rate limiting per IP (`RATE_LIMIT`, standaard 30 per uur) voor een eigen server.

### AI-ideeÃ«ngenerator
- Beschrijf een onderwerp, niveau, tijdsduur en optioneel een categorie.
- Met AI: streaming JSON-antwoord wordt geparsed naar een compleet project.
- Zonder AI: de offline generator maakt direct een bruikbaar project met 4 stappen.
- Het resultaat wordt opgeslagen in `localStorage` en geopend in de detailpagina.
- Ongeldige of onvolledige AI-antwoorden vallen terug op de offline generator.

### Python-speelveld
- Bereikbaar via **â–¶ Snel proberen** in de hero en **Probeer Python** in de footer.
- Python draait via Pyodide (WebAssembly) volledig in de browser.
- De runtime wordt pas geladen als iemand het speelveld opent en op **Uitvoeren** klikt.
- Zes voorbeelden: hallo wereld, rekenen, loops, lijsten, functies en "Raad het getal" zonder `input()`.
- Uitvoer en foutmeldingen verschijnen direct in het paneel.
- `input()` toont bovenaan je scherm een venster met de **vraag van het programma** en een tekstvak. De statusregel zegt **â€œTyp je antwoord in het venster bovenaanâ€¦â€**.
- Bij het speelveld, op de SPA-projectpagina en op elke vaste projectpagina staat dezelfde invoerhulp.
- Geen code of uitvoer gaat naar de server.
- Bij een netwerkfout verschijnt een duidelijke melding; de rest van de site blijft werken.

### Programmeer-editor (`#/programmeren`)
- Volledige editor met een groot codeveld en een apart uitvoerpaneel.
- **â–¶ Uitvoeren** en **Ctrl + Enter** voeren de code uit via dezelfde Pyodide-runtime.
- **Download .py** bewaart het programma als Python-bestand.
- **Kopieer** zet de code op het klembord.
- Automatisch bewaren in `localStorage`; de code staat na herladen nog in de editor.
- Editor-code is gekoppeld aan het project waarvoor je hem opende. Typ je daarna in de algemene editor (`#/programmeren`), dan wordt die code niet per ongeluk aan het oude project gekoppeld; **Programmeer zelf** laadt altijd de juiste projectcode.
- Voorbeelden laden, uitvoer wissen, **Tab** invoegen als vier spaties en de editor leegmaken.
- **Projectcode opnieuw laden** en **Terug naar project** in de projectbalk.
- Op mobiel staat de navigatie op een eigen scrollbare rij en wordt de editor Ã©Ã©n kolom.

### Installeerbare app (PWA)
- `manifest.webmanifest` met naam, korte naam, beschrijving, start-URL, kleuren en snelkoppelingen naar **Programmeren**, **Leerpad** en **Mijn ideeÃ«n**.
- Vier PNG-app-iconen (192 en 512 px, gewoon en maskable) plus een Apple-touch-icoon.
- `sw.js` bewaart de app-shell (37 bestanden) bij de eerste installatie.
- **Network-first** voor navigatie Ã©n same-origin code/styles, **cache-first** voor afbeeldingen, lettertypen en de CDN. Zo zie je nooit een oude versie.
- De service worker registreert met `updateViaCache: "none"` en controleert automatisch op een nieuwe versie: bij de start, elke 15 minuten, bij terugkeer naar de app (`visibilitychange`/`focus`), bij `pageshow` en zodra je weer online bent. Een nieuwe versie wordt automatisch overgenomen en de pagina herlaadt.
- Er is **geen handmatige updateknop** meer: de app werkt zichzelf volledig automatisch bij.
- HTTP wordt automatisch naar HTTPS omgeleid (behalve op localhost). Het installatievenster en de installatiepagina leggen uit dat je altijd de beveiligde live-link moet gebruiken.
- De Python-runtime en lettertypen komen in een aparte runtime-cache, zodat Python na de eerste keer offline werkt.
- `offline.html` verschijnt als een pagina niet in de cache staat.
- **ðŸ“² Installeer als app** in de header en footer, met uitleg per platform en een **Installeer nu**-knop zodra de browser dat ondersteunt.
- In een geÃ¯nstalleerde app verdwijnt de installeerknop en opent de site in een eigen venster.
- Werkt op GitHub Pages zonder server; de service worker draait alleen via `https://` of `localhost`.

### Gratis Android-app (APK)
- `/download/` biedt de ondertekende Android-app aan als APK: versie 1.0.0, 1,89 MB, pakket `be.easycodey.app`, Android 7.0+.
- Geen Google Play-account of betaling nodig. De APK is ondertekend met de uploadsleutel en de fingerprint staat in `/.well-known/assetlinks.json`, dus de TWA opent zonder adresbalk.
- De pagina toont de **SHA-256**, een **QR-code** voor je telefoon, installatiestappen, uitleg over Play Protect, een hashcontrole voor Windows/macOS/Linux en veelgestelde vragen.
- De inhoud (projecten, editor, accounts) werkt automatisch bij via de website. Alleen een nieuwe Android-schil vraagt een nieuwe APK.
- Bereikbaar via de footer **⬇ Android-app**, het installatievenster en `/installeren/`.

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
- `/sitemap.xml` bevat **168 URL's**: startpagina, projectoverzicht, installatiepagina, downloadpagina, contactpagina, doneerpagina en alle 161 projecten.
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
â”œâ”€â”€ index.html                 Basislayout, header, AI-paneel, instellingen, generator
â”œâ”€â”€ styles.css                 Alle styling, thema's, covers en responsive regels
â”œâ”€â”€ app.js                     Routing, filters, detailpagina, editor, voortgang, events, AI-paneel
â”œâ”€â”€ manifest.webmanifest       App-manifest: naam, iconen, snelkoppelingen, venster
â”œâ”€â”€ sw.js                      Service worker: offline-cache en app-shell
â”œâ”€â”€ offline.html               Offline-pagina
â”œâ”€â”€ js/
â”‚   â”œâ”€â”€ ai.js                  Streaming, markdown, offline coach en generator
â”‚   â””â”€â”€ store.js               localStorage: voortgang, instellingen, thema, editor, eigen projecten
â”œâ”€â”€ data/
â”‚   â”œâ”€â”€ index.js               Datalaag: normaliseren, categorieÃ«n, covers, next-links
â”‚   â”œâ”€â”€ helper.js              Compacte helpers voor projecten en stappen
â”‚   â””â”€â”€ ideas-01.js t/m ideas-07.js
â”œâ”€â”€ assets/covers/             10 lokale SVG-omslagen
â”œâ”€â”€ assets/icons/              Logo (`logo.svg`) en app-iconen: 192, 512, maskable en Apple
â”œâ”€â”€ assets/qr/                 QR-code naar de live site voor installatie op Android
â”œâ”€â”€ assets/easycodey.ico       Icoon voor de Windows-snelkoppeling
â”œâ”€â”€ scripts/check-data.mjs     Controle van projectdata, manifest, offline-cache, pagina's en sitemap
â”œâ”€â”€ scripts/build-pages.mjs    Genereert 161 vaste projectpagina's, het overzicht, de installatie-, contact- en doneerpagina en de sitemap
â”œâ”€â”€ scripts/make-icons.mjs     App-iconen opnieuw maken met headless Chrome
â”œâ”€â”€ idee/<id>/index.html       161 vaste, indexeerbare projectpagina's
â”œâ”€â”€ projecten/index.html       Overzicht van alle projecten per categorie
â”œâ”€â”€ installeren/index.html     Installatie-uitleg per platform met QR-code
â”œâ”€â”€ contact/index.html         Nederlandstalige contactpagina met telefoon, WhatsApp en e-mail
â”œâ”€â”€ doneren/index.html         Doneerpagina met IBAN, rekeninghouder, bank, BIC en transparantie
â”œâ”€â”€ sitemap.xml                Startpagina, overzicht, installeren, download, contact, doneren en 161 projectpagina's (168 URL's)
â”œâ”€â”€ server.js                  Statische server + AI-proxy (geen dependencies)
â”œâ”€â”€ package.json               Scripts: start, dev, check, pages, build, icons
â”œâ”€â”€ render.yaml                Render Blueprint
â”œâ”€â”€ .env.example               Voorbeeldconfiguratie
â”œâ”€â”€ .gitignore                 Sluit .env, node_modules en logs uit
â”œâ”€â”€ README.md                  Handleiding voor gebruik en deployment
â”œâ”€â”€ APP.md                     EasyCodey als app installeren en offline gebruiken
â”œâ”€â”€ EINDRAPPORT.md             Overzicht van de oplevering en testresultaten
â”œâ”€â”€ PUBLICATIE.md              Stap-voor-stap publicatie op GitHub en Render
â”œâ”€â”€ GOOGLE.md                  Openbaar maken en laten indexeren door Google
â”œâ”€â”€ EasyCodey.url              Snelkoppeling naar de beveiligde live-app
â”œâ”€â”€ start-easycodey.bat        Opent de beveiligde live-app (lokaal met `local`)
â””â”€â”€ start-easycodey-local.bat  Start de lokale ontwikkelserver
```

---

## 4. Uitgevoerde tests

| Test | Resultaat |
|---|---|
| `npm run check` | âœ… 161 projecten, 711 stappen, 161 pagina's, 167 sitemap-URL's, 0 fouten |
| Datacontrole op dubbele id's, verplichte velden, stappen, tips, `next`-links en covers | âœ… |
| Syntaxcontrole `node --check` op `app.js`, `server.js`, `js/ai.js`, `js/store.js` | âœ… |
| Startpagina `/` | âœ… 200, `text/html` |
| `app.js`, `styles.css`, `data/index.js`, `data/ideas-07.js`, `js/ai.js`, `js/store.js` | âœ… 200 met juist `Content-Type` |
| Alle 10 categorie-covers | âœ… 200, `image/svg+xml` |
| `/api/config` | âœ… 200, `application/json`, inclusief doneervelden |
| `/robots.txt` | âœ… 200, `text/plain`, verwijst naar de sitemap |
| `/sitemap.xml` | âœ… 200, geldige XML met 168 URL's en `SITE_URL` |
| Doneerknop zonder `DONATE_URL` | âœ… verborgen |
| Doneerknop met `DONATE_URL` | âœ… zichtbaar, link en label kloppen |
| Python-speelveld (headless Chrome, Pyodide) | âœ… `print("Test", 2 + 3)` geeft `Test 5` |
| Speelveld sluiten en heropenen | âœ… werkt, runtime blijft geladen |
| Programmeer-editor `#/programmeren` | âœ… editor, actieve nav, juiste titel |
| Editor-uitvoer (headless Chrome, Pyodide) | âœ… `print("Editor test", 2 + 3)` geeft `Editor test 5` |
| Editor automatisch bewaren | âœ… code staat direct in `localStorage` |
| Editor: projectcode na eigen code | âœ… algemene editorcode wordt niet aan het oude project gekoppeld |
| Editor na herladen | âœ… code blijft bewaard, ook bij een project |
| Editor Ctrl + Enter | âœ… `print("Sneltoets", 6 * 7)` geeft `Sneltoets 42` |
| Editor voorbeelden, uitvoer wissen en downloaden | âœ… |
| Projectacties op detailpagina | âœ… **▶ Speel dit idee**, **⌨ Gebruik dit idee**, **⌨ Programmeer zelf**, **Download .py**, **Kopieer alle code** |
| Projectcode in de editor | âœ… alle stappen met commentaar en projectbanner |
| KopiÃ«ren naar klembord | âœ… volledige projectcode op het klembord |
| Download `.py` vanaf detail en editor | âœ… bestanden bevatten de juiste code |
| Mobiele navigatie en editorlayout | âœ… nav op eigen rij, editor Ã©Ã©n kolom |
| Live GitHub Pages: editor, hero-link en projectacties | âœ… 9/9 live checks geslaagd |
| Manifest, iconen en snelkoppelingen | âœ… 4 PNG-iconen (192/512, maskable) met juiste afmetingen |
| Service worker actief en pagina onder controle | âœ… scope `/`, app-shell uit cache |
| Offline-cache gevuld | 37 bestanden |
| Installatie-uitleg in de app | âœ… 3 platformstappen, sluit correct |
| **Speel dit idee** op een projectpagina | âœ… speelbare app in de pagina; **Gebruik dit idee** toont alle code |
| **Programmeer zelf** met autoplay | âœ… volledige code (24 regels) en directe Pyodide-uitvoer via `?play=1` |
| Site herladen zonder internet | âœ… laadt uit de cache |
| Python uitvoeren zonder internet | âœ… werkt na eenmalig laden |
| PWA-testsuite lokaal | âœ… 21/21 checks geslaagd |
| Chrome-installeerbaarheid | âœ… geen installability errors |
| PWA-testsuite op de live site | 13/13 checks geslaagd |
| Live: manifest, iconen en service worker | âœ… `application/manifest+json`, scope `/easycodey/` |
| Live: offline-cache en offline Python | 37 bestanden, Pyodide werkt offline |
| Live: wachtwoordaccount en chatknop | âœ… 8/8 live checks: aanmaken, inloggen, chatknop en updatecontrole |
| Nieuwe flows lokaal | 39/39 checks: invoerhulp, app-entry, wachtwoordaccounts, chatknop, back-up, automatische updates, HTTPS, installatievenster en eigenaarspaneel |
| AI-coach en installatiehulp lokaal | 26/26 checks: gratis online AI geeft een echt streaming antwoord, providerkeuze en statuslabel, vervolgvragen, offline modus met eigen uitleg en code, in-app-browserwaarschuwing, uitleg over Beveiligd en prive en cacheversie v14 |
| Eigenaarslogin en inzichten lokaal | 43/43 checks: login Yousef Abujarad, Eigenaar-label, beheer zonder code, wachtwoord op de vergrendelpoort, app-status, bezoekcijfers, GoatCounter-sitecode, opt-out, stop met meten, beschermd eigenaarsaccount en filters |
| Gratis APK-download | âœ… `/download/` met versie 1.0.0, 1,89 MB, SHA-256, installatie-uitleg, FAQ en een bereikbare APK |
| Ingebouwde anonieme teller | 9/9 checks: bezoek en unieke bezoeker op een vaste projectpagina, niet dubbel bij herladen, gedeelde unieke-vlag met de SPA, APK-download, geen tweede unieke bezoeker op de downloadpagina, installatie één keer per toestel en geen dubbele installatiemelding |
| Invoer-pop-up met de echte vraag | âœ… 2/2 checks: vraag zichtbaar en antwoord bereikt Python |
| Chique huisstijl in headless Chrome | âœ… Fraunces/Plus Jakarta Sans geladen, groen-goud-palet, geen horizontale overflow |
| Nieuw logo en app-iconen | âœ… `logo.svg`, 4 PNG-iconen en Apple-touch-icoon opnieuw gegenereerd |
| Vaste pagina's lokaal | 103/103 checks geslaagd, inclusief Speel dit idee / Gebruik dit idee, Snake-preview en de downloadpagina met QR |
| App-preview per project | âœ… 66/66 checks: app-stand standaard, preview zichtbaar, code verborgen, tabwissel, juiste thema per categorie |
| Weerbaarheid bij laadfouten | âœ… 14/14 checks: code-vangnet zonder `previews.js`, werkende tabs, herstelscherm zonder `app.js`, daarna normale start |
| Snake-preview | âœ… canvas, D-pad en toetsen; speelbaar in de browser |
| Alle 161 projecten | âœ… elk project heeft een preview (135 eigen demo's + 26 nieuwe demo's; 0 fallbacks over) |
| Projectpagina `/idee/dobbelsteen-simulator/` | âœ… eigen titel, description, canonical, H1, 3 stappen en 3 codeblokken |
| Projectpagina zonder slash | âœ… 301 naar de map met slash |
| Overzicht `/projecten/` | âœ… 161 links, 10 categorieÃ«n, zoekfilter en `CollectionPage` |
| Sitemap lokaal | âœ… geldige XML, 168 URL's, productie-startpagina aanwezig |
| Speel dit idee vanaf vaste pagina | âœ… app-weergave in de pagina; **Programmeer zelf** opent `?play=1` met volledige code en Pyodide-uitvoer |
| Thema op vaste pagina | âœ… wisselt en wordt bewaard in `localStorage` |
| Mobiel overzicht | âœ… geen horizontale overflow, Ã©Ã©n kolom |
| Installatiepagina `/installeren/` | âœ… 8 secties, 3 Android-stappen, eigen titel en canonical |
| QR-code op installatiepagina | âœ… laadt als SVG en is zichtbaar op mobiel |
| Installatiepagina mobiel | âœ… geen horizontale overflow, Ã©Ã©n kolom |
| Contactpagina `/contact/` | âœ… telefoon/WhatsApp, e-mail, eigen titel, canonical en JSON-LD |
| Contactpagina mobiel | âœ… drie kaarten in Ã©Ã©n kolom, geen overflow |
| Doneerpagina `/doneren/` | âœ… IBAN, rekeninghouder, bank, BIC, kopieerknop en JSON-LD (`DonateAction`) |
| Doneerpagina mobiel | âœ… twee blokken in Ã©Ã©n kolom, geen overflow |
| Doneermodal in de app | âœ… toont IBAN en houder en linkt naar `/doneren/` |
| SPA-fallback voor onbekend pad | âœ… 200, levert `index.html` |
| `/api/chat` zonder sleutel | âœ… 401 met `no-key` |
| Toegangscode zonder code | âœ… 401 met `access-code` |
| Toegangscode met juiste code | âœ… verzoek toegestaan |
| Rate limiting | âœ… 429 na het ingestelde maximum |
| `/server.js`, `/package.json`, `/render.yaml`, alle `*.md`, `/.env.example`, `/scripts/check-data.mjs`, `/.git/config` | âœ… 404 (geblokkeerd) |
| Path traversal (`/../server.js`, `/%2e%2e/server.js`) | âœ… 404 |
| Oude projectnaam en oude coachnaam | âœ… geen verwijzingen meer |
| Import van kapotte JSON (lege stappen, ongeldige categorie/duur, dubbele id's) | âœ… schoongemaakt of geweigerd |
| Startpagina in headless Chrome | âœ… 30 kaarten, 30 covers, geen `undefined` |
| Projectpagina `#/idee/raad-het-getal` | âœ… 5 stappen, 5 codeblokken, 1 cover, juiste titel |
| Leerpad `#/leerpad` | âœ… 161 projecten gegroepeerd per niveau |
| Mijn ideeÃ«n `#/mijn-ideeen` | âœ… lege staat zonder projecten, 1 kaart met testproject |
| Filters via URL (`q`, `categorie`, `niveau`) | âœ… 2 resultaten, zoekveld en actieve chips kloppen |
| Filters wissen | âœ… 161 projecten, 30 kaarten, URL terug naar `#/` |
| Categorie Games + meer laden | âœ… 36 resultaten, 30 â†’ 36 kaarten |
| Verras me | âœ… navigeert naar een bestaande projectpagina |
| Voortgang: 2 van 5 stappen | âœ… 40% en 2 afgevinkte stappen |
| Stap afvinken | âœ… opgeslagen als `[0,1,2]`, weergave 60% |
| Project afronden | âœ… alle 5 stappen opgeslagen, knop uitgeschakeld, 30 confettistukjes |
| Voortgang resetten | âœ… opslag leeg en 0 afgevinkte stappen |
| Onbekende route | âœ… "Niet gevonden"-pagina |

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
- Eigen projecten kun je daarnaast exporteren/importeren op **Mijn ideeÃ«n**.
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

Op Windows opent `start-easycodey.bat` standaard de beveiligde live-app. Gebruik `start-easycodey.bat local` of `start-easycodey-local.bat` voor de lokale ontwikkelversie.

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
2. Upload de inhoud van deze map. Gebruik GitHub Desktop als `git` niet geÃ¯nstalleerd is.
3. Ga naar [render.com](https://render.com) en kies **New â†’ Web Service**.
4. Koppel de repository.
5. Kies runtime **Node**.
6. Vul Build Command `npm install` en Start Command `npm start` in.
7. Voeg optioneel omgevingsvariabelen toe.
8. Deploy.

### Via render.yaml (Blueprint)

`render.yaml` staat klaar. Kies **New â†’ Blueprint**, koppel de repository en vul daarna de geheime variabelen in het Render-dashboard in.

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
- De eerste aanvraag daarna kan 30â€“60 seconden duren.
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
  "ðŸš€",
  "Games",
  "Beginner",
  "45 min",
  "EÃ©n zin voor op de kaart.",
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
| GitHub-repository | âœ… https://github.com/yousefabujarad2014-beep/easycodey |
| GitHub Pages | âœ… https://yousefabujarad2014-beep.github.io/easycodey/ |
| Windows-snelkoppelingen | âœ… bureaublad + startmenu |
| Python-speelveld op de live site | âœ… |
| Programmeer-editor op de live site | âœ… |
| Installeerbare app (PWA) | âœ… manifest, service worker, offline-cache en **volledig automatische updates** |
| Chique huisstijl + logo | âœ… ivoor/diepgroen/goud en eigen monogram |
| Optionele profielen + back-up | âœ… `#/profiel`, lokale profielen, optioneel contact en JSON-back-up |
| Eigenaarspaneel | âœ… `#/eigenaar`, lokale statistieken, mededeling en download |
| Invoerhulp bij `input()` | âœ… de vraag en het tekstvak verschijnen in het venster bovenaan |
| 161 vaste projectpagina's + overzicht | âœ… `/idee/<id>/` en `/projecten/` |
| Installatiepagina met QR-code | âœ… `/installeren/` |
| Contactpagina | âœ… `/contact/` met telefoon/WhatsApp en e-mail |
| Doneerpagina | âœ… `/doneren/` met IBAN, houder, bank, BIC en transparantie |
| Privacybeleid | âœ… `/privacy/` met lokale opslag, geen verkoop en contact |
| Sitemap met 168 URL's | âœ… gegenereerd door `npm run pages` |
| Google Play (TWA) | â³ technisch klaar: TWA-project, keystore, `assetlinks.json`, AAB, iconen, screenshots en store-tekst. Publicatie wacht op een Play Developer-account |
| Online AI-coach | gratis online AI standaard; eigen server of OpenAI-sleutel optioneel |
| Doneren | âœ… Belfius IBAN via `site-config.json` en de doneerpagina |

Wat optioneel nog kan:

1. Render Web Service of Blueprint koppelen voor de online AI-coach (`npm install`, `npm start`).
2. `OPENAI_API_KEY`, `SITE_URL` en eventueel `DONATE_URL` in Render instellen.
3. Site aanmelden bij Google Search Console en de sitemap met 168 URL's insturen; zie `GOOGLE.md`.
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
- `input()` opent een venster bovenaan het scherm met de **vraag van het programma** en een tekstvak. Een oneindige loop stopt pas als je het tabblad of venster sluit.
- Editor-code en profielen staan per browser/apparaat in `localStorage`; er is geen account op een server of automatische synchronisatie.
- De geÃ¯nstalleerde app deelt de opslag met de website in dezelfde browser, maar niet met andere apparaten.
- Offline werkt alles behalve de online AI-coach en doneren; de offline coach blijft beschikbaar.
- De service worker werkt alleen via `https://` of `localhost`, niet als los bestand (`file://`).
- De vaste projectpagina's worden statisch gegenereerd. Na een datawijziging moet je `npm run pages` of `npm run build` opnieuw uitvoeren.
- De hash-routes van de interactieve app staan niet in de sitemap; Google indexeert de vaste pagina's op `/idee/<id>/`.
- Donaties lopen via een bankoverschrijving of externe aanbieder; de site verwerkt zelf geen betalingen.


