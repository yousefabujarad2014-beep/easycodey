# Wat moet ik nog doen?

Dit bestand is voor jou, de eigenaar. Alles wat de computer kon doen, is al
gedaan. Hieronder staan alleen de dingen die **jouw eigen account of toestel**
nodig hebben. Alles staat in gewone taal. Je hoeft niets te programmeren.

De site staat live op:

```
https://yousefabujarad2014-beep.github.io/easycodey/
```

---

## Deel 1 — Test de app zelf (5 minuten)

**Waarom:** je wilt zeker weten dat alles werkt zoals jij het ziet.

1. Open de link hierboven in **Chrome** of **Edge**.
2. Typ iets in de zoekbalk en druk op Enter. De projecten filteren meteen.
3. Ververs de pagina met **F5**. Kijk of je gebruikersnaam **niet** in de
   zoekbalk staat. Dat was de laatste klacht; het is nu opgelost.
4. Open een project en klik op **▶ Probeer de demo**.
5. Klik op **⌨ Programmeer zelf** en druk op **Ctrl + Enter**. De code moet
   draaien.
6. Open **Instellingen** en kies **Groot** of **Extra groot**. De tekst moet
   groter worden.
7. Zet je internet uit en weer aan. Je ziet een korte melding onderaan.

**Klaar als:** de app normaal werkt en je naam nergens in de zoekbalk staat.

---

## Deel 2 — Test de APK op een Android-telefoon (10 minuten)

**Waarom:** de APK is het installatiebestand voor Android. Op een computer heb
je hem niet nodig.

1. Open op je Android-telefoon:

   ```
   https://yousefabujarad2014-beep.github.io/easycodey/download/
   ```

2. Tik op **Download de APK**.
3. Android zegt misschien: *Installeren uit deze bron toestaan*. Tik op
   **Instellingen** en zet de schakelaar aan. Ga terug.
4. Tik op **Installeren**.
5. Open EasyCodey. De app moet in een eigen venster openen.
6. Als Android **Play Protect** waarschuwt: tik op **Meer details** en daarna
   op **Toch installeren**. De app is niet schadelijk; hij is alleen niet via
   Google Play verdeeld.

**Klaar als:** EasyCodey in je apps staat en opent zonder fouten.

> Lukt installeren niet? Gebruik dan gewoon de website en zet hem op je
> startscherm via **Installeren** in de app. Dat werkt altijd.

---

## Deel 3 — Gratis eigen teller (Cloudflare, ongeveer 5 minuten)

**Waarom:** de app telt nu bezoeken met een eenvoudige gratis dienst. Met een
eigen teller zijn de cijfers nauwkeuriger en blijven ze van jou.

