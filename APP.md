# EasyCodey als app

**Laatst bijgewerkt:** 8 november 2026

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
| Voortgang, thema en eigen projecten | ✅ |
| Python-speelveld en editor | ✅ na de eerste keer online |
| Offline AI-coach | ✅ |
| Online AI-coach (OpenAI) | ❌ internet nodig |
| Doneren per bank (pagina `/doneren/`) | ❌ internet nodig |

De service worker bewaart de app-shell (HTML, CSS, JavaScript, data en afbeeldingen) bij de eerste installatie. De Python-runtime (Pyodide, ongeveer 10 MB) wordt bewaard zodra je hem één keer gebruikt. Daarna werken **▶ Speel**, **▶ Speel dit idee** en de editor ook zonder internet.

Je voortgang staat per browser en per apparaat in `localStorage`. Er is geen account en geen synchronisatie tussen apparaten.

---

## 3. De app bijwerken

De app laadt automatisch de nieuwste versie zodra je online bent. De service worker haalt gewijzigde bestanden op de achtergrond op en gebruikt ze bij de volgende start.

Na een grote wijziging kun je de cache geforceerd verversen:

1. Open de app.
2. Sluit alle vensters van EasyCodey.
3. Open de app opnieuw.

Voor ontwikkelaars: verhoog `VERSION` in `sw.js` (bijvoorbeeld van `easycodey-v1` naar `easycodey-v2`). De oude cache wordt dan bij de volgende start verwijderd.

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
| `assets/icons/` | PNG-iconen voor 192 px, 512 px, maskable en Apple |
| `index.html` | Manifest, Apple-metatags en de installeerknop |

De service worker gebruikt twee caches:

- **shell-cache** — alle vaste bestanden, gevuld bij de installatie.
- **runtime-cache** — lettertypen en de Python-runtime van jsDelivr, gevuld bij gebruik.

Navigatie gaat **network-first** (zo zie je meteen nieuwe versies), statische bestanden **stale-while-revalidate** en de CDN **cache-first**.

### Iconen opnieuw maken

De SVG-bronnen staan in `assets/icons/icon.svg` en `assets/icons/maskable.svg`. Pas ze aan en genereer de PNG's opnieuw:

```powershell
npm run icons
```

Het script start zelf een tijdelijke headless Chrome. Staat Chrome ergens anders, zet dan `CHROME_PATH`.

### Controleren

- **Chrome DevTools → Application → Manifest**: naam, iconen en start-URL moeten groen zijn.
- **Application → Service Workers**: status *activated and is running*.
- **Application → Cache Storage**: `easycodey-v2-shell` en `easycodey-v2-runtime`.
- **Lighthouse → Progressive Web App**: controleert installeerbaarheid en offline werking.
- `npm run check` controleert het manifest, de service worker, alle offline-bestanden, de 161 vaste pagina's en de sitemap.

> **Let op:** een service worker werkt alleen via `https://` of `http://localhost`. Open de site dus niet als los bestand (`file://`).
