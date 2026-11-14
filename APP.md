# EasyCodey als app

**Laatst bijgewerkt:** 14 november 2026

EasyCodey is een **installeerbare webapp** (PWA). Je installeert dezelfde site als een app: met een eigen icoon, een eigen venster en offline ondersteuning. Er is geen app-store, account of download nodig.

Live: https://yousefabujarad2014-beep.github.io/easycodey/

Installatiepagina met QR-code: https://yousefabujarad2014-beep.github.io/easycodey/installeren/

Contact: https://yousefabujarad2014-beep.github.io/easycodey/contact/ — telefoon/WhatsApp **+32 466 47 66 52**, e-mail **yousefabujarad2014@gmail.com**

Doneren: https://yousefabujarad2014-beep.github.io/easycodey/doneren/ — IBAN **BE69 0638 3621 2278**, houder **Yousef Abujarad (EasyCodey)**, bank **Belfius**, BIC **GKCCBEBB**

---

## Nieuw in v16

- **Editor met regelnummers en kleuren.** Je ziet meteen waar je bent. Onder de code staat je positie (regel en kolom) en op je telefoon heb je een toetsenbalk met `:`, haakjes, aanhalingstekens, `=`, `#`, 4 spaties en Enter.
- **Slimme inspringing.** Na een dubbele punt zet **Enter** automatisch vier spaties klaar. Enter neemt de inspringing van de vorige regel over en **Shift+Tab** haalt vier spaties weg.
- **Bekijk regel N.** Geeft je code een fout, dan zegt EasyCodey in eenvoudig Nederlands wat er misgaat en springt **Bekijk regel N** naar de juiste regel.
- **Privacy-overzicht.** In **Instellingen** zie je hoeveel profielen, voortgang, eigen ideeën, chatberichten en editortekens er lokaal staan, en hoeveel ruimte dat inneemt. Met **🧹 Al mijn gegevens wissen** wis je alles in twee bevestigingen.
- **Tekstgrootte.** Kies **Normaal**, **Groot** of **Extra groot**. De app past zich ook aan als je toestel om meer contrast vraagt.
- **Online/offline badge.** Bovenaan zie je duidelijk wanneer je offline bent en dat je werk bewaard blijft. Kom je terug online, dan meldt de app dat alles weer werkt.
- **AI-intake.** EasyCoach vraagt eerst waar je hulp bij nodig hebt. Na je eerste vraag verdwijnt die hulp; na **Gesprek wissen** komt hij terug.
- **Betrouwbaardere AI.** De coach probeert het automatisch drie keer en houdt antwoorden kort (ongeveer 150 woorden).
- **Zoekbalkfix.** Na verversen verschijnt je gebruikersnaam niet meer in het zoekveld, ook niet als de browser het veld pas later of bij focus vult.
- **Optionele eigen teller.** De eigenaar kan een gratis Cloudflare Worker + D1 koppelen (`worker/README.md`). De app valt automatisch terug op Abacus.

---

## 1. Installeren

### Windows of macOS (Chrome of Edge)

1. Open de live site.
2. Klik rechtsboven in de adresbalk op het **installatie-icoon**. Zie je dat niet? Gebruik het menu: Chrome **⋮ → Cast, opslaan en delen → App installeren**; Edge **⋯ → Apps → Deze site als app installeren**.
3. Bevestig met **Installeren**.

EasyCodey staat daarna in het startmenu en op het bureaublad, en opent in een eigen venster zonder adresbalk.

Je kunt ook op het **📲-icoon** in de header of op **📲 Installeer als app** in de footer klikken. Het venster herkent je **browser en toestel**, toont alleen de stap die daarbij past en heeft een knop **✅ Is het gelukt?**. Zegt die “Nog niet gelukt”, volg dan de stap hierboven. Zie je EasyCodey wél in je startmenu of app-lijst? Bevestig dan met **Ik zie EasyCodey in mijn apps**.

### Android (Chrome)

