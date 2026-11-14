# EasyCodey-teller (optioneel, gratis)

Deze map bevat een kleine teller die op **Cloudflare Workers** draait met een
gratis **D1**-database. De app werkt ook zonder deze teller: dan gebruikt hij
de eenvoudige Abacus-teller. Deze teller is alleen nauwkeuriger, omdat de
server zelf bijhoudt welk toestel al eerder meetelde.

## Wat er wordt bewaard

- Een getal per teller: `bezoeken-v1`, `unieke-bezoekers-v1`,
  `installaties-v1` en `apk-downloads-v1`.
- Voor de unieke tellers: een onleesbare **SHA-256-hash** van een willekeurig
  nummer dat alleen op dat toestel staat.

Er komen **geen** namen, e-mailadressen, IP-adressen, profielen of
projectgegevens in de database.

## Eenmalig instellen (ongeveer 5 minuten)

Je hebt een gratis Cloudflare-account nodig.

1. Open een terminal in deze map:

   ```powershell
   cd worker
   ```

2. Log in bij Cloudflare:

   ```powershell
   npx wrangler login
   ```

3. Maak de database:

   ```powershell
   npx wrangler d1 create easycodey-counter
   ```

4. Kopieer de `database_id` die je ziet naar `wrangler.toml` in plaats van
   `VUL_HIER_JE_DATABASE_ID_IN`.

5. Maak de tabellen:

   ```powershell
   npx wrangler d1 execute easycodey-counter --remote --file=schema.sql
   ```

6. Zet de teller live:

   ```powershell
   npx wrangler deploy
   ```

7. Je krijgt een adres zoals
   `https://easycodey-counter.jouw-naam.workers.dev`.
   Zet dat adres in `site-config.json`:

   ```json
   {
     "publicCounter": "easycodey-yousef",
     "counterApi": "https://easycodey-counter.jouw-naam.workers.dev"
   }
   ```

8. Test het:

   ```powershell
   curl https://easycodey-counter.jouw-naam.workers.dev/health
   curl "https://easycodey-counter.jouw-naam.workers.dev/counts?keys=bezoeken-v1"
   ```

## Zo werkt het

- `POST /hit` met `{ "key": "bezoeken-v1", "device": "willekeurig" }`
  hoogt de teller met één op.
- Bij `unieke-bezoekers-v1` en `installaties-v1` telt een toestel maar één
  keer mee. De server bewaart daarvoor alleen een hash.
- `GET /counts?keys=bezoeken-v1,unieke-bezoekers-v1` geeft de stand terug.
- `GET /health` laat zien dat de teller leeft.

Lukt de eigen teller even niet? Dan valt de app automatisch terug op Abacus.
Bezoekers merken daar niets van.

## Kosten

Cloudflare Workers en D1 hebben een ruime gratis laag. Voor een kleine site
zoals EasyCodey is dit normaal gesproken **gratis**.
