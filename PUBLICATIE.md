# EasyCodey — publicatie op GitHub en Render

**Laatst bijgewerkt:** 8 november 2026
**Projectmap:** `C:\Users\Home\Desktop\FLL`

Dit document beschrijft hoe EasyCodey lokaal is voorbereid en hoe de publicatie naar GitHub en Render verloopt. Geheime waarden (tokens, sleutels, toegangscodes) staan **niet** in dit bestand.

## Status: live

| Onderdeel | Status |
|---|---|
| GitHub-repository | ✅ https://github.com/yousefabujarad2014-beep/easycodey (openbaar) |
| GitHub Pages | ✅ https://yousefabujarad2014-beep.github.io/easycodey/ |
| Laatste Pages-build | ✅ laatste commit op `main`, Pages bouwt automatisch |
| Programmeer-editor | ✅ `#/programmeren`, Pyodide in de browser |
| Render (online AI-coach) | ⏳ optioneel, nog niet gekoppeld |

Op GitHub Pages draait alleen de statische site. De online AI-coach en de server-doneerlink vallen daar weg; de site gebruikt automatisch de offline coach en de IBAN uit `site-config.json`. Het Python-speelveld, de programmeer-editor en alle 161 projecten werken volledig.

---

## 1. Lokale hulpmiddelen

Git en GitHub CLI zijn portable geïnstalleerd, zonder admin-rechten en buiten de projectmap:

| Tool | Versie | Pad |
|---|---|---|
| GitHub CLI | 2.103.3 | `C:\Users\Home\AppData\Local\Programs\EasyCodeTools\gh\bin\gh.exe` |
| Git (MinGit) | 2.56.0.4 | `C:\Users\Home\AppData\Local\Programs\EasyCodeTools\git\cmd\git.exe` |

De mappen:

```
C:\Users\Home\AppData\Local\Programs\EasyCodeTools\
├── gh\          GitHub CLI
├── git\         Portable Git
└── PUBLICATIE.md  Kopie van dit document
```

Deze tools staan bewust buiten de projectmap, zodat ze niet in de repository terechtkomen.

### Tools gebruiken in een PowerShell-sessie

```powershell
$env:Path = "$env:LOCALAPPDATA\Programs\EasyCodeTools\gh\bin;$env:LOCALAPPDATA\Programs\EasyCodeTools\git\cmd;$env:Path"
gh --version
git --version
```

---

## 2. GitHub-login

De login loopt via de officiële device-flow van GitHub CLI:

```powershell
gh auth login --hostname github.com --git-protocol https --web
```

1. Open **https://github.com/login/device**
2. Voer de eenmalige code in die in de chat of op het klembord staat.
3. Log in en keur **GitHub CLI** goed.
4. Controleer daarna:

```powershell
gh auth status
```

### Status

- [ ] GitHub CLI geautoriseerd
- [ ] Repository aangemaakt
- [ ] Bestanden gecommit en gepusht

> De eenmalige code verloopt na ongeveer 15 minuten. Start het commando opnieuw als de code niet meer werkt. Deel de code niet en bewaar hem niet in dit bestand.

---

## 3. Repository aanmaken en pushen

Zodra `gh auth status` een account toont, gebeurt dit automatisch:

```powershell
$env:Path = "$env:LOCALAPPDATA\Programs\EasyCodeTools\gh\bin;$env:LOCALAPPDATA\Programs\EasyCodeTools\git\cmd;$env:Path"

cd C:\Users\Home\Desktop\FLL
git init -b main
git add .
git commit -m "EasyCodey: 161 Python-projecten met AI-coach"
gh repo create easycodey --public --source=. --remote=origin --push
```

Instellingen:

- **Repositorynaam:** `easycodey`
- **Zichtbaarheid:** openbaar (eenvoudiger voor de gratis Render-tier)
- **Branch:** `main`

Na het pushen staat de code op:

```
https://github.com/<gebruikersnaam>/easycodey
```