1. Open de live site in Chrome.
2. Menu ⋮ → **App installeren** of **Toevoegen aan startscherm**.
3. Bevestig.

Je kunt ook op het **📲-icoon** in de header tikken. Verscheen de knop **Installeer nu**? Tik daar dan op; Chrome toont dan meteen het installatievenster.

**Geen "App installeren" in het menu?**

- Gebruik **Chrome** (of Edge/Samsung Internet), niet Firefox of een in-app browser.
- Open je de site via **WhatsApp, Instagram, Facebook of TikTok**? Daarin kun je niet installeren. Tik op ⋯ of ⋮ en kies **Openen in Chrome** (Android) of **Open in Safari** (iPhone).
- Zie je **“Beveiligd en privé”** of een slotje? Dat betekent alleen dat de verbinding veilig is (HTTPS). Het blokkeert de installatie niet.
- Sluit incognito en open de site in een normaal tabblad.
- Bezoek de site één keer online en wacht een paar seconden, zodat de service worker klaar is.
- Installeer altijd via de beveiligde link **https://yousefabujarad2014-beep.github.io/easycodey/**, niet via een lokaal bestand of een oude snelkoppeling.
- Krijg je een melding over een **oude versie**? Open de site online via de beveiligde HTTPS-link. EasyCodey haalt dan automatisch de nieuwste code en styles op. Zie je nog een oude app of snelkoppeling? Verwijder die en installeer opnieuw via de HTTPS-link; zie `#oude-app` op `/installeren/`.
- Werk Chrome bij via de Play Store en herstart de browser.
- Als laatste redmiddel: menu ⋮ → **Toevoegen aan startscherm**. Je krijgt dan een snelkoppeling die ook zonder adresbalk opent.

### iPhone of iPad (Safari)

1. Open de live site in Safari.
2. Tik op **Deel** (het vierkantje met het pijltje).
3. Kies **Zet op beginscherm** → **Voeg toe**.

iOS gebruikt hiervoor geen installatieprompt; de app opent daarna in een eigen venster.

---

## 2. Wat werkt offline?

| Onderdeel | Offline |
|---|---|
| Alle 161 projecten, uitleg, stappen en tips | ✅ |
| Interactieve app-previews en de knoppen Speel dit idee / Gebruik dit idee | ✅ |
| Vaste projectpagina's `/idee/<id>/` en `/projecten/` | ✅ na één keer online bezoek |
| Voortgang, thema, accounts en eigen projecten | ✅ |
| Python-speelveld en editor | ✅ na de eerste keer online |
| Offline AI-coach | ✅ |
| Online AI-coach (gratis dienst) | ❌ internet nodig |
| Online AI-coach met eigen OpenAI-sleutel | ❌ internet nodig |
| Doneren per bank (pagina `/doneren/`) | ❌ internet nodig |

De service worker bewaart de app-shell (HTML, CSS, JavaScript, data en afbeeldingen) bij de eerste installatie. De Python-runtime (Pyodide, ongeveer 10 MB) wordt bewaard zodra je hem één keer gebruikt, of met **📥 Offline klaarzetten**. Daarna werken **▶ Speel**, **▶ Speel dit idee** en de editor ook zonder internet, en zie je **✅ Python werkt nu ook offline**. De runtime-cache blijft bewaard bij een app-update.

Je voortgang staat per browser en per apparaat in `localStorage`. Met een optioneel account op `#/profiel` houd je gebruikers op hetzelfde apparaat gescheiden. Er is geen account op een server en geen automatische synchronisatie tussen apparaten; gebruik de back-up om je gegevens te verhuizen.

De **online AI-coach staat standaard aan** en gebruikt een gratis AI-dienst. Hij **begrijpt eerst je vraag**: hij vat samen wat je bedoelt en stelt 1 of 2 korte vragen als er iets ontbreekt. Pas daarna krijg je uitleg of code. Je vraag, het gesprek en de projectcontext gaan naar die dienst; je voortgang, account en contactgegevens nooit. Je kunt de online coach in de instellingen uitzetten en dan volledig offline werken. Na elk antwoord krijg je vervolgvragen, waaronder **Ik bedoelde iets anders** (dat vult je invoerveld en verstuurt nog niets), en bij een storing een knop **Opnieuw proberen met AI**. Het gesprek wordt lokaal per profiel bewaard en blijft na verversen staan; **Gesprek wissen** ruimt het op.

