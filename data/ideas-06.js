// Deel 6: Automatisering, Handige tools en Data & AI.
import { idea, step } from "./helper.js";

export const IDEAS_PART_6 = [
  idea(
    "downloads-sorteren",
    "Downloads automatisch sorteren",
    "📥",
    "Automatisering",
    "Gemiddeld",
    "60 min",
    "Sorteer je downloadmap in nette submappen.",
    "Je leert bestanden verplaatsen op basis van hun extensie. Je bouwt eerst een dry-run, zodat je ziet wat er zou gebeuren voordat er iets verandert.",
    ["pathlib", "shutil", "extensies", "dry-run"],
    [
      step("Bepaal de doelmap", "Een dictionary koppelt extensies aan mapnamen.", `from pathlib import Path

DOELEN = {
    ".png": "Afbeeldingen",
    ".jpg": "Afbeeldingen",
    ".pdf": "Documenten",
    ".docx": "Documenten",
    ".zip": "Archieven",
    ".mp3": "Audio",
}`),
      step("Lees de bestanden", "Itereer over de map en sla alleen bestanden over.", `downloads = Path.home() / "Downloads"

for bestand in downloads.iterdir():
    if bestand.is_file():
        print(bestand.name, bestand.suffix.lower())`),
      step("Maak een dry-run", "Print wat je zou doen zonder iets te verplaatsen.", `def plan(bestand):
    mapnaam = DOELEN.get(bestand.suffix.lower(), "Overig")
    return downloads / mapnaam / bestand.name

for bestand in downloads.iterdir():
    if bestand.is_file():
        print(f"{bestand.name} -> {plan(bestand)}")`),
      step("Verplaats echt", "Maak de doelmap aan en verplaats het bestand.", `import shutil

def verplaats(bestand):
    doel = plan(bestand)
    doel.parent.mkdir(exist_ok=True)
    shutil.move(str(bestand), str(doel))

for bestand in downloads.iterdir():
    if bestand.is_file() and bestand.suffix.lower() in DOELEN:
        verplaats(bestand)`),
      step("Beveilig tegen dubbele namen", "Voeg een nummer toe als de naam al bestaat.", `def vrije_naam(doel):
    if not doel.exists():
        return doel
    for nummer in range(1, 1000):
        kandidaat = doel.with_name(f"{doel.stem}-{nummer}{doel.suffix}")
        if not kandidaat.exists():
            return kandidaat
    raise RuntimeError("Geen vrije naam gevonden")`),
    ],
    ["Test eerst op een tijdelijke map met nepbestanden.", "Sla bestanden die je niet herkent over in plaats van ze te verplaatsen."]
  ),
  idea(
    "bestanden-hernoemen",
    "Bestanden in bulk hernoemen",
    "🏷️",
    "Automatisering",
    "Beginner",
    "45 min",
    "Geef een hele map bestanden een nette naam.",
    "Je leert pathlib en tellers gebruiken. Je vervangt spaties, voegt een nummer toe en houdt de extensie intact.",
    ["pathlib", "strings", "rename", "tellers"],
    [
      step("Bekijk de bestanden", "Sorteer eerst, zodat de volgorde voorspelbaar is.", `from pathlib import Path

map = Path("fotos")
bestanden = sorted(p for p in map.iterdir() if p.is_file())

for bestand in bestanden:
    print(bestand.name)`),
      step("Maak een nieuwe naam", "Vervang spaties en voeg een volgnummer toe.", `def nieuwe_naam(bestand, nummer):
    schoon = bestand.stem.lower().replace(" ", "-")
    return f"{nummer:03d}-{schoon}{bestand.suffix.lower()}"`),
      step("Hernoem voorzichtig", "Controleer of de nieuwe naam al bestaat.", `for nummer, bestand in enumerate(bestanden, start=1):
    doel = bestand.with_name(nieuwe_naam(bestand, nummer))
    if doel.exists():
        print("Bestaat al:", doel.name)
        continue
    bestand.rename(doel)`),
      step("Maak een logbestand", "Bewaar wat je hebt gedaan, zodat je terug kunt kijken.", `with open("hernoemen.log", "a", encoding="utf-8") as log:
    for nummer, bestand in enumerate(bestanden, start=1):
        log.write(f"{bestand.name} -> {nieuwe_naam(bestand, nummer)}\\n")`),
      step("Test op een kopie", "Maak eerst een kopie van de map.", `# Kopieer de map in Verkenner of met shutil.copytree voordat je test.`),
    ],
    ["Hernoem nooit systeembestanden.", "Test altijd op een kopie van je map."]
  ),
  idea(
    "back-up-script",
    "Back-up-script",
    "💾",
    "Automatisering",
    "Gemiddeld",
    "75 min",
    "Maak automatisch een zip-back-up van een map.",
    "Je leert zipbestanden maken, datums in bestandsnamen gebruiken en oude back-ups opruimen. Je bouwt een script dat je echt kunt plannen.",
    ["zipfile", "datetime", "pathlib", "opschonen"],
    [
      step("Maak een zip", "ZipFile schrijft een archief met alle bestanden uit een map.", `from pathlib import Path
import zipfile

bron = Path("project")
doel = Path("back-ups") / "project.zip"
doel.parent.mkdir(exist_ok=True)

with zipfile.ZipFile(doel, "w", zipfile.ZIP_DEFLATED) as archief:
    for bestand in bron.rglob("*"):
        if bestand.is_file():
            archief.write(bestand, bestand.relative_to(bron))`),
      step("Voeg een datum toe", "Zo overschrijf je nooit per ongeluk een oude back-up.", `from datetime import datetime

stempel = datetime.now().strftime("%Y-%m-%d_%H-%M")
doel = Path("back-ups") / f"project-{stempel}.zip"`),
      step("Sla lege mappen over", "Een zip bevat alleen bestanden, dus controleer je invoer.", `if not any(bron.rglob("*")):
    print("De bronmap is leeg.")`),
      step("Ruim oude back-ups op", "Bewaar bijvoorbeeld de laatste tien archieven.", `backups = sorted(Path("back-ups").glob("project-*.zip"))
for oud in backups[:-10]:
    oud.unlink()`),
      step("Maak een restore-test", "Controleer of je een bestand uit de zip kunt lezen.", `with zipfile.ZipFile(doel) as archief:
    namen = archief.namelist()
    print(namen[:5])
    archief.extract(namen[0], "test-restore")`),
    ],
    ["Test het uitpakken voordat je op het script vertrouwt.", "Bewaar back-ups op een andere schijf of in de cloud."]
  ),
  idea(
    "dagelijkse-rapportage",
    "Dagelijkse rapportage",
    "📰",
    "Automatisering",
    "Gemiddeld",
    "70 min",
    "Maak elke dag automatisch een tekstbestand met je notities.",
    "Je leert datums, mappen en sjablonen combineren. Het script maakt een nieuw dagbestand aan als dat nog niet bestaat.",
    ["datetime", "pathlib", "sjablonen", "bestanden"],
    [
      step("Bepaal de datum", "Gebruik een ISO-datum in de bestandsnaam.", `from datetime import date

vandaag = date.today()
bestandsnaam = f"{vandaag.isoformat()}.md"
print(bestandsnaam)`),
      step("Maak een sjabloon", "Een vaste kop met datum en drie vragen.", `sjabloon = f"""# Dagboek {vandaag}

## Wat ging goed?

## Wat was lastig?

## Morgen wil ik...
"""`),
      step("Maak het bestand alleen als het nog niet bestaat", "Zo overschrijf je nooit je eigen notities.", `from pathlib import Path

map = Path("dagboek")
map.mkdir(exist_ok=True)
bestand = map / bestandsnaam

if not bestand.exists():
    bestand.write_text(sjabloon, encoding="utf-8")
    print("Nieuw dagbestand gemaakt.")
else:
    print("Je had al een bestand voor vandaag.")`),
      step("Toon een overzicht", "Tel hoeveel dagen je al hebt geschreven.", `bestanden = sorted(map.glob("*.md"))
print(f"Je hebt {len(bestanden)} dagen vastgelegd.")
print("Laatste:", bestanden[-1].name if bestanden else "nog geen")`),
      step("Maak een weekoverzicht", "Combineer de laatste zeven bestanden.", `from datetime import timedelta

week = []
for dagen_terug in range(7):
    dag = vandaag - timedelta(days=dagen_terug)
    pad = map / f"{dag.isoformat()}.md"
    if pad.exists():
        week.append(pad.read_text(encoding="utf-8"))

Path("weekoverzicht.md").write_text("\\n\\n---\\n\\n".join(week), encoding="utf-8")`),
    ],
    ["Gebruik utf-8 voor Nederlandse tekens.", "Maak eerst een testmap voordat je je echte dagboek gebruikt."]
  ),
  idea(
    "e-mail-herinnering",
    "E-mailherinnering",
    "📧",
    "Automatisering",
    "Gevorderd",
    "2 uur",
    "Verstuur een herinnering via e-mail zonder sleutels in je code.",
    "Je leert smtplib, e-mailopbouw en omgevingsvariabelen. Je slaat nooit een wachtwoord op in je script of repository.",
    ["smtplib", "email", "os.environ", "veiligheid"],
    [
      step("Lees instellingen uit de omgeving", "Gebruik os.environ, niet een hardcoded wachtwoord.", `import os

host = os.environ["SMTP_HOST"]
poort = int(os.environ.get("SMTP_PORT", "587"))
gebruiker = os.environ["SMTP_USER"]
wachtwoord = os.environ["SMTP_PASSWORD"]`),
      step("Bouw het bericht", "EmailMessage maakt een nette e-mail met onderwerp en tekst.", `from email.message import EmailMessage

bericht = EmailMessage()
bericht["Subject"] = "Herinnering: huiswerk inleveren"
bericht["From"] = gebruiker
bericht["To"] = "leerling@example.com"
bericht.set_content("Vergeet niet je opdracht voor vrijdag in te leveren.")`),
      step("Verstuur via SMTP", "Start TLS en log in met je app-wachtwoord.", `import smtplib

with smtplib.SMTP(host, poort) as server:
    server.starttls()
    server.login(gebruiker, wachtwoord)
    server.send_message(bericht)`),
      step("Test zonder echt te versturen", "Print het bericht eerst en controleer alle velden.", `print(bericht["Subject"])
print(bericht["To"])
print(bericht.get_content())`),
      step("Vang fouten op", "Een mislukte verbinding mag je programma niet laten crashen.", `try:
    with smtplib.SMTP(host, poort, timeout=15) as server:
        server.starttls()
        server.login(gebruiker, wachtwoord)
        server.send_message(bericht)
except Exception as fout:
    print("Versturen mislukt:", fout)`),
    ],
    ["Gebruik een app-wachtwoord, nooit je normale wachtwoord.", "Test met je eigen adres en kleine aantallen."]
  ),
  idea(
    "screenshot-automatisering",
    "Screenshot maken",
    "📸",
    "Automatisering",
    "Gemiddeld",
    "50 min",
    "Maak automatisch een screenshot van je scherm.",
    "Je leert pyautogui gebruiken en bestanden met een datum opslaan. Handig voor het maken van lesmateriaal of het loggen van een scherm.",
    ["pyautogui", "datetime", "bestanden", "automatisering"],
    [
      step("Installeer pyautogui", "De bibliotheek werkt op Windows, macOS en Linux met een scherm.", `# pip install pyautogui
import pyautogui`),
      step("Maak een screenshot", "pyautogui.screenshot geeft een afbeelding terug.", `foto = pyautogui.screenshot()
foto.save("scherm.png")`),
      step("Voeg een tijdstempel toe", "Zo krijgt elk screenshot een unieke naam.", `from datetime import datetime

naam = datetime.now().strftime("scherm-%Y-%m-%d_%H-%M-%S.png")
pyautogui.screenshot().save(naam)`),
      step("Maak een reeks", "Wacht tussen de opnames en maak een map aan.", `import time
from pathlib import Path

map = Path("screenshots")
map.mkdir(exist_ok=True)

for nummer in range(3):
    tijd = datetime.now().strftime("%H-%M-%S")
    pyautogui.screenshot().save(map / f"scherm-{tijd}.png")
    time.sleep(5)`),
      step("Beperk de regio", "Je kunt alleen een deel van het scherm vastleggen.", `foto = pyautogui.screenshot(region=(0, 0, 800, 600))
foto.save("links-boven.png")`),
    ],
    ["Maak geen screenshots met privégegevens.", "Test eerst met één opname voordat je een reeks start."]
  ),
  idea(
    "agenda-ics",
    "Agenda-bestand maken",
    "📅",
    "Automatisering",
    "Gemiddeld",
    "60 min",
    "Genereer een ICS-bestand dat je in je agenda importeert.",
    "Je leert het iCalendar-formaat kennen en schrijft afspraken als tekst. Je kunt het bestand openen in Google Calendar of Outlook.",
    ["ics", "datetime", "bestanden", "formatteren"],
    [
      step("Bouw een afspraak", "Een ICS-bestand heeft BEGIN en END en regels met eigenschappen.", `from datetime import datetime, timedelta

start = datetime(2026, 11, 10, 16, 0)
eind = start + timedelta(hours=1)

regels = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "BEGIN:VEVENT",
    f"DTSTART:{start:%Y%m%dT%H%M%S}",
    f"DTEND:{eind:%Y%m%dT%H%M%S}",
    "SUMMARY:Rekenen oefenen",
    "END:VEVENT",
    "END:VCALENDAR",
]`),
      step("Schrijf het bestand", "Gebruik regeleinden met \\r\\n zoals de standaard voorschrijft.", `with open("afspraak.ics", "w", encoding="utf-8", newline="") as bestand:
    bestand.write("\\r\\n".join(regels) + "\\r\\n")`),
      step("Voeg meerdere afspraken toe", "Herhaal het VEVENT-blok voor elke afspraak.", `afspraken = [
    ("Wiskunde", datetime(2026, 11, 10, 16, 0)),
    ("Engels", datetime(2026, 11, 11, 15, 30)),
]

for titel, start in afspraken:
    eind = start + timedelta(hours=1)
    regels.extend([
        "BEGIN:VEVENT",
        f"DTSTART:{start:%Y%m%dT%H%M%S}",
        f"DTEND:{eind:%Y%m%dT%H%M%S}",
        f"SUMMARY:{titel}",
        "END:VEVENT",
    ])`),
      step("Importeer en test", "Open het bestand in je agenda-app en controleer tijd en titel.", `print("Klaar: afspraak.ics")`),
      step("Voeg een beschrijving toe", "Met DESCRIPTION en LOCATION krijgt de afspraak meer context.", `regels.insert(-1, "DESCRIPTION:Neem je schrift mee")
regels.insert(-1, "LOCATION:Thuis")`),
    ],
    ["Controleer de tijdzone als je met andere landen werkt.", "Test met één afspraak voordat je een hele agenda genereert."]
  ),
  idea(
    "website-monitor",
    "Website-monitor",
    "📡",
    "Automatisering",
    "Gevorderd",
    "2 uur",
    "Meld wanneer de inhoud van een webpagina verandert.",
    "Je leert een hash van de pagina-inhoud vergelijken en een logbestand bijhouden. Je bouwt een eenvoudige monitor met een interval.",
    ["requests", "hashlib", "tijd", "loggen"],
    [
      step("Haal de pagina op", "Gebruik een user-agent en een time-out.", `import requests

HEADERS = {"User-Agent": "EasyCodeyMonitor/1.0"}

def haal(url):
    response = requests.get(url, headers=HEADERS, timeout=15)
    response.raise_for_status()
    return response.text`),
      step("Maak een vingerafdruk", "Een hash maakt vergelijken makkelijk en compact.", `import hashlib

def vingerafdruk(tekst):
    return hashlib.sha256(tekst.encode("utf-8")).hexdigest()`),
      step("Vergelijk met de vorige meting", "Bewaar de laatste hash in een bestand.", `from pathlib import Path

def vorige_hash(pad):
    bestand = Path(pad)
    return bestand.read_text().strip() if bestand.exists() else ""

def bewaar_hash(pad, waarde):
    Path(pad).write_text(waarde, encoding="utf-8")`),
      step("Maak een melding", "Print een duidelijke regel met tijdstip.", `from datetime import datetime

def controleer(url, hashbestand):
    nieuw = vingerafdruk(haal(url))
    oud = vorige_hash(hashbestand)
    if nieuw != oud:
        print(f"{datetime.now():%H:%M} De pagina is veranderd!")
        bewaar_hash(hashbestand, nieuw)
    else:
        print(f"{datetime.now():%H:%M} Geen verandering.")`),
      step("Herhaal met een interval", "Gebruik time.sleep tussen controles.", `import time

while True:
    try:
        controleer("https://example.com", "laatste-hash.txt")
    except Exception as fout:
        print("Fout:", fout)
    time.sleep(300)`),
    ],
    ["Respecteer de regels van een website en vraag geen pagina's op die je niet mag bezoeken.", "Test met een pagina die je zelf beheert."]
  ),
  idea(
    "factuur-nummering",
    "Factuurnummers maken",
    "🧾",
    "Automatisering",
    "Beginner",
    "40 min",
    "Genereer oplopende factuurnummers zonder dubbele nummers.",
    "Je leert een teller in een bestand bewaren en nette nummers formatteren. Dit is een kleine maar nuttige administratietool.",
    ["bestanden", "tellers", "formatteren", "administratie"],
    [
      step("Lees het laatste nummer", "Begin bij 1 als het bestand nog niet bestaat.", `from pathlib import Path

TELLER = Path("factuur-teller.txt")

def laatste_nummer():
    if not TELLER.exists():
        return 0
    return int(TELLER.read_text().strip() or "0")`),
      step("Maak een nieuw nummer", "Verhoog de teller en schrijf hem direct terug.", `def nieuw_nummer():
    nummer = laatste_nummer() + 1
    TELLER.write_text(str(nummer), encoding="utf-8")
    return f"F{nummer:05d}"`),
      step("Toon het resultaat", "Test of de nummers netjes oplopen.", `print(nieuw_nummer())
print(nieuw_nummer())
print(nieuw_nummer())`),
      step("Voeg een jaartal toe", "Veel administraties gebruiken een jaartal in het nummer.", `from datetime import date

def nieuw_jaarnummer():
    nummer = laatste_nummer() + 1
    TELLER.write_text(str(nummer), encoding="utf-8")
    return f"{date.today().year}-{nummer:04d}"`),
      step("Maak een back-up", "Kopieer de teller voordat je hem voor echt gebruikt.", `# Kopieer factuur-teller.txt naar een veilige plek.`),
    ],
    ["Gebruik dit niet als officiële boekhouding zonder controle.", "Maak een back-up van je tellerbestand."]
  ),
  idea(
    "map-opruimer",
    "Dubbele bestanden vinden",
    "🧹",
    "Automatisering",
    "Gevorderd",
    "2 uur",
    "Vind dubbele bestanden met hashes en verwijder ze veilig.",
    "Je leert bestanden groeperen op grootte en hash. Je bouwt een dry-run en verwijdert pas na bevestiging, zodat je nooit per ongeluk data verliest.",
    ["hashlib", "pathlib", "dict", "dry-run"],
    [
      step("Groepeer op grootte", "Bestanden met een andere grootte kunnen nooit identiek zijn.", `from pathlib import Path
from collections import defaultdict

map = Path("documenten")
op_grootte = defaultdict(list)

for bestand in map.rglob("*"):
    if bestand.is_file():
        op_grootte[bestand.stat().st_size].append(bestand)`),
      step("Hash alleen kansrijke groepen", "Dit bespaart tijd bij grote mappen.", `import hashlib

def bestand_hash(pad):
    hasher = hashlib.sha256()
    with pad.open("rb") as bestand:
        for blok in iter(lambda: bestand.read(65536), b""):
            hasher.update(blok)
    return hasher.hexdigest()

op_hash = defaultdict(list)
for bestanden in op_grootte.values():
    if len(bestanden) > 1:
        for bestand in bestanden:
            op_hash[bestand_hash(bestand)].append(bestand)`),
      step("Toon de dubbelen", "Print elke groep met dezelfde inhoud.", `dubbel = {h: paden for h, paden in op_hash.items() if len(paden) > 1}
for paden in dubbel.values():
    print("Dubbel:")
    for pad in paden:
        print("  ", pad)`),
      step("Verwijder alleen na bevestiging", "Houd altijd één bestand per groep.", `for paden in dubbel.values():
    for pad in paden[1:]:
        antwoord = input(f"Verwijder {pad}? (j/n) ")
        if antwoord.lower() == "j":
            pad.unlink()`),
      step("Maak een log", "Bewaar wat je hebt verwijderd.", `with open("opruimen.log", "a", encoding="utf-8") as log:
    log.write(f"Verwijderd: {pad}\\n")`),
    ],
    ["Test op een kopie van je map.", "Verwijder nooit automatisch zonder bevestiging."]
  ),

  idea(
    "qr-generator",
    "QR-code maken",
    "🔳",
    "Handige tools",
    "Beginner",
    "30 min",
    "Zet een link of tekst om in een QR-code.",
    "Je leert een kleine bibliotheek gebruiken en een afbeelding opslaan. QR-codes zijn handig voor posters, werkstukken en uitnodigingen.",
    ["qrcode", "afbeeldingen", "tekst", "delen"],
    [
      step("Installeer qrcode", "De bibliotheek genereert de code; Pillow slaat hem op.", `# pip install qrcode[pil]
import qrcode`),
      step("Maak een QR-code", "De tekst mag een URL of een korte boodschap zijn.", `tekst = "https://example.com"
code = qrcode.make(tekst)
code.save("qr.png")`),
      step("Pas de kleuren aan", "Met een QRCode-object stel je kleuren en foutcorrectie in.", `qr = qrcode.QRCode(
    version=1,
    box_size=10,
    border=3,
    error_correction=qrcode.constants.ERROR_CORRECT_M,
)
qr.add_data("Hallo EasyCodey")
qr.make(fit=True)

afbeelding = qr.make_image(fill_color="#15150f", back_color="#fffefb")
afbeelding.save("qr-hallo.png")`),
      step("Test de code", "Scan hem met je telefoon voordat je hem op een poster zet.", `print("Open qr-hallo.png en scan met je telefoon.")`),
      step("Maak een set", "Genereer meerdere codes uit een lijst.", `links = {
    "website": "https://example.com",
    "uitleg": "https://example.com/uitleg",
}

for naam, url in links.items():
    qrcode.make(url).save(f"qr-{naam}.png")`),
    ],
    ["Test de QR-code op papier en op een scherm.", "Gebruik voldoende rand zodat scanners de code herkennen."]
  ),
  idea(
    "eenheid-converter",
    "Eenheden omrekenen",
    "📏",
    "Handige tools",
    "Beginner",
    "40 min",
    "Reken kilometers, kilo's en liters om.",
    "Je leert een dictionary met factoren gebruiken en invoer valideren. Je bouwt een converter die met één regel code nieuwe eenheden kan krijgen.",
    ["dict", "floats", "validatie", "wiskunde"],
    [
      step("Bepaal de factoren", "Alles wordt eerst omgerekend naar de basiseenheid.", `FACTOREN = {
    "km": 1000,
    "m": 1,
    "cm": 0.01,
    "mm": 0.001,
}`),
      step("Reken om", "Van bron naar basis en daarna naar doel.", `def omrekenen(waarde, van, naar):
    if van not in FACTOREN or naar not in FACTOREN:
        raise ValueError("Onbekende eenheid")
    return waarde * FACTOREN[van] / FACTOREN[naar]

print(omrekenen(2.5, "km", "m"))`),
      step("Vraag de gebruiker om invoer", "Vang fouten op en toon een duidelijke melding.", `try:
    waarde = float(input("Waarde: ").replace(",", "."))
    van = input("Van (km/m/cm/mm): ").strip()
    naar = input("Naar (km/m/cm/mm): ").strip()
    print(f"{waarde} {van} = {omrekenen(waarde, van, naar)} {naar}")
except ValueError as fout:
    print("Fout:", fout)`),
      step("Voeg gewicht toe", "Gebruik een tweede dictionary of een voorvoegsel.", `GEWICHT = {"kg": 1000, "g": 1, "mg": 0.001}

def gewicht_omrekenen(waarde, van, naar):
    return waarde * GEWICHT[van] / GEWICHT[naar]`),
      step("Maak een tabel", "Toon meerdere conversies in één keer.", `for eenheid in ("m", "cm", "mm"):
    print(f"1 km = {omrekenen(1, 'km', eenheid):.0f} {eenheid}")`),
    ],
    ["Gebruik punt als decimaalteken in je berekening.", "Test met nul en met negatieve waarden."]
  ),
  idea(
    "tekst-teller",
    "Tekst-teller",
    "🔢",
    "Handige tools",
    "Beginner",
    "30 min",
    "Tel woorden, tekens en zinnen in een tekst.",
    "Je leert strings splitsen en tellen. Je maakt een tool die je kunt gebruiken voor schoolopdrachten met een maximaal aantal woorden.",
    ["strings", "split", "tellen", "analyse"],
    [
      step("Lees de tekst", "Vraag om een tekst of lees een bestand.", `tekst = input("Plak je tekst: ")`),
      step("Tel woorden en tekens", "Split op witruimte en gebruik len().", `woorden = tekst.split()
print("Woorden:", len(woorden))
print("Tekens:", len(tekst))
print("Zonder spaties:", len(tekst.replace(" ", "")))`),
      step("Tel zinnen", "Splits op leestekens en filter lege stukken.", `import re

zinnen = [zin for zin in re.split(r"[.!?]+", tekst) if zin.strip()]
print("Zinnen:", len(zinnen))`),
      step("Tel het vaakst voorkomende woord", "Een dictionary met tellers maakt dit eenvoudig.", `from collections import Counter

schoon = re.findall(r"\\b\\w+\\b", tekst.lower())
teller = Counter(schoon)
print(teller.most_common(5))`),
      step("Waarschuw bij een limiet", "Bij een opdracht met maximaal 500 woorden is dat direct bruikbaar.", `LIMIET = 500
if len(woorden) > LIMIET:
    print(f"Je zit {len(woorden) - LIMIET} woorden over het limiet.")
else:
    print(f"Nog {LIMIET - len(woorden)} woorden te gaan.")`),
    ],
    ["Test met lege tekst en met alleen spaties.", "Tel emoji's niet als woorden als dat niet de bedoeling is."]
  ),
  idea(
    "pdf-samenvoegen",
    "PDF's samenvoegen",
    "📚",
    "Handige tools",
    "Gemiddeld",
    "50 min",
    "Voeg meerdere PDF-bestanden tot één document samen.",
    "Je leert pypdf gebruiken en bestanden in een vaste volgorde verwerken. Handig voor werkstukken, formulieren en lesmateriaal.",
    ["pypdf", "pdf", "bestanden", "sorteren"],
    [
      step("Installeer pypdf", "De bibliotheek leest en schrijft PDF-pagina's.", `# pip install pypdf
from pypdf import PdfWriter`),
      step("Maak een writer", "Voeg pagina's uit elk bestand toe.", `from pathlib import Path

bestanden = sorted(Path("pdfs").glob("*.pdf"))
writer = PdfWriter()

for bestand in bestanden:
    writer.append(str(bestand))`),
      step("Schrijf het resultaat", "Sla het samengevoegde document op.", `with open("samengevoegd.pdf", "wb") as uitvoer:
    writer.write(uitvoer)

writer.close()`),
      step("Selecteer pagina's", "Je kunt ook maar een deel van een PDF toevoegen.", `for pagina in range(0, 2):
    writer.add_page(PdfReader(str(bestanden[0])).pages[pagina])`),
      step("Controleer het aantal pagina's", "Lees het resultaat terug en tel de pagina's.", `from pypdf import PdfReader

reader = PdfReader("samengevoegd.pdf")
print("Pagina's:", len(reader.pages))`),
    ],
    ["Maak een back-up van de originelen.", "Test met twee kleine PDF's voordat je grote bestanden verwerkt."]
  ),
  idea(
    "excel-rapport",
    "Excel-rapport maken",
    "📊",
    "Handige tools",
    "Gemiddeld",
    "75 min",
    "Schrijf data naar een Excel-bestand met opmaak.",
    "Je leert openpyxl gebruiken: werkbladen maken, cellen vullen en koppen opmaken. Je bouwt een rapport dat je direct kunt delen.",
    ["openpyxl", "excel", "opmaak", "rapport"],
    [
      step("Maak een werkboek", "Een nieuw werkboek heeft standaard één werkblad.", `# pip install openpyxl
from openpyxl import Workbook

werkboek = Workbook()
blad = werkboek.active
blad.title = "Rapport"`),
      step("Vul de koppen", "Maak de eerste rij vet en breed.", `koppen = ["Naam", "Cijfer", "Vak"]
for kolom, kop in enumerate(koppen, start=1):
    cel = blad.cell(row=1, column=kolom, value=kop)
    cel.font = cel.font.copy(bold=True)`),
      step("Voeg rijen toe", "Schrijf de data regel voor regel.", `data = [
    ("Sam", 7.5, "Wiskunde"),
    ("Noa", 8.2, "Engels"),
    ("Mila", 6.9, "Biologie"),
]

for rij, waarden in enumerate(data, start=2):
    for kolom, waarde in enumerate(waarden, start=1):
        blad.cell(row=rij, column=kolom, value=waarde)`),
      step("Maak kolommen leesbaar", "Stel de breedte in op basis van de inhoud.", `for kolom in "ABC":
    blad.column_dimensions[kolom].width = 18`),
      step("Sla het bestand op", "Open het daarna in Excel of LibreOffice.", `werkboek.save("rapport.xlsx")
print("Klaar: rapport.xlsx")`),
    ],
    ["Gebruik geen formules als je alleen waarden nodig hebt.", "Test het bestand in de app waarin je het gaat gebruiken."]
  ),
  idea(
    "klembord-tool",
    "Klembord-tool",
    "📋",
    "Handige tools",
    "Beginner",
    "40 min",
    "Bewaar meerdere stukjes tekst en plak ze terug.",
    "Je leert de klembordfuncties van tkinter gebruiken. Je bouwt een klein hulpmiddel voor veelgebruikte teksten.",
    ["tkinter", "klembord", "knoppen", "tekst"],
    [
      step("Lees het klembord", "tkinter kan tekst van het systeemklembord lezen.", `import tkinter as tk

venster = tk.Tk()
venster.withdraw()

def lees_klembord():
    try:
        return venster.clipboard_get()
    except tk.TclError:
        return ""

print(lees_klembord())`),
      step("Schrijf naar het klembord", "Met clipboard_clear en clipboard_append zet je nieuwe tekst.", `def schrijf_klembord(tekst):
    venster.clipboard_clear()
    venster.clipboard_append(tekst)
    venster.update()`),
      step("Maak een opslag", "Bewaar favorieten in een lijst en toon ze als knoppen.", `favorieten = ["Bedankt!", "Ik kom eraan.", "Tot morgen."]

for tekst in favorieten:
    tk.Button(venster, text=tekst, command=lambda t=tekst: schrijf_klembord(t)).pack()`),
      step("Bewaar favorieten", "Sla ze op in een JSON-bestand.", `import json
from pathlib import Path

Path("klembord.json").write_text(
    json.dumps(favorieten, ensure_ascii=False, indent=2),
    encoding="utf-8",
)`),
      step("Toon het venster", "Bij een klembordtool is een klein venster genoeg.", `venster.deiconify()
venster.mainloop()`),
    ],
    ["Test met tekst die emoji's bevat.", "Gebruik geen klembordtool voor wachtwoorden."]
  ),
  idea(
    "bestandszoeker",
    "Bestandszoeker",
    "🔎",
    "Handige tools",
    "Gemiddeld",
    "60 min",
    "Zoek bestanden op naam of extensie in een map.",
    "Je leert rglob en filtering combineren. Je bouwt een zoektool die snel een overzicht geeft zonder Verkenner.",
    ["pathlib", "rglob", "filteren", "bestanden"],
    [
      step("Zoek op naam", "rglob zoekt in alle submappen.", `from pathlib import Path

map = Path.home() / "Documenten"
zoekterm = "verslag"

for bestand in map.rglob("*"):
    if bestand.is_file() and zoekterm.lower() in bestand.name.lower():
        print(bestand)`),
      step("Zoek op extensie", "Filter op suffix en negeer hoofdletters.", `for bestand in map.rglob("*.pdf"):
    print(bestand)`),
      step("Beperk de resultaten", "Gebruik een teller en stop na 20 resultaten.", `resultaten = []
for bestand in map.rglob("*"):
    if bestand.is_file() and zoekterm.lower() in bestand.name.lower():
        resultaten.append(bestand)
        if len(resultaten) >= 20:
            break

for bestand in resultaten:
    print(bestand, bestand.stat().st_size, "bytes")`),
      step("Toon de nieuwste bestanden", "Sorteer op wijzigingsdatum.", `nieuwste = sorted(resultaten, key=lambda p: p.stat().st_mtime, reverse=True)
for bestand in nieuwste[:5]:
    print(bestand.name)`),
      step("Maak een invoerveld", "Met tkinter kun je de zoekterm en map kiezen.", `from tkinter import Tk, Entry, Button, Listbox

venster = Tk()
invoer = Entry(venster)
invoer.pack()
Button(venster, text="Zoek").pack()
lijst = Listbox(venster, width=80)
lijst.pack()
venster.mainloop()`),
    ],
    ["Zoek niet in systeemmappen als je niet weet wat je doet.", "Toon paden volledig, zodat je weet waar een bestand staat."]
  ),
  idea(
    "wachtwoord-generator-plus",
    "Sterke wachtwoorden maken",
    "🔑",
    "Handige tools",
    "Beginner",
    "35 min",
    "Genereer veilige wachtwoorden met de secrets-module.",
    "Je leert waarom random niet veilig is voor wachtwoorden en gebruikt secrets. Je maakt wachtwoorden met letters, cijfers en symbolen.",
    ["secrets", "strings", "wachtwoorden", "veiligheid"],
    [
      step("Kies de tekens", "Gebruik een brede set tekens.", `import string

letters = string.ascii_letters
cijfers = string.digits
symbolen = "!@#$%^&*()-_=+"
alles = letters + cijfers + symbolen`),
      step("Genereer een wachtwoord", "secrets.choice is gemaakt voor beveiliging.", `import secrets

def maak_wachtwoord(lengte=16):
    return "".join(secrets.choice(alles) for _ in range(lengte))

print(maak_wachtwoord())`),
      step("Garandeer variatie", "Zorg dat elk type teken minstens één keer voorkomt.", `def sterk_wachtwoord(lengte=16):
    if lengte < 8:
        raise ValueError("Gebruik minimaal 8 tekens")
    wachtwoord = [
        secrets.choice(letters),
        secrets.choice(cijfers),
        secrets.choice(symbolen),
    ]
    wachtwoord += [secrets.choice(alles) for _ in range(lengte - 3)]
    secrets.SystemRandom().shuffle(wachtwoord)
    return "".join(wachtwoord)`),
      step("Toon de sterkte", "Geef een ruwe indicatie op basis van lengte en variatie.", `def sterkte(wachtwoord):
    score = len(wachtwoord)
    score += any(c.isupper() for c in wachtwoord)
    score += any(c.isdigit() for c in wachtwoord)
    score += any(c in symbolen for c in wachtwoord)
    return "sterk" if score >= 20 else "redelijk"`),
      step("Maak meerdere wachtwoorden", "Genereer een lijst voor meerdere accounts.", `for _ in range(5):
    wachtwoord = sterk_wachtwoord(20)
    print(wachtwoord, sterkte(wachtwoord))`),
    ],
    ["Gebruik nooit random.choice voor wachtwoorden.", "Bewaar gegenereerde wachtwoorden in een wachtwoordmanager."]
  ),
  idea(
    "json-formatter",
    "JSON netjes formatteren",
    "🧩",
    "Handige tools",
    "Beginner",
    "40 min",
    "Maak rommelige JSON leesbaar en controleer fouten.",
    "Je leert json.loads en json.dumps gebruiken. Je bouwt een tool die fouten aanwijst en de tekst netjes inspringt.",
    ["json", "fouten", "formatteren", "bestanden"],
    [
      step("Lees JSON", "json.loads zet tekst om naar Python-dictionaries en lijsten.", `import json

tekst = '{"naam":"Sam","vakken":["wiskunde","engels"]}'
data = json.loads(tekst)
print(data["naam"])`),
      step("Formatteer netjes", "Met indent en ensure_ascii krijg je leesbare Nederlandse tekst.", `mooi = json.dumps(data, indent=2, ensure_ascii=False)
print(mooi)`),
      step("Vang fouten op", "JSONDecodeError vertelt waar het misgaat.", `def formatteer(tekst):
    try:
        data = json.loads(tekst)
    except json.JSONDecodeError as fout:
        return f"Fout op regel {fout.lineno}, kolom {fout.colno}: {fout.msg}"
    return json.dumps(data, indent=2, ensure_ascii=False)`),
      step("Lees een bestand", "Gebruik utf-8 en schrijf het resultaat naar een nieuw bestand.", `from pathlib import Path

ruw = Path("data.json").read_text(encoding="utf-8")
Path("data-mooi.json").write_text(formatteer(ruw), encoding="utf-8")`),
      step("Test met een fout", "Verwijder een komma of haakje en kijk naar de melding.", `print(formatteer('{"naam": "Sam",}'))`),
    ],
    ["Gebruik geen eval voor JSON.", "Bewaar het originele bestand voordat je het overschrijft."]
  ),
  idea(
    "image-resizer",
    "Afbeeldingen verkleinen",
    "🗂️",
    "Handige tools",
    "Gemiddeld",
    "60 min",
    "Verklein een hele map foto's in één keer.",
    "Je leert Pillow gebruiken voor batchverwerking. Je maakt een kopieermap en houdt de originele bestanden veilig.",
    ["pillow", "batch", "afbeeldingen", "mappen"],
    [
      step("Kies een map", "Lees alleen afbeeldingen en maak een uitvoermap.", `from pathlib import Path
from PIL import Image

bron = Path("fotos")
doel = Path("verkleind")
doel.mkdir(exist_ok=True)

EXTENSIES = {".jpg", ".jpeg", ".png", ".webp"}`),
      step("Verklein één afbeelding", "thumbnail houdt de verhouding intact.", `foto = Image.open("fotos/voorbeeld.jpg")
foto.thumbnail((1200, 1200))
foto.save("verkleind/voorbeeld.jpg", quality=85)`),
      step("Verwerk de hele map", "Sla fouten per bestand over.", `for pad in bron.iterdir():
    if pad.suffix.lower() not in EXTENSIES:
        continue
    try:
        foto = Image.open(pad)
        foto.thumbnail((1200, 1200))
        foto.convert("RGB").save(doel / pad.name, quality=85)
        print("Klaar:", pad.name)
    except Exception as fout:
        print("Overgeslagen:", pad.name, fout)`),
      step("Behoud de bestandsnaam", "Gebruik dezelfde naam in de uitvoermap.", `doel_pad = doel / pad.name`),
      step("Toon de besparing", "Vergelijk de bestandsgroottes.", `oud = pad.stat().st_size
nieuw = (doel / pad.name).stat().st_size
print(f"{pad.name}: {oud // 1024} KB -> {nieuw // 1024} KB")`),
    ],
    ["Maak altijd een kopie; verkleinen is niet omkeerbaar.", "Test met één foto voordat je honderden bestanden verwerkt."]
  ),

  idea(
    "csv-analyse",
    "CSV-analyse",
    "📈",
    "Data & AI",
    "Beginner",
    "50 min",
    "Lees een CSV en bereken gemiddelden per groep.",
    "Je leert het csv-module gebruiken en data groeperen. Je bouwt een klein analyserapport zonder pandas.",
    ["csv", "dict", "gemiddelde", "groeperen"],
    [
      step("Lees de CSV", "DictReader maakt van elke rij een dictionary.", `import csv

with open("cijfers.csv", encoding="utf-8", newline="") as bestand:
    rijen = list(csv.DictReader(bestand))

print(rijen[0])`),
      step("Groepeer per vak", "Bewaar de cijfers per vak in een dictionary.", `from collections import defaultdict

per_vak = defaultdict(list)
for rij in rijen:
    per_vak[rij["vak"]].append(float(rij["cijfer"]))`),
      step("Bereken het gemiddelde", "Deel de som door het aantal.", `for vak, cijfers in per_vak.items():
    gemiddelde = sum(cijfers) / len(cijfers)
    print(f"{vak}: {gemiddelde:.1f} ({len(cijfers)} cijfers)")`),
      step("Sorteer het rapport", "Toon het hoogste gemiddelde eerst.", `rapport = [
    (vak, sum(cijfers) / len(cijfers)) for vak, cijfers in per_vak.items()
]
for vak, gemiddelde in sorted(rapport, key=lambda paar: paar[1], reverse=True):
    print(f"{vak:<12} {gemiddelde:.1f}")`),
      step("Valideer de invoer", "Sla rijen met een ongeldig cijfer over.", `def lees_cijfer(waarde):
    try:
        return float(waarde.replace(",", "."))
    except ValueError:
        return None`),
    ],
    ["Open je CSV eerst in een teksteditor en controleer de kolomnamen.", "Gebruik Decimal als je met geld rekent."]
  ),
  idea(
    "verkoop-dashboard",
    "Verkoopdashboard",
    "🏪",
    "Data & AI",
    "Gemiddeld",
    "75 min",
    "Analyseer verkopen per product en maand.",
    "Je leert data groeperen, totalen berekenen en een tekstueel dashboard maken. Je kunt hetzelfde patroon gebruiken voor elke verkooplijst.",
    ["dict", "groeperen", "totalen", "rapport"],
    [
      step("Maak de data", "Gebruik een lijst met dictionaries als eenvoudige dataset.", `verkopen = [
    {"product": "Appel", "maand": "jan", "aantal": 12, "prijs": 0.5},
    {"product": "Peer", "maand": "jan", "aantal": 8, "prijs": 0.6},
    {"product": "Appel", "maand": "feb", "aantal": 20, "prijs": 0.5},
]`),
      step("Bereken omzet per product", "Vermenigvuldig aantal met prijs.", `from collections import defaultdict

omzet = defaultdict(float)
for rij in verkopen:
    omzet[rij["product"]] += rij["aantal"] * rij["prijs"]

print(dict(omzet))`),
      step("Groepeer per maand", "Een tweede dictionary laat de trend zien.", `per_maand = defaultdict(float)
for rij in verkopen:
    per_maand[rij["maand"]] += rij["aantal"] * rij["prijs"]`),
      step("Maak een ranglijst", "Sorteer producten op omzet.", `for product, bedrag in sorted(omzet.items(), key=lambda paar: paar[1], reverse=True):
    print(f"{product:<8} € {bedrag:.2f}")`),
      step("Voeg een totaal toe", "Tel alle omzet op en toon de beste maand.", `totaal = sum(omzet.values())
beste_maand = max(per_maand, key=per_maand.get)
print(f"Totaal: € {totaal:.2f}, beste maand: {beste_maand}")`),
    ],
    ["Controleer of prijzen inclusief of exclusief btw zijn.", "Rond pas op het einde af."]
  ),
  idea(
    "sentiment-analyse",
    "Sentiment-analyse",
    "😊",
    "Data & AI",
    "Gemiddeld",
    "70 min",
    "Bepaal of een recensie positief of negatief is.",
    "Je leert tekst opsplitsen en woorden wegen. Je bouwt een eenvoudige maar uitlegbare sentimentanalyser met eigen woordenlijsten.",
    ["tekst", "dict", "sentiment", "analyse"],
    [
      step("Maak woordlijsten", "Positieve en negatieve woorden krijgen een gewicht.", `positief = {"goed": 1, "geweldig": 2, "leuk": 1, "mooi": 1, "snel": 1}
negatief = {"slecht": 1, "traag": 1, "lelijk": 1, "kapot": 2, "teleurgesteld": 2}`),
      step("Verdeel de tekst in woorden", "Verwijder leestekens en zet alles op kleine letters.", `import re

def woorden(tekst):
    return re.findall(r"\\b\\w+\\b", tekst.lower())`),
      step("Bereken de score", "Tel positieve en negatieve gewichten op.", `def sentiment(tekst):
    score = 0
    for woord in woorden(tekst):
        score += positief.get(woord, 0)
        score -= negatief.get(woord, 0)
    return score`),
      step("Geef een label", "Bij nul is de tekst neutraal.", `def label(score):
    if score > 0:
        return "positief"
    if score < 0:
        return "negatief"
    return "neutraal"`),
      step("Test meerdere teksten", "Vergelijk korte en lange recensies.", `teksten = [
    "Dit is een geweldig product, snel geleverd.",
    "Traag en kapot aangekomen. Teleurgesteld.",
    "Het pakket is vandaag bezorgd.",
]

for tekst in teksten:
    score = sentiment(tekst)
    print(label(score), score, tekst)`),
    ],
    ["Woordenlijsten zijn taalafhankelijk; test Nederlandse teksten.", "Ontkenningen zoals 'niet goed' vragen extra regels."]
  ),
  idea(
    "kmeans-kleuren",
    "Kleuren groeperen met k-means",
    "🎨",
    "Data & AI",
    "Gevorderd",
    "2 uur",
    "Haal de belangrijkste kleuren uit een foto.",
    "Je leert k-means stap voor stap: punten toewijzen, gemiddelden berekenen en herhalen. Je gebruikt alleen Python en Pillow.",
    ["k-means", "clustering", "pillow", "wiskunde"],
    [
      step("Lees de pixels", "Verklein de foto zodat het algoritme snel blijft.", `from PIL import Image

foto = Image.open("foto.jpg").convert("RGB")
foto.thumbnail((120, 120))
pixels = list(foto.getdata())
print(len(pixels))`),
      step("Kies startpunten", "Kies willekeurige pixels als beginnende clusters.", `import random

def afstand(a, b):
    return sum((x - y) ** 2 for x, y in zip(a, b))

centra = random.sample(pixels, 5)`),
      step("Wijs pixels toe", "Elke pixel hoort bij het dichtstbijzijnde centrum.", `def wijs_toe(pixels, centra):
    groepen = [[] for _ in centra]
    for pixel in pixels:
        index = min(range(len(centra)), key=lambda i: afstand(pixel, centra[i]))
        groepen[index].append(pixel)
    return groepen`),
      step("Bereken nieuwe centra", "Het gemiddelde van een groep wordt het nieuwe centrum.", `def nieuwe_centra(groepen):
    resultaat = []
    for groep in groepen:
        if not groep:
            resultaat.append(random.choice(pixels))
            continue
        resultaat.append(tuple(sum(kanaal) // len(groep) for kanaal in zip(*groep)))
    return resultaat`),
      step("Herhaal en toon", "Na enkele rondes krijg je de dominante kleuren.", `for _ in range(8):
    groepen = wijs_toe(pixels, centra)
    centra = nieuwe_centra(groepen)

for kleur in centra:
    print("#{:02x}{:02x}{:02x}".format(*kleur))`),
    ],
    ["Gebruik een kleine afbeelding; k-means is rekenintensief.", "Vaste random seeds maken je resultaat reproduceerbaar."]
  ),
  idea(
    "lineaire-regressie",
    "Lineaire regressie",
    "📉",
    "Data & AI",
    "Gemiddeld",
    "90 min",
    "Voorspel een waarde met een rechte lijn.",
    "Je leert de kleinste-kwadratenmethode toepassen zonder library. Je berekent richtingscoëfficiënt en intercept en meet de fout.",
    ["statistiek", "regressie", "wiskunde", "voorspellen"],
    [
      step("Maak meetpunten", "Gebruik uren studie en het behaalde cijfer.", `punten = [(1, 4.5), (2, 5.0), (3, 5.8), (4, 6.4), (5, 7.1)]`),
      step("Bereken het gemiddelde", "Je hebt de gemiddelden van x en y nodig.", `def gemiddelde(waarden):
    return sum(waarden) / len(waarden)

xs = [x for x, _ in punten]
ys = [y for _, y in punten]
mx, my = gemiddelde(xs), gemiddelde(ys)`),
      step("Bereken de lijn", "De formule voor de helling gebruikt covariante en variantie.", `teller = sum((x - mx) * (y - my) for x, y in punten)
noemer = sum((x - mx) ** 2 for x in xs)
helling = teller / noemer
intercept = my - helling * mx`),
      step("Voorspel en meet de fout", "De gemiddelde absolute fout maakt de kwaliteit zichtbaar.", `def voorspel(x):
    return helling * x + intercept

fout = sum(abs(voorspel(x) - y) for x, y in punten) / len(punten)
print(f"y = {helling:.2f}x + {intercept:.2f}")
print(f"Gemiddelde fout: {fout:.2f}")`),
      step("Voeg een voorspelling toe", "Gebruik de lijn voor een nieuwe waarde.", `print("Bij 6 uur studie:", voorspel(6))`),
    ],
    ["Een rechte lijn werkt alleen als de relatie ongeveer lineair is.", "Voorspel niet buiten het bereik van je data zonder waarschuwing."]
  ),
  idea(
    "perceptron",
    "Een perceptron bouwen",
    "🧠",
    "Data & AI",
    "Gevorderd",
    "2 uur",
    "Leer een computer om punten te classificeren.",
    "Je bouwt een enkel neuraal netwerkje vanaf nul. Je leert gewichten aanpassen met de fout en ziet hoe leren in kleine stappen werkt.",
    ["neurale netwerken", "gewichten", "leren", "classificatie"],
    [
      step("Maak een dataset", "Twee klassen die lineair te scheiden zijn.", `data = [
    ((0, 0), 0), ((0, 1), 0), ((1, 0), 0),
    ((1, 1), 1), ((2, 1), 1), ((1, 2), 1),
]`),
      step("Initialiseer gewichten", "Begin met kleine willekeurige waarden.", `import random

gewichten = [random.uniform(-1, 1) for _ in range(2)]
bias = random.uniform(-1, 1)`),
      step("Voorspel", "Een stapfunctie bepaalt de klasse.", `def voorspel(x, y):
    som = gewichten[0] * x + gewichten[1] * y + bias
    return 1 if som >= 0 else 0`),
      step("Train het model", "Pas gewichten aan bij elke fout.", `LEERSNELHEID = 0.1

for ronde in range(20):
    fouten = 0
    for (x, y), doel in data:
        uitkomst = voorspel(x, y)
        fout = doel - uitkomst
        if fout != 0:
            fouten += 1
            gewichten[0] += LEERSNELHEID * fout * x
            gewichten[1] += LEERSNELHEID * fout * y
            bias += LEERSNELHEID * fout
    print(f"Ronde {ronde}: {fouten} fouten")`),
      step("Test het model", "Controleer alle voorbeelden na het trainen.", `for punt, doel in data:
    print(punt, "voorspeld:", voorspel(*punt), "echt:", doel)`),
    ],
    ["Een perceptron werkt alleen voor lineair scheidbare data.", "Te veel leersnelheid laat het model oscilleren."]
  ),
  idea(
    "aanbevelingssysteem",
    "Aanbevelingen maken",
    "⭐",
    "Data & AI",
    "Gemiddeld",
    "90 min",
    "Raad een film aan op basis van beoordelingen.",
    "Je leert gebruikers vergelijken met cosinusgelijkenis. Je bouwt een eenvoudige collaborative-filtering-aanbeveler.",
    ["cosinus", "dict", "aanbevelen", "data"],
    [
      step("Maak beoordelingen", "Elke gebruiker geeft cijfers aan een paar films.", `beoordelingen = {
    "Sam": {"Dune": 5, "Barbie": 2, "Oppenheimer": 4},
    "Noa": {"Dune": 4, "Barbie": 5, "Oppenheimer": 3},
    "Mila": {"Dune": 5, "Barbie": 1, "Oppenheimer": 5},
}`),
      step("Bereken gelijkenis", "Cosinusgelijkenis vergelijkt de richting van twee vectoren.", `import math

def gelijkenis(a, b):
    gedeeld = set(a) & set(b)
    teller = sum(a[film] * b[film] for film in gedeeld)
    noemer = math.sqrt(sum(v ** 2 for v in a.values())) * math.sqrt(sum(v ** 2 for v in b.values()))
    return teller / noemer if noemer else 0`),
      step("Vind gelijkende gebruikers", "Sorteer de andere gebruikers op gelijkenis.", `doel = "Sam"
scores = []
for naam, films in beoordelingen.items():
    if naam != doel:
        scores.append((naam, gelijkenis(beoordelingen[doel], films)))

scores.sort(key=lambda paar: paar[1], reverse=True)
print(scores)`),
      step("Raad een film aan", "Neem films die de doelgebruiker nog niet kent.", `gezien = set(beoordelingen[doel])
kandidaten = {}

for naam, score in scores[:2]:
    for film, cijfer in beoordelingen[naam].items():
        if film not in gezien:
            kandidaten[film] = kandidaten.get(film, 0) + score * cijfer

for film, waarde in sorted(kandidaten.items(), key=lambda paar: paar[1], reverse=True):
    print(film, round(waarde, 2))`),
      step("Maak het uitlegbaar", "Toon waarom je iets aanbeveelt.", `print("Omdat gebruikers met een vergelijkbare smaak deze film hoog beoordelen.")`),
    ],
    ["Meer beoordelingen geven betere resultaten.", "Een aanbeveling is geen garantie; toon altijd waarom."]
  ),
  idea(
    "pandas-rapport",
    "Dataframe-rapport",
    "🐼",
    "Data & AI",
    "Gemiddeld",
    "75 min",
    "Analyseer een dataset met pandas.",
    "Je leert een DataFrame laden, kolommen selecteren, groeperen en sorteren. Dit is de snelste manier om grote tabellen te begrijpen.",
    ["pandas", "dataframe", "groeperen", "rapport"],
    [
      step("Laad de data", "Lees een CSV direct in een DataFrame.", `# pip install pandas
import pandas as pd

df = pd.read_csv("verkopen.csv")
print(df.head())`),
      step("Bekijk de structuur", "Controleer kolommen, types en ontbrekende waarden.", `print(df.info())
print(df.describe())
print(df.isna().sum())`),
      step("Maak een nieuwe kolom", "Bereken omzet uit aantal en prijs.", `df["omzet"] = df["aantal"] * df["prijs"]`),
      step("Groepeer en sorteer", "Een groupby geeft totalen per product.", `per_product = df.groupby("product")["omzet"].sum().sort_values(ascending=False)
print(per_product)`),
      step("Schrijf een rapport", "Sla het resultaat op als CSV.", `per_product.to_csv("omzet-per-product.csv")
print("Klaar: omzet-per-product.csv")`),
    ],
    ["Controleer altijd of bedragen in dezelfde valuta staan.", "Gebruik een kopie van je data bij het toevoegen van kolommen."]
  ),
  idea(
    "regel-chatbot",
    "Regelgebaseerde chatbot",
    "💬",
    "Data & AI",
    "Beginner",
    "60 min",
    "Bouw een chatbot die vragen herkent zonder AI-model.",
    "Je leert intenties herkennen met trefwoorden en antwoorden kiezen. Dit is een goede basis voordat je een taalmodel gebruikt.",
    ["strings", "dict", "intenties", "chatbot"],
    [
      step("Maak intenties", "Elke intentie heeft trefwoorden en een antwoord.", `intenties = [
    {"woorden": ["hallo", "hoi", "hey"], "antwoord": "Hoi! Waar kan ik mee helpen?"},
    {"woorden": ["python", "leren"], "antwoord": "Begin met een klein project, zoals raad het getal."},
    {"woorden": ["weer"], "antwoord": "Ik kan geen live weer ophalen, maar je kunt een weer-API gebruiken."},
]`),
      step("Herken een intentie", "Tel hoeveel trefwoorden in de zin voorkomen.", `def herken(tekst):
    tekst = tekst.lower()
    beste = None
    beste_score = 0

    for intentie in intenties:
        score = sum(1 for woord in intentie["woorden"] if woord in tekst)
        if score > beste_score:
            beste = intentie
            beste_score = score

    return beste`),
      step("Antwoord", "Val terug op een hulpvaardig standaardantwoord.", `def antwoord(tekst):
    intentie = herken(tekst)
    if intentie:
        return intentie["antwoord"]
    return "Dat snap ik nog niet. Probeer woorden als python, weer of hallo."`),
      step("Maak een gesprek", "Blijf vragen tot de gebruiker stopt.", `while True:
    vraag = input("Jij: ").strip()
    if vraag.lower() in {"stop", "exit", "quit"}:
        break
    print("Bot:", antwoord(vraag))`),
      step("Breid uit", "Voeg een onderwerp toe en test of de juiste intentie wint.", `intenties.append({
    "woorden": ["bedankt", "thanks"],
    "antwoord": "Graag gedaan!",
})`),
    ],
    ["Test met zinnen die meerdere intenties raken.", "Gebruik een lijst met stopwoorden om ruis te verminderen."]
  ),
  idea(
    "cijfervoorspeller",
    "Cijfervoorspeller",
    "🎯",
    "Data & AI",
    "Gemiddeld",
    "80 min",
    "Voorspel een cijfer op basis van studiedagen.",
    "Je leert data opschonen, een eenvoudig model trainen en het resultaat interpreteren. Je vergelijkt de voorspelling met de echte waarde.",
    ["regressie", "statistiek", "voorspellen", "validatie"],
    [
      step("Maak een dataset", "Gebruik uren studie als invoer en cijfer als uitkomst.", `data = [
    (2, 4.2), (3, 4.8), (4, 5.1), (5, 5.9),
    (6, 6.3), (7, 6.8), (8, 7.2), (9, 7.9),
]`),
      step("Splits train en test", "Houd een paar punten apart om eerlijk te meten.", `train = data[:6]
test = data[6:]`),
      step("Train een lijn", "Bereken de kleinste-kwadratenlijn op de trainingsdata.", `def lijn(punten):
    mx = sum(x for x, _ in punten) / len(punten)
    my = sum(y for _, y in punten) / len(punten)
    teller = sum((x - mx) * (y - my) for x, y in punten)
    noemer = sum((x - mx) ** 2 for x, _ in punten)
    a = teller / noemer if noemer else 0
    return a, my - a * mx

a, b = lijn(train)`),
      step("Test op nieuwe data", "Bereken de fout op de testpunten.", `for x, y in test:
    voorspelling = a * x + b
    print(f"{x} uur: voorspeld {voorspelling:.1f}, echt {y}")`),
      step("Voorspel voor jezelf", "Gebruik het model voor een nieuwe studieweek.", `uren = 10
print(f"Bij {uren} uur: {a * uren + b:.1f}")`),
    ],
    ["Meer en gevarieerdere data geven een betrouwbaarder model.", "Een voorspelling is geen belofte; toon de foutmarge."]
  )
];
