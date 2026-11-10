# EasyCodey in Google Play

Deze map beschrijft alles wat nodig is om EasyCodey als Android-app in Google Play te zetten.
De app is een **Trusted Web Activity (TWA)**: een dunne Android-schil die de bestaande PWA op
`https://yousefabujarad2014-beep.github.io/easycodey/` opent. Je onderhoudt de app dus gewoon
op één plek: de website. De Android-app volgt automatisch.

## Status

| Onderdeel | Status |
|---|---|
| TWA-project gegenereerd (Bubblewrap 1.27.0) | ✅ `C:\Users\Home\AppData\Local\Programs\EasyCodeTools\playstore\easycodey-twa` |
| Android SDK + JDK 17 + build-tools 36.1.0 | ✅ geïnstalleerd buiten de repo |
| Upload-keystore (PKCS12) | ✅ buiten de repo, zie hieronder |
| `assetlinks.json` met SHA-256 van de uploadsleutel | ✅ `/.well-known/assetlinks.json` |
| App-icoon 512×512 | ✅ `assets/icons/icon-512.png` |
| Feature graphic 1024×500 | ✅ `playstore-assets\feature-graphic-1024x500.png` |
| Telefoonscreenshots 1080×1920 (5 stuks) | ✅ `playstore-assets\screenshots\` |
| Store listing-tekst | ✅ hieronder |
| Privacybeleid-URL | ✅ `https://yousefabujarad2014-beep.github.io/easycodey/privacy/` |
| AAB bouwen | ⏳ `bubblewrap build` (zie hieronder) |
| Play Console-account + upload + review | ⛔ **vereist een Google Play Developer-account (eenmalig $25) en identiteitsverificatie** |

## App-gegevens

| Veld | Waarde |
|---|---|
| App-naam | EasyCodey |
| Package name (applicationId) | `be.easycodey.app` |
| Host | `yousefabujarad2014-beep.github.io` |
| Start-URL | `/easycodey/` |
| Weergave | `standalone` |
| Thema-kleur | `#f7f5ef` (donker: `#12110f`) |
| Versie | `1.0.0` (versionCode 1) |
| Categorie | Onderwijs |
| Prijs | Gratis |
| Bevat advertenties | Nee |
| In-app aankopen | Nee |

## Ondertekeningssleutel

De upload-keystore staat **buiten de repository**:

```
C:\Users\Home\AppData\Local\Programs\EasyCodeTools\playstore-private\easycodey-upload.jks
alias: easycodey
wachtwoord: zie playstore-private\keystore-info.txt
```

SHA-256 van de uploadsleutel:

```
C4:07:A1:09:32:B0:ED:6C:3C:37:A1:8D:EC:1B:E7:5D:99:D6:9F:4D:68:22:30:D4:8B:5C:D1:EA:BA:AB:E0:7A
```

Deze fingerprint staat in `/.well-known/assetlinks.json`. **Bewaar de keystore en het
wachtwoord veilig.** Zonder deze sleutel kun je later geen updates meer uploaden.

> **Play App Signing:** kiest Google Play bij het uploaden voor Play App Signing, dan ondertekent
> Google de app met een eigen sleutel. Voeg de SHA-256 die je in Play Console ziet
> (**Release → Setup → App signing**) als **tweede** fingerprint toe aan
> `/.well-known/assetlinks.json`. Anders blijft de adresbalk zichtbaar in de TWA.

## AAB bouwen

Vereist: JDK 17, Android SDK en de keystore hierboven. Alles staat al klaar.

```powershell
$base = "$env:LOCALAPPDATA\Programs\EasyCodeTools"
$info = Get-Content "$base\playstore-private\keystore-info.txt" -Raw
$pw = ([regex]::Match($info, 'Keystore-wachtwoord: (\S+)')).Groups[1].Value
$env:JAVA_HOME = "$base\jdk17\jdk-17.0.21+9"
$env:Path = "$env:JAVA_HOME\bin;$env:Path"
$env:ANDROID_HOME = "$base\android-sdk"
$env:BUBBLEWRAP_KEYSTORE_PASSWORD = $pw
$env:BUBBLEWRAP_KEY_PASSWORD = $pw
Set-Location "$base\playstore\easycodey-twa"
& "$base\playstore-build\node_modules\.bin\bubblewrap.cmd" build --skipPwaValidation
```

Resultaat:

```
app-release-bundle.aab   ← uploaden naar Play Console
app-release-signed.apk   ← lokaal testen op een toestel
```

