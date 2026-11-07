# EasyCodey vindbaar maken op Google

**Laatst bijgewerkt:** 7 november 2026
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
- De startpagina heeft een titel, meta-description, canonical, Open Graph- en Twitter-kaarten.
- Er staat gestructureerde data (JSON-LD) van het type `WebSite` in de pagina.
- De Node-server blokkeert documentatie, scripts en configuratiebestanden voor bezoekers. Op GitHub Pages zijn die bestanden wel bereikbaar; ze bevatten geen geheimen.
- De site is mobielvriendelijk en laadt zonder build-stap.

Controleren na de deploy:

```
https://yousefabujarad2014-beep.github.io/easycodey/robots.txt
https://yousefabujarad2014-beep.github.io/easycodey/sitemap.xml
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

## 4. Belangrijke beperking: hash-routes

EasyCodey gebruikt op dit moment routes met een `#`, bijvoorbeeld:

```
https://yousefabujarad2014-beep.github.io/easycodey/#/idee/raad-het-getal
```

Alles na de `#` wordt niet naar de server gestuurd. Google indexeert daardoor in de praktijk alleen de startpagina, niet de 161 afzonderlijke projectpagina's.

Voor de meeste bezoekers is dat geen probleem: ze vinden de site via de startpagina en navigeren daarna verder.

Wil je dat ook individuele projecten in Google verschijnen? Dan is een latere upgrade nodig:

1. Routes zonder `#` gebruiken, bijvoorbeeld `/idee/raad-het-getal`.
2. De server levert voor die paden `index.html` (dat doet hij al).
3. Per project een eigen titel, description en canonical instellen.
4. Alle 161 project-URL's in `sitemap.xml` zetten.

Dat is een grotere wijziging aan de router. Vraag daar gerust naar als de site eenmaal live staat.

---

## 5. Snelle checklist na de deploy

- [ ] Site is bereikbaar op de live-URL.
- [ ] `SITE_URL` klopt in Render en in `index.html`.
- [ ] `/robots.txt` toont de juiste sitemap-URL.
- [ ] `/sitemap.xml` is geldige XML en bevat de live-URL.
- [ ] Search Console is geverifieerd.
- [ ] Sitemap is aangemeld.
- [ ] Indexering is aangevraagd.
- [ ] De site is gedeeld via minimaal één externe link.
- [ ] Na een week is in Search Console te zien dat de pagina is geïndexeerd.

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