### Android-app als APK

Naast de installeerbare webapp is er een echte Android-app als **APK**: `download/EasyCodey-1.0.0.apk` (1,89 MB). Je vindt hem op **`/download/`**, in de footer onder **⬇ Android-app** en in het installatievenster. Dit werkt zonder Google Play en zonder betaling.

- De APK is ondertekend met de uploadsleutel; de fingerprint staat in `/.well-known/assetlinks.json`, dus de app opent zonder adresbalk.
- De pagina toont de **SHA-256**, een QR-code voor je telefoon, installatiestappen, uitleg over Play Protect en een hashcontrole.
- Android waarschuwt soms bij een APK buiten Google Play. Tik op **Meer details** → **Toch installeren** en zet **Onbekende apps installeren** aan voor je browser. Een melding **“Beveiligd en privé”** gaat over de beveiligde website en blokkeert de installatie niet.
- De inhoud werkt automatisch bij via de website. Alleen een nieuwe Android-schil vraagt een nieuwe APK; zie `PLAYSTORE.md`.

---

## 3. De app bijwerken

EasyCodey haalt code, styles en data altijd **eerst van het netwerk** en bewaart daarna een kopie voor offline gebruik. Zo blijf je niet achter een oude versie hangen. De service worker registreert met `updateViaCache: "none"` en controleert automatisch op een nieuwe versie:

- bij het starten van de app;
- elke 15 minuten terwijl de app open blijft;
- zodra je terugkeert naar de app (tabblad of venster wordt weer zichtbaar);
- zodra je toestel weer online komt.

Een nieuwe versie wordt automatisch geactiveerd en de pagina herlaadt zichzelf. Zo staat de app op Android en op je laptop steeds op de nieuwste versie. Er is geen handmatige updateknop meer nodig; je hoeft zelf niets te doen.

Krijg je een melding over een **oude versie**? Open dan altijd de beveiligde link **https://yousefabujarad2014-beep.github.io/easycodey/**. HTTP wordt automatisch naar HTTPS omgeleid (behalve op localhost). Gebruik geen oude snelkoppeling of lokaal bestand. De live app gebruikt HTTPS met HSTS; je browser toont een slotje. Zie je nog een oude app? Verwijder die en installeer opnieuw via de HTTPS-link.

Voor ontwikkelaars: verhoog `VERSION` in `sw.js` (bijvoorbeeld van `easycodey-v11` naar `easycodey-v12`). De oude cache wordt dan bij de volgende start verwijderd.

### Als de app of website niet opent

EasyCodey heeft twee vangnetten, zodat je nooit met een leeg scherm blijft zitten:

1. **De preview-module is losgekoppeld.** De interactieve demo's (`js/previews.js`) worden pas geladen als je een project opent. Lukt dat niet, dan zie je automatisch de volledige code en blijven de knoppen **App** en **Code** werken.
2. **Herstelscherm.** Als de app zelf niet start, verschijnt na een paar seconden een uitleg met twee knoppen: **Opnieuw proberen** en **App-cache wissen en herladen**. Je voortgang, profielen en eigen projecten blijven daarbij bewaard.

Lukt het nog steeds niet? Open de site in een incognitovenster of wis bij de browserinstellingen de sitegegevens van `yousefabujarad2014-beep.github.io`. Daarna installeer je opnieuw via **https://yousefabujarad2014-beep.github.io/easycodey/installeren/**.

---

## 4. De app verwijderen

- **Windows:** Instellingen → Apps → EasyCodey → Verwijderen. Of rechtermuisknop op het icoon → Verwijderen.
- **Android:** houd het icoon ingedrukt → Verwijderen.
- **iPhone/iPad:** houd het icoon ingedrukt → Verwijder app.