**Wat je nodig hebt:** een gratis Cloudflare-account
(**https://dash.cloudflare.com/sign-up**).

1. Open op je computer een terminal in de **hoofdmap** van het project.
2. Typ dit en druk op Enter:

   ```powershell
   node worker/zet-eigen-teller-op.mjs
   ```

3. Er opent een browservenster. Klik op **Allow**.
4. Verder gaat het vanzelf. Het script maakt de database, vult het nummer in,
   maakt de tabellen, zet de teller live en schrijft het adres in
   `site-config.json`.
5. Vraag daarna je assistent om de website te publiceren.

**Klaar als:** je in het eigenaarspaneel cijfers ziet en het adres met
`/health` antwoordt.

> Lukt het script niet? In `worker/README.md` staan dezelfde stappen los achter
> elkaar. En lukt de eigen teller even niet? Dan valt de app automatisch terug
> op de eenvoudige teller. Bezoekers merken daar niets van.

---

## Deel 4 — Voortgang op meerdere toestellen (overweging)

**Waarom:** je voortgang staat nu bewust alleen op het toestel waar je leert.
Dat is de privacyvriendelijkste keuze: er staat niets op een server en er is
geen account in de cloud nodig.

**Wat er nu al kan, zonder server:**

1. Open **Mijn profiel** op het toestel waar je voortgang staat.
2. Kies **⤓ Back-up downloaden**. Je krijgt een bestandje.
3. Neem dat bestandje mee naar je andere toestel (bijvoorbeeld via e-mail aan
   jezelf of een usb-stick).
4. Kies daar **⤒ Back-up herstellen** en selecteer het bestandje.

Zo neem je je voortgang mee zonder dat EasyCodey iets verstuurt.

**Echte automatische sync (telefoon ↔ computer):** dat kan technisch wel, maar
dan moet er een beveiligde server en een database bij komen. Dat verandert het
uitgangspunt "alles blijft lokaal". Er komen dan ook accounts met een wachtwoord
op de server bij kijken, en jij wordt verantwoordelijk voor die gegevens.

> Wil je dat echt? Zeg het gerust. Dan teken ik eerst een kleine, privévriendelijke
> opzet (alleen voortgang, versleuteld, geen namen of e-mails) en leg ik de keuzes
> in gewone taal uit voordat er iets gebouwd wordt.

---

## Deel 5 — Google laten weten dat de site bestaat (5 minuten)

**Waarom:** anders duurt het langer voordat mensen EasyCodey via Google vinden.

1. Open **https://search.google.com/search-console**.
2. Log in met je Google-account.
3. Klik op **Property toevoegen** en kies **URL-prefix**.
4. Vul in:

   ```
   https://yousefabujarad2014-beep.github.io/easycodey/
   ```

5. Kies **HTML-tag**. Kopieer de tag die je ziet.
6. Open **index.html** en plak de tag in de `<head>`, vlak onder de andere
   `<meta>`-regels. Bewaar het bestand en laat het publiceren.
7. Ga terug naar Search Console en klik op **Verifiëren**.
8. Open **Sitemaps** en vul in:

   ```
   sitemap.xml
   ```

9. Klik op **Verzenden**.
10. Open **URL-inspectie**, plak de link van de startpagina en klik op
    **Indexering aanvragen**.

**Klaar als:** Search Console zegt dat je de eigenaar bent en de sitemap
ontvangt. Het kan **enkele dagen tot weken** duren voordat pagina's in Google
staan. Dat is normaal.

---

## Deel 6 — Google Play (optioneel, kost eenmalig 25 dollar)

**Waarom:** sommige mensen zoeken apps alleen in de Play Store.

**Let op:** dit kan alleen jij doen. Google vraagt een account, een eenmalige
betaling van **25 dollar** en een identiteitscontrole.

1. Maak een **Google Play Console**-account.
2. Betaal de eenmalige 25 dollar.
3. Doorloop de identiteitscontrole.
4. Volg daarna **PLAYSTORE.md** in deze map. Daar staan de pakketnaam,
   sleutels, schermafbeeldingen en de checklist.

> Je hoeft dit niet te doen. De gratis APK op `/download/` werkt nu al.

---

## Deel 7 — Eigen domein (optioneel)

**Waarom:** `easycodey.com` is makkelijker te onthouden dan de lange
GitHub-link.

1. Koop een domein, bijvoorbeeld bij een domeinwinkel.
2. Koppel het domein aan GitHub Pages via **Settings → Pages → Custom domain**.
3. Zet in GitHub **Enforce HTTPS** aan.
4. Pas de link aan in `scripts/build-pages.mjs` en `server.js`.
5. Draai `npm run build` en laat het publiceren.

> Dit is niet nodig om de app te gebruiken. De huidige link werkt goed.

---

## Deel 8 — Oude GitHub-kopieën (optioneel, alleen als je dat wilt)

**Waarom:** het oude wachtwoord is uit de **normale** geschiedenis verwijderd.
GitHub bewaart oude commits soms nog even bereikbaar via een directe link.
Dat is een beperking van GitHub, niet van de app. De site en je login werken
gewoon en het wachtwoord staat niet meer in de zichtbare bestanden.

**Wat je kunt doen:**

1. Open **https://support.github.com/contact**.
2. Kies **Repository** en daarna **Remove data**.
3. Vul de naam van je repo in: `yousefabujarad2014-beep/easycodey`.
4. Schrijf in gewone taal:

   > Please purge old commits that are no longer reachable from `main`.
   > A password was accidentally committed earlier and I rewrote the history.

5. Verstuur het bericht en wacht op antwoord van GitHub.

> Dit is **niet verplicht**. Je hoeft niets te doen als je dit te veel werk
> vindt. In de nieuwste code staat alleen de hash, en de site werkt gewoon.
> Alleen een oude, directe GitHub-link naar een verwijderde commit kan nog
> bestaan tot GitHub die opruimt.

---

## Wat al klaar is

- 161 projecten met uitleg, code en tips.
- Zoekbalk die je gebruikersnaam na verversen **niet** overneemt.
- Editor met regelnummers, kleuren en slimme inspringing.
- AI-coach die eerst begrijpt en dan pas antwoordt.
- Optionele accounts, eigenaarspaneel en privacybeleid.
- Offline modus, automatische updates en installeerbare app.
- Gratis APK op `/download/`.
- Sitemap met 168 URL's.
- Donatiepagina met het **juiste** IBAN: BE69 0638 3621 2278.

---

## Hulp nodig?

- E-mail: **yousefabujarad2014@gmail.com**
- Telefoon of WhatsApp: **+32 466 47 66 52**

Je hoeft geen technische woorden te gebruiken. Gewoon zeggen wat je ziet.