Het TWA-project opnieuw genereren kan met
`playstore-build\init-twa.mjs` (past package, kleuren, iconen en keystore toe).

## Store listing

### Korte beschrijving (max. 80 tekens)

```
Leer Python met 161 projecten. Werkt offline, zonder account en zonder reclame.
```

### Volledige beschrijving (max. 4000 tekens)

```
EasyCodey leert je programmeren door echte projecten te bouwen. Je schrijft Python in je browser,
voert je code meteen uit en ziet het resultaat direct. Geen installatie van Python nodig.

WAT KUN JE MAKEN?
- 161 projecten, van beginner tot gevorderd
- Games, websites, rekenmachines, quizzen, simulaties, security-tools en meer
- Elk project heeft uitleg, een stappenplan, code per stap en tips
- Speel een project direct of open het in de programmeer-editor

VOOR WIE?
- Kinderen en jongeren die willen leren programmeren
- Leerkrachten die Python in de klas willen gebruiken
- Iedereen die snel iets wil bouwen zonder ingewikkelde setup

WAAROM EASYCODEY?
- Werkt op je telefoon, tablet en computer
- Werkt ook offline, na de eerste keer laden
- Optioneel account: alleen een naam en wachtwoord, geen e-mailadres nodig
- Je voortgang en projecten blijven op je eigen apparaat
- Geen advertenties, geen trackers, geen verkoop van gegevens
- Automatische updates: je krijgt altijd de nieuwste versie

PYTHON IN JE BROWSER
EasyCodey gebruikt Pyodide, een echte Python-runtime die in je browser draait. Je code wordt niet
naar een server gestuurd. Vraagt een project om invoer, dan verschijnt een venster met de vraag en
een tekstvak.

PRIVACY
Alles wat je maakt, staat lokaal op je apparaat. Er is geen database en geen account op een server.
Lees het volledige privacybeleid op:
https://yousefabujarad2014-beep.github.io/easycodey/privacy/

OVER EASYCODEY
EasyCodey is een project van Yousef Abujarad. Vragen of ideeën? Mail
yousefabujarad2014@gmail.com of stuur een WhatsApp naar +32 466 47 66 52.
```

### Contactgegevens voor de store listing

| Veld | Waarde |
|---|---|
| E-mailadres | `yousefabujarad2014@gmail.com` |
| Telefoon | `+32 466 47 66 52` |
| Website | `https://yousefabujarad2014-beep.github.io/easycodey/` |
| Privacybeleid | `https://yousefabujarad2014-beep.github.io/easycodey/privacy/` |

## Play Console-checklist

1. Maak een **Google Play Developer-account** en rond de identiteitsverificatie af.
2. Maak een nieuwe app: naam **EasyCodey**, standaardtaal **Nederlands**, type **App**, **Gratis**.
3. Vul **App-inhoud** in: geen advertenties, geen in-app aankopen, geschikt voor kinderen
   (leeftijd 6+ of 13+), geen verzameling van locatie of persoonsgegevens.
4. Upload de **AAB** (`app-release-bundle.aab`) bij **Productie → Nieuwe release**.
5. Kies **Play App Signing** en kopieer de SHA-256 naar `/.well-known/assetlinks.json`
   (tweede fingerprint), commit en push.
6. Vul de **store listing** in met de tekst hierboven en de bestanden uit `playstore-assets`:
   - App-icoon: `assets\icons\icon-512.png` (512×512)
   - Feature graphic: `feature-graphic-1024x500.png`
   - Screenshots: `screenshots\01-home.png` … `05-installeren.png` (1080×1920)
7. Zet de **privacybeleid-URL** hierboven.
8. Dien de app in ter review. Eerste review duurt meestal 1–7 dagen.

Na goedkeuring is EasyCodey te installeren via
`https://play.google.com/store/apps/details?id=be.easycodey.app`.

## Belangrijk om te weten

- De TWA opent de live site. Wijzigingen aan de website zijn direct zichtbaar in de app, zonder
  nieuwe Play-release.
- De app heeft internet nodig voor de eerste keer laden en voor nieuwe projecten. Daarna werkt de
  app offline via de service worker.
- De adresbalk verdwijnt pas als `assetlinks.json` klopt **en** de fingerprint van de gebruikte
  ondertekeningssleutel bevat.
- Verhoog bij een nieuwe upload `appVersionCode` in `twa-manifest.json` (en `appVersionName`).
