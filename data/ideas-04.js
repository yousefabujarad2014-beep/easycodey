// Deel 4: web en security.
import { idea, step } from "./helper.js";

export const IDEAS_PART_4 = [
  idea(
    "weer-dashboard",
    "Weer-dashboard",
    "🌦️",
    "Web",
    "Gemiddeld",
    "90 min",
    "Bouw een kleine website die het actuele weer toont.",
    "Je maakt een Flask-pagina die live weerdata ophaalt bij Open-Meteo. Je leert routes, API's aanroepen en JSON omzetten naar HTML.",
    ["flask", "requests", "json", "html"],
    [
      step("Start een Flask-pagina", "Flask is een klein Python-webframework. Deze route geeft een eenvoudige pagina terug.", `from flask import Flask

app = Flask(__name__)

@app.route("/")
def home():
    return "<h1>Mijn weer-site</h1>"

app.run(debug=True)`),
      step("Haal de temperatuur op", "Open-Meteo is gratis en vraagt geen sleutel. Met requests haal je JSON op.", `import requests

url = "https://api.open-meteo.com/v1/forecast"
params = {"latitude": 52.37, "longitude": 4.89, "current": "temperature_2m"}
data = requests.get(url, params=params, timeout=10).json()

print(data["current"]["temperature_2m"])`),
      step("Toon het weer op de pagina", "Combineer de route en de API. Vang netwerkfouten op zodat je site niet crasht.", `@app.route("/")
def home():
    try:
        data = requests.get(url, params=params, timeout=10).json()
        temperatuur = data["current"]["temperature_2m"]
        return f"<h1>{temperatuur} °C in Amsterdam</h1>"
    except Exception:
        return "<h1>Weer tijdelijk niet beschikbaar</h1>"`)
    ],
    ["Test je route eerst zonder API en voeg daarna pas de fetch toe.", "Gebruik een cache of sla de laatste meting op als je de API niet te vaak wilt aanroepen."]
  ),
  idea(
    "flask-takenlijst",
    "Online takenlijst",
    "✅",
    "Web",
    "Beginner",
    "60 min",
    "Maak een takenlijst die je in de browser kunt bijwerken.",
    "Je bouwt een kleine Flask-app met een formulier en een lijst in het geheugen. Je leert POST-verzoeken en formuliervelden lezen.",
    ["flask", "post", "forms", "lijsten"],
    [
      step("Toon de takenlijst", "Bewaar de taken in een lijst en render ze met een eenvoudige HTML-string.", `from flask import Flask, request, redirect
app = Flask(__name__)
taken = ["Python leren"]

@app.route("/")
def home():
    items = "".join(f"<li>{taak}</li>" for taak in taken)
    return f"<h1>Taken</h1><ul>{items}</ul>"`),
      step("Voeg een formulier toe", "Een POST-formulier stuurt de invoer naar dezelfde route.", `@app.route("/", methods=["GET", "POST"])
def home():
    if request.method == "POST":
        taak = request.form.get("taak", "").strip()
        if taak:
            taken.append(taak)
        return redirect("/")

    items = "".join(f"<li>{taak}</li>" for taak in taken)
    return f"""
      <h1>Taken</h1><ul>{items}</ul>
      <form method="post">
        <input name="taak" required>
        <button>Toevoegen</button>
      </form>
    """`),
      step("Verwijder een taak", "Geef elke taak een nummer en laat de gebruiker dat nummer verwijderen.", `@app.route("/verwijder/<int:nummer>")
def verwijder(nummer):
    if 0 <= nummer < len(taken):
        taken.pop(nummer)
    return redirect("/")

# In de lijst:
# <a href="/verwijder/{i}">verwijder</a>`)
    ],
    ["Gebruik redirect na een POST, anders voegt verversen de taak opnieuw toe.", "Bewaar taken later in een JSON-bestand als je ze wilt onthouden."]
  ),
  idea(
    "url-shortener",
    "Linkverkorter",
    "🔗",
    "Web",
    "Gemiddeld",
    "75 min",
    "Maak korte links die doorverwijzen naar een lange URL.",
    "Je bouwt een URL-shortener met een dictionary en een redirect-route. Je leert willekeurige codes maken en HTTP-redirects gebruiken.",
    ["flask", "dict", "random", "redirect"],
    [
      step("Maak een korte code", "Gebruik letters en cijfers om een unieke code te maken.", `import random
import string

def maak_code(lengte=6):
    tekens = string.ascii_letters + string.digits
    return "".join(random.choice(tekens) for _ in range(lengte))

print(maak_code())`),
      step("Bewaar de link", "Een dictionary koppelt de korte code aan de lange URL.", `links = {}

@app.route("/", methods=["GET", "POST"])
def home():
    korte_link = ""
    if request.method == "POST":
        url = request.form.get("url", "").strip()
        code = maak_code()
        links[code] = url
        korte_link = f"http://localhost:5000/{code}"
    return f"""
      <form method="post">
        <input name="url" placeholder="https://..." required>
        <button>Verkort</button>
      </form>
      <p>{korte_link}</p>
    """`),
      step("Verwijs door", "De route leest de code en stuurt de browser naar de opgeslagen URL.", `from flask import redirect

@app.route("/<code>")
def doorsturen(code):
    url = links.get(code)
    if not url:
        return "Onbekende link", 404
    return redirect(url)`),
      step("Valideer de URL", "Controleer of de invoer met http:// of https:// begint voordat je hem opslaat.", `from urllib.parse import urlparse

def geldige_url(url):
    parsed = urlparse(url)
    return parsed.scheme in ("http", "https") and bool(parsed.netloc)`),
      step("Laat de dictionary zien", "Een beheerpagina maakt je project makkelijker te testen.", `@app.route("/links")
def overzicht():
    regels = "".join(f"<li>{code} → {url}</li>" for code, url in links.items())
    return f"<h1>Alle links</h1><ul>{regels}</ul>"`)
    ],
    ["Gebruik geen echte wachtwoorden of privélinks in je testdata.", "Een echte dienst zou links in een database opslaan."]
  ),
  idea(
    "markdown-blog",
    "Markdown-blog",
    "📝",
    "Web",
    "Gemiddeld",
    "90 min",
    "Toon je eigen teksten als een eenvoudige blog.",
    "Je leest Markdown-bestanden uit een map en toont ze als HTML. Je leert bestanden lezen, koppen omzetten en routes met variabelen maken.",
    ["flask", "markdown", "bestanden", "routes"],
    [
      step("Bewaar een blogpost", "Maak een map posts en zet daarin een bestand zoals hallo.md met een titel en tekst.", `# hallo.md
# Mijn eerste post

Dit is **vet** en dit is een lijst:

- punt een
- punt twee`),
      step("Lees de bestanden", "Glob vindt alle Markdown-bestanden in een map.", `from pathlib import Path

posts = sorted(Path("posts").glob("*.md"))
for post in posts:
    print(post.stem, post.read_text(encoding="utf-8")[:40])`),
      step("Zet Markdown om naar HTML", "Voor een simpele blog vervang je koppen, vet en regels zelf.", `import re

def naar_html(tekst):
    tekst = re.sub(r"^### (.+)$", r"<h3>\\1</h3>", tekst, flags=re.M)
    tekst = re.sub(r"^## (.+)$", r"<h2>\\1</h2>", tekst, flags=re.M)
    tekst = re.sub(r"^# (.+)$", r"<h1>\\1</h1>", tekst, flags=re.M)
    tekst = re.sub(r"\\*\\*(.+?)\\*\\*", r"<strong>\\1</strong>", tekst)
    return tekst`),
      step("Maak een postroute", "De slug uit de URL bepaalt welk bestand je opent.", `@app.route("/post/<slug>")
def post(slug):
    bestand = Path("posts") / f"{slug}.md"
    if not bestand.exists():
        return "Post niet gevonden", 404
    return naar_html(bestand.read_text(encoding="utf-8"))`),
      step("Toon een index", "Een overzichtspagina linkt naar alle posts.", `@app.route("/")
def index():
    links = "".join(
        f'<li><a href="/post/{p.stem}">{p.stem}</a></li>' for p in posts
    )
    return f"<h1>Blog</h1><ul>{links}</ul>"`)
    ],
    ["Gebruik nooit bestandsnamen rechtstreeks uit de URL zonder controle.", "Voeg een datum aan de bestandsnaam toe om posts te sorteren."]
  ),
  idea(
    "stem-app",
    "Stem-app",
    "🗳️",
    "Web",
    "Gemiddeld",
    "75 min",
    "Laat bezoekers stemmen en toon de resultaten.",
    "Je bouwt een kleine peiling met Flask. Je leert POST-data verwerken, stemmen tellen en resultaten veilig tonen.",
    ["flask", "dict", "post", "html"],
    [
      step("Maak de opties", "Bewaar de stemmen in een dictionary met een beginwaarde.", `opties = {"Pizza": 0, "Pasta": 0, "Sushi": 0}`),
      step("Toon het formulier", "Elke optie wordt een knop met dezelfde naam.", `@app.route("/")
def home():
    knoppen = "".join(
        f'<button name="keuze" value="{naam}">{naam}</button> '
        for naam in opties
    )
    return f'<form method="post">{knoppen}</form>'`),
      step("Tel de stem", "Lees de keuze uit het formulier en verhoog de teller.", `@app.route("/", methods=["GET", "POST"])
def home():
    if request.method == "POST":
        keuze = request.form.get("keuze")
        if keuze in opties:
            opties[keuze] += 1
        return redirect("/")
    # toon formulier`),
      step("Toon de resultaten", "Bereken het totaal en toon percentages.", `@app.route("/resultaten")
def resultaten():
    totaal = sum(opties.values()) or 1
    regels = "".join(
        f"<li>{naam}: {stemmen} ({stemmen / totaal:.0%})</li>"
        for naam, stemmen in opties.items()
    )
    return f"<h1>Resultaten</h1><ul>{regels}</ul>"`)
    ],
    ["Iedereen kan meerdere keren stemmen; dat is voor een leersite prima.", "Bewaar stemmen in een bestand als je ze wilt bewaren na een herstart."]
  ),
  idea(
    "contactformulier",
    "Contactformulier",
    "✉️",
    "Web",
    "Beginner",
    "45 min",
    "Ontvang een bericht via een formulier en toon een bevestiging.",
    "Je leert formulieren verwerken, invoer controleren en foutmeldingen tonen zonder de pagina te laten crashen.",
    ["flask", "forms", "validatie", "html"],
    [
      step("Bouw het formulier", "Gebruik namen en een verplicht e-mailveld.", `@app.route("/")
def home():
    return """
      <form method="post">
        <input name="naam" placeholder="Naam" required>
        <input name="email" type="email" placeholder="E-mail" required>
        <textarea name="bericht" required></textarea>
        <button>Versturen</button>
      </form>
    """`),
      step("Lees en controleer de invoer", "Verwijder spaties en controleer of alle velden gevuld zijn.", `@app.route("/", methods=["GET", "POST"])
def home():
    if request.method == "POST":
        naam = request.form.get("naam", "").strip()
        email = request.form.get("email", "").strip()
        bericht = request.form.get("bericht", "").strip()

        if not all([naam, email, bericht]):
            return "Vul alle velden in.", 400

        return f"Bedankt, {naam}! Je bericht is ontvangen."`),
      step("Toon een nette bevestiging", "Escape de invoer voordat je hem in HTML zet.", `from markupsafe import escape

return f"<h1>Bedankt, {escape(naam)}</h1><p>We nemen contact op via {escape(email)}.</p>"`),
      step("Beperk de lengte", "Lange berichten kunnen je opslag of e-mail vol maken.", `if len(bericht) > 2000:
    return "Je bericht is te lang.", 400`)
    ],
    ["Gebruik escape() bij elke gebruikersinvoer die je in HTML toont.", "Verstuur nog geen echte e-mail tijdens het testen."]
  ),
  idea(
    "rest-api",
    "REST API voor taken",
    "🔌",
    "Web",
    "Gevorderd",
    "2 uur",
    "Bouw een JSON-API die je met fetch kunt gebruiken.",
    "Je maakt een API met GET, POST, PUT en DELETE. Je leert statuscodes, JSON-antwoorden en het scheiden van data en presentatie.",
    ["flask", "json", "http", "crud"],
    [
      step("Maak een JSON-endpoint", "Flask zet een dictionary automatisch om naar JSON.", `from flask import Flask, jsonify
app = Flask(__name__)

taken = [{"id": 1, "titel": "Leren", "klaar": False}]

@app.get("/api/taken")
def lijst():
    return jsonify(taken)`),
      step("Voeg een taak toe", "Lees JSON uit het verzoek en geef een 201-status terug.", `@app.post("/api/taken")
def toevoegen():
    data = request.get_json(silent=True) or {}
    titel = str(data.get("titel", "")).strip()
    if not titel:
        return jsonify({"fout": "titel ontbreekt"}), 400

    taak = {"id": len(taken) + 1, "titel": titel, "klaar": False}
    taken.append(taak)
    return jsonify(taak), 201`),
      step("Werk een taak bij", "Met PUT vervang je de velden van een bestaande taak.", `@app.put("/api/taken/<int:taak_id>")
def bijwerken(taak_id):
    taak = next((t for t in taken if t["id"] == taak_id), None)
    if not taak:
        return jsonify({"fout": "niet gevonden"}), 404

    data = request.get_json(silent=True) or {}
    taak["titel"] = str(data.get("titel", taak["titel"]))
    taak["klaar"] = bool(data.get("klaar", taak["klaar"]))
    return jsonify(taak)`),
      step("Verwijder een taak", "DELETE geeft vaak 204 terug: gelukt, maar geen inhoud.", `@app.delete("/api/taken/<int:taak_id>")
def verwijderen(taak_id):
    global taken
    taken = [t for t in taken if t["id"] != taak_id]
    return "", 204`),
      step("Test met fetch", "Vanuit de browser kun je de API testen zonder extra tool.", `fetch("/api/taken")
  .then((response) => response.json())
  .then((data) => console.log(data));`)
    ],
    ["Test elke statuscode: 200, 201, 400, 404 en 204.", "Een echte API gebruikt een database en authenticatie."]
  ),
  idea(
    "login-systeem",
    "Login-systeem",
    "🔑",
    "Web",
    "Gevorderd",
    "2 uur",
    "Bouw een veilige login met gehashte wachtwoorden.",
    "Je leert wachtwoorden hashen met een salt, sessies gebruiken en controleren of iemand ingelogd is. Je slaat nooit platte wachtwoorden op.",
    ["hashlib", "salt", "sessies", "security"],
    [
      step("Hash een wachtwoord", "Een salt maakt elke hash uniek, ook bij hetzelfde wachtwoord.", `import hashlib
import secrets

def hash_wachtwoord(wachtwoord, salt=None):
    salt = salt or secrets.token_hex(16)
    digest = hashlib.pbkdf2_hmac(
        "sha256", wachtwoord.encode(), salt.encode(), 200_000
    ).hex()
    return f"{salt}\${digest}"`),
      step("Controleer een wachtwoord", "Hash de invoer opnieuw met de opgeslagen salt en vergelijk.", `def controleer(wachtwoord, opgeslagen):
    salt, digest = opgeslagen.split("$")
    nieuw = hashlib.pbkdf2_hmac(
        "sha256", wachtwoord.encode(), salt.encode(), 200_000
    ).hex()
    return secrets.compare_digest(nieuw, digest)`),
      step("Log de gebruiker in", "Bewaar alleen een gebruikersnaam in de sessie, nooit het wachtwoord.", `from flask import session, redirect

@app.post("/login")
def login():
    naam = request.form.get("naam", "")
    wachtwoord = request.form.get("wachtwoord", "")
    gebruiker = gebruikers.get(naam)

    if gebruiker and controleer(wachtwoord, gebruiker["hash"]):
        session["gebruiker"] = naam
        return redirect("/dashboard")

    return "Onjuiste gegevens", 401`),
      step("Bescherm een pagina", "Controleer de sessie voordat je privé-inhoud toont.", `@app.get("/dashboard")
def dashboard():
    if "gebruiker" not in session:
        return redirect("/")
    return f"Welkom, {session['gebruiker']}"`),
      step("Stel een geheime sleutel in", "Zonder geheime sleutel kan Flask sessies niet veilig ondertekenen.", `app.secret_key = "vervang-dit-door-een-lange-random-waarde"`)
    ],
    ["Gebruik nooit een echt wachtwoord in testdata.", "Sla de secret key op in een omgevingsvariabele, niet in je code."]
  ),
  idea(
    "portfolio-generator",
    "Portfolio-generator",
    "🖼️",
    "Web",
    "Gemiddeld",
    "90 min",
    "Maak een portfolio-website uit een JSON-bestand.",
    "Je leest projectgegevens uit JSON en genereert een complete HTML-pagina. Je leert templates, escaping en bestanden schrijven.",
    ["json", "html", "templates", "bestanden"],
    [
      step("Beschrijf je projecten", "Een lijst met dictionaries is makkelijk aan te passen.", `projecten = [
    {"titel": "Weer-app", "url": "https://example.com", "tags": ["Flask", "API"]},
    {"titel": "Snake", "url": "https://example.com", "tags": ["pygame"]},
]`),
      step("Bouw de HTML", "Genereer per project een kaart met een link en tags.", `def kaart(project):
    tags = "".join(f"<span>{tag}</span>" for tag in project["tags"])
    return f"""
      <article>
        <h2>{project['titel']}</h2>
        <p>{tags}</p>
        <a href="{project['url']}">Bekijk project</a>
      </article>
    """

inhoud = "".join(kaart(p) for p in projecten)`),
      step("Schrijf de pagina", "Met een volledige HTML-wrapper schrijf je alles naar index.html.", `html = f"""<!DOCTYPE html>
<html lang="nl">
<head><meta charset="utf-8"><title>Mijn portfolio</title></head>
<body><h1>Mijn projecten</h1>{inhoud}</body>
</html>"""

with open("portfolio.html", "w", encoding="utf-8") as bestand:
    bestand.write(html)`),
      step("Escape de invoer", "Gebruik html.escape zodat een titel met < of > de pagina niet breekt.", `from html import escape

titel = escape(project["titel"])`),
      step("Lees uit JSON", "Zo kun je de inhoud aanpassen zonder Python te wijzigen.", `import json

with open("projecten.json", encoding="utf-8") as bestand:
    projecten = json.load(bestand)`),
    ],
    ["Open de gegenereerde pagina in je browser en controleer alle links.", "Houd de generator gescheiden van de data."]
  ),
  idea(
    "flask-fotogalerij",
    "Fotogalerij",
    "📷",
    "Web",
    "Gemiddeld",
    "90 min",
    "Upload foto's en toon ze in een galerij.",
    "Je leert bestanden uploaden, bestandsnamen veilig maken en afbeeldingen tonen. Dit is een basis voor elke media-app.",
    ["flask", "upload", "bestanden", "html"],
    [
      step("Maak een uploadformulier", "Een formulier met enctype multipart verstuurt bestanden.", `@app.route("/")
def home():
    return """
      <form method="post" enctype="multipart/form-data">
        <input type="file" name="foto" accept="image/*" required>
        <button>Uploaden</button>
      </form>
    """`),
      step("Ontvang het bestand", "Controleer de extensie en sla het op in een uploads-map.", `from werkzeug.utils import secure_filename
from pathlib import Path

UPLOAD = Path("uploads")
UPLOAD.mkdir(exist_ok=True)
TOEGESTAAN = {".png", ".jpg", ".jpeg", ".webp", ".gif"}

@app.post("/")
def upload():
    foto = request.files.get("foto")
    if not foto or not foto.filename:
        return "Geen bestand", 400

    naam = secure_filename(foto.filename)
    if Path(naam).suffix.lower() not in TOEGESTAAN:
        return "Alleen afbeeldingen", 400

    foto.save(UPLOAD / naam)
    return redirect("/")`),
      step("Toon de galerij", "Loop over de map en maak een img-tag per bestand.", `@app.get("/")
def galerij():
    fotos = "".join(
        f'<img src="/uploads/{foto.name}" alt="{foto.stem}" loading="lazy">'
        for foto in UPLOAD.iterdir()
        if foto.suffix.lower() in TOEGESTAAN
    )
    return f"<h1>Galerij</h1>{fotos}"`),
      step("Serveer de afbeeldingen", "Flask kan een map met statische bestanden serveren.", `from flask import send_from_directory

@app.get("/uploads/<naam>")
def upload_bestand(naam):
    return send_from_directory(UPLOAD, naam)`),
      step("Beperk de bestandsgrootte", "Grote uploads kunnen je schijf vullen.", `app.config["MAX_CONTENT_LENGTH"] = 5 * 1024 * 1024`)
    ],
    ["Test met een kleine afbeelding.", "Gebruik nooit de originele bestandsnaam zonder secure_filename()."]
  ),
  idea(
    "flask-quiz",
    "Online quiz",
    "🧠",
    "Web",
    "Gemiddeld",
    "60 min",
    "Stel vragen via de browser en houd de score bij.",
    "Je combineert een vragenlijst, een POST-formulier en een sessie. Je leert state bewaren tussen requests.",
    ["flask", "sessies", "forms", "score"],
    [
      step("Maak de vragen", "Bewaar vraag, opties en het juiste antwoord.", `vragen = [
    {"vraag": "Wat doet print()?", "antwoord": "tekst tonen"},
    {"vraag": "Welk type is 3.14?", "antwoord": "float"},
]`),
      step("Toon één vraag", "Gebruik de sessie om de huidige vraag bij te houden.", `@app.get("/")
def quiz():
    nummer = session.get("nummer", 0)
    if nummer >= len(vragen):
        return f"Klaar! Score: {session.get('score', 0)}"

    vraag = vragen[nummer]
    return f"""
      <p>{vraag['vraag']}</p>
      <form method="post">
        <input name="antwoord" required>
        <button>Antwoord</button>
      </form>
    """`),
      step("Controleer het antwoord", "Vergelijk zonder hoofdletters en spaties en werk de score bij.", `@app.post("/")
def antwoord():
    nummer = session.get("nummer", 0)
    gegeven = request.form.get("antwoord", "").strip().lower()
    juist = vragen[nummer]["antwoord"].lower()

    if gegeven == juist:
        session["score"] = session.get("score", 0) + 1

    session["nummer"] = nummer + 1
    return redirect("/")`),
      step("Start opnieuw", "Een reset-route maakt de quiz speelbaar voor de volgende gebruiker.", `@app.get("/reset")
def reset():
    session.clear()
    return redirect("/")`)
    ],
    ["Toon na elk antwoord of het goed was.", "Voeg meerkeuzevragen toe met radio buttons."]
  ),
  idea(
    "recepten-app",
    "Recepten-app",
    "🍳",
    "Web",
    "Gemiddeld",
    "90 min",
    "Bewaar en bekijk recepten in een kleine webapp.",
    "Je leert gegevens laden uit JSON, een formulier verwerken en een lijst met details tonen. Je werkt met een echte bestandsopslag.",
    ["flask", "json", "crud", "bestanden"],
    [
      step("Laad de recepten", "Lees bij het starten een JSON-bestand of begin met een lege lijst.", `import json
from pathlib import Path

BESTAND = Path("recepten.json")
recepten = json.loads(BESTAND.read_text(encoding="utf-8")) if BESTAND.exists() else []`),
      step("Toon het overzicht", "Maak een lijst met links naar elk recept.", `@app.get("/")
def home():
    items = "".join(
        f'<li><a href="/recept/{i}">{r["naam"]}</a></li>'
        for i, r in enumerate(recepten)
    )
    return f"<h1>Recepten</h1><ul>{items}</ul>"`),
      step("Voeg een recept toe", "Lees de velden en voeg een dictionary toe aan de lijst.", `@app.post("/nieuw")
def nieuw():
    naam = request.form.get("naam", "").strip()
    ingredienten = request.form.get("ingredienten", "").strip()
    if naam and ingredienten:
        recepten.append({"naam": naam, "ingredienten": ingredienten})
        BESTAND.write_text(json.dumps(recepten, ensure_ascii=False, indent=2), encoding="utf-8")
    return redirect("/")`),
      step("Toon een detailpagina", "Controleer de index voordat je een recept opzoekt.", `@app.get("/recept/<int:index>")
def detail(index):
    if not 0 <= index < len(recepten):
        return "Recept niet gevonden", 404
    recept = recepten[index]
    return f"<h1>{recept['naam']}</h1><p>{recept['ingredienten']}</p>"`),
      step("Maak een formulier", "Een klein formulier op de homepage maakt toevoegen mogelijk.", `<form method="post" action="/nieuw">
  <input name="naam" placeholder="Naam" required>
  <textarea name="ingredienten" required></textarea>
  <button>Opslaan</button>
</form>`)
    ],
    ["Maak een back-up van recepten.json voordat je het formaat wijzigt.", "Valideer invoer ook als je later een echte database gebruikt."]
  ),
  idea(
    "bezoekers-teller",
    "Bezoekers-teller",
    "📈",
    "Web",
    "Beginner",
    "40 min",
    "Tel hoe vaak een pagina in deze sessie is bekeken.",
    "Je leert cookies en sessies gebruiken. De teller staat per browser, niet per server, en dat is precies het verschil dat je wilt begrijpen.",
    ["flask", "sessies", "cookies", "teller"],
    [
      step("Zet een teller in de sessie", "Bij het eerste bezoek bestaat de teller nog niet.", `@app.get("/")
def home():
    bezoeken = session.get("bezoeken", 0) + 1
    session["bezoeken"] = bezoeken
    return f"Je hebt deze pagina {bezoeken} keer bekeken."`),
      step("Voeg een reset toe", "Met een aparte route wis je de sessie.", `@app.get("/reset")
def reset():
    session.clear()
    return redirect("/")`),
      step("Toon een unieke bezoeker", "Een willekeurig id in de sessie laat zien dat cookies per browser werken.", `import secrets

if "bezoeker" not in session:
    session["bezoeker"] = secrets.token_hex(4)

return f"Bezoeker {session['bezoeker']}: {bezoeken} keer bekeken."`),
      step("Leg het verschil uit", "Een serverteller voor alle bezoekers vraagt gedeelde opslag, zoals een database.", `# Serverbrede teller (voor één proces):
totaal = 0

@app.get("/")
def home():
    global totaal
    totaal += 1
    return f"Totaal: {totaal}"`)
    ],
    ["Sessies verdwijnen als je de cookie verwijdert.", "Gebruik geen sessieteller voor echte analytics."]
  ),

  idea(
    "wachtwoord-sterkt",
    "Wachtwoordsterkte meten",
    "🔒",
    "Security",
    "Beginner",
    "40 min",
    "Beoordeel hoe sterk een wachtwoord is.",
    "Je schrijft een functie die lengte, cijfers, hoofdletters en symbolen controleert. Je leert waarom sommige wachtwoorden snel te raden zijn.",
    ["strings", "functies", "regex", "security"],
    [
      step("Controleer de lengte", "Lengte is de belangrijkste factor, maar niet de enige.", `def score(wachtwoord):
    punten = 0
    if len(wachtwoord) >= 8:
        punten += 1
    if len(wachtwoord) >= 14:
        punten += 1
    return punten

print(score("appel"))`),
      step("Controleer de tekens", "Gebruik any() om te kijken of er cijfers, hoofdletters en symbolen zijn.", `def heeft_soorten(wachtwoord):
    return {
        "cijfer": any(t.isdigit() for t in wachtwoord),
        "hoofdletter": any(t.isupper() for t in wachtwoord),
        "kleine letter": any(t.islower() for t in wachtwoord),
        "symbool": any(not t.isalnum() for t in wachtwoord),
    }

print(heeft_soorten("Appel123!"))`),
      step("Maak een eindscore", "Tel de soorten tekens op en geef een label terug.", `def beoordeel(wachtwoord):
    soorten = heeft_soorten(wachtwoord)
    punten = len(wachtwoord) // 4 + sum(soorten.values())

    if punten >= 7:
        return "sterk"
    if punten >= 5:
        return "redelijk"
    return "zwak"

print(beoordeel("Appel123!"))`),
      step("Herken veelgebruikte wachtwoorden", "Een lang wachtwoord kan alsnog in een lijst met bekende wachtwoorden staan.", `veelgebruikt = {"wachtwoord", "123456", "qwerty", "welkom123"}

def is_veelgebruikt(wachtwoord):
    return wachtwoord.lower() in veelgebruikt`),
      step("Toon advies", "Geef concrete tips in plaats van alleen een cijfer.", `if is_veelgebruikt(wachtwoord):
    advies = "Kies een ander wachtwoord; deze staat in bekende lijsten."
elif beoordeel(wachtwoord) == "zwak":
    advies = "Maak het langer en voeg een cijfer en symbool toe."
else:
    advies = "Goed bezig. Gebruik per site een uniek wachtwoord."`)
    ],
    ["Test met een paar voorbeelden en controleer de uitkomst handmatig.", "Gebruik nooit een echt wachtwoord in je testbestand."]
  ),
  idea(
    "caesar-cipher",
    "Caesar-vercijfering",
    "🏛️",
    "Security",
    "Beginner",
    "45 min",
    "Vercijfer en ontsleutel tekst met een verschuiving.",
    "Je leert hoe klassieke encryptie werkt en waarom een vaste verschuiving niet veilig is. Je oefent met strings, ord() en chr().",
    ["strings", "ord", "chr", "encryptie"],
    [
      step("Verschuif één letter", "ord() geeft de lettercode en chr() maakt er weer een letter van.", `def verschuif(letter, aantal):
    if letter.isalpha():
        basis = ord("a") if letter.islower() else ord("A")
        return chr((ord(letter) - basis + aantal) % 26 + basis)
    return letter

print(verschuif("a", 3))`),
      step("Vercijfer een hele tekst", "Pas de verschuiving toe op elke letter.", `def vercijfer(tekst, aantal):
    return "".join(verschuif(letter, aantal) for letter in tekst)

print(vercijfer("hallo wereld", 3))`),
      step("Ontsleutel met dezelfde functie", "Terugdraaien is verschuiven met het tegenovergestelde aantal.", `def ontsleutel(tekst, aantal):
    return vercijfer(tekst, -aantal)

print(ontsleutel("kdoor zhuhog", 3))`),
      step("Probeer alle sleutels", "Met 26 mogelijkheden kun je een onbekende tekst brute-forcen.", `for sleutel in range(26):
    print(sleutel, vercijfer("kdoor", -sleutel))`),
      step("Voeg cijfers en leestekens toe", "Alleen letters verschuiven; de rest blijft staan.", `print(vercijfer("Python 3 is leuk!", 5))`)
    ],
    ["Gebruik deze techniek alleen om te leren, niet voor echte geheimen.", "Test met hoofdletters en spaties."]
  ),
  idea(
    "hash-vergelijker",
    "Hashes vergelijken",
    "#️⃣",
    "Security",
    "Gemiddeld",
    "45 min",
    "Ontdek hoe hashing werkt en waarom een salt nodig is.",
    "Je berekent SHA-256-hashes en ziet dat hetzelfde wachtwoord zonder salt steeds dezelfde hash geeft. Daarna voeg je een salt toe.",
    ["hashlib", "sha256", "salt", "security"],
    [
      step("Hash een tekst", "Een hash is een vaste vingerafdruk van je invoer.", `import hashlib

def sha256(tekst):
    return hashlib.sha256(tekst.encode()).hexdigest()

print(sha256("appel"))`),
      step("Vergelijk twee invoeren", "Kleine verschillen geven een compleet andere hash.", `print(sha256("appel"))
print(sha256("Appel"))`),
      step("Voeg een salt toe", "Door een willekeurige salt toe te voegen wordt elke hash anders.", `import secrets

def met_salt(wachtwoord):
    salt = secrets.token_hex(8)
    hashwaarde = hashlib.sha256((salt + wachtwoord).encode()).hexdigest()
    return f"{salt}\${hashwaarde}"

print(met_salt("appel"))`),
      step("Controleer een wachtwoord", "Bewaar de salt en hash samen en vergelijk opnieuw.", `def controleer(wachtwoord, opgeslagen):
    salt, oude_hash = opgeslagen.split("$")
    nieuwe_hash = hashlib.sha256((salt + wachtwoord).encode()).hexdigest()
    return nieuwe_hash == oude_hash`),
      step("Gebruik PBKDF2", "Voor wachtwoorden is een langzame hash met veel iteraties beter.", `def pbkdf2(wachtwoord, salt):
    return hashlib.pbkdf2_hmac(
        "sha256", wachtwoord.encode(), salt.encode(), 200_000
    ).hex()`)
    ],
    ["Gebruik hashes om te controleren, niet om tekst terug te lezen.", "Voor echte wachtwoorden gebruik je een gespecialiseerde library of PBKDF2/argon2."]
  ),
  idea(
    "wachtwoordkluis",
    "Lokale wachtwoordkluis",
    "🗄️",
    "Security",
    "Gevorderd",
    "2 uur",
    "Bewaar geheimen versleuteld in een lokaal bestand.",
    "Je leert sleutelafleiding met PBKDF2, versleuteling met een keystream en veilig opslaan. Dit is een leerproject, geen productiekluis.",
    ["pbkdf2", "xor", "json", "encryptie"],
    [
      step("Leid een sleutel af", "De master password wordt nooit opgeslagen; alleen de salt.", `import hashlib
import secrets

def maak_sleutel(master, salt, lengte=32):
    return hashlib.pbkdf2_hmac(
        "sha256", master.encode(), salt, 200_000, dklen=lengte
    )`),
      step("Maak een keystream", "Voor een leerproject kun je een eenvoudige XOR-keystream gebruiken.", `def keystream(sleutel, lengte):
    return hashlib.shake_256(sleutel).digest(lengte)`),
      step("Versleutel tekst", "XOR de bytes van de tekst met de keystream.", `import base64

def versleutel(tekst, sleutel):
    data = tekst.encode()
    stream = keystream(sleutel, len(data))
    return base64.b64encode(bytes(a ^ b for a, b in zip(data, stream))).decode()`),
      step("Ontsleutel tekst", "Dezelfde bewerking draait XOR weer terug.", `def ontsleutel(geheim, sleutel):
    data = base64.b64decode(geheim)
    stream = keystream(sleutel, len(data))
    return bytes(a ^ b for a, b in zip(data, stream)).decode()`),
      step("Sla de kluis op", "Bewaar alleen salt en versleutelde gegevens in JSON.", `import json

salt = secrets.token_bytes(16)
sleutel = maak_sleutel("mijn-lange-master", salt)
kluis = {"salt": salt.hex(), "items": [versleutel("geheim", sleutel)]}

with open("kluis.json", "w", encoding="utf-8") as bestand:
    json.dump(kluis, bestand)`),
      step("Waarschuw de gebruiker", "XOR met een zelfgemaakte keystream is niet bestand tegen echte aanvallen.", `print("Leerproject: gebruik voor echte geheimen een bewezen tool.")`)
    ],
    ["Verlies je master password niet: er is geen herstel.", "Gebruik voor productie een bibliotheek zoals cryptography of een echte wachtwoordmanager."]
  ),
  idea(
    "portscanner",
    "Lokale poortscanner",
    "🛰️",
    "Security",
    "Gevorderd",
    "90 min",
    "Ontdek welke poorten op je eigen computer openstaan.",
    "Je leert sockets en netwerkpoorten. Je test uitsluitend je eigen machine, met een korte time-out en duidelijke waarschuwing.",
    ["socket", "netwerk", "poorten", "time-out"],
    [
      step("Test één poort", "connect_ex geeft 0 als de verbinding lukt.", `import socket

def is_open(host, poort, time-out=0.3):
    with socket.socket() as sock:
        sock.settimeout(time-out)
        return sock.connect_ex((host, poort)) == 0

print(is_open("127.0.0.1", 80))`),
      step("Scan een kleine lijst", "Beperk het aantal poorten zodat je niet onbedoeld veel verkeer maakt.", `poorten = [22, 80, 443, 3000, 4173, 5000, 8000]

for poort in poorten:
    if is_open("127.0.0.1", poort):
        print(f"Poort {poort} is open")`),
      step("Gebruik een time-out", "Zonder time-out kan een scan lang blijven hangen.", `sock.settimeout(0.3)`),
      step("Maak een rapport", "Sla de resultaten overzichtelijk op.", `import json

resultaat = {"host": "127.0.0.1", "open": []}
for poort in poorten:
    if is_open("127.0.0.1", poort):
        resultaat["open"].append(poort)

print(json.dumps(resultaat, indent=2))`),
      step("Voeg een waarschuwing toe", "Scannen mag alleen op systemen die je bezit of waarvoor je toestemming hebt.", `print("Scan alleen je eigen computer of een systeem met expliciete toestemming.")`)
    ],
    ["Scan nooit willekeurige websites of netwerken.", "Een firewall kan een open poort alsnog blokkeren."]
  ),
  idea(
    "bestand-integriteit",
    "Bestandsintegriteit",
    "🧾",
    "Security",
    "Gemiddeld",
    "45 min",
    "Controleer of een bestand ongewijzigd is met een hash.",
    "Je berekent een SHA-256-hash van een bestand en vergelijkt die later opnieuw. Zo ontdek je wijzigingen of beschadigde downloads.",
    ["hashlib", "bestanden", "sha256", "vergelijken"],
    [
      step("Hash een bestand", "Lees het bestand in blokken, zodat grote bestanden niet in één keer in het geheugen passen.", `import hashlib

def bestand_hash(pad):
    hasher = hashlib.sha256()
    with open(pad, "rb") as bestand:
        for blok in iter(lambda: bestand.read(65536), b""):
            hasher.update(blok)
    return hasher.hexdigest()

print(bestand_hash("data.txt"))`),
      step("Bewaar de hash", "Sla de hash op naast de download.", `with open("data.sha256", "w", encoding="utf-8") as bestand:
    bestand.write(bestand_hash("data.txt"))`),
      step("Controleer later", "Vergelijk de nieuwe hash met de opgeslagen waarde.", `def controleer(pad, hashbestand):
    verwacht = open(hashbestand, encoding="utf-8").read().strip()
    return bestand_hash(pad) == verwacht

print(controleer("data.txt", "data.sha256"))`),
      step("Maak een rapport", "Toon een duidelijke melding bij een verschil.", `if controleer("data.txt", "data.sha256"):
    print("Bestand is ongewijzigd.")
else:
    print("Let op: het bestand is veranderd!")`),
      step("Test met een wijziging", "Pas een kopie aan en kijk of de controle faalt.", `with open("data-kopie.txt", "w", encoding="utf-8") as bestand:
    bestand.write("aangepast")`)
    ],
    ["Een hash bewijst integriteit, niet wie het bestand heeft gemaakt.", "Gebruik een aparte kopie voor je test, niet je originele bestand."]
  ),
  idea(
    "phishing-quiz",
    "Phishing-quiz",
    "🎣",
    "Security",
    "Beginner",
    "45 min",
    "Leer phishingberichten herkennen met een quiz.",
    "Je bouwt een quiz met voorbeeldberichten en uitleg per antwoord. Je leert letten op afzender, links, haast en vreemde verzoeken.",
    ["lijsten", "dict", "quiz", "security"],
    [
      step("Verzamel voorbeelden", "Gebruik verzonnen berichten, nooit echte slachtoffers.", `berichten = [
    {
        "tekst": "Uw account wordt binnen 1 uur geblokkeerd. Klik hier.",
        "phishing": True,
        "uitleg": "Dreiging met haast en een onbekende link.",
    },
    {
        "tekst": "De factuur staat in je account bij de leverancier.",
        "phishing": False,
        "uitleg": "Geen link en geen dringende actie.",
    },
]`),
      step("Stel een vraag", "Toon het bericht en vraag of het phishing is.", `for bericht in berichten:
    print(bericht["tekst"])
    antwoord = input("Phishing? (j/n): ").lower() == "j"
    print("Goed!" if antwoord == bericht["phishing"] else "Niet goed.")`),
      step("Toon uitleg", "Uitleg is belangrijker dan de score.", `if antwoord == bericht["phishing"]:
    print("Klopt:", bericht["uitleg"])
else:
    print("Let op:", bericht["uitleg"])`),
      step("Houd de score bij", "Tel goede antwoorden en toon een eindscore.", `score = 0
for bericht in berichten:
    if input("Phishing? (j/n): ").lower() == "j" == bericht["phishing"]:
        score += 1
print(f"Score: {score}/{len(berichten)}")`),
      step("Voeg een leermoment toe", "Bespreek één regel die altijd helpt.", `print("Bekijk altijd het echte domein achter een link voordat je klikt.")`)
    ],
    ["Gebruik geen echte e-mailadressen of namen.", "Voeg berichten toe die juist betrouwbaar lijken."]
  ),
  idea(
    "wachtwoordbeleid",
    "Wachtwoordbeleid controleren",
    "📋",
    "Security",
    "Gemiddeld",
    "50 min",
    "Controleer een lijst wachtwoorden tegen een beleid.",
    "Je leest wachtwoorden in, controleert regels en schrijft een rapport. Je leert veilig omgaan met gevoelige invoer en duidelijke foutmeldingen.",
    ["validatie", "lijsten", "rapport", "security"],
    [
      step("Definieer het beleid", "Maak de regels expliciet en testbaar.", `def controles(wachtwoord):
    return {
        "minimaal 12 tekens": len(wachtwoord) >= 12,
        "een hoofdletter": any(t.isupper() for t in wachtwoord),
        "een kleine letter": any(t.islower() for t in wachtwoord),
        "een cijfer": any(t.isdigit() for t in wachtwoord),
        "een symbool": any(not t.isalnum() for t in wachtwoord),
    }`),
      step("Controleer één wachtwoord", "Toon welke regels niet kloppen.", `def rapport(wachtwoord):
    resultaat = controles(wachtwoord)
    fouten = [regel for regel, ok in resultaat.items() if not ok]
    return "ok" if not fouten else ", ".join(fouten)

print(rapport("Kort1!"))`),
      step("Verwerk een lijst", "Lees nooit wachtwoorden uit een bestand dat je gaat delen.", `testwachtwoorden = ["Kort1!", "DitIsEenLangerWachtwoord123!"]

for wachtwoord in testwachtwoorden:
    print(rapport(wachtwoord))`),
      step("Tel de resultaten", "Een samenvatting maakt het rapport bruikbaar.", `goed = sum(rapport(w) == "ok" for w in testwachtwoorden)
print(f"{goed} van {len(testwachtwoorden)} voldoet")`),
      step("Geef geen wachtwoord terug", "Print nooit het wachtwoord zelf in een log.", `# Wel: print(rapport(wachtwoord))
# Niet: print(wachtwoord, rapport(wachtwoord))`)
    ],
    ["Gebruik verzonnen testwachtwoorden.", "Een wachtwoordbeleid alleen is niet genoeg; gebruik ook een wachtwoordmanager."]
  ),
  idea(
    "sleutel-uitwisseling",
    "Sleutel uitwisselen",
    "🤝",
    "Security",
    "Gevorderd",
    "2 uur",
    "Simuleer Diffie-Hellman met kleine getallen.",
    "Je leert hoe twee partijen een gedeelde sleutel kunnen maken zonder die over het netwerk te sturen. Je gebruikt machtsverheffing modulo een priemgetal.",
    ["modulo", "priemgetallen", "encryptie", "wiskunde"],
    [
      step("Kies publieke waarden", "Een priemgetal en een grondtal mogen openbaar zijn.", `p = 23
g = 5

print("Publiek:", p, g)`),
      step("Kies privésleutels", "Alice en Bob houden hun eigen getal geheim.", `alice_geheim = 6
bob_geheim = 15`),
      step("Bereken de publieke sleutels", "Stuur alleen deze waarden over het netwerk.", `alice_publiek = pow(g, alice_geheim, p)
bob_publiek = pow(g, bob_geheim, p)

print("Alice stuurt:", alice_publiek)
print("Bob stuurt:", bob_publiek)`),
      step("Bereken de gedeelde sleutel", "Beide partijen komen op hetzelfde getal uit.", `alice_sleutel = pow(bob_publiek, alice_geheim, p)
bob_sleutel = pow(alice_publiek, bob_geheim, p)

print(alice_sleutel, bob_sleutel, alice_sleutel == bob_sleutel)`),
      step("Maak het groter", "Kleine getallen zijn makkelijk te kraken; echte systemen gebruiken enorme priemgetallen.", `# In de praktijk: 2048 bits of meer.
# Deze demo is alleen voor begrip, niet voor echte beveiliging.`)
    ],
    ["Laat zien dat een meeluisteraar de publieke waarden ziet maar de geheimen niet.", "Gebruik geen zelfgemaakte crypto in echte toepassingen."]
  ),
  idea(
    "log-analyse",
    "Verdachte logins vinden",
    "🕵️",
    "Security",
    "Gemiddeld",
    "60 min",
    "Analyseer een logbestand op mislukte inlogpogingen.",
    "Je leert logregels parseren, tellen per IP en een eenvoudige drempel instellen. Dit is een eerste stap richting security monitoring.",
    ["bestanden", "dict", "parsen", "security"],
    [
      step("Maak testlogregels", "Gebruik verzonnen regels met tijd, IP en resultaat.", `regels = [
    "10:01 192.168.1.5 LOGIN FAIL",
    "10:02 192.168.1.5 LOGIN FAIL",
    "10:03 192.168.1.7 LOGIN OK",
    "10:04 192.168.1.5 LOGIN FAIL",
    "10:05 192.168.1.9 LOGIN FAIL",
]`),
      step("Tel mislukte pogingen per IP", "Splits de regel en gebruik een dictionary als teller.", `from collections import Counter

mislukt = Counter()
for regel in regels:
    tijd, ip, actie, resultaat = regel.split()
    if resultaat == "FAIL":
        mislukt[ip] += 1

print(mislukt)`),
      step("Stel een drempel in", "Meld alleen IP's met drie of meer mislukte pogingen.", `verdacht = {ip: aantal for ip, aantal in mislukt.items() if aantal >= 3}
print("Verdacht:", verdacht)`),
      step("Lees een echt bestand", "Gebruik foutenafhandeling voor regels die niet het verwachte formaat hebben.", `def analyseer(pad):
    teller = Counter()
    with open(pad, encoding="utf-8") as bestand:
        for regel in bestand:
            delen = regel.split()
            if len(delen) == 4 and delen[3] == "FAIL":
                teller[delen[1]] += 1
    return teller`),
      step("Maak een rapport", "Sorteer op aantal pogingen en toon de top.", `for ip, aantal in teller.most_common(5):
    print(f"{ip}: {aantal} mislukte pogingen")`)
    ],
    ["Gebruik alleen je eigen testlogs of geanonimiseerde data.", "Een hoog aantal mislukte logins kan ook een gebruiker zijn die zijn wachtwoord vergeet."]
  )
];
