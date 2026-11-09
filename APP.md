# EasyCodey als app

**Laatst bijgewerkt:** 9 november 2026

EasyCodey is een **installeerbare webapp** (PWA). Je installeert dezelfde site als een app: met een eigen icoon, een eigen venster en offline ondersteuning. Er is geen app-store, account of download nodig.

Live: https://yousefabujarad2014-beep.github.io/easycodey/

Installatiepagina met QR-code: https://yousefabujarad2014-beep.github.io/easycodey/installeren/

Contact: https://yousefabujarad2014-beep.github.io/easycodey/contact/ — telefoon/WhatsApp **+32 466 47 66 52**, e-mail **yousefabujarad2014@gmail.com**

Doneren: https://yousefabujarad2014-beep.github.io/easycodey/doneren/ — IBAN **BE69 0638 3621 2278**, houder **Yousef Abujarad (EasyCodey)**, bank **Belfius**, BIC **GKCCBEBB**

---

## 1. Installeren

### Windows of macOS (Chrome of Edge)

1. Open de live site.
2. Klik rechtsboven in de adresbalk op het **installatie-icoon**, of gebruik het menu ⋮ → **App installeren**.
3. Bevestig met **Installeren**.

EasyCodey staat daarna in het startmenu en op het bureaublad, en opent in een eigen venster zonder adresbalk.

Je kunt ook op het **📲-icoon** in de header of op **📲 Installeer als app** in de footer klikken. Daar staat de uitleg per platform en, als je browser het ondersteunt, de knop **Installeer nu**.

### Android (Chrome)

1. Open de live site in Chrome.
2. Menu ⋮ → **App installeren** of **Toevoegen aan startscherm**.
3. Bevestig.

Je kunt ook op het **📲-icoon** in de header tikken. Verscheen de knop **Installeer nu**? Tik daar dan op; Chrome toont dan meteen het installatievenster.

**Geen "App installeren" in het menu?**

- Gebruik **Chrome** (of Edge/Samsung Internet), niet Firefox of een in-app browser.
- Sluit incognito en open de site in een normaal tabblad.
- Bezoek de site één keer online en wacht een paar seconden, zodat de service worker klaar is.
- Installeer altijd via de beveiligde link **https://yousefabujarad2014-beep.github.io/easycodey/**, niet via een lokaal bestand of een oude snelkoppeling.
- Zie je een melding over een **onveilige of oude versie**? Open de site online en gebruik **App bijwerken** in het installatievenster. EasyCodey haalt dan de nieuwste code en styles op.
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
| Vaste projectpagina's `/idee/<id>/` en `/projecten/` | ✅ na één keer online bezoek |
| Voortgang, thema, profielen en eigen projecten | ✅ |
| Python-speelveld en editor | ✅ na de eerste keer online |
| Offline AI-coach | ✅ |
| Online AI-coach (OpenAI) | ❌ internet nodig |
| Doneren per bank (pagina `/doneren/`) | ❌ internet nodig |

De service worker bewaart de app-shell (HTML, CSS, JavaScript, data en afbeeldingen) bij de eerste installatie. De Python-runtime (Pyodide, ongeveer 10 MB) wordt bewaard zodra je hem één keer gebruikt. Daarna werken **▶ Speel**, **▶ Speel dit idee** en de editor ook zonder internet.

Je voortgang staat per browser en per apparaat in `localStorage`. Met een optioneel profiel op `#/profiel` houd je gebruikers op hetzelfde apparaat gescheiden. Er is geen account op een server en geen automatische synchronisatie tussen apparaten; gebruik de back-up om je gegevens te verhuizen.

---

## 3. De app bijwerken

EasyCodey haalt code, styles en data altijd **eerst van het netwerk** en bewaart daarna een kopie voor offline gebruik. Zo blijf je niet achter een oude versie hangen. De service worker registreert met `updateViaCache: "none"`, controleert bij het starten en elke 30 minuten op een nieuwe versie, en neemt een nieuwe versie automatisch over.

Zo werk je handmatig bij:

1. Open de app of de website.
2. Open **📲 Installeer als app** (of **Installeren** in de footer).
3. Klik op **↻ App bijwerken**.

EasyCodey verwijdert dan de oude service worker en caches en herlaadt de nieuwste versie. Je voortgang en profielen blijven bewaard.

Zie je een melding over een **onveilige of oude versie**? Open dan altijd de beveiligde link **https://yousefabujarad2014-beep.github.io/easycodey/**. HTTP wordt automatisch naar HTTPS omgeleid (behalve op localhost). Gebruik geen oude snelkoppeling of lokaal bestand.

Voor ontwikkelaars: verhoog `VERSION` in `sw.js` (bijvoorbeeld van `easycodey-v5` naar `easycodey-v6`). De oude cache wordt dan bij de volgende start verwijderd.

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
- **Application → Cache Storage**: `easycodey-v6-shell` en `easycodey-v6-runtime`.
- **Lighthouse → Progressive Web App**: controleert installeerbaarheid en offline werking.
- `npm run check` controleert het manifest, de service worker, alle offline-bestanden, de 161 vaste pagina's en de sitemap.

> **Let op:** een service worker werkt alleen via `https://` of `http://localhost`. Open de site dus niet als los bestand (`file://`).

---

## 6. Profielen en back-up

Een profiel is **optioneel**. Het is handig als meerdere mensen hetzelfde apparaat gebruiken: iedereen krijgt eigen voortgang, eigen projecten en eigen editor-code.

1. Open `#/profiel` via het **👤-icoon** in de header of de link in de footer.
2. Kies een naam en een PIN van 4 tot 12 cijfers.
3. Vink **Neem mijn huidige voortgang mee** aan als je bestaande gastvoortgang wilt overnemen.

Profielen staan alleen op dit apparaat in `localStorage`. De PIN houdt profielen uit elkaar, maar is geen sterke beveiliging tegen iemand met toegang tot het apparaat. Er is geen account op een server.

Met **Back-up downloaden** bewaar je voortgang, eigen projecten en editor-code als JSON-bestand. Met **Back-up herstellen** zet je dat bestand terug, bijvoorbeeld op een nieuwe telefoon of na het wissen van je browsergegevens.