### Controleren

```powershell
git status
git log --oneline -1
gh repo view --web
```

---

## 4. Deployen naar Render

EasyCodey heeft **geen build-stap**.

- **Build Command:** `npm install`
- **Start Command:** `npm start`
- **Runtime:** Node

Gebruik niet `npm run build`; dat script bestaat bewust niet. `npm install` is veilig omdat er geen dependencies zijn.

### Optie A — Blueprint (aanbevolen)

`render.yaml` staat in de repository. Na het pushen:

1. Open **https://render.com/deploy**
2. Kies **New Blueprint** en koppel de repository `easycodey`.
3. Render leest `render.yaml`.
4. Vul de geheime variabelen in het dashboard in.
5. Deploy.

Of gebruik de directe link (vul je GitHub-gebruikersnaam in):

```
https://render.com/deploy?repo=https://github.com/<gebruikersnaam>/easycodey
```

### Optie B — Handmatige Web Service

1. Ga naar **https://dashboard.render.com**
2. Kies **New → Web Service**
3. Koppel de repository.
4. Runtime **Node**
5. Build Command `npm install`
6. Start Command `npm start`
7. Voeg de omgevingsvariabelen toe.
8. Deploy.

---

## 5. Omgevingsvariabelen op Render

| Variabele | Verplicht | Omschrijving |
|---|---|---|
| `OPENAI_API_KEY` | Nee | Sleutel voor de AI-coach. Zonder sleutel werkt de offline coach. |
| `OPENAI_MODEL` | Nee | Standaard `gpt-4o-mini`. |
| `OPENAI_BASE_URL` | Nee | Standaard `https://api.openai.com/v1`. |
| `ACCESS_CODE` | Nee | Vraagt bezoekers een toegangscode voor de AI-coach. |
| `RATE_LIMIT` | Nee | Maximaal AI-verzoeken per uur per IP, standaard 30. |
| `DONATE_URL` | Nee | Doneerlink (Ko-fi, Buy Me a Coffee, PayPal.me, Stripe). Zonder waarde blijft de knop verborgen. |
| `DONATE_LABEL` | Nee | Tekst op de doneerknop. |
| `DONATE_NOTE` | Nee | Toelichting in het doneervenster. |
| `DONATE_IBAN` | Nee | IBAN voor donaties per bankoverschrijving, bijvoorbeeld `BE69 0638 3621 2278`. |
| `DONATE_NAME` | Nee | Naam van de rekeninghouder. |
| `DONATE_BANK` | Nee | Banknaam, bijvoorbeeld `Belfius`. |
| `SITE_URL` | Nee | Publieke URL voor `robots.txt` en `sitemap.xml`, standaard `https://yousefabujarad2014-beep.github.io/easycodey`. |
| `PORT` | Automatisch | Render zet deze zelf. |
| `HOST` | Nee | Standaard `0.0.0.0`; niet op `127.0.0.1` zetten. |

Zet sleutels **alleen** in het Render-dashboard, nooit in de repository. `.env` staat in `.gitignore`.

---

## 6. Na de deploy testen

- [ ] Startpagina laadt met 161 projecten en covers.
- [ ] Zoeken, categorie, niveau, duur, vaardigheden, verbergen en sorteren werken.
- [ ] Filters staan in de URL en blijven na verversen bewaard.
- [ ] Projectpagina toont stappen, code en tips.
- [ ] Stappen afvinken werkt en blijft bewaard na herladen.
- [ ] Project afronden geeft confetti en de afgeronde status.
- [ ] Voortgang resetten werkt.
- [ ] Leerpad toont alle niveaus.
- [ ] Mijn ideeën: genereren, openen, verwijderen, exporteren en importeren.
- [ ] AI-coach werkt met de offline coach.
- [ ] Met `OPENAI_API_KEY`: streaming antwoorden en foutfallback.
- [ ] Met `ACCESS_CODE`: zonder code geen AI-antwoord.
- [ ] Rate limiting geeft 429 na het maximum.
- [ ] Python-speelveld opent en `print("Hallo")` geeft uitvoer.
- [ ] **Programmeren** opent `#/programmeren` en `print("Hallo")` geeft uitvoer.
- [ ] Editor bewaart code na herladen en **Download .py** levert een bestand op.
- [ ] Projectpagina: **Programmeer dit idee**, **Download .py** en **Kopieer alle code** werken.
- [ ] Doneerknop verschijnt en toont het Belfius IBAN; **Kopieer IBAN** werkt.
- [ ] Mobiel en donker thema zien er goed uit.
- [ ] `/robots.txt` en `/sitemap.xml` tonen de juiste live-URL.
- [ ] `/server.js`, `/package.json`, alle `*.md` en `/.env` geven 404.
- [ ] Site is aangemeld bij Google Search Console (zie `GOOGLE.md`).