Je voortgang verdwijnt mee als je de app-gegevens wist. De website blijft gewoon bestaan.

---

## 5. Techniek

| Bestand | Functie |
|---|---|
| `manifest.webmanifest` | Naam, korte naam, start-URL, kleuren, iconen en snelkoppelingen |
| `sw.js` | Service worker: app-shell cachen, offline fallback en runtime-cache |
| `offline.html` | Pagina die verschijnt als een pagina niet in de cache staat |
| `assets/icons/` | Logo (`logo.svg`) en PNG-iconen voor 192 px, 512 px, maskable en Apple |
| `index.html` | Manifest, Apple-metatags en de installeerknop |

De service worker gebruikt twee caches:

- **shell-cache** — alle vaste bestanden, gevuld bij de installatie.
- **runtime-cache** — lettertypen en de Python-runtime van jsDelivr, gevuld bij gebruik.

Navigatie en same-origin code/styles gaan **network-first** (zo zie je meteen nieuwe versies), afbeeldingen en lettertypen **cache-first** en de CDN **cache-first**. De runtime-cache vult zich bij gebruik.

### Iconen opnieuw maken

De SVG-bronnen staan in `assets/icons/logo.svg` (favicon en logo), `assets/icons/icon.svg` (app-icoon) en `assets/icons/maskable.svg` (maskable icoon). Pas ze aan en genereer de PNG's opnieuw:

```powershell
npm run icons
```

Het script start zelf een tijdelijke headless Chrome. Staat Chrome ergens anders, zet dan `CHROME_PATH`.

### Controleren

- **Chrome DevTools → Application → Manifest**: naam, iconen en start-URL moeten groen zijn.
- **Application → Service Workers**: status *activated and is running*.
- **Application → Cache Storage**: `easycodey-v8-shell` en `easycodey-v8-runtime`.
- **Lighthouse → Progressive Web App**: controleert installeerbaarheid en offline werking.
- `npm run check` controleert het manifest, de service worker, alle offline-bestanden, de 161 vaste pagina's en de sitemap.

> **Let op:** een service worker werkt alleen via `https://` of `http://localhost`. Open de site dus niet als los bestand (`file://`).

---

## 6. Accounts en back-up

Een account is **optioneel**. Het is handig als meerdere mensen hetzelfde apparaat gebruiken: iedereen krijgt eigen voortgang, eigen projecten en eigen editor-code. Aanmelden gaat snel, zoals bij Kahoot.

1. Open `#/profiel` via het **👤-icoon** in de header of de link in de footer.
2. Kies een naam en een wachtwoord van minstens 4 tekens. Een e-mailadres of telefoonnummer is **optioneel**; het blijft lokaal op dit apparaat en wordt nooit verstuurd.
3. Vink **Neem mijn huidige voortgang mee** aan als je bestaande gastvoortgang wilt overnemen.
4. Inloggen doe je met je naam en wachtwoord. Met **Toon/Verberg** kun je je wachtwoord even bekijken.

Accounts staan alleen op dit apparaat in `localStorage`. Het wachtwoord houdt accounts uit elkaar, maar is geen sterke beveiliging tegen iemand met toegang tot het apparaat. Er is geen account op een server. Oude accounts met een PIN blijven werken: de PIN wordt automatisch als wachtwoord gelezen.

Zodra je bent ingelogd, verschijnt er een **chatknop** in de footer en als zwevende knop rechtsonder. Op je profielpagina staat bovendien een grote **Chat met EasyCoach**-kaart. De knop werkt op Android en op je laptop. De header heeft geen tweede chatknop: zo blijft het overzichtelijk.

Met **Back-up downloaden** bewaar je voortgang, eigen projecten en editor-code als JSON-bestand. Met **Back-up herstellen** zet je dat bestand terug, bijvoorbeeld op een nieuwe telefoon of na het wissen van je browsergegevens.

