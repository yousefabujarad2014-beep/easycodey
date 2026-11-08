# EasyCodey vindbaar maken op Google

**Laatst bijgewerkt:** 8 november 2026
**Projectmap:** `C:\Users\Home\Desktop\FLL`

Dit document legt uit hoe je EasyCodey openbaar zet en ervoor zorgt dat Google de site vindt. Google is geen hostingprovider: je moet de site eerst online publiceren. Daarna kun je Google vragen om hem op te nemen.

---

## 1. Eerst publiceren

Google kan alleen een site indexeren die op een publiek adres bereikbaar is. EasyCodey staat al live op **GitHub Pages**:

```
https://yousefabujarad2014-beep.github.io/easycodey/
```

De repository staat op https://github.com/yousefabujarad2014-beep/easycodey en GitHub Pages bouwt automatisch vanaf branch `main`. Render is alleen nodig als je later de online AI-coach wilt aanzetten.

Controleer of dit adres in de configuratie klopt:

| Plek | Instelling |
|---|---|
| `index.html` | `canonical`, `og:url` en de JSON-LD-URL |
| `server.js` | `SITE_URL` (standaard `https://yousefabujarad2014-beep.github.io/easycodey`) |
| Render | omgevingsvariabele `SITE_URL` |

Als je een eigen domein gebruikt, pas je deze waarden aan naar bijvoorbeeld `https://easycodey.nl`.

---

## 2. Wat al klaar staat in de site

- `robots.txt` en `sitemap.xml` staan als statische bestanden in de repository, zodat GitHub Pages ze serveert. De Node-server genereert ze daarnaast dynamisch met `SITE_URL`.
- **Elk project heeft een eigen vaste pagina** op `/idee/<id>/` met een eigen titel, meta-description, canonical, Open Graph en JSON-LD. De sitemap bevat **163 URL's**: de startpagina, het overzicht en alle 161 projecten.
- `/projecten/` is een indexeerbaar overzicht van alle projecten, gegroepeerd per categorie en met een zoekveld.
- De startpagina heeft een titel, meta-description, canonical, Open Graph- en Twitter-kaarten.
- Er staat gestructureerde data (JSON-LD) van het type `WebSite` in de startpagina, `LearningResource` + `BreadcrumbList` op elke projectpagina en `CollectionPage` op het overzicht.
- De Node-server blokkeert documentatie, scripts en configuratiebestanden voor bezoekers. Op GitHub Pages zijn die bestanden wel bereikbaar; ze bevatten geen geheimen.
- De site is mobielvriendelijk en laadt zonder build-stap.

Controleren na de deploy:

```
https://yousefabujarad2014-beep.github.io/easycodey/robots.txt
https://yousefabujarad2014-beep.github.io/easycodey/sitemap.xml
https://yousefabujarad2014-beep.github.io/easycodey/projecten/
https://yousefabujarad2014-beep.github.io/easycodey/idee/raad-het-getal/
```

---

## 3. Google Search Console

1. Open **https://search.google.com/search-console**.
2. Log in met je Google-account.
3. Kies **Property toevoegen → URL-prefix** en vul je live-URL in.
4. Verifieer het eigendom. Kies een van deze manieren:
   - **HTML-tag:** kopieer de `<meta name="google-site-verification" ...>`-tag en zet die in de `<head>` van `index.html`. Commit en push opnieuw.
   - **HTML-bestand:** zet het gedownloade verificatiebestand in de projectmap en push het mee.
   - **DNS:** alleen bij een eigen domein.
5. Klik op **Verifiëren**.
6. Ga naar **Sitemaps** en meld `sitemap.xml` aan.
7. Gebruik **URL-inspectie** voor de startpagina en klik op **Indexering aanvragen**.

### Termijn

- Eerste indexering duurt meestal **enkele dagen tot enkele weken**.
- Nieuwe of gewijzigde pagina's worden soms pas na weken opnieuw bezocht.
- Een nieuwe site zonder externe links kan traag opduiken. Deel de link daarom op sociale media, forums of in een GitHub-repository.

---

## 4. Vaste projectpagina's en de app

EasyCodey heeft twee lagen:

1. **De interactieve app** gebruikt hash-routes, bijvoorbeeld `#/idee/raad-het-getal`. Daarin speel je code, vink je stappen af en programmeer je zelf.
2. **De vaste pagina's** hebben echte paden, bijvoorbeeld:

```
https://yousefabujarad2014-beep.github.io/easycodey/idee/raad-het-getal/
https://yousefabujarad2014-beep.github.io/easycodey/projecten/
```

Die vaste pagina's worden gegenereerd door `scripts/build-pages.mjs` en bevatten:

- een eigen `<title>` en meta-description;
- een canonical naar de productie-URL;
- alle stappen, codeblokken, leerdoelen en tips;
- JSON-LD van het type `LearningResource` en `BreadcrumbList`;
- knoppen die met `?play=1` teruglinken naar de app, zodat het project direct speelt.

Daardoor kan Google elk project apart indexeren. De hash-routes blijven bestaan voor de interactieve app; ze staan niet in de sitemap.

### Opnieuw genereren

Na elke wijziging in `data/`:

```bash
npm run build
```

Dit genereert de 161 pagina's, het overzicht en de sitemap (163 URL's) en controleert alles.

### Let op

- De canonical gebruikt de productie-URL `https://yousefabujarad2014-beep.github.io/easycodey`. Bij een eigen domein pas je `SITE` aan in `scripts/build-pages.mjs` en `SITE_URL` in `server.js`.
- De service worker-cache (`VERSION` in `sw.js`) moet omhoog bij grote wijzigingen, anders zien terugkerende bezoekers tijdelijk de oude versie.

---

## 5. Snelle checklist na de deploy

- [ ] Site is bereikbaar op de live-URL.
- [ ] `SITE_URL` klopt in Render en in `index.html`.
- [ ] `/robots.txt` toont de juiste sitemap-URL.
- [ ] `/sitemap.xml` is geldige XML en bevat **163 URL's**.
- [ ] `/projecten/` toont alle 161 projecten.
- [ ] Een projectpagina zoals `/idee/raad-het-getal/` heeft een eigen titel en description.
- [ ] Een projectpagina zonder slash (`/idee/raad-het-getal`) stuurt door naar de versie met slash.
- [ ] Search Console is geverifieerd.
- [ ] Sitemap is (opnieuw) aangemeld.
- [ ] Indexering is aangevraagd voor de startpagina en enkele projectpagina's.
- [ ] De site is gedeeld via minimaal één externe link.
- [ ] Na een week is in Search Console te zien dat pagina's zijn geïndexeerd.

---

## 6. Wat je niet moet doen

- Geen betaalde "SEO-diensten" inhuren die gegarandeerde posities beloven.
- Geen verborgen tekst of dubbele pagina's toevoegen.
- De site niet via `file://` testen; gebruik altijd de server.
- De `robots.txt` niet op `Disallow: /` zetten.
- Geen `noindex`-meta toevoegen aan `index.html`.

---

## 7. Donaties en Google

Donaties hebben geen invloed op je Google-positie. Ze staan los van indexering. Zie `README.md` en `PUBLICATIE.md` voor het instellen van `DONATE_URL`.