---

## 7. Beperkingen van de gratis Render-tier

- De service gaat na ongeveer 15 minuten zonder verkeer in slaapstand.
- De eerste aanvraag daarna kan 30–60 seconden duren.
- Beperkt aantal gratis uren per maand.
- Geen permanente schijf; gebruik geen server-side bestandsopslag voor gebruikersdata.
- Voortgang, eigen projecten en editor-code staan in `localStorage` van de browser en zijn per apparaat.
- De editor en het Python-speelveld laden Pyodide (±10 MB) de eerste keer vanaf een CDN.

---

## 8. Veiligheid en privacy

- Geen tokens, wachtwoorden of API-sleutels in de repository.
- `.env`, `node_modules/` en logbestanden zijn uitgesloten via `.gitignore`.
- De server blokkeert publieke toegang tot `server.js`, `package.json`, `render.yaml`, alle `*.md`, `.env*`, `scripts/` en `.git/`.
- Een GitHub-token of Render-API-sleutel wordt nooit in dit document of in de projectmap opgeslagen.
- Deel een eenmalige device-code niet en gebruik hem alleen op GitHub.

---

## 9. Problemen oplossen

### `gh auth login` geeft "error connecting to github.com"

- Controleer de internetverbinding.
- Probeer opnieuw; de device-flow kan tijdelijk vastlopen.
- Controleer of de eenmalige code nog geldig is (ongeveer 15 minuten).
- Test de verbinding:

```powershell
curl.exe -s -o NUL -w "%{http_code}`n" https://github.com
curl.exe -s -o NUL -w "%{http_code}`n" https://github.com/login/device
```

### Git vraagt om inloggegevens

```powershell
gh auth setup-git
```

### Render kan de repository niet vinden

- Controleer of de repository openbaar is, of geef Render toegang tot de privérepository.
- Controleer of de repositorynaam en gebruikersnaam kloppen.

### Site toont een lege pagina

- Open de site via de server (`npm start`), niet via `file://`.
- De site gebruikt ES-modules; die werken niet als `index.html` direct wordt geopend.

---

## 10. Handige commando's

```powershell
# Tools in deze sessie
$env:Path = "$env:LOCALAPPDATA\Programs\EasyCodeTools\gh\bin;$env:LOCALAPPDATA\Programs\EasyCodeTools\git\cmd;$env:Path"

# Projectcontrole
cd C:\Users\Home\Desktop\FLL
npm run check
npm start

# GitHub
gh auth status
gh repo view --web
git status
git log --oneline -3

# Nieuwe wijzigingen pushen
git add .
git commit -m "Beschrijving van de wijziging"
git push
```

---

## 11. Vindbaar maken op Google

Na de eerste succesvolle deploy:

1. Open **https://search.google.com/search-console**.
2. Voeg je live-URL toe als property.
3. Verifieer met de HTML-tag of het HTML-bestand.
4. Meld `sitemap.xml` aan.
5. Vraag indexering aan voor de startpagina.

De volledige uitleg, checklist en de beperking van hash-routes staan in **`GOOGLE.md`**.