### Eigenaarspaneel

**Inloggen als eigenaar:** ga naar **Mijn profiel** en log in met de eigenaarsnaam en het
eigenaars-wachtwoord. Daarna ben je op dat toestel eigenaar: het beheer opent zonder code en je
profiel krijgt het label **Eigenaar**. Het account wordt bij de eerste login lokaal aangemaakt.

Alternatief: open `#/eigenaar` (link **🔑 Beheer** in de footer) en vul de eigenaarscode of het
eigenaars-wachtwoord in. Dat werkt ook opnieuw nadat je op **Vergrendelen** hebt geklikt.

Je ziet dan:

- hoeveel profielen er op **dit apparaat** zijn gemaakt;
- de naam, het optionele contact, de aanmaakdatum, de laatste activiteit en de voortgang per profiel;
- knoppen om de voortgang van een profiel te wissen of een lokaal account te verwijderen;
- een mededeling die bovenaan de app verschijnt;
- **Inzicht en updates:** app-versie, service worker, aantal offline bestanden, opslaggebruik en de
  laatste automatische update;
- **Bezoekcijfers:** de ingebouwde anonieme teller toont meteen **unieke bezoekers**, **bezoeken**,
  **unieke installaties** en **APK-downloads**. Geen account nodig; geen cookies of persoonsgegevens.
  Met **Cijfers verversen**
  haal je de nieuwste stand op;
- **Bezoekers meten:** vul daarnaast je GoatCounter-sitecode in voor uitgebreidere inzichten:
  populairste projecten, versies en regio. Zonder sitecode wordt er niets naar GoatCounter geladen
  of verstuurd. De code in het vak geldt alleen op dit toestel; voor alle bezoekers zet je dezelfde
  code in `site-config.json` bij `analyticsSite`;
- **Alles downloaden** als JSON met alle lokale profielen en hun voortgang.

Het paneel is een lokale toegangspoort, geen serverbeveiliging. Er is geen database: andere telefoons en computers hebben hun eigen lokale profielen. Wachtwoorden zijn nooit zichtbaar.

---

## 7. Veilig en privé

EasyCodey is bewust rustig en veilig opgezet:

- **HTTPS:** de live app werkt via `https://yousefabujarad2014-beep.github.io/easycodey/` met een geldig certificaat, HSTS en een automatische doorverwijzing van HTTP naar HTTPS.
- **Lokaal:** voortgang, accounts en eigen projecten staan alleen in de opslag van je eigen browser. Er is geen database en geen server die je gegevens bewaart.
- **Jij bepaalt wat er blijft:** in **Instellingen** zie je een overzicht van alle lokale gegevens en kun je met **🧹 Al mijn gegevens wissen** alles verwijderen. Je krijgt twee bevestigingen voordat er iets verdwijnt.
- **Geen advertenties of trackers:** er zijn geen advertentienetwerken. Alleen als de eigenaar een GoatCounter-sitecode instelt, worden anonieme bezoekcijfers geteld — cookieloos, zonder persoonsgegevens en met een opt-out in **Mijn profiel → Privacy en statistieken**.
- **Automatische updates:** de app controleert bij de start, elke 15 minuten, bij terugkeer naar de app, bij `pageshow` en zodra je weer online bent. Een nieuwe versie wordt automatisch geactiveerd.
- **Geen sterke beveiliging:** het wachtwoord houdt accounts op hetzelfde apparaat uit elkaar. Gebruik geen belangrijk wachtwoord, want iemand met toegang tot je toestel kan bij de lokale opslag.
- **Oude app verwijderen:** krijg je nog een melding over een oude versie, verwijder dan de oude app of snelkoppeling en installeer opnieuw via de HTTPS-link. Stap voor stap staat op `/installeren/#oude-app`.

Op de site staat een beveiligingsbadge in de footer. Op HTTPS toont die **Beveiligde HTTPS-verbinding**; lokaal toont die **Lokale ontwikkelversie**.
